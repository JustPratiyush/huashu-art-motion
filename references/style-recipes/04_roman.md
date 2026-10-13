# 04_roman · AD 79 Pompeii mosaic — technique notes

File: `scenes/04_roman.js` (about 330 lines). Final selfcheck: warm max 17ms / mean 13ms (1920×1080), init 206ms (once at boot), 17,871 tesserae, of which 13,067 are in the dynamic area and re-sample their color every frame. Determinism passes.

## Core idea: compute the layout once, let color flow through the tesserae every frame

Mosaic animation should look like this: the stones themselves are fixed in the wall, and what moves is color flowing from one stone to the next. So the renderer is split in two.

1. **init (`build()`, 206ms)**: compute where every stone is, how big it is, which way it faces, which pixels belong to it, and its bevel shading; store them as `ID` (Int32, the stone index for each pixel, -1 for grout) and `SH` (Uint8, per-pixel shading, 128=1.0).
2. **Every frame**: repaint the flat-color underdrawing, `getImageData` once, then sample the color at the center of each dynamic stone (plus each stone's fixed color jitter), fill `color×shade>>7` per pixel in the dynamic rectangles, and finally `putImageData` onto its own offscreen canvas and paste it onto `c` with `drawImage`.
   - Pitfall: **you cannot `putImageData` directly onto `c`**, because it ignores the engine's camera punch zoom and transition clipping. You must write to an offscreen canvas first and then `drawImage`.
   - Per-pixel work each frame covers only about 1 million pixels (4 border bands, inside the picture frame, the girl, the cat); a JS loop takes about 5ms. All offscreen contexts use `{willReadFrequently:true}` so that `getImageData` is fast.

## Tessera layout (andamento: laid along contours)

Simplified from the approach in Hausner 2001, "Simulating Decorative Mosaics".

- **Structure map**: the static underdrawing plus the cat and girl at frame 0 (without the moving near arm), downsampled to 960×540. Adjacent pixels whose RGB difference sums to more than 34 are marked as edges, and the boundaries of the border bands in the class map count as edges too.
- **Distance field**: Felzenszwalb–Huttenlocher exact Euclidean distance transform (two passes of 1D lower envelopes), about 20ms at half resolution.
- **Placing stones by walking along contours**: candidate pixels satisfy |d−(k+½)s|<1.5 with k < that class's ring count, i.e., the isoline bands of the distance field. Start from an unvisited candidate and walk the 8-neighborhood, preferring the candidate "most aligned with the previous step's direction" (direction smoothed 0.6/0.4); place a stone when the distance from the previous one is ≥s. Stone orientation follows the tangent of the distance-field gradient. A spatial hash guarantees spacing ≥0.8×average size between any two stones.
- **Filling holes with regular rows**: each class lays down a grid with joints offset by half a stone (row jitter ±5%, column jitter ±9%). The minimum-spacing check uses 0.86; place a stone wherever it fits. This step fills the holes both between contour rows and along the medial axis.
  - Pitfall: at first the grid was only allowed where "distance ≥K×s", so narrow shapes (the cat's tail, 26px wide) got no stones at all and the whole tail showed grout. Relying only on minimum spacing fixed it.
- **Border bands laid out separately**: each side is laid out in its own local coordinates as 11 rows of 7.6px stones, with widths along the edge random between 0.86–1.14; the four corners are 11×11 square grids.

| Class | Stone size px | Contour rings | Color jitter |
|---|---|---|---|
| Wall | 12 | 1, then regular rows | ±8%, 7% of stones additionally darkened 12% |
| Halo (white edge outside people/cat/objects) | 11 | 9 (the whole halo follows contours) | ±5% |
| Girl's body / objects | 10 | All along contours | ±5% |
| Girl's face, cat's head | 6 | All | ±4% |
| Hair | 8 | All | ±5% |
| Inside the volcano painting | 9 | 2 | ±6% |
| Outer border band | 7.6 | Rows along the edge | ±5% |
| Text | 7 | All | ±5% |
| Ground band | 13 | 1 | ±6.5% |

On top of the jitter in the table, every stone also gets an additive ±7 gray jitter. 9% of stones lean warm (+12,+4,−8), 7% lean cool (−6,0,+9).

## Stone shape and grout: weighted L∞ Voronoi

- Each stone is a rotated square. The four half-side lengths are each independently `s/2×(1.08–1.28)`, and the rotation angle is jittered ±0.06rad. The distance from a pixel to stone k is defined as `D=max(|u|/h±, |v|/h±)`, where (u,v) is the pixel's position in that stone's local coordinates.
- During rasterization each pixel records the smallest D1, the second smallest D2 and the corresponding stone index; the cost is each stone's bounding box 1.5h.
- **Grout**: pixels with `D1>1`, or `(D2−D1)·h/2 < g` (g = clamp(0.1s, 0.75, 1.25)px), count as grout — i.e., those near the bisector between two stones. So joints are about 1.5–2.5px wide and stones get irregular edges "cut" by their neighbors, like real chiseled stone.
  - Pitfall: at first half-sides were only `s/2×(0.9–1.1)`, smaller than the spacing, so grout took about 40% of the area and it looked sparse. Making stones 8–28% larger than half the spacing and letting the bisector cut them made them dense. This is the key to the texture.
- **Bevel shading**: within 2.2px of the edge, brighten or darken by ±16% according to the dot product of the outward normal with the light direction (−0.6,−0.8) (top left bright, bottom right dark). Plus a dome term `−5%·D1²` and ±3% pixel grain.
- Grout color: `rgb(112,103,92)` ±8 noise.

## Flat underdrawing and colors

- Wall `#e4ddcd`, halo `#f5f1e8` (every person and object is outlined with a 44–50px halo, along which the stones form a white edge), outline `#46322a`, outline 8px (8px on the face too, so it forms rows).
- Picture frame: red `#a8322a`, then inward a dark-red `#7c221d` line, a gold `#d0a23c` line, and a dark line.
- Volcano: three faces light `#7c84b8`, mid `#4e5796`, dark `#2f3672`; sky `#9ec0d8`→`#d3e3e4`; slopes `#6f9341`/`#92b254`; ground `#cba344`; cypress `#2b5a2f`; lava `#d64a22`/`#f2952c`.
- Girl: stola `#efe7d5` with two red stripes `#a8322a` at the hem; the red mantle in three pieces (draped diagonally behind, one across the knees, hanging down the front), fold lines `#7c221d`, with a gold brooch; the short sleeve is cut inside the upper arm as a circle of radius 62 centered on the shoulder, with a red edge; blonde `#dcaa42`, layer lines `#9c6c1c`, a spiral bun at the back of the head; the red hair ribbon is a cubic Bézier that rotates with the head tilt. Eyes are drawn as 10×6 white plus a radius-5.5 dark, so they land exactly as two 6px stones: "one white, one dark".
- Cat: orange `#dc8530`, darkened back `#c06a24`, stripes `#9c4818`, white `#f7f2e8`, big yellow eyes `#e9c22c` (radius eyeR×1.65), red collar `#b02a22` with a gold pendant. The body is smoothed into a pear shape with `RIG.smooth(K.bodyPts)` instead of the original polygon. The tail rings are drawn with a dash `setLineDash([9,13])`.
- "CAVE CATTVM": **hand-written uniform thick-stroke letters** (C as an elliptical arc; A, V, E, T, M as polylines), stroke 14px, letter height 60px, spacing 16, horizontally scaled to 600px wide.
  - Pitfall: with Cinzel-700 `fillText` directly, the thin horizontal strokes break under 7–9px stones (E becomes F, A loses its crossbar), and with tight spacing letters merge into a blob. After three iterations the conclusion was "mosaic letters = uniform thick strokes, each stroke about 2 stones wide".

## Motif animation (this segment lt 0–0.94s, drawn until 1.29s during the T04 transition)

- **Wave pattern flowing clockwise around four sides**: each side switches to local coordinates with `setTransform` (u along the clockwise direction, v from outside in) and draws the same Vitruvian scroll: starting from the inner black band, a spiral r shrinking from 24 to 5 over 2.25 turns, line width 13, period 81px. Phase is `42·lt + 81·easeInOut((lt−0.485)/0.365)`, i.e., a constant drift throughout plus one extra period at the original's frames 226–248. The stones don't move, so black and white flow between stones — exactly how a mosaic comes alive. Between 0.4→0.9s, 20% of the border band's pixels change.
- **Vesuvius smoking**: the crater is only 70px below the top of the frame, so smoke rising upward quickly gets clipped and is invisible (the first version hit this pitfall). Instead the whole gray cloud band drifts right at 55px/s (period 380px), plus 9 smoke puffs (dark `#3f3c3a` → light `#a29c94`) hugging the sky and drifting low to the right, plus 12 sparks (10px squares on parabolic paths) and the lava pulsing in the crater. 4.4% of the pixels inside the frame change.
- **Holding the cup**: rhythm from `choreo.cup/sip`; the cup is a gold two-handled kantharos with white-stone steam at the rim, opacity 1−0.85·cup. The path is a custom `armPose` (see "Fix after review" at the end).
  - Pitfall: with 15px wall stones, the hand and cup smeared together in big stones. At one point the area swept by the arm got its own 8.5px stones, but when still it became a whitish patch; in the end the whole wall was unified at 12px.
- **Cat**: tail uses `choreo.tail×1.6` (with 9px stones the original amplitude was too small to see swinging); on a blink the eye becomes orange stones plus one dark line.

## Performance and dynamic rectangles

- Dynamic rectangles are computed at init from the bounding boxes of sampled poses (cup from 0 to 1 in 0.05 steps, sip 0/0.15; cat tail within ±0.75), expanded 58px to include the halo and steam. Outside the rectangles is the static frame-0 mosaic.
  - Pitfall: the rectangles must be big enough, otherwise stones crossing the boundary end up half new color, half old.
- On the full-film timeline, frames of the Roman segment (including the transitions in and out, with the old and new layers drawn together) are all under 40ms, except for other eras' cold caches when a transition is first entered.

## Things to know about the selfcheck

- The selfcheck's "motion diff 0.2↔0.7" is polluted by the engine's beat-synced camera punch. For lt<0.37 the whole image is scaling, so it reports 68%, which is not the painting moving. Measure 0.4↔0.9 (after the punch) instead: 6.2% of the whole frame, with border band 20.4%, girl 8.4%, picture frame 4.4%, cat 0.8%.

## Where it could still be better

- When the girl lifts the cup to her lips, hand, cup and face crowd together and get a bit blurry at the 6–8.5px stone scale.

## Fix after review (round two)

- **Cat**: anchored at the feet (540,905), scaled to 0.85 with a canvas transform (the class map and dynamic rectangles scale with it); the ear tips drop from y≈540 to about 590, and the halo no longer touches the frame. The head was redrawn as a frontal Pompeii cat: two big yellow round eyes R17, black slit pupils, 7px dark eye rims, an 11px dark outline on the head, also traced into the class map as 6px small stones so the outline forms rows.
- **Cup smearing the face**: no longer uses the rig's original cup path; a custom `armPose` instead. The cup moves along a quadratic Bézier "tabletop → upper front (1150,470) → in front of the lips"; at the end, the right end of the rim touches `G.lips[0]`, with a tilt of 0.15rad (8.6°). The hand supports the cup from beneath its foot (offset interpolated from (28,34) to (3,44)); the IK uses the same arm lengths 165/122 and elbow direction. The forearm stands upright in front of the chin, and nose, lips, chin and eye are all visible. The face outline was thickened to 10px.
- **Patched-wall look**: removed the "8.5px area swept by the arm" class. Wall stones are unified at 12px (also closer to the scale of the original's wall stones); the wall in the dynamic area shares the same layout as its surroundings and only re-samples color each frame, so no boundary is visible.
  - Lesson: never give a dynamic area its own stone size for the sake of detail; when still, it's just a patch.
- After the fix: warm max 17.1ms, mean 13.0ms, determinism passes.

## Review fixes (round three, v1 review report items 3 and 4)

- **Border not visibly scrolling**: on the full-film timeline (renderFrame) it actually moves, but with "stones fixed, only color changes", the scroll moves only 1–3px per frame, which after quantization by 7.6px stones barely lights up in the motion heatmap.
  - Fix: the border became a "conveyor belt". At init, pre-bake a 2106px (26-period) strip of stones. The pattern period is 81px, and the stone layout also cycles every 81px: 11 stones per row with random widths, normalized to exactly 81px, and the jitter reused per period. So translating the whole strip by any phase joins seamlessly.
  - Each frame, for each of the four sides, `c.transform(side local coordinates)`, then clip and `drawImage(strip, BW−2·81+phase, 0)`; the stones travel clockwise together with the pattern. The four corner squares stay static.
  - Phase changed to `15·lt + 81·easeInOut((lt−0.485)/0.365)`; constant drift reduced from 42 to 15px/s, leaving the main motion to the one period at the original's frames 226–248.
  - Static-segment motion (motion.py, 480×270 mean frame diff, frames 222–253): recreation rose from 1.98 to 4.62, original 2.90. With 42px/s drift it was 5.5.
  - Rule: when a slow pattern shift is smaller than the stone size, "changing color only" gets eaten by quantization; either make the stones travel with it, or the shift must be much larger than a stone.
- **Cup not readable**: the cup was removed from the underdrawing and turned into a `cupSprite` inlay of small 4.4px stones. Content is the two-handled cup enlarged 1.3×: dark outline stones, gold body (darkened on the right), bright rim plus dark interior, two handles, foot. Each frame it is laid as a whole over the mosaic at `armPose`'s position and tilt. The steam was also changed to two columns of white square stones rising along a sine (`steamTiles`), with grout edges. The underdrawing keeps only the cup's white halo.
  - Rule: props narrower than 3 stones can't be read in a fixed layout; make them into an "inlay" that moves with the hand (emblema-style piece).
- **Facial features unreadable**: face stones changed from 6px to 5px. Eye white 13×7, dark 8×7, about 3 dark stones plus white; lips changed to red `#a8282a`, an 8.5×6 ellipse, about 2 stones; brows 6px dark brown. Viewed at half of 1080p, eyes and mouth are readable.
- After the fix: warm max 20.9ms, p90 17.4ms, mean 13.9ms, determinism passes.
