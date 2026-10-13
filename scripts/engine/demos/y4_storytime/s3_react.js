// S3 big reaction close-up: smash cut in, dead-fish eyes, not a word. The whole segment is silence — the laugh is in the "pause".
// Motion: smash rebound (in the transition), a very slow 6% push, a reflection sweeping across the lenses, a sweat drop sliding down, one slow blink, the background vignette breathing, a twitch at the corner of the mouth.
(() => {
const S = STORY, C = S.C, W = 1920, H = 1080;
const { clamp } = U;
SCENES['s3_react'] = {
  draw(c, lt, t) {
    const ts = MO.step(t, 24);
    const lts = ts - 4.4;                               // local to this segment (after stepping)
    // Void background: solid color + vignette (reaction shots remove the environment, leaving only the face)
    c.fillStyle = C.void; c.fillRect(0, 0, W, H);
    const vg = c.createRadialGradient(960, 560, 200, 960, 560, 1100); vg.addColorStop(0, 'rgba(255,255,255,0.10)'); vg.addColorStop(1, 'rgba(0,0,0,0.35)');
    c.fillStyle = vg; c.fillRect(0, 0, W, H);
    // Focus lines (very faint, rotating very slowly): the manga symbol for "frozen"
    c.save(); c.translate(960, 560); c.rotate(t * 0.04); c.strokeStyle = 'rgba(255,255,255,0.07)'; c.lineWidth = 6;
    for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; c.beginPath(); c.moveTo(Math.cos(a) * 640, Math.sin(a) * 640); c.lineTo(Math.cos(a) * 1300, Math.sin(a) * 1300); c.stroke(); }
    c.restore();
    const zoom = 1 + 0.06 * Math.min(1, lt / 1.2);
    CAM.with(c, { x: 960, y: 560, z: zoom }, c => {
      const R = 360;
      const blink = (lts >= 0.62 && lts < 0.62 + 0.125) ? 1 : 0;            // slow blink: 3 frames @24fps (one frame longer than usual, reads as "speechless")
      const twitch = lts > 0.78 ? 'worry' : 'blank';                         // 0.15s after the second cricket chirp the brows drop (sound and picture telling the same thing)
      const info = TOON.bean(c, { char: 'author', x: 960, y: 560 + R * 2.1 + 40, s: R, pose: TOON.POSES.stiff, expr: twitch, mouth: 0, blink, look: [0, 0], lw: 12 });
      // Lens reflection: a white diagonal band sweeping from left to right (0.15–0.45s)
      const g = MO.at(lts, 0.15, 0.3);
      if (g > 0 && g < 1) {
        const hy = info.head[1];
        for (const sx of [-1, 1]) { const gx = 960 + sx * R * 0.37, gy = hy + R * 0.2, gr = R * 0.27;
          c.save(); c.beginPath(); c.arc(gx, gy, gr - 4, 0, Math.PI * 2); c.clip();
          const bx = gx - gr * 1.6 + g * gr * 3.2; c.fillStyle = 'rgba(255,255,255,0.85)';
          c.beginPath(); c.moveTo(bx - 30, gy - gr); c.lineTo(bx + 20, gy - gr); c.lineTo(bx - 40, gy + gr); c.lineTo(bx - 90, gy + gr); c.closePath(); c.fill(); c.restore(); }
      }
      // Sweat drop: at the temple, sliding down for 0.9s from 0.35s
      const sw = MO.at(lt, 0.35, 0.9);
      if (sw > 0) TOON.sweat(c, 960 + R * 0.88, info.head[1] - R * 0.1, 34, MO.expoOut(sw) * 0.6 + sw * 0.4);
    });
  },
};
})();
