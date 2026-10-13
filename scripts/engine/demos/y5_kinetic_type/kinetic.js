// Shared by this y5 film: beat grid, colors, type-size scale, beat micro-punch, progress track (the film's only continuous narrative anchor), background dot grid.
// Every "landing" is written as a beat number: b(4) = beat 4 = 2.0s. 120 BPM: one beat 0.5s, an eighth 0.25s.
// Libraries used: TY (slam, rise mask, keyword emphasis, marker highlighter, underline), CAM (with, drift), MO (springHz, beat numbers).
(() => {
const { clamp, lerp } = U;
window.BPM = 120;
const K = window.KT = {};
K.b = n => MO.beat(n, 120);                           // beat → seconds
const C0 = K.C = { ink: '#111111', paper: '#F4EFE6', yellow: '#FFD23F', coral: '#FF5A36', navy: '#14213D', blue: '#3A86FF', green: '#2BB673', white: '#FFFFFF', code: '#1B1D29' };
// Type-size scale: main word : supporting line : label ≈ 3.4 : 1 : 0.4 (the main word must be read at a glance; the supporting line syncs with the ear)
K.SZ = { hero: 340, sub: 96, label: 40 };
// Beat micro-punch: every quarter-note beat scales the picture up 1.2%, decaying over 0.12s (e^-25t) — the picture "breathes" with the drums
K.bump = t => { const ph = t % 0.5; return 1 + 0.012 * Math.exp(-ph * 25); };
// Background dot grid: panning slowly on a diagonal at 36px/s (continuous motion, low contrast 8%, not competing with the text)
K.dots = (c, t, col, alpha = 0.1) => {
  const g = 64, ox = (t * 36) % g, oy = (t * 18) % g;
  c.save(); c.globalAlpha = alpha; c.fillStyle = col;
  for (let y = -g; y < 1080 + g; y += g) for (let x = -g; x < 1920 + g; x += g) { c.beginPath(); c.arc(x + ox, y + oy, 4, 0, Math.PI * 2); c.fill(); }
  c.restore();
};
// Progress track: three cells at the top right, drawn on the fixed layer (GLOBAL_OVERLAY), not pushed away with the pages (revision: the first version drew it in each segment, and it jumped along with page pushes).
// Colors change on the transition's "reveal" frame (2.0 / 4.0 / 6.0s), with the lit cell lighting up on the same frame.
K.STAGES = [2.0, 4.0, 6.0];
K.trackCol = t => t < 4.0 ? [C0.white, 'rgba(255,255,255,0.35)'] : t < 6.0 ? [C0.yellow, 'rgba(255,255,255,0.25)'] : [C0.coral, 'rgba(17,17,17,0.18)'];
window.GLOBAL_OVERLAY = (c, t) => {
  if (t < 2.0) return;
  const [col, dim] = K.trackCol(t), a = MO.expoOut(clamp((t - 2.0) / 0.3));
  c.save(); c.globalAlpha = a;
  for (let i = 0; i < 3; i++) {
    const x = 1520 + i * 120, y = 92, on = t >= K.STAGES[i], fill = on ? MO.expoOut(clamp((t - K.STAGES[i]) / 0.3)) : 0;
    c.fillStyle = dim; c.fillRect(x, y, 100, 10); c.fillStyle = col; c.fillRect(x, y, 100 * fill, 10);
    TY.text(c, '0' + (i + 1), x, y - 18, { size: 30, fam: 'PuHui-Bold', color: on ? col : dim, align: 'left', track: 2 });
  }
  c.restore();
};
// Giant background stage number (900px, low contrast, drifting slowly on a diagonal): the number is one of the chapter's stars, but doesn't compete with the main word (revision: review said 01/02/03 were too small and had receded into decoration)
K.bigNum = (c, t, s, t0, x, y, col) => {
  const lt = t - t0; if (lt < 0) return;
  const k = MO.springHz(lt, 2.0, 8), sc = lerp(1.35, 1, k);
  TY.text(c, s, x + lt * 14, y - lt * 10, { size: 900, fam: 'PuHui-Black', align: 'right', color: col, scale: sc, alpha: clamp(lt / 0.08), ox: x - 250, oy: y - 320 });
};
// Keyword: first rises out of a slot, then on the "emphasis beat" scales up 1.35× and pins, with the highlighter scaling along (TY.keyword / TY.keywordMarker)
K.key = TY.keyword;
K.keyMarker = TY.keywordMarker;
// The main word "slams" in: shrinking from 1.7× to 1 (spring 2.2Hz/10, overshoot ≈8%), transparent → opaque over the first 0.06s (TY.slam)
K.slam = (c, s, x, y, t, t0, o = {}) => TY.slam(c, s, x, y, t - t0, { size: K.SZ.hero, ...o });
// Camera: slight drift + very slow rotation (±0.5°) + beat micro-punch
K.cam = (c, t, fn, extra = {}) => {
  const [dx, dy] = CAM.drift(t, 5, 2);
  CAM.with(c, { x: 960 + dx + (extra.x || 0), y: 540 + dy + (extra.y || 0), z: K.bump(t) * (extra.zoom || 1), r: 0.009 * Math.sin(t * 0.8) + (extra.rot || 0) }, fn);
};
})();
