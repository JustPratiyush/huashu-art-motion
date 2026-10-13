// S01 · opening hook (left half of row A, x 0–4000). At frame 0 the board already has "2008" and three Falcon 1s, the first already crossed out in orange (conflict first);
// the pen goes on to cross out the second and third → "three failures in a row" → money bag → arrow → the fourth "the last shot" → 9.28 → it lifts off into orbit, "it worked";
// a long orange arrow "18 years later" leads the camera right → 9.28 "the same day" → 2026, Earth, Starship circling in orbit; finally a pull-back, the pen drawing a 2002—2026 timeline underneath, "24 years" popping in.
WB.chapter('s01', id => {
  const q = k => WB.q(id, k), { OR, INK } = WB, D = WB.D;
  const BASE = 860, RH = 420;
  // ---- drawn before frame 0 (conflict right at the opening) ----
  WB.at(-6);
  WB.text('2008', 120, 330, 180, { dur: 0.6 });
  const RX = [215, 395, 575];
  RX.forEach(x => WB.sk(D.falcon1(RH), x, BASE));
  WB.sk(D.cross(150), RX[0], BASE - RH * 0.5);
  ['2006', '2007', '2008.8'].forEach((y, i) => WB.text(y, RX[i], BASE + 92, 46, { align: 'center', dur: 0.2 }));
  WB.at(0.5); WB.text('年', 120 + WB.measure('2008', 180), 330, 180, { dur: 0.36 });
  // ---- crossing out the second and third ----
  WB.at(0.2); WB.sk(D.cross(150), RX[1], BASE - RH * 0.5, { speed: 1500 });   // Frame 0 is clean: the hand only comes in from the bottom right after 0.2s to cross out the second
  WB.go(q('连败') - 0.05); WB.sk(D.cross(150), RX[2], BASE - RH * 0.5, { speed: 2600 });
  WB.go(q('三次') - 0.05); WB.text('连败三次', 700, 700, 108, { col: OR, rate: 9 });
  WB.figure(905, 880, 150, [[0, 'stand'], [WB.cur + 0.3, 'head']], { speed: 5200, w: 6 });   // A little figure clutching its head
  // ---- "money for only one last shot" ----
  WB.go(q('钱') + 0.15);
  WB.sk(D.bag(220), 1280, 650, { speed: 3400 }); WB.hatchCircle(1280, 690, 72, { gap: 19, speed: 26000 });   // Money bag: orange diagonal hatching (no third color)
  WB.text('$', 1280 - 26, 735, 110, { dur: 0.14 });
  WB.go(q('最后') + 0.05); WB.text('最后一发', 1250, 430, 92, { col: OR, rate: 12, align: 'center' });
  WB.arrow([1405, 650], [1545, 650], { head: 26 });
  WB.sk(D.falcon1(RH), 1660, BASE, { speed: 4200 });
  // ---- "on September 28, that shot worked" ----
  WB.go(q('9月') + 0.25); WB.text('9.28', 1790, 760, 140, { rate: 10 });
  const EX = 2060, EY = 250, ER = 70;
  WB.go(WB.cur + 0.02); WB.sk(D.earth(ER), EX, EY, { speed: 3400 });
  const orb = WB.ell(EX, EY, 135, 46, Math.PI, 1.0, -0.12, 48);
  WB.line(orb, { col: OR, w: 4.5, speed: 5000, smooth: false });
  // The fourth launch: the rocket stays in place, the pen draws an orange arc from the arrow into the little Earth's orbit; a small rocket appears on the orbit and keeps circling
  const tL = Math.max(WB.cur + 0.02, q('那一发') + 0.02), tA = tL + 0.5;
  const P = WB.prep(D.falcon1(RH)), FL = WB.prep([{ p: [[-14, 2], [0, 70], [14, 2]], o: 1, w: 0.9 }]);
  WB.line(WB.quad([1660, BASE - RH * 1.2], [1700, 330], [EX - 132, EY + 22], 30), { col: OR, w: 5, t0: tL, dur: tA - tL, smooth: false, handed: false });
  WB.custom({ t0: tA, t1: tA + 0.2, bb: [EX - 200, EY - 120, EX + 200, EY + 120], draw(g, qq, t) {
    const w = (t - tA) * 2.2 + Math.PI * 0.92, x = EX + Math.cos(w) * 135 * 0.993 - Math.sin(w) * 46 * -0.12, y = EY + Math.cos(w) * 135 * -0.12 + Math.sin(w) * 46, a = w + Math.PI, s = 0.3 * MO.backOut(qq, 2);
    WB.drawPrep(g, FL, x, y, s, a, 0.7 + 0.3 * Math.sin(t * 40)); WB.drawPrep(g, P, x, y, s, a); return null; } });
  WB.at(q('成了') - 0.1); WB.sk(D.check(110), 1930, 470, { speed: 2600 });
  WB.pop('成了', 2090, 520, 110, { at: q('成了') + 0.2, rot: -0.08 });
  // ---- "the same day a full 18 years later" ----
  WB.go(q('整整') + 0.05);
  WB.arrow([2130, 712], [2660, 668], { col: OR, bend: -40, w: 7, head: 34, speed: 2600 });
  WB.text('18年后', 2390, 620, 84, { align: 'center', rate: 14 });
  WB.go(q('同一天') - 0.25); WB.text('9.28', 2800, 700, 140, { rate: 12 });
  WB.line([[2790, 730], [2960, 736], [3110, 728]], { col: OR, w: 7, speed: 4000 }); WB.line([[2800, 748], [2960, 754], [3100, 746]], { col: OR, w: 6, speed: 4500 });
  WB.pop('同一天', 2955, 850, 84, { at: q('同一天') + 0.55 });
  // ---- "Starship reached Earth orbit for the first time" ----
  WB.go(q('星舰') - 0.15); WB.text('2026年', 2780, 320, 180, { rate: 11 });
  const SX = 3700, SY = 590, SR = 165;
  WB.go(q('进入') - 0.3); WB.sk(D.earth(SR), SX, SY, { speed: 3600 });
  const RX2 = 300, RY2 = 98, ROT = -0.18;
  WB.line(WB.ell(SX, SY, RX2, RY2, Math.PI * 0.9, 1.03, ROT, 64), { col: OR, w: 5, speed: 6000 });
  const SP = WB.prep(D.starship(270, 'full'), 6.5);
  const tS = WB.cur;
  WB.custom({ t0: tS, t1: tS + 0.35, bb: [SX - 420, SY - 300, SX + 420, SY + 300], draw(g, qq, t) {
    const w = (t - tS) * 0.9 + Math.PI * 1.05, x0 = Math.cos(w) * RX2, y0 = Math.sin(w) * RY2, c = Math.cos(ROT), s = Math.sin(ROT);
    const x = SX + x0 * c - y0 * s, y = SY + x0 * s + y0 * c, a = Math.atan2(Math.cos(w) * RY2, -Math.sin(w) * RX2) + ROT + Math.PI / 2;
    const front = Math.sin(w) > -0.15;   // Hidden by Earth when it goes behind it
    if (!front) { g.beginPath(); g.rect(-1e5, -1e5, 2e5, 2e5); g.arc(SX, SY, SR + 4, 0, Math.PI * 2, true); g.clip(); }
    WB.drawPrep(g, SP, x, y, 1, a, MO.smooth(qq));
    return null; } });
  WB.at(q('地球') + 0.1); WB.text('星舰入轨', SX, 340, 84, { align: 'center', col: OR, rate: 12 });
  // ---- "these 24 years in two minutes": pull back, timeline ----
  WB.go(q('两分钟') + 0.25);
  // A timeline spanning the whole block: 2002 and 2026 written at the ends, a big orange brace over the whole span, "24 years" written at the point of the brace (no intermediate ticks, and no rocket standing on any particular year)
  const TY = 1062, X0 = 130, X1 = 3860, XM = (X0 + X1) / 2;
  WB.text('2002', X0 - 30, TY + 30, 92, { align: 'right', rate: 26 });
  WB.line([[X0, TY], [X1, TY]], { speed: 7600, w: 7 });
  [X0, X1].forEach(x => WB.line([[x, TY - 26], [x, TY + 26]], { smooth: false, speed: 3000, min: 0.03 }));
  WB.text('2026', X1 + 30, TY + 30, 92, { rate: 26 });
  const br = []; for (let i = 0; i <= 60; i++) { const u = i / 60, k = Math.abs(u - 0.5) * 2; br.push([X0 + 10 + (X1 - X0 - 20) * u, TY - 30 - 22 * (1 - Math.pow(k, 8)) - (k < 0.04 ? 26 * (1 - k / 0.04) : 0)]); }
  WB.line(br, { col: OR, w: 7, dur: 0.28 });
  WB.pop('24年', XM, TY - 92, 140, { at: Math.max(WB.cur + 0.3, q('24年') + 0.2) });
  // ---- camera ----
  const T = WB.T0(id) + TIMING.seg[id].dur;
  WB.cam0(...WB.fit(-7, q('钱'), { zmax: 1.15 }));
  WB.shot(q('钱') - 0.15, 0.9, q('钱'), q('9月'));
  WB.move(q('9月') - 0.05, q('9月') + 0.4, 1950, 720, 1.75, { ease: MO.cubicInOut });   // 特写：笔尖写「9.28」
  WB.shot(q('那一发') - 0.3, 0.6, q('钱'), q('整整'), { ease: MO.cubicInOut });
  WB.shot(q('整整') - 0.05, 1.15, q('整整'), q('两分钟'));
  WB.shot(q('两分钟') + 0.05, 0.95, -7, T, { zmax: 0.6, pad: 60, sy: 430, declip: false });
});
const clamp01 = x => Math.max(0, Math.min(1, x));
SCENES['s01'] = WB.scene;
