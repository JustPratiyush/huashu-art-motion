# 04 · Pure code drawing: painting an artistic picture with Canvas and bringing it to life

This page follows pure code drawing as its main line: scenes and objects are made with programs and style renderers; people, anthropomorphic characters and robots are not drawn into a final film with code — for generated-frame approaches see doc 10, for the delivery bar see `character-detail.md`. This page summarizes the method after the first 16 styles were finished; each style's specific parameters are in `style-recipes/<id>.md`.

## 1. Project skeleton (`scripts/engine/`; copy it to start a new film)

```
index.html      Load order: lib/fonts → lib/util → lib/paint → lib/rig → eras → transitions → scenes/index → engine
eras.js         Segment table: id, number of eighth notes (eighths), transition {type,dur,delay,cx,cy}, year-plate style
scenes/<id>.js  One file per segment: SCENES['<id>'] = { draw(c, lt, t) }   ← most of the work happens here
transitions.js  Transition library: (c, A old, B new, p, o) → draws one frame
engine.js       Beat grid → each segment's t0/t1; during transitions, old and new segments are each drawn offscreen and handed to the transition; beat camera punch; year counter (value depends only on global t)
lib/paint.js    Noise, textures, hand-drawn boiling lines, style renderers, regional palette swatch, shared choreography choreo, steam, particles
lib/rig.js      Character skeletons: RIG.girl / RIG.cat → Path2D per part + anchors; drawGirl/drawCat (mode: fill/line); ik2, smooth, taper
render.py       Headless Chromium calls renderFrame(t) frame by frame → PNG pipe → ffmpeg 60fps, can mix in a soundtrack; --solo <id> single-segment preview, --stills for stills
compare.py      Original | recreation at the same moment, side by side
```

Render speed: a 15-second 60fps film takes about 90 seconds (M-series Mac). Most single segments take 5–40ms per frame; the heaviest, Van Gogh, 110ms.

## 2. How to paint a style (five layers; benchmark `scenes/09_postimp.js`)

> The five layers are the default order for oil-painting / printmaking styles, not universal: **ink wash** is reversed (paper is the ground, ink is only added on top, large areas left empty, never filling everything first); **pattern styles** (Kusama, Bauhaus) are "patterns sprinkled over flat color", and the pattern itself is the renderer; **chiaroscuro** is "paint the lit version first, then multiply by a light map".

1. **Flat underdrawing**: first paint large areas (wall, floor, sky, view outside the window) in solid colors/gradients to get positions and values right. This layer decides the composition; the style hasn't appeared yet.
2. **Repaint with the style renderer**: using the underdrawing as the color source, repaint the whole picture in that style's brushwork — Van Gogh's long flow-field strokes, Impressionism's short dabs, mosaic tiles, ukiyo-e misregistered color + patterns, cubist facets, pop halftone, 8-bit low-resolution per-pixel, ray-traced per-pixel reflections… The renderer decides "whose painting this is".
3. **Small objects on their own layer**: small things like tables, chairs, vases and picture frames get shattered into a mess if they go through the renderer together with the large areas. Draw them separately with finer parameters, using `source-atop` so they only paint on themselves.
4. **Characters**: speedrun/time-travel films use the same skeleton (RIG) and the same choreography with a different drawing method (for other topics, design characters for the topic) — after flat fill, layer that style's fine texture, and finally add clear outlines and features. Characters are where the audience's eye lands and must be recognizable.
5. **Moving highlights**: small loops of era motifs (see doc 02). Continuous motion uses continuous time; hand-drawn lines "boil" by reseeding at 8–12fps for a handmade feel.

## 3. Style renderer quick reference (all in `lib/paint.js` or written in each scene)

| Renderer | Suits | Key points |
|---|---|---|
| `strokes` flow-field strokes | Van Gogh, expressionism, oil painting | Write the direction field by region (walls vertical, floor along perspective, sky along swirls); **regional palettes** matter more than color jitter; every stroke needs a dark outline to look thick |
| `dabs` color dabs | Impressionism | Short elliptical strokes with warm/cool offsets; **not pointillism** (no pure palette, dots not equal in size — it comes out as Impressionism) |
| Optical-mixing pointillism (29_seurat) | Seurat, Neo-Impressionism | Pure colors placed side by side in proportion, equal-size dots, complementary dots, light seeping at light/dark boundaries |
| Tessellation (written in 04_roman) | Mosaic, stained glass | Layout computed once, colors flowing through the tiles every frame; tiles laid along contours (distance-field isolines); tiles 8–28% bigger than half the spacing so the bisectors cut the joints |
| Color registration + patterns (07_ukiyoe) | Ukiyo-e, woodcut, screen print | Fill offset (3,2)px from the key line; patterns as CanvasPatterns; horizontal brush-mark gradations |
| `facets` | Cubism, low poly | Semi-transparent gradient planes stacked into space; unclipped triangles turn contours into straight edges |
| `halftone` | Pop art, old print | A small tile via `createPattern` is 10× faster than drawing dot by dot; 45° grid |
| Low-resolution per-pixel (14_8bit) | Pixel art, retro games | Draw at 240×135 then upscale nearest-neighbor; limit to 14 colors; 1px black outline per part |
| Per-pixel shading (15_raytrace) | Early CGI, plastic, metal | Uniform plastic shading (base + radial dark edge + environment reflection + hard highlight); mirrored floor reflections |
| Gold leaf (05_gothic) | Illumination, icons, ornament | Per-pixel burnish texture + embossed dark lines with 1px-offset light lines; highlights fall only on the "goldness" mask |
| Sfumato (06_renaissance) | Classical oil painting | Whole layer lightly blurred + semi-transparent sharp layer; craquelure + canvas texture + vignette + yellow varnish |
| Variable-width paths (10_nouveau) | Art Nouveau, calligraphic lines, printmaking | Offset both sides of a point list by width into a polygon; a darkened, offset silhouette underneath = thick outside, thin inside |
| Grain stippling (16_2026) | Contemporary flat illustration | Scatter dots inside shapes with density as a function of position; static parts all cached |
| Dry brush + ink bleed (17_ink) | Ink wash, calligraphy, East Asian xieyi | Brush tips entering and leaving, sampled at equal arc lengths for dry-brush streaks; spread with `filter='blur()'` (deterministic in Chromium); paper is the ground, ink only added on top |
| Long curved flowing strokes + per-row warp (19_munch) | Expressionism, flow | Long strokes walking 20–30 steps along a flow field; the whole picture sine-shifted per row (margin ≥ max shift to avoid gaps) |
| Watercolor wash (25_ghibli) | Ghibli backgrounds, watercolor | Transparent glazing + water-mark edges; water-mark stroke α fading out as it spreads |
| Grayscale photo halftone (22_constructivism) | Constructivism, old newspapers, photo collage | Dot size by brightness, 45° grid, batched into one path and filled once |
| Two-version light clipping + sheared long shadows (24_hopper, 23_dali) | Hopper, surrealism, harsh-light scenes | Draw lit and dark versions once each and clip by light patch; shadows via shear affine |
| VHS channel-split post-processing (26_vaporwave) | Vaporwave, retro video | RGB offset, scanlines, tracking-noise band, as a post-processing overlay |
| Whole-frame multiplied light map (32_rembrandt) | Chiaroscuro, night scenes, candlelight | Paint the lit version first, then multiply by a light map (window light + radial candlelight) |
| Cel hard-shadow bands (35_shinkai) | Japanese animation, Makoto Shinkai | A part minus a translated copy of itself = hard shadow band; lit rim |
| Stepped frame rate `stepTime(t,fps)` (33_rubberhose, 34_shadowpuppet) | Old cartoons, shadow puppets, stop motion | Stuttering at 12fps/10fps is half the style, not stutter |

## 4. Characters: one skeleton, a dozen ways to draw it

- Don't write skeleton coordinates off the top of your head: take an AI design sheet (or any reference image), overlay a 20px grid, read keypoints part by part, and smooth them into Path2Ds with Catmull-Rom (`RIG.smooth`). The first version with hand-written coordinates made the girl look like a boy; after measuring points, one round made her read as a 17-year-old blonde girl.
- Hiding the legs in a long skirt is most natural for a seated pose; holding the cup uses two-bone IK (upper arm 165 / forearm 122), with the elbow fixed pointing down.
- Anchors `G.A` (top of head, forehead, neck, chest, waist, knees, hands…) let each style add clothing: Egyptian broad collar, Gothic halo, ukiyo-e shimada hairstyle, Bauhaus joint discs, pop-art big waves.
- Each style may stylize the skeleton (Egyptian profile with frontal eye, black-figure silhouettes, a half-blue cubist face, pixelation), but staging and the rhythm of motion must match the skeleton — that's where "the same pair of characters traveling through time" comes from.
- Big ending performances (jumping, crouching, reaching out a paw, gasping) needn't be forced into the generic skeleton: 16_2026 builds its own pose library (each pose a set of local keypoints, interpolated value by value), with squash and stretch pivoting on the feet, flipping on the flattest frame.

## 5. Bringing the painting to "life": the action list and how to measure it

- Each segment needs at least: one continuous action by the protagonist (choreo.cup holding the cup) + 2–4 small motif loops. Short segments (<0.5s) need a rhythm fast enough to step at 15–30fps.
- Self-check the amount of motion: render two frames (**avoiding the 0.35s camera punch after a transition**, otherwise the whole screen counts as moving) and diff them. Numbers from the first pass (0.45↔0.9s after the zoom ends): cave 2.8%, Egypt 3.4%, Rome 6.4%, Greece 9.9%; the original's heatmaps for the same segments 6.9%, 6.2%, 17.3%, 11.6%. If it's too static, add motif actions.
- Moving things must be at the focal points of the eye (in the speedrun demo: the person, the cat, the window; for new topics, set the focus by your composition).

## 6. Pitfalls

- **Composite modes**: applying `source-in` pattern by pattern clears each other out (Klimt's whole golden robe disappeared) — first paint all the patterns onto one scratch canvas, then source-in by silhouette once; `destination-out` on a segment canvas digs transparent holes that turn black in video — dig them offscreen, then paste; layering paper texture/grain onto characters can't use `source-atop` (the paper color covers them and makes the figures whitish) — `destination-in` the texture layer to the silhouette, then `multiply` it back.
- Hand-drawn glyphs: two strokes winding in opposite directions in the same path cancel out into holes under the nonzero rule; fill each part separately.
- "Melting" transitions: make the new image flow down from the top with round-headed drips (profile `(1-u²)^0.3`); dragging the old image down gives spikes, which don't look like drips.
- Set transition duration by "the visible part": inOut easing barely shows any change at either end, so a complex signature transition of 0.34s reads for only 0.2s and gets read as an ordinary wipe — give it 0.48–0.5s.
- Semi-transparent overlapping pieces like shadow puppets / cut paper multiply to black where they overlap; tune the stacking order and transparency to the material.

- `putImageData` written directly to the target canvas bypasses the engine's camera-punch scaling and transition clipping — write to an offscreen canvas first, then `drawImage`.
- Offscreen contexts that read pixels use `{willReadFrequently:true}`; use `g.reset()` every frame, otherwise lineJoin/state from the previous frame lingers and the first frame differs from the rest.
- `drawGirl(mode:'line')` layered on top draws the outlines of occluded parts through other parts (the far sleeve through the torso, the back half of a hat brim through the hair). Use `RIG.visibleLines(key, (g, lineColor) => draw the whole thing, real line color, box)`: draw the same thing twice with the line color switched to white as a sentinel; pixels that differ between the two passes are the unoccluded lines (including feature lines). Follow "fill → style texture → visibleLines adds the lines".
- **The camera punch must act on both the old and new layers**: if only the new layer is punched, the new layer isn't visible yet at the start of the transition, so the beat frame doesn't move, and it feels like "the sound arrives before the picture" (the v1 review measured a drag of 0.1–0.17s).
- **Reseeding whole-screen strokes at 8fps = flicker, not life**: the review measured whole-screen jump frame diffs of 18–20, bigger than the transitions. Keep stroke positions fixed and let the direction field change continuously over time (swaying like flame); leave boiling for line art only.
- Don't change parameters just for the dynamic area (tile size, stroke density) — when still, it's a patch.
- In coarse-grained styles like mosaic/pixel art, text must use uniform thick strokes (each stroke ≥2 grains wide); thin fonts break.
- Make small things bigger than you think: ukiyo-e wave claws at 22–50px don't read; only at 44–74px are they *The Great Wave off Kanagawa*.
- Determinism: all randomness is seeded; rendering the same t twice must be pixel-identical, otherwise renders flicker.

## 7. Dividing the work (multiple agents painting in parallel)

First write `era-author-spec.md` (interface, available libraries, benchmark, hard requirements, reference files, selfcheck commands, delivery notes), then dispatch agents in groups of 4 eras. The spec says clearly "don't modify lib/ or other people's files". Each group returns in 30–35 minutes, and their notes settle directly into `style-recipes/`. The first time, all 16 segments passed on the first try, mainly thanks to the spec + benchmark implementation.
