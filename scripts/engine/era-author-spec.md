# Era author spec (pure code drawing)

> This is the author spec for the art-history speedrun recreation: the composition coordinates and character settings below apply only to that film and similar speedrun/time-travel films. The general version is `references/08-style-author-spec.md`; for a new topic, compose afresh for the topic.

Each era you're responsible for = one file `scenes/<id>.js`, registered as:

```js
SCENES['<id>'] = { draw(c, lt, t) { /* fill 1920x1080 */ } };
```

- `c`: target 2D context; `lt`: the segment's local time (seconds, counted from the start of this era's transition, may slightly exceed the segment length); `t`: whole-film time.
- **Don't draw the year plate** (the top-right area 1500–1890 × 40–210 is drawn by the engine); leave that area as background and put nothing important there.
- **Don't modify `lib/`, `engine.js`, `eras.js`, `transitions.js` or other people's scene files**. Write any utility functions you need in your own file.

## Available libraries (read the source first)
- `lib/paint.js` → `PAINT`: noise noise/fbm, textures texture/grain/craquelure, hand-drawn lines roughPath/boilSeed,
  style renderers strokes (flow-field strokes, supporting regional palettes via palette)/dabs/mosaic/halftone/pixelate/facets, `swatch` color groups, `choreo` shared choreography, steam, particles, `scratch(key)` offscreen canvas.
- `lib/rig.js` → `RIG`: `RIG.girl(opt)` the girl's skeleton (seated side-on facing left, returning a Path2D per part + anchors `G.A`), `RIG.drawGirl(c,G,pal)` (pal.mode can be fill/line),
  `RIG.cat(opt)` the orange-and-white cat's skeleton (seated facing right), `RIG.drawCat(c,K,pal)`, `RIG.drawCup`, `RIG.smooth(points)` smooth curves, `RIG.taper` tapered limbs, `RIG.ik2`.
- **Benchmark implementation: `scenes/09_postimp.js` (Van Gogh)** — study its structure: flat underdrawing → repaint with the style renderer (regional palettes) → characters flat-filled + fine strokes → add line art → moving highlights.

## Hard requirements
1. **The same scene skeleton**: standard composition — window (350,120)-(810,560), cat sitting on the floor (390,610)-(690,905), table (810,620)-(1200,905), person (1120,200)-(1500,910). Every era in the original aligns to these positions, and the transitions depend on it.
2. **Characters**: the person is a 17-year-old blonde European girl in **that era's clothing for a girl** (modestly dressed); the cat is an **orange-and-white cat** (orange tabby on the top of the head / back / tail; muzzle / chest / belly / paws white).
   They must be based on the `RIG.girl` / `RIG.cat` skeletons and choreography (the same skeleton, the same set of actions), but drawn in that era's way: you may take only the Path2Ds and fill/stroke/silhouette them yourself, add clothing at the anchors, or stylize the skeleton points for the era (e.g., the Egyptian frontal eye, black-figure silhouettes).
3. **Things in the painting must be alive**: the protagonist's actions use `PAINT.choreo(lt,t)` (holding the cup cup, tail flick tail, blink blink, breathing breathe),
   plus 2–4 **small loops taken from the era's visual motifs** — see the "in-shot actions" of each era in `../breakdown/storyboard.md` (e.g., cave animals running in two alternating poses, a scarab pushing the sun ball, a meander band scrolling, Vesuvius smoking, a highlight sweeping across gold leaf, an ornithopter flying past, cherry blossoms falling, light flecks flickering…).
   An era stays on screen for only 0.25–1.4 seconds, so the motion must be **visible** within that window.
4. **The style is made in code**: use renderers/textures/lines to paint it as an artwork of that era, not clip art. Lines may "boil" at 8–12fps (boilSeed) for a hand-drawn feel.
5. **Performance**: ≤ 150ms per frame (1920×1080). Cache static parts with `PAINT.cached`. All randomness is seeded; the same t must draw the same frame.

## References
- The reference film's frame for the era: `../imagegen/ref/<id>.png` (composition, motifs, colors, everything except the counter; extract it from the reference film yourself — it isn't distributed with the skill)
- AI design sheet (same composition, already switched to the blonde girl + orange-and-white cat): `../imagegen/plates/<id>.png` — use it as an art-direction reference; **you may not paste the image into the picture**, only draw it in code.
- In-shot actions and transition origins: `../breakdown/storyboard.md`
- The 60fps reference film: `../source/<reference film>.mp4` (bring your own)

## Selfcheck (at least 3 rounds per era)
```sh
cd <your project directory>   # contains engine/ (copied from scripts/engine)
uv run --with playwright python engine/render.py --solo <id> --stills 0,0.3,0.6,0.9 --out renders/<id>
uv run --with playwright python engine/render.py --solo <id> --from 0 --to 1.2 --out renders/<id>/clip.mp4
```
Lay your frames side by side with the original frames and the design sheet (PIL) and ask yourself: ① is the era/artist recognizable at a glance? ② does the girl look like a 17-year-old blonde girl, and is the cat orange and white? ③ can you see the painting moving within 1 second? ④ are there any glitches (misalignment, broken lines, wrong occlusion, blanks)?
If any item fails, fix it until you're satisfied.

## Delivery
- `scenes/<id>.js`
- `notes/<id>.md`: which techniques you used (renderer parameters, palette, how the motif animation was done, pitfalls you hit). **This is experience to be distilled into the skill**; write it specifically, with numbers.
