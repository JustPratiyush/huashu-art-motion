#!/usr/bin/env python3
# /// script
# dependencies = ["fonttools"]
# ///
"""Extract a subset from a CJK font and write it as woff into engine/lib/fonts/. Missing glyphs silently fall back to system fonts (which look different on another machine),
so CJK characters used in the picture must really be in the subset — at engine startup U.assertGlyphs checks the corner-badge characters, and missing ones console.error and fail qa.

    uv run scripts/font_subset.py                         # rebuild the preset LXGW WenKai subset (scans CJK in all .js under engine/ + built-in common characters)
    uv run scripts/font_subset.py --scan <engine project dir>  # also merge in the CJK used in another project
    uv run scripts/font_subset.py --text "<extra characters>"   # append specific characters
    uv run scripts/font_subset.py --font path/to/XXX.ttf --out <project>/lib/fonts/XXX-400.woff --text "..."   # another font
    uv run scripts/font_subset.py --gb2312 ...           # also merge all 6763 GB2312 characters (explainer films don't need characters added for every new topic; about 1MB per weight)
    uv run scripts/font_subset.py --fix-widths engine/lib/fonts/PuHui-Medium.woff   # only fix the zero-width full-width space (a bug in the PuHui Medium/Bold source fonts)

The preset explainer fonts (used by the YouTube grammar demos and new films, see references/09) were made like this (the open-source version replaced the CJK sans with Source Han Sans, with --font pointing at Noto Sans SC ttfs instantiated per weight; PuHui's license doesn't allow redistribution after conversion, so it can only be generated locally):
    uv run scripts/font_subset.py --gb2312                                                     # LXGW WenKai (whiteboard)
    for w in 65-Medium:Medium 85-Bold:Bold 105-Heavy:Heavy 115-Black:Black; do                # the four weights of Alibaba PuHuiTi 3.0
      uv run scripts/font_subset.py --gb2312 --font path/to/AlibabaPuHuiTi-3-${w%%:*}.ttf --out scripts/engine/lib/fonts/PuHui-${w##*:}.woff; done

Default font: LXGW WenKai Medium (SIL Open Font License 1.1, commercial use, redistribution and embedding allowed);
if you don't have the source file, download LXGWWenKai-Medium.ttf from https://github.com/lxgw/LxgwWenKai/releases and point --font at it.
New fonts are registered only once added to engine/lib/fonts.js (family name = filename without extension).
"""
import argparse, re, sys
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

HERE = Path(__file__).resolve().parent
ENGINE = HERE / 'engine'
# Preset characters (glyph data, kept as CJK on purpose): digits, punctuation, eras/dynasties, common style and medium names. The subset stays small (tens of KB); run this script again when new characters are used.
BASE = ('0123456789０１２３４５６７８９ ，。、：；！？「」『』《》（）·—…～'
        '年代世纪公元前后约初中晚期朝唐宋元明清汉魏晋隋周秦商夏民国现当今古'
        '水墨写意工笔山水花鸟人物画法风格派主义时期艺术家作品壁窟敦煌莫高佛飞天供养'
        '浮世绘木版印刷版画剪纸皮影戏偶灯影窗花年画书法篆隶楷行草印章钤朱文白'
        '油画素描水彩粉笔丙烯蛋彩湿壁金箔马赛克镶嵌玻璃彩窗手抄本插图漫画动画卡通'
        '古典文艺复兴巴洛克洛可可新浪漫写实印象后点彩野兽表现立体未来达达超现实抽象波普极简构成包豪斯装饰'
        '蓝色玫瑰红黄绿青紫黑灰橙金银光影明暗烛夜日月星云雨雪风天海河湖林竹梅兰菊松'
        '少女猫茶杯桌椅窗门墙地屋室灯花瓶书纸笔'
        '八大山人齐白石克里姆特蒙克呐喊草间弥生波点伦勃朗吉卜力宫崎骏新海诚毕加索修拉莫奈睡莲马蒂斯哈林达利霍珀凯斯杰克柯比'
        '蒸汽波像素光追橡皮管一二三四五六七八九十百千万')


# Full-width punctuation and symbols common in explainer films
PUNCT = '，。、：；！？「」『』《》（）【】·—–…～“”‘’％＋－×÷→←↑↓▲▼≈±°¥€①②③④⑤⑥⑦⑧⑨⑩✓'


def gb2312_l1():
    """All 6763 GB2312 characters (3755 level-1 common characters + 3008 level-2 less common characters)"""
    out = set()
    for hi in range(0xB0, 0xF8):
        for lo in range(0xA1, 0xFF):
            try: out.add(bytes([hi, lo]).decode('gb2312'))
            except UnicodeDecodeError: pass
    return out


def cjk(text):
    return set(ch for ch in text if ord(ch) > 0x2E7F)


STR = re.compile(r"'(?:[^'\\\n]|\\.)*'|\"(?:[^\"\\\n]|\\.)*\"|`(?:[^`\\]|\\.)*`")


def scan(d):
    """Collect only CJK inside JS string literals (CJK in comments is never drawn on screen; counting it would make the subset 20× bigger)"""
    out = set()
    for f in Path(d).rglob('*.js'):
        try: src = f.read_text(encoding='utf-8')
        except Exception: continue
        src = '\n'.join(re.sub(r'^\s*//.*$', '', l) for l in src.splitlines())
        for m in STR.finditer(src): out |= cjk(m.group(0))
    return out


def fix_blank_widths(font):
    """The full-width space U+3000 has zero width in the Medium/Bold source fonts of Alibaba PuHuiTi 3.0 (Heavy/Black are fine at 984/990),
    so text like "USD<U+3000>y-axis does not start at 0" runs together. Set it to the same width as the CJK character for "one". Returns how many were fixed."""
    cmap, hm, n = font.getBestCmap(), font['hmtx'], 0
    ref = cmap.get(0x4E00)
    for cp in (0x3000,):
        g = cmap.get(cp)
        if g and ref and hm[g][0] == 0:
            hm[g] = (hm[ref][0], 0); n += 1
    return n


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('--font', default=str(Path.home() / 'Library/Fonts/LXGWWenKai-Medium.ttf'))
    ap.add_argument('--out', default=str(ENGINE / 'lib/fonts/LXGWWenKai-500.woff'))
    ap.add_argument('--scan', action='append', default=[], help='extra directories to scan (repeatable)')
    ap.add_argument('--text', default='', help='extra characters to include')
    ap.add_argument('--no-default-scan', action='store_true', help="don't scan the skill's own engine/")
    ap.add_argument('--gb2312', action='store_true', help='merge in all GB2312 characters (6763)')
    ap.add_argument('--fix-widths', nargs='+', metavar='WOFF', help="don't subset; only fix zero-width full-width spaces in existing font files")
    a = ap.parse_args()
    if a.fix_widths:
        for f in a.fix_widths:
            ft = TTFont(f); n = fix_blank_widths(ft); ft.flavor = 'woff'
            if n: ft.save(f)
            print(f'{f}: fixed {n} widths')
        return
    if not Path(a.font).exists(): sys.exit(f'Font not found: {a.font} (see the download link in the script notes)')
    chars = set(BASE) | set(a.text)
    if not a.no_default_scan: chars |= scan(ENGINE)
    for d in a.scan: chars |= scan(d)
    chars |= set(chr(c) for c in range(0x20, 0x7F))           # include all of ASCII (years, English subtitles)
    if a.gb2312: chars |= gb2312_l1() | set(PUNCT)
    font = TTFont(a.font)
    cmap = font.getBestCmap()
    miss = sorted(ch for ch in chars if ord(ch) not in cmap and not ch.isspace())
    opts = subset.Options(); opts.flavor = 'woff'; opts.layout_features = ['*']; opts.name_IDs = ['*']; opts.notdef_outline = True
    sub = subset.Subsetter(opts); sub.populate(text=''.join(sorted(chars))); sub.subset(font)
    if fix_blank_widths(font): print('The source font\'s full-width space had zero width; set to the width of the CJK character for "one"')
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    font.flavor = 'woff'; font.save(a.out)
    print(f'{a.out}  {len(chars)} characters  {Path(a.out).stat().st_size // 1024} KB' + (f'\nAlso missing from the source font: {"".join(miss)}' if miss else ''))


if __name__ == '__main__':
    main()
