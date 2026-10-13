# 34_shadowpuppet · Chinese shadow puppetry (piying)

> Source: migration test D (built by an independent agent that only read the skill, 2026-10-04). The scene code was ported to `scripts/engine/scenes/34_shadowpuppet.js` after integration.

Filename during the experiment: `scenes/r3_piying.js`, about 121ms per frame (each leather piece is its own offscreen layer, with many multiplies).

**Pipeline**: the screen (warm radial light from the oil lamp behind the screen + a screen-composited wick hotspot + 3px cloth texture, cloth texture cached) → prop layer (window lattice, table, vase of flowers, square-backed chair, cached) → butterfly → cat → girl, each group on its own offscreen layer → each layer is first printed as an offset soft shadow, then the body multiplied on → rivets → control rods → wooden frame.

**Key parameters**
- Leather-piece function `piece(g, path, col, carve)`:
  - Fill color.
  - Carve patterns inside the clip with destination-out.
  - Stroke a same-color "leather rim" 2×edge wide inside the clip, so carving never cuts through the outer contour.
  - Stroke a 2.6px dark-brown edge #3a160a.
- Carving library:
  - Fish-roe dots: s14–22, r3–3.5.
  - Medallion flowers: 5 elliptical petals, s36–46.
  - Cloud scrolls: small Archimedean spirals, line width 3.4, s24–40.
  - Lattice: s26–32.
  - Carved lines: width 3–7.
- Printing onto the screen: `stamp(layer)` first multiplies at α0.28 with 6px blur offset (7,5), representing the blurred shadow when a leather piece isn't pressed fully against the screen; then multiplies the body. Transmitted light = screen color × leather color, so overlapping pieces naturally get darker.
- Colors: red #c0352a, green #2f7d4c, amber #d99a2e (blonde = amber leather), yellow #e2bd4a, blue #2c5a8a, orange #d9782a (cat).
- Screen: radial #fff6d6 → #f2d7a0 → #cf9a58 → #7a4a20; flame disturbance `fl = 0.5·noise(3ts) + 0.3·noise(9ts)`, with ts stepping at 15fps. The light center drifts ±26/±18px, hotspot radius 260+40·fl.
- The dan role's "empty face": after drawing the hair, destination-out the whole face, stroke only the face outline, then add phoenix eyes (long upswept line + lower eyeliner + dotted pupil), willow-leaf brows, dotted lips.
- Mapping the orange-and-white cat: orange = orange leather; white chest, white muzzle, white legs and paws = **fully cut out, leaving only the leather rim**; tabby stripes = carved lines. This applies to every "silhouette/cut-out" style: white parts are simply cut out.
- Motion:
  - The whole girl rocks ±0.012rad around (1260,930); the head turns ±0.06 around the neck rivet.
  - The cup lift steps at 10fps.
  - Loose wrist: dangle = 0.35·sin(11·ls)·(1 − 0.6·cup), with the cup swinging along with the hand.
  - The cat's head nods around the neck point 0.1·sin(6ts) + 0.05.
  - Tail of 4 hinged segments, each rotating relative to the previous by 0.3·sin(7ts − 0.9i) + 0.38, so the whip tip lags segment by segment.
  - Hairpin bead strings swinging.
- Rods: 5px dark-brown lines, blur 1.2px multiply, running from the neck, wrist, cat's back, cat's head and butterfly to the bottom edge of the frame.

**Motif animation**: the flame makes the light spot across the whole screen jump, a butterfly (wings flipping via scaleX at 12fps, with a rod), wrist flicks, the cat nodding and its tail whip, swinging hairpin beads. Motion area 6.8%.

**Pitfalls**
- The table leg overlapping the skirt: after multiply, red×green is near black and becomes a black trapezoid. Overlaps getting darker is correct for shadow puppets, but don't put overlaps at the visual focus — just move the table leg away.
- The cat's front legs were first a single orange rectangle covering the white chest. Only after changing them to two almost fully cut-out white legs did it read as "orange and white".
- Rods crossing the subjects look messy: rods should run down and outward from the pieces, never across other characters.
