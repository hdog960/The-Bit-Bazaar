# THE BIT BAZAAR — LOCKED MASTER ROADMAP
Status: **APPROVED / LOCKED** · 2026-11-03
Project: First-person iPhone Safari/Home Screen pixel-art cleaning, collecting, sorting and personal decorating game.
This is the canonical creative brief. Do not introduce customers, employees, store sales or conventional merchant management.

## Delivery status — November 6, 2026

**Phases 1–3:** Implemented with historical regression coverage.
**Phase 4:** Automated acceptance passed; [evidence](PHASE4_AUTOMATED_SIGNOFF.md). Physical iPhone testing is optional and cannot block development.
**Phase 5:** Implemented and accepted via automated unit + mobile WebKit gameplay testing ([evidence](PHASE5_v0.54_RELEASE.md)). Unlock, optional equipment, COWARD overlay and started-set-only arrow are live in both render modes.
**Phase 6.1:** **Accepted** — nine permanent lifetime-set milestones, signed pixel-art honors in the shop, shelf nameplates, a 200-set floor seal, and three free gallery finishes. Unit and mobile WebKit tests passed at [v0.55](PHASE6_v0.55_RELEASE.md); no user QA required.
**Phase 6.2:** **Accepted November 6, 2026** — Restorer / Archivist / Perfect Bazaar journeys.
**Phase 6.3:** **Accepted November 6, 2026 on v0.57** — 30 named permanently earned medals, real sorting and sacrifice history, glasses interaction and validated optional save extension. Then 6.4 (monument and finale), 6.5 (optional postgame), and 6.6 (showcase/photo mode).

**Phase 6.4:** **Accepted on November 6, 2026** — Exclusive Collector's Monument in the world permanently unlocks after all 300 physical rows are perfect simultaneously. The nonblocking four-chapter celebration supports next, skip, replay and return. Only a validated optional viewed boolean is saved. Phase 6.5 and 6.6 remain next.

**Phase 6.5:** **Accepted on November 6, 2026** — A permanent optional Collector's Encore becomes available after genuinely earning the Perfect Bazaar medal. It summarizes real current shelves and owned décor; provides a bounded restoration notebook prioritizing sets actually scattered by decoration purchases, with direct links to existing checklist, pinning and store map, and a voluntary door to the unchanged Sacrifice Catalog. No automatic sorting/purchase, new task counters, prestige, save fields, timers or customers. Phase 6.6 showcase/photo mode remains next.

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

**Phase 6.6:** **Implemented in v0.60; automated acceptance pending** — Non-mutating Photo Mode hides world HUD and action controls while gently easing camera rotation. A first-person pixel-perfect PNG and optional one-shot overhead shop portrait use genuine shelf, cleaning, art and player data; close restores original camera and location. iOS native share/download fallback; no account, save field, extra collectible, currency or multiplayer. Preserve earlier builds and CI requirements.

## Implementation order / stage gates
**1 → 2 → 3 → 4 → 5 → 6**, with automated unit and mobile WebKit browser checks between milestones. Physical iPhone playtesting can add useful information, but is **optional, never a requirement placed on the player, and never a condition for continuing development**. Accept or hold each phase based on available automated evidence and tracked defects; do not pretend a Linux WebKit test proves physical iOS behavior. Do not silently skip any phase, overload the CPU, erase saves, or claim a feature implemented before it is committed and tested.

### QA ownership amendment · 2026-11-05 (process only)
Developer/CI owns testing, regression triage, browser boot checks, synthetic-file backup/restore/undo, and dense-gallery stress. The player is not expected to use the Files app, record diagnostics, run a QA script, or provide screenshots to unlock Phase 5. These activities are only optional if the player spontaneously wants to report something. This amends the workflow, **not any locked creative scope**, and preserves all 3,000 figures and the original save schema. Evidence and remaining limitations are documented in `QA_AUTOMATION_POLICY.md`.
This document is the canonical roadmap and should be updated with status only if the user explicitly approves a creative scope change.

### Phase 6.2 implementation update · November 6, 2026
The Three Journeys now have independent progress/status UI sourced exclusively from the already-saved world state (cleaning stages and revealed original figures, unique lifetime perfected IDs, and physically perfect current shelf rows). v0.56 retains old saves, original 3,000 figures, optional Low FX and v0.55 rollback. The optional grand finale remains Phase 6.4; completing the current Perfect Bazaar does not block interaction or force credits. This is a status update only, not a creative-scope change. Phase 6.2 automated acceptance PASSED: [safety regression suite](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42234976174), [mobile WebKit gameplay](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42234976098), and [GitHub Pages deployment](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42234976680). Linux WebKit is not physical iPhone hardware, and no player testing is required. **Next development stage: Phase 6.3 — 30 authored achievements.**

### Phase 6.3 implementation update · November 6, 2026
Thirty Little Legends is implemented with exactly thirty named collector challenges: 8 collection, 7 restoration, 5 sorting, 6 decorating, and 4 oddities. Each medal is rooted in actual shop progress, with an optional bounded achievementData history under the existing save version 1 for witness-only events. Historical saves automatically earn verifiable state medals, not fabricated actions. Medals remain permanent after decoration sacrifices. v0.57 has standard and Low FX parity and v0.56 fallback; automated unit/WebKit acceptance and Pages deployment passed. The next locked stage remains Phase 6.4. No creative scope change or player QA requirement.

### Phase 6.3 acceptance · November 6, 2026
All historical and new unit checks passed, including 30 authored medals and save-schema integrity. The real mobile-shaped WebKit browser acceptance passed on the merged game commit f348d41, including actual shelf swapping, save/reload persistence and Low FX. GitHub Pages deployment completed successfully. Evidence: [main safety regression suite](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42244628713), [main mobile WebKit gameplay acceptance](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42244628703), and [GitHub Pages deployment](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42244628135). Physical iPhone hardware remains separate and does not require player testing. **Next: Phase 6.4 — exclusive Collector's Monument and optional finale.**

### Phase 6.4 implementation update · November 6, 2026
The v0.58 Collector's Monument is a unique, non-purchasable multi-tier pixel-art installation fixed to the east entrance alcove, rendered using the existing first-person projection without an additional atlas, figure ID, decoration slot or collision trap. Its permanent unlock is the already-earned Perfect Bazaar medal, requiring 300 perfectly sorted rows and all 3,000 original figures physically shelved together. Its four-chapter cinematic never opens automatically; Next, Skip, Replay and Return are available. Decoration sacrifices cannot remove the monument. Older save version 1 files remain valid with only an optional strictly validated finaleViewed boolean. Standard and Low FX preserve feature parity and v0.57 remains a fallback. Automated acceptance and Pages deployment passed; next Phase 6.5. Creative scope unchanged, no player QA required.

### Phase 6.4 acceptance · November 6, 2026
All existing and new Node safety suites passed on main at v0.58. Mobile-shaped Linux WebKit gameplay acceptance passed on both standard and Low FX, including a genuine historical fully perfect shop, voluntary 4-chapter finale and skip/replay/return, save/reload permanence, post-sacrifice monument, and inventory integrity for the original 3,000 figures. GitHub Pages deployment passed. Evidence: [safety regression suite](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42248752204), [mobile WebKit gameplay acceptance](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42248752085), and [GitHub Pages deployment](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42248751490). This does not certify physical iPhone hardware, but player testing is never required. **Next: Phase 6.5, optional post-completion activity.**

### Phase 6.5 implementation update · November 6, 2026
The optional Collector's Encore is implemented in v0.59. It unlocks only after the game's existing permanent Perfect Bazaar medal was genuinely earned, then remains available even after voluntary decoration sacrifices scatter figures again. The read-only progress dashboard shows 300 physical shelf rows, 3,000 figures and actual décor ownership, with an at-most-six-collections restoration notebook prioritizing recorded decoration sacrifices; it never reveals positions of loose or hidden figures. Players can choose any restore target, open the real Collection Almanac checklist, pin it, jump to an actual occupied shelf on the map, or voluntarily browse the existing Sacrifice Catalog. New save keys, currencies, gameplay timers, achievements, auto-sorting, repeatable dirt, resets and customer loops remain prohibited. v0.58 rollback retained; CI and Pages acceptance passed. Next: Phase 6.6.

### Phase 6.5 acceptance · November 6, 2026
All historical and new Node safety regressions passed on merged main commit 094e42c. Touch-browser mobile WebKit acceptance passed in both normal and Low FX with a real 3,000-figure audit, voluntary décor browsing without purchase, live scattered-set notebook, map/checklist navigation, persistent pins and bounded six-card paging. GitHub Pages deployment passed. Evidence: [safety suite](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42256930313), [mobile WebKit acceptance](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42256930433), and [GitHub Pages publication](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42256930320). This does not certify physical iPhone hardware; developer-owned QA suffices. **Next phase: 6.6 — Showcase/photo mode.**

### Phase 6.6 implementation update · November 6, 2026
The final locked milestone is implemented on the v0.60 development branch. Showcase Mode can be opened during normal play only: it hides the HUD, freezes movement, figurine interactions and store edits, and allows smooth pixel-art camera aiming. On exit it restores the exact original physical player pose; auto-saving while in Showcase preserves that underlying pose. The native full-renderer screenshot makes a 960×540 PNG, and the optional on-demand 760×900 overhead pixel-art view is drawn from the real forty fixtures, original 300 shelf rows, actual placed decorations, and player position without revealing loose figurine locations. PNGs use the device share sheet where supported, otherwise download locally. Main and Low FX, reduced-motion safe UI, v0.59 offline rollback, and full original save v1/data inventory are preserved. Automated safety/WebKit validation and Pages publishing pending. This phase closes the original creative roadmap only after acceptance; further development must preserve the established world aesthetic and player ownership of saves.
