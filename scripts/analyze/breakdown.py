#!/usr/bin/env python3
# /// script
# dependencies = ["numpy", "pillow"]
# ///
"""One command turns a reference animation into "a map you can write code from": contact sheets, per-frame differences, transition starts + beat-grid fitting, a 60fps contact sheet per transition, motion heatmaps per segment, keyframe overview.

    uv run breakdown.py --video reference.mp4 --out breakdown/ [--thresh 5] [--debounce 12]

Outputs (all under --out):
  sheet_*.jpg          4fps contact sheets (30 frames each, labeled in seconds)
  diff.npy             per-frame mean grayscale difference (192x108), length N-1
  cuts.json            transition start frames, beat-grid fit (start ≈ t0+k·step, with residuals and BPM candidates)
  transitions/T??.jpg  a full-resolution thumbnail contact sheet per transition: from 2 frames before the start, every 2nd frame, 15 cells
  in-shot-motion/motion-heatmap.jpg  per-pixel maximum frame difference (red) of each segment's still interval over a grayscale base, labeled with motion area share
  keyframes-overview.jpg  collage of each segment's last frame (3 frames before the next transition) = each segment's "reference frame"
  ref/seg??.png        same as above at full resolution, fed to image models as a composition reference
Thresholds: still stretches have frame differences <2, transitions 10–40; default threshold 5, debounce 12 frames, adjust per film.
"""
import argparse, json, subprocess
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
ap.add_argument('--video', required=True); ap.add_argument('--out', required=True)
ap.add_argument('--thresh', type=float, default=5); ap.add_argument('--debounce', type=int, default=12)
a = ap.parse_args()
out = Path(a.out); out.mkdir(parents=True, exist_ok=True)

def probe():
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate', '-of', 'json', a.video], capture_output=True, text=True)
    s = json.loads(r.stdout)['streams'][0]; n, d = s['r_frame_rate'].split('/'); return s['width'], s['height'], float(n) / float(d)
W, H, FPS = probe()

def frames(w, h, fmt='rgb24'):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', a.video, '-vf', f'scale={w}:{h}', '-f', 'rawvideo', '-pix_fmt', fmt, '-'], capture_output=True).stdout
    c = 3 if fmt == 'rgb24' else 1
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w, c) if c == 3 else np.frombuffer(raw, np.uint8).reshape(-1, h, w)

# 1) per-frame differences
g = frames(192, 108, 'gray').astype(np.float32)
d = np.abs(np.diff(g, axis=0)).mean(axis=(1, 2)); np.save(out / 'diff.npy', d)
starts = []
for i in range(1, len(d)):
    if d[i] > a.thresh and d[i - 1] <= a.thresh and (not starts or i - starts[-1] > a.debounce): starts.append(i)
# Grid fitting: find the largest step where "most starts land on t0+k·step" (tolerance 1.5 frames, allowing 20% outliers — big in-shot actions get misdetected as transitions)
grid = None
if len(starts) >= 4:
    S_ = np.array(starts, float); best = None
    for step in np.arange(4.0, np.diff(S_).max() + 0.01, 0.01):
        for t0 in S_[:3]:
            k = np.round((S_ - t0) / step); res = S_ - (t0 + k * step); inl = np.abs(res) <= 1.5
            if inl.mean() < 0.8: continue
            t0f = t0 + res[inl].mean(); res = S_ - (t0f + k * step); score = (step, inl.sum())   # prefer the largest step first (a small step can force-fit any points)
            if best is None or score > best[0]: best = (score, step, t0f, k.astype(int).tolist(), np.abs(res[inl]).max(), (~inl).nonzero()[0].tolist())
    if best:
        _, step, t0, k, e, outl = best
        grid = {'t0_frame': round(float(t0), 2), 'step_frames': round(float(step), 3), 'max_residual_frames': round(float(e), 2), 'units_per_cut': k,
                'outlier_cut_index': outl, 'bpm_if_step_is_eighth': round(float(60 * FPS / step / 2), 2), 'bpm_if_step_is_quarter': round(float(60 * FPS / step), 2)}
json.dump({'fps': FPS, 'size': [W, H], 'cuts_frames': starts, 'cuts_sec': [round(s / FPS, 3) for s in starts], 'grid': grid}, open(out / 'cuts.json', 'w'), indent=1, ensure_ascii=False)
print('Transition starts (s):', [round(s / FPS, 3) for s in starts]); print('Grid:', grid)

# 2) 4fps contact sheets
small = frames(480, 270)
step4 = max(1, round(FPS / 4)); idx = list(range(0, len(small), step4))
for p in range(0, len(idx), 30):
    sub = idx[p:p + 30]; rows = (len(sub) + 5) // 6
    S = Image.new('RGB', (6 * 480, rows * 288), 'white'); dr = ImageDraw.Draw(S)
    for i, f in enumerate(sub):
        x, y = (i % 6) * 480, (i // 6) * 288; S.paste(Image.fromarray(small[f]), (x, y + 18)); dr.text((x + 4, y + 3), f'{f / FPS:.2f}s', fill='black')
    S.save(out / f'sheet_{p // 30}.jpg', quality=85)

# 3) a contact sheet per transition
(out / 'transitions').mkdir(exist_ok=True)
mid = frames(384, 216)
for n, s in enumerate(starts):
    S = Image.new('RGB', (5 * 384, 3 * 230), 'white'); dr = ImageDraw.Draw(S)
    for i, f in enumerate(range(s - 2, s + 28, 2)):
        if f >= len(mid): break
        x, y = (i % 5) * 384, (i // 5) * 230; S.paste(Image.fromarray(mid[f]), (x, y + 14)); dr.text((x + 3, y + 1), f'f{f} {f / FPS:.3f}s', fill='black')
    S.save(out / 'transitions' / f'T{n + 1:02d}.jpg', quality=85)

# 4) motion heatmaps + 5) reference frames
(out / 'in-shot-motion').mkdir(exist_ok=True); (out / 'ref').mkdir(exist_ok=True)
bounds = [0] + starts + [len(small)]
heat, keys = [], []
for i in range(len(bounds) - 1):
    a0 = bounds[i] + (round(0.35 * FPS) if i else 0); b0 = bounds[i + 1] - 2
    ref_f = max(bounds[i], bounds[i + 1] - 3)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a.video, '-vf', f'select=eq(n\\,{ref_f})', '-frames:v', '1', str(out / 'ref' / f'seg{i + 1:02d}.png')])
    keys.append((i + 1, Image.fromarray(small[min(ref_f, len(small) - 1)])))
    if b0 - a0 < 4: continue
    seq = small[a0:b0].astype(np.float32); m = np.abs(np.diff(seq, axis=0)).mean(axis=3).max(axis=0); frac = (m > 25).mean()
    base = Image.fromarray(seq[0].astype(np.uint8)).convert('L').convert('RGB'); hm = np.zeros((270, 480, 3), np.uint8); hm[..., 0] = np.clip(m * 4, 0, 255)
    im = Image.blend(base, Image.fromarray(hm), 0.6); ImageDraw.Draw(im).text((4, 4), f'seg{i + 1} f{a0}-{b0} motion {frac * 100:.1f}%', fill='yellow'); heat.append(im)
for name, ims in [('in-shot-motion/motion-heatmap.jpg', heat), ('keyframes-overview.jpg', [k[1] for k in keys])]:
    if not ims: continue
    rows = (len(ims) + 3) // 4; S = Image.new('RGB', (4 * 480, rows * 270))
    for i, im in enumerate(ims): S.paste(im, ((i % 4) * 480, (i // 4) * 270))
    S.save(out / name, quality=85)
print('done ->', out)
