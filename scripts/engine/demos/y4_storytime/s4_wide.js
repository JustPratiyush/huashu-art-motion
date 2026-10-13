// S4 wide shot (the same room pulled back to 0.5×): a tiny Huashu sitting in a big room. Voiceover: "I asked it: all this…"
// A wide shot makes a person look small and helpless — the wide itself sets up the joke. Revision: in the two pauses, added "eyes glance at the computer, then back at the camera", and pointing at the computer when saying "all this".
// Motion: mouth shapes, eyes (glancing at the computer at 6.2 → back to camera at 6.6), pose-change rebound (talk → point), hanging lamp swinging, clouds drifting, screen light flickering, a very slow camera pull-back.
(() => {
const S = STORY;
SCENES['s4_wide'] = {
  draw(c, lt, t) {
    const ts = MO.step(t, 24);
    const zoom = 0.53 - 0.03 * MO.quintOut(Math.min(1, lt / 1.65));          // 0.53 → 0.50
    CAM.with(c, { x: 900, y: 470, z: zoom }, c => {
      const st = S.poseAt(S.KEYS_END, ts), al = S.alive(ts, 165);
      S.world(c, t, { pose: st.pose, expr: st.expr, mouth: TOON.mouth(t), blink: S.blinkAt(ts), look: S.lookEnd(ts), squash: st.squash * al.breathe, bob: al.bob, lw: 10 });
    });
  },
};
})();
