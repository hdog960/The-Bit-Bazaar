# The Bit Bazaar — v0.49.0

## Phase 4 startup recovery: never erase an unreadable existing save

**Problem found:** Until v0.48, `restore()` treated invalid or malformed saved JSON exactly like a fresh installation: it called `resetState()`, which normally writes a brand-new shop to `bit-bazaar-save-v3`. A transient or corrupted on-device save could therefore destroy the original data without the player's permission.

**Fixed in v0.49:**

- New read-only `assets/boot-recovery-v0.49.js` distinguishes truly new installations (neither current nor legacy key exists), valid legacy 20-face saves, valid current 60-face saves, and malformed/unreadable existing data. The check never modifies the saved bytes.
- If existing data cannot be restored structurally, both iPhone engines immediately set `BitBazaarSaveHold=true`, initialize only a temporary in-memory scene, and display a full-screen **SAFE RECOVERY** interface. No normal autosave, Sacrifice Catalog purchase or automatic fresh-game reset may overwrite the original key.
- The recovery interface offers **Restore Verified Save From Files**, **Restore Previous Import** (only when a valid previous backup exists), and **Download Unreadable Raw Data** to a text file for troubleshooting. The raw text file is explicitly not represented as a playable backup.
- **Start new shop** is an explicit last resort, hidden inside a collapsible section and protected by two separate confirmation dialogs before the existing current and legacy game keys are deliberately cleared.
- File restore in `assets/save-manager-v0.49.js` now preserves a valid previous-import undo backup when the current storage contains unreadable JSON. The unreadable original is archived verbatim under `bit-bazaar-v3-unreadable-raw-backup`; an occupied archive containing different data is not silently replaced. A failed archive write aborts restoration rather than claiming success.
- The `bit-bazaar-save-v3` schema and all prior saved game data remain unchanged. Historic v0.48 and older assets remain present.
- Automated regression `tests/phase4-v049.test.cjs` checks fresh/legacy/current startup, damaged JSON and shelf geometry, no destructive storage writes, recovery overlay, raw download, validation and previous-import recovery, cancellation and double confirmation, preservation of last good undo during Files restoration, both game engines and PWA wiring.

## Original scope remains untouched

3,000 persistent figurines, 300 named sets, 60 shelving faces, 45 floor messes, 18 hidden discoveries, the 180 one-of-a-kind decorations, 232 mounting points, and the 1–20-perfect-row Sacrifice Catalog economy remain as designed. No customers or merchant mechanics were introduced.

**Roadmap status:** Still Phase 4 final QA. A real iPhone test of recovery, Save to Files/Restore File and dense-gallery performance is necessary before signoff. Phase 5 — The Coward's Glasses — remains locked.
