# 24_hopper · 1942 Hopper American realism (hard-edged light blocks)

> Source: migration test B (built by an independent agent that only read the skill, 2026-10-04). The scene code was ported to `scripts/engine/scenes/24_hopper.js` after integration.

Filename during the experiment: `scenes/c3_hopper.js` (about 150 lines). Per-frame median 13ms (first frame 54ms); frame diff 6.0%.

**Core technique: "two-version clipping"**: one `room(g, K)` function draws two caches with two color sets — a shadow version `SH` (cool green wall `#5d8679`, dark floor `#5b3d2b`) and a lit version `LT` (warm yellow wall `#efcf8f`, light floor `#c98b52`). Each frame, draw the shadow version first, then clip the lit version through a moving polygon of the light patch; the light/shadow edges are naturally hard and the whole patch can translate. People and furniture work the same way: `girl(c, K, G)` draws once in shadow colors, then once more in lit colors clipped to the diagonal light band.

**Light-patch geometry** (dx = 30 − 95·easeInOut(lt/1.25); moves left about 95px over 1.2s)
- Light patch on the wall WP: (1420+dx, 250) → (1920, 470) → (1920, 730) → (1420+dx, 730)
- Light patch on the floor FP: continues below the wall patch, spreading toward the lower right
- Light band on the figure OP: left edge from (1345+dx, 0) to (1185+dx, 1080). In this segment the light edge sweeps across the girl's face, from half-face in shadow to fully lit
- Window-mullion shadows: 24px vertical bars + one diagonal bar parallel to the top edge of the light patch
- **The figure's shadow on the wall** = the figure's silhouette translated by (+150, +18), drawn offscreen, filled with the shadow background via `source-in`, then drawn back into the light-patch area. The effect: the shadowed wall shows through inside the light patch, in sync with the figure's pose.

**Motif animation**: the light patch moving slowly (the core); across the street, a red-brick building (a tribute to *Early Sunday Morning*) with a barber pole whose red-and-blue stripes rise at 60px/s; the blind's pull cord swaying lightly `sin(4.2lt)·0.07rad`; 26 dust motes in the light band (shown only to the right of the light edge); steam.

**Texture**: oil-paint drag marks mainly from vertically stretched fbm (x·0.06, y·0.006) with a little diagonal, generated at 1/4 resolution and upscaled, `soft-light` α 0.2. Each window across the street gets a 10px hard shadow on its right side, and the blinds are pulled to different heights (0.25–0.7) — Hopper's details.

**Palette**: shadow wall `#5d8679`, wainscot `#4b6d63`, floor `#5b3d2b`; lit wall `#efcf8f`, wainscot `#d8ad68`, floor `#c98b52`; dress shadow `#7a2c2a` / lit `#cc4a3c`; blonde shadow `#a8893f` / lit `#f3d67e`; brick `#b4553a`.

**Pitfalls**
- The first version's brush marks used horizontal fbm at α 0.35, and the wall looked like rippled marble. Hopper's walls are flat; brush marks should be barely there.
- While editing the code, a comment was inserted in the middle of a line and commented out the second half of that line's code (watch out when doing batch replacements in Python).

**Characters**: the first version had an updo + long red dress, and the review said she "looks like an adult woman, can't read as 17". Changed to long hair over the shoulders (`hair:'long'`) + a blue hair ribbon, and she looks younger. The cat's white chest is a smooth ellipse in shadow white `#dcd6c8` (the first version's `#c4bdac` read as a gray-white cat).

**Still room to improve**: the cat stays in shadow the whole time and is rather dark (a deliberate trade-off for the loneliness). The cat could also get a small patch of light from a back window.

---
