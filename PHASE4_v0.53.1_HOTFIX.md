# The Bit Bazaar v0.53.1 — Hotfix: restore all 180 artworks at runtime

**Detected by developer-owned WebKit browser testing, not a player report.**

The deployed v0.53 page loaded `assets/decor-art-v0.37.js` **before**
`assets/decor-sites-v0.36.js`. The final 20-original-art script requires
the 232 mounting sites created by the latter file. In a real WebKit browser it
threw an initialization error, leaving the working in-game catalog at
**160/180** despite the file passing historical standalone unit tests.

This hotfix corrects the dependency order in `index.html`, the full preview
and Low FX fallback: sites-v0.36 now initializes immediately before the
final 20 artworks. The underlying artwork asset and the append-only 232
mount IDs are unchanged. `sw.js` moves to cache version **0.53.1**, and the
main page requests that new worker so existing Safari/Home Screen users can
receive the corrected shell. The gameplay engines and save key
`bit-bazaar-save-v3` are unchanged.

The new `tests/catalog-loading-v0531.test.cjs` checks every live/archived
entrypoint's exact module order and PWA cache bump. The new **real WebKit**
browser acceptance also asserts all 180 catalog entries, 232 display mounts,
save/import/undo with synthetic data and crowded art rendering.

All testing is owned by developer/CI. No phone test or File action is needed
from the player to continue Phase 4 or begin Phase 5. Linux WebKit does not
certify every physical iPhone behavior; it *does* detect the live script-order
regression that the old Node tests did not catch.
