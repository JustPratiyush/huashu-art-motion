// paperSlide, white paper pushing in: a sheet of whiteboard paper slides in from the right and covers the previous page (with a shadow on its left edge and a 1.2° tilt that straightens slightly); paper in place = the whiteboard segment begins.
// For "color-block page → hand-drawn whiteboard": the whiteboard's signature is "a sheet of white paper", so the transition is the paper itself entering. Reveal point ≈ p 0.6 (paper covering 90%).
(() => {
const { clamp } = U;
TRANSITIONS.paperSlide = (c, A, B, p, o) => {
  const W = o.W, H = o.H, e = MO.cubicInOut(clamp(p)), x = W * (1 - e) * 1.03, rot = 0.021 * (1 - e);
  c.drawImage(A, 0, 0);
  c.fillStyle = `rgba(0,0,0,${0.18 * e})`; c.fillRect(0, 0, W, H);                // The old page darkens a little before the paper covers it
  c.save(); c.translate(x, 0); c.rotate(rot);
  const g = c.createLinearGradient(-60, 0, 0, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.28)');
  c.fillStyle = g; c.fillRect(-60, -40, 60, H + 80);                                   // Shadow on the paper's left edge
  c.drawImage(B, 0, 0); c.fillStyle = '#FBFBFB'; c.fillRect(0, H, W, 80); c.fillRect(0, -80, W, 80);   // Extra paper edge at top and bottom while tilted
  c.restore();
};
})();
