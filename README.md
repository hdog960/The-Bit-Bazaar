# The Bit Bazaar — The Great Figurine Sort

iPhone-first pixel-art collectible-store game. Live: https://hdog960.github.io/The-Bit-Bazaar/

## v0.3.1: optional-distance upgrade to the stable 3,000-figure expansion
- Full unique pixel sprites still render with a hard 70-figure cap to 19 store units.
- Farther away, an additional **30** figures render as tiny sprites from the **already-loaded original atlas** (no extra sprite texture generation) between roughly 9 and 29 store units; selected figures are distributed across near/middle/outer depth bands.
- Beyond 29 units, up to **65** lightweight pixel silhouettes are visible out to **39 store units**, about twice the original view distance. These are simple colored rectangles, not new images.
- The distant renderer samples no more than 7 real figure references per six-unit spatial tile, so camera rotation doesn't scan all 3,000 figures.
- If the added distance causes repeated severe frame stalls, the game switches to [stable.html](https://hdog960.github.io/The-Bit-Bazaar/stable.html), the previously verified 3,000-figure v0.3.0 engine, which uses the SAME v3 save. That engine can still fall back to safe.html, the 1,000-figure recovery game, if needed.
- This was tested in 1,200 simulated animation iterations with 112 small sprite canvases maximum. Physical iPhone testing remains necessary to verify comfort and stability.

## v0.3.0: safe 3,000-figure expansion
- **3,000 unique collectible IDs and names**, distributed across **300 themed sets of exactly ten**.
- **20 freestanding racks with TWO usable faces**: 20 × 2 × 5 × 10 = **2,000 shelf slots**.
- **20 single-sided wall shelves**: 20 × 5 × 10 = **1,000 shelf slots**.
- **300 independent display rows**. Each row accepts one complete 10-figure set; different sets cannot be mixed, and a set cannot be split across rows.
- All 2,000 additional figures extend the original 1,000 sprites using eight distinct pixel-art edition palettes and silhouette accessories (crowns, wings, banners, horns and so forth). Each new visual is generated *only on demand*.

## Performance and safety
The earlier v0.2.0 release was rolled back after it apparently overwhelmed an iPhone. That version built a 800 × 4,800 pixel atlas synchronously, processed 2,000 additional recolors at launch and repeatedly scanned all 3,000 collectibles while rendering. **Do not restore v0.2.0's buildAtlas function.**

v0.3.0 instead:
- Keeps the original 800 × 1,600 pixel atlas loaded as a single static image.
- Generates tiny **32 × 40 pixel** alternate figures lazily (maximum two conversions per rendered frame).
- Has a **112-slot sprite-cache ceiling**. Old GPU canvas surfaces are *reused* rather than constantly allocated.
- Uses a fixed 6-unit spatial grid for the collectible floor. Nearby cells alone are searched for rendering and pickup.
- Renders at most 70 nearby floor figures each frame, or 42 in slow mode, while all 3,000 remain actually collectible and saved.
- Caps the mobile software renderer near 24 FPS (20 FPS during slow-frame protection).
- If three severe 115 ms render stalls occur, stops the expansion and navigates automatically to the safe 1,000-figure recovery page.

All of these limits have code-level and simulated-frame QA tests, but **they are not a guarantee of device stability**. Do not claim the build has been tested on a physical iPhone until it has.

## Recovery / saves
- Normal game: `index.html` → `game-v0.3.js` and assets. The save key is **`bit-bazaar-save-v3`**.
- Emergency recovery: [safe.html](https://hdog960.github.io/The-Bit-Bazaar/safe.html) → old original `game.js`, using its original **`bit-bazaar-save-v1`** key.
- The 3000-figure game copies old v1 progress on its first launch without deleting or overwriting v1 data. Its first 20 shelf fronts correspond to original shelves 1–20.
- The old `game.js` is retained deliberately. Do not replace it with the expanded renderer.
- `sw.js` caches both builds with network-first updating and offline support. To publish, GitHub Pages serves the `main` branch at root.

## Controls
iPhone: left joystick to move, drag the right side to look around, tap pick-up/shelf action button. Desktop: WASD, drag to look, E interact, TAB collection.

## QA
- [preview.html](https://hdog960.github.io/The-Bit-Bazaar/preview.html) is a non-service-worker preview for browser testing.
- `qa.html` includes a scripted camera-turning and performance harness. Some content-fetching services return its static HTML without executing JavaScript, so do not misinterpret static `QA: BOOTING` as a runtime failure or success.
- The game exports `window.BitBazaarQA.stats()` with visible/cached sprite counts, draw cadence, and 60-face capacity; it also supports placement tests across old, reverse and wall fixtures.
