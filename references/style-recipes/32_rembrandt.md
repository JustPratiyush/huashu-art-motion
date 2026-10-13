# 32_rembrandt · 1642 Rembrandt chiaroscuro

> Source: migration test D (built by an independent agent that only read the skill, 2026-10-04). The scene code was ported to `scripts/engine/scenes/32_rembrandt.js` after integration.

Filename during the experiment: `scenes/r1_rembrandt.js`, about 47ms per frame.

**Pipeline**: fully-lit underdrawing (the room, leaded diamond-pane window and Turkish table carpet painted in their "fully lit" colors) → background repainted with large brown strokes, then blurred 2.2px and laid at 75% (a rubbed-in ground) → the table carpet on its own layer with fine strokes → characters flat-filled + volume gradients + fine strokes → "lost edges" treatment on the characters → **light map multiplied** → window glass brightened with screen + cloud shadows passing → bristle impasto → candle flame, dust in the light shaft, steam → cached layer of craquelure, grain and vignette + soft-light golden-brown varnish.

**Key parameters**
- Light map: base color rgb(30,21,13), equivalent to 0.13 ambient light. Stacked with lighter:
  - Light shaft: a wedge polygon, blurred 40px, cached, α 0.8–0.95.
  - The window itself: r330.
  - Face pool: r250 α0.95. Chest: r230 α0.55. Cat: r240 α0.8. Tabletop: r280 α0.6.
  - Candlelight: r190+40·fc, α 0.6+0.4·fc.
  - "Separation light" on the wall behind the girl: r300 α0.35. Rembrandt often brightens the wall behind a figure's shadow side to separate the figure from the background.
  - Once stacked, the whole map is multiplied.
- Flicker: `flick(t) = 0.5·noise(2.2t) + 0.25·noise(6.5t)`; light-pool centers drift ±14px with noise(0.9t); cloud shadow `cloud = 0.5 + 0.5·sin(2.2t − 0.6)` makes the window light ×(1 − 0.35·cloud), while a dark radial blotch crosses the glass at 260px/s.
- Background strokes: cell18, len54, w16, jitter 6, angle −0.9 + 1.6·noise(0.003); palette mixBase 0.7.
- Lost edges: the character layer is first drawn fully opaque with blur(2.4px), then a sharp layer at α0.62 on top. The shadow side melts into the background while features remain recognizable.
- Impasto (bristle brush): one stroke = round(w/1.3) parallel fine bristles, each ±17 in brightness, both ends randomly shortened 0–25%, line width 1.4–2.6; a cast shadow at α0.28 along the lower side; 2+w/3 bright specks scattered along the upper side. Only used in lit areas: blonde hair, collar, porcelain cup, pearls, the cat's white chest, the top of the cat's head.
- Overlay layer: craquelure α0.28×0.28; grain density 0.05 α0.12; vignette 0.75; soft-light rgba(200,140,60,.35).

**Motif animation**: candle flame (noise-driven leaning left and right, height jumping), window light dimmed by cloud shadow then recovering, 70 dust motes in the light shaft (shown only inside the shaft, twinkling at 24 frames), cup lift, steam. Motion area 8.0% (0.45↔1.0s).

**Pitfalls**
- The first version of the impasto was three neat lines "offset shadow + main stroke + bright ridge", which read as white stickers / band-aids. Only bristle strokes look like paint.
- Copying back a local region of the original image (`drawImage(b, x,y,w,h…)`) brings back the un-stroked background with it, creating a rectangular patch. Props should be on their own layer drawn after the strokes; don't copy regions.
- Grain at density 0.12 / α0.22 covers the face in dirty specks; 0.05 / 0.12 is just right.
- The hand must be drawn before the cup, otherwise the hand's ellipse covers the porcelain cup. In drawGirl the order is "hand → cup → thumb"; follow this order when redrawing yourself.
