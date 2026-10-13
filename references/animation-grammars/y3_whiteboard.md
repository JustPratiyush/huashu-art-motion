# Y3 · Hand-drawn whiteboard explainer (RSA Animate type): video animation grammar card

In one sentence: each time the speaker says a sentence, a hand writes a sentence or draws a picture on a big whiteboard; the camera moves across the board following the argument, and finally pulls out so the audience sees the whole argument as one picture.

Demo film: `scripts/engine/demos/y3_whiteboard/` (render with `render.py --film demos/y3_whiteboard`) (8s, 3 shots, 2 kinds of transition + a closing pull-out); overview: `assets/animation-grammars/y3_whiteboard_overview.jpg`
Basis: research on this style (the research notes and frame-by-frame data stayed in the experiment archive and were not included in the skill; the numbers used are extracted into this card). Measured RSA Animate *Changing Education Paradigms* and Minute Physics *Why is it Dark at Night?*, and checked the official documentation of VideoScribe and Doodly and first-hand statements by Andrew Park and Henry Reich.

**Pick one grammar first; don't mix them**:
- RSA type: one huge whiteboard, with the camera moving across it, 5.3 moves per minute.
- Minute Physics type: one sheet of paper per page, hard cuts between sheets, 8.1 per minute, camera fixed.
- This card and the demo film follow the RSA type. The key points of the Minute Physics type are in ④ and ⑧.

## Pre-flight checks

1. **Drawing too little and writing too much is a storyboard problem: decide the visual metaphor before picking up the pen.** For each board, first write down the object or gag to be drawn, then decide what text to write; handwritten sentences no longer than one line. Count: if more than half of the board text duplicates the narration at the same moment, you're drawing too little and writing too much, and adding puns or icons in post can't save it.
2. **Rotate block templates.** Blocks with the same structure, like "year → object → orange label" or "dot → one line of text → one icon", no more than 3 times in a row in the whole film; switch to contrast (two pictures side by side), process (strung together with arrows), zooming into a detail, or one big full picture.
3. **Don't type in camera coordinates for framing.** Compute them from the bounding box of this segment's strokes (frame it, then leave a margin), and push old text that's cut in half at the frame edge out of frame.
4. **Fix line styles from the very first stroke.** Solid = happened, dashed = planned, dotted = a leader across segments; things on the board can only be erased or kept, never faded out.
5. **Check every object's shape for "could this be read as an indecent shape".** Vertical objects with a round top, flared sides and a round bottom are the most likely to go wrong; make them pointed on top and flat on the bottom before drawing.

---

## ① When to use it

**Use it:**
- Argument-driven content: talks, opinions, chains of cause and effect, historical threads. Best for content where concepts relate to each other and can be drawn as a map. In Andrew Park's words, "lay the information out in space so people can see the relationships between things" [primary].
- A short science explainer following one chain of reasoning, in the Minute Physics type.
- Narration with a steady pace and clear keywords. RSA's writing speed roughly equals the speaking rate, like "subtitles being handwritten" [measured].

**Don't use it:**
- Content needing precise data charts; hand-drawing has large errors.
- Content with complex action and spatial relationships; a whiteboard has no depth.
- Content needing emotional intensity; monochrome line art is weak at expressing it.
- Expecting it to "improve understanding": Türkay 2016's experiment found no better learning from whiteboard animation than from other forms. Its value is in attention and a sense of companionship [secondary].

## ② Composition

- **Colors** (measured from RSA):
  - Background: pure white `#FBFBFB`
  - Lines: black `#0A0503`
  - The only accent: orange, text `#EB701F`, fills `#F3742D`; light-orange areas hatched with diagonal lines about `#E9A67C`
  - Orange is about 22% of all ink pixels, used only on keywords and hatched fills.
  - Minute Physics instead uses a pinkish off-white paper `#E7DBE1`, plus colored-pencil pale yellow `#EDE6A2` and pale blue `#B5CBE8`.
- **[this film]**: background `#FBFBFB`, lines `#0A0503`, accent `#EF7226`. The cat's body gets a layer of orange at 22% opacity.
- **Line width**: RSA strokes are about 0.6–0.7% of the frame height, about 6–7px at 1080p; shading hatches about 0.3%; title letter height about 5.5% of the frame height. Minute Physics lines are thicker, about 0.8% [measured]. [this film] line width 6.5px.
- **Composition**:
  - RSA "plans the final full picture first, then draws it in reverse" [primary].
  - Each board area has 3–6 text-and-image groups; fill it, then move on.
  - A smooth move shifts only 0.23 frame widths at a time, so old and new areas overlap heavily and the audience can always see the edge of the previous block [measured].
  - The full picture revealed at the end is a very long horizontal scroll.
- **Text**: RSA uses all-caps handwritten print (comic dialogue lettering). [this film] Chinese uses LXGW WenKai, subset into a woff.
- **The hand**:
  - A real right hand holding a black marker enters from the **lower right**, forearm angled toward the lower right, covering 15–25% of the frame.
  - When not drawing, the whole hand leaves the frame. Time the hand is in frame: RSA 49%, Minute Physics 40% [measured].
  - [this film] A hand drawn in code: bare forearm with shading and arm hair, index finger pressing a black marker, scaled 0.82, swaying lightly at 7 rad/s.

## ③ Motion

- **Writing speed** [measured, 9 cases]:
  - Body text median about 16 characters per second.
  - Opening titles at half speed, about 7.5 characters per second, to "establish the topic".
  - Narration about 13 characters per second, so writing speed roughly equals speaking speed.
  - [this film] Body text 16 characters per second; "Cat?" written at title speed, 7.5 characters per second.
- **Drawing speed** [measured + inferred]:
  - Small icons 0.5–1s, a person's head about 2s.
  - RSA's median new ink area is 0.25% of the frame per second.
  - Complex illustrations aren't drawn on camera: either pre-drawn and revealed as the camera moves over, or hard-cut in whole with the hand only adding color.
- **[this film]**:
  - Line pen speed 2600 world pixels per second, about 2× RSA's real footage. An 8-second demo has to be compressed; slow it down for real films.
  - Stroke duration = length ÷ pen speed, at least 0.04s per stroke, with 0.02s pen-lift gaps.
  - Within each stroke, sineInOut: slow at the start and end.
  - Huashu is revealed with a 0.7s "Reveal": the pen tip walks an 8-row zigzag inside his joints' bounding box, `DG.revealMask` turns the walked area into a clip, and the line art shows only inside the clip.
  - The first version traced all parts at once with `setLineDash` while the pen tip followed the joints; the review judged "the pen doesn't lead the line", so it was replaced.
  - Chinese characters have no stroke-order data, so each character is revealed with a 3-row zigzag, the pen tip moving back and forth with it — it looks like writing.
- **Speed-up factor**: Henry Reich shoots one photo per second and holds each for 2 frames when drawing, equivalent to about 12× speed. RSA is inferred at 5–8× [primary + inferred].
- **Pops "without the hand"**: some of RSA's orange keywords pop in whole in post, without the hand drawing them (ANAESTHETIC, CREATIVITY) [measured]. [this film] "×10M images" and "It's a cat!" pop in over 0.3s with backOut(2.2), without the hand going there.
- **Pen-tip path**:
  - When the gap between two strokes is <0.25s, the pen tip slides along an arc from the end of the previous stroke to the start of the next (sineInOut, lifted 30px).
  - For longer gaps, the hand lifts out of frame: 0.35s cubicIn back off-screen to the lower right.
  - 0.3s before the next stroke starts, it comes in from the lower right with cubicOut.
- **Continuous motion**: a whiteboard film's "aliveness" comes from the hand always drawing. RSA's drawing activity has almost no correlation with spoken word density (|r|<0.07): when speech pauses, the hand doesn't [measured].

## ④ Transitions (5 common ones)

1. **Smooth pans or push/pulls across the board** (RSA's workhorse, 41 times).
   - 1.2–2.4s, **easeInOutSine**: measured peak/mean speed 1.49, theoretical sine 1.57.
   - Each pan is about 0.23 frame widths, overlapping the previous block by about 75%.
   - [this film] Transition B: 0.9s sineInOut (4.7→5.6s), diagonal move of about 0.5 frame widths while pushing to 1.12×. When the move starts the hand is drawing an orange connecting line leading to the new area — the hand leads the camera.
2. **Whip pan**: a fast pan plus motion blur, about 0.8s, moving 0.5–1.2 frame widths at once, used to jump to a distant area of the board (RSA 15 times).
   - [this film] Transition A: 0.8s cubicInOut sideways move of about one full screen. Only during these 0.8s are 9 copies stacked along the direction of motion for blur; smooth moves and pull-outs stay sharp.
3. **Pull out to reveal the full picture** (the ending).
   - RSA's ending: gray fills the board → a 0.6s fast pull-out → about 9s panning across the long scroll → pull out further to see the whole.
   - VideoScribe's "Zoom at end?" is checked by default [primary].
   - [this film] 6.85→7.5s sineInOut pull out to 0.45×, hold 0.5s, while the whole board gets a very light gray `#EEEEEC` over 0.5s.
4. **Cloud or explosion wipe**: cartoon smoke puffs fill the screen then disperse, about 1s (RSA once).
5. **Hard cut**: hard cut to a pre-drawn picture (RSA, a few); the Minute Physics type's sheet-change hard cut (its workhorse, 8.1 per minute); Minute Physics inverts the whole frame when explaining night.

**Note**: "pushing into a picture frame or bubble" and "page turns" never appear in the samples. The first version of this film did "push into a thought bubble", and after reading the research it was replaced with a whip pan plus smooth move.

## ⑤ Rhythm and text

- **Hold per block**: RSA's median between two camera moves is 6.6s (interquartile 4.0–13.8s); Minute Physics' median per shot is 7.1s [measured]. The demo film fits 3 blocks into 8s, about 2.5× the density of a real film.
- **Aligning with narration (the core)** [measured]:
  - Writing starts 0.2–0.8s after the corresponding phrase starts being spoken, median +0.5s.
  - Writing finishes within 1s after the phrase ends: write while speaking, slightly behind, **never ahead**.
  - The exception is visual setup (pill bottles, arrows), drawn a few seconds early to wait for the line.
  - In Minute Physics the picture lands as soon as the noun is spoken, median +0.3s.
- **Transitions follow topics, not pauses**: each new board area corresponds to a new point [measured + inferred].
- **Music**: RSA has **no music** under the talk. Minute Physics has music underneath throughout, about 9dB below the voice [measured].
- **Tool defaults**:
  - VideoScribe's default hold after drawing is 0.5s [primary], default camera move 1s [secondary].
  - Doodly draws each asset in 3s by default [primary].

## ⑥ Implementation notes

> After being folded into the skill (2026-10-04 v0.4): the general functions under "newly written" in this card have been unified into `scripts/engine/lib/` (names changed to the unified MO / CAM / DG / TY / CH / UI / CL / TOON); the demo film's own code is in `scripts/engine/demos/y3_whiteboard/`. For a library quick reference and "how to choose a grammar for a piece of narration", see `references/09-video-animation-grammars.md`.

- Reused from the skill:
  - `KIT.densify / KIT.resample`: Catmull-Rom densification, then resampling at equal arc lengths; `DG.hand` adds low-frequency noise on top
  - `PAINT.noise`, `PAINT.cached`
  - `HUASHU.build/pose/details`: Huashu line art
  - The engine's transition interface
- Newly written, now unified into the library (`lib/diagram.js` / `camera.js`):
  - `DG.cum / DG.pointAt / DG.drawPartial`: trace a polyline by length, returning the pen-tip position.
  - `CAM.at`: keyframed camera.
  - `CAM.motionBlur`: motion blur.
  - `DG.revealMask / DG.zigzag`: zigzag reveal mask (added after review).
- The demo film's own code (`demos/y3_whiteboard/whiteboard.js`; the stroke timeline, pen sliding between strokes and the marker are now in the library as `DG.board` / `B.penAt` / `DG.pen`):
  - **Stroke timeline**: `addLine / addText / addPop / addFill` scheduled in order, with durations computed automatically from length and speed; at delivery, print `Y3.timeline` to check each block's end time. In the first version the second block was scheduled until 7.9s, 2.5s after the camera move — only this number revealed it.
  - `drawStroke`: five kinds — line, text, pop, fill, character. Text and characters are both revealed with zigzag masks, with the pen-tip coordinates taken directly from the mask's leading edge.
  - `penAt`: the path of the pen tip and hand, including sliding between strokes, lifting out of frame and entering.
  - `drawHand`: the hand and marker.
  - The eraser-smudge texture lives in screen space, following the camera's pan but not its zoom; otherwise a 5× push turns it into big gray blotches.
- **Key architecture**: all three shots draw the same whiteboard with the same camera, and every transition is `same`. The "transition" is itself a camera move, so things on the whiteboard never jump during transitions.

## ⑦ Representative works and primary references

- Sample films:
  - RSA ANIMATE: Changing Education Paradigms https://www.youtube.com/watch?v=zDZFcDGpL4U
  - MinutePhysics: Why is it Dark at Night? https://www.youtube.com/watch?v=gxJ4M7tyLRE
- Andrew Park interview (Sketchnote Army 2025) https://sketchnotearmy.com/blog/2025/11/18/andrew-park
- Cognitive Media "Hairy Hand" https://www.hairyhand.co/about
- VideoScribe official documentation:
  - Camera and Zoom at end https://help.videoscribe.co/knowledge/use-zoom-and-set-the-camera
  - Draw entrance https://help.videoscribe.co/knowledge/draw
  - Entrance animations https://help.videoscribe.co/knowledge/entrance-animations
- Doodly defaults https://support.voomly.com/en/articles/12735753-doodly-how-do-i-customize-video-settings
- Research on learning effects (cited) https://en.wikipedia.org/wiki/Whiteboard_animation

## ⑧ The 3 easiest mistakes

1. **Filling a whole block before speaking, or drawing only after speaking**. The magic of whiteboard films is "say a sentence, write a sentence": writing speed equals speaking speed, about 0.5s behind the narration. Drawing first makes the audience wait; speaking first makes the drawing a redundant repetition. Don't draw complex illustrations live — pre-draw them and reveal them as the camera moves over.
2. **Cutting the whole screen to the next blank area every time**. RSA's smooth moves shift only 0.23 frame widths, with heavy overlap between old and new areas, so the audience always knows where they are on one big picture. Use the 0.8s whip pan with blur only to jump far away. The ending must pull out to the full picture — that's where this genre lands.
3. **Too many colors, lines too thin or too uniform, the hand hanging in frame all the time**. Use only black plus one accent, with line width about 0.65% of the frame height. The hand enters only while drawing and exits to the lower right when done; emphasized words can pop in without the hand. And don't mix RSA and Minute Physics: either one big whiteboard with camera moves, or one sheet per page with hard cuts.

---

## Review and revisions (independent agent watched only the finished film, 6/10, the lowest of the three)

Review comments and how this round handled them:
- "The pen tip doesn't lead the line; several of Huashu's strokes pop up at once; the text is wiped in by a mask":
  - Huashu now uses VideoScribe's Reveal drawing: the complete line art hides underneath, the pen tip walks an 8-row zigzag, and wherever the pen passes is revealed, so the pen tip is always on the leading edge.
  - Text is now written character by character: each character gets its own time slot, the pen tip zigzags 3 rows inside the character box, and the mask reveals along with it.
  - Newly written `DG.revealMask` (a union of same-direction rectangular strips, so overlaps don't cancel under nonzero) and `DG.zigzag`.
- "0.4s of dead time after the whip pan": the second block starts drawing earlier at 3.12s, with the hand entering as the whip pan ends.
- "The screenshot frame line crosses the cat's head": each frame is first filled with whiteboard color, then outlined, so the front frame covers the back frame's line.
- "'Find the pattern itself' is cut in half by the top edge": the third block moved down 60px as a whole.
- "After pulling out, the gray background and smudges look like a dirty wall": the gray lightened to `#EEEEEC`, smudge opacity halved.
- "The full view holds only 0.15s; the three groups of drawings aren't connected":
  - An orange arrow pointing right was added at the end of the first block, giving the whip pan a direction.
  - At the end of the second block an orange connecting line is drawn leading to the third, so the hand leads the camera.
  - The pull-out moved earlier to 6.85–7.5s, holding the full view for 0.5s.
- "The hand is a cartoon hand with a blue sleeve": changed to a bare forearm with shading and arm hair, closer to RSA's real hand. Still drawn in code.

## QA (skill `scripts/qa.py`, final after revisions)

| Shot | Window measured (seconds in shot) | Motion area% mean/peak | Static frame pairs% | Jump frames | Per-frame time mean/peak ms | Deterministic |
|---|---|---|---|---|---|---|
| y3_s1 | 0.35–2.48 | 3.1 / 5.31 | 0.0 | 0 | 6.5 / 6.9 | ✓ pixel-identical |
| y3_s2 | 0.8–2.23 | 4.65 / 9.57 | 0.0 | 0 | 6.5 / 7.3 | ✓ pixel-identical |
| y3_s3 | 0.85–3.23 | 4.45 / 10.94 | 0.0 | 0 | 8.3 / 9.0 | ✓ pixel-identical |

Transition smoke test (each transition rendered once, slowest frame): y3_s2 (same) 46.9ms; y3_s3 (same) 14ms

How to read it:
- None of the whiteboard film's three shots have jumps: every "transition" is a camera move on the same board, so nothing on the board jumps.
- Motion area of 3–4.7% comes mainly from the hand and the line being drawn, higher during camera moves.
- Under 10ms per frame, since it's all vector lines with no pixel-level processing.

Rerun: `uv run scripts/qa.py --project scripts/engine --film demos/y3_whiteboard --out <dir>` (the table above is from the experiment; the rerun after inclusion in the skill is in the regression table in doc 09).
