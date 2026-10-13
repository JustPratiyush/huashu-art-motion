# 25_ghibli · 1988 Ghibli-style hand-painted watercolor background art

> Source: migration test B (built by an independent agent that only read the skill, 2026-10-04). The scene code was ported to `scripts/engine/scenes/25_ghibli.js` after integration.

Filename during the experiment: `scenes/c4_ghibli.js` (about 270 lines). Per-frame median 17ms, **first frame 619ms** (caching the watercolor background); frame diff 5.1%.

**Watercolor renderer**
- `deform(pts, depth, amp, r)`: midpoint displacement. Each round pushes the midpoint of every edge along its normal by an approximately Gaussian amount (sum of 3 uniform numbers), with amplitude proportional to edge length (min(1, len/80)), amp×0.6 per round.
- `wash(g, pts, color, {layers, alpha, amp, seed, edge, blend, fill})`: first deform 3 rounds to get the base shape; each layer then deforms 2 more rounds and is filled with `multiply` at low α (transparent pigment glazing), plus a 1.6px same-color stroke at α=edge. The strokes accumulate layer by layer — the **water-mark edge** where pigment settles at the boundary. fill can be a gradient (sky, wall).
- Common parameters: large wall areas layers 5, α 0.4, amp 12; color blooms layers 3, α 0.045, amp 40 (large deformation); wooden boards layers 3, α 0.5, amp 3, edge 0.14; opaque whites (window frame, tablecloth, clouds) use `blend:'source-over'`, α 0.9–0.95.
- Wall = radial gradient wash (light by the window `#fbf3e0` → corners `#dcc49a`) + 28 heavily deformed transparent color blooms (alternating warm yellow, pink, blue-gray, light green) + dark blooms in two corners. Wainscot and floorboards are washed **board by board** in varying tones. Finally a layer of high-frequency paper-grain at `multiply` α 0.3.
- Clouds: opaque white round puffs (16 puffs, edges drawn with wash) + a blue-gray gradient at the bottom via `source-atop`, cached as a sprite. The big camphor tree is also a sprite, rotating ±0.025rad around its roots.

**Cel characters `cel(c, p, base, shade, dx, dy)`**: first fill the whole shape with the shadow color, then inside clip(p) translate the shape toward the light by (−dx, −dy) and fill with the base color, leaving only a crescent of shadow on the side away from the light. Finally a 2.4px warm-brown line `#4a3428`. One function = Ghibli-style two-tone cel shading.

**Motif animation**
- White gauze curtains: two panels, the hem billowing `q²·(90 + 70·gust)`, gust = 0.55 + 0.45·sin(3.2lt + phase), plus small ripples `sin(7lt + 6q)`; 3 semi-transparent wash layers with fixed seeds, so the edges don't boil.
- 360 blades of grass outside the window: the wind comes in gusts, `wind = 0.5 + 0.5·sin(3.1t − 0.018x)`, with phase advancing along x, so you can see a wave of wind sweep across the grassy slope.
- Clouds drift at 22–30px/s; the tree canopy sways gently; 34 komorebi light flecks on the wall (`screen` warm-yellow radial gradients, positions drifting by noise, brightness flickering `sin(5t + 1.7i)`); daisies nodding on the table; the girl's long hair blown back to the right (7-point smooth, pushed by wind); the red bow's ribbons fluttering; the tablecloth's hanging edge swaying.

**Characters**: long blonde hair + a big red bow (a tribute to *Kiki's Delivery Service*, not a copy of the character), teal long dress + white apron + white cuffs; the cat is warm orange + off-white cel. The broom leaning against the wall in the background is an Easter egg.
**Watercolor fill for characters**: the review said "the background looks right, the characters don't (flat vector)". Characters are first drawn to an offscreen layer L; a separate texture layer M (paper grain α 0.8 + 40 transparent color blooms `charBloom`, α 0.1, amp 16) is trimmed to L's silhouette with `destination-in`, then laid back onto the image with `multiply`. The line color was softened from `#4a3428` to `#6a4a38`.
**Curtains**: the review said they didn't billow. gust frequency 3.2 → 5.4, billow `q²·(60 + 150·gust)`.

**Pitfalls**
- With color blooms at α 0.07×4 layers and grain multiplied at 0.5, the wall looked like moldy old parchment. Ghibli rooms are bright: blooms lowered to α 0.045×3 layers and the whole gradient raised one step brighter.
- The first version built the wall from two rectangular washes (darker on the right), and a hard seam appeared at x≈1100. Dark areas must use heavily deformed polygons (amp 60), not rectangles.

**Still room to improve**: the characters are still flat; Ghibli-style highlight blocks in the hair could be added; the light flecks on the floor could include the flowing shadows of the curtains.

---
