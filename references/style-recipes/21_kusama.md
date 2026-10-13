# 21_kusama · Yayoi Kusama infinity polka dots

> Source: migration test A (built by an independent agent that only read the skill, 2026-10-04). The scene code was ported to `scripts/engine/scenes/21_kusama.js` after integration.

Filename during the experiment: `scenes/05_kusama.js` (124 lines). 0.45↔0.9s is 17.3%, adjacent-frame median 2.98%, 4–28ms of JS.

**Wriggling dots**
- Every dot's radius is multiplied by the same "traveling wave starting from the cat": `wave = 0.82 + 0.28·sin(dist·0.012 − 6t)`.
- The dots in the whole room swell and shrink ring by ring from the cat's position, as if breathing. This one function brings the whole screen to life.

**Dot layout**
- Wall: two hex grids, large dots (30px, spacing 104) + small dots (10px, offset), each with ±25–50% jitter. Each dot is a slight ellipse with a random rotation, like hand-painted.
- Floor: 9 rows, larger and sparser when nearer (6→28px), squashed into 0.42 ellipses for perspective.
- White dots on the red dress, 13px at spacing 52, **crawling down the dress** at 46px/s (clipped to the dress silhouette, y offset modulo).
- Cat: white dots on the orange areas, red dots on the white areas, each crawling downward.
- A red dot is painted on the cheek too (Kusama's body painting), and on the head is a red bow with white dots.

**Infinity mirror room (the window)**
- 3D grid of lights: 13×7×3, 6 colors. z loops toward the camera at 0.3/s, perspective projection F150.
- Each light is a small solid core plus a 3.2× glow, composited with lighter.
- Pitfall: the first version scattered the lights randomly with big glows and blurred into bokeh. A regular grid + small solid cores gives the feeling of infinite mirrored repetition.

**Yellow pumpkin**
- 5 elliptical lobes, drawn outside → inside.
- Black dots in rows on each lobe: largest in the middle column (9.5px), shrinking toward both sides and top and bottom; dot size also follows the traveling wave.
- Whole-pumpkin breathing: scale `1 ± 0.025·sin(5t)`, pivoting on the base.

**Ending: "self-obliteration"**
- lt 1.0–1.26: a red overlay fades in, and a full-screen 120px hex dot grid swells ring by ring from the cat's position to 0.47× the spacing. After that, about 0.15s of only the dot grid breathing gently, giving the ending a landing point (the review pointed out the first version had no hold frames).
- The last frame stays on the dot grid of white dots on red.
- Pitfall: the first version let the dots swell without limit and ended on a white screen. The radius must be capped and end on the dot grid, never on a solid color.
- Pitfall: the dress and the wall are both white dots on red, so the girl dissolves into the image. The final version thickens the girl's outline to 4.5px and removes the red dots from the cat's white areas, preserving the orange/white boundary.
