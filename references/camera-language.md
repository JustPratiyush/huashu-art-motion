# Camera language: how to use the camera

An expansion of "Director's notes: how to use the camera" in SKILL.md. Every number on this page says **when it applies and when you can ignore it**. The numbers come from measurements of reference films and from films the author has given a verdict on; they're starting points, not quotas. If you have a better camera design, do it, then watch it at normal speed and side by side with the reference.

## 1. Three questions before moving the camera

1. **Where should the audience look at this moment? Can they see it clearly at the current shot size?** If they can, don't move. If the picture moves on its own (live footage, a line being traced, a curve growing, water being poured), there's even less reason to move — a camera move would steal the scene.
2. **Is this move a transition or an accent?** Leading the eye to the next place, establishing relationships, building mood are transitions, and use slow moves. Reveals, twists, a key number landing, a punchline are accents, and only those use fast moves.
3. **What was the previous camera move?** If you pushed in, look for a chance to pull out or pan away; don't push inward shot after shot. Use the same move three times in a row and the audience starts to feel a metronome.

## 2. Move table

| Move | What it's for | Reference numbers | Where the numbers come from | When to ignore the number | Engine |
|---|---|---|---|---|---|
| Hold | The audience is reading text, the picture is moving on its own, the silence after a punchline | Hold as long as the narration needs, no lower or upper limit | Vox still-stretch frame diffs 0.0–0.1; 3b1b's waits are static | — | No move specified |
| Slow push | Leading the eye to the next detail, moving the mood one step forward | 0.6–1.5s, sineInOut; push until "the thing to see is readable", commonly 10–40% | Vox pushing into photos 1.0–1.5s, finding a card 0.5–0.9s; 3b1b's native push about 1s; Heer & Robertson 2007 recommend about 1s with ease in and out for data transitions in statistical charts (about chart transitions, borrowed here by analogy) | For very large pushes (over 2×) it can go to 2s; when following musical beats, follow the beat | `CAM.track`'s `push` (default 0.9s), `to` |
| Pull out | Returning to the whole, establishing "where it is", closing a section, the ending | 0.8–2s, fast start, long settling tail | Vox pull-outs about 1s; Kurzgesagt quick pull-out reveals 0.2–2s, long tail | Scale travel (pulling from a cell out to the Earth) follows the durations in ④ of the y1 card | `pull` (default 1.1s, `MO.longTail`) |
| Pan / find the next piece | Moving from one piece to the next on the same wall or desk; following something that moves | 0.5–0.9s, sineInOut; following a red string 1.3–1.8s, long tail | Measured from Vox | When following a moving object, speed follows the object | `glide` (default 0.7s) |
| Fast push | Accents: reveals, twists, key numbers | 0.25–0.35s pushing 18–32% closer, then hold | The numbers used when the Nobel literature film r3 was approved (doc 07 item 29, which also changed the material and background at the same time); School of Motion kinetic type "camera push 6 frames + 2 frames pulling back" | In kinetic type (y5) the fast push is the main grammar, following the accents; in other grammars it's a minority | `punch`, or `to` with `dur: MO.PULSE.punch` |
| Fast move / whip | A sudden shift of gaze ("I opened my computer → (screen)"), comic rhythm | 0.26–0.30s, with motion blur | y4 whip measured 0.26s expoInOut | — | `pan`, `TRANSITIONS.whip` |
| Slam in | The moment big text, a number, a stamp or a new image lands | 0.17s, 1.55→0.94→1.0 | Done in approved films | At most once per shot; don't slam on every cut | `slam`, `MO.slam` |
| Hard cut / jump-in | Changing shot size without camera movement: reaction close-ups, jumping in one size | 0 frames | y4 storytime: freeze + jump-in, the joke carried by the cut | — | `cut` |
| Slow drift, constant slow push | Atmosphere shots, art-style images where "the painting is always alive", lyrical stretches of music videos, emotional long takes of 5 seconds or more | 1–4%/s as a starting point | No measurements from approved films: these are numbers from the y1 and y2 demo films (4%/s, 1%/s), judged the old approach when used on explainer shots; never rejected when used on atmosphere shots — compare with references side by side when done | **In explainer films, a slow push of a few percent on every shot is PowerPoint** (the film in doc 07 item 29); this particular use is not allowed | `CAM.drift`, `CAM.at` |

Duration constants are all in `MO.PULSE`; `CAM.track` with no kind is a slow push; `pull` without k exactly cancels one default slow push, and the most reliable way back to the whole view is `z: base.z`. The highlight in parameterized clips (t2, y1, y2) defaults to a slow push; only `"camera": "snap"` inside the spec's top-level `data` (`{"data": {"camera": "snap"}}`; writing it directly at the spec's top level (next to grammar) or inside a cue's data has no effect and raises no error) switches to a fast push, and then the whole clip becomes fast pushes, so only write it for the clip that needs an accent.

## 3. Counts and density: when to watch them and when not to

**Principle**: accent moves are like bold in an essay — bold everything and nothing stands out. Pushing in needs give and take.

| Situation | Watch it? | How to judge |
|---|---|---|
| Explainer, science, finance, whiteboard, Vox-style films | Yes | Fast push + slam in + whip on fewer than a third of the shots (lint ⑯); never three pushes inward in a row (lint ⑮); in the final film, a "push-in count" of 8 or more per minute gets a yellow from film_gate — watch it once at normal speed |
| The first 3-second hook of short-video-platform films | Not the density | The hook can be dense; after 3 seconds return to a normal rhythm |
| Kinetic type (y5), music beat-synced sections | Not the fast-push count | The camera follows beats and accents; the rhythm comes from the music |
| Stories, comedy (y4) | Pushes yes, cuts no | Mainly freeze + hard-cut jump-ins; pushes are rare |
| Music videos, emotional films | By the emotion | The author (2026-10-11): "The camera moves and transitions feel monotonous and dry, with no variety and no emotional expression". Verses slow push and slow drift, choruses speed up, instrumental breaks pull out, transition peaks land on beats |
| Art-style speedruns, time-travel films | Not pushes; watch "is the painting alive" | Each scene one main action + 2 motif loops; the camera may drift slowly the whole time |
| 3b1b (t1) | Pushes yes | The camera follows the object to look at: one smooth push of about 1s, still during waits; a fast push only when the conclusion lands |
| Keynote, screenshot tutorials (t2) | Pushes yes | Screenshots full-frame; slow-push only to the part that can't be read when the narration reaches it, once or twice per image, then pull back to the whole image or pan to the next part |
| Finance charts (t3) | Pushes yes | The camera holds while the chart grows on its own; slow-push about 1s when pointing to a piece of data; only the one or two most important numbers in the film get a fast push |
| Kurzgesagt (y1) | Pushes yes, not the environment layer | The environment layer may keep moving gently; slow-push to name a node; diving in and pulling out follow the scale-travel durations |
| Vox investigation desk (y2), whiteboard (y3) | Pushes yes, pans freely | A whole world canvas, where panning between pieces is the main grammar and can be used consecutively; push in for the line to be read, then pull out once it's read |

**Negative benchmark**: on 2026-10-12, a portrait Nobel economics short, 102 seconds and 44 shots, pushed in about 48 times in code (one every 2.1 seconds on average), all inward, each a 0.28-second push of 10–26%, with almost no pull-outs or pans. The author: "So, so many zoom-in camera moves. Far too many, and too fast. Not smooth at all." film_gate measured about 12 push-ins per minute on this film (a lower bound; half of the push-ins on live footage can't be measured).

## 4. When real material is full-frame: the easiest trap

When each shot is one full-frame photo or piece of footage, the only thing the camera can do is push in, so the whole film becomes "cut to one, push in, cut to one, push in". That Nobel short was exactly this. Remedies:

- **When live footage is moving on its own, hold**. If people in the footage are walking and hands are moving, adding a push makes the audience feel it's shaking.
- **Push into an image at most once or twice**, and only when "this part can't be read in the full view". Pushing in every time a noun is spoken is supplying a metronome for the narration.
- **Change how you enter**: pull out from a close shot to reveal the whole; pan in from one side; hard-cut from the previous shot's landing point at the same shot size.
- **When several pieces of material are discussed in a row, lay them on the same world canvas** (`MD.print` photo prints on the investigation desk, see the y2 card), with the camera panning between pieces; push-ins and pans then alternate, giving and taking naturally.
- **A cut doesn't mean you have to push in again**. Starting every shot at 1.0 and pushing adds up to one zoom-in after another.
- **The investigation desk isn't material shrunk down and laid out**. When the camera rests on a piece, it should take 80–90% of the frame (y2 card); large areas of desk should only show while moving and in the closing pull-out. In the A/B of 2026-10-12, the version under the new rules switched to the investigation desk and push-ins dropped from 15 to 8, but when it stopped, photos took only half the frame width and too much beige desk showed.
- **For a landscape illustration in portrait, crop before placing**. A 16:9 illustration placed whole into 9:16 leaves only a strip in the middle with empty space above and below; crop to a vertical composition around the part the narration is discussing, then make it a photo print or full-frame, keeping the whole image only for the closing pull-out. Two independent agents each hit this on the same day.

## 5. How to selfcheck

- At the shot-list stage: `storyboard_lint.py` checks for three shots in a row with the same move (hold doesn't count), three pushes inward in a row, accents on more than a third of the shots, and a whole table with no moves at all.
- At the final-film stage: a yellow "push-in count" from `film_gate.py` means you push a lot — go look; a red "fast-motion frame ratio" means the whole film barely moves. Note: a slow push of about 1 second by 20% scores about the same on this measure as a 0.28-second fast push (measured on three shots of the Nobel short on 2026-10-12: a 0.28s push counted 3 fast-motion frames, a 1.0s push 4–7, a 2.0s push 3–10), so there's no need to speed up the camera just to pass the gate.
- **Whether camera moves are smooth can't be seen in sampled stills**. A collage of stills only shows composition; for camera rhythm you must watch the final film from start to finish at normal speed, at least the densest 30 seconds.

## 6. Sources and history

| Date | Film | What happened | Where it lands on this page |
|---|---|---|---|
| 2026-10-08 | A Nobel literature science film, r2 → r3 | r2 pushed in a constant 7.5% on every shot, with a fixed beige background, title bar and picture frames, and was judged "exactly like a PowerPoint being played"; r3 changed four things at once: full-frame live footage, a dark real environment, no page frames, and hold → 0.28s fast push → hold, and got "much better now, just publish it when it's done" | "Not allowed" in the slow-drift row, and the source of the fast-push row. Four things changed at once, so it's impossible to tell which one did the work; yet only "fast push at every narration beat" was later written as a rule, which just changed the speed of the "same move on every shot" disease. Looking back on 2026-10-12, the author said "the literature film was mediocre, the physics one was quite good" |
| 2026-10-10 | Opening of "A day in the life of Claude" r4 | "Very nice, keep going at this rhythm": a slam, a 0.35s violent pull-out into a cutaway panorama, a paper airplane panning across, floating dust added in the stills | What was approved was a mixed set of moves, including a pull-out and a pan |
| 2026-10-05 | SpaceX whiteboard | The author chose r6; r17 had 5 more push-ins than r6 (not confirmed whether this was what won the author over) | To be confirmed |
| 2026-10-11 | Qilixiang Monet music video | "The camera moves and transitions feel monotonous and dry, with no variety and no emotional expression" | The music-video row in section 3 |
| 2026-10-12 | Nobel economics short | "So, so many zoom-in camera moves. Far too many, and too fast. Not smooth at all." | The negative benchmark in section 3, and section 4 |
