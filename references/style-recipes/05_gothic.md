# 05_gothic · 1290 Gothic illuminated manuscript

11–22ms per frame (median 12ms). The static layer + gold-leaf mask are built once in `init()`.

## Pipeline
1. Static layer `goth_static` (cached): parchment → gold leaf → diamond-lattice embossing → gable, pinnacles, side columns → pointed-arch window and stained glass → table, throne → Latin text column → little knight in the margin.
2. Gold-leaf mask `goth_mask`: compute a per-pixel "goldness" on the static layer, `clamp((r-b-70)/50)·clamp((g-b-30)/40)·clamp((r-140)/40)`, and use it as alpha. Parchment (236,223,194) has r−b of only 42 and is excluded; the pink bands have a high b and are excluded too. **No need to draw the gold shapes a second time as a mask**: everywhere that is gold automatically gets swept by the highlight — background, initial letter, gold balls, gable finial.
3. Each frame, in order: stained-glass glints → diagonal highlight → four-pointed stars where the highlight passes → vine ornaments → snail → mouse running past → cat → girl → grain.

## Gold-leaf texture (the "fine texture + highlight" the spec requires)
- Per-pixel shading: `f = 0.52 + fbm(x·.0035)·0.42 + horizontal burnish noise(x·.004, y·.09)·0.5 + light from top left + grain ±0.05`, then interpolate between goldLo #9c6a1a / gold #d9a63a / goldHi #f8de86. The burnish's y frequency is over 20× its x frequency, so it reads as horizontal brushed metal.
- Diamond lattice: spacing 46px, two families of diagonal lines (x+y and x−y each constant). Each line is drawn twice: once dark, once light offset by 1.2px, so it looks incised into the gold. Four dots are punched at the center of each diamond, bright at top left, dark at bottom right.
- Every 118×125px, a very faint square seam, imitating gold leaf applied piece by piece.
- Diagonal highlight: first draw a linear gradient band on a 920px-wide scratch canvas, slope K=0.45 ("/" direction). Multiply by the mask with `destination-in`, then lay it back over the image with `lighter` at α0.62. **It moves at constant speed**: `x = lerp(150,1650,(lt-0.08)/1.15)`. The first version used inOut easing, and by 0.9s the highlight had already swept past the gold area, so it never showed on the girl; with constant speed it reaches the window edge at 0.3s and sweeps across the girl right at 0.9s. The halo and 11 fixed points are tested with `|u − sweepX| < 70` and flash a four-pointed star as the highlight passes.

## Motif animation (all visible within the 0.25–1.4s window)
- Vines: two stems of about 120 points each, each point swaying `sin(t·2.1+i·.09)·2.5`. Every 3–5 points hangs a three-lobed ivy leaf (blue/red/gold in rotation) or a gold ball with 3 tendrils. Leaves sway around their attachment point by `sin(t·3.1+k·1.7)·0.28`. The first version scaled leaves at 0.85, too small and sparse; at 1.05–1.45 the density approached the original.
- Stained glass: 26 random points light up a white radial glow when `sin(t·5+h·40) > 0.6`.
- The cat raises one front paw holding a mouse by the tail; the mouse swings like a pendulum `0.32·sin(t·5.5)`, legs kicking wildly. The snail crawls left at 62px/s with antennae waving; the mouse under the text column runs 360px within 0.12–1.17s, legs swinging at 40 radians per second.
- The girl lifts a gold cup following the shared choreography; a four-pointed star twinkles on the rim, and the steam is fine ink lines.

## Characters
- The girl is drawn from `RIG.girl`'s Path2Ds in a custom order, **not via `RIG.drawGirl`**, for two reasons: drawGirl always draws a mug with a handle; and the cloak and halo need to be inserted between certain layers. Drawing order: halo (centered on headC offset by (16,−22), r=114, red ring plus 36 punched dots) → long wavy blonde hair → red robe (fine gold vertical stripes every 20px, a gold edge on the hem) → blue cloak (anchored at nape/back, gold edge) → head → golden chalice.
- The cat is the "human-faced cat" of manuscripts: the face is a cream ellipse, almond-eye pupils squeezed to the right, glancing sideways at the girl, thick upper lids, raised brows, downturned mouth corners, red cheeks. Only `legs[0]` is used; the other foreleg is drawn with `RIG.limb` in a raised pose.
- The Latin body text uses UnifrakturMaguntia at 44px. 50px pushes "cum poculo suo" off the right edge. The sentence-initial words Cattus/Nemo/Mus are in vermilion — the medieval rubrication practice.

## Pitfalls
- The scratchpad was shared with other era authors, and `check.py` was overwritten by someone else once. Put your selfcheck scripts in your own subfolder.
- A motion diff using lt=0 as the baseline is polluted by the engine's camera punch over the first 20 frames (1.03 scale). Use lt≥0.35 as the baseline.

## v2 tweaks
Vine sway ×2, leaf sway 0.42; 40 stained-glass glints; gold highlight α0.85 with a wider band. Static-segment frame diff 1.10 → 1.32 (original 1.64).
