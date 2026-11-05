# Bit Bazaar v0.47.0 — Validate before saving (Phase 4)

**Fix:** v0.45 verified-backup actions first wrote the live scene, then validated its shelf ledger and physical figure audit. A corrupt live scene could therefore overwrite a previously healthy local save *before* verification warned the player.

This release adds a read-only `snapshotNow` QA API in both normal and Low FX engines, validating the exact `bit-bazaar-save-v3` data and all 3,000 physical figurines **before writing**. If the audit fails, it **pauses ordinary autosaves** to protect the previous saved shop, and displays a warning. A successful recheck lifts that quarantine. Importing a known-good Files JSON or using prior-file recovery remains available even when the damaged live scene is quarantined, without saving the damaged scene first.

After a valid audit, one save is written and byte-for-byte compared with the validated JSON. A mismatch fails closed and attempts to restore the prior on-device snapshot. Browser storage quotas are reported separately from collection corruption.

**Offline improvement:** The new service worker will only activate if all core game files precache successfully; archived fallback versions remain optional.

**Tests:** New `tests/phase4-v047.test.cjs` covers invalid shelf rows, physical-audit mismatch, held autosaves, rejected exports and native sharing, quota failure, persistent snapshot mismatch, and recovery with an existing JSON while held. Original artifacts, costs, 180 decorations, 232 hooks, 3,000 figurines, 300 sets, 60 faces, 45 floor messes and 18 hidden finds are untouched.

**Phase 4 is still in hands-on QA.** Real iPhone dense-gallery performance and Files save/restore must pass before Phase 5 Coward's Glasses begins.
