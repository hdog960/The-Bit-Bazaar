# Bit Bazaar v0.52 — Dense-Gallery Visibility Optimization

**Phase 4 final QA; Coward's Glasses remains locked.**

### Actual rendering improvement
The old Sacrifice Catalog world renderer tested shelf occlusion for **every** decoration inside the camera frustum, including distant artwork discarded by the 8–48 piece draw budget afterward. Dense galleries could spend CPU time checking art that never appeared on screen.

The v0.52 runtime (`assets/decor-runtime-v0.52.js`) now:
- First collects low-cost camera-depth and camera-side candidates, then prioritizes distant candidates using the **same existing two-unit hysteresis** and site ordering as before.
- Fully tests and draws all nearby (within 12 units) eligible artwork, including the original four exposure bands needed for art partly concealed by shelves.
- Tests distant artwork only until enough unobstructed candidates fill the remaining display budget. Hidden candidates do not take up a drawing slot. Art still behind shelves remains invisible. Preview/ghost artwork is still tested separately and not limited by the distant budget.
- Keeps actual painter distance unchanged. No changes to textures, model geometry, precision offsets, collision, art catalogue, purchases, saved state, or user controls.
- Adds two cheap counters in the existing render diagnostics: `occlusionTests` for artwork ray evaluations and `budgetUnexamined` for far candidates deliberately skipped before expensive ray tests.

The opt-in iPhone Phase 4 device report is updated to `assets/device-qa-v0.52.js`: the user can now see **average and maximum occlusion checks** as well as the number of distant candidates that did not need a ray test, next to current draw timings, adaptive frame stats, and physical figure audit. The recorder remains read-only: no changes to `bit-bazaar-save-v3`. A Low FX recovery carries the report in sessionStorage.

### Regression coverage
- `tests/phase4-v052.test.cjs`: exercises **160 actual placed decorations** in the active v0.52 runtime against the v0.48 selection baseline at multiple draw budgets, checks identical selected art/depth/partial clipping/hysteresis/preview ghosts, tests blocked art never drawn, and checks substantially fewer expensive visibility calls. This is a code-level comparison, not a hardware FPS claim.
- `tests/phase4-v052-telemetry.test.cjs`: confirms recorder output, preserved sprite cache reporting, graceful Low FX recovery, and no gameplay-save writes.
- The historical test suites and previous builds remain available.

### Unchanged scope
Exactly 3,000 unique figurines / 300 numbered sets, 60 shelf faces, 45 floor messes, 18 hidden discoveries, 180 handmade decorations and 232 mounts, original Sacrifice Catalog row costs and all legacy backup and recovery tooling remain unchanged.

**Phase 4 is not signed off until a real iPhone has passed the dense-gallery walk-through and Save to Files → Restore File test.** A successful CI test does not prove performance on the user's hardware.
