# 06_renaissance · 1503 High Renaissance (da Vinci style)

16–37ms per frame (median 16ms).

## Pipeline
1. Static layer `ren_static`: first draw the whole room on the original canvas, then draw the whole layer into the cache with `filter: blur(1.3px)` — effectively one sfumato pass over the whole frame. The room contains:
   - Wall: P.texture #43321f→#22180e, plus a radial gradient of window glow, darkened at the top.
   - Window: round-arched window, stone frame lit on the left, distant landscape in the opening.
   - Floor tiles: perspective checkerboard. Computed by true projection: `y = 420 + f·h/Z`, `x = 960 + f·X/Z`, f=1029, h=5.75, Z from 16 forward, 1.4 per tile. The first row lands at y=790, then 825/868/922/989 below, matching the original's row spacing. Tile colors #a88c64 and #5c2418, overlaid with a soft-light pool of light and a radial gradient darkening the surroundings (centered at 760,960).
   - Square table with white cloth, ladder-back chair.
2. Distant landscape (aerial perspective): three layers of mountains, bluer and paler with distance (#9fb4b8 → #7d9294), outlines generated with fbm. Then a lake, a river valley (gray-green fading to warm ochre), a winding silver-white river (width growing from 3 to 16px with nearness), cypresses and round trees, a stone bridge.
3. Each frame, in order: glints on the river (24 points of light drifting downstream and twinkling) → birds → ornithopter (all three clipped to the window opening) → character layer → light shaft and floating dust → overlay layer.
4. Overlay layer `ren_over` (cached, one drawImage):
   - Vignette: α0.3 at 0.55, α0.8 at the edge.
   - Yellow varnish: α0.07.
   - Canvas weave: one line every 3px.
   - Oil brushstroke texture: 9000 strokes, α0.022/0.028, line width 5–10, random direction.
   - Craquelure: P.craquelure at α0.32; then turned into white lines with `brightness(0) invert(1)`, offset 1px, α0.16, laid again with `lighter`, simulating the lifted bright edges of cracked varnish.

## Sfumato
Characters are first drawn into an offscreen layer `renChars`, processing only the region (320,180,1200,780). They're drawn back into the main image in two passes: first `blur(2.6px)` fully opaque, then a sharp layer at α0.38 on top. That keeps edges soft while features remain recognizable. Characters have no outlines; volume comes entirely from gradients:
- Skirt folds: light folds rgba(200,70,60,.3), dark folds rgba(40,0,0,.45).
- Velvet sleeves: a light band rgba(170,200,140,.45) drawn along the bone direction.
- Face: gradient lit from the left, plus eye-socket shadows.

## Motif animation
- Ornithopter: flies from x=470 to 740 over 0–1.35s while bobbing and pitching slightly. Two bat wings flap with `up = 0.5+0.5·sin(t·12+phase)`, wingtips between −118 and +24px. The far wing is scaled to 0.78, darkened, and offset 0.5 in phase. Wing construction: leading-edge spar + 6 radiating ribs + scalloped trailing membrane; the tail rudder swings too. The first version was a flat "paper plane" that didn't read as da Vinci's ornithopter; only after redrawing it as the current ribbed fan wing was it recognizable.
- Light shaft: a wedge drawn into the cache once with `blur(28px)`, screen-composited each frame. The first version filled a polygon every frame directly, and its two hard edges looked fake. The floating dust is 46 particles slowly rising along the shaft and twinkling.
- The girl sips from a silver cup per the choreography and closes her eyes when cup>0.7. The cat squints and smiles the whole time, tail swinging.

## Pitfalls
- The first version's oil texture used 26000 strokes at α0.05 with directions following noise, and the whole wall looked like Van Gogh's swirls (Post-Impressionism). Only after dropping to 9000 strokes, α0.025, random directions did it return to the feel of classical oil painting.
- Darkening the inside of the cat's body outline at 26px, α0.45 made the cream body look like a glass dome. Changed to 14px, α0.22, and the white chest uses a radial gradient that "blends" the orange fur in, with no hard boundary.
- The first version's floor tiles were too bright and too high-contrast, like vector illustration. The surroundings must be darkened, leaving only the pool of light where the window light falls.

## v2 fixes (review: too static, 0.20 vs 0.46; the protagonist blurred while the view outside the window was sharp — inverted depth of field)
- Sfumato changed: blur layer 1.6px (was 2.6), sharp layer α0.82 (was 0.38). Soft edges kept; features and outlines now clear.
- Ornithopter enlarged 1.6×, flight path 440→790, pitch amplitude ±0.07; birds increased to 14, enlarged 1–1.8×.
- Cat: head tilts and nuzzles around the neck ±0.16rad, squint alternating tighter/looser, tail ×2.2, breathing ×3, look turning the head left and right. Girl: hair ends sway ±11px, sip ×1.6.
- Cloud shadows pass over the river valley outside the window; the light shaft's brightness varies 0.75±0.35 with "clouds passing the sun"; 70 dust particles.
- Static-segment frame diff: 0.20 (reviewer's metric) / 0.30 (my measure) → 0.37. Original 0.43.
