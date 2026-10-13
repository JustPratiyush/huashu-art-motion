# 05 · Rhythm and music

Breakdown method and reusable rules: `style-recipes/_soundtrack-art-history-speedrun.md` (section 5, "Reusable rules", can be copied directly); synthesis script template (original example score): `scripts/audio/synth_art_history_speedrun.py`.

## Key points

1. **Set a BPM grid first; picture and music both land on the grid.** 128 BPM, eighth note 0.234s, suits speedruns/montages. `eighths` in `eras.js` is how many eighth notes each segment takes.
2. **Accelerate by shortening segments, not by raising the tempo.** 6 → 4×5 → 3×4 → 2×3 → 1×3 → lengthen at the end.
3. **One three-note motif, played in each segment on that style's representative instrument, transposed with the chords.** A four-chord loop is enough harmony.
4. **Hard onsets between segments: no crossfades, no whooshes.**
5. **Ending sound effects: stop — suspend — smash — react — close** (ting → slide-whistle fall → shatter → meow → low pluck), timed to the frames of picture events.
6. **Loudness**: match the reference film's integrated LUFS and true peak; compare relative differences per segment.
7. Treat an omni-modal model's listening as candidates only: instruments are trustworthy, but BPM, the number of notes in the motif and sound-effect timings must be checked against onset detection.

## Syncing with the picture

- Transition start = a grid point; the camera punch (scene layer 1.03 → 1.0, 20 frames) lands on the same point, so the audible "click" and the visual jolt are one and the same.
- Action frames of the ending performance (the 3 cup pats, the cup hitting the floor) align with audio onsets within 3 frames.
- Without a reference film: write the segment table first (how many eighths per segment), then generate the picture timeline and the music together; later rhythm changes touch only `eighths`, in one place.
