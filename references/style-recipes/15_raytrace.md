# 15_raytrace · 1993 early ray-traced CGI

No 3D engine: 2D Canvas "shading conventions" fake the look of renderer output.

## Plastic shading (every part goes through it)
`plastic(c, path, base, hx, hy, R)`:
1. Fill with the base color;
2. A radial gradient centered on the highlight point (hx,hy) with radius R: 0→white .55, 0.28→white .06, 0.62→transparent, 1→deep purple `rgba(10,0,30,.42)` (darkened edges = volume);
3. Environment reflection: a `lighter` stroke of `rgba(70,150,150,.28)`, width 0.18R, offset left 0.04R — the wall is teal, so the reflection is teal;
4. One hard-edged white elliptical specular highlight (0.16R × 0.09R, opacity .85). This single stroke looks the most like 90s Phong.

Limbs use `cyl()`: a gradient across the limb's normal direction (dark .25 → a narrow white .5 band at 22% → dark .45), then a thin white highlight line along 20%–75%.
The girl uses RIG.girl's Path2Ds (long hair); the skirt is replaced with blue plastic cylinder legs + ball knee joints, and ball joints are added at the shoulders — the joint feel of a "toy figure".
RIG's cat body is a polyline, and plastic shading exposes the corners: `RIG.smooth(K.bodyPts)` first, then shade. Tabby stripes are drawn with `filter: blur(2px)` as soft stripes "printed under the plastic".

## Scene
- Wall: radial gradient `#7dbcb9 → #64a6a6 → #3f8285`, light source at the window's position; the window's cast shadow with `blur(10px)`, offset to the lower right.
- Outside the window: pink-purple gradient sky (`#a24cc4 → #df62ae → #f5a08a → #f8c070`), two layers of mountains, a 28×26 pink wireframe grid laid over the mountains (early CG wireframe terrain), snowcaps as jagged triangles.
- **Floor**: per-pixel perspective checkerboard, vanishing point (960,480), `X=(x-960)/dy, Z=1/dy`, cells TX=0.27, TZ=0.00029, 2×2 supersampled anti-aliasing, 35% fog within 140px of the wall. Cached; the cold start for the whole scene is 53ms.
- **Reflections**: the object layer (chair/table/girl/cat) is drawn on an offscreen layer, mirrored with `translate(0, 2*906); scale(1,-1)` and drawn into the floor's clip region at `globalAlpha .34`; props are each mirrored about their own ground line (cone 780, purple ring 846, chrome ball 800), and are **drawn to a separate layer first and then made semi-transparent as a whole** — otherwise the purple ring's 140 small balls would each stack at .34 and become opaque.
- Glass table: semi-transparent green ellipse + thick edge + white outline, with a diagonal reflection sliding 260px per second.

## Small loops (must be visible within 0.23s)
- Purple ring: 140 balls arranged around a torus, spinning about the vertical axis at 7 rad/s, tilted 0.35, drawn sorted by depth (first a dark purple base so the balls connect into a tube, then a radial highlight on each ball). In 0.23s it turns 1.6 rad, from facing front to side-on — very noticeable.
- Chrome ball: per-pixel environment mapping every frame (reflection vector pointing down → checkerboard, up → pink-purple sky + a strip of window light); the checkerboard's u coordinate shifts with `t*4.5` = it spins; Fresnel edge brightening. 104px in diameter, <2ms per frame.
- Lens flare (`lighter`): a 170px sun-core glow pulsing ±8% at 23 rad/s; 12 star rays rotating at 1.6 rad/s; a 960px horizontal streak; 5 ghosts (circles + hexagons) laid along the line "sun → image center", sliding with `sin(t*5)*0.03`.
- Green glow in the cat's eyes: a `lighter` radial gradient of radius 46px, pulsing ±25% at 18 rad/s.
- Cup lift (choreo.cup), tail flick, blink and steam as usual.

## Pitfalls
- The wireframe transition computes edges from the frame where the new image first appears and caches them (`once('edges')`), so the frame at lt≈0 must be complete — don't leave lt=0 blank or fading in.
- Performance: hot frames 23ms, cold start 53ms.
