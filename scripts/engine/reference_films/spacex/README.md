# SpaceX narrated-animation reference code

Contains scene code snapshots of four ways of telling it: mixed styles, whiteboard, Vox collage, and presenter. Use it to learn and transfer methods for camera work, narration-keyword time anchors and layout; it isn't a complete demo that renders out of the box, and doesn't represent the complete project of the latest public film.

This is a snapshot of a film with **Chinese narration**. Its narration transcript and timing data (`spacex/timing.js`), the narration substrings that cues anchor to, the on-screen words that quote the narration (kinetic type, labels, the whiteboard's handwriting) and the whiteboard's stroke-order data (`spacex_wb/assets/strokes.js`) remain in Chinese, because they are keyed to the original Chinese voiceover and Chinese characters; all code comments, log and error messages are in English. For an English film, rebuild `timing.js` from an English voiceover and replace those strings together (the `U.assertGlyphs` checks in each scene's `init` list the strings to update).

- `spacex/tm.js`: `TM.cue(segment, 'substring of the narration')` hangs an action on a narration keyword; `timing.js` is this example's timing data, to be replaced for a new topic.
- `spacex_wb/common.js`: content framing `fit/declip/shot`, stroke scheduling `build`, revealing in stroke order `so/soAt`.
- `spacex_vox/common.js`: accumulating desk `item/drawWorld/camEnd`, insert shots, occlusion registration.
- `spacex_lin/common.js`: presenter frame switching, foot anchors, poses across segments and the top bar; `tools/prep_presenter.py` demonstrates green-screen frame splitting.
- `eras_*.js`: four segment tables; `transitions/`: matching transitions.

## Usage boundaries

1. First copy the upper-level `scripts/engine/` into your own project, then put the selected film directory, segment table and transitions from here in the corresponding places at the project root. The whiteboard segment table keeps the filename `eras_wbx.js`, with actual asset paths unified as `spacex_wb/`.
2. Presenter sprites, character frames for the mixed version, source image-generation prompts and narration audio are not distributed with this snapshot. `presenter_meta.js` only provides the structure of the frame table; you need to regenerate assets and metadata with your own character. An existing frame table doesn't mean the assets exist.
3. Fonts follow the upper project's `lib/fonts.js` and the bundled fonts; the Vox body text and typewriter numbers were switched to the bundled LXGW WenKai and CMU respectively, avoiding extra missing fonts; the preprocessing scripts need `numpy` and `Pillow`; to run `make_hand.py`, first prepare your own `hand_raw_1.png` to `hand_raw_3.png` in its directory.
4. The text and numbers here are historical creative material, not up-to-date SpaceX facts to quote directly. New work needs its own verified script and a rebuilt narration timeline.
5. If you just want to run a complete demo first, use the upper-level `demos/` or `clips/`, not this directory.

## Third-party stroke-order data

`spacex_wb/assets/strokes.js` is taken from the stroke medians of hanzi-writer-data 2.0.1 / Make Me a Hanzi; it keeps only the medians arrays for the characters used in the example, wrapped as a browser variable, without the original glyph outlines. This derived data keeps the Arphic Public License, whose text is `ARPHICPL.TXT` in the same directory, and is not covered by this repository's MIT license.

Upstream: https://github.com/chanind/hanzi-writer-data/tree/v2.0.1
Original data project: https://github.com/skishore/makemeahanzi
License text: https://github.com/chanind/hanzi-writer-data/blob/master/ARPHICPL.TXT
