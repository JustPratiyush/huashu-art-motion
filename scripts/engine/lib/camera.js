// World camera CAM: an explainer film isn't "segment after segment + transitions" but "one continuous world canvas + one camera".
// Iron rule: the camera is computed only from whole-film time (or segment time), and the scene is redrawn in vector for the camera every frame — zoom transitions stay sharp forever, never blurring a 1920 bitmap enlarged 20×;
//       during a transition window the engine keeps drawing the previous segment into buffer A by t, so "the previous shot's camera keeps pushing" holds naturally (live push).
// cam = { x, y, z, r }: world point (x,y) lands at the center of the frame, zoom z (>1 pushes in), rotation r (radians) around the center. Defaults x=960, y=540, z=1, r=0.
(() => {
let W = 1920, H = 1080; U.onStage((w, h) => { W = w; H = h; });   // canvas size follows U.setStage (default 1920×1080)
const { clamp, lerp } = U;
const CAM = window.CAM = {};
const n = cam => ({ x: cam.x ?? W / 2, y: cam.y ?? H / 2, z: cam.z ?? 1, r: cam.r || 0 });

// Apply the camera transform to c (no save/restore; the caller is responsible)
CAM.apply = (c, cam) => { const k = n(cam); c.translate(W / 2, H / 2); if (k.r) c.rotate(k.r); c.scale(k.z, k.z); c.translate(-k.x, -k.y); };
// Draw fn(c) under the camera, with automatic save/restore
CAM.with = (c, cam, fn) => { c.save(); CAM.apply(c, cam); fn(c); c.restore(); };
// world → screen / screen → world
CAM.toScreen = (cam, x, y) => { const k = n(cam); let dx = (x - k.x) * k.z, dy = (y - k.y) * k.z; if (k.r) { const cs = Math.cos(k.r), sn = Math.sin(k.r); [dx, dy] = [dx * cs - dy * sn, dx * sn + dy * cs]; } return [W / 2 + dx, H / 2 + dy]; };
CAM.toWorld = (cam, sx, sy) => { const k = n(cam); let dx = sx - W / 2, dy = sy - H / 2; if (k.r) { const cs = Math.cos(-k.r), sn = Math.sin(-k.r); [dx, dy] = [dx * cs - dy * sn, dx * sn + dy * cs]; } return [k.x + dx / k.z, k.y + dy / k.z]; };

// ---------- zoom ----------
// Logarithmic interpolation: z0→z1 zooms by the same factor every frame, so the audience feels "constant-speed travel through scale"; linear interpolation is slow then violent. Every push/pull zoom uses it.
CAM.zlerp = (z0, z1, e) => z0 * Math.pow(z1 / z0, e);
// "Passing through a circular opening of radius r, with the opening covering the screen before the transition ends" needs a minimum magnification = distance from the opening's center to the farthest screen corner / r.
// With the opening at the center of the frame ≈ 1101/r (the card's "magnification ≥ 1100/radius"). Too small, and the opening doesn't cover the last frame, which jumps.
CAM.coverZoom = (r, cx = W / 2, cy = H / 2) => Math.max(Math.hypot(cx, cy), Math.hypot(W - cx, cy), Math.hypot(cx, H - cy), Math.hypot(W - cx, H - cy)) / r;
// Make world point (wx,wy) appear at screen (sx,sy) at zoom z: returns the camera. This is how something being pushed into moves smoothly to the center of the frame.
CAM.anchor = (wx, wy, z, sx, sy) => ({ x: wx - (sx - W / 2) / z, y: wy - (sy - H / 2) / z, z });
// Push into a world point: from the base camera, zoom interpolates logarithmically to Z (progress e); the point moves on screen from its original position toward the center (progress k, default = e; k=0 = push in place around it).
// Used for "diving into the lens" (y1), "push until the photo fills, then hard cut" (y2), "push into the latest data point" (t3, k=0).
CAM.pushTo = (base, wx, wy, Z, e, k = e, to = [W / 2, H / 2]) => {
  const s0 = CAM.toScreen(base, wx, wy), z = CAM.zlerp(n(base).z, Z, e);
  return CAM.anchor(wx, wy, z, lerp(s0[0], to[0], k), lerp(s0[1], to[1], k));
};

// ---------- keyframes ----------
// keys = [{t, x, y, z, r, ease}]; ease applies "from the previous key to this one", default cubicInOut; z uses logarithmic interpolation.
// Panning along a path (the Vox desk, pans/whips on a whiteboard) is a series of keyframes: smooth moves use sineInOut, long jumps cubicInOut + motion blur, following a line MO.longTail.
CAM.at = (keys, t) => {
  if (t <= keys[0].t) return { ...keys[0] };
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t <= b.t) { const e = (b.ease || MO.cubicInOut)(MO.seg(t, a.t, b.t));
      return { x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e), z: CAM.zlerp(a.z, b.z, e), r: lerp(a.r || 0, b.r || 0, e), v: e }; }
  }
  return { ...keys[keys.length - 1] };
};

// ---------- camera move table (for explainer films; when to use which, see references/camera-language.md) ----------
// The default is transition moves: slow push push, find-next glide, pull out pull (0.6–1.5s, sineInOut / long tail); accent moves: fast push punch, fast move pan, slam slam,
// reserved for reveals, numbers, twists. Durations are in MO.PULSE. Push-ins in a film need give and take: after pushing in, switch away with pull, glide or a hard cut; don't push inward shot after shot.
// CAM.track(base, events, t) → cam: base is the starting camera {x, y, z}; events are camera moves sorted by time, and the camera is computed only from t (deterministic, frames can be skipped).
// Each move starts from "the camera when the previous move ended" and settles at at + dur; when two moves are too close (the next starts before the previous finishes), the next continues from the previous one's current position.
//   {at, kind: 'push', k?, x?, y?, dur?}    slow push (the default when no kind is given): z multiplied by (1+k) (k default 0.2), 0.9s sineInOut; with x, y it also moves this world point to the center of the frame.
//   {at, kind: 'pull', k?, x?, y?, z?, dur?} pull out: z multiplied by (1+k) (k default -1/6, exactly cancelling one default slow push; the most reliable way back to the whole view is z: base.z), 1.1s long tail. For returning to the whole view after pushing in, and closing a section.
//   {at, kind: 'glide', x, y, dur?}         find the next piece: zoom unchanged, the center of the frame moves smoothly to world point (x, y), 0.7s sineInOut. Moving from one piece to the next on the same wall.
//   {at, kind: 'to', x?, y?, z?, dur?, ease?} push to a given camera (pushing into part of a screenshot: compute z with MD.zoomFor); default 0.9s sineInOut; writing dur: MO.PULSE.punch makes it an accent.
//   {at, kind: 'punch', k?, x?, y?, dur?}   fast push (accent): 0.28s cubicInOut, k default 0.25 (0.18–0.32). k can be negative (a fast pull).
//   {at, kind: 'pan', x, y, dur?}            fast move (accent): 0.30s at the same zoom. For sudden shifts of gaze and comic rhythm.
//   {at, kind: 'slam', dur?, from?}          whole-frame slam: z additionally multiplied by MO.slamK (1.55→0.94→1.0, 0.17s). For the frame where big text, a number or a stamp lands.
//   {at, kind: 'shake', amp?, dur?}          camera shake: shakes up and down amp pixels (default 14) within dur (default 4 frames ≈ 0.13s), on the same frame as a slam or stamp; no more than twice in a film.
//   {at, kind: 'cut', x?, y?, z?}            hard cut to this camera (no transition). Changing shot size doesn't always need a camera move; jumping in one size is a hard cut.
// The returned cam has moving: true/false (whether it's moving at this moment), for motion blur and showing/hiding labels.
CAM.track = (base, events, t) => {
  let cam = { x: base.x ?? W / 2, y: base.y ?? H / 2, z: base.z ?? 1 }, zMul = 1, dy = 0, moving = false;
  const evs = [...events].sort((a, b) => a.at - b.at);
  for (const e of evs) {
    if (t < e.at) break;
    const P = MO.PULSE, kind = e.kind || 'push';
    if (kind === 'cut') { cam = { x: e.x ?? cam.x, y: e.y ?? cam.y, z: e.z ?? cam.z }; continue; }
    if (kind === 'slam') { const d = e.dur || P.slam, k = (t - e.at) / d; if (k < 1) { zMul *= MO.slamK(k, e.from); moving = true; } continue; }
    if (kind === 'shake') { const d = e.dur || 4 / 30, k = (t - e.at) / d; if (k < 1) { dy += (e.amp ?? 14) * Math.sin(k * Math.PI * 4) * (1 - k) / cam.z; moving = true; } continue; }
    const D = { pan: P.pan, punch: P.punch, glide: P.glide, pull: P.pull, push: P.push, to: P.push }[kind] ?? P.push;
    const E = kind === 'punch' || kind === 'pan' || (e.dur && e.dur <= 0.35) ? MO.cubicInOut : kind === 'pull' ? MO.longTail : MO.sineInOut;   // a 'to' given an accent duration also uses the fast-push curve
    const d = e.dur || D, p = (e.ease || E)(clamp((t - e.at) / d));
    let to;
    if (kind === 'pan' || kind === 'glide') to = { x: e.x ?? cam.x, y: e.y ?? cam.y, z: cam.z };
    else if (kind === 'to') to = { x: e.x ?? cam.x, y: e.y ?? cam.y, z: e.z ?? cam.z };
    else if (kind === 'pull') to = { x: e.x ?? cam.x, y: e.y ?? cam.y, z: e.z ?? cam.z * (1 + (e.k ?? -1 / 6)) };   // default ×5/6, exactly cancelling one default slow push (×1.2)
    else to = { x: e.x ?? cam.x, y: e.y ?? cam.y, z: cam.z * (1 + (e.k ?? (kind === 'push' ? 0.2 : P.k))) };
    if (p < 1) moving = true;
    cam = { x: lerp(cam.x, to.x, p), y: lerp(cam.y, to.y, p), z: CAM.zlerp(cam.z, to.z, p) };
  }
  return { x: cam.x, y: cam.y + dy, z: cam.z * zMul, moving };
};

// ---------- parallax ----------
// d=1 is the subject plane, d<1 far, d>1 near. Far layers translate linearly with d and scale by z^d: on a deep push the distant view barely moves, which is the sense of depth (Kurzgesagt's 5-layer parallax).
CAM.layer = (c, cam, d, fn) => { const k = n(cam); c.save(); CAM.apply(c, { x: lerp(W / 2, k.x, d), y: lerp(H / 2, k.y, d), z: Math.pow(k.z, d) }); fn(c); c.restore(); };

// ---------- motion ----------
// The camera's instantaneous on-screen velocity (pixels per frame, 60fps): camFn(t) → cam. For motionBlur.
CAM.velocity = (camFn, t, dt = 1 / 60) => { const a = camFn(t), b = camFn(t - dt); const z = n(a).z; return [(n(a).x - n(b).x) * z, (n(a).y - n(b).y) * z]; };
// Motion blur: stack the whole frame n times along the velocity direction (for fast pans/whips; speeds <1.5px fall back to drawing once). The blur length should be shorter than the camera displacement (PremiumBeat).
CAM.motionBlur = (c, src, vx, vy, k = 7) => {
  const sp = Math.hypot(vx, vy); if (sp < 1.5) { c.drawImage(src, 0, 0); return; }
  c.save(); for (let i = 0; i < k; i++) { const q = i / (k - 1) - 0.5; c.globalAlpha = i === 0 ? 1 : 1 / (i + 1); c.drawImage(src, -vx * q, -vy * q); } c.restore();
};
// Handheld micro-drift: two sines of different periods (continuous time, no flicker), returns [dx, dy] pixels. Only for art-style images and pure atmosphere shots; when an explainer shot holds, it holds, with no micro-drift
CAM.drift = (t, amp = 6, seed = 0) => [amp * Math.sin(t * 0.9 + seed) + amp * 0.4 * Math.sin(t * 2.3 + seed * 2), amp * 0.7 * Math.sin(t * 1.1 + seed * 3)];
})();
