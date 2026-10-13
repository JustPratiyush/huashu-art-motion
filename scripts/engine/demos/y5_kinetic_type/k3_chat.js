// K3 stage two, "Chat" (beats 8–11, 4.0–6.0s; the page push starts at 5.8s and lands at 6.0s)
// Beat 8: the main word slams in on the right + giant "2" → beat 8.5: your bubble pops out → beat 9: the AI bubble grows and code flows in line by line → beat 9.5: supporting line → beat 10.5: "a page" scales up + highlighter.
// The layout mirrors K2 (main word left ↔ right): the same beat positions in different places, so the audience doesn't feel repetition.
// Revision: the supporting line was originally on beat 10, 10 characters, staying only 0.55s, with its left end just 14px from the AI panel; now it's earlier, shorter and right-aligned with plenty of room.
(() => {
const K = KT, C = K.C, b = K.b;
const COLS = ['#C792EA', '#82AAFF', '#C3E88D', '#F78C6C', '#89DDFF', '#FFCB6B'];
SCENES['k3_chat'] = {
  draw(c, lt, t) {
    c.fillStyle = C.navy; c.fillRect(0, 0, 1920, 1080);
    K.dots(c, t, C.white, 0.07);
    K.cam(c, t, c => {
      K.bigNum(c, t, '2', b(8), 1880, 1150, 'rgba(255,255,255,0.07)');
      TY.rise(c, 'STAGE 02', 1790, 250, MO.at(t, b(8), 0.3), { size: K.SZ.label, fam: 'PuHui-Bold', color: C.yellow, track: 6, align: 'right' });
      TY.underline(c, 1620, 272, 170, MO.at(t, b(8.25), 0.3), C.yellow, 6);
      const hw = TY.width(c, 'Chat', K.SZ.hero);
      K.slam(c, 'Chat', 1790 - hw, 600, t, b(8), { color: C.yellow });
      const s1 = 'one ask,', key = 'a page', w1 = TY.width(c, s1, K.SZ.sub, 'PuHui-Heavy'), wk = TY.width(c, key, K.SZ.sub, 'PuHui-Heavy');
      const ky = 775, x1 = 1790 - w1 - wk * 1.35 - 12, kx = x1 + w1 + 12;
      TY.rise(c, s1, x1, ky, MO.at(t, b(9.5), 0.35), { size: K.SZ.sub, fam: 'PuHui-Heavy', color: C.white });
      const ksc = t >= b(10.5) ? 1 + 0.35 * MO.springHz(t - b(10.5), 2.5, 9) : 1;
      K.keyMarker(c, kx, ky, wk, K.SZ.sub, t, b(10.5), ksc, C.yellow);
      K.key(c, key, kx, ky, t, b(9.75), b(10.5), { size: K.SZ.sub, fam: 'PuHui-Heavy', color: t >= b(10.5) ? C.navy : C.white });
      // Your bubble (right-aligned to x=820), pops out on beat 8.5
      const p1 = MO.at(t, b(8.5), 0.3);
      if (p1 > 0) { const s = MO.backOut(p1, 2.6); c.save(); c.translate(820, 250); c.scale(s, s);
        const w = TY.width(c, 'Build me a login page', 48, 'PuHui-Bold') + 70;
        c.fillStyle = C.blue; c.beginPath(); c.roundRect(-w, -50, w, 96, 30); c.fill();
        c.beginPath(); c.moveTo(-26, 40); c.lineTo(10, 58); c.lineTo(-6, 26); c.fill();
        TY.text(c, 'Build me a login page', -w / 2, 16, { size: 48, fam: 'PuHui-Bold', color: C.white }); c.restore(); }
      // AI bubble: grows on beat 9 (height expoOut 0.35s), then a line of code flows in every 0.045s
      const p2 = MO.at(t, b(9), 0.35);
      if (p2 > 0) {
        const e = MO.expoOut(p2), x = 130, y = 340, w = 690, h = 620 * e;
        c.fillStyle = C.white; c.beginPath(); c.roundRect(x, y, w, Math.max(40, h), 30); c.fill();
        c.save(); c.beginPath(); c.roundRect(x, y, w, Math.max(40, h), 30); c.clip();
        const n = Math.floor(Math.max(0, t - b(9) - 0.1) / 0.045), r = U.rng(5);
        for (let i = 0; i < 22; i++) { const toks = 1 + (r() * 3 | 0), ind = (r() * 3 | 0) * 28; let xx = x + 40 + ind;
          const yy = y + 40 + i * 26, vis = i < n;
          for (let k = 0; k < toks; k++) { const ww = 40 + r() * 140; if (vis) { c.fillStyle = COLS[(r() * 6) | 0]; c.beginPath(); c.roundRect(xx, yy, ww, 14, 7); c.fill(); } else r(); xx += ww + 12; } }
        c.restore();
        c.fillStyle = C.white; c.beginPath(); c.moveTo(x + 30, y + 4); c.lineTo(x - 10, y - 26); c.lineTo(x + 70, y + 4); c.fill();
      }
    });
  },
};
})();
