# CLAUDE HANDOFF — THE BIT BAZAAR
**Complete playable source + art + documentation transfer**

**Prepared:** November 6, 2026
**Game version:** v0.62.0 (post-roadmap Visual Integrity release)
**Canonical gameplay repository:** https://github.com/hdog960/The-Bit-Bazaar
**Canonical main snapshot:** `426b534372affd7e3f2ca8f0b674cb12ab7bec1c`
**Play URL:** https://hdog960.github.io/The-Bit-Bazaar/
**Package source:** The GitHub tracked files of that exact main snapshot plus this *handoff-only* document and a temporary packaging workflow. No gameplay modifications were made to the production branch during packaging.

## 0. Instructions for Claude: READ BEFORE EDITING
This is an actual existing playable game, **NOT a concept or invitation to rebuild it from scratch**. Open `index.html`, `MASTER_ROADMAP_LOCKED.md`, `POST_ROADMAP_DEV_LOG.md`, `VISUAL_INTEGRITY_v0.62_AUDIT.md`, `QA_AUTOMATION_POLICY.md` and `README.md`. Study the current code paths, historical tests, and original art before proposing or implementing changes. Continue from v0.62, not from old numbered prototypes.

The owner explicitly loves the game's current 16-bit first-person aesthetic. **Never replace it with blocky placeholders, new visual themes or unapproved style changes.** Preserve all player progress and the full finished gameplay loop. Do not imply that pictures/concept art are running gameplay. Report exact changes, real tests actually performed, and any limitations. Developer-owned automated QA: do not require player to perform testing as a gate.

**The original six-phase roadmap is COMPLETE**; do not restart it or invent an unfinished phase. Any further features are new, separately approved post-roadmap improvements. A previous assistant delivered v0.62; the latest accepted release is on `main`.

## 1. Core identity
- A cozy, first-person, deliberately handcrafted 16-bit pixel-art figurine collecting, cleaning, organizing and store-decorating experience for iPhone Safari and Add to Home Screen, playable on PC too.
- **NO customers, employees, sales, coin currency, conventional shop business loop, resupplying, mandatory timers, recurring messes or prestige resets.**
- Exactly **3,000 distinct figurines**, **300 uniquely named collections × 10 numbered pieces** each.
- **20 double-sided floor racks + 20 wall displays** = **40 physical fixtures, 60 usable shelf faces, 5 rows per face, 10 individually aimable slots per row**.
- Carry **only one figure at a time**. Center reticle picks up, places, swaps, rearranges or drops. Vertical aiming supported.
- A row can contain **one collection**, pieces can be inserted in any valid slot, but **only a strict left-to-right #1–#10 arrangement** counts as perfect.
- All 60 shelf faces start dusty for **new games**. Clean with empty hands before shelf placement. There are **45 persistent floor messes** and **18 concealed figures drawn from the existing 3,000**. No respawn; no dupes.
- Collection Almanac and accurate overhead store map; reveal no undiscovered/hidden figure positions.
- The Sacrifice Catalog has **180 bespoke decoration designs**, placed in **232 original mounting/placement sites**. Buying an item sacrifices a bounded number of currently perfect rows (1–20), scatters their real owned figurines collision-safely, and retains all permanent acquisition/achievement history. **No coins.**
- Optional **Coward's Glasses**, permanent unlock after **150 lifetime uniquely perfected collections**. A conspicuous "COWARD" overlay is mandatory whenever enabled. An arrow is available only for an already-started set; never a tracker for an unstarted set.
- Nine permanent lifetime milestones, The Restorer / The Archivist / The Perfect Bazaar completion journeys, **30 achievements**, the exclusive Collector's Monument, optional four-part finale and Collector's Encore.
- Optional photo studio with original first-person PNG, real overhead portrait, and v0.61 original/three 16-bit collector postcard frames; no accounts or multiplayer.

## 2. Non-negotiable preservation and data contracts
1. The genuine figure ownership/world ledger always represents each of the 3,000 original IDs **exactly once** in one of: shelved, held, loose on floor, or one of the still-concealed figures. Do not regenerate collections, silently drop IDs, or overwrite progress.
2. **Saved progress is critical.** Preserve original localStorage key **`bit-bazaar-save-v3`**, underlying saved version 1, historical migration/validator/recovery semantics, and portable backup/restore compatibility. Do not overwrite or delete an existing user's save when testing.
3. Keep `game-v0.61.0.js`, `game-v0.61.0-lowfx.js` and historical preview/fallback bundles available while changing v0.62.
4. Preserve BOTH current modes, regular and Low FX, with behavior parity. Avoid an iPhone freeze, unbounded caches, heavy texture atlases, excessive draw calls, and memory spikes.
5. Maintain original `480 × 270` logical canvas and nearest-neighbor art; source atlas `assets/figurines.png`, plus handcrafted color palette, shelf materials and UI, are accepted design. `style-v0.62.0.css` is byte-identical to accepted v0.61 CSS.
6. Original sprite cache budget **112** small canvases, adaptive ~20–24 FPS budget, bounded LOD/visibility and slow-frame Low FX fallback must be safeguarded.
7. Do not claim "bug-free on iPhone" based on Linux CI; Linux WebKit tests are not a physical device certification.
8. Do not introduce optional paid subscriptions, Vercel, or external services as prerequisites. Site is static and hosted on GitHub Pages.

## 3. Where the actual playable game lives
- `index.html`: current production entrypoint, loading the exact current JS/CSS dependencies in a deliberate order.
- `game-v0.62.0.js`: current normal playable first-person engine.
- `game-v0.62.0-lowfx.js`: current Low FX engine.
- `baseline-v0.62.0-lowfx.html`: low-FX fallback entrypoint.
- `style-v0.62.0.css`: accepted styling.
- `assets/collection.js`, `assets/collection-extension.js`: actual collection data.
- `assets/figurines.png`, `assets/optimized-sprites.js`: source sprites and bounded variations/cache.
- `assets/decor-*.js`, `assets/room-workshop-v0.46.js`: authored décor catalog, locations, preview, mounting/material systems and rendering. Respect load order.
- `assets/visibility-v0.62.js`: **physical shelf view, oriented collision/occlusion, near-plane projection and partial figurine clipping**.
- `assets/figure-integrity-v0.43.js`: figure accounting/inventory audit.
- `assets/save-manager-v0.58.js`, `assets/boot-recovery-v0.50.js`: save guard, recovery and import/export paths.
- `assets/cowards-glasses-v0.54.js`, `assets/lifetime-honors-v0.55.js`, `assets/journeys-v0.56.js`, `assets/achievements-v0.57.js`, `assets/finale-v0.58.js`, `assets/postgame-v0.59.js`, `assets/showcase-v0.60.js`, `assets/postcards-v0.61.js`: implemented progression/postgame/photo modules.
- `sw.js`: PWA/offline cache. Update its version/references carefully when publishing a new build.
- `manifest.webmanifest`, `icon.png`: installable game identity.
- `preview-v0.62.0.html`, numerous historical `preview-*.html`, `baseline-*-lowfx.html`, `game-v*.js`, `style-v*.css`: historical builds and rollback/debug references. **Retain these.**
- `.github/workflows/bit-bazaar-qa.yml`, `.github/workflows/bit-bazaar-webkit.yml`: ongoing regression and browser-acceptance gates.
- `tests/`: cumulative automated regression scripts and WebKit interactive browser test harness.

**Running locally:** Serve the extracted directory with a local HTTP server (do not assume `file://` supports service worker, fetching or shared storage). For example: `python3 -m http.server 4173` in the game folder, then open `http://127.0.0.1:4173/`. The shipped `tests/browser-server.mjs` is also available. The playable game needs no npm build, cloud backend or paid software. Playwright is required only to run the developer browser tests.

**Basic code QA:** `node --check game-v0.62.0.js`, `node --check game-v0.62.0-lowfx.js` and `node tests/visual-integrity-v062.test.cjs`; for the historical battery follow the explicit commands inside `.github/workflows/bit-bazaar-qa.yml`.

**Browser QA:** GitHub workflow `.github/workflows/bit-bazaar-webkit.yml` runs mobile-shaped Playwright WebKit at 390×844. It installs Playwright 1.56.1 and starts `node tests/browser-server.mjs`, then runs all `tests/browser-*.mjs` scripts enumerated there. Use isolated test storage, never the owner's localStorage.

## 4. Latest development: v0.62 Visual Integrity
The owner requested a **deep visual audit** rather than a redesign: no figures bleeding through shelves, no racks disappearing on near approach or from an acute angle, no broken/transparent assets.

The accepted patch:
1. Evaluates all actual rack footprint corners against camera frustum/near-plane rather than culling by center.
2. Uses real oriented shelf-slab segment occlusion: figures behind a shelf are hidden even when the shelf center is off the ray.
3. Clips figure sprites inside the physical projected shelf opening, including grazing angles.
4. Uses bounded partial billboard visibility against physical shelf edges for floor miniatures, both normal and Low FX.
5. Ensures the original figurine atlas is loaded before browser screenshot acceptance.

**Verified at release:** 268 WebKit camera/angle poses; 80 wall views; 20 real rack occlusion rays; original invisible-wall-corner regression; normal and Low FX screenshots; 3,000 figure ledger unchanged; no save changes. All historical safety checks and Pages deployment passed. Details: `VISUAL_INTEGRITY_v0.62_AUDIT.md`. Gameplay merge: `7b94083aad4b3ed75528e4c66ca98173488a8a1c`. Release/doc commit: `426b534372affd7e3f2ca8f0b674cb12ab7bec1c`. There was one non-deterministic WebKit browser-context closure on the documentation-only commit; retry PASSED unchanged. Do not misrepresent as proven perfect on physical iOS.

Release evidence:
- https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42304838843 (final safety)
- https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42304839344 (final WebKit, successful retry)
- https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42304837809 (final Pages)
- https://github.com/hdog960/The-Bit-Bazaar/pull/6 (renderer PR)

## 5. Documentation hierarchy and complete development history
**Creative canon:** `MASTER_ROADMAP_LOCKED.md`. All Phases **1–6.6 are accepted and complete**.
**Later work:** `POST_ROADMAP_DEV_LOG.md`, `POSTROADMAP_v0.61_RELEASE.md`, `VISUAL_INTEGRITY_v0.62_AUDIT.md`.
**QA/testing policy:** `QA_AUTOMATION_POLICY.md` (development team owns QA; player QA optional).
**Release evidence:** `PHASE4_AUTOMATED_SIGNOFF.md`, `PHASE4_v0.46_RELEASE.md` through `PHASE4_v0.53.1_HOTFIX.md`, `PHASE5_v0.54_RELEASE.md`, `PHASE6_v0.55_RELEASE.md` through `PHASE6_v0.60_RELEASE.md`.
**Long chronological notes:** `README.md` including older milestones and previous bugfixes.
**Regression history:** `tests/` and every historically archived versioned game/CSS/preview/fallback asset. The package includes **all git-tracked files**, not merely the active scripts.

## 6. Recommended approach after import (not a new roadmap)
1. Verify every file in this package is present, including `assets/figurines.png`, `assets/collection.js`, both v0.62 game engines, and all documentation.
2. Inspect `index.html` and actual scripts before modifying any part of the runtime. Avoid touching source art or unrelated systems.
3. Work only on the specific future change requested by the owner, and treat the existing 6-phase roadmap as closed.
4. Preserve ordinary/Low FX parity, existing state and rollback. Make small, reviewable commits.
5. Run JS syntax, historical tests, WebKit mobile gameplay, figure-ledger validation, close-range visual checks, and Pages deployment gates as appropriate.
6. State in every release what was *actually* changed, executed, tested and deployed; never claim unperformed visual/device tests.

## 7. Save and privacy note
This package contains the **game source**, public artwork, implementation/history documents and test fixtures. It cannot include a particular player's private iPhone localStorage progression unless that person has explicitly exported a game-save JSON and supplied it. **Never treat a missing personal save export as a reset instruction.**

## 8. Message to Claude
> This is my complete **Bit Bazaar v0.62** code-and-documents handoff. Please import and examine the real project first. Preserve its original 16-bit first-person aesthetic, 3,000 collectible figures, 300 sets, detailed placement and decorating, existing saves, Low FX, performance safety, and all finished features. The six-phase roadmap is complete; continue only with my next requested change. I want real source changes, not replacement concept art, and you must be exact about tests and deployment you performed. Never require me to perform QA just to proceed.

---
**Package integrity**: See `PACKAGE_MANIFEST.json` and `PACKAGE_CONTENTS.txt` included beside the source. The `.git` directory is excluded for portability; all historical **versioned files** tracked in the repository are included. The primary project repository and source commit hashes above provide full version-control provenance.
