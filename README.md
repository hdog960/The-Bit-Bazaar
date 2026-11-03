# The Bit Bazaar — The Great Figurine Sort

iPhone-first pixel-art collectible-store game. Live: https://hdog960.github.io/The-Bit-Bazaar/

## v0.5.0 — center-reticle interactions and vertical camera (Nov 3, 2026)
- Players drag up/down to look vertically (about ±54°), in addition to yaw. Camera pitch is stored in the same v3 save; old saves default safely to level.
- The fixed reticle in the physical center of the screen is now the interaction target. Look directly at a loose figure within pickup distance to select it; press PICK UP/E or tap the view. Off-center tap hitboxes are removed.
- While holding exactly one figurine, aim at a **specific row** (bottom 1 to top 5) on the nearest visible rack face. The selected row glows mint when valid or pink/red when it holds a different set or is full; the action label reflects its state. No shelf panel appears.
- Any **empty** row accepts the figure; a row already holding the matching set accepts another member. Incorrect sets cannot be mixed; each physical row holds at most ten. If that set was started on a different shelf, placing into an empty targeted row **moves its already-shelved pieces together** to the new row, preserving full 10-figure set completion. UNDO restores the previous set location.
- Pitch applies to project(), clipped polygons and the floor raycast. The floor renderer uses one fixed 480×270 ImageData buffer and only writes below the current horizon; no per-frame canvas allocation.
- The original 70 near / 30 medium / 65 far display limits, 112 small-canvas recycled sprite ceiling, shelf occlusion and sticky LOD remain unchanged. Three repeated severe (>115ms) frame stalls now recover to `previous.html` (known v0.4.0 direct-shelving build) rather than the older v0.3.0 recovery.
- QA: five individually aimable rows on one shelf, physical floor sprite aim/pickup, rejection of wrong set, matching row insertion, group relocation/undo, portrait drag up/down, reload of pitch and collection progress, reverse-face and wall-shelf selection, 1,440 simulated ticks, and automated fallback check. Real iPhone validation still required.

## v0.4.0: one-at-a-time, direct shelving (Nov 3, 2026)
- The player holds **exactly one figurine** at a time, not ten. A second pickup is blocked until the first figure is placed or put down.
- The separate tote and shelf placement menus have been removed from the gameplay loop. On iPhone, approach any shelf face while carrying a figure and tap **PLACE** (or tap the shelf directly). Desktop players press **E**. Collection Almanac remains available.
- The engine chooses the matching row if that set is already assigned to this display face. Otherwise, it claims that face's first unused row. It refuses incompatible placement, mixing sets, full rows and splitting one set across different display faces.
- The bottom-right UI is now a compact **held figure display**, with actual pixel sprite, figure name, set name and a **PUT DOWN** button. Putting down places the figurine physically in a nearby open aisle; that location is saved with the normal game progress.
- After a successful placement, that same small button becomes **UNDO**, reclaiming the most recently shelved figure into the player's single free hand. Picking up another figure clears the undo state; no shelf menu is required.
- Existing v3 saves and shelf assignments remain. If an older tote saved multiple carried figures, the previously selected figurine is retained, extras are restored to their deterministic floor spawn locations, and an original full-save backup is written once to `bit-bazaar-v3-before-single-carry`. The old v1 recovery save remains untouched.
- Retains 3,000 figures, 300 sets, 60 display faces, 112 re-used pixel canvases, the existing occlusion and sticky distance rendering, and automatic performance fallback to `stable.html`.
- QA: one-hand pickup, wrong shelf rejection, same-set row continuation, wall-shelf direct placement, floor put-down and persistence, original save migration, and 1,440 simulated 60Hz animation ticks with 24 FPS render budget. Real-device iPhone confirmation remains needed.

## v0.3.3: shelf-depth visibility and occlusion (Nov 3, 2026)
- Previously a floor figurine or displayed collectible behind a shelving unit could be composited in front of it by the engine's center-depth painter sorting.
- The scene now uses a true 2D **line segment vs. rotated shelf rectangle** visibility check for both floor racks and perimeter wall shelving. A ray only blocks a figurine when the wooden rack physically intersects the sightline between the camera and the figure.
- The check applies consistently to 70 near, 30 midrange and 65 distant figurines, to recent persistent IDs, to focused pickups, and to figures placed on other shelves. A shelf is excluded from testing against its **own front-facing displayed figures**.
- Broad-phase centerline-distance filtering skips precise intersection math unless a shelf could be on the sightline. The shelf geometry is cached; only camera-local data is updated per rendered frame.
- 1,440 simulated animation steps and nine targeted occlusion geometry cases passed, including front/back, sides, shelf ends, wall units, clear aisles, and the case of one shelf's displayed items behind another shelf. No blocked sprites remained in the final render ID set.
- All 3,000 figure records, 300 sets, 60 faces, existing `bit-bazaar-save-v3` saves, ~24 FPS adaptive frame pacing, 112-canvas allocation ceiling, and `stable.html` fallback remain unchanged. Physical iPhone testing is still recommended.

## v0.3.2: fixed visible figure popping and re-selection (Nov 3, 2026)
- Previously the near renderer sorted candidate figures by proximity every frame, forcing large groups to appear/disappear after very small player movements or camera turns.
- The new renderer **retains actual visible IDs** across frames and chooses unoccupied drawing slots using a deterministic ID hash; figures no longer re-roll simply because the camera moved one step.
- Near/mid/far LOD distance boundaries now overlap by ~1.75 store units, with a hysteresis buffer that keeps each figure's previous tier rather than snapping exactly at 19 or 29 units.
- Figures within 6.5 units get priority in the near budget; distant figure representation still uses stable seven-per-cell samples.
- The original 480×270 canvas is displayed with `object-fit: cover`. On portrait iPhones most of the canvas's horizontal field is cropped off-screen. Rendering selection now accounts for the **actual portrait viewport width**, so offscreen figures don't use the 70/30/65 drawing allowance.
- Retains exactly the existing sprite memory limits (112 recycled 32×40 canvases), frame limiter (~24 fps, adaptive to 20), and the three-slow-frame fallback to `stable.html`.
- QA: 1,440 simulated animation ticks, valid 3000-figure/300-set /40-unit/60-face collection, valid front/rear/wall placement, no memory-cap overrun, and no mutation of original v1 saves.
- Comparative scene sampling before the final close-range priority improvement saw portrait one-step figure re-selection drop from about 24–34 IDs to 3–10 IDs, even though the old version was spending its budget on offscreen figures.
- This is simulation QA; users should still test on a real iPhone and use `stable.html` if device responsiveness decreases.

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
