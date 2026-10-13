// Sample · Vox-style collage explainer "How did AI learn to recognize cats?" (8 seconds, three shots). Grammar card: references/animation-grammars/y2_vox.md
//   Preview index.html?film=demos/y2_vox   Render render.py --film demos/y2_vox --out y2.mp4
// One big desktop = the world; the camera pushes and moves smoothly at 60fps, while paper scraps / highlighter / red pen / typing on the desk step at 12fps.
window.PUNCH = 0;
window.SCENE_LIBS = ['demos/_shared/hero.js', 'demos/y2_vox/vox.js'];
window.ERAS = [
  { id: 'y2_s1', dur: 2.6 },                                                 // clipping + halftone photo: highlighter sweeping a line, red pen circling a word, camera pushing slowly
  { id: 'y2_s2', dur: 3.3, transition: { type: 'same', dur: 1.1 } },         // panning along the red string to the investigation wall (same desktop, camera moving continuously)
  { id: 'y2_s3', dur: 2.1, transition: { type: 'cut', dur: 1 / 60 } },       // push until the small photo fills the frame → hard cut to a large scan of the same image, then pull out to reveal the black-background collage
];
