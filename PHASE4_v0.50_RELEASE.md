# The Bit Bazaar — v0.50.0

## Phase 4 final QA: deep, read-only startup save validation

**Resolved risk:** The v0.49 startup guard distinguished a fresh game from malformed JSON or broken outer arrays, but a saved shop with valid top-level geometry and inconsistent figures, slots, ground positions, decoration ownership, or lifetime milestones could still be loaded, sanitized, and sometimes rewritten. This release validates real current-format saves **before any game restoration, migration, or autosave**.

### Changes

- **Full modern-save preflight.** `assets/boot-recovery-v0.50.js` invokes the existing strict validator from `assets/save-manager-v0.49.js` for every complete 60-face save. It checks unique figure identities, row/slot agreement, held and dropped duplicates, hidden reveals, cleaning, player coordinates, lifetime mastery and actual art ownership/mounts. A failure activates the already-built Safe Recovery overlay and `BitBazaarSaveHold`, **without altering original on-device bytes**.
- **Legacy migration protected, not disabled.** Genuine 20-face/1,000-figure saves and older 60-face saves missing fields introduced later are inspected using a temporary normalized *read-only* schema. Duplicate or mixed figures, bad slot mappings, ground collisions and malformed present fields are rejected; absent optional old fields receive temporary defaults only for validation. The original historical save is then passed through the existing non-destructive migration. No persistent format changes.
- **Existing recovery experience retained.** Players can restore a Files backup, recover the previous import, download raw unreadable data, or deliberately reset after two confirmations. A corrupt but superficially normal save no longer silently becomes a partial collection.
- **Regression:** `tests/phase4-v050.test.cjs` covers valid modern shops, invalid row/slot identities, duplicates between shelf/ground/tote, wrong decoration ownership, invalid achievements, cleaning/player corruption, old 20-face/60-face migration, historical duplicates, unchanged localStorage bytes, normal/Low FX pages, and service-worker dependencies.
- **All existing game systems untouched:** 3,000 individual figures / 300 sets / 60 shelf faces / 45 floor messes / 18 hidden finds; 180 handmade decorations / 232 anchors; 1–20-perfect-row Sacrifice Catalog; original save key `bit-bazaar-save-v3`; previous release fallback.

**Roadmap:** Still **Phase 4 — final hands-on QA**. A real iPhone test of dense gallery rendering plus verified Save to Files and Restore File is still necessary to sign off. **Phase 5 — Coward's Glasses** remains locked until those conditions pass. Automated green checks cannot establish actual iPhone Files-app behavior.
