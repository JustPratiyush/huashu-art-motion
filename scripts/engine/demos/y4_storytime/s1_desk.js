// S1 medium shot: Huashu sitting behind the desk talking to camera. Voiceover: "The first time I had AI write code for me,"
// Motion: mouth shapes (voiceover envelope, on twos), nodding while talking, breathing, pose-change rebound (talk → point), eyes following the hand, blinking, clouds outside the window, slow camera push + slight drift.
// The room, desk and laptop are all in world.js (S4/S5 are the same room with a different camera).
(() => {
const S = STORY;
const KEYS = [[0, 'talk', 'happy'], [1.12, 'point', 'talk']];
SCENES['s1_desk'] = {
  draw(c, lt, t) {
    const ts = MO.step(t, 24);                                     // the character runs at 24fps (Flash's default frame rate), the camera smooth at 60fps
    const zoom = 1.01 + 0.035 * MO.expoOut(Math.min(1, lt / 2.0)) + 0.03 * (1 - MO.expoOut(Math.min(1, lt / 0.5)));   // opening settles 1.04→1.01, then a slow 3.5% push
    const [dx, dy] = CAM.drift(t, 4, 1);
    CAM.with(c, { x: 900 + dx, y: 520 + dy, z: zoom }, c => {
      const st = S.poseAt(KEYS, ts), al = S.alive(ts, 165);
      S.world(c, t, { pose: st.pose, expr: st.expr, mouth: TOON.mouth(t), blink: S.blinkAt(ts), look: ts > 1.12 ? [1, 0] : [0, 0], squash: st.squash * al.breathe, bob: al.bob, tilt: ts > 1.12 ? 0.05 : -0.03 });
    });
  },
};
})();
