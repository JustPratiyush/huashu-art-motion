// Parameterized clip runtime: one spec (JSON) → an animation whose duration exactly equals spec.duration. Used as "animation segments" by narration video pipelines.
// Contract in references/09-video-animation-grammars.md "Clip contract". Differences from engine.js: no segment table / transitions, one draw(c, t, ctx) per grammar, canvas size read from the spec (portrait works too).
//
// spec = { grammar, duration, fps=30, width=1920, height=1080, safe?: {top,bottom,left,right (px, kept clear for subtitles/platform UI), fill? (paint the cleared edges this color)}, theme?, alpha?, data?, cues: [{at, kind, text?, sub?, data?, image?, frames?, fps?, dur?}] }
// spec.theme: the whole film's shared palette (lib/palettes.js) — a name (paper poster ink navy bauhaus snow wood chalk), {name, keys to override}, or all 6 keys {bg, surface, ink, sub, accent, accent2}.
//   Resolved into ctx.pal (all 6 keys + name), which each grammar colors by; a misspelled name / missing keys → fails to start. Omitted → ctx.pal = null, and each grammar uses its own default colors.
//   A grammar can declare legacyTheme(theme) → true: this theme is its own old syntax (t3's 'light' / 'dark' / old theme object), not resolved as a palette, and the grammar reads ctx.theme as before.
// Asset paths (render.py checks they exist and rewrites them with spec_assets.py): cue.image, cue.frames (frame sequence: directory or array of paths), data.image, data.character.frames (y4 frame library).
// Any one failing to load → fails to start and refuses to render (no blank frames). Getting assets in a grammar: ctx.still(q) = this cue's static image (the first frame if it has frames), ctx.frame(q, t) = the frame to draw at time t.
// Grammar files clips/<grammar>.js register CLIPS[grammar] = { init?(ctx), draw(c, t, ctx), safe?: true (only write it if you lay out by ctx.safe / ctx.box, otherwise spec.safe warns) }.
// Alignment convention (CLIP.lt): a cue's "reveal frame" = the frame containing at — the element is first visible on the frame at t = at, with its internal animation time counted from 1 frame before at.
(() => {
const cv = document.getElementById('c'), c = cv.getContext('2d');
window.__canvas = cv;
window.CLIPS = window.CLIPS || {};
const C = window.CLIP = {};
const fail = msg => { window.__bootFailed = msg; console.error('CLIP BOOT FAILED\n' + msg); };

// ---------- small tools for grammar files ----------
// In-clip time: the cue is first visible on the frame at at
C.lt = (t, at, fps) => t - at + 1 / fps;
// Progress: 0→1 over dur seconds from at (already >0 on the at frame)
C.p = (t, at, dur, fps) => U.clamp(C.lt(t, at, fps) / dur);
// Fit proportionally into a box (contain, no cropping): returns {x, y, w, h}
C.fit = (iw, ih, bx, by, bw, bh) => { const s = Math.min(bw / iw, bh / ih); const w = iw * s, h = ih * s; return { x: bx + (bw - w) / 2, y: by + (bh - h) / 2, w, h, s }; };
// Normalized rectangle [x,y,w,h] (0..1, relative to the image) → screen rectangle
C.sub = (r, box) => ({ x: box.x + r[0] * box.w, y: box.y + r[1] * box.h, w: r[2] * box.w, h: r[3] * box.h });
C.text = (cue, ...fallback) => (cue && (cue.text ?? cue.data?.text)) ?? fallback.find(v => v != null) ?? '';

async function boot() {
  let spec = window.CLIP_SPEC;
  if (!spec) {                                                           // preview: ?spec=<path relative to engine>
    const u = new URLSearchParams(location.search).get('spec');
    if (!u) return fail('No spec: render.py --spec injects window.CLIP_SPEC; for preview use clip.html?spec=examples/<name>.json');
    spec = await (await fetch(u)).json();
    const base = u.replace(/[^/]*$/, '');
    const fix = p => p && !/^(data:|https?:|\/)/.test(p) ? base + p : p;   // preview mode: frames must be written as arrays of paths (the browser can't list directories), and frame libraries as {frames: {pose: path}}
    (spec.cues || []).forEach(q => { if (q.image) q.image = fix(q.image); if (Array.isArray(q.frames)) q.frames = q.frames.map(fix); });
    if (spec.data && spec.data.image) spec.data.image = fix(spec.data.image);
    const ch = spec.data && spec.data.character; if (ch && typeof ch === 'object' && ch.frames && typeof ch.frames === 'object') for (const k in ch.frames) ch.frames[k] = fix(ch.frames[k]);
  }
  if (location.search.includes('render=1')) document.body.classList.add('render');
  const W = spec.width || 1920, H = spec.height || 1080, FPS = spec.fps || 30;
  if (!spec.grammar) return fail('spec is missing grammar');
  if (!(spec.duration > 0)) return fail('spec.duration must be > 0');
  cv.width = W; cv.height = H; U.setStage(W, H);
  // Grammar file (synchronous XHR + eval, with sourceURL so errors can be located)
  const x = new XMLHttpRequest(); x.open('GET', `clips/${spec.grammar}.js`, false);
  try { x.send(); } catch (e) { return fail('Request for the grammar file failed ' + e); }
  if (x.status !== 200) return fail(`No such grammar: clips/${spec.grammar}.js (HTTP ${x.status})`);
  try { (0, eval)(x.responseText + `\n//# sourceURL=clips/${spec.grammar}.js`); } catch (e) { return fail(`clips/${spec.grammar}.js threw an error ${e.stack || e}`); }
  const G = CLIPS[spec.grammar]; if (!G || typeof G.draw !== 'function') return fail(`clips/${spec.grammar}.js didn't register CLIPS['${spec.grammar}'] = { draw }`);
  // Theme palette: check it before loading assets, so a typo doesn't waste time waiting for images
  let pal = null;
  if (!(G.legacyTheme && G.legacyTheme(spec.theme))) { try { pal = PAL.resolve(spec.theme); } catch (e) { return fail(e.message); } }
  // Images
  const IMG = {}, urls = new Set();
  for (const q of (spec.cues || [])) {
    if (q.image) urls.add(q.image);
    if (q.frames != null) { if (!Array.isArray(q.frames) || !q.frames.length) return fail(`frames of cue ${q.kind} at=${q.at} must be a non-empty array of paths (render.py expands directories into arrays; preview mode only accepts arrays)`); q.frames.forEach(f => urls.add(f)); }
  }
  if (spec.data && spec.data.image) urls.add(spec.data.image);
  const chr = spec.data && spec.data.character;
  if (chr && typeof chr === 'object') { if (!chr.frames || typeof chr.frames !== 'object' || Array.isArray(chr.frames)) return fail('When data.character is an object it needs frames: {pose name: image path} (or give render.py a frame-library directory)');
    Object.values(chr.frames).forEach(f => urls.add(f)); }
  try { await Promise.all([...urls].map(u => new Promise((res, rej) => { const im = new Image(); im.onload = () => { IMG[u] = im; res(); }; im.onerror = () => rej(u); im.src = u; }))); }
  catch (u) { return fail('Image failed to load: ' + u); }
  // Fonts + glyph check (missing glyphs for text in the spec only warn: falling back to system fonts still renders, but looks different on another machine)
  for (const f of (window.FONT_FACES || [])) { const ff = new FontFace(f.family, `url(${f.url})`, f.desc || {}); await ff.load(); document.fonts.add(ff); }
  await document.fonts.ready; await U.loadCmaps();
  const cues0 = (spec.cues || []).map((q, i) => ({ ...q, i, at: +q.at || 0 })).sort((a, b) => a.at - b.at || a.i - b.i);
  for (const q of cues0) if (q.at > spec.duration + 1e-9) console.warn(`cue ${q.kind} at=${q.at} is beyond the clip duration ${spec.duration}s, invisible, and dropped (it takes no layout space)`);
  const cues = cues0.filter(q => q.at <= spec.duration + 1e-9);   // invisible cues don't enter the grammar: otherwise they'd still take layout space and the progress track would still count them
  // number's caption field used to be read differently per grammar (t2/t3 read text, y5 read sub), and a wrong one silently showed no text. Unified: text and sub are aliases, and data.text counts too
  for (const q of cues) if (q.kind === 'number') { const cap = q.text ?? q.sub ?? (q.data && q.data.text); if (cap != null) { q.text = cap; q.sub = cap; } }
  const safe = { top: 0, bottom: 0, left: 0, right: 0, ...(spec.safe || {}) };   // edges to keep clear (px): pipeline burned-in subtitles and platform UI sit here, so grammars with text don't lay out into them
  const box = { x: safe.left, y: safe.top, w: W - safe.left - safe.right, h: H - safe.top - safe.bottom };   // the content box after clearing, used by grammars for layout (ctx.box)
  const ctx = { spec, data: spec.data || {}, theme: spec.theme || {}, pal, cues, W, H, FPS, u: Math.min(W, H) / 1080, portrait: H > W, alpha: !!spec.alpha, IMG, dur: spec.duration, safe, box,
    of: (...kinds) => cues.filter(q => kinds.includes(q.kind)), lt: (t, at) => C.lt(t, at, FPS), p: (t, at, d) => C.p(t, at, d, FPS),
    // Assets: still = the one that fixes the layout (image, or the first frame of frames); frame = which frame to draw at time t (frames play from at at q.fps (default 30), stop on the last frame when done, loop with q.loop)
    still: q => q && (q.image ? IMG[q.image] : q.frames ? IMG[q.frames[0]] : null),
    frame: (q, t) => !q ? null : q.frames ? MD.frameAt(q.frames.map(f => IMG[f]), t - q.at, q.fps || 30, !!q.loop) : q.image ? IMG[q.image] : null };
  if (G.fonts) { const txt = cues.map(q => [q.text, q.sub, q.data && q.data.text].filter(Boolean).join('')).join('') + JSON.stringify(spec.data || {});
    for (const fam of G.fonts) { const miss = U.missingGlyphs(fam, [...txt].filter(ch => ch.codePointAt(0) >= 0x2E80).join(''));   /* only check CJK and full-width symbols: Latin/Greek/math symbols have their own fonts per grammar */ if (miss.length) console.warn(`Font "${fam}" is missing glyphs: ${miss.join('')} (falls back to system fonts; common characters are already in the GB2312 subset, add rare ones with scripts/font_subset.py --text)`); } }
  if (spec.safe && (safe.top || safe.bottom || safe.left || safe.right) && !G.safe)
    console.warn(`Grammar ${spec.grammar} doesn't support safe yet (no safe: true in the grammar object), so spec.safe is ignored: the subtitle band may cover text`);
  if (G.init) G.init(ctx);
  window.CLIP_CTX = ctx;
  window.__total = spec.duration; window.__fps = FPS; window.__size = [W, H];
  // safe.fill: paint the cleared edges this color (in portrait films this turns a chart into the same "card" as adjacent contained material, with the film's background outside); not painted in transparent mode
  const band = (safe.fill && !spec.alpha) ? (cc => { cc.fillStyle = safe.fill; const { top: t0, bottom: b0, left: l0, right: r0 } = safe;
    if (t0) cc.fillRect(0, 0, W, t0); if (b0) cc.fillRect(0, H - b0, W, b0); if (l0) cc.fillRect(0, 0, l0, H); if (r0) cc.fillRect(W - r0, 0, r0, H); }) : null;
  window.renderFrame = t => { c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H); c.save(); G.draw(c, t, ctx); c.restore(); if (band) band(c); };
  window.prepare = async () => {};
  window.__ready = true;
  window.renderFrame(0);
  const sc = document.getElementById('scrub'), tt = document.getElementById('tt'); sc.max = spec.duration; sc.step = 1 / FPS;
  sc.oninput = () => { window.renderFrame(+sc.value); tt.textContent = (+sc.value).toFixed(3); };
}
boot().catch(e => fail(String(e && e.stack || e)));
})();
