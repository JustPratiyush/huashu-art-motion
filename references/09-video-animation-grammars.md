# 09 · Video animation grammars: 8 ways to draw YouTube explainer / tech / AI / finance films

Read this when making the "animation segments" of a narrated explainer film. It is the master index of the 8 grammar cards (`references/animation-grammars/`), the selection table, cross-grammar rules, a library quick reference, and the clip contract for narration pipelines.

All 8 grammars have demo films that render directly (`scripts/engine/demos/<grammar>/`; when brought in they were pixel-identical to the experiment originals; after `TY.charsIn`'s opacity was fixed on 2026-10-05, the y1 demo's title fades out over 0.55s as intended, so those 0.55s of frames differ from the original) and parameterized clips (`scripts/engine/clips/<grammar>.js`; feed it a JSON file and get a video of exact duration).

---

## 1. Overview

| Grammar | When to use | Core grammar in one sentence | Typical shot length | Main easing | Main transitions | Card | Demo |
|---|---|---|---|---|---|---|---|
| **y1 Kurzgesagt flat science** | Scale, "what's inside", mechanisms and systems; a calm, measured science voice | Draw the abstract concept as one concrete object in a glowing, infinitely zoomable world; the camera travels between scales; the environment moves gently, the subject changes at narration beats | Hard-cut shots 7–9s, visual unit changes every 4.6–6.7s | `MO.k75` = bezier(.75,0,.25,1); loops `MO.easyEase` | Dive into a lens `lensReveal`, fill then pull out `matchCut` (logarithmic camera push/pull) | `animation-grammars/y1_kurzgesagt.md` | `--film demos/y1_kurzgesagt` |
| **y2 Vox collage** | Arguments with real archives, news, screenshots, people; "look at this sentence", "notice this number" | The argument is laid out on a desk of real material, the camera moving across it like an investigative reporter's eye, lines and pens drawn on in stutters | Slow tier median 3.3s (a card 3–7s); fast tier 1.4–1.8s | Camera `MO.sineInOut` / long tail `MO.longTail`; elements step at 12fps | Hard cut, pan along the red line `same`, push until the photo fills → hard cut `cut` | `animation-grammars/y2_vox.md` | `--film demos/y2_vox` |
| **y3 Whiteboard (RSA)** | Chains of reasoning, steps, "why"; deriving as you talk | Say a sentence, write a sentence; the camera follows the argument across one big whiteboard and finally pulls out to the full picture | Median hold per block 6.6s | Pans on the board `MO.sineInOut` 1.2–2.4s; long jumps a 0.8s whip pan + motion blur | Same board `same` (the camera move is the transition), closing pull-out | `animation-grammars/y3_whiteboard.md` | `--film demos/y3_whiteboard` |
| **y4 Storytime character** | First-person stories, mishaps, jokes; the audience comes for "this person" | The narration is the star, the picture is reaction stickers for it: poses snap in 0.1s then freeze, and the punchline lands by cutting to a reaction close-up and shutting up | ASL 2.43s (median 1.87s) | Pose change `MO.expoOut` 0.1s + `MO.settle` squash-and-settle; character 24fps | Hard cut `cut`, smash `smash`, whip `whip`, jump-in | `animation-grammars/y4_storytime.md` | `--film demos/y4_storytime` |
| **y5 Kinetic type** | Lists, "X stages", punchlines, number openers, chapter cards | Words are the actors: key words slam in on accents, the main word is big enough to read at a glance, one focal point at a time | One shot per bar (about 2s at 120BPM) | `MO.expoOut` entrances, `MO.springHz` slams, faster exits with `MO.expoIn` | Rush into a color block `fillZoom`, bands `bands`, page push `push` | `animation-grammars/y5_kinetic_type.md` | `--film demos/y5_kinetic_type` |
| **t1 3Blue1Brown** | How a mechanism turns step by step into something else: networks, matrices, gradients, probability | On black, only the one thing being explained; Transform turns the previous concept directly into the next; color = concept name; almost no cuts | Single animation 1–3s + 1s hold; a concept 8–20s | `MO.smooth` (6t⁵−15t⁴+10t³), used almost everywhere | Continuation by Transform (no cut), camera zoom-through `zoomThrough`, `fadeShift` | `animation-grammars/t1_3b1b.md` | `--film demos/t1_3b1b` |
| **t2 Keynote UI** | Product/feature launches, version updates, tutorial steps, spec announcements | One thing per screen; the product screenshot or object is the protagonist and gets pushed into; nouns and numbers land when spoken; light-spot backgrounds and glass cards are optional packaging, use sparingly | A keynote screen 5–8s; fast product cuts 1.5–3s | `MO.spring` bounce 0–0.15, `MO.appleOut` | Blur push `blurPush`, card expand `expandRect` | `animation-grammars/t2_keynote_ui.md` | `--film demos/t2_keynote_ui` |
| **t3 Finance charts** | Revenue, stock prices, market share, turning points; numbers the audience will screenshot and nitpick | Build the axes first, then let the data grow, then label just one thing; values are always honest, animation only decides how they appear | One chart 2.5–6s | `MO.quintOut`, lines `MO.smooth` | Panel slide push `slidePush`, push into a detail `zoomThrough` (live + bScale0), hard cut with layout unchanged | `animation-grammars/t3_finance_chart.md` | `--film demos/t3_finance_chart` |

Overview images: `assets/animation-grammars/<grammar>_overview.jpg` (one frame per shot).

Demo commands (inside `scripts/`):

```sh
uv run --with playwright python engine/render.py --film demos/y1_kurzgesagt --out y1.mp4            # render a demo film
uv run scripts/qa.py --project scripts/engine --film demos/y1_kurzgesagt --out <dir>                # acceptance (run from the skill root)
# Preview: start a local server and open scripts/engine/index.html?film=demos/y1_kurzgesagt, then scrub the timeline
```

The demo films are all compressed to about 8 seconds, 2.5–3× the density of a real film's pacing, purely so the whole grammar can be seen in a demo. In real use, slow down to the shot lengths in the table above.

---

## 2. How to choose a grammar for a piece of narration

First look at what this piece of narration is doing, then choose how to draw it. One film can switch grammars between sections, but don't mix within a section.

| This piece of narration is… | Choose | Don't choose | Why |
|---|---|---|---|
| Explaining a concept or mechanism ("how a neural network…") | **t1 3b1b** (derivations, formulas) or **y1 Kurzgesagt** (scale, cuteness) | y2 (no real material to pin up; it becomes a fake archive) | Mechanisms are explained clearly through morphing and scale |
| Covering news, events, history, with screenshots and quotes | **y2 Vox** | y1 (flat cartoons dilute credibility) | The audience needs to see the source with their own eyes |
| Telling your own experience, mishaps, jokes | **y4 storytime** | t2 (it carries "good news" emotion) | The joke lives in the pause of the reaction shot |
| Lists, a few points, a few stages, one punchline | **y5 kinetic type** | t1 (no object to morph) | The information is structure, not imagery |
| Products, tutorial steps, features, specs | **t2 Keynote UI** (screenshots full-frame and pushed into; glass cards optional) | t1 (glass and light spots carry no logic, and vice versa) | One thing per screen; nouns and numbers are the protagonists |
| Numbers, growth, trends, comparisons | **t3 finance charts** | t2's big number (only when there's a single number) | You need axes and units, and it must withstand scrutiny |
| Deriving while talking, arguing step by step | **y3 whiteboard** | Whole-screen switches each time | Say a sentence, write a sentence; the pull-out at the end is the landing point |

Two fallbacks:
- Real screenshots to show → t2 (tutorials, clean) or y2 (arguments, evidential). Screenshots are the main image, as full-frame as possible, always scaled proportionally, never cropping key UI.
- Only one number in a section → no chart; use t2/y5's big-number count, landing at the moment the narration says the value.

---

## 3. Rules that hold across grammars

Rules distilled from the 8 cards that hold no matter which grammar you use. Sources follow each.

1. **The camera depends only on time; the scene is redrawn in vector for the camera.** Push/pull, pans and fly-throughs are all the same world canvas redrawn under different cameras, so even at 60× it doesn't blur; during a transition the previous shot keeps pushing its camera by time (`zoomThrough`'s `live:true`). (y1 ⑥ "Key architecture"; y3 ⑥; t1 ④-2)
2. **Zoom with logarithmic interpolation, and use enough magnification to pass through a circular opening.** `CAM.zlerp` zooms by the same factor every frame, whereas linear interpolation is slow then violent; to pass through an opening of radius r, the magnification must be ≥ the distance from the opening's center to the farthest screen corner / r (about 1100/r when centered, `CAM.coverZoom`). (y1 ⑧-2; t1 ④-2)
3. **Align the reveal frame to a beat or a narration word.** A transition is timed from the new segment's start, so to land the frame where the new image is revealed on the bar line: segment start = bar line − reveal point × transition duration (`MO.onBeat`). Numbers must land when the narration says the value: count start = moment the number is spoken − count duration. On a whiteboard, writing starts about 0.5s after the corresponding phrase. (y5 ④ "Syncing trick"; t2 ⑤; t3 ⑤; y3 ⑤)
4. **Structure first, then data, then annotation.** Axes appear first, data grows after, annotations last, one thing labeled per shot; 3b1b Writes the question before demonstrating; keynote goes eyebrow → product name → subtitle. (t3 ③; t1 ⑤; t2 ③)
5. **One focal point per screen.** Only one thing enters at a time, the rest is still; main word to supporting line at least 3:1; the background's saturation, contrast and line width are all one notch below the protagonist's. (y5 ⑧-1; t2 ⑤; y4 ⑧-2)
6. **Slow in, fast out, and hold once landed.** Entrances 0.3–0.4s, exits about 0.18s; hold at least 0.5s after a number lands, freeze ≥0.9s after a punchline, and 3b1b waits about 1s after every animation. (y5 ⑤; t3 ⑧-3; y4 ⑤; t1 ⑤)
7. **Move on events; give and take with the camera.** The camera moves only when the audience's eye needs to go somewhere new: transitions use slow pushes, pans and pull-outs (0.6–1.5 seconds, ease in and out, from measurements of Vox and 3b1b); fast pushes (18–32% closer in 0.28 seconds) and slams (0.17 seconds, 1.55→0.94→1.0) are only for reveals, twists and key numbers; after pushing in, pull out or pan away — never three pushes in a row. The same move on every shot is PowerPoint, whether a constant slow push (the Nobel literature film r2: "exactly like a PowerPoint being played") or a quick push on every shot (a 102-second Nobel economics short pushed in about 48 times: "far too many, and too fast, not smooth at all"). Slam numbers and big text onto objects in the film's world (screens, battery bars, price tags, blackboards) rather than a separate solid-color text card — in blind reviews such text cards, like white-background chart inserts, were read as "a PowerPoint page inserted". Ready-made in the engine: `CAM.track` (camera move table; no move specified means a slow push), `MO.slam` (element slam), duration constants in `MO.PULSE`; the highlight in parameterized clips t2, y1 and y2 defaults to a slow push, and only `"camera": "snap"` inside the spec's top-level `data` makes a fast push; there's no built-in constant slow push or breathing. The environment layer (Kurzgesagt's twinkling stars, particles) can keep moving gently; storytime is completely still 70% of the time, its life being snap + freeze. Art-style speedruns are another matter: the painting must always be alive (see doc 04). The move table, each grammar's camera baseline, and when counts matter are in `camera-language.md`. (y1 ③, ⑧-1; y4 ⑧-1; t2 ③)
8. **Two frame rates: smooth camera, stepped elements.** Vox's camera is smooth while paper pieces / highlighter / typing step on twos at 12fps; storytime characters at 24fps, camera at 60fps. All silky looks like a corporate promo; all stepped is nauseating. (y2 ③, ⑧-1; y4 ③)
9. **Color = concept, few accents.** One color per concept (W in the formula and the connections both blue); beyond 3–4 semantic colors nobody remembers them; Vox is black, paper white and one red; the whiteboard is black plus one orange. (t1 ⑧-3; t3 ⑧-2; y2 ⑧-3; y3 ⑧-3)
10. **Transitions go at breaths and topic changes, not mid-sentence.** Whip pans cut between two sentences, reaction shots sit in silence; whiteboard pans follow new points; Vox hard cuts follow sentence breaks. (y4 ⑤; y3 ⑤; y2 ④)
11. **Reviews must check logic and how numbers are stated, not just looks.** Real catches: "rose by 8.7×" should be "rose to 8.7×"; recounting from 0 after expanding to full screen; explaining the hidden layer but connecting it to pixels; multiples must be computable from the numbers on the chart. (t3 revision table; t2 revision table; t1 ⑥)
12. **Real material is the main image, kept as it is.** When you have screenshots, photos, footage or original text, show them full-frame or nearly so and push in to the part being discussed; code only explains, annotates and moves the camera (`MD.cover` full frame + focus + push, `MD.print` photo prints, `MD.label` torn-edge labels on black; t2's screenshot cards and y2's photos in parameterized clips default to full frame or 80–90% of the frame); screenshots scaled proportionally, never cropping key UI; data only changes "how it appears", never "how much it is"; bars always start at 0, and if an axis doesn't, say so; fictional data gets an "illustrative data" badge in every shot, and real data must never carry that badge. (t3 ②, ⑧-1; clip contract)

---

## 4. Library quick reference (`scripts/engine/lib/`, loaded by both index.html and clip.html)

| File | Namespace | What's in it |
|---|---|---|
| `motion.js` | `MO` | Camera move durations `PULSE` (transitions push/glide/pull, accents punch/pan/slam) / `slamK/slam` (slam 1.55→0.94→1.0) / `pulse` (move progress), `seg/at/anim/step` (12fps stepping), manim `smooth/thereAndBack/rushInto/rushFrom/doubleSmooth/wiggle/lagged`, `sineInOut/cubic*/quart/quint/expo*/backOut/elasticOut`, `bezier` and `appleOut/emphasized/k75/easyEase/longTail`, SwiftUI `spring/smoothSpring/snappy/bouncy`, `springHz/settle`, `float`, `invert` (inverse easing lookup), `beat/onBeat` (beat alignment). Canvas size `U.setStage/onStage` is in `util.js` |
| `camera.js` | `CAM` | `apply/with`, `toScreen/toWorld`, `zlerp` (logarithmic zoom), `coverZoom`, `anchor`, `pushTo` (push into a point, smoothly moving it to center or zooming in place), `at` (keyframes, panning along a path), **`track` (camera move table: `push` slow push (default) / `pull` pull out / `glide` find the next piece / `to` push to a given camera / `punch` fast push / `pan` fast move / `slam` whole-frame slam / `shake` camera shake / `cut` hard cut; the camera is computed from t only)**, `layer` (parallax), `velocity/motionBlur` (whip-pan blur), `drift` (handheld micro-drift, only for art styles and pure atmosphere shots) |
| `diagram.js` | `DG` | Point lists `cum/len/pointAt/drawPartial` (tracing stroke by stroke) / `xform/arcPts/ellipsePts/hand` (hand-drawn wobble) / `revealMask/zigzag` (Reveal), Transform `rectPts/circlePts/morph/shape`, color `mix/mixA/rgba`, 3b1b palette `MANIM` (already ×1.5 saturated) / `saturate`, `math/write` (manim Write: stroke first, then fill), `neuron/edgeEnds/edge/flash`, `indicate/circumscribe/brace`, whiteboard `board` (stroke timeline + pen sliding between strokes), `pen` (marker) |
| `typo.js` | `TY` | `text/width/font`, `wrap/fit` (line wrapping; `fit` shrinks the font until it truly fits: lines ≤ maxLines and each line's width measured, so even a single long English word doesn't overflow; with `soft:true` it returns `ok:false` when it can't fit so you can change approach, `balance:true` wraps into lines of equal length), `charsIn` (characters rising in one by one), `rise` (mask rise), `pop`, `blurIn` (emerging from blur), `typed/typedCount` (typing), `marker/underline`, `slam` (main-word slam), `keyword/keywordMarker` (key-word emphasis), `fmt/count/tabular` (rolling numbers and fixed-width digits) |
| `chart.js` | `CH` | `lin/ticks`, `grid/xLabels` (axes appear first), `bars` (growing from 0 + synchronized counting + highlight/gray out), `line/yAt`, `candles`, `callout` (dot → leader → text), `tag/demoBadge/frame` (Economist layout) |
| `ui.js` | `UI` | `mesh` (light-spot background), `grainTex`, `backdrop`, `shadow`, `glass` (frosted-glass card), `sheen` (light sweep), `persp` (pseudo-3D), `icon`, `rr/rrPath/scratch` |
| `collage.js` | `CL` | `paperTile/fillPaper` (paper texture), `tornEdge/tornRect` (torn edges), `halftone/photo` (halftone photos), `placed/shadowed/slideIn` (tilted slide-in that levels out), `tape/pin`, `stringPts/string` (red string), `highlight` (rough-edged highlighter), `stickerEdge` (cut-paper white border) |
| `media.js` | `MD` | Real material as the subject: `cover` (full-frame, focus `fx/fy`, push `z`, crop `crop`, `fit:'contain'` for the whole image uncropped), `toScreen` (a point/box on the material → screen coordinates), `focusFor/zoomFor` (how much to push in to a given area), `print` (photo print / Polaroid: white border, old-paper color, shadow, tape), `label` (torn-edge label on black, typed at 12fps), `frameAt` (frame from a frame sequence), `size`. Missing material always raises an error; it never draws a blank frame |
| `toon.js` | `TOON` | `flat` (two-tone facets), `glow/vgrad/circle/ellipse`, `bean` (bean character, only for demo films and grayscale previsualization, never in a final film; the y4 parameterized clip no longer calls it) with `LOOKS/look`, `POSES`, `poseAt` (pose-to-pose + settle), `blinkAt`, `alive`, `env/mouth` (lip sync from the envelope), `sweat/mark` |

Transitions are in the "YouTube explainer grammar transitions" section at the end of `transitions.js`: `same / lensReveal / matchCut / whip / smash / fillZoom / bands / push / zoomThrough / blurPush / expandRect / slidePush / fadeShift`, each with a one-line description and parameters. Hard cuts use the existing `cut`.

Small engine-related changes: portrait whole films via `render.py --film <name> --width 1080 --height 1920` (or write `window.FILM_SIZE = [1080, 1920]` in eras.js); the engine, transitions, camera and libraries compute from the current canvas, though the 35 art-style scenes have only ever been drawn in landscape; a segment's `clip` (video frame sequence) fills proportionally by default, or write `clipDraw(c, frame, lt, t)` to place it yourself (push, focus, photo print), and missing frames or images raise an error and refuse to render; segments can use `dur` (seconds) instead of `eighths`; `window.BPM` changes the tempo; explainer films write `window.PUNCH = 0` to turn off the beat punch (or set `punch` on a single transition); `window.SCENE_LIBS / SCENE_DIR` let a film keep its code in its own directory (that's how demos are organized).

**Old names from the experiments → current names** (for reading experiment-archive code): `YT.camAt→CAM.at`, `YT.camForAnchor→CAM.anchor`, `YT.apply/camera→CAM.apply/with` (camera fields `zoom/rot` became `z/r`), `YT.ease.*→MO.*`, `YT.spring(t,f,d)→MO.springHz`, `YT.textIn→TY.charsIn`, `YT.type→TY.typed`, `YT.partial→DG.drawPartial`, `YT.at→DG.pointAt`, `YT.circlePts→DG.ellipsePts`, `YT.paperTile/halftone/tornEdge→CL.*`, `YT.bean/POSES/mouth→TOON.*`, `MN.*→DG.*` (`lerpPts→morph`, `C→MANIM`, `FONT_RM→FONT.rm`), `GL.*→UI.*`, `MO.textIn→TY.blurIn`, `MO.count/fmt/tabular→TY.*`, `easeOutQuint/easeOutExpo→quintOut/expoOut`, transitions `k_lens→lensReveal`, `k_fill→matchCut`, `hardcut→cut`, y5's `zoomThrough→fillZoom` (it clashed with 3b1b's camera zoom-through).

Fonts: CJK sans uses `PuHui-Medium/Bold/Heavy/Black` throughout (the open-source version is actually Source Han Sans / Noto Sans SC 500/700/800/900 with the family names kept; see `lib/fonts.js`), the whiteboard uses `LXGWWenKai-500`; both are subsets of all 6763 GB2312 characters, so changing topics usually doesn't require adding characters. Formulas `CMU-rm/it`, keynote `Inter`, finance numbers `RobotoCondensed`. Source Han Sans/Serif `NotoSansSC/NotoSerifSC` contain only the characters used by three demo films; don't use them for new content.

---

## 5. Clip contract (the "animation segments" for narration pipelines)

A narration video pipeline (whichever one you use) calls these 8 grammars for animation segments at suitable points, acting as the director that chooses the grammar and computes cues from word-level narration timestamps. This section is the agreement between the two sides.

### Entry points

**In a narration pipeline, wrap these in a script rather than typing the commands below by hand**: draft fixes durations from the film timeline and produces the word list and draft spec → render resolves words, calls this section's render.py, counts frames, swaps the clip into the edit project, and freezes it → verify checks sync frame by frame per chapter. That's how the author's own pipeline is hooked up (that part isn't open-sourced with this repository). Below is the engine's own interface.

```sh
cd <skill>/scripts
uv run --with playwright python engine/render.py --spec clip.json --out clip.mp4              # silent H.264 yuv420p
uv run --with playwright python engine/render.py --spec clip.json --alpha --out clip.mov      # ProRes 4444 with transparency (no background, for pipeline layering)
uv run --with playwright python engine/render.py --spec clip.json --stills 0.5,2,4 --out stills/   # sample stills to check
# Preview: open scripts/engine/clip.html?spec=examples/t3_finance_chart.json from a local server and scrub the timeline
```

- Duration exactly equals `duration`: frame count = round(duration × fps), frame i's time is i / fps. H.264 with one keyframe per second (GOP = fps), so a pipeline renderer seeking by seconds never freezes a frame.
- **A single clip can carry at most 8 seconds.** When `duration` exceeds 8 seconds, render.py prints a prominent warning at the start and at the end, without an error (narration pipelines have legitimate long clips). A clip stretched too long reads as a PowerPoint page: one layout throughout, points piling up, a background dead from start to finish. Split a film into multiple shots, one spec (or one scenes segment) per shot, with shots changing composition but not art style (the same theme, at most 2 grammars), then join them (SKILL.md rail tier steps 3–4, `references/shot-list-template.md`). Some sample specs are 8.5–10 seconds; they demonstrate how to write a segment, not the length of a film.
- **One palette for the whole film: `theme`.** Every spec in a film uses the same `"theme"`: a palette name `paper`, `poster`, `ink`, `navy`, `bauhaus`, `snow`, `wood`, `chalk` (values in `references/palettes.md`), or an object `{"name": "wood", "accent": "#B8452A"}` changing just one or two keys, or all 6 keys `{bg, surface, ink, sub, accent, accent2}`. A misspelled name, an object missing keys (with no name), or a color value that isn't #hex → fails to start. Grammars given a theme don't draw large gradient backgrounds or neon glows, and all supporting colors are derived from these 6. Without a theme, each grammar uses its own default (y1 defaults to flat dark ink, no longer a deep-purple starry sky). t3 also accepts the old `"light"` and `"dark"` and its own theme object; `"paper"` now means the paper palette.
- Width, height and fps are read from the spec, defaulting to 1920×1080@30; for portrait write `width: 1080, height: 1920` (or override the spec on the command line with `--width 1080 --height 1920`); every grammar has a portrait layout.
- Asset paths in a spec are relative to the spec file (absolute paths also work); render.py serves only the files named in the spec. These fields are recognized: `cues[].image`, `cues[].frames` (footage frame sequence: a directory or an array of paths), `data.image`, `data.character` (the y4 frame-library directory). See `engine/spec_assets.py` for how paths are resolved.
- Measure this clip: `uv run qa.py --spec <clip.json>` (inside `scripts/`; measures the whole clip as one segment for determinism, motion, static frame pairs, isolated jumps and timing, scaled for portrait; monotonic, smooth push/pull, pans and slams within 2 seconds are recorded as camera events, not jumps).
- Delivery: `uv run deliver.py clip.mp4 --spec <clip.json> --out output/`. It first passes the gate `film_gate.py` (fast-motion frame ratio < 0.035 is red; an empty frame lasting 0.3 seconds or more mid-clip is red, however short the clip; nothing copied, non-zero exit), and only then copies it and writes `delivery-notes.md`, with the facts section written by the script. The gate was calibrated on 1–2 minute films, and the numbers are noisy for clips under 10 seconds; for clips that will be joined into a film, run deliver.py on the film.
- Page errors (a grammar file error, a missing image or video frame) → non-zero exit, no film. `qa.py --spec` and render.py share the same asset resolution (`engine/spec_assets.py`), recognizing both `frames` and character frame libraries. Characters in a spec that aren't in the font subset only produce a warning (they fall back to a system font, which looks different on another machine); common characters are all in the subset.

### spec

```json
{
  "grammar": "t3_finance_chart",          // one of 8: t1_3b1b | t2_keynote_ui | t3_finance_chart | y1_kurzgesagt | y2_vox | y3_whiteboard | y4_storytime | y5_kinetic_type
  "duration": 7, "fps": 30, "width": 1920, "height": 1080,
  "safe": { "top": 0, "bottom": 520 },     // optional: edges to keep clear (px), see below
  "alpha": false,                          // optional: true = no background (render.py --alpha sets it automatically)
  "theme": "wood",                         // the same for every spec in a film: palette name or object, see "One palette for the whole film" above
  "data": { ... },                        // grammar-level parameters; each grammar's accepted fields are in the "data" line of its section below; unknown fields are ignored
  "cues": [ { "at": 1.2, "kind": "bar", "text": "...", "sub": "...", "data": { ... }, "image": "screenshot.png", "dur": 1.0 } ]
}
```

**Common cue fields** (which ones each grammar accepts are listed in its section below):

| Field | Meaning |
|---|---|
| `at` | Seconds, required. "The reveal frame": the element is first visible on the frame at t = at (its animation starts computing from the frame before). Exception: for `number`, at is the moment the number **lands**. Cues don't need to be in time order; clip.js sorts them; cues with at beyond duration are dropped with a warning (invisible, taking no layout space). |
| `kind` | Required. **A kind this grammar doesn't recognize raises no error and draws nothing** — write against the tables below. |
| `text` | Main text: title, point, label, the original words of a bubble, the big text of an insert shot. |
| `sub` | Secondary text: t2 card description, y5 supporting line, the short sentence actually shown in a y4 bubble, the line he types in a y4 insert shot. |
| `image` | Image path, relative to the spec file (absolute paths, `data:` and `http(s):` also work). Missing file → refuses to render. |
| `frames` / `fps` / `loop` | Footage frame sequence (accepted by t2's screenshot cards and y2's photos): a directory (png/jpg/webp sorted by filename) or an array of paths; plays from at at `fps` (default 30), stopping on the last frame, or looping with `loop: true`. Layout follows the first frame. Missing frames → refuses to render. |
| `data` | This cue's own parameters (`index`, `rect`, `icon`…), see each section. |
| `dur` | Read only by a few kinds: t1's title/point/equation/line, t3's bar/line/candle, y1's enter, y4's react/insert. Other kinds ignore it. |

**`safe`**: `{top, bottom, left, right, fill?}` (px, default 0). clip.js passes it to the grammar along with the cleared content box `ctx.box = {x, y, w, h}`; `fill` is an optional color, and after rendering the cleared edges are painted with it (in portrait films this makes the chart a "card" with the same position and background as an adjacent contained screenshot; not painted with `--alpha`). **All 8 grammars handle `top` / `bottom`** (each grammar object sets `safe: true`, and content is laid out only between top..H−bottom: t3's axes and source line, y2's camera zoom and image center, the layouts of t1/t2/y1/y3/y5, y4's bubbles and the big text of insert shots); **no grammar lays out according to `left` / `right` yet** — they are only painted by `fill`, and content still runs to the edges. In 1080×1920 portrait narrated films the subtitle band is about 1400–1520, so `bottom` is 490–570; in landscape `bottom` is usually 160–220. For a new grammar to support safe, follow t3: add `safe.top` to the layout's vertical baseline and subtract `safe.bottom` from bottom elements, or lay out directly by `ctx.box`, then set `safe: true` in the grammar object (if it isn't set and the spec provides safe, clip.js will console.warn).

**How `number` (big number) is specified** — only t2, t3 and y5 recognize it; the other 5 don't display it:

| Item | Rule |
|---|---|
| Value | `data.value` (a number, may be negative; 0 if omitted). Rolls from 0 to value (expoOut, fast then slow); negatives use a true minus sign "−", and the integer part gets thousands separators automatically. |
| Format | `data.prefix` (e.g., `"¥"`), `data.suffix` (e.g., `"%"`, `" ×"`; write the space yourself if you want one), `data.decimals` (default **0**; t3's `spec.data.decimals` only governs bar labels and **number doesn't inherit it** — write it again in the cue if you want decimals). |
| Caption | Any of `text`, `sub` or `data.text` works; clip.js unifies them. |
| Small label | `data.label`: t2 draws it above the number, y5 at the top left of the page; t3 doesn't draw it. |
| Timing | `at` = the moment the number lands. t2 and t3 start rolling at at−0.9s; y5 changes page and starts rolling at at−0.7s. So a number's at should be at least 0.9 (0.7 for y5), otherwise it has already rolled most of the way at frame 0. |
| Position | t2: its own screen, with the previous screen starting to exit at at−0.9s, not overlaid on a card; t3: a dedicated strip above the chart area, right-aligned, with the caption to the left of the number; y5: its own page. |

### Cues each grammar accepts

The first line of each section below is the spec-level `data`; the table lists cues. The "minimal spec" is the least you can write to render a decent-looking segment — copy the structure and replace the content for your topic; the first cue is always a visual event, not a title.

#### t1_3b1b (3b1b / manim explanations: formulas, curves, points)

Spec-level data: none.

| kind | Fields | Notes | Example |
|---|---|---|---|
| `title` | `text`, `data.color`, `dur` | Written from at; when another title comes, the old title moves up and fades; if too long, the font shrinks first, then wraps to two lines. Don't use it as an opener; show the object on the first frame | `{"at":4,"kind":"title","text":"Attention is a weighted average"}` |
| `equation` | `data.tokens` or `text`, `dur` (1.2s for the first, 1.5s after) | token: `{s, it?, col?, gap?, sub?, sup?, size?}`; `col` takes a manim color name (`BLUE_C` `YELLOW` `GREEN_C` `TEAL_C` `RED_C`…) or #hex. With only text, it's split automatically: single letters italic, runs of letters (softmax) upright. From the second one on, it Transforms from the previous | `{"at":1,"kind":"equation","text":"softmax(QK)V"}` |
| `point` | `text`, `dur` | One line Written per sentence; older ones turn gray when a new one appears. When it doesn't fit, the curve makes room first (portrait 50%→30%), then the font shrinks (≥0.6×), and if still not enough the whole block scrolls up as each new point appears, fading out the earliest (with a warning) | `{"at":3,"kind":"point","text":"First compute similarity"}` |
| `line` | `data.values` (evenly spaced y) or `data.points` (`[[x,y],…]`), `text` = curve label, `data.color`, `dur` | The axes are Created first, then the curve is drawn; from the second line on, it morphs from the previous one. With a line, landscape puts text left and chart right; portrait puts chart on top and text below | `{"at":2,"kind":"line","text":"Loss","data":{"values":[9,5,3,2,1.5]}}` |
| `highlight` | `data.index` (which point, from 0, default the latest) or `data.target:"equation"` | Indicate + a yellow box that stays | `{"at":5,"kind":"highlight","data":{"index":0}}` |

Minimal spec:
```json
{"grammar":"t1_3b1b","duration":6,"cues":[
  {"at":0,"kind":"line","text":"Weight of each word","data":{"values":[1,2,7,2,1]}},
  {"at":1.6,"kind":"equation","text":"softmax(QK)V"},
  {"at":3.4,"kind":"point","text":"More similar words weigh more"},
  {"at":4.6,"kind":"highlight","data":{"target":"equation"}}]}
```

#### t2_keynote_ui (keynote interface: feature cards, screenshot cards, big numbers)

Spec-level data: `eyebrow` (small text above the title), `title`, `subtitle`, `accent` (accent color, default `#3d6bff`), `frame` (screenshot card packaging: default `"full"` full-frame; `"glass"` is the old frosted-glass card, optional, use sparingly).

| kind | Fields | Notes | Example |
|---|---|---|---|
| `title` | `text`/`sub` override data.title/subtitle | Emerges from blur starting at at. Don't use it as an opener; lead with a screenshot or number | `{"at":5,"kind":"title"}` |
| `card` / `step` / `image` (synonyms) | `text` card title, `sub` description, `image` screenshot; `data.step` sets the number; cards without images can add `data.icon` (`wave memory agent clock phone layers chart code check play bolt lock`) and `data.value/prefix/suffix/decimals/label` (a count on the card) | With an image (default `frame:"full"`): one per screen, the screenshot spread full-frame (proportional, uncropped; `data.fit:"cover"` crops to fill around `data.focus:[fx,fy]`), surrounded by a darkened, blurred copy of the same image; `text`/`sub` become a torn-edge label on black at bottom left; it hard-cuts in on the at frame (a light 0.17s slam), and if the previous screen was also a full-frame screenshot, it pans across at the same zoom in 0.30s. `data.frame:"glass"` uses the old glass card. Also accepts `frames` (screen-recording frames). Without images: up to 3 consecutive cards side by side on one screen | `{"at":2,"kind":"card","text":"One sentence to an image","sub":"No prompt writing","data":{"icon":"bolt"}}` |
| `highlight` | `data.rect=[x,y,w,h]` (relative to the screenshot 0..1), `text` optional label, `data.fill` (fraction of the frame the box takes after pushing in, default 0.42) | Boxes a part of the current screenshot and darkens the rest; in full-frame mode the camera pushes over at the same time (at least 18% closer, at most 2.6×; slow push 0.9s by default, top-level `data.camera:"snap"` for a 0.28s fast push), and the next highlight on the same image moves over (0.7s by default, snap 0.30s) | `{"at":5,"kind":"highlight","data":{"rect":[0.6,0.2,0.2,0.1]}}` |
| `number` | See the number spec above; `data.over: true` | Its own screen. With `data.over: true` and a full-frame screenshot on the previous screen: no new screen — the camera pulls back to the whole screenshot, the screenshot darkens, and the number slams on top and counts — use it when the number is about this screenshot, rather than cutting to a light-spot background | `{"at":4,"kind":"number","text":"Monthly active users","data":{"value":120,"suffix":"M"}}` |

Minimal spec:
```json
{"grammar":"t2_keynote_ui","duration":6,"cues":[
  {"at":0.9,"kind":"number","text":"Monthly active users","data":{"value":120,"suffix":"M"}},
  {"at":2.4,"kind":"card","text":"Voice input","sub":"Speech turns into text","data":{"icon":"wave"}},
  {"at":3.6,"kind":"card","text":"Long-term memory","sub":"Remembers what you said","data":{"icon":"memory"}}]}
```
This is how to write it without screenshots. With product screenshots, lead with a screenshot card (`{"at":0,"kind":"card","image":"screenshot.png","text":"…"}`, see `examples/t2_keynote_ui.json`; two real screenshots full-frame + push + pan, see `examples/t2_fullbleed_pulse.json`).

#### t3_finance_chart (Economist-style data charts)

Spec-level data: `title`, `unit` (subtitle: metric and unit; if it doesn't fit, shrinks first then wraps to two lines), `source` (source at bottom left; same, and keeps clear of the bottom-right badge), `badge?` (the bottom-right badge is drawn only if given, e.g., "Illustrative data"; don't use it for real data), `chart: "bar"|"line"|"candle"`, `series: [{label, value, color?}]` or candles `[{label, o, h, l, c}]`, `decimals` (bar/point labels, default 1), `prefix`, `suffix`, `highlight: {index, text, sub}`, `colors: {main, accent, dim}`, `upDown: "cn"` (red up, green down; default) `|"us"`, `xAxis: "category"|"time"` (bars default to category with every bar labeled; lines/candles default to time with labels thinned), `theme` (may also be the spec-level `theme`): `"light"` (white background, default) `|"dark"` (dark background, light text), the eight palette names (`"paper"` now means the paper palette) or `{bg, ink, sub, grid, bar, dim, red…}`; with no theme but `safe.fill` set to the film's background color, the chart background uses it, switching automatically to light text on dark.

**Chart shots stay in the film's world**: the chart's background is in the same color family as the shots around it (dark films use `theme:"dark"` or put the film's background color in `safe.fill`); don't suddenly cut to a white report page in a night scene or dark film; better still, draw the chart on an object in the film's world — render a transparent clip with `--alpha` and put it on a screen, blackboard or sheet of paper in the film.

| kind | Fields | Notes | Example |
|---|---|---|---|
| `title` | — | The moment the layout (title, subtitle, source) appears. Optional: if omitted, the layout appears at second 0 with the axes | `{"at":0,"kind":"title"}` |
| `bar` / `line` / `candle` | `dur` (default by count); bar charts can have multiple bar cues, each with `data.index` (number or array) = these bars grow only at this moment | Axes → data grows. Bars always start at 0; when a line/candle y-axis doesn't start at 0, the subtitle automatically adds "y-axis does not start at 0"; values of negative bars go below the bar bottom, with annotations going downward; category names that don't fit shrink first, then stagger into two rows, and the annotated bar always keeps its name; tick decimals follow the step | `{"at":1.2,"kind":"bar"}` |
| `highlight` | `text`/`sub` override data.highlight, `data.index` which bar | On the at frame the annotation dot pops, with leader + text; if a diagonal placement would cover other bars or values it goes directly above this bar, adding a tick level automatically if there's no room on top | `{"at":4,"kind":"highlight","data":{"index":2},"text":"Highest"}` |
| `number` | See the number spec above | A dedicated strip above the chart area, never covering the line's head | `{"at":5,"kind":"number","text":"Latest close","data":{"value":259.97,"prefix":"$","decimals":2}}` |

Minimal spec:
```json
{"grammar":"t3_finance_chart","duration":6,"data":{"title":"R&D spending at three companies","unit":"2024, $100M","source":"Source: illustrative data","badge":"Illustrative data","chart":"bar",
  "series":[{"label":"A","value":120},{"label":"B","value":86},{"label":"C","value":43}]},"cues":[
  {"at":0.3,"kind":"bar"},{"at":3.5,"kind":"highlight","data":{"index":0},"text":"Most"}]}
```

#### y1_kurzgesagt (flat science: central object + satellite nodes + scale travel)

Spec-level data: `center` (name of the first layer's central object), `center_style: {color, shape: "circle"|"rounded"|"hex"|"diamond", ring: true}` (if omitted, a neutral style is generated from the name: color and shape determined by the text, same name same style, no orbit ring), `image` (crops an image into the central object, moving the name to a capsule below), `flow: true` (nodes strung into a chain with a signal flowing through them in order and numbered, for explaining "sequence"). The environment layer (twinkling stars, particles, signal pulses) keeps moving gently; the central object, nodes and labels hold once landed, and the camera doesn't slow-push.

| kind | Fields | Notes | Example |
|---|---|---|---|
| `title` | `text` | Title at top rising character by character; fades out over 0.5s starting at the first highlight or enter's at. Don't use it as an opener; show nodes on the first frame | `{"at":1,"kind":"title","text":"What happens in one search"}` |
| `point` | `text`, `data.color` | A satellite node of the current layer + label capsule. ≤3 arranged over the upper half circle, ≥4 all the way around. Labels are clamped inside the frame for the current camera; long labels shrink first | `{"at":1.4,"kind":"point","text":"Tokenize"}` |
| `highlight` | `data.index` (counts only the current layer's points, from 0, default the latest) | Pushes in to that node (about 30%; slow push 0.9s by default, top-level `data.camera:"snap"` for a 0.28s fast push), dimming the rest; when already pushed in, the next highlight moves over at the same zoom | `{"at":5,"kind":"highlight","data":{"index":1}}` |
| `enter` | `data.index` (which node to dive into, default the latest), `text` (name of the new center, default the node's name), `data.style` (center_style of the new central object), `dur` (default 1.6) | Scale travel: starts pushing on the at frame, the screen is filled with one color at about at+0.55×dur and switches to the new layer, and the new central object is fully pulled out by at+dur; later points belong to the new layer (write the first new point's at after at+dur) | `{"at":4,"kind":"enter","data":{"index":0},"text":"Tokenizer"}` |

Minimal spec:
```json
{"grammar":"y1_kurzgesagt","duration":6,"data":{"center":"Search engine"},"cues":[
  {"at":0.3,"kind":"point","text":"Crawl"},{"at":1.1,"kind":"point","text":"Index"},
  {"at":2.2,"kind":"enter","data":{"index":1},"text":"Inverted index"},
  {"at":4.2,"kind":"point","text":"Word → pages"}]}
```

#### y2_vox (collage desk: screenshots, clippings, red string, highlighter)

Spec-level data: none.

| kind | Fields | Notes | Example |
|---|---|---|---|
| `image` / `clip` (synonyms) | `image` or `frames` (footage frames), `text` = torn-edge label on black pressed into the bottom left (typed at 12fps), `data.halftone: true` converts to grayscale halftone, `data.fit:"cover"` + `data.focus` + `data.aspect` crop to fill around a focus | Slides onto the desk from at; a photo print (white border, old-paper color, shadow, tape), proportional and uncropped by default. When the camera rests on one, it takes 80–90% of the frame. Landscape lays out left → right, portrait top → bottom; the red string is traced out first, and the camera pans over 0.30s before at | `{"at":1,"kind":"image","image":"screenshot.png","text":"Homepage"}` |
| `title` | `text` (empty or whitespace-only text warns and is skipped) | A label bar with white text on black, typed at 13 characters per second. Suited to a closing statement of the point, not an opener | `{"at":5,"kind":"title","text":"Three leads in this story"}` |
| `point` | `text` | A lined index card, typed (short intervals speed it up to at most 40 characters per second) | `{"at":4,"kind":"point","text":"Released a day before the announcement"}` |
| `highlight` | `data.rect=[x,y,w,h]` (relative to **the current image** 0..1; with `fit:"cover"`, relative to the cropped view) | Highlighter sweep → red circle → camera pushes in (slow push 0.9s by default, top-level `data.camera:"snap"` for a 0.28s fast push; if the box starts off-screen the camera moves first, arriving the frame before at). Eyeballed rects are often off by 20–30%; check with `--stills` first | `{"at":2.5,"kind":"highlight","data":{"rect":[0.1,0.2,0.3,0.1]}}` |

Minimal spec (y2 needs real material: if you have no screenshots, photos or original text to pin up, don't choose y2 — see section 2):
```json
{"grammar":"y2_vox","duration":6,"cues":[
  {"at":0,"kind":"image","image":"screenshot.png","text":"Official announcement"},
  {"at":1.6,"kind":"highlight","data":{"rect":[0.1,0.2,0.3,0.1]}},
  {"at":4,"kind":"point","text":"Two weeks later the price changed"}]}
```

#### y3_whiteboard (hand-drawn whiteboard: say a sentence, write a sentence; icons; circling key points)

Spec-level data: none.

| kind | Fields | Notes | Example |
|---|---|---|---|
| `title` | `text` | Starts at 7.5 characters per second, speeding up automatically if it can't finish before the next cue. Don't use it as an opener; draw the first stroke first | `{"at":4,"kind":"title","text":"Why write tests"}` |
| `point` | `text` | Draws a small circle as a bullet first, then writes, starting at 16 characters per second | `{"at":1.5,"kind":"point","text":"Someone watches your back when you change code"}` |
| `draw` | `data.icon` (`person cat network doc chat bulb check cross screen stack gear target clock chart`; a typo warns and only writes the caption), `text` = caption under the icon (shrinks first if it doesn't fit), `data.arrow: false` for no arrow | Placed beside the line just written; consecutive draws are linked with orange arrows | `{"at":2.5,"kind":"draw","text":"Automatic checks","data":{"icon":"check"}}` |
| `image` | `image` | Zigzag reveal + hand-drawn frame, proportional and uncropped | `{"at":4,"kind":"image","image":"sketch.png"}` |
| `highlight` | `data.index` (which one, from 0), `data.target`: `"title"` / `"draw"` / `"image"` (counts points by default), `data.style: "underline"` | An orange circle or underline; without index = the latest one written | `{"at":5,"kind":"highlight","data":{"index":0,"style":"underline"}}` |

Minimal spec:
```json
{"grammar":"y3_whiteboard","duration":6,"cues":[
  {"at":0,"kind":"draw","text":"Automatic checks","data":{"icon":"check"}},
  {"at":1.4,"kind":"point","text":"Someone watches your code"},
  {"at":3.0,"kind":"draw","text":"Refactor with confidence","data":{"icon":"gear"}},
  {"at":4.6,"kind":"highlight","data":{"target":"draw","index":0}}]}
```

#### y4_storytime (character storytelling: bubbles, reaction close-ups, insert shots)

Spec-level data: `character` — **must be your own frame library** (AI-generated frames, see `references/10-characters.md`; the delivery bar is in `references/character-detail.md`); the code-drawn presets (`neutral`/`bun`/`author`) and look objects are retired, and writing them or omitting the field both fail to start. If you have no image-generation capability, don't use y4; switch to y2/y5 or scenes told with hands and objects. A frame library is a directory (render.py uses each filename without extension as the pose name: `rest talk point shrug type stiff react back`, with `<pose>_open` as the mouth-open frame), or `{"frames": {"talk": "me/talk.png", …}}`; frames have transparent backgrounds with the feet at the middle of the bottom edge, and at least rest or talk must exist. The camera holds and the character doesn't breathe; change comes from snaps, reaction close-ups slamming in, and insert shots. With `window.VO_ENV` the mouth follows the narration envelope; without it, it's synthesized from text length. safe only moves text (bubbles, big text in insert shots); the character, desk and reaction-close-up face are graphics and will extend into the subtitle band in portrait — subtitles over the body are still readable, but don't expect them to move aside.

| kind | Fields | Notes | Example |
|---|---|---|---|
| `point` / `title` (synonyms) | `text` = the original narration (sets how long the mouth talks; ≈6.5 Chinese characters per second, or about 15 Latin letters per second), `sub` = the short sentence actually shown in the bubble (ideally a few words; text is shown only if sub is omitted), `data.pose`: `talk` / `point` / `shrug` / `type` | The bubble pops and the mouth starts moving on the at frame | `{"at":0.1,"kind":"point","text":"I asked it to fix one typo,","sub":"Just one typo"}` |
| `highlight` | `data.mark` (default "?") | "?" or "!" pops + worried shrug | `{"at":4,"kind":"highlight","data":{"mark":"!"}}` |
| `react` | `dur` (counted from at, default until the next cue) | Jumps to a big reaction close-up: dead-fish eyes + sweat drop, without a word | `{"at":3,"kind":"react"}` |
| `insert` | `sub` = the line he types on the computer (wraps when long, at most 3 lines), `text` = the big text that slams in, `data.hit` (**absolute seconds**, default at+1.3, or at+0.4 without sub), `data.count` + `data.unit` (the counter at top right stops at this number on the hit), `data.app` (window title, default "AI Assistant"), `dur` (counted from at, default until the next cue) | Cuts to a close-up of the computer screen on the desk: typing → the reply scrolls like a wall of code, faster and faster → big text slams in | `{"at":2,"kind":"insert","sub":"Fix a typo","text":"Changed 40 files","data":{"hit":3.4}}` |

Minimal spec:
```json
{"grammar":"y4_storytime","duration":6,"data":{"character":"me/frames"},"cues":[
  {"at":0.1,"kind":"insert","sub":"Change \"its\" to \"it's\"","text":"Changed 40 files","data":{"hit":1.5}},
  {"at":2.6,"kind":"react"},
  {"at":4.0,"kind":"point","text":"I only asked it to change one word.","sub":"Just one word"}]}
```

#### y5_kinetic_type (kinetic type: one page per cue)

Spec-level data: `palette: [[background, text color], …]` (rotated page by page).

| kind | Fields | Notes | Example |
|---|---|---|---|
| `title` / `point` | `text` main word (shrinks automatically if too long, at most two lines), `sub` supporting line, `data.label` (small label at top left), `data.key` (the word in the supporting line to color), `data.num` (giant background number) | The main word slams in on the at frame; page changes are band wipes (starting 0.3s before at). Two or more points = a list: draws a progress track + giant background numbers | `{"at":1.8,"kind":"point","text":"Slow","sub":"One change at a time","data":{"label":"01","key":"One change"}}` |
| `number` | See the number spec above | A page with one big number | `{"at":4,"kind":"number","sub":"Pass rate on the first try","data":{"value":87.5,"decimals":1,"suffix":"%"}}` |
| `highlight` | `data.word` (a word in the main word; omit to brush the whole main word) | Highlighter + a quick enlargement; when the highlighter and text share a color (yellow text on a navy page), the text under the pen inverts to the background color. If word isn't in the main word, it warns and does nothing (use `data.key` for words in the supporting line) | `{"at":3,"kind":"highlight","data":{"word":"Slow"}}` |

Minimal spec:
```json
{"grammar":"y5_kinetic_type","duration":5,"cues":[
  {"at":0.7,"kind":"number","sub":"Pass rate on the first try","data":{"value":87.5,"decimals":1,"suffix":"%"}},
  {"at":2.2,"kind":"point","text":"Slow","sub":"One change at a time","data":{"key":"One change"}},
  {"at":3.6,"kind":"highlight","data":{"word":"Slow"}}]}
```

### Samples (`scripts/engine/examples/`)

```sh
cd <skill>/scripts
uv run --with playwright python engine/render.py --spec engine/examples/t3_finance_chart.json --out t3.mp4   # Nvidia revenue over five fiscal years (real 10-K data): bars grow in three steps, each on one word
uv run --with playwright python engine/render.py --spec engine/examples/t2_keynote_ui.json   --out t2.mp4   # Leads with a screenshot card + boxes a number, a portrait screenshot, then a big number
uv run --with playwright python engine/render.py --spec engine/examples/t1_3b1b.json         --out t1.mp4   # Gradient descent: the loss curve appears first, the formula morphs, the curve morphs
uv run --with playwright python engine/render.py --spec engine/examples/y2_vox.json          --out y2.mp4   # Opens with a screenshot pinned to the desk, highlighter + red circle + push, closing label states the point
uv run --with playwright python engine/render.py --spec engine/examples/y3_whiteboard.json   --out y3.mp4   # Whiteboard: draw first, then write, icons alternating with short lines, finally circling the first drawing
uv run --with playwright python engine/render.py --spec engine/examples/t2_fullbleed_pulse.json --out t2b.mp4   # Two real terminal screenshots full-frame: push to the timing, pan to the second, pull back to the whole screenshot and slam the number on top to finish (number's data.over)
# Also y1_kurzgesagt (a drop of seawater → diving into a diatom) / y4_storytime (opens on a screen close-up) / y5_kinetic_type (opens with a slammed number); add --width 1080 --height 1920 to any of them for portrait; sample assets are in examples/assets/: the three charts are t3's own rendered final frames (numbers landed, no playbar, no paths), and the two terminal screenshots are captured from actually running python3 -m timeit
# Samples demonstrate how to write a spec: don't carry their topic, composition or assets into a final film
```

### Reminders for the pipeline director

- Don't cram too many cues into one animation segment: by the shot lengths in section 1, 2–5 cues is most comfortable for a 3–8 second clip; with cues too dense, writing is forced to speed up and the camera can't arrive in time.
- **Three baselines for writing a spec** (where page-flip PowerPoint usually comes from): the first cue is a visual event (a curve, a screenshot, data growing, a dive-in, an icon, a screen close-up, a number slamming in), not a title at second 0; text cues (title, point) are no more than half, and the same kind never appears 3 times in a row; each on-screen `text` or `sub` is at most 14 characters (Chinese; for English, a few short words), leaving the full narration to subtitles (when y4 has `sub`, `text` only sets how long the mouth moves and isn't shown, so it's exempt).
- Grammars with text in the picture (t1/t3/y3/y5) compete with the pipeline's burned-in subtitles; when layering, move the subtitles or don't burn them for this section.
- Transparent mode (`--alpha`) removes only the background layer; elements keep their own shadows; y2's paper pieces and t2's glass cards read as "cards floating over the image" on a transparent background. On transparent backgrounds t3's text gets a glow in the theme's background color (by default black text on white paper = a white glow; `theme:"dark"` is light text with a dark glow), so it stays readable over other footage; t1's white text has a dark glow.
- **When pinning screenshots in portrait, box the half sentence the narration is reading.** On a portrait desk a screenshot is about 900px wide, and 16px body text on a web page needs a 2–2.5× push to be readable; boxing a whole wide paragraph (box width close to the frame width) leaves no room for the red circle, and the camera can't push in. Split a sentence spanning two lines into two highlights, each on one key word (measured 2026-10-04: after splitting, a 2.4× push gives text about 50px tall). Eyeballed rects are often off by 20–30%; render one still with `--stills` to check first.
- **Stepped animation in grammar files must be counted from at.** If stepping like "on twos" is rounded on the absolute time grid (`MO.step(t, 12)`), elements can appear up to one step before at (2 frames early at 30fps). Write `MO.step(t − at, 12)` so that the at frame is the first frame. y4's character frames are still taken on the absolute 24fps grid, so a cue's landing may be off by 1 frame; check before use.

---

## 6. Regression (when brought into the skill on 2026-10-04)

| Subject | Result |
|---|---|
| 16 original segments (`eras.js`), 36 all-style sample segments (`--film gallery`) | 61 frames at the same moments pixel-identical before and after; QA all without errors, determinism ✓, motion/jump numbers unchanged, timing back to back 21.5 → 22.3 ms per frame (within noise) |
| 8 demo films vs. experiment originals | 16 moments per film (including transition windows) pixel-identical; QA on 25 segments all without errors, determinism ✓; motion, jumps and timing match the original project (each film's first segment now starts at 0 instead of 8/16s, so QA's sampling window differs and the first segment's numbers vary slightly) |
| After the final-review fixes on 2026-10-05 | 8 samples + 16 original segments + 36 sample segments + 8 demo films, 87 segments in all: QA determinism ✓ throughout, no page errors; sample stills changed only as expected (t2 off by 1 color level = the determinism fix, y5's key word on the navy page changed to orange, y1's title actually fading out); an independent final review of 36 specs (landscape samples, portrait, stress, edge cases, alpha) found no 🔴 |
| After the pulse camera, real-material pieces and portrait whole films entered the engine on 2026-10-10 | 16 original segments, 36 all-style sample segments, 8 demo films and the long-scroll demo, 18 moments each: landscape pixel-identical before and after (the y4 demo explicitly uses `char: 'author'`); all 9 samples rendered in landscape and portrait, QA determinism ✓; the portrait test film's push / bands / iris / comicPanels transitions compute correctly at 1080×1920 |
| Known jumps | y1_s3 (middle of the 42×→1× pull-out), y2_s2/s3 (fast pan and pushing until the photo fills), t1_s3 (diving into the neuron), y5 beat accents — all designed camera push/pulls or beat flashes, present in the originals. From 2026-10-10 QA records monotonic push/pulls and pans shorter than 0.35 seconds as camera events: in the demos, t1_s3 at 1.51s, y5 k4_agent at 2.2s and t3_s1 at 2.1s are now camera events; the rest are longer than 0.35 seconds (or single-frame jumps of shooting on twos) and are still recorded as jumps |
| Gate and one-command delivery on 2026-10-10 | QA before vs. after: motion, static frame pairs, determinism and framing unchanged for the 8 demo films and 9 sample specs; jumps decreased only by those now recognized as camera events (by event: 3 in the demos; 1 in sample t2_keynote_ui, 3 in y4_storytime, 2 in y5_kinetic_type — all 0.07–0.34 second push/pulls, slams or pose snaps); push/pulls longer than 0.35 seconds and single-frame jumps of shooting on twos are still reported; synthetic films (the same three images, 3 seconds per shot): a constant 7.5% slow push on every shot gives a fast-motion ratio of 0.000, red; one 0.3-second 30% fast push per shot gives 0.095, green; in whole-film mode one 0.3-second fast push used to record 8 jumps and now records 1 camera event, while a one-frame white flash is still recorded as a jump |

---

## 7. Pitfalls

- **(Measured hooking into the narration pipeline, 2026-10-04) After a y2 push, the next box was off-screen and the highlighter started sweeping off-screen.** The audience saw it 7 frames late. Fixed: when a box's starting point isn't in the current camera view, the camera moves over first, arriving the frame before at, then reveals; the push magnification is also constrained by "the red circle stays in frame" (the red circle is 1.24× wider and 1.5× taller than the box).
- **(Parameterized clip review, 2026-10-04) t3's ticks lied, categories had no names, the big number covered the line head.** `fmtTick` kept decimals only for steps <1, so with a step of 2.5, −2.5/2.5/7.5 were printed as −3/3/8; 10 category bars in portrait were thinned by `ceil(n/6)`, and the annotated "first" happened to lose its name; number was fixed at the chart's top right, exactly where a rising line's head was. All three fixed (see the t3 row in section 5).
- **(Same) The camera left y2's text card before typing finished.** The camera's departure looked only at the next piece's at−0.95. Now it starts only after "typing finished + 0.5s hold" (at−0.4 at the latest), and when intervals are short, typing speeds up from 13 characters per second to at most 40.
- **(Same) The full-width space in PuHui Medium/Bold has zero width.** The source fonts (the 65/85 weights of Alibaba PuHuiTi 3.0) are themselves 0, so "USD　y-axis does not start at 0" ran together. `font_subset.py` sets it to the width of "一" automatically when subsetting; existing files were fixed with `--fix-widths`.
- **(Same) t3's annotations in portrait landed exactly on the burned-in subtitle band.** In portrait the chart bottom was at y≈1660 and annotations at y≈1460, overlapping the subtitles of a 1080×1920 film (1400–1520). `safe` was added.

- **(Final review of parameterized clips, 2026-10-05) Everything was fine when written like the samples, but went off-frame in portrait and at real lengths.** An independent final review of 33 specs (landscape samples, self-written portrait, stress, edge cases, alpha) found 12 🔴: empty text in y2 put the renderer into an infinite loop; on y5's navy page the highlighter matched the yellow text and painted over the main word, and long numbers went off-frame in portrait; t1 in portrait pushed 7 points into the subtitle band; t3 in portrait had the subtitle and source line off-frame, annotations covering neighboring bars, and dark overlays invisible on transparent backgrounds; y1 labels cut off in portrait; y3 captions off-frame in portrait; y4 typing overflowing the bubble in portrait; t2 rendering the same moment twice differed by 1 color level (a reused buffer kept residue from the previous frame). Self-tests also found `TY.charsIn` not multiplying by the outer opacity (y1's promised title fade-out disappeared in one frame), t3's lowest negative bar value covering the category name, and `TY.fit` counting lines without measuring line width. The rule: **wherever something "doesn't fit" there must be a fallback — shrink first, then wrap, then make room, and only warn as the last resort**; layouts tuned only at sample lengths break as soon as they meet real narration.

- **Two experiment groups each wrote a `window.YT` with completely different APIs.** When merging, they were split by function into 8 namespaces, and same-named things with different meanings were renamed: G2's `zoomThrough` (rush into a color block) → `fillZoom`, G2's `spring(t, freq, decay)` → `MO.springHz`, G1's `circlePts` (opening ellipse) → `DG.ellipsePts`.
- **woff2 fonts fail the glyph check.** The engine's `U.loadCmaps` only parses WOFF1/TTF, so G3's woff2 threw a console.error as soon as it loaded and QA failed. Everything was converted to woff when brought in.
- **Backgrounds read from whole-film time change phase depending on where the film sits on the timeline.** The keynote demo's light spots were originally at 8–16s; as a standalone film the whole composition changed, so `T2.PHASE = 8` keeps the final frame. In parameterized clips the light spots read only clip time and aren't affected.
- **Ticks must enclose all of the data.** `CH.ticks` only gives whole ticks within the range, so with a maximum of 130 the top tick could be 100 and the bar pokes out of the axes; clips add one extra tick above and below.
- **System fonts aren't part of the skill.** The Vox demo's Songti SC and the kinetic-type demo's code font (Menlo) are macOS system fonts and look different on other machines; parameterized clips have all been switched to fonts bundled with the skill.


## Full narrated films and the 9th grammar

The 8 above all have parameterized clips. There is also the [presenter-led finance explainer](animation-grammars/y6_presenter_explainer.md), which comes with a grammar card and whole-film reference code, but no parameterized clip yet. For full narrated production, framing checks and the feedback loop, see [Full narrated films and the feedback loop](12-narrated-films-and-feedback-loop.md).
