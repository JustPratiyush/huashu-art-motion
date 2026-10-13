# Y6 · Presenter-led finance explainer

A cartoon presenter links information across paper surfaces, charts and key words. Suited to business history, product mechanics, and knowledge explainers with emotional reactions. Reference code is in `scripts/engine/reference_films/spacex/spacex_lin/`; this is the 9th grammar card. It currently has no standalone parameterized clip and ships without character sprites.

## Pre-flight checks

- Assign layouts in the storyboard first: presenter side-on, full-screen number, left/right comparison, the character entering the chart, reaction close-up. Don't fix "person left, chart right" for the whole film.
- Generate frames at no fewer than two shot sizes: full body and bust; sitting and leaning need real matching frames.
- In every segment, the first `cast` keyframe explicitly specifies `x` and `s`, to prevent regressions from inheriting values across segments.
- For nested drawing, multiply opacity with `*=` so the outer fade-out is preserved.
- The year in the top bar, the subtitles and the section titles all read from the same time source.
- Run `qa.py` text framing from the very first version; for light-background films without subtitles, also run `subzone_gate.py`.

## Frames and motion

The character uses AI-generated frames; code controls the foot anchor, position, size and frame switching. Poses hard-cut with a slight pop, to avoid differently shaped silhouettes dissolving into a double image. Talking and mouth-closed frames switch with the narration timing; mouth movement stops during pauses, and walking uses full gait frames. Pose heights are aligned to the median; reaction close-ups use bust assets rather than blowing up a full-frame crop.

Numbers land when the narration says them. Don't add assertions like "over" or "+" before the count finishes; emphasis circles appear after the number lands. Leave the pause after a highlight in the script and narration stage.

## Reference implementation

`common.js` provides `presenterFrame`, `drawFigure`, `hud`, `yearAt`, `popK` and `L.cast`. `prep_presenter.py` demonstrates cutting frames and foot anchors. The transition `transitions/lin_page.js` flips only the page, so the presenter and the top bar can continue across pages.

Known limitations: the character covering text and the character being cropped by a push still need human review; whole-frame bitmap push-ins in the reference code crop easily, so new films should prefer a scene camera. Assets and narration must be supplied yourself; this card can't be used directly as a complete film template.
