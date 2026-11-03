# The Bit Bazaar — The Great Figurine Sort

## v0.12.0 — Phase 3 pinned collecting, faster browsing and precise shelf map navigation
Under the approved [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md), this is an additional **Phase 3 UI and usability milestone**. No customers, store sales, resource currencies or Sacrifice Catalog decoration mechanics have been introduced.

**Persistent pinned collections:**
- Pin/unpin any of the 300 named collectible sets directly from its illustrated Almanac detail. Add a seventh, horizontally scrollable **★ PINNED** filter, stars in the list and map, and a pinned count in the collector overview.
- `pinnedSets: number[]` is an optional backward-compatible property in the same `bit-bazaar-save-v3` JSON, validated against actual collection IDs. Older v0.11 and earlier saves load with an empty pin list and retain their figure locations, discovered IDs, clean faces, floor mess stages, hidden figures and lifetime mastered sets.
- Pinned sets are prioritized in the map's existing **FIND A SET ALREADY ON A SHELF** dropdown. Pinning is organization only: it never reveals the location of any loose or hidden figurine.

**Almanac navigation:**
- **PREVIOUS SET / NEXT SET** move through the currently searched, sorted or filtered 300-set list without rebuilding the entire book. When a set is removed from the PINNED filter, the next/previous controls still choose a valid remaining set.
- Returning to **COLLECTION LIST** restores the previously loaded results (48 per page) and the exact scroll position instead of sending an iPhone player back to the beginning of 300 entries.
- Mobile-friendly pixel-art pin, list-turn and navigation controls with clearly defined tap targets and focus indicators.

**Store Map:**
- New **⌖ FIND ME** button zooms and pans the overhead floor plan to the current player coordinates and chooses the nearest shelving unit. **◉ CENTER SELECTED SHELF** centers the currently inspected rack.
- Selecting a named set from the map dropdown or following **FIND THIS SHELF ON THE STORE MAP** from the Almanac selects the correct shelf/face, highlights the set, and automatically pans the 2× zoom view to that physical fixture. The map remains non-navigational for scattered/hidden figures.
- Real shelf rows show exactly which set numbers are **still missing** (e.g. NEED #2, #3, #4) and highlight existing figurines sitting in a wrong numbered slot. Full, disorderly rows show the number of misplaced figures. These hints only derive from set membership and in-shelf figure numbering, never from floor positions.

**Safety and QA:** Version-specific new assets and offline cache `bit-bazaar-v0.12.0`; the emergency fallback [baseline-v0.12.0-lowfx.html](./baseline-v0.12.0-lowfx.html) uses the same `pinnedSets` and existing save format with 20fps rendering and simplified floor geometry. Automated tests verified pin/unpin and reload, the seventh Almanac filter, 48/96-item paginated scrolling, next/previous/detail return, missing-number and wrong-slot map feedback, auto-centering on assigned shelf/player, old-save migration, low-effects continuity and severe-frame fallback. A 1,440-tick render simulation produced **480 drawn frames** with 112 cached canvases and the existing near/mid/far caps. **Physical iPhone playtesting remains necessary.**

**Next:** continue Phase 3's visual/readability and collection-navigation QA before evaluating readiness for the 180-item Phase 4 Sacrifice Catalog.

## v0.11.0 — Phase 3 Collection Almanac discovery journal & iPhone map zoom
Roadmap: [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md). **Phase 3 is still in progress**; do not begin Phase 4 Sacrifice Catalog prematurely. No customers or in-game shop sales.

**Discovery journal**
- Maintain `seenFigures: number[]` in the existing version-1 `bit-bazaar-save-v3` payload. A figurine becomes **discovered only when physically picked up or inspected in-world**. A shelf pickup also counts. Browsing an unobserved figure inside the Almanac cannot unlock its identity or lore.
- Old saves (before v0.11) populate the journal conservatively from already-shelved figures, figures in hand and dropped ground-position entries. All other figures remain undiscovered until observed. Existing shelves, saved slot positions, 45 floor patches, 60 clean faces, 18 hidden collectibles and lifetime perfected sets remain unchanged.
- For the 300 named sets, an interactive journal overview shows the number of real discovered figurines (of 3,000), figures on shelves, currently perfect rows, lifetime mastered sets, started sets, and full-but-unsorted rows.
- **Six filters:** all, in progress, needs sorting, perfect now, undiscovered, mastered ever. **Four sorts:** collection number, closest to completion, most discovered, A–Z. Search by set name, theme or numeric set ID. Results are paginated 48 at a time to keep mobile DOM work bounded.
- Individual set pages display ten real existing miniature sprites when discovered, **dark silhouette placeholders** for unseen IDs, set names/number, exact current shelf-slot order, and links to the specific assigned shelf. Unseen figure roles, names, lore and any loose/secret positions are NOT disclosed by the journal.
- Inspection cards remain available for known figurines, and all 3,000 figure IDs continue to use the original atlas and collision-safe world positions.

**Improved Store Map**
- **FIT STORE / ZOOM 2× · DRAG** modes, with a panning viewport for magnifying rack labels on iPhone.
- Dropdown to quickly locate only sets that have already been started in an actual assigned row. Selecting one zooms the logical focus to its real fixture, display face and highlighted collection row; the map still never points to scattered figurines.
- Existing 40 fixture polygons, 60 real shelf faces, and player location/direction remain driven by game state; no map redraw work is performed every render frame.

**QA:** automated tests checked initial 0/3,000 discoveries, paginated 48/96 set cards, unknown-vs-known figure privacy, pickup/drop/reload journal persistence, all six filters and closest-to-completion sort, a full unsorted 10-figure row earning 0 completion credit, rearranging to exact 1–10 earning 1 permanent mastered set, map collection lookup/zoom, old-save migration for carried/shelved/dropped figures and v0.11-compatible low-FX fallback. The 1,440-tick simulated performance run rendered 480 frames under the existing 112-canvas and near/mid/far limits. **Physical iPhone playtesting is still required.**

**Safe fallback:** [baseline-v0.11.0-lowfx.html](./baseline-v0.11.0-lowfx.html) runs a ~20fps, low-draw renderer with the same `seenFigures` and restoration save schema. Severe simulated frame stalls navigate there instead of an older build that could lose discovery history.

**Next:** Phase 3 polish for small-screen readability, longer session save QA and collector browsing; get feedback on the actual iPhone UI before Phase 4.

## v0.10.0 — Phase 2 polish + Phase 3 interactive floor-plan milestone
The six-phase creative plan is defined by [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md). This release finishes an initial **Phase 2 cleaning-feedback pass** and begins **Phase 3**; it does not claim Phase 3's entire almanac and mapping work is finished.

**Cleaning and restoration polish:**
- New reticle-targeted step meter: **CLEANING 0/1, 0/2 or 0/3** as appropriate for papers, cartons, stains and dirty shelf faces. Context adapts to a held figurine and still requires **empty hands**.
- Brief, CSS-only brush/sparkle feedback identifies the specific completed action (e.g. WIPE DUST, FLATTEN CARDBOARD, POLISH FLOOR), with no new texture atlases, canvas allocations, timer-driven chores, or ability to clean dirt multiple times.
- Completing **all 60 shelf faces** or **all 45 permanent floor messes** triggers a short milestone banner. If both are restored, it recognizes the **entire shop as spotless**. All 18 previously hidden figurines remain within the original 3,000 and discovery/save tracking remains untouched.

**The Store Map (first Phase 3 milestone):**
- New **▦ MAP** button in the iPhone top bar and **M** on desktop. The existing **COLLECTION** button remains accessible.
- Overhead, interactive SVG layout is built **directly from the 40 existing fixture records**, not a generic invented map: 20 double-sided freestanding racks + 20 wall displays, containing all **60 real display faces** and five rows per face.
- Shows the player's saved/current x/z position and heading as a bright directional arrow, updated whenever the map is opened. Selecting any fixture displays front/rear face controls (where relevant), current clean/dirty status, five individual rows, their assigned collection names, occupied slot numbers 1–10, current/perfect/sort-needed states and overall row totals.
- Tap a set on the map to open it in the existing collector almanac. From a set's almanac detail page, **SHOW SHELF ON STORE MAP** jumps back to the exact fixture, face and highlighted set row.
- Intentionally **does not reveal any loose or hidden figure locations**; the locator is only for already-shelved collections. SVG is created only when the map drawer opens or selection changes, so there are no continuous map-frame redraws.
- Map and cleaning feedback are presentation-only additions to the existing `bit-bazaar-save-v3` schema: no migration or player progress reset required.

**QA / release:** verified 40 clickable fixture shapes, 60 physical faces, real two-sided row assignments, saved figure slot order, player coordinates/heading, two-way map/almanac links, and 60-shelf + 45-floor + 18-hidden restoration milestones. Replayed 1,440 simulated animation ticks (480 drawn frames) with **≤112 cached sprite canvases** and unchanged 70/30/65 near/mid/far rendering limits. Existing [v0.9 low-effects recovery](./baseline-v0.9.0-lowfx.html) remains save-compatible and was exercised under simulated high frame latency. Real-device iPhone QA is still needed.

**Next Phase 3 work:** expand the illustrated Almanac and store-map readability, discoverability and selection polish; do not start decorations before Phase 3 is reviewed.

## Phase 2 environmental restoration milestone — v0.9.0 (Nov 3, 2026)
This is the next playable Phase 2 increment under [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md). The game still has no customers, sales, timers, or automatic dirt respawns.

**Implemented:**
- **45 permanent floor-cleaning locations** placed deterministically in collision-free aisles. Three visually distinct types, **15 each**: scattered papers/wrappers, cardboard shipping cartons and stained/scuffed floor patches. Real 16-bit world geometry (no new texture sheets, sprite atlases, or canvas allocations).
- **Three different cleanup interactions**, all requiring **EMPTY HANDS**, aimed with the existing center reticle and cleaned using the ordinary action button / E key:
  - Paper: **GATHER SCRAPS** in one action, removing scattered wrappers.
  - Cartons: **FLATTEN CARDBOARD → REMOVE PACKING**; box piles physically flatten before disappearing.
  - Scuffs: **SWEEP GRIT → SCRUB STAIN → POLISH FLOOR**, visibly improving with each stage.
- Objects disappear permanently when clean. Small in-world green feedback and messages celebrate progress. HUD tracks **SHELVES 0/60 · FLOOR 0/45 · HIDDEN 0/18** (or the player's saved values).
- **Existing v0.8 saves** gain the 45 new optional cleanup patches without resetting their prior clean shelves, discovered hidden figures, named figure placements, numbered slots or lifetime mastered collections. A one-time pre-update copy is kept at `bit-bazaar-v3-before-floor-cleaning`. All partial floor-cleaning stages are saved to `floorCleaning[45]` in `bit-bazaar-save-v3`.
- All **3,000 real figurines** remain unchanged. **18 secret figures** remain linked exclusively to their previous shelf packaging messes. Cleaning ambient floor objects never creates or consumes collectible figures.
- Enhanced **v0.9 low-effects recovery** at [baseline-v0.9.0-lowfx.html](./baseline-v0.9.0-lowfx.html), which retains the same current save format and targetable clutter, but replaces detailed cardboard/trash/stain geometry with simple in-world colored shapes, omits shelf grime art and lowers scene rendering to 42 near, 12 mid, 20 far and 20 FPS. Emergency slow-frame diversion never opens an old build that would discard floor-cleaning progress.
- **Regression QA**: all 45 locations checked for fixture collision, all cleanup types and 1/2/3-stage completions, midway-save reload, save migration, 18-figurine preservation, reticle aim to a floor mess, and a 1,200-tick simulated iPhone scene render (400 rendered frames; ≤112 cached sprite canvases). Simulated severe frame stalls reached the safe v0.9 recovery page. Physical iPhone testing still needed.

**Remaining Phase 2 polish**: optimize and visually refine individual cleaning actions based on iPhone feedback and ensure restoration goals/readability continue to feel satisfying. Phase 3 almanac map work begins after Phase 2 acceptance.

## Phase 2 cleaning first playable milestone — v0.8.0 (Nov 3, 2026)
The six-phase creative scope remains frozen in [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md). This is the **first Phase 2 slice**, not a claim that the entire cleaning phase is completed.

**Implemented:**
- New stores start with **all 60 shelf faces dusty, cobwebbed and littered**. Each face requires three brief, reticle-targeted empty-hand actions: **WIPE DUST → REMOVE COBWEBS → CLEAR PACKAGING**. The face's five rows cannot be used until all three stages are complete.
- Aimed dirty rows highlight teal and the normal PICK UP / PLACE button becomes **CLEAN**; the PUT DOWN action allows freeing the single occupied hand. With a held figure, the shelf rejects placement and explains why.
- Cleaning visibly strips low-cost procedural dust haze, spiderweb strands and cardboard scraps from that display. Restoration is permanent, and no grime respawns randomly.
- Exactly **18 unique IDs from the original 3,000 figurines** are hidden in 18 fixed shelf-face messes, not generated in addition. They have `onFloor=false` while concealed. Finishing their specific packaging cleanup reveals the real collectible with a nearby, collision-checked floor position, turquoise highlight and collectible discovery toast. Cleaned progress and discoveries are written to `bit-bazaar-save-v3`.
- Lightweight on-screen tracking of **restored faces (0–60)** and **hidden discoveries (0–18)**, with no additional texture atlas or permanent canvas allocations.
- Existing pre-cleaning saves are **grandfathered**: all 60 faces are already restored and all 18 special IDs remain accessible as before, without any saved positions getting locked or reset. The untouched original pre-cleaning v3 state is backed up once to `bit-bazaar-v3-before-cleaning`.
- The emergency fallback is now [baseline-v0.8.0-lowfx.html](./baseline-v0.8.0-lowfx.html), which uses the *same new save and cleaning/discovery rules*, but skips procedural grime drawing and runs at a reduced ~20 FPS, 42 near / 12 mid / 20 far budget. It does not register a conflicting service worker.
- QA tested 60 three-step cleans, 18 unique secret reveals, pickup/place/drop constraints, exact preservation of all 3,000 figures and slot positions, full save reload, old v0.7 migration including lifetime mastery, reticle CLEAN interaction and low-effects recovery. In 1,200 simulated 60 Hz frames, 400 images were rendered within the original 112-sprite canvas ceiling. **Real-world iPhone QA is still needed.**

**Next within Phase 2:** expand off-shelf environmental cleaning (loose trash, floor messes, packaging piles) and polish the cleaning actions/art, while preserving the 18-figure hidden-discovery cap and existing performance safeguards.

## Phase 1 inspection & presentation milestone — v0.7.0
The [locked master roadmap](./MASTER_ROADMAP_LOCKED.md) remains in effect. Development is continuing Phase 1 only: no customers, no shop sales, and no new high-memory sprite sheets.

**Implemented in v0.7.0:**
- **Figurine CLOSE-UP** inspection from the **⌕ LOOK** button when holding or aiming at a loose / shelved figure, desktop **F**, and now-tappable individual entries in the collector's almanac.
- A single lightweight inspection card magnifies the existing 32×40 pixel sprite; includes original figurine name, themed collection name, set and individual #1–10, role/codename, current hand/shelf status, and a distinct short dynamically generated lore vignette. It never reveals loose figures' map coordinates.
- Large **PERFECT 1–10** CSS-only celebration, naming the just-finished collection. It distinguishes the first time a set is perfected from perfecting it again. Short-lived reticle and highlighted shelf-cubby feedback on picking up, swapping, placing and undo.
- Persistently track **lifetime first-perfect sets** separately from *currently perfect rows*, preparing for future permanent achievements and Sacrifice Catalog re-scatters. Old v0.6 saves infer previously perfect sets and migrate automatically without modifying the old recovery save; new saves store `lifetimePerfect` as an array of 0–299 IDs.
- While the inspection overlay is open, walking and world drawing are paused. Closing returns to normal play, or to the previous almanac panel if inspection started there.
- Slow-render emergency recovery now loads [baseline-v0.6.0.html](./baseline-v0.6.0.html), which uses the former ordered-slot renderer; its recovery script preserves the new lifetime mastery property and ten-slot save positions instead of silently discarding them.
- QA verified a shuffled ten-figure row is NOT complete, one-handed sorting yields first-ever completion, reverting and re-perfecting retains lifetime count, in-game inspection content and 3,000 distinct micro-lore snippets, save reload and legacy mastery migration. Further 720 simulated animation ticks verified 240 rendered frames, 112-canvas ceiling, 70/30/65 visibility caps; severe slow-frame fallback was exercised successfully. **A physical iPhone browser test is still necessary.**
- **Still pending for Phase 1:** visual/art review of the individual figure inspection display and refinements based on real-device feedback. Phase 2 cleaning/cobwebs and 18 hidden figurines have not yet been implemented.

## Phase 1 first playable milestone — v0.6.0
Master scope and stage gates are locked in [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md). No customers, no standard store sales.

**Implemented and tested in v0.6.0:**
- Ten independently selectable **physical slots** for each shelf row; the center reticle targets individual slots on all 60 shelf faces (including the reverse sides of the 20 double-sided racks).
- Players decide where each figure is placed; collectible sets are clearly named with individual **#1–10** labels in the HUD, on close shelf art and in the almanac.
- With an empty hand, aim at a placed figure to **LIFT** it. While holding a matching figure, target another occupied slot to **SWAP** the two, carrying only the displaced figure.
- **PERFECT completion counts only a fully ordered 1–10 set.** Full but scrambled rows are marked “FULL — SORT 1–10” and do not advance the completion counter or grand finale.
- Explicit physical slot positions are saved alongside old compact membership rows in `bit-bazaar-save-v3`. Legacy saves migrate without losing existing placements; their pre-update contents are backed up once under `bit-bazaar-v3-before-ordered-slots`.
- Existing single-hand carrying, wrong-set rejection, deliberate whole-set movement to a new empty row, undo, up/down reticle camera, shelf occlusion and performance safeguards continue working. Repeated extreme slow frames recover to [baseline-v0.5.0.html](./baseline-v0.5.0.html).
- QA: fill one row with 10 out-of-order figurines (zero completions), reorder via physical one-hand swaps (one completion), save/reload slot positions, verify pre-v0.6 compact-save migrations, precise left-to-right slot aiming on both sides of a freestanding shelf, correct 3,000-figure totals, and 1,440 simulated 60 Hz ticks with <=112 cached sprite canvases.
- **Not yet implemented**: polished close-up inspection animation/lore and the rest of Phase 1; Phases 2–6 stay locked as later work. No claim of physical-iPhone certification.


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
