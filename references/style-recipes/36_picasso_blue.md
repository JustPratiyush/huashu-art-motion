# 36_picasso_blue · 1903 Picasso blue period

> Source: migration test D (built by an independent agent that only read the skill, 2026-10-04). The scene code was ported to `scripts/engine/scenes/36_picasso_blue.js` after integration.

Filename during the experiment: `scenes/r5_bluepicasso.js`, about 24ms per frame.

**Pipeline**: blue monochrome flat underdrawing (wall, floor, night sea and moon outside the window) → repainted with broad, dry strokes, then blurred 7px and laid at 80% → very faint dry-brush filaments → window frame copied back as-is, with small strokes added → table on its own layer → thick environment outlines (no jitter) → waves, broken moonlight, clouds → characters (elongated overall) → small character strokes + cold light gradient → thick visibleLines outlines → shawl fold lines → slow steam → canvas texture + cold vignette.

**Key parameters**
- Palette: #132240 / #1d3866 / #2d5a94 / #6b8fb6 / #b6c8d8 / blue-gray #3b6878, strictly monochrome.
- The orange-and-white cat is distinguished by value: orange = mid-blue #4f719a, tabby #273f66, white = light blue #b6c8d8. Blonde = the brightest blue-gray #cbd8e0, skin #90a9be; hair must be one step brighter than skin to read as "blonde".
- Wall strokes: cell34, len110, w34, jitter 4, vertical ±0.5·noise(0.003); palette mixBase 0.8; then blurred 7px and laid at α0.8. Floor strokes use the same parameters, horizontal.
- Dry-brush filaments: 900, α0.07, length 30–90.
- Elongation: girl `DOMMatrix().translate(1240,932).scale(0.84,1.12)`, pivoting on the feet; cat scale(0.82,1.14) pivoting at (540,905). The same matrix is used in three places: Path2D.addPath, offscreen setTransform, and setTransform inside the visibleLines callback.
- Shawl: drapes from forehead/headTop, via nape and back, down to waist+70, color #6b8fb6, fold lines rgba(20,40,80,.6) 4px. Long fingers: 3 thin ellipses 22×4.5 around the cup.
- Outlines: Prussian blue #0c1830, 5px, no boiling. Blue-period outlines are assured and shouldn't wobble.
- Slowness: breathing sin(1.8t)·0.026 (about 2× the shared choreography's amplitude at about 0.45× its frequency); the cup is lifted over 1.25s (the shared choreography uses 0.9s); steam rises at 0.5× time.

**Motif animation**: waves outside the window moving sideways (faster when nearer, speed 20 + 0.25·(y − 400)), 14 flickering strips of broken moonlight, a long pale cloud crossing the moon, slow breathing (person and cat), cup lift, steam. Motion area 3.2%.

**Pitfalls**
- The first version kept a little ochre on the cat and hair (thinking of *The Old Guitarist*); the independent review judged it broke the monochrome. The blue period should be all blue, distinguished by value.
- cell16, len40, w14 vertical brushing over the whole wall read as "rain / a blanket" — Impressionism, not the blue period. It needs to be wide, long, low-contrast, then blurred once.
- The round ends of broad strokes packed densely form a "crowd of heads" (see ② item 11). Blurring 7px suppresses it; the real fix is a cap parameter for strokes.
- If the table area is excluded from the large strokes with a rectangular mask, a flat-filled rectangle patch is left on the floor. The table should be its own layer drawn after the strokes; don't cut holes in the strokes.
