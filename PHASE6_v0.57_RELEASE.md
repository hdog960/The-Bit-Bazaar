# Bit Bazaar Phase 6.3 — Thirty Little Legends (v0.57.0)

## Status
Implementation ready for GitHub Actions on a development branch. Not accepted or deployed until automated tests pass and main is updated.

## Thirty authored, permanently earned medals
- **Collection (8):** Discovery from one through 3,000 real figures; mastering the first, 150th, and 300th named sets.
- **Restoration (7):** Fully cleaned shelf faces, completed type-specific floor messes and 18 genuinely hidden figures.
- **Sorting (5):** A fully populated but misordered row, correctly repairing it, performing an actual held-figure swap, ten currently perfect rows and 300 simultaneous perfect shelves.
- **Decorating (6):** Original décor ownership, real placement, selecting a free honor finish and genuinely repairing a set scattered by a successful Sacrifice Catalog purchase.
- **Oddities (4):** Unlocking Coward's Glasses, actually equipping and then removing them, and pinning a collection in the Almanac.

All/earned/locked filters, accessible progress, named pixel-symbol medals and a compact mobile HUD shortcut appear inside the Collection Almanac.

## Data and integrity
- The original 3,000 figurines, 300 sets, 60 shelf faces, 45 floor messes, 18 original hidden figures, 180 authored decorations and 232 mounting sites stay unchanged.
- The version 1 bit-bazaar-save-v3 payload supports an **optional bounded achievementData object** containing permanent medal IDs and event witnesses, with strict ID, range and duplicate validation.
- Older saves without this field remain valid and automatically earn only milestones provable from the original saved shop; no invented swaps, repaired disordered rows, sacrifice restores or glasses actions.
- Medals never disappear after earning them. Sacrifice purchases may scatter 10–200 real figures but cannot revoke awards; a true re-perfection of a sacrificed set earns its dedicated medal once.
- Both main and Low FX use the same achievements and save validator, with history inspections on gameplay changes, not inside the visual frame loop. v0.56 historical builds remain available.
- No timers, currencies, resets, customer interactions, multiplayer, generated duplicates, or large new textures.

## Automated tests
- tests/phase6-v057.test.cjs validates 30 unique authored records, five category quotas, event-only evidence, unknown ID rejection, real unsorted-to-perfect repair, true sacrifice-to-repair, permanence, both game engines and new mobile pages.
- tests/browser-phase6-achievements.mjs runs mobile 390×844 Linux WebKit touch viewport with disposable synthetic saves, 30 medal cards and filters, 18 historically provable endgame medals, actual shelf swap, save/reload persistence, 3,000-figure inventory audit, strict malformed save rejection and Low FX rendering.
- Every previous Phase 4/5/6.1/6.2 regression remains in CI. Linux WebKit isn't a physical iPhone, but hardware QA isn't a user task or blocker.

## Next
Phase 6.4 — exclusive Collector's Monument and optional finale, followed by 6.5 optional postgame and 6.6 showcase/photo mode.
