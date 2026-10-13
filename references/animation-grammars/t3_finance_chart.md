# t3_finance_chart · Financial data chart animation

> The grammar in one sentence: **build the axes first, then let the data "grow", and finally label just one thing; one color tells the protagonist's story, everything else goes gray; values are always honest (bars start at 0, units and sources written on the chart); animation only decides "how it appears", never "how much it is".**
>
> Demo film: `scripts/engine/demos/t3_finance_chart/` (render with `render.py --film demos/t3_finance_chart`) (8s, 3 shots, all data fictional, "illustrative data" in the bottom right of every shot) · overview `assets/animation-grammars/t3_finance_chart_overview.jpg` · code `scripts/engine/demos/t3_finance_chart/`

## Pre-flight checks

1. **For each chart, write down its "one thing" first.** The title is that conclusion, and the annotation labels only it; if you can't write that sentence, don't make the chart — use one big number or switch grammars.
2. **Numbers must be mutually derivable.** A multiple in the title must be computable from the numbers on the chart (write a ÷ b in the annotation); the same number must match between two shots; distinguish "rose to" from "rose by".
3. **The moment the data grows matches the word in the narration.** For bar charts write multiple bar cues, each with `data.index`, so each bar grows only when it's mentioned; don't show the title at second 0 and then grow everything in one go.
4. **Hold once it lands.** After a number lands, hold at least 0.5 seconds with no constant slow push; to look at a detail, slow-push to it when the narration points there (about 1 second; Heer & Robertson: about 1s per step, ease in and out), and only the single most important number gets a 0.28-second fast push; or use `zoomThrough` to push into that point.
5. **Don't use the same layout for 3+ charts in a row.** Thin red line + title + chart three times in a row is flipping through a report; insert a push into a detail, a slammed-in big number, or a cut back to real material.
6. **Charts stay in the film's world.** A chart shot's background is in the same color family as the shots around it: for dark films write `theme: "dark"`, or put the film's background color in `safe.fill` (the chart background follows it automatically, switching to light text on dark); white report-style backgrounds only for films that are white paper or web pages to begin with. Even better, draw the chart on an object in the film's world: render a transparent clip with `--alpha` and put it on a screen, blackboard or sheet of paper in the picture. Suddenly cutting from a night scene to a white line chart with a fixed title bar at the top — the reviewer will say it "breaks from the whole film".

## ① When to use it

- **Use**: growth in revenue/profit/users, stock price trends, changes in market-share rankings (bar chart race), regional comparisons (choropleth maps), turning points before and after an event. When the narration has **specific numbers, times, comparisons** ("up 8.7× in five years", "after March 2023").
- **Use**: sections that need to be "credible" — the audience will screenshot it, share it, nitpick it.
- **Don't use**: when there's only one number (just a big headline number, using t2's counter); when the data itself is unreliable or you're unwilling to cite the source (better not to make the chart); explaining principles (use t1).

## ② Composition

| Item | Value | Source |
|---|---|---|
| Background | White `#FFFFFF` (Economist web charts); or FT salmon `#FFF1E5`; dark films use `theme: "dark"` (`#0E1116` background, light text, cyan main bars) | Economist 2017 chart style guide; FT o-colors source |
| Layout | **Thin red line at the top (8px) + small red tag at top left (96×22) + bold title (one conclusion) + subtitle (metric, unit) + source at bottom left** | Economist style guide layout examples |
| Main palette | ECON RED `#E3120B`, blue `#006BA2`, cyan `#3EBCD2`, green `#379A8B`, yellow `#EBB434`, gray `#758D99`, black `#0C0C0C` | Economist chart palette |
| Emphasis | **One color for the protagonist, everything else light gray** (this film: the last bar stays blue, the rest transition to `#C6D2D8`) | Datawrapper "use gray to push secondary data back" |
| Grid | Horizontal gridlines only, thin gray (this film α0.13, 1.5px); **only the zero baseline is a solid black line** (3px); y-axis tick values sit above the gridlines on the right | Economist style guide |
| Fonts | The Economist uses Econ Sans (Cnd); this film uses Roboto Condensed (numbers) + Source Han Sans (CJK). Title 700, subtitle/axes 400; axis text smallest, source smallest and lightest (75% black) | Same as above |
| Up/down colors | **Mainland China A-shares: red up, green down** (this film); Hong Kong and the West: green up, red down. For a Chinese audience you must write "red up, green down" on the chart; colorblind-friendly alternative: blue/orange + ▲▼ symbols | Jiang et al. 2014 (JBDM); Bloomberg terminal colorblind mode |
| Line width | Main data line 5px (this film), moving average 4px; annotation leader lines 2px | — |
| Shape language | Rectangular bars, polylines + end dot, candlestick bodies + wicks, small dots + leader-line annotations | — |

## ③ Motion

- **Staging**: layout 0–0.5s → gridlines drawn one by one left to right (lag 0.12, easeOutQuint) → x-axis labels fade in rising, one after another → data → emphasis color change → annotation. Each stage about 0.5–1.3s. Heer & Robertson 2007: stage complex changes, always ease in and out, each step "as long as it needs", about 1s; axes before data is industry convention (no empirical study, but it lets the audience know the "ruler" before seeing the "amount").
- **Bars**: grow from the zero baseline, easeOutQuint, staggered (lag 0.22, 1.3s total); value labels follow the bar tops and count up in sync (`CH.bars`).
- **Lines**: drawn advancing by **x (time)**, not arc length — time flows at a constant rate, steep stretches naturally draw faster, and you can read the "surge"; a 9px dot at the head + a price label follows (fixed-width digits); area gradient α0.14→0. This film 1.5s, smooth (the last price "lands" on the point). D3's official example is 5000ms linear, fine for standalone charts; in video compress it to 1.5–2s.
- **Annotations**: triggered the moment the line's head **passes** the event point (`tHit` computed from the inverse easing) — the dot pops (spring d0.45 bounce0.25) + one pulse ring → 0.12s later the leader line draws → 0.3s later the text fades in. **One thing labeled per shot.**
- **Candlesticks**: appear one by one (lag 0.06, 0.2–1.3s); bodies grow from open to close, wicks extend after; volume bars in sync; the price at top right rolls with "the latest candle to appear", colored by up/down relative to the start of the range.
- **Numbers**: count-up with easeOutExpo (CountUp.js default 2s; 0.9–1.3s in video); all rolling numbers laid out at fixed widths to prevent jitter.
- **Camera**: once the chart lands, the camera holds with no constant slow push; put camera moves at the moment the narration points to a piece of data: slow push of about 1 second, or 0.7 seconds to move to the next group of data; only the one or two most important numbers in the film get a 0.28-second fast push; during push-in transitions the camera keeps pushing in vector space (not scaling a bitmap). The demo film's constant 1→1.03 push on every shot is the old approach; new films should not copy it.
- **Ranking race (not used in this film)**: D3's official bar chart race uses 250ms per keyframe, 10 linearly interpolated frames between keyframes, 12 bars shown; swaps take about 0.5s; stagger rank changes so that bars don't all jump up and down at once.

## ④ Transitions (5 common ones)

1. **Panel slide push (slidePush)**: the new panel pushes in from the right and the old panel out to the left, led by a brand-red vertical bar in between, 0.5s, `cubic-bezier(.7,0,.2,1)`. This film's shot 1→2. The new panel starts building its layout while sliding in (red line growing, title emerging).
2. **Push into a detail (zoomThrough, live + bScale0)**: the camera pushes 6× into the latest data point (the old shot redrawing itself in vector), and the new image (the last 20 days of candlesticks) dissolves in from 0.6×, with its subject (the latest candle) aligned to the push point. This film's shot 2→3. Without a circular opening you must set `bScale0`, otherwise the new image looks like a small card floating in the middle.
3. **Morph between charts**: the same data changing shape (bars → dots → line): move into position first, then change shape (Heer & Robertson: scatter → bars, slide sideways first then morph; stacked → grouped, change width first then drop). **Don't morph between different metrics** (revenue bars turning into a stock-price line imply they share a unit).
4. **Axis rescale**: when the data range changes, change the scale first (old ticks fade out, new ones fade in), then move the data.
5. **Hard cut, layout unchanged**: the same layout with a different chart, red line/title positions unchanged, only the content swapped — the most common in Economist videos.

## ⑤ Rhythm and text

- **Shot duration**: 2.5–6s per chart; this film's 2.8/2.7/2.5s is a compressed version (in real use, one chart per one or two sentences of narration). Narrative structure: Establisher → Initial → Peak → Release (Amini et al. 2015, 50 professional data videos).
- **Syncing with narration**: numbers **land exactly when spoken** — the bar finishes growing and the label stops at 107.9 right on "ten point seven nine billion"; the annotation pops when the line's head passes the event, right on "after launching a large model in March 2023". So fix the narration timings first, then work backward to the animation start points.
- **Text**: the title states the conclusion ("Revenue rose to nearly 9× in five years" — **"rose to", not "rose by"**: 8.7× means rising to 8.7 times the original = rising by 7.7×; the review caught this), the subtitle states the metric and unit ("Annual revenue, 100M CNY"); multiples must be computable from the numbers on the chart (107.9÷12.4=8.70); if the axis doesn't start at 0, say so in the subtitle ("y-axis does not start at 0"); one line of source at bottom left; for fictional data, an "illustrative data" badge at bottom right in every shot.

## ⑥ Implementation notes

> After being folded into the skill (2026-10-04 v0.4): the general functions under "newly written" in this card have been unified into `scripts/engine/lib/` (names changed to the unified MO / CAM / DG / TY / CH / UI / CL / TOON); the demo film's own code is in `scripts/engine/demos/t3_finance_chart/`. For a library quick reference and "how to choose a grammar for a piece of narration", see `references/09-video-animation-grammars.md`.

- Reused from the skill: `engine.js`, `render.py`, `U.rng` (all fictional data seeded and reproducible), `PAINT.hex`.
- Newly written `lib/chart.js` (`window.CH`): `lin` (scale, with `inv`), `ticks` (1/2/2.5/5×10ᵏ ticks), `grid` (gridlines drawn one by one, bold zero line, tick values on the right), `xLabels`, `bars` (grow from 0 + synchronized counting + highlight/gray out), `line` (advance by x, head dot, area), `yAt`, `candles` (candle by candle, configurable up/down colors), `callout` (dot → leader → text), `tag` (small red tag), `demoBadge` (illustrative-data badge), `mixHex`.
- `lib/motion.js`: `lagged`, `quintOut/expoOut` (called easeOutQuint/easeOutExpo during the experiment), `spring` (annotation dot); `TY.count/tabular/fmt`.
- Transitions (now in `transitions.js`): `slidePush`, `zoomThrough` (live, bScale0, focus).
- Event trigger time: `tHit = start + duration × smooth⁻¹(event's x fraction)` (inverse found by bisection), so annotations always stay in sync with the line head and changing the line's duration needs no manual adjustment.

## ⑦ Representative works and primary references

- Representative works: The Economist's web charts and videos; FT charts; data segments in Bloomberg Originals / Quicktake; Flourish's bar chart race.
- Economist chart style guide 2017 (mirror): https://sa.ipaa.org.au/wp-content/uploads/2026/02/Economist-CHARTstyleguide_20170505.pdf
- FT palette source: https://unpkg.com/@financial-times/o-colors/src/scss/_palette.scss
- Heer & Robertson 2007, Animated Transitions in Statistical Data Graphics: https://idl.cs.washington.edu/files/2007-AnimatedTransitions-InfoVis.pdf
- D3 bar chart race: https://observablehq.com/@d3/bar-chart-race-explained
- Correll et al. 2020 (the exaggeration effect of truncated axes; axis-break marks don't rescue it): https://arxiv.org/abs/1907.02035
- Datawrapper: bars start at zero https://www.datawrapper.de/academy/why-our-column-and-bar-charts-start-at-zero ; dual axes https://www.datawrapper.de/blog/dualaxis ; colorblindness https://www.datawrapper.de/blog/colorblindness-part2
- Cultural differences in red-up/green-down: https://onlinelibrary.wiley.com/doi/10.1002/bdm.1800
- CountUp.js (easeOutExpo, 2s): https://github.com/inorganik/countUp.js

## ⑧ The 3 easiest mistakes

1. **Truncated axes.** Bar charts always start at 0; lines and candlesticks may not, but say so on the chart. Tufte's Lie Factor (effect shown ÷ effect in the data) outside 0.95–1.05 counts as distortion.
2. **Too many colors, everything is the protagonist.** One color tells the story, the rest go gray; state clearly whom the red/green meaning is for (A-shares: red up; the West: red down).
3. **Animation so flashy the numbers can't be read.** No bouncing bars, 3D bars or spinning pie charts; stage it, ease in and out, about 1s per step; after a number lands, hold at least 0.5s so people can read it.

## QA numbers (skill `scripts/qa.py`, 2026-10-04, before review)

| Shot | Motion% | Static frame pairs% | Jumps | Mean/peak ms | Deterministic |
|---|---|---|---|---|---|
| t3_s1 | 1.39 | 0.0 | 3 | 1.3/1.9 | ✓ |
| t3_s2 | 2.37 | 4.7 | 0 | 1.9/2.8 | ✓ |
| t3_s3 | 0.96 | 0.0 | 0 | 1.6/2.3 | ✓ |

Note: t3_s1's 3 "jumps" at lt 2.10/2.20/2.27s are exactly the frames where four bars turn from blue to gray at once (highlighting the protagonist) and the annotation pops — intentional large-area changes, not glitches.

## Revisions (independent review → one round of fixes, 2026-10-04)

| Review comment | Fix |
|---|---|
| 🔴 Title "rose by nearly 9×" contradicts the annotation's 8.7× (should be "rose to") | Changed to "Revenue rose to nearly 9× in five years"; the stock-price page uses the same wording, "rose to 7.5×" |
| 🔴 The monthly line's end ¥268 doesn't match the daily candles' 286.40 (the push goes right to this point) | Last point of the monthly line = latest price 286.4, the second-to-last month's close = the daily candles' start 242; **numbers across two shots must be derivable from each other** |
| 🟡 At 5.6s "¥268" and the counting price overlap as two big red numbers | The stock price head label is cleared within 0.2s of the push transition starting |
| 🟡 "Volume" overlaps the candles; volume bars hit the 240 gridline | Label moved to empty space at bottom right; volume bars normalized to the max volume, leaving a 6px gap |
| 🟡 The daily candle page can't be read in 2 seconds | Removed the 5-day moving average; candles finish in 1.3s, the bracketed note lands at 1.75s, hold 0.75s |
| ⚪ Red-up/green-down clashes with brand red | Kept (for an A-share audience), with the subtitle saying "red up, green down (A-share convention)"; for an international version switch to green up or blue/orange |

QA after revision:

| Shot | Motion% | Static frame pairs% | Jumps | Mean/peak ms | Deterministic |
|---|---|---|---|---|---|
| t3_s1 | 1.44 | 0.0 | 3 | 1.3/1.7 | ✓ |
| t3_s2 | 2.45 | 4.7 | 0 | 1.9/2.6 | ✓ |
| t3_s3 | 0.91 | 0.0 | 0 | 1.7/2.9 | ✓ |
