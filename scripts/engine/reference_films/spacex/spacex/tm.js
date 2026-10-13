// Narration sync: TM.cue('s03', '2007年') = the moment these characters start being spoken (segment-local seconds, lt).
// TM.end('s03', '2007年') = the moment they finish being spoken. TM.dur('s03') is the segment length; TM.vo('s03') = [narration start, narration end] (local seconds).
// The key must be an exact substring of the segment's subtitle text (first occurrence); a wrong key logs console.error and fails the render.
window.TM = (() => {
  const seg = id => { const s = TIMING.seg[id]; if (!s) throw new Error('TIMING has no segment ' + id); return s; };
  function find(id, key, which) {
    const s = seg(id), i = s.text.indexOf(key);
    if (i < 0) { console.error(`TM: the subtitles of segment ${id} don't contain "${key}"`); return 0; }
    const j = which === 'end' ? i + key.length - 1 : i;
    return which === 'end' ? s.charEnd[j] : s.charStart[j];
  }
  return {
    cue: (id, key) => find(id, key, 'start'),
    end: (id, key) => find(id, key, 'end'),
    dur: id => seg(id).dur,
    vo: id => [seg(id).voStart, seg(id).voEnd],
    text: id => seg(id).text,
  };
})();
