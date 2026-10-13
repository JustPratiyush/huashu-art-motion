// Sample · Kurzgesagt-style flat science explainer "How did AI learn to recognize cats?" (8 seconds, three shots). Grammar card: references/animation-grammars/y1_kurzgesagt.md
//   Preview index.html?film=demos/y1_kurzgesagt   Render render.py --film demos/y1_kurzgesagt --out y1.mp4
// Shots cut with the voiceover, dur in seconds; explainers don't use beat punches (PUNCH = 0). All camera motion is computed in the scenes by time (CAM); transitions only handle how A and B combine.
window.PUNCH = 0;
window.SCENE_LIBS = ['demos/_shared/hero.js', 'demos/y1_kurzgesagt/kurzgesagt.js'];
window.ERAS = [
  { id: 'y1_s1', dur: 2.6 },                                                                         // night hillside: 5-layer parallax slow push, the robot scanning a cat
  { id: 'y1_s2', dur: 2.7, transition: { type: 'lensReveal', dur: 1.0, lens: t => Y1.lensAt(t) } },  // diving into the lens: the camera pushes exponentially into the eye, and the next world is inside the eye
  { id: 'y1_s3', dur: 2.7, transition: { type: 'matchCut', dur: 0.9 } },                             // fill then pull out: push until the yellow output node fills the screen → pull out of a yellow eye
];
