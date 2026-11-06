# The Bit Bazaar — Phase 5 v0.54.0, Coward's Glasses

**Phase 5 accepted:** automated unit, browser and Pages checks passed on November 5, 2026.

Acceptance evidence:
- [GitHub historical + new phase tests](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42154380513)
- [WebKit mobile browser and touch acceptance](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42154380533)
- [GitHub Pages deployment](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42154379502)

The mobile browser suite verified **149 sets locked / 150 sets unlocked**, saved equipment toggling, persistent COWARD overlay, direction only for started sets, no arrow for unstarted or sacrificed rows, both normal and Low FX views, 3,000-object integrity and the 112-sprite cache. Physical iPhone hardware remains a distinct unverified environment, not player-required QA.
No player-operated QA, screenshots or device signoff are required.

## Unlock and persisted equipment

- Permanently unlock at **150 DISTINCT lifetime perfected sets**. Existing `lifetimePerfect` progress is canonical; it is never reset by Sacrifice Catalog purchases or by un-perfecting a row.
- Optional equipment toggle in the main HUD. Before 150 mastered sets, the control shows current progress and cannot be used. Once unlocked, equipping/unequipping is free, reversible and optional.
- Equipment is saved in a backward-compatible optional boolean, `glassesEquipped`, under the original `bit-bazaar-save-v3` key, with original `version: 1`; old saves and backups without this field continue unequipped.
- The strict save validator rejects malformed equipment state. A forged `glassesEquipped: true` on a save with fewer than 150 distinct mastered sets is ignored by the game. No other save fields changed.
- While equipped, **COWARD** appears prominently in a fixed high-layer badge even with game menus open. The same badge and state are supported in Low FX mode.

## Helpful without showing unearned information

- At most six small, mint-colored local figure number/set labels per draw. The labels are selected only from **already visible, rendered, genuinely nearby** floor figures; no global list, ground coordinates or 3,000-sprite overlay is generated.
- If carrying one figure of a set that has **already been started on a shelf**, a mint floor-style chevron points in the horizontal bearing of that shelf face and identifies its assigned physical row and approximate distance.
- A set that has not yet been placed on a shelf receives **no arrow**. A row emptied by sacrificing completed sets also receives no arrow, even when glasses stay permanently unlocked. No new shelf assignment is invented.
- Aiming the arrow uses one cached row lookup per genuine inventory/status update, and a tiny single-chevron render per frame. It does not perform pathfinding or automate figure placement, pickup, travel or sorting.

## Verification

- `tests/phase5-v054.test.cjs`: 149/150 milestone, duplicate mastery immunity, started/unstarted/cleared shelf targets, bearing including behind-player, bounded nearby label draw, old and invalid optional saves, HUD, both engines and PWA.
- `tests/browser-phase5.mjs`: mobile-sized WebKit test with disposable saved states, exercises the actual UI toggle, permanent milestone, COWARD visibility/persistence, arrow restricted to started sets, row sacrificed after unlock, normal/Low FX, 3,000 figure inventory integrity and <=112 sprite cache.
- Previous historical suites and `tests/browser-phase4.mjs` remain in GitHub Actions.

## Further work

The rest of the locked roadmap is Phase 6 (30 achievements, three journeys, finale and showcase/photo mode), now that Phase 5 automation has passed. Native iPhone physical-device behavior remains distinct from WebKit-on-Linux testing, without becoming work assigned to the player.
