"""End-to-end tests of film_gate.py / deliver.py / qa.py camera events.

The engine renders two small synthetic films: the same three images (textured overview images from the repository's assets/), 3 seconds per shot, hard cuts,
  slow  — a constant 7.5% slow push on every shot (the page-flip PowerPoint approach)  → film_gate should be red
  punch — each shot holds, one 0.3-second 30% fast push, then holds again             → film_gate should be green
  smooth — each shot holds, one 0.9-second 25% slow push, then holds again           → film_gate shouldn't be red (slow pushes pass without being sped up)
The tests run only when uv, ffmpeg and Playwright Chromium are installed locally (CI's media-contract job lacks them and skips automatically).
The grammar file used by the tests is written into a temporary copy of the engine and never enters the repository.
"""
import os
os.environ["FILM_GATE_MIN_S"] = "0"  # the synthetic films are only 9 seconds; this tests the verdict itself, not the short-clip downgrade
import json
import os
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / 'scripts'
ENGINE = SCRIPTS / 'engine'
_HERO = ROOT / 'assets' / 'showcase' / 'hero.png'   # only in the public repository; the private version uses a sample chart screenshot when it's missing
IMAGES = [_HERO if _HERO.exists() else ROOT / 'scripts' / 'engine' / 'examples' / 'assets' / 'candlestick_landscape.png',
          ROOT / 'assets' / 'all-styles-overview.jpg', ROOT / 'assets' / 'animation-grammars' / 'y2_vox_overview.jpg']
SHOT = 3.0

# Test-only grammar: each cue of kind=shot is one image per shot, full-frame (MD.cover), with the camera set by data.mode.
PROBE = r'''
CLIPS._gate_probe = { draw(c, t, ctx) {
  const shots = ctx.of('shot'); let i = 0;
  for (let k = 0; k < shots.length; k++) if (t >= shots[k].at) i = k;
  const q = shots[i], end = i + 1 < shots.length ? shots[i + 1].at : ctx.dur, len = end - q.at, mode = ctx.data.mode;
  let z = 1;
  if (mode === 'slow') z = CAM.zlerp(1, 1.075, U.clamp((t - q.at) / len));                                   // constant slow push
  if (mode === 'punch') z = CAM.track({}, [{ at: q.at + len * 0.4, kind: 'punch', k: 0.3, dur: 0.3 }], t).z;  // hold → fast push → hold
  if (mode === 'smooth') z = CAM.track({}, [{ at: q.at + len * 0.3, kind: 'push', k: 0.25 }], t).z;            // hold → 0.9-second slow push → hold
  c.fillStyle = '#000'; c.fillRect(0, 0, ctx.W, ctx.H);
  MD.cover(c, ctx.still(q), { z });
} };
'''

# Whole-film mode (qa --project --film gateprobe): three segments of "hold → 0.3-second fast push → hold", with a white flash in the middle of the fourth. The picture is seeded random color blocks.
PROBE_FILM = r'''
const tex = (c, seed) => { const r = U.rng(seed); c.fillStyle = '#1d2330'; c.fillRect(0, 0, 1920, 1080);
  for (let i = 0; i < 600; i++) { c.fillStyle = `hsl(${r() * 360},60%,${30 + r() * 50}%)`; const s = 20 + r() * 120; c.fillRect(r() * 1920, r() * 1080, s, s * (0.3 + r())); } };
window.ERAS = [1, 2, 3].map(k => ({ id: 'punch' + k, dur: 2.5,
  draw: (c, lt) => CAM.with(c, CAM.track({}, [{ at: 1.2, kind: 'punch', k: 0.3, dur: 0.3 }], lt), cc => tex(cc, k)) }));
window.ERAS.push({ id: 'flash', dur: 2.5, draw: (c, lt) => { tex(c, 9); if (lt >= 1.5 && lt < 1.55) { c.fillStyle = '#fff'; c.fillRect(0, 0, 1920, 1080); } } });
'''


def tools_ready():
    return all(shutil.which(x) for x in ('uv', 'ffmpeg', 'ffprobe'))


def run(*args, cwd=None):
    return subprocess.run(['uv', 'run', '--quiet', *map(str, args)], cwd=cwd, capture_output=True, text=True, timeout=900)


W = {}   # module-level fixture: the engine copy, spec, and the two rendered films


def setUpModule():
    if not tools_ready():
        raise unittest.SkipTest('needs uv, ffmpeg, ffprobe')
    W['tmp'] = tempfile.TemporaryDirectory()
    tmp = Path(W['tmp'].name)
    eng = tmp / 'engine'
    shutil.copytree(ENGINE, eng, ignore=shutil.ignore_patterns('demos', 'reference_films', 'examples', '__pycache__'))
    (eng / 'clips' / '_gate_probe.js').write_text(PROBE)
    (eng / 'eras_gateprobe.js').write_text(PROBE_FILM)
    (tmp / 'img').mkdir()
    for f in IMAGES:
        shutil.copy(f, tmp / 'img' / f.name)
    W['eng'] = eng
    for mode in ('slow', 'punch', 'smooth'):
        d = tmp / mode
        d.mkdir()
        spec = {'grammar': '_gate_probe', 'duration': SHOT * len(IMAGES), 'fps': 30, 'width': 960, 'height': 540,
                'data': {'mode': mode},
                'cues': [{'at': SHOT * k, 'kind': 'shot', 'image': f'../img/{f.name}'} for k, f in enumerate(IMAGES)]}
        (d / 'spec.json').write_text(json.dumps(spec, ensure_ascii=False))
        W[mode] = d
    for mode in ('slow', 'punch', 'smooth'):
        r = run('--with', 'playwright', 'python', eng / 'render.py', '--spec', W[mode] / 'spec.json', '--out', W[mode] / f'{mode}.mp4')
        if r.returncode != 0 and 'Executable doesn' in (r.stdout + r.stderr):
            raise unittest.SkipTest('Playwright Chromium not installed: uv run --with playwright playwright install chromium')
        assert r.returncode == 0, r.stdout + r.stderr


def tearDownModule():
    if 'tmp' in W:
        W['tmp'].cleanup()


def gate(mp4):
    r = run(SCRIPTS / 'film_gate.py', mp4, '--json', '--no-template')
    return r.returncode, json.loads(r.stdout)


class FilmGateTests(unittest.TestCase):
    def test_slow_push_is_red(self):
        code, res = gate(W['slow'] / 'slow.mp4')
        self.assertEqual(code, 2)
        self.assertEqual(res['gate_light'], 'red')
        self.assertLess(res['fast_ratio'], 0.035)
        self.assertIn('reads like flipping pages', res['explain']['summary'])
        self.assertIn('CAM.track', res['explain']['fix'])
        self.assertIn('camera-language', res['explain']['fix'])

    def test_punch_is_green(self):
        code, res = gate(W['punch'] / 'punch.mp4')
        self.assertEqual(code, 0)
        self.assertEqual(res['gate_light'], 'green')
        self.assertGreaterEqual(res['fast_ratio'], 0.06)
        self.assertIsNone(res['explain']['fix'])

    def test_smooth_push_is_not_red(self):
        # A 0.9-second 25% slow push passes the gate without being changed into a fast push: the gate measures amount of motion, not speed
        code, res = gate(W['smooth'] / 'smooth.mp4')
        self.assertEqual(code, 0, res['explain'])
        self.assertNotEqual(res['gate_light'], 'red')
        self.assertGreaterEqual(res['fast_ratio'], 0.035)

    def test_short_clip_only_warns(self):
        # Clips shorter than 20 seconds aren't calibrated: by default the same slow-push film only gets a yellow light, not blocked
        env = dict(os.environ, FILM_GATE_MIN_S='20')
        r = subprocess.run(['uv', 'run', '--quiet', str(SCRIPTS / 'film_gate.py'), str(W['slow'] / 'slow.mp4'), '--no-template'],
                           capture_output=True, text=True, timeout=900, env=env)
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertIn("only warns and doesn't block", r.stdout)

    def test_unreadable_file_exits_1(self):
        bad = Path(W['tmp'].name) / 'bad.mp4'
        bad.write_bytes(b'not a video')
        self.assertEqual(run(SCRIPTS / 'film_gate.py', bad).returncode, 1)

    def test_text_report_names_worst_window_and_fix(self):
        r = run(SCRIPTS / 'film_gate.py', W['slow'] / 'slow.mp4', '--no-template')
        self.assertEqual(r.returncode, 2)
        self.assertIn('Worst', r.stdout)
        self.assertIn('How to fix', r.stdout)


class DeliverTests(unittest.TestCase):
    def deliver(self, mode, out, *extra):
        return run(SCRIPTS / 'deliver.py', W[mode] / f'{mode}.mp4', '--out', out, *extra)

    def test_red_does_not_copy(self):
        out = Path(W['tmp'].name) / 'out_red'
        r = self.deliver('slow', out, '--spec', W['slow'] / 'spec.json')
        self.assertEqual(r.returncode, 2, r.stdout + r.stderr)
        self.assertFalse((out / 'slow.mp4').exists())
        self.assertFalse((out / 'delivery-notes.md').exists())
        self.assertIn('How to fix', r.stdout)

    def test_green_copies_and_writes_facts(self):
        out = Path(W['tmp'].name) / 'out_green'
        r = self.deliver('punch', out, '--spec', W['punch'] / 'spec.json')
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertTrue((out / 'punch.mp4').is_file())
        doc = (out / 'delivery-notes.md').read_text()
        self.assertIn('No reviewer sent', doc)
        self.assertIn('Not run', doc)                       # QA not run
        self.assertIn('960×540', doc)
        self.assertIn(f'{SHOT * len(IMAGES):.2f}s', doc)
        self.assertIn('Fast-motion frame ratio', doc)
        self.assertEqual(run(SCRIPTS / 'deliver.py', '--verify', out / 'delivery-notes.md').returncode, 0)
        # The facts section was edited → verify reports it
        (out / 'delivery-notes.md').write_text(doc.replace('No reviewer sent', 'Passed independent review'))
        self.assertNotEqual(run(SCRIPTS / 'deliver.py', '--verify', out / 'delivery-notes.md').returncode, 0)
        # Subjective notes added only in the production notes section → verify still passes
        (out / 'delivery-notes.md').write_text(doc + '\nAddendum: the rhythm follows the narration pauses.\n')
        self.assertEqual(run(SCRIPTS / 'deliver.py', '--verify', out / 'delivery-notes.md').returncode, 0)

    def test_review_files_and_qa_are_listed(self):
        proj = W['punch']
        (proj / 'review').mkdir(exist_ok=True)
        (proj / 'review' / 'reviewer-A.md').write_text('Conclusions go here')
        qa = proj / 'qa'
        qa.mkdir(exist_ok=True)
        (qa / 'qa.json').write_text(json.dumps({'spec': str(proj / 'spec.json'), 'page_errors': [], 'segments': [
            {'id': 'punch', 'deterministic': True, 'spikes_at_lt': [], 'camera_events_lt': [[1.6, 1.9]], 'framing': [],
             'motion_pct': 1.0, 'still_pairs_pct': 80.0, 'ms_mean': 10, 'ms_max': 20}]}))
        try:
            out = Path(W['tmp'].name) / 'out_review'
            r = self.deliver('punch', out, '--spec', proj / 'spec.json')
            self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
            doc = (out / 'delivery-notes.md').read_text()
            self.assertIn('reviewer-A.md', doc)
            self.assertNotIn('No reviewer sent', doc)
            self.assertIn('Run:', doc)
            self.assertIn('Determinism: 1/1', doc)
        finally:
            shutil.rmtree(proj / 'review')
            shutil.rmtree(qa)


class QaCameraEventTests(unittest.TestCase):
    """In whole-film mode the in-segment median is ≈0, so a single 0.3-second fast push used to be recorded as a whole string of jumps; now it's one camera event. A one-frame white flash is still a jump."""
    @classmethod
    def setUpClass(cls):
        out = Path(W['tmp'].name) / 'qa_film'
        r = run('--with', 'playwright', SCRIPTS / 'qa.py', '--project', W['eng'], '--film', 'gateprobe', '--out', out)
        assert r.returncode == 0, r.stdout + r.stderr
        cls.segs = {s['id']: s for s in json.loads((out / 'qa.json').read_text())['segments']}

    def test_pulse_push_is_camera_event_not_spike(self):
        for k in (1, 2, 3):
            s = self.segs[f'punch{k}']
            self.assertEqual(s['spikes_at_lt'], [], s)
            self.assertEqual(len(s['camera_events_lt']), 1, s)
            t0, t1 = s['camera_events_lt'][0]
            self.assertLessEqual(t1 - t0, 0.35 + 2 / 30)
            self.assertTrue(t0 <= 1.5 and t1 >= 1.2, s)                 # lands on that 0.3-second fast push

    def test_single_frame_flash_is_still_spike(self):
        s = self.segs['flash']
        self.assertGreaterEqual(len(s['spikes_at_lt']), 1, s)
        self.assertEqual(s['camera_events_lt'], [], s)


if __name__ == '__main__':
    unittest.main()
