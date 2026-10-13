# 29_seurat · 1884 Seurat *A Sunday Afternoon on the Island of La Grande Jatte* (pointillism: an optical-mixing renderer)

> Source: migration test C (built by an independent agent that only read the skill, 2026-10-04). The scene code was ported to `scripts/engine/scenes/29_seurat.js` after integration.

Filename during the experiment: `scenes/k3_seurat.js` (136 lines). About 100ms per frame, frame diff 7.4% (serene; mean adjacent-frame difference 0.45).

**Renderer (the key part; could be extracted into paint.js)**
1. A flat underdrawing of the whole picture, characters included (~3ms per frame). The bottom layer is the underdrawing with `blur(4px) saturate(.85) brightness(1.06)` as a ground color, which shows through the gaps between dots.
2. **Fixed hexagonal grid, equal-size dots**: pitch 10, row spacing 8.66, r 4.5, each dot with ±1.2px static jitter. About 24,000 dots. Dots are collected into 21 Path2Ds by color, and each color is filled only once.
3. **Optical-mixing color choice**: a 21-color pure palette.
   - 14 saturated colors: `#1a2058 #2a3a9a #3f6fd0 #6aaee6 #1f6a52 #2f9a5a #a8c83a #f2cf3a #f08a2a #e0432a #c0306a #7a4aa8 #f8f4e8 #e8b48a`
   - 7 tints (Seurat's "colors mixed with white"): `#f6e49a #f6c48a #cfe08a #b0cff0 #f2b8c8 #c99a4a #9a7ac8`
   - For each pair (i,j), **project** the target color onto the segment Pj→Pi to get a continuous ratio w, clamped to [.2,.8]. Add `0.004·|Pi−Pj|²` to the distance to penalize pairs that are too far apart, so gray isn't mixed from black and white dots. Pick the pair with the smallest distance; each dot uses Pi or Pj according to `hash(i,j) < w`.
   - Results are cached in a Map keyed by the 15-bit quantized color.
4. **Before choosing colors, add ±20 hash jitter to the target color** (R+dj, G+0.8dj, B−0.6dj). The switching boundary between paired colors then becomes interleaved dots instead of vertical color bands.
5. **Complementary dots**: 8% of dots are replaced with the contrasting color (blue↔orange, green↔red-violet, yellow↔violet… 21 mappings in total). **Light seeping**: compared with the point 14px to the lower right, where the brightness difference is >45, there's a 45% chance of a white dot on the bright side and a dark-blue dot on the dark side.
6. **Seurat's own painted border**: a 28px dark-blue band around the edges, also run through the pointillism renderer, so orange complementary dots appear in the band.

**Motif animation**:
- The Seine in the window: sailboats drifting (40px/s), a steamboat smoking, the silhouette of a lady with a parasol + a little monkey.
- The dots on the river reroll their hash at 6fps = shimmer.
- An orange-red butterfly flies over the table indoors (`sin(2.6t)·120`), flapping `|sin(20t)|`.
- At 6fps, 7% of dots switch to their paired color, showing light trembling between dots. The first version used 4fps/3%, and the independent review judged it "basically frozen" (mean adjacent-frame difference 0.1–0.2); at 6fps/7% it rose to 0.45.

**Characters**: an 1880s dark blue-violet long dress + bustle at the back (an arc in the `back` hook) + white high collar + orange buttons + small round hat with a red feather. A closed red parasol leans against the chair back.
**Pitfalls** (both at the renderer level)
- Preferring a single pure color (with the penalty term) slices a gradient wall into a few vertical color bands.
- After switching the ratio to continuous values, paired colors still switch a whole column at once at boundaries, which still produces bands. Step 4's target-color jitter solves it.
- The first version's palette had no tints, so the bright wall decomposed into white + skin tone + scattered blue dots, looking like snow noise.

---
