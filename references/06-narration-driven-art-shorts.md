# 06 · Narration-driven art shorts (draft method, to be validated by the first real film)

Goal: from the narration, use a chosen era's or artist's style to make an animation whose shots and images flow coherently. The latest whole-film method is in `12-narrated-films-and-feedback-loop.md`.

> ⚠️ This page is a plan derived from the art-history speedrun engine and **has not yet been run on real narration**. After the first film, delete this line and write back what was measured.

## How it differs from a speedrun film

| | Speedrun film | Narrated short |
|---|---|---|
| Timeline | BPM grid | Word-level narration timestamps (from your transcription tool, e.g., Whisper-style word timestamps) |
| Style | Changes every segment | **One style throughout** (one artist / one era) |
| Camera | Fixed setup | Needs camera language: push/pull, pans, changes of shot size, following |
| Narrative | Skeleton fixed, style changes | Style fixed, content changes with the narration |

## Process

1. **Narration → shot list**: split by sentence; for each sentence decide "what this sentence shows on screen" (a concrete object / metaphor / character action / text), and mark the shot type (wide / close / extreme close-up / push / pan) and duration (from word-level timestamps). Show Huashu 5–10 rows of the shot list before starting.
2. **Fix the style = fix the renderer + palette + line**: pick the closest card in `style-recipes/` as a starting point; for styles that don't exist, write a new renderer following section 3 of doc 04. Make one frame first (three-direction hard gate: the same frame of the same narration sentence in three style interpretations for Huashu to choose from).
3. **A world, not a picture**: narrated films cut between shots, so build the scene as a "world canvas" bigger than the frame (e.g., 5760×3240) with every element in world coordinates; the camera = the viewport (center, zoom, rotation). The renderer acts on the frame drawn through the viewport, with stroke size set in screen pixels, so strokes don't thicken when the camera pushes in — the key to "the painting moving" rather than "an image being enlarged".
4. **Flow between shots**:
   - Within one scene: interpolate the viewport (push/pull/pan) with ease in and out.
   - Between scenes: transition in the style's own language (Van Gogh is strokes swirling away, ukiyo-e is waves, ink wash is bleeding) — the third layer of doc 02's mechanism.
   - Match cuts: the shape of one shot matches the shape of the next (cup rim → moon).
5. **Text and narration**: key words can be written into the painting in that style's lettering/brushwork (mosaic letters, calligraphy, neon), with no generic subtitle bar; subtitles go on a separate track in the edit project.
6. **Music**: doc 05's grid method still applies, except the grid yields to the narration's rhythm (put transitions and musical accents in the gaps between sentences).
7. **Acceptance**: watch side by side with the narration — does each sentence's picture talk about the same thing; does each shot move; is the style recognizable at a glance.

## Division of labor with the video pipeline

Narration transcription, timeline, mixing and delivery go through your video pipeline; this skill is responsible only for the "art animation picture" track, producing a silent MP4 or ProRes as the picture track for the edit project.
