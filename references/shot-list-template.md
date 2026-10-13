# Shot list template: shot list first, then build

Step 1 of the rail tier. The open tier is also advised to write one; running the lint is optional there.

A shot list is this film's storyboard: first lock one art style, then one row per shot, spelling out **what object is in the frame, what it's doing, how the camera moves, how many words are on screen, and what it's made with**. If you can write this table, the film won't turn into a PowerPoint page piling up longer and longer, nor into a collage with a different style every shot; if you can't write a row, that shot isn't thought through yet — don't write code for it.

## How to write it

Copy the block below into `<project>/shot-list.md`, fill in the three lines above the table first, then fill in one row per shot:

```markdown
Style: (one sentence: one style card or one way of drawing, used for the whole film)
Palette: (a name from references/palettes.md, or 3–6 #hex values)
Character: (none / hands and backs only / frame library <path>)

| Time | Object in frame | Action | Camera | On-screen text | Method |
|---|---|---|---|---|---|
| 0–3 | (noun: a person, a thing) | (verb: what it's doing right now) | hold / slow push / pull out / pan / fast push / slam in / cut | (≤8 words, may be empty) | (y4 clip shot01.json / scenes/xxx.js / footage photo) |
```

| Column | What to write | Don't write |
|---|---|---|
| Time | `0–3`, `3–7.5` or `0:03–0:07`; one shot's end is the next one's start | |
| Object in frame | A noun, something on screen you can point at and say "that's it": a slice of bread, a spore, the protagonist's hand | title, bullet points, text, list, labels, subtitles, cards, background, frame, icon; empty shot, solid color, black, gradient background (protagonist not in frame) |
| Action | A verb, the object's own action: floats in, splits open, burrows in, gets cut off | appears, shows, displays, fades in, appears one by one |
| Camera | This shot's main move, chosen by "where the audience should look at this moment": hold / slow push / pull out / pan / fast push / slam in / cut. Fast push and slam in are accents, only for reveals, twists and key numbers; after pushing in, give and take. How each move is used and how long it takes is in `references/camera-language.md` | A push on every shot; a constant slow push on every shot |
| On-screen text | ≤8 words per shot, may be empty; the full narration goes to subtitles | Whole narration sentences, three lines of bullet points |
| Method | What it's made with: which grammar's parameterized clip (write the spec filename), `scenes/<id>.js` drawn in code, real footage full-frame | A different grammar every shot |
| Tags (optional column) | Small labels attached beside the object in this shot, separated by commas | More than 3 per shot; a row of glowing capsules |

The three lines above the table (the style lock):

- **Style**: one sentence stating which single way of drawing the whole film uses, e.g., "warm-wood paper illustration, flat color with fine pencil lines, afternoon side light in a kitchen". Changing scenes is fine; changing style isn't: a cartoon person, a dark code screen, starry icons, a white-background bar chart, paper and web screenshots taking turns — each shot looks fine on its own, but the whole film is a collage.
- **Palette**: a set from `references/palettes.md`, or 3–6 color values. Every clip spec uses the same `"theme"`, and scenes use only these colors. No blue-purple gradients, deep-purple starry skies or neon cyan-purple. Only when the user explicitly asks for blue-purple (cyberpunk purple, Van Gogh's *Starry Night*) add the line `Allow blue-purple: reason`.
- **Character**: if people or anthropomorphic characters will appear, read `references/character-detail.md` first. With image-generation capability, use AI-generated frames and write `frame library <path>`; without it, write `hands and backs only` or `none`, telling the story with hands, figures from behind, silhouettes and objects. Code-drawn chibi figures, white-shell robots, and coins and balls with faces are retired.

Five requirements; check them one by one when done:

1. **The first 3 seconds are a concrete little scene, and the ending also lands on an action by the protagonist or main object**: the opening is a person or object doing something related to the topic — not a title, not "today we're going to talk about"; the ending is an action like putting something in a pocket, closing a book, or pulling out to see the whole; text can be written on an object in the picture, not left on a centered quote card.
2. **One example runs through the whole film, in one style to the end**: the same slice of bread, the same pair of hands, the same machine from start to finish, with each shot about something happening to it; every shot is in the style written in the style-lock line.
3. **2–6 seconds per shot**: an occasional shot can go to 8 seconds.
4. **Text-led shots ≤30%**: a shot counts as text-led if its object column is a title/text, it has 7 or more words of on-screen text, or it's made with y5 kinetic type.
5. **Adjacent shots don't use the same composition**: if this shot is a full-frame close-up, the next switches to a pan, another object, or a different shot size. What changes is composition and camera, not art style.

Two hard lines for the method column (also in rail-tier step 3): **a single parameterized clip carries at most 8 seconds** (the same .json totals no more than 8 seconds in the table); **a film uses at most 2 clip grammars**, all specs with the same `theme`, and the remaining shots drawn as scenes in the same palette, or real footage full-frame.

## Checking

```sh
uv run <skill>/scripts/storyboard_lint.py <project>/shot-list.md --script <project>/script.txt   # add --script if there's a narration script
```

It gives red/yellow/green and a fix for each shot, and exits non-zero on any red light. On red, fix the shot list and rerun; **don't start writing code until the red lights are cleared**. Yellow can go ahead, with a reason for each written in the delivery notes. What the lint checks: whether the three lines above the table (Style, Palette, Character) are written; whether the palette has blue-purple color values; whether the character line is a code-drawn figure, whether the object column has robots, little figures or stick figures while the character isn't a frame library, whether y4 is used without a frame library, whether coins or balls are given faces; the object column can't be empty, can't be just a layout word, and can't be an empty frame like an empty shot / solid color / black; the action column must have an action; on-screen text ≤8 words; neither the first nor the last shot may be text-led; text-led ≤30%; with `--script`, numbers in on-screen text (percentages, years, numbers with units) must be found in the script (spelled-out numbers in the script like "sixty percent" are recognized too); with a "Tags" column, more than 3 tags in a shot is yellow; 2–6 seconds per shot (6–8 seconds yellow, over 8 seconds red); three shots in a row with the same camera move is yellow ("hold" and "pan" don't count), three pushes inward in a row is yellow, fast push / slam in / whip on more than a third of the shots is yellow; in the method column, the same clip totaling over 8 seconds or more than 2 clip grammars is red. "One example runs through", "every shot really is the same style" and "adjacent compositions differ" can't be checked by machine — check them yourself.

## Example: why does bread go moldy (54 seconds, landscape)

This demonstrates how to write it: don't carry its topic, objects or shot order into your film. Running through the whole film are the same bag of sliced bread and the owner Xiaoman's pair of hands, with the face out of frame.

Style: warm-wood paper illustration, flat color with fine pencil lines, the same afternoon kitchen side light in every shot
Palette: wood
Character: hands only (Xiaoman's hands, no face)

| Time | Object in frame | Action | Camera | On-screen text | Method |
|---|---|---|---|---|---|
| 0–3 | Xiaoman's hands and a bag of sliced bread | The hands tear open the bag; a fingertip stops on a blue-green spot | hold | | scenes/kitchen.js |
| 3–6 | That green spot | A ring of white fuzz at its edge spreads outward like a map | slow push | Not there three days ago | footage moldy bread photo full-frame |
| 6–10 | A spore | The spore drifts in through a crack in the window and tumbles onto the bread | pan | Spore | scenes/spore.js |
| 10–14 | That spore | The spore's shell splits and a white thread pushes into the bread | fast push | | scenes/spore.js |
| 14–18 | The air pockets in the bread's cut face | The white threads branch along the pockets, burrowing down like roots | pull out | Hyphae | scenes/hyphae.js |
| 18–22 | Starch grains in the bread | Hyphal tips spray enzymes, snipping the starch grains into bits of sugar | slow push | Starch → sugar | scenes/hyphae.js |
| 22–26 | The thermo-hygrometer on the kitchen wall | The needle slides from 15°C to 28°C, and droplets condense inside the bag | cut | 28°C | scenes/kitchen.js |
| 26–31 | Two mold-area curves | The countertop curve shoots upward; the fridge curve crawls along the bottom | hold | Much slower in the fridge | t3 clip shot08.json |
| 31–35 | Tiny stalks on the mold's surface | Stalks push up black spore balls, which burst with a pop | slam in | | scenes/hyphae.js |
| 35–39 | A cloud of spores | The spore cloud drifts across the table toward the bag of buns beside it | pan | Next stop | scenes/spore.js |
| 39–43 | Xiaoman's hand and a bread knife | The knife tip measures off the green corner, ready to cut it and eat the rest | hold | Just cut it off? | scenes/kitchen.js |
| 43–47 | The cut cross-section of the bread | A cutaway peels back layer by layer: invisible hyphae already fill half the slice | fast push | The part you can't see | scenes/hyphae.js |
| 47–51 | Xiaoman's hands and the trash can | The hands drop the whole bag in and shut the lid | cut | | scenes/kitchen.js |
| 51–54 | Xiaoman's hands and a new bag of bread | The hands slide the new bread into the freezer; the door closes and frost slowly creeps over the bag | pull out | Cold, dry, sealed | scenes/kitchen.js |

Why this table passes: above the table it locks one style and one palette, with the person shown only as hands; the opening is a pair of hands tearing open a bag and finding mold, not a title; the ending returns to the same pair of hands sliding new bread into the freezer, with three words written in the picture, not a quote card; the same bag of bread from start to finish; none of the 14 shots is text-led; the only parameterized clip is shot 8's t3 curve, whose spec uses `"theme": "wood"`, the same palette as the scenes; the camera follows "where the audience should look at this moment": slow pushes to see details (the green spot, the starch grains), pans to follow something moving (the spore, the spore cloud), pull-outs to see the whole (hyphae burrowing down, closing the freezer door at the end), and holds when the picture moves on its own (the curves growing, the knife tip measuring); fast push and slam in are used only three times, saved for the spore shell splitting, the spore balls bursting, and the cross-section revealing — the three "aha" moments. After pushing in, it switches away with a pull out, pan, hold or hard cut, never three pushes inward in a row. Shot 8's curves are illustrative and must be labeled "illustrative data" in the final film.
