"""film_gate.py's blue-purple background gate: blue-purple frames ≥0.30 is red; --allow-blue-purple "reason" downgrades to yellow.

Only ffmpeg's lavfi synthesizes 6-second clips (no engine or Playwright needed), each with a grid overlay so the empty-frame gate doesn't block it first:
  purple — deep-purple background (#2A1A6E) throughout                        → red, with timecodes in the report
  navy   — flat navy (#0D1B2A, hue about 210°) throughout                     → not blue-purple
  paper  — paper-colored background (#F3EDE2) throughout                      → doesn't count
6 seconds is shorter than 20, so the fast-motion gate only gives yellow; exit code 2 can only come from the blue-purple gate (which isn't downgraded for short clips).
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
GRID = 'drawgrid=w=96:h=96:t=2:c=0xE0E0E0@0.8'
CLIPS = {
    'purple': f'color=c=0x2A1A6E:s={SIZE}:r={FPS}:d=6,{GRID}',
    'navy': f'color=c=0x0D1B2A:s={SIZE}:r={FPS}:d=6,{GRID}',
    'paper': f'color=c=0xF3EDE2:s={SIZE}:r={FPS}:d=6,drawgrid=w=96:h=96:t=2:c=0x333333@0.8',
}
W = {}
ENV = dict(os.environ, FILM_GATE_MIN_S='20')


def setUpModule():
    if not all(shutil.which(x) for x in ('uv', 'ffmpeg', 'ffprobe')):
        raise unittest.SkipTest('needs uv, ffmpeg, ffprobe')
    W['tmp'] = tempfile.TemporaryDirectory()
    for name, src in CLIPS.items():
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', src, '-pix_fmt', 'yuv420p', '-c:v', 'libx264',
                        '-crf', '18', str(Path(W['tmp'].name) / f'{name}.mp4')], check=True, capture_output=True)


def tearDownModule():
    if 'tmp' in W:
        W['tmp'].cleanup()


def gate(name, *extra):
    p = subprocess.run(['uv', 'run', '--quiet', str(SCRIPTS / 'film_gate.py'), str(Path(W['tmp'].name) / f'{name}.mp4'),
                        '--no-template', '--json', *extra], capture_output=True, text=True, timeout=600, env=ENV)
    return p.returncode, json.loads(p.stdout)


class BluePurpleGate(unittest.TestCase):
    def test_purple_is_red(self):
        code, r = gate('purple')
        self.assertEqual(code, 2)
        self.assertGreaterEqual(r['blue_purple_share'], 0.9)
        self.assertEqual(r['lights']['blue_purple_share'], 'red')
        self.assertTrue(r['blue_purple_spans_s'])
        self.assertIn('blue-purple', r['explain']['summary'])

    def test_navy_and_paper_pass(self):
        for name in ('navy', 'paper'):
            code, r = gate(name)
            self.assertEqual(r['lights']['blue_purple_share'], 'green', name)
            self.assertEqual(code, 0, name)

    def test_override_downgrades_to_yellow(self):
        code, r = gate('purple', '--allow-blue-purple', 'the user explicitly asked for cyberpunk purple')
        self.assertEqual(code, 0)
        self.assertEqual(r['lights']['blue_purple_share'], 'yellow')
        self.assertEqual(r['allow_blue_purple'], 'the user explicitly asked for cyberpunk purple')


if __name__ == '__main__':
    unittest.main()
