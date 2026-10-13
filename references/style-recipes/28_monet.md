# 28_monet · 1899 Monet *Water Lilies* + *The Japanese Footbridge*

> Source: migration test C (built by an independent agent that only read the skill, 2026-10-04). The scene code was ported to `scripts/engine/scenes/28_monet.js` after integration.

Filename during the experiment: `scenes/k2_monet.js` (176 lines). About 105ms per frame, frame diff 30% (mostly the water boiling).

**Composition**: the wall = an Orangerie-style water-lily mural (the whole wall is water surface), the window = the green Japanese bridge (arched bridge + wisteria + pond), green Giverny shutters on both sides of the window, the girl seated in front of the mural.

**Pipeline (09 benchmark structure)**
1. Underdrawing `moBase`, redrawn every frame because the lilies drift and the willow shadows sway.
   - Water: vertical gradient `#b9c7e6→#8fa6d6→#6c84bf→#5a72a8`, plus 4 patches of pale pink-yellow sky reflection.
   - Willow shadows: 5 vertical bands, edges wavering sideways `sin(0.03y−3.2t+k)·14`.
   - Water lilies: 10 clumps, about 100 notched ellipses in total (rx 38–78, ry 12–21), 40% with pink/white flowers.
2. Four stroke passes:
   - Water: cell 9, len 34, w 6.5, **horizontal** angle≈0±0.06, boil 6.
   - Window view: cell 6, len 13, w 4.5, diagonal strokes in the upper half, horizontal in the lower half, boil 6.
   - Floor: cell 12, len 34, w 8, **boil 0**.
   - Window frame/shutters: cell 6, one vertical and one horizontal pass, boil 0.
   - Every pass outline 0 (Impressionism doesn't outline).
3. **The bridge gets its own layer**: in the underdrawing, a dark tree-shadow backing `#24452a` is laid behind the bridge first; the bridge itself is a thick `#3f8a62` line (20px) as backing, traced with a bright `#8fdcae` line. Strokes use cell 5 and a 5-color light blue-green palette. Without this, the bridge gets swallowed by the foliage palette and disappears completely.
4. Regional palettes:
   - Water `#5b6fb5 #7d8fd0 #9db5e0 #6aa0a8 #b7a6d8 #d9c8e8 #8fb8a8 #a6c4e8 #c8b0d8` (mix .45)
   - Leaves `#5f8f4a #7fae5a #3f6f4a #9cc070 #6f9a7a #b4cc78`
   - Pink `#f0a0b8 #f7d0dc #fff2f4 #e88aa0`
   - Floor `#c69a6a #b07a5a #d8b08a #9a6a7a #8a7aa8 #e0bc90`
5. Characters: flat fill in fill mode → fine strokes via source-atop (cell 6, len 12; the white dress samples from `#fbf8f2 #e4e0f6 #cfd2ee #f8ecd0 #d8e8f2`) → **colored shadows**: a linear gradient of warm yellow α.22 on the lit side and purple α.32 on the shadow side (source-atop) → only facial features added, as fine `#5a4f8a` lines.

**Motif animation**
- **Light trembling on the water**: 160 short horizontal bright strokes (`#fffbe8 #fdf0d0 #f8e0ec #e8f4ff`). Brightness `clamp(sin(t·(5..11)+φ)·sin(2.3t+i))`, jumping ±5px sideways at 10fps.
- Lilies drift `x+sin(1.3t+φ)·7+6t`, willow shadows waver, 3 ripples (dashed ellipses ry=rx·0.22, expanding and fading out).
- Wisteria: 12 hanging clusters, each 9 pale-purple dots from large to small, swaying `sin(2.4t+0.9i)·8`. The blue ribbon on the straw hat flutters.

**Characters**: an 1899 white summer dress, high collar, puff sleeves (ellipses at the shoulders), light-blue sash; RIG's straw hat painted `#ecd28a`.
**Pitfalls**
- With full-screen 6fps boiling, the frame diff was 47% — the whole screen was noise.
- The first version drew the wisteria as thick lines, which looked like smooth pills; changed to dot chains.
- The counter is hard to read over the strokes; it needs a cream glow at blur 18.

---
