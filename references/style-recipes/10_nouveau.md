# 10_nouveau · 1896 Art Nouveau (Mucha posters)

File: `scenes/10_nouveau.js` (about 300 lines). Performance: warm mean 29ms, max 37ms, first frame (building caches) ≈80ms; determinism passes (the same lt rendered twice is pixel-identical); lt 0.35→0.65 motion diff 13.1% of pixels. On screen for 0.70s in the film (T09 organic-wave transition 0.24s, growing out from (1330,320) = the girl's halo).

## Pipeline
1. **Background fully cached `nv_bg`**: three-stage vertical gradient gray-green → beige-green → peach (`#b9cba0`→`#cfd3a6`→`#ecc9a2`, filling only the inner frame 34..1886×32..907); dot pattern = ring r10 + center dot r2.6, row spacing 54, column spacing 62, odd rows offset 31 (diamond stagger), color `rgba(120,140,100,.38)`; a 240×135 fbm image upscaled at α0.5 for lithographic mottling (hundreds of times faster than computing noise at full screen); mosaic tile band with 20×24 cells, 9 colors cycled and scrambled by `(k*7+(k>>2))%9`; green banner `#8fac80`; title `Marcellus-400` 76px, letterSpacing 12, first a 7px dark-brown stroke then a cream fill; gold frame = outer 6px gold `#c9a24a` + two 2px dark-brown lines inside and out.
2. **Variable-width path `ribbon(pts, w(q))`**: the point list is first densified with Catmull-Rom (4–10 points per segment), each point offset w/2 to both sides along the normal, assembled into a closed polygon and filled. Every "whiplash line" is this: stems, leaves, wrought-iron table legs, scrolls on the banner, hair, steam. `swellW(wmax)` = pointed at both ends, thick in the middle (sin envelope) — the breathing thick-thin of Mucha's lines. Spiral endings `spiral(cx,cy,r0,a0,turns,dir)`: radius shrinks linearly to 15%.
3. **Mucha's "thick outer contour, thin inner lines" — the offset-silhouette method**: all characters (cat + girl + hair + shawl) are drawn into an offscreen layer L (RIG's both mode, lw 2 → inner lines occlude correctly in part order); then L is copied, tinted dark brown `#4e3320` with `source-in`, and laid under L on the main canvas at three offsets (-1.5,-1.5), (3.5,4.5), (2,2.5). Result: a 1.5px ring around the silhouette, with a 4–5px thick edge on the lower right; inner lines stay 2px. Only 3 extra full-screen drawImages.
4. Grain `P.grain('nv', .05, warm brown, .14)` on the top layer, like lithographic printing.

## Motif animation (all must be visible within 0.7s)
- **Sun rising**: from the original's measurements (frame 509 (583,400) → frame 530 (576,299), ≈-5px/frame), written as `sy = 400 - (lt-0.267)·288`, `sx = 583 - (lt-0.267)·20`; at lt=0 it's at 477 (hidden behind the hills), and at lt=0.7 it reaches 275. The hill bands are drawn after the sun = natural occlusion, "rising from behind the hills".
- **Leaded rays rotating**: 14 radiating lead lines from the sun's center r92→r420, angle `+lt·0.9·0.25` slowly rotating with a ±0.04 wobble; the lead lines move with the sun, so the whole window's glass divisions keep changing — the most noticeable motion in the window.
- **Stained-glass border**: along the arch's inner edge (straight sides + elliptical arc rx219 ry130), a 14×14 piece every 17px, rotated to the tangent, cycling 6 colors.
- **Poppies/lilies swaying**: flower heads move horizontally `sin(7.5t+φ)·13 + sin(3.1t+2φ)·5`; stems are three-control-point ribbon curves with only the upper part pushed; left and right clumps in opposite phase; leaves at 0.3× amplitude.
- **Halos rotating**: the girl's halo R172, 18 round studs rotating `+0.9t`, an inner ring of 32 rose-window petals counter-rotating `-0.63t`; the cat's halo R106 with an eight-petal orange flower `-1.1t` + a gold dashed ring with moving lineDashOffset.
- **Hair**: first one large hair mass (16-point smooth, outer edge rippling `sin(6t+y·0.035)·9`), then 7 curls behind the back + 2 over the shoulder: each curl is a 12-point S-curve `sin(7.4q+φ-7t)·(6+20q)` (a traveling wave moving downward), ending in a 1.2-turn spiral, width tapering 14–18 → 2.5, with a cream highlight core + fine dark-gold line. 6 small curls along the top edge for volume. All points follow the offset of `G.A.headC` (moving together when she tilts her head back to drink, following less the further down they are).
- **S-shaped decorative steam**: 3 cream ribbons (width 26/20/14) + 1.8px brown outline + center line, traveling wave `sin(4q+φ-6t)·(18+70q)`, horizontal spacing spreading ×(1+2.6q) with height, ending in 34px spirals; the whole thing leans left `lean = -90 - 160·cup` — **pitfall**: choreo lifts the cup to the lips, and if the steam rose vertically it would cross the girl's face, so it must lean toward the window with cup.
- choreo: cup lift, head tilt, blink, tail flick, breathing all from RIG; the saucer stays on the table (so the tabletop isn't empty once the cup is lifted).

## Palette
Line `#4e3320`; gold `#c9a24a`/`#9c7a2e`; cream `#f6eedb`; skin `#f6dcc4`; blonde `#e8bf55` / highlight `#f6dc8a` / dark `#b9862a`; dress `#f4ecda`; pink shawl `#e6aaa5` / folds `#d48e8c`; poppies `#d9706a`/`#b4504b`, center `#3f6a4a` + gold dots; lilies `#f7f2e6`; wrought iron `#3d7763`; cat `#e39a4c`/`#fbf3e3` / stripes `#c0672c`, eyes `#e6c040`; halo pink `#ebb8b2`, teal ring `#5f9a8a`, cat halo red `#b8473a`.

## Pitfalls
- **`drawGirl(mode:'line')` layered on top draws the outlines of occluded parts (the far sleeve) through the torso** (the 09 benchmark has this too). Changed to drawing lines in both mode in part order on an offscreen layer, then applying the thick outer contour to the whole.
- The hair was first 7 long 34px-wide bands, like sausages/noodles; Mucha hair = one hair mass as a base + thin S-curling strands + spiral endings, width ≤18.
- Don't use frames with lt<0.33 for selfcheck diffs: within 20 frames after a transition starts, the engine applies a 1.03× "beat punch" zoom, and the diff goes red across the whole screen.

## Still room to improve
- The cat is still RIG's sitting pose (straight white legs), while the design sheet is a fluffy orange cat lying down; the Mucha feel rests mainly on the halo and the thick-thin lines.
- The title uses Marcellus, while the design sheet has rounder hand-drawn Art Nouveau letterforms; a set of letter paths could be written by hand.
