# 12_bauhaus · 1923 Bauhaus poster

File: `scenes/12_bauhaus.js` (about 210 lines). Performance: warm mean 5ms, max 9.5ms, first frame ≈85ms; determinism passes; lt 0.34→0.46 motion diff 4.9% of pixels (black rod, grid window, concentric arcs, cat, ball and mannequin all moving). On screen for 0.47s in the film (T11 blue square / red circle / yellow triangle / round-hole transition 0.20s, origin (1330,590) ≈ the red circle's center).

## Pipeline
1. **Background fully cached `bh_bg`**: off-white old paper `#ebe3cf` + a 320×180 fbm image upscaled at α0.5 (aged mottling) + a thin diagonal line running through (40,170)→(1900,840) (behind the window) + a black horizontal bar at top left (60,61,256,13), a red vertical bar (292,105,24,468) + vertical "bauhaus" (`Poppins-800` 210px, `rotate(-π/2)` then horizontally scaled to exactly 820px long, origin (262,1000), reading bottom to top) + small gray square + ground line (345,898)-(1860,915) + yellow right triangle + "katze" (Poppins-800 150px, red `#d3262b`) + two lines of Poppins-600 31px at bottom right + black table top / chrome tube legs (three-color linear gradient) + Breuer cantilever chair (the same path stroked 15px dark gray / 10px chrome / 3px highlight offset 2px) + two layers of grain (dark dots at density 0.02 α0.35, old print black specks).
2. The red circle is cached separately at 520²: base color + light fbm mottling via `source-atop` at α0.55, imitating the uneven ink of screen printing / lithography.
3. Characters and composition are all geometric solids: no curved outlines at all, only circles, squares, triangles and thick rods.

## Motif animation
- **Long diagonal black rod rotating like a pointer**: from angles measured frame by frame in the original (frames 575–579 28°, 581 33°, 583 37°, 585 42°, 587 46°, 591 49.5°), written as `deg = 28 + 21.5·easeOut(clamp((lt-0.26)/0.22))`. Pivot = hub center (1125,195) (confirmed by comparing original frames 576/590: the hub stays put while the lower end sweeps down); the rod is 27px from -432 to +150, a thin parallel line offset 30px, a short red rod offset -30px, the arc inside the hub rotating along.
- **Mondrian grid window swapping colors**: a 4×4 grid (inner frame 366..794 × 126..561, cells 100×101, gaps 9.5), 6 cells take part in swapping, stepping at 13fps `step=floor(lt·13)`, each cell with its own phase, swapping only when `(step+2·sw)%9 < 6` (not every beat, so the rhythm isn't mechanical); swap colors are only red, yellow, blue, beige, light blue and gray. The patterned cell (9px graph paper) and quarter-circle cell stay as they are.
- **Concentric arcs**: 6 arcs to the right of the red circle, start phase wobbling `sin(9lt-0.7i)·0.05`, radius breathing `±3`, arc length sweeping from 55% to 100% within 0.4s — like sound waves pushing outward.
- **Steam over the cup**: one 2.2px sine line (26 periods / 170px, `-18t` traveling wave), fading out with a linear gradient.
- **Cat bats the ball into a roll**: the right front paw `tap = sin(clamp((lt-0.05)/0.16)·π)` extends 36px forward and pulls back; the blue ball r31 rolls with easeOut from x712 to 816 over `lt 0.13→0.47`, **rotation = displacement / radius** (a white diameter line + white dot show it rolling), with two speed lines behind it while rolling. Tail = a 26px thick orange arc + same-width dashed dark-orange stripes, angle following `choreo.tail·0.5`.

## Geometric characters (all anchors from RIG)
- **Schlemmer mannequin**: head = circle r70 (`G.A.headC + (14,-18)`); geometric gold hair pieces = a sector over the back half of the head (-1.95→1.15rad) + a triangle on the forehead + bun circle r34 + a semicircular hair piece behind the back (`G.A.back`); face = black vertical-bar eye (a horizontal bar when blinking), red square cheek, short black mouth. The whole head group rotates around `G.A.neck` by `G.tilt` (tilting back to drink). Torso = blue trapezoid + a black trapezoid for the back half (rising and falling with breathe); skirt = black sector r178 + blue trapezoid; limbs = thick black round-ended rods, joints = off-white discs + 5px black ring + black center dot. The near arm uses `G.A.shoulder/elbow/hand` directly (RIG's IK cup lift); the far arm rests flat on the table (recreating the original's hand reaching toward the table).
- **Cat**: body circle r100 (at (536,805), derived from `K.box`, scaling with breathe) + 4 dark-orange horizontal bars on the left (clipped inside the circle) + an off-white sector at bottom right (orange and white blocks); head = 104 square (`K.headC + (14,48)`, rotating slightly ±0.08rad with the tail phase) + yellow triangle ears + off-white lower face + dark-orange forehead band; eyes = white circles + black vertical-bar pupils.

## Palette
Paper `#ebe3cf`; black `#161514`; red `#d3262b`; blue `#2a58b4`; yellow `#efc12f`; light blue `#b9cee0`/`#a6c0da`; gray `#c6c3bb`; beige `#f2ecdf`; orange `#ee8a2a`/`#c25a14`; chrome `#c9c9c6`.

## Pitfalls
- The first version computed cells at 107px and overflowed the black frame by 16px on the right — derive the cell size from "inner frame width − 3 gaps".
- Black was among the swap colors; when a cell turned black the whole window suddenly got heavy, like a broken cell — removed.
- The mannequin's mouth was originally drawn like the original as a long black bar sticking out of the head, which on the girl's face looked like a cigarette; changed to a short horizontal bar inside the head.

## Still room to improve
- The cat's head/body were moved down relative to the RIG skeleton (so the square head sits on the round body); during transitions, the cat's head position differs by about 50px from the eras before and after.
