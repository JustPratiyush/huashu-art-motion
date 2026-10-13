# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "opencv-python-headless"]
# ///
"""film_gate.py — reads only the final mp4 and measures "page-flip PowerPoint feel". Called by deliver.py before delivery; can also run on its own.

Usage:
  uv run film_gate.py film.mp4 [--json] [--vertical auto|yes|no] [--sub-band 0.15]
                      [--template demo.mp4] [--no-template]

Exit codes: red 2; yellow or green 0; can't read the file 1.
Depends only on ffmpeg/ffprobe and opencv, not on the art-motion engine, so it can measure a film from any source.

Gate one: fast-motion frame ratio (the share of in-shot adjacent frame pairs with a mean gray difference ≥9, at 12fps, 320-wide grayscale,
masking the bottom subtitle band; cut-like frames and crossfade windows are excluded entirely, however fast a transition is). < 0.035 red, < 0.06 yellow.
Calibration (2026-10-09): 13 films the author gave verdicts on (9 approved, 4 rejected); it's the only metric that alone separates the two groups cleanly,
with margin on both sides of the threshold — approved minimum 0.068, rejected maximum 0.021; any frame-difference threshold between 6–13 separates them.
There are only 13 samples, so read it as "no counterexample among these 13", not as proven.

Gate two is a factual defect that doesn't rely on calibrated taste: a near-solid empty frame mid-film. Excluding 0.5 seconds at each end and transition windows
(two frames either side of a cut, whole crossfades), a frame where fewer than 0.2% of pixels have gradient >24 (almost no edges or texture in the whole frame; same 12fps, 320-wide grayscale, subtitle band masked)
counts as blank, and a run of ≥0.3 seconds is red, with timecodes reported for each run. Judged by edges, not color: the thin lines and formulas of black-background 3b1b and the strokes on a whiteboard
are all edges, so they aren't hit by mistake; a color-based rule like "95% of the frame is one color" would judge an approved whiteboard film as 3 seconds of empty frame in the calibration set, so it isn't used.
None of the 32 films in the calibration data (including the 13 with the author's verdict, 9 approved) ever has 2 consecutive blank frames. The short-clip downgrade doesn't apply to this gate.

Gate three: the share of time with a blue-purple background (the author: "we need to avoid that garbage blue-purple gradient color scheme, this is very AI slop").
2fps, 160-wide RGB; pixels with hue 225°–300°, saturation ≥0.30 and value 0.06–0.90 count as blue-purple; a frame with ≥30% blue-purple pixels counts as a blue-purple frame.
Blue-purple frames ≥0.30 red, ≥0.12 yellow. Calibration (2026-10-10): among 88 films, the 9 approved by the author peak at 0.10 (Huashu Walks Through Famous Paintings),
mostly 0; films the author rejected, or pairs where both were rejected, are 0.46–1.00 (the deep-purple starry sky + white-shell robot one is 0.94). Flat navy (hue about 210°) doesn't count.
When the topic itself needs blue-purple (a cyberpunk purple the user explicitly asked for, style images like Van Gogh's Starry Night), use --allow-blue-purple "reason" to downgrade to yellow;
the reason is written verbatim into the facts section of the delivery notes.

All other metrics are only reported (at most yellow, never blocking). Stillness metrics (still-frame share, longest continuous stillness, longest gap without events) would judge
good films that "hold → move hard → hold" backwards, so they must never be used as gates; yellow only means "go look at this stretch".

What it can't block: PowerPoint with a push-in forced onto every page (the "push-in count" yellow says go look), tight start / loose end (look at the worst 30-second window), page frames and small images on beige, unclear explanations.
Fast-motion frames don't distinguish fast from slow: a slow push of about 20% over 1 second scores about the same fast-motion frames as a 0.28-second fast push (measured on three shots of the Nobel short on 2026-10-12), so there's no need to speed up the camera to pass the gate.
The "go look" yellow items and the independent review still have to be done.
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys

import cv2
import numpy as np

FPS = 12            # analysis frame rate
WIDTH = 320         # analysis width (portrait is also 320 wide)
SAMPLE_FPS = 2      # sampling frame rate for area metrics
# The all-style sample film ships with Releases and isn't in the repository; only when placed under assets/ is "copying the demo composition" compared (rename the upstream release file to this name), otherwise this item is skipped
DEFAULT_TEMPLATE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "all-styles-demo.mp4")

# ---------------------------------------------------------------- threshold table
# Only metrics with gate=True can light red and make the script exit non-zero; the rest are only reported (at most yellow, 'info' gets no light).
# Direction 'high_bad': the larger, the more suspicious; 'low_bad': the smaller, the more suspicious; 'info': number only, no judgment.
# Calibration: on 2026-10-09 with 13 films the author judged (9 positive, 4 negative), see the file header. Don't change thresholds casually: any change needs recalibration with new verdict films.
# Gates contain only metrics that "alone separate positive and negative examples cleanly, with margin on both sides" (fast_ratio), plus factual defects that need no calibration (blank_run_s).
# Yellow lines are rules of thumb read from the same batch of films; the sample is too small to serve as a verdict, so they only say "go look at this stretch".
METRICS = {
    # key: (name, direction, yellow line, red line, is gate, unit)
    "fast_ratio":         ("Fast-motion frame ratio", "low_bad", 0.06, 0.035, True, ""),
    "blank_run_s":        ("Near-solid empty frame mid-film (longest run)", "high_bad", None, 0.3, True, "s"),
    "blue_purple_share":  ("Share of time with blue-purple background", "high_bad", 0.12, 0.30, True, ""),
    "fast_ratio_worst_window": ("Fast-motion ratio in the worst 30-second window", "low_bad", 0.02, None, False, ""),
    "top10_share":        ("Motion concentration (share of motion in the top 10% of frames)", "info", None, None, False, ""),
    "drift_ratio":        ("Slow-drift frame share", "high_bad", 0.65, None, False, ""),
    "still_ratio":        ("Still-frame share (stillness itself isn't bad)", "info", None, None, False, ""),
    "longest_still_s":    ("Longest continuous stillness", "high_bad", 6.0, None, False, "s"),
    "event_rate":         ("Visual event density", "low_bad", 2.0, None, False, " per 10s"),
    "max_event_gap_s":    ("Longest gap without events", "high_bad", 15.0, None, False, "s"),
    "dead_bg":            ("Dead background (unchanging within shots after removing camera motion)", "high_bad", 0.80, None, False, ""),
    "dead_flat":          ("Dead and flat empty background", "high_bad", 0.50, None, False, ""),
    "flat_area":          ("Flat background / empty area", "info", None, None, False, ""),
    "flat_light":         ("Light empty background area (beige/white)", "high_bad", 0.35, None, False, ""),
    "page_frame_share":   ("Share of time inside a fixed page frame", "high_bad", 0.30, None, False, ""),
    "slow_zoom_share":    ("Share of time in constant slow-zoom shots", "high_bad", 0.70, None, False, ""),
    "push_in_per_min":    ("Push-in count (lower bound)", "high_bad", 8.0, None, False, " per min"),
    "fast_push_per_min":  ("Of which fast pushes within 0.5s", "info", None, None, False, " per min"),
    "push_in_share":      ("Push-ins as a share of push/pull events", "info", None, None, False, ""),
    "slow_cam_share":     ("Share of time with slow-drift camera", "info", None, None, False, ""),
    "dissolve_share":     ("Crossfades as a share of transitions", "high_bad", 0.60, None, False, ""),
    "local_fade_ratio":   ("In-place fades as a share of changing frames", "info", None, None, False, ""),
    "subject_box":        ("Largest subject block as a share of the frame", "info", None, None, False, ""),
    "template_sim_share": ("Share of time similar to the demo composition", "high_bad", 0.30, None, False, ""),
}


# ---------------------------------------------------------------- reading frames
def probe(path):
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height:format=duration", "-of", "json", path])
    j = json.loads(out)
    s = j["streams"][0]
    return int(s["width"]), int(s["height"]), float(j["format"].get("duration", 0) or 0)


def decode_gray(path, fps=FPS, width=WIDTH, limit=None):
    W, H, dur = probe(path)
    h = int(round(H * width / W / 2) * 2)
    cmd = ["ffmpeg", "-v", "error"] + (["-t", str(limit)] if limit else []) + ["-i", path, "-vf",
           f"fps={fps},scale={width}:{h}:flags=area", "-pix_fmt", "gray", "-f", "rawvideo", "-"]
    raw = subprocess.check_output(cmd)
    n = len(raw) // (width * h)
    F = np.frombuffer(raw[: n * width * h], np.uint8).reshape(n, h, width)
    return F, (W, H, dur)


# ---------------------------------------------------------------- global camera motion
def pair_transform(a, b):
    """Similarity transform a->b (LK tracking + RANSAC). Returns (M 2x3, inlier count, inlier ratio) or (None,0,0)."""
    pts = cv2.goodFeaturesToTrack(a, maxCorners=300, qualityLevel=0.01, minDistance=6, blockSize=5)
    if pts is None or len(pts) < 15:
        return None, 0, 0.0
    nxt, st, _ = cv2.calcOpticalFlowPyrLK(a, b, pts, None, winSize=(21, 21), maxLevel=3)
    ok = st.ravel() == 1
    if ok.sum() < 12:
        return None, 0, 0.0
    p0, p1 = pts[ok].reshape(-1, 2), nxt[ok].reshape(-1, 2)
    M, inl = cv2.estimateAffinePartial2D(p0, p1, method=cv2.RANSAC, ransacReprojThreshold=1.0)
    if M is None:
        return None, 0, 0.0
    ni = int(inl.sum())
    return M, ni, ni / len(pts)


def cam_speed(M, w, h, fps):
    """Mean displacement of the transform over a grid of points, converted to "screen widths per second"."""
    if M is None:
        return 0.0
    xs, ys = np.meshgrid(np.linspace(0, w, 7), np.linspace(0, h, 7))
    P = np.stack([xs.ravel(), ys.ravel(), np.ones(xs.size)], 1)
    Q = P @ M.T
    return float(np.hypot(*(Q - P[:, :2]).T).mean() / w * fps)


def to3(M):
    return np.vstack([M, [0, 0, 1]]) if M is not None else np.eye(3)


# ---------------------------------------------------------------- main analysis
def analyze(path, sub_band=None, vertical="auto", template=None, verbose=False):
    F, (W0, H0, dur) = decode_gray(path)
    is_vert = (H0 > W0) if vertical == "auto" else (vertical == "yes")
    if sub_band is None:
        sub_band = 0.18 if is_vert else 0.15
    n, h, w = F.shape
    hc = int(round(h * (1 - sub_band)))
    F = np.ascontiguousarray(F[:, :hc])          # mask the bottom subtitle band
    h = hc
    if n < 4:
        raise RuntimeError("Too few frames to analyze")
    F16 = F.astype(np.int16)

    # --- per frame pair: frame difference, camera transform, residual after compensation, brightness histogram
    d = np.zeros(n - 1); loc = np.zeros(n - 1); spd = np.zeros(n - 1); zr = np.zeros(n - 1)
    fade_px = np.zeros(n - 1)
    Ms = []
    for i in range(n - 1):
        a, b = F[i], F[i + 1]
        diff = np.abs(F16[i + 1] - F16[i])
        d[i] = diff.mean()
        moved, wa = False, None
        if d[i] < 0.05:                          # identical: skip estimation
            Ms.append(None); loc[i] = d[i]; fade_px[i] = -1; continue
        M, ni, ir = pair_transform(a, b)
        if M is not None and ni >= 20 and ir >= 0.35:
            s = float(np.hypot(M[0, 0], M[1, 0]))
            moved = abs(np.log(s)) > 1e-4 or abs(M[0, 2]) > 0.05 or abs(M[1, 2]) > 0.05
            if moved:
                wa = cv2.warpAffine(a, M, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
                loc[i] = np.abs(F16[i + 1] - wa.astype(np.int16)).mean()
            else:
                loc[i] = d[i]
            spd[i] = cam_speed(M, w, h, FPS)
            zr[i] = np.log(s)
            Ms.append(M)
        else:
            loc[i] = d[i]; Ms.append(None)
        # In-place fades: among pixels still changing after camera compensation, the share with near-zero optical flow (position fixed, only brightness changes)
        if d[i] > 0.3 and spd[i] < 0.05:
            base = wa if (Ms[-1] is not None and moved) else a
            ch = np.abs(F16[i + 1] - base.astype(np.int16)) > 10
            if ch.mean() > 0.003:
                fl = cv2.calcOpticalFlowFarneback(base, b, None, 0.5, 3, 15, 3, 5, 1.2, 0)
                mag = np.hypot(fl[..., 0], fl[..., 1])
                fade_px[i] = float((mag[ch] < 0.5).mean())
            else:
                fade_px[i] = -1
        else:
            fade_px[i] = -1
    # --- hard cuts
    # cut_like: every frame that "changes abruptly as a whole and can't be explained by camera motion" (including multi-frame tile/pixel/whip transitions) — all excluded when measuring motion
    # cut: in a run of cut_like frames only the first is taken, used to count cuts and split shots
    cut_like = np.zeros(n - 1, bool)
    for i in range(n - 1):
        lo, hi = max(0, i - 6), min(n - 1, i + 7)
        nb = np.concatenate([d[lo:i], d[i + 1:hi]])
        med = np.median(nb) if len(nb) else 0
        cut_like[i] = d[i] >= max(8.0, 3 * med + 2) and loc[i] >= 0.6 * d[i]
    cut = cut_like & ~np.concatenate([[False], cut_like[:-1]])

    # --- crossfades: large difference between endpoints, every frame in between changes gently, and middle frames are a linear mix of the two ends
    diss = []                               # (a, b, center)
    in_diss = np.zeros(n - 1, bool)
    cand = []
    for wdw in (2, 3, 5, 8, 12):            # half-window 0.17s–1s
        for t in range(wdw, n - wdw):
            a_, b_ = t - wdw, t + wdw
            if cut_like[a_:b_].any():
                continue
            seg = d[a_:b_]
            if seg.max() > 0.75 * seg.sum() or seg.sum() < 10:
                continue
            Dab = np.abs(F16[b_] - F16[a_])
            if Dab.mean() < 10 or (Dab > 20).mean() < 0.20:   # whole-frame fades; local fades of a title usually cover only a few percent
                continue
            cand.append((t, wdw))
    cand_set = {}
    for t, wdw in cand:
        a_, b_ = t - wdw, t + wdw
        A = F16[a_].astype(np.float32); B = F16[b_].astype(np.float32)
        D = A - B; nd = float((D * D).sum()) + 1e-6
        res, alphas = [], []
        for k in range(a_ + 1, b_):
            X = F16[k].astype(np.float32) - B
            al = float((X * D).sum() / nd)
            r = np.abs(X - al * D).mean() / (np.abs(D).mean() + 1e-6)
            res.append(r); alphas.append(al)
        res = np.array(res); alphas = np.array(alphas)
        mono = np.all(np.diff(alphas) <= 0.08)
        mid = (alphas > 0.15) & (alphas < 0.85)        # the middle frames that are truly "two images overlaid"
        if (mid.sum() >= 2 and res[mid].mean() < 0.22 and res.mean() < 0.25 and mono
                and alphas[0] > 0.55 and alphas[-1] < 0.45):
            ks = np.arange(a_ + 1, b_)
            tc = int(ks[np.argmin(np.abs(alphas - 0.5))])       # the frame where the mix coefficient crosses 0.5
            cand_set[(t, wdw)] = (a_, b_, res.mean(), float(np.abs(D).mean()), tc)
    # Merge overlaps: first take the largest endpoint difference (the whole fade within the window), then look at the residual
    for key in sorted(cand_set, key=lambda k: (-round(cand_set[k][3], 0), cand_set[k][2])):
        a_, b_, _, _, tc = cand_set[key]
        if in_diss[a_:b_].any():
            continue
        in_diss[a_:b_] = True
        diss.append((a_, b_, tc))
    diss.sort()

    # --- shots
    bounds = sorted(set([0] + [i + 1 for i in np.where(cut)[0]] + [c for _, _, c in diss] + [n]))
    shots = []
    for s, e in zip(bounds[:-1], bounds[1:]):
        if e - s >= 3:
            shots.append((s, e))
        elif shots:
            shots[-1] = (shots[-1][0], e)
    if not shots:
        shots = [(0, n)]
    trans = cut_like | in_diss
    n_cut, n_diss = int(cut.sum()), len(diss)
    blank_runs = blank_frames(F, cut_like, in_diss)

    # --- motion distribution (excluding transition frames)
    mv = np.where(trans, np.nan, d)
    good = ~np.isnan(mv)
    mvv = mv[good]
    # Frame difference measure: mean absolute difference at 12fps, 320-wide grayscale, subtitle band masked (0–255).
    # The fast-motion threshold of 9 comes from calibration (anything from 6–11 separates positive and negative examples; 9 has the most margin);
    # LK camera speed misses 0.3-second fast pushes and can't separate them on its own in calibration, so it isn't part of the "fast motion" definition.
    STILL, DRIFT_HI, FAST = 0.30, 3.0, 9.0
    still = mvv < STILL
    fast = mvv >= FAST
    drift = (~still) & (~fast) & (mvv < DRIFT_HI)
    srt = np.sort(mvv)[::-1]
    top10 = srt[: max(1, len(srt) // 10)].sum() / max(srt.sum(), 1e-6)

    # Longest continuous stillness (whole-film frame sequence, broken by transitions)
    st_full = (d < STILL) & ~trans
    longest = run = longest_at = 0
    for i, v in enumerate(st_full):
        run = run + 1 if v else 0
        if run > longest:
            longest, longest_at = run, i - run + 1

    # Events: hard cuts, fades, fast-motion stretches (consecutive fast frames count once)
    fast_full = np.zeros(n - 1, bool)
    fast_full[good] = fast
    ev_t = [i for i in np.where(cut)[0]] + [c for _, _, c in diss]
    prev = False
    for i, v in enumerate(fast_full):
        if v and not prev:
            ev_t.append(i)
        prev = v
    ev_t = sorted(ev_t)
    secs = n / FPS
    gaps = np.diff([0] + ev_t + [n - 1]) / FPS
    # Merge repeated events within 0.3s
    ev_m = []
    for t in ev_t:
        if not ev_m or t - ev_m[-1] > 0.3 * FPS:
            ev_m.append(t)
    event_rate = len(ev_m) / secs * 10

    # --- per shot: dead background, slow-zoom curve
    dead_w, dead_flat_w, shot_w = [], [], []
    slow_zoom_dur, zoom_totals, slow_cam_dur = 0.0, [], 0.0
    for s, e in shots:
        L = e - s
        dur_s = L / FPS
        # Cumulative transform: A_k maps the shot's first-frame coordinates to frame k
        A = [np.eye(3)]
        zc = [0.0]
        for k in range(s, e - 1):
            A.append(to3(Ms[k]) @ A[-1])
            zc.append(zc[-1] + (zr[k] if Ms[k] is not None else 0.0))
        zc = np.array(zc)
        # Slow zoom: total zoom 2%–25%, monotonic across most of the shot, with no fast push
        if dur_s >= 1.2:
            rates = np.abs(zr[s:e - 1]) * FPS
            tot = abs(zc[-1] - zc[0])
            active = (rates > 0.004).mean()
            sgn = np.sign(zr[s:e - 1]); sgn = sgn[sgn != 0]
            mono = abs(sgn.mean()) if len(sgn) else 0
            if 0.02 <= tot <= 0.25 and active >= 0.6 and mono >= 0.7 and np.percentile(rates, 95) < 0.25:
                slow_zoom_dur += dur_s
                zoom_totals.append(tot / dur_s)
            sp_ = spd[s:e - 1]
            if (sp_ > 0.004).mean() >= 0.6 and np.percentile(sp_, 95) < 0.2:
                slow_cam_dur += dur_s
        if dur_s < 0.6:
            continue
        idx = np.unique(np.linspace(s, e - 1, min(L, 24)).astype(int))
        r = idx[len(idx) // 2]
        Ar = A[r - s]
        stack, valid = [], []
        ones = np.full((h, w), 255, np.uint8)
        for k in idx:
            T = (Ar @ np.linalg.inv(A[k - s]))[:2]
            stack.append(cv2.warpAffine(F[k], T, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT))
            valid.append(cv2.warpAffine(ones, T, (w, h), flags=cv2.INTER_NEAREST, borderMode=cv2.BORDER_CONSTANT) > 0)
        stack = np.array(stack, np.int16); valid = np.array(valid)
        vcount = valid.sum(0)
        ok = vcount >= 0.8 * len(idx)
        big = np.where(valid, stack, -1000).max(0); small = np.where(valid, stack, 1000).min(0)
        rng = big - small
        dead = ok & (rng <= 12)
        ref = F[r]
        gx = cv2.Sobel(ref, cv2.CV_32F, 1, 0); gy = cv2.Sobel(ref, cv2.CV_32F, 0, 1)
        flatpx = cv2.blur(np.hypot(gx, gy), (9, 9)) < FLAT_GRAD
        denom = max(ok.sum(), 1)
        dead_w.append(dead.sum() / denom); dead_flat_w.append((dead & flatpx).sum() / denom); shot_w.append(dur_s)
    shot_w = np.array(shot_w)
    dead_bg = float(np.average(dead_w, weights=shot_w)) if len(shot_w) else 0.0
    dead_flat = float(np.average(dead_flat_w, weights=shot_w)) if len(shot_w) else 0.0
    slow_zoom_share = slow_zoom_dur / secs

    # --- push-in events: continuous zoom-in within a shot (>0.4% per frame at 12fps, allowing a 1-frame break) accumulating ≥3% counts once; finished within 0.5 seconds counts as a fast push.
    # Added after the 2026-10-12 Nobel short (102 seconds, about 48 push-ins in code, all inward) was judged "too many, too fast, not smooth"; only reported, with a yellow saying go look.
    # This is a lower bound: when live footage moves on its own the camera transform can't be estimated, so those push-ins aren't measured (that film measured 20, about 12 per minute).
    def zoom_runs(mask, sign):
        ev, i = [], 0
        while i < len(mask):
            if mask[i]:
                j = k = i
                while k + 1 < len(mask) and (mask[k + 1] or (k + 2 < len(mask) and mask[k + 2])):
                    k += 1
                    if mask[k]:
                        j = k
                seg = zr[i:j + 1] * sign
                if seg[seg > 0].sum() >= 0.03:
                    ev.append((i, j))
                i = j + 1
            else:
                i += 1
        return ev
    # Exclude only the cut frame itself and crossfades: a fast push starting right after a cut gets swallowed whole by the "cut-like" window, so using trans would miss half
    zx = cut | in_diss
    push_in = zoom_runs((zr > 0.004) & ~zx, 1)
    pull_out = zoom_runs((zr < -0.004) & ~zx, -1)
    fast_push = sum(1 for a, b in push_in if (b - a + 1) / FPS <= 0.5)
    zoom_cv = float(np.std(zoom_totals) / (np.mean(zoom_totals) + 1e-9)) if len(zoom_totals) >= 3 else float("nan")

    # --- area metrics on sampled frames
    step = max(1, FPS // SAMPLE_FPS)
    sidx = np.arange(0, n, step)
    if len(sidx) > 240:
        sidx = np.unique(np.linspace(0, n - 1, 240).astype(int))
    S = F[sidx]
    flat_area, flat_light, subj = [], [], []
    BS = 8
    gh, gw = h // BS, w // BS
    cell_tex = np.zeros((len(sidx), gh, gw), bool)
    for j, fr in enumerate(S):
        gx = cv2.Sobel(fr, cv2.CV_32F, 1, 0); gy = cv2.Sobel(fr, cv2.CV_32F, 0, 1)
        g = np.hypot(gx, gy)[: gh * BS, : gw * BS].reshape(gh, BS, gw, BS).mean((1, 3))
        lum = fr[: gh * BS, : gw * BS].reshape(gh, BS, gw, BS).mean((1, 3))
        flat = (g < FLAT_GRAD).astype(np.uint8)
        nl, lab, stats, _ = cv2.connectedComponentsWithStats(flat, connectivity=4)
        big = np.zeros_like(flat, bool)
        for c in range(1, nl):
            if stats[c, cv2.CC_STAT_AREA] >= 0.03 * gh * gw:
                big |= lab == c
        flat_area.append(big.mean()); flat_light.append((big & (lum > 150)).mean())
        cell_tex[j] = g >= PAGE_GRAD
        tex = (g >= TEX_GRAD).astype(np.uint8)
        if tex.sum() == 0:
            subj.append(0.0); continue
        cl = cv2.morphologyEx(tex, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
        nl, lab, stats, _ = cv2.connectedComponentsWithStats(cl, connectivity=8)
        k = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        comp = (lab == k).astype(np.uint8)
        cs, _ = cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        fill = np.zeros_like(comp); cv2.drawContours(fill, cs, -1, 1, -1)
        subj.append(float(fill.mean()))
    flat_area = np.array(flat_area)

    # --- fixed page frame: textured content (text/lines/logo) at the same screen position, still appearing unchanged when the rest of the picture has changed a lot
    page_share = page_frame(S, sidx, cell_tex, BS, gh, gw, shots)

    # --- similar to the demo composition
    tsim_share, tsim_max = float("nan"), float("nan")
    if template:
        tsim_share, tsim_max = template_similarity(F, shots, template)

    # --- share of in-place fade-in/out: among changing frames, the average share where local structure has a consistent sign (brightness changes without moving)
    chg = (~trans) & (fade_px >= 0)
    lf = float(np.mean(fade_px[chg] > 0.7)) if chg.sum() > 5 else 0.0

    # Tight start / loose end: fast-motion ratio in the worst 30-second window (half the film length when the film is under 60 seconds)
    win = int(min(30.0, secs / 2) * FPS)
    fr_full = np.where(trans, np.nan, fast_full.astype(float))
    worst, worst_t = float("nan"), None
    if win >= FPS * 4:
        for st0 in range(0, n - 1 - win + 1, FPS):
            seg = fr_full[st0: st0 + win]
            v = np.nanmean(seg) if np.isfinite(seg).any() else 0.0
            if not (worst == worst) or v < worst:
                worst, worst_t = float(v), st0 / FPS
    by10 = [round(float(np.nanmean(fr_full[k: k + 10 * FPS])), 3) if np.isfinite(fr_full[k: k + 10 * FPS]).any() else 0.0
            for k in range(0, n - 1, 10 * FPS)]
    if os.environ.get("FILM_GATE_DUMP"):
        np.savez_compressed(os.environ["FILM_GATE_DUMP"], d=d, spd=spd, loc=loc, zr=zr, cut=cut, in_diss=in_diss, fade_px=fade_px)

    shot_len = np.array([(e - s) / FPS for s, e in shots])
    res = {
        "file": os.path.basename(path),
        "orientation": "vertical" if is_vert else "horizontal",
        "duration_s": round(secs, 2),
        "sub_band": sub_band,
        "shots": len(shots), "hard_cuts": n_cut, "dissolves": n_diss,
        "asl_s": round(float(shot_len.mean()), 2),
        "dissolve_share": round(n_diss / max(1, n_cut + n_diss), 3),
        "fast_ratio": round(float(fast.mean()), 4),
        "top10_share": round(float(top10), 3),
        "drift_ratio": round(float(drift.mean()), 3),
        "still_ratio": round(float(still.mean()), 3),
        "longest_still_s": round(longest / FPS, 2),
        "longest_still_start_s": round(longest_at / FPS, 2),
        "event_rate": round(event_rate, 2),
        "max_event_gap_s": round(float(gaps.max()), 2),
        "dead_bg": round(dead_bg, 3),
        "dead_flat": round(dead_flat, 3),
        "flat_area": round(float(flat_area.mean()), 3),
        "flat40_frames": round(float((flat_area > 0.4).mean()), 3),
        "page_frame_share": round(page_share, 3),
        "slow_zoom_share": round(float(slow_zoom_share), 3),
        "slow_cam_share": round(float(slow_cam_dur / secs), 3),
        "zoom_curve_cv": round(zoom_cv, 3) if zoom_cv == zoom_cv else None,
        "push_in_per_min": round(len(push_in) / secs * 60, 1),
        "fast_push_per_min": round(fast_push / secs * 60, 1),
        "push_in_share": round(len(push_in) / max(1, len(push_in) + len(pull_out)), 2),
        "push_in_times_s": [round(a / FPS, 1) for a, _ in push_in],
        "subject_box": round(float(np.median(subj)), 3),
        "flat_light": round(float(np.mean(flat_light)), 3),
        "template_sim_share": round(tsim_share, 3) if tsim_share == tsim_share else None,
        "template_sim_max": round(tsim_max, 3) if tsim_max == tsim_max else None,
        "local_fade_ratio": round(lf, 3),
        "mean_diff": round(float(np.nanmean(mv)), 2),
        "fast_ratio_worst_window": round(worst, 4) if worst == worst else None,
        "worst_window_start_s": worst_t,
        "worst_window_len_s": round(win / FPS, 2),
        "fast_ratio_by_10s": by10,
        "blank_run_s": round(max((b - a for a, b in blank_runs), default=0.0), 2),
        "blank_runs_s": blank_runs,
        "cut_times_s": [round((i + 1) / FPS, 2) for i in np.where(cut)[0]],
        "dissolve_times_s": [round(c / FPS, 2) for _, _, c in diss],
    }
    return res


FLAT_GRAD = 6.0     # mean gradient of an 8x8 block below this counts as "flat" (320-wide grayscale)
BLANK_GRAD, BLANK_FRAC = 24.0, 0.002   # blank frame: fewer than 0.2% of pixels with gradient > 24 (the lowest single frame in approved calibration films is 0.30%, never two consecutive frames below it)
BLANK_EDGE_S, BLANK_MIN_S = 0.5, 0.3   # exclude 0.5 seconds at each end; only runs of ≥0.3 seconds count


def blank_frames(F, cut_like, in_diss):
    """Near-solid empty frames mid-film: [(start, end) seconds], listing only runs ≥ BLANK_MIN_S.
    Judged by edges (almost no gradient in the whole frame), not by color; frames either side of a cut and crossfade windows don't count, and runs crossing them are broken there."""
    n = len(F)
    blank = np.zeros(n, bool)
    for i, fr in enumerate(F):
        g = np.hypot(cv2.Sobel(fr, cv2.CV_32F, 1, 0), cv2.Sobel(fr, cv2.CV_32F, 0, 1))
        blank[i] = (g > BLANK_GRAD).mean() < BLANK_FRAC
    ok = np.ones(n, bool)
    e = int(round(BLANK_EDGE_S * FPS)); ok[:e] = False; ok[max(0, n - e):] = False
    for i in np.where(cut_like | in_diss)[0]:
        ok[i] = False; ok[i + 1] = False
    runs, s0 = [], None
    for i, v in enumerate(list(blank & ok) + [False]):
        if v and s0 is None: s0 = i
        elif not v and s0 is not None:
            if (i - s0) / FPS >= BLANK_MIN_S - 1e-9: runs.append((round(s0 / FPS, 2), round(i / FPS, 2)))
            s0 = None
    return runs
TEX_GRAD = 14.0     # above this counts as "textured"
PAGE_GRAD = 25.0    # texture required of page-frame cells (strong edges of text, thin lines, logos)


def page_frame(S, sidx, cell_tex, BS, gh, gw, shots):
    """Share of time inside a fixed page frame.
    A cell "recurs" in a frame = strong texture, appearing unchanged at the same position in ≥3 frames ≥3 seconds apart whose overall pictures clearly differ.
    Cells recurring in ≥25% of the film count as "page-frame cells" (title bars, headers, page numbers, logos, progress bars);
    if a frame's page-frame cells (also recurring in that frame) total ≥ 1.5% of the picture, that frame counts as framed by a page frame.
    Shots that only reuse the same footage or background texture recur sporadically and don't pass the 25% bar."""
    N = len(S)
    if N < 6:
        return 0.0
    desc = np.array([cv2.resize(fr[: gh * BS, : gw * BS], (gw * 4, gh * 4), interpolation=cv2.INTER_AREA)
                     for fr in S]).astype(np.float32)
    desc = desc.reshape(N, gh, 4, gw, 4).transpose(0, 1, 3, 2, 4).reshape(N, gh, gw, 16)
    small = np.array([cv2.resize(fr, (32, 18), interpolation=cv2.INTER_AREA) for fr in S]).astype(np.float32)
    t = sidx / FPS
    G = np.abs(small[:, None] - small[None]).mean((2, 3))
    far = (np.abs(t[:, None] - t[None]) >= 3.0) & (G > 12)
    persist = np.zeros((N, gh, gw), bool)
    for y in range(gh):
        for x in range(gw):
            tex = cell_tex[:, y, x]
            if tex.sum() < 3:
                continue
            v = desc[:, y, x]
            Dm = np.abs(v[:, None] - v[None]).mean(2)
            persist[:, y, x] = ((Dm < 6.0) & far & tex[:, None] & tex[None]).sum(1) >= 3
    chrome = persist.mean(0) >= 0.25
    framed = (persist & chrome).sum((1, 2)) / (gh * gw) >= 0.015
    return float(framed.mean())


def layout_desc(fr):
    e = cv2.Canny(fr, 60, 160).astype(np.float32)
    g = cv2.resize(e, (12, 8), interpolation=cv2.INTER_AREA).ravel()
    t = cv2.resize(fr, (12, 8), interpolation=cv2.INTER_AREA).astype(np.float32).ravel()
    g = (g - g.mean()) / (g.std() + 1e-6); t = (t - t.mean()) / (t.std() + 1e-6)
    return np.concatenate([g, t]) / np.sqrt(2 * g.size)


_TPL_CACHE = {}


def template_similarity(F, shots, template):
    if template not in _TPL_CACHE:
        T, _ = decode_gray(template, fps=2, limit=12)
        T = T[:24]                                       # first 12 seconds
        T = T[:, : int(T.shape[1] * 0.85)]
        _TPL_CACHE[template] = np.array([layout_desc(x) for x in T])
    TD = _TPL_CACHE[template]
    sims, durs = [], []
    for s, e in shots:
        k = (s + e) // 2
        v = layout_desc(F[k])
        sims.append(float((TD @ v).max())); durs.append(e - s)
    sims, durs = np.array(sims), np.array(durs, float)
    return float(durs[sims >= 0.70].sum() / durs.sum()), float(sims.max())


BP_HUE, BP_SAT, BP_VAL, BP_FRAME = (225, 300), 0.30, (0.06, 0.90), 0.30


def blue_purple(path, fps=SAMPLE_FPS, width=160):
    """Blue-purple frame share and timecodes of blue-purple stretches. A frame where ≥30% of pixels have hue 225°–300°, saturation ≥0.30, value 0.06–0.90 counts as blue-purple."""
    w, h = probe(path)[:2]
    hh = max(2, int(round(h * width / w / 2)) * 2)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps={fps},scale={width}:{hh}",
                          "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
    F = np.frombuffer(raw, np.uint8).reshape(-1, hh, width, 3).astype(np.float32) / 255
    if not len(F):
        return 0.0, []
    r, g, b = F[..., 0], F[..., 1], F[..., 2]
    mx, mn = F.max(-1), F.min(-1); d = mx - mn + 1e-6
    sat = d / (mx + 1e-6)
    hue = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    m = (hue >= BP_HUE[0]) & (hue <= BP_HUE[1]) & (sat >= BP_SAT) & (mx >= BP_VAL[0]) & (mx <= BP_VAL[1])
    bad = m.reshape(len(F), -1).mean(1) >= BP_FRAME
    spans, start = [], None
    for i, x in enumerate(list(bad) + [False]):
        if x and start is None: start = i
        if not x and start is not None:
            if i - start >= 2: spans.append((round(start / fps, 1), round(i / fps, 1)))
            start = None
    return round(float(bad.mean()), 3), spans


# ---------------------------------------------------------------- lights
SHORT_S = float(os.environ.get("FILM_GATE_MIN_S", 20))  # the calibration set is all films of 45 seconds or more; readings of clips shorter than this are noisy, so red is downgraded to a yellow hint


FACT_GATES = {"blank_run_s", "blue_purple_share"}   # red however short the film (colors don't change with film length)


def grade(res):
    rows, red = [], False
    short = (res.get("duration_s") or 0) < SHORT_S
    for k, (name, direc, y, r, gate, unit) in METRICS.items():
        v = res.get(k)
        if v is None or direc == "info":
            rows.append((k, name, v, "--", gate, unit)); continue
        bad = (lambda t: v >= t) if direc == "high_bad" else (lambda t: v <= t)
        lv = "red" if (gate and r is not None and bad(r)) else "yellow" if (y is not None and bad(y)) else "green"
        if lv == "red" and k == "blue_purple_share" and res.get("allow_blue_purple"):
            lv = "yellow"
        if lv == "red" and short and k not in FACT_GATES:
            lv = "yellow"; res["short_clip_note"] = f"Film length {res.get('duration_s')}s, shorter than {SHORT_S}s, so the fast-motion gate only warns and doesn't block (empty frames still block); run it again on the final film once joined"
        red |= lv == "red"
        rows.append((k, name, v, lv, gate, unit))
    return rows, red


# ---------------------------------------------------------------- explained for people
FIX = ("Following references/camera-language.md, add in-shot motion where \"the audience should be looking at this moment\": slow-push to see a detail clearly (0.6–1.5 seconds, CAM.track's push), "
       "pan between several things (glide), pull out to see the whole (pull); the object's own big actions (growing, a page turning, pouring water, action in footage) count too, and when live footage moves on its own, hold. "
       "Fast pushes and slams are accents, only for reveals, twists and key numbers. A constant slow push of a few percent on every shot, fades and transitions don't count (transitions are excluded however fast). "
       "A slow push of about 20% over 1 second scores about the same here as a 0.28-second fast push, so there's no need to speed up pushes to pass the gate. "
       "And don't stuff a push-in into every shot to pass the gate: the 2026-10-12 film pushed every 2 seconds and was judged \"too many, too fast, not smooth\".")

BLANK_FIX = ("In the empty-frame stretch, keep the protagonist or main object in the picture: for a breather, let it hold, pull out, or pan from it to the next object; "
             "transitions shouldn't pass through a solid background (black, solid-color flash, gradient background) for 0.3 seconds or more. Whiteboard and black-background films aren't empty as long as there are strokes, lines or text on screen.")


BP_FIX = ("Replace the blue-purple background: give every clip spec the same \"theme\" (paper, poster, ink, navy, bauhaus, snow, wood or chalk from references/palettes.md, "
          "or define your own by its rules), and use that palette in scenes too; no deep-purple starry skies, blue-purple gradients or neon cyan-purple glows. "
          "Only when the topic itself needs blue-purple (a cyberpunk purple the user asked for, Van Gogh's Starry Night) use --allow-blue-purple \"reason\"; the reason is written into the delivery notes.")


# Report-only yellow items: one sentence on "where to look"
LOOK = {
    "fast_ratio_worst_window": lambda r: f"{r['worst_window_start_s']:.0f}–{r['worst_window_start_s'] + r['worst_window_len_s']:.0f}s has almost no fast action (tight start, loose end)",
    "drift_ratio": lambda r: f"{r['drift_ratio']:.0%} of frames are slowly drifting",
    "longest_still_s": lambda r: f"completely still for {r['longest_still_s']:.1f}s from {r['longest_still_start_s']:.1f}s",
    "event_rate": lambda r: f"only {r['event_rate']:.1f} visual events per 10 seconds on average",
    "max_event_gap_s": lambda r: f"up to {r['max_event_gap_s']:.1f}s without any change or fast action",
    "dead_bg": lambda r: f"after removing camera motion, on average {r['dead_bg']:.0%} of the picture never changes within a shot",
    "dead_flat": lambda r: f"{r['dead_flat']:.0%} of the picture is an empty background that never changes",
    "flat_light": lambda r: f"empty beige/white background takes {r['flat_light']:.0%} of the area on average (fine for light styles like whiteboard; confirm it's the style and not just empty)",
    "page_frame_share": lambda r: f"{r['page_frame_share']:.0%} of the time is framed by a fixed header, page number, title bar or logo",
    "slow_zoom_share": lambda r: f"{r['slow_zoom_share']:.0%} of the time is constant slow push / slow pull shots",
    "push_in_per_min": lambda r: (f"at least {r['push_in_per_min']:g} push-ins per minute (of which {r['fast_push_per_min']:g} fast pushes; push-ins are {r['push_in_share']:.0%} of push/pulls); "
                                  f"one zoom-in after another feels rushed and not smooth; watch it at normal speed and check whether you pull out or pan back after pushing in (references/camera-language.md)"),
    "dissolve_share": lambda r: f"{r['dissolve_share']:.0%} of transitions are crossfades",
    "template_sim_share": lambda r: f"{r['template_sim_share']:.0%} of the time looks almost the same as the demo film's composition",
}


def explain(res):
    """One-sentence verdict + why + how to fix + where to look for yellow items. Uses only numbers measured in res."""
    fr, lv = res["fast_ratio"], res["lights"]["fast_ratio"]
    if lv == "red":
        head = ("The whole film has not a single fast in-shot action; it reads like flipping pages" if fr < 0.005 else
                f"Only {fr:.1%} of the film's frames have fast in-shot motion (red line 3.5%); it reads like flipping pages")
    elif lv == "yellow":
        head = f"Fast in-shot action is on the low side ({fr:.1%}, yellow line 6%), not far from a page-flip feel"
    else:
        head = f"There's enough fast in-shot action ({fr:.1%})"
    if res.get("short_clip_note"):
        head += ". " + res["short_clip_note"]
    blank_red = res["lights"].get("blank_run_s") == "red"
    if blank_red:
        segs = ", ".join(f"{a:.2f}–{b:.2f}s" for a, b in res["blank_runs_s"])
        head = (f"{len(res['blank_runs_s'])} near-solid empty stretch(es) mid-film ({segs}), the longest {res['blank_run_s']:.2f}s, "
                f"with almost no edges or texture in the frame and the subject out of the picture") + ("; also, " + head if lv != "green" else "")
    bp = res["lights"].get("blue_purple_share")
    if bp in ("red", "yellow") and not res.get("allow_blue_purple"):
        segs = ", ".join(f"{a:.1f}–{b:.1f}s" for a, b in res["blue_purple_spans_s"][:6])
        msg = f"{res['blue_purple_share']:.0%} of the picture has a blue-purple background ({segs})"
        head = (msg + ", the most typical AI color scheme" + ("; also, " + head if lv != "green" or blank_red else "")) if bp == "red" else head + "; " + msg
    elif res.get("allow_blue_purple") and res["blue_purple_share"] >= METRICS["blue_purple_share"][2]:
        head += f"; blue-purple background {res['blue_purple_share']:.0%}, declared as needed by the topic: {res['allow_blue_purple']}"
    why = []
    if lv != "green":
        if res["slow_zoom_share"] >= 0.3:
            why.append(f"{res['slow_zoom_share']:.0%} of the time is constant slow push / slow pull")
        if res["still_ratio"] >= 0.5:
            why.append(f"{res['still_ratio']:.0%} of frames are completely still")
        elif res["drift_ratio"] >= 0.4:
            why.append(f"{res['drift_ratio']:.0%} of frames are just slowly drifting")
        if res["hard_cuts"] + res["dissolves"]:
            why.append(f"picture changes rely mainly on transitions (hard cuts {res['hard_cuts']}, fades {res['dissolves']}), and transitions don't count as in-shot action")
    look = [(k, LOOK[k](res)) for k, l in res["lights"].items() if l == "yellow" and k in LOOK]
    ww = None
    if res.get("worst_window_start_s") is not None:
        a = res["worst_window_start_s"]
        ww = {"start_s": a, "end_s": round(a + res["worst_window_len_s"], 2), "fast_ratio": res["fast_ratio_worst_window"]}
    fix = " ".join(x for x in (BP_FIX if bp == "red" else None, BLANK_FIX if blank_red else None, FIX if lv != "green" else None) if x) or None
    return {"summary": head, "why": why, "fix": fix, "look": look, "worst_window": ww, "blank_runs": res["blank_runs_s"]}


def measure(path, sub_band=None, vertical="auto", template=DEFAULT_TEMPLATE, allow_blue_purple=None):
    """Measure one final film, returning results with lights / gate_light / verdict / explain. Also called by deliver.py.
    allow_blue_purple: the reason (a non-empty string) when the topic itself needs blue-purple; the blue-purple gate downgrades to yellow and the reason goes into the results."""
    tpl = template if template and os.path.exists(template) else None
    cv2.setNumThreads(max(1, (os.cpu_count() or 2) // 2))
    res = analyze(path, sub_band=sub_band, vertical=vertical, template=tpl)
    res["blue_purple_share"], res["blue_purple_spans_s"] = blue_purple(path)
    if allow_blue_purple and allow_blue_purple.strip():
        res["allow_blue_purple"] = allow_blue_purple.strip()
    rows, red = grade(res)
    res["lights"] = {k: lv for k, _, _, lv, _, _ in rows}
    res["gate_metrics"] = [k for k, _, _, _, gate, _ in rows if gate]
    gl = [res["lights"][k] for k in res["gate_metrics"]]
    res["gate_light"] = "red" if "red" in gl else "yellow" if "yellow" in gl else "green"
    res["verdict"] = "red" if red else "pass"
    res["explain"] = explain(res)
    return res, rows


LIGHT = {"red": "[red]   ", "yellow": "[yellow]", "green": "[green] ", "--": "[      ]"}


def report_lines(res, rows):
    """Text report (shared by the terminal and the delivery notes)."""
    L = [f"{res['file']}  {res['orientation']}  {res['duration_s']}s  "
         f"shots {res['shots']} (hard cuts {res['hard_cuts']}, fades {res['dissolves']})  average shot length {res['asl_s']}s"]
    for k, name, v, lv, gate, unit in rows:
        vs = "—" if v is None else (f"{v:.3f}" if isinstance(v, float) else str(v))
        L.append(f"  {LIGHT[lv]} {'gate  ' if gate else 'report'}  {name}: {vs}{unit}")
    ex = res["explain"]
    if res.get("blank_runs_s"):
        L.append("  Empty-frame timecodes: " + ", ".join(f"{a:.2f}–{b:.2f}s" for a, b in res["blank_runs_s"]))
    if res.get("blue_purple_spans_s") and res["lights"].get("blue_purple_share") != "green":
        L.append("  Blue-purple background timecodes: " + ", ".join(f"{a:.1f}–{b:.1f}s" for a, b in res["blue_purple_spans_s"]))
    if res.get("allow_blue_purple"):
        L.append(f"  Declared as needing blue-purple by the topic: {res['allow_blue_purple']}")
    if ex["worst_window"]:
        w = ex["worst_window"]
        L.append(f"  Worst {w['end_s'] - w['start_s']:.0f}-second window: {w['start_s']:.0f}–{w['end_s']:.0f}s, fast-motion ratio {w['fast_ratio']}; "
                 f"fast-motion ratio per 10 seconds: {res['fast_ratio_by_10s']}")
    return L


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("mp4")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--vertical", default="auto", choices=["auto", "yes", "no"],
                    help="landscape or portrait; auto decides by width and height. Only affects the default subtitle band")
    ap.add_argument("--sub-band", type=float, default=None,
                    help="fraction of the bottom subtitle band to mask; default 0.15 landscape, 0.18 portrait; 0 means no masking")
    ap.add_argument("--template", default=DEFAULT_TEMPLATE, help="demo film (the first 12 seconds are used to compare composition)")
    ap.add_argument("--no-template", action="store_true")
    ap.add_argument("--allow-blue-purple", metavar="REASON", default=None,
                    help="give a reason when the topic itself needs blue-purple (a cyberpunk purple the user asked for, Van Gogh's Starry Night); the blue-purple gate downgrades to yellow")
    a = ap.parse_args()
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        print("ffmpeg/ffprobe required", file=sys.stderr); sys.exit(1)
    try:
        res, rows = measure(a.mp4, sub_band=a.sub_band, vertical=a.vertical, template=None if a.no_template else a.template,
                            allow_blue_purple=a.allow_blue_purple)
    except (subprocess.CalledProcessError, KeyError, IndexError, RuntimeError, ValueError) as e:
        print(f"Can't read this film: {a.mp4} ({e})", file=sys.stderr); sys.exit(1)
    red = res["verdict"] == "red"
    if a.json:
        print(json.dumps(res, ensure_ascii=False, indent=1))
    else:
        print("\n".join(report_lines(res, rows)))
        ex = res["explain"]
        tag = {"red": "red light, no film delivered", "yellow": "yellow light, deliverable but needs a human look", "green": "gate passed"}[res["gate_light"]]
        print(f"Verdict: {tag} — {ex['summary']}." + (" " + "; ".join(ex["why"]) + "." if ex["why"] else ""))
        if ex["fix"]:
            print("How to fix: " + ex["fix"])
        if ex["look"]:
            print("Yellow items (report only, not blocking; go look at these stretches and explain each in the delivery notes):")
            for _, t in ex["look"]:
                print("  - " + t)
        if not red:
            print("Reminder: the gate only blocks three defects: \"almost no fast action in the whole film\", \"empty frames mid-film\" and \"blue-purple backgrounds\"; the independent review still has to be done.")
    sys.exit(2 if red else 0)


if __name__ == "__main__":
    main()
