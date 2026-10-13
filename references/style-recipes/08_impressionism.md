# 08_impressionism · 1874 Impressionism (Monet)

65–76ms per frame (median 69ms). The main cost is two full-screen P.strokes passes plus one character stroke pass.

## Pipeline (following the 09_postimp benchmark)
1. Flat underdrawing `impBase`, redrawn every frame because the poppies, clouds, bouquet, potted plant and curtains all move:
   - Pink-violet wall (#d8bede→#f0c8cc→#f2c4d4), with a warm yellow sunlight radial gradient r=900 at the top right.
   - Garden outside the window: sky, woods, red-roofed house, meadow, 70 poppies (stems fixed at the base, flower heads swaying sideways `sin(t·3.2+ph+x·.02)·(6+r·.6)`), a woman with a parasol plus a child (a tribute to *Poppy Field*), flower beds.
   - White window frame, pale violet curtains, *Impression, Sunrise* on the wall, round table with white-and-violet tablecloth, vase, teapot, potted plant on the right (the whole clump of leaves sways with `sin(t·1.9)·8`).
2. Stroke repainting, **two passes**:
   - Main image: cell 11, len 20, width 7, outline 0, jitterCol 26, with a mask excluding the window view and the small painting on the wall.
   - Window view and *Sunrise*: cell 6, len 11, width 4.5, drawn only inside the mask.
   - The first version had only one coarse pass; the house and the woman with the parasol outside were blurred away, and *Sunrise* was brushed into a smear by diagonal strokes. After splitting into two passes and changing *Sunrise* to horizontal water-ripple strokes, everything became recognizable.
   - The canvas is first primed with #f2e6ee, so the light ground shows through gaps between strokes.
3. Direction field: wall slanting to the upper right (−0.95 radians in the sunlit area, −0.55 elsewhere, plus ±0.55 noise); floor near horizontal; curtains and tablecloth vertical; potted plant radiating outward from the pot rim; sky in the window horizontal.
4. Regional palettes `P.swatch` (mixBase 0.3–0.45): wall 9 colors pink-violet-yellow; sunlit wall 7 colors cream-yellow; floor 7 colors rose-orange-violet; one set each for sky, grass green, pale-violet curtains, blue-violet tablecloth. The white window frame is detected with `col > (240,236,225)` and mixed back to white; otherwise it gets brushed into the wall color and the frame disappears. Poppy red returns null, keeping the underdrawing's original color.
5. Characters: first flat-fill with `RIG.drawCat` / `RIG.drawGirl` in fill mode, then run a P.strokes pass on the character layer with `source-atop` (cell 7, len 13), so strokes only appear inside the characters. The white dress samples four colors: white, pale violet, cream yellow. Afterwards only the facial features are added, with fine pale-violet lines; Impressionism doesn't outline.
   - The straw hat, blue ribbon and sash streamers all flutter.
   - `pal.line` must be set to the hair gold: drawGirl strokes parts like locks and lid with pal.line even when lw=0, and the default dark blue leaves black streaks beside the face. Same for the cat: set `line`/`whisker`.

## Motif animation
- **Flickering, jumping sun flecks**: 26 patches (6 on the tabletop, 20 on the floor). Each patch's intensity is `0.5+0.5·sin(t·sp+ph)·sin(t·sp·0.53+2ph)`, clamped, so the rhythm of brightening and dimming is irregular. Patches drift slowly sideways ±10px. Each patch is 40 short bright yellow-white strokes, boiling by reseeding at 8fps. The first version used screen compositing at α0.75 and was nearly invisible on the pink ground; it only became bright enough with source-over at α0.95.
- The sunlit area of the wall has 60 diagonal bright strokes, flickering by reseeding at 6fps.
- Glints in the cat's fur: 60 candidate points, limited with `isPointInPath` to the left half of the cat's body and head (the lit side), flickering with `sin(t·7+h·30)`.
- The whole painting boils at 8fps; the steam is white.

## Performance
Two full-screen stroke passes plus one character pass, about 69ms. During transitions the engine has to draw both eras, so 08→09 totals about 69+110ms, over 150ms, but only for those dozen or so transition frames.

## v2 fixes (review: whole-screen strokes reshuffled every 7–8 frames, frame diff 18)
- All stroke positions fixed: `boil: 0`. **A fixed seed alone isn't enough**: P.strokes' random numbers are one sequential stream, and when the palette returns null the jitter consumes 3 extra numbers; whether it returns null depends on the underdrawing color, so when a poppy sways or the plant swings, the strokes in every following cell get reshuffled. `stable(palette)` wraps it so each cell consumes exactly 1 number and never returns null.
- Character strokes no longer use alphaMask (when the cup moves, the skipped cells change and the whole layer reshuffles); replaced with a custom loop where each cell's random number is `U.hash(i,j)`. As a bonus, per-frame time dropped from 115ms back to 72ms.
- "Aliveness" is now carried by local motion: sun flecks drift ±44px with flicker frequency 5–11; poppy sway increased to 10+; clouds move sideways at 45px/s; curtains and plant sway; strokes of the flowers and grass outside rotate ±0.22rad with the wind; the cat flicks its tail (×2.2) and turns its head (look).
- Static-segment frame diff (480×270, counter masked, transition frames at the end of the segment removed): v1 mean 4.14, peak 20.5 — strobing; v2 mean 0.57, peak 1.9. Original 0.77.
