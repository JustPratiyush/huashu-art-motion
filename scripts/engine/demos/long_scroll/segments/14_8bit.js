// 21 · 1980s 8-bit pixel game (generic 8-bit grammar, not pointing at any particular game: purple night sky, pixel stars and moon, distant mountain silhouettes, fireflies, floating wooden platforms, a star block, a treasure chest).
// Interaction: he jumps and hits the star block, the block bounces and pops out a spinning pixel coin that rises to its peak, flashes and vanishes, a 100 floats up, the HUD coins go 7→8 and the score +100; he lands, looks up and does another cheering hop. All events are timed relative to the interaction.
// Technique follows the skill's scene 14_8bit: the whole world drawn pixel by pixel on a 1/8-resolution canvas (1 low pixel = 8 screen pixels), scaled up with imageSmoothing off; sky boundaries use (x+y)%2 checkerboard dithering (the NES's only way to do gradients).
// Huashu = AI-generated pixel-figure frames, which the code then downsamples to a 6px grid and binarizes the alpha of (removing anti-aliasing), guaranteeing true hard-edged pixels.
(() => {
if (!window.D4) { const x = new XMLHttpRequest(); x.open('GET', 'demos/long_scroll/lib/xing2_ding.js', false); x.send(); (0, eval)(x.responseText); }
const W = 1920, H = 1080, TAU = Math.PI * 2, { clamp, lerp, ss, ease } = U, P = PAINT;
const SW = 2000, PX = 8, LW = SW / PX, LH = H / PX, G = 760, GR = G / PX, AT = 900, DUR = 1.6;
const BX = Math.round(AT / PX) - 4, BY = 33;                    // star block (low-resolution cells): x above his head, y 33..41 → screen 264..328
const PAL = { sky0: '#140c38', sky1: '#2a1660', sky2: '#4a2a8a', sky3: '#7a46a8', white: '#fcfcfc', black: '#000000', star: '#fcf4b8', moon: '#fce8a8', moonD: '#d8b868', mtn: '#1c1448', mtnL: '#3c2c78', pine: '#0c0a24', stone: '#3c4a6c', stoneD: '#24304c', stoneL: '#6a7ca0', moss: '#3cb87c', mossL: '#8cf0a8', wood: '#a8642c', woodD: '#5c3014', woodL: '#e09c54', blk: '#2c5cd8', blkD: '#183898', blkL: '#7cacfc', gold: '#f8d040', coin: '#f8d878', coinD: '#e45c10', chest: '#b4602c', fly: '#d8fc6c' };
const WALK = '8bit_walk', ACTK = '8bit_act';
const REAL = ACTK === '8bit_act';
const tab = (u, T) => { let f = T[0][1]; for (const [a, i] of T) if (u >= a) f = i; return f; };
// 0 standing 1 crouching 2 taking off fist raised 3 hitting 4 falling 5 landing 6 looking up 7 cheering
const HF = REAL ? [[0, 0], [0.08, 1], [0.2, 2], [0.32, 3], [0.46, 4], [0.6, 5], [0.72, 6], [1.1, 7]] : [[0, 0], [0.08, 2], [0.2, 4], [0.32, 5], [0.46, 7], [0.6, 9], [0.72, 0], [1.1, 6]];
const J0 = 0.2, J1 = 0.6, T_HIT = (J0 + J1) / 2, T_TOP = T_HIT + 0.5, T_SCORE = T_TOP + 0.08;   // jump 0.2→0.6, hitting the block at the peak; the coin rises 0.5s to the top, flashes and is gone

// ---------- character bitmaps ----------
const BMP = {
  star: ['...#....', '...#....', '.#####..', '..###...', '..#.#...', '.#...#..', '........', '........'],
  moon: ['...####...', '.##....##.', '#.......##', '#........#', '#.....#..#', '#........#', '#.#......#', '.##....##.', '...####...'],
  chest: ['.########.', '#oooooooo#', '#oooooooo#', '##########', '#ooooYYooo', '#oooYYYYoo', '#oooooooo#', '##########'],
  cloud: ['....######......', '..##......##.....', '.#..........###..', '#...............#', '.################'],
};
const bmp = (g, rows, x, y, col) => { g.fillStyle = col; rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === '#') g.fillRect(x + i, y + j, 1, 1); }); };
const dither = (g, x0, x1, y0, y1, a, b) => { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { g.fillStyle = (x + y) % 2 ? a : b; g.fillRect(x, y, 1, 1); } };

// ---------- static world (low resolution, cached) ----------
let LO = null;
function build() {
  if (LO) return LO;
  const cv = P.canvas(LW, LH), g = cv.getContext('2d'), r = U.rng(85);
  // Night sky: four shades of purple, checkerboard dithering at the boundaries (NES gradient)
  [[0, PAL.sky0], [22, PAL.sky1], [44, PAL.sky2], [60, PAL.sky3]].forEach(([y, col], k, A) => { g.fillStyle = col; g.fillRect(0, y, LW, (A[k + 1] ? A[k + 1][0] : GR) - y); if (k) dither(g, 0, LW, y - 2, y, A[k - 1][1], col); });
  // Small static stars (single pixels), big moon (with craters)
  for (let k = 0; k < 160; k++) { const x = (r() * LW) | 0, y = (r() * 52) | 0; g.fillStyle = r() < 0.7 ? '#b8a8e8' : PAL.star; g.fillRect(x, y, 1, 1); }
  { const mx = 176, my = 8; for (let y = 0; y < 14; y++) for (let x = 0; x < 14; x++) { const d = Math.hypot(x - 6.5, y - 6.5); if (d < 7) { g.fillStyle = d > 6 ? PAL.moonD : PAL.moon; g.fillRect(mx + x, my + y, 1, 1); } } g.fillStyle = PAL.moonD; [[4, 4, 2], [9, 8, 2], [5, 10, 1]].forEach(([x, y, w]) => g.fillRect(mx + x, my + y, w, w)); }
  // Distant mountain silhouettes (jagged + bright edges), horizon 68 → screen 544
  for (let x = 0; x < LW; x++) { const top = Math.round(60 - 10 * Math.abs(Math.sin(x * 0.045)) - 6 * Math.abs(Math.sin(x * 0.13 + 1))); g.fillStyle = PAL.mtn; g.fillRect(x, top, 1, 68 - top); g.fillStyle = PAL.mtnL; g.fillRect(x, top, 1, 1); }
  // Middle ground: band of pine silhouettes
  g.fillStyle = PAL.pine; g.fillRect(0, 68, LW, GR - 68);
  for (let x = 2; x < LW; x += 5 + ((r() * 4) | 0)) { const h = 10 + ((r() * 10) | 0); for (let j = 0; j < h; j++) { const w = Math.max(0, Math.floor((j / h) * 4)); g.fillRect(x - w, 70 - h + j, 2 * w + 1, 1); } }
  // Ground: mossy stone steps (a row of bright moss on top, staggered stone blocks below)
  for (let y = GR; y < LH; y += 6) for (let x = (y / 6) % 2 ? 0 : -5; x < LW; x += 10) { g.fillStyle = PAL.stone; g.fillRect(x, y, 10, 6); g.fillStyle = PAL.stoneL; g.fillRect(x, y, 10, 1); g.fillStyle = PAL.stoneD; g.fillRect(x + 9, y, 1, 6); g.fillRect(x, y + 5, 10, 1); }
  for (let x = 0; x < LW; x++) { g.fillStyle = PAL.moss; g.fillRect(x, GR, 1, 2); if ((x * 7) % 5 === 0) { g.fillStyle = PAL.mossL; g.fillRect(x, GR - 1, 1, 1); } }
  // Floating wooden platforms (posts at both ends): on both sides of the star block, two in the distance; a treasure chest on one
  const plank = (x, y, n) => { for (let k = 0; k < n; k++) { g.fillStyle = PAL.wood; g.fillRect(x + k * 6, y, 6, 4); g.fillStyle = PAL.woodL; g.fillRect(x + k * 6, y, 6, 1); g.fillStyle = PAL.woodD; g.fillRect(x + k * 6 + 5, y, 1, 4); g.fillRect(x + k * 6, y + 3, 6, 1); } g.fillStyle = PAL.black; g.fillRect(x - 1, y, 1, 4); g.fillRect(x + n * 6, y, 1, 4); };
  plank(BX - 20, BY + 2, 3); plank(BX + 9, BY + 2, 3); plank(20, 48, 4); plank(170, 46, 5);
  const C2 = { '#': PAL.black, o: PAL.chest, Y: PAL.gold }; BMP.chest.forEach((row, j) => [...row].forEach((ch, i) => { if (C2[ch]) { g.fillStyle = C2[ch]; g.fillRect(182 + i, 38 + j, 1, 1); } }));
  return (LO = cv);
}

// ---------- low-resolution coordinates → screen: everything aligned to the same 8px grid (panning as a whole with the camera) ----------
const sx = (lx, camX) => lx * PX - camX;
function qblock(c, camX, t, bump, used) {   // star block: blue block + yellow star, the star breathing and twinkling; gray after being hit
  const x = sx(BX, camX), y = BY * PX - bump * PX;
  c.fillStyle = PAL.black; c.fillRect(x, y, 8 * PX, 8 * PX);
  c.fillStyle = used ? '#5c5c74' : PAL.blk; c.fillRect(x, y, 7 * PX, 7 * PX);
  c.fillStyle = used ? '#8c8ca4' : PAL.blkL; c.fillRect(x, y, 7 * PX, PX); c.fillRect(x, y, PX, 7 * PX);
  c.fillStyle = used ? '#3c3c50' : PAL.blkD; c.fillRect(x + 6 * PX, y + PX, PX, 6 * PX); c.fillRect(x + PX, y + 6 * PX, 6 * PX, PX);
  if (!used) { c.save(); c.translate(x, y + PX); c.scale(PX, PX); bmp(c, BMP.star, 0, 0, Math.floor(t * 6) % 3 ? PAL.gold : '#fcfcd0'); c.restore(); }
}
function coin(c, x, y, t, s = 1) { // pixel coin: widths cycling 8/6/2/6 = spinning
  const ph = Math.floor(t * 8) % 4, w = [8, 6, 3, 6][ph], h = 12, u = 4 * s;   // spinning at 8fps, the narrowest still 3 cells wide (review: a flash of a thin strip didn't read as a coin) c.fillStyle = PAL.black; c.fillRect(x - w * u / 2 - u, y - h * u - u, w * u + 2 * u, h * u + 2 * u);
  c.fillStyle = PAL.coinD; c.fillRect(x - w * u / 2, y - h * u, w * u, h * u);
  if (w > 3) { c.fillStyle = PAL.coin; c.fillRect(x - w * u / 2 + u, y - h * u + u, Math.max(u, w * u - 3 * u), h * u - 3 * u); c.fillStyle = '#fcfcfc'; c.fillRect(x - w * u / 2 + u, y - h * u + 2 * u, u, 4 * u); }
}
function hud(c, coins, score) {
  c.save(); c.font = '36px "PressStart2P-400"'; c.textBaseline = 'top'; c.fillStyle = '#000'; const T = (s, x, y) => { c.fillStyle = '#000'; c.fillText(s, x + 6, y + 6); c.fillStyle = '#fcfcfc'; c.fillText(s, x, y); };
  T('HUASHU', 60, 40); T(String(score).padStart(6, '0'), 60, 88); T('×' + String(coins).padStart(2, '0'), 470, 88); coin(c, 444, 128, 0, 0.75);
  c.restore();
}

// ---------- pixelating Huashu: 6px grid downsampling + alpha binarization ----------
const pix = (key, i) => D4.frameCanvas(key, i, 'px6', im => {
  const s = 300 / XING.SPR[key].meta.ref_h, k = s / 6, w = Math.max(1, Math.round(im.width * k)), h = Math.max(1, Math.round(im.height * k));
  const cv = P.canvas(w, h), g = cv.getContext('2d', { willReadFrequently: true }); g.imageSmoothingEnabled = false; g.drawImage(im, 0, 0, w, h);   // nearest neighbor: the pixel-art source's color blocks aren't averaged into mud
  const d = g.getImageData(0, 0, w, h), q = d.data; for (let j = 0; j < q.length; j += 4) { if (q[j + 3] < 120) q[j + 3] = 0; else { q[j + 3] = 255; for (let m = 0; m < 3; m++) q[j + m] = Math.round(q[j + m] / 36) * 36; } } g.putImageData(d, 0, 0);
  cv.k = w / im.width; cv.pixel = true; cv.pad = 0; return cv;
});
const apexTop = () => { const f = XING.SPR[ACTK].meta.frames[HF[3][1]], s = 300 / XING.SPR[ACTK].meta.ref_h; return f.ay * s; };   // the block-hitting frame: height from the feet to the top of the fist

WORLD.add({
  id: '14_8bit', year: '1980s', name: '8-bit pixel game', w: SW, burst: 'vg', labelColor: 'rgba(252,252,252,.95)',
  hero: { walk: WALK, h: 300, shadow: null, draw(c, key, i, o, S) { D4.drawFrame(c, key, i, o, pix(key, i)); } },
  acts: [{ at: AT, dur: DUR, key: ACTK, lead: 140, frame: u => Math.min(tab(u, HF), XING.nFrames(ACTK) - 1),
    // Jump: a J0→J1 parabola, the fist hitting the bottom of the block exactly at the peak; another small hop when cheering
    y: (lx, u) => { const q = clamp((u - J0) / (J1 - J0)); const lift = Math.max(0, (G - (BY + 8) * PX) - apexTop()); return G - Math.sin(q * Math.PI) * lift - (u > 1.1 && u < 1.4 ? Math.sin((u - 1.1) / 0.3 * Math.PI) * 40 : 0); } }],
  back(c, s) {
    const lo = build(); c.save(); c.imageSmoothingEnabled = false;
    const ox = Math.floor(s.camX / PX), fx = s.camX - ox * PX;
    c.drawImage(lo, ox, 0, LW - ox, LH, -fx, 0, (LW - ox) * PX, H); c.restore();
    c.imageSmoothingEnabled = false;
    // Twinkling stars: some stars blink on and off at 6fps (whole pixels)
    for (let k = 0; k < 40; k++) { const lx = U.hash(k, 11) * LW, ly = U.hash(k, 12) * 50; if (U.hash(k, Math.floor(s.t * 6)) < 0.5) continue; const X = sx(lx | 0, s.camX * 0.3 / 1) , Y = (ly | 0) * PX; c.fillStyle = PAL.star; c.fillRect(Math.round(X / PX) * PX, Y, PX, PX); c.fillRect(Math.round(X / PX) * PX - PX, Y + 0, PX * 3, PX * 0 + 2); }
    // Night clouds: dark purple pixel clouds moving left by whole cells
    for (let k = 0; k < 5; k++) { const lx = ((k * 61 + 300 - Math.floor(s.t * 3)) % 320 + 320) % 320 - 20, ly = 14 + (k * 9) % 26; c.save(); c.translate(Math.round(sx(lx, s.camX * 0.6) / PX) * PX, ly * PX); c.scale(PX, PX); c.fillStyle = '#3a2470'; c.fillRect(1, 1, 15, 3); c.fillRect(4, 0, 7, 1); bmp(c, BMP.cloud, 0, 0, '#5a3c98'); c.restore(); }
    // Shooting star: one every 2.4 seconds, streaking across diagonally (with a 5-cell tail)
    { const ph = (s.t % 2.4) / 0.5; if (ph < 1) { const hx = 40 + ((Math.floor(s.t / 2.4) * 67) % 160), lx = hx + ph * 30, ly = 6 + ph * 12; for (let k = 0; k < 6; k++) { c.fillStyle = k ? `rgba(252,244,184,${1 - k / 6})` : '#fff'; c.fillRect(Math.round(sx(lx - k * 2, s.camX * 0.3)), Math.round((ly - k * 0.8)) * PX, PX, PX); } } }
    // Fireflies: 12 drifting slowly above the grass, blinking to their own rhythms
    for (let k = 0; k < 12; k++) { const lx = U.hash(k, 21) * LW + Math.sin(s.t * 0.8 + k) * 4, ly = GR - 4 - U.hash(k, 22) * 14 + Math.sin(s.t * 1.3 + k * 2) * 2, on = Math.sin(s.t * 3 + k * 1.7) > 0.2; if (!on) continue; c.fillStyle = PAL.fly; c.fillRect(Math.round(sx(lx, s.camX) / PX) * PX, Math.round(ly) * PX, PX, PX); c.fillStyle = 'rgba(216,252,108,.3)'; c.fillRect(Math.round(sx(lx, s.camX) / PX) * PX - PX, Math.round(ly) * PX - PX, 3 * PX, 3 * PX); }
    // The treasure chest lid opening and closing, puffing out a golden glint
    { const op = Math.floor(s.t * 1.5) % 2, X = sx(182, s.camX), Y = 38 * PX; if (op) { c.fillStyle = PAL.gold; c.fillRect(X + 3 * PX, Y - 2 * PX, 4 * PX, PX); c.fillStyle = '#fff'; c.fillRect(X + 4 * PX, Y - 4 * PX, PX, PX); } }
    // Star block: when hit, jumps up 2 cells and falls back, then becomes a gray used block
    const u = D4.since(this, s), bump = u > T_HIT && u < T_HIT + 0.16 ? Math.round(Math.sin((u - T_HIT) / 0.16 * Math.PI) * 2) : 0;
    qblock(c, s.camX, s.t, bump, u > T_HIT);
    // Coin: pops out of the top of the block, spinning as it rises (decelerating) → flashes at the peak and vanishes (pixel cross star)
    const cx = sx(BX + 4, s.camX), cy0 = BY * PX;
    if (u > T_HIT && u < T_TOP) { const q = (u - T_HIT) / (T_TOP - T_HIT); coin(c, cx, Math.round((cy0 - ease.out(q) * 130) / 4) * 4, s.t, 1.5); }
    if (u >= T_TOP && u < T_TOP + 0.24) { const q = (u - T_TOP) / 0.24, r = Math.round((8 + q * 40) / 4) * 4; c.fillStyle = q < 0.5 ? '#fcfcfc' : PAL.coin; [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([dx, dy]) => c.fillRect(cx + dx * r - 4, cy0 - 150 + dy * r - 4, 8, 8)); c.fillRect(cx - 4, cy0 - 150 - 4, 8, 8); }
    if (u > T_SCORE && u < T_SCORE + 0.7) { c.save(); c.font = '30px "PressStart2P-400"'; c.fillStyle = '#fcfcfc'; c.globalAlpha = 1 - clamp((u - T_SCORE - 0.45) / 0.25); c.fillText('100', cx + 50, cy0 - 70 - (u - T_SCORE) * 60); c.restore(); }
    hud(c, u >= T_SCORE ? 8 : 7, u >= T_SCORE ? 2100 : 2000);
    c.imageSmoothingEnabled = true;
  },
  // Boundary: columns of pixel blocks (a black-and-white checkered edge)
  seam(c, y, sxp, t) { const q = Math.round(sxp / PX) * PX, row = Math.floor(y / PX); c.fillStyle = row % 2 ? '#000' : '#fcfcfc'; c.fillRect(q - PX, y, PX, 6); c.fillStyle = row % 2 ? '#fcfcfc' : '#000'; c.fillRect(q, y, PX, 6); },
});
})();
