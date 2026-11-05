# Bit Bazaar v0.46.0 — Phase 4: Storage-Failure-Safe Decoration Editing

**Status:** Phase 4 final QA; Phase 5 Coward's Glasses remains locked.

This release fixes a state consistency issue in four no-cost customization paths. Unlike the atomic Sacrifice Catalog purchase, the old free move/store/fine-position and room-finish actions could change active art and report success even if Safari refused the browser save.

- **Move art:** attempts save after updating current placement, but if save fails (including a thrown quota error), restores the exact original location and custom offset; no success notification.
- **Store art:** preserves permanent ownership, mounting location, and hand-tuned position when save fails. A successful store still clears mounting and offsets while keeping ownership.
- **Precision workshop:** keeps the previous committed adjustment intact and retains the new draft for retry/cancel on failed save. The same historical five-integer save tuple is used.
- **Room finishes:** restores previous committed room materials on save failure, keeping the selected draft and walk-around preview available. Only successfully committed changes close the preview.
- **Tests:** `tests/phase4-v046.test.cjs` checks false and thrown storage failures, exact rollback, retries, permanent owned-art invariants, the original saved data structure, current and Low FX shells, and offline cache.
- **Preserved:** 180 original decorations and 232 anchor points; all 3,000 figures across 300 sets and 60 shelf faces; 45 floor messes and 18 hidden discoveries; existing save key `bit-bazaar-save-v3`; old build and export/import tools.

Hands-on iPhone Files backup/import and dense-gallery performance inspection are still needed for Phase 4 acceptance. Automated checks do not substitute for real-device signoff.
