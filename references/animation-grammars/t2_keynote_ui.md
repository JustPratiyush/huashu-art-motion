# t2_keynote_ui · Keynote-style interfaces and gradient motion

> The grammar in one sentence: **one thing per screen; the product itself (screenshots, screen recordings, physical product) is the protagonist; nouns and numbers land when the narration says them; tight type; springs with no bounce or light bounce.** Light-spot gradient backgrounds, frosted-glass cards, gradient text, centered blur-in reveals and decorative floating are all optional packaging — use sparingly (see "Pre-flight checks").
>
> Demo film: `scripts/engine/demos/t2_keynote_ui/` (render with `render.py --film demos/t2_keynote_ui`) (8s, 3 shots) · overview `assets/animation-grammars/t2_keynote_ui_overview.jpg` · code `scripts/engine/demos/t2_keynote_ui/`

## Pre-flight checks

1. **This look is the easiest to read as an AI template.** Light-spot gradient background + frosted-glass cards + gradient text + centered emergence from blur + floating cards: put all five together and the audience recognizes a template at a glance. Before starting, ask: are there real product screenshots, screen recordings, photos of the physical product? If so, make them the full-frame main image and push in to the part being discussed, and skip the light spots and glass cards; pick at most two of the five packaging elements per film.
2. **Screenshots must be big.** In shots with a screenshot, its width is ≥ 80% of the frame (≥ 90% in portrait); when the narration reaches a part of the screenshot that can't be read, push in to it (default slow push of about 0.9 seconds; a 0.28-second fast push only when that part is a reveal or a comparison result). Push into one screenshot at most once or twice; after pushing in, pull back to the whole image or pan to the next part. A small card floating on a big field of light spots is the fourth way to get it wrong, "dead background". The t2 parameterized clip does this by default: the screenshot spreads full-frame (scaled proportionally without cropping, with a darkened, blurred copy of the same image filling the surroundings), pushes in at the highlight moment (slow push by default; only `"camera": "snap"` inside the spec's top-level `data` makes it a fast push), and two consecutive screenshots are joined by a pan at the same zoom; the old glass card must be explicitly requested with `data.frame: "glass"`. When writing your own camera, use `CAM.track` (camera move table) and `MD.cover` (full frame + focus + push); for choosing moves, see `../camera-language.md`.
3. **Count the layouts.** Write down the layout of every screen in the storyboard (title screen, three cards side by side, big number, screenshot card); if the same layout appears ≥2 screens in a row, switch to another: screenshot push-in, number slam, before/after comparison. Looping "title → three feature cards → big number" through the whole film is page-flip PowerPoint.
4. **Hold once things land.** No floating cards, no constant slow push to fill pauses; put the next action at the moment the narration says the noun or number. If a number is about the screenshot just shown (a ratio of two timings, the conclusion of this page), set `data.over: true` on number: the camera pulls back to the whole screenshot, the screenshot darkens, and the number slams on top of it, instead of cutting to a separate light-spot screen.
5. **Colors follow the product.** Take the background and accent colors from the product's own brand; don't default to purple-blue-cyan light spots; don't use this dark keynote background for bad news, serious events or non-launch topics.

## ① When to use it

- **Use**: product/feature launches, version updates, "three new features", price and spec announcements, opening brand films, the "what is this product" section of a video. Best when the narration is **nouns + numbers** ("Plover 2", "320 milliseconds latency", "1 million tokens"): one screen per sentence, text emerging as the noun appears, numbers landing when spoken.
- **Use**: when an interface screenshot needs explaining — the screenshot full-frame, pushing in to the part being discussed; putting it in a glass card or rotating it in 3D is optional packaging, use sparingly.
- **Don't use**: explaining mechanisms or principles (glass and light spots carry no logic; use t1); data trends (use t3); serious incidents / bad financial news (this language carries "good news" emotion built in); when the content has no "protagonist" to enlarge (leaving only empty light spots); non-launch topics like science explainers, stories or news — don't use this background as a generic template.

## ② Composition

| Item | Value | Source |
|---|---|---|
| Background | Near black: this film `#050508`; Apple `#000/#161617/#1d1d1f`; Linear `#08090a` (one level up `#0f1011/#141516`, body text `#f7f8f8`, borders `#ffffff14`) | Measured from both companies' website CSS |
| Light spots (optional, use sparingly) | 4 radial gradients composited with screen → blurred 90px at 1/4 size → scaled up to fill → 3.5% static grain against banding. Hues follow the Stripe family: purple `(150,90,238)`, blue `(56,104,255)`, cyan `(120,214,255)`, a touch of warm red `(255,96,84)`; a 38% black radial gradient pressed over the center for contrast with white text | Stripe 2021 gradient `#a960ee #ff333d #90e0ff #ffcb57` |
| Light-spot motion (optional) | Each blob drifts with amplitude 90–260px, period 9.5–13s, **avoiding a 5s period** (HIG: avoid sustained ~0.2Hz oscillation) | Apple HIG Motion |
| Glass card (optional, use sparingly) | Sampled background blurred 40px (Apple's nav `saturate(180%) blur(20px)`; NN/g says the more the better) + 7.5% white fill + a 14% white gradient lit band at the top + 1.5px gradient stroke (bright top left, dark bottom right) + big shadow (blur 70–80, y+30–40, α0.5) | apple.com globalheader.css; NN/g Glassmorphism |
| Corner radius | Cards 36px; **concentric corners**: inner icon-tile radius = 36 − padding 14 = 22 | WWDC25 "child radius = parent radius − padding" |
| Fonts | Inter (the closest open-source font to SF Pro; Linear uses Inter); CJK Source Han Sans. Titles at weight 600, **large sizes tracked tighter −0.02 to −0.03em** (`T2.track`) | Apple 96px −0.015em, Linear 64px −0.022em, OpenAI 64px −0.03em |
| Text hierarchy | White `#f5f5f7` primary, `rgba(235,235,245,.6)` secondary, `#a7a7b4` eyebrow (tracking +6px); the product name may use a white → pale purple → pale cyan horizontal gradient (optional, use sparingly: gradient text plus light spots is a template) | Apple website hierarchy conventions |
| Composition | One focal point per screen; with a screenshot, full-frame (width ≥80%) and push in to the part being discussed; centered symmetric three cards side by side (width 480 each, gap 52) only for feature lists without screenshots; big numbers take more than 55% of the frame width | — |
| Shape language | Rounded rectangles, capsules, thin line icons (round caps, uniform stroke, SF Symbols feel, `UI.icon`) | — |

## ③ Motion

- **Springs (the workhorse)**: SwiftUI duration + bounce parameterization, `MO.spring(t,{duration,bounce})`: mass=1, stiffness=(2π/d)², damping=4π(1−bounce)/d → damping ratio ζ=1−bounce. **Default bounce 0** (most general); 0.15 crisp with barely any bounce (this film's card entrance d=0.75, bubble d=0.5); 0.3 visibly bouncy; >0.4 is exaggerated for UI. `.smooth/.snappy/.bouncy` all have d=0.5.
- **Curves (non-spring)**: apple.com nav `.32s cubic-bezier(.4,0,.6,1)`; this film's text emergence uses CSS `ease`=`(.25,.1,.25,1)` (`MO.appleOut`); Linear's workhorse is ease-out-quad `(.25,.46,.45,.94)` at .16s; Stripe recommends <500ms with `(.2,1,.2,1)`. `MO.bezier(x1,y1,x2,y2)` covers them all.
- **Text entrance** (centered blur-in is optional, use sparingly; if every screen in the film emerges like this, it becomes a template): blur 18–26px → 0, rising 16–40px → 0, transparent → 1, over 0.7–1.0s (`TY.blurIn`). Eyebrow → product name → subtitle staggered by 0.2–0.4s.
- **Card entrance**: from 170px below, rotated ±0.55rad around the Y axis (≈31°, side cards facing outward), scale 0.9 → spring into place; three cards staggered 0.1s. 3D via `UI.persp` (vertical-slice perspective, persp 1800px; Stripe uses 600, Linear 1000).
- **Camera and holds**: once things land, hold; no decorative floating, no constant slow push to fill pauses. The camera moves only when the narration reaches a part of the screenshot that can't be read: by default a slow push of about 0.9 seconds to that part, 0.7 seconds to move to the next; a 0.28-second fast push only for revealing a result or comparing two numbers; numbers or big text slam in over 0.17 seconds (1.55→0.94→1.0); how long to hold follows the narration. After pushing in, pull back to the whole screenshot or move to the next part — don't push only inward shot after shot. The demo film's 7px card float (`MO.float`) and constant camera push 1→1.045 are the old approach; new films should not copy them.
- **Counting**: starting 0.25s after the card lands, over 0.9s (count the same number only once — after expanding to full screen keep "1M", don't count again from 0); `easeOutExpo` (CountUp.js's default easing) — the last digit settles slowly; numbers **laid out with fixed widths** (`TY.tabular`; Canvas can't enable tnum, and without it the digits jitter).
- **Light sweep**: a bright band slanted −20°, 110–140px wide, sweeps across in 0.8–0.9s; use `source-atop` on the text's offscreen layer (lighting only the text) and `lighter` on cards; the three cards compute progress from their own screen positions = one single sweep of light.

## ④ Transitions (5 common ones)

1. **Blur push (blurPush)**: the old image shrinks to 0.92 + blurs 24px + fades out; the new image falls from 1.06 with blur to 1.0 sharp, 0.55s, `ease`. **First lay a heavily blurred copy of the old image scaled to 1.08 underneath**, so no black edges show around the shrinking image. This film's shot 1→2.
2. **Shared-element expand (expandRect)**: (the new image is **opaque** inside the card from its first frame — the cards are semi-transparent, and any dissolve shows the old and new text overlapping) the selected card (first scaled to 1.06, with the side cards receding and dimming to 45%) expands from its own screen rectangle to full screen, corner radius 38→0, spring d=0.55 bounce 0; the new image starts out scaled to the card's size inside it. **The selected card stops floating before expanding**, so the transition starts from a stable rectangle. This film's shot 2→3.
3. **Match cut**: the same object in the same position across two shots (product name → card title position).
4. **Mask wipe / light-sweep cut**: change the image behind a sweeping band of light.
5. **Refraction instead of crossfade** (Liquid Glass): as an element exits, gradually change its refraction/blur strength instead of simply lowering opacity (this film's text blur-in follows this idea).

## ⑤ Rhythm and text

- **Shot duration**: in keynote presentations a screen often lasts 5–8s (Jobs's 2007 iPhone: 70 seconds, 9 screens ≈ 7.8s per screen); fast-cut product films 1.5–3s. This film 2.6/3.0/2.4s.
- **One thing per screen**: one noun, one number, one card. After a dense section, give the audience an empty screen to breathe (Presentation Zen's counterweight).
- **Syncing with narration**: text starts emerging 0.2–0.3s before the noun is said (the emergence itself takes 0.7s, so it's sharp right when spoken); numbers **land** when the narration says the value — count start = moment the number is spoken − count duration; the three cards enter in turn on "first, second, third".
- **Text**: title ≤6 characters (Chinese) or one product name; subtitle one sentence ≤16 characters; cards: a 4-character title + one line of description + one big number + unit (one size smaller, one gray level lighter). For English, keep the equivalent brevity: a title of a few words, a one-line subtitle.

## ⑥ Implementation notes

> After being folded into the skill (2026-10-04 v0.4): the general functions under "newly written" in this card have been unified into `scripts/engine/lib/` (names changed to the unified MO / CAM / DG / TY / CH / UI / CL / TOON); the demo film's own code is in `scripts/engine/demos/t2_keynote_ui/`. For a library quick reference and "how to choose a grammar for a piece of narration", see `references/09-video-animation-grammars.md`.

- Reused from the skill: `engine.js`, `render.py`, `PAINT.cached/hex`, `U.rng`.
- Newly written, now unified into `lib/ui.js` (`window.UI`): `mesh` (light-spot background), `grainTex`, `backdrop` (blurred copy, sampled by frosted glass), `shadow` (draws only the shadow), `glass` (frosted-glass card), `sheen` (light sweep, optional `comp`), `persp` (pseudo-3D around Y/X axes), `icon`, `rr/rrPath`, `scratch`.
- `lib/motion.js`: `spring/smoothSpring/snappy/bouncy`, `bezier/appleOut/emphasized`, `float`; numbers and text in `lib/typo.js`: `TY.count/tabular`, `TY.blurIn` (called MO.textIn during the experiment).
- Transitions (in `transitions_info.js` during the experiment, now in `transitions.js`): `blurPush`, `expandRect`.
- Performance: one light-spot pass per frame (at 1/4 size) + one blurred background copy, averaging 40–60ms per frame (QA with GPU flush); 8 seconds at 60fps renders in about 1 minute.
- Pitfalls (fixed in the library): ① **blur pulls in transparent pixels from outside the canvas**; drawn into an offscreen layer that isn't cleared, it accumulates frame by frame and QA reports determinism ✗ — lay an unblurred copy of the original underneath first; ② adjacent perspective slices overlapping by 0.75px produce stripes on semi-transparent textures — round slice boundaries to whole pixels, end to end, and draw into an offscreen layer first, then paste back as a whole by alpha; ③ `UI.sheen` sets its own composite mode internally, overriding an outer `source-atop`, so it was made a parameter.

## ⑦ Representative works and primary references

- Representative works: Apple iPhone / Apple Intelligence launch films and apple.com product pages; OpenAI GPT-4o / o-series launch videos; the Linear website and Linear Release videos; Stripe's 2020–21 website gradients.
- https://developer.apple.com/videos/play/wwdc2023/10158/ (Animate with springs: duration/bounce)
- https://developer.apple.com/videos/play/wwdc2018/803/ (Designing Fluid Interfaces: start from 100% damping)
- https://developer.apple.com/videos/play/wwdc2025/219/ (Meet Liquid Glass)
- https://developer.apple.com/design/human-interface-guidelines/materials , /motion , /typography
- https://www.nngroup.com/articles/glassmorphism/
- https://web.archive.org/web/20211015000000/https://stripe.com/ (gradient color values)
- https://stripe.com/blog/connect-front-end-experience (<500ms, curves)
- https://linear.app/now/how-we-redesigned-the-linear-ui (LCH color, Inter)

## ⑧ The 3 easiest mistakes

1. **Nothing behind the glass.** Frosted glass only blurs what's behind it; "glass" on a plain dark background is just a gray rectangle. First draw colorful, varied light spots, then sample and blur them at the card's screen position.
2. **Springs too bouncy, too much motion.** bounce defaults to 0, at most 0.15–0.3 for entrances; >0.4 instantly looks cheap. Move only one group of things at a time.
3. **Large text not tracked tighter; muddy light-spot colors.** −0.015 to −0.03em above 64px; each light spot keeps its own color area (screen compositing + heavy blur) — don't linearly average multiple colors into a gray-purple mud.

## QA numbers (skill `scripts/qa.py`, 2026-10-04, before review)

| Shot | Motion% | Static frame pairs% | Jumps | Mean/peak ms | Deterministic |
|---|---|---|---|---|---|
| t2_s1 | 0.58 | 35.4 | 0 | 39.8/51.4 | ✓ |
| t2_s2 | 2.62 | 8.5 | 0 | 60.2/65.0 | ✓ |
| t2_s3 | 1.84 | 9.6 | 0 | 44.3/51.0 | ✓ |

Note: t2_s1's "35% static frame pairs" comes from the demo film's light-spot drift and 4.5% constant push (the old approach), where the per-frame change is below QA's pixel threshold (>12 levels); taking two frames 1 second apart (film 1.6s vs 2.6s), 26.8% of pixels change by more than 12 levels and 78% by more than 4. High or low static frame pairs say nothing about quality: long holds are right for explainer films, and a film with constant slow drift has very few static frame pairs yet still feels like flipping slides.

## Revisions (independent review → one round of fixes, 2026-10-04)

| Review comment | Fix |
|---|---|
| 🔴 Black edges showing around the transitions at 2.55–2.75s and 5.6–5.85s | Lay a copy of the old image scaled 1.08 and blurred 30px under blurPush / expandRect |
| 🔴 Double image of "long-term memory" and "1M" while the card expands; counting again from 0 after expanding | The new image is opaque inside the card from its first frame; the full-screen page keeps the same "1M tokens" figure without recounting |
| 🔴 At 6.95s the count jumps in one frame from 999,023 to 1,000,000 and "tokens" gets squeezed | The duplicate count was removed with the previous fix; the unit is laid out by measured widths of three segments, no longer crowding the text |
| 🟡 The end card appears for only 0.4s, at y≈1020 outside the safe area | End card emerges at 1.2–1.8s, holds 0.6s, y=972; the dialog panel moved up 65px as a whole |
| ⚪ The card's "1M" vs. the full screen's "1,000,000" use different formats | Unified as "1M" |

QA after revision:

| Shot | Motion% | Static frame pairs% | Jumps | Mean/peak ms | Deterministic |
|---|---|---|---|---|---|
| t2_s1 | 0.58 | 35.4 | 0 | 39.5/51.6 | ✓ |
| t2_s2 | 2.62 | 8.5 | 0 | 57.2/59.9 | ✓ |
| t2_s3 | 0.97 | 15.4 | 0 | 43.0/48.7 | ✓ |

(Transition smoke test: blurPush is slowest at about 137ms per frame, including two full-screen blurs.)
