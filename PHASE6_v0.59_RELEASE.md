# Bit Bazaar Phase 6.5 — The Collector's Encore (v0.59.0)

## Status
**Accepted and deployed November 6, 2026.** The merged main gameplay commit 094e42c passed [safety suite](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42256930313), [mobile WebKit acceptance](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42256930433), and [GitHub Pages publication](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42256930320). Linux WebKit is not an actual iPhone hardware certification. Player testing is never a release requirement.

## One more chapter, entirely on the player's terms
Once the existing Perfect Bazaar achievement has been permanently earned, the collector may open a new, optional **Collector's Encore** from the mobile HUD or the Collection Almanac. It is never a victory interruption or a required quest.

The Encore is a lightweight planning and navigation notebook for the already-existing postgame: keep a perfected shop, buy new pieces from the 180-item Sacrifice Catalog with the established perfect-row sacrifice price, voluntarily re-sort scattered figures in the physical store, and continue admiring/restyling your displays.

The dashboard derives its numbers from genuine saved shelf slots and existing owned decoration records. It shows the **300 currently perfect rows**, **3,000 original figures physically shelved**, actual **owned artwork**, and **previously perfected collections still unfinished**. Its restoration notebook prioritizes set IDs that are already recorded as legitimately scattered by a decoration purchase in the Phase 6.3 achievement history. Other previously mastered sets that are not currently ordered can also be revisited, but are never mislabeled as a decoration sacrifice.

Players can:
- Open the original collection checklist for a specific unfinished set.
- Pin or unpin that set using the existing collector hunt tracker; the pin still saves normally.
- Jump to the real shelf location on the existing store map, **only when a physical row has actually been started**.
- Open the existing Sacrifice Catalog and choose whether to acquire or move art; merely browsing causes no purchase, scattering or movement.
- Open the physical store map to find their next sorting destination.

The notebook renders **at most six target cards per page** for iPhone performance. There is no guessing or revealing locations of loose figures, no generated extra figurines, no unearned awards or shortcuts that automate 1–10 ordering. If every row is perfect, the optional panel simply celebrates that condition and leaves the decision to decorate again entirely to the player.

## Compatibility and integrity
- The only unlock is the existing permanent "perfect-bazaar" medal (all 300 rows physically perfect simultaneously with all 3,000 figures shelved at least once). **300 lifetime mastered sets alone are insufficient.**
- All 3,000 original unique figurines, 300 named sets, 60 shelf faces, 45 floor messes, 18 original hidden figures, 180 authored decorations, 232 display mounts, nine original milestone honors, thirty achievement medals, and the exclusive Collector's Monument remain intact.
- This phase adds **zero save fields**. The original bit-bazaar-save-v3 version 1 save, original recovery/backup tools, personal pins, original decoration sacrifice and continuing collection play remain authoritative. There is no prestige, new currency, mandatory repeat, customer activity, timer or mandatory quest.
- Both the full and Low FX renderers expose equivalent optional controls; the prior verified v0.58 scripts and offline fallback remain retained.

## Developer-owned automated verification
- tests/phase6-v059.test.cjs covers locked/earned states, 300 lifetime vs 300 simultaneous physical rows, 3,000-figure accounting, exact 1–10 slot checking, prioritization of legitimate pending sacrifice restoration, six-card pagination, safe names and physically grounded shelf navigation, nonmutation of source state, and full/Low FX parity.
- tests/browser-phase6-encore.mjs runs a 390×844 mobile WebKit touch browser with disposable original-dataset saves. It tests a completed shop, opening catalogue/map without a purchase, post-sacrifice restore priorities and map navigation, pin persistence across reload, 6-card pagination, bounded sprites and full inventory integrity in both engines.
- All historical Phase 4/5/6.1–6.4 regressions remain enabled. Linux WebKit is not the same as hardware iPhone testing; the latter is optional and never required of the player.

## Next locked stage
Phase 6.6 — HUD-free photo/showcase mode with smooth camera and optional overhead snapshot, no accounts or multiplayer.
