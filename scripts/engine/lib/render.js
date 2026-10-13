// Renderers and light: halftone, pointillism, cel, comic shading, volume, long shadows, two-version light, light maps, shadow-puppet pieces, hand-cut displacement. All attached to PAINT (P).
// Sources: migration tests B (constructivism/Dalí/Hopper/Ghibli), C (Kirby/Seurat/Matisse), D (Rembrandt/shadow puppets/Shinkai).
//   P.halftoneGray(c, src, bx,by,bw,bh, cell, col, gain, ang)  grayscale photo halftone: 45° grid, dot diameter ∝ √darkness, all dots merged into one path and filled once (photo collage)
//   P.shadeDots(c, path, bx,by,bw,bh, cell, col, f)           halftone dots within a path by a function f(x,y)∈0..1 (halftone shading)
//   P.dotPattern(c, key, pitch, r, col, bg, angleDeg)          Ben-Day dots via createPattern, with screen angle (four-color printing C15° M75° Y0° K45°)
//   P.pointillism(c, src, opt)                                 Seurat pointillism = optical mixing: equal-size dots, pairs from a pure palette placed side by side to approximate the target color (P.dabs is Impressionism, not pointillism)
//   P.clipBeside(c, path, dx, dy)                              clip to "path minus a translated copy of itself" — the common base of cel shadow bands, Kirby black blocks and rim light
//   P.cel(c, p, base, shade, rim, opt)                         two-tone cel + rim light (Shinkai, Ghibli characters)
//   P.kirbyShade(g, path, opt)                                 Kirby spotted blacks + feathering
//   P.vol(c, path, x0,y0,x1,y1, a, b, occl, blur)              volume fill: linear gradient + blurred dark edge inside the path (academic, no outlines)
//   P.castShadow(c, layers, opt)                               sheared-affine long shadows: silhouettes cast onto the ground (Dalí's long shadows, dusk)
//   P.litClip(c, polys, drawLit)                               two-version light clipping: draw the shadow version first, then the lit version inside the light-patch polygons (Hopper's hard light blocks)
//   P.pool / P.lightMap / P.applyLight                         whole-frame multiplied light map: ambient base + lighter pools of light + multiply (Rembrandt, candlelight, night scenes)
//   P.carve / P.piece / P.stamp                                shadow puppets: fill the piece → carve cut-outs → add the leather rim → outline; printing onto the screen = soft shadow + multiply (silhouette/cut-out styles)
//   P.roughen(layer, box, opt)                                 whole-layer low-frequency pixel displacement: makes RIG characters' edges look hand-cut too (Matisse)
//   P.glowStroke(c, col, w, blur)                              neon tube: stroke the current path with shadowBlur for the glow (add a thin near-white core line and it's a tube)
(() => {
const TAU = Math.PI * 2;
let W = 1920, H = 1080; U.onStage((w, h) => { W = w; H = h; });   // canvas size follows U.setStage (default 1920×1080)
const P = window.PAINT;
const { clamp, lerp, rng } = U;

// ---------- halftone ----------
P.halftoneGray = (c, src, bx, by, bw, bh, cell, col, gain = 0.78, ang = Math.PI / 4) => {
  bx |= 0; by |= 0; bw |= 0; bh |= 0;
  const d = src.getContext('2d', { willReadFrequently: true }).getImageData(bx, by, bw, bh).data;
  const ca = Math.cos(ang), sa = Math.sin(ang), cx = bx + bw / 2, cy = by + bh / 2, R = Math.hypot(bw, bh) / 2;
  c.beginPath();
  for (let v = -R; v <= R; v += cell) for (let u = -R; u <= R; u += cell) {
    const x = cx + u * ca - v * sa, y = cy + u * sa + v * ca, ix = (x - bx) | 0, iy = (y - by) | 0;
    if (ix < 0 || iy < 0 || ix >= bw || iy >= bh) continue;
    const i = (iy * bw + ix) * 4; if (d[i + 3] < 128) continue;
    const L = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255, r = cell * gain * Math.sqrt(Math.max(0, 1 - L));
    if (r < 0.45) continue; c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU);
  }
  c.fillStyle = col; c.fill();
};
P.shadeDots = (c, path, bx, by, bw, bh, cell, col, f) => {
  c.save(); c.clip(path); c.beginPath();
  for (let y = by; y < by + bh; y += cell) for (let x = bx + ((((y - by) / cell) | 0) % 2) * cell / 2; x < bx + bw; x += cell) {
    const r = cell * 0.62 * f(x, y); if (r < 0.5) continue; c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU);
  }
  c.fillStyle = col; c.fill(); c.restore();
};
P.dotPattern = (c, key, pitch, r, col, bg, angleDeg = 45) => {
  const tile = P.cached('dotpat_' + key, pitch, pitch, g => { if (bg) { g.fillStyle = bg; g.fillRect(0, 0, pitch, pitch); } g.fillStyle = col;
    [[0, 0], [pitch, 0], [0, pitch], [pitch, pitch]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }); });
  const p = c.createPattern(tile, 'repeat');
  p.setTransform(new DOMMatrix().rotate(angleDeg));
  return p;
};

// ---------- pointillism (Seurat: optical mixing) ----------
// Fixed hexagonal grid, equal-size dots (pitch 10, rad 4.5, position ±1.2px static jitter); each dot picks a pair (i,j) from the pure palette pal:
//   project the target color onto Pj→Pi for a continuous ratio w (clamped .2–.8), with a penalty of 0.004·|Pi−Pj|² added to the distance (don't mix gray from black and white dots); cell hash < w picks i, otherwise j.
// Before choosing colors, add ±colorJitter hash jitter to the target color — the boundary between paired colors becomes interleaved dots without vertical color bands (both pitfalls were hit: preferring pure colors → bands; continuous ratios → whole columns switching).
// compRate of dots switch to the complementary color comp[idx]; light seeping: where brightness differs by >45 from the point at (+14,+6), put a white dot on the bright side and a dark dot on the dark side.
// Areas where shimmer(x,y) is true reroll their hash at fps (glinting water); a flicker fraction of dots switches to the paired color at fps (the air trembling; too low and it's judged "basically frozen").
// The palette must include tints (colors mixed with white), otherwise a bright wall decomposes into white + skin tone + scattered blue dots, like snow noise. About 24,000 dots, one Path2D per color filled once, about 100ms per frame.
const pointCache = new WeakMap();
P.pointillism = (c, src, { pal, comp = {}, pitch = 10, rad = 4.5, posJitter = 2.4, colorJitter = 40, compRate = 0.08, flicker = 0.07, fps = 6, t = 0, shimmer, white = 12, dark = 0, bleed = 45 } = {}) => {
  const PAL = pal.map(v => typeof v === 'string' ? P.hex(v) : v);
  let cache = pointCache.get(pal); if (!cache) { cache = new Map(); pointCache.set(pal, cache); }
  const pick = (r, g, b) => {
    const key = (r >> 3) << 10 | (g >> 3) << 5 | (b >> 3);
    let v = cache.get(key); if (v) return v;
    let best = 1e18, bi = 0, bj = 0, bw = 1;
    for (let i = 0; i < PAL.length; i++) for (let j = i + 1; j < PAL.length; j++) {
      const pi = PAL[i], pj = PAL[j], ex = pi[0] - pj[0], ey = pi[1] - pj[1], ez = pi[2] - pj[2];
      const w = clamp(((r - pj[0]) * ex + (g - pj[1]) * ey + (b - pj[2]) * ez) / (ex * ex + ey * ey + ez * ez + 1e-6), 0.2, 0.8);
      const dr = pj[0] + w * ex - r, dg = pj[1] + w * ey - g, db = pj[2] + w * ez - b;
      const d = dr * dr * 0.9 + dg * dg * 1.2 + db * db * 0.8 + ex * ex * 0.004 + ey * ey * 0.004 + ez * ez * 0.004;
      if (d < best) { best = d; bi = i; bj = j; bw = w; }
    }
    v = [bi, bj, bw]; cache.set(key, v); return v;
  };
  const sd = src.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, W, H).data;
  const L = (x, y) => { const i = (clamp(y | 0, 0, H - 1) * W + clamp(x | 0, 0, W - 1)) * 4; return sd[i] * 0.3 + sd[i + 1] * 0.59 + sd[i + 2] * 0.11; };
  const paths = PAL.map(() => new Path2D()), st = Math.floor(t * fps), ROWH = pitch * 0.866, hj = posJitter / 2;
  for (let j = 0, y = 0; y < H + ROWH; j++, y += ROWH) for (let i = 0, x = (j % 2) * pitch / 2; x < W + pitch; i++, x += pitch) {
    const jx = (U.hash(i, j * 7 + 1) - 0.5) * 2 * hj, jy = (U.hash(i * 3, j + 5) - 0.5) * 2 * hj, px = x + jx, py = y + jy;
    const k = (clamp(py | 0, 0, H - 1) * W + clamp(px | 0, 0, W - 1)) * 4;
    const dj = (U.hash(i * 7 + 3, j * 11) - 0.5) * colorJitter;
    const [a, bb, w] = pick(clamp(sd[k] + dj, 0, 255), clamp(sd[k + 1] + dj * 0.8, 0, 255), clamp(sd[k + 2] - dj * 0.6, 0, 255));
    const hseed = shimmer && shimmer(px, py) ? U.hash(i + st * 977, j) : U.hash(i, j);
    let idx = hseed < w ? a : bb;
    const h2 = U.hash(i * 5 + 2, j * 3 + 9);
    if (h2 < compRate && comp[idx] != null) idx = comp[idx];
    else if (U.hash(i * 13 + st * 31, j * 17) < flicker) idx = (U.hash(i, j + st) < w) ? bb : a;
    else { const dl = L(px, py) - L(px + 14, py + 6); if (Math.abs(dl) > bleed && h2 < 0.45) idx = dl > 0 ? white : dark; }
    paths[idx].moveTo(px + rad, py); paths[idx].arc(px, py, rad, 0, TAU);
  }
  paths.forEach((p, k) => { c.fillStyle = P.rgb(PAL[k]); c.fill(p); });
};

// ---------- cel / comic shading ----------
let BIG; U.onStage((w, h) => { BIG = new Path2D(); BIG.rect(-60, -60, w + 120, h + 120); });   // a rectangle 60px bigger than the canvas on each side, following the canvas size
// Clip to path ∩ ¬translate(path, dx, dy): leaves a band outside the side facing (dx,dy) (when light comes from -(dx,dy), that's the shadow band on the dark side)
P.clipBeside = (c, path, dx, dy) => { const m = new Path2D(); m.addPath(BIG); m.addPath(path, new DOMMatrix().translate(dx, dy)); c.clip(path); c.clip(m, 'evenodd'); };
// Base color → hard shadow band on the dark side (width sd; light direction (lx,ly) points away from the light: lx=-1 means light from the left and shadow on the right) → rim light on the lit side (width rw) → fine outline.
// cel each part in order, so occlusion comes out right naturally without visibleLines. Backlit (a cat under the window): flip lx/ly and add a lighter warm rim.
P.cel = (c, p, base, shade, rim, { sd = 22, rw = 7, line = '#6a4632', lw = 2.2, lx = -1, ly = -0.55 } = {}) => {
  if (!p) return;
  c.fillStyle = base; c.fill(p);
  if (shade) { c.save(); P.clipBeside(c, p, lx * sd, ly * sd); c.fillStyle = shade; c.fill(p); c.restore(); }
  if (rim) { c.save(); P.clipBeside(c, p, -lx * rw, -ly * rw); c.fillStyle = rim; c.fill(p); c.restore(); }
  if (lw) { c.strokeStyle = line; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke(p); }
};
// Kirby: light points toward the light source (default top left); black block = path ∩ ¬shift(d1), feathering band = parallel lines along the light direction (spacing gap) within path ∩ ¬shift(d2)
P.kirbyShade = (g, path, { d1 = 14, d2 = 30, gap = 9, light = [-0.86, -0.5], ink = '#141212', lw = 2.6 } = {}) => {
  g.save(); P.clipBeside(g, path, light[0] * d2, light[1] * d2);
  g.strokeStyle = ink; g.lineWidth = lw; g.lineCap = 'butt'; g.beginPath();
  const a = Math.atan2(light[1], light[0]), nx = -Math.sin(a), ny = Math.cos(a);
  for (let k = -260; k < 260; k++) { const ox = 960 + nx * k * gap, oy = 540 + ny * k * gap; g.moveTo(ox - light[0] * 1400, oy - light[1] * 1400); g.lineTo(ox + light[0] * 1400, oy + light[1] * 1400); }
  g.stroke(); g.restore();
  g.save(); P.clipBeside(g, path, light[0] * d1, light[1] * d1); g.fillStyle = ink; g.fillRect(0, 0, W, H); g.restore();
};

// ---------- volume / shadows / light ----------
P.vol = (c, path, x0, y0, x1, y1, a, b, occl = 'rgba(40,20,10,.45)', blur = 14) => {
  const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b);
  c.fillStyle = g; c.fill(path);
  if (occl) { c.save(); c.clip(path); c.shadowColor = occl; c.shadowBlur = blur; c.strokeStyle = occl; c.lineWidth = blur * 0.6; c.stroke(path); c.restore(); }
};
// layers: [[yg, g => { draw this group of objects' silhouettes in black on g }], ...], where yg is the group's ground line.
// Sheared affine y' = yg − ky·(yg − y), x' = x − kx·(height in the y' direction): shadows lie toward the back right (the sun is low at the front left); bigger kx = longer shadows (dusk).
// All silhouettes are first drawn into one offscreen layer (solid black), then laid on as a whole at alpha, so overlaps don't get darker; only below clipY is the ground. Pitfall: ky>0 casting toward the viewer gets swallowed by the bottom of the frame.
P.castShadow = (c, layers, { kx = 1, ky = 0.22, clipY = 0, alpha = 0.55, blur = 1.5, key = 'castShadow' } = {}) => {
  const S = P.scratch(key), g = S.getContext('2d'); g.reset(); g.clearRect(0, 0, W, H); g.fillStyle = '#000'; g.strokeStyle = '#000';
  for (const [yg, fn] of layers) { g.setTransform(1, 0, -kx, ky, kx * yg, yg * (1 - ky)); fn(g); }
  g.setTransform(1, 0, 0, 1, 0, 0);
  c.save(); c.beginPath(); c.rect(0, clipY, W, H); c.clip(); c.globalAlpha = alpha; if (blur) c.filter = `blur(${blur}px)`; c.drawImage(S, 0, 0); c.restore();
};
// Two-version light clipping: first paint the whole picture as the shadow version, then clip to the light-patch polygons (several allowed, translatable each frame) and paint the lit version → hard light/shadow edges that can move as a whole.
// Same for figures: paint them again in lit colors inside drawLit. A figure's shadow on the wall = the silhouette translated, source-in the shadow version, then drawn back into the light patch.
P.litClip = (c, polys, drawLit) => {
  c.save(); c.beginPath(); polys.forEach(pp => { pp.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.closePath(); }); c.clip(); drawLit(c); c.restore();
};
// Light pool: a radial-gradient blob of light (col is an 'r,g,b' string)
P.pool = (g, x, y, r, col, a) => { const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, `rgba(${col},${a})`); rg.addColorStop(0.45, `rgba(${col},${a * 0.55})`); rg.addColorStop(1, `rgba(${col},0)`); g.fillStyle = rg; g.fillRect(x - r, y - r, 2 * r, 2 * r); };
// Light map: ambient as the base (ambient light, about rgb(30,21,13) = 0.13 for Rembrandt), with light pools layered by P.pool in fn(g) (already lighter), returns the canvas
P.lightMap = (key, ambient, fn) => {
  const S = P.scratch('light_' + key), g = S.getContext('2d'); g.reset();
  g.fillStyle = ambient; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'lighter'; fn(g); g.globalCompositeOperation = 'source-over';
  return S;
};
// Multiply the whole picture by light: lit underdrawing × light map. All chiaroscuro, candlelight and night scenes do this — far more unified than shading each object separately.
P.applyLight = (c, map) => { c.save(); c.globalCompositeOperation = 'multiply'; c.drawImage(map, 0, 0); c.restore(); };

// ---------- shadow puppets / cut-outs ----------
// Carving library (drawn with destination-out inside a clip): dots fish-roe dots, flowers medallion flowers, clouds cloud scrolls, lattice, lines carved lines
P.carve = {
  dots(g, x0, y0, x1, y1, s = 18, r = 3.2) { for (let y = y0; y < y1; y += s) for (let x = x0 + ((y / s | 0) % 2) * s / 2; x < x1; x += s) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } },
  flowers(g, x0, y0, x1, y1, s = 46, r = 5) { for (let y = y0; y < y1; y += s) for (let x = x0 + ((y / s | 0) % 2) * s / 2; x < x1; x += s) { for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; g.beginPath(); g.ellipse(x + Math.cos(a) * r * 1.5, y + Math.sin(a) * r * 1.5, r, r * 0.6, a, 0, 7); g.fill(); } } },
  clouds(g, x0, y0, x1, y1, s = 40) { g.lineWidth = 3.4; g.lineCap = 'round'; for (let y = y0; y < y1; y += s) for (let x = x0 + ((y / s | 0) % 2) * s / 2; x < x1; x += s) { g.beginPath(); for (let a = 0; a < 7; a += 0.3) { const rr = 2 + a * 1.9; const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; a ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); } },
  lattice(g, x0, y0, x1, y1, s = 26, w = 12) { for (let y = y0; y < y1; y += s) for (let x = x0; x < x1; x += s) g.fillRect(x + (s - w) / 2, y + (s - w) / 2, w, w); },
  lines(g, segs, w = 3.2) { g.lineWidth = w; g.lineCap = 'round'; segs.forEach(sg => { g.beginPath(); sg.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.stroke(); }); },
};
// One leather piece: fill → carve(g) cuts out inside the clip → add a same-color leather rim of width edge (carving never cuts through the outline) → dark outline.
// White parts (the cat's white chest and paws) are simply cut out entirely, leaving only the leather rim — this applies to all silhouette/cut-out styles.
P.piece = (g, path, col, carve, { edge = 5, line = '#3a160a', lw = 2.6 } = {}) => {
  g.save(); g.fillStyle = col; g.fill(path);
  if (carve) { g.save(); g.clip(path); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; carve(g); g.restore(); }
  g.strokeStyle = col; g.lineWidth = edge * 2; g.lineJoin = 'round'; g.save(); g.clip(path); g.stroke(path); g.restore();
  g.strokeStyle = line; g.lineWidth = lw; g.stroke(path); g.restore();
};
// Print a layer of leather pieces onto the screen: first multiply an offset soft shadow (the blur of a piece not pressed fully against the screen), then multiply the body (transmitted light = screen color × leather color, so overlaps naturally darken)
P.stamp = (c, layer, { dx = 7, dy = 5, shadow = 0.28, blur = 6 } = {}) => {
  c.save(); c.globalCompositeOperation = 'multiply'; c.globalAlpha = shadow; c.filter = `blur(${blur}px)`; c.drawImage(layer, dx, dy); c.restore();
  c.save(); c.globalCompositeOperation = 'multiply'; c.drawImage(layer, 0, 0); c.restore();
};

// ---------- neon ----------
P.glowStroke = (c, col, w, blur) => { c.shadowColor = col; c.shadowBlur = blur; c.strokeStyle = col; c.lineWidth = w; c.stroke(); c.shadowBlur = 0; };

// ---------- hand-cut displacement ----------
// Static low-frequency displacement over layer's box=[x0,y0,x1,y1] (fbm frequency freq, amplitude amp px): when RIG characters can't use scissor polylines, the whole layer's edges still look hand-cut. About 15ms.
const fields = {};
P.roughen = (layer, box, { freq = 0.028, amp = 9, key = 'rough' } = {}) => {
  const [X0, Y0, X1, Y1] = box, w = X1 - X0, h = Y1 - Y0, fk = `${key}|${box}|${freq}|${amp}`;
  const f = fields[fk] || (fields[fk] = (() => { const o = { dx: new Int8Array(w * h), dy: new Int8Array(w * h) };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const gx = (x + X0) * freq, gy = (y + Y0) * freq; o.dx[y * w + x] = Math.round(P.fbm(gx, gy, 2) * amp); o.dy[y * w + x] = Math.round(P.fbm(gx + 40, gy + 17, 2) * amp); } return o; })());
  const g = layer.getContext('2d', { willReadFrequently: true });
  const src = g.getImageData(X0, Y0, w, h), out = g.createImageData(w, h), s = src.data, o = out.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const k = y * w + x, sx = clamp(x + f.dx[k], 0, w - 1), sy = clamp(y + f.dy[k], 0, h - 1), j = (sy * w + sx) * 4, i = k * 4;
    o[i] = s[j]; o[i + 1] = s[j + 1]; o[i + 2] = s[j + 2]; o[i + 3] = s[j + 3]; }
  g.putImageData(out, X0, Y0);
};
})();
