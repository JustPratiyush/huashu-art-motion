// Whole-film theme palettes: spec.theme gives a name (or {name, keys to override} / a full 6-key object), clip.js resolves it into ctx.pal, and all 8 grammars color by it —
// when a film is assembled from several grammars, the background, text and accent colors are one set, instead of each bringing its own hard-coded colors.
// Each set has 6 keys: bg background · surface card/paper/panel · ink main text · sub secondary text and lines · accent · accent2 second accent.
// All other supporting colors derive from these 6 (PAL.mix for lightness, PAL.alpha for transparency), never introducing hues outside the palette.
(() => {
window.PALETTES = {
  paper:   { bg: '#F3EDE2', surface: '#FBF8F2', ink: '#1B1A17', sub: '#6B655B', accent: '#C8402F', accent2: '#2F5D62' },   // paper
  poster:  { bg: '#FFD23F', surface: '#FFF6D6', ink: '#111111', sub: '#4A4433', accent: '#FF5A36', accent2: '#14213D' },   // poster yellow
  ink:     { bg: '#121417', surface: '#1E2226', ink: '#F2EFE8', sub: '#A39E93', accent: '#F2B33D', accent2: '#5FB3A1' },   // dark ink
  navy:    { bg: '#0D1B2A', surface: '#16293D', ink: '#EEF3F6', sub: '#8FA3B3', accent: '#5CC8E0', accent2: '#F2A93B' },   // navy (flat, no gradient)
  bauhaus: { bg: '#EFE9DD', surface: '#FFFFFF', ink: '#111111', sub: '#555555', accent: '#D62828', accent2: '#1D4E89' },   // Bauhaus
  snow:    { bg: '#E9EEF0', surface: '#FFFFFF', ink: '#1F2A30', sub: '#5E6B72', accent: '#D9482B', accent2: '#3E7C8C' },   // snowfield
  wood:    { bg: '#EDE3D1', surface: '#F7F1E6', ink: '#2B2622', sub: '#7A6E62', accent: '#C4552D', accent2: '#3F5B4B' },   // warm wood
  chalk:   { bg: '#23302B', surface: '#2E3D37', ink: '#F1EFE6', sub: '#A9B3AA', accent: '#F4D35E', accent2: '#E87D5A' },   // blackboard
};
const KEYS = ['bg', 'surface', 'ink', 'sub', 'accent', 'accent2'];
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const rgb = h => { h = String(h).trim().replace('#', ''); if (h.length === 3) h = [...h].map(x => x + x).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const hex = v => '#' + v.map(x => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('');
const lin = x => { x /= 255; return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
const PAL = window.PAL = {
  KEYS,
  names: () => Object.keys(window.PALETTES),
  rgb, hex,
  mix: (a, b, t) => { const x = rgb(a), y = rgb(b); return hex(x.map((v, i) => v + (y[i] - v) * t)); },   // a→b by t (0..1), returns hex
  alpha: (c, a) => { const v = rgb(c); return `rgba(${v[0]},${v[1]},${v[2]},${a})`; },
  lum: c => { const [r, g, b] = rgb(c).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; },   // WCAG relative luminance
  contrast: (a, b) => { const x = PAL.lum(a), y = PAL.lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); },
  dark: p => PAL.lum(p.bg) < 0.2,                                                            // dark-background palettes (ink / navy / chalk)
  on: (bg, cands) => cands.reduce((best, c) => PAL.contrast(bg, c) > PAL.contrast(bg, best) ? c : best),   // the text color that reads clearest on bg
  // spec.theme → full 6 keys (plus name). null / {} → null (each grammar uses its own default). A mistake → throws, and clip.js refuses to start
  resolve(theme) {
    if (theme == null || (typeof theme === 'object' && !Array.isArray(theme) && !Object.keys(theme).length)) return null;
    const avail = `Available: ${PAL.names().join(' / ')}`;
    let out;
    if (typeof theme === 'string') {
      if (!window.PALETTES[theme]) throw new Error(`spec.theme "${theme}" is not a palette name. ${avail}`);
      out = { name: theme, ...window.PALETTES[theme] };
    } else if (typeof theme === 'object' && !Array.isArray(theme)) {
      const unknown = Object.keys(theme).filter(k => k !== 'name' && !KEYS.includes(k));
      if (unknown.length) throw new Error(`spec.theme has unrecognized keys: ${unknown.join(' ')} (only name and ${KEYS.join(' ')} are recognized)`);
      if (theme.name != null) {
        if (!window.PALETTES[theme.name]) throw new Error(`spec.theme.name "${theme.name}" is not a palette name. ${avail}`);
        out = { name: theme.name, ...window.PALETTES[theme.name], ...theme };
      } else {
        const miss = KEYS.filter(k => theme[k] == null);
        if (miss.length) throw new Error(`The spec.theme object is missing ${miss.join(' ')}: write all 6 keys (${KEYS.join(' ')}), or add a name to fill missing keys from that palette. ${avail}`);
        out = { name: 'custom', ...theme };
      }
    } else throw new Error(`spec.theme must be a palette name (string) or an object; got ${JSON.stringify(theme)}. ${avail}`);
    const bad = KEYS.filter(k => !HEX.test(String(out[k])));
    if (bad.length) throw new Error(`spec.theme's ${bad.map(k => `${k}=${JSON.stringify(out[k])}`).join(' ')} is not a #rgb / #rrggbb color value`);
    for (const k of KEYS) out[k] = hex(rgb(out[k])).toUpperCase();
    return out;
  },
};
})();
