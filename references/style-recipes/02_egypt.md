# 02_egypt · 1350 BC Egyptian tomb murals (pure code)

File: `scenes/02_egypt.js` (about 460 lines). Performance: warm max 20.7ms / mean 10.5ms (1920×1080); `init()` warms the caches at boot, so the first frame no longer stalls for 170ms. Determinism check passes.

## Pipeline
1. **Static layer `eg_static` (cached once)**: plaster wall → hieroglyph columns → window (cornice / colored block frame / white ground / Aten sun disk / uraeus) → 3 pottery jars → offering table and offerings → golden chair → blue bowl → ground line and multi-layer bottom friezes → deep-blue band → top/left/right colored block borders.
2. **Moving motifs (drawn every frame, cheap)**: water-ripple hieroglyphs flowing, Aten rays + little hands at the ends opening and closing, two long rays reaching in front of the cat holding an ankh, scarab pushing the sun ball.
3. **Characters**: redrawn in Egyptian convention, not via RIG.drawGirl/drawCat; only anchors and choreography are taken.
4. **Mural surface**: an `eg_surface` mottled layer `multiply`'d over the whole frame + `P.grain` + 6 random-walk hairline cracks (cracks are drawn in the surface layer, so they cross the figures like a real aged wall).

Egyptian murals are "no perspective, flat color, outlines", so **no stroke renderer at all** is used here, and lines don't boil (clean 2.2–2.8px dark-brown `#2a1810` lines look right). The sense of era comes entirely from convention (profile face with frontal eye, frontal shoulders) + palette + pattern density.

## Palette
Wall `#eadcb8` → mottled dark areas `#d8c597`; four-color borders red `#b8322a` blue `#2a58a8` yellow `#e2b13a` green `#2e8a55`, off-white between blocks `#f2ead6`, black seams `#231a14`; gold `#e0ab38` / dark gold `#a8741c` / bright gold `#f3d27a`; deep-blue band `#1c2236`; red column lines `#9a2b22`; Aten sun disk `#c8372b`, rays `#c23a2a`, little hands `#b4452c`; skin `#e6b282` (the light yellow ochre for Egyptian women); cat orange `#e08a3c` stripes `#b45a1c` white `#f6efe0`; scarab lapis `#2c56b0` + turquoise `#3fa6a0`.

## Hieroglyphs (the strongest sense of era)
- **24 glyph functions** were written (ankh, sun disk, bread, reed, owl, falcon, heron, horned viper, Eye of Horus, cartouche, scarab, seated man, leg, arm, basket, house, three strokes, feather, djed pillar, shen ring, jar, lotus, nfr, mouth, water ripple), each drawn in 10–20 strokes inside a ~50px box, with candidate colors. Line width 3.1 (about 3px after scaling), `round` caps.
- Column positions measured from the original: left 3 columns x=78..306/y=66..566, top-middle 4 columns x=852..1172/y=66..452, right 4 columns x=1560..1866/y=252..882, 1 column left of the cat x=298..366/y=614..886.
- Layout: seed `U.rng(1350)`, filling each column top to bottom; glyph scale = column width/78×(1.0–1.14), spacing 6–11px; **no adjacent repeats in a column, the same glyph ≤3 times per column, scarab/water ripple down-weighted 60%** (the first version had no limits and the screen was full of scarabs, like stickers).
- Layout is computed at module init and positions stored — so the water-ripple glyphs can stay out of the cache and be drawn separately each frame. At least 6 water-ripple glyphs guaranteed.

## Motif animation (all driven only by lt/t, deterministic)
| Motif | Method | Numbers |
|---|---|---|
| Scarab pushing the sun ball | x(lt)=800+642·(lt−0.394), from the original's measured 10.7px/frame; loops modulo 2160; ball rotation angle = ball center x / radius; legs in two poses `floor(lt*15)%2` (switch every 4 frames at 60fps) | Whole thing ×1.22, ball r=23×1.22 |
| Aten hands opening and closing | open=0.5+0.5·sin(2π·lt/0.4+k·0.9), finger spread (0.1+0.24·open) | Period 0.4s, 13 inside the window + 2 outside |
| Rays trembling | ends x+=3·sin(7t+1.3k), y+=2·cos(6t+k) | ±3px |
| Water-ripple glyphs flowing | zigzag phase = floor(lt·12)·0.5, 12fps stepping, 4-step loop | 0.33s per loop, like hand-drawn frames |
| Holding the cup | `cup = lerp(0.8,1,choreo.cup)`: in the original she is "drinking with the cup at her lips the whole time", so only the last 20% of the lift + choreo.sip head tilt is used | — |
| Cat | choreo.tail tail flick (RIG.cat.tailPts), blink (t≈2.18–2.30, landing right at lt≈0.77–0.89 of this segment), breathe on the upper body | — |

Motion: lt 0.45↔0.9 (avoiding the beat-hit zoom) 3.5% of pixels move, concentrated on the rays' little hands, cat's tail, girl's head and arm, and the scarab — not a large amount, but all at focal points.

## Characters: Egyptian convention
**Girl** (`RIG.girl({dy:-25})`; dy puts the feet on the ground line at y=900):
- Profile from `G.face`; the **frontal eye** is drawn by hand: almond-shaped white + black pupil r4.2 touching the upper lid, upper eyeliner 3.2px trailing back 18px (kohl tail), long brow.
- **Frontal shoulders**: the torso doesn't use G.torso but a hand-drawn wide trapezoid x 1270–1452 (both shoulders visible, wide at the top, narrow at the bottom).
- White linen: fill with skin first, then cover with white at `alpha .9` → a hint of skin shows through = the translucency of linen; 27 fine Bézier pleats fan out from waist to hem (clipped to the skirt, `rgba(120,96,70,.5)` 1.3px), vertical chest pleats spaced 9px.
- Broad collar: 5 concentric half-ellipses (blue/red/green/gold/blue, rx 50→88, ry 24→55), outer ring with 18 alternating red/blue teardrop pendants.
- **Golden braids**: clip to the wig outline, then draw 15 vertical braids; each = 11.5px dark-gold base line + 8.5px gold line + alternating left/right diagonal segments every 8px (herringbone), ends staggered in length. The first version used tiny beads everywhere and looked like "golden caviar"; switching to long strips + diagonal segments made it read as braids.
- Gold headband (Bézier 15px black base / 11px gold / 3px bright gold) + trailing ribbon, large gold earrings, gold armband (gold 8px + blue 2.5px stripes).
- **Cup-holding arm**: RIG's default hand sits at the side of the cup with the shoulder mid-torso, swinging the elbow far out. Changed to "the hand supports the cup from below (the foot)", the shoulder moved to the front shoulder (1282,476), and `RIG.ik2(sh, hand, 140, 160, -1)` lets the elbow hang down in front of the chest.
- Blue lotus cup: petal-shaped cup body + three light-blue petal lines + foot, following G.cup's position/tilt.

**Cat = Bastet seated pose** (`RIG.cat({dy:-5})` provides headC, tailPts, blink, breathe; the body is drawn by hand):
- Silhouette: upright chest + round haunches, **forelegs enclosed in the silhouette**, one continuous white area from chest to front paws, then two lines separate the two forelegs + toe lines. The first version drew the forelegs as two separate white pillars and they looked like bowling pins.
- Side head + tall pointed ears + frontal almond eye (yellow `#e8cf4a`, slit pupil, black eyeliner tail), white muzzle, whiskers, gold earring.
- Collar clipped to "body ∪ head" (merged with `Path2D.addPath`); otherwise the round head's outline pokes out of the neck; Eye of Horus gold pendant.
- Orange tabby: 9 dark-orange arcs on the back, 4 on the thigh, 5 on top of the head; a crosswise stripe every 3 sample points on the tail, white tail tip.

## Pitfalls we hit
- In this segment the selfcheck's 0.2↔0.7 diff shows "the whole frame moving" — that is the engine's beat-hit zoom (lt<0.36s), not the scene moving. To see real motion, compare two frames with lt≥0.4.
- `P.texture` takes about 170ms the first time; warm it in `init()` (called at engine boot), otherwise the first frame of the T01 transition stalls.
- The rubble in the original reference is transition leftovers, not picture content; don't copy it (it isn't in the design sheet either).
- The year-plate area 1500–1890×40–210 shows only wall; the right hieroglyph columns start at y=252, just avoiding it.
- Fix after review: at the cat's original size the ear tips at y≈530 pressed onto the colored blocks at the bottom of the window frame (y 530–560), as if the cat's head were stuck into the frame. Changed to scale the whole cat to 0.85 via a canvas transform anchored at the feet (540,898) (RIG.cat still s=1); the ear tips land at y≈585. The ends of the two long rays are mapped with the same transform `catPt()`, so the little hands still land on the cat's head/muzzle; the back line and haunches moved forward 12–20px to make the Bastet pose more elongated. **Lesson: aligning the cat/person and the window frame each to the standard composition box isn't enough — the two boxes come very close around y≈540–600, and parts that extend beyond the rig box, like taller ears, need their clearance to nearby objects checked separately.**

## Fix v2: Egypt too static (review report item 3)
Metric: full-film renderFrame, static frames 112–140, 480×270 mean absolute per-frame difference (counter masked). **Before 0.32 → after 0.84 (original 0.90)**, performance warm max 21.7ms.
- **Cup-drinking loop**: for lt<0.35 follow choreo up to the lips; afterwards a 0.6s loop `cup = 1 − 0.46·(1−cos 2πu)/2` (the cup lowers from the lips to 0.54 and lifts back); while the cup is at the lips add a head tilt `sip += 0.3·clamp((cup−0.78)/0.22)·(0.65+0.35·sin 13lt)`, head angle up to ~0.2rad. This contributes the most.
- **Inscriptions being written out**: every 0.12s take 6 glyphs from a shuffled list (seed 77, across all columns): first erase with a `drawImage` sub-rectangle of the wall texture, then trace stroke by stroke with `setLineDash([p·95, 999])` (each subpath's dash restarts on its own, exactly like writing stroke by stroke); filled parts appear only when p>0.55; ink color falls from bright gold `#f6c846` back to the original color, with a 10px gold shadowBlur afterglow, finished in 0.36s. About 18 glyphs are being written at once.
- **Aten pulse**: period 0.45s; ray lengths ±9% in sequence along the fan (phase −0.55k, like a wave sweeping across), line width 2.2→3.8, little hands scaled 0.9–1.2 overall with finger spread 0.03–0.45; a gold glow + bright ring pulse outside the sun disk, and the disk is redrawn over the glow to keep it red. Hand coordinates are clamped inside the window (x 428–752, y≤512), otherwise when extended they get half cut off by the frame.
- **Cat**: tail amplitude `tail·2.1 + 0.25·sin 9.5t`; the two ears twitch quickly out of phase (every ~0.38s for 0.1s, rotating 0.32–0.38rad around the midpoint of the ear base).
- Lesson: thin-line motifs like Aten rays and water-ripple glyphs barely register in a 480×270 frame diff; **to measure "visibly moving" you need local motion with enough area** (arm + head, whole glyphs being erased and rewritten); thin-line swaying is only decoration. The first version's sun-disk pulse covered the disk with semi-transparent orange, which at its peak turned the red disk orange; changed to a glow + bright ring outside the disk.
