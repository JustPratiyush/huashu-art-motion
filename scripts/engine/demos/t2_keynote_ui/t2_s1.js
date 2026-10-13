// t2 · launch-event style: "An AI product launch: three feature cards"
// Shot 1 (2.6s): soft light spots drifting slowly on a dark background; eyebrow → product name (blur → sharp + shift up, gradient text, a sheen sweeping across) → a one-line subtitle. The camera pushes in very slowly.
// This file also holds what t2 shares (window.T2): light-spot background, fonts, colors.
(() => {
const { clamp, lerp } = U;
const W = 1920, H = 1080;
const BASE = '#050508';
const BLOBS = [                                                   // hues from the Stripe gradient family (purple / blue / cyan) + a touch of warmth; periods avoid 5s (HIG: avoid sustained ~0.2Hz oscillation)
  { x: 430, y: 300, r: 760, col: [150, 90, 238], a: 0.75, ax: 220, ay: 120, period: 11, ph: 0 },
  { x: 1520, y: 260, r: 700, col: [56, 104, 255], a: 0.7, ax: 200, ay: 160, period: 13, ph: 2.1 },
  { x: 1320, y: 930, r: 560, col: [120, 214, 255], a: 0.5, ax: 260, ay: 100, period: 9.5, ph: 4 },
  { x: 520, y: 960, r: 520, col: [255, 96, 84], a: 0.42, ax: 180, ay: 90, period: 12, ph: 1.3 },
];
const SANS = '"Inter", "NotoSansSC"', ZH = '"NotoSansSC"';
// Light-spot background: depends only on film time t, seamless across the three shots (the background doesn't jump on cuts)
const bg = (c, t, { dim = 0.38 } = {}) => {
  UI.mesh(c, t, { base: BASE, blobs: BLOBS, blur: 90, scale: 0.25, grain: 0.035, key: 't2mesh' });
  // Darken the center a little to leave contrast for white text
  const g = c.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 1000); g.addColorStop(0, `rgba(0,0,0,${dim})`); g.addColorStop(1, 'rgba(0,0,0,0.1)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
};
// Big type: letter spacing tightened to −0.02em (Apple / Linear websites use −0.015 to −0.03em above 64px)
const track = (c, size, em = -0.02) => { c.letterSpacing = (size * em).toFixed(2) + 'px'; };
// Light-spot drift, card floating and icon pulsing all read film time t. PHASE: keeps the phase this film had when it sat at 8–16s during experiments, preserving the final composition (delete or change freely when changing the topic)
const PHASE = 8;
window.T2 = { bg, SANS, ZH, track, BASE, PHASE };

const DUR = 2.6;
SCENES['t2_s1'] = {
  draw(c, lt, t) {
    t += T2.PHASE;
    bg(c, t);
    // Constant slow camera push: 1.0 → 1.045 (linear over the whole shot; launch-film slow pushes don't decelerate, slowing to a stop makes the picture go "dead")
    const s = lerp(1, 1.045, lt / (DUR + 0.55));
    c.save(); c.translate(W / 2, H / 2); c.scale(s, s); c.translate(-W / 2, -H / 2);
    c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    // Eyebrow
    c.font = `500 34px ${ZH}`; c.fillStyle = '#a7a7b4'; c.letterSpacing = '6px';
    TY.blurIn(c, 'I N T R O D U C I N G', W / 2, 372, MO.appleOut(MO.seg(lt, 0.1, 0.8)), { blur: 10, dy: 16 });
    // Product name: gradient text drawn offscreen → a sheen sweeps across (source-atop lights only the text) → pasted back blur → sharp
    const p = MO.appleOut(MO.seg(lt, 0.3, 1.3));
    if (p > 0) {
      const tx = UI.scratch('t2title', W, 420), g = tx.getContext('2d'); g.reset();
      g.font = `600 220px ${SANS}`; track(g, 220); g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      const gr = g.createLinearGradient(600, 0, 1320, 0); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.55, '#ddd2ff'); gr.addColorStop(1, '#a8dcff');
      g.fillStyle = gr; g.fillText('Plover 2', W / 2, 300);
      UI.sheen(g, null, MO.seg(lt, 1.25, 2.15), { x0: 560, x1: 1360, width: 140, angle: -0.38, alpha: 0.85, comp: 'source-atop' });
      c.save(); c.globalAlpha = clamp(p * 1.5); const b = (1 - p) * 26; if (b > 0.3) c.filter = `blur(${b.toFixed(1)}px)`;
      c.drawImage(tx, 0, 620 - 300 + (1 - p) * 40); c.restore();               // texture baseline y=300 → screen y=620
    }
    // Subtitle
    c.font = `400 50px ${ZH}`; c.fillStyle = '#c9c9d4'; c.letterSpacing = '1px';
    TY.blurIn(c, 'The AI assistant that thinks, remembers and acts', W / 2, 740, MO.appleOut(MO.seg(lt, 0.7, 1.6)), { blur: 12, dy: 22 });
    c.restore();
  },
};
})();
