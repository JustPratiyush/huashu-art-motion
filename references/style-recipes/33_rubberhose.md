# 33_rubberhose · 1930 rubber hose cartoon

> Source: migration test D (built by an independent agent that only read the skill, 2026-10-04). The scene code was ported to `scripts/engine/scenes/33_rubberhose.js` after integration.

Filename during the experiment: `scenes/r2_rubberhose.js`, about 20ms per frame.

**Pipeline**: paper-colored monochrome background (vertical-stripe wallpaper + diamond dots, floor tile seams, watercolor darkening in the corners, cached) → sky outside the window (sun face, clouds, trees) → window frame and polka-dot curtains → chair → table (curvy legs + dancing flowers) → girl → cat → `saturation` gray desaturation + multiply #f2e8d2 for fading → film layer.

**Key parameters**
- Beat bounce: `bnc(tq, ph) = |sin(π(tq/BEAT + ph))|`, BEAT = 60/128. Each object bounces up amp pixels around its own ground point: squashed sx=1+0.09k, sy=1−0.09k on landing, stretched about 5% in the air. Objects are offset by 0.25 beats: table 0.5, girl 0.25, cat 0.75, sun 0; the bow 0.05, slightly behind the body, as follow-through.
- Stepping: all characters and motifs use `tq = floor(t·12)/12` (on twos); the cup lift also steps at 12fps; the film layer uses floor(t·24).
- Character drawing: only anchors are taken from the rig.
  - Head: a big round face of radius 82 around headC.
  - Pie-cut eyes: white eye socket + black pupil, with a wedge cut out of the pupil via arc(−1.45..−0.85); 3 eyelashes above.
  - Arms: rubber hose = one quadratic Bézier from shoulder to hand, constant thickness, black edge +10px.
  - White gloves: 4 fingers, flared cuffs, 3 lines on the back of the hand.
  - Polka-dot dress down to the ankles (modest).
- Cat: body via `RIG.smooth(K.bodyPts)`, mid-gray #a39a84 (= orange), tabby #5e574b, white chest and paws #fbf7ec; the tail is a wavy rubber hose `sin(7q − 9tq)·26q`.
- Film layer:
  - Gate weave ±1.5/±2px.
  - Flicker: each frame lays α0.02–0.09 white, then 0–0.06 black.
  - Scratches: 3 vertical lines, changing position by floor(t·6), so one scratch lives for several frames.
  - 14 dust specks per frame + an occasional hair.
  - The grain layer is randomly translated ±20px each frame.
  - Rounded film gate: roundRect r60, plus vignette.

**Motif animation**: every object bounces on the beat, the sun face's rays rotate at 1.6rad/s and the face nods on the beat, dancing flowers (stems ±0.35rad side to side, leaves waving like hands, petals spinning), one smoke ring per beat, the curtain hem flicks on the beat, film flicker and scratches. Motion area 40%, but most of it is film noise (see ② item 5).

**Pitfalls**
- The rig's cat body is a polyline, and in a cartoon the straight edges are obvious at a glance; it must be smoothed.
- To press the whole film into monochrome, do one unified saturation desaturation after the characters are drawn, otherwise the gloves and cup keep warm colors.
