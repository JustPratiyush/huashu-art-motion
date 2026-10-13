// Load scenes/<id>.js by id; load transitions/<type>.js automatically by transition.type (synchronous XHR, so everything is registered before the engine starts).
// If any scene file is missing, has a syntax error or isn't registered, or a transition name is in neither TRANSITIONS nor transitions/ → recorded in window.__bootErrors,
// the engine refuses to start, and render.py/qa.py exit with an error.
// (Migration test B hit this: a missing scene used to draw a "to be implemented" placeholder and render as usual, a whole 1.2 seconds of gray, found only from a 0.0% frame diff; a misspelled transition name silently fell back to a crossfade.)
(() => {
  window.SCENES = window.SCENES || {}; window.__bootErrors = [];
  const load = (url) => { const x = new XMLHttpRequest(); x.open('GET', url, false); try { x.send(); } catch (err) { return { err: `request failed ${err}` }; }
    if (x.status !== 200) return { err: `${url} doesn't exist (HTTP ${x.status})` };
    try { (0, eval)(x.responseText + `\n//# sourceURL=${url}`); } catch (err) { return { err: `${url} threw an error ${err && err.stack || err}` }; } return {}; };
  // A film can load its own shared scripts first (window.SCENE_LIBS, in order), with the scene file directory window.SCENE_DIR (default scenes).
  // Segments already registered as SCENES[id] in a shared script aren't looked up as separate scene files (that's how the demos/ films are organized).
  for (const f of window.SCENE_LIBS || []) { const r = load(f); if (r.err) __bootErrors.push(`shared script ${r.err}`); }
  const dir = window.SCENE_DIR || 'scenes';
  for (const e of ERAS) {
    if (!e.draw) {                                          // segments with an inline draw in eras don't need a file
      const r = SCENES[e.id] ? {} : load(`${dir}/${e.id}.js`);
      if (r.err) { __bootErrors.push(`${e.id}: ${r.err}`); continue; }
      const sc = SCENES[e.id];
      if (!sc || typeof sc.draw !== 'function') { __bootErrors.push(`${e.id}: the file has no SCENES['${e.id}'] = { draw(c, lt, t) }`); continue; }
      e.draw = sc.draw; if (sc.init) e.init = sc.init;
    }
    const ty = e.transition && e.transition.type;
    if (ty && !TRANSITIONS[ty]) {                            // the project's own transitions: put them in transitions/<type>.js, attaching a function of the same name to TRANSITIONS
      const r = load(`transitions/${ty}.js`);
      if (r.err || !TRANSITIONS[ty]) __bootErrors.push(`${e.id}: transition "${ty}" isn't in transitions.js and there's no transitions/${ty}.js (${r.err || 'the file did not register TRANSITIONS.' + ty})`);
    }
  }
})();
