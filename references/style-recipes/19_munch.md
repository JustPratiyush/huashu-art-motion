# 19_munch · Munch *The Scream*-style expressionism (1893)

> Source: migration test A (built by an independent agent that only read the skill, 2026-10-04). The scene code was ported to `scripts/engine/scenes/19_munch.js` after integration.

Filename during the experiment: `scenes/03_munch.js` (about 160 lines). Final adjacent-frame median 2.27%, about 90–140ms of JS per frame.

**Flow-line renderer `flowLines` (new)**
- Seeds: a 24px jittered grid, about 3600 seeds. Each seed determines its region (sky, fjord, mountains, wall, floor).
- Integrate along "a direction field that twists over time", with per-region parameters [steps, step, width, α]:
  - Final: sky [32,7,10,.78], fjord [26,6,9,.78], wall [42,7,13,.5], floor [32,8,12,.55], each line plus 0–8 random extra steps.
  - One stroke travels 200–300px.
  - History: the second version was [26,6,7,.85], and the independent review still judged it "Van Gogh at first glance", so the strokes were lengthened and widened again and the opacity reduced.
- A stroke stops when it leaves its region, so region boundaries stay clean.
- **No outlines, semi-transparent layered color**: Munch painted thin, long strokes. The first version copied Van Gogh's "dark outlines", and the wall became segmented caterpillar-like short strokes — Van Gogh at a glance. It was only right after removing the outlines and raising the steps from 10 to 26.
- Underneath, a flat fill in the same color family is laid first (wall gradient from `#a8401e` to `#5a1a14`), so what shows between strokes is the same hue, not black.

**Direction field**
- Sky: `0.55·sin(x·.011 + y·.018 − 2.4t)`;
- Fjord: tangent around (620,470);
- Wall: vertical with a ±0.5 sine twist;
- Floor: pointing toward the vanishing point (1000,640).

**Blood-red sky**
- Seeds pick their color band by "wavy y": `yy = y + 22·sin(x·.014 − 2.2t)`, band width 28px.
- 7-color cycle: `#e2541c #f08a24 #f4c03a #c8301e #e8743a #f6a63a #b82a1e`.
- The bands themselves twist too — this is "the sky flowing".

**The whole world flowing**
Finally the whole painting is shifted per row by `9·sin(y·.012 + 4.2t) + 4·sin(y·.031 − 6t)`, then per column by `6·sin(x·.009 − 3.6t)`, with 4px bands, using `KIT.warpRows / warpCols`. The person, cat and table all sway together, far cheaper than drawing swaying lines separately.

**Motifs**
- In the window: diagonal stripes on the bridge deck, three railing lines (twisting with the world), two distant figures in hats.
- The screamer: skull face, hands clasping the cheeks, mouth opening and closing `7+2sin(9t)`, body swaying `sin(3.2t)·0.12`.
- Table and chair legs are wobbling wavy lines.
- Girl: an 1890s Norwegian dark long dress + white collar, yellow-green face shadows (`rgba(120,150,70,.4)` at blur 8), 9 locks of long blonde hair as traveling waves `sin(9q − 7t)`.
- The cat's mouth is slightly open, as if infected by the scream from outside the frame.

**Corner caption**: the text is drawn into an offscreen layer, then twisted per row with a sine. Don't use a comic handwriting font like Kalam (the review said it broke the mood); IMFellEnglish instead.

**Pitfalls**
- After shifting the whole painting by rows and columns, dark gaps show along the left and right edges. `KIT.warpRows/warpCols` got a margin parameter: each row is stretched by an extra 2×margin pixels, and margin must be at least the maximum shift.
- In line-art mode the cup-raising arm gets crossed by the torso line; cover it again with `KIT.nearArm` (see ②-16).
