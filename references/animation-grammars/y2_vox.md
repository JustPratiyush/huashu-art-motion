# Y2 · Vox-style collage explainer: video animation grammar card

In one sentence: lay the argument out on a desk of real material — clippings, photos, documents — with the camera moving across the desk like an investigative reporter's eye; lines and pen marks are drawn on in stutters, and the sense of evidence comes from "these things were really placed here".

Demo film: `scripts/engine/demos/y2_vox/` (render with `render.py --film demos/y2_vox`) (8s, 3 shots, 2 transitions); overview: `assets/animation-grammars/y2_vox_overview.jpg`
Basis: research on this style (the research notes and frame-by-frame data stayed in the experiment archive and were not included in the skill; the numbers used are extracted into this card). Five samples: Missing Chapter (2022), psychedelic posters (2019), Vox Borders (2018), Johnny Harris (2026), plus a 2026 Vox live-action film for comparison. Easing was fitted on 13 camera moves, and colors were sampled.

## Pre-flight checks

1. **Real material is the main image.** Screenshots, original text and photos fill or nearly fill the frame, pushing in to the sentence to be read; the desk is the world the camera travels through, not a backdrop for small images. Measure: more than 2 consecutive shots where the material is under 60% of the frame width is a "picture-frame layout".
2. **Rotate "slide in → typed label → red circle".** When storyboarding, list a table of reveal actions: just there (appearing with the cut), push in, pan to the next piece, highlighter sweep, red line connection, stamp, tear off… Don't use the same reveal sequence more than 3 times in a row. Evidence: in one long film, 36 of 37 labels slid in, and by the middle the audience could predict the next step.
3. **Text to be read goes on the top layer, drawn last,** not at the layer of the object it belongs to. Photos, clips and cards placed later covering text is the most frequently recurring glitch in this grammar.
4. **Compute the camera's landing point from what must be read at this moment** (frame the target, then leave a margin) instead of typing in coordinates; push labels on half-visible neighboring cards out of frame.
5. **Every time a new card is placed on the accumulating desk, read all the text on screen in reading order.** Text from two cards sitting next to each other can combine into a wrong sentence ("more than" right next to "acquisition"); remove a card or write the qualifier out in full.
6. **The main action of an event is shown only once.** An action shown in the overview diagram is not repeated after pushing in, otherwise it reads as "it happened again".

---

## ① When to use it

**Use it:**
- Content with real archives, news, history, maps and people: "how did this happen", "who said what, when".
- Narration with a reporter's argument: quotes, evidence, cause and effect. When the voiceover says "look at this sentence", "notice this number", the picture highlights that sentence.
- Quoting a line, a set of numbers, a year — moments when the audience needs to "see the source with their own eyes".
- The demo uses the real numbers from Google's 2012 "cat recognition" paper: 1000 machines, 16,000 CPU cores, 10 million YouTube frames, no labels. Sources: arXiv:1112.6209 and Google's official blog.

**Don't use it:**
- Pure mechanisms or concepts with no real material to pin up. Forcing it produces a "fake archive"; use Y1.
- Derivations and steps: use Y3.
- Content needing lots of character acting: cut-paper characters can only move in stutters.

## ② Composition

- **Three-color system** (measured from Missing Chapter):
  - Near-black background `#171716`
  - Paper white `#E0DCDA`–`#EEEDED`
  - One red in two shades: bright red `#B65255` for lines, dark red `#93403C` for fills
  - Highlighter yellow `#DACF08` (darker and more olive than the Vox logo's `#FFF200`; the logo yellow is rarely used in large areas in the films)
  - Old map paper `#E4DCCF`, parchment `#CFB195`
  - No pure white, no pure black.
- **[this film]**:
  - Desk `#e4ddcf`, tiled paper texture with fibers and low-frequency light and dark.
  - Clue red `#b8433f`, slightly brighter than measured, to stay legible at 1080p.
  - Highlighter `rgba(218,207,8,.9)`, composited with multiply.
  - Shot 3 is a large black card `#1b1b1a` on the desk, with the desk showing around all four edges.
- **Material**:
  - Photos are always grayscale halftone (45°), with white borders and two semi-transparent strips of tape.
  - Clippings have torn edges, yellowed, with serif (Songti) headlines.
  - Labels are Borders-style bold white text on black bars ("2012 · Google").
  - Index cards are lined paper.
  - The paper texture is **static**. Measured frame differences in still stretches are 0.0–0.1, with no per-frame grain — that's Johnny Harris 2026's film-stock look, not Vox.
- **Shadows are weak**. Shadows of black cards are almost invisible at 360p [measured]. [this film] uniformly blur 10, offset (3,6), α 0.28.
- **Deliberately imperfect**: in the words of Vox's art director, "You don't want it to look perfect because that might make it look more like an ad than an editorial piece" [primary].
- **Characters**: photos of real people cut out as stickers, with a white border and shadow. [this film] Huashu uses `HUASHU.draw`, with the silhouette offset 12px in 16 directions and backed with paper white as a sticker border.

## ③ Motion

- **Two frame rates (the core)** [measured]:
  - The camera layer moves smoothly at 24fps.
  - The element layer (map color areas growing, red lines tracing routes, typing, hand-drawn circles, pop-ins) steps at 12fps "on twos". In the psychedelic-posters film, 52% of motion frames have the "move-stop-move" alternating fingerprint.
  - [this film] The camera is computed continuously at 60fps; all elements are quantized with `MO.step(t, 12)` before computing progress. QA measured 16.9% static frame pairs in shot 1 — the held frames of shooting on twos, not stutter.
- **Camera easing** [13 measured moves]:
  - Median duration 1.29s, range 0.71–1.96s, **none of them linear**.
  - 7 are symmetric easeInOutSine, equivalent to AE's default Easy Ease, used for long "find the next card" moves.
  - 6 have a fast start and a long settling tail, close to `cubic-bezier(.33,0,.2,1)`, used for "pull-out reveals" and "following a clue".
- **[this film] Camera**:
  - Shot 1: after the highlighter finishes, a 1.5s sineInOut push toward that line (1.14→1.28). Breakdown measurements show a push often follows a finished sweep.
  - Transition A: 1.1s long-tail Bézier.
  - Transition B: 0.6s sineInOut push.
  - Shot 3: 0.85s long-tail Bézier pull out.
  - These measured durations (push 0.6–1.5s, pull out about 1s, following a line 1.3–1.8s) are the defaults for new films. The demo's opening 0.9s slow push in shot 1 (1.14→1.165, only 2%, revealing nothing) and the 1%/s constant drift after the pull-out in shot 3 are the old approach; new films should not copy them.
- **Entrances** [measured]:
  - Archive photos and clippings **are simply there with the cut**, no pop or drop.
  - Only when tracking along a timeline does the next card slide in from off-screen, tilted 5–15°, leveling out on arrival, about 0.8s.
  - [this film] Small photos and the Huashu sticker use `slideIn`: 0.55s quartOut, leveling from a 12° tilt, stepped at 12fps.
- **Lines and pens** [measured]:
  - Red underlines are drawn in 0.5–1s.
  - Red ellipse circles about 1s, one stroke, not closed, ends slightly crossing.
  - A highlighter bar takes 1.5–3s per line, sweeping with the words as they're read.
  - Typing about 13 characters per second, on twos.
  - [this film] Red circle 0.65s, highlighter 0.9s (compressed for the demo), typing 13 characters per second, red lines 0.5s each staggered 0.15s, counter 1.4s cubicOut rolling to 10,000,000.
- **The camera holds during holds**: measured still-stretch frame diffs are 0.0–0.1; when Vox's desk stops, it stops. When there's animation inside a card (tracing, highlighting, typing), the camera stays still; when a purely static image holds for a long time, push in when the narration reaches the part to be read (find the card in 0.5–0.9 seconds, push in 1.0–1.5 seconds, ease in and out; only the reveal moment gets a 0.28-second fast push), or pan to the next piece — no constant slow drift.

## ④ Transitions (6 common ones)

1. **Hard cut**: the overwhelming majority, with cut points on narration sentence breaks [measured].
2. **Pan along the red line (timeline tracking)**: the camera moves horizontally along a red line, 1.3–1.8s, with long-tail easing; the next card slides in from the right at an angle and levels out.
   - [this film] Transition A: the red line runs from the highlighted line in the clipping to the counter label on the investigation wall; the camera follows it in 1.1s, with a short motion blur along the direction of motion (7 stacked copies, factor 0.6).
3. **Push into the paper or photo → cut directly to a high-res scan of the same image**: 1.0–1.4s, S-shaped easing.
   - [this film] Transition B: push until the small photo on the wall fills the screen (logarithmic interpolation to z≈9.6); hard-cut to a large scan of the same image (the halftone going from fine to coarse, reading as "swapped for a clearer copy"); then follow with 3.
4. **Pull out from a single photo → reveal the whole collage**: about 1.0s, fast start, long tail (measured MC 2:30).
5. **Map color areas growing, routes being traced**: 2.5–3.5s, on twos, with a solid red dot at the head of the line.
6. **A real hand turning a page, pulling out a sheet** (Missing Chapter's signature): in code, approximate it as "paper sliding in along an arc with changing shadow".

**Note**: the "torn paper transition" did not appear once in the 5 sample films. It's common on template sites, not Vox grammar. The first version of this film used torn paper and replaced it after reading the research.

## ⑤ Rhythm and text

- **Shot duration** [measured, collage sections]:
  - Two tiers: slow (Missing Chapter) median 3.3s, about 12 cuts per minute, a card held 3–7s, carried by tracing and highlighting inside the card.
  - Fast (psychedelic posters 1.8s, Johnny Harris 1.4s) about 25–33 cuts per minute, images barely moving, with rhythm from the cutting.
- **Aligning with narration**:
  - The speed of highlighter bars, typing and tracing is locked to the speed of the spoken words, not to music beats.
  - Johnny Harris puts it as "Each word must correspond to a movement or action within the animation", and writes his scripts in two columns [primary].
  - Joss Fong changes music about every 20s [primary].
- **Text**:
  - Names and places in small serif type, white text below photos.
  - Timeline titles on black typed out at 13 characters per second, with a red line running across the frame.
  - Quotes emerge in handwriting with an "ink bleeding" effect over about 2s, then a red bar follows the reading line by line [measured].
  - [this film] Clippings and cards in Songti SC, big labels in PuHui-Heavy, numbers in Anton.

## ⑥ Implementation notes

> After being folded into the skill (2026-10-04 v0.4): the general functions under "newly written" in this card have been unified into `scripts/engine/lib/` (names changed to the unified MO / CAM / DG / TY / CH / UI / CL / TOON); the demo film's own code is in `scripts/engine/demos/y2_vox/`. For a library quick reference and "how to choose a grammar for a piece of narration", see `references/09-video-animation-grammars.md`.

- Reused from the skill:
  - `PAINT.cached`, `PAINT.scratch`: all paper pieces, photos and clippings drawn once as sprites
  - `PAINT.grain`: static grain
  - `PAINT.noise/fbm`
  - `KIT.densify/resample`: hand-drawn circles
  - `HUASHU.build/pose/draw`
  - The engine's transition interface
- Newly written, now unified into the library (`lib/collage.js` / `camera.js` / `diagram.js` / `motion.js`):
  - `MO.step(t,12)`: on twos.
  - `CL.paperTile`: tileable paper texture, sampled on a torus so it's seamless, with fibers.
  - `CL.halftone`: grayscale to 45° halftone, batched into one path and filled once.
  - `CL.tornEdge`: torn edges.
  - `DG.hand / DG.drawPartial / DG.cum`: hand-drawn lines, traced by length.
  - `CAM.motionBlur`: stacking frames along the direction of motion.
  - Real-material pieces for new films: `MD.print` (photo print: white border, old-paper color, shadow, tape, croppable by focus), `MD.label` (torn-edge label on black, typed at 12fps), `MD.cover` (full-frame + focus + push, for hard cuts to live footage); the camera uses `CAM.track`'s glide and push, with punch only for accents. The y2 parameterized clip now uses this set: photos take 80–90% of the frame, the camera moves to the next piece in 0.7 seconds by default and the highlight slow-pushes in 0.9 seconds (`"camera": "snap"` in the spec's top-level `data` switches to a 0.30-second pan and 0.28-second fast push), with no constant slow push.
  - `MO.bezier`: long-tail easing `(.33,0,.2,1)`.
- The demo film's own code (`demos/y2_vox/vox.js`; `slideIn / highlight / stringPts` are now in the library as `CL.slideIn / CL.highlight / CL.stringPts`):
  - `slideIn`: tilted slide-in, leveling out.
  - `highlight`: highlighter band with rough edges, multiply.
  - `stringPts`: red string with sag.
  - `deskCam`: desk camera keyframes, plus the final push.
- **Key architecture**:
  - Shots 1 and 2 are the same desk world and the same camera. Transition A uses `same` (A and B are the same picture to begin with), and the pan is done entirely by the camera.
  - Shot 3 is the big black card on the desk. Transition B uses `cut`, cutting on the frame where the push fills the screen.
- **Performance**: shot 3 is 73/89ms per frame (mean/peak); the Huashu sticker does 16 offset passes per frame for its border. You could cache the sticker border and recompute it only when the pose changes at 12fps.

## ⑦ Representative works and primary references

- Sample films:
  - Missing Chapter *The case to rename this famous Christmas plant* https://www.youtube.com/watch?v=lLSUjl4WatY
  - *Where the 1960s "psychedelic" look came from* https://www.youtube.com/watch?v=9vuqI2v2IRs
  - Vox Borders *China is erasing its border with Hong Kong* https://www.youtube.com/watch?v=MQyxG4vTyZ8
  - Johnny Harris *The Internet Didn't Fail. It Was Taken.* https://www.youtube.com/watch?v=0rKDo3hKbVk
- Primary:
  - Interview with Vox art director Joey Sendaydiego https://www.storybench.org/how-vox-uses-animation-to-make-complicated-topics-digestible-for-everyone/
  - Interview with Joss Fong https://www.theopennotebook.com/2020/01/07/videogram-how-a-vox-video-explains-the-science-behind-the-first-photo-of-a-black-hole/
  - Johnny Harris *How I Make My Maps* https://www.youtube.com/watch?v=GsojLuJpe_0
- Secondary: PremiumBeat *Replicating Vox motion graphic* https://www.premiumbeat.com/blog/replicating-vox-motion-graphic/
- Facts in the demo:
  - Le et al., ICML 2012, arXiv:1112.6209 https://arxiv.org/abs/1112.6209
  - Google official blog 2012-06-26 https://blog.google/innovation-and-ai/products/using-large-scale-brain-simulations-for/

## ⑧ The 3 easiest mistakes

1. **Everything moving silky-smooth at 60fps together**. Half of collage's handmade feel comes from the two frame rates, "camera glides, elements stutter". All smooth looks like a corporate promo; all at 12fps makes the camera nauseating.
2. **Passing off template grammar as Vox**: torn paper, every image popping in and dropping, paper texture jittering every frame. None of these appear in the measurements; Vox's photos are simply there with the cut, the paper texture is dead still, and transitions are mostly hard cuts and push-ins. The more flashy entrances, the less it looks like "editorial work".
3. **Using the Vox logo yellow as a large background color, too many colors**. The yellow in the films is a `#DACF08`-grade highlighter, used only to mark key points. The body is three colors, "black, paper white, one red", plus at most one accent.

---

## Review and revisions (independent agent watched only the finished film, 8/10)

Review comments and how this round handled them:
- "Shot 3 turns pure black; the big desk breaks": changed to a large black card laid on the same desk, with the desk's paper texture showing around all four edges. Still Missing Chapter's black-card grammar, but the desk doesn't break.
- "0–0.9s completely static": at the time the demo added an opening slow push (1.14→1.165). The current approach: put the first event within 0.3 seconds (the photo is there with the cut, the highlighter or red line starts immediately), or open with a single 0.17-second slam.
- "The blurry halftone image fills the screen too long": push shortened from 0.7s to 0.6s, pull out from 1.0s to 0.85s. The pull-out starts at z=3.68 so the photo's screen width matches on both sides of the hard cut, and the large image got tape in the same positions, so the hard cut reads as "swapped for a high-res scan".
- "A blank paper strip appears first": the strip now slides in tilted, and typing starts earlier at 0.4s.
- "The protagonist cuts in from the right half-body in one frame": the starting point moved 1100px off-screen, so the first 12fps step is still out of frame.
- "The film ends before the highlighter finishes": typing, red circle and highlighter moved earlier as a whole; the highlighter finishes at 1.8s, then holds 0.3s.
- "The word 'cat' in its mind is too small": raised to 40px.
- "The camera is smooth throughout; not enough on-twos": not changed. Research measurements show Vox is exactly "camera smooth at 24fps, elements stepping at 12fps"; stepping the camera too would contradict the measurements.

## QA (skill `scripts/qa.py`, final after revisions)

| Shot | Window measured (seconds in shot) | Motion area% mean/peak | Static frame pairs% | Jump frames | Per-frame time mean/peak ms | Deterministic |
|---|---|---|---|---|---|---|
| y2_s1 | 0.35–2.58 | 11.02 / 16.71 | 3.1 | 0 | 17.4 / 20.3 | ✓ pixel-identical |
| y2_s2 | 1.1–3.28 | 16.09 / 76.76 | 3.1 | 16 (continuous 2.77–3.28s) | 23.4 / 52.2 | ✓ pixel-identical |
| y2_s3 | 0.35–2.08 | 7.77 / 37.41 | 0.0 | 14 (continuous 0.39–0.83s) | 73.3 / 88.5 | ✓ pixel-identical |

Transition smoke test (each transition rendered once, slowest frame): y2_s2 (same) 55.2ms; y2_s3 (hardcut) 43.8ms

How to read it:
- **Shot 2's jumps** are continuous over 2.77–3.28s: the 0.6s push into the small photo on the wall, reaching 9.6×.
- **Shot 3's jumps** are continuous over 0.39–0.83s: the 0.85s "pull-out reveal" after the hard cut.
- Both are whole-screen zooms, designed camera moves. The hard cut itself falls on shot 3's frame 0, outside the measured window.
- **3.1% static frame pairs**: from the element layer shooting on twos (held frames at 12fps). The first version's camera was still at the opening and this number was 16.9%; after the review pointed out "0–0.9s completely static", an opening slow push was added and it dropped to 3.1%. A lower number doesn't mean better: a constant slow push can drive static pairs very low and still read like flipping slides; the right fix for a static opening is to make the first event happen earlier.
- **Shot 3 at 73/89ms per frame** is the heaviest of the three: the Huashu sticker does 16 offset passes per frame for its white border, plus the black card's paper texture. To speed up, recompute the sticker only when the pose changes at 12fps and reuse it on other frames.

Rerun: `uv run scripts/qa.py --project scripts/engine --film demos/y2_vox --out <dir>` (the table above is from the experiment; the rerun after inclusion in the skill is in the regression table in doc 09).
