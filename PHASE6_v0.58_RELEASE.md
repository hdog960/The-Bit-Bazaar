# Bit Bazaar Phase 6.4 — Collector's Monument and Grand Finale (v0.58.0)

## Status
**Accepted and deployed on November 6, 2026.** All new and existing tests passed after merge into main (c144cfb): [safety regression suite](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42248752204), [mobile WebKit gameplay acceptance](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42248752085), and [GitHub Pages deployment](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42248751490). WebKit-on-Linux does not certify physical iPhone hardware, and no player QA is required.

## Exclusive Collector's Monument
A custom architectural pixel-art monument permanently appears in the **east entrance alcove** only after the collector first has **all 300 physical shelf rows perfect simultaneously** with the full **3,000 original figurines** shelved. The existing permanent Perfect Bazaar medal is the authoritative unlock. Mastering 300 sets over a lifetime does not meet this stricter condition.

The special display features a stepped engraved pedestal, gold trim, a sculpted crown, faceted 3D diamond and a commemorative 3,000-figure plate. It is drawn with the game's original perspective renderer: no new large sprite atlas, item ID, collisions, new currency, or full-screen performance cost during normal play.

This monument is exclusive and **never purchasable**. It is not included in the 180 Sacrifice Catalog decorations, their 232 available placement sites, or the existing 3,000 collectible figurines. Buying décor and re-scattering perfect rows cannot take away the earned display.

## Optional four-part cinematic
1. **From Dust** — Remember the shop that was buried beneath dust and cobwebs.
2. **Three Thousand Stories** — Celebrate the restoration of the original collection.
3. **The Perfect Bazaar** — Recognize the 300 perfectly arranged sets.
4. **The Collector's Monument** — Reveal the grand permanent reward.

The collector manually chooses Next, Skip to Monument, Replay Finale, or Return to Shop. It never auto-opens at completion; the player can keep collecting, buying artwork, cleaning and arranging as usual. The monument can be targeted with the central reticle, and a small mobile HUD shortcut can replay the finale any time after its permanent unlock.

There are no timers, mandatory credits, prestige resets or locks on postgame play. Under prefers-reduced-motion the optional screen effects stop.

## Save safety
The original bit-bazaar-save-v3 version 1 schema and all existing progression are retained. The only addition is a strictly validated optional finaleViewed boolean. It only records whether the final chapter was viewed, never whether the physical monument should unlock. The game retains all 3,000 unique figurines, 300 collections, 60 shelf faces, 45 once-only floor messes, 18 original hidden figures, 180 authored decorations, 232 placement sites, three Journeys and thirty unique achievements.

The standard and Low FX engines share the finale logic, renderer and validation. Archived v0.57 gameplay files and save manager remain present for rollback and are optionally precached for offline use.

## Automated acceptance
- New tests/phase6-v058.test.cjs checks the permanent medal-derived gate, four scenes, original projection drawing and reticle focus, invalid-viewed-value rejection, backwards-compatible saves, both engine versions and offline rollback.
- New tests/browser-phase6-finale.mjs runs a real headless 390×844 WebKit touch viewport and verifies no forced finale, four interactive stages, skip/replay/Escape/return, durable viewed credit across reload, permanent monument after voluntary sacrifices and 3,000-figure integrity in standard and Low FX.
- All previous historical Phase 4, 5, 6.1, 6.2 and 6.3 tests remain active. Linux WebKit does not certify physical iPhone hardware; the player is never required to test the build.

## Next
Phase 6.5 — optional post-completion play. Phase 6.6 — HUD-free showcase/photo mode.
