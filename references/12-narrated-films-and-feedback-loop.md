# Full narrated films and the feedback loop

This page collects general methods for producing full narrated films; it doesn't include the author's private feedback archive. The clip interface is still in doc 09, characters in doc 10, and the long-scroll demo in doc 11.

## From narration to picture

First confirm the script, narration and word-level timing, then make the style table and the highlight list. Hang actions on key words (like `TM.cue` in the reference code) rather than hard-coding every time. The camera follows the content's bounding box; the subtitle zone is a constraint in camera space and must be kept clear even when pushing in.

On a whiteboard, accumulate on one big canvas, syncing a block's first stroke with the camera arriving; within a block, write at the speaking pace. After creating the board with `const B = DG.board(...)`, draw rectangles with `B.line(points, {smooth:false})` so a smoothing spline doesn't bulge them into ellipses. A complete list's reading time starts when the last item finishes appearing; drawing time can't be counted as readable hold time.

For Vox collage, first establish the objects, relationships and camera, then add paper texture and decoration. For presenter films, arrange different layouts and shot sizes first; moving the character around in post can't fix a monotonous storyboard.

## Acceptance and freezing

`qa.py` provides determinism, efficiency, motion, smoothness and text-framing cues. Framing detects cut-off text, overlapping text, the subtitle zone and near-blank frames; things like big decorative text can cause false positives, so look at the corresponding frames. For light-background films, `subzone_gate.py` also checks graphics entering the subtitle band; this dark-pixel threshold doesn't apply to textured backgrounds.

Before delivery, an agent that took no part in making the film reviews it independently; long films get at least two. Problems are recorded with timecode, root cause, change and re-verification; regressions of old problems are kept separate from newly found problems. Accept by the specific problems rather than chasing an overall score. If the same kind of problem persists after three consecutive rounds and two different fixes have both failed, go back to the material or the engine's capabilities; upstream script problems go back to the script.

Once the user has chosen, freeze the code, timeline, mix and subtitles together. Candidate films and the frozen version are kept in the project and are not overwritten without confirmation.

## How lessons return to the skill

Each round records phenomenon → root cause → fix → verification → destination. Style-specific problems go into the corresponding grammar card, cross-style methods into doc 09, character methods into doc 10, and anything machine-measurable into QA. Recurring pitfalls are distilled into pre-flight checks, and once turned into engine capabilities, the text rules are reduced. After changes, have an independent agent verify them, and record them in the CHANGELOG.

A project's private feedback, personal likeness prompts and unpublished assets stay in the project; the public skill only takes reusable methods and the necessary evidence.
