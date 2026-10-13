# 31_haring · 1982 Keith Haring

> Source: migration test C (built by an independent agent that only read the skill, 2026-10-04). The scene code was ported to `scripts/engine/scenes/31_haring.js` after integration.

Filename during the experiment: `scenes/k5_haring.js` (109 lines). About 4ms per frame, frame diff 11.5%.

**Technique**
- Solid backgrounds: yellow wall `#ffd51c`, green floor `#16a54a`, 14px black horizon line.
- Everything is 13px round-capped black lines + flat fill, using `X.girl / X.cat` part by part "fill → stroke".
- **Dancing figures**: 7 limb segments + a round head built from the corrected `X.limb` capsules; **first stroke everything at 2×LW black, then fill all at once**, giving a union outline. 4 poses (local keypoints, origin at the feet) **hard-cut at 8fps with no interpolation** — that's how Haring figures dance; motion arcs beside the hands.
- **Radiating motion lines**: n short straight lines (length 22–34, width 7–9) on an ellipse around an object, changing angle at 8fps. Used on the cat, the girl's head, the cup, the teapot, the red heart and the figure on the right.
- **Everything on the beat**: `bounce=|sin(t·128/60·π)|^0.6`. The girl dy=−12·bb, the cat half a beat behind. The table squashes and stretches around its feet (sy 1−0.07(1−bb), sx 1+0.05(1−bb)), with bending legs; the teapot jumps 26px; the window frame rocks ±0.025rad; the "jumping" lines on the floor change length with the beat.

**Motif animation**:
- The radiant baby in the window: a white union silhouette crawling in two alternating frames; 14 rays alternating long and short at 8fps.
- 3 dancing figures on the wall (red/blue/pink, different phases, one mirrored).
- A red heart above the table, beating with radiating lines.

**Characters**: an 80s New York girl. Oversized red sweater (one ribbing line at the hem), denim-blue long skirt, white high-top sneakers. The face keeps just one eye dot and a red mouth line (Haring's figures have no features to begin with; this much is kept so she's recognizable). The thick black rings at the ears look like Walkman headphones — right for the era.
**Pitfalls**: `RIG.limb`'s reversed end caps leave holes at the joints under thick outlines (see ②-1). The window crossbar must be drawn below the baby. RIG's hairLines are thin lines, which break Haring's "uniform line weight", and they cross the face when she tilts her head back to drink, so they were removed.

---
