# 13_pop · 1962 Pop art (Lichtenstein comic panel + Warhol four-up)

File: `scenes/13_pop.js` (about 230 lines). Performance: warm mean 6ms, max 9ms, first frame ≈45ms; determinism passes; lt 0.34→0.46 motion diff 11.6% of pixels. On screen for 0.47s in the film (T12 yellow-lightning halftone transition 0.16s).

## Pipeline
1. **Ben-Day dots = `createPattern`, zero cost**: a small pitch×pitch tile with 5 circles (4 corners + center) = a 45° grid (diagonal spacing pitch/√2). Wall: pitch 24, r5.6, blue `#2f5cc8` on white (17px diagonal, matching the 17px period measured from the original by FFT); skin: pitch 13, r3.3, red `#e2483c` on skin `#fae0cc`; yellow floor: pitch 14 r2.2 α0.18, faint print dots. Skin uses `fillStyle = pattern; fill(path)`, two orders of magnitude faster than `PAINT.halftone` (per-dot getImageData), and the pattern is aligned to screen coordinates so it doesn't "swim" when characters move.
2. **Background fully cached `pop_bg`**: 6px black comic-panel border; white baseboard 754–792 (6px black lines above and below); yellow floor 796→990/1003 (horizon slightly tilted); red band; MEANWHILE... (`Bangers-400` 46px, yellow box with 5px black border); Warhol white picture frame + blue windowsill line; blue chair; paper grain.
3. **Every character is "thick 5px black outline + flat fill"**, with one function `ink(c, path, fill, lw)` throughout; highlights are short thick white strokes; shadows use `hatch()`: 3.5px-wide black diagonal lines at 10px spacing inside an ellipse clip.

## Motif animation
- **Warhol four panels swapping color schemes**: 4 schemes (background/face/lower face/eyeshadow/lipstick), `step = floor(lt·11)` (≈ a swap every 5.5 frames; the original swaps at frames 601, 605/606, 612), panel i uses scheme `(i+step)%4`. Cat face = a 9-point RIG.smooth head shape + lower-face ellipse + a black block on the right (the black shadow of screen-print misregistration) + eyeshadow/lipstick/nose/whiskers; two white glass reflections in the top-right panel.
- **Thought bubble's three dots blinking in turn**: original "dot 1 frames 612–615, dot 2 614–617, dot 3 616–618" → a 12-frame loop, dot k lit (r20, jumping up 6px) when `((f-2k) mod 12) < 4`, otherwise r12. Bubble = 10 circles first all stroked 11px black, then all filled white (the cheapest way to get a union outline).
- **WIGGLE WIGGLE burst box shaking**: stepping at 30fps with hash jitter ±8px/±6px/±0.03rad; outer white burst (14 points, radius 128/178 with randomness) + inner yellow burst + two lines of `Bangers-400` 82px red text (12px black outline + 4px black drop shadow); 10 black triangular motion lines around it pulsing in length `0.85+0.25·sin(40lt+2i)`.
- **Cat wiggling its hips, about to pounce**: era-specific deformation using RIG.cat's anchors — crouching low: the body is a custom 10-point outline (origin at `K.box`), head `K.headC + (22,104)` lowered against the body, white front paws extended as ellipses; wiggle: `wig = sin(lt·2π·6)·16` (6Hz, ~3 times in 0.47s), point weight `clamp((560-x)/140)` → the closer to the rump the larger the shift, also lifting `|wig|·0.6`; stripes and tail follow the same deformation; three arc-shaped motion lines beside the rump move with wig.
- **Girl holding the cup**: RIG IK cup lift; cup = white cup + blue diagonal stripes + coffee; steam = two black wavy lines jittering at 14Hz.

## The girl (Lichtenstein)
- Big golden waves: hair mass (19-point smooth, back edge bulging `sin(2.1i+4t)·14`) + 7 curl blobs (r30–48, along the back edge), **first all stroked 10px black, then all filled yellow = a union outline**; inside each curl blob a 4.5px black C-shaped arc + a dark-gold `#d9a514` arc = Lichtenstein's sculptural curls; 5 black S-shaped strands, 2 white highlights.
- All skin (face, neck, hands, legs) in red Ben-Day dots; red dress (cut at the knee, hem clipped with a curve, not a rectangle) + white highlight strips; two dotted legs + red high heels (7-point polygons); big eyes (white 12×8.5, blue iris r7, highlight dot) + 3 thick eyelashes + brows raised 5px; enlarged red lips.

## Palette
Black `#141414`; paper `#f3eedb`; blue `#2f5cc8`; yellow `#f7d52c`; red `#d8232a`/`#a8161c`; white `#fbf8ee`; skin `#fae0cc` + dots `#e2483c`; blonde `#f8d62c`/`#d9a514`; cat `#f39a2c`/`#c4561a`; Warhol backgrounds `#9ccf3a/#e0359a/#2fc0b0/#f08a2a`.

## Pitfalls
- Drawn at RIG's original position, the cat's head floats above the crouched body (with a gap); in the crouch the head must move down ~100px into the body.
- The first version's hair was a single sheet of yellow with slight waves, which from a distance looked like a cloth draped over her; the recognizability of Lichtenstein's blonde hair comes from "curl blobs + black C arcs".

## Still room to improve
- The original girl has a teardrop and a white collar (the classic Lichtenstein crying girl); the design sheet removed them and I didn't add them either. For more of a "comic" feel you could add a speech balloon.
