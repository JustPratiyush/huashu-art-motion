# 08 · Style author spec (general version, for people writing scenes and agents sent out to do so)

> Replaces the early `era-author-spec.md` that was tied to the recreation project. When sending an agent to paint a style, give it this page's path plus the specifics in the "this project" section.

## Interface

A style segment = `scenes/<id>.js`:

```js
SCENES['<id>'] = { draw(c, lt, t) { /* fill 1920×1080 */ }, init(IMG) { /* optional: one-time precomputation */ } };
```

- `c` the target 2D context; `lt` the segment's local time (seconds, counted from the start of this segment's transition); `t` whole-film time.
- Segment table `eras.js`: `{ id, eighths or dur, transition: { type, dur }, counter: {...} }`. Film length is computed automatically from the segment table.
- Transitions `transitions.js`: `TRANSITIONS.<name> = (c, A old, B new, p, o) => {}`.
- A missing scene file, a syntax error, or an unregistered scene → the engine refuses to start, and render/qa error out immediately. Don't judge success by "it looks like it rendered".

## Read first (in order)

1. `references/02-mechanisms.md` (the five-layer mechanism, only for speedrun/time-travel films), `04-pure-code-drawing.md` (pipeline, renderer quick reference, pitfalls), `07-proven-practices.md`.
2. `references/style-recipes/INDEX.md`: find the closest style as a starting point and read its card.
3. The benchmark implementation `scripts/engine/scenes/09_postimp.js`; the scene source of the closest style.
4. `lib/`: `paint.js` (noise/textures/renderers/palettes/choreography), `rig.js` (character skeletons, visibleLines), `kit.js` and other utility libraries. **Check whether the library already has it before writing your own.**

## Two starting points

**With a reference film**: first run `scripts/analyze/breakdown.py` to get reference frames (`ref/segNN.png`), motion heatmaps and transition contact sheets, and break it down per doc 01. Reference frames decide composition, motifs and colors; heatmaps decide "what moves in the painting".

**Without a reference film** (more common):
1. Write down the style's 3–5 most recognizable formal elements (material, brushwork, colors, motifs, traces of the medium). Check primary sources (images of original works, art-history descriptions); don't go by impression.
2. Give each element "a way to move" — how it would naturally move in that painting's world (water trembles, paper flutters, gold glints, prints misregister, film shakes).
3. Work out how this kind of picture is actually made in reality (brushed, carved, printed, pasted, inlaid, sprayed, rendered), and write that physical process as the renderer.
4. Make one frame first: compare a still collage against the original works, and only make it move once it's recognizable at a glance.

## Hard requirements

1. **Composition**: speedrun/time-travel films follow this project's given composition coordinates (consistent across segments; transitions and "the same character traveling through time" depend on it). Other topics compose for the topic: the style decides how to compose and how to light, without reusing the demo room's coordinates.
2. **Characters**: speedrun/time-travel films use the `RIG` skeletons and shared choreography, changing the drawing method but not the staging or action; other topics design characters and staging for the topic (people via AI-generated frames, see doc 10). **Characters must also get the style's material treatment** (strokes, grain, multiplied paper texture, ink-bleed edges, halftone, misregistered plates…), otherwise they look like pasted-on clip art — the most common weakness across the 36 styles. When you need line art, use `drawGirl/drawCat` with `mode:'line'` (it already goes through visibleLines internally, so lines don't draw through other parts).
3. **The painting is alive**: a main action + 2–4 small motif loops, visible within the time on screen. In speedrun/time-travel films character actions use whole-film time (things like `PAINT.cupCycle(t)`) and don't reset between segments.
4. **Smoothness**: don't reshuffle the whole screen by reseeding at a low frame rate (it reads as flicker); boiling is only for line art or motif areas. Deliberate "stepped frame rates" (rubber hose 12fps, shadow puppets 10fps) use `stepTime` — that's the style, not stutter. A scrolling pattern's modulo period equals the pattern's true period.
5. **Determinism**: all randomness is seeded; rendering the same t twice is pixel-identical.
6. **Performance**: static parts via `PAINT.cached`; offscreen layers that read pixels use `willReadFrequently` and `g.reset()` every frame; target ≤150ms per frame (QA measures real time with a GPU flush).
7. **Text**: text in a style should preferably be drawn as paths in that style's material; when using a font, first verify the glyphs exist with `U.assertGlyphs` (missing glyphs silently fall back to a system font).
8. **Aging stays off the characters**: peeling, stains and scratches only on the background; set protected areas over the characters (Dunhuang peeling spots on the back read as "holes in the clothes").

## Selfcheck and delivery

```sh
uv run --with playwright python <project>/render.py --solo <id> --stills 0.4,0.6,0.8,1.0 --out <renders>/<id>   # stills
uv run <skill>/scripts/qa.py --project <project> --ids <id>                                                    # numbers
```

At least 3 rounds per segment: compare stills against original works / a reference collage → check QA for motion / static frame pairs / jumps / timing / determinism → fix. Four questions: ① is the style recognizable at a glance? ② are the characters right, and do they blend with the background? ③ can you see the painting moving within its time on screen, without flicker or stutter? ④ are there any glitches (occlusion, broken lines, misalignment, blanks, overlapping text)?

Delivery: `scenes/<id>.js` + a recipe card (in the `style-recipes/` format: pipeline, key parameters and color values, how the motif animation is done, signature transition, performance, pitfalls, room for improvement), written specifically and with numbers. **For multi-segment films, before delivery send an agent that took no part in making it to review only the finished film.**

## The three-direction hard gate when unattended

With Huashu present: new style directions and character interpretations are first shown as three options on the same frame for him to choose.
With nobody to ask (automated tests, overnight batches): follow the direction given in the brief, and in the delivery notes list one sentence each for "the two other directions that could have been offered", for him to choose when he's back.
