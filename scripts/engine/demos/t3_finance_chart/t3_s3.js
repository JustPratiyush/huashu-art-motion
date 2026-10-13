// t3 · shot 3 (2.5s; the first 0.6s is the transition "pushing in" from the previous shot's latest point): the last 20 trading days of candles.
// Price-area grid first → candles grow one by one (red up, green down, the China A-share convention) with volume in sync → the price at the top right rolls with the latest candle → starting-point reference dashed line + period-gain annotation → hold 0.75s.
// (The 5-day moving average was removed after review: candles + moving average + volume + bracket note can't all be read in 2 seconds)
(() => {
const { clamp, lerp } = U;
const W = 1920, H = 1080;
const L = (() => {
  const { F, KL } = T3;
  const lo = Math.min(...KL.map(k => k.l)), hi = Math.max(...KL.map(k => k.h));
  const ticks = CH.ticks(lo - 4, hi + 4, 4), y0 = ticks[0], y1 = ticks[ticks.length - 1];
  const PB = F.y + F.h * 0.74;                                           // bottom of the price area
  const yS = CH.lin(y0, y1, PB, F.y + 10);
  const xs = KL.map((_, i) => F.x + 40 + i * ((F.w - 330) / 19));
  return { ticks, yS, xs, PB, VB: F.y + F.h, VT: F.y + F.h * 0.8 };
})();
SCENES['t3_s3'] = {
  focus: [L.xs[19], L.yS(286.4)],
  draw(c, lt) {
    const { COL, CN, NUM, F, KL, frame } = T3;
    c.fillStyle = COL.bg; c.fillRect(0, 0, 1920, 1080);
    const z = 1 + 0.03 * lt / 2.5;                                       // constant slow push 1→1.03
    c.save(); c.translate(960, 575); c.scale(z, z); c.translate(-960, -575);
    frame(c, lt + 0.6, { title: 'Last 20 trading days: up 18.3%', sub: 'Daily candles, ¥ · red up, green down (A-share convention) · y-axis does not start at 0' });
    const PF = { x: F.x, y: F.y, w: F.w, h: L.PB - F.y };
    CH.grid(c, PF, L.ticks, L.yS, MO.seg(lt, 0.1, 0.6), { col: COL.grid, zeroCol: COL.grid, font: `400 30px ${NUM}`, labelCol: '#5b666b', side: 'right', lw: 1.5 });
    // Volume-area baseline
    c.fillStyle = COL.ink; c.fillRect(F.x, L.VB - 1, F.w * MO.quintOut(MO.seg(lt, 0.1, 0.6)), 2);
    c.save(); c.font = `400 26px ${CN}`; c.fillStyle = '#7c868b'; c.textAlign = 'right'; c.globalAlpha = MO.seg(lt, 0.3, 0.6); c.fillText('Volume', F.x + F.w, L.VB - 14); c.restore();   // placed in the empty bottom-right corner, not over the candles
    // Candles + volume: one by one (lag 0.06), 0.2–1.3s
    const kp = MO.seg(lt, 0.2, 1.3);
    CH.candles(c, KL, L.xs, L.yS, 30, kp, { up: COL.up, down: COL.down, lag: 0.06 });
    const VMAX = Math.max(...KL.map(k => k.vol));
    KL.forEach((k, i) => { const q = MO.quintOut(MO.lagged(i, 20, kp, 0.06)); if (q <= 0) return;
      const h = (L.VB - L.VT - 6) * k.vol / VMAX * q;                   // normalized by the max volume, so volume bars don't reach the price area
      c.fillStyle = k.c >= k.o ? 'rgba(227,18,11,.35)' : 'rgba(27,158,90,.35)'; c.fillRect(L.xs[i] - 15, L.VB - h, 30, h); });
    // Price at the top right: rolls with "the latest candle to appear"; up/down color = relative to the period start
    let n = 0; for (let i = 0; i < 20; i++) if (MO.lagged(i, 20, kp, 0.06) > 0) n = i;
    const qn = MO.quintOut(MO.lagged(n, 20, kp, 0.06)), v = lt < 0.2 ? 242 : lerp(KL[n].o, KL[n].c, qn), pct = (v / 242 - 1) * 100;
    c.save(); c.textAlign = 'right'; c.textBaseline = 'alphabetic'; c.font = `700 76px ${NUM}`; c.fillStyle = pct >= 0 ? COL.up : COL.down;
    TY.tabular(c, '¥' + v.toFixed(2), W - 80, 150, { align: 'right' });
    c.font = `700 40px ${NUM}`; TY.tabular(c, (pct >= 0 ? '▲ +' : '▼ ') + pct.toFixed(1) + '%', W - 80, 205, { align: 'right' }); c.restore();
    // Starting-point reference dashed line + period-gain bracket
    const rp = MO.quintOut(MO.seg(lt, 1.35, 1.75));               // lands at 1.75s, holds 0.75s for reading
    if (rp > 0) { const y = L.yS(242); c.save(); c.setLineDash([10, 8]); c.strokeStyle = COL.sub; c.lineWidth = 2; c.beginPath(); c.moveTo(L.xs[0], y); c.lineTo(lerp(L.xs[0], L.xs[19] + 60, rp), y); c.stroke(); c.setLineDash([]);
      const x = L.xs[19] + 60, yt = L.yS(286.4); c.strokeStyle = COL.up; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x, lerp(y, yt, rp)); c.stroke();
      c.globalAlpha = MO.seg(lt, 1.5, 1.8); c.font = `700 40px ${NUM}`; c.fillStyle = COL.up; c.fillText('+18.3%', x + 14, (y + yt) / 2 + 14);
      c.font = `400 26px ${CN}`; c.fillStyle = COL.sub; c.textAlign = 'right'; c.fillText('Period start ¥242', x - 14, y + 32); c.restore(); }
    c.restore();
  },
};
})();
