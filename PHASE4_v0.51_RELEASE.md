# Bit Bazaar v0.51 — Transactional startup and legacy migration recovery

**Phase 4 final QA — not Phase 5.**

## Fixed: midway restoration failures could leave a partially reconstructed scene

The v0.50 boot validator checked incoming saved JSON before restoration, but a runtime failure during historical slot migration, artwork mounting, floor setup, or the final restored-state verification could still break the app after it started reconstructing the shop.

- **Both standard and Low FX engines now enter a save quarantine before rebuilding an existing shop**. Normal and page-hide autosaves remain blocked during loading. Earlier migration snapshots retain their historical filenames.
- The newly reconstructed 3,000-figure shop must pass the original `BitBazaarSaveTools.validate(saveData())` full-schema validator before autosaves can resume or a converted legacy save can be written.
- **Existing modern-format saves are not needlessly rewritten at startup.** An older-format save that genuinely needs migration is written once after validation. If the save fails (e.g., Safari storage quota), the game quarantines the scene and leaves the old saved source intact.
- **Unexpected exceptions are captured**: if art loading, floor setup, or post-restore validation throws, `BitBazaarSaveHold` stays enabled and the full-screen existing Safe Recovery interface opens. The player can choose a verified Files backup, previous-import undo or raw-data export, rather than being stranded on a partially restored screen.
- New `tests/phase4-v051.test.cjs` exercises the actual extracted production restoration routine for both engines, simulates failures at art installation, world setup, post-restore validation, and migration save, checks that zero save-key writes occurred and that the overlay targets the original saved source. It also exercises successful modern load without a write and successful one-time legacy migration.

No new save format, economy, decoration art, or world assets. 3,000 persistent figures across 300 numbered sets and 60 shelf faces, 180 unique decorative pieces, 232 mounts, 45 permanent floor messes and 18 hidden figures remain unchanged.

**Phase 4 signoff still requires a real-iPhone stress test in the user's own dense gallery and a verified Save to Files → Restore File roundtrip.** Phase 5 Coward's Glasses remains locked until acceptance.
