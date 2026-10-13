# 03 · Frame first, then make it move: four routes

When image generation or character images are involved, first follow the [image capability guide](images.md) to choose a currently available tool or import existing assets; private character assets and platform choices are not defaults for every user.

The method Huashu wants: first design one artistic frame, then make that frame move as required. In one project on 2026-10-04 all four routes were actually run, each with its own use case.

| Route | Who draws the picture | Who does the motion | Measured | When to choose |
|---|---|---|---|---|
| **A Pure code** | Canvas procedural drawing + style renderer | Code (choreography curves, IK, particles, boiling lines) | The art-history recreation's main line (Huashu's choice) | To prove "a model can produce art animation directly in code"; to control every element's motion precisely; to switch among dozens of styles (switch the renderer, switch the style); to align frame by frame with narration |
| **B AI layered assets + code motion** | An image model draws by layer (green screen, keeping original-image coordinates) | Code (displacement, arcs, squash, physics, effects) | The 2026 ending segment: 11 assets composited correctly in one go | Highest image quality, complex character acting; when the style is realistic/illustrative and code can't draw it |
| **C Video model with first/last frames** | An image model draws one frame | Seedance first/last frame (same image at both ends) | Lovart Seedance 2.0 Van Gogh test: the girl puts down the cup and lifts it again, the starry sky turns, the cat flicks its tail, composition held throughout | When you want "the whole painting flowing" organically without precise control; sample / atmosphere shots |
| **D Hybrid** | Background via B/C, characters via A, or vice versa | Code orchestrates the timeline | — | Big productions: the background needs texture, the characters need control |

## The shared first step: one design frame

Whichever route you take, first get one "right" frame:
- **With a reference film**: feed that segment's "last frame before the transition starts" to gpt-image as a reference image, with a prompt like "keep the reference image's composition, camera, the position and size of every object, the colors and brushwork exactly; change only two things: …". Measured: overlaid on the original at 50% it matches almost pixel for pixel. Composition is locked by the reference image, not by writing coordinates in text.
- **Without a reference film**: first design the composition for the topic (what the subject is, where it sits in the frame, where the camera goes), and render a grayscale blockout screenshot as the reference image. Only speedrun/time-travel films first fix a fixed scene skeleton (standard composition coordinates) and align every segment to it.
- **Three-direction hard gate**: show three versions of the character interpretation (in this film: period women's clothing / the same person traveling through time / the original with a swapped head) on the same frame for someone to pick. Choose the frame where the original character is male; that's where the differences are most pronounced.

Pitfalls of design frames (all hit):
- Writing a minor character (17 years old) + any mention of "short skirt" gets the whole image rejected by moderation as sexual. Always write long clothing, and add "modestly dressed".
- Describe coat colors by body part: "orange-and-white cat (orange tabby on the top of the head, back and tail; muzzle, chest, belly and all four paws white)". Writing only "orange cat" gets an all-orange cat.
- Writing an action in the description ("drinking tea from a cup") overrides the reference image's pose. To keep the original pose, write only "keep the hand gesture from the reference image".
- Text that should move (years, titles): have the model "remove it and leave a clean background", and let code draw it; decorative text in the painting is written into the prompt character by character.
- Run batch image generation serially; establish the source of a generation from the actual tool-call record, the input/output association and human visual checks; PNG metadata can't prove which model generated it. For bringing in assets, see the [image capability guide](images.md).

## The key to route B: green-screen assets keep the original-image coordinates

Use the design frame as the reference image, with a prompt like: "Draw only the XX from the reference image… everything else is flat #00FF00, with no shadows, ground or text. Position, size and orientation exactly as in the reference image." The generated character is then already standing at its coordinates in the original image. When keying, **don't crop to the subject's bounding box and lose the coordinates** — `scripts/key_green.py` crops the edges while writing the top-left corner into sprites.json, so compositing pastes it back at the original coordinates and aligns in one go.

## The key to route C: the same frame at both ends

Seedance 2.5/2.0 supports frames2video. Give the same design frame as both first and last frame → things in the painting move and return to the original composition, so the clip's ends join seamlessly with transitions. Prompt structure: ① the camera is completely fixed (no push, pull, pan, zoom or shake) ② keep the composition / style / colors throughout, no turning realistic, no adding or removing objects, no new text ③ list item by item "what moves in the painting and how" (from the breakdown's motion list). Generate 5 seconds, take the best second or so, and retime it to the rhythm.
Channel: any Seedance integration that supports first/last frames (frames2video) works; the point is the prompt itself; video generation is billed per call, so try one short clip first.

## The key to route A

See `04-pure-code-drawing.md`. In one sentence (speedrun/time-travel): the same scene skeleton × shared choreography × one renderer per style × characters drawn on their own layer afterwards × lines added last. For other topics, replace the first two with composition and motion designed for the topic.
