#!/usr/bin/env python3
# /// script
# requires-python = ">=3.9"
# dependencies = []
# ///
"""storyboard_lint.py — mechanically check a shot list before writing any code.

Usage:
  uv run storyboard_lint.py shot-list.md [--script script.txt]     # or python3 storyboard_lint.py …

The shot list first locks the style (three lines outside the table, written before it):
  Style: one sentence (one style card or one way of drawing, used for the whole film)
  Palette: a palette name (paper/poster/ink/navy/bauhaus/snow/wood/chalk) or 3–6 color values
  Character: none / hands and backs only / frame library <path> (AI-generated frames)
  Allow blue-purple: <reason> (optional; only when the user explicitly asks for blue-purple)
Then a markdown table (template and example in references/shot-list-template.md), one row per shot, columns:
  Time | Object in frame | Action | Camera | On-screen text | Method (optional, recommended) | Tags (optional)
Tables inside code blocks (```) are not checked. If the file has several tables, only the first one with
"Object" and "Action" columns is checked.

Per-row checks:
  ① Object: not empty, not just layout words like "title, bullet points, text, list, labels, subtitles, cards,
       background, frame, icons", and not an empty frame like "empty shot, empty scene, solid color, black frame,
       black screen, all black, gradient background"                                                  → red
  ② Action: not empty, not just catch-all verbs like "appears, shows, displays, fades in…"           → red
  ③ On-screen text ≤ 8 units (each CJK character counts as one; each English word or number counts as one) → red
  ④ The first shot can't be text-led (object is a title/text, or ≥ 7 units of on-screen text, or method is y5 kinetic type) → red
  ⑥ 2–6 seconds per shot; 6–8 seconds or under 2 seconds → yellow; over 8 seconds → red; more than a fifth of shots at 6–8 seconds → red
  ⑦ Three shots in a row with the same "Camera" value ("hold" and "pan" don't count) → yellow
  ⑮ Three shots in a row all pushing inward (slow push, fast push, push in, slam in, zoom in, dolly in mixed together count) → yellow
  ⑧ The last shot can't be text-led (centered quote card, pure text card; judged like ④)          → red
  ⑪ A text-led shot with a number in the middle of the film (a standalone number card)          → yellow
  ⑨ With --script: Arabic numerals in on-screen text (percentages, years, numbers with units) not found in the script → red
     (spelled-out numbers in the script are recognized too: "sixty percent" = 60%, "fifteen point two" = 15.2,
      "twenty twenty-five" = 2025, "twelve thousand" = 12k)
  ⑩ With a "Tags" column: more than 3 tags in one shot                                            → yellow
Whole-table checks:
  ⑤ Text-led shots ≤ 30%                                                                          → red
  Method column (checked if present): the same parameterized clip (same .json) totaling over 8 seconds → red;
       more than 2 clip grammars (a collage) → red
  ⑫ Style lock: missing any of the "Style", "Palette", "Character" lines                          → red
  ⑬ Palette: a color value in the blue-purple zone (hue 225°–300°, saturation ≥0.30) → red ("Allow blue-purple" downgrades to yellow);
       more than 6 colors → yellow
  ⑭ Character: the character line says code-drawn / chibi figure / robot → red; the object column has robots, little figures,
       stick figures, mascots or cartoon people while the character isn't a frame library → red;
       y4 used while the character isn't a frame library → red; coins, balls or ions given faces in the object column → yellow
  ⑯ Accent moves (fast push, slam in, whip) on more than a third of the shots → yellow
  Time ranges that don't join, or a whole table with no camera moves at all (all hold and cut) → yellow

Exit codes: 1 with any red light; 0 with only yellow or all green; 2 if the file can't be read or no table is found.
Standard library only.
"""
import re
import sys
from pathlib import Path

RED, YELLOW, GREEN = "red", "yellow", "green"


def words_re(words, plural=True):
    """A case-insensitive regex matching any of these words/phrases as whole words (optionally plural)."""
    alts = sorted({w.strip().lower() for w in words.split("|") if w.strip()}, key=len, reverse=True)
    suffix = r"(?:e?s)?" if plural else ""
    return re.compile(r"(?<![\w'])(?:" + "|".join(re.escape(a).replace(r"\ ", r"[\s-]+") for a in alts) + ")" + suffix + r"(?![\w])", re.I)


# ① Object: if nothing is left after removing these words, quantifiers, positions, colors and punctuation, "no object was written".
ABSTRACT = words_re("""title|subtitle|subheading|heading|headline|main title|bullet|bullet point|point|key point|text|text card|
big text|big word|word|wording|list|checklist|label|tag|caption|subtitle|card|background|backdrop|solid color|solid colour|
frame|picture|image|graphic|icon|empty shot|empty scene|empty frame|empty screen|blank|black frame|black screen|white screen|
fade to black|negative space|gradient|gradient background|keyword|quote|slogan|tagline|summary|conclusion|concept|content|
info|information|element|thing|stuff|diagram|illustration|whiteboard|blackboard|page|layout|animation|effect|copy|paragraph|
sentence|bullet|dot|symbol|numbering|number|arrow|line|shape|block|color block|light spot|particle|decoration|shot|scene|screen|
slide|visual|item""")
FILLER = words_re("""a|an|the|this|that|these|those|its|their|his|her|my|our|your|some|several|few|many|lots|of|and|or|with|
without|plus|on|in|at|to|into|onto|from|for|by|over|under|above|below|beside|next|inside|outside|within|across|around|behind|
front|back|top|bottom|left|right|middle|center|centre|centered|upper|lower|side|corner|big|small|large|tiny|huge|new|old|
main|key|first|second|third|last|final|one|two|three|four|five|six|seven|eight|nine|ten|single|empty|plain|solid|all|full|
white|black|red|blue|green|yellow|gray|grey|orange|purple|pink|brown|dark|light|bright|colored|coloured|color|colour|row|rows|
column|columns|group|groups|set|sets|piece|pieces|bunch|series|pair|is|are|it""", plural=False)
NONWORD = re.compile(r"[^a-z\u3400-\u9fff]+")
# ④ If the object column contains these words, the shot counts as text-led.
TEXTY = words_re("title|subtitle|headline|heading|text|text card|bullet|bullet point|key point|list|checklist|caption|"
                 "big word|keyword|quote|slogan|tagline|words")
# ② Action: if only catch-all verbs remain after removing these modifiers, there's "no action".
WEAK = words_re("""appear|appears|appeared|appearing|show|shows|shown|showing|showed|display|displays|displayed|displaying|
present|presents|presented|emerge|emerges|emerged|fade in|fades in|faded in|fade out|fades out|faded out|fade|fades|
pop up|pops up|popped up|pop in|pops in|pop out|pops out|come out|comes out|list|lists|listed|light up|lights up|lit up|
stay|stays|remain|remains|stop|stops|hold|holds|still|static|stays still|keep|keeps|sit|sits|sitting|rest|rests|exist|exists|
is there|be there|introduce|introduces|explain|explains|explained|describe|describes|emphasize|emphasizes|highlight|highlights|
label|labels|annotate|annotates|write out|writes out|type out|types out|enter|enters|exit|exits|is shown|are shown""", plural=False)
ACT_FILLER = words_re("""a|an|the|and|or|then|also|again|one|by|in|on|at|to|of|into|onto|from|with|it|its|is|are|be|being|
get|gets|turn|order|sequence|sequentially|gradually|slowly|quickly|softly|gently|together|simultaneously|start|starts|begin|
begins|after|another|each|every|other|all|screen|frame|picture|view|on screen|up|out""", plural=False)
# Camera column vocabulary: hold / slow push / pull out / pan / fast push / slam in / cut (whip = whip pan).
# Usage and durations are in references/camera-language.md
CAM_MOVE = ("push", "pull", "pan", "truck", "slide", "glide", "slam", "whip", "zoom", "dolly", "track", "snap", "punch",
            "move", "tilt", "crane", "orbit", "drift")
CAM_IN = ("slow push", "fast push", "push in", "push", "slam", "zoom in", "zoom-in", "zoomin", "dolly in", "punch", "snap",
          "crash zoom")
CAM_ACCENT = ("fast push", "slam", "whip", "snap", "punch", "crash")
CAM_REPEAT_OK = ("hold", "pan")
# ① If the object column contains only these words, it's an empty frame, not a layout element; the fix is different
EMPTY_SCENE = re.compile(r"empty[\s-]+(?:shot|scene|frame|screen)|\bblank\b|black[\s-]+(?:frame|screen)|white[\s-]+(?:frame|screen)|"
                         r"\ball[\s-]+(?:black|white)\b|fade[\s-]+to[\s-]+black|solid[\s-]+colou?r|gradient|negative[\s-]+space|"
                         r"^(?:background|backdrop)$|^(?:black|white|solid|plain)(?:\s+\w+)?\s+(?:background|backdrop)$", re.I)
EMPTY_CELL = {"", "-", "—", "–", "none", "n/a", "(empty)", "/", "——"}
GRAMMAR = re.compile(r"\b([ty][1-9])(?:_[a-z_]+)?\b", re.I)
# ⑫–⑭ Style lock
LOCK = re.compile(r"^\s*[-*]?\s*(?:\*\*)?(art style|style|palette|character|allow blue[\s-]purple)(?:\*\*)?\s*[:\uff1a]\s*(.+?)\s*$", re.I)
LOCK_KEYS = {"art style": "style", "style": "style", "palette": "palette", "character": "character"}
PALETTES = {"paper", "poster", "ink", "navy", "bauhaus", "snow", "wood", "chalk"}
HEX = re.compile(r"#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b")
CHAR_BAD = re.compile(r"code[\s-]*drawn|drawn in code|hand[\s-]*coded|\bsvg\b|chibi|little (?:man|men|person|people|figures?)|"
                      r"stick[\s-]*figures?|robots?|cartoon (?:man|men|person|people|figures?)", re.I)
CHAR_FRAMES = re.compile(r"frame[\s-]*librar(?:y|ies)|\bframes\b|\.png|\S/\S|\S/$", re.I)
OBJ_CHAR = re.compile(r"robots?|little (?:man|men|person|people|figures?)|stick[\s-]*figures?|mascots?|"
                      r"cartoon (?:man|men|person|people|figures?|characters?)|chibi", re.I)
_THING = r"\b(?:coins?|balls?|ions?|electrons?|particles?|molecules?)\b"
_FACE = r"\b(?:smil\w*|smiley|faces?|expressions?|eyes|features)\b"
OBJ_FACE = re.compile(_THING + r".{0,24}" + _FACE + "|" + _FACE + r".{0,24}" + _THING, re.I)


def read_lock(text, table_line=None):
    """The style lock outside the table: {style, palette, character, allow_bp}. Lines inside code blocks don't count; if an item
    is written several times, take the line before the table closest to it (only look after the table if there's none before)."""
    before, after, fence = {}, {}, False
    for i, ln in enumerate(text.splitlines(), 1):
        if ln.strip().startswith("```"):
            fence = not fence; continue
        m = None if fence else LOCK.match(ln)
        if not m: continue
        key = LOCK_KEYS.get(m.group(1).lower(), "allow_bp")
        if table_line is None or i < table_line: before[key] = m.group(2).strip()
        else: after.setdefault(key, m.group(2).strip())
    return {**after, **before}


def blue_purple_hex(h):
    h = h if len(h) == 6 else "".join(c * 2 for c in h)
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    mx, mn = max(r, g, b), min(r, g, b); d = mx - mn
    if d == 0 or mx == 0: return False
    hue = (((g - b) / d) % 6 if mx == r else (b - r) / d + 2 if mx == g else (r - g) / d + 4) * 60
    return 225 <= hue <= 300 and d / mx >= 0.30 and 0.06 <= mx <= 0.90


def strip_cells(line):
    s = line.strip().replace("\uff5c", "|")
    if s.startswith("|"): s = s[1:]
    if s.endswith("|"): s = s[:-1]
    return [c.strip() for c in s.split("|")]


def is_object_head(h):
    return "object" in h.lower()


def is_action_head(h):
    h = h.lower()
    return "action" in h or "doing" in h


def find_table(text):
    """Returns (header, rows[(line number, cells)]). Skips code blocks; takes the first table with both an "Object" and an "Action" column."""
    lines, fence, i = text.splitlines(), False, 0
    while i < len(lines):
        ln = lines[i]
        if ln.strip().startswith("```"):
            fence = not fence; i += 1; continue
        if not fence and ln.strip().startswith(("|", "\uff5c")) and i + 1 < len(lines) and re.match(r"^\s*[|\uff5c]?\s*:?-{2,}", lines[i + 1]):
            head = strip_cells(ln)
            rows, j = [], i + 2
            while j < len(lines) and lines[j].strip().startswith(("|", "\uff5c")):
                rows.append((j + 1, strip_cells(lines[j]))); j += 1
            if any(is_object_head(h) for h in head) and any(is_action_head(h) for h in head):
                return head, rows
            i = j; continue
        i += 1
    return None, []


def columns(head):
    col = {}
    for k, h in enumerate(head):
        hl = h.lower()
        if "time" in hl and "time" not in col: col["time"] = k
        elif is_object_head(h) and "obj" not in col: col["obj"] = k
        elif is_action_head(h) and "act" not in col: col["act"] = k
        elif "camera" in hl and "cam" not in col: col["cam"] = k
        elif "tag" in hl and "tags" not in col: col["tags"] = k
        elif "text" in hl and "text" not in col: col["text"] = k
        elif ("method" in hl or hl.startswith("how")) and "how" not in col: col["how"] = k
    return col


def parse_t(tok):
    tok = tok.strip()
    if ":" in tok:
        m, s = tok.split(":", 1)
        return int(m) * 60 + float(s)
    return float(tok)


def parse_span(cell):
    nums = re.findall(r"\d+:\d+(?:\.\d+)?|\d+(?:\.\d+)?", cell)
    if len(nums) < 2: return None
    a, b = parse_t(nums[0]), parse_t(nums[1])
    return (a, b) if b > a else None


def clean_cell(c):
    c = re.sub(r"<br\s*/?>", " ", c or "")
    return c.strip().strip("`*_").strip()


def is_empty(c):
    return clean_cell(c).lower() in EMPTY_CELL


def obj_residue(obj):
    s = clean_cell(obj).lower().replace("'s", " ")
    s = ABSTRACT.sub(" ", s)
    s = FILLER.sub(" ", s)
    return NONWORD.sub("", s)


def act_residue(act, obj=""):
    """What's left after removing catch-all verbs, layout words and the nouns from the object column.
    "points appear one by one" and "the spore appears" both leave nothing."""
    s = " " + clean_cell(act).lower().replace("'s", " ") + " "
    for w in sorted({t for t in re.findall(r"[a-z]{3,}", clean_cell(obj).lower())}, key=len, reverse=True):
        s = re.sub(r"(?<![a-z])" + re.escape(w) + r"(?:e?s)?(?![a-z])", " ", s)
    s = WEAK.sub(" ", s)
    s = ABSTRACT.sub(" ", s)
    s = ACT_FILLER.sub(" ", s)
    return NONWORD.sub("", s)


def text_len(t):
    t = clean_cell(t)
    if t.lower() in EMPTY_CELL: return 0
    t = re.sub(r"[\"'‘’“”\u300c\u300d\u300e\u300f\u300a\u300b]", "", t)
    return len(re.findall(r"[\u3400-\u9fff]|[A-Za-z0-9][A-Za-z0-9.%°'’]*", t))


def how_kind(how):
    """Method column → kind of visual method: grammar code (t1…y6), scenes, footage, otherwise the raw text."""
    h = clean_cell(how)
    if h.lower() in EMPTY_CELL: return None
    m = GRAMMAR.search(h)
    if m: return m.group(1).lower()
    if re.search(r"scenes?|\.js\b|drawn in code|code[\s-]*drawn", h, re.I): return "scenes"
    if re.search(r"footage|screenshot|photo|video|recording|live|original|screen[\s-]*rec|stock|archive", h, re.I): return "footage"
    return h


def clip_name(how):
    m = re.search(r"[^\s|,:()]+\.json", clean_cell(how))
    return m.group(0) if m else None


def tag_count(cell):
    """Tags column: split on commas, slashes, semicolons, middle dots; if there's no separator at all, split on spaces."""
    c = clean_cell(cell)
    if c.lower() in EMPTY_CELL: return 0
    parts = [x for x in re.split(r"[,\u3001\uff0c/\uff0f;\uff1b·•|]+", c) if x.strip()]
    if len(parts) <= 1: parts = c.split()
    return len(parts)


# ⑨ Numbers: on screen only Arabic numerals count; in the script both numerals and spelled-out English number words count
# (better to let a few slip through than to accuse wrongly).
SMALL = {w: i for i, w in enumerate("zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen "
                                     "fifteen sixteen seventeen eighteen nineteen".split())}
TENS = {w: 10 * (i + 2) for i, w in enumerate("twenty thirty forty fifty sixty seventy eighty ninety".split())}
SCALES = {"thousand": 10 ** 3, "million": 10 ** 6, "billion": 10 ** 9, "trillion": 10 ** 12}
NUMWORDS = set(SMALL) | set(TENS) | set(SCALES) | {"hundred"}
ARABIC = re.compile(r"\d+(?:,\d{3})*(?:\.\d+)?")
SRT_NOISE = re.compile(r"\d{1,2}:\d{2}:\d{2}[,.]\d{1,3}|^\s*\d+\s*$", re.M)
SCALE_SUFFIX = re.compile(r"\s*(thousand|million|billion|trillion|bn\b|[kK]\b|[mM]\b|B\b)")
SUFFIX_EXP = {"thousand": 3, "million": 6, "billion": 9, "trillion": 12, "bn": 9, "k": 3, "K": 3, "m": 6, "M": 6, "B": 9}


def en_ints(toks):
    """Spelled-out English integer; may have two readings: "three hundred eighteen" → 318,
    "twenty twenty-five" → 2025 (read as two pairs), "two zero two five" → 2025 (digit by digit)."""
    toks = [t for t in toks if t != "and"]
    if not toks: return set()
    if len(toks) > 1 and all(t in SMALL and SMALL[t] < 10 for t in toks):
        return {int("".join(str(SMALL[t]) for t in toks))}
    total, cur = 0, 0
    for t in toks:
        if t in SMALL: cur += SMALL[t]
        elif t in TENS: cur += TENS[t]
        elif t == "hundred": cur = (cur or 1) * 100
        elif t in SCALES: total += (cur or 1) * SCALES[t]; cur = 0
        else: return set()
    out = {total + cur}
    if not any(t == "hundred" or t in SCALES for t in toks):        # years: "nineteen eighty-four", "twenty twenty-five"
        groups, k = [], 0
        while k < len(toks):
            t = toks[k]
            if t in TENS and k + 1 < len(toks) and toks[k + 1] in SMALL and 0 < SMALL[toks[k + 1]] < 10:
                groups.append(TENS[t] + SMALL[toks[k + 1]]); k += 2
            else:
                groups.append(TENS.get(t, SMALL.get(t, 0))); k += 1
        if len(groups) == 2 and groups[0] >= 10:
            out.add(groups[0] * 100 + groups[1])
    return out


def en_values(toks):
    """Spelled-out English number → [(value, decimal places)]."""
    while toks and toks[-1] in ("and", "point"): toks = toks[:-1]
    if "point" in toks:
        k = toks.index("point")
        a, b = toks[:k], toks[k + 1:]
    else:
        a, b = toks, []
    ints = en_ints(a) if a else {0}
    digits, k = [], 0
    while k < len(b) and b[k] in SMALL and SMALL[b[k]] < 10:
        digits.append(SMALL[b[k]]); k += 1
    if not digits: return [(float(i), 0) for i in ints]
    frac = "".join(map(str, digits))
    out = [(float(f"{i}.{frac}"), len(frac)) for i in ints]
    scale = next((SCALES[t] for t in b[k:] if t in SCALES), None)         # "one point two million"
    if scale:
        exp = len(str(scale)) - 1
        out += [(v * scale, d - exp) for v, d in out]
    return out


def scaled(v, dec, after):
    """A number followed directly by "thousand / million / k / M": accept both the number as written and the multiplied value
    (on screen 1.2M = in the script "one point two million"). Returns [(value, decimal places)]."""
    out = [(v, dec)]
    m = SCALE_SUFFIX.match(after)
    if m:
        k = SUFFIX_EXP[m.group(1)]
        out.append((v * 10 ** k, dec - k))
    return out


def arabic(tok):
    t = tok.replace(",", "")
    return float(t), len(t.partition(".")[2])


def screen_numbers(text):
    """Numbers in on-screen text: [(original, [(value, decimal places)])]."""
    t = clean_cell(text)
    return [(m.group(0), scaled(*arabic(m.group(0)), t[m.end():])) for m in ARABIC.finditer(t)]


def script_numbers(script):
    """Numbers spoken in the script: [(value, tolerance)]. Tolerance follows that number's precision in the script: if the script
    says "fifteen times", 15.2 on screen still matches; if it says "fifteen point two", the screen must say 15.2."""
    s = SRT_NOISE.sub(" ", script)
    have = []
    for m in ARABIC.finditer(s):
        have += scaled(*arabic(m.group(0)), s[m.end():])
    toks = [(w.group(0).lower(), w.start(), w.end()) for w in re.finditer(r"[A-Za-z]+", s)]
    joined = lambda a, b: re.fullmatch(r"[\s-]*", s[toks[a][2]:toks[b][1]]) is not None    # a run stops at punctuation
    k = 0
    while k < len(toks):
        if toks[k][0] not in NUMWORDS:
            k += 1; continue
        j = k + 1
        while j < len(toks) and joined(j - 1, j) and (toks[j][0] in NUMWORDS or (
                toks[j][0] in ("and", "point") and j + 1 < len(toks) and joined(j, j + 1) and toks[j + 1][0] in NUMWORDS)):
            j += 1
        run = [t for t, _, _ in toks[k:j]]
        end = toks[j - 1][2]
        for v, d in en_values(run):
            have += scaled(v, d, s[end:])
        k = j
    return {(round(v, 6), 0.5 * 10.0 ** -d + 1e-9) for v, d in have}


def number_in(vals, have):
    return any(abs(x - v) <= tol for x, _ in vals for v, tol in have)


def lint(text, script=None):
    """Returns a dict: rows (per-row results), table (whole-table results), verdict, summary.
    script: the full narration script (optional); ⑨ is checked only when it's given."""
    head, raw = find_table(text)
    if head is None:
        return {"error": "No shot list found: it needs a markdown table whose header has at least the columns "
                         "\"Object in frame\" and \"Action\" (tables inside code blocks don't count)."}
    col = columns(head)
    miss = [n for k, n in (("time", "Time"), ("obj", "Object in frame"), ("act", "Action"), ("cam", "Camera"), ("text", "On-screen text")) if k not in col]
    if miss:
        return {"error": "The shot list is missing columns: " + ", ".join(miss) +
                         ". Columns: Time | Object in frame | Action | Camera | On-screen text | Method."}
    get = lambda cells, k: cells[col[k]] if k in col and col[k] < len(cells) else ""
    rows, table = [], []
    for n, (lineno, cells) in enumerate(raw, 1):
        if all(is_empty(c) for c in cells): continue
        obj, act, cam, txt, how = (get(cells, k) for k in ("obj", "act", "cam", "text", "how"))
        span = parse_span(get(cells, "time"))
        r = {"n": len(rows) + 1, "line": lineno, "obj": clean_cell(obj), "act": clean_cell(act), "cam": clean_cell(cam),
             "text": clean_cell(txt), "how": clean_cell(how), "span": span, "dur": (span[1] - span[0]) if span else None,
             "chars": text_len(txt), "issues": []}
        bad = r["issues"].append
        if is_empty(obj):
            bad((RED, "①object", "The object column is empty",
                 "write something on screen you can point at and say \"that's it\": a person, a hand, a machine, a specific thing"))
        elif not obj_residue(obj) and EMPTY_SCENE.search(clean_cell(obj)):
            bad((RED, "①object", f"\"{r['obj']}\" is an empty frame (empty scene, solid color, black): the protagonist isn't in the picture",
                 "this shot also needs the protagonist or main object doing something; for a breather, let the main object hold still or pull out, don't remove it"))
        elif not obj_residue(obj):
            bad((RED, "①object", f"\"{r['obj']}\" is not an object, it's a layout element",
                 "behind every bullet point there's a thing doing something — draw it: \"three reasons\" → three concrete things, one shot each, each doing one thing"))
        if is_empty(act):
            bad((RED, "②action", "The action column is empty", "write a verb: falls, splits open, burrows in, gets cut off"))
        elif not act_residue(act, obj):
            bad((RED, "②action", f"\"{r['act']}\" only appears/shows; there's no action",
                 "write the object's own action: where it comes from, where it goes, what it hits, what it turns into"))
        if r["chars"] > 8:
            bad((RED, "③on-screen text", f"{r['chars']} units of on-screen text, more than 8",
                 "keep just one word or half a sentence; leave the rest to the narration or subtitles"))
        r["texty"] = bool(TEXTY.search(r["obj"])) or r["chars"] >= 7 or how_kind(how) == "y5"
        if span is None:
            bad((RED, "⑥duration", f"Can't read the time range \"{clean_cell(get(cells, 'time'))}\"", "write it as 0–3 or 0:03–0:07"))
        elif r["dur"] > 8:
            bad((RED, "⑥duration", f"This shot is {r['dur']:g} seconds, over 8 seconds",
                 "split it into two or three shots of 2–6 seconds each, changing the picture or the camera move"))
        elif r["dur"] > 6:
            bad((YELLOW, "⑥duration", f"This shot is {r['dur']:g} seconds (6–8 seconds only occasionally)",
                 "split it if you can; if not, make something new happen in it: the object's next action, a pan to the next piece, a pull-out to the whole"))
        elif r["dur"] < 2:
            bad((YELLOW, "⑥duration", f"This shot is only {r['dur']:g} seconds",
                 "insert shots can be short; if the narration can't finish a sentence here, merge it into a neighboring shot"))
        if is_empty(cam):
            bad((YELLOW, "camera", "The camera column is empty", "write one: hold / slow push / pull out / pan / fast push / slam in / cut"))
        if "tags" in col:
            r["tags"] = tag_count(get(cells, "tags"))
            if r["tags"] > 3:
                bad((YELLOW, "⑩tags", f"This shot has {r['tags']} tags crowded together",
                     "at most 3 per shot; leave the rest to the narration or move them to the next shot; attach tags beside the object they point at, not as a row of glowing capsules"))
        rows.append(r)
    if not rows:
        return {"error": "The shot list is empty: one shot per row under the header."}

    # ④ The first shot
    f = rows[0]
    if f["texty"]:
        f["issues"].append((RED, "④opening", "The first shot is text-led (a title/text)",
                            "replace the first 3 seconds with a concrete little scene: a person or object doing something related to the topic; give the title one shot later, or not at all"))
    elif f["chars"] >= 4:
        f["issues"].append((YELLOW, "④opening", f"The first shot already has {f['chars']} units of on-screen text",
                            "let the picture speak at the opening; save the text for the second shot"))
    # ⑧ The last shot
    z = rows[-1]
    if len(rows) > 1 and z["texty"]:
        z["issues"].append((RED, "⑧ending", "The last shot is text-led (a centered quote card / pure text card)",
                            "end on an action by the protagonist or main object: putting it in a pocket, closing the book, pulling out to see the whole; text can be written on an object in the picture, not on a separate text card"))
    # ⑪ Number cards in the middle: a number on its own solid-color text card is read in blind reviews as "a PowerPoint page inserted"
    for r in rows[1:-1]:
        if r["texty"] and screen_numbers(r["text"]):
            r["issues"].append((YELLOW, "⑪number card", "This shot is a standalone number card",
                                "slam the number onto an object in the world: a phone screen, a battery bar, a price tag, a blackboard, a sheet of paper; don't give it its own solid-color big-text card"))
    # ⑨ On-screen numbers against the script
    if script is not None:
        have = script_numbers(script)
        for r in rows:
            miss = [tok for tok, vals in screen_numbers(r["text"]) if not number_in(vals, have)]
            if miss:
                quoted = ", ".join(f'"{m}"' for m in miss)
                r["issues"].append((RED, "⑨numbers", f"On-screen number(s) {quoted} not found in the script: the on-screen number and the narration don't match",
                                    "check the data source and change the on-screen text to the number spoken in the narration (or change the narration); both must be the same number"))
    # ⑦ Three shots in a row with the same camera move
    for k in range(2, len(rows)):
        c = rows[k]["cam"].lower()
        if c and not is_empty(c) and c not in CAM_REPEAT_OK and c == rows[k - 1]["cam"].lower() == rows[k - 2]["cam"].lower():
            # holds can repeat; panning piece by piece across an investigation desk is a normal way to write it too
            alt = " / ".join(w for w in ("hold", "slow push", "pull out", "pan", "cut") if w != c)
            rows[k]["issues"].append((YELLOW, "⑦camera", f"Three shots in a row are all \"{rows[k]['cam']}\"",
                                      f"change the middle shot's move to one of: {alt}, chosen by what you want the audience to look at in that shot"))
    # ⑮ Three shots in a row all pushing inward: a push on every shot turns the whole film into one zoom-in after another
    # (on 2026-10-12 a 102-second Nobel short pushed in about 48 times and was judged "too many, too fast, not smooth")
    inward = [any(w in r["cam"].lower() for w in CAM_IN) and "pull" not in r["cam"].lower() and "out" not in r["cam"].lower() for r in rows]
    for k in range(2, len(rows)):
        if inward[k] and inward[k - 1] and inward[k - 2] and not any(i[1] == "⑦camera" for i in rows[k]["issues"]):
            rows[k]["issues"].append((YELLOW, "⑮push-in", "Three shots in a row are all pushing inward",
                                      "after pushing in, give and take: switch the middle one to hold, pull out or pan, or hard-cut to a different shot size; if live footage is moving on its own, hold"))
    # Time ranges joining up
    for k in range(1, len(rows)):
        a, b = rows[k - 1]["span"], rows[k]["span"]
        if a and b and abs(b[0] - a[1]) > 0.05:
            rows[k]["issues"].append((YELLOW, "time", f"The previous shot ends at {a[1]:g}s but this one starts at {b[0]:g}s",
                                      "make them join, or state that there's an empty shot here"))

    n = len(rows)
    texty = [r["n"] for r in rows if r["texty"]]
    if len(texty) / n > 0.30:
        table.append((RED, "⑤text share", f"Text-led shots {len(texty)}/{n} ({len(texty) / n:.0%}), over 30%: shots {', '.join(map(str, texty))}",
                      "pick half of them and replace the text with an object doing something; leave the words to the narration and subtitles"))
    long_ = [r["n"] for r in rows if r["dur"] and 6 < r["dur"] <= 8]
    if len(long_) > max(1, n // 5):
        table.append((RED, "⑥duration", f"{len(long_)} shots are 6–8 seconds (shots {', '.join(map(str, long_))}); only occasional ones are allowed",
                      "split them, 2–6 seconds per shot"))
    if not any(any(w in r["cam"].lower() for w in CAM_MOVE) for r in rows):
        table.append((YELLOW, "camera", "The whole table has no camera moves at all, only holds and cuts",
                      "the delivery gate measures in-shot motion, and all holds is usually a red light; put slow pushes, pans or pull-outs where you lead the audience's eye (the object's own action counts as motion too)"))
    acc = [r["n"] for r in rows if any(w in r["cam"].lower() for w in CAM_ACCENT)]
    if n >= 6 and len(acc) * 3 > n:
        table.append((YELLOW, "⑯accents", f"Fast push / slam in / whip used on {len(acc)}/{n} shots (shots {', '.join(map(str, acc))}); with too many accents nothing is accented",
                      "keep them only for reveals, twists and key numbers; change the rest to slow pushes, pans, pull-outs or holds"))
    total = sum(r["dur"] or 0 for r in rows)
    if "how" in col:
        clips = {}
        for r in rows:
            c = clip_name(r["how"])
            if c: clips.setdefault(c, []).append(r)
        for c, rs in clips.items():
            s = sum(r["dur"] or 0 for r in rs)
            if s > 8:
                table.append((RED, "method", f"Parameterized clip {c} carries {s:g} seconds (shots {', '.join(str(r['n']) for r in rs)})",
                              "a single parameterized clip carries at most 8 seconds; stretched longer it reads as a PowerPoint page; split it into several specs with other methods in between"))
        grams = sorted({k for k in (how_kind(r["how"]) for r in rows) if k and GRAMMAR.fullmatch(k)})
        if len(grams) > 2:
            table.append((RED, "method", f"Uses {len(grams)} clip grammars ({', '.join(grams)}); joined together that's several art styles",
                          "at most 2 clip grammars per film, all specs with the same theme; draw the other shots as scenes in the same palette, or use real footage full-frame"))
        empty_how = [r["n"] for r in rows if how_kind(r["how"]) is None]
        if empty_how:
            table.append((YELLOW, "method", f"Shots {', '.join(map(str, empty_how))} have no method",
                          "write which grammar's clip (shotNN.json), scenes/<id>.js, or footage"))
    else:
        table.append((YELLOW, "method", "No \"Method\" column, so it can't check how long a single clip runs or how many grammars are used",
                      "add a column: y2 clip shot01.json / scenes/<id>.js / footage photo"))

    # ⑫–⑭ Style lock: one visual language for the whole film, no blue-purple colors, characters either detailed or faceless
    lock = read_lock(text, raw[0][0] - 2 if raw else None)
    miss = [name for key, name in (("style", "Style"), ("palette", "Palette"), ("character", "Character")) if not lock.get(key)]
    if miss:
        quoted = ", ".join(f'"{m}"' for m in miss)
        table.append((RED, "⑫style lock", f"Missing {quoted} before the table",
                      "write three lines before the table — Style: one sentence, only this one for the whole film; Palette: a palette name or 3–6 color values (references/palettes.md); "
                      "Character: none / hands and backs only / frame library <path> (references/character-detail.md)"))
    pal = lock.get("palette", "")
    if pal:
        hexes = HEX.findall(pal)
        named = any(re.search(r"\b" + p + r"\b", pal, re.I) for p in PALETTES)
        bp = [f"#{h}" for h in hexes if blue_purple_hex(h)]
        if bp:
            table.append((YELLOW if lock.get("allow_bp") else RED, "⑬palette",
                          f"The palette has blue-purple: {', '.join(bp)}" + (" (a reason for allowing blue-purple is given)" if lock.get("allow_bp") else ""),
                          "switch to a set from references/palettes.md, or move these colors out of hue 225°–300°; only write \"Allow blue-purple: reason\" when the user explicitly asks for blue-purple"))
        if len(hexes) > 6:
            table.append((YELLOW, "⑬palette", f"The palette has {len(hexes)} colors", "3–6 colors per film: background, surface, main text, secondary text, one or two accents"))
        if not hexes and not named:
            table.append((YELLOW, "⑬palette", f"Palette \"{pal}\" is neither a palette name nor color values",
                          "write a name from references/palettes.md, or 3–6 #hex values"))
    ch = lock.get("character", "")
    frames = bool(ch and CHAR_FRAMES.search(ch))
    if ch and CHAR_BAD.search(ch) and not frames:
        table.append((RED, "⑭character", f"The character line says \"{ch}\": code-drawn little figures and robots are retired",
                      "with image-generation capability use AI-generated frames (references/10-characters.md); without it show only hands, backs, silhouettes, or no people at all"))
    for r in rows:
        if OBJ_CHAR.search(r["obj"]) and not frames:
            r["issues"].append((RED, "⑭character", f"The object column has \"{OBJ_CHAR.search(r['obj']).group(0)}\", but the character isn't a frame library",
                                "change this shot to hands, a figure from behind or an object; to show a character, first build a frame library per references/character-detail.md"))
        if OBJ_FACE.search(r["obj"] + " " + r["act"]):
            r["issues"].append((YELLOW, "⑭character", "Coins, balls, ions or similar things are given faces",
                                "draw objects as objects: tell it with shape, color and motion, no expressions"))
        if how_kind(r["how"]) == "y4" and not frames:
            r["issues"].append((RED, "⑭character", "y4 needs a character frame library, but the character line isn't one",
                                "switch to y2/y5 or scenes and tell it with hands and objects; with image-generation capability build a frame library first"))

    issues = [x for r in rows for x in r["issues"]] + table
    verdict = RED if any(x[0] == RED for x in issues) else YELLOW if issues else GREEN
    numbered = [r["n"] for r in rows if screen_numbers(r["text"])]
    return {"rows": rows, "table": table, "verdict": verdict, "total": total, "texty": texty,
            "script": script is not None, "numbered": numbered}


def report(res):
    if "error" in res: return [res["error"]]
    L = []
    for r in res["rows"]:
        light = RED if any(x[0] == RED for x in r["issues"]) else YELLOW if r["issues"] else GREEN
        span = f"{r['span'][0]:g}–{r['span'][1]:g}s" if r["span"] else "?"
        L.append(f"[{light:<6}] shot {r['n']:<3} {span:<10} {r['obj'][:32]}")
        for lv, tag, what, fix in r["issues"]:
            L.append(f"      [{lv}] {tag}: {what}. Fix: {fix}")
    L.append("")
    L.append(f"Whole table: {len(res['rows'])} shots, {res['total']:g} seconds, {len(res['texty'])} text-led shots")
    for lv, tag, what, fix in res["table"]:
        L.append(f"  [{lv}] {tag}: {what}. Fix: {fix}")
    L.append("")
    L.append({RED: "Verdict: red light. Fix the shot list and rerun this command first; don't start writing code until the red lights are cleared.",
              YELLOW: "Verdict: yellow light. You can start building; think through a reason for each yellow item and write them in the delivery notes.",
              GREEN: "Verdict: green light. You can start building."}[res["verdict"]])
    if not res.get("script") and res.get("numbered"):
        L.append(f"Shots {', '.join(map(str, res['numbered']))} have numbers on screen: add --script script.txt to check they match the narration.")
    L.append("What the machine can't check and you have to check yourself: does one concrete example run through the whole film, is it all one art style; "
             "do adjacent shots have different compositions; are the first 3 seconds a little scene rather than the topic.")
    return L


def main(argv=None):
    argv = list(sys.argv[1:] if argv is None else argv)
    if any(a in ("-h", "--help") for a in argv):
        print(__doc__); return 0
    sp = None
    if "--script" in argv:
        k = argv.index("--script")
        if k + 1 >= len(argv):
            print("--script needs the path to the script", file=sys.stderr); return 2
        sp = Path(argv[k + 1]); del argv[k:k + 2]
    if len(argv) != 1:
        print(__doc__); return 2
    p = Path(argv[0])
    try:
        text = p.read_text(encoding="utf-8")
        script = sp.read_text(encoding="utf-8") if sp else None
    except OSError as e:
        print(f"Can't read {e.filename}: {e.strerror}", file=sys.stderr); return 2
    res = lint(text, script)
    print("\n".join(report(res)))
    if "error" in res: return 2
    return 1 if res["verdict"] == RED else 0


if __name__ == "__main__":
    sys.exit(main())
