"""Chart and number shots stay in the film's world:

  t3 still defaults to a white background (pixel-identity of old specs compared by hand); theme:"dark" gives a dark background with light text;
  with no theme but a dark safe.fill, the chart background uses the fill color, continuous with the cleared subtitle band, no white card.
  The t2 sample t2_fullbleed_pulse: the number with data.over slams onto the second terminal screenshot, with no stretch of empty light-spot background around 5.5 seconds.

Needs uv and Playwright Chromium (skipped if not installed, like test_film_gate); pixels are read only with Pillow.
"""
import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ENGINE = ROOT / 'scripts' / 'engine'
EX = ENGINE / 'examples'
W = {}


def render(spec, out, stills):
    r = subprocess.run(['uv', 'run', '--quiet', '--with', 'playwright', 'python', str(ENGINE / 'render.py'), '--spec', str(spec),
                        '--stills', ','.join(map(str, stills)), '--out', str(out)], capture_output=True, text=True, timeout=900)
    if r.returncode != 0 and 'Executable doesn' in (r.stdout + r.stderr):
        raise unittest.SkipTest('Playwright Chromium not installed: uv run --with playwright playwright install chromium')
    assert r.returncode == 0, r.stdout + r.stderr
    return {t: out / f't{t:06.2f}.png' for t in stills}


def setUpModule():
    if not shutil.which('uv'):
        raise unittest.SkipTest('needs uv')
    try:
        from PIL import Image  # noqa: F401
    except ImportError:
        raise unittest.SkipTest('needs Pillow')
    W['tmp'] = tempfile.TemporaryDirectory()
    tmp = Path(W['tmp'].name)
    base = json.loads((EX / 't3_finance_chart.json').read_text(encoding='utf-8'))
    base.pop('theme', None)                                               # the sample has a whole-film palette; this measures the default and old syntax without a theme
    specs = {'t3_default': base, 't3_dark': {**base, 'theme': 'dark'},
             't3_fill': {**base, 'width': 1080, 'height': 1920, 'safe': {'top': 0, 'bottom': 520, 'fill': '#141a2b'}}}
    for k, spec in specs.items():
        (tmp / f'{k}.json').write_text(json.dumps(spec, ensure_ascii=False), encoding='utf-8')
        W[k] = render(tmp / f'{k}.json', tmp / k, [6.5])[6.5]
    W['t2'] = render(EX / 't2_fullbleed_pulse.json', tmp / 't2', [5.55, 5.65, 6.0, 7.9])


def tearDownModule():
    if 'tmp' in W:
        W['tmp'].cleanup()


def img(p):
    from PIL import Image
    return Image.open(p).convert('RGB')


def lum(px):
    r, g, b = px[:3]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def edge_frac(p):
    from PIL import ImageFilter
    g = img(p).convert('L').resize((320, 180)).filter(ImageFilter.FIND_EDGES)
    h = g.histogram()
    return sum(h[40:]) / sum(h)


class T3Theme(unittest.TestCase):
    def test_default_is_still_white_paper(self):
        im = img(W['t3_default'])
        self.assertGreater(lum(im.getpixel((20, im.height // 2))), 245)

    def test_dark_theme_is_dark_with_light_ink(self):
        im = img(W['t3_dark'])
        self.assertLess(lum(im.getpixel((20, im.height // 2))), 40)
        bright = sum(1 for x in range(0, im.width, 4) for y in range(0, im.height, 4) if lum(im.getpixel((x, y))) > 200)
        self.assertGreater(bright, 100, 'text and numbers on a dark background must be light')

    def test_safe_fill_sets_the_chart_background(self):
        im = img(W['t3_fill'])
        top, band = im.getpixel((20, im.height // 3)), im.getpixel((20, im.height - 100))
        self.assertLess(lum(top), 40, 'with a dark fill the chart background must not be a white card')
        self.assertTrue(all(abs(a - b) <= 3 for a, b in zip(top, band)), (top, band))


class T2NumberOverShot(unittest.TestCase):
    def test_no_empty_backdrop_around_the_number(self):
        for t in (5.55, 5.65, 6.0, 7.9):
            self.assertGreater(edge_frac(W['t2'][t]), 0.01, f'{t}s is an empty background')

    def test_screenshot_stays_under_the_number(self):
        im = img(W['t2'][7.9])
        top = im.crop((0, 0, im.width, im.height // 4)).convert('L')
        from PIL import ImageStat
        self.assertGreater(ImageStat.Stat(top).stddev[0], 4, 'the terminal screenshot is still visible above when the number lands')


if __name__ == '__main__':
    unittest.main()
