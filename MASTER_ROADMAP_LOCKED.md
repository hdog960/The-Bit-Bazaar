# THE BIT BAZAAR — LOCKED MASTER ROADMAP
Status: **APPROVED / LOCKED** · 2026-11-03
Project: First-person iPhone Safari/Home Screen pixel-art cleaning, collecting, sorting and personal decorating game.
This is the canonical creative brief. Do not introduce customers, employees, store sales or conventional merchant management.

## Permanent design principles
- Exactly **3,000 collectible figurines**, grouped into **300 unique named sets**, each containing exactly **10 numbered figures (#1 through #10)**.
- Player **carries one figure at a time**. Pickups, shelf targeting and precise placement use the central reticle; vertical looking works on iPhone.
- 60 usable shelf faces (20 two-sided freestanding racks plus 20 wall shelves), five physical rows per face, ten independently targetable slots per row.
- A row may contain one named set only. Player chooses any of the ten positions, may pick up/reposition pieces, and may exchange a held figure with one on the shelf. **Only 1–10 in correct left-to-right order is a completed row.** Full but unordered rows are explicitly NOT complete. No duplicates or deleted figures.
- Preserve existing player progress on every update; retain a functional previous-version fallback. Protect the iPhone with spatial culling, bounded sprite cache (~112 tiny canvases), adaptive ~24fps frame cap, and slow-frame rollback.
- No recurring/respawning dirt, no timers, no mandatory prestige resets, no customer interactions. Relaxing, purposeful play.
- First-time/lifetime perfect completion and **currently** perfectly completed rows are distinct metrics. Sacrifice purchases spend only current perfect rows; historic achievements never disappear.

## Phase 1 — Core figurine placement & ordering **IN PROGRESS**
1. Add displayed set name and local set number 1–10 on carried figure, almanac and shelf previews.
2. Reticle targets one of 10 **specific slots** in the chosen row, not just the row.
3. Free placement in any empty slot within the correct single-set row; preserve wrong-set rejection.
4. With an empty hand, aim at a shelf figure to retrieve it. With one figure held, aim at a matching-set occupied slot to **swap** (displaced figure becomes the single item in hand); allow reorganizing with no full inventory.
5. Distinguish incomplete, full-but-disorganized, and **PERFECT 1–10**. Count only perfect rows as completed. Save actual slot positions and migrate pre-upgrade row saves non-destructively.
6. Visual feedback and tiny 16-bit-style animations/celebration on first perfect placement; inspect miniatures up close with names, numbers, and short lore. No big new texture atlases.
Acceptance: can fully populate a row out of order, cannot receive completion credit, rearrange using one hand, then obtain credit only when left-to-right order is 1 to 10.

## Phase 2 — Cleaning and hidden discovery
1. On a truly fresh game, all **60 shelf faces** start dusty/cobwebbed and **must be cleaned with EMPTY hands** before figures can be placed on them. Cleaning one face unlocks its five rows.
2. Distinct tactile interactions: shelf dust wiping, cobweb clearing, loose packaging/trash collection; visible, persistent changes, no randomly returning dirt.
3. Exactly **18** of the existing 3,000 figures start hidden in designated messes (never spawned on the floor until exposed). A small number of mess interactions discover them with a delightful pop-out. Never create extra IDs or duplicates. The other 2,982 are distributed normally.
4. Provide PUT DOWN when holding a figure, with collision-safe persistent floor coordinates (already prototyped).
5. Old saves require conservative non-destructive migration: avoid retroactively locking already-used display faces and avoid losing progress; explicit initial clean state on new saves.
Acceptance: dirt cleaned and discoveries permanently saved; 60/60 shelves clean; exactly 3,000 figure ownership accounted for.

## Phase 3 — Almanac + interactive store map
1. Illustrated 300-set collector encyclopedia: discoverable silhouettes, names, #1–10 identifiers, close-ups, figure statuses and set status (missing / full-disordered / perfectly sorted).
2. Overhead store floor plan with actual all 40 shelf units, 60 faces, five slots/rows per face; tap rack to see attached sets and row status.
3. Show real player coordinates and direction arrow; location refreshes without frequent expensive scene updates.
4. Do not reveal positions of loose figures or uncollected figurines.
Acceptance: accurate status and map after pickup, swap, placement, relocation and Sacrifice Catalog purchases.

## Phase 4 — THE SACRIFICE CATALOG
1. **Exactly 180** bespoke, detailed, individually authored cosmetic decorations at release. No counting lazy color swaps as entirely unique items. Each item needs a strong visual silhouette, name, description, price, placement constraints and original coherent 16-bit pixel art.
2. Category quotas: 35 posters/framed art/banners; 25 statues/sculptures/pedestals; 20 plants/terrariums; 20 lamps/lighting; 20 rugs/floor finishes; 20 wall/window/architectural features; 15 ceilings/chandeliers; 15 shelving materials/trims; 10 decorative curios/accents = **180**.
3. Players earn NO currency. A decoration purchase costs **1–20 currently perfect shelf rows**, depending on rarity/impact; show exact cost and require confirmation. Choose that many random currently perfect rows; return their 10 figures per row to actual collision-safe floor positions. Keep ownership/history intact. Previously purchased decor remains owned forever, can be moved/repositioned freely.
4. Fully usable decoration placement mode with preview/rotation, move/remove/restore, independent materials for floor, wall, ceiling and shelves. Decorations must have substantial compositional freedom; no two players' stores should need look alike.
5. Budget frame/rendering costs carefully, support save versioning and no collision trapping.
Acceptance: buying poster for 2 rows empties two randomly chosen PERFECT rows and scatters exactly 20 figures, statue for 10 empties 10 and scatters 100; no other inventory changes; decoration persists.

## Phase 5 — THE COWARD'S GLASSES
1. Permanently unlock at **150 unique sets perfected at least once**; lifetime unlock cannot be lost after Sacrifice purchases.
2. Optional toggle to equip/unequip. While equipped, make **COWARD** all caps, prominent on the game overlay continuously.
3. Bounded local highlight/collection number on nearby figures; if carrying a figure whose set is already started, a low-cost floor arrow points toward its relevant assigned shelf face/row. If unstarted, **no arrow**.
4. No speed/collection automation, no gameplay penalty. No thousands of labels or costly pathfinding.
Acceptance: COWARD cannot be hidden while glasses enabled, arrow obeys started-set rule, mobile remains performant.

## Phase 6 — Lifetime experience, meaningful completion & showcase
6.1 **Lifetime unique-set milestones** (first perfect completion only):
- 1: First Perfect Ten (store sign / achievement plaque)
- 10: Finding Your Rhythm (small showcase)
- 25: Dedicated Sorter (shelf nameplates)
- 50: The Restorer (more display decor options)
- 100: A Serious Collection (commemorative centerpiece)
- 150: The Coward's Choice (glasses)
- 200: The Great Archivist (fancy plaques/signature floor)
- 250: Almost Legendary (entrance ornament)
- 300: Master of the Bazaar (grand finale and master display)
Permanent milestones never decrement if decorations re-scatter a perfected row.

6.2 Three distinct journeys:
- **The Restorer**: all shelf faces and ambient mess cleaned, 18 hidden figures revealed.
- **The Archivist**: all 300 sets perfected at least once, regardless of current rows.
- **The Perfect Bazaar**: all 300 rows PERFECT simultaneously, 3,000 figures organized right now. This can be temporarily undone voluntarily by decor purchases.

6.3 **30 carefully authored achievements**, spanning collection, deliberately wrong-then-fixed order, hidden discovery, thorough cleaning, decor sacrifice and challenges (including jokes about glasses). No tedious exploit loops.
6.4 On Perfect Bazaar, optional cinematic/screen-wide celebration and exclusive **Collector's Monument** (never purchasable); the world stays playable after credits.
6.5 Post-completion activity is strictly optional: perfect a store or sacrifice progress to buy more décor, then restore it. No mandatory prestige/reset/timer/customer quests.
6.6 Showcase/photo mode hides HUD, gives smooth camera and optional overhead store snapshot without accounts or multiplayer.

## Implementation order / stage gates
**1 → 2 → 3 → 4 → 5 → 6**, with automated unit and mobile WebKit browser checks between milestones. Physical iPhone playtesting can add useful information, but is **optional, never a requirement placed on the player, and never a condition for continuing development**. Accept or hold each phase based on available automated evidence and tracked defects; do not pretend a Linux WebKit test proves physical iOS behavior. Do not silently skip any phase, overload the CPU, erase saves, or claim a feature implemented before it is committed and tested.

### QA ownership amendment · 2026-11-05 (process only)
Developer/CI owns testing, regression triage, browser boot checks, synthetic-file backup/restore/undo, and dense-gallery stress. The player is not expected to use the Files app, record diagnostics, run a QA script, or provide screenshots to unlock Phase 5. These activities are only optional if the player spontaneously wants to report something. This amends the workflow, **not any locked creative scope**, and preserves all 3,000 figures and the original save schema. Evidence and remaining limitations are documented in `QA_AUTOMATION_POLICY.md`.
This document is the canonical roadmap and should be updated with status only if the user explicitly approves a creative scope change.
