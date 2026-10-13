# 01 · Breakdown: take an animation and break it down into codeable specs within an hour

The goal isn't a viewing review; it's to produce **specs you can program from directly**: each segment's start and end frames, transition mechanisms and parameters, the list of in-shot actions, the value curves of counters/subtitles, composition coordinates, and the soundtrack's grid and instrumentation. Text is the index; numbers and contact sheets are the body.

First real use: on 2026-10-04, breaking down the 15-second "Art History Speedrun" on X (16 art eras, 15 transitions); the whole process took about 1.5 hours (storyboard agent 79 minutes, soundtrack agent 22 minutes, in parallel).

## 1. Get the physical parameters first (5 minutes)

```sh
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate,sample_rate -of default=nw=1 src.mp4
```
For X videos, take the highest tier from the syndication endpoint (pick the highest bitrate in `video_info.variants`); don't screen-record. If the original is 60fps, break it down at 60fps; frame numbers are the common language of every later spec (seconds = frame/60).

## 2. Three overview images (10 minutes)

1. **Contact sheet**: 4fps × 480 wide, 30 frames per sheet, timestamped. One look tells you how many segments there are and what each is.
2. **Keyframe overview**: pick the cleanest full frame of each segment and assemble them into a 4×5 grid. The map for all later work.
3. **Spectrogram**: `ffmpeg -lavfi showspectrumpic=s=1600x400:legend=1`. At a glance: whether the music changes instrumentation per segment, whether there's a falling slide, shattering transients, beats. Clean harmonics and a sharp cutoff at 16kHz = synthesized in code + AAC.

## 3. Measure transitions and rhythm (15 minutes)

**Per-frame grayscale difference**: shrink to 192×108 grayscale and take the mean absolute difference between adjacent frames. Static stretches <2, transitions 10–37. Threshold 5 + 12-frame debounce finds every transition start in one pass. Save as `diff.npy` for all agents to share.

Once the starts are found, **fit a grid**: if the start intervals are integer multiples of a constant, there's a BPM grid (this film: start = 84 + 14.06·n frames, residual < 0.45 frames, = eighth notes at 128 BPM). Once the grid is confirmed, every time in picture and music is written as "eighth note number N".

**One 60fps contact sheet per transition**: starting 2 frames before the start, one frame every 2, for 0.5 seconds, 15 cells. The mechanism can only be seen here — descriptions like "8 vertical strips drop in sequence and bounce" or "20px squares flip around a vertical axis, spreading outward from the cat's position" would come out as just "square transition" from a rough 4fps sheet.

**Take the reference frame as "the last frame before the transition starts"**, not whichever frame you think looks best. Taken too early, it includes the aftermath of the previous transition (rubble) as picture content (the first Egypt version hit this).

## 4. In-shot motion: what actually moves in each segment (15 minutes)

Motion heatmap: within each segment's static interval, take the per-pixel maximum frame difference, overlay it in red on a grayscale base image, and note the "motion area fraction".

This film's conclusion overturned my first impression: I thought "each segment is just one painting", but in fact 2.5%–34% of each segment's area moves — cave animals running in two alternating poses, a scarab pushing the sun ball, a meander band scrolling, Vesuvius smoking, a highlight sweeping across gold leaf, an ornithopter flying past, a four-panel grid swapping colors… **If you start building without this step, you'll make "transitions between images" and lose the continuous motion inside the scenes.**

The heatmap tells you "where things move"; then go to the 60fps frames to see "how they move" (period, amplitude, alternating two frames or continuous).

## 5. How to brief agents when dividing the work

- Run the storyboard agent and the soundtrack agent in parallel, each with a complete brief: asset paths, known facts (frame rate, duration, a rough segment table), the outputs wanted (storyboard.md / spec.json / contact-sheet folder / soundtrack-breakdown.md / synthesis script), method requirements (prove it with data, not imagination), reply format (summary + the 3 least certain points).
- Have them **correct your list first**. In this film I mistook "the 1993→2026 iris transition" for a "Memphis era"; the storyboard agent corrected it in its first point.
- Treat an omni-modal model "listening" to the soundtrack as candidates only: its instrument judgments are trustworthy, but the BPM (reported 120, actually 128), the number of notes in the motif, and "a whoosh at every segment" were all wrong and had to be checked against onset detection.

## 6. Output list (what you should have when done)

| Output | Use |
|---|---|
| `storyboard.md` + `spec.json` | Each segment's start/end frames, transition mechanism parameters, in-shot actions, counter curves, composition coordinates |
| `transitions/T*.jpg` (60fps contact sheets) | Frame-by-frame reference while writing transition code |
| `in-shot-motion/motion-heatmap.jpg` | What moves in each segment, and how much |
| `ending-action/` (if there's character acting) | Per-frame centroids, trajectories, physics parameters (gravity px/frame²) |
| `soundtrack-breakdown.md` + `synth.py` (template: `scripts/audio/synth_art_history_speedrun.py`) | BPM grid, eighth notes per segment, motif, instrumentation, sound-effect sequence |
| `keyframes-overview.jpg` + `imagegen/ref/*.png` | Composition map, reference frame per segment |

Scripts: `scripts/analyze/` (contact sheets, grayscale difference, transition contact sheets, motion heatmaps); commands are in each script's docstring.
