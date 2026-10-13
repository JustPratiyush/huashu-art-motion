# 17_ink · Chinese ink wash, xieyi style (Bada Shanren / Qi Baishi)

> Source: migration test A (built by an independent agent that only read the skill, 2026-10-04). The scene code was ported to `scripts/engine/scenes/17_ink.js` after integration.

Filename during the experiment: `scenes/01_ink.js` (313 lines). Frame diff 0.45↔0.9s is 3.3% (threshold 24), adjacent-frame median 0.62%, no static frame pairs.

**Pipeline** (the opposite of the 09 benchmark: paper is the ground, ink is only added, never laid down as a fill). At the opening `lt += 0.12`, so frame 0 already has the first few strokes down rather than a blank sheet (the review pointed out a blank first frame can't serve as a cover).
Xuan paper (cached) → wash layer: pale-ink distant mountains, vermilion sun → mist bands (blurred paper-colored ellipses moving sideways) → a small bird flying past → static strokes: window, table, ground line, cached once written → bamboo branch ("个"-shaped leaves) → Qi Baishi shrimp in the hanging scroll → cat: ochre wash + scorched ink → girl: indigo wash + baimiao outline + drapery lines → threads of steam → seal stamp.

**Xuan paper**
`P.texture('#efe6d0', scale .0025, amt 9, grain 7)`. Overlaid with 2600 short arcs of paper fiber: half brown α.05–.13, half light α.12–.27. Plus a radial vignette, α.22 at the edges.

**Brush `brush(c, pts, {w, tone, dry, reveal, bristles, head, tail})`**
- The point list is first densified with Catmull-Rom, then resampled at equal 4px arc lengths (`KIT.resample`). Without resampling, the frequency of the dry-brush noise changes with stroke length.
- Brush pressure: `prof(q) = smoothstep(0,head,q) · (1−0.7·smoothstep(1−tail,1,q)) · (0.85+0.15·noise)`.
- Wet core: the whole stroke is filled as a ribbon with width `w·prof·(1−0.85·dry·q^0.8)` and α tone×0.72. It gets thinner toward the end, showing the ink running out.
- Bristles: each one a **continuous** polyline, offset sideways ±0.475w·prof. Where the noise `noise(k·1.9, i·0.09)` drops below `dry·q^1.2·0.95+0.05` it breaks, and the paper showing through is the dry-brush streak (feibai).
- Pitfall: the first version drew bristles as "each small segment stroked separately + round cap", and the joints stacked into dark dots, looking like bamboo nodes or hemp rope. It must be one continuous path per bristle with butt caps.
- Parameters: window frame w14–18, dry .45–.6; tabletop w22; drapery lines w4–6, dry .3–.4, tone .78; ground line w5, dry .85, tone .35.

**Wash layer `washLayer`**
- The shape is first drawn on a scratch canvas, then composited onto the paper with multiply, in two passes.
- Outer bleed: `blur(halo·(0.4+grow))`, α haloA·grow.
- Body: `blur(blur·(1.6−0.6grow))`.
- grow goes from 0 to 1 with lt: at the opening it bleeds out from nothing, and afterwards the outer bleed keeps slowly widening — this is "ink spreading on paper".
- Girl halo 12, α.6; cat halo 9, α.78; distant mountains halo 14.

**Reserved white**
- The cat's white parts (muzzle, chest, paws) are cut out of the ochre layer with `destination-out`, revealing the paper color. This is more ink-painting-like than painting white.
- The girl's cross-collar inner robe is cut out the same way.
- The face is filled with paper color, then outlined with 1.8px scorched-ink baimiao lines.

**Color**
- Ink `[16,14,12]`, with tone giving the "five colors" (scorched .9 / thick .8 / heavy .6 / light .35 / clear .15).
- Ochre (cat) `#c47a3c`; indigo (robe) `#6f8aa0`, wide sleeves `#7d97ab`; gamboge (blonde hair) `rgba(226,170,52,.75)` multiply.
- Rouge red only in three places: the sash, the hairpin bead, and dotted lips, using `[190,40,40]`. Plus a vermilion sun `#d8553f` and seal `#c4281e`.

**Motif animation**
- **Strokes write themselves at the opening**: lt 0→0.45, each stroke `reveal = ss(d, d+l, lt/0.45)`, written out in order: window, table, bamboo, cat, person.
- Bamboo: segmented pale-ink main stem swinging around (835,70) by `sin(2.9t)·0.11`, more toward the tips. 5 groups of "个" leaves, 3 each (L110, w15), flipping `sin(7t+g)·0.2`.
- Mist bands: 4 paper-colored ellipses, blur 14, α.72, moving sideways at 150–270px/s, so the distant mountains appear and disappear.
- Bada-style little bird: darts across from the right of the window at 420px/s, wings as two strokes, flapping about 8 times per second (`sin(52·lt)`).
- Qi Baishi shrimp (two in the hanging scroll, 1.45×): 6 pale-ink segments + one scorched-ink stroke in the middle of the carapace, two long and two short feelers as traveling waves, three-jointed long claws, body bending `sin(7t)·0.12`, swimming along a curve.
- Bada's "white eyes": the cat's pupil dot is pushed up against the top of the eye socket, "rolling its eyes at the sky".
- Seal stamp: lt 0.3–0.4 pressed from 1.5× down to 1×, multiplied on; intaglio characters "Baishi".

**Pitfalls**
- Static strokes are drawn live while being written out, then cached once as `ink_static` when finished; otherwise thousands of bristles would be drawn every frame.
- The first version of the bird's path went through the bamboo leaves and couldn't be seen; it only read once moved above the mist band at y≈470.
- The wash uses multiply and is transparent, so the windowsill ink line showed through the cat's ears and the table legs through the skirt; the review read it as "wrong layering". Fix: inside the cat's and dress's silhouettes, first lay a layer of paper color (clip then drawImage the paper) before the wash. This is the equivalent of "reserving this area of the paper first".
