# Bit Bazaar — Post-Roadmap v0.61: Collector Postcards

## Status
Implemented on isolated development branch; acceptance requires all historical Node safety regressions, new mobile WebKit tests and GitHub Pages deployment.

## Original artistic expansion
The accepted six-phase roadmap ended at v0.60. This is a separate optional polish feature, not a revision to the locked collecting rules. Photo Studio gains a FRAME button with four freely selectable styles:

- ORIGINAL PHOTO preserves the exact original first-person 960x540 PNG or overhead 760x900 PNG.
- HEARTHWOOD KEEPSAKE introduces a warm-bronze, weathered-wood 16-bit collector border.
- MIDNIGHT CABINET introduces mint-and-purple archival pixel detailing.
- COLLECTOR'S CROWN adds an exclusive-looking but freely selectable gold and mauve commemorative treatment.

Framed first-person photos become 1056x740 PNGs; framed overhead portraits become 856x1100 PNGs. The photo pixels inside each are taken from the actual game canvas using nearest-neighbor drawing. The frame includes a title, hand-inked corners and four strictly bounded truthful totals: figures physically shelved out of 3,000, rows currently perfect out of 300, collections mastered at least once out of 300, and real owned artwork out of 180. No figures, lore or undiscovered locations are revealed beyond what the player legitimately knows.

The Photo Studio presents a border preview and retains the existing native iOS Share Sheet or download support. A four-control two-column mobile layout preserves large iPhone touch targets. The File-object-free PNG fallback is also protected. Frame selection is temporary: Original Photo is the default each session.

## Safety and continuity
No save fields or schema changes. The version 1 bit-bazaar-save-v3 game save stays fully compatible. There are no new figures, money systems, customers, automatic sorting, timers, prestige resets, additional cleanup or progression rewards. The original 3,000 unique figures, 300 named sets, 60 display faces, 45 floor messes, 18 original hidden figures, 180 authored decorations, 232 art sites, nine lifetime honors, three Journeys, 30 achievements, optional finale, Collector's Monument and Encore remain intact.

The main and Low FX engines use the same small canvas-only postcard compositor, and the previously verified v0.60 scripts remain present and offline-eligible. The live engine's slow-render recovery route is updated to the matching v0.61 Low FX build.

## Developer-owned acceptance
- New tests/postroadmap-v061.test.cjs verifies all four options, old unframed pixel identity, original source pixels inside each new border, PNG dimensions, factual statistics, nonmutation, main/Low FX parity, and old-build rollback.
- New tests/browser-postcards-v061.mjs runs real 390x844 headless WebKit in both engines, cycles every frame, samples actual canvas pixels and PNG output, verifies iPhone browser download fallback without File, and audits original save and figure integrity.
- All historical Node and WebKit checks from Phases 4-6.6 remain in CI. Linux WebKit is not physical iPhone hardware. The player is not responsible for testing.

## Canonical roadmap
MASTER_ROADMAP_LOCKED.md remains unchanged and complete. Further post-roadmap enhancements must be versioned separately.
