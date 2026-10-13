# Y1 · Kurzgesagt flat science explainer: video animation grammar card

In one sentence: draw an abstract concept as a concrete object, place it in a glowing world that can be zoomed infinitely, and let the camera travel between scales; the environment layer (stars, particles) can keep moving gently, while the subject and information change at narration beats and hold once they land.

Demo film: `scripts/engine/demos/y1_kurzgesagt/` (render with `render.py --film demos/y1_kurzgesagt`) (8s, 3 shots, 2 transitions); overview: `assets/animation-grammars/y1_kurzgesagt_overview.jpg`
Basis: research on this style (the research notes and frame-by-frame data stayed in the experiment archive and were not included in the skill; the numbers used are extracted into this card) (measurements of two 2025 episodes + the 2014 *Immune System*, plus the transcript of the official Skillshare course). Numbers marked [measured] or [primary] come from there; those marked [this film] are the parameters actually used in the demo.

## Pre-flight checks

1. **First write this section's visual metaphor: what object the abstract concept becomes** (a cell, gears, pipes, a city, a drop of water…). If you can't name an object for a sentence, don't just put a glowing ball plus a few label capsules on screen.
2. **The orange central planet in the demo film and samples is one way to draw it, not this grammar's signature.** Change the central object's shape and color by topic. In the y1 parameterized clip the central object is set by the spec: `data.center_style` (color, shape, whether to have an orbit ring) or `data.image` (crop a real image into the central object); if omitted, a neutral style is generated from the name, no longer the orange planet. It only draws "central object + satellite nodes", which suits layered "what's inside" explanations; if your topic doesn't have this structure, write your own shots (`demos/y1_kurzgesagt/` and `lib/`'s `CAM`, `TOON`) or switch grammars.
3. **At least one state change per sentence of narration** (pop, morph, dive in, pull out). Count sentence by sentence: if the picture doesn't change for two sentences in a row, add an event — don't rely on floating and slow pushes to fill it.
4. **Hold once the subject lands.** The environment layer (twinkling stars, drifting particles, distant clouds) can keep moving gently; the subject and labels get no floating or breathing, and no constant slow push to fill pauses.
5. **Pause before diving in.** Before a scale transition, hold the object you're about to dive into for 0.3 seconds or more and light it up, so the audience knows which one you're going into next; zoom with logarithmic interpolation (`CAM.zlerp`).

---

## ① When to use it

**Use it:**
- Content about scale, about "what's inside": from cells to galaxies, from a pixel to a model, or "zoom in and you'll find…". Scale transitions are standard in this style.
- Explaining mechanisms and systems: neural networks, the immune system, energy flows. Best for drawing invisible processes as glowing particles and connections.
- Narration in a calm, measured science-explainer voice. Kurzgesagt runs about 168 words per minute, with about 2 sentences per hard-cut shot [measured].
- When you need a "serious but cute" tone, with a mascot or a flock of birds popping in for jokes.

**Don't use it:**
- Real people, real events, archival evidence: flat cartoons dilute credibility; use Y2 collage for this.
- Steps and chains of reasoning: writing them out step by step is clearer; use Y3 whiteboard.
- Tiny production budgets. The quality of this style depends entirely on "something moving in every frame"; an official episode takes over 1200 hours [primary]. Corner-cutting Kurzgesagt just looks like cheap PowerPoint.

## ② Composition

- **Choose an era first**. 2025 is the dark palette: dark pixels 61–68%, median saturation 0.84–0.89. 2014 is a light gray-white background with low saturation. Don't mix them [measured]. The demo's first two shots use the 2025 dark palette and the third (daytime) uses a bright palette, imitating their habit of "switching the whole color temperature when the section changes".
- **Palette** (2025 dark, sampled from footage):
  - Background: `#05020F` / `#0E0631` / `#25155E`
  - Secondary background: `#191670`, `#3826A3`, `#5F58DB`
  - Accent cyan: `#32BAEE`, `#7DD3DC`
  - Accent orange-yellow (glowing objects): `#F48301`, `#E07919`, `#FACC12`, glow core `#F9EF93`
  - Magenta: `#BE3A95`, `#C83C7F`
  - Highlights and white text: `#E7DFE1`, `#F9FCFB`
  - Pattern: one dark background with 2–3 highly saturated accents that contrast with each other (orange-yellow vs. indigo, cyan vs. magenta) [measured + inferred]
  - **The deep-purple background above is only a breakdown record; don't copy it into a final film.** After watching several AI-made films, the author said: "We need to avoid that garbage blue-purple gradient color scheme, this is very AI slop"; a deep-purple starry background is exactly the most common instant AI giveaway in such films, and `deliver.py` measures blue-purple backgrounds and gives a red light. For a dark look, use `ink` (dark ink) or `navy` (flat navy) from `references/palettes.md`, keeping the rule "one dark background with 2–3 highly saturated accents"; for the y1 parameterized clip just write `"theme"`; if omitted the default is flat dark ink.
- **Shape language**:
  - No outlines. Shadows are blocks one shade darker in the same hue; highlights are white ellipses or a single arc [inferred].
  - Rounded corners everywhere. Creatures are blobby organic shapes, character heads are round, limbs are round-ended tubes.
  - Glowing objects always have a radial glow. The whole point of the dark background is to make the glow work.
- **[this film] Two-tone facets**: `flat(c, path, base color, shadow color, highlight color, v, w)`. Two translations inside the shape: a shadow band left at the lower right, a thin highlight edge at the upper left. v≈(10,12)px, w≈(4,5)px. Every part of Huashu also goes through this pass, so he's drawn the same way as the scene rather than looking pasted on.
- **Composition**: the subject sits on the lower third line, slightly below center, with sky left above for stars and labels. The scene has 5–6 parallax layers: starry sky d=0.05, moon 0.12, distant hills 0.3, near slope 0.65, subject 1.0, foreground leaves 1.5 (near, blurred, dark). The official layer count isn't public; measured 2–5 layers [inferred].
- **Characters**:
  - Kurzgesagt birds: egg-shaped body, big white eyes, small black pupils toward the front, orange triangular beak. Wings are leaf shapes one shade darker than the body; each bird a different color [primary + inferred].
  - [this film] The cat is a teardrop body plus a round head, triangular ears with magenta insides, big white eyes; the robot is a rounded shell with a dark screen face and one glowing lens eye; Huashu uses `HUASHU.build`'s point pose, with every part going through two-tone facets.

## ③ Motion

- **Official easing** [primary, Skillshare]:
  - Regular actions 50 frames (0.83s at 60fps). For snappier, 30/20/10 frames; pops 5–10 frames.
  - Loops use Easy Ease 33.3%, roughly `cubic-bezier(.333,0,.667,1)`.
  - Other actions use 75% influence, roughly `cubic-bezier(.75,0,.25,1)`: very soft start, fast middle, very soft end.
- **Pops** [measured]: a card grows to 90% within 0.25s, overshoots to 108% at frame 20 (114% for the detector card), and returns to 100% at about 0.5s.
  - [this film] Recognition labels use `backOut(q, 1.1)`, 0.5s long.
- **Stagger**: similar elements staggered 10–20 frames, limbs 3–4 frames apart, 20-frame pauses between actions [primary].
  - [this film] Title staggered 45ms per character, 0.5s cubicOut per character. 144 pixel-cat blocks staggered 35ms per cell by distance to the center, each flying in from the surroundings over 0.5s with backOut(1.4). The neural network lights up layer by layer at 0.32s intervals, nodes popping over 0.35s.
- **Ambient micro-motion vs. holding the subject**: in the 2025 episodes, stretches of 0.5s with no motion at all make up only 0.3% [measured]; what moves is mainly the environment layer (twinkling stars, drifting particles, glows) and the thing being explained.
  - Explainer shots: subject and information elements hold once they land; actions go on narration beats (pop, morph, push, dive in).
  - Pure atmosphere shots (openings, breathers between sections) can keep light ambient motion: stars twinkling, particles drifting, the distant view moving slowly.
  - Blinks: 5 frames closing, 10 frames opening, at irregular intervals; **eyes never shrink to 0** [primary].
  - [this film] 170 stars twinkling at their own phases 1–3.5 rad/s. Foreground leaves defocused with `blur(7px)` for depth of field. The robot floats ±12px; its jet light jitters with a 23/37Hz double sine. The cat's tail swings as two Bézier segments. Grass blades sway at 2.1 rad/s. Firefly particles drift in layers 0.8–1.3. Signal pulses loop continuously along the connections.
- **Camera** [measured]:
  - In the 2025 episodes, about 1/3 of the time is spent zooming, about 10% panning, about 5% rotating; pulling out more than pushing in. Most zooms are scale travel and reveals, not filler for pauses.
  - Pointing shots in new films: hold → slow push of about 0.9 seconds → hold; switching nodes, 0.7 seconds to move over; only the reveal gets a 0.28-second fast push or a 0.17-second slam; how long to hold follows the narration; after pushing in, give it back with a pull out (④ quick pull-out reveal). Scale travel follows the durations in ④.
  - [this film] Shot 1 used a 2.6s constant push 1.00→1.10, the old approach; new films should not copy it.

## ④ Transitions (6 common ones)

1. **Push through → the object's color fills the frame → new scene** (the standard scale transition).
   - Measured: *Immune System* 1:48, about 1.4s, accelerating then decelerating, peaking in the middle.
   - [this film] Transition B:
     - The camera pushes with logarithmic interpolation into the lit output node (0.45s, cubicIn) until the screen is full yellow.
     - Within ±3 frames of the midpoint it dissolves to the robot's yellow-glowing eye. The highlight points on both sides are at the upper left, so the cut is invisible.
     - Then a 1.45s cubicInOut pull out (42→1), landing in the new daytime palette.
     - Don't use expoOut: its initial slope is too steep and jumps most of the scale on the first frame.
2. **Dive into an object, with the next world inside it** (a variant of the push-through).
   - [this film] Transition A, 1.0s: the camera pushes logarithmically into the robot's lens with `bezier(.75,0,.25,1)` (1.1→60). The next shot shows only inside the "lens circle", which grows with the push until it covers the screen, with a cyan ring of light at the edge. Meanwhile the next shot emerges from 0.42× with expoOut.
3. **Quick pull-out reveal**: 0.2–2s, fast start, long tail (measured zoom per 0.2s 1.074→1.040→…→1.0006). Used to connect micro and macro.
4. **Light or flash filling the frame**: a white field from a light source in the picture, about 0.5s.
5. **Sweep wipe**: an object or band of light sweeps diagonally across the picture with speed lines, about 0.4s.
6. **Duplicate and multiply until it fills the screen**: for "so many that…", 3–6s.

Two more points [measured]:
- Hard cuts are rare, about 5 per minute, following the start of narration sentences, 0–0.2s before the sentence begins.
- Most other picture changes are 0.3–0.6s designed transitions, every 4.6–6.7s.

## ⑤ Rhythm and text

- **Shot duration** [measured]:
  - Hard-cut shots have a median of 7–9s, mean about 11.5s.
  - But the "visual unit" changes every 4.6–6.7s, through designed transitions.
  - Every sentence of narration has at least one state change: a label pops, an annotation changes, a morph or a transition.
- **Aligning with narration**: the timestamps of narration sentences form the skeleton, with hard cuts 0–0.2s before a new sentence starts [measured]. The music is composed after the film is finished (Epic Mountain) [primary].
- **Text**:
  - Annotations: first a thin white leader line, then text typed out character by character at about 40 characters per second; one annotation per sentence, holding about 3s and then erasing character by character [measured].
  - Chapter title cards every 2–3 minutes, full screen, word by word, with a blurred background.
  - Label capsules have large rounded corners, filled with saturated solid colors, with bold sans-serif text inside.
- **[this film]**:
  - 3 shots in 8s, about 3× the normal density, only so the whole grammar can be seen in the demo. Real films should use 7–9s per shot.
  - Title in PuHui-Heavy 76px, rising character by character.
  - Layer labels in PuHui-Medium 40px, with an underline extending out.

## ⑥ Implementation notes

> After being folded into the skill (2026-10-04 v0.4): the general functions under "newly written" in this card have been unified into `scripts/engine/lib/` (names changed to the unified MO / CAM / DG / TY / CH / UI / CL / TOON); the demo film's own code is in `scripts/engine/demos/y1_kurzgesagt/`. For a library quick reference and "how to choose a grammar for a piece of narration", see `references/09-video-animation-grammars.md`.

- Reused from the skill:
  - `PAINT.cached`, `U.rng`: determinism
  - `RIG.smooth`: smooth point lists into Path2Ds for the cat, hills and leaves
  - `HUASHU.build/pose/details`: Huashu
  - `PAINT.noise`
  - The engine's segment table, transition interface, offscreen A/B buffers
- Newly written, now unified into the library (`lib/camera.js` / `motion.js` / `typo.js`):
  - `CAM.at(keys, t)`: keyframed camera, with logarithmic interpolation for zoom. `CAM.zlerp` zooms by the same factor every frame, which is what makes a scale transition feel like constant-speed travel. Holds and pointing in new films use `CAM.track` (slow push by default, glide to switch nodes, pull to pull out, punch/slam only for accents, holding the rest of the time); the y1 parameterized clip's highlight defaults to a slow push, and only `"camera": "snap"` inside the spec's top-level `data` makes it a fast push.
  - `CAM.anchor`: smoothly moves the target point to the center of the frame while zooming.
  - `MO.bezier(x1,y1,x2,y2)`: brings AE/CSS Bézier easing into code, solved with Newton's method.
  - `MO.*`: sine, quint, expo, back, elastic, etc.
  - `TY.charsIn`: character-by-character entrance.
- The demo film's own code (`demos/y1_kurzgesagt/kurzgesagt.js`; `flat` is now in the library as `TOON.flat`, `layer` as `CAM.layer`):
  - `flat()`: two-tone facets.
  - `layer(c, cam, d, fn)`: parallax layer. Translation scales linearly with d, zoom as `z^d`, so the distant view barely moves on a deep push.
  - `Y1.cat`, `Y1.bot`, `Y1.bird`: three characters.
  - `Y1.lensAt(t)`: screen coordinates of the lens circle for transition A.
- **Key architecture**:
  - The camera is determined only by whole-film time. During a transition window the engine keeps drawing the previous shot into the A buffer as usual, and the previous shot computes its own "dive in" camera.
  - So zoom transitions are always vector redraws and never blur from scaling a 1920 bitmap 60×.
  - Transition functions (`lensReveal`, `matchCut` in `transitions.js`) only decide "how A and B combine".
- Engine changes (only in this experiment's copy):
  - Any segment in `eras.js` can specify `dur` (seconds).
  - The beat-synced camera punch is now off by default and only on with `transition.punch:true`. Explainer films shouldn't have that jolt on the beat.

## ⑦ Representative works and primary references

- Sample films:
  - How Are Memories Stored Inside Your Brain? (2025) https://www.youtube.com/watch?v=PqtggjVAi8M
  - Why Humanity Will Never Leave The Solar System (2025) https://www.youtube.com/watch?v=Cyl3X88KEgg
  - The Immune System Explained I (2014) https://www.youtube.com/watch?v=zQGOcOUBi6s
- Official course (transcripts on easing, loops, birds, character animation):
  - Skillshare *Motion Graphics with Kurzgesagt* Part 1 https://www.skillshare.com/en/classes/motion-graphics-with-kurzgesagt-part-1/631970755
  - Part 3 https://www.skillshare.com/en/classes/motion-graphics-with-kurzgesagt-part-3/140140401
- Official behind the scenes:
  - 1200 hours per video: https://www.youtube.com/watch?v=uFk0mgljtns
  - In their own words: https://kurzgesagt.org/what-we-do?visit=videos
- Music: Epic Mountain https://www.epic-mountain.com

## ⑧ The 3 easiest mistakes

1. **Turning "always moving" into everything breathing**. Measured: still stretches in the 2025 episodes make up only 0.3%, but what moves is the environment layer and the thing being explained, not every element floating. Explainer shots: the subject holds once it lands, with actions on narration beats; pure atmosphere shots keep light ambient motion like twinkling stars and drifting particles. Motion faked by everything floating and constant slow pushes still reads as PowerPoint.
2. **Linear interpolation for zoom, or scaling a bitmap**.
   - With linear interpolation z is slow at first then violent, and the feeling of travel breaks. Use logarithmic interpolation.
   - Scaling a screenshot of the previous shot 20× blurs into a mosaic. The scene must redraw itself at the larger z.
3. **Bright, messy colors, or outlines on things**.
   - 2025 Kurzgesagt is "dark background + 2–3 glowing accents", held up by glow.
   - Add black outlines or use a mid-brightness background and it slides into children's picture books or corporate flat illustration.
   - Shadows are one shade darker in the same hue, never gray.

---

## Review and revisions (independent agent watched only the finished film, 7/10)

Review comments and how this round handled them:
- "The cat, grass and hills have outlines, like a children's illustration": grass blades changed from lines to filled thin triangles; the bright edge along the top of the hills toned down to one step from the base color.
- "The black blob at bottom left looks like dirt": foreground leaves got `blur(7px)` for depth of field, and their color was raised from near-black to `#0E0631`.
- "The title disappears in one frame": changed to a 0.55s sineInOut fade-out.
- "In shot 3 the cat turns from orange to black with no explanation": the orange cat stays at Huashu's feet as "the one we know"; above the black cat a leader line and small text "a cat it has never seen" appear first, then the recognition label pops.
- "At 7.8s a bird crosses the robot": the birds' height was moved to 175/225px.
- "The ending 7.1–8.0 is nearly static": at the time the demo added a 4%/s slow push. The current approach: put an event at the end (a quick pull-out to see the whole, or diving into the next layer), then hold.
- "At 3.03–3.10s the pixel cat is half cut off by the lens circle": not changed. That's the normal state of the "diving into the lens" reveal.

## QA (skill `scripts/qa.py`, 2026-10-04, final after revisions)

| Shot | Window measured (seconds in shot) | Motion area% mean/peak | Static frame pairs% | Jump frames | Per-frame time mean/peak ms | Deterministic |
|---|---|---|---|---|---|---|
| y1_s1 | 0.0–2.58 | 1.57 / 2.58 | 0.0 | 0 | 32.9 / 34.6 | ✓ pixel-identical |
| y1_s2 | 1–2.68 | 3.36 / 4.42 | 0.0 | 0 | 6.1 / 7.2 | ✓ pixel-identical |
| y1_s3 | 0.9–2.68 | 17.94 / 91.88 | 0.0 | 8 (continuous 1.04–1.28s) | 11.2 / 16.0 | ✓ pixel-identical |

Transition smoke test (each transition rendered once, slowest frame): y1_s2 (k_lens) 48.3ms; y1_s3 (k_fill) 36ms

How to read it:
- **Shot 3's 8 jump frames** fall in 1.04–1.28s, one continuous stretch, exactly the middle of the "pull out of the robot's eye" 42×→1×, with the whole screen zooming, hence the 92% peak motion area. This is a designed scale transition, not a single-frame glitch.
  - The first version used expoOut, whose initial slope was too steep, jumping from 42× to 15× on the first frame; both the review and QA flagged it.
  - Switched to cubicInOut, which peaks in the middle, matching the shape of measured Kurzgesagt "push-through" moves.
- **Shot 1 at 33ms per frame**: the foreground leaves' `filter: blur(7px)` for depth of field makes it slower than the 9ms without blur, still far under the 150ms limit.
- Motion area of 1.6–3.4% looks low because Kurzgesagt's micro-motion is "many small things moving on their own": stars, particles, tails, floating, pulses. Measured still stretches in the 2025 episodes are only 0.3%, and all three shots here have 0% static frame pairs, which matches; but 0% static pairs only shows the environment layer is moving, not that the explanation is good — you still need to check whether the sampled stills read like flipping pages.

Rerun: `uv run scripts/qa.py --project scripts/engine --film demos/y1_kurzgesagt --out <dir>` (the table above is from the experiment; the rerun after inclusion in the skill is in the regression table in doc 09).
