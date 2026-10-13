#!/usr/bin/env python3
"""Image integration: choose the current host tool, generate a call plan, accept and collect assets. Doesn't call tools on the agent's behalf."""
import argparse
import hashlib
import io
import json
import os
from pathlib import Path
import shutil
import sys
import time
import uuid

import capabilities as c


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def inspect_image(path):
    try:
        from PIL import Image
    except ImportError:
        raise c.ConfigError('Image acceptance needs Pillow; status probing does not. Install dependencies for your environment') from None
    try:
        payload=Path(path).read_bytes()
        with Image.open(io.BytesIO(payload)) as im:
            fmt=im.format
            if fmt not in ('PNG','JPEG','WEBP'):
                raise c.ConfigError('Static PNG/JPEG/WEBP assets are supported')
            if getattr(im,'n_frames',1)!=1:
                raise c.ConfigError('For multi-frame images, choose a frame explicitly first; frames are not extracted implicitly')
            im.verify()
        with Image.open(io.BytesIO(payload)) as im:
            im.load()
            alpha=im.convert('RGBA').getchannel('A').getextrema()
            return {'width':im.width,'height':im.height,'format':fmt.lower(),
                    'has_transparency':alpha[0]<255,'has_visible_pixels':alpha[1]>0,'sha256':hashlib.sha256(payload).hexdigest()}
    except c.ConfigError:raise
    except Exception as e:
        raise c.ConfigError('The image cannot be fully decoded: '+type(e).__name__) from None


def runtime_tools(path, session):
    data=c.read_json(Path(path))
    if data.get('session_id')!=session or not session:
        raise c.ConfigError('The host capability snapshot does not belong to this session')
    if data.get('host') not in ('codex','claude-code','kimi','other'):
        raise c.ConfigError('Unknown host; other may be used but a real tool declaration must be provided')
    observed=data.get('observed_at')
    if not isinstance(observed,(int,float)) or not 0<=time.time()-observed<=900:
        raise c.ConfigError('The tool snapshot has expired; get it again from the current session (within 15 minutes)')
    tools=data.get('tools')
    if not isinstance(tools,list):raise c.ConfigError('The tool snapshot needs a tools list; give an explicit empty list when none are available')
    ids=set()
    for tool in tools:
        if not isinstance(tool,dict) or not isinstance(tool.get('id'),str) or not tool['id'].strip() or tool['id'] in ids:
            raise c.ConfigError('Tool ID missing or duplicated')
        ids.add(tool['id'])
        if tool.get('kind') not in ('host','mcp') or tool.get('cost') not in ('subscription','paid_api','unknown','none') or tool.get('network') not in ('cloud','local'):
            raise c.ConfigError('A tool must declare its execution source, cost type and network scope')
        if not isinstance(tool.get('operations'),list) or not tool['operations'] or any(x not in ('generate','edit') for x in tool['operations']):
            raise c.ConfigError('Invalid tool operation declaration')
        for key in ('reference_images','transparent_background'):
            if not isinstance(tool.get(key),bool):raise c.ConfigError('Missing tool feature: '+key)
    return data


def request_data(path):
    data=c.read_json(Path(path))
    if set(data)-{'prompt','operation','references','transparent_background','min_width','min_height'}:
        raise c.ConfigError('The image request contains unsupported fields')
    if not isinstance(data.get('prompt'),str) or not data['prompt'].strip():
        raise c.ConfigError('A non-empty image description is required')
    data.setdefault('operation','generate');data.setdefault('references',[])
    data.setdefault('transparent_background',False);data.setdefault('min_width',1);data.setdefault('min_height',1)
    if data['operation'] not in ('generate','edit') or not isinstance(data['references'],list) or not isinstance(data['transparent_background'],bool):
        raise c.ConfigError('Wrong image request type')
    for key in ('min_width','min_height'):
        if type(data[key]) is not int or not 1<=data[key]<=16384:raise c.ConfigError('Dimensions must be integers from 1 to 16384')
    if data['operation']=='edit' and not data['references']:raise c.ConfigError('Editing needs explicit input images')
    refs=[]
    for item in data['references']:
        if not isinstance(item,str):raise c.ConfigError('Reference images must be local file paths')
        p=Path(item).expanduser()
        if not p.is_absolute():p=Path(path).resolve().parent/p
        meta=inspect_image(p)
        refs.append({'path':str(p.resolve()),'sha256':meta['sha256']})
    data['references']=refs
    return data


def choose(config, runtime=None, request=None, mode=None, provider=None, grants=()):
    prefs=config['preferences']['image']; chosen=mode or prefs['mode']
    result={'capability':'image','mode':chosen,'status':'ready','reasons':[]}
    if config['policy']['image_generation']=='deny' and chosen=='generate':
        return dict(result,status='blocked',reasons=['Image generation has been explicitly forbidden'])
    if chosen=='off':return dict(result,status='skipped',reasons=['Image generation not enabled'])
    if chosen=='existing':return dict(result,status='needs_input',reasons=['Provide existing images and import them with use-image'])
    if chosen=='unconfigured':return dict(result,status='needs_configuration',prompt=config['onboarding']['image']!='manual',reasons=['Options: existing assets, current host image generation, or skip'])
    if chosen!='generate':raise c.ConfigError('Unsupported image mode')
    if not runtime:return dict(result,status='needs_runtime',reasons=['Needs a snapshot of the tools the current session actually exposes; cannot be inferred from the agent name'])
    request=request or {'operation':'generate','references':[],'transparent_background':False}
    selected=provider or prefs['provider']
    candidates=[]
    for tool in runtime['tools']:
        if selected!='auto' and tool['id']!=selected:continue
        if request['operation'] not in tool['operations']:continue
        if request['references'] and not tool['reference_images']:continue
        if request['transparent_background'] and not tool['transparent_background']:continue
        candidates.append(tool)
    if not candidates:return dict(result,status='unavailable',reasons=['No current tool meets the requirements; existing assets can be imported, and APIs are not hooked up automatically'])
    ready=[];missing=[];blocked=[]
    for tool in candidates:
        needs=['image_generation']
        if tool['network']=='cloud':needs.append('cloud')
        if tool['cost']=='paid_api':needs.append('paid_api')
        if tool['cost']=='unknown':needs.append('unknown_image_cost')
        if request['references'] and tool['network']=='cloud':needs.append('reference_upload')
        deny=[k for k in needs if config['policy'][k]=='deny']
        ask=[k for k in needs if config['policy'][k]!='allow' and k not in grants]
        if deny:blocked.append({'tool_id':tool['id'],'denied':deny})
        elif ask:missing.append({'tool_id':tool['id'],'needs':ask})
        else:ready.append(tool)
    if len(ready)>1:return dict(result,status='needs_selection',candidates=[x['id'] for x in ready],reasons=['Several tools are available; choose this run\'s provider or set a preference'])
    if not ready:
        return dict(result,status='needs_permission' if missing else 'blocked',candidates=missing or blocked,reasons=['Probing grants no permission to call; use only the authorization the user has already given for this run'])
    return dict(result,status='host_action_required',host=runtime['host'],tool=ready[0],operation=request['operation'],
                reasons=['Executed by the current agent with the real tool schema; Python does not call host tools'])


def no_overwrite(path, payload):
    path=Path(path);path.parent.mkdir(parents=True,exist_ok=True)
    with path.open('xb') as f:f.write(payload)


def config_fingerprint(config):
    selected={'preferences':config['preferences']['image'], 'policy':{k:config['policy'][k] for k in ('image_generation','cloud','paid_api','reference_upload','unknown_image_cost')}}
    return hashlib.sha256(json.dumps(selected,sort_keys=True).encode()).hexdigest()


def make_plan(config, request, runtime, session, out, mode=None, provider=None, grants=()):
    decision=choose(config,runtime,request,mode,provider,grants)
    if decision['status']!='host_action_required':return decision
    plan={'schema_version':1,'plan_id':str(uuid.uuid4()),'session_id':session,'created_at':time.time(),
          'host':runtime['host'],'tool':decision['tool'],'request':request,'configuration_sha256':config_fingerprint(config),
          'instruction':'The agent calls the current real tool; after success save a receipt, and accept-image re-verifies authorization and the output.'}
    no_overwrite(out,(json.dumps(plan,ensure_ascii=False,indent=2)+'\n').encode())
    return {'status':'host_action_required','plan':str(out),'plan_id':plan['plan_id'],'tool_id':plan['tool']['id']}


def accept(config, plan_path, receipt_path, file, out, runtime, session, grants=()):
    plan=c.read_json(Path(plan_path));receipt=c.read_json(Path(receipt_path))
    if plan.get('schema_version')!=1 or plan.get('session_id')!=session or plan.get('host')!=runtime['host']:
        raise c.ConfigError('The plan does not belong to the current host/session')
    created=plan.get('created_at')
    if not isinstance(created,(int,float)) or not 0<=time.time()-created<=3600:
        raise c.ConfigError('The image plan is over 1 hour old; re-resolve the current authorization and requirements')
    if plan.get('configuration_sha256')!=config_fingerprint(config):
        raise c.ConfigError('Image-related configuration has changed; regenerate the plan')
    req=plan.get('request')
    if not isinstance(req,dict) or not isinstance(req.get('prompt'),str) or req.get('operation') not in ('generate','edit') or not isinstance(req.get('references'),list) or type(req.get('transparent_background')) is not bool:
        raise c.ConfigError('Invalid request structure in the image plan')
    if any(type(req.get(k)) is not int or not 1<=req[k]<=16384 for k in ('min_width','min_height')):
        raise c.ConfigError('Invalid dimensions in the image plan')
    for ref in req['references']:
        if not isinstance(ref,dict) or not isinstance(ref.get('path'),str) or not isinstance(ref.get('sha256'),str):
            raise c.ConfigError('Invalid reference-image structure in the plan')
    tool=plan.get('tool',{})
    if not isinstance(tool,dict):raise c.ConfigError('Invalid tool declaration in the plan')
    current=next((t for t in runtime['tools'] if t['id']==tool.get('id')),None)
    if current!=tool:raise c.ConfigError('Tool capabilities have changed or are no longer available; the old plan cannot be reused')
    for ref in plan['request']['references']:
        if sha(ref['path'])!=ref['sha256']:raise c.ConfigError('A reference image has changed; regenerate the plan')
    decision=choose(config,runtime,plan['request'],mode='generate',provider=tool['id'],grants=grants)
    if decision['status']!='host_action_required':raise c.ConfigError('The current configuration no longer allows accepting this generation task: '+decision['status'])
    meta=inspect_image(file)
    expected={'status':'success','plan_id':plan['plan_id'],'session_id':session,'tool_id':tool['id'],'output_sha256':meta['sha256']}
    if any(receipt.get(k)!=v for k,v in expected.items()):raise c.ConfigError('The receipt is unsuccessful or inconsistent with the plan/file')
    req=plan['request']
    if not meta['has_visible_pixels']:raise c.ConfigError('The generated image is fully transparent and has no visible content')
    if meta['width']<req['min_width'] or meta['height']<req['min_height']:
        raise c.ConfigError('Image dimensions are smaller than the task requires')
    if req['transparent_background'] and not meta['has_transparency']:
        raise c.ConfigError('A transparent background was required, but the output has no actual transparent pixels')
    meta.update(generated=True,tool_id=tool['id'],host=runtime['host'],plan_id=plan['plan_id'],
                prompt_sha256=hashlib.sha256(req['prompt'].encode()).hexdigest(),receipt_sha256=sha(receipt_path),
                provenance='agent_reported_tool_call',source_proof='Receipt association checked; not a platform-signed proof of origin')
    return import_artifact(file,out,meta)


def import_artifact(file,out,meta):
    out=Path(out);sidecar=out.with_name(out.name+'.json')
    suffix={'.png':'png','.jpg':'jpeg','.jpeg':'jpeg','.webp':'webp'}.get(out.suffix.lower())
    if suffix!=meta['format']:raise c.ConfigError('The target extension must match the real image format; this entry point does not transcode')
    if out.exists() or sidecar.exists():raise c.ConfigError('The target image or metadata already exists; use a new versioned filename')
    payload=Path(file).read_bytes()
    if hashlib.sha256(payload).hexdigest()!=meta['sha256']:raise c.ConfigError('The image changed during acceptance')
    meta=dict(meta,path=out.name)
    # Paired writes are serialized by the cooperative script lock; the user's existing versions are never overwritten.
    with c.locked(out):
        if out.exists() or sidecar.exists():raise c.ConfigError('The target was created by another process')
        no_overwrite(out,payload)
        no_overwrite(sidecar,(json.dumps(meta,ensure_ascii=False,indent=2)+'\n').encode())
    return {'status':'complete','output':str(out),'metadata':str(sidecar),'sha256':meta['sha256']}


def main():
    p=argparse.ArgumentParser(description=__doc__);sub=p.add_subparsers(dest='command',required=True)
    for name in ('image-status','image-plan','accept-image','use-image'):
        q=sub.add_parser(name);q.add_argument('--config');q.add_argument('--project')
        if name!='use-image':
            q.add_argument('--host-tools');q.add_argument('--session')
            for key in ('image-generation','cloud','paid-api','reference-upload','unknown-image-cost'):
                q.add_argument('--allow-'+key,action='store_true',help='only expresses authorization already given for this run; does not override deny')
        if name in ('image-status','image-plan'):
            q.add_argument('--mode',choices=['off','existing','generate']);q.add_argument('--provider')
            q.add_argument('--request',required=name=='image-plan')
        if name in ('image-plan','accept-image','use-image'):q.add_argument('--out',required=True)
        if name in ('accept-image','use-image'):q.add_argument('--file',required=True)
        if name=='accept-image':q.add_argument('--plan',required=True);q.add_argument('--receipt',required=True)
    a=p.parse_args();config,_=c.effective(a.config,a.project)
    grants=[key for key in ('image_generation','cloud','paid_api','reference_upload','unknown_image_cost') if getattr(a,'allow_'+key,False)]
    runtime=runtime_tools(a.host_tools,a.session) if getattr(a,'host_tools',None) else None
    if a.command=='use-image':
        meta=inspect_image(a.file);meta.update(generated=False,mode='existing',provenance='provided_file')
        result=import_artifact(a.file,a.out,meta)
    elif a.command=='accept-image':
        if not runtime:raise c.ConfigError('Needs this run\'s latest host tool snapshot')
        result=accept(config,a.plan,a.receipt,a.file,a.out,runtime,a.session,grants)
    else:
        request=request_data(a.request) if a.request else None
        if a.command=='image-status':result=choose(config,runtime,request,a.mode,a.provider,grants)
        else:
            if not runtime:raise c.ConfigError('Needs this run\'s host tool snapshot; tools cannot be guessed')
            result=make_plan(config,request,runtime,a.session,a.out,a.mode,a.provider,grants)
    print(json.dumps(result,ensure_ascii=False,indent=2))
    if a.command=='image-plan' and result['status']!='host_action_required':raise SystemExit(2)


if __name__=='__main__':
    try:main()
    except (c.ConfigError,OSError,ValueError,KeyError,TypeError) as e:
        print(json.dumps({'status':'error','message':str(e) if isinstance(e,c.ConfigError) else type(e).__name__},ensure_ascii=False),file=sys.stderr)
        raise SystemExit(2)
