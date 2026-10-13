// Sample · story-driven stick-figure character (storytime) "The first time I had AI write code for me" (8.75 seconds, five shots). Grammar card: references/animation-grammars/y4_storytime.md
//   Preview index.html?film=demos/y4_storytime   Render render.py --film demos/y4_storytime --out y4.mp4 (voiceover track supplied separately; mouth shapes read the envelope in vo_env.js)
// Shots cut with the voiceover (not the beat): one voiceover line ≈ one shot, with reaction shots placed in the "silence" between two lines.
window.PUNCH = 0;                    // storytime doesn't hit music beats
window.FILM_DURATION = 8.75;
window.SCENE_LIBS = ['demos/y4_storytime/vo_env.js', 'demos/y4_storytime/story.js', 'demos/y4_storytime/world.js'];
window.SCENE_DIR = 'demos/y4_storytime';
window.ERAS = [
  { id: 's1_desk', dur: 2.0 },                                                  // medium shot: talking to camera
  { id: 's2_screen', dur: 2.4, transition: { type: 'whip', dur: 0.26, dir: 1 } }, // whip pan → screen (over the shoulder). Whip in the breath between two lines, never mid-sentence
  { id: 's3_react', dur: 1.2, transition: { type: 'smash', dur: 0.32 } },        // smash cut → big reaction close-up (silence)
  { id: 's4_wide', dur: 1.65, transition: { type: 'cut', dur: 0.02 } },          // hard cut → wide shot of the same room
  { id: 's5_close', dur: 1.5, transition: { type: 'cut', dur: 0.02 } },          // jump in → close shot, the punchline + hold
];
