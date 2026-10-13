// t3 · finance chart: "5-year revenue growth and share price of a fictional AI company" (all data fictional, every shot marked "Illustrative data" in the corner)
// Shot 1 (2.8s): layout first (red top rule + small red flag + title + unit) → grid drawn from left to right (zero line darkest) → bars grow from 0 one by one with values counting in sync →
// highlight the last bar (the others turn gray) → annotate "8.7×". This file also holds t3's shared layout and data (window.T3).
(() => {
const { clamp, lerp, rng } = U;
const W = 1920, H = 1080;
// Colors: The Economist chart palette (2017 chart style guide)
const COL = { red: '#E3120B', blue: '#006BA2', blue2: '#3EBCD2', grey: '#758D99', dim: '#C6D2D8', ink: '#0C0C0C', sub: '#4F5B61', grid: 'rgba(12,12,12,0.13)', bg: '#FFFFFF', up: '#E3120B', down: '#1B9E5A', gold: '#EBB434' };
const CN = '"NotoSansSC"', NUM = '"RobotoCondensed", "NotoSansSC"';
const F = { x: 170, y: 270, w: 1580, h: 610 };                            // plot area
// ---- fictional data ----
const REV = [{ y: 2021, v: 12.4 }, { y: 2022, v: 19.8 }, { y: 2023, v: 34.6 }, { y: 2024, v: 61.2 }, { y: 2025, v: 107.9 }];
// 60 monthly closes: a seeded random walk, a drawdown in 2022, a jump in 2023-03, then scaled overall to 38 → 286.4
const PRICE = (() => { const r = rng(2025), a = []; let v = 0;
  for (let m = 0; m < 60; m++) { const drift = m < 12 ? 0.02 : m < 24 ? -0.035 : m === 26 ? 0.35 : 0.045; v += drift + (r() - 0.5) * 0.11; a.push(v); }
  const e = a.map(Math.exp), k0 = e[0], k1 = e[59], out = e.map(x => 38 + (x - k0) / (k1 - k0) * (286.4 - 38));
  out[58] = 242; return out; })();                                     // last point = latest price 286.4, second-to-last monthly close = the daily-candle starting point 242 (so the numbers match across shots)
// Last 20 trading days of candles: from 242 to 286.4 (+18.3%), with ups and downs
const KL = (() => { const r = rng(77), out = []; let c = 242;
  for (let i = 0; i < 20; i++) { const tgt = 242 + (286.4 - 242) * (i + 1) / 20; const o = c; const cl = i === 19 ? 286.4 : tgt + (r() - 0.5) * 9 + (i % 5 === 3 ? -7 : 0);
    const hi = Math.max(o, cl) + 1.5 + r() * 4, lo = Math.min(o, cl) - 1.5 - r() * 4; out.push({ o, c: cl, h: hi, l: lo, vol: 0.4 + r() * 0.6 + (Math.abs(cl - o) / 10) }); c = cl; }
  return out; })();

// ---- layout (drawn in every shot): The Economist-style full-page layout CH.frame (red top rule, small red flag at the top left, title, subtitle = unit, source, illustrative-data badge) ----
const frame = (c, lt, { title, sub, source = 'Source: illustrative data; company and figures are fictional' } = {}) => CH.frame(c, lt, { title, sub, source, font: CN, red: COL.red, ink: COL.ink, subCol: COL.sub });
window.T3 = { COL, CN, NUM, F, REV, PRICE, KL, frame };

// ---- shot 1 ----
const yS = CH.lin(0, 120, F.y + F.h, F.y);
const xs = REV.map((d, i) => F.x + 130 + i * ((F.w - 330) / 4));
SCENES['t3_s1'] = {
  draw(c, lt) {
    c.fillStyle = T3.COL.bg; c.fillRect(0, 0, 1920, 1080);
    const z = 1 + 0.03 * lt / 2.8;                                       // constant slow push 1→1.03 (the usual breathing of finance-channel chart shots)
    c.save(); c.translate(960, 575); c.scale(z, z); c.translate(-960, -575);
    frame(c, lt, { title: 'DeepCalc Tech: revenue up nearly 9× in five years', sub: 'Annual revenue, ¥100M' });
    CH.grid(c, F, [0, 30, 60, 90, 120], yS, MO.seg(lt, 0.25, 0.85), { col: COL.grid, zeroCol: COL.ink, font: `400 30px ${NUM}`, labelCol: '#5b666b', side: 'right', lw: 1.5, zeroLw: 3 });
    CH.xLabels(c, REV.map((d, i) => ({ x: xs[i], label: String(d.y) })), F.y + F.h + 50, MO.seg(lt, 0.45, 1.0), { font: `400 32px ${NUM}`, col: '#3a4246' });
    const hiP = MO.smooth(MO.seg(lt, 1.95, 2.35));
    const tops = CH.bars(c, REV.map((d, i) => ({ x: xs[i], v: d.v })), yS, 150, MO.seg(lt, 0.65, 1.95),
      { lag: 0.22, col: COL.blue, hi: lt > 1.95 ? 4 : -1, hiP, hiCol: COL.blue, dimCol: COL.dim, fmt: v => v.toFixed(1), font: `600 34px ${NUM}`, labelCol: COL.ink });
    // Annotation: next to the last bar, dot → leader line → two lines of text (number first, comparison second)
    CH.callout(c, lt, 2.15, { x: xs[4] - 75, y: tops[4][1], tx: xs[4] - 330, ty: yS(96), lines: ['8.7×', '¥10.79B in 2025 ÷ ¥1.24B in 2021'],
      col: COL.ink, dotCol: COL.red, font: `700 54px ${NUM}`, font2: `400 28px ${CN}`, align: 'right', r: 9 });
    c.restore();
  },
};
})();
