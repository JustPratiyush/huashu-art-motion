// SpaceX's 24 years · single-style version (vox). Segment lengths come from spacex/timing.js (the same narration as the mixed-style version); don't edit segment lengths by hand.
// Each segment's entering transition is written by that segment's scene file: ERAS.find(e => e.id === 'sXX').transition = { type, dur } (single-style films often use same = a camera move on the same canvas is the transition).
window.PUNCH = 0;
window.SCENE_LIBS = ['spacex/timing.js', 'spacex/tm.js', 'spacex/rockets.js', 'spacex_vox/common.js'];   // This film's own shared scripts can be appended here (e.g., 'spacex_vox/common.js')
window.SCENE_DIR = 'spacex_vox/scenes';
window.ERAS = ['s01','s02','s03','s04','s05','s06','s07','s08','s09','s10','s11','s12'].map(id => ({ id, get dur() { return TIMING.seg[id].dur; } }));
