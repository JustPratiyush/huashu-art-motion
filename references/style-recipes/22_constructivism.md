# 22_constructivism · 1924 Russian Constructivist poster (Rodchenko / El Lissitzky)

> Source: migration test B (built by an independent agent that only read the skill, 2026-10-04). The scene code was ported to `scripts/engine/scenes/22_constructivism.js` after integration.

Filename during the experiment: `scenes/c1_constructivism.js` (about 175 lines). Per-frame median 5ms; frame diff 3.6%.

**Pipeline**
1. Background fully cached `cs_bg`: off-white old paper (`P.texture` `#e9dfc4`, dark `#d9c9a4`) → a diagonal black bar on the left (rotate −0.5), red square (rotate 0.26), 5 rows of "body text" black bars → a thin diagonal line on the right, red dot, vertical geometric letters "ЧАЙ" in a black vertical bar → a large black circle behind the figure's head (center (1330,395), r 215) → slanted red ground (0,905)→(1920,856) with a 12px black line along the top edge → window → black table (red edge, diagonal brace) → black block stool.
2. **Window = photo collage**: first draw a grayscale "photo" offscreen (sky gradient `#5e5e5e→#e8e8e8`, radial white clouds, dark factory silhouettes, chimneys), then halftone it with `halftone()` (cell 7, gain 0.8); the Shukhov tower is drawn in crisp black lines over the halftone (five hyperboloid sections, each with two sets of 18 straight generator lines at a phase difference of ±1.1rad, omitting the back where sin<−0.2) — exactly the "photo + hand drawing" collage.
3. **Skin = halftone photo**: face, neck and hands are first drawn as grayscale gradients (light in front, dark behind, `#fafafa→#9c9c9c`) offscreen, then halftoned (cell 4.6, gain 0.74, 45°). Off-white is laid under the dots, and the outside is first stroked 7px `#fbf7ea` — that ring is the white edge of a cut-out photo. Features are added with crisp black strokes, and the lips are colored red by hand. Clothes are all flat cut paper + 3px black lines; shadows use `shadeDots()`, placing halftone dots within a path by a function.

**Key functions**
- `halftone(c, src, bx,by,bw,bh, cell, col, gain, ang=π/4)`: samples src's grayscale on a rotated grid, dot diameter = cell·gain·√(1−L), only where alpha>128. **All dots are merged into one path and filled once.** About 3000 dots on the face, <2ms.
- Geometric Cyrillic letters: a 5×7 module; each letter is a set of rectangles or polygons (Й's diagonal stroke is a quadrilateral, its breve a small rectangle above). **Each part is filled separately.**

**Motif animation**
- Lissitzky's red wedge piercing the black circle: the tip moves back and forth along an axis at 0.34rad, `70·(0.5−0.5cos(2π·1.6·lt))`.
- Red dashed ring outside the black circle: dash [46,22], `lineDashOffset = −260·lt`.
- Radio waves from the top of the tower: 4 red arcs, `r = 18 + ((1.4lt + k/4) mod 1)·230`, with α and line width decaying with phase.
- Slogan on the ground "ПЕЙТЕ ЧАЙ!": stamped letter by letter (letter k jumps at 0.045k seconds, shrinking from 1.5× to 1 within 0.12s), then the whole row wave-jumps `−10·max(0, sin(11lt − 0.8k))`; every 4th letter is black.
- The two tails of the headscarf sway lightly `sin(9lt)·6`; the steam over the cup is three black zigzag lines rising.

**Characters**: a Komsomol girl — red headscarf (13 local head points, the front edge pulled back to reveal blonde bangs, knotted behind the neck with two triangular tails), white shirt + red neckerchief triangle + red cuffs, dark-gray long skirt (halftone shadows). The cat is cut-paper orange `#e2741c` + off-white, 10px black stripes, tabby tail via a dashed outline, eyes as vertical square-pupil bars.

**Palette**: paper `#e9dfc4`; red `#c8231c`/`#8f1711`; black `#151311`; off-white `#f4ecd6`; blonde `#e3b03e`/`#a87a1c`; cat orange `#e2741c`.

**Pitfalls**
- The first version drew Й's breve above the letter cell (y=−1.7u): in the vertical column it was covered by the letter above, and in the ground slogan by the skirt hem, so the review read it as "ЧАИ". Changed to draw the whole letter within 7 cells (the И part moved down 1.7 cells), and the slogan is now drawn above the characters (poster text over the figures).
- The first version's "А" combined two opposing diagonal legs + a crossbar in one path; the overlap cancelled under nonzero and it read as "В" in the vertical column. Changed to fill part by part.
- The ground slogan's baseline was first at y=1060, and the bottom half of the letters went off-frame. Positioned by letter center with `translate(x, 990)`.
- The shadow under the cheekbone was too heavy at first and after halftoning looked like a beard. Shadow α in the grayscale source must be half of what it would be in flat color.

**Still room to improve**: more typical of Rodchenko is "a photo of a person + a megaphone-shaped cone of text". The steam could be replaced with a red-and-black wedge cone of text radiating from the cup's rim.

---
