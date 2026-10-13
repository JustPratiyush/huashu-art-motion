# y4 · Storytime stick-figure character animation (YouTube storytime animation)

> The grammar in one sentence: **the narration is the star, and the picture is a set of "reaction stickers" for it — the character snaps between a few poses (0.1 seconds) and then freezes; the punchline lands by cutting to a big reaction close-up and shutting up in that moment.**

Representatives: TheOdd1sOut (James Rallison), Jaiden Animations, Domics. Tools: according to Jaiden's FAQ and secondary sources, all three used Flash / Adobe Animate early on (no first-hand source for this; background only).

---

## ① When to use it

**Use it:**
- First-person stories, mishaps, "the first time I…": narration with a setup, development and turn, and a punchline you can pause on.
- When the audience comes for "this person": the creator's cartoon avatar appears every episode, and people recognize the persona, not the draftsmanship (Pappis's genre study: avatars "can often be told apart by their hairstyle alone").
- Limited budget, needing a steady weekly schedule: one character, five or six poses and three mouths can fill an episode.

**Don't use it:**
- Information-dense tutorials or data explanations → use y5 kinetic type or infographics. The audience will watch the character waiting for jokes and won't remember the numbers.
- Content without an "I" (industry news, product comparisons) → the character has no stance to perform and is just a sticker with a moving mouth.
- Narration that isn't funny and has no pauses → this style amplifies the narration; it won't rescue it.

## ② Composition

**Framing**
- A medium shot (waist up, head 25–35% of the frame height) is the default setup, character centered but offset to one side, the other side left for "the thing he's talking about" (computer, the other person, an object).
- The background only establishes "where": a wall, a desk, a window, 3–5 large color blocks. A white or solid background works perfectly well too (Pappis: "a white background or a rough sketch of a setting").
- Reaction shots remove the environment: the face fills the frame (head radius ≈ 1/3 of the frame height), with a solid background plus vignette.
- Punchline shots often go the other way: cut to an **extreme wide shot** where the person becomes tiny ("small and helpless" is itself the joke).

**Colors (actual values in the demo film)**

| Part | Value | Note |
|---|---|---|
| Skin | `#FFE2CC` | Light, near white — TheOdd1sOut's "marshmallow people" are pure white, Jaiden's lean warm white |
| Hat / white T-shirt | `#FFFFFF`, hat band `#E4E4E8` | White objects are held up by black outlines |
| Shorts | `#CDBB97` | |
| Character lines | `#1B1B1F` | The darkest in the film |
| Wall / desk / floor | `#DCE9EC` / `#E2C29B` / `#E8DCC8` | Low saturation, high value: the background is always "lighter" than the character |
| Background lines | `#5B6470` 3px | Lighter than character lines and less than half as thick |
| Reaction-shot void | `#3D405B` + radial vignette | Cool and dark, pushing all attention onto the face |
| Mouth / tongue / blush | `#6E2430` / `#F07B7B` / `rgba(255,140,120,.35)` | The only saturated color in the mouth, so mouth shapes opening and closing stand out |

**Line width**: character line = head radius × 0.05 (minimum 4px) — medium shot R=165 → 8px, big close-up R=360 → 12px, wide shot R=95 → 6px. Lines thicken and thin with camera zoom (Flash's default behavior), while background lines stay fixed at 3px. **Character lines ≥ background lines × 2** is the root of this style's "the person always pops out".

**Shape language**: all round, all blunt. The head is a slightly flattened circle (width 1.0R × height 0.93R), the body a bean (width 1.0R × height 1.2R), total height 3.2R — **the head is about 58% of the body height**. Arms are a tube with round ends, no elbow, no fingers; the hand is a circle. No right angles except on props.

**Drawing the character (Huashu's storytime version)**
- Keep two signatures: the **pure white bucket hat** (rounded-trapezoid crown + wide brim sloping down + light-gray band) and **round black glasses** (frame lines 1.5× the outline width — the glasses are this face's "eyes"). From the original likeness keep only the white T-shirt, khaki shorts and black watch (a small black patch on the near wrist).
- Eyes are black dots inside the lenses (0.075R) with a white highlight; "dead-fish eyes" shrink the dots to 0.035R and remove the highlight.
- Expression comes mainly from the **eyebrows** (the short thick line between the hat brim and the frames): raised = surprised, inner ends raised = aggrieved, flat = speechless. Mouths come in only five: smile arc, straight line, wavy (worried), half open, fully open.
- A little black hair shows at the temples, telling the audience there's hair under the hat, not a bald head.

## ③ Motion

**Measurements of the originals (captured this time from 480p reposts, minus 10 seconds at each end; method: per-frame difference on 160×90 grayscale)**

| | TheOdd1sOut "Mom's punishment" (30fps, 475s) | Jaiden Animations "Being Not Straight" (24fps, 902s) |
|---|---|---|
| Average shot length (ASL) | **2.43s** (median 1.87s, interquartile 1.03–3.07s) | **5.73s** (median 3.21s, interquartile 1.67–6.67s) |
| Fully static adjacent frames | **70.7%** | 51.2% |
| Static stretch duration | median **0.40s**, p75 0.70s | median 0.08s (= the hold of shooting on twos) |
| Motion stretch duration | median **100ms** (3 frames) | median 42ms (1 frame) |

How to read it: TheOdd1sOut is **snap (0.1s) → freeze (0.4–0.7s) → snap again**, with the picture completely still 70% of the time; Jaiden is **constantly moving on twos** (12 drawings per second), with longer shots. Hallis Blaney, animation supervisor on Netflix's *Oddballs*, put it best in a Toon Boom interview: "TheOdd1sOut is pose-to-pose, very minimal animation… basically cutting between pictures", and the hardest part of turning it into a series was keeping that snappiness and avoiding "too soft, too slow". The demo film sits between the two: pose snaps follow TheOdd1sOut, breathing and lip sync follow Jaiden.

**Demo film parameters**

| Motion | Method | Numbers |
|---|---|---|
| Character frame rate | All character motion steps at 24fps (`MO.step(t,24)`), the camera is smooth at 60fps | Flash default 24 |
| Pose switch | Arm target points interpolated with `expoOut` | **0.10s** (2–3 frames at 24fps) |
| Settle after a pose change | The body squashes vertically 7% at the switch, with an Ebberts spring settle (volume preserved, horizontal opposite) | `settle(dt, -0.07, freq 3.5, decay 9)`, settles in ≈0.35s |
| Lip sync | Reads the narration's RMS envelope; **the mouth may change shape only every 1/12 second** (on twos); three mouths | envelope <0.06 closed, <0.22 half open, otherwise fully open |
| Nodding while talking | The head dips when the mouth opens | 0.015R × mouth level |
| Breathing | Vertical body scale | ±1.2%, period 1.6s |
| Blinking | Fixed schedule, intervals 2.4–3.6s | Eyes closed 2 frames @24fps (83ms); a "speechless" slow blink is 3 frames |
| Gaze | Black dots shift toward whatever is being pointed at | 0.09R |
| Camera | The demo used a medium shot, close-up, slow push on the close shot and slow pull on the wide shot (slow push on every shot, the old approach); new films prefer to hold, with changes via hard cuts and jump-ins; smash only for the punchline | Demo: medium +3.5%/2.0s; close-up +6%/1.2s; wide 0.53→0.50 (quintOut); close 1.90→1.98 |
| Opening | Camera settles 1.04→1.01 (0.5s expoOut) instead of a "static first frame" | |
| Sweat drop | Slides down the side of the face from the temple | 0.9s, expoOut mixed with linear |
| Lens glint | A white diagonal band sweeps across both lenses | 0.3s |
| "?" | Pops above the head with a 30% backOut overshoot, then wobbles ±3° | 0.26s |

Entrances/exits: storytime has almost no "entrance animation" — the character is already in place and already talking on the first frame of the cut. Only props and symbols (?!, sweat drops, numbers) pop in (`backOut`, 15–30% overshoot).

## ④ Transitions (5 common ones)

1. **Hard cut**: the overwhelming majority. One narration sentence per shot; cut when the sentence changes. The demo's S3→S4 (close-up → a big wide shot of the same room) is a hard cut, using the contrast in shot size for the joke.
2. **Smash cut to a reaction close-up**: the new image appears on the first frame, springing back from 1.22× to 1 (freq 3, decay 11), with a 55% white flash over the first 2 frames and a low "dun" sound. Used for "after saying something ridiculous → look at his face". `TRANSITIONS.smash`.
3. **Whip pan**: the camera whips toward "the thing he's looking at", `expoInOut` 0.26s, with 16 offset copies stacked in the middle for horizontal motion blur, plus a whoosh. Used for shifts of gaze like "I opened my computer → (screen)". `TRANSITIONS.whip`.
4. **Push in / jump-in**: cut from the same setup directly to a closer shot about 2× in, without changing the background. Used for "he repeated it", "he realized", "the punchline". Demo S4→S5: in the wide shot he says "these…", and in the breath before "where do I paste them" it hard-cuts to a 1.9× close shot so the punchline face can be seen. The prerequisite is that the wide and close shots are **the same world canvas with only the camera changing** (`world.js`), otherwise the jump gives it away.
5. **Over-the-shoulder / POV**: cut to what he sees (screen, phone, the other person), with the back of his head in the foreground. Demo S2: Huashu from behind — white hat + band, ears, glasses arms hooked over the ears, short black hair, back of the neck, white T-shirt collar, with a cool rim light on the screen side (the first version was drawn as a pure black silhouette, which the review read as "another shadow person"); the foreground doesn't follow the camera push, only rising and falling with breathing, so there's parallax with the screen and the image instantly "has space".

## ⑤ Rhythm and text

- **Shots follow narration sentences, not music beats**: one sentence ≈ one shot. The demo's 5 shots average 1.75s (2.0 / 2.4 / 1.2 / 1.65 / 1.5), within TheOdd1sOut's measured interquartile range of 1.03–3.07s.
- **Transitions go in the breath between two sentences, with subtitles changing on the same frame as the cut**: the first version cut the whip pan on the first two syllables of "in one go", and the review pointed out "the cut lands in the middle of a sentence"; changed to L1 ending (1.87s) → whip at 2.0s → settled at 2.26s → speech starts only at 2.30s.
- **Reaction shots go in the silence between two sentences**: the demo's S3 has a full 1.3s with no line at all, only crickets — that pause is the joke. In editing: after the outrageous line ("three thousand lines"), **don't go straight to the next sentence**; leave 0.8–1.5s for the face.
- **Freeze ≥0.9s after the punchline**: the "?" pops at 7.80s and the film ends at 8.75s, letting the sound-effect tail finish naturally (the first version left only 0.4s; review: "the beat where you laugh got cut off").
- **Text**: native YouTube storytime doesn't burn in subtitles (relying on CC), only writing text in the picture that "needs to be seen" — text on screens, key numbers (the demo's "3000 lines" in PuHui Black 230px, `#FFCB6B`, slammed in with a 23% overshoot). Chinese platforms need burned-in subtitles: white 50px text, 10px black outline, whole sentences cut in and out, no animation (animated subtitles compete with the character for attention).
- Numbers in the picture align with the narration **on the same syllable**: the syllable "three thousand" (3.70s) = 3000 slams in = low-frequency thump = screen shake (9Hz, decaying in 0.3s).

## ⑥ Implementation notes

> After being folded into the skill (2026-10-04 v0.4): the general functions under "newly written" in this card have been unified into `scripts/engine/lib/` (names changed to the unified MO / CAM / DG / TY / CH / UI / CL / TOON); the demo film's own code is in `scripts/engine/demos/y4_storytime/`. For a library quick reference and "how to choose a grammar for a piece of narration", see `references/09-video-animation-grammars.md`.

- **Reused from the skill**: the engine (segment table, offscreen compositing of old and new segments during transitions, `GLOBAL_OVERLAY`), `render.py`, `PAINT.cached` (the room background cached as one image), `U.rng` seeded randomness (the color-block layout of the code waterfall).
- **Two engine changes (merged into the skill engine)**: any segment in the table can specify `dur` (seconds) directly, without fitting eighth notes — storytime cuts by narration, not by beat; transitions can specify `punch: 0` (or film-level `window.PUNCH = 0`) to turn off the engine's default beat punch (storytime has no beats).
- **Newly written, now unified into the library** (`lib/toon.js` / `typo.js` / `camera.js` / `motion.js`, transitions into `transitions.js`):
  - `TOON.bean(c, {x, y, s, char, pose, expr, mouth, blink, look, squash, bob, tilt, lw})`: a front-facing bean character, all procedural Path2Ds, returning coordinates of both hands and the head (for placing props and symbols). These code-drawn bean characters are reserved for demo films and grayscale previsualization only: after watching films made by several models, the author judged code-drawn little figures an instant AI giveaway (in their words, "the little people and robot characters used in a lot of these videos are just too bad"). The y4 parameterized clip only accepts your own frame library (`data.character.frames`, AI-generated frames, see doc 10 and `references/character-detail.md`), and fails to start without one.
  - `TOON.POSES`: rest / talk / point / type / shrug / stiff; each pose is just target points for the two hands relative to the shoulders (unit: head radius).
  - `TOON.mouth(t)`: reads `window.VO_ENV` (a 60fps RMS envelope exported by the audio script), quantized on twos into 0/1/2.
  - `MO.springHz / settle / backOut / expoOut / step`, `CAM.with`, `CAM.drift` (handheld micro-drift used in the demo; in new films a hold is a hold, don't add it), `TOON.sweat`, `TOON.mark`.
  - Transitions `whip`, `smash` (the rush-into-a-color-block transition used by y5 was renamed `fillZoom` when folded into the library; there are also `bands / push`).
- **This film's `y4_storytime/story.js`**: `STORY.poseAt(keys, t)` (pose timeline + settle on pose change), `blinkAt`, `alive` (nodding + breathing), subtitle overlay.
- **Audio (`build_y4.py` in the experiment archive, not included in the skill)**: lays out the narration, synthesizes sound effects (whoosh, keyboard, bloop, thump, "dun", crickets, pip, boing), and exports `vo_env.js` at the same time. The narration is a macOS `say` Eddy placeholder — **when a real voiceover replaces it in a production film, re-export the envelope and the lip sync follows automatically**.
- **One room, three shot sizes**: `y4_storytime/world.js` draws the room as one world canvas (x −1000..2900, y −700..1700, with static parts cached as a single image); S1 (zoom 1.01–1.045), S4 (0.53→0.50) and S5 (1.90→1.98) only change `CAM.with`. The bookshelf, plant and ceiling lamp visible only in the wide shot are in the world from the start. The world must be a margin larger than the widest shot, otherwise camera drift exposes black edges (all three black-edge glitches in the first version had this cause).
- Key parameters: character at 24fps, lip sync 12 changes per second, pose change 0.1s + 7% settle, character line 0.05R.

## ⑦ Representative works and primary references

- TheOdd1sOut channel: https://www.youtube.com/@theodd1sout ; the repost of "Mom's punishment" measured here: https://www.bilibili.com/video/BV14s411M7x4
- Jaiden Animations channel: https://www.youtube.com/@JaidenAnimations ; the repost of "Being Not Straight" measured here: https://www.bilibili.com/video/BV1xu411r734
- Domics channel: https://www.youtube.com/@Domics
- Toon Boom × Atomic Cartoons, *Oddballs* from YouTube to series ("pose-to-pose, very minimal animation", "he never did lip sync on YouTube", "too soft, too slow"): https://www.toonboom.com/atomic-cartoons-on-bringing-oddballs-from-youtube-to-series
- Konstantinos Pappis, *The Odd Ones Out: The Rise of YouTube Storytime Animation* (Animation Studies; genre history and visual grammar: round-faced avatars, white backgrounds, no frame-by-frame, closer to animated storyboards): https://journal.animationstudies.org/article/id/135/
- TheOdd1sOut on Wikipedia (the "marshmallow people" description): https://en.wikipedia.org/wiki/TheOdd1sOut
- Dan Ebberts' inertial bounce expression (source of freq 3, decay 5): http://www.motionscript.com/articles/bounce-and-overshoot.html
- A creator's tips thread, "add a little bounce when changing poses": https://forum.wickeditor.com/t/whoever-wants-to-make-a-storytime-animation/5940

## ⑧ The 3 easiest mistakes

1. **Treating it as "full animation" with everything moving.** The life of this style is "snap + freeze": in TheOdd1sOut 70% of frames are completely static. When everything drifts slowly, it's soft and rhythmless (the *Oddballs* team's biggest fear, "too soft, too slow"). Pose switches must be as fast as 0.1s, and then **really freeze**; continuous micro-motion only for breathing, blinking and small background things, amplitude ≤ 1–2%.
2. **Painting the background as interestingly as the character.** The background's saturation, contrast and line width must all be one notch below the character's (in this film background lines are 3px gray vs. character lines 8px black). Once the background gets busy, the audience's eyes leave the face, and the narration's joke is lost.
3. **Not giving reaction shots silence.** Going straight from the outrageous line to the next sentence talks over the joke. Reaction shots belong in the gaps in the narration, at least 0.8s. The camera holds, with just one or two small details (sweat drop, slow blink, brows dropping); to intensify, jump in one size on the punchline (hard cut to about 2×) or slam in for 0.17 seconds — don't fill it with a constant slow push.

---

## Demo film

- Film: `scripts/engine/demos/y4_storytime/` (render with `render.py --film demos/y4_storytime`) (8.75s, 60fps, with placeholder narration + sound effects); one-frame-per-shot overview: `assets/animation-grammars/y4_storytime_overview.jpg`
- Project: `scripts/engine/demos/y4_storytime/` (`eras.js` segment table, `story.js`, `world.js` world canvas, `s1_desk.js / s2_screen.js / s3_react.js / s4_wide.js / s5_close.js`), shared code in `scripts/engine/lib/`
- Shot list: S1 medium shot talking to camera (0–2.0s) → whip → S2 over the shoulder looking at the screen, code waterfall + "3000 lines" (2.0–4.4s) → smash → S3 big reaction close-up, silence (4.4–5.6s) → hard cut → S4 wide shot of the same room "I asked it: these…", glancing at the computer, pointing at the computer (5.6–7.25s) → jump-in → S5 close shot, shrugging "where do I paste them?" + "?", freeze (7.25–8.75s)

## Review fixes (independent agent watched only the finished film)

The first review had 5 "must fix" items, all handled:
1. Three black-edge glitches (S1 left/top, the smash rebound shrinking below 1, S4's camera drifting down) → larger world canvas + `smash` scale clamped to ≥1. After the fix, a frame-by-frame scan of all four edges: 0 frames showing black.
2. No breathing room after the punchline → split out the S5 jump-in shot, freezing 0.95s after the "?".
3. S1 and S4 weren't the same room → changed to the same world canvas with different cameras.
4. The over-the-shoulder silhouette looked like another person → drew the back-view identifiers + rim light.
5. The whip cut mid-sentence and the second subtitle was late → moved the whip into the breath, with subtitles on the same frame as the cut.
2 "could be better" items handled: in S3 the brows drop 0.15s after the second cricket chirp (previously the sound was at 5.23s and the expression at 5.38s, out of sync); in S4 added "glance at the computer → look back at the camera" during the two pauses, plus pointing at the computer on "these". Removed spaces between Chinese and Latin text in subtitles.
Not changed: the lines are uniform-width vector lines with no hand-drawn wobble — that's what TheOdd1sOut/Jaiden's Flash vector lines actually look like; kept.

## qa.py numbers (after review fixes, `uv run scripts/qa.py --project scripts/engine --film demos/y4_storytime`)

| Segment | Motion% | Static frame pairs% | Jumps | Mean/peak ms | Deterministic |
|---|---|---|---|---|---|
| s1_desk | 1.47 | 8.6 | 0 | 9.9/10.4 | ✓ |
| s2_screen | 6.0 | 0.0 | 0 | 1.7/3.8 | ✓ |
| s3_react | 1.73 | 0.0 | 0 | 5.6/6.1 | ✓ |
| s4_wide | 0.77 | 16.2 | 0 | 9.6/9.9 | ✓ |
| s5_close | 3.27 | 3.1 | 0 | 10.9/11.4 | ✓ |

Transition smoke test (whole-frame peak): whip 47.9ms, smash 10.1ms, cut 15.7 / 20.5ms. In the first version s1, s2 and s4 each reported 1 jump (opening settle, 3000 slamming in, the fast pull-out at the start of the wide shot); after the fixes, 0.
A caveat when reading this table: QA's rule of thumb "static frame pairs >40% reads as stuck" **does not apply to storytime** — 70.7% of adjacent frames in the TheOdd1sOut original are completely static; that's the style, not stutter. This film's static frame pairs are 0–16%, far "livelier" than the original, deliberately taking Jaiden's continuous breathing; to be more like TheOdd1sOut, turn off breathing, nodding and small background loops, keeping only lip sync and pose snaps (static frame pairs would rise sharply; not measured this time).
