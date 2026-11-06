[Phase 6.4 acceptance evidence](PHASE6_v0.58_RELEASE.md): [safety regression suite](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42248752204), [mobile WebKit gameplay acceptance](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42248752085), and [GitHub Pages deployment](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42248751490). The exclusive monument and optional finale are the active gameplay release. **Next: Phase 6.5 — optional post-completion play.**

[Phase 6.4 v0.58 — Collector's Monument and Optional Finale](PHASE6_v0.58_RELEASE.md): permanent medal-derived world monument, four skip/replay/return chapters, no spent rows or reset, full and Low FX compatibility, and preserved saves. Player QA is not required.

[Phase 6.3 automated acceptance](PHASE6_v0.57_RELEASE.md) passed: [main safety regression suite](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42244628713), [main mobile WebKit gameplay acceptance](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42244628703), and [GitHub Pages deployment](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42244628135). All thirty authored permanent medals and the iPhone build are deployed. Next is the locked Phase 6.4 optional finale.

[Phase 6.3 v0.57 — Thirty Little Legends](PHASE6_v0.57_RELEASE.md): 30 authored permanent medals, real sorting/sacrifice/glasses history, mobile progress filters and unchanged 3,000-figure save format. No player QA required.

**Current build v0.58 — Phase 6.4 accepted.** The Three Journeys are tracked live in the Collection Almanac and a quick-access button: Restorer (60 shelf faces + 45 floor messes + 18 hidden finds), Archivist (300 distinct lifetime perfected sets) and Perfect Bazaar (300 currently perfect rows / all 3,000 physically shelved). No new save keys, currency, resets or customer interactions. [Phase 6.2 release notes](PHASE6_v0.56_RELEASE.md). Automated acceptance passed: [safety regression suite](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42234976174), [mobile WebKit gameplay](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42234976098), and [GitHub Pages deployment](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42234976680). No player QA required. **Phase 6.4:** Collector's Monument and a four-part optional, replayable grand finale are implemented. Automated acceptance passed; next is Phase 6.5 optional post-completion play.

[Phase 5 Coward's Glasses](PHASE5_v0.54_RELEASE.md) and [Phase 4 automated acceptance](PHASE4_AUTOMATED_SIGNOFF.md) remain complete.

## QA is developer-owned (November 5, 2026)

Players are **not required to test on iPhone, share screenshots, use Files, or sign off on releases**. Automated Node regressions plus a mobile-shaped WebKit browser suite run via GitHub Actions; see [QA_AUTOMATION_POLICY.md](QA_AUTOMATION_POLICY.md). Native iPhone hardware behavior remains a documented uncertainty, not a blocker assigned to the player.

## v0.45.0 — Verified iPhone Save to Files / Share (November 5, 2026)

**Phase 4 reliability work, not Phase 5.** The Collection Almanac's Save Protection section has a new **SAVE TO FILES / SHARE** button alongside the existing **DOWNLOAD SAVE**, **RESTORE FILE**, **UNDO LAST FILE RESTORE**, **VERIFY SAVE** and 3,000-figure audit. On iPhone, choose Save to Files from the native share sheet and confirm the JSON exists in Files before deleting any browser data.

- The new action first saves the **current actual running shop**, validates the original `bit-bazaar-save-v3` schema including all purchased and placed artwork, and invokes the existing independent audit of all 3,000 physical figures. It will not share stale or unverified progress.
- When Web Share supports JSON files, shares a dated, original-format `Bit-Bazaar-Save-YYYY-MM-DD.json` through the browser's file share sheet. The same `format:bit-bazaar-save-backup`, `exportVersion:1` file can be imported with **RESTORE FILE** on iPhone; no new save format, account or server is introduced.
- Unsupported browsers, dismissals and sharing errors do **not** claim success or silently trigger a second download. An unsupported device points back to the existing **DOWNLOAD SAVE** method. The browser cannot confirm that the user actually selected Save to Files, so the UI instructs a manual check.
- Existing file import protects the current saved shop as a reversible local copy and has explicit confirmation. The original reliable previous-version fallback, 180 unique decorations, 232 mounts, 300 sets, all 3,000 figurine IDs, 60 shelf faces, 18 hidden finds, 45 permanent floor messes and one-figure carrying are preserved.
- New v0.45 automated regression simulates the iPhone share sheet, valid JSON, cancellation, unavailable share support, quota/storage failure, physical inventory audit failure, native file import and rollback. Existing historical suites remain in CI.
- **Acceptance:** Deployment/automated tests alone are not physical iPhone Files or Home Screen validation. Phase 4 stays open pending a real save-to-Files/reimport and dense gallery stress test before Phase 5 Coward's Glasses.

---

## v0.44.0 — Opt-in real iPhone Phase 4 playtest recorder (November 5, 2026)

The collector's Almanac now provides **PHASE 4 · IPHONE DEVICE CHECK**. Press START, close the Almanac, walk past your busiest decorated aisles for at least 30 seconds, return to the Almanac, and press FINISH and COPY REPORT. This collects real-device evidence for Phase 4 acceptance, not a simulated certification.

- **Zero save mutations:** no touch to `bit-bazaar-save-v3`, decoration purchases, figure placements or existing player progress. It samples only while a player explicitly starts recording. On each rendered frame only constant-time counters are updated; decoration visibility stats are read every 12 frames.
- Reports observed draw cadence, average and worst render time, slow (>43ms), very slow (>85ms), critical (>115ms) frames, adaptive slow-mode activity, gallery rendering/culling, bounded sprite cache, current store state and a one-time read-only audit of all 3,000 physical figures.
- Severe-frame automatic Low FX recovery stores a partial report in **separate sessionStorage**, available again after the fallback loads; no shop save changes.
- Both standard and Low FX new v0.44 game shells, a new lightweight QA script, new regression test and mobile Almanac styling are included. The entire v0.43 build remains available as recovery.
- **Preserved:** 3,000 collectibles / 300 sets / 60 faces / 45 permanent floor messes / 18 hidden discoveries / 180 original decoration designs / 232 mounting sites, with the original data and save format.
- **Status:** Phase 4 final QA, not yet signed off. Hands-on dense gallery visuals, real Files backup/import, and Home Screen recovery still require iPhone confirmation. Phase 5 Coward's Glasses remains pending.

---

# The Bit Bazaar — The Great Figurine Sort

## v0.43.0 — All 3,000 Figurines: Physical Shop Integrity Audit and Stale-Drop Fix (November 5, 2026)

This is a concrete Phase 4 reliability pass. Bit Bazaar remains the same first-person iPhone Safari/Home Screen game with **3,000 real original figurine identities**, 300 named sets × 10 figures, 60 usable shelf faces, 45 permanent floor messes, 18 originally concealed figures, 180 bespoke decorations and 232 mounting locations. The existing six-phase creative roadmap is unchanged.

### Fixed a genuine figure save / portable backup mismatch

The player can place a held figurine on the floor, pick it up again, and then choose to shelve it. Previously, `grabFig(id)` marked a picked-up figurine as held but left behind its **old custom floor-position entry** in `groundPositions` until shelf placement. This meant a legitimate intermediate game save after picking up a figure could contain the same figure ID both in `tote` and in the saved `ground` override array. The live game recovered on reload by ignoring invalid overrides, but the v0.42 downloadable file validator correctly detected a duplicate location and refused the backup.

**v0.43 fixes the state at its source**, in both `game-v0.43.0.js` and `game-v0.43.0-lowfx.js`: the instant a loose or previously dropped figurine moves into the player's hand, its stale stored floor override is removed. Setting the figure back down still writes the new true floor position and shelving still removes the override. This keeps automatic saves and portable backups consistent through the whole drop → pickup → carry → place sequence, not merely after the final placement.

### On-demand, read-only figure audit

Added `assets/figure-integrity-v0.43.js`: a 3,000-object inventory audit running **only when the player requests it** or when a verified save/export is prepared. It never runs in the 20–24fps renderer or changes game state.

The audit checks that all 3,000 original figure IDs and physical figure objects exist exactly once, and classifies each figure as one of four **mutually exclusive** states:

- **Shelved** in a numbered row / slot, with matching row membership and no repeated ID.
- **Held** in the player's single-figure hand, and not simultaneously loose or shelved.
- **Loose** in the first-person floor world, with a true `onFloor` state and finite coordinates.
- **Concealed** among the 18 original cleaning discoveries and not yet collectable; revealed figures must not disappear or become hidden again.

It additionally verifies the existing bucket-based spatial index contains **one and only one reference to each real figure object**; optional dropped-floor coordinates belong only to loose, revealed figures and match their actual physical positions; and the total accounting is exactly **3,000 / 3,000**. Issues are reported by code and figure ID. No automatic reset, arbitrary figure replacement or silent save repair is performed.

### In-game Almanac controls

The Almanac's **YOUR SHOP · SAVE PROTECTION** panel now contains **◇ AUDIT 3,000 FIGURES**, beside the existing verified-save, JSON download, guarded file import and previous-import recovery tools. A successful audit reads:

`3,000 / 3,000 FIGURES ACCOUNTED FOR · [shelved] shelved · [held] held · [loose] on floor · [concealed] still hidden`

The `✓ VERIFY SAVE` and `↓ DOWNLOAD SAVE` actions also run this live audit in the actual game after saving and validating the stored JSON. An inconsistent current physical shop fails with a visible reason and **cannot create a falsely reassuring exported backup**; a valid saved shop continues using the original `bit-bazaar-save-v3` format. The total 180-art catalog and its purchases, owned placements, lifetime/mastered achievements, and save-file import/export schema remain unmodified.

### Engineering checks and acceptance status

- `tests/phase4-v043.test.cjs` exercises a synthetic but complete 3,000-figure store: all 18 concealed figures, a full ten-piece shelf row, single carried figurine, one newly revealed figurine, drop → pick position cleanup, returning a sacrificial row's 10 original figures to floor, a moved physical spatial-index reference, duplicate index entries, unavailable figure detection, inconsistent hidden flags and both standard/Low FX source wiring.
- The original eleven Phase 4 suites plus the v0.42 backup test remain in the GitHub Actions pipeline. Main, archived preview and Low FX use a common integrity module and new manager. `sw.js` progresses to `bit-bazaar-v0.43.0`, retaining the v0.42 engine and file-manager artifacts as offline recovery.
- This proves source-level consistency and automated integrity scenarios, **not** a measured hands-on iPhone GPU stress pass or live Files-app download/import test. Final device QA and dense-display checks remain the last Phase 4 acceptance gates before the locked Phase 5 Coward's Glasses.

**Next:** gather real iPhone feedback on the gallery and Save Protection tools, do a sustained large-store device playtest, then review the full Phase 4 sign-off before adding the Phase 5 optional collection helper.

---


## v0.42.0 — Verified Save Backups and Pre-Import Recovery (November 5, 2026)

This release is a targeted Phase 4 **save/reopen and downloadable backup reliability pass** after the original 180-art content milestone and precision-placement updates. The full game stays first-person, iPhone Safari/Home Screen compatible, free, with the same **3,000 figurine IDs, 300 unique named sets, 60 shelf faces, 45 one-time floor messes, 18 hidden figures, 180 individual original decorations and 232 physical decoration anchors**. No feature in this release asks players to reset progress or spend perfect rows.

### A real save-format mismatch repaired

The original `assets/save-manager-v0.29.js` validation had never been updated when the v0.38 precision workshop raised the safe fine-position range for **floor art, rugs and ceiling ornaments** to ±1.00 world unit. The running game correctly saved `[artId, dx, dz, turn, tone]` quarter-unit integer offsets as high as ±4, but downloading or importing those otherwise valid saves was incorrectly rejected by the file validation limit of ±2.

New **`assets/save-manager-v0.42.js`** explicitly validates mounting-surface-specific limits:

- **Floor sculptures, plants, freestanding lamps and curios; rugs; ceilings:** integer quarter-unit offsets from **−4 to +4** along each allowed axis (±1.00 unit), subject to the original shop coordinate bounds.
- **Wall paintings / architecture:** **−2 to +2** (±0.50 unit) solely along the original wall plane, with the other coordinate fixed.
- **Shelf finishes:** no physical offset or rotation, but their three independent saved metallic accents continue to work.
- **Actual shelf endcap paintings:** fixed to the opaque panel, no physical offset. Rug rotation remains 0–3 right-angle turns; wall/floor/ceiling artwork cannot rotate; rail material tone remains 0–2 and cannot be misapplied to other kinds.
- Existing valid ±0.50 saves and old saves with no `decor` or `adjustments` fields still validate. The same **`bit-bazaar-save-v3`** key and **`decor:{owned,placed,adjustments,room}`** structure remain untouched. Invalid duplicates, unowned art positions, invalid figure IDs and corrupt row/slot arrangements are still rejected.

### Player-visible safety controls

The Almanac's existing **YOUR SHOP · SAVE PROTECTION** panel now contains:

1. **✓ VERIFY SAVE** — forces the currently running game to persist its latest progress, validates the written save, then reports how many figurines are shelved, how many rows are currently perfect, how many original decorations are permanently owned, how many art positions are customized and how many lifetime sets have been mastered.
2. **↓ DOWNLOAD SAVE** — validates a *freshly written* snapshot, then requests a dated JSON download. A full/blocked browser localStorage write **fails visibly and does not export stale progress**. Users should still check iPhone Files/Downloads before clearing browser data.
3. **↑ RESTORE FILE** — as before, validates selected backup data and asks for explicit replacement confirmation, but now also verifies that the currently running shop was actually saved immediately before creating the pre-import local recovery copy. A failed current-save write aborts the restore.
4. **↶ UNDO LAST FILE RESTORE** — appears enabled only if a local pre-import backup is present. Verifies the saved earlier shop, asks for confirmation, writes a second safety copy of the current post-import state under `bit-bazaar-v3-before-import-rollback`, then restores the pre-import game. No figure, cosmetic ownership, or history is changed except by the player's intentional restore choice.

All actions take place entirely on the player's device; no accounts or file uploads. Mobile hit targets retain their existing 48px minimum, with the four actions arranged in the existing two-column touch grid.

### Automated safety coverage and limitations

- `tests/phase4-v042.test.cjs` runs a real copy of the new file-manager script in a DOM/storage simulation: valid six-kind original decoration adjustments; older two-step and pre-decoration backups; rejection of impossible offsets and duplicate or invalid figure identities; fresh-save verification and JSON export; simulated browser storage quota failures; explicit import, cancel, validation failures, and rollback restoring the original copy; both standard and Low FX game shells.
- All existing eleven Phase 4 test suites remain in CI. The service worker is network-first, now `bit-bazaar-v0.42.0`, and retains the complete prior v0.41 game and older file manager as optional fallback assets. `game-v0.42.0.js` and `game-v0.42.0-lowfx.js` both report a real boolean result from the existing normal `save()` function, without modifying autosave timing or any game save fields.
- **Verification versus device QA:** A successful validation proves internal JSON compatibility, not that Safari definitely stored a download or that iOS Files accepted it. Actual iPhone download/open/import and long-session GPU visual inspection should still be performed before marking all Phase 4 acceptance checks complete. All file restores explicitly replace current progress; use the verification/download controls before trying one.

**Next:** a real iPhone save-download/reopen/import test, a dense-gallery visual and 3,000-figure invariant pass, then Phase 4 sign-off. Continue into the locked Phase 5 Coward's Glasses only after final Phase 4 approval.

---


## v0.41.0 — Exposed Artwork Slices and Accurate In-World Inspection (November 4, 2026)

Phase 4 dense-gallery visual refinement following the successful 180-artwork content milestone. In v0.40 a solid rack blocked the center of a decoration and therefore incorrectly hid the entire illustration even when its edges were plainly visible beside the shelf. v0.41 replaces that near-range all-or-nothing decision with four horizontal, physical shelf-tested artwork lanes.

### Better visual occlusion without redraws or replacement art

- **Partial visibility:** Within 16 world units, actual physical placement, camera facing and mounted orientation determine four equal-width portions of an original pixel-art decoration. Each portion tests the same original solid-shelf ray used by miniature and cleaning visibility. A visible left side stays visible when the center and right side lie behind a rack; unseen portions cannot draw through a shelf. Completely obstructed artwork remains culled.
- **Exact original pixels:** Standard wall paintings, floor statues/plants/lamps/curios, overhead mobiles and rugs draw only the exposed source-image portions through the existing 2D canvas transform. No generated replacement art, new texture atlases or additional image canvases. Fully exposed items still need only their original **one** billboard draw, or the original eight/four/two rug perspective slices.
- **Bounded effort:** Farther than 16 world units the fast v0.40 center-ray test remains, so dense areas do not turn into hundreds of additional cross-shelf checks. Near items use at most four horizontal bands and preserve the close-art draw-priority guarantee. This is strip-based, *not* fully pixel-perfect 3D volume clipping, and is designed as an efficient iPhone-compatible step.
- **Honest physical interaction:** Updated `assets/decor-world-v0.41.js` records where the center crosshair falls horizontally inside the artwork's projected 2.5D rectangle. The reticle checks physical shelf visibility at that **specific image section**, rather than trusting the object's center. Consequently a partly exposed sculpture can be inspected through its visible edge, while targeting a blocked portion does not interact through shelf metal.
- **Saved and previewed art:** Free relocation ghost previews use the same clipping; no artwork can ghost through solid racks and a partially exposed ghost stays in the camera without requiring an actual move. Preview confirmation/cancel remains available in the HUD independently of rendered visibility. The preview never changes owned artwork, figure placements, paid rows or save data.

### Preservation / engineering

- Both `game-v0.41.0.js` and `game-v0.41.0-lowfx.js` use `assets/decor-visibility-v0.41.js`, `assets/decor-world-v0.41.js` and `assets/decor-runtime-v0.41.js`, with identical iPhone Home Screen paths and an updated `bit-bazaar-v0.41.0` network-first service worker. Complete v0.40 standard/Low FX modules remain as recovery files.
- The original **3,000 unique figurines, 300 numbered sets, 60 shelf faces, 45 messes, 18 hidden finds, 180 handmade art pieces and 232 mounting locations** are unchanged. In particular `bit-bazaar-save-v3` and `decor:{owned,placed,adjustments,room}` are completely unchanged. The same protected numeric left-to-right #1–10 figure sorting, single-figure carrying, lifetime achievements and currently perfect-row sacrificial purchases work as before.
- New regression suite `tests/phase4-v041.test.cjs` tests partly exposed art whose center is obstructed; right-side obstruction only; full obstruction; overhead and rug clipping without extra canvases; one-draw unoccluded fast path; valid and blocked in-world reticle targeting; no-save ghost cancellation; 16-unit distance threshold; and current standard/Low FX load order. Earlier suites v0.31 through v0.40 continue unchanged in substance.

**Phase 4 acceptance:** The new slice checks are automated and source-verified. Physical iPhone testing, partially occluded details for surfaces that cross multiple rack planes, and save/reopen testing are still necessary before declaring the game production-acceptance complete or beginning Phase 5 Coward's Glasses.

---


## v0.40.0 — Physical Decoration Sightlines and Shelf-End Visibility (November 4, 2026)

This Phase 4 refinement fixes a specific visual consistency issue: previously the first-person reticle respected solid shelf blockers but the 2.5D decoration renderer could still draw an installed sculpture, framed picture or transparent relocation ghost through opaque shelving. The art-layer fix uses the **same ray-to-solid-shelf visibility rules** as pickup/inspection, without changing figure inventory, the user's ability to clean or sort, or the physical store layout.

### Physical drawing and inspection now agree

- New lightweight `assets/decor-visibility-v0.40.js` is shared by standard and Low FX builds. It accepts a candidate art ID, physical mounting slot, physical world position, live camera position and the original exact rack intersection test. It does not modify saves, figures, art locations, geometry, canvases, colors or any player progress.
- All installed floor statues, plants, lamps, rugs, wall pictures and ceiling ornaments are checked after the existing camera-frustum rejection, **before** the capped far-art selection. A piece hidden by opaque shelving cannot consume one of the limited rendering slots needed for visible artwork.
- Real endcap-mounted portraits are rendered only on the exterior face of their own metal side panel. The renderer excludes **only** that end panel's physical fixture from the shelf intersection test, while all *other* shelves remain opaque. This matches the first-person inspection reticle's existing front-face rule and prevents showing paintings through a rack's solid back.
- The player's core figurine pickup, shelf numerical sorting, shelf cleaning, floor debris cleaning and current first-person focus continue to take priority over art inspection. The game did not change any underlying collection interactions.
- A temporary owned-art relocation preview is also hidden by a solid rack when the player cannot yet see its destination. The **separate confirmation HUD** continues to work and keeps the preview active; the player can walk or turn to inspect the chosen site, then confirm or cancel. Crucially, the preview is still **never dropped by the distant-art budget** when the sightline is clear.
- Read-only frame diagnostics now add `hiddenByFixtures` and `ghostBlocked` alongside v0.39's `installed`, `frustum`, `near`, `shown` and `skippedBudget` counters.

### Preservation and QA

- All **180 individually authored original decorations**, **232 permanent physical anchors**, the 3,000 unique figurine identities, 300 named number-ordered sets, 60 shelving faces, 45 floor messes and 18 hidden finds remain intact.
- No change to **`bit-bazaar-save-v3`** or `decor:{owned,placed,adjustments,room}`; no remapping of owned art, current or lifetime PERFECT rows, purchased gallery pieces, cleaning/achievement credit, or existing position offsets. The former v0.39 render runtime remains available as an optional offline recovery asset.
- `tests/phase4-v040.test.cjs` exercises WEST/EAST-facing endcap visibility, correct owner fixture exclusion, floor/ceiling visibility, shelf-hidden artwork removed before draw limits, protected nearby pieces, no-write occluded and clear preview states, unchanged saved ownership/placements, and the shared visibility module connected in *both* standard and Low FX builds.
- All **nine previous Phase 4 regression suites** remain mandatory; the network-first Home Screen cache advances to `bit-bazaar-v0.40.0`.

**Acceptance status:** The implementation and automated tests address the physical shelf sightline defect. A proper device-side visual inspection remains important, particularly for partly occluded rugs and ceilings, because the current renderer hides *whole artwork objects based on their center sightline* rather than clipping every pixel against 3D geometry. Phase 4 is not yet fully certified; continue with handheld visual feedback and a complete save/reload playtest before entering the locked Phase 5 Coward's Glasses milestone.

---


## v0.39.0 — Dense Gallery Rendering, Stable Occlusion-Aware Budgets and Long-Session Protection (November 4, 2026)

A Phase 4 performance and art-readability pass after v0.38's free staged fine-positioning workshop. All **180 separately authored original decorations**, **232 saved display sites**, 300 named ten-piece figurine sets, 60 cleanable shelf faces and original six-phase roadmap remain intact; **no collectible IDs, decoration IDs, saved site IDs, prices or save keys change**.

### Real renderer efficiency

- `assets/decor-runtime-v0.39.js` caches each committed physical decoration's 2.5D x/z placement and which shelf finish belongs on each real shelf face. Instead of allocating a fresh placement object for every owned artwork and scanning every owned decoration for every visible shelf on every render tick, cached locations remain stable until purchase, move, store, confirmed precise adjustment, reload or a new game. No preview ever enters the saved cache.
- All fifteen shelf-trim palette definitions are now hoisted to one reusable module-scope lookup table, not rebuilt as a new 15-entry object on every decorated shelf's render.
- Original individual five-tier shelf designs are still drawn **at full detail up close**. Beyond 10 world units, inlay spacing becomes coarser (three instead of five motifs per tier), and beyond 15 units all five true fascia panels and highlight rails remain but fine inlays are skipped because they would be too small to read.
- Rug perspective retains all **eight** affine 2.5D texture slices up close, uses **four** slices at medium distance and **two** when farther away. The same original pixel textures, exact shapes, rotations, materials, relative geometry and save behavior are retained, and no new sprites, canvases or atlases are allocated per frame.

### Bounded dense-gallery draw with guaranteed near art

- Scans the cached visible positions, rejects offscreen pieces before doing unnecessary side projection, and prioritizes **every artwork within 12 camera-depth units**; these close-up items are **never discarded**, even when the display budget is full.
- When a fully decorated gallery has an unusually high number of more distant visible pieces, selects only the nearest subset (normal graphics: **36**, adaptive reduced graphics: **20**; Low FX: **24** or **16**). Already selected distant art gets a two-world-unit preference to reduce distracting oscillation at visibility boundaries; actual painter depth sort and all near shelf/figurine interactions remain unchanged.
- Owned-art relocation ghosts are **never removed by the per-frame decoration quota**. They remain temporary, save-free preview visuals that can still be confirmed or canceled.
- The read-only `window.BitBazaarQA.decorRenderStats()` and `BitBazaarQA.stats().decorRender` report installed count, checked non-shelf artwork, frustum count, near count, rendered count, budget-skipped distant pieces, and whether the ghost was shown. These are measurable diagnostics, not in-world progression or save changes.
- The existing 20–24fps iPhone adaptive renderer, visual-occlusion geometry used for figurines, safe slow-frame recovery, original sorting reticle, and manual Low FX recovery all remain functional.

### Code-level acceptance / rollback

- Added `tests/phase4-v039.test.cjs` to stress-load a dense gallery with 55 owned art pieces, verify the near-art guarantee and stable far cap, reject offscreen work, keep the ghost visible even when budget is exhausted, and assert exact render position after an applied 0.25-unit move. It verifies no-write preview, save/reload, shelf-finish cache changes on move/store, five-tier inlay detail levels, eight/four/two rug slices and identical main/Low FX modules.
- All **eight historical suites v0.31 through v0.38** remain active alongside this ninth test. Archived suites inspect their historical preview shells and the latest worker's real fallback dependencies rather than demand full precaching of every prior major engine. The versioned `sw.js` cache is now `bit-bazaar-v0.39.0` with v0.38 recovery artifacts.
- No actual on-device GPU measurements were possible in automated Node validation. This update implements and tests draw-budget control, **not** a claim of measured real-device FPS improvement. A hands-on iPhone visual/performance session and crowded-gallery inspection is still necessary before accepting Phase 4 fully.

**Next:** validate real iPhone long-session frame timing and dense-gallery appearance; address any view-dependent artifacts, sprite occlusion or touch-panel issues discovered, then complete Phase 4 QA before starting the optional Coward's Glasses feature.

---


## v0.38.0 — Precision Workshop: Preview, Apply, Cancel and Collision-Safe Arrangement (November 4, 2026)

Following the v0.37 completion of **180/180 individually authored original artworks**, this release focuses on the remaining **Phase 4 acceptance work**: real positioning freedom, physical clearance and friendly iPhone controls. It adds no new figurines or decorations and keeps the original six-phase locked roadmap intact.

### Touch-friendly top-down precision gallery

Each installed, permanently owned decoration can now use a non-destructive **precision editor** in the Sacrifice Catalog. The positioning arrows take **0.25 world-unit steps**, while **⌖ OPEN TOP-DOWN POSITION GRID** opens a bounded **5×5** preview for one artwork at a time. The grid can choose safe **0.5-unit stepping stones** and shows unavailable cells as ×. An item can stage a draft using arrows, the grid, or rug rotation, then choose **✓ APPLY POSITION · FREE** to commit once, or **✕ CANCEL PREVIEW** to discard it completely. A reset option also previews the original placement rather than silently changing a save. No perfect rows, figure IDs or currency are involved in moving existing art.

- **Freestanding sculptures, plants, lamps, curios, rugs and hanging ornaments** can now offset as far as **±1.00 world unit per axis** where actual shelves and installed artwork permit. Exact 0.25-unit steps remain supported, and the editor displays current draft coordinates and unsaved status in clear text.
- **Wall art** remains limited to safe **±0.50** shifts along the real hanging face to prevent floating through physical shelving and walls. **Endcap hooks** remain rigidly tied to their actual steel side panels. **Shelf finishes** still follow their original fixed 60 shelf-face mounts.
- Rug rotations remain available in **90° increments**, with a nine-point 4.4 × 2.96 footprint test. The editor also checks proximity to other already installed floor art/rugs and other hanging ornaments, not just shelves. Unsafe moves are disabled/rejected.
- The existing three optional shelf-rail metallic finishes are selectable as **staged choices**, and only an explicit Apply updates the saved material; all 15 bespoke 3D five-tier original patterns still render as before.
- Only one 5×5 placement grid is expanded at any time, avoiding a giant grid for all 180 item cards. The iPhone layout has improved 44px+ touch targets, readable contrast, focus rings and clear preview/confirm controls.

**Important:** The precision grid is an overhead draft view in the catalog, while the 3D shop continues showing the saved position until Apply. This avoids fake in-world previews and prevents an unsaved position from accidentally being treated as real. Closing the drawer or switching to the map discards all unconfirmed fine-position changes.

### Faster real-world site selection on the map

The overhead physical shop map's decoration planner now adds **⌖ CLOSEST OPEN** and **› NEXT OPEN** buttons, including the free owned-art relocation planner. Those controls move the **selected map pin only**, with no world movement or save write; players still explicitly preview their proposed destination in the first-person game and then confirm or cancel. For a relocation, closest means nearest to the currently installed original site; otherwise it uses the selected site or shop center. Shelf trims with no physical map coordinates say **FIRST OPEN** rather than claiming a false nearest distance.

This helps particularly with **75 freestanding floor positions**, 56 wall/endcap positions, 20 rugs, 21 ceiling hooks, and 60 shelf trims (232 persistent locations in all). The original map, 3D ghost previews, **Look Toward**, Previous/Next Site, free relocation, and existing open/occupied indicators remain intact.

### Save and long-session safety

- The **same** `bit-bazaar-save-v3` key, `decor:{owned,placed,adjustments,room}` structure and old `[artId,dx,dz,turn,tone]` adjustment tuple are preserved. A new ±1.00 offset uses integer steps 0–4 and survives save/reload; no save migration, forced reset, or new currency system.
- Previously saved ±0.50 micro-adjustments are grandfathered during restoration **even if a newer adjacent decoration would now fail the stricter spacing rule**. Edits are checked against the new physical scene, but older player work is never silently discarded by upgraded collision code.
- The new `assets/decor-workshop-v0.38.js` and `assets/decor-map-v0.38.js` are loaded on the main, preview and Low FX pages, and used by both `game-v0.38.0.js` and `game-v0.38.0-lowfx.js`. The original 180-piece `assets/decor-runtime-v0.37.js` and every older art/module are reused without duplication. Previous v0.37 scripts and the original workshop/map are retained as optional PWA recovery assets.
- `tests/phase4-v038.test.cjs` checks staged arrows and grid, unsafe neighboring-art moves, no-save cancel/apply, preserved five-field storage on reload, rug footprint collisions, shelf finish tones, the closest/next open map selection, no changes to figure inventory or sacrifice behavior and version alignment. All seven prior Phase 4 test suites remain mandatory in the GitHub Actions pipeline.
- **Physical device note:** Automated JavaScript and save/collision checks do not replace actual hand-tested iPhone scrolling, small-screen layout, visual occlusion or long-session frame timing. These remain the next Phase 4 acceptance targets.

**Next:** real iPhone art readability and dense-gallery occlusion review; adaptive quality/performance safeguards for all 232 display anchors and a full save-and-reopen playtest. Begin Phase 5 Coward's Glasses only after Phase 4 is truly accepted, not merely because the 180-art count is complete.

---


## v0.37.0 — The Complete Original Gallery: All 180 Artworks (November 4, 2026)

This milestone finishes **the *content-count* objective** of the locked Phase 4 Sacrifice Catalog: exactly **180 separately named, individually illustrated original decorations** across all nine original quotas. The one-at-a-time 3,000-figurine sorting experience, cleaning progress, 300 named sets, current perfect rows, lifetime achievement memory, map, saves and all existing shop fixtures remain unchanged.

### The final twenty individually hand-painted works

The last twenty are authored pixel by pixel through separate 32×40, 40×48, 40×28 and 48×28 fixed-resolution canvas compositions, cached once at initialization and then reused in the live world and catalog. All have unique IDs, names, descriptive visual stories, distinct art layouts, compatible physical mount kinds and individual **1–20 currently PERFECT row** prices.

- **Framed scenes (35/35):** *Moonlit Koi Festival*, *The Museum of Dawn*, *Glass Forest Fireflies*.
- **Statues (25/25):** *Clockwork Unicorn Scholar*, *Moss Griffin Sentinel*, *Velvet Lantern Owl*, *Copper River Dragon*, *Little Astro Courier*.
- **Plants (20/20):** *Moonberry Ivy Trellis*, *Crystal Fern Cavern*, *Golden Marsh Lantern Reeds*.
- **Lighting (20/20):** *Stained-Glass Carousel Lamp*, *Aurora Observatory Beacon*.
- **Rugs (20/20):** *Bluebell Star Compass*, *Copper Autumn Quilt*.
- **Architecture (20/20):** *Hollow Moon Archway*, *Hearthstone Story Window*.
- **Ceilings (15/15):** already finished by v0.35, untouched.
- **Shelf finishes (15/15):** *Royal Enamel Checkwork*, *Silver Tide Brasswork*. Both have distinct handcrafted **five-tier world-space** trim patterns as well as individual 48×28 thumbnails; actual decorated shelf tiers render these materials, not a generic texture.
- **Curios (10/10):** *Pocket World Diorama*, a spherical miniature village scene.

**Exact art quotas:** 35 framed, 25 statues, 20 plants, 20 lighting, 20 rugs, 20 architectural, 15 ceiling, 15 shelf trim and 10 curios = **180 unique decorations**. The final module verifies unique IDs, unique names and every exact category count, and fails fast on missing or excess content.

### Collector experience

- The previously built **ALL / NEW 20 / UNOWNED / CAN CLAIM / category / OWNED** filters and case-insensitive **name/category/story search** remain available; physical art relocation and free confirmed moves still work.
- The Sacrifice Catalog now displays an **owned-art progress meter** out of 180. At 180 **permanently owned** works, it shows a special completion message. This is an earned ownership reward, not a misleading indication that merely opening the catalog or perfecting 180 shelf rows completes the gallery.
- The old **"MORE COMING" artwork label** is gone; the catalog explicitly shows **ALL 180 ORIGINAL DECORATIONS · NINE CATEGORIES COMPLETE** and avoids claiming every placement/refinement goal is complete.
- Capacity remains **232 append-only decoration anchors**: 56 wall/endcap, 75 freestanding floor, 20 rugs, 21 ceiling, 60 real shelf-finish faces. This accommodates the full 180-item collection simultaneously if players choose to own it all.

### Protecting established progress and completed game logic

- The new `assets/decor-art-v0.37.js` loads immediately after the complete historical decor chain and before `assets/decor-runtime-v0.37.js`. Both `game-v0.37.0.js` and `game-v0.37.0-lowfx.js` run the same runtime. Existing artwork IDs and mounting locations remain in their exact saved order.
- The save key remains **`bit-bazaar-save-v3`**; the `decor:{owned,placed,adjustments,room}` structure, one-at-a-time figurine movement, 3,000 individual original figure IDs, current/lifetime perfect distinctions and original before-first-sacrifice backup are unchanged. No migration or forced reset.
- Added `tests/phase4-v037.test.cjs` to assert the entire source chain totals, 20 independent new canvas compositions, true 180 distinct names/IDs, exact all-nine quotas, and safe unchanged 232 slots. It performs a **six-currently-perfect-row purchase** and verifies that exactly **60 existing, distinct figures** are re-scattered and lifetime completion persists, plus same-slot no-ops, no-write preview/cancellation, two unique five-tier trim renderers, searchable new art, and a real catalog-rendering test for the complete-owned progress message.
- All earlier safety suites v0.31–v0.36 remain required. The network-first PWA cache is `bit-bazaar-v0.37.0`, and previous v0.36 standard/Low FX artifacts remain as optional recovery files.
- Automated tests cannot replace an actual iPhone Safari visual and long-session performance pass. The 180 artwork **content-count** milestone is complete, but **Phase 4 final acceptance** still requires further freeform placement improvements, layout quality review and device QA before moving to the planned Coward's Glasses Phase 5.

**Next roadmap priority:** refine tangible placement freedom and the decor preview controls, audit density/occlusion and phone rendering for the full 232 positions, test save compatibility across updates and polish all gallery surfaces without changing the locked 180-category content plan.

---


## v0.36.0 — Searchable Gallery: 160 Original Artworks and All 75 Standing Mounts (November 4, 2026)

A second major development pass during the extended Phase 4 work session. The original 300 distinct named figure sets, 3,000 figure IDs, full 40-shelf layout, 60 cleanable faces and single-figurine carry rule remain unchanged. The real money-free Sacrifice Catalog (buy art with **currently** PERFECT rows, not lifetime achievements) is preserved.

### Twenty more hand-authored pixel compositions — 160 / 180 (88.9%)

Every work is its own painted 32×40, 40×48, 40×28 or 48×28 low-resolution pixel-art composition with a distinct silhouette, description, permanence-aware art ID and perfect-row price. No mass tinting or duplicate art pieces.

- **3 framed scenes:** *The Clockwork Mariner*, *The Greenhouse Postman*, *Ruby Snowfall Orchestra*.
- **4 statues:** *Pewter Dragon Librarian*, *Lighthouse Keeper Frog*, *Cobalt Phoenix Guardian*, *Honey Bear Clockmaker*.
- **3 plants:** *Aurora Lantern Fern*, *Volcanic Glass Orchid*, *Raincloud Bonsai*.
- **3 lighting fixtures:** *Jellyfish Cathedral Lantern*, *Meadow Moth Beacon*, *Moon Lantern Express*.
- **2 rugs:** *Ember Honeycomb Rug*, *The Celestial Tea Path*.
- **3 architectural pieces:** *Copper Observatory Window*, *Bluebell Secret Door*, *Sunken Palace Arch*.
- **2 shelf finishes:** *Opal Wave Shelf Band*, *Embervine Copper Edge*. Both have separately authored world-space inlays drawn on all five physical tiers of a decorated shelf, not just flat icon previews.

Art count by category: **32/35** framed, **20/25** statues, **17/20** plants, **18/20** lamps, **18/20** rugs, **18/20** architecture, **15/15** ceiling, **13/15** shelf trims, **9/10** curios. Exactly twenty original decorations remain on the 180-piece locked plan. This release includes a detailed pass to add additional tiny authored texture details to early sparse pieces rather than ship placeholder icons.

### Entire standing-galleria capacity is now ready

- 12 new permanently appended floor mounts **IDs 220–231**, each at a valid walkable aisle location safely separated from older stands (at least 4.4 world units), rugs (at least 4.6), each other (at least 5) and the shop entry. Validated against the precise 40-rack modeled collision rectangles.
- The complete display system now contains **232 permanent physical locations = 56 wall/endcap + 75 floor + 20 rug + 21 ceiling + 60 shelf-finish** mounts.
- This now supports **all 75 planned floor-mounted statues, plants, lamps and curios** at once; rug capacity and wall/endcap gallery capacity were already sufficient for their final respective categories. All previously placed art retains the exact same original ID and physical coordinates.

### Real catalog search

The larger catalog now has a responsive text search field with **FIND** and **CLEAR** buttons. Search is case-insensitive across every decoration's name, mount type, category and written story. For example, search for **dragon**, **fox**, **lamp**, **crystal** or **shelf trims**. Search combines with existing **ALL / NEW / UNOWNED / CAN CLAIM / category / OWNED** tabs and price sorting, and the player can submit with the on-screen button or keyboard Enter. Search input is safely escaped when inserted into the catalog, and its view-only state is never stored with the player's game save. Focus does not jump out of a text entry while typing, since filtering occurs on submission rather than every keystroke.

### Stability and verification

- Standard and Low FX share the new `assets/decor-runtime-v0.36.js`, with `assets/decor-art-v0.36.js` and `assets/decor-sites-v0.36.js` loaded in order before runtime. Both game scripts, three entry pages, CSS and network-first PWA cache use `v0.36.0`; v0.35 remains a usable optional fallback.
- The original `bit-bazaar-save-v3` key, `decor:{owned,placed,adjustments,room}` structure, lifetime perfect-set achievements, figure scattering and one-at-a-time sorting are unchanged. A selection/search/ghost preview never writes a save; an owned-art move is still free and persists only when actually moved to an available site.
- The new `tests/phase4-v036.test.cjs` reads **the full live module chain** to assert 160 IDs, 232 mount IDs, every category quota and all fixed-size paintings; checks all 12 new site coordinates, safe rack clearances and 75-place capacity; executes the true price-five-row sacrifice transaction and verifies exactly **50 existing separate figure IDs** are returned to the floor while historic perfection stays earned.
- It also runs real catalog searches in the decoration runtime, tests keyboard/button search and clear through a minimal test DOM, escapes quotation-mark injection, tests no-save cancelling and same-site no-op, verifies both new physical shelf trim patterns and validates main/Low FX/worker HTML references. Previous safety tests v0.31–v0.35 remain mandatory in the GitHub Actions workflow.
- Physical iPhone appearance, tapping and long-session GPU/CPU behavior still require hands-on testing; passing syntax/release contract tests alone does not certify those visuals.

**Next:** author the remaining 20 individually distinct items to finish **180 / 180** without changing quotas, then review freeform/custom decorating and move toward Phase 5 only after Phase 4's acceptance requirements are fully tested.

---


## v0.35.0 — Living Collector Gallery: 140 Original Works, 63 Floor Pads, Faster Browsing (November 4, 2026)

This major Phase 4 milestone extends the current six-phase **locked** design. Still a first-person iPhone Safari / Home Screen figurine-cleaning and numerical-sorting adventure: no customers, employees, selling, inventory duplication or cash economy.

### Twenty unique hand-authored decorations — 140 / 180 (77.8%)

The latest twenty each have a real, individually constructed pixel painting on a small cached canvas, an original name, a distinct silhouette, a descriptive visual story, a mounting category, and a sacrifice price of 1–20 **currently** PERFECT rows. No recolored placeholders or swapped names.

- **3 framed scenes:** *The Cloudberry Clockmaker*, *The Iridescent Tidepool* and *The Lantern Fox's Letter*.
- **4 sculptures:** *Wandering Brass Automaton*, *Moonstone Crane Guardian*, *Obsidian Stag Reliquary* and *The Marmalade Baker*.
- **3 plants/terrariums:** *Sapphire Weeping Willow*, *Amberwort Terrarium* and *Starlit Lotus Basin*.
- **4 lamps:** *Butterfly Lampstand*, *Midnight Lighthouse Lamp*, *Lavender Firefly Tree* and *Copper Sun Clock Lamp*.
- **1 detailed rug:** *Cobalt Harlequin Mosaic*.
- **2 architectural art pieces:** *Rainforest Arch Window* and *Golden Astral Mirror*.
- **1 overhead chandelier:** *Crystalline Dragonfly Chandelier* (completes the 15/15 ceiling-art target).
- **1 five-tier shelf-finish design:** *Frostwalnut Silver Filigree*, with a special separate 3D fascia-rendering pattern rather than just a flat thumbnail.
- **1 standing curio:** *The Sleeping Sea Globe*.

Category counts after this update: **29/35** framed, **16/25** statues, **14/20** plants, **15/20** lighting, **16/20** rugs, **15/20** architectural, **15/15** ceiling, **11/15** shelf finish, **9/10** curios. All nine original quotas stay unchanged; there are exactly **40 original decorations still to build**.

### Eighteen new nonblocking floor-display pads

Eighteen carefully spaced standing-art mounting sites were added in free collector walkways as permanent **IDs 202–219**, leaving all 202 earlier mounted-site IDs, decorations and saved display positions untouched. They are at least **4.6 world units from any earlier standing-pad center**, **4.7 from rugs**, and **5.4 from other new pads**, as well as outside all 40 modeled shelf-unit footprints and clear of the shop entrance. Nothing new blocks walking, looking, cleaning, shelf pickup, sorting or floor figure scattering.

There are now **220 physical gallery sites**: **56 wall/endcap**, **63 floor**, **20 rug**, **21 ceiling** and **60 real shelf-finish** mounting points. This supports 63 of the eventually planned 75 standing pieces at once. Remaining capacity will be expanded along with the last 40 artworks.

### Catalog usability and save-protection improvements

- Two new high-contrast, iPhone-friendly filters: **◇ UNOWNED** and **✦ CAN CLAIM**. CAN CLAIM only lists permanent unowned pieces affordable using the player's **current** perfect-row count that have at least one compatible empty mount; it never assumes past lifetime perfection can buy a new piece.
- The existing **✦ NEW** tab correctly includes all **20** fresh hand-authored pieces and preserves twelve-card pagination.
- On an owned or affordable unowned artwork whose selected mounting point is already unavailable, **⌖ FIND OPEN SITE** chooses a genuinely vacant compatible location and returns the player to that artwork's card, without purchasing or writing a save. Card pagination remains correct even when the item is on a later page.
- Pressing **PLACE / MOVE** at an artwork's *already installed* site is now safely rejected with **ALREADY DISPLAYED HERE**, rather than running the normal move code and resetting saved micro-position/color adjustments or writing unnecessary changes.
- All previously developed overhead store map, physical first-person ghost preview, Previous/Next Site carousel, Look Toward control, room materials editor, free owned-art relocation and actual one-figure inventory remain available.

### Actual code-level validation and old-save integrity

- `assets/decor-art-v0.35.js` has 20 original fixed-size, individually distinct pixel compositions; `assets/decor-sites-v0.35.js` adds 18 validated append-only floor pads, before `assets/decor-runtime-v0.35.js` initializes. Both `game-v0.35.0.js` and `game-v0.35.0-lowfx.js` integrate the same gallery and provide read-only QA probes.
- `bit-bazaar-save-v3`, `decor:{owned,placed,adjustments,room}`, the 300 named ten-piece sets, the exact 3,000 stable figure IDs, cumulative perfect-row history, and all existing anchors are completely unchanged in format. Previous v0.34 files remain as optional service-worker recovery assets.
- `tests/phase4-v035.test.cjs` loads the entire actual older asset chain and verifies 140 original IDs, 220 physical IDs, category quotas, distinct tiny canvases and site geometry. It exercises the live decoration runtime in a four-PERFECT-row purchase scenario and confirms exactly **40 existing figure IDs** are scattered, four rows cleared, lifetime-perfect credit retained, pre-first-sacrifice backup stored and ownership committed. It also tests no-save site selection, no-op same-site relocation, cancellable ghost previews and new shelf-finish rendering, plus ordinary/Low FX/PWA version compatibility.
- All historical Phase 4 safety suites v0.31 through v0.34 remain active; old test expectations were updated only to reference their archived HTML and current worker version, not to mask gameplay regressions.
- **Physical device limitation:** Automated tests and live deployment verification do not constitute a full iPhone Safari touch, artwork appearance, collision or framerate playtest. Continued real-device feedback remains important.

**Next:** complete the final 40 original decorations in the remaining category quotas, expand to at least 75 functional standing-art sites, and refine flexible decoration placement further before moving to the optional Coward's Glasses stage. No changes to the locked six-phase master roadmap.

---


## v0.34.0 — Cross-Aisle Gallery: 120 Original Works and Full Rug Capacity (November 4, 2026)

Phase 4 of the locked Bit Bazaar roadmap advances from 104 to **120 / 180 individually authored original decorations (66.7%)**. The 3,000 one-at-a-time figurines, 300 named sets, five rows per shelf face, and current-vs-lifetime PERFECT distinction remain unchanged. The store is still a quiet first-person collectible sorting adventure, **not** a customer/employee/currency simulator.

### Sixteen brand-new hand-painted compositions

All sixteen are separate fixed-resolution 16-bit-inspired works, painted once into individual 32×40, 40×28, 40×48 or 48×28 canvases, with individually authored scenes/silhouettes, text, cost (1–20 currently perfected rows), original ID and mount type. No cheap recolors or recycled previous items.

- **Framed art — now 26 / 35:** *The Night Orchard Express* (a miniature starry train), *The Mountain Giant's Tea* (tea with a giant), *The Drowned Post Office* (fish-delivered mail), *The Sunrise Kitekeepers* (fish-shaped kites), and *The Clockwork Rainforest* (bronze insects in a mechanical jungle).
- **Architecture — 13 / 20:** *Amber Moss Observatory* (gothic greenhouse-style astronomy window).
- **Statues — 12 / 25:** *Porcelain Wolf Sentinel* (gold-seamed ceramic wolf).
- **Plants — 11 / 20:** *Prismatic Pitcher Grove* (gem-colored hanging pitcher flowers).
- **Lighting — 11 / 20:** *The Goldfish Beacon* (illuminated miniature aquarium lantern).
- **Rugs — 15 / 20:** *The Mapmaker's Midnight Route* and *The Lily Fox Carpet*.
- **Ceilings — 14 / 15:** *Singing Whale Mobile* and *The Clocksmith's Meteor Bells*.
- **Shelf Trims — 10 / 15:** *Starlit Cedar Rails* and *Glassleaf Silver Trims* with **two separately authored, five-tier physical shelf fascia renderers** in the live 3D shop.
- **Curios — 8 / 10:** *Lighthouse in a Jar*, a micro-ocean diorama.

The **NEW ARRIVALS** filter shows exactly this latest sixteen-item group. Earlier artwork is still present in the full catalog and can be kept, stored or relocated for free once purchased.

### Twelve physically grounded, append-only display sites

The new cross-aisle gallery adds **six rugs** and **six suspended ornament hooks** with permanent IDs **190–201**, leaving earlier 0–189 IDs, decorated site names, current ownership, color presets, coordinates and saved adjustments untouched.

- 56 physical wall and endcap galleries, **45 floor pads**, **20 rug positions**, **21 ceiling hooks**, and 60 shelf-face trim installations = **202 fixed nonblocking display anchors**.
- Rug anchors are at (27,17), (27,41), (27,65), (43,17), (43,41) and (43,65). They are in walking connector aisles across the shelves, never inside a rack, and use verified 4.4-by-2.96 world-unit rug footprints. New rug centers keep at least six units from any other rug and 5.4 units from floor display pads. Six hanging sites share those same x/z coordinates at the ceiling layer, keeping at least 7.5 units from other overhead fixtures.
- Nothing is renumbered and no additional collision boxes, closed aisles, obstructed rows or figurine objects are created.
- The **rug quick-select** and **ceiling gallery** touch controls now lay out cleanly across five columns on common phones (four on very narrow screens), with larger accessible tap targets and visible focus outlines. The existing exact shop map, in-world translucent preview, destination cycling, Look Toward button and zero-cost move/store commands remain available.

### Safety and testing

- Both `game-v0.34.0.js` and `game-v0.34.0-lowfx.js` use the same new `assets/decor-runtime-v0.34.js`. The files `assets/decor-art-v0.34.js` and `assets/decor-sites-v0.34.js` load in order before the runtime on all three HTML entrypoints.
- The network-first PWA cache has a fresh `bit-bazaar-v0.34.0` version and preserves `bit-bazaar-save-v3`, all player progress and the optional previous v0.33 recovery assets.
- A new end-to-end **`tests/phase4-v034.test.cjs`** loads the entire actual art/source chain, asserts exactly 120 unique artwork IDs and 202 physical site IDs, checks each new canvas is independently authored, verifies rug geometry / floor-space clearance / hanging separation, and checks all nine category quotas.
- The same test executes a real `buy` transaction on a new three-row-cost decoration: **exactly three currently perfect rows emptied and 30 existing figure IDs scattered**, before-save backup written, lifetime mastery unchanged, and ownership persisted. It also checks ghost cycling and cancellation do not save, a real confirmed art move saves once, a new shelf finish renders on all five original tiers, and both standard and Low FX shells are wired.
- Previous v0.31/v0.32/v0.33 safety checks remain in the GitHub Actions workflow. Live iPhone rendering and long-session frame behavior still require physical device QA; no device-only claim is being made.

**Next:** continue the 60 remaining originals, plan more room for the eventual 75 possible floor sculptures/plants/lighting/curios, and refine freeform decorating without risking the locked collection/sorting design.

---


## v0.33.0 — Preview Carousel & Sixteen Original Works (November 4, 2026)

A Phase 4 content, decoration-control and iPhone quality milestone. Continue the locked six-phase first-person figurine sorting game without adding traditional retail, sales or cash mechanics.

**Sixteen hand-authored decorations — 104 / 180 total (57.8%)**

The new artworks are individually pixel-authored at the same native 32×40, 40×28, 40×48 and 48×28 canvas sizes as the existing collection. All have original compositions, color design, price, item ID, description and corresponding world texture. They are **not** renamed, scaled, or recolored copies of an earlier decoration.

- **Four framed scenes:** *Rainmarket at Blue Hour*, *The Glassmaker's Fox*, *The Starfold Library*, *The Mushroom Caravan*.
- **Two architectural pieces:** *The Moonwatch Bell Tower* and *The Aquamarine Conservatory*.
- **Three actual shelf-finish designs:** *Briarwood Gilded Rails*, *Afterhours Neon Herringbone* and *Deepsea Pearl Inlay*. Their five physical shelf tiers render with individually defined beam and inlay motifs; original shelf finish renderers remain unchanged.
- **Three rugs:** *Cicada Path Tapestry*, *Terracotta Labyrinth Runner* and *Frost Lantern Textile*.
- **Two ceiling ornaments:** *Porcelain Raindrop Mobile* and *Clocktower Seed Chimes*.
- **Two standing decorations:** *Foxfire River Otter* statue and *Mooncap Bonsai* plant.

The curated **NEW ARRIVALS** filter correctly contains all 16 newly authored decorations. The catalog still pages twelve cards at a time; artwork is drawn once at boot into compact canvases, not repeatedly generated in the 3D frame loop.

**Six new side-corridor display pads — 190 / 190 implemented anchor IDs**

Six collision-checked floor positions are added along the west and east shop passages, between shelf rows, with append-only IDs **184–189**. There are now **56 wall/endcap**, **45 floor**, **14 rug**, **15 ceiling**, and **60 shelf-finish** positions = **190 real, individually named locations**. Old anchor IDs 0–183 and all bought decorations remain unchanged. New pads are at least 4.1 world units from existing floor pads, at least 4.7 units from rugs, and outside the 40 physically modeled rack collision rectangles. There is no new collision object and no new restriction on moving, picking up or sorting the 3,000 figures.

**Faster preview workflow, no monetary purchases**

When previewing a moved owned decoration, the iPhone-friendly in-world preview panel now contains:
- **‹ PREVIOUS SITE** and **NEXT SITE ›** to cycle through every compatible currently vacant location (excluding the art's present anchor and all occupied sites) without reopening the map.
- **LOOK TOWARD** to rotate the camera *only* toward the ghost's current destination; the player is never teleported, and no item is moved.
- A truthful **OPEN LOCATION X / Y** count and left/right/behind/straight-ahead directional guidance updated during play.
- The existing **PLACE HERE · FREE**, **CHANGE LOCATION** and **CANCEL** options.

Cycling, facing or cancelling a preview never changes the serialized `decor:{owned,placed,adjustments,room}` shape, never scatters figurines, never consumes perfected rows, and never writes a save. Real relocation revalidates ownership, mount type and vacancy, then writes exactly once on explicit confirmation. Shelf trim ghosts also use the default material tone the item will actually receive after moving, rather than incorrectly showing its old position's customized tint.

**Release safety**

- Standard and Low FX engines, matching preview/recovery HTML pages, cache-versioned CSS and service worker all ship with `v0.33.0`. The older v0.32.0 build remains available for fallback and recovery.
- The unmodified `bit-bazaar-save-v3` storage key, all 300 set names and 3,000 collectible figure identities, map navigation, cleaning, hidden figures, legacy decor slot IDs and ownership records are untouched.
- Added `tests/phase4-v033.test.cjs` to check unique canvas designs, mount counts, non-overlap, exact categorical additions, preview cycling (including blocked-site rejection), no-save cancellation, save-on-confirm, and both engine/HTML/PWA references. The existing v0.31 movement regression and archived v0.32 art regression continue running in GitHub Actions.
- Visual behavior on the user's physical iPhone, real-home-screen cache update latency, and full-session frame time remain device QA to perform rather than verified facts.

**Next milestones:** expand from 104 toward 180 originals, add more genuine floor/rug/hanging capacity ahead of the final catalog, refine freeform decorating and finish the planned Coward's Glasses/endgame stages on the locked master roadmap.

---


## v0.32.0 — The Collector's Salon: 20 bespoke decorations, 15 new display sites, direct catalog moves (November 4, 2026)

A substantial Phase 4 content-and-capacity milestone built on the verified v0.31 ghost placement preview. The game remains a cozy first-person figurine **collecting, cleaning and sorting game**, *not* a conventional merchant-management simulator.

**20 truly individual original pixel artworks — 88 / 180 total (48.9%)**

Each new composition is painted once into a tiny 32×40, 40×28, 40×48 or 48×28 canvas, with its own original silhouette, pixel details, palette, description and 1–20-perfect-row price. These are not color variants of previous paintings or statues.

- **Framed story art — 17 / 35:** *The Emberglass Teahouse*, *The Ferryman of Lost Stars*, *The Glacier Clock Railway*, *Foxes & Ink*, *The Opal Skywhale*.
- **Statues — 10 / 25:** *The Cinder Astronomer*, *The Opal Stone Turtle*, *The Wind-up Raven*.
- **Plants — 9 / 20:** *Whisperglass Moss Garden*, *Saffron Coral Vine*.
- **Lighting — 10 / 20:** *Hushfire Streetlamp*, *Jellymoon Lantern*.
- **Rugs — 10 / 20:** *The Ember Maze Rug*, *Astral Orchard Carpet*.
- **Architectural art — 10 / 20:** *Meteorite Glass Portal*, *Moss Cathedral Niche*.
- **Ceilings — 10 / 15:** *Moonfall Bell Garland*, *Thistledown Orbit Mobile*.
- **Shelf finishes — 5 / 15:** *Violet Stained Scrollwork*. Added a fully separate amethyst/silver floral inlay renderer for its physical five-tier fascia; the original four rail patterns are unchanged.
- **Collector curios — 7 / 10:** *Clockfish Aquarium*.

**A store that can actually display the collection**

- 15 new independently targetable, **collision-checked floor pads** in three central aisles across all five floor-rack rows. Exact append-only IDs **169–183**, leaving all 169 existing anchors and saved artwork locations untouched.
- **184 real placement anchors = 56 walls/endcaps + 39 standing floor pads + 14 rugs + 15 ceilings + 60 shelf-face trim sites.** This supports all 36 currently planned/available floor-mounted artworks at once while retaining three spare floor positions. Continued expansion toward the 180-piece final catalog remains necessary.
- Every new floor pad is at least four world units from older floor pads and other newly added pads, and stays clear of all 40 actual rack collision rectangles. No collision objects, virtual walls or heavy new textures are introduced; the locations are already accessible through the real overhead decoration map.
- Players can now choose **⌖ MAP MOVE** directly from an installed owned artwork's paginated catalog card. It opens the pre-filtered relocation map without needing to first find the decoration with the world reticle. **PLACE/MOVE** and **STORE**, the original world-edit shortcut, and the v0.31 ghost-preview flow remain available. Stored items cannot use the map-move shortcut until first installed.
- The NEW ARRIVALS filter now includes **all twenty** freshly authored pieces rather than silently omitting eight; paging stays capped at 12 cards per page. Transparent previews of the new violet shelf trim appear on the selected physical shelf only until explicitly confirmed.

**Safety, iPhone support and validation**

- Normal and Low FX `game-v0.32.0` engines share the changes. `assets/decor-art-v0.32.js` appends the artworks, followed by `assets/decor-sites-v0.32.js` appending sites, before `assets/decor-runtime-v0.32.js` initializes. All launch, preview, Low FX recovery, CSS and network-first service worker references match v0.32.0. v0.31 runtime and recovery files remain available as optional fallback.
- The original `bit-bazaar-save-v3` key, `decor:{owned,placed,adjustments,room}` shape, 300 named perfectible sets, 3,000 unique figure IDs and the one-figure inventory remain unchanged. Existing art ownership and slot IDs are never renumbered. Sacrifice purchases still cost only **currently** perfect rows and scatter exactly ten existing figures per sacrificed row, not new figure identities.
- Added `tests/phase4-v032.test.cjs` to assert 20 independently painted canvases, art/slot ID preservation, category quotas, 15 valid appended mounts, floor capacity, non-destructive ghost previews, purple rail rendering, movement persistence, full/Low FX integration and worker asset ordering. Existing v0.31 relocation tests remain mandatory in the GitHub Actions workflow.
- **Not automatically certified on physical iPhone:** Browser tap geometry, final Pages propagation, sustained device performance and every new visual appearance still require physical iPhone review. The new anchors are fixed and offset-adjustable, not completely free-drag furnishing.

**Next:** build more of the remaining **92** original artworks and further display capacity as needed, then deepen visual drag-position affordances and game-wide iPhone QA without changing the locked six-phase design.

---



## v0.31.0 — Real world-space ghost previews for owned artwork (November 4, 2026)

The next Phase 4 milestone extends v0.30's direct relocation map into an actual **walk-around 3D placement preview**, without sacrificing shelf rows or writing a single save until the player confirms.

- Aim at a purchased and displayed decoration, tap **↔ MOVE ART**, pick a compatible, vacant anchor on the existing accurate overhead map, then choose **👁 PREVIEW IN STORE**. **✓ MOVE NOW · FREE** still supports immediate placement as before.
- In preview mode the player returns to first-person walking, with the original item still installed and a semi-transparent rendering of its original pixel art at the destination. Ghosts use the existing scene perspective and occlusion ordering, reused texture canvases and one bounded candidate per preview; no new texture atlases, mesh collisions or save schema fields.
- A compact, iPhone-friendly preview HUD identifies the decoration and its proposed destination, gives approximate travel distance, and offers **PLACE HERE · FREE**, **CHANGE LOCATION**, or **CANCEL**. Change Location reopens the map with the previously selected destination. Desktop **T** targets MOVE ART, **Enter** confirms a preview, and **Escape** discards it.
- Rug previews use the zero-degree default that actual relocation applies, rather than carrying old orientation from the original anchor. Shelf-material preview paints the target shelf's fascia while leaving the current installed material untouched until confirmed.
- A preview never changes `decor:{owned,placed,adjustments,room}`, costs no row, modifies no floor positions, and never persists to `bit-bazaar-save-v3`. Cancelling, closing the viewer or switching to another menu clears transient preview state. The existing owned-item move command validates available mounts again and saves only on an explicit confirmation.
- All 68 original decorations and 169 physical anchors remain unchanged. Both regular and Low FX engines, updated 3D runtime and map, preview/recovery HTML, responsive CSS, and network-first service worker share matching v0.31.0 references. Previous v0.30 assets remain optional fallback.
- Added **`tests/phase4-v031.test.cjs`**, an isolated runnable Node regression test covering invalid sites, ownership, exact preview position, no-save cancellation, move confirmation, ghost drawing opacity, map-to-world flow and direct-move compatibility. The GitHub Actions QA workflow syntax-checks both engines and the release assets.

**Validation boundary:** Code and regression contracts are provided, but actual iPhone Safari visual interaction and long-session framerate are still subject to hands-on testing. This milestone is a selectable world ghost at physically valid mounts, not yet arbitrary drag-anywhere furnishing.

**Next:** expand mounting and authored art breadth toward 180, iterate the one-hand placement controls, and confirm all three completion journeys remain safe.

---


## v0.30.0 — Aim-to-move artwork, destination previews and free relocation (November 4, 2026)

The next Phase 4 milestone makes already-owned decorations easier to reposition directly from inside the store, without requiring the player to search their full collection.

- Stand near any installed decoration that the existing world reticle can select (within nine world units) and choose **↔ MOVE ART** next to the unchanged **◇ EDIT ART** action. Core figure placement/cleanup targets retain priority. Normal EDIT ART still opens the highlighted owned piece in the Sacrifice Catalog for fine positional adjustments.
- A separate *Move Owned Artwork* planner opens the real interactive overhead shop map, automatically filtered to that object's compatible wall/floor/rug/ceiling display category. The planner shows the actual artwork thumbnail, its current named anchor, and a destination preview. Open pins appear green; occupied positions remain amber; the artwork's present anchor is specially marked.
- Tapping a display pin previews its name and availability; current or occupied positions cannot be confirmed. **✓ CONFIRM MOVE · FREE** is the only action that changes placement; **✕ CANCEL MOVE**, closing the map, or opening another drawer discards the preview safely. The existing owned-item move API rechecks compatibility and vacancy before saving.
- Relocation never consumes perfect shelf rows or touches any figurine. Previously purchased artwork remains permanently owned. Existing adjustments are handled by the established moving behavior. The stored save shape, `bit-bazaar-save-v3` key, original IDs, and independent material choices are untouched.
- Full and Low FX engines both integrate the feature. Versioned `game-v0.30.0.js`, `game-v0.30.0-lowfx.js`, `style-v0.30.0.css`, `assets/decor-map-v0.30.js`, launch/preview/recovery pages and network-first service-worker cache share the same version references. The v0.29 emergency assets remain available as optional fallbacks.
- Locked scope preserved: **68 original individually authored decorations**, **169 physical anchors**, 40 shelf units/60 faces/300 rows, 300 named sets and 3,000 original figurine identities. No new commerce mechanics or save migrations.

**Validation:** code-path consistency checks cover both engines, the source/target selector, disabled occupied/current positions, no-cost movement callback, cancellation without mutation, HTML references, and service-worker asset consistency. Live GitHub Pages rendering, physical iPhone tap/scroll behavior, and free-drag 3D placement have not been independently device-verified. This is a map-based location preview, not yet a world-space furniture ghost.

**Next milestone:** improve direct world-view placement previews; expand the 68/180 gallery and display capacity while preserving mobile frame budget, save safety and the locked six-phase roadmap.

---


## v0.29.0 — Aim-to-edit decorations and 12 more original artworks (November 4, 2026)

A longer Phase 4 development milestone adding **twelve genuinely different painted pixel decorations** and the first **direct first-person artwork editor**, without disrupting 3,000 collectible figurines or existing saved players.

**New in-world decoration interaction**
- Stand near a displayed artwork (within nine world units), aim the central reticle at the actual rendered painting, statue, plant, lamp, rug, hanging ornament, architectural feature or collector curio, and the game reveals a small **◇ EDIT ART** button with its correct item and display location. On desktop, press **R** while an artwork is targeted; on iPhone, tap the new 44+px button.
- The exact same perspective geometry already used to render each decor is used for selection, including real rack-end hanging orientations, quarter-unit position adjustments, 90-degree rug rotations and suspended objects. The targeter uses a bounded nine-unit distance and delegates visibility checks to the current shelf-occlusion code; paintings on the far side of a rack cannot be selected through solid shelving.
- Core gameplay has precedence: if the reticle is on a figurine, shelf slot or cleaning target, the standard pickup/clean/placement action remains unchanged. The ART button does **not** override E, space, the mobile action button, or inspect-figurine. Ordinary shelf-rail trims remain available through DECOR, not by hijacking shelf-row targets.
- Selecting **EDIT ART** sets the existing Sacrifice Catalog to **OWNED**, finds the correct page automatically, highlights the actual installed artwork's card, and scrolls it into view once. From there the original safe **PLACE / MOVE**, **STORE**, micro-position, rotation and shelf-material actions remain available, with all their previous costs and checks. No art purchase, storage change, relocation, row sacrifice or save write occurs simply from targeting or opening.
- `assets/decor-world-v0.29.js` is a small first-person ray/perspective selector; it only checks installed artwork and allocates no new canvases or textures while walking. It is initialized once in each of the two game engines. `assets/decor-runtime-v0.29.js` provides the non-destructive owned-item catalog focus, keeping browse, filters, 12-card pages and all 169 available physical anchors.

**Twelve new individually authored pixel-art pieces — 68 / 180 total**
- **Statues / 7 of 25:** *Ivory Stag Automaton* (7 perfect rows) is a pale ceramic stag with branching copper antlers and a clockwork heart. *The Lantern Librarian* (5) is a stone scholar with tiny scarlet books and an illuminated handheld lamp.
- **Plants / 7 of 20:** *Velvet Sundew* (3) features scarlet leaves, luminous pearled dew and a midnight planter. *Copperleaf Fern* (4) depicts a multi-branch plant with jade/copper fronds and a painted blue pot.
- **Lighting / 8 of 20:** *Celestial Globe Lamp* (6) is an illuminated planetary model inside metallic orbital rings. *Winter Hearth Lantern* (4) has ice-encrusted glazing surrounding a warmly glowing candle.
- **Rugs / 8 of 20:** *The Alchemist's Checker Runner* (4) combines potion, key and rune panels within a burgundy textile. *Midnight Koi Tapestry* (6) draws two pale koi in a deep teal wave and lily-pad motif.
- **Ceilings / 8 of 15:** *Aurora Paper Crane Mobile* (5) comprises independently colored hanging origami birds on a willow ring. *Brass Rain Chandelier* (8) suspends individually colored crystal raindrops from nested brass arcs.
- **Curios / 6 of 10:** *Pocket Storm in a Bottle* (3) is a little thundercloud, lightning and ship trapped in a glass vessel. *The Inkwell Planetarium* (7) contains golden planets, drawn orbits and a bright silver quill.
- The original **12 framed artworks / 35**, **8 architecture pieces / 20**, and **4 shelf trims / 15** remain intact, and all nine categories still sum to the approved `180` designs.
- `assets/decor-art-v0.29.js` appends exactly 12 new art IDs to the previous 56 (no rename/reorder). Each has its own 32×40, 40×28, or 40×48 authored canvas and descriptive story. The existing 169 physical mounts, 300 ten-piece sets, 60 five-tier shelf faces, 45 cleaning messes and 18 hidden original figurines remain intact.

**Progress and stability**
- Save storage key `bit-bazaar-save-v3`, current/lifetime perfect distinctions, permanent owned artwork, `decor:{owned,placed,adjustments,room}`, existing material presets and walk-around preview remain unchanged. Nothing generates a duplicate figure or creates a new currency/shop-management mechanic.
- The normal `game-v0.29.0.js` and emergency `game-v0.29.0-lowfx.js` both integrate the same selector and retain the existing safe FPS rollback. Responsive `style-v0.29.0.css`, mobile preview/fallback HTML, `assets/decor-runtime-v0.29.js`, and `assets/save-manager-v0.29.js` have matching version references.
- The main `index.html` and network-first offline cache `bit-bazaar-v0.29.0` are updated to include the new gallery and world selector, with best-effort v0.28 recovery assets and **no service worker access to player localStorage**.

**Programmatic acceptance testing**
- **15/15** original artwork/target tests passed: the twelve new sprites were all different, retained the same 169 anchors, used 35+ distinct pixel operations each, preserved the 180 design quotas, and the first-person selector correctly handled visible floor, endcap, rug and ceiling objects while rejecting through-shelf and off-reticle targets.
- **24/24** integrated mock gameplay tests passed: six newly added original pieces consumed exactly **28 presently perfect rows**, returning precisely **280 unique original figurines** to floor positions, preserving 60 lifetime achievements and successfully re-importing the save. The exact owned item opened from a target highlight without modifying the save, with only one automatic scroll.
- **Device verification outstanding:** Real GitHub Pages propagation, direct visual inspection in Safari and physical iPhone gesture/performance QA remain unverified by simulated code tests. This is functional fixed-anchor editing and **not yet full free-drag furnishing**.

**Next development targets:** improve in-world preview and repositioning, continue adding the **112 remaining original decorations**, and move toward full 180-item display capacity while keeping iPhone performance and the no-commerce collectible-first design protected.


## v0.28.0 — Real 40-endcap gallery, 8 bespoke scenes, 169 display anchors (November 3, 2026)

Phase 4 has advanced from **48 to 56 of the locked 180 individually authored decorations (31.1%)**, with 40 additional physical display hooks on the real side panels of freestanding shelving. The original 3,000 unique figures, 300 ten-piece sets, one-hand sorting, 60 five-tier shelf faces, cleaning and permanent mastery remain unchanged, as does the [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md). No customers, sales, currencies, or secondary progression have been introduced.

**The store now has 169 usable decoration mount anchors**
- Every one of the **20 two-sided freestanding shelf units has two real solid side/end panels**. The new `assets/decor-endcaps-v0.28.js` defines 40 independent endcap gallery hooks (IDs **129–168**) exactly along those side surfaces using the same fixture geometry as the first-person engine: center x=11+16×aisle and z=11+12×row; width 7.7 world units, with visible panel surface at x ± 3.935.
- No earlier mount is removed, renamed or reordered: **169 = 56 wall/art/endcap hooks + 24 standing pads + 14 rugs + 15 ceiling hooks + 60 shelf-trim faces**. The 40 new wall-category hooks are **fixed narrow side-gallery portraits**: their artwork stays on the actual end panel, with an independent correctly projected 1.36-unit wide × 2.24-unit tall frame. They do **not** cover the collectible slots on the front and reverse faces of racks, add any obstacle, or interfere with the shelf cleaning system.
- Endcap art cannot drift beyond its physical panel via the micro-position workshop: the controls explain the restriction and allow the player to **move the owned art to another gallery hook for free**. Old perimeter wall art retains its previously supported lateral adjustments. Imported backup files with illegitimate endcap offsets are rejected rather than silently changing saved artwork.
- The interactive overhead **DECORATION MAP** now identifies **WALLS + ENDCAPS** and shows all 56 selectable wall-category pins, their occupied/available status, and an explicit *FIXED TO RACK SIDE* location description. Map selection stays non-destructive: buying and moving items still require the original separate commands.

**Eight more independently painted pixel-art creations**
- Four detailed **framed story scenes**, all original 32×40 canvas artworks: *The Moonlit Cartographer* (3 perfect rows; ocean navigator and star chart), *The Last Lantern of Autumn* (4; crimson leaves and a lit stone bridge), *Abyssal Observatory* (5; submerged telescope and fish), and *The Clockwork Orchard* (6; copper mechanical orchard).
- Four independently drawn **architectural stained-glass pieces**, all original 40×48 canvases: *The Phoenix Rose Window* (6 perfect rows), *The Tidal Glass Archway* (5), *The Dwarven Rune Niche* (4), and *The Starsilk Cathedral Window* (7). Their distinct subjects include a red-and-gold phoenix, sea-glass wave mosaics, glowing amber runes and twin moons with woven star paths.
- Catalog category totals are now **12 framed arts / 35** and **8 architecture / 20**. The eight new designs share the appropriate wall mount type and are newly browseable under the **✦ NEW 8** filter; the existing gallery is untouched. The WALL ART filter now correctly reports the combined 20 wall/architecture creations, rather than falsely labeling all wall content as just framed pictures.
- All new pixel canvases are authored once at initialization and reused by the bounded existing decorator. Eight original IDs, different palettes, individually composed scenes, persistent owned art and unchanged 1–20-row cost rules are preserved. No unbounded atlas or animated sprite engine was added.

**Progress, backup and iPhone protection**
- The `bit-bazaar-save-v3` local save key and `decor:{owned,placed,adjustments,room}` structure remain identical. Earlier purchases on IDs 0–128 remain in place, original figures keep their identities, lifetime mastery stays permanent and all new purchases consume only presently perfect 1–10 rows.
- Normal `game-v0.28.0.js`, Low FX `game-v0.28.0-lowfx.js`, shared `assets/decor-runtime-v0.28.js`, `assets/decor-map-v0.28.js`, `assets/decor-workshop-v0.28.js`, `assets/save-manager-v0.28.js`, matching HTML and `style-v0.28.0.css` are versioned. The site `index.html` references these in the correct order.
- The network-first offline `bit-bazaar-v0.28.0` service worker precaches each asset separately; an unavailable optional or noncritical file cannot fail the entire installation. Previous release files remain best-effort fallback. The worker does not read, write or delete player saves.
- **16/16** geometry/unique-art checks passed: all 56 paintings use distinct brush operations, the eight new scenes have rich original pixel drawing detail, all 40 endcaps align to the actual side panels, and every earlier mount remains untouched.
- **30/30** integrated purchase/map/restore checks passed: four test purchases spent exactly 15 currently perfect rows and scattered **150 unique original figurine IDs**, old perimeter art continued working, new art remained aligned to real end panels, explicit free relocation and saves survived reload, and the overhead map respected occupied sites and safe destination selection.
- **12/12** build checks passed, including JS syntax, correct normal and Low FX dependency order, unchanged 3,000-figure model, old save serialization and existing room-finish walk-around preview.

**Not yet verified:** Direct visual QA in a physical iPhone Safari session and independent GitHub Pages deployment propagation are not established by these static and simulated tests. The game still uses safe fixed decoration anchors rather than full drag-anywhere freeform placing.

**Next:** improve visible endcap hardware/lighting and mobile map navigation, continue building the **124 remaining individually authored** decorations, and eventually make in-world furniture editing direct, touch-friendly and performance-safe.


## v0.27.0 — Interactive decoration placement map (November 3, 2026)

A substantial Phase 4 usability release: **visualize every available display position on the existing real-time shop map, check occupancy, then choose a physical placement location without buying or moving anything accidentally.** The existing **48 of 180 original artworks**, 129 display anchors, 60 five-tier shelf faces, full 3,000-figure inventory and locked [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md) remain unchanged.

**A real first-person shop planning workflow, not a fake image**
- Enter **◇ DECOR → VISUAL DECORATION MAP** to open the actual store's overhead map. Players can choose **SHELF MAP** (the original cleaning/sorting map), **WALL ART**, **FLOOR DISPLAYS**, **RUGS**, **CEILING**, or **SHELF TRIMS**. The selected category is drawn as numbered pins in the same physical 70×74 store coordinate system used for player movement and shelving.
- The map shows the exact number of open locations in each category: **16 wall anchors**, **24 freestanding display pads**, **14 rug sites**, **15 hanging ceiling hooks** and **60 shelf-face finishes**, together **129 total anchors**. The default shelf task map is preserved and remains fully functional.
- **Green pins mean open, amber pins mean occupied.** Tap or keyboard-select one to inspect its actual named location and any installed decoration. The selected pin has a distinct visual treatment. The existing map's FIT and ZOOM 2× interactions remain available to examine dense shelf faces; all overlays are generated only while the map drawer is open, never in the real-time 3D frame loop.
- Choosing **USE SELECTED LOCATION** on an *open* pin sets the matching catalog destination and returns to the DECOR drawer. The player may then purchase a matching decoration or reposition a previously owned one using their unchanged explicit controls. Occupied pins cannot be used as new destinations. **The map never purchases, sacrifices rows, alters figurines, relocates an owned item, or writes to a save merely from selecting a pin.**
- Shelf-finish pins use the real shelf-face/fixture geometry of the existing game map rather than approximate freestanding coordinates. Map pin markup escapes all item/location descriptions. Pin groups have keyboard Enter/Space support, accessible names, and at least 44px touch targets for the main mode/actions; SVG pins support the existing 2× map zoom for finer selection.
- **RETURN TO DECOR** exits the map planner without altering anything. The original shop map and figure-hunt features remain available as before.

**Compatibility and packaging**
- `assets/decor-map-v0.27.js` is a separate, compact, lazy-rendering map component; `assets/decor-runtime-v0.27.js` only adds a catalog entry point and a non-destructive destination setter. Both full/Low FX engines integrate the same pinned map into their existing overhead floor plan.
- `assets/save-manager-v0.27.js` preserves the existing `bit-bazaar-save-v3` and `decor:{owned,placed,adjustments,room}` validation rules. Original 129 anchor IDs, purchased items, room finishes, carpet rotation and saved figure positions remain compatible.
- Versioned full `game-v0.27.0.js` and Low FX `game-v0.27.0-lowfx.js`, responsive `style-v0.27.0.css`, standard preview and Low FX recovery HTML, main `index.html`, and network-first `bit-bazaar-v0.27.0` service worker are committed. The service worker includes the new map module and preserves optional previous-version fallback files without touching local saves.

**Validation**
- **22/22 integrated map/catalog tests passed**: 129 preserved physical anchors, category-specific pin counts, exact occupant visibility, purchased-item state, occupied-pin rejection, sending open slots back to the catalog without changing ownership, and subsequent correct explicit purchase on the selected location.
- Both full and Low FX game JavaScript files have been statically parsed with the map integration. The existing 3,000-piece collection code has not been changed.
- **Limitations:** The new interaction still selects among fixed real shop anchors; truly unrestricted object dragging is a future Phase 4 goal. The map is planned for iPhone, but physical-device visual/touch QA and independent GitHub Pages propagation checks are not claimed by these simulated tests.

**Next:** continue building toward 180 original decorations, add more wall display capacity and improve direct in-world decorating while preserving 24 FPS phone performance, safety of collection data and this visual placement workflow.


## v0.26.0 — More real shop display space and faster iPhone catalog (November 3, 2026)

This Phase 4 milestone focuses on **physical placement freedom and responsive browsing**, not inflated art counts. The same **48 of 180 original hand-authored decorations** remain; all previous 104 mount IDs, historical purchases, 3,000 figures, 300 sets and [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md) are preserved.

**25 additional, physically grounded display sites**
- Expanded from **104 to 129 original world placement anchors**, append-only IDs **104–128**. This adds **12 freestanding display pads** (24 total), **6 floor-rug sites** (14 total), and **7 ceiling hanging hooks** (15 total). All 60 shelf-face finishes and 16 wall-art hooks remain unchanged.
- The 12 additional standing sites occupy clear west/east side passages and front/rear store aisles, rather than blocking the 20 floor racks or 20 wall racks. More purchased plants, curios, lamps and statues can be shown simultaneously.
- Six new carpet sites lie between existing racks in the north and south aisle-crossings. Their full 4.4×2.96 world-unit footprint grid (including corners) was checked against the **same 40 physical fixture rectangles** used in the actual game, with perimeter clearance. They retain actual floor projection and rotation, with existing old rugs grandfathered.
- Seven additional ceiling hanging points are above open aisles and separated from existing ceiling fixtures. The ceiling count is now **15**, matching the final locked ceiling decoration item quota.
- Every new mount uses the previous 2.5D decoration projection with no additional collision boxes, floors, objects generated per frame, full-scene texture replacements or larger sprite atlases. This is not an assertion that all future 180 pieces can be installed simultaneously.

**Faster, touch-friendly Sacrifice Catalog**
- **12 decoration cards per page** instead of rendering all 48 into the drawer at once. PREVIOUS / NEXT controls appear before and after the visible cards, with explicit page numbers and item ranges. New Arrivals, category tabs and LOWEST/HIGHEST COST sort all reset browsing to the first page. When switching pages, the screen returns to the start of the actual card list.
- Five dedicated **NEXT OPEN** buttons locate the next available wall hook, floor pad, rug site, ceiling hook or shelf-face trim. They wrap around the eligible locations, skipping occupied sites, without purchasing, moving or overwriting anything. They also show an informative notice when every eligible spot is occupied.
- A live vacancy summary in the DECOR header displays the true number of free wall, floor, rug, ceiling and shelf mounts. Quick-select floor, rug and ceiling badges now show **correct category-ordinal numbers**, including new sites (e.g., R14 and C15), rather than confusing raw global slot IDs.
- Buttons have 44–48px minimum touch heights, designed for Safari/Home Screen use. The four individual room material themes, walk-around preview, micro-placement, rug rotation and shelf material finishes remain intact.

**Data safety and acceptance**
- All previously bought art remains permanently owned at the **exact same slot IDs**. Save key `bit-bazaar-save-v3` and `decor:{owned,placed,adjustments,room}` shape are unchanged. New locations are appended only; earlier 0–103 entries are not reordered or modified.
- `assets/decor-sites-v0.26.js` tests collision clearance as the catalog initializes, then adds exactly 25 new sites. `assets/decor-runtime-v0.26.js` provides the paged menu and vacancy finder while keeping the original purchase, transfer and world-rendering logic. `assets/save-manager-v0.26.js` validates all 129 positions against item mount kinds and continues to accept earlier saves.
- A defensive guard now rejects non-finite figure scatter coordinates before a purchase can write localStorage. Actual purchases still spend **only currently perfect** rows and scatter exactly 10 existing figure IDs for each sacrificed row.
- Standard `game-v0.26.0.js`, Low FX `game-v0.26.0-lowfx.js`, matching CSS, standard preview and emergency low-effects HTML are committed. The live `index.html` and network-first offline `bit-bazaar-v0.26.0` worker reference all v0.26 assets with best-effort v0.25 fallback.

**Verification**
- **11/11 anchor/geometry checks** passed: 129 total positions, 104 original IDs preserved, 12 standing + 6 rug + 7 ceiling, correct final category totals and no duplicate or out-of-room display coordinates.
- **21/21 integrated mocked transaction/menu tests** passed after using exact in-game rack geometry: four purchases used 14 currently perfect rows, scattered exactly **140 unique figure IDs**, preserved the player's lifetime mastery, correctly saved new slots and placement adjustments, restored them after reload, and validated the purchased save.
- **12/12 full/Low FX build checks** passed, including unchanged core figure serialization, preserved 3,000-piece game, properly ordered catalog module dependencies, responsive controls and matching Low FX fallback.
- Live GitHub Pages deployment propagation, physical iPhone testing and direct visual screenshot QA **remain unverified**; these are programmatic QA results and not a claim of an actual hands-on playtest.

**Next milestones:** keep adding individually authored decorations toward 180, expand decorative wall layout options, provide more direct in-world selection and make display capacity approach the full original-art collection without slowing iPhone rendering.


## v0.25.0 — Twelve original collector artworks and better browsing (November 3, 2026)

Phase 4 has advanced to **48 / 180 independently authored decorations** (26.7% by item count). The original 36 decorations, all 104 prior mount positions, the `bit-bazaar-save-v3` format, 3,000 unique figurines, 300 ten-figure collections, optional room finish workshop and original locked [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md) are unchanged.

**Twelve individual hand-authored pixel designs across six categories**
- **Framed Art — 8 / 35:** *The Foxfire Railway* (3 perfect rows) is a copper-lantern steam train crossing a glowing forest; *Keeper of the Deep* (6) is an underwater clock tower with fish and marine vegetation. Both are separately drawn 32×40 story scenes.
- **Statues — 5 / 25:** *The Moss-Crowned Golem* (8) has granite arms, moss, etched markings and a wildflower; *The Porcelain Fox* (4) features glazed ceramic fur, gold repair seams and a jade base.
- **Plants — 5 / 20:** *Twilight Bonsai* (4) is a twisted tree with amethyst leaves and starlight blossoms; *Honeybell Orchid* (3) features hanging golden flowers, emerald stems and a small copper bee.
- **Lighting — 6 / 20:** *The Firefly Jar Lamp* (2) contains individually positioned warm firefly lights and a smoked-glass vessel; *The Observatory Beacon* (7) is a taller astronomical signal lamp with etched brass and teal glass.
- **Rugs — 6 / 20:** *Patchwork Dragon Quilt* (3) is a 40×28 crimson patchwork with a dragon emblem; *Winter Observatory Carpet* (5) is a deep-blue floor textile with silver sextant/snowflake imagery.
- **Ceiling ornaments — 6 / 15:** *Singing Shell Cascade* (4) is a suspended array of pearls, shell forms and sea-glass chimes; *The Clockmaker's Comet* (6) is a copper-clockwork comet with staggered enamel and brass trails.
- Existing **Architecture 4/20, Shelf Trims 4/15 and Curios 4/10** remain in-game. All nine category targets still total 180.

**Better browsing and no broken purchases**
- A **✦ NEW 12** tab displays only the twelve additions, while the rest of the catalog remains available under ALL, each category, and OWNED.
- A thumb-sized **ORIGINAL ORDER / LOWEST COST / HIGHEST COST** sorter helps players choose the next sacrifice. Sorting is local to the view, never changes collection IDs, art ownership or pricing.
- The six category pairs use their original existing wall, standing-pad, rug or ceiling mount types. Existing purchased artwork stays put when a version is updated.
- Every purchase still requires confirmation (unless internal test mode) and spends only **currently perfect** ten-piece rows. Each sacrificed row returns all ten original figure IDs to collision-tested shop floor locations; historical perfection is not lost. Previously purchased decorations can be stored or moved for free.

**Compatibility, delivery and testing**
- New artwork is produced once at startup in individual small pixel canvases, never regenerated per frame. It uses the existing projection and sprite placement system; no expensive new floor atlas or blocking collision geometry was added.
- `assets/decor-expansion-v0.25.js` extends the 36-piece catalog append-only, with 12 new unique IDs and a thumbnail cache. `assets/decor-runtime-v0.25.js` adds the NEW filter and sorting. `assets/save-manager-v0.25.js` preserves the exact previous backup validation rules and accepts the new item IDs through the live catalog.
- Versioned normal `game-v0.25.0.js`, Low FX `game-v0.25.0-lowfx.js`, CSS, preview and Low FX recovery HTML are committed. `index.html` and the network-first offline `bit-bazaar-v0.25.0` worker reference the matching release, keeping best-effort v0.24 recovery assets.
- **13/13 artwork/metadata validations passed**, including distinct 48-artwork drawing streams, 12 detailed new compositions, prices, dimensions, and existing anchor preservation.
- **20/20 simulated purchase/ownership/menu tests passed:** six new categories + one existing purchase consumed exactly 25 perfect rows and scattered **250 unique original figurines**, restored seven owned items from save, validated room metadata, and demonstrated the NEW, cheapest and highest-cost sorts.
- **12/12 build checks passed** for standard/Low FX syntax, exact save serialization, original 3,000-figure game, dependency order, and the existing room-material workshop.

**Outstanding:** Live GitHub Pages propagation, real iPhone performance, and actual in-Safari visual verification are not claimed by these programmatic tests. The 180-piece catalog target still needs **132** more bespoke decorations; fully freeform placement remains a future goal.

**Next milestone:** improve variety, placement capacity and direct scene editing while continuing original decoration batches toward the full 180-piece roster.


## v0.24.0 — Live room-finish customization and reversible walk-around preview (November 3, 2026)

**The 36 original Sacrifice Catalog decorations and the locked 180-item roadmap are unchanged.** This milestone improves interior customization without new purchases, coins, customer systems, or any further sacrifices. [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md) remains authoritative.

**Real independent materials for four shop surfaces**
- **Floors:** Heirloom Slate (the original), Warm Honey Tiles, Sea Glass Stone and Terracotta Mosaic. The selected RGB tile palette is used directly in the 480×270 procedural per-pixel floor renderer, with its normal grout, grain and fog preserved. Palette colors are obtained once per floor draw, not recomputed per pixel.
- **Walls:** Mulberry Plaster (original), Morning Cream, Lagoon Teal, Old-Brick Rose. Changes are applied to the actual distant wall polygon fill, baseboard and upper border, not merely a menu thumbnail.
- **Ceiling:** Midnight Violet (original), Cloudlinen, Sapphire Night and Copper Glow. The actual ceiling background and horizontal tile details change; ceiling lights remain functional decorative geometry.
- **Shelving:** Heritage Walnut (original), Golden Oak, Painted Sage and Inkwood & Brass. The physical shelf backs, fascia and five miniature support boards update in both standard and Low FX game renderers; existing paid decorative shelf-rail motifs layer on top, retaining their independent gold/silver/copper accent selection.

**A genuine walk-around preview with apply or discard**
- From **◇ DECOR**, open the new **THE INTERIOR WORKSHOP**, choose any combination of the 4×4 material options, and tap **WALK-AROUND PREVIEW**.
- The drawer closes and world rendering resumes using a temporary draft. Players may walk and look around the real shop with normal touch/desktop movement controls; a compact overlay offers **APPLY** (saves all four finish choices), **EDIT** (return to the workshop retaining unsaved choices), and **DISCARD** (restore the previously saved room without writing anything). Normal pick-up/drop interactions and competing map/collection buttons are disabled while previewing.
- The workshop also offers **APPLY FINISHES** or **REVERT CHOICES** directly in the menu. No decoration ownership or sacrifice is required to style the core shop.
- Material choices are deliberately limited to four authored themes per surface, so this is a functional expanded-customization milestone, **not yet unrestricted per-tile editing or full freeform decoration placement**.

**Compatibility and performance**
- Existing save key `bit-bazaar-save-v3`, all 300 collections / 3,000 original figurines, 60 five-tier shelf faces, historical mastery, cleaning, and previous 36 decorations are preserved.
- The optional `decor.room` field stores a four-element integer array `[floor,wall,ceiling,shelves]` (indexes 0–3). Older saves missing the property use the exact original colors. The new `assets/save-manager-v0.24.js` rejects invalid room selectors on import and keeps accepting old v0.23 or pre-decoration backups.
- `assets/room-workshop-v0.24.js` handles draft/committed palettes, previews, save state and menu actions. `assets/decor-runtime-v0.24.js` integrates it into the existing gallery. Both full and Low FX game builds call the same color hooks directly from their old world draw paths.
- `index.html` and the versioned network-first service worker `bit-bazaar-v0.24.0` now reference all required release assets, preserving previous v0.23 fallback files. No new runtime sprite atlas or per-frame canvas allocations were added.

**Programmatic validation**
- **20/20** stand-alone room workshop tests passed, covering all original palettes, fully reversible previews, independent selections, apply/save, persistence, malformed settings, and legacy save imports.
- **20/20** integrated gameplay tests passed, covering exact 10/20/40 figurine scatter costs, genuine owned decoration persistence alongside room materials, zero historic mastery loss, 4-surface reloads and canceled previews.
- Standard and Low FX script syntax and structural build tests passed. The live published entry point and offline cache were updated, but **a full browser render, GitHub Pages propagation, and real iPhone visual QA remain unverified**.

**Next:** polish in-world preview interaction and mobile comfort after playtesting, add more original decorative items toward the remaining 144, and continue expanding independent materials without overloading the 24 FPS iPhone renderer.


## v0.23.0 — Phase 4 actual placement freedom and shelf material workshop (Nov 3, 2026)
This update adds **meaningful customization to the existing 36 original decorations**. Item count remains **36 / 180**. The approved [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md) still requires the remaining 144 bespoke decorations and eventually broader freeform placement/material controls.

**Real hands-on customization (not just thumbnails):**
- The catalog shows an interactive **FINE POSITION** panel on each owned *installed* piece, with touch-friendly **WEST / EAST / NORTH / SOUTH** controls. One tap moves a mounted decoration **0.25 world units**, to a maximum **±0.5 world units** from its chosen anchor in each allowed direction.
- Floor curios, plants, lamps, ceiling objects and rugs can be nudged along the real world X/Z axes. Wall art slides **only along its wall** (north/south wall: east/west; east/west wall: north/south). Shelf finishes stay physically locked to their real five-row fascia; they do not drift or become floating icons.
- Rugs now feature **true 0°, 90°, 180° and 270° physical orientation**. Their eight existing projected canvas strips transform in the correct rotated 3D plane, rather than merely rotating a menu image. Safe-footprint checks reject orientations or position tweaks that overlap permanent fixtures. The existing original unrotated rug at any of the eight long-standing locations remains fully supported, including older positions with slightly limited clearance.
- Shelf finishes gain independently selectable **ORIGINAL GOLD, PEARL SILVER and AGED COPPER** metal accent treatments. The variation changes actual in-world front rail strokes across all five tiers, preserving the distinctive original item patterns, not counting palettes as separate new decorations. An owned installed item can be reset to its initial position/material at no cost.
- The same existing purchase/move/store actions remain: purchasing sacrifices only currently perfect rows and scatters ten genuine original figure IDs per row; re-positioning, turning, changing metal accents and resetting cost **zero** additional rows. Moving an item to another main anchor resets its fine adjustments for safety; storing clears fine edits but retains ownership.

**Compatible save and import**
- The longstanding key `bit-bazaar-save-v3` is unchanged. Existing optional `decor:{owned,placed}` now additionally supports the optional compact property **`adjustments:[[itemId, dxSteps, dzSteps, quarterTurns, materialId], ...]`**, where offsets are bounded integer quarter-steps from -2 to +2, rug turns 0–3, shelf material IDs 0–2. Old saves simply load with original placements and default gold.
- `assets/decor-workshop-v0.23.js` manages all fine edits and validates mount compatibility, wall direction and collision clearance, and sanitizes any unexpected data on restoration.
- `assets/save-manager-v0.23.js` adds strict backup file checks rejecting unknown items, duplicate adjustments, invalid positions, out-of-range turns, wrong material categories and wall-through shifts. It still accepts pre-v0.23 backups without adjustments or even pre-Phase 4 data.
- Both `game-v0.23.0.js` and `game-v0.23.0-lowfx.js` remain compatible with the original 3,000 figures and full shelf data. They share `assets/decor-runtime-v0.23.js`, the new workshop module, unchanged original decoration art modules, `style-v0.23.0.css`, and the versioned HTML entry/recovery files.
- The network-first service worker `bit-bazaar-v0.23.0` caches the complete updated load order and retains best-effort last-version fallback files. It never reads or deletes user save data.

**Verification**
- **20/20** workshop migration, fine position, rug rotation, metal variants, store/load and import-validation checks passed, including a full set of legacy save cases.
- **15/15** full simulated engine purchases and customization checks passed: exact purchase costs (1+4+2+2 perfect rows), figure IDs and mastery unaffected, real rug geometry transformed, different in-world shelf metal strokes, and settings persisted across runtime reload.
- **9/9** build checks passed, including normal+low-effects JavaScript syntax, unchanged save serializer, original 3,000-figure engine and workshop script order.
- **No physical iPhone or full live-browser visual review has yet been confirmed.** Cosmetic layout, thumb target comfort and true device performance still require a player test.

**Next:** give the placement workshop an in-world live preview and expand material customization beyond shelf accents, then continue toward all 180 original decorations. The fixed-anchor positions are more flexible now, but full freeform placement is **not** complete.


## v0.22.0 — Phase 4 physical shelf finishing and collector curios (Nov 3, 2026)
This releases **36 of the 180 individually authored cosmetic decorations** specified in the approved [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md). The locked 180-piece category quotas and no-currency sacrifice design are unchanged. The first 28 previously authored and purchased items retain the same IDs and positions.

**Eight new distinct cosmetic designs**
- **Shelf finishes (4 / 15):** *Astral Brass Filigree* (4 perfect rows), *Ivyward Oak Lattice* (2), *Tidal Pearl Mosaic* (3), *Crimson Arcade Marquee* (5). Each has its own hand-authored 48×28 pixel texture, decorative material palette, and distinct physical geometric ornament design (stars, carved ivy, scalloped pearlescent waves, or arcade zigzags).
- **Collector curios (4 / 10):** *The Unfinished Clockwork Heart* (3 rows), *Pocket Cosmos in a Bottle* (4), *The Paper Dragon Diorama* (2), and *Ember-Key Typewriter* (5). Each is an original transparent 32×40 pixel freestanding work with distinct silhouettes and descriptions. Curios share the existing floor display pads with lamps, plants and sculptures.

**Physical shelf customization — functional implementation**
- Appended **60 new placement anchors**, numbered **44–103**, one for every actual shelf face (both sides of 20 floor fixtures and the 20 wall shelves); previous wall, standing, rug and ceiling anchors 0–43 remain untouched.
- The DECOR panel now offers **SHELF TRIMS** and **CURIOS** filters with real live counts, all 60 shelf-face locations in an iPhone-friendly dropdown, previous/next face controls, and **LOCATE SELECTED SHELF ON STORE MAP** for immediate spatial context.
- A purchased shelf finish renders on all **five physical front shelf rail fascias** of the selected face using the existing perspective shelf geometry and distinctive motif strokes. These are real front-of-shelf decorative rails rather than fake or freestanding pictures. Shelf finishes do **not** consume or rearrange figurine slots and do not block cleaning, walking or picking up figurines. Unfinished/dirty shelves still show their original grime.
- The newly attached rail-finishing renderer is called from the original `drawShelf` function in both normal and low-effects engines; drawing is culled beyond 19 floor units, with reduced detail at distance, no new image/canvas allocation per frame, and at most five tiers per visible decorated face. Shelf trims are excluded from the freestanding world-entity render list to prevent hovering icons.
- Each original pixel thumbnail is encoded and cached **once per decoration**, avoiding repeated 36-item canvas conversion during catalog filtering, shelf navigation and re-placement.

**Persistent purchases, compatibility and safety**
- Purchases still require explicit consent and sacrifice **only current perfect rows**. Each purchased item releases ten original real figure IDs per sacrificed row to planned collision-safe floor positions; original IDs, historical collection mastery, one-figure carrying, permanent cleaning and other progress survive.
- All eight items have permanent ownership, can be moved/stored/re-placed for free and are limited to their appropriate mount types. Two finishes cannot occupy one shelf face, and curios cannot take shelf trim positions.
- Save key `bit-bazaar-save-v3` and optional `decor:{owned,placed}` structure are **unchanged**. The four earlier decoration mount types, original 28 items and 44 site IDs are compatible; pre-v0.22 backup files load. `assets/save-manager-v0.22.js` validates the shelf vs. floor mount distinction and prevents invalid duplicate installs.
- Versioned full/Low FX engines `game-v0.22.0.js`, `game-v0.22.0-lowfx.js`, matching CSS and HTML and `assets/decor-expansion-v0.22.js` / `assets/decor-runtime-v0.22.js` are committed. `index.html` and the compact network-first `bit-bazaar-v0.22.0` offline worker point to the new build with optional v0.21 recovery assets.

**QA before publication**
- **18/18** catalog, authored artwork and save backup compatibility assertions passed: 36 unique ID/visual compositions, all 60 real shelf-anchor IDs, unchanged original 44 anchors, correct category quotas and rejecting invalid save imports.
- **20/20** mocked gameplay tests passed: exact 40/20/20 scattered-figure costs, current-perfect row consumption, no double placement, free moves and storage, reload and lifetime mastery preservation, actual five-row fascia rendering, 60-face selector/map UI, category counts.
- The JS in both normal and Low FX builds passed syntax and saved-data serializer regression checks. **Live GitHub Pages propagation, visual screenshots and physical iPhone gameplay/performance are not independently verified.**

**Next:** continue remaining 144 individually authored pieces and expand from fixed decoration anchors toward richer positioning/rotation/material customization, while retaining accessible touch controls and good iPhone frame time. The final 180-item Phase 4 and all its acceptance criteria remain open until fully implemented.


## v0.21.0 — Phase 4 stained-glass architecture and hanging ceiling art (Nov 3, 2026)
This release expands the true Sacrifice Catalog to **28 of 180 independently authored decorations**, introducing two *new* categories with visibly different mounting and rendering. The locked [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md) is unchanged. Physical-device acceptance and fully freeform interior decoration remain in progress.

**Eight new original 40×48 pixel compositions:**
- **Architectural wall features (4 / 20):** *Moonstone Rose Window* (4 perfect rows), *Whispering Library Arch* (6), *Coral Tide Viewport* (3), and *Sunclock Stone Alcove* (5). These are larger architecturally framed visual inserts with individually authored pixels: stained glass, library shelving, an underwater porthole, and a sandstone sundial.
- **Ceiling ornaments (4 / 15):** *Brass Celestial Orrery* (5 perfect rows), *Prism Rain Chandelier* (7), *Mothsilk Lantern Cloud* (3), and *Windsong Feather Mobile* (2). Each is independently drawn as a transparent suspended 2.5D ornament. These are decorative visuals, not interactive physics objects or dynamically cast real-time lighting.
- The previous **20 original framed artworks, statues, plants, lamps and rugs** remain unchanged and retain their complete catalog IDs and all existing 36 anchor IDs.

**Functional interior personalization**
- The DECOR screen now offers **ARCHITECTURE** and **CEILINGS** filters alongside earlier item types, all with correct actual item/category counts.
- Architecture uses existing wall mount points; a wall frame and an architecture feature cannot occupy the same point. Architecture renders larger than framed paintings, creating a distinct architectural treatment rather than a mere recolored picture.
- Added **eight ceiling-only hooks** (IDs 36–43), in open aisle positions above the original shelving. The rear C-D hook was repositioned to avoid a built-in ceiling bulb. Ceiling ornaments display as actual in-world hanging sprites beneath the shop's ceiling.
- A separate CEILING HANGING POINT dropdown and eight numbered, thumb-size quick-select controls let players choose, preview via catalog art, purchase, place, move, store or restore ceiling ornaments with no additional payment after purchase. Other placement selectors stay intact.
- No new physical obstacles; ceilings remain nonblocking, while existing wall fixtures, independent floor display pads and rug sites are fully preserved.

**Sacrifice, save, recovery and performance**
- Every new purchase spends 2–7 **currently PERFECT** numbered collection rows and scatters exactly ten existing IDs per sacrificed row. The random row selection, preplanned collision-safe floor placement, pre-write transaction, lifetime mastery, one-hand carrying and 3,000 total collectible identities are unchanged.
- The save key remains `bit-bazaar-save-v3`; the optional `decor:{owned,placed}` shape is unchanged. Pre-v0.21 purchases, ownership, wall hooks 0–15, standing pads 16–27 and rug sites 28–35 remain valid. Newly added ceiling anchors use 36–43.
- Normal `game-v0.21.0.js` and Low FX `game-v0.21.0-lowfx.js` use `assets/decor-v0.19.js`, `assets/decor-expansion-v0.20.js`, `assets/decor-expansion-v0.21.js`, shared `assets/decor-runtime-v0.21.js`, and `assets/save-manager-v0.21.js`. The network-first offline worker caches these dependencies and preserves optional previous-release recovery assets. Sprites are drawn into small canvases once at startup, not once per game frame.
- Save-file import validates the new ceiling/wall distinction and keeps accepting older shop backups without any decorations.

**Verified programmatic QA**
- **10/10 catalog checks:** 28 individually drawn original pixel compositions, unchanged prior item IDs and 36 earlier anchors, correct 8 new ceiling hook IDs, valid row costs and locked 180 quotas.
- **17/17 simulated purchase checks:** wall/ceiling placement restrictions, 40/50/20 figurine scattering, no duplicate IDs, older purchases, lifetime mastery, free move/store, persistence and reload.
- **14/14 UI, projection and backup checks:** correct category filters, hooks and quota counts, existing controls, in-world facade and ceiling rendering, legacy saves and rejection of invalid restore files.
- **10/10 normal/Low FX build checks:** JavaScript parses, game/save structure unchanged, proper versioned backup/recovery paths and load order.
- **Important:** These are static and simulated tests, not direct Safari or physical iPhone gameplay tests. The main GitHub repository has been updated; the live site may need to refresh its service worker cache.

**Next:** test ceiling and wall-facade visuals directly on an iPhone, then continue the full 180-item roster with **shelf trims, curios and additional environmental materials**, and move toward finer positional controls and rotation without degrading phone performance.


## v0.20.0 — Phase 4 lamps and woven floor rugs (Nov 3, 2026)
This is a playable **20 of 180** bespoke decoration milestone; it expands v0.19's 12 items without changing the approved [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md). The full final catalog and freeform placement are not implemented yet.

**Eight new original pixel-art designs**
- **Four floor lighting sculptures (4 / 20):** *Aurora Orrery Lamp* (3 perfect rows), *Hearthglass Lantern* (2), *Verdigris Lighthouse* (5), and *Moonflower Floorlight* (4). Each has independent hand-drawn transparent pixel silhouettes and different luminous details. These are decorative glowing objects, **not** dynamic room illumination.
- **Four horizontally displayed carpets (4 / 20):** *Sunken Compass Carpet* (1 perfect row), *Mosswork Runestone Rug* (2), *Starfall Observatory Runner* (3), and *Amber Honeycomb Mat* (4). Each rug has a separate 40×28 custom-authored textile drawing with individually designed compass, rune, constellation, or honeycomb patterns.
- All 12 pre-existing artworks remain intact: **6 frames / 35**, **3 sculptures / 25**, **3 plants / 20**. New counts across these five implemented categories are **6+3+3+4+4 = 20 / 180**. The other four roadmap categories remain unimplemented, not placeholders presented as inventory.

**New, genuinely different placement**
- Existing IDs and physical locations of all **16 wall hooks and 12 freestanding display pads** are unchanged. Eight unique **rug-only sites** are added as IDs 28–35, located in collision-checked open walkways.
- The decoration menu now has **LIGHTS** and **RUGS** filters, an independent rug-site selector, and quick-select numbered rug locations. Rug slots cannot hold wall frames, lamps or statues; rugs cannot occupy wall or stand positions.
- Lamps use the existing bounded freestanding 2.5D sprite projection. Rugs lie **flat on the actual shop floor**, using at most eight small projected texture strips per rug to approximate perspective. No additional per-frame canvas creation, collision obstacles or mandatory map redesign.
- A maximum of four rugs and four lamps from this release can be installed concurrently, keeping the added rendering cost bounded and preserving iPhone performance goals.

**Economy, persistence, and rollback**
- Purchases continue to select only **currently perfect** 1–10 rows and scatter exactly 10 real collectible IDs per row to safe floor positions. No coins or other currency exist. Once a decoration is purchased, it remains owned forever; moving or storing it costs nothing.
- The existing `bit-bazaar-save-v3` format and optional `decor:{owned,placed}` field are preserved. Older purchased items and their positions 0–27 remain valid; rug positions are append-only. `assets/save-manager-v0.20.js` validates exact placement-kind compatibility while accepting older saves.
- Normal engine `game-v0.20.0.js`, Low FX engine `game-v0.20.0-lowfx.js`, `assets/decor-expansion-v0.20.js`, `assets/decor-runtime-v0.20.js`, versioned CSS and two matching HTML launch pages are committed. `index.html` and network-first PWA worker `bit-bazaar-v0.20.0` reference the complete new release, retaining older emergency fallback assets.

**Development checks**
- Unique art drawings and backward compatibility of the first 12 decoration IDs passed **6/6** catalog checks.
- All eight rug sites were verified against the game's 40 actual shelf fixture collision rectangles and previously existing floor-pad positions.
- Normal and low-effects builds passed **10/10** build and structural checks. Purchase/ownership, category restrictions and reload passed **15/15** mocked behavioral checks. Perspective rug rendering and save validation passed **7/7** tests.
- Live browser display and physical iPhone testing have **not** been independently completed. Before broadening the catalog, confirm that rug floors render clearly in Safari, new menu tabs scroll, and previously purchased art remains intact.

**Next:** improve preview/placement freedom and introduce architectural finishes, ceiling ornaments, shelf trims and decorative curios while creating each of the remaining 160 individual art pieces under the locked 180-piece roster.


## v0.19.0 — Phase 4 living gallery: 12 original decorations across three categories (Nov 3, 2026)

This milestone expands the first playable Sacrifice Catalog **from 3 to 12 distinct, individually authored decorations**, while keeping the locked 180-piece [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md) target intact. The original three paintings and all existing purchased ownership/placement IDs remain preserved.

**Artwork now actually in the game (12 / 180):**
- **Six framed wall artworks (6 / 35):** the original *The Midnight Moth*, *Rain on the Glasshouse* and *The Ember Drake*, plus the new bespoke *Clockwork Koi*, *The Stargazer's Atlas* and *Lantern Tide*. Each illustration has its own pixel composition and original collector text.
- **Three sculptures (3 / 25):** *Copper Owl Sentinel*, *The Argent Knight* and *The Spiral Fossil* — independent silhouettes with pedestal, inlay, heraldry or carved growth bands.
- **Three plants (3 / 20):** *Cloudfern Terrarium*, *Ruby Crown Cactus* and *Mooncap Mushrooms* — individually authored transparent 32 × 40 pixel sprites, displayed as free-standing 2.5D world objects.
- Artwork prices are **1–7 current perfect rows**, not money. Purchases still randomly select distinct currently-perfect rows, return exactly ten original figurines per row to safe floor locations, and preserve their lifetime mastery.

**Placement and interface**
- The **◇ DECOR** panel gains functional filters for ALL, FRAMED, STATUES, PLANTS and OWNED, with actual counts rather than placeholder entries.
- The existing **16 wall hanging points remain exactly where they were**. Added **12 open floor display pads** in corner gardens and between shelving aisles. A frame can only hang on a wall; a statue/plant can only occupy a floor pad. Display positions never overlap, and non-blocking floor decor cannot trap the player.
- Separate wall and floor dropdowns, plus 12 numbered quick-select pad buttons, let players move furniture among available positions without paying more. Art not installed is still permanently owned and can be re-placed later.
- Freestanding art is drawn using transparent, original pixel artwork as projected in-world sprites. It faces the viewer without adding collision geometry, sprite atlas reprocessing, or thousands of new draw calls.

**Compatibility and safety**
- The save structure remains `bit-bazaar-save-v3` with optional `decor: {owned, placed}`. Old v0.18 save files restore correctly, including the first three purchased paintings, because old IDs and 0–15 wall anchor positions are unchanged.
- `assets/save-manager-v0.19.js` now rejects attempts to restore wall frames on floor positions or floor objects on wall positions. The existing backup, import confirmation and lifecycle save protections stay active.
- `game-v0.19.0.js` and `game-v0.19.0-lowfx.js` both load the shared `assets/decor-v0.19.js` and `assets/decor-runtime-v0.19.js`; a matching `baseline-v0.19.0-lowfx.html` is included, and v0.18 remains an optional offline fallback.

**Development checks**
- Twelve separately authored paint instruction streams passed uniqueness and asset checks; all 12 selected floor pads were checked against the actual 40-rack collision geometry and are accessible.
- Mock purchases and persistence passed **19/19** category, ownership, current-perfect-row, scattering, placement and save-loading tests.
- Both new JavaScript engines passed syntax checks and retain all 3,000 collectibles and existing figure-save fields.
- Live physical-iPhone art visibility, tapping, upload/backup behavior and longer-session performance remain to be tested by a player. The full 180-piece roster and unrestricted furnishing are **not yet complete**.

**Next:** expand the catalog into additional decoration categories and introduce richer previews, finer positioning and material customization without compromising iPhone frame time.


## v0.18.0 — Phase 4 first playable Sacrifice Catalog gallery (Nov 3, 2026)
This is a **small, real Phase 4 milestone: 3 of 180 original decorations now implemented**, not a claim that the final 180-piece catalog is complete. Phase 3's physical iPhone acceptance remains open. The canonical [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md) remains unchanged.

**Three completely original framed-pixel-art gallery pieces, out of the required 35 framed items / 180 total:**
- **The Midnight Moth:** an astral moth in a golden frame, costing **2 currently PERFECT rows** (exactly 20 figurines re-scattered).
- **Rain on the Glasshouse:** rain-lit glasshouse with lush ferns, costing **3 currently PERFECT rows** (30 figurines).
- **The Ember Drake:** a dragon defending a volcanic citadel, costing **5 currently PERFECT rows** (50 figurines).
- Each artwork is authored individually at 32×40 source pixels, not a recolor of another piece, and is rendered in the first-person store as a cached framed image. Artwork is created once on startup; no full 3,000-figure atlas changes or new artwork canvases during gameplay frames.

**Actual gameplay loop**
- A new **◇ DECOR** entry in the main HUD opens the Sacrifice Catalog, showing images, descriptions, permanent ownership, exact row costs, and all nine category quotas to reach 180 at the full release.
- Choose from **16 wall-mounted hanging points** distributed in the gaps between existing wall shelves. Selecting a free position and buying a piece requires sufficient currently perfect sets and a final explicit confirmation.
- The transaction chooses the specified number of *random, different, currently perfect* rows, not previously perfected-but-now-imperfect sets. Each is emptied completely, and all of its ten original IDs are placed into collision-checked real floor positions.
- Positions for *all* figures are planned before the purchase can proceed. The complete next save is written before the in-memory row arrays are changed; save-write failure cancels the purchase. One copy of the original shop before its first sacrifice is retained under `bit-bazaar-v3-before-first-sacrifice`.
- Decorations become **permanently owned**. Move between free hanging points, store, and re-place at zero additional cost. Existing lifetimes mastered and observed IDs never decrement. No currency, sales, customers or automated collection is introduced.

**Save, restoration and fallback**
- The same `bit-bazaar-save-v3` JSON carries a new optional `decor: {owned, placed}` property. Older saves without this field load with an empty gallery, preserving all earlier figure, shelf, floor, hidden discovery and lifetime progress.
- Matching normal and Low FX builds: `game-v0.18.0.js`, `game-v0.18.0-lowfx.js`, `style-v0.18.0.css`, `preview-v0.18.0.html`, and `baseline-v0.18.0-lowfx.html`.
- New cached modules `assets/decor-v0.18.js` and `assets/decor-runtime-v0.18.js` own the authored art and game transactions. `assets/save-manager-v0.18.js` extends manual file-import validation to reject fake purchased item IDs, duplicate placements, occupied hooks or unowned art. It accepts older undecorated backup files. Previous working v0.17 assets remain separately available.

**Verification**
- Normal and Low FX JavaScript passed syntax checks.
- Mocked Phase 4 purchases and storage passed **19/19** transaction/ownership cases, including 20/30 figure re-scattering, no repeat spending, exact current-perfect costs, permanent ownership and no double occupancy.
- Save manager passed **10/10** decor/legacy backup validation cases.
- **No physical iPhone or full browser render has yet been verified.** The first slice needs device testing before extending to the rest of the 180 required bespoke artworks and more flexible placement systems.

**Next:** real iPhone test of framed-world art visibility, scrolling, selecting a wall hang point and retaining ownership after reload; broaden the original decorated category roster and improve placement previews / layout freedom. Do not claim Phase 4 complete until all 180 bespoke decorations and the full positioning, material and sacrifice acceptance criteria are implemented.


## v0.17.0 — Phase 3 save protection and resilient iPhone offline updates (Nov 3, 2026)
This final Phase 3 safety pass extends the approved [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md). No Phase 4 decoration purchases, customer systems, new currency, or collection IDs are introduced.

**Save Protection in the Almanac**
- A new **YOUR SHOP · SAVE PROTECTION** section at the bottom of COLLECTION lets the player download a local `Bit-Bazaar-Save-YYYY-MM-DD.json` snapshot and import a previous snapshot.
- A small `assets/save-manager-v0.17.js` module handles file creation, local validation, consent and restoration; it makes no network requests or uploads. A backup contains the actual full 3,000-figure save, not just completion counts.
- Restore validates the existing v3 shape: 60 faces × 5 rows × 10 slot positions, exact shelf membership, unique figure IDs, one carried figure, cleaning stages, 45 permanent floor messes, 18 possible hidden IDs, discovered/bookmarked sets, ground positions and player coordinates.
- Invalid files or a cancelled confirmation leave the current save alone. A confirmed restore first copies the present save to `bit-bazaar-v3-before-file-import` in localStorage, then replaces `bit-bazaar-save-v3` and reloads.
- During that restore reload, engine saves are temporarily suppressed so an iOS `pagehide` or final animation tick cannot overwrite the imported snapshot with the old in-memory shop.
- The backup is manual. Players should keep downloaded files in Files/iCloud Drive or elsewhere they control; local Home Screen Safari storage alone is not a guaranteed archival backup.

**iPhone session durability**
- Both normal and low-effects engines flush the existing, unchanged save serializer on `visibilitychange` to hidden and on `pagehide` while playing. This protects the latest player position/camera direction when iOS suspends a Home Screen PWA between the regular autosave ticks.
- The full world, figurine, discovery, cleaning and shelf-placement mechanics are untouched. All recent HUNT, Almanac, map task navigation, and low-effects recovery features remain.

**Offline installation and Home Screen polish**
- The network-first service worker is `bit-bazaar-v0.17.0`. It pre-caches only the 12 essential current files (including the save-manager module), rather than demanding decades of obsolete builds; 4 prior v0.16 files are best-effort optional fallback assets and cannot block the installation.
- On offline misses, a navigation request can receive the cached index; missing scripts, styles and images are **not** incorrectly served HTML.
- The PWA manifest description now correctly states **3,000 collectible figures / 300 named sets**, replacing its obsolete 1,000/100 wording.

**Verification before publishing**
- Final repository integrity checks passed **20/20**, and the auto-save import guard was behavior-tested to prevent stale re-saves during page reload.
- Normal and Low-FX scripts passed syntax checks. Versioned `game-v0.17.0.js`, `game-v0.17.0-lowfx.js`, `style-v0.17.0.css`, `preview-v0.17.0.html`, `baseline-v0.17.0-lowfx.html` and manager module are committed.
- Backup validation passed **14/14** data-integrity cases. Mocked export/import behavior passed **7/7** scenarios, including refusal of malformed saves, cancelled confirmations, successful imports, and pre-import safety copies.
- Real Safari/iPhone Home Screen file download, file picker, low-effect recovery, and background suspend must still be tested on an actual iPhone. Simulated QA is not evidence of physical-device acceptance.

**Next:** review Phase 3 with a real iPhone, confirm downloads can be reopened from Files and that a manually imported backup reloads correctly, then begin carefully staged Phase 4 Sacrifice Catalog implementation under the locked 180-item design.


## v0.16.0 — Phase 3 store map restoration navigator and scroll-preservation (Nov 3, 2026)
Builds on v0.15's direct HUNT-to-shelf navigation; **Phase 4 remains unstarted**. The approved [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md) is unchanged.

**Faster, purposeful map navigation**
- The real 40-fixture map now includes **PREV UNIT / NEXT UNIT** controls to inspect every actual rack and wall unit without accurately tapping tiny SVG shelf shapes on a phone. When the map is zoomed, navigation recenters on the chosen fixture.
- **FIND DIRTY SHELF** cycles through actual unfinished faces of the 60 existing shelf faces, selects the specific face and recenters the map. The button disables itself when all shelves are clean.
- **FIND UNSORTED SET** finds the next real 10/10-filled but incorrectly ordered row, selects its physical shelf face, and highlights its assigned collection. Fully sorted and partly filled rows do not qualify. The button disables itself when no such rows remain.
- The map shows live **remaining dirty faces / full rows needing sorting**. These are derived from real saved cleaning stages, slot numbers and perfect-row validation, not invented objectives. No ground, hidden, or loose figurine coordinates are revealed.

**iPhone scroll fix**
- Rebuilding the map after tapping a fixture, switching faces, zooming or using a task shortcut now restores the `drawerBody` scroll offset, instead of jumping the entire map panel to the top. The existing map viewport's own scroll/pan position is also retained when appropriate. Opening a map from another screen starts cleanly at the top.
- New task controls have minimum 48px tap height; unit browsing buttons have minimum 44px tap height.

**Safety**
- New release files: `game-v0.16.0.js`, `game-v0.16.0-lowfx.js`, `style-v0.16.0.css`, `preview-v0.16.0.html`, `baseline-v0.16.0-lowfx.html`.
- Main `index.html` and the network-first `bit-bazaar-v0.16.0` service worker cache reference the release; the previous v0.15 assets remain for rollback.
- Existing `bit-bazaar-save-v3` serialization, 3,000 figures, 300 sets, dirty face records, 18 hidden IDs, 45 floor messes, pins, HUNT features, map-to-collection links and 112-canvas rendering cap remain unchanged. Task scanning happens only on opening or interacting with the map, never once per rendered frame.
- Normal and Low FX scripts passed JavaScript parsing and structural checks before publication. **Real iPhone/browser interaction tests are still needed.**

**Test on iPhone:** Open MAP, tap next and previous unit; tap FIND DIRTY SHELF twice and confirm it moves between dirty faces. When a row is actually full but out of order, tap FIND UNSORTED SET and verify the correct rack/face and highlighted set. Scroll down the map and change faces to check the panel does not jump. Reload your saved shop and check previous placements, cleaning, pins, and HUNT details.

**Next:** final real-device Phase 3 acceptance, then a carefully staged implementation of the 180-piece Phase 4 Sacrifice Catalog under the locked design.


## v0.15.0 — Phase 3 direct HUNT-to-shelf navigation and stable mobile panel (Nov 3, 2026)
This continues the locked [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md) without adding customers, shop sales, currency, new figure identities, or Sacrifice Catalog decorations.

**Assigned shelf shortcut**
- For a pinned HUNT collection that already has figures on a display, the live tracker now names the **actual shelf face and row** and offers **▦ SHOW SHELF ON MAP**. A tap opens the existing map in 2× zoom, centers the correct fixture, selects the correct face and highlights the matching collection row. The location is recomputed from live shelf state at tap time, so moving an assigned set is followed accurately.
- For an unstarted set, the same area explicitly says **NO SHELF ASSIGNED YET** and explains that the first figure must be placed in a clean row. It provides no shortcut to loose or hidden pieces. The six-phase roadmap's Coward's Glasses tracking remains intentionally exclusive to Phase 5.
- Almanac's prior **FIND THIS SHELF ON THE STORE MAP** now uses the same shared navigation function, reducing divergent implementations.

**Mobile stability**
- Retain the HUNT panel's scroll position and keyboard number focus when the tracker updates because of pickup, placement, sorting or pin refresh. Cycling to a different pinned set resets the tracker to the top.
- Maintain at least **44px** for numbered figure buttons, restore a 150px maximum HUNT body height on very short (620px or less) screens, and scroll details within the existing compact notebook.

**Save & performance:** unchanged `bit-bazaar-save-v3` JSON, including 3,000 figure IDs, all 300 assigned rows, 60 cleaned faces, 45 floor messes, 18 hidden collectible IDs, discovered ledger, pins and lifetime mastery. This is DOM/CSS-driven UI work only, with no new canvas sprite allocations, per-frame map loops or new artwork atlas.

**Release:** `index.html` uses `game-v0.15.0.js` and `style-v0.15.0.css`, with a network-first `bit-bazaar-v0.15.0` service-worker cache. A corresponding `game-v0.15.0-lowfx.js` and `baseline-v0.15.0-lowfx.html` preserve performance recovery. Prior versions are retained for fallback.

**QA status:** both JavaScript builds passed syntax checks and static structure checks prior to release. Confirm the actual GitHub Pages update and physically test an iPhone before considering Phase 3 complete. On a fresh save: pin an unstarted set, open HUNT and verify there is no map shortcut; place its first figure onto a cleaned shelf, and verify the new shortcut selects the exact face/row. Repeat after moving the set, cycling pins, reopening the app and in Low FX mode.

**Next:** final end-to-end Phase 3 iPhone acceptance including map accuracy, long-session resilience and compact screen accessibility, then proceed to the much larger Phase 4 Sacrifice Catalog under the locked roadmap.


## v0.14.0 — Phase 3 tracker readability and figure-level guidance (Nov 3, 2026)
This is a focused **Phase 3 mobile usability release**, not the Sacrifice Catalog. The approved [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md) remains unchanged.

- **A tap-friendly two-row HUNT checklist:** the 10 figure-number cells are now 5 across instead of one cramped 10-wide strip. Real buttons support selection and keyboard focus, while the prior green/orange/gold/purple status coding remains.
- **Tap any number for contextual guidance:** an optional in-world detail card shows the real figurine name **only after discovery**, plus the precise status: correct numbered slot, wrong actual slot versus desired slot, currently in hand, observed but unshelved, or still undiscovered. Tap again to dismiss. Selecting another pinned set clears the previous focused number.
- **Never spoil floor discoveries:** unknown figures still show anonymous entries; no scattered, secret, or loose figurine coordinates appear. The panel doesn't collect anything automatically.
- **Short-screen support:** HUNT details scroll within a bounded panel, so landscape/short iPhones do not require a full-height notebook. Collection navigation buttons retain at least 44 px height.
- **Save and performance protection:** figure placement, 300 × 10 memberships, secret IDs, cleaning stages, map, existing pins and the version-1 `bit-bazaar-save-v3` save shape remain unchanged. Focused number is deliberately transient; the panel still opens collapsed after reload. No added sprite canvases, frame work or new atlases.
- **Release paths:** `index.html` loads `game-v0.14.0.js` with `style-v0.14.0.css`; the network-first offline cache is `bit-bazaar-v0.14.0`. A matching `baseline-v0.14.0-lowfx.html` and `game-v0.14.0-lowfx.js` preserve the severe-frame recovery path. Older v0.13 files remain for comparison.
- **Verification:** both new JavaScript builds passed a syntax-compile check before publishing, and the versioned game, preview, low-effects fallback and offline cache files were generated. This is structural/syntax QA, **not** a claim of completed interactive or physical iPhone playtesting.

**iPhone smoke test:** open the game, select COLLECTION, pin a set, return to the shop, tap ★ HUNT; verify ten larger numbered buttons. Tap #1, read its detail, tap #1 again to close, then cycle pinned sets. Reopen a previously saved shop and confirm figures, pins and restoration counters remain intact. Check the low-effects fallback if performance degrades.

**Next:** assess real iPhone readability, HUNT overlay placement and map interaction, then finish Phase 3 before starting the much larger 180-decoration Sacrifice Catalog.


## v0.13.0 — Phase 3 in-store pinned hunt tracker and numbered collection checklists
Continues the approved [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md), with **no customers, no shop sales, and no decoration currency**. Phase 4 Sacrifice Catalog is deliberately not implemented yet.

**In-store HUNT tracker:** an optional, collapsible **★ HUNT** panel under the existing restoration counters. On an unpinned store, tapping it offers a button to open the Collection Almanac. Once sets are pinned, the tracker displays one chosen set at a time: actual name, pinned-set index, 0–10 genuinely discovered, 0–10 physically shelved, number correctly placed, and ten numbered tiles showing `CORRECT`, `WRONG SLOT`, `IN HAND`, `DISCOVERED` or `UNKNOWN` status. PREVIOUS/NEXT cycles the pinned collection list; COLLECTION opens its full illustrated page. The panel can be collapsed at any point and does not give even approximate loose-figurine coordinates.

**Much clearer detail checklist:** each individual collection now opens with a 10-cell numbered overview identifying which figures remain off the shelf and which already displayed figures are in incorrect numbered slots. It is derived from real stored figure numbers, not generated guesses, so it remains correct after drops, lifts, swaps, relocation and reordering.

**Save compatibility:** a single optional `trackedSetId` is added to the existing `bit-bazaar-save-v3` JSON. On reload, this value is accepted only if its set remains pinned; old v0.12 and earlier saves fall back to the lowest numbered pinned set. Removing the tracked set automatically chooses another bookmarked set, or returns the tracker to its empty state. The optional panel itself starts collapsed on reload so it never blocks the world view unexpectedly. Existing `pinnedSets`, `seenFigures`, 3,000-figure layout, 18 secrets, 60 shelf cleaning faces, 45 floor messes and permanent mastery data remain intact.

**Mobile visual work:** separate bright pixel-number tiles for correctly shelved pieces, misplaced items, held items, discovered-but-unshelved miniatures and unknowns; large touch targets for hunt cycling. After starting play, the original instructional mission paragraph collapses to free screen space; the optional tracker opens only when the player chooses to use it. All HUD art is CSS, not a new sprite atlas or canvas.

**QA:** staging and JavaScript syntax checks passed. Automated in-browser-simulation checks covered fresh stores, no-pins behavior, HUNT-to-Almanac access, pin/cycle/open controls, pickup/drop/placement live updates, a misplaced figure #1 in physical slot 8, valid figure numbers, saved hunt and shelf restoration after reload, unpinning active set, old-save fallback, matching low-effects build and extreme slow-frame recovery. A 1,440-tick 60fps simulation rendered 480 frames within the existing **112-canvas sprite cache** and 70/30/65 near/mid/far figure caps. **Real-device iPhone usability testing remains necessary.**

**Next:** finish Phase 3 quality/visual review on a physical iPhone, then assess readiness to begin the major 180-piece Sacrifice Catalog. Do not prematurely report Phase 4 completed.

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
