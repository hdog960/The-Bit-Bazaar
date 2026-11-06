# Bit Bazaar v0.48.0 — Sacrifice purchases respect save recovery (Phase 4)

## Fixed

The previously added `BitBazaarSaveHold` protects normal autosaves after a failed 3,000-figure integrity check, but a Sacrifice Catalog purchase still wrote `bit-bazaar-save-v3` directly. That let the player bypass the hold and potentially displace a healthy last-known save. This release closes that hole in both iPhone game builds.

- **Fail closed while recovering:** a purchase is blocked before selecting random shelf rows if save recovery or a file import is active. A prominent warning appears in the Sacrifice Catalog, and claim buttons are disabled. The player can recover with a known-good JSON backup before buying art.
- **Validate the live shop before scattering:** using the exact existing save validator and on-demand independent physical audit, a purchase checks the live 60-face/3,000-figure ledger and all physical figure identities. A corrupt live state activates the same autosave quarantine instead of committing a risky purchase.
- **Validate the candidate transaction before storage:** the proposed result must preserve unique figure identities, exactly remove the purchased number of perfect rows and corresponding figures, permanently add only the decoration, retain lifetime mastery and hidden reveals, and add the returned figure positions. An invalid candidate does not overwrite the save or move any figure.
- **Quota failure remains atomic:** if localStorage cannot commit, the live shelf rows and decoration ownership are unchanged. The existing pre-first-sacrifice backup remains supported.
- **No gameplay economy changes:** the cost remains **1–20 currently perfect rows**; all 180 original artworks and 232 mounts remain. The 300 unique sets, 3,000 individual figures, 60 faces, 45 permanent floor messes, 18 hidden discoveries, and `bit-bazaar-save-v3` format are unchanged.
- **New regression:** `tests/phase4-v048.test.cjs` covers quarantine, corrupted ledger, failed independent audit, invalid candidate, browser quota failure, and a successful two-row purchase returning exactly 20 pre-existing figurines. Historical tests remain in GitHub Actions; v0.47 and older assets remain accessible.

## Roadmap / acceptance

**Phase 4 — Final QA, not signed off.** The new guard is code-level and automated-test coverage, not a substitute for on-device iPhone testing. Real Safari/Home Screen playthrough with a crowded gallery and a real Save to Files / Restore File roundtrip is still needed before Phase 5 — The Coward's Glasses.

## Source

Active: `assets/decor-runtime-v0.48.js`, `game-v0.48.0.js`, `game-v0.48.0-lowfx.js`. Regression: `tests/phase4-v048.test.cjs`.
