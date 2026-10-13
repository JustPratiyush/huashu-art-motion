"""film_gate.py's empty-frame defect: a near-solid frame mid-film (almost no edges in the whole frame) for ≥0.3 seconds is red, with timecodes in the report.

Only ffmpeg's lavfi synthesizes 6-second clips (no engine or Playwright needed):
  orange  — a textured test image, cut to solid orange for 0.6 seconds in the middle   → red, timecode on those 0.6 seconds
  flash   — the same, but only 0.2 seconds of solid black                             → doesn't count (shorter than 0.3 seconds)
  head    — 0.4 seconds of solid color at the start, then texture                     → doesn't count (0.5 seconds at each end aren't checked)
  dark    — black background, faint grid, two thin bright lines (the 3b1b kind)        → doesn't count
  board   — white background, a few thin black boxes (the whiteboard kind)             → doesn't count
A 6-second film is shorter than 20 seconds, so the fast-motion gate only gives yellow; exit code 2 can only come from the empty-frame gate (which isn't downgraded for short clips).
"""
import json
import os
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / 'scripts'
SIZE, FPS = '960x540', 30
TEX = f'testsrc2=s={SIZE}:r={FPS}'

CLIPS = {
    'orange': [f'{TEX}:d=2.4', f'color=c=0xF08020:s={SIZE}:r={FPS}:d=0.6', f'{TEX}:d=3'],
    'flash': [f'{TEX}:d=2.9', f'color=c=black:s={SIZE}:r={FPS}:d=0.2', f'{TEX}:d=2.9'],
    'head': [f'color=c=0x2050C0:s={SIZE}:r={FPS}:d=0.4', f'{TEX}:d=5.6'],
    'dark': [f'color=c=black:s={SIZE}:r={FPS}:d=6,drawgrid=w=96:h=96:t=1:c=0x2a4a7a@0.6,'
             'drawbox=x=0:y=300:w=960:h=2:c=white:t=fill,drawbox=x=480:y=0:w=2:h=540:c=white:t=fill'],
    'board': [f'color=c=0xF7F5F0:s={SIZE}:r={FPS}:d=6,drawbox=x=120:y=140:w=180:h=120:c=0x222222:t=3,'
              'drawbox=x=420:y=200:w=90:h=90:c=0x222222:t=3,drawbox=x=620:y=150:w=200:h=40:c=0xE06020:t=3'],
}

W = {}
ENV = dict(os.environ, FILM_GATE_MIN_S='20')   # other test modules set it to 0; here we want the default short-clip downgrade


def setUpModule():
    if not all(shutil.which(x) for x in ('uv', 'ffmpeg', 'ffprobe')):
        raise unittest.SkipTest('needs uv, ffmpeg, ffprobe')
    W['tmp'] = tempfile.TemporaryDirectory()
    tmp = Path(W['tmp'].name)
    for name, parts in CLIPS.items():
        cmd = ['ffmpeg', '-v', 'error', '-y']
        for p in parts:
            cmd += ['-f', 'lavfi', '-i', p]
        if len(parts) > 1:
            cmd += ['-filter_complex', ''.join(f'[{i}:v]' for i in range(len(parts))) + f'concat=n={len(parts)}:v=1:a=0']
        cmd += ['-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '18', str(tmp / f'{name}.mp4')]
        subprocess.run(cmd, check=True, capture_output=True)


def tearDownModule():
    if 'tmp' in W:
        W['tmp'].cleanup()


def gate(name, *extra):
    return subprocess.run(['uv', 'run', '--quiet', str(SCRIPTS / 'film_gate.py'), str(Path(W['tmp'].name) / f'{name}.mp4'),
                           '--no-template', *extra], capture_output=True, text=True, timeout=600, env=ENV)


def gate_json(name):
    r = gate(name, '--json')
    return r.returncode, json.loads(r.stdout)


class BlankFrames(unittest.TestCase):
    def test_orange_gap_is_red_with_timecode(self):
        code, res = gate_json('orange')
        self.assertEqual(code, 2, res['explain'])
        self.assertEqual(res['lights']['blank_run_s'], 'red')
        self.assertEqual(res['gate_light'], 'red')
        self.assertEqual(len(res['blank_runs_s']), 1, res['blank_runs_s'])
        a, b = res['blank_runs_s'][0]
        self.assertTrue(2.3 <= a <= 2.65 and 2.75 <= b <= 3.1, (a, b))
        self.assertGreaterEqual(res['blank_run_s'], 0.3)
        self.assertIn('empty stretch', res['explain']['summary'])
        self.assertIn(f'{a:.2f}', res['explain']['summary'])
        self.assertIn('protagonist or main object', res['explain']['fix'])

    def test_text_report_lists_timecodes(self):
        r = gate('orange')
        self.assertEqual(r.returncode, 2, r.stdout)
        self.assertIn('Empty-frame timecodes', r.stdout)
        self.assertIn('How to fix', r.stdout)

    def test_short_flash_is_not_blank(self):
        code, res = gate_json('flash')
        self.assertEqual(res['blank_runs_s'], [])
        self.assertNotEqual(res['lights']['blank_run_s'], 'red')
        self.assertEqual(code, 0)

    def test_head_is_not_checked(self):
        code, res = gate_json('head')
        self.assertEqual(res['blank_runs_s'], [])
        self.assertEqual(code, 0)

    def test_dark_3b1b_like_is_not_blank(self):
        code, res = gate_json('dark')
        self.assertEqual(res['blank_runs_s'], [], 'thin lines on black are not an empty frame')
        self.assertEqual(code, 0)

    def test_whiteboard_like_is_not_blank(self):
        code, res = gate_json('board')
        self.assertEqual(res['blank_runs_s'], [], 'thin strokes on white are not an empty frame')
        self.assertEqual(code, 0)

    def test_deliver_refuses_blank(self):
        out = Path(W['tmp'].name) / 'out'
        r = subprocess.run(['uv', 'run', '--quiet', str(SCRIPTS / 'deliver.py'), str(Path(W['tmp'].name) / 'orange.mp4'), '--out', str(out)],
                           capture_output=True, text=True, timeout=600, env=ENV)
        self.assertEqual(r.returncode, 2, r.stdout + r.stderr)
        self.assertFalse((out / 'orange.mp4').exists())
        self.assertIn('empty stretch', r.stdout)


if __name__ == '__main__':
    unittest.main()
