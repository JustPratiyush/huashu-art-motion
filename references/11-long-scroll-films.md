# 11 · Long-scroll journey films: one person walking left to right through one famous painting after another

The method used for *Huashu Walks Through Famous Paintings* (2026-10-05, 123.7 seconds, 24 worlds). Unlike the art-history speedrun (the same room changing styles), this is **one long horizontal scroll**: each world is a horizontally extended painting, joined end to end; the protagonist keeps walking right, and the moment he crosses a boundary, his style changes along with the world.

Demo: `scripts/engine/demos/long_scroll/`, with 3 segments included (Egyptian murals → Monet's *Japanese Bridge* → 8-bit pixels), about 15.6 seconds.

```sh
uv run --with playwright python scripts/engine/render.py --film demos/long_scroll --stills 1,5,9 --out test-render   # three stills
uv run --with playwright python scripts/engine/render.py --film demos/long_scroll --out long_scroll.mp4              # the whole thing
```

Browser preview: start a static server in `scripts/engine/` and open `index.html?film=demos/long_scroll`; `&only=28_monet,14_8bit` lays out only those segments, `&v=330` tries a different walking speed.

## Files

| File | What it handles |
|---|---|
| `eras.js` | Film entry point: loads the libraries, `FILM_ORDER` (segment order), registers frame libraries, generates one segment with `dur = WORLD.total` |
| `lib/world.js` | The skeleton `WORLD`: timeline (walk → stop to interact → walk), protagonist progress, camera, protagonist split at boundaries, boundaries, corner badge. **Read its header comment first** |
| `lib/crossing.js` | `XING`: reads frame libraries, draws character frames (`XING.actor`), stroke material, the Monet world |
| `lib/acts.js` | `ACT`: small scripting tools (a skipping stone's trajectory, etc.) |
| `lib/xing2_*.js` | Small tools shared by a few segments, loaded on demand at the top of segment files |
| `segments/<id>.js` | One file per world, calling `WORLD.add({...})` |
| `frames/<key>/` | Character frame library: 8 transparent PNGs + `meta.json` (per-frame foot anchor `ax/ay`, size, whether off the ground `air`; `ref_h` is the standing height in pixels) |

## Adding a segment

1. Create `<id>.js` in `segments/`, calling `WORLD.add({ id, year, name, w, hero, acts, back, front, seam })`; the interface is in the header comment of `lib/world.js`. The world itself is drawn in code; preferably adapt an existing style scene from `scenes/<id>.js` into a horizontally extended version (segment width 2000–2800).
2. Generate character frames: a "walk, 8 frames" sheet for each world, plus an "interaction, 8 frames" sheet where there's an interaction, redrawn by an image model in that style, green screen, split into frames (`scripts/key_split.py`, method in doc 10), placed in `frames/<key>/` with `meta.json` written.
3. Add `<id>` to `FILM_ORDER` in `eras.js`.
4. Render stills to check both sides of the boundaries, then run `qa.py --project scripts/engine --film demos/long_scroll`; determinism must be ✓.

## Key conventions (uniform across the film, hard-coded in the skeleton)

- **Ground line `WORLD.GROUND = 760`, protagonist standing height 300, protagonist at 720px on screen.** At both ends of a segment (within ±150px of x=0 and x=w) the ground must return to 760, with the horizon ideally at 480–560, so the two sides join across a boundary. In between there can be bridges and steps (`ground: lx => y`).
- **Time all events relative to "interaction start".** Get the whole-film moment interaction starts with `WORLD.actT(segment)`, `r = S.t - WORLD.actT(ME)`; don't write "N seconds after entering the segment". The whole-film walking speed was later raised from 330 to 560, and not one segment written this way needed changes.
- **The camera only moves forward.** Camera target = protagonist x − 720 + the `lead` given up front during interactions, taking the running maximum and then Gaussian smoothing, so it's monotonic throughout with no jerk on stopping or starting. If an interaction wants the camera to stay put, write `lead: 0`.
- **Each segment's boundary is drawn in that segment's signature language** (`seam`: paper edges, a pixel checkerboard, colored column dividers…) — the long-scroll version of the speedrun's "transition = the next style's signature language".
- **The protagonist's walk frame rate scales with walking speed** (`hero.fps`), one gait cycle per 8 frames; when another layer of the style's material is needed, write `hero.draw(c, key, i, o, S)` in the segment to composite it yourself, without changing the shared library.
- **Music**: picture first, music after. Give each segment a whole number of beats and fine-tune the tempo per segment between 86–104 BPM so every boundary lands on the first beat of a bar (measured max error 11.7ms across 24 boundaries); the ear can't hear ±8% tempo differences between segments.
- **Don't add gags the protagonist wasn't asked to have.** The skeleton has a "stack souvenirs on the hat" feature (`FILM_HAT_ITEMS`), which easily competes with the scene for attention; it's off by default.

More evidence and numbers in `07-proven-practices.md` items 36–38.
