# 10 · Characters: people come from AI-generated frames, code handles compositing

When image generation or character images are involved, first follow the [image capability guide](images.md) to choose a currently available tool or import existing assets; private character assets and platform choices are not defaults for every user.

## Choosing how to implement a character

The same character can be implemented in three ways (A and B side by side in `assets/characters/huashu-likeness-comparison.jpg`; C's results in the Kurzgesagt and whiteboard demo films):
- **A Drawn in code**: only for motion blockouts, previsualization and purely geometric symbols (blocks, terminals — things that are geometric to begin with). People, anthropomorphic characters, robots and objects with faces are not drawn into a final film with code; see `references/character-detail.md`.
- **B Paste an existing frame library**: keeps the character consistent easily, but the frame library and the scene's style have to be reconciled.
- **C Generate action frames in the film's style, then composite**: a reference image keeps the identity, green-screen keying hands it to code, which controls motion and material.

Real people and anthropomorphic characters use only B or C, and must pass the delivery bar in `references/character-detail.md` when done; without image-generation capability, show only hands and backs, or no people at all. The style cards keep the known weaknesses of each kind of character.

## B: paste an existing frame library

- Frame library: character frames you've already finalized (e.g., waving, dragging; 8 transparent PNGs per action; generic action frames must be prepared yourself; the character frames for the three segments bundled with the long-scroll demo are in `scripts/engine/demos/long_scroll/frames/`).
- Loaded as image resources at engine startup; rendering switches frames by `floor(t*9)%8` — limited animation, no tweening.
- Placed with the center of the feet as the anchor; `face=-1` flips horizontally.
- Give the frames the material of the film they're in (Vox adds a white cut-paper border and shadow; stroke styles can run another layer of fine strokes over the frames via source-atop).

## C: generate a version in the style

1. **Generate**: use an image model that supports reference images, like gpt-image (for prompt writing, see [huashu-gpt-image](https://github.com/alchaincyf/huashu-gpt-image)), running batches serially. ref = the character's three-view design sheet or the master of an existing frame library; the prompt spells out:
   - The style's **form grammar** (not just "XX style"): Kurzgesagt solid color blocks without outlines, shadows one shade darker in the same hue; Vox black-and-white halftone newspaper photos + white cut-paper border; whiteboard black marker line art + orange hatching; Monet short-stroke light flecks…
   - **Pose aligned with the camera staging** ("side-on facing right, reaching out and pointing right"); for motion, put several frames in one sprite sheet (4×2, eight frames; state the frame count at the start, "the same character" to lock consistency, give only key poses and let the model fill in between, "each frame standing at the bottom center of its cell, all the same size").
   - Green screen `#00B140` (a white hat and white T-shirt can't use a white background).
   - Fixed rules (using Huashu's likeness as an example): a **pure white** bucket hat (models like to make it light gray, so state it explicitly), round black glasses, white T-shirt, khaki shorts, white clogs, a black watch on the left wrist, big head and small body.
2. **Verify**: rely on the actual tool-call record, the input/output association and human visual checks; PNG metadata can't prove which model generated it. For bringing in assets, see the [image capability guide](images.md).
3. **Key and split frames**: `scripts/key_split.py` (removes green spill, splits poses by column; whiteboard line art uses `--white` to only crop without keying, and is composited with multiply); when original-image coordinates must be kept, use `scripts/key_green.py`.
4. **Composite**: code decides only position, size, orientation, when to switch frames, and material; interactive objects like pebbles, ripples and props are still drawn in code and aligned to the hand position.

## When code drawing is still used

In a final film: silhouettes, figures from behind, hands (drawn properly in the film's style), and things that are geometric to begin with (blocks, terminal windows). Robots, chibi figures, stick figures acting out stories, and putting faces on objects are retired; reasons and alternatives are in `references/character-detail.md`. The girl/cat skeletons in `lib/rig.js`, plus `rig_huashu.js` and `lib/toon.js`, are kept: for motion reference (where the hands and feet are, giving AI frames their anchors), blockout previsualization, and the already-finalized characters in style demos like the art-history speedrun.
