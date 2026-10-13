# 26_vaporwave · 2011 Vaporwave / cyber neon

> Source: migration test B (built by an independent agent that only read the skill, 2026-10-04). The scene code was ported to `scripts/engine/scenes/26_vaporwave.js` after integration.

Filename during the experiment: `scenes/c5_vaporwave.js` (about 210 lines). Review red light: the top was pink in the first version and blended with the pinkish skin, reading as if she weren't wearing clothes. Changed to a lavender-purple windbreaker `#8f7cf6` + white triangular collar + cyan zipper line. Per-frame median 49ms; frame diff 25% (the VHS post-processing makes the whole screen move).

**Pipeline**: the whole picture is first drawn into an offscreen S, then VHS post-processing outputs it to c (the counter is drawn on top by the engine and isn't affected by the chromatic aberration).
1. Wall: deep-purple vertical gradient `#0d0322 → #4a0f6a` + magenta radial light at the window, cyan radial light at the sign. A cyan light strip along the base of the wall.
2. **`glowLine(c, col, w, blur)`**: the same path is first stroked thick with shadowBlur for the glow, then stroked with a 2–3px near-white core — a neon tube.
3. Sunset in the window: the sun is a yellow → orange → magenta vertical gradient, with 7 horizontal slits cut by `destination-out`, slit width growing with depth (2 + q²·16), the whole thing rising at 0.9/s. The horizon is wireframe mountains (magenta glow), with a cyan perspective grid below rolling toward the viewer, and palm silhouettes swaying on both sides.
4. Floor: magenta perspective grid, vanishing point (960,600), horizontal lines `y = 600 + 520/d`, d = k + 1 − phase (phase = 1.3t mod 1), line width thicker when near.
5. **Neon sign "カフェ" drawn as neon tubes from polylines** (no font dependency): each kana 1–3 strokes in (u,v) unit coordinates. Each character flickers by a per-frame hash: off when `hash(floor(30t), k) < 0.07`; "フ" additionally goes off with 22% probability when `f mod 17 < 5`, drawn as a dark-purple tube when off.
6. Win95 dialog TEA.EXE: gray body, navy gradient title bar, progress blocks `3 + 14lt`, percentage `18 + 70lt`. Marble bust on the table (22-point profile silhouette, purple-gray gradient + vein lines + pink rim light + the sunglasses meme).
7. Characters: pink sweater, cyan pleated long skirt, blonde hair + pink scrunchie. Glowing outline "pink on the side facing the window, cyan on the back": the same set of paths stroked twice, clipped to the left and right halves of the screen respectively.

**VHS post-processing `vhs(c, S, t, lt)`**
- RGB split: for each channel, draw S into a temporary canvas, `multiply` with pure `#ff0000/#00ff00/#0000ff` to extract the single channel, then composite offset onto black with `lighter`. Offset 3 + 1.5sin(7t), occasionally (hash<0.12) +6.
- Tracking-noise band: 70px tall, rolling down `(520lt + 200) mod (H+160)`. Inside the band, every 6px row is displaced horizontally `±30·sin(πy/bh)`, plus 90 white-gray noise lines.
- Scanlines: a 4×4 tile pattern (row 0 α 0.28, row 2 α 0.12). OSD: PressStart2P "PLAY" + a hand-drawn ▶ (the font lacks this glyph), blinking every 16 frames; the date and timecode at bottom left advance with lt.

**Palette**: magenta `#ff4fd8`, hot pink `#ff2f8f`, cyan `#3ff6ff`, deep purple `#12052a / #2a0b4a`, sun yellow `#ffd84a`, orange `#ff8a3a`.

**Pitfalls**
- Full-width "ＶＡＰＯＲＷＡＶＥ", ▶ and Japanese are not in `lib/fonts` and silently fall back to system fonts. Labels were switched to half-width + letter spacing 7, and ▶ and the kana are drawn by hand.
- The figures' outlines use part paths, so the waistline and the joins between arms and torso also glow. That's acceptable for neon line art, but for a pure outer contour you'd need to draw the silhouette offscreen first and then stroke the edge of that layer.

---
