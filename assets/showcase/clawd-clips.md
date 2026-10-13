# Clawd: Night at the Museum · GIF clips

Cut directly from v2 of the 98-second film *Clawd: Night at the Museum*. The full film (MP4, with music) is in Releases. This folder doesn't include that film's project.

- `clawd-vangogh.gif`: 00:28.40–00:33.40, 5 seconds, 720×405, 15fps. Jumps into Van Gogh's *Wheat Field with Cypresses* → an impasto Clawd runs through the waves of wheat.
- `clawd-trex.gif`: 01:20.50–01:24.50, 4 seconds, 640×360. A T. rex skeleton chases the flashlight spot like a cat chasing a laser pointer.
- `clawd-dawn.gif`: 01:34.00–01:38.00, 4 seconds, 640×360. Dawn: the guard puts down a coffee, and Clawd in the picture frame blinks once.

Export settings are the same as the Super Mario set: original speed, 20fps, silent, infinite loop, an independent 192-color palette per clip, Bayer dithering, then optimized with `gifsicle -O3`. The Van Gogh clip's impasto strokes are so dense that these settings gave 12.5MB, so it was changed to 15fps, 160 colors and `gifsicle --lossy=40`, bringing it down to 7.7MB.

## What the film uses

- Style: a charcoal night scene on dark brown paper, with color showing only where the flashlight shines; on entering a painting, it switches to that painter's own brushwork.
- The five paintings entered: Van Gogh's *Wheat Field with Cypresses* (Met 436535), Seurat's *Circus Sideshow* (437654), Vermeer's *Young Woman with a Water Pitcher* (437881), Rembrandt's *Aristotle with a Bust of Homer* (437394), Leutze's *Washington Crossing the Delaware* (11417). All from The Metropolitan Museum of Art's Open Access collection, `isPublicDomain: true` (CC0).
- The dinosaurs and elephants are charcoal line drawings based on real skeletons and forms; the guard appears only as hands and a shadow, and code draws no human faces.

## Copyright

Clawd is Anthropic's Claude Code mascot, and the rights to its likeness belong to Anthropic. This film is an unofficial fan demo, not affiliated with Anthropic; the GIFs and the full film are only for showing what this skill can do and are not covered by the repository's MIT license.
