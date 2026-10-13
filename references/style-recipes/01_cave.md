# 01_cave · 40,000 BC cave painting (pure code)

File: `scenes/01_cave.js` (about 330 lines). Final performance: warm max 22ms / mean 21.1ms; the cold pass (building caches) happens at engine boot; determinism passes; 0.2↔0.7s motion diff 3.9% of pixels.

## Pipeline
1. **Rock wall (fully cached, `cave_relief`/`cave_bg`)**
   - Height field computed at half resolution 960×540: `fbm(x·0.0022,4oct)·1.0 + fbm(x·0.011,3oct)·0.16 + noise(x·0.05)·0.03` (coordinates in full-resolution pixels).
   - Finite differences ×52 give normals; light L=(-0.55,-0.62,0.56) (top left), `shade = clamp(0.5+(dot-0.56)·0.9)`; base color mixed between `#ce925a` (light ochre) / `#6e4426` (dark) / `#b6643a` (red patches) with two layers of low-frequency fbm, then ×(0.72+shade·0.55). Upscaled to full screen with smooth interpolation → gentle relief.
   - Two layers of `P.grain` (dark 0.22 density α0.32, light 0.10 α0.28) for grain; 10 random-walk cracks (turn ±0.45rad per step, step length 14–40px, 12% chance to branch), with a light line offset +1.6px under each dark line → incised feel.
   - Vignette: radial gradient r 260→1180, outer ring α0.8; a static warm light at the center using lighter (α0.36) lights only the rock wall.
   - **Pitfall: if the mid-frequency term of the relief is too large (0.35, normals ×60), the whole wall turns into camouflage/sand dunes, and figures with the texture applied look like they're wearing camo.** Only after lowering the mid-frequency to 0.16 and normals to ×52 did it look like rock.
2. **"Pigment soaked into the rock"**
   - Every shape uses the same `shape()` routine: first stroke with a **fuzz pattern** (sparse charcoal dots, width 2lw+7) → then stroke with an **ink pattern** (charcoal black, 7% random holes + large holes where noise > 0.58, width 2lw) → finally a flat fill covers the inner half. Result = solid charcoal line + spray-dot fuzzy edge, and painter's order naturally handles occlusion (the arm covers the coat's line).
   - Charcoal "boiling": two 256 patterns are randomly translated with `pattern.setTransform` every 1/9 s; the geometry stays still while the grain jumps — cheaper than jittering paths and no deformation.
   - After the whole pigment layer is drawn, `source-atop` overlays a `cave_figtex`: rock shadows → black α(0.5-v)·150, highlights → warm white α(v-0.5)·50, dark/light grain, low-frequency wet/dry patches α≤70. **The pigment layer has only one full-screen composite**, hence 19ms.
   - All fills are opaque flat color, "dirtied" by the texture; do not multiply the pigment — chalk white (the cat's white) would disappear.
3. **Negative handprints/paw prints**: on a 320² temporary canvas, Gaussian spray dots (σ46·s 3200 dots α0.15–0.6 + σ28 1400 dots), then `destination-out` a solid hand-shaped mask, and finally fill the mask at α0.3 with `#f6e2bc`. **The hand shape must be filled into the mask piece by piece**: adding the palm ellipse and finger capsules into one Path2D and filling once makes subpaths with opposite winding cancel out under nonzero, leaving gaps (hit in r4).
4. **Firelight**: one radial gradient per frame, center (1000+40·noise(t·3.1), 540+26·noise(t·2.3)), intensity `0.13+0.09·noise(t·8.5)+0.04·sin(21t)`, **composited with overlay** (α = intensity×2.6). An outer vignette that breathes opposite to the firelight is layered on top. Pitfall: lighter at first washed the girl's blonde hair and the animal hide to pinkish white and lost the ochre saturation; switching to overlay brought the colors back.
5. **Embers**: three groups of `P.particles` (left 0–360 ×11, right 1540–1920 ×12, middle ×5), y drifting from 1110 up to 120, life 5.5s; bright core r 2.2–4.6 + glow 3.2×, `|sin(6t+1.9i)|` flicker, `sin(q·π)` fade in/out at both ends, lighter composite.

## Motif animation
- **Bison/horse in two poses**: `ph = floor(t·60/7)%2` (switch every 7 frames); two sets of coordinates for leg endpoints (extended/tucked), head rotates ±0.07rad around the neck point, whole body alternates y -3/+1px; horse and bison in opposite phase. Legs are charcoal lines only (as in the original); bodies are filled silhouettes + a 22px dark shading along the back (Lascaux-style modelling).
- **Holding the cup**: did not use RIG's cup trajectory (table → mouth, with the table point at the girl's chest, unlike the original's "arm extended holding it in mid-air"). Custom: `hold=(1084,506)` → `mouth=HP(1224,380)`, progress `k = choreo(max(0,lt-0.95)).cup` (the choreo curve shifted 0.95s to match the original's cup lift starting at frame 58); the arm uses `RIG.ik2(G.A.shoulder, cup+(34,10), 170,128,-1)`; `RIG.girl({cup:k})` still handles the head tilting back and the slight lift while drinking. k reaches 1 at lt≈1.85 (end of the T01 transition).
- **Steam**: three charcoal lines `x0 + sin(13q − 11t + 1.3j)·6`, 58px tall, following the cup.
- **Cat**: RIG.cat anchors for head/eyes/nose/earInner/stripes/tailPts + a self-drawn pear-shaped body, white chest, white forelegs, thigh arc; tail = fuzz/ink/orange three-layer stroke + a crosswise stripe every 4 sample points; blinking comes from choreo.blink.
- **Cat size (fix after review)**: at RIG.cat's original size the ear tips sit at y≈535, poking into the bottom edge of the mural frame (550). The whole cat is scaled 0.86 via a canvas transform anchored at the feet (540,905) (translate→scale→translate; RIG.cat itself stays s=1); the ear tips land at y≈582, about 30px clear of the frame bottom, and the feet don't move. Line widths scale ×0.86 too; the difference isn't visible.
- **Title**: `Kalam-700` 78px letterSpacing 7, horizontally scaled to 930px wide, `#9b2a18`, drawn into the pigment layer (so it also takes the rock texture). α = t<0.933 ? 1 : 1-(t-0.933)/0.2.

## Motion fix (review metric: static frames 21–84, 480×270 mean per-frame difference)
Recreation 0.62 vs original 0.86: too static. Only local motion was added, not full-screen flicker:
- Firelight: intensity `0.14+0.11·noise(9.5t)+0.04·sin23t+0.03·sin37t`, center wandering ±60/±36px (was ±40/±26). Tried bigger (±0.16, ±90px), which shot up to 1.22 and made the image wobble; dialed back.
- Embers 28→49 (left 20, right 20, middle 9), bright core r 2.6–5.4, glow α0.32 at 3.6×, flicker `0.3+0.7|sin|`.
- Handprints flicker: each handprint gets a warm r=105 radial gradient (lighter), α=0.2·clamp(0.5+0.9·noise(7t+3.7k)), each with its own phase.
- Bison/horse bounce ±3 → 9px vertical, ±3px horizontal; head sway ±0.12rad.
- Small cat-head motion (matching original frames 65–81): lt 1.08–1.35 with a `sin(πq)` envelope, head lifts by rotating −0.16rad around the neck point (596,680), RIG.cat look pushed to 1.5, ears twitch at 60Hz ±0.06rad.
- Result: **0.62 → 1.06** (original 0.86); max 22ms per frame.

## Making the girl fit the era
Red-ochre `#9c3520` silhouette (face/neck/arms/lower legs); the profile keeps a single almond eye (off-white sclera + black pupil + one eyelash, becoming an arc when blinking) — this one stroke is the key to reading as "a girl"; blonde hair filled with yellow ochre `#cf8f2c` + 6 wavy `#6e3c0e` strands (amplitude grows with length), with a wavy outline too; the lower half of the strands gradually stops following the head's rotation (the HB function), so the hair doesn't swing as a sheet when she tilts her head back to drink. Knee-length animal-hide coat = G.torso + a self-drawn hem (a ±16px jagged fur edge every 15px), `#b06a2c` + 26 leopard spots ("a round spot + 7 little dots") + 18 short fur strokes; seams are hidden by "stroke the edges of both pieces first, then fill them together".

## Palette
Wall `#ce925a/#6e4426/#b6643a`; charcoal `#21150d`; red ochre `#9c3520` / dark `#74261a`; yellow ochre (cat) `#c9772f`; blonde `#cf8f2c`/`#6e3c0e`; hide `#b06a2c` / spots `#4e2610`; chalk `#f0dfbf`; bison `#8c3d22` / head `#76301a`; horse `#cf8236`; stone `#c98c50`/`#c08048`; tabletop `#d49a5a`; handprints `#8e2a1a`; embers `#ffe082`.

## Still room to improve
- The girl's body uses RIG's realistic curves and is "too smooth" compared with real cave-painting figures; a more primitive approach is to downsample the outline to 12–16 points and add stronger hand-drawn jitter.
- The rock relief is static, and the firelight only changes brightness, not shadow direction. To truly have "the rock surface rippling as the firelight jumps", you'd need two shade maps with different light directions interpolated by the firelight (+1 full-screen composite).
