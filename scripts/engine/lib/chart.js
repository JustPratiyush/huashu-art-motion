// Data chart animation CH: scales, nice ticks, grids (first), bars (growing from 0), lines (drawn by time, with a head dot), candlesticks (one by one),
// annotations (dot → leader → text), Economist-style layout (thin red line at the top + small red tag + title + unit subtitle + source note + "illustrative data" badge).
// Iron rule of order (accuracy + readability): axes first → data after → annotation last, one thing labeled per shot; bar charts must have a 0 baseline (if the y-axis doesn't start at 0, say so in the subtitle);
// animation only changes "how it appears", never the values; units go in the subtitle; fictional/illustrative data is marked in a corner of every shot.
(() => {
let W = 1920, H = 1080; U.onStage((w, h) => { W = w; H = h; });   // canvas size follows U.setStage (default 1920×1080)
const { clamp, lerp } = U;
const CH = window.CH = {};
const seg = (t, a, b) => clamp((t - a) / (b - a));

// Linear scale: value → screen; f.inv for the inverse
CH.lin = (d0, d1, r0, r1) => { const f = v => r0 + (v - d0) / (d1 - d0) * (r1 - r0); f.inv = y => d0 + (y - r0) / (r1 - r0) * (d1 - d0); return f; };
// Nice ticks at 1/2/2.5/5×10^k
CH.ticks = (min, max, n = 5) => {
  const raw = (max - min) / n, mag = Math.pow(10, Math.floor(Math.log10(raw))), steps = [1, 2, 2.5, 5, 10];
  const step = steps.map(s => s * mag).find(s => s >= raw) || 10 * mag;
  const out = []; for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(+v.toFixed(10)); return out;
};
CH.mixHex = (a, b, t) => { const A = PAINT.hex(a), B = PAINT.hex(b); return `rgb(${lerp(A[0], B[0], t) | 0},${lerp(A[1], B[1], t) | 0},${lerp(A[2], B[2], t) | 0})`; };

// ---------- grid: horizontal lines drawn one by one from left to right (staggered), the zero line darker and thicker; tick values fade in along ----------
// F = {x,y,w,h} plot area; ys = tick values; yS = value → screen y; p = 0..1
CH.grid = (c, F, ys, yS, p, { col = 'rgba(0,0,0,.14)', zeroCol = '#121212', lw = 1.5, zeroLw = 3, lag = 0.12, font = '28px sans-serif', labelCol = '#5b5b5b', fmt = v => String(v), side = 'right', labelDy = -10 } = {}) => {
  c.save(); c.font = font; c.textBaseline = 'alphabetic';
  ys.forEach((v, i) => {
    const q = MO.lagged(i, ys.length, p, lag), e = MO.quintOut(q); if (q <= 0) return;
    const y = Math.round(yS(v)) + 0.5, isZero = Math.abs(v) < 1e-9;
    c.strokeStyle = isZero ? zeroCol : col; c.lineWidth = isZero ? zeroLw : lw;
    c.beginPath(); c.moveTo(F.x, y); c.lineTo(F.x + F.w * e, y); c.stroke();
    c.globalAlpha = seg(q, 0.3, 1); c.fillStyle = labelCol;
    if (side === 'right') { c.textAlign = 'right'; c.fillText(fmt(v), F.x + F.w, y + labelDy); }
    else { c.textAlign = 'left'; c.fillText(fmt(v), F.x, y + labelDy); }
    c.globalAlpha = 1;
  });
  c.restore();
};
// x-axis labels (years etc.): fading in and rising one by one. items = [{x, label}]
CH.xLabels = (c, items, y, p, { font = '28px sans-serif', col = '#3a3a3a', lag = 0.1 } = {}) => {
  c.save(); c.font = font; c.textAlign = 'center'; c.fillStyle = col;
  items.forEach((it, i) => { const q = MO.quintOut(MO.lagged(i, items.length, p, lag)); if (q <= 0) return; c.globalAlpha = q; c.fillText(it.label, it.x, y + (1 - q) * 14); });
  c.restore();
};

// ---------- bars: growing from the 0 baseline (quintOut), value labels counting in sync with the bar tops (fixed-width digits) ----------
// data: [{x, v}]; bw bar width; p 0..1 overall progress; hi highlighted index (the rest transition to dimCol by hiP). Returns each bar top [[x,y]]
CH.bars = (c, data, yS, bw, p, { lag = 0.18, col = '#1f5c99', hi = -1, hiP = 0, hiCol, dimCol = '#b9c3cc', label = true, fmt = v => v.toFixed(0), font = '30px sans-serif', labelCol = '#121212' } = {}) => {
  const y0 = yS(0), tops = [];
  data.forEach((d, i) => {
    const q = MO.lagged(i, data.length, p, lag), e = MO.quintOut(q);
    const v = d.v * e, y = yS(v);
    let fill = col;
    if (hi >= 0) fill = i === hi ? (hiCol || col) : CH.mixHex(col, dimCol, hiP);
    c.fillStyle = fill; c.fillRect(d.x - bw / 2, y, bw, y0 - y);
    tops.push([d.x, y]);
    if (label && q > 0) {
      c.save(); c.font = font; c.textAlign = 'center'; c.fillStyle = labelCol; c.globalAlpha = seg(q, 0.05, 0.4);
      if (d.v < 0) { c.textBaseline = 'top'; TY.tabular(c, fmt(v), d.x, y + 12, { align: 'center' }); }   // negative bars: write the value below the bar bottom, not inside the bar
      else TY.tabular(c, fmt(v), d.x, y - 14, { align: 'center' });
      c.restore();
    }
  });
  return tops;
};

// ---------- lines: drawn advancing by x (time); head dot; optional area gradient; returns the head point ----------
// pts: screen coordinates (x increasing); p: 0..1 = how far along the x range to draw. area = {top, base, c0, c1}
CH.line = (c, pts, p, { col = '#e3120b', lw = 5, head = true, headR = 9, area, glow } = {}) => {
  if (p <= 0) return null;
  const xEnd = lerp(pts[0][0], pts[pts.length - 1][0], clamp(p));
  const vis = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (pts[i][0] <= xEnd) vis.push(pts[i]);
    else { const a = pts[i - 1], b = pts[i], q = (xEnd - a[0]) / (b[0] - a[0]); vis.push([xEnd, lerp(a[1], b[1], q)]); break; }
  }
  const hp = vis[vis.length - 1];
  if (area) {
    const g = c.createLinearGradient(0, area.top, 0, area.base); g.addColorStop(0, area.c0); g.addColorStop(1, area.c1);
    c.save(); c.beginPath(); c.moveTo(vis[0][0], area.base); vis.forEach(q => c.lineTo(q[0], q[1])); c.lineTo(hp[0], area.base); c.closePath(); c.fillStyle = g; c.fill(); c.restore();
  }
  c.save(); c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; c.lineCap = 'round';
  if (glow) { c.shadowColor = col; c.shadowBlur = glow; }
  c.beginPath(); vis.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.stroke(); c.restore();
  if (head && p < 1.0001) { c.save(); c.fillStyle = col; c.beginPath(); c.arc(hp[0], hp[1], headR, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#fff'; c.lineWidth = 3; c.stroke(); c.restore(); }
  return hp;
};
// The line's y at x (annotations must be pinned to the line)
CH.yAt = (pts, x) => { for (let i = 1; i < pts.length; i++) if (pts[i][0] >= x) { const a = pts[i - 1], b = pts[i]; return lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0])); } return pts[pts.length - 1][1]; };

// ---------- candlesticks: appearing one by one, bodies growing from open to close, wicks after; default red up / green down (A-share convention; for international films switch to green up / red down and say so in the subtitle) ----------
// rows: [{o,h,l,c}]; xs: each candle's center x; cw body width; p 0..1
CH.candles = (c, rows, xs, yS, cw, p, { up = '#e0322f', down = '#11a05a', lag = 0.06, hollowUp = false } = {}) => {
  rows.forEach((r, i) => {
    const q = MO.lagged(i, rows.length, p, lag); if (q <= 0) return;
    const e = MO.quintOut(seg(q, 0, 0.7)), w = MO.quintOut(seg(q, 0.35, 1));
    const isUp = r.c >= r.o, col = isUp ? up : down, x = xs[i];
    const yo = yS(r.o), yc = lerp(yo, yS(r.c), e);
    c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 2.5;
    if (w > 0) { const ym = (yo + yS(r.c)) / 2; c.beginPath(); c.moveTo(x, lerp(ym, yS(r.h), w)); c.lineTo(x, lerp(ym, yS(r.l), w)); c.stroke(); }
    const top = Math.min(yo, yc), hgt = Math.max(2, Math.abs(yc - yo));
    if (isUp && hollowUp) { c.fillStyle = '#fff'; c.fillRect(x - cw / 2, top, cw, hgt); c.strokeRect(x - cw / 2, top, cw, hgt); }
    else c.fillRect(x - cw / 2, top, cw, hgt);
    c.restore();
  });
};

// ---------- annotation: dot pops (spring) → pulse ring → leader drawn → text fades in. Time in seconds, to sync with narration ----------
// lt seconds; t0 start time; (x,y) data point; (tx,ty) text anchor; the first line of lines uses font, the rest font2 (number first, comparison after)
CH.callout = (c, lt, t0, { x, y, tx, ty, lines = [], col = '#121212', dotCol = '#e3120b', font = '600 30px sans-serif', font2, align = 'left', r = 11 }) => {
  const k = lt - t0; if (k <= 0) return;
  const s = MO.spring(k, { duration: 0.45, bounce: 0.25 });
  c.save();
  c.fillStyle = dotCol; c.beginPath(); c.arc(x, y, r * Math.max(0, s), 0, Math.PI * 2); c.fill();
  const pr = seg(k, 0, 0.6); if (pr > 0 && pr < 1) { c.strokeStyle = dotCol; c.globalAlpha = 1 - pr; c.lineWidth = 3; c.beginPath(); c.arc(x, y, r + pr * 34, 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1; }
  const lp = MO.quintOut(seg(k, 0.12, 0.45));
  if (lp > 0) { c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(lerp(x, tx, lp), lerp(y, ty, lp)); c.stroke(); }
  const fp = MO.quintOut(seg(k, 0.3, 0.7));
  if (fp > 0) {
    c.globalAlpha = fp; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'alphabetic';
    const dx = align === 'left' ? 12 : align === 'right' ? -12 : 0;
    lines.forEach((L, i) => { c.font = i === 0 ? font : (font2 || font); c.fillText(L, tx + dx + (1 - fp) * (align === 'right' ? 16 : -16), ty + 8 + i * 40); });
  }
  c.restore();
};

// ---------- layout ----------
CH.tag = (c, x, y, w = 64, h = 14, col = '#e3120b') => { c.fillStyle = col; c.fillRect(x, y, w, h); };
// "Illustrative data" badge: a rounded box at the bottom right. Every shot needs one for fictional data
CH.demoBadge = (c, text = 'Illustrative data', { x = W - 40, y = 1040, font = '600 24px sans-serif', col = '#7a7a7a', box = 'rgba(0,0,0,.06)' } = {}) => {
  c.save(); c.font = font; c.textAlign = 'right'; c.textBaseline = 'middle';
  const w = c.measureText(text).width + 28; c.fillStyle = box; c.beginPath(); c.roundRect(x - w, y - 22, w, 44, 8); c.fill();
  c.strokeStyle = col; c.globalAlpha = 0.5; c.lineWidth = 1.5; c.stroke(); c.globalAlpha = 1;
  c.fillStyle = col; c.fillText(text, x - 14, y + 1); c.restore();
};
// Economist-style full-page layout (drawn every shot): white background → thin red line drawn from the left at the top → small red tag at top left → title → subtitle (unit/measure) → source at bottom left → "illustrative data" at bottom right.
// lt = this shot's time (the layout is fully in place within 0.6s, and only then do the axes appear). Pass badge false to skip the badge (for real data).
CH.frame = (c, lt, { title, sub, source = 'Source: illustrative data', badge = 'Illustrative data', bg = '#FFFFFF', red = '#E3120B', ink = '#0C0C0C', subCol = '#4F5B61', srcCol = '#7c868b',
  font = '"NotoSansSC"', x = 90 } = {}) => {
  c.fillStyle = bg; c.fillRect(0, 0, W, H);
  const p = MO.quintOut(MO.seg(lt, 0, 0.45));
  c.fillStyle = red; c.fillRect(0, 0, W * p, 8);
  CH.tag(c, x, 56, 96 * p, 22, red);
  c.save(); c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  const tp = MO.quintOut(MO.seg(lt, 0.05, 0.5));
  c.globalAlpha = tp; c.font = `700 58px ${font}`; c.fillStyle = ink; c.fillText(title, x, 150 + (1 - tp) * 18);
  const sp = MO.quintOut(MO.seg(lt, 0.15, 0.6));
  c.globalAlpha = sp; c.font = `400 34px ${font}`; c.fillStyle = subCol; c.fillText(sub, x, 205 + (1 - sp) * 14);
  c.globalAlpha = 1; c.font = `400 26px ${font}`; c.fillStyle = srcCol; c.fillText(source, x, 1040);
  c.restore();
  if (badge) CH.demoBadge(c, badge, { x: W - 60, y: 1030, font: `700 28px ${font}`, col: red, box: 'rgba(227,18,11,0.06)' });
};
})();
