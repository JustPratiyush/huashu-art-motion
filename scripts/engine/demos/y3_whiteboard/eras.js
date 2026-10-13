// Sample · hand-drawn whiteboard explainer (RSA Animate type) "How did AI learn to recognize cats?" (8 seconds, three shots). Grammar card: references/animation-grammars/y3_whiteboard.md
//   Preview index.html?film=demos/y3_whiteboard   Render render.py --film demos/y3_whiteboard --out y3.mp4
// One big whiteboard = the world, the camera moving over the board; the three segments are the same picture function (DG.board's stroke timeline); segments exist only for qa's shot breakdown.
window.PUNCH = 0;
window.SCENE_LIBS = ['demos/_shared/hero.js', 'demos/y3_whiteboard/whiteboard.js'];
window.ERAS = [
  { id: 'y3_s1', dur: 2.5 },                                                  // draw a cat, write "Cat?", write the question
  { id: 'y3_s2', dur: 2.25, transition: { type: 'same', dur: 0.8 } },         // whip pan (0.8s with motion blur, pen never leaves the board)
  { id: 'y3_s3', dur: 3.25, transition: { type: 'same', dur: 0.85 } },        // smooth move over the board → draw Huashu, "A cat!" → pull back to see the whole picture
];
