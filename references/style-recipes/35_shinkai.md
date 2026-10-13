# 35_shinkai · 2016 Makoto Shinkai light

> Source: migration test D (built by an independent agent that only read the skill, 2026-10-04). The scene code was ported to `scripts/engine/scenes/35_shinkai.js` after integration.

Filename during the experiment: `scenes/r4_shinkai.js`, about 71ms per frame.

**Pipeline**: realistic interior (wall with a cool-warm gradient, wooden floor with perspective seams, aluminum-frame window, wall calendar, desk; cached) → sky + cumulonimbus clouds + utility poles and wires + distant rooftops + an airplane contrail + birds → water droplets on the glass → white gauze curtains → window-shaped light patches on the floor and wall (with the curtain's shadow swaying inside the wall patch) → potted plant → cat, girl (cel) → steam → Tyndall light shafts + light dust → lens flare → bloom → soft-light cool/warm split.

**Key parameters**
- Cel function `cel(c, p, base, shade, rim, {sd, rw, lx, ly})`:
  - Shadow = clip(p) ∩ ¬(p translated by (lx·sd, ly·sd)). Implemented with evenodd: a big rectangle + the translated p as the clip.
  - Rim light = clip(p) ∩ ¬(p translated the opposite way by rw).
  - Light comes from the window, lx=−1, ly=−0.55, so shadows fall on the lower right. sd: 22–30 for large parts, 10 for the face, 8 for small pieces; rw 3–9.
  - Line color #6a4632, width 2.2. Part by part "fill → shadow → rim → line", so occlusion comes out right naturally with no need for visibleLines.
- The cat under the window is backlit: lx=0.5, ly=1, dark side underneath, plus a lighter warm rim rgba(255,220,160,.55) on the top of the head and the back.
- Colors: skin #ffe8dc/#f2b6a8; blonde #f8d681/#d8a050; white school uniform #fbfbfe/#b9c3dc; navy #2c3a66/#1b2446. Angel ring: a 9px bright arc on the back of the head rgba(255,250,226,.85).
- Anime eyes: white 8×12, iris vertical gradient #1f3f7a → #3f7fd0 → #9fd4ff, two highlights, a 3.4px upper lid plus one eyelash at the outer corner.
- Cumulonimbus: 70+12 puffs. ① all puffs drawn as blue-gray silhouettes (linear gradient #b7c6e6 → #8297c6) ② each puff gets a 0.82r white radial highlight ball offset toward the sun (+0.22r, −0.3r) ③ the whole layer blurred 3px, then a 55% sharp layer on top. Each puff's radius breathes 0.05·sin(1.3t), and the whole mass drifts at 10px/s.
- Lens flare:
  - Sun core: r130.
  - 10 star rays: length 90/170, rotating at 0.25rad/s.
  - Horizontal streak: 840×4.
  - 5 hexagonal flare spots: on the line sun → image center at 0.45/0.75/1.25/1.6/2.0×, α 0.04–0.12.
- Tyndall: 3 wedges, blurred 18px then cached, screen, α 0.75 + 0.25·sin(3.4t). 60 light-dust particles, radial gradients, twinkling.
- Bloom: draw the whole frame into a small 480×270 canvas → blur 6px, brightness 1.1 → screen at α0.28 upscaled back on top.

**Motif animation**: cloud puffs billowing and drifting, an airplane contrail, a flock of birds flapping, a water droplet sliding down the glass (leaving a trail), the white gauze curtain and its shadow on the wall swaying, plant leaves swaying, strands of hair blown by the wind, star rays rotating, light shafts brightening and dimming, light dust. Motion area 3.0%.

**Pitfalls**
- With the sun at the corner of the window frame, the flare spills onto the wall as if a lamp were hanging there. The sun must sit inside the glass, with flare radius ≤130.
- The first version's clouds were one radial gradient per puff plus a "lit arc" stroke, and read as a pile of soap bubbles. You need "silhouette + offset highlight ball + blurred/sharp two layers".
- The full-width horizontal flare streak was first 1800px long and looked like a bug line. Pulled in to 840px near the sun, α0.35.
- Droplets drawn as solid circles look like bubbles floating in the sky. Draw only the lower-edge arc, a transparent body at α0.22 and one highlight dot.
- A variable name collision (two `const cg`) made the whole scene fail to load, and it was silently replaced with a placeholder image (see ② item 1).
