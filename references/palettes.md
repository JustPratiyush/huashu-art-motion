# Palettes: one palette per film

For the "Palette" line before the shot list, pick a set from here and write its name, or define 3–6 color values yourself following the rules at the end. Every parameterized clip spec uses the same `"theme"`, and scenes use only these colors too (adjusting lightness and transparency is fine; don't introduce new hues).

## Off-limits first

**Blue-purple gradient backgrounds, deep-purple starry-sky backgrounds, neon cyan-purple glow effects, purple frosted glass**: in the author's words, "we need to avoid that garbage blue-purple gradient color scheme, this is very AI slop". These are the default colors AI-made animation falls into most often, and audiences read them as "made by AI" at a glance.

`deliver.py` measures it: a frame where more than 30% is blue-purple (hue 225°–300°, saturation ≥0.30) counts as a blue-purple frame, and blue-purple frames over 30% of the film is a red light, with no film delivered. When the topic itself needs blue-purple (a cyberpunk purple the user explicitly asked for, style images like Van Gogh's *Starry Night*), deliver with `--allow-blue-purple "reason"`, which downgrades it to yellow and writes the reason into the facts section of the delivery notes.

Flat navy (hue about 210°, see navy below) is not off-limits: it's a deliberate single background color, not a gradient and not glowing.

## Eight ready-made palettes

Each set has 6 keys: `bg` background, `surface` card/paper/panel, `ink` main text, `sub` secondary text and fine lines, `accent` main accent, `accent2` secondary accent. In a clip spec write `"theme": "wood"`, or an object `{"name": "wood", "accent": "#B8452A"}` to change just one key.

| Name | Suits | bg | surface | ink | sub | accent | accent2 |
|---|---|---|---|---|---|---|---|
| `paper` | Humanities, history, books, explaining an idea | #F3EDE2 | #FBF8F2 | #1B1A17 | #6B655B | #C8402F | #2F5D62 |
| `poster` poster yellow | Opinions, conflict, science explainers that slam one sentence in | #FFD23F | #FFF6D6 | #111111 | #4A4433 | #FF5A36 | #14213D |
| `ink` dark ink | Tech, night scenes, serious topics | #121417 | #1E2226 | #F2EFE8 | #A39E93 | #F2B33D | #5FB3A1 |
| `navy` | Products, data, phones and electronics (flat, no gradient) | #0D1B2A | #16293D | #EEF3F6 | #8FA3B3 | #5CC8E0 | #F2A93B |
| `bauhaus` | Design, structure, geometry, processes | #EFE9DD | #FFFFFF | #111111 | #555555 | #D62828 | #1D4E89 |
| `snow` | Winter, medicine, cleaning, laboratories | #E9EEF0 | #FFFFFF | #1F2A30 | #5E6B72 | #D9482B | #3E7C8C |
| `wood` warm wood | Daily life, kitchens, handcraft, things at home | #EDE3D1 | #F7F1E6 | #2B2622 | #7A6E62 | #C4552D | #3F5B4B |
| `chalk` blackboard | Classrooms, derivations, formulas, working problems | #23302B | #2E3D37 | #F1EFE6 | #A9B3AA | #F4D35E | #E87D5A |

## Defining your own

- 3–6 colors: a background, a surface, a main text color, a secondary text color, one or two accents. Within a shot, an accent points at only one thing.
- Decide the background first: a light background (paper, snow, wood) or a dark one (ink, navy, blackboard), and don't jump between light and dark during the film.
- Keep color values out of the blue-purple zone: colors with hue 225°–300° and saturation ≥0.30 are not used as backgrounds or in large areas. `storyboard_lint` checks the palette's color values and gives a red light for ones in this zone.
- No gradient backgrounds, no neon outer glow. For depth, use paper texture, grain, two flat layers of light and dark.
- With real material (screenshots, photos), take one or two colors from the material as accents, while the background still uses this set.

## Selfcheck

Before delivery, line up the sampled stills in a row: is the background in the same brightness range from start to finish, are the accents only those one or two, and does any shot suddenly show "another film's colors" like a white-background bar chart, a purple starry sky or neon borders? If so, redraw that shot in the palette.
