// Brush and water: dry-brush calligraphy brush, double-pointed single strokes, ink-bleed washes, long curved flowing strokes, watercolor washes, impasto bristle brush, scissor polylines. All attached to PAINT (P).
// Sources: migration tests A (ink wash/Munch), B (Ghibli), C (Matisse), D (Rembrandt). Deterministic: all randomness is seeded.
//   P.brush(c, pts, opt)            calligraphy brush: pressure entering/leaving + wet core + per-bristle dry-brush streaks, can be written out by reveal (ink wash, calligraphy, baimiao drapery)
//   P.leaf(c, x, y, ang, L, w)      a single stroke pointed at both ends (bamboo leaves, orchid leaves, bird wings, shrimp tails)
//   P.inkWash(c, key, grow, fn, o)  ink bleed: the shape is drawn to a scratch canvas first, then "outer bleed + body" are blurred in two passes and multiplied onto the paper; grow 0→1 is the bleeding
//   P.flowSeeds / P.flowLines       long curved flowing strokes: seeds integrated along a direction field that twists over time into 200–300px long strokes (Munch, not Van Gogh's short strokes)
//   P.deform / P.watercolor         watercolor wash: midpoint-displaced polygons × several low-α multiply layers + a faint stroke per layer = water-mark edges (Ghibli backgrounds)
//   P.rectPts / P.ellipsePts        polygon point lists commonly used for washes
//   P.impasto(c, pts, w, col, hi)   impasto bristle brush: one stroke = several parallel fine bristles (Rembrandt highlights, Van Gogh impasto touch-ups)
//   P.cut(pts, seed, step, amp)     scissor polyline: a point every step px along the outline + jitter, joined by straight lines (Matisse cut-outs, silhouettes, woodcuts)
(() => {
let W = 1920, H = 1080; U.onStage((w, h) => { W = w; H = h; });   // canvas size follows U.setStage (default 1920×1080)
const P = window.PAINT;
const { clamp, lerp, rng, ss } = U;

// ---------- calligraphy brush ----------
// pts control points (densified with Catmull-Rom, then resampled at equal 4px arc lengths — without resampling, the dry-brush noise frequency varies with stroke length)
// w max width; tone ink opacity (scorched .9 / thick .8 / heavy .6 / light .35 / clear .15); dry 0..1 amount of dry brush (drier toward the end of the stroke); reveal 0..1 fraction written out
// head/tail fraction for entering/leaving; bristles number of bristles; col ink color [r,g,b]; per densification factor
// Pitfall: each bristle must be one continuous path (butt caps); stroking small segments separately with round caps stacks dark dots at the joints, like bamboo nodes / hemp rope.
P.brush = (c, pts, { w = 10, tone = 0.85, dry = 0.45, seed = 1, reveal = 1, bristles = 8, col = [16, 14, 12], head = 0.12, tail = 0.4, per = 5 } = {}) => {
  if (reveal <= 0) return;
  const D = KIT.resample(KIT.densify(pts, per), 4), n = D.length, m = Math.max(2, Math.ceil(n * clamp(reveal)));
  const r = rng(seed * 7919);
  const prof = q => ss(0, head, q) * (1 - 0.7 * ss(1 - tail, 1, q)) * (0.85 + 0.15 * P.noise(seed * 3.3, q * 6)) + 0.08;
  c.save(); c.lineCap = 'butt'; c.lineJoin = 'round';
  const N = [];
  for (let i = 0; i < n; i++) { const A = D[Math.max(0, i - 1)], B = D[Math.min(n - 1, i + 1)]; let dx = B[0] - A[0], dy = B[1] - A[1]; const d = Math.hypot(dx, dy) || 1; N.push([-dy / d, dx / d]); }
  const core = q => w * prof(q) * (1 - dry * 0.85 * Math.pow(q, 0.8));
  // Wet core: along the whole stroke, thinner and lighter toward the end (the ink running out)
  c.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${tone * 0.72})`; c.fill(KIT.ribbon(D.slice(0, m), (q, i) => core(i / (n - 1))));
  // Bristles: each one a continuous line, broken by noise (dry brush = paper showing between bristles), breaking more toward the end of the stroke
  for (let k = 0; k < bristles; k++) {
    const off = (k / (bristles - 1) - 0.5) * 0.95, bw = w / bristles * (0.9 + r() * 0.9), ph = r() * 50;
    c.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${tone * (0.45 + r() * 0.35)})`; c.lineWidth = Math.max(0.7, bw);
    c.beginPath(); let on = false;
    for (let i = 0; i < m; i++) {
      const q = i / (n - 1), dryness = dry * Math.pow(q, 1.2);
      const vis = P.noise(k * 1.9 + ph, i * 0.09) * 0.5 + 0.5 > dryness * 0.95 + 0.05;
      const o = off * w * prof(q), x = D[i][0] + N[i][0] * o, y = D[i][1] + N[i][1] * o;
      if (vis) { on ? c.lineTo(x, y) : c.moveTo(x, y); on = true; } else on = false;
    }
    c.stroke();
  }
  c.restore();
};
// A single stroke pointed at both ends ("个"-shaped bamboo leaves, orchid-leaf lines, bird wings): length L along ang, max width wmax, slightly curved
P.leaf = (c, x, y, ang, L, wmax, tone = 0.88, col = [16, 14, 12]) => {
  if (!Array.isArray(col)) col = [16, 14, 12];
  const pts = []; for (let i = 0; i <= 10; i++) { const q = i / 10, bend = Math.sin(q * Math.PI) * 0.08 * L; pts.push([x + Math.cos(ang) * L * q - Math.sin(ang) * bend, y + Math.sin(ang) * L * q + Math.cos(ang) * bend]); }
  c.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${tone})`; c.fill(KIT.ribbon(pts, q => wmax * Math.pow(Math.sin(Math.PI * Math.min(1, q * 1.1)), 0.7) + 0.6));
};

// ---------- ink bleed / wash layer ----------
// fn(g) draws the shape on the scratch canvas (solid color is fine); grow 0..1 controls the bleeding: the outer-bleed blur widens with grow, the body blur tightens with grow.
// halo outer-bleed blur radius, haloA outer-bleed opacity, blur body blur, alpha overall opacity. Returns the scratch canvas (which can be reused to cut out reserved white).
// Pitfall: multiply is transparent, so ink lines behind show through the wash (the windowsill line showing through the cat's ears). First lay a layer of paper color inside the silhouette (clip, then drawImage the paper), then the wash = "reserve this area first".
P.inkWash = (c, key, grow, fn, { blur = 2, halo = 10, haloA = 0.22, alpha = 1 } = {}) => {
  const S = P.scratch('inkw_' + key), g = S.getContext('2d'); g.reset(); fn(g);
  c.save(); c.globalCompositeOperation = 'multiply';
  if (grow > 0) {
    c.globalAlpha = haloA * alpha * grow; c.filter = `blur(${(halo * (0.4 + grow)).toFixed(2)}px)`; c.drawImage(S, 0, 0);
    c.globalAlpha = alpha * ss(0, 0.6, grow); c.filter = `blur(${(blur * (1.6 - grow * 0.6)).toFixed(2)}px)`; c.drawImage(S, 0, 0);
  }
  c.filter = 'none'; c.restore();
  return S;
};

// ---------- long curved flowing strokes (Munch *The Scream*-style expressionism) ----------
// Seeds: a jittered cell grid, each seed carrying two random numbers [x, y, r1, r2]
P.flowSeeds = (cell = 24, seed = 5) => { const r = rng(seed), o = []; for (let y = -10; y < H + 10; y += cell) for (let x = -10; x < W + 10; x += cell) o.push([x + (r() - .5) * cell, y + (r() - .5) * cell, r(), r()]); return o; };
// For each seed: region(x,y,t) decides the region → take that region's params[reg] = [steps, step, width, alpha] → integrate along angle(x,y,t,reg); stop on leaving the region (clean region boundaries).
// color(reg, sx, sy, r1, t) returns [r,g,b]. No outlines, semi-transparent layered color — Munch painted thin long strokes; copying Van Gogh's dark outlines turns them into segmented caterpillar-like short strokes.
// Lay a flat fill in the same color family underneath first, so the gaps between strokes show the same hue rather than black. Length: steps 26–42, step 6–8, one stroke travels 200–300px.
P.flowLines = (c, seeds, { t = 0, region, angle, color, params, extraSteps = 8 }) => {
  c.lineCap = 'round'; c.lineJoin = 'round';
  for (const [sx, sy, r1, r2] of seeds) {
    const reg = region(sx, sy, t); const pr = params[reg]; if (!pr) continue; const [steps, step, width, alpha] = pr;
    const col = color(reg, sx, sy, r1, t);
    let x = sx, y = sy; c.beginPath(); c.moveTo(x, y);
    const n = steps + ((r2 * extraSteps) | 0);
    for (let i = 0; i < n; i++) { const a = angle(x, y, t, reg); x += Math.cos(a) * step; y += Math.sin(a) * step; if (region(x, y, t) !== reg) break; c.lineTo(x, y); }
    c.strokeStyle = P.rgb(col, alpha); c.lineWidth = width * (0.7 + r2 * 0.6); c.stroke();
  }
};

// ---------- watercolor wash (Ghibli-style background art) ----------
// Midpoint displacement: each round pushes the midpoint of every edge along its normal by an approximately Gaussian amount (sum of 3 uniform numbers), amplitude proportional to edge length, amp×0.6 per round
P.deform = (pts, depth, amp, r) => {
  let out = pts;
  for (let d = 0; d < depth; d++) {
    const n = [];
    for (let i = 0; i < out.length; i++) {
      const a = out[i], b = out[(i + 1) % out.length], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const g = (r() + r() + r() - 1.5) * amp * Math.min(1, len / 80), nx = -(b[1] - a[1]) / (len || 1), ny = (b[0] - a[0]) / (len || 1);
      n.push(a, [(a[0] + b[0]) / 2 + nx * g, (a[1] + b[1]) / 2 + ny * g]);
    }
    out = n; amp *= 0.6;
  }
  return out;
};
const fillPts = (g, pts) => { g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); };
// One wash: the base shape deformed 3 rounds; each layer deformed 2 more rounds and filled at low α (multiply = transparent pigment glazing), with a 1.6px same-color stroke at α=edge (pigment settling at the edge = water-mark edge).
// fill can be a gradient; opaque whites (window frames, clouds, tablecloths) use blend:'source-over', alpha .9.
// Common: big walls layers5 α.4 amp12; color blooms layers3 α.045 amp40; wooden boards layers3 α.5 amp3 edge.14.
// Pitfall: dark areas use heavily deformed polygons (amp 60), not assembled rectangles — rectangle seams give hard edges. Keep color blooms at no more than α .05×3 layers, or the room looks like moldy parchment.
P.watercolor = (g, pts, color, { layers = 7, alpha = 0.13, amp = 10, seed = 1, edge = 0.1, blend = 'multiply', fill } = {}) => {
  const r = rng(seed * 7919 + 13), base = P.deform(pts, 3, amp, r);
  g.save(); g.globalCompositeOperation = blend; g.lineJoin = 'round';
  for (let k = 0; k < layers; k++) {
    const q = P.deform(base, 2, amp * 0.55, r);
    fillPts(g, q); g.globalAlpha = alpha; g.fillStyle = fill || color; g.fill();
    if (edge) { g.globalAlpha = edge; g.strokeStyle = color; g.lineWidth = 1.6; g.stroke(); }
  }
  g.restore();
};
P.rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
P.ellipsePts = (cx, cy, rx, ry, n = 18) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * Math.PI * 2) * rx, cy + Math.sin(i / n * Math.PI * 2) * ry]);

// ---------- impasto bristle brush ----------
// One stroke = round(w/1.3) parallel fine bristles (each ±17 in brightness, both ends randomly shortened 0–25%) + a faint cast shadow along the lower side + scattered bright specks along the upper side → reads as "a thick dab of paint brushed out".
// Use only in lit areas (blonde hair, collars, porcelain, pearls, white fur). Pitfall: three neat lines "shadow + main stroke + bright ridge" read as white stickers / band-aids.
P.impasto = (c, pts, w, col, hi) => {
  const base = col.startsWith('#') ? P.hex(col) : [240, 230, 210];
  const A = pts[0], B = pts[pts.length - 1], ang = Math.atan2(B[1] - A[1], B[0] - A[0]), nx = -Math.sin(ang), ny = Math.cos(ang);
  const r = rng((A[0] * 13 + A[1] * 7) | 0), nb = Math.max(3, Math.round(w / 1.3));
  c.save(); c.lineCap = 'round';
  c.strokeStyle = 'rgba(40,18,6,.28)'; c.lineWidth = w * 0.9; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0] + nx * w * 0.45 + 1, p[1] + ny * w * 0.45 + 1.5) : c.moveTo(p[0] + nx * w * 0.45 + 1, p[1] + ny * w * 0.45 + 1.5)); c.stroke();
  for (let k = 0; k < nb; k++) {
    const o = (k / (nb - 1) - 0.5) * w, s0 = r() * 0.25, s1 = 1 - r() * 0.25, sh = (r() - 0.5) * 34 + (k < nb / 2 ? 14 : -10);
    c.strokeStyle = P.rgb([base[0] + sh, base[1] + sh, base[2] + sh * 0.8], 0.55 + r() * 0.4); c.lineWidth = 1.4 + r() * 1.2; c.beginPath();
    const n = pts.length - 1; for (let i = 0; i <= 8; i++) { const q = lerp(s0, s1, i / 8), j = Math.min(n - 1, Math.floor(q * n)), f = q * n - j, x = lerp(pts[j][0], pts[j + 1][0], f) + nx * o, y = lerp(pts[j][1], pts[j + 1][1], f) + ny * o; i ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.stroke();
  }
  c.fillStyle = hi || 'rgba(255,250,232,.7)'; for (let k = 0; k < 2 + w / 3; k++) { const q = r(), x = lerp(A[0], B[0], q) - nx * w * 0.3, y = lerp(A[1], B[1], q) - ny * w * 0.3; c.beginPath(); c.arc(x, y, 0.9 + r(), 0, Math.PI * 2); c.fill(); }
  c.restore();
};

// ---------- scissor polylines ----------
// Resample a closed loop of points by step, add ±amp seeded jitter to each point, join with straight lines → the edge of hand-cut paper. RIG parts can be fed in via path.pts to recut them.
P.cut = (pts, seed, step = 18, amp = 2.5) => {
  const r = rng(seed), out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / step));
    for (let k = 0; k < n; k++) { const q = k / n; out.push([lerp(a[0], b[0], q) + (r() - 0.5) * amp * 2, lerp(a[1], b[1], q) + (r() - 0.5) * amp * 2]); }
  }
  return U.poly(out);
};
})();
