// Motion timing library MO: easing, springs, stepping, staggering, beat numbers. All pure "time → value" functions that don't read a clock; deterministic.
// Source: the 8 YouTube explainer animation grammar demo films (references/09-video-animation-grammars.md). Convention: p is progress 0..1, t/lt are seconds.
//   Choosing easing in one sentence: explainers (3b1b/whiteboard) use smooth/sineInOut, settling at both ends; keynote uses appleOut/springs; kinetic type uses expoOut + springs;
//   collage (Vox) cameras use sineInOut or the long-tail longTail, with paper pieces stepping at 12fps; Kurzgesagt actions use k75, loops use easyEase.
(() => {
const { clamp, lerp } = U;
const MO = window.MO = {};

// The canvas size U.setStage / U.onStage lives in util.js (paint/brush/render/post, loaded before this file, need to register too).

// ---------- time slices ----------
MO.seg = (t, a, b) => clamp((t - a) / (b - a));                          // [a,b] → 0..1
MO.at = (t, t0, dur) => clamp((t - t0) / dur);                           // [t0, t0+dur] → 0..1
MO.anim = (lt, start, dur, ease = MO.smooth) => ease(clamp((lt - start) / dur));
// Stepped time: quantize continuous time into fps steps. Collage paper pieces / typing / highlighter "on twos" = 12fps; storytime characters 24fps; the camera stays smooth at 60fps.
MO.step = (t, fps = 12) => Math.floor(t * fps + 1e-6) / fps;

// ---------- manim easing (3b1b/manim rate_functions.py) ----------
// smooth = 6t⁵−15t⁴+10t³: zero velocity and acceleration at both ends. The default easing for explainer films.
MO.smooth = t => { t = clamp(t); return t * t * t * (10 - 15 * t + 6 * t * t); };
const sig = x => 1 / (1 + Math.exp(-x));
MO.smoothCE = (t, inflection = 10) => { const e = sig(-inflection / 2); return clamp((sig(inflection * (t - 0.5)) - e) / (1 - 2 * e)); };   // ManimCE version
MO.thereAndBack = t => MO.smooth(t < 0.5 ? 2 * t : 2 * (1 - t));          // for Indicate: there and back
MO.rushInto = t => 2 * MO.smooth(t / 2);                                  // slow start, rushing into the end
MO.rushFrom = t => 2 * MO.smooth(t / 2 + 0.5) - 1;                        // rushing out, slow finish
MO.doubleSmooth = t => t < 0.5 ? 0.5 * MO.smooth(2 * t) : 0.5 * (1 + MO.smooth(2 * t - 1));
MO.wiggle = (t, wiggles = 2) => MO.thereAndBack(t) * Math.sin(wiggles * Math.PI * t);
// manim LaggedStart(lag_ratio=r): the local progress of the i-th of n sub-animations at overall progress p. Total length = 1+(n-1)·r units, item i occupies [i·r, i·r+1].
MO.lagged = (i, n, p, r = 0.05) => clamp(p * (1 + (n - 1) * r) - i * r);

// ---------- common analytic easings (AE / CSS names) ----------
MO.linear = p => p;
MO.sineInOut = p => -(Math.cos(Math.PI * p) - 1) / 2;
MO.cubicIn = p => p * p * p;
MO.cubicOut = p => 1 - Math.pow(1 - p, 3);
MO.cubicInOut = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
MO.quartOut = p => 1 - Math.pow(1 - p, 4);
MO.quintOut = p => 1 - Math.pow(1 - p, 5);
MO.quintInOut = p => p < .5 ? 16 * p ** 5 : 1 - Math.pow(-2 * p + 2, 5) / 2;
MO.expoIn = p => p <= 0 ? 0 : Math.pow(2, 10 * p - 10);
MO.expoOut = p => p >= 1 ? 1 : 1 - Math.pow(2, -10 * p);                // the most common "fast out, slow stop" in motion design
MO.expoInOut = p => p <= 0 ? 0 : p >= 1 ? 1 : p < .5 ? Math.pow(2, 20 * p - 10) / 2 : (2 - Math.pow(2, -20 * p + 10)) / 2;
// backOut overshoot: s=1.70158 about 10%; 2.2 about 13%; 2.6 about 17%; 3.5 about 23%
MO.backOut = (p, s = 1.70158) => { const q = p - 1; return 1 + (s + 1) * q * q * q + s * q * q; };
// Elastic settle: overshoot once and come back (a sticker "slapping" down)
MO.elasticOut = p => p <= 0 ? 0 : p >= 1 ? 1 : Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * (2 * Math.PI / 3)) + 1;

// ---------- CSS cubic-bezier(x1,y1,x2,y2): Newton's method solves the parameter from x, then takes y ----------
MO.bezier = (x1, y1, x2, y2) => {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = s => ((ax * s + bx) * s + cx) * s, Y = s => ((ay * s + by) * s + cy) * s, dX = s => (3 * ax * s + 2 * bx) * s + cx;
  return p => {
    if (p <= 0) return 0; if (p >= 1) return 1;
    let s = p; for (let k = 0; k < 8; k++) { const e = X(s) - p, d = dX(s); if (Math.abs(e) < 1e-6 || Math.abs(d) < 1e-6) break; s -= e / d; }
    s = clamp(s); return Y(s);
  };
};
MO.appleOut = MO.bezier(0.25, 0.1, 0.25, 1);        // CSS `ease`: Apple website / keynote transitions
MO.emphasized = MO.bezier(0.2, 0, 0, 1);            // Material 3 emphasized: long-tail deceleration
MO.k75 = MO.bezier(0.75, 0, 0.25, 1);               // Kurzgesagt "75% influence for other actions" (y1 research §6.2)
MO.easyEase = MO.bezier(0.333, 0, 0.667, 1);        // AE Easy Ease: loops
MO.longTail = MO.bezier(0.33, 0, 0.2, 1);           // Vox "following the line", "pull-out reveal": fast start, long settling tail (y2 research)

// ---------- springs ----------
// SwiftUI parameterization (WWDC23 Animate with springs): stiffness=(2π/duration)², damping=4π(1-bounce)/duration → ζ=1-bounce, ω=2π/duration.
// Returns displacement 0→1 (can be >1 = overshoot). t in seconds. Used by keynote UI: .smooth(bounce 0) / .snappy(0.15) / .bouncy(0.3).
MO.spring = (t, { duration = 0.5, bounce = 0, v0 = 0 } = {}) => {
  if (t <= 0) return 0;
  const w = 2 * Math.PI / duration, z = 1 - bounce;
  let x;                                                                 // x = remaining displacement (1→0)
  if (Math.abs(z - 1) < 1e-4) x = Math.exp(-w * t) * (1 + (w - v0) * t);
  else if (z < 1) { const wd = w * Math.sqrt(1 - z * z); x = Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w - v0) / wd) * Math.sin(wd * t)); }
  else { const r = Math.sqrt(z * z - 1), a = -w * (z - r), b = -w * (z + r); const A = (-v0 - b) / (a - b); x = A * Math.exp(a * t) + (1 - A) * Math.exp(b * t); }
  return 1 - x;
};
MO.smoothSpring = t => MO.spring(t, { duration: 0.5, bounce: 0 });
MO.snappy = t => MO.spring(t, { duration: 0.5, bounce: 0.15 });
MO.bouncy = t => MO.spring(t, { duration: 0.5, bounce: 0.3 });
// Step response of an underdamped spring parameterized by frequency/decay (for kinetic type): freq in Hz, decay in 1/s.
//   freq 3 / decay 6 first overshoot ≈37% (big words slamming in); 2.5 / 9 ≈16% (regular pops); 2.2 / 10 ≈8% (main word settling)
MO.springHz = (t, freq = 2.5, decay = 9) => t <= 0 ? 0 : 1 - Math.exp(-decay * t) * Math.cos(2 * Math.PI * freq * t);
// Residual oscillation after arrival (Dan Ebberts' inertial bounce): amp·sin(2πft)/e^(decay·t). Used for body squash on pose changes and screen shake.
MO.settle = (t, amp, freq = 3, decay = 5) => t <= 0 ? 0 : amp * Math.sin(2 * Math.PI * freq * t) / Math.exp(decay * t);

// ---------- camera move durations (when to use which: see references/camera-language.md) ----------
// Two kinds: transitions (slow push push, find-next glide, pull out pull; 0.6–1.5s ease in/out) are the default; accents (fast push punch, fast move pan, slam slam) are reserved for reveals, numbers, twists.
// Transition numbers come from measured reference films: Vox pushes 1.0–1.5s, finding a card 0.5–0.9s, pulling out about 1s; 3b1b pushes about 1s.
// Accent numbers: a film with "a constant 7.5% push on every shot" judged like PowerPoint was approved after changing to hold → 0.28s fast push → hold; but the 2026-10-12 Nobel short with a fast push every 2 seconds was judged "too many, too fast, not smooth".
// Duration constants are collected here, and CAM.track / MD / every clip reads them; change the rhythm here, don't write another set in a clip.
MO.PULSE = { punch: 0.28, pan: 0.30, slam: 0.17, k: 0.25, kMin: 0.18, kMax: 0.32, push: 0.9, glide: 0.7, pull: 1.1 };
// Slam curve: k = 0..1 (slam progress) → scale. 1.55 → 0.94 (first 60%, slams down in 3 frames) → 1.0 (last 40%, rebounds in 2 frames). k≤0 returns 1.55 (not landed yet).
MO.slamK = (k, from = 1.55, under = 0.94) => k <= 0 ? from : k < 0.6 ? from - (from - under) * (k / 0.6) : k < 1 ? under + (1 - under) * ((k - 0.6) / 0.4) : 1;
// An element slamming in on the at frame: returns its current scale (before at = 0, the element shouldn't be drawn yet). o: {dur=0.17, from=1.55, under=0.94}
MO.slam = (t, at, o = {}) => t < at ? 0 : MO.slamK((t - at) / (o.dur || MO.PULSE.slam), o.from, o.under);
// Move progress: from at, over dur seconds, from 0 to 1 by ease, then stays at 1 (default fast-push duration and curve; for a slow push write MO.pulse(t, at, MO.PULSE.push, MO.sineInOut))
MO.pulse = (t, at, dur = MO.PULSE.punch, ease = MO.cubicInOut) => ease(clamp((t - at) / dur));

// ---------- continuous micro-motion ----------
// Only for the environment layer (twinkling stars, particles, distant clouds) and art-style images. In explainer films, subjects, labels and cards hold once landed, without floating or breathing.
// Floating: two sines added together. Periods avoid around 5s (HIG: sustained oscillation at ~0.2Hz is uncomfortable)
MO.float = (t, amp = 6, period = 4, ph = 0) => amp * (0.75 * Math.sin(2 * Math.PI * t / period + ph) + 0.25 * Math.sin(2 * Math.PI * t / (period * 0.53) + ph * 1.7));

// ---------- inverse lookups and beat numbers ----------
// Inverse of an easing (bisection): "at what moment does the line head / counter reach y". E.g., a polyline drawn with smooth: find when it reaches some x (t3 shot 2's event annotation).
MO.invert = (ease, y, iters = 30) => { let a = 0, b = 1; for (let i = 0; i < iters; i++) { const m = (a + b) / 2; if (ease(m) < y) a = m; else b = m; } return (a + b) / 2; };
// beats → seconds
MO.beat = (n, bpm = 120) => n * 60 / bpm;
// The reveal frame lands on the beat: segment start = bar line − reveal point × transition duration (y5: zoom reveal point .55, bands .6, push reaching 90% displacement at .58)
MO.onBeat = (barTime, revealP, trDur) => barTime - revealP * trDur;
})();
