# Bit Bazaar Phase 6.2 — The Three Journeys (v0.56.0)

## Status
ACCEPTED on November 6, 2026. The actual v0.56 implementation, historical regression checks, mobile WebKit browser acceptance, and GitHub Pages all passed at commit 172a567: [safety regression suite](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42234976174), [mobile WebKit gameplay](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42234976098), and [GitHub Pages deployment](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42234976680). This certifies automated checks, not physical iOS hardware.

## Three real gameplay journeys
- **The Restorer:** Complete cleaning on all **60 shelf faces**, all **45 permanent floor messes**, and recover all **18 original hidden figurines**. Each floor mess counts only after its type-specific final cleaning step.
- **The Archivist:** Perfect **300 distinct named sets at least once**, based on existing lifetime mastery IDs. Unordering or sacrificing completed shelves does not revoke lifetime mastery.
- **The Perfect Bazaar:** Have **all 300 rows perfectly ordered 1–10 simultaneously**, with **3,000 real figures shelved and an empty hand**. This status can become incomplete after voluntary decoration sacrifices.

All three are derived from existing state, not new achievement counters. The Almanac contains a themed status board with progress bars and a touch shortcut in the HUD. Journey completion notices trigger on new transitions, not in a render loop.

The old automatic blocking victory modal is no longer triggered at 300 rows. The full optional finale and Collector's Monument remain planned for Phase 6.4. Store interaction and decoration purchases remain available after a perfectly sorted shop.

## Compatibility
- No save schema migration. Same bit-bazaar-save-v3 version 1 JSON payload, backup/import and recovery procedure.
- Exactly 3,000 collectible IDs, 300 named sets, 60 faces, 300 rows, 45 one-time messes and 18 originals hidden in dirt.
- Archived v0.55 remains playable and is included as optional service-worker fallback.
- Standard and Low FX share identical journey status integration. Journey computations happen on shop updates or opening the Almanac, not every rendered frame.
- All 180 authored decorations, 232 mounting sites, prior honors and Coward's Glasses remain unchanged.

## Automated QA
- New phase6-v056 unit tests verify three journey gates, partial cleanup, permanent mastery, sacrifice reversibility, strict all-current-perfect requirements, actual UI markup and both game engines.
- New browser-phase6-journeys WebKit touch test uses an isolated 390×844 synthetic save profile and checks 0/3, 1/3, 2/3, 3/3, physical figure integrity, the nonblocking 300-row condition and Low FX.
- All existing Phase 4/5/6.1 regressions remain in GitHub Actions. Linux WebKit does not certify actual iPhone hardware behavior; player QA is optional and never blocks development.

## Next
Next: Phase 6.3, the 30 authored achievements, then Phase 6.4 Collector's Monument and finale, Phase 6.5 optional postgame and Phase 6.6 showcase/photo mode.
