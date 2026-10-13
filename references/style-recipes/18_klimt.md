# 18_klimt · Klimt golden period (1907)

> Source: migration test A (built by an independent agent that only read the skill, 2026-10-04). The scene code was ported to `scripts/engine/scenes/18_klimt.js` after integration.

Filename during the experiment: `scenes/02_klimt.js` (223 lines). 0.45↔0.9s is 32.9% (mostly from the light sweep), adjacent-frame median 0.40%, but 14 of 48 pairs were nearly static (see ②-2).

**Pipeline**
Gold-leaf wall (cached) → twinkling four-pointed gold-dust stars (lighter) → *Birch Forest* in pointillism in the window → black-and-white checkered gold frame → flowered carpet → Hoffmann black-and-white checkered table → diagonal light sweep (drawn before the characters, so they naturally block it) → cat → the girl's golden robe (pattern layer source-in by silhouette) → realistic face and hands → flower crown → gold sleeves, gold cup → golden steam.

**Gold leaf**
- Per pixel: `f = 0.5 + fbm(x·.004)·0.55 + noise(x·.003, y·.08)·0.5 ± 0.05`, interpolated between `[120,78,18]→[196,148,52]→[246,216,128]`.
- A very faint square seam every 96px, showing gold leaf applied piece by piece.
- Wall: gold leaf × a small 480×270 fbm image upscaled and multiplied (brown-gold mottling, like the ground of *The Kiss*), then 9000 grains of gold dust and dark dust scattered.

**Patterns (golden robe)**
- 150 random points in four kinds:
  - Three-color concentric circles (30%): red-white-blue, blue-gold-red, purple-white-gold;
  - Gold spirals on dark brown (32%), each rotating at ±3rad/s;
  - Horus-style eye shapes (22%), blinking in turn: closed when `sin(2.2t+φ)>0.86`;
  - White dot clusters + red centers (16%).
- The hem also has 60 black-and-white tall rectangles with gold outlines — the language of the man's robe in *The Kiss*.
- **Flat decoration vs. a realistic face**: face and hands get volume from radial gradients (highlight `#fbe8da` → `#f0cfb8` → `#d8a88c` → edge `#b88068`), soft blush and eye-socket shadows, with only a faint 1.2px outline. The golden robe has a 3px dark outline. That contrast is Klimt.

**Other**
- *Birch Forest* in the window: 2600 autumn-colored elliptical dots, 6 birch trunks with black patches; 14 falling leaves flipping as they fall.
- Flowered carpet: 260 concentric-circle flowers, larger when nearer (6→20px), nodding `sin(4.2t+φ)·0.18r`.
- Light sweep: a 520px-wide bright band at α.24, sheared with `transform(1,0,−0.45,1)`, lighter, sweeping **at constant speed** from −200 to 2300 within 1.15 seconds.
- Gold dust: 420 grains, showing four-pointed stars when `sin(t·sp+φ)>0.55`. The first version's stars were too big, like Christmas decorations; the radius was changed from `s·(1+2.2a)` to `s·(0.6+1.1a)`.

**Pitfalls**
- Applying `source-in` pattern by pattern clears the others; see ②-7.
- At α.38 the light sweep looked like lens flare; lowered to .24.
- The first version had static stretches between adjacent frames: the blinking is intermittent and the light sweep is a soft gradient. After adding three things, static frame pairs dropped from 20/36 to 0/36:
  - 34 gold-leaf flakes flipping and drifting down (150px/s, square and round pieces, gold gradient);
  - Gold dust rising at 26px/s;
  - Flower nodding amplitude raised from 0.18 to 0.35.
- In the first version the cat's gold spirals were on its face too; the review said it "looks like a rash", so they're now only on the body, reduced to 46.
