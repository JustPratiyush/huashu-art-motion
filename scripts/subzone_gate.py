#!/usr/bin/env python3
"""Subtitle-band gate: scans a "no-subtitle version" of a film and reports timecodes whenever picture content (text, strokes, rockets, flames) appears in the subtitle band.

    python3 subzone_gate.py <film_without_subtitles.mp4> [--band 920] [--fps 10] [--thresh 150]

qa.py checks text boxes; this script additionally checks whether graphics enter the subtitle band.
It counts dark pixels with gray <95, so it only suits light, clean styles (whiteboard, off-white paper, light keynote).
Textured backgrounds (the Vox kraft-paper desk) produce lots of false positives when judged by difference from the subtitle band's dominant color: those styles rely on qa.py's framing,
or, like the Vox version, have the text API register the object it belongs to and check occlusion.
The threshold is the value measured on that film (>150 pixels after shrinking the subtitle band to 960×80); for a new style, calibrate it first on two known good/bad frames.
"""
import argparse, subprocess, numpy as np
ap = argparse.ArgumentParser(); ap.add_argument('video'); ap.add_argument('--band', type=int, default=920, help='top y of the subtitle band (at 1080 height)')
ap.add_argument('--fps', type=float, default=10); ap.add_argument('--thresh', type=int, default=150)
a = ap.parse_args()
h = 1080 - a.band; W, H = 960, h // 2
cmd = ['ffmpeg', '-v', 'error', '-i', a.video, '-vf', f'fps={a.fps},scale=1920:1080,crop=1920:{h}:0:{a.band},scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-']
raw = subprocess.run(cmd, capture_output=True, check=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W)
bad = []
for i, f in enumerate(fr):
    n = int((f < 95).sum())
    if n > a.thresh: bad.append((i / a.fps, n))
runs = []
for t, n in bad:
    if runs and t - runs[-1][1] <= 1.5 / a.fps: runs[-1][1] = t; runs[-1][2] = max(runs[-1][2], n)
    else: runs.append([t, t, n])
print(f'{len(fr)} frames, {len(bad)} hits')
for t0, t1, n in runs: print(f'  {t0:7.2f}–{t1:7.2f}s  up to {n} pixels')
