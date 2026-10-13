# 30_matisse · 1947 Matisse *Jazz* cut-outs

> Source: migration test C (built by an independent agent that only read the skill, 2026-10-04). The scene code was ported to `scripts/engine/scenes/30_matisse.js` after integration.

Filename during the experiment: `scenes/k4_matisse.js` (167 lines). About 25ms per frame, frame diff 9.3%.

**Composition**: the wall = *Polynesia*'s two-blue checkerboard (`#1d4fb8 / #4f95dc`, each cell a 240×236 cut-paper block), the window = *Icarus* (cobalt ground, black figure, red heart, yellow stars), the floor = emerald `#1f9a5a` with a black baseboard strip, the tabletop is black cut paper, the chair yellow cut paper.

**Technique**
1. **Scissor polyline `cut(pts)`**: take a point every 14–24px along the outline, add ±2–2.5px seeded jitter, and connect the points with straight lines. Every self-generated shape is processed this way.
2. **Seaweed (the key)**: one tapered stem plus 2×lobes **round-ended capsule fingers** alternating left and right. Finger angle `±(1.05−0.55u)`, length `width·(1−0.45u)`, width `width·(0.34−0.12u)`. All subpaths are `addPath`ed into one Path2D and filled once with nonzero to get the union, and the drop shadow is computed once too. **Do not "modulate width along the spine"**: the first version did, and produced caterpillars and Z-shaped lightning bolts.
3. **Hand-cut edges for RIG characters**: RIG doesn't provide point lists, so the whole character layer gets a pixel displacement. The static displacement field is `fbm(0.028x, 0.028y, 2)·9`, one set each for dx and dy, processing only bbox (330,470)-(1600,980), about 15ms.
4. **Paper drop shadow**: shadow offset (5,6), blur 4, `rgba(10,20,40,.3)`, conveying paper pinned to a wall.
5. **Gouache brush marks**: 2600 cached long brush marks (60–300px, width 6–22, half black half white, α .04–.13, slanted −0.25rad), laid over the whole image with `overlay`.

**Motif animation**:
- Seaweed sways like paper around its root `sin(2.8t+φ)·0.13`, with curling edges breathing via `scaleX 0.93–1.0`.
- Icarus: 7 irregular yellow stars spinning and twinkling (scale `.82+.22sin(7t+1.9k)`); the black figure floats up and down; the red heart beats (`1+.18·max(0,sin 9t)`).
- Two white birds flapping (scaleY `.55+.45cos 13t`).
- A piece of pink paper tumbles down (scaleX=cos 6t).
- The steam is two little white paper cut-outs.

**Characters**: Matisse's *The Romanian Blouse*. A white blouse with wide sleeves, a cobalt embroidered band down the front (small red and yellow alternating triangles), red/blue embroidered bands on the sleeves rotating with the arm (clipped inside upperArm), a long red skirt + black belt, blonde hair as 5 cut-paper curl blobs. Features only from paper scraps: black almond eyes, a red triangle for the lips, pink round cheeks.
**Pitfalls**: the first version's falling paper path crossed the girl's face; moved to the left wall. A white paper scrap is placed under the counter, otherwise black text on cobalt is unreadable.

---
