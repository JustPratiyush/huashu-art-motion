# Character detail: either draw it properly, or don't show the face

Read this page before starting whenever the picture includes people, anthropomorphic characters, mascots, robots, or things with faces. After watching films made by several models, the author said:

- "The little people and robot characters used in a lot of these videos are just too bad; we should define some of the level of detail and effort ourselves"
- "The colors and the people's style and look are somewhat AI slop", "the coins and the little-person look in the interface are somewhat AI slop"

**A crude character is worse than no character.** When the audience sees a round-headed, bean-eyed little figure, their first reaction is "made by AI", and however good the explanation is afterwards, that one glance drags it down.

## Choose a route first: three routes, and only three

The "Character" line before the shot list says which of these was chosen:

| Character line says | When to take it | How |
|---|---|---|
| `frame library <path>` | You have image-generation capability (the current session has an image tool, or the user provided character art) | Build an AI-generated frame library with methods B/C in `references/10-characters.md`, and pass the "delivery bar" below |
| `hands and backs only` | No image-generation capability, but the story needs a person | Draw only hands (holding an object, pointing at an object, putting an object in a pocket), figures from behind, silhouettes, over-the-shoulder; the face stays out of frame |
| `none` | The story can be told with objects alone | The object itself is the protagonist: a battery, a bag of bread, a book, telling it through shape, color and action, without giving it a face |

**Retired** (drawn in code it's AI-flavored, and both the lint and reviewers will block it):

- Generic chibi figures: round head, bean eyes, blush, no neck, a rounded rectangle for a body.
- White-shell robots: a white round shell, a blue visor, one antenna, hovering or jetting fire.
- Things with faces: smiling coins, frowning lithium ions, balls with eyes, emoji-style batteries.
- Stick figures and Haring figures used to act out stories (drawing a symbolic figure in the whiteboard grammar doesn't count as acting out a story).

**Exception: the protagonist of the whole film is an anthropomorphic object.** A hopping paintbrush or a desk lamp as the protagonist of the whole film, whose look went through the "three-direction hard gate" and was chosen by the user, may have a face and expressions: when making a promo, the author judged a faceless paintbrush "too formal, too boring", and only a cartoon paintbrush with a face passed. The difference is effort: the protagonist is designed (identity props, body structure, acting) and passes the delivery bar below; what's retired is the emoji face casually drawn onto coins, balls and ions.

The `y4` clip accepts only a frame library (`data.character.frames`) and fails to start without one. The code-drawn characters in the engine (neutral/bun/author in `lib/toon.js`) are no longer used for final films.

## Delivery bar: a frame-library character must pass these eight

Once made, take a close-up screenshot of the character (zoomed to 2×), check off each item below, and write it into the delivery notes. If it fails, go back to the image-generation step and redo it, or switch to "hands and backs only".

1. **Recognizable silhouette**: fill the character solid black, and you can still tell who it is and what it's doing. A figure assembled from circles and rounded rectangles is unrecognizable.
2. **Proportions with a skeleton**: a neck, shoulders, elbows, wrists; head-to-body ratio set by the style, unchanged for the same character throughout the film.
3. **Hands are hands**: you can see the shape of fingers or gloves, and they really hold objects (the object is in the hand, not stuck beside it).
4. **At least two levels of light and shadow**: base color + shadow, plus highlight or rim light; the light direction matches the scene.
5. **At least three material details**: clothing folds, stitching, grouped strands of hair, fabric texture, shoelaces, a watch strap… whichever this character should have.
6. **Specific acting**: each appearance has an expression + pose that matches this shot's content (frowning at a phone, sighing with relief and pocketing the phone), not just blinking or bobbing up and down.
7. **The same style**: the character's lines, coloring and palette are drawn the same way as the background, not a sticker stuck onto another picture.
8. **Consistent throughout**: the same character's features, hairstyle, clothes and colors are consistent in every shot.

## No faces on objects: how to make objects "act"

Bringing a concept to life doesn't require drawing a face on it.

- **With shape and motion**: lithium ions huddle together and move slowly when cold; spread out and run fast when warm. A battery bar shrinks one notch at a time in a cold wind.
- **With scale**: something slams from palm-sized to filling the frame.
- **With contrast**: two copies of the same object side by side, one frozen and one normal.
- **With real objects**: a real cross-section of a battery, real frost texture, a real screenshot.

## Selfcheck

Before delivery, sample 6 frames with characters or objects side by side and ask three questions:

1. Is there anything that looks at a glance like an "AI default little figure" or a "white-shell robot"? If so, change route.
2. Is there a face drawn on something that shouldn't have one? If so, remove the face and tell it through motion instead.
3. Are the character and background drawn the same way? If not, redo the character in the style, or show only the person's hands.
