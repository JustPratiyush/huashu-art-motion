// S01 · kinetic type (y5 kinetic type) · the film's opening hook. Grammar card references/animation-grammars/y5_kinetic_type.md
// The words are the actors: each keyword slams in on its narration word (TM.cue), one focus per screen; once the words settle they don't move — what moves is the camera's slight drift, the background dot grid, the rockets and exhaust.
// Four background colors = four chapters: navy (three failures in a row / the last shot) → yellow (9.28 it worked / the same day 18 years later / size comparison) → coral (the 24-years title card).
// Page changes within a chapter are brought by things in the picture: the last rocket ignites and a yellow circle grows from its exhaust and eats the navy; Starship lifts off and the camera follows it up to the title card.
(() => {
const W = 1920, H = 1080, ID = 's01';
const { clamp, lerp } = U;
const C = { navy: '#14213D', yel: '#FFD23F', coral: '#FF5A36', ink: '#111111', white: '#FFFFFF', dim: '#56607A' };
const F1 = RK.falcon1(), SS = RK.starship();
let Q = null;
const cues = () => Q || (Q = {
  spx: TM.cue(ID, 'SpaceX'), lian: TM.cue(ID, '连败三次'), x3: TM.cue(ID, '次，'),
  qian: TM.cue(ID, '钱只够'), zuihou: TM.cue(ID, '最后一发'), yifa: TM.cue(ID, '一发。'),
  d928: TM.cue(ID, '9月28号'), cheng: TM.cue(ID, '成了'), n18: TM.cue(ID, '18年'), tyt: TM.cue(ID, '同一天'),
  xj: TM.cue(ID, '星舰'), jr: TM.cue(ID, '进入了地球轨道'), lfz: TM.cue(ID, '两分钟'), kw: TM.cue(ID, '看完'),
  n24: TM.cue(ID, '24年'), voEnd: TM.vo(ID)[1],
});
const exitK = (lt, t0) => MO.expoIn(clamp((lt - t0) / 0.18));          // exits faster than entrances: 0.18s expoIn

// ---------- small tools ----------
// Background dot grid: a 64px grid moving slowly on a diagonal (screen space, continuous motion, not competing with the text)
const dots = (c, t, col, a) => {
  const g = 64, ox = (t * 36) % g, oy = (t * 18) % g;
  c.save(); c.globalAlpha = a; c.fillStyle = col; c.beginPath();
  for (let y = -g; y < H + g; y += g) for (let x = -g; x < W + g; x += g) { c.moveTo(x + ox + 4, y + oy); c.arc(x + ox, y + oy, 4, 0, 7); }
  c.fill(); c.restore();
};
// Rocket silhouette: shape from RK, x,y = center of the rocket's base, hpx = rocket height (pixels), dark parts use dark
const sil = (c, shape, x, y, hpx, rot, col, dark, alpha = 1) => {
  if (alpha <= 0) return;
  c.save(); c.globalAlpha *= alpha;
  RK.at(c, x, y, hpx / shape.h, rot, g => { for (const q of shape.parts) { g.fillStyle = (q.k === 'dark' || q.k === 'engine' || q.k === 'tiles') ? (dark || col) : col; g.fill(q.p); } });
  c.restore();
};
const flame = (c, x, y, hpx, rot, len, w, t, pal, seed) => {
  c.save(); c.translate(x, y); c.rotate(rot || 0); RK.flame(c, 0, hpx * 0.04, len, w, t, pal, seed); c.restore();
};
// Red X: two thick round-capped strokes, slamming from 1.7× to 1
const cross = (c, x, y, s, lt, col) => {
  if (lt < 0) return; const k = MO.springHz(lt, 2.4, 10), sc = lerp(1.8, 1, k);
  c.save(); c.globalAlpha *= clamp(lt / 0.05); c.translate(x, y); c.scale(sc, sc); c.rotate(-0.06);
  c.strokeStyle = col; c.lineCap = 'round'; c.lineWidth = s * 0.2;
  c.beginPath(); c.moveTo(-s / 2, -s / 2); c.lineTo(s / 2, s / 2); c.moveTo(s / 2, -s / 2); c.lineTo(-s / 2, s / 2); c.stroke(); c.restore();
};
// When something slams in, the whole picture punches along with it (School of Motion: scale the comp up on impact and back to 100%)
const hit = (lt, ts) => { let z = 0; for (const s of ts) { const d = lt - s; if (d >= 0 && d < 0.4) z += 0.018 * Math.exp(-d * 14); } return 1 + z; };
const cam = (c, t, z, fn, oy = 0) => {
  const [dx, dy] = CAM.drift(t, 5, 2);
  CAM.with(c, { x: 960 + dx, y: 540 + dy - oy, z, r: 0.006 * Math.sin(t * 0.8) }, fn);
};

// ---------- things in the shot ----------
// Three failed Falcon 1s: large (545px) on the right in chapter one, shrunk into a row (330px) in chapter two
const rk3 = (lt) => {
  const q = cues(), m = MO.expoInOut(clamp((lt - q.qian + 0.02) / 0.42));
  return [0, 1, 2].map(i => ({ x: lerp(1240 + i * 190, 1250 + i * 112, m), y: lerp(850, 800, m), h: lerp(545, 330, m) }));
};
// The fourth (the last shot): appears when "the last shot" slams in, ignites on "shot", lifts off; the navy → yellow circle grows from its exhaust; it keeps climbing out of frame over the yellow
const R4X = 1650;
const rk4 = (lt) => {
  const q = cues(), L0 = q.yifa + 0.06, u = Math.max(0, lt - L0);
  const h = lerp(330, 430, MO.expoOut(clamp(u / 0.5)));
  return { x: R4X - 60 * MO.smooth(clamp(u / 1.5)), y: 800 - 150 * Math.pow(u, 1.6) - 18 * u, h, u, fire: lt > q.yifa ? clamp((lt - q.yifa) / 0.1) : 0 };
};

// Chapters one + two (navy)
function navyLayer(c, lt, t) {
  const q = cues();
  const ex1 = exitK(lt, q.qian - 0.12);
  // "2008": already slamming on frame 0 (no empty opening)
  if (ex1 < 1) {
    c.save(); c.globalAlpha = 1 - ex1; c.translate(0, 60 * ex1);
    TY.slam(c, '2008', 150, 600, lt + 0.05, { size: 330, color: C.white });
    TY.rise(c, '连败三次', 158, 790, MO.at(lt, q.lian, 0.32), { size: 130, fam: 'PuHui-Heavy', color: C.coral });
    c.restore();
  }
  // Chapter two: "money for only" → "the last shot"
  TY.rise(c, '钱只够再打', 152, 360, MO.at(lt, q.qian + 0.06, 0.32), { size: 100, fam: 'PuHui-Heavy', color: 'rgba(255,255,255,.75)' });
  TY.slam(c, '最后一发', 150, 650, lt - q.zuihou, { size: 250, color: C.white });
  if (lt > q.zuihou + 0.12) TY.marker(c, 150, 676, 1000, 18, MO.at(lt, q.zuihou + 0.12, 0.3), C.yel, 0.6);
  // Three failures: they pop up one by one first, then on "three failures in a row" three red X's slam down one after another; each rocket that's hit goes dark, turns gray and tilts a little
  const R = rk3(lt), popT = [q.spx, q.spx + 0.22, q.spx + 0.44], xT = [q.lian, (q.lian + q.x3) / 2, q.x3];
  R.forEach((r, i) => {
    // Standing on the pad from frame 0 (dark silhouettes); when "SpaceX's rockets" is spoken they light up one by one with a little bounce
    const p = MO.at(lt, popT[i], 0.38), on = MO.expoOut(clamp(p * 2.5)), sc = p > 0 ? MO.backOut(p, 2.6) * 0.12 + 0.88 : 0.88;
    const dead = MO.expoOut(clamp((lt - xT[i]) / 0.25)), tilt = dead * (i - 1 || 0.5) * 0.08;
    const lit = DG.mix('#2A3656', C.white, on), col = dead > 0 ? DG.mix(lit, C.dim, dead) : lit;
    const dk = DG.mix(DG.mix('#222C47', '#C9D2E6', on), '#3A4560', dead);
    c.save(); c.translate(r.x, r.y); c.scale(sc, sc); c.translate(-r.x, -r.y);
    sil(c, F1, r.x, r.y, r.h, tilt, col, dk);
    c.restore();
    if (p <= 0) return;
    cross(c, r.x + Math.sin(tilt) * r.h * 0.45, r.y - r.h * 0.46, r.h * 0.38, lt - xT[i], C.coral);
  });
  // The fourth: pops out together with "the last shot", with a yellow count ring; ignites on "shot"
  const p4 = MO.at(lt, q.zuihou + 0.1, 0.4);
  if (p4 > 0) {
    const r = rk4(lt), s = MO.backOut(p4, 2.4);
    if (r.u <= 0) { c.save(); c.globalAlpha = clamp(p4 * 3); c.strokeStyle = C.yel; c.lineWidth = 8; c.setLineDash([18, 14]); c.lineDashOffset = -t * 40;
      c.beginPath(); c.arc(r.x, r.y - r.h * 0.5, r.h * 0.42 * s, 0, 7); c.stroke(); c.restore(); }
    if (r.fire > 0) flame(c, r.x, r.y, r.h, 0, r.h * (0.25 + 0.5 * clamp(r.u / 0.3)) * r.fire, r.h * 0.07, t, ['rgba(255,90,54,.9)', 'rgba(255,210,63,.95)', '#ffffff'], 7);
    c.save(); c.translate(r.x, r.y); c.scale(s, s); c.translate(-r.x, -r.y); sil(c, F1, r.x, r.y, r.h, 0, C.white, '#C9D2E6', clamp(p4 * 3)); c.restore();
  }
}

// Chapters three + four (yellow)
function yellowLayer(c, lt, t) {
  const q = cues();
  // Year: 2008 settles → on "a full 18 years later" it rolls like an odometer to 2026 (the date 9.28 stays)
  const pY = MO.at(lt, q.d928 + 0.16, 0.35);
  if (pY > 0) {
    const roll = clamp((lt - (q.n18 - 0.14)) / 0.62);
    c.save(); c.globalAlpha = clamp(pY * 3);
    c.beginPath(); c.rect(100, 160, 900, 260); c.clip();
    const e = MO.expoOut(pY); c.translate(0, 230 * (1 - e));
    U.odometer(c, { x: 156, y: 380, size: 210, font: '"PuHui-Black"', color: C.ink, fromStr: '2008', toStr: roll > 0 ? '2026' : '2008', align: 'left', stagger: 0.18 }, roll);
    c.restore();
  }
  // "18 years later" coral pill: pops out with "18"
  { const p = MO.at(lt, q.n18, 0.36); if (p > 0) { const s = MO.backOut(p, 2.6); c.save(); c.translate(860, 300); c.scale(s, s); c.rotate(-0.05);
    c.fillStyle = C.coral; c.beginPath(); c.roundRect(-10, -70, 330, 116, 58); c.fill();
    TY.text(c, '18年后', 155, 15, { size: 76, fam: 'PuHui-Heavy', color: C.white }); c.restore(); } }
  // Main word "9.28"
  TY.slam(c, '9.28', 140, 760, lt - q.d928, { size: 400, color: C.ink });
  // "The same day": a coral underline under 9.28 + a label
  if (lt > q.tyt) {
    TY.underline(c, 160, 800, 700, MO.at(lt, q.tyt, 0.3), C.coral, 16);
    TY.rise(c, '同一天', 160, 900, MO.at(lt, q.tyt + 0.08, 0.32), { size: 84, fam: 'PuHui-Heavy', color: C.ink });
  }
  // That shot: keeps climbing out of frame over the yellow ("it worked")
  const r = rk4(lt);
  if (r.y + 600 > 0 && lt < q.n18) {
    flame(c, r.x, r.y, r.h, 0, r.h * (0.75 + 0.15 * Math.sin(t * 9)), r.h * 0.08, t, ['rgba(255,90,54,.95)', 'rgba(255,255,255,.95)', '#ffffff'], 7);
    sil(c, F1, r.x, r.y, r.h, 0, C.ink, '#3b3320');
  }
  // "It worked": a coral stamp slams down at the top right of 9.28
  { const p = lt - q.cheng, ex = exitK(lt, q.n18 - 0.3);
    if (p > 0 && ex < 1) { const k = MO.springHz(p, 2.6, 11), s = lerp(2.0, 1, k) * (1 - 0.4 * ex);
      c.save(); c.globalAlpha = clamp(p / 0.05) * (1 - ex); c.translate(1150, 470); c.rotate(-0.12); c.scale(s, s);
      c.fillStyle = C.coral; c.beginPath(); c.roundRect(-190, -110, 380, 200, 26); c.fill();
      c.strokeStyle = C.white; c.lineWidth = 8; c.beginPath(); c.roundRect(-172, -92, 344, 164, 18); c.stroke();
      TY.text(c, '成了', 0, 48, { size: 140, fam: 'PuHui-Black', color: C.white }); c.restore(); } }
  // Size comparison: "Starship" — beside the tiny Falcon 1, the huge Starship rises (true RK proportions: 22.7m : 124m)
  if (lt > q.xj - 0.1) {
    const GY = 812, pxm = 5.4, pG = MO.at(lt, q.xj - 0.1, 0.35);
    c.save(); c.strokeStyle = C.ink; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(1180, GY); c.lineTo(1180 + 640 * MO.expoOut(pG), GY); c.stroke(); c.restore();
    const pf = MO.at(lt, q.xj, 0.35), ps = MO.at(lt, q.xj + 0.1, 0.55);
    c.save(); c.beginPath(); c.rect(0, -2000, W, GY - 3 + 2000); c.clip();
    sil(c, F1, 1290, GY + (1 - MO.backOut(pf, 2)) * 140, F1.h * pxm, 0, C.ink, '#3b3320', clamp(pf * 4));
    // "Reached Earth orbit": Starship ignites, accelerates up and turns slightly right out of frame
    const u = Math.max(0, lt - q.jr), sy = GY + (1 - MO.expoOut(ps)) * 720 - (300 * u + 1500 * u * u), rot = 0.1 * u * u;
    if (ps > 0) {
      if (u > 0) flame(c, 1580 + 120 * u * u, sy, SS.h * pxm, rot, 140 + 900 * clamp(u / 0.5), 70, t, ['rgba(255,90,54,.95)', 'rgba(255,255,255,.95)', '#ffffff'], 3);
      sil(c, SS, 1580 + 120 * u * u, sy, SS.h * pxm, rot, C.ink, '#3b3320');
    }
    c.restore();
    TY.rise(c, '猎鹰1号 · 2008', 1290, 878, MO.at(lt, q.xj + 0.05, 0.3), { size: 40, fam: 'PuHui-Bold', color: C.ink, align: 'center' });
    TY.rise(c, '星舰 · 2026', 1600, 878, MO.at(lt, q.xj + 0.2, 0.3), { size: 40, fam: 'PuHui-Bold', color: C.ink, align: 'center' });
  }
}

// Chapter five (coral): title card
function coralLayer(c, lt, t) {
  const q = cues();
  TY.rise(c, 'SpaceX', 960, 300, MO.at(lt, q.lfz + 0.22, 0.34), { size: 72, fam: 'PuHui-Heavy', color: C.ink, align: 'center', track: 14 });
  // Timeline 2002 ——— 2026
  const p = MO.at(lt, q.kw - 0.3, 0.7), x0 = 520, x1 = 1400, y = 760;
  if (p > 0) {
    c.save(); c.strokeStyle = C.ink; c.lineWidth = 10; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x0, y); c.lineTo(lerp(x0, x1, MO.expoOut(p)), y); c.stroke();
    const d0 = MO.backOut(MO.at(lt, q.kw - 0.3, 0.3), 2.6), d1 = MO.backOut(MO.at(lt, q.kw + 0.25, 0.3), 2.6);
    c.fillStyle = C.ink; c.beginPath(); c.arc(x0, y, 20 * d0, 0, 7); c.fill(); c.beginPath(); c.arc(x1, y, 20 * Math.max(0, d1), 0, 7); c.fill(); c.restore();
    TY.pop(c, '2002', x0, 850, MO.at(lt, q.kw - 0.25, 0.32), { size: 64, fam: 'PuHui-Black', color: C.ink, over: 2.4 });
    TY.pop(c, '2026', x1, 850, MO.at(lt, q.kw + 0.3, 0.32), { size: 64, fam: 'PuHui-Black', color: C.ink, over: 2.4 });
  }
  // Main word "24 years"
  TY.slam(c, '24年', 960, 640, lt - q.n24, { size: 330, color: C.white, align: 'center', oy: 640 - 330 * 0.36 });
}

SCENES[ID] = {
  init() { U.assertGlyphs('PuHui-Black', '20089.2824年最后一发成了', ID); U.assertGlyphs('PuHui-Heavy', '连败三次钱只够再打同一天18年后SpaceX', ID); U.assertGlyphs('PuHui-Bold', '猎鹰1号·2008星舰26', ID); },
  draw(c, lt, t) {
    const q = cues();
    // Page-change moments: navy → yellow (the circle grows from the fourth rocket's exhaust and covers everything as "9" is spoken); yellow → coral (the camera pushes up, revealing on "two minutes")
    const irisA = q.d928 - 0.26, irisP = clamp((lt - irisA) / 0.26);
    const pushA = q.lfz - 0.58 * 0.45, pushP = clamp((lt - pushA) / 0.45), pe = MO.expoInOut(pushP);
    const z = hit(lt, [0, q.lian, (q.lian + q.x3) / 2, q.x3, q.zuihou, q.d928, q.cheng, q.n24]) * (1 - 0.06 * MO.expoOut(clamp((lt - q.voEnd) / 0.5)));
    // Navy
    if (irisP < 1) {
      c.fillStyle = C.navy; c.fillRect(0, 0, W, H); dots(c, t, C.white, 0.07);
      cam(c, t, z, c => navyLayer(c, lt, t));
    }
    // Yellow (circular reveal)
    if (irisP > 0 && pushP < 1) {
      c.save();
      if (irisP < 1) { const r = rk4(lt); c.beginPath(); c.arc(r.x, r.y + 40, 2300 * Math.pow(irisP, 2.2), 0, 7); c.clip(); }
      c.translate(0, H * pe);
      c.fillStyle = C.yel; c.fillRect(0, 0, W, H); dots(c, t, C.ink, 0.07);
      cam(c, t, z, c => yellowLayer(c, lt, t));
      c.restore();
    }
    // Coral (pushing in from above)
    if (pushP > 0) {
      c.save(); c.translate(0, -H + H * pe);
      c.fillStyle = C.coral; c.fillRect(0, 0, W, H); dots(c, t, C.ink, 0.08);
      cam(c, t, z, c => coralLayer(c, lt, t));
      c.restore();
    }
  },
};
})();
