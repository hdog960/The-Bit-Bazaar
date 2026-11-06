# Bit Bazaar Phase 6.6 — Showcase & Photo Mode (v0.60.0)

## Status
**Accepted and deployed on November 6, 2026.** The merged main gameplay commit 13bb1de passed [safety regression suite](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42278820428), [mobile WebKit browser acceptance](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42278820417), [GitHub Pages deployment](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42278819463). Linux WebKit touch simulation does not certify an actual iPhone. No player QA is required.

## Photo studio in the real shop
During normal gameplay, the new compact ▣ Photo Mode button (or P on a desktop keyboard) enters an optional non-interactive view. All existing HUD, reticle, cleaning effects, movement controls and in-world context prompts disappear. Finger dragging smoothly aims the original pixel-art perspective camera while walking, pickup, cleaning, swaps, décor edits and spending are suspended. Escape or Return to Shop restores the original exact camera and player position. Even if the game autosaves while composing a shot, the saved position is the true pre-photo pose. Photo Mode is blocked while another drawer, editor or incomplete save recovery is active.

The mode exports a real PNG image, not a text-only imitation:
- **First-person photo:** 960 × 540 nearest-neighbor (2×) rendering of the original 480 × 270 first-person shop canvas. No invented imagery, new gallery sprites or remote AI images.
- **Overhead portrait:** an original 760 × 900 pixel-art panorama drawn on demand from the *actual* twenty double-sided floor shelf fixtures, twenty wall shelf fixtures, the five rows per face, cleaning state, progress, currently installed artwork and real player position. The poster shows 3,000 / 300 physical collection tallies while respecting the locked shop map.
- A Share / Save PNG control uses the iPhone native share sheet for actual images when supported, falling back to a local browser download on other devices. No upload, account, third-party service or multiplayer dependency.

The overhead illustration is distinct from the interactive Store Map and does not reveal floor figure locations, hidden figures or unrecovered collectibles. The player's décor choices are seen only when actually placed.

## Original gameplay preserved
There are no new save fields or changes to the original bit-bazaar-save-v3 version 1 schema. All 3,000 original figures, 300 named collections, 60 shelf faces, 45 permanent floor cleaning tasks, 18 hidden originals, 180 authored decorations, 232 art sites, 30 achievements, Three Journeys, Coward's Glasses, lifetime honors, Collector's Monument, optional finale and post-completion Encore stay intact. Photo Mode spends nothing and never reorders or moves a figure. Full and Low FX use the same module, with previous v0.59 files retained for fallback. It pauses unneeded world frames when the overhead poster is visible to avoid iPhone overhead.

## Developer-owned acceptance
- tests/phase6-v060.test.cjs checks physical 3,000-piece and 300-row overhead accounting, camera easing across a 180° wrap, artistically authored canvas framing, generated PNG dimensions, no source-state mutations, both engines, no photo save schema and old-build rollback.
- tests/browser-phase6-showcase.mjs runs the same game through real headless mobile-shaped WebKit: touch/keyboard view, hidden HUD, frozen movement/pose preservation, full and overhead pixel PNG generation, local browser download, original 3,000-piece fully shelved store, Low FX parity and bounded memory.
- Every prior Phase 4, 5, 6.1–6.5 test stays in CI. Real iPhone hardware inspection remains optional, never required from the player.

## Roadmap
This is the final locked Phase 6 milestone. Phase acceptance requires successful automated tests and GitHub Pages publication. Future expansion or balancing is separate from the locked six-phase roadmap.
