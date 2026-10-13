// Sample · long-scroll crossing film: one long horizontal scroll, several "world segments" joined end to end, the protagonist walking from left to right, the art style changing as he crosses each boundary.
// Only 3 segments are included here (Egyptian wall painting → Monet's "Japanese Bridge" → 8-bit pixels); the full film has 24 segments; see references/11-long-scroll-films.md for how it's done.
//   Preview index.html?film=demos/long_scroll   Render render.py --film demos/long_scroll --out long_scroll.mp4
// The skeleton lib/world.js handles the timeline, protagonist movement, a forward-only camera, the protagonist clipped at boundaries and the corner badge; each segment is one file segments/<id>.js calling WORLD.add({...}).
(() => {
  window.__bootErrors = window.__bootErrors || [];
  const base = 'demos/long_scroll/';
  const load = url => { const x = new XMLHttpRequest(); x.open('GET', url, false); x.send(); if (x.status !== 200) { __bootErrors.push(`${url} does not exist (HTTP ${x.status})`); return; }
    try { (0, eval)(x.responseText + `\n//# sourceURL=${url}`); } catch (e) { __bootErrors.push(`${url} failed to run ${e && e.stack || e}`); } };
  load(base + 'lib/crossing.js');                 // XING: character frame libraries, brushstroke materials, the Monet world
  load(base + 'lib/acts.js');                     // ACT: small scripted-scene tools such as the skipping-stone trajectory
  load(base + 'lib/world.js');                    // WORLD: the long-scroll skeleton
  // Film order: to reorder or add segments, change only this (adding a segment = put a file in segments/ and write its id here)
  window.FILM_ORDER = ['02_egypt', '28_monet', '14_8bit'];
  for (const id of window.FILM_ORDER) { const n = WORLD.segs.length; load(`${base}segments/${id}.js`);
    if (WORLD.segs.length === n || WORLD.segs[WORLD.segs.length - 1].id !== id) __bootErrors.push(`segments/${id}.js has no WORLD.add({ id: '${id}', ... })`); }
  // The frame libraries each segment uses (hero.walk, acts[].key, sprites) are registered as assets in one go and all loaded before the engine starts
  const sprites = new Set(); WORLD.segs.forEach(s => { if (s.hero && s.hero.walk) sprites.add(s.hero.walk); (s.acts || []).forEach(a => a.key && sprites.add(a.key)); (s.sprites || []).forEach(k => sprites.add(k)); });
  try { window.EXTRA_ASSETS = (window.EXTRA_ASSETS || []).concat(XING.sprites([...sprites])); } catch (e) { __bootErrors.push('frame library missing: ' + e.message); }
  WORLD.layout();
  window.PUNCH = 0;
  window.ERAS = [{ id: 'film', dur: WORLD.total, draw: (c, lt, t) => WORLD.draw(c, t) }];
})();
