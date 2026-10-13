# 07 · Proven practices: which approaches have been shown to work

This page records reusable approaches from practice, with evidence and conditions of use.

It records only **things that went right**: the method, the evidence (what was measured / who reused it successfully in what situation), why it works, and when to use it. Pitfalls live in each reference's "Pitfalls" section. Every entry has a source; when someone later reuses it successfully, add a line to the evidence, and when reuse fails, write down the boundary clearly.

---

## 1. Direction and mechanisms

**1. Transition = the next style's signature language.**
- Evidence: all 15 transitions in the art-history speedrun were designed this way; independent agents in migration tests A and B both rated it "the most valuable, most transferable sentence in the whole skill", and the 9 new transitions (gold leaf spiraling out, Scream color bands pressing down, apsara ribbons peeling off the old painting, polka dots growing, melting drips, hard-edged sunlight, wet paper bleeding, VHS tearing…) followed almost directly from this sentence, without detours.
- Why: a transition does two things at once — saying goodbye to the old style and announcing the new one. Within 0.3 seconds the audience knows "who's next".
- How to use: list the new style's most recognizable formal elements (material, brushwork, motifs, media glitches), pick one that can go "from nothing to full", and make it a process that grows out of an object in the picture (cat, cup, head).

**2. Speedrun/time-travel films: one skeleton, one choreography, N ways of drawing = "the same pair of characters traveling through time" for free.**
- Evidence: RIG.girl/RIG.cat return Path2Ds + anchors, reused by all 36 styles; A and B both said "when the style changes, the girl and cat stay in place, with position and motion automatically consistent — this effect comes for free".
- How to use: only for "same scene, changing style" speedrun and time-travel films: first fix the character skeleton and motion curves, then write the styles, with styles changing only "how it's drawn", never "where it is or how it moves". For other topics, compose for the topic — the style itself can determine the composition — and don't reuse this skeleton's staging.

**3. The protagonist's actions must be continuous across segments, driven by whole-film time.**
- Evidence: the first version of migration test A had her drink again in each segment by local time; the review said "the audience sees her lift the cup five times, not the same instant in five styles"; after switching to whole-film time (`PAINT.cupCycle(t)`) the poses matched on both sides of each transition, and the "two heads" glitch disappeared.
- How to use: in speedrun/time-travel films, character actions always use whole-film time t; only "performances specific to one segment" use local lt.

**4. Beat grid + beat punch applied to both the old and new layers.**
- Evidence: v1 punched only the new layer, and the review measured the first 6 of 15 transitions dragging behind the beat by 0.1–0.17s; after punching both layers at once, the first visible change of all 15 transitions landed on the beat (±2 frames), with beat-frame differences of 7–33.
- How to use: in any beat-synced edit, the beat frame must have a visible whole-screen change.

**5. Open by letting the first painting "draw itself".**
- Evidence: in migration test A's ink segment, the strokes are written out by reveal and the ink bleeds over the first 0.45 seconds; the review approved, and frame 0 is no longer a blank sheet.
- How to use: when the film's first segment has no transition to borrow, open with that style's "painting process" (strokes written out, print colors laid down plate by plate, pixels lighting up row by row).

## 2. Visual beauty

**6. Regional palettes matter more than color jitter.**
- Evidence: the first Van Gogh had only color jitter and was "noise in a single blue"; only after each region got a 7–8 color group (`P.swatch`) did it become Van Gogh. A's Munch (one group each for sky/fjord/mountains/wall/floor) copied it directly and succeeded.
- How to use: for any stroke/dot style, first set color groups by region, draw each stroke's color from its group, then mix in 30–45% of the underdrawing color to keep the values.

**7. Leave large areas to the renderer, put small objects and characters on their own layer, add lines last.**
- Evidence: sunflowers and table legs were shattered into a mess by large strokes, and became clear once split into layers; B's Hopper "two-version light and shadow clipping" generalizes this.
- Boundary: ink wash, printmaking and pattern pipelines use a different order (paper is the ground, ink is only added; the pattern itself is the renderer), see doc 04.

**8. Characters must go through the same renderer, or they look like pasted-on clip art.**
- Evidence: of the 36 styles, those where characters also went through the renderer (Van Gogh fine strokes, mosaic tiles, 8-bit pixels, cubist facets, black-figure silhouettes, shadow-puppet cut-outs) blend in best; those using only a flat-filled vector rig (ink-wash figures 6/10, Ghibli figures "like flat vector", Dalí "leaning toward vector illustration") are the weakest point of each segment.
- How to use: after flat-filling a character, do at least one "material treatment of that style" — strokes, grain, multiplied paper texture, ink-bleed edges, halftone, misregistered plates.

**9. Text in a style drawn as paths has more style than text set in a font.**
- Evidence: B's blocky Cyrillic letters (5×7 module) and neon-tube kana; Rome's mosaic letters (uniform thick strokes, each stroke ≥2 stones wide). Characters missing from a font subset silently fall back to a system font and look different on another machine.
- How to use: titles, signs and inscriptions should preferably be drawn as paths in that style's material; when you must use a font, verify the glyphs exist first.

**10. The physical process of the material is the renderer.**
- Evidence: ukiyo-e "fill offset (3,2)px from the key line + bokashi horizontal brush marks" = woodblock color printing; mosaic "layout computed once, colors flowing through the stones every frame" = how a real mosaic animates; gold leaf "horizontal brushed noise with y frequency 20× x" gives a metallic feel in one go, reused directly by A's Klimt.
- How to use: before writing a new renderer, ask "how is this kind of picture actually made in reality?", then write that process as code.

**11. Make small things bigger than your instinct says.**
- Evidence: ukiyo-e wave claws at 22–50px didn't read; only at 44–74px did they read as *The Great Wave off Kanagawa*; A had to enlarge Qi Baishi's shrimp 1.45× and the apsara 1.35× before they read.

## 3. Motion

**12. Art-style images: each scene = a main action + 2–4 small loops taken from that style's motifs.**
- Evidence: simply cutting between images can't express motion within the painting; the 16 segments done this way have QA motion area of 1.6–14%, all without jumps.
- Boundary: this applies to art-style images (the painting must always be alive). Explainer shots follow item 29: move on events.
- How to use: the list of motif motions comes from the breakdown's motion heatmap; without a reference film, list the style's 3 most recognizable formal elements yourself and give each one a way to move.

**13. Let the direction field change continuously over time instead of reshuffling by reseeding at 8fps.**
- Evidence: a whole-screen reshuffle at 8fps gave frame diffs of 18–20 (bigger than the transitions), and the review read it as "the painting is flickering"; with fixed stroke positions and a continuously swaying direction field, jumps 0 and motion area 9%. Boiling is kept only for line art.

**14. The modulo period of a scrolling pattern equals the pattern's true period.**
- Evidence: A's polka-dot dress wrapped by the dot spacing, and the whole thing jumped on the wrap frame (frame diff 2.7×); wrapping by two rows of the hex grid fixed it.

## 4. Stability and efficiency

**15. Spec + benchmark implementation + parallel agent groups pass on the first try.**
- Evidence: 16 eras in 4 parallel groups, 30–35 minutes per group, all delivered usable on the first try; afterwards the 4 groups of migration tests (20 new styles) also delivered on the first try. The spec spelled out the interface, available libraries, hard requirements, selfcheck and delivery notes; the benchmark implementation let the "five-layer structure" be copied.

**16. Always send an independent review agent before delivery, watching only the finished film.**
- Evidence: the recreation v1 review caught 4 kinds of problems — dragging the beat, whole-screen flicker, too static, an out-of-place cat; the migration A review caught "lifting the cup five times", "two heads" and "transparent arm"; the B review caught "ЧАЙ read as ЧАИ" and "the pink top looks like she's not wearing clothes" — none of which the makers found in 3 rounds of watching their own work.

**17. Accept by numbers: qa.py.**
- Evidence: motion area, static frame pairs, jumps, real timing (forced GPU flush), determinism — 16 segments checked in 40 seconds. Looking only at the first-vs-last difference misses stutter (A: Klimt changed 33% but 14/48 frame pairs were static); measuring only JS time reports a fake 1ms (B).

**18. All randomness is seeded; rendering the same moment twice is pixel-identical.**
- Evidence: all 36 styles pass cold/warm render comparison; renders don't flicker, and segments can be re-rendered separately and joined.

**19. Cache all static parts; draw only what moves each frame.**
- Evidence: Bauhaus 2.5ms, pop 5ms, 8-bit 3ms; 4 of B's 5 segments cache their whole background. The heaviest, Van Gogh (three full-frame stroke passes), at 117ms still renders a whole film at 60fps within 2 minutes.

## 5. Breakdown and references

**20. Use reference frames as image-generation references to lock composition; overlay a grid on AI design sheets to read keypoints.**
- Evidence: gpt-image with original frames as references overlays the original at 50% almost pixel for pixel; the first version of the girl's skeleton with hand-written coordinates looked like a boy, and after overlaying a 20px grid to read points, one round made her read as a 17-year-old blonde girl.

**21. The motion heatmap tells you "the painting is alive" before you start.**
- Evidence: before looking at the heatmap I thought each segment was a single painting; the heatmap showed 2.5–34% of each segment's area moving, which directly determined the whole approach.

**22. Fit the grid with "the largest step with 80% inliers".**
- Evidence: least-residual fitting picks a tiny step that forces all points to fit; after the change, 16 detected points fit a step of 14.1 frames (eighth notes at 128 BPM), with 3 false detections flagged as outliers.

## 6. Scaling up (evening of 2026-10-04, integrating 36 styles)

**23. Let independent agents build their own wheels first, then unify into a library.**
- Evidence: the 4 migration-test groups each wrote brushes/renderers/post-processing; integration merged them into brush.js (7), render.js (14) and post.js (6); after porting 20 segments to the unified library, 16 were pixel-identical to the original project outside the character boxes — the library's API is enough to carry real use.
- Why: unifying the library first designs abstractions nobody uses; let real styles grow first, and only what appears twice or more goes into the library (the converse of "three repeated lines beat premature abstraction" holds too: repeated three times means it's time to collect it).

**24. The migration test itself is the best requirements document.**
- Evidence: a brief of "read only the skill, build a style the skill doesn't have, write feedback" got 4 agents to return over 60 specific issues (silent fallbacks, hard-coded film length, timing without flush, skeleton bugs, mislabeled dabs), each with a reproduction scenario; none of these surfaced in the author's own use.
- How to use: every time the skill gains a big capability, send 2 agents that only read the skill to do problems they haven't seen, and ask for "what helped / where it got stuck".

**25. Acceptance tools must be accepted too.**
- Evidence: qa.py was once all green, but integration revealed it never executed transition code at all — a transition referenced a nonexistent function and crashed the whole frame without being reported; only after adding a "transition smoke test" was it caught. The glyph check using measureText comparisons missed failures on Mac, so it was changed to read the font file's character map.
- How to use: deliberately cause each check item to fail once (delete a scene, write a broken transition, use a missing glyph) to confirm it really goes red.

## 7. Video animation grammars (evening of 2026-10-04, 5 YouTube + 3 tech/finance)

**26. Measure sample films before defining the grammar.**
- Evidence: G1's first Vox used a torn-paper transition, but counting 5 Vox samples frame by frame found it not once; the whiteboard's first version pushed into a thought bubble, which isn't in the RSA samples either. G2 measured one TheOdd1sOut episode: average shot 2.4 seconds, 70% of adjacent frames completely still — the opposite of the intuition that "animation should always move".
- How to use: before making a grammar, run `breakdown.py` on 2–5 representative works to measure shot lengths, the proportion of stillness, and kinds of transitions, then write the card. Your impression of a "style's features" is often someone else's.

**27. The camera depends only on whole-film time; transition functions only composite two shots.**
- Evidence: Kurzgesagt's 60× scale travel is redrawn in vector throughout and doesn't blur; the "transitions" of the Vox desk and the whiteboard are camera moves themselves, QA jumps 0. G3: push transitions let the old shot keep pushing its own camera instead of enlarging a screenshot — to pass through a circular object, magnification ≥ 1100/radius, otherwise the last frame jumps.
- How to use: world canvas + viewport; never do zoom transitions on a rendered bitmap.

**28. The "reveal" frame is the accent.**
- Evidence: G2's kinetic type set segment starts at "bar line − reveal point × transition duration", putting every visual event on the same frame as the kick. Item 4 (beat punch on both layers) is the same principle in another case.

**29. Stillness isn't stutter; but "something moves in every shot" and "a slow push on every shot" are the same disease.**
- Evidence: storytime's 70% still frames are the style (the joke lives in "cut to the reaction close-up and shut up"); kinetic type's words don't move once landed, with energy left to the camera and background. A Nobel literature science short (2026-10-08) with the same narration, same assets and the same 31-shot storyboard: r2 pushed in a constant 7.5% on every shot, with a fixed beige background, title bar and picture frames, and the author said "it feels exactly like playing a PowerPoint, terrible"; r3 switched to full-frame live footage, a dark real environment, no page frames, and the camera changed to hold → a 0.28-second push of 18–32% → hold, 0.30-second same-zoom pans and 0.17-second slams, and was approved. Fully still frames went from 16% to 72%, fast-motion frames from 0.7% to 10%. Four things changed at once, so it's impossible to tell which one did the work. Afterwards "fast push at every narration beat" was written as a global rule, and on 2026-10-12 a 102-second Nobel economics short pushed in about 48 times, all inward; the author said "far too many, and too fast, not smooth at all"; the same day the author looked back at the literature film: "the literature film was mediocre".
- How to use: QA's "static frame pairs >40% reads as stuck" doesn't apply to explainer, story and text grammars; holding is right. The root of looking like PowerPoint is "the same move on every shot", whether that move is a slow push or a fast push. Move the camera according to "where the audience should look at this moment": transitions use slow pushes, pans and pull-outs (0.6–1.5 seconds), with fast pushes and slams reserved for accents; after pushing in, give and take. The move table and when to watch counts are in `camera-language.md`.

**30. Reviews must check logic and how numbers are stated, not just the image.**
- Evidence: the G3 review caught "output neurons connect to the hidden layer, not to pixels", "'rose by 9×' should be 'rose to 9×'", "the monthly line's end ¥268 doesn't match the daily candles' end ¥286.40" — all three perfect images with wrong content. Hard rules for finance charts: no misleading truncated axes (if truncated, say "y-axis does not start at 0"), units, source, illustrative-data badge.

**31. One focal point per screen; structure first, then data, then label just one thing.**
- Evidence: kinetic type "the main word slams in, the rest rises from a mask"; finance "axes first, then data, then label just one thing"; 3b1b "one color for one concept, morphing turns the previous concept directly into the next, almost no cuts" — three grammars independently reached the same conclusion.

## 8. Characters

**32. Leave people to image-generation models and let code only composite — divide the work by "who's good at what", not by "purity of approach".**
- Evidence: in a three-direction comparison of the same frame, the code-drawn chibi was judged "absolutely awful", while G2's frame library and AI frames redrawn in the art style were both "very good"; the most common weakness across the 36 styles is also characters. Code is good at regularity (stroke fields, geometry, camera moves, timing, physics, determinism); models are good at getting human faces and figures "right".
- How to use: see doc 10. First ask "who draws this best" for each layer, then decide what to draw it with.

## 9. Hooking into a narration pipeline (night of 2026-10-04, measured end to end)

**33. Render clips by the final film's frame count, taking the window from the final film's timeline — no need to care about cuts or speed changes.**
- Evidence: between the two beats to be replaced was a 3.65-second pause removed in the rough cut, and the rough cut was also sped up overall; rendering them as one continuous stretch of final-film time (119 frames) and swapping it in, after compiling that shot's `rate` = 1.0, and 119 rendered frames = 119 shot frames; only 1 chapter (30–57 seconds) was re-rendered, the other 7 untouched. Checking the chapter frame by frame against the clip, frames where the picture moves 28/29 and 127/137 projected offset 0 (the rest is encoding noise, symmetric positive and negative).
- Why: the pipeline's directing layer uses source seconds and the final film uses final seconds, while the animation lives only in the final film. Taking the window from the final timeline sidesteps three conversions: speed changes, cuts, and "a beat's end = the next one's start".
- How to use: in a narration pipeline, write a small script wrapping three steps — "draft (take the window from the final timeline, produce a draft spec) → render → verify (check sync frame by frame)"; see "Clip contract" in doc 09.

**34. Cues name "which word", not "which second", and are converted to frames just before rendering.**
- Evidence: the error between the reveal frame and the word start for 5 cues (bars growing, an annotation popping, a clipping appearing, two highlighter sweeps) was −0.48 to +0.09 frames, all from rounding to frames; when the narration changed and the window's frame count changed, render rejected it outright instead of silently misaligning.
- Why: seconds are secondhand numbers copied from the word list, and every copy is a chance for error; the word is the director's real intent (the annotation pops when a certain number is spoken), and conversion is left to the script.
- How to use: `{"word": "7.8", "kind": "highlight"}`; add `nth` for repeated words, and `offset` to come earlier.

**35. Real screenshots in portrait: split into two highlighter sweeps by the half sentences the narration reads, each on one key word.**
- Evidence: with a box over the whole paragraph (width 0.93) there was no room for the red circle and the camera couldn't push in, leaving body text about 20px tall, unreadable on a phone; split into two half-sentence boxes per the narration, each on one key word, a 2.4× push gives text about 50px tall; when the second box was off-screen, the camera moved over first before revealing.
- Why: portrait's bottleneck is frame width, so one focal point can only be half a sentence; Vox is already a "look at this sentence" grammar, and circling sentence by sentence with the narration fits perfectly.
- How to use: crop screenshots from untouched frames (keep a copy of the `_source_frame`), render one still with `--stills` to check the rect first; eyeballed rects are often off by 20–30%.

**36. Grammars with text make room for the subtitle band, rather than making the subtitles move for the animation.**
- Evidence: t3's original portrait layout put annotations at y≈1460, overlapping the burned-in subtitles (1400–1520); with `safe` the chart is laid out at 300–1430, the same safe area as the other contained material in the film, with zero overlap in sampled frames. The first independent review said "a full screen of pure white sandwiched between dark screenshots is the most obvious brightness jump"; adding `safe.fill` = the film's background color turned the strips above and below into the same dark background as the adjacent screenshots, making the chart a card in the same position.
- Why: subtitles are burned in uniformly at export, so moving them per section means touching the export chain; the animation is parameterized, so moving itself is cheapest.
- How to use: write `safe` in the spec (the pipeline's draft step computes it from the ASS and contain_box).

## 9. From demo films to reusable clips

**33. A good demo film ≠ still good once parameterized; parameterization needs its own review.**
- Evidence: all 8 grammars' demo films passed independent review, but reviewed again as spec-driven clips, only 3 were usable as-is: swapping in real data exposed tick-rounding errors, category labels being thinned away, and the big number covering the line head; subtitle-clearance parameters were ignored in 6 of 8; the camera left before text cards finished typing; the whiteboard's last-frame pen covered the word "not" and reversed the meaning. A demo film's input is hand-picked by the author; a clip's input comes from the pipeline.
- How to use: reviews of parameterized clips must change the input — negatives, decimals, long titles, portrait, no screenshot, transparent background, overly long text — feeding at least one "unfriendly" spec of each kind; the sample assets used for acceptance must themselves be clean (don't use a table-of-contents screenshot as an example).

## 10. Hooking into narrated videos

**34. Render animation segments by "final duration + word-level timing", with keyframes landing on key words.**
- Evidence: in a copy of a portrait narrated film, two segments in one chapter were replaced with animation (a t3 finance chart explaining a comparison of numbers, a y2 Vox push into an official source screenshot); frame counts matched the shots exactly, with 7 key words off by −0.48 to +0.09 frames.
- Why: animation appears only where screen recording can't explain clearly (a comparison of numbers, an official quote), with the real person and screen recordings before and after; visual events reveal only when he says that word, as if he were pointing as he talks.
- How to use: give the beat → take the final duration and word-level timing → generate the spec → render → freeze and backfill (interface in "Clip contract" in doc 09). Numbers come only from the source table, with the source written on the chart.

**35. Don't add narrative gags he didn't ask for.**
- Lesson: decorations piling up on a character pull attention away from the scene; narrative gags should be confirmed in a sample first.
- How to use: what a review says is "missing" is information for him to judge, not permission for me to add things directly; to add a structural gag, show it to him first in a sample or direction note and wait for a yes.

## 2026-10-05 00:34:23 +0800 · Assigning grammars within one narration by explanatory task

Method: real original posts / sample drafts use the Vox material desk with line tracing and highlighting; rules / controlled variables / sound-picture relationships use 3b1b continuous object transformation; fix the voice, subtitles and timeline first, then replace the picture. Evidence: in one narrated film, 467.8 seconds of voiceover and 270 subtitles were reused after rebuilding the entire art style, and the AAC raw packet hashes of the final two MP4 versions matched the locked mix; no post-release retention data yet. Why: the picture carries the explanatory action of the corresponding section and the material serves readability; the grammar allows stillness after reading a chart or a derivation, without decorative background micro-motion to pad the motion numbers. When: narrated films alternating between real material and mechanism explanations.

## 11. Long-scroll journey films (Huashu walks through famous paintings, 2026-10-05)

**36. One skeleton file + parallel segments: 24 worlds from 4 agent groups joined in one go.**
- Evidence (the skeleton and 3 of the segments are included in `scripts/engine/demos/long_scroll/`; method in doc 11): `lib/world.js` defines only the segment interface (width, ground line, walk frames, interaction at/dur/frame, back/front/seam), the protagonist's progress, the protagonist split at boundaries, and the corner badge; four groups wrote 6 segments each, which sorted by era joined into a 123.7-second film in one go, QA determinism ✓, jumps 0; the review checked ground height and protagonist continuity across all 23 boundaries and all passed. The key was hard-coding whole-film constants (ground line 760, height 300, walking speed) in the skeleton.
- How to use: for a long film, write the skeleton and interface first, then dispatch the groups; in the interface, **time all events relative to "interaction start"** (`WORLD.actT`, `item.atAct`), never "N seconds after entering the segment" — the whole-film walking speed was later raised from 330 to 560 and no segment needed retiming.

**37. Fine-tune each segment's tempo so musical boundaries land on the first beat of a bar.**
- Evidence: with 24 fixed boundary times, a single BPM was off by 112ms at best; with a whole number of beats per segment and tempo adjusted per segment between 86–104 BPM, all 24 boundaries landed on the first beat of a bar, max error 11.7ms, mean 3ms.
- How to use: when the picture comes first and music after, don't insist on a single BPM; the ear can't hear ±8% tempo differences between segments, but it can hear an instrument change missing the downbeat.

**38. The camera only moves forward.**
- Evidence: in v1 the camera moved ahead to make room during interactions and came back at the end; 17 of 24 segments had 68–256px of "rewind", which QA couldn't measure but the review spotted at a glance. Changed to "target position = running maximum + Gaussian smoothing", giving 0 backward moves in the whole film, with no jerk when stopping or starting.
- How to use: for a horizontal long scroll following a protagonist, make the camera position function monotonic; better still, add a "camera backtracks" count to QA.
