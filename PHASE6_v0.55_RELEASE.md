# The Bit Bazaar — Phase 6.1 · Lifetime Collection Honors (v0.55.0)

## Nine earned-only rewards

All milestones use the existing **unique lifetime mastered set IDs** in `lifetimePerfect`. No new achievement counters, no resets or payments. An old Save to Files backup, Sacrifice Catalog purchase, or voluntarily reordered shelf cannot revoke an earned reward.

| Lifetime perfected sets | Award | Real game effect |
|---:|---|---|
| 1 | First Perfect Ten | Founding sign in the shop |
| 10 | Finding Your Rhythm | Collector showcase case |
| 25 | Dedicated Sorter | Numbered plaques on shelf fixtures |
| 50 | The Restorer | Three **free, saved** visual finishes for honor displays |
| 100 | A Serious Collection | Commemorative centerpiece |
| 150 | The Coward's Choice | Existing optional Coward's Glasses and eyewear tribute |
| 200 | The Great Archivist | Archivist display and signature floor medallion |
| 250 | Almost Legendary | Entrance arch ornament |
| 300 | Master of the Bazaar | Exclusive master display (full celebration/credits in later Phase 6.4) |

The **Collection Almanac** now includes a lifetime awards gallery with nine individually authored names, states, unlock descriptions, progress to the next award, and three optional honor-display finishes after 50 unique sets. The free finishes are not part of the 180-purchasable-decoration catalog, do not consume any shelf rows and have no effects on pickup, sorting or economy.

## World rendering

Up to **eight fixed commemorative display objects** can be rendered using hand-drawn pixel shapes; at the 25-set milestone, visible shelf fixtures gain a small numbered nameplate; at 200, a distinctive floor medallion appears. Honors never spawn figurines, occupy existing art mounts, create a giant texture atlas or add a per-frame 3,000-item search. World piece sets, nameplate and floor-seal eligibility are cached on shop-status updates; normal and Low FX share the same logic.

A cosmetic `honorTrim` integer 0–2 is saved as an optional extension of the existing **`bit-bazaar-save-v3`, version 1** schema. Older saves automatically use the default finish. The backup validator rejects malformed values. Unlocked state is always derived from mastery, and a selection saved before the 50-set milestone is ignored until genuinely earned.

## Automated regression
- `tests/phase6-v055.test.cjs` verifies all 301 lifetime counts, 9 fixed thresholds, no duplicate mastery credit, no loss after a modeled Sacrifice, disabled/enabled free finishes, eight bounded world objects, shelf plates, floor medallion, both mobile engines and unchanged save compatibility.
- `tests/browser-phase6.mjs` exercises all thresholds with **disposable** simulated historical progress in actual WebKit (390×844 touch viewport), visible Almanac gallery and selected free finish, reload persistence, no fake currently perfect rows, a full 3,000-figure audit, and the Low FX render budget.
- All historical regression suites and Phase 4/5 WebKit checks continue in GitHub Actions.

## Roadmap
**Phase 6.1: implementation complete, automated signoff contingent on green CI.** Next is Phase 6.2, the three distinct journeys (Restorer, Archivist, Perfect Bazaar), followed by 30 achievements, a post-completion exclusive ceremony and a showcase/photo mode. Player testing is never required.
