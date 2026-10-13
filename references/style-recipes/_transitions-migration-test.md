# New transitions from the migration tests (A–D)

<!-- From migration test A -->
## Transitions (new block at the end of `transitions.js`)

| Transition | Entering | Technique and parameters |
|---|---|---|
| `goldLeaf` 0.5s | Klimt | 72px squares. Order key = distance from the girl's head (1300,380)×0.78 + azimuth×0.12 + random×0.08, so the gold leaf spreads in a spiral. Each square q = (1.32p−key)/0.32: for q<0.5 a sheet of gold leaf falls into place from 1.3× with rotation, a gold gradient highlight moving with q, embossed with spiral, eye or concentric patterns; for 0.5<q<1, B is revealed and the gold leaf fades out. |
| `screamWarp` 0.5s | Munch | The old painting is sine-warped per row with amplitude 70e. A wave front `y = lerp(−180, H+220, e) + 80sin(x·.0055 + 7p)` pushes down from the top; above the front is the new painting (its warp amplitude 60(1−e) gradually settling). Four 26px color bands lie on the front: `#b82a1e #e2541c #f08a24 #f4c03a`. |
| `apsara` 0.5s | Dunhuang | A front `x = lerp(W+260, −300, e) + 110sin(y·.006 + 5p)` sweeps right to left, with the new painting on the right. On the front, 3 ribbons (malachite green, earth red, azurite blue; widths 44/38/32; traveling waves; white dashed patterning). Left of the front, fragments of the old painting (taken directly as pixel blocks from A) tumble and fall on parabolas — "the old painting peeling away". |
| `dotBloom` 0.48s | Kusama | A 58px hex grid; dots grow in order of distance from the cat (540,760) (outBack, up to 0.74× the spacing, exactly tiling the screen), with the new painting clipped inside the dots. Dots not yet fully grown have a white outline that gradually fades. |

---

<!-- From migration test B -->
## Transitions `transitions_b.js`

| Entering | Name | Technique | Parameters | Per frame |
|---|---|---|---|---|
| Dalí | `melt` | The old image sags column by column in 4px strips (`sag = 0.22·edge·e`, stretched 0.3); the new image is above the liquid surface edge(x), where edge = an overall falling line (−160 → H+40, easeInOut) + 26 round-headed drips (width 10–32, length 60–280, profile `(1−u²)^0.3`, each with its own start phase) + a sine wave; the liquid surface gets a dark edge (blur 3) + highlight | 0.36s | 86ms |
| Hopper | `sunShaft` | The old image is `multiply`'d with cool green `rgba(70,120,110, 0.7·min(1,2p))` to sink into shadow; a slanted light block (260px slant) sweeps its right edge across the screen, containing the new image + `screen` warm light (0.45 → 0, receding over p 0.6–1) + a diagonal window-mullion shadow moving with it; a bright line on the leading edge | 0.34s | 76ms |
| Ghibli | `bleed` | 5 color blooms open in t0 order (the window first), radius `q·1400·k`, q=easeInOut(seg(p,t0,t0+0.66)), boundary `R·(1 + 0.28·fbm(angle) + 0.05·sin 9a)`; outside, a 70px bright halo at blur 18 (the water arrives first), inside is the new image, a 5px `multiply` brown water mark at the edge. The halo and water-mark α are both multiplied by (1−q) | 0.38s | 127ms |
| Vaporwave | `vhs` | Old in the first half, new in the second; in p 0.38–0.62 a "vertical sync loss" rolls the whole frame up + a 40px black bar; tear bands of random height 6–54px are taken from A/B (probability of taking B = p), displaced sideways ±130·sin(πp); magenta/cyan single-channel copies offset ±14 via `screen`; 160 snow lines | 0.30s | 88ms |

What they share: each transition is "a physical process of the new style", not a generic wipe — the melt is liquid, Hopper is light, watercolor is water, VHS is tape. When designing, first ask: "By what physical process would an image in this style appear?"

---

<!-- From migration test C -->
## Transitions (`transitions_c.js`)

| Entering | Name | Technique and parameters |
|---|---|---|
| Monet | `ripple` | (distance denominator 1700, a fade-in added from p>.7 to make sure the corners are clear by p≈.85) The old image is displaced sideways in 6px row strips by a sine, `dx=sin(0.045y−26p)·46·sin(π·min(1,1.2p))·(0.4+|y−cy|/H)`, like a reflection being stirred. The new image appears through a clip made of 3600 **short horizontal stroke ellipses** (length 40–110, height 9–17), spreading in rings by elliptical distance (y×1.9) from the cup (1000,600). Three light dashed ellipses on the front, dashOffset following p; 140 horizontal water-glint lines flicker in the middle. A fade-in layer is added for p>.85. |
| Seurat | `pointill` | Grid pitch 14: dots grow from 0 to r=6.4 (first 30%), and the old image under the dots fades to paper color. Each dot's color-change moment `0.5·(0.6x/W+0.4y/H)+0.25·hash+0.15`, top left first, with randomness; at the moment of change the dot "jumps" to 1.35×. For p>.6 the new image develops under the dots; for p>.7 the dots shrink back. Needs one getImageData each of A and B per frame. |
| Matisse | `cutouts` | A 1100px-wide sheet of cobalt paper (left and right edges cut irregularly with sin) sweeps right to left, drop shadow (14,10) blur 12. On the paper: 260 gouache brush marks, with pinned white/yellow seaweed (stem + 7 fingers), yellow/pink 6-pointed stars (rotating with p), red discs, each with a drop shadow. Behind the paper's right edge the new image is already in place. |
| Haring | `radiant` | A V-shaped dancing figure scaled `s=0.15·320^easeInOut(p)`, enlarging with the cup as origin. First "stroke 30px black + fill black" for the outer contour, then offscreen fill the limbs white and `source-in` the new image, giving the new image inside the body; 16 rays around it jumping at 8fps; a fade-in added from p>.82. The first version's exponent was too slow (`0.08·40^…`: only 300px tall for the first 80% of the time, then a hard cut at the end); the second version `0.15·120^…` still left gaps at the end and could only finish with a ~1-frame fade-in, which the review judged a flash frame; the final is `s=0.15·320^easeInOut(p)`. |

**General lessons for transitions**:
- Transitions that need pixels (pointillism, water ripples) do getImageData on A/B each frame, about 10ms each, which is acceptable.
- For transitions of the "new image hidden inside a shape" kind, once the shape is a union of several pieces, don't `clip(union Path2D)`: subpaths with inconsistent winding cancel out into holes. Fill white offscreen instead, then `source-in`.

<!-- From migration test D -->
## Transitions (section D at the end of `transitions.js`)

| Transition | The new style's signature | Technique and parameters |
|---|---|---|
| `irisFilm` Rembrandt→rubber hose | 30s cartoon iris in/out + old film | ① p<0.5: the old painting gradually gets `sepia(q) grayscale(0.7q) contrast(1+0.3q)`, a black iris closes to the cup rim (1236,420), R = R0·(1 − easeIn(q)), R0 = distance to the farthest corner ② p≥0.5: the new painting springs open by R0·outBack(q) ③ the circle has 48 segments with ±1.5% hand jitter at 12fps ④ film flicker, scratches and dust throughout |
| `lampGlow` rubber hose→shadow puppets | Lamp lit behind the screen | ① The old painting is multiplied with rgba(70,34,12, min(1, 2.2p)), dimming like a lamp going out ② the new painting is revealed through a destination-in radial mask (solid to 0.55R, transparent at the edge), R = 1500·inOut(seg(p, .12, 1)), with flame flicker ±7% ③ a lighter warm glow sin(πp) plus a small flame |
| `flareSweep` shadow puppets→Shinkai | Light leak, light sweep | A diagonal (k=0.35) dividing line sweeps from −500 to W+700 (inOut). New painting on the left, old on the right. Three lighter light bands lie on the divider: width 520 α0.55 warm, 160 α0.85 white, 60 α0.6 cyan. Plus a horizontal streak, 40 light particles and 3 hexagonal flare spots |
| `blueBrush` Shinkai→blue period | Color drained away + broad dry brush | ① The old painting gets rgba(45,90,148, min(1, 2.2p)) laid with the `color` blend, leaving only blue; then multiply to darken ② 6 broad brushstrokes (each H/6+90 tall), alternately tilted ±18, brushing left to right in turn with start times staggered by 0.07. The brush head is a quadratic curve, with 6–7px sine wobble on the top and bottom edges ③ within 80–280px behind the brush head, 26 dark/light gradient bristle lines (paint not yet brushed out evenly) |

General steps for designing a transition (suggested for layer 3 of doc 02): find the physical process in the new style by which things "appear, light up, sweep across" → use it to first "contaminate" the old painting → let the new painting emerge from the shape of that process → add a brief highlight or overshoot on the beat.
