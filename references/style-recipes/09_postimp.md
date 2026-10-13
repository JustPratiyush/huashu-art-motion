# 09_postimp · 1889 Van Gogh (benchmark implementation)

File: `scripts/engine/scenes/09_postimp.js`, about 110ms per frame (three full-frame stroke passes). Other eras follow its structure.

## Pipeline
Flat underdrawing (large areas of wall/floor/window/bed) → flow-field stroke repainting (regional palettes) → prop layer (table, chair, vase, picture frames, ceiling lamp; separate small strokes via source-atop) → environment line art (dark blue 4.5px, boiling at 8fps) → characters (flat fill → fine strokes via source-atop → added lines and facial features) → moving highlights (dashed rings of the lamp halo spreading outward, twinkling stars, steam).

## Key parameters
- Direction field: walls vertical −π/2 ± 0.22·noise; floor along perspective lines toward the vanishing point (960,330); starry sky along the tangent of the nearest swirl + 0.3t rotation; lamp halo along circles; headboard vertical, sheets near horizontal.
- Three stroke passes: non-wall non-floor cell10 len22 w6.5; wall cell14 len64 w8; floor cell12 len46 w8. Outline 0.8–0.9, mixing 40–45% dark blue. Reseed at 8fps.
- Regional palettes (P.swatch, mixBase 0.3–0.45): wall `#7f9be6 #5f7fd8 #a7bbf2 #6c6fd2 #8ad0e6 #c3cbf6 #4f6cc8 #9a8fe0`; starry sky `#22339a #2f4fb8 #5c86dc #8fb6ee #1b2a78 #3c6bd0`; floor `#c0573c #a8453a #d7774a #8e3b30 #5f8f6a #c96a52 #e08a5c`.
- 7 rings of orange/light-orange spiral pattern on the cat (clipped to the body, rotating at 0.6rad/s) — the original's "swirl cat".

## Pitfalls
- Running one set of parameters over the whole image smears it into a carpet: wall, floor and everything else must be three separate passes.
- Small objects get shattered by large strokes: always split them into the prop layer.
- Color jitter alone produces "noise in a single blue"; the Van Gogh feel comes from a dozen or so hues in the regional palettes.
