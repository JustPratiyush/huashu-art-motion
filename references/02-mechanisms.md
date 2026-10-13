# 02 · Mechanisms: why the "Art History Speedrun" looks good

This page is the mechanism for "speedrun / time-travel" films: the same scene, switching through a series of styles or eras (an art-history speedrun, 100 years of one city, a person from eighteen to eighty). Topics like these can all be built on these five layers; explainer films, story films and single-style shorts are not built this way — their composition is designed for the topic.

## Five-layer mechanism

**1. A fixed scene skeleton.** Across 16 eras, the positions of the window, table, cat, person and year plate barely move (±40px). With an anchor for the eye, the audience can see clearly that "what changes is the style". And because positions are fixed, transitions can use objects in the picture as their origin (the mosaic spreading from the cat's position, the iris opening from the cup).
→ Method (speedrun/time-travel only): first fix this film's composition coordinates, and align every era to them. In code it's one set of constants, not each segment drawing its own. Other topics don't reuse this room's coordinates.

**2. Each era is a living painting.** It stays on screen for 0.25–1.4 seconds, but things in the painting keep moving: one continuous action by the protagonist (drinking tea from a cup) + 2–4 small loops **taken from that era's own visual motifs** — cave animals running in "two alternating poses" (the animated version of cave paintings' many legs showing running), the Egyptian scarab pushing the sun, the Greek meander band scrolling, the Roman volcano smoking, Gothic gold-leaf highlights, the Renaissance ornithopter, the ukiyo-e great wave, Van Gogh's starry sky swirling, the Bauhaus pointer, pop art's four panels swapping colors.
→ Method: for each segment list "this era's 3 most recognizable formal elements" and make them move. The motion must be visible within the time on screen (short segments need a fast rhythm).

**3. Transition = the next era's signature language.** Entering Egypt, stone blocks / tapestry drop; Greece, a vase rotates like a cylinder to a new face; Rome, mosaic tiles flip; Gothic, a parchment page turns; Renaissance, divine light; ukiyo-e, the great wave of Kanagawa sweeps across; Impressionism, stroke color dots fill the frame; Van Gogh, a starry swirl; Art Nouveau, gold-edged organic shapes grow; Cubism, geometric shards; Bauhaus, red-yellow-blue geometry rotates and zooms; pop, lightning + halftone; 8-bit, pixelation; ray tracing, green wireframe → scanline render; 2026, a three-color concentric-ring iris.
→ Method: don't pick a generic transition from a library; grow it out of "the new style's most recognizable formal element". The first frame of each transition gets a camera punch (scene layer scaled to 1.03, returning to 1.0 over about 20 frames, the year plate not scaled) — that jolt on the beat comes from it.

**4. Accelerating on a beat grid.** 128 BPM throughout, with the number of eighth notes per segment decreasing: 6 → 4×5 → 3×4 → 2×3 → 1×3 → lengthening to 9+ at the end. The tempo doesn't change, but it sounds and looks more and more urgent; the last segment is lengthened to leave room for the gag. Transition durations shrink along with it (0.4s → 0.13s), and so does the year roll (0.55s → 0.07s).
→ Method: list the duration you want for each segment, round to eighth notes, then adjust overall into a regular decrease. Every cut, music onset and sound effect lands on the grid.

**5. One continuous narrative anchor + a character gag at the end.** The year counter is the only continuous thing in the whole film: its value depends only on global time, and during transitions the old and new layers show the same rolling number, each in its own font (40,000 BC cave handwriting → 1350 BC reed pen → … → 2026 geometric sans). At the end the characters get a gag (the cat pats the cup three times and pushes it off the table, the girl gasps, the signature is written), fully acted with anticipation, squash and stretch, follow-through and secondary motion — the first 11 seconds are for "watching", these 4 seconds are for "laughing", and the laugh is what makes people share it.

## Additions (migration tests A–D, 2026-10-04)

- **The protagonist's action is continuous across segments**: the narrative anchor isn't only the counter — the protagonist's action also follows whole-film time; if each segment restarts the action, the audience sees "lifting the cup five times" rather than "the same instant in five styles".
- **When the counter shows years, segments must be in chronological order**; if they can't be reordered, switch the corner badge to a sequence number or style name (the engine's corner badge is pluggable). Hard-cut between old and new badges at the transition's midpoint to avoid overlapping text.
- **When the first segment has no transition to borrow, let the painting "draw itself"** (strokes written out, print colors laid down plate by plate, pixels lighting up row by row).
- **The more complex the signature transition, the longer it lasts**: the original's shapes are simple, so 0.4s is enough; gold leaf, color bands and ribbons need 0.48–0.5s.

## Using it for a different topic

| Layer | This film | For "100 years of one city" it could be |
|---|---|---|
| Skeleton | Window/table/cat/person | The same street corner: streetlight, shop sign, passers-by, skyline |
| Living painting | Small loops of era motifs | Each era's vehicles driving past, sign typography flickering, things in the sky (kite → airplane → drone) |
| Transition | The next era's signature language | The next era's medium: film burn, TV static, pixels, scanlines |
| Beat | 128 BPM, decreasing | Same |
| Anchor + gag | Year counter + cat patting the cup | Year counter + the same pigeon stealing food in every era |

## Don't learn it wrong

- Don't treat "16 eras" as a quota. The speedrun/time-travel mechanism is "the style changes, the skeleton doesn't", and it holds with 3 eras too; it isn't the mechanism for every topic.
- Don't recreate the original pixel for pixel. Recreating is a way to learn the mechanism; the deliverable is your version after understanding it (Huashu chose a blonde girl + an orange-and-white cat, swapping the characters on the original's skeleton).
