# Soundtrack method · code-synthesized music for speedrun films (breakdown method + original example)

This page is a method distilled from one breakdown: the reference film is the 15-second *Art History Speedrun* by X user Tak (@cherry_mx_reds), whose soundtrack is itself synthesized in code. Only **how to break it down, how to write it, how to mix it** is kept here, not a note-by-note transcription of the original music.

Companion script: `scripts/audio/synth_art_history_speedrun.py`. The score is an **original example** (D minor, harmony Dm–B♭–F–C), with a section structure matching the picture's `scripts/engine/eras.js`; the instrument library and mixing chain can be reused directly — just swap in your own score.

---

## 0. The conclusion in one sentence

A speedrun short's soundtrack can be **a programmatic arrangement on a strict BPM grid**: 17 eras laid out by "number of eighth notes" (6,4,4,4,4,4,3,3,3,3,2,2,2,1,1,1,9), each section shorter than the last, creating acceleration through "shorter sections" while the tempo itself stays constant. Each section switches to that era's representative instrument, and a three-note motif, transposed with the chords, runs through the whole film. After the music stops on the grid, a string of cartoon sound effects (ting, slide-whistle fall, crash, meow, closing pluck) delivers the ending gag.

---

## 1. How to break down a reference soundtrack

| What to measure | Method | Precision / confidence |
|---|---|---|
| Tempo and grid | superflux-style spectral flux on the STFT (hop 2.5ms), peaks as onsets, then a least-squares fit of `t = t0 + n·E` (28 onsets in total) | E = 0.23431s (eighth note) → **128.04 BPM**, grid origin t0 = 0.028s. All residuals within ±4ms — impossible for a human performance, so it's safe to conclude the music is scheduled in code |
| Era boundaries | Three-way cross-check: ① grid position; ② peaks of the MFCC novelty curve (distance between the means of 0.2s before and after); ③ peaks of the video's frame-by-frame difference | Audio boundaries (grid) and MFCC peaks differ by ≤20ms. Picture transitions lag the audio by 0–0.2s (the picture uses 0.1–0.2s wipe/morph transitions) |
| Pitch | ① Spotify basic-pitch polyphonic transcription (ONNX, temporary Python 3.11 environment); ② 85ms FFT peaks on a 16th-note grid, with a gain >6dB before vs. after the onset judged as a new note; ③ a self-written CQT semitone-energy map checked by hand | The melody's main notes are high confidence (both methods agree). Inner harmony voices and the details of the ukiyo-e and Van Gogh sections are medium confidence |
| Timbre | For each melody note, harmonic amplitudes (H1–H8, ±1.5% narrow bands) 20–220ms after the onset, then the narrow-band envelope's attack time and decay (+50/100/200ms relative to the peak) | Polyphony mixes in other voices, so harmonic ratios only indicate a tendency |
| Percussion | Energy jumps per 16th note above 6kHz (noise-like) and below 150Hz (drum-like) | High |
| Sound effects | FFT peak tracking of frequency trajectories over 13–15s in 20ms steps, aligned with events using a 2.1s picture contact sheet (one frame per 0.1s) | High |
| Loudness | ffmpeg ebur128; per section, BS.1770 K-weighted ungated mean square | Overall **-14.3 LUFS, LRA 0.9 LU, true peak -2.4 dBTP** (the often-quoted "average -16.6dB" is mean RMS, a different measure) |
| "Listening" with an omni-modal model | Have an omni-modal model listen to the whole piece, asking custom questions from a composer's point of view | Candidates only; verify each claim, see section 4 |

---


Two more lessons: timbre judgments are most reliable from "harmonic amplitudes 20–220ms after the onset + narrow-band envelope decay"; to judge "is it synthesized in code", look at three things — whether timing residuals are within ±5ms, whether the timbres are all textbook building blocks like sine/square/saw/exponential decay, and whether there's recording noise floor in the quiet parts.

---

## 2. Original example score (the `era()` blocks in the script)

Time unit is the eighth note, start = `t0 + n·E`. The motif ♪♪♩ is marked "motif".

| # | Era | Length | Instrumentation | Notes written in the example |
|---|---|---|---|---|
| 1 | Cave | 6 | Bone flute + hand drum + offbeat knocks | Descending augmented version A4–G4–D4 |
| 2 | Egypt | 4 | Harp + sistrum | Dm→B♭ broken chords; motif F5–G5–D5 |
| 3 | Greek black-figure | 4 | Lyre + double aulos | B♭ chord; D5 → F5 |
| 4 | Rome | 4 | Horn + war drum | Motif C5–D5–A4, F→C→Dm |
| 5 | Gothic | 4 | Pipe organ | Dm → Gm/D, D2 pedal |
| 6 | Renaissance | 4 | Harpsichord + bass viol | Motif B♭5–C6–G5, Gm→F |
| 7 | Ukiyo-e | 3 | Koto + taiko + hyoshigi clappers | Sixteenth-note plucking in D miyako-bushi scale (D–E♭–G–A–B♭) |
| 8 | Impressionism | 3 | Soft piano | Motif variant A5–C6–G5, Fmaj7 → B♭ → Dm9 |
| 9 | Van Gogh | 3 | Bright plucks + wind | D2 bass groove, scattered high A5/F5/D6/E5 |
| 10 | Art Nouveau | 3 | Celesta | Motif D5–E5–A4, B♭→C→Dm |
| 11 | Cubism | 2 | Piano-like struck strings | Deliberately dissonant: D–G♯–C♯ → E♭–A–B♭–E |
| 12 | Bauhaus | 2 | Marimba-like short notes + mechanical ticking | D stacked over five octaves → F/A → D |
| 13 | Pop | 2 | Drum machine + cartoon blips | Kick, offbeat claps, D/F blips |
| 14 | Pixel | 1 | Square wave | F major thirty-second-note arpeggio |
| 15 | Ray tracing | 1 | Supersaw | B♭ chord |
| 16 | Memphis | 1 | Sustained supersaw chord + kick + upward slide (the cat jumps onto the table) | C major held past the end of the section |
| 17 | 2026 | 9 | 128BPM house: four-on-the-floor kick, offbeat open hats, saw bass, square-family plucks, pad | Modulates to D major add9: F♯5 A5 D6 E6 F♯6 E6 D6 B5 A5 |

When writing your own score: first set a harmonic loop and a three-note motif, then fill in each section's "representative instrument + transposed motif" from the section table; for sections meant to "break the mold" (exotic, avant-garde), change only the mode or add a tritone, leaving rhythm and grid untouched.

---

## 3. Ending sound effects ("stop — suspend — smash — react — close")

| Event | Synthesis method (function in the script) |
|---|---|
| Music stops | The bass decays quickly over about 150ms, no hard cut |
| Paw touches the cup: "ting" | A few inharmonic 5–7kHz rings + a bit of 1.5kHz (`tink`), with a high-frequency whoosh at the same time (`swipe`) |
| Cup falling | A pure sine exponentially sliding about 1550→325Hz over 0.35s (`slide_whistle`) |
| Shattering on impact | A dull thud around 80Hz + broadband noise (centroid 5–7kHz, about 0.45s decay) + inharmonic ceramic overtones + a few small fragment clinks (`crash`) |
| Meow | Harmonic synthesis with a piecewise-linear pitch contour (up, then down) + two formants; the loudest moment in the piece (`meow`) |
| Signature appears | Two soft ~90Hz "pops" with a little sparkle (`end_thump`) |
| Close | A low pluck landing on the tonic |

All timings are aligned to picture events using the picture contact sheet (one frame per 0.1s).

---

## 4. Mixing (second half of the script, usable as-is)

1. 0.5s small-room reverb, 12ms pre-delay, 9% wet
2. Per-section low-frequency warm bed: on each section's chord root (`BED_ROOT`) lay "triangle wave + sine an octave below, 250Hz lowpass", with the level computed automatically from the relative value "floor vs. section loudness"; sections that already have enough get nothing
3. Per-section 2–6kHz dynamic EQ (`MID_ORIG`)
4. Per-section air noise above 6kHz (`HF_ORIG`)
5. Per-section K-weighted loudness matched to `target`, 4 iterations, 10ms smoothed gain to prevent zipper noise
6. Optional: a steep 15.8kHz lowpass to simulate streaming AAC
7. Overall LUFS match, then a look-ahead peak limiter

With a reference film, fill `target / MID_ORIG / HF_ORIG / LOW_FLOOR_ORIG` with values measured per section from the reference (using the methods in section 1); without one, the example's "uniform relative values" are enough.

A lesson on softening attacks: the plucked-string model's 2ms hard attack sounds too "pointy"; changing to a 10ms linear attack, with higher harmonics attacking later (×1.6 per harmonic, capped at 35ms), and halving the attack noise with a 7kHz lowpass makes the whole thing much more connected.

The example's output: 48k stereo, 15.06s, -14.0 LUFS, true peak -1.5 dBTP.

```
uv run --with numpy --with scipy --with soundfile python scripts/audio/synth_art_history_speedrun.py
```

---

## 5. Reusable rules: code-synthesized music for any animation

These can be copied directly.

1. **Set a BPM grid first, and align everything to it**. 128 BPM (eighth note 0.234s) suits "speedrun, montage" rhythms; cut points, music onsets and sound-effect hits all take `t0 + n·E`. The benefit: however the picture is cut, the music never seems messy. The reference film's timing residuals are only ±4ms, and that "machine-like precision" is itself part of the style.
2. **Accelerate by "fewer eighth notes per section", not by raising the tempo**. This film goes 6 → 4×5 → 3×4 → 2×3 → 1×3, then lengthens the last section again (9) to let the audience breathe and leave room for the gag. The tempo stays the same, yet it feels more and more urgent; and every section lands on the grid, naturally in sync with the picture's cut points. Method: list each picture section's duration, round to eighth notes, then adjust overall so the decrease is regular.
3. **One three-note motif, repeated on different instruments and transposed with the chords**. Choose a short cell with a distinct rhythm (the example score uses ♪♪♩ "step up, then leap down"), played once per scene on that era's or style's representative instrument, with pitches following the section's chord. A four-chord loop (the example uses Dm–B♭–F–C) is enough as a harmonic skeleton; for sections meant to "break the mold" (exotic, avant-garde), change only the mode or add a tritone, leaving rhythm and grid alone. You can establish it at the opening with an inversion or augmentation of the motif (the example's cave section is a descending dotted quarter).
4. **No crossfades between sections**. A new section starts hard on the grid, while the previous section's notes keep their natural tails (plucks 30–300ms, sustained notes a release of about 150ms); a held bass note can carry across sections to "stitch" them. Every scene change then has a clear "click" without breaking. There's no need for a transition whoosh in every section (the reference film has none).
5. **Design the ending sound effects as "stop — suspend — smash — react — close"**:
   - Stop: the music stops on the grid with a quick ~150ms decay, not a hard cut
   - Suspend: a little "ting" as a lead-in, followed by a slide whistle (pure sine exponential sweep, about 0.35s, a bit over 2 octaves)
   - Smash: thud + broadband noise + inharmonic overtones + a few small fragment clinks, decaying within about 0.45s
   - React: the character vocalizes, e.g., a "meow" with a piecewise-linear pitch contour, about 0.5s after the smash, the loudest moment in the piece
   - Close: one or two soft "pops" with the signature, finally a low pluck on the tonic or dominant
   All aligned by event timing from the picture contact sheet (one frame per 0.1s).
6. **Loudness matching method**:
   1. First measure the reference film's overall values (ffmpeg ebur128: integrated LUFS, LRA, true peak)
   2. Then measure per-section K-weighted loudness, plus the differences of 2–6kHz, >6kHz and the 40–220Hz floor relative to section loudness
   3. After synthesis, in order: per-section low-frequency warm bed → per-section mid-high dynamic EQ → per-section air noise → per-section iterative loudness matching (3–4 iterations, 10ms smoothed gain to prevent zipper noise)
   4. If the reference is AAC, add a 16kHz lowpass
   5. Finally match overall LUFS and apply a look-ahead peak limiter
   Use "relative to section loudness" differences throughout, never absolute values, so changing material or overall loudness doesn't require recalibration.
7. **Turning synth.py into a general template** (structure unchanged; only four blocks of data change):
   - `T0, E`: grid origin and eighth-note duration (BPM → `E = 60 / BPM / 2`)
   - `edges / target / MID_ORIG / HF_ORIG / LOW_FLOOR_ORIG / BED_ROOT`: section boundaries and per-section reference values; without a reference film, fill `target` with one uniform value (e.g., -14) and set the other three to "no compensation"
   - The `era(n0, items)` score blocks: one list per section, elements `(relative eighth position, instrument function, gain, pan)`. The instrument library (`pluck` string family, `additive` sustained family, `kick / clap / hat / taiko` drum family, `chip / supersaw` synth family) can be reused directly; a new style usually only needs `pluck`'s harmonic table and decay parameters tuned
   - Sound-effect block: call `tink / slide_whistle / crash / meow / end_thump` at event times, with parameters (frequency, duration) measured from the reference film or set yourself using the template in item 5
   Keep the second-half mixing chain (warm bed → EQ → air → loudness iteration → lowpass → limiter) as-is.
8. **Order of the analysis workflow**:
   1. Fit the grid from onset flux to get BPM and t0 first
   2. Detect new notes cell by cell with FFT on a 16th-note grid, then cross-check with basic-pitch polyphonic transcription
   3. Judge timbre from narrow-band harmonic ratios and envelopes
   4. Judge percussion from high- and low-frequency energy jumps
   5. Treat the omni-modal model only as candidates and verify each claim. In tests it was reliable at identifying instruments, but wrong about tempo (it said 120; measured 128), the number of notes in the motif, "transition whooshes", and sound-effect timings
