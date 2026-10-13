// Sample · kinetic typography "AI codes in 3 stages", 120 BPM, 8 seconds = 4 bars = 16 beats, then a 0.5s hold.
//   Grammar card: references/animation-grammars/y5_kinetic_type.md
//   Preview index.html?film=demos/y5_kinetic_type   Render render.py --film demos/y5_kinetic_type --out y5.mp4
// The reveal frame lands on the beat: segment start = bar line − reveal point × transition duration (MO.onBeat) —
//   fillZoom reveal point .55, dur .45 → 2.0−.25 = 1.75; bands reveal point ≈.6, dur .5 → 4.0−.3 = 3.7; push reaches 90% displacement at p≈.58, dur .35 → 6.0−.2 ≈ 5.80
window.PUNCH = 0;                    // beat punches are done by kinetic.js's own K.bump (1.2% per beat)
window.FILM_DURATION = 8.5;
window.SCENE_LIBS = ['demos/y5_kinetic_type/kinetic.js'];
window.SCENE_DIR = 'demos/y5_kinetic_type';
window.ERAS = [
  { id: 'k1_title', dur: 1.75 },
  { id: 'k2_complete', dur: 1.95,   // the charge-in point is inside the circle, avoiding the stroke of the "3" (charging into white text would be all white)
    transition: { type: 'fillZoom', dur: 0.45, k: 0.55, cx: 1075, cy: 773, maxZoom: 30, fill: '#FF5A36' } },
  { id: 'k3_chat', dur: 2.1, transition: { type: 'bands', dur: 0.5, gap: 0.12, colors: ['#FFD23F', '#FFFFFF', '#14213D'] } },
  { id: 'k4_agent', dur: 2.7, transition: { type: 'push', dur: 0.35 } },
];
