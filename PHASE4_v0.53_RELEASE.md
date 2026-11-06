# The Bit Bazaar v0.53.0 — Check a Files backup without restoring (Phase 4)

## Why this matters
Until v0.52, the Collection Almanac could create verified JSON backups and restore them, but a player could not re-open a file saved to the iPhone's **Files app** and prove that Safari could read it without **replacing their live shop**. That made the acceptance test riskier than necessary.

## New working in-game flow
The Collection Almanac's **YOUR SHOP · SAVE PROTECTION** now includes a **CHECK BACKUP FROM FILES · NO RESTORE** button, distinct from the destructive **RESTORE FILE** button. The new `checkBackupInput` picker accepts the same original JSON and wrapped `bit-bazaar-save-backup` format as the restore action.

`assets/save-manager-v0.53.js` checks the selected file's 3 MB safety limit, parses it, and runs the same strict `validate()` checks that ensure figure identities, shelf/slot placement, hidden discoveries, cleaning, owned/mounted decoration artwork, lifetime achievements, and player coordinates are consistent.

When possible, it compares the selected valid backup to a **read-only live snapshot**. Feedback distinguishes three cases:

- **Exact match with open shop:** the selected file and running game have identical serialized progress.
- **Valid file but different from open shop:** older or alternate progress; still a valid backup, not a corrupt file. Never imported automatically.
- **Valid file; comparison unavailable:** e.g., open game cannot supply a valid read-only snapshot. Still does not write the current game.

A malformed, unsupported, or oversized file shows **FILE CHECK FAILED** with no save, import, reset, reload, or recovery-quarantine side effect. The selected file is not uploaded, stored in a plugin, or sent to a server. The file check retains only its last transient result in RAM until the next file selection. The original key `bit-bazaar-save-v3` and all other backup keys are unchanged.

### Acceptance boundaries
This verifies a file can be selected, read and checked *on the user's actual iPhone*. It does **not** certify the complete **Restore File** overwrite/reload process and does **not** by itself certify the app's dense-gallery frame rates. Phase 4 remains open until hands-on dense-art performance, Save to Files and the restore-and-undo workflow are tested.

### Regression
`tests/phase4-v053.test.cjs` covers wrapped and raw JSON, exact/different/read-only-unavailable comparisons, corrupted inventory, unsupported files, over-size rejection, button and picker routing, status messages, zero save writes, zero imports, zero reloads, and both normal/Low FX iPhone entries. Earlier regressions and archived v0.52 builds remain available.

**Preserved:** all 3,000 original collectible figures across 300 sets and 60 shelf faces, 180 decorations, 232 mounting points, 45 floor messes, 18 hidden finds, original row-sacrifice economy and complete legacy recovery infrastructure. Phase 5 Coward's Glasses remains locked.
