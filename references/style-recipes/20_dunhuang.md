# 20_dunhuang · Dunhuang murals (Mogao Caves, High Tang)

> Source: migration test A (built by an independent agent that only read the skill, 2026-10-04). The scene code was ported to `scripts/engine/scenes/20_dunhuang.js` after integration.

Filename during the experiment: `scenes/04_dunhuang.js` (215 lines). 0.45↔0.9s is 6.6%, adjacent-frame median 1.98%.

**Pipeline**
Earth-red plaster ground (cached): `P.texture #a5452f`, dark `#7a3020`, plus sparse faded medallion flowers, a scrolling-vine border at the top + triangular valance (alternating green, blue, white, red + gold beads) → window = azurite sky: auspicious clouds, apsara → scrolling-vine window frame → lotus brick floor (cached) → low table with kunmen arches, oil lamp → cat → girl (Tang dynasty donor) → steam as curling clouds → falling flowers → overlay layer.

**Line and color**
- Iron-wire line drawing: uniform 2.6px, color `#5a2414`. The face uses a redder `#8a3a24`.
- Mineral colors: earth red `#a5452f`, malachite green `#3f8f6e / #6ab08e`, azurite blue `#2f5f8f / #5a86b0`, white `#ecdfc4`, gold `#d8b05a`.

**Tang dress**
- Striped skirt: red ground with slanted trapezoidal green stripes every 44px, diverging with x toward the bottom.
- Azurite short jacket, white crossed collar, high red waistband.
- High bun: two ellipses stacked above headTop, with a gold hairpin and three hair flowers.
- Face makeup: huadian (four-petal red flower on the forehead), xiehong (a red arc at the temple), dotted lips, moth brows.
- The teacup is Yue-ware celadon.

**Shawl `shawl(pts,w)`**
- Traveling-wave point list → ribbon, with white dashed patterning and red dots.
- The section behind: `x = back + 230q + 64q·sin(4.2q − 5.5t)`, with the last 30% lifting upward.
- The front section wraps the arm and hangs down.
- Pitfall: the first version's sideways swing was only 18–34px and nearly vertical, so it looked like a chair's vertical rail. The sideways displacement must exceed 200px, plus the lifted end, before it reads as floating silk.

**Apsara**
- Lying horizontally facing left, at 1.35×, flying across the window at 300px/s.
- Three ribbons as traveling waves; one rises from the shoulder in an arc over the head and then flicks behind — this big arc is the apsara's most recognizable shape.
- Head halo, bun, a tray of flowers.
- Auspicious clouds are round puffs + tapering cloud tails, drifting at 40–76px/s.

**Overlay layer (aging)**
- Whole-image `saturation` blend at α.3 to fade, then a light earthen texture multiplied at α.5.
- Per-pixel peeling: where `fbm(x·.0032)+0.12·noise(x·.03) > 0.3`, the white plaster ground `#d8c6a2` shows; 0.28–0.3 is a dark line at the peeling edge.
- The areas around the two faces are protected from peeling.
- 500 random-walk cracks, a smoke-darkening gradient over the top 380px.
- Pitfalls:
  - With a peeling-noise frequency of .006 the result was a screen full of sesame-seed specks, like stains. Only after lowering it to .0032 and raising the threshold did it peel in patches.
  - The final version protects both the cat (380–720, 530–920) and the girl (1070–1530, 240–950), peeling only the background.
  - Xiehong α lowered to .32, otherwise it looks like a scar.
  - The apsara's head halo was first a solid green circle and read as a "swim ring"; changed to α.28 semi-transparent plus a fine line.
  - With the cat at `#c8843a`, the fading turned it brownish yellow; changed to `#e08a3a`. Also added `look: sin(2.6t)` head turning and breathing ×2.5, otherwise only the tail moved in the whole segment.

**Motif animation**
- Falling flowers: 30 four-petal flowers rotating and flipping as they fall.
- Oil lamp: flame flickering `1+0.12sin(17t)+0.08sin(29t)`, with a glow.
- Pigment flakes: 10 flakes come loose from the peeling edges, tumbling and falling on parabolas.
- The little bell on the cat's collar swings.
