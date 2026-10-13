# 27_kirby · 1966 Marvel silver age (Jack Kirby + four-color offset printing)

> Source: migration test C (built by an independent agent that only read the skill, 2026-10-04). The scene code was ported to `scripts/engine/scenes/27_kirby.js` after integration.

Filename during the experiment: `scenes/k1_kirby.js` (255 lines). About 20ms per frame, frame diff 7.5%.

**Pipeline: the same geometry drawn twice**
1. **Color-plate layer**: paper `#f4ecd6` + flat fills + Ben-Day dots. The light-blue wall gets C dots (pitch 9, r 2.7, 15°), the dark-blue floor gets purple dots (pitch 9, r 3.2, 75°), skin gets red dots (pitch 7, r 1.5, 75°). **The whole layer is drawn with `drawImage(color, 4, 3)` = misregistered plates.**
2. **Ink layer**: white ground; each part "white fill → shadows → 6px black outline". Composited onto the color plate with `multiply`, so white = transparent. Filling each part with white covers lines from earlier parts, so only visible lines remain — no need for visibleLines.
3. **Kirby's spotted blacks + feathering**: light comes from the window (LIGHT=(-0.86,-0.5)).
   - Black crescent: `path ∩ ¬translate(path, LIGHT·d1)`, d1=14. Method: `clip(path)` first, then `clip(…,'evenodd')` with "a full-screen rectangle + the translated path", then fillRect black.
   - Feathering band: the same approach with d2=30 gives a band, inside which parallel lines are drawn along the light direction (spacing 9px, width 2.6).
   - Parameters (d1/d2): skirt 16/34, torso 14/30, sleeve 10/22, hair 12/26, cat body 16/34, tabletop 10/18.
   - One function gives any Path2D Kirby-style shading.

**Motif animation**
- **Kirby krackle**: a cluster of 16–26 black circles. Distance distributed as `R·rnd^0.7`, larger toward the center (`R·(0.05+0.2·(1-d/R))`), reseeded at 12fps, radius pulsing with `sin(18t+i)`. 6 clusters travel along an S-shaped energy stream outside the window (`(k/6+0.42t)%1`); the stream is an orange-edged yellow-core band + jagged ink edges. The steam also uses krackle (4 small clusters drifting up).
- **Speed lines**: cup speed `|sin(min(1,lt/0.9)π)|`; 9 black lines trail down from the bottom of the cup, length 70–180·v, jittering at 12fps; two motion arcs behind the elbow.
- **Big onomatopoeia SLURRP!**: pops in with `outBack` from lt 0.52, `Bangers-400` 132px (×0.82); 7 layers of black extrusion (each offset (0.8d,d)) for Kirby's 3D block letters; the top 46px of the red text clipped to yellow (two-tone letters); a 26-point yellow burst behind; jittering ±3px at 12fps.
- **Panels**: main panel 24..1534; the panel on the right is a close-up of the cat's face, pupils moving up with `cup` (`lerp(14,-18,cup)`) and looking left. Its background is magenta + yellow dots + 44 black focus triangles (swapped at 12fps) + 6 krackle clusters around the head. Bottom caption box "BUT THE CAT IS WATCHING!", top-left caption box "MEANWHILE, AT TEA TIME...". The counter is styled as a caption box with a yellow fill, black border and offset black drop shadow, placed in the gutter at top right.

**Characters**: a 60s red A-line long dress, white Peter Pan collar (two ellipses), three black buttons down the front, black headband (an elliptical arc in the head's rotated coordinates, line width 11), flipped-out hair ends (drawn in the `skirt` hook, behind the torso). The chair is a Saarinen tulip chair.

**Pitfalls**
- The onomatopoeia was first placed at (1000,300) at full size and covered the window and the girl's face. Moved to (990,318) and scaled to 0.82.
- The big black ellipse on the right of the cat close-up made the cat look like a tortoiseshell; changed to a narrow crescent along the edge.
- Planetary rings must be split into a back half-arc (drawn first) and a front half-arc (drawn after), otherwise the ring passes through the planet.
- **Still room to improve**: the image leans toward "clean pop-art comics" and still lacks Kirby's blocky fingers, more extreme perspective and muscular tension.

---
