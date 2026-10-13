// Shared by this y4 film: colors, pose timeline (pose-to-pose + pose-change rebound), blinking, subtitles.
// Libraries used: TOON (bean Huashu, poseAt, blinkAt, alive, mouth shapes reading VO_ENV), TY.text (subtitles), CAM (camera), MO (stepping, springs).
(() => {
const S = window.STORY = {};
// Background with lowered saturation and contrast, thinner and grayer lines; character lines darkest and thickest — the eye always lands on the character first
S.C = { wall: '#DCE9EC', wall2: '#CFE0E4', floor: '#E8DCC8', desk: '#E2C29B', deskSide: '#CDA97F', bgLine: '#5B6470', line: '#1B1B1F',
  sky: '#BFE3F5', cloud: '#FFFFFF', laptop: '#C9CDD6', screen: '#20222D', glow: 'rgba(120,200,255,0.35)', void: '#3D405B' };
S.bgLW = 3;
// Voiceover timing (seconds, film time): matches the placement in shared/audio/build_y4.py
S.LINES = [[0.12, 2.0, 'The first time I had AI write code for me,'], [2.13, 4.40, 'it gave me three thousand lines in one go.'], [5.75, 8.75, 'I asked it: all this… where do I paste it?']];   // subtitles change on the same frame as the shot cuts

// Pose timeline: keys = [[t, poseName, expr], ...] (film time). A pose change = TOON.poseAt: arms snap in 0.1s, the body squashes 7% then springs back
S.poseAt = TOON.poseAt;
// Blinking: a fixed schedule ("random" intervals of 2.4–3.6s hard-coded), eyes closed 2 frames @24fps ≈ 0.083s
S.blinkAt = (t, extra = []) => TOON.blinkAt(t, [0.9, 3.4, 6.1, ...extra]);
// While talking, the head nods gently with syllables + breathing (1.6s period, ±1.2%)
S.alive = TOON.alive;

// Subtitles (Chinese platforms need them burned in; native YouTube storytime doesn't burn them in, relying on CC): white text with a black outline, whole lines cutting in and out, no tricks
window.GLOBAL_OVERLAY = (c, t) => {
  for (const [a, b, s] of S.LINES) if (t >= a && t < b) {
    TY.text(c, s, 960, 1022, { size: 50, fam: 'PuHui-Bold', color: '#fff', stroke: '#1B1B1F', strokeW: 10, track: 1 });
  }
};
})();
