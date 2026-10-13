# 23_dali · 1931 Dalí surrealism (*The Persistence of Memory*)

> Source: migration test B (built by an independent agent that only read the skill, 2026-10-04). The scene code was ported to `scripts/engine/scenes/23_dali.js` after integration.

Filename during the experiment: `scenes/c2_dali.js` (about 235 lines). Per-frame median 47ms (first frame 84ms); frame diff 4.6%.

**Pipeline**
1. The background is split into three caches, because the shadows must sit in between: `dali_bg` (sky, sea, rocks, ground) → shadows drawn every frame → `dali_wall` (fragment of a broken wall with a window + dead branch) → `dali_block` (stone-block table + stool) → soft watches → characters.
2. **Volume fill `vol(c, path, x0,y0,x1,y1, a, b, occl, blur)`**: a linear-gradient fill, then a dark ring drawn with shadowBlur inside the clip as an inner shadow. No outlines anywhere in the film; the academic roundness comes entirely from this.
3. **Long shadows**: each object's silhouette is projected onto the ground with a shear affine `setTransform(1, 0, −kx, ky, kx·yg, yg·(1−ky))`, where yg is the object's ground line (wall 700, table/cat 905, person 930). All silhouettes are first drawn into one offscreen layer (solid black), then laid on as a whole at α 0.55 with 1.5px blur, avoiding darker overlaps where shadows cross. A clip keeps only the ground part (y > 594). `kx = 0.85 + 0.6·easeInOut(lt/1.2)`; the shadows visibly lengthen over 1.2s.
4. **Soft watch `softMap(o, sag)`**: disk local coordinates (u,v) → screen. The part with v ≤ fold lies on the surface (y compressed to 0.28–0.32); the part with v > fold hangs down: `X = cx + u·(1 − flare·q)`, `Y = … + d·(0.62 + 0.3·sag) + central sag Gaussian + sine ripples`. The outer rim, dial, 12 tick marks, two hands (sampled along the map into soft lines) and the fold highlight **all go through the same map**.

**Key parameters**: `flare = −0.12` — a negative value makes the hanging part spread outward like soft cloth with a rounded bottom edge; a positive value pinches it into an ice-cream cone. drip 0.18–0.4. sag goes 0.1 → 1.4 within 1.2s: the first version was 0.35→1.0, and the review said "the watches aren't visibly melting". Three watches: windowsill R72, table edge R88, dead branch R64 (fold −34, mostly hanging). Hands rotate at 4.5–6.5 rad/s.

**Motif animation**: the three soft watches keep drooping, hands turning at different speeds; a stilt-legged elephant on the horizon (four thin legs alternating steps with a π/2 phase difference, knees slightly bent at 0.52 of the height, body bouncing at 14Hz, an obelisk on its back) moves left 70px per second; 9 ants crawl in an ellipse around the orange pocket watch; the long shadows lengthen; the cat's tail softens and droops (tail tip y + q²·34).

**Characters**: a Spanish girl, light-blue long dress + white turned-down collar, blonde bun, no outlines; volume from gradients + inner shadows, features as fine dark-brown lines. The cat uses an orange gradient, stripes as semi-transparent strokes with 2px blur (soft), eyes as radial gradients; the white chest is a smooth ellipse at (606,768) 40×92, not `K.white`.

**Palette**: sky `#22407c → #5f88bd → #e9dcae`; sea `#8aa6b8 → #4f6f86`; rocks `#e8c27a / #9a6a34`; ground `#d2ad70 → #7a5129`; wall `#f4ead2 → #cdbf9f`; watch gold `#f0d27c / #9a7426`, dial `#f6efd6`.

**Pitfalls**
- The first version cast shadows toward the viewer (ky>0, downward), and the bottom edge of the frame swallowed them all. The sun must be low at the front left, so shadows lie toward the back right (y′ = yg − ky·(yg − y)).
- Shadows are cast on the ground and must be drawn beneath the wall and table, so the background must be split into layers, not cached as one image.
- A soft watch with flare>0 plus larger drip is an ice-cream cone.
- This counter's background is the dark-blue sky; the dark-brown text originally set was invisible, so it was changed to off-white text + dark drop shadow.

**Still room to improve**: the figure still leans toward vector illustration; finer highlights and reflected light in the shadows could be added. The soft, reclining "self-portrait" creature from *The Persistence of Memory* could be a fourth motif.

---
