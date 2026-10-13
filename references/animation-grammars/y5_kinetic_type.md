# y5 · Kinetic typography / motion infographics

> The grammar in one sentence: **the words are the actors — each key word slams in on an accent, the main word is big enough to read at a glance, the other words rise out of "slots" to sync with the ear; there is only ever one focal point on screen; the camera and background texture keep moving, while words hold still once they land.**

Lineage: Saul Bass's title sequence for *North by Northwest* (1959) is widely considered the first large-scale use of kinetic type in a feature film; after 2008, lyric/quote kinetic type on YouTube (the After Effects generation) made it a standard grammar for explainer videos, lists, quotes and data openers.

## Pre-flight checks

1. **First confirm this section should make the words the star.** Use it only for lists, punchlines, numbers and chapter cards; if a whole stretch of more than 30–60 seconds is all text, switch grammars, or insert an image or evidence object (screenshot, code card, chat bubble) every 2 pages.
2. **Count the words.** Main word ≤4 characters (Chinese; for English, one or two short words), supporting line ≤14 characters (a short phrase); only one thing entering at any moment. If it's over, split the page rather than shrinking the type to cram it in.
3. **No more than 3 pages of the same page type in a row.** "Big word + supporting line + label at top left" four pages in a row is a slideshow; insert a slammed-in number, an evidence object, or a rush-into-a-color-block transition.
4. **Write every landing point as a beat number or a word in the narration.** Landing points that are neither on the beat grid nor on a word get deleted or moved onto one.
5. **Words hold still once they land.** Leave the energy to beat micro-punches, page changes and evidence objects entering; the main word doesn't drift or breathe.

---

## ① When to use it

**Use it:**
- Openers and chapter cards for explainers / lists / "X stages" / "3 reasons": the information is **structure** (how many, which one, from what to what), not imagery.
- Quotes, punchlines, one-sentence conclusions: having the audience "read it while watching" sticks better than "remember it while listening".
- Explaining numbers: one number per shot, with the number itself as the star.
- Narration with clear stressed words ("it's not writing code, it's **stating requirements**").

**Don't use it:**
- Storytelling and emotional arcs → without a face, the audience struggles to empathize (use y4 characters).
- Long explanatory narration with screens full of text → the audience will only read and not listen, and can't keep up reading either. More than 30–60 seconds of kinetic text gets tiring; use it for openers, chapter cards and conclusion cards.
- Lists with lots of text (>5 items) → make it a static infographic and explain it slowly.

## ② Composition

**Framing**: one main word per screen. The main word is left-aligned in the left 1/3–1/2 of the frame (or mirrored to the right), with the supporting line right under it and an "evidence object" on the other side (code card, chat bubble, checklist). A small label goes in the top corner ("Stage 01") along with a progress track. At least 130px margin all around.

**Type scale (demo film)**: main word 340px (PuHui 115 Black) : supporting line 96px (105 Heavy) : label 40px (85 Bold, tracking 6px) ≈ **3.4 : 1 : 0.4**. The main word must be read within 0.3 seconds, so it gets only 2 characters.

**Colors**: one full-screen background color per chapter; a new chapter = a new background color (the color itself is the chapter number).

| Shot | Background | Main word | Accent |
|---|---|---|---|
| Title | Yellow `#FFD23F` | Ink `#111111` | White "3" in a coral circle `#FF5A36` |
| 01 Completion | Coral `#FF5A36` | White | Yellow highlighter `#FFD23F` |
| 02 Chat | Navy `#14213D` | Yellow | Yellow highlighter, blue bubble `#3A86FF` |
| 03 Agent | Off-white `#F4EFE6` | Ink | Coral underline, green check `#2BB673` |

4 background colors + ink + white for the whole film, and only ever one accent color.

**Shape language**: the words are the biggest shapes; supporting shapes are only rounded rectangles (cards r=26, bubbles r=30, keycaps r=22), circles (behind numbers) and slanted color blocks (highlighter, slope 0.18). The background is a dot grid at 64px spacing (opacity 6–10%). No outlined text, no drop-shadowed text (the only shadow is an 8–18% offset shadow under cards).

## ③ Motion

**Entrances (choose by "importance")**

| Element | Method | Curve and duration |
|---|---|---|
| Main word | **Slam**: scales from 1.7× to 1, opacity 0→1 over the first 0.06s | Underdamped spring `1−e^(−10t)·cos(2π·2.2t)`, about 8% overshoot, settles in ≈0.35s |
| First word of a title | Slam + rotation settling −8°→0 | Same as above |
| Supporting lines, labels | **Rise out of a slot**: words push up from +1.2× the letter height to 0 inside a mask below the baseline | `expoOut`, 0.30–0.35s |
| Numbers/icons/bubbles/keycaps | **Pop**: scale 0→1 | `backOut`, s=2.6–3.0 (17–20% overshoot), 0.30–0.42s |
| Cards | **Slide in**: from +700px or +260px below, with a 3.4° rotation settling | `expoOut` 0.40s |
| Typing | Truncated by character | 13 characters in 0.5s (26 per second), cursor blinking at 2Hz |
| Code completion | Gray text **flashes in on frame 0** (completions do appear instantly) → turns solid on Tab | Keycap press 14%, rebounding e^(−18t) |
| Highlighter / underline | Brushed left to right | `expoOut` 0.30s, brushed 1–3 eighth notes after the words appear |
| Key-word enlargement | On the emphasis beat, scales to 1.35× and pins there, with the highlighter scaling along | Spring freq 2.5 / decay 9, on the same beat as the accompanying action (pressing Tab, checking a box) |
| Giant stage number | 900px, 5–13% opacity, pressed into the lower right, dropping from 1.35× to 1, then drifting slowly diagonally 14/10 px/s | Spring freq 2 / decay 8 |
| Checkmark | The check stroke drawn along its arc length, with the box 1→1.25→1 at the same time | 0.22s; the strikethrough follows 0.08s later |

**Exits**: faster than entrances, with an accelerating curve (`expoIn`), 0.18s, elements staggered by 0.03s, shrinking to 0.6, dropping 60px and fading out together. **Exits are faster than entrances** — the audience's attention has already moved on before the exit starts. The last beat of the demo's title section: everything except the "3" exits, leaving just the one shape to rush into.

**Stagger**: words on the same line staggered by one eighth note (0.25s at 120 BPM); small elements in the same group (three checkmarks) also one eighth apart.

**Continuous motion (words hold still once landed; other things move)**
- Camera micro-drift: two sines, amplitude 5px, periods about 7s / 2.7s; extremely slow rotation ±0.5°.
- Beat micro-punch: on every quarter beat the whole screen scales up 1.2%, decaying `e^(−25t)` (≈0.12s) — the picture "breathes" with the drum.
- The background dot grid translates diagonally at 36px/s.
- Ending beat: the camera pulls out 6% (`expoOut` 0.5s), everything shrinks a little = "wrapping up".

**Comparison with originals (two YouTube lyric kinetic-type reposts captured this time, 30fps)**: fully static adjacent frames are only 10.3% (DISCORD) / 21.2% (Charlie Puth), so the picture is moving 70–80% of the time — the exact opposite of storytime's 71% stillness; big visual events (peaks with >1.5% whole-screen change) average one every 0.66s / 0.83s, close to **one per beat** (the two songs are about 105 / 99 BPM, a beat being 0.57 / 0.60s). The demo's density of big events is one per eighth note (0.25s), twice as dense as the lyric videos — fine for an explainer opener, but long films should go to one per beat.

## ④ Transitions (the demo's 3 + 2 common ones)

1. **Zoom through**: the camera rushes into a shape on the previous screen (the coral circle of the "3"), whose color = the next screen's background; once it fills the screen, the next screen drops from 1.25× back to 1. The first 55% of the time zooms to 30× with `expoIn`, the last 45% settles with `expoOut`. `TRANSITIONS.fillZoom` (called zoomThrough during the experiment, renamed when folded into the library to avoid clashing with 3b1b's camera zoom-through), parameters `cx, cy, k, maxZoom, fill`.
2. **Band wipe (bands)**: three slanted color bands (yellow → white → navy) relay across from left to right, staggered 12%, the last one being the new image's background color, with the new image revealed behind the bands. 0.5s `expoInOut`. `TRANSITIONS.bands`.
3. **Push**: old and new translate together, like sliding along a long canvas to the next panel. 0.35s `expoInOut`. `TRANSITIONS.push`.
4. **Mask wipe**: a shape (circle, rectangular strip, the word itself) grows from small as a mask to reveal the new image. The skill's existing `iris` works.
5. **Word morph / word as transition**: a word from the previous screen enlarges into a full-screen color block, or a word flies off-screen taking the old image with it.

**Syncing trick (the most valuable lesson this time)**: in the engine a transition starts at the new segment's `t0`, so for the frame where "the new image is revealed" to land exactly on the bar line, the segment start = **bar line − the transition's reveal point × the transition's duration**. Demo: fillZoom reveal point p=0.55, duration 0.45 → start 1.75 (revealed at 2.00); bands reveal point ≈0.6, 0.5s → start 3.70; push uses expoInOut, and the eye's sense of "in place" is the moment of 90% displacement (p≈0.58), not p=1 → start 5.80 (the first version computed the start from p=1 as 5.65, and the review measured "the push finishes 8 frames before the downbeat"). All landing points within shots are also written as beat numbers `KT.b(n)`, not seconds.

## ⑤ Rhythm and text

- **120 BPM, 4 bars + 1 closing beat (8.5s), one shot per bar** (title / stage one / stage two / stage three), and within each shot: beat 1 the main word slams (+ giant background stage number), beat 1.5 the evidence object, beat 2 the supporting line, beat 3 the evidence object's action, beat 3.5 key-word enlargement + highlight, beat 4 breathing room or exit; finally beat 16 (8.0s) a closing hit, then hold for 0.5s. All four shots use the same beat positions, changing only left/right and content — from the second shot on, the audience "knows where the next hit is", which is exactly where the sense of rhythm comes from.
- **Main words land on strong beats (beat one of each bar)**, with a low-frequency impact; small elements land on eighth notes with a pop; a rising noise 0.3s before each transition carries the ear into the next bar.
- Every visual landing point has a sound, and every accent has a visual — the demo's sound-effect table is in `build_y5.py` in the experiment archive (not included in the skill), matching the beat numbers in `scenes/*.js` one to one.
- **Hold long enough to read**: the lower bound given by English video-text guidelines is 13 characters per second (SSW); no first-hand standard was found for Chinese, so the subtitle industry's rule-of-thumb upper bound of 7–9 characters per second is used (unverified, treat as a rule of thumb). A 2-character main word holds at least 0.5s, a 7–8-character supporting line at least 1.0s.
- When syncing with narration: main word = the stressed word in the narration, **picture early rather than late, at most 1 frame early** — people are much more sensitive to "sound before picture" than "sound after picture" (the broadcast A/V sync tolerance EBU R37 is sound leading ≤40ms, lagging ≤60ms).

## ⑥ Implementation notes

> After being folded into the skill (2026-10-04 v0.4): the general functions under "newly written" in this card have been unified into `scripts/engine/lib/` (names changed to the unified MO / CAM / DG / TY / CH / UI / CL / TOON); the demo film's own code is in `scripts/engine/demos/y5_kinetic_type/`. For a library quick reference and "how to choose a grammar for a piece of narration", see `references/09-video-animation-grammars.md`.

- **Reused from the skill**: the engine (segment table, the two layers of old and new during transitions, `renderFrame`), `render.py`, `U.clamp / lerp / rng`; `PAINT` isn't needed (this style uses no textures).
- **Engine changes (merged into the skill engine)**: `window.BPM` is configurable (default 128, this film 120); any segment can specify `dur` in seconds; transitions can turn off `punch:0` (this film uses its own beat micro-punch, hitting on the beat rather than at the start of a transition).
- **Newly written, now unified into the library** (`lib/motion.js` / `typo.js` / `camera.js`, transitions into `transitions.js`):
  - Easing: `expoOut / expoIn / expoInOut / quintOut / backOut(p, s) / spring(t, freq, decay) / settle(t, amp, freq, decay)`.
  - Text: `TY.text` (scale and rotation around any pivot, stroke, tracking), `TY.width`, `TY.rise` (mask rise), `TY.pop` (pop), `TY.typed` (typing), `TY.marker` (slanted highlighter block), `TY.underline`.
  - Camera: `CAM.with(c, {x, y, z, r}, fn)`, `CAM.drift`.
  - Transitions: `fillZoom`, `bands`, `push`.
- **This film's `y5_kinetic_type/kinetic.js`**: `KT.b(n)` beat numbers, `KT.SZ` type scale, `KT.bump` beat micro-punch, `KT.slam` main-word slam, `KT.dots` dot grid, the progress track (drawn on the fixed `GLOBAL_OVERLAY` layer, its value determined only by whole-film time — the "continuous narrative anchor" usage from skill doc 02; the first version drew it inside each segment and it jumped along with the page during pushes), `KT.key / keyMarker` (the key word rises first, then enlarges and pins on the emphasis beat), `KT.bigNum` (giant background stage number), `KT.cam`.
- **CJK fonts**: the demo was made with four weights of Alibaba PuHuiTi 3.0 (Black/Heavy/Bold/Medium); for licensing reasons the open-source version substitutes Source Han Sans / Noto Sans SC 900/800/700/500, keeping the family names `PuHui-*`, with a full GB2312 subset (`scripts/font_subset.py --gb2312`), so changing the topic usually doesn't require redoing it.
- **Music (`build_y5.py` in the experiment archive, not included in the skill)**: numpy-synthesized drums (kick on every beat, clap on 2 and 4, hats on the offbeat) + bass (eighth notes on one root per bar) + event sound effects (main word = boom, small elements = pop, typing = click, checkmark = rising pop, before transitions = riser).

## ⑦ Representative works and primary references

- Saul Bass title sequence archive (Art of the Title): https://www.artofthetitle.com/designer/saul-bass/
- Wikipedia "Kinetic typography" (two kinds, motion typography / fluid typography; Bass as the feature-film pioneer): https://en.wikipedia.org/wiki/Kinetic_typography
- School of Motion *Kinetic Typography in After Effects* Part 2 (frame counts: small words slide in over 4 frames, main words swing in over 6 frames + 2 frames of overshoot settling, camera pushes 6 frames + 2 frames pulling back; "the camera should move a little late, as if pushed by the sound"): https://www.schoolofmotion.com/blog/kinetic-typography-after-effects-part-2
- School of Motion Part 3 (falls should accelerate, not ease to a stop; on impact the whole comp scales up and returns to 100%): https://schoolofmotion.com/blog/kinetic-typography-after-effects-part-3
- Dan Ebberts' inertial bounce expression (`amp·sin(2πft)/e^(decay·t)`, default freq 3 / decay 5): http://www.motionscript.com/articles/bounce-and-overshoot.html
- Lee, Forlizzi, Hudson, *The Kinetic Typography Engine* (UIST 2002, kinetic type expressing emotion and tone): https://dl.acm.org/doi/10.1145/571985.571997
- How long video text should stay on screen: https://www.ssw.com.au/rules/post-production-do-you-give-enough-time-to-read-texts-in-your-videos
- The two reposts measured this time: DISCORD [Kinetic Typography] https://www.bilibili.com/video/BV1ts411S7Xa ; Charlie Puth – We Don't Talk Anymore (Kinetic Typography) https://www.bilibili.com/video/BV1by4y1r74Y

## ⑧ The 3 easiest mistakes

1. **All words the same size, all moving together.** Without hierarchy there's no focal point, and the audience doesn't know what to read first. Main word to supporting line at least 3:1, with only one thing "entering" at any moment and everything else still.
2. **Words drifting the whole time.** Words can't move while being read (they won't sink in). Leave continuous motion to camera micro-drift, beat micro-punches and the background dot grid; a word pins down 0.35s after slamming in.
3. **Animation off the beat, or hitting on the start of a transition.** A transition's first frame isn't the accent; the frame where "the new image is revealed" is. Move the segment start earlier by "reveal point × duration", then write every landing point in the shot as a beat number; every extra landing point off the beat grid loosens the whole film a little more.

---

## Demo film

- Film: `scripts/engine/demos/y5_kinetic_type/` (render with `render.py --film demos/y5_kinetic_type`) (8.5s, 60fps, synthesized music at 120 BPM); one-frame-per-shot overview: `assets/animation-grammars/y5_kinetic_type_overview.jpg`
- Project: `scripts/engine/demos/y5_kinetic_type/` (`eras.js`, `kinetic.js`, `k1_title.js / k2_complete.js / k3_chat.js / k4_agent.js`), shared code in `scripts/engine/lib/`
- Shot list: K1 title "The ③ stages of AI writing code" → zoom through → K2 "Completion" (code card + gray completion text + Tab) → band wipe → K3 "Chat" (you say one sentence, it writes a whole block) → push → K4 "Agent" (three TODOs check themselves off) + the progress track filled

## Review fixes (independent agent watched only the finished film)

Review conclusion: "The opening 0–2s is textbook kinetic type; the '3' circle rushing into the camera and becoming the next section's background is the best design in the film", "A/V sync is nearly perfect; every visual event lands on the 120BPM grid on the same frame as the kick". There were 5 "must fix" items, handled as follows:
1. **Supporting lines hold too briefly** (0.6–0.9s) → supporting lines come in one beat earlier and are cut to 6–7 characters ("it completes the next line", "one sentence for a whole block", "you just say what you want"), giving 1.0–1.5s of reading time (stage 2 is still a bit tight, fine once there's narration in a real film); the whole film gained 0.5s.
2. **Stage 2's supporting line nearly hits the AI panel** (14px) → shorter line, right-aligned, gap >180px.
3. **The page push is 8 frames early and the progress track jumps along** → segment start recomputed from 90% displacement (5.80); the progress track moved to the fixed `GLOBAL_OVERLAY` layer, changing color on the reveal frame.
4. **The stage sections aren't kinetic enough** (numbers too small, key words only highlighted not enlarged) → added giant background stage numbers 1/2/3; key words enlarge to 1.35× on the emphasis beat.
5. **No closing hit at the end, and everything turns gray after the checks** → added the beat-16 closing hit (camera pulls out 6% + 3.5% impact + low end + high chime), checked items turn green instead of gray, and the content moved down 70px to fill the empty space at the bottom.
Also: the code card switched to a monospace font (Menlo).
Not adopted: "extend each section to 2.5–3s, making the film 10–11s" — the demo was required to be about 8 seconds, so fewer characters were used instead of more time.

## qa.py numbers (after review fixes, `uv run scripts/qa.py --project scripts/engine --film demos/y5_kinetic_type`)

| Segment | Motion% | Static frame pairs% | Jumps | Mean/peak ms | Deterministic |
|---|---|---|---|---|---|
| k1_title | 2.37 | 0.0 | 1 (t=1.63, title exit) | 1.0/1.6 | ✓ |
| k2_complete | 2.39 | 0.0 | 0 | 1.5/3.2 | ✓ |
| k3_chat | 2.59 | 0.0 | 1 (t=4.54, AI bubble growing) | 1.6/2.2 | ✓ |
| k4_agent | 2.88 | 0.0 | 3 (t=6.29 Agent + task card; t=8.00/8.04 closing hit) | 1.6/2.0 | ✓ |

Transition smoke test (whole-frame peak): fillZoom 6.8ms, bands 4.8ms, push 3.8ms. All 5 jumps were checked frame by frame and are intentional beat accents (QA docs: "intentional beat flashes don't count as errors"). Kinetic-type jumps should land on the beat — you can check jump times against the beat grid, and only the ones that don't match are bugs.
After the fixes, a frame-by-frame scan of all four edges: 0 frames showing black.
