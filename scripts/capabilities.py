#!/usr/bin/env python3
"""Optional voice configuration. status/resolve don't go online; personal configuration lives outside the skill install directory."""
import argparse
from contextlib import contextmanager
import copy
import hashlib
import json
import os
from pathlib import Path
import platform
import re
import shutil
import subprocess
import sys
import tempfile
import time

ROOT = Path(__file__).resolve().parents[1]
if __name__ == "__main__":
    sys.modules.setdefault("capabilities", sys.modules[__name__])


class ConfigError(ValueError):
    pass


def config_path(explicit=None):
    if explicit:
        return Path(explicit).expanduser().resolve()
    if os.getenv('HUASHU_CONFIG_HOME'):
        return Path(os.environ['HUASHU_CONFIG_HOME']).expanduser() / 'media.json'
    if os.name == 'nt':
        return Path(os.environ.get('APPDATA', Path.home() / 'AppData/Roaming')) / 'huashu/media.json'
    return Path(os.environ.get('XDG_CONFIG_HOME', Path.home() / '.config')) / 'huashu/media.json'


def read_json(path, missing=False):
    if missing and not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding='utf-8'))
    except (OSError, ValueError) as e:
        raise ConfigError(f'Cannot read configuration: {path.name} ({type(e).__name__})') from None
    if not isinstance(data, dict):
        raise ConfigError('Configuration must be a JSON object')
    return data


def merge(base, patch):
    result = copy.deepcopy(base)
    for key, value in patch.items():
        result[key] = merge(result[key], value) if isinstance(value, dict) and isinstance(result.get(key), dict) else copy.deepcopy(value)
    return result


def validate(data, schema=None, where='config'):
    # This package's schema uses only the following JSON Schema keywords; it doesn't claim to implement a general schema interpreter.
    schema = schema or read_json(ROOT / 'schemas/media.schema.json')
    types = {'object': dict, 'string': str, 'integer': int, 'boolean': bool}
    typ = schema.get('type')
    if typ and (not isinstance(data, types[typ]) or (typ == 'integer' and isinstance(data, bool))):
        raise ConfigError(f'{where}: wrong type')
    if 'enum' in schema and data not in schema['enum']:
        raise ConfigError(f'{where}: not a supported option')
    if isinstance(data, int) and not isinstance(data, bool):
        if data < schema.get('minimum', data) or data > schema.get('maximum', data):
            raise ConfigError(f'{where}: out of range')
    if isinstance(data, str) and 'pattern' in schema and not re.fullmatch(schema['pattern'], data):
        raise ConfigError(f'{where}: invalid format')
    if isinstance(data, dict):
        for key in schema.get('required', []):
            if key not in data:
                raise ConfigError(f'{where}.{key} is missing')
        for key, value in data.items():
            child = schema.get('properties', {}).get(key, schema.get('additionalProperties', False))
            if child is False:
                raise ConfigError(f'{where}.{key} is not a supported field')
            if isinstance(child, dict):
                validate(value, child, f'{where}.{key}')


def project_patch(data):
    validate(data)
    if set(data) - {'schema_version', 'revision', 'preferences', 'policy', 'onboarding'}:
        raise ConfigError('Project configuration cannot set credential bindings, network policy or low-level provider parameters')
    if any(v != 'deny' for v in data.get('policy', {}).values()):
        raise ConfigError('A project policy can only tighten to deny; it cannot grant cloud, paid or training permissions')
    if 'voice_ref' in data.get('preferences', {}).get('voice', {}):
        raise ConfigError('Private voice bindings stay in the user configuration; use --voice to choose one for this run')
    return data


def effective(explicit=None, project=None):
    defaults = read_json(ROOT / 'defaults/media.json')
    user_path = config_path(explicit)
    user = read_json(user_path, missing=True)
    validate(user)
    result = merge(defaults, user)
    sources = {'defaults': 'defaults/media.json', 'user': str(user_path), 'user_configured': bool(user)}
    origin = {}
    def note(data, label, prefix=''):
        for key, value in data.items():
            name = prefix + key
            if isinstance(value, dict): note(value, label, name + '.')
            elif name.split('.')[0] in ('preferences', 'policy', 'provider_options', 'onboarding'): origin[name] = label
    note(defaults, 'public_default'); note(user, 'user')
    if project:
        pp = Path(project).expanduser().resolve() / '.huashu/media.json'
        patch = project_patch(read_json(pp, missing=True))
        result = merge(result, patch)
        note(patch, 'project')
        sources['project'] = str(pp)
        sources['project_fields'] = sorted(patch)
    validate(result)
    sources['effective_from'] = origin
    return result, sources


@contextmanager
def locked(path):
    path.parent.mkdir(parents=True, exist_ok=True)
    lock_path = path.with_name(path.name + '.lock')
    # The kernel file lock is released when the process exits; ownership isn't contested by deleting the lock file.
    with lock_path.open('a+b') as lock:
        if os.name == 'nt':
            import msvcrt
            if lock.seek(0, 2) == 0:
                lock.write(b'0'); lock.flush()
            lock.seek(0)
            msvcrt.locking(lock.fileno(), msvcrt.LK_LOCK, 1)
            try:
                yield
            finally:
                lock.seek(0); msvcrt.locking(lock.fileno(), msvcrt.LK_UNLCK, 1)
        else:
            import fcntl
            fcntl.flock(lock, fcntl.LOCK_EX)
            try:
                yield
            finally:
                fcntl.flock(lock, fcntl.LOCK_UN)


def save_patch(path, patch, expected=None, reset=None):
    validate(patch)
    with locked(path):
        old = read_json(path, missing=True)
        validate(old)
        revision = old.get('revision', 0)
        if expected is not None and revision != expected:
            raise ConfigError('Configuration was modified by another process; reread it and try again')
        updated = merge(old, patch)
        if reset:
            # Only public fields may be reset; dynamic path expressions are not executed.
            keys = reset.split('.')
            if keys[0] not in {'preferences', 'policy', 'bindings', 'provider_options', 'onboarding'}:
                raise ConfigError('This reset path is not supported')
            current = updated
            for key in keys[:-1]:
                current = current.get(key, {})
            if isinstance(current, dict):
                current.pop(keys[-1], None)
        updated.update(schema_version=1, revision=revision + 1)
        validate(updated)
        fd, temp = tempfile.mkstemp(dir=path.parent, prefix='.media-')
        try:
            with os.fdopen(fd, 'w', encoding='utf-8') as f:
                json.dump(updated, f, ensure_ascii=False, indent=2); f.write('\n')
            if os.name != 'nt':
                os.chmod(temp, 0o600)
            os.replace(temp, path)
        finally:
            if os.path.exists(temp):
                os.unlink(temp)
        return {'status': 'saved', 'revision': updated['revision'], 'path': str(path)}


def credentials(config):
    binding = config['bindings']['volcengine']
    names = (binding['appid_env'], binding['token_env'])
    values = {n: os.getenv(n) for n in names}
    env_path = os.getenv('KOUBO_ENV') or binding.get('env_file')
    if env_path and not all(values.values()):
        path = Path(env_path).expanduser()
        if path.is_file():
            for line in path.read_text(encoding='utf-8').splitlines():
                line = line.strip()
                if line.startswith('export '):
                    line = line[7:]
                key, sep, value = line.partition('=')
                if sep and key.strip() in names and not values[key.strip()]:
                    values[key.strip()] = value.strip().strip('\"\'')
    return tuple(values[n] for n in names)


def speaker(config, explicit=None):
    ref = explicit or config['preferences']['voice'].get('voice_ref', 'default')
    voice = config['bindings']['voices'].get(ref)
    if voice and voice.get('speaker_id'):
        return voice['speaker_id']
    if explicit and not voice:
        # Registry aliases or platform IDs kept compatible with the legacy commands.
        voice = {'entry': explicit}
    voice = voice or {'entry': 'default'}
    registry_path = Path(voice.get('registry_file') or config['bindings']['volcengine']['registry_file']).expanduser()
    registry = read_json(registry_path, missing=True)
    entry = voice.get('entry', 'default')
    if entry == 'default':
        entry = registry.get('default') or os.getenv('VOLC_KOUBO_DEFAULT_SPEAKER')
    found = registry.get('voices', {}).get(entry, {})
    return found.get('speaker_id') or (entry if isinstance(entry, str) and entry.startswith('S_') else None)


def resolve(config, mode=None, audio=None, operation='synthesize', grants=(), voice=None):
    chosen = mode or config['preferences']['voice']['mode']
    if audio and mode is None:
        chosen = 'provided'
    result = {'capability': 'voice', 'mode': chosen, 'operation': operation, 'status': 'ready', 'reasons': []}
    if chosen == 'off':
        return dict(result, status='skipped', reasons=['Voice is disabled; no audio generated'])
    if chosen == 'unconfigured':
        return dict(result, status='needs_configuration', prompt=config['onboarding']['voice'] != 'manual',
                    reasons=['Choose an existing recording, a system voice or a bound cloned voice; or skip this time'])
    if chosen == 'provided':
        if not audio or not Path(audio).expanduser().is_file():
            return dict(result, status='needs_input', reasons=['An existing audio path is required'])
        return result
    if chosen == 'system':
        missing = [x for x in ('say', 'ffmpeg', 'ffprobe') if not shutil.which(x)]
        if platform.system() != 'Darwin' or missing:
            return dict(result, status='unavailable', reasons=['System voices currently support macOS only, with say/ffmpeg/ffprobe installed'])
        return dict(result, provider='macos')
    if chosen != 'clone':
        raise ConfigError('Unsupported voice mode')
    result['provider'] = 'volcengine'
    if config['preferences']['voice'].get('provider', 'volcengine') != 'volcengine':
        return dict(result, status='unavailable', reasons=['The P1 cloning backend only supports volcengine'])
    needs = ['cloud'] + ([] if operation == 'check' else ['paid_api'])
    if operation == 'train':
        needs.append('voice_training')
    denied = [key for key in needs if config['policy'][key] == 'deny']
    if denied:
        return dict(result, status='blocked', reasons=['Explicitly forbidden: ' + ', '.join(denied)])
    pending = [key for key in needs if config['policy'][key] != 'allow' and key not in grants]
    if pending:
        return dict(result, status='needs_permission', reasons=['Authorization needed for this run: ' + ', '.join(pending)])
    appid, token = credentials(config)
    if not appid or not token:
        result['reasons'].append('Missing credentials for the selected provider; only the specified environment/credential file is checked')
    if operation == 'synthesize' and not speaker(config, voice):
        result['reasons'].append('No usable voice binding; an existing ID can be bound without retraining')
    missing = [x for x in ('ffmpeg', 'ffprobe') if not shutil.which(x)]
    if missing:
        result['reasons'].append('Missing local dependencies: ' + ', '.join(missing))
    import importlib.util
    if importlib.util.find_spec('requests') is None:
        result['reasons'].append('The Volcengine adapter needs requests; basic configuration and existing audio do not')
    result['status'] = 'unavailable' if result['reasons'] else 'configured_unverified'
    return result


def inspect_audio(path):
    if not shutil.which('ffprobe'):
        raise ConfigError('Audio acceptance needs ffprobe')
    proc = subprocess.run(['ffprobe', '-v', 'error', '-show_entries',
                           'stream=codec_type,codec_name,sample_rate,channels:format=duration', '-of', 'json', str(path)],
                          capture_output=True, text=True)
    if proc.returncode:
        raise ConfigError('Output is not decodable audio')
    data = json.loads(proc.stdout)
    streams = [s for s in data.get('streams', []) if s.get('codec_type') == 'audio']
    duration = float(data.get('format', {}).get('duration', 0))
    if not streams or duration <= 0:
        raise ConfigError('Output has no valid audio track or duration')
    return {'duration': duration, **streams[0], 'sha256': hashlib.sha256(Path(path).read_bytes()).hexdigest()}


def system_voice_for(text, configured=None):
    if configured:
        return configured
    # macOS's default English voices may return near-empty audio for Chinese; choose only from installed voices, never download. English text uses the system default voice.
    if re.search(r"[\u4e00-\u9fff]", text):
        result = subprocess.run(['say', '-v', '?'], capture_output=True, text=True, check=True)
        names = [m.group(1).strip() for line in result.stdout.splitlines()
                 if (m := re.match(r"(.+?)\s+zh_CN\s+#", line))]
        if not names:
            raise ConfigError('No Mandarin system voice is installed; choose an existing voice or import a recording')
        return 'Tingting' if 'Tingting' in names else names[0]
    return None


def run_say(args, config):
    grants = [name for name in ('cloud', 'paid_api') if getattr(args, 'allow_' + name, False)]
    result = resolve(config, mode=args.mode, grants=grants, voice=args.voice)
    if result['status'] not in ('ready', 'configured_unverified'):
        print(json.dumps(result, ensure_ascii=False)); raise SystemExit(2)
    if not args.text.strip():
        raise ConfigError('Text to synthesize cannot be empty')
    out = Path(args.out).expanduser()
    if out.exists():
        raise ConfigError('Output file already exists; specify a new file (the chosen track is kept)')
    if args.speech_rate is not None and not -50 <= args.speech_rate <= 100:
        raise ConfigError('Volcengine speaking rate must be between -50 and 100')
    if args.fit is not None and args.fit <= 0:
        raise ConfigError('--fit must be positive')
    if args.match and not Path(args.match).is_file():
        raise ConfigError('Loudness reference audio not found')
    requested_format = args.format
    out.parent.mkdir(parents=True, exist_ok=True)
    import koubo
    # A temporary workspace keeps failures or half responses from contaminating the final output.
    with tempfile.TemporaryDirectory(prefix='voice-', dir=out.parent) as temp:
        staged = Path(temp) / (out.name + '.wav' if requested_format == 'pcm' else out.name)
        if result['mode'] == 'system':
            if args.model or args.speech_rate is not None or args.no_fidelity:
                raise ConfigError('Volcengine model/speaking-rate parameters do not apply to system voices')
            if args.format != 'wav' or args.sample_rate != 48000:
                raise ConfigError('P1 system voice output is fixed at 48kHz WAV')
            source = Path(temp) / 'system.aiff'
            cmd = ['say', '-o', str(source)]
            system_voice = system_voice_for(args.text, args.voice or config['preferences']['voice'].get('system_voice'))
            if system_voice:
                cmd += ['-v', system_voice]
            subprocess.run(cmd, input=args.text, text=True, check=True, capture_output=True)
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(source), '-ar', '48000', str(staged)], check=True)
            if args.fit:
                koubo.fit_duration(staged, args.fit)
            target_db = koubo.mean_volume(args.match, args.match_ss, args.match_t) if args.match else args.loudness
            if target_db is not None:
                koubo.match_loudness(staged, target_db)
        else:
            koubo.configure_backend(config)
            args = copy.copy(args)
            args.out = str(staged)
            # First accept fitting/level/termination status on container audio, then export raw PCM.
            if requested_format == 'pcm': args.format = 'wav'
            args.voice = speaker(config, args.voice)
            opts = config['provider_options']['volcengine']
            args.model = args.model or opts['model']
            args.speech_rate = opts['speech_rate'] if args.speech_rate is None else args.speech_rate
            args.no_fidelity = not opts['tone_fidelity'] if args.no_fidelity is None else args.no_fidelity
            koubo.cmd_say(args)
        artifact = inspect_audio(staged)
        volume = koubo.mean_volume(staged)
        if artifact['duration'] < 0.12 or volume is None or volume < -60:
            raise ConfigError('Synthesized audio is near-empty or has no valid sound; not treated as a successful output')
        if args.fit and abs(artifact['duration'] - args.fit) > .05:
            # Keep the diagnostic candidate, but don't treat it as a qualified final output.
            candidate = out.with_name(out.stem + '.unfitted' + out.suffix)
            if not candidate.exists():
                shutil.copy2(staged, candidate)
            raise ConfigError('Audio did not land within ±0.05 seconds of the target duration; the unfitted candidate was kept and not delivered as final audio')
        if requested_format == 'pcm':
            raw = Path(temp) / 'output.pcm'
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(staged), '-ac', '1', '-ar', str(args.sample_rate), '-f', 's16le', str(raw)], check=True)
            shutil.copy2(raw, out)
            artifact.update(format='s16le', channels=1, duration=out.stat().st_size / 2 / args.sample_rate, sha256=hashlib.sha256(out.read_bytes()).hexdigest())
        else:
            shutil.copy2(staged, out)
    artifact.update(path=out.name, provider=result['provider'], mode=result['mode'], generated=True)
    if result['mode'] == 'system':
        artifact['system_voice'] = system_voice or 'system_default'
    if result['mode'] == 'clone':
        artifact['requested_model'] = args.model
    out.with_name(out.name + '.json').write_text(json.dumps(artifact, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'status': 'complete', 'output': str(out), 'duration': artifact['duration']}, ensure_ascii=False))


def main():
    if len(sys.argv) > 1 and sys.argv[1] in ('image-status', 'image-plan', 'accept-image', 'use-image'):
        import images
        return images.main()
    # Generation/training commands share the original CLI to avoid two parameter sets drifting apart.
    if len(sys.argv) > 1 and sys.argv[1] in ('say', 'train', 'voices'):
        import koubo
        return koubo.main()
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    for name in ('status', 'resolve', 'configure', 'skip', 'reset', 'bind', 'use-audio'):
        p = sub.add_parser(name)
        p.add_argument('--config')
        p.add_argument('--project')
        if name in ('status', 'resolve'):
            p.add_argument('--mode', choices=['off', 'provided', 'system', 'clone'])
            p.add_argument('--audio'); p.add_argument('--explain', action='store_true')
        if name == 'configure':
            p.add_argument('--input', required=True); p.add_argument('--scope', choices=['user', 'project'], default='user')
            p.add_argument('--expected-revision', type=int)
        if name == 'skip':
            p.add_argument('--capability', choices=['voice', 'image'], default='voice')
            p.add_argument('--scope', choices=['task', 'user'], default='task')
        if name == 'reset':
            p.add_argument('--field', default='preferences.voice')
        if name == 'bind':
            p.add_argument('--name', required=True); p.add_argument('--speaker-id', required=True)
            p.add_argument('--default', action='store_true')
        if name == 'use-audio':
            p.add_argument('--audio', required=True); p.add_argument('--out', required=True)
    args = parser.parse_args()
    config, sources = effective(args.config, args.project)
    path = config_path(args.config)
    if args.command in ('status', 'resolve'):
        result = resolve(config, args.mode, args.audio)
        result['revision'] = config.get('revision', 0)
        result['parameters'] = config['provider_options']['volcengine'] if result.get('provider') == 'volcengine' else {}
        if args.explain:
            result['sources'] = sources
        print(json.dumps(result, ensure_ascii=False, indent=2))
    elif args.command == 'configure':
        patch = read_json(Path(args.input))
        if args.scope == 'project':
            if not args.project:
                raise ConfigError('project scope needs --project')
            path = Path(args.project).expanduser().resolve() / '.huashu/media.json'
            project_patch(patch)
        print(json.dumps(save_patch(path, patch, args.expected_revision), ensure_ascii=False))
    elif args.command == 'skip':
        if args.scope == 'user':
            print(json.dumps(save_patch(path, {'onboarding': {args.capability: 'manual'}, 'preferences': {args.capability: {'mode': 'unconfigured'}}}), ensure_ascii=False))
        else:
            print(json.dumps({'status': 'skipped', 'scope': 'task', 'saved': False}, ensure_ascii=False))
    elif args.command == 'reset':
        print(json.dumps(save_patch(path, {}, reset=args.field), ensure_ascii=False))
    elif args.command == 'bind':
        patch = {'bindings': {'voices': {args.name: {'speaker_id': args.speaker_id}}}}
        if args.default:
            patch['preferences'] = {'voice': {'voice_ref': args.name}}
        print(json.dumps(save_patch(path, patch), ensure_ascii=False))
    elif args.command == 'use-audio':
        source, out = Path(args.audio).expanduser(), Path(args.out).expanduser()
        info = inspect_audio(source)
        if out.exists():
            raise ConfigError('Output already exists; specify a new file')
        out.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(source, out)
        info.update(path=out.name, generated=False, mode='provided')
        out.with_name(out.name + '.json').write_text(json.dumps(info, ensure_ascii=False, indent=2))
        print(json.dumps({'status': 'complete', 'output': str(out), 'generated': False}, ensure_ascii=False))


if __name__ == '__main__':
    try:
        main()
    except (ConfigError, OSError, subprocess.SubprocessError) as e:
        message = str(e) if isinstance(e, ConfigError) else type(e).__name__
        print(json.dumps({'status': 'error', 'message': message}, ensure_ascii=False), file=sys.stderr)
        raise SystemExit(2)
