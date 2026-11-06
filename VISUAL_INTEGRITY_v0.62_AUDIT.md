# Bit Bazaar — v0.62 Visual Integrity Audit

## Status
**Accepted and deployed November 6, 2026 — v0.62 on `main`.** The original v0.61 release remains available as a rollback. The automated safety suite, actual Linux WebKit browser rendering checks, and GitHub Pages deployment all passed on merged commit `7b94083`. Physical iPhone testing is optional, not claimed completed.

## Scope: repair rendering, do not redesign it
The user's original first-person 16-bit shop aesthetic, sprites, texture palette, lighting, camera focal length and UI styling are intentional and must remain intact. The new v0.62 CSS is **byte-identical** to the previous accepted CSS. The original 480×270 software projection, unique 3,000 figurines, 300 collections, 40 physical racks (20 double-sided floor plus 20 wall displays), 60 shelf faces, 180 decorative items and 232 mounts are unchanged.

### Rendering defects found by code inspection
1. **Shelf fixtures were culled using only their center.** The v0.61 code rejected an entire rack when its center was more than four depth units behind the camera, although a long wall shelf's visible end could still project into the frame. This produces a startling near-corner disappearance. **Repair:** test a fixture's four true footprint corners, clip its polygon to the near plane, then evaluate its actual screen-space bounds. A real-world wall-shelf corner reproducing the old failure is included in regression tests.
2. **Figure hiding tested the rack center too early.** The old ray broad-phase discarded a shelf when its *center* lay outside the camera-to-figure segment, even if the actual rack's nearest surface crossed that segment. **Repair:** closest-point-on-segment circle broad phase plus exact segment intersection with the shelf's rotated bounding rectangle. Every occupied area remains a blocker and the original one-rack-self exception is retained for legitimately shelved figures.
3. **Shelf artwork wasn't bounded by shelf fascia at grazing angles.** Figure billboards were projected ahead of the rack face without a matching near-plane clip region, allowing miniature sprites to protrude beyond side posts or look as though they hovered through the shelf at acute angles. **Repair:** use exactly the same camera-space near-plane polygon clip for the opaque shelf body and its rows of figures; each shelf row's figurine pixels remain inside the real face silhouette.
4. **Floor figures can bleed across a nearby shelf edge.** A center ray may be visible while a small part of the same billboard lies physically behind a shelf corner. **Repair:** only near potential real shelves, test a bounded series of horizontal camera-facing sprite segments, and clip covered pixels for close, medium, and distant silhouettes. The 16-bit sprite source artwork stays original, not resized or substituted.

### Performance controls
- Avoid extra heavy textures, GPU programs, image atlases, object clones, or runtime world files.
- For most figures in clear aisles, a cheap broad-phase skips the expensive edge check and the original single sprite draw is retained.
- Near an actual shelf contour only, test 3–7 strips depending on on-screen width; use one clip region with one original drawing call. No per-frame canvas or texture allocations.
- 40 immutable physical fixture footprints; 480×270 draw resolution, original 20–24 FPS cap and sprite cache budget remain unchanged.
- Only isolated read-only QA probes and developer WebKit scripts can move a test camera; player movement, saves, floor figure coordinates and game controls are not modified by these tests.

## Acceptance criteria
- Every original **60 shelf faces** remains present at distances from ~0.38 to 3.8 world units and both front/reverse angles; north/south/east/west wall shelves must be tested as well.
- The exact wall-corner view previously hidden by the center cutoff (center behind -4 units with visible near corner) must render shelf pixels, not merely report a visible fixture.
- Real canvas images must contain nontrivial colored shelf-body pixels at close and intermediate distances. Actual WebKit screenshots from normal and Low FX are retained as job artifacts for visual review.
- Twenty real physical floor rack collision rays must hide behind-rack figures, but exempt figures legitimately attached to that same rack; no see-through reticle interactions.
- Close, near, medium, oblique and steep pitch views must not produce canvas exceptions, NaNs, vanishing shelves, broken textures or degraded figure ledger integrity.
- At least eight reference PNG images are collected from actual standard/Low FX WebKit canvas views: close front, close reverse, acute angle, wall-front, near wall corner and midrange.
- All existing progression/save/achievement/decor/photo tests must still pass. The previous accepted v0.61 code remains available for rollback.
- GitHub Pages must confirm deployment before acceptance. WebKit on Linux approximates Safari but **does not replace physical iPhone hardware validation**, which remains optional.

## No-save-loss contract
The bit-bazaar-save-v3 version 1 schema, recovery/backup tools, all 3,000 real figure IDs and their physical ledger, permanent cleaning, discovered hidden pieces, real décor mounting and purchase sacrifices, collector achievements, Final Monument, Encore, and Photo Studio remain exactly compatible. No player intervention, new game, changed currency or replay grind is needed to receive this patch.

## Release evidence — accepted November 6, 2026
- Merged patch: [PR #6](https://github.com/hdog960/The-Bit-Bazaar/pull/6) and commit [`7b94083`](https://github.com/hdog960/The-Bit-Bazaar/commit/7b94083aad4b3ed75528e4c66ca98173488a8a1c).
- [Merged-main safety checks: success](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42304456180).
- [Merged-main 390×844 mobile WebKit acceptance: success](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42304456116).
- [GitHub Pages deployment: success](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42304455180).
- [Real screenshot artifact from the accepted 268-pose sweep](https://github.com/hdog960/The-Bit-Bazaar/actions/runs/42304030968/artifacts/13546140077): standard/Low FX close, reverse, oblique and previously missing corner images.
- The image-atlas readiness gate prevents false "missing figure" screenshots before the original `figurines.png` loads.
- At touching distance an empty, opaque shelf fascia can correctly dominate the entire field of view. Acceptance relies on actual positive shelf-material pixels and photographed canvas, not a fabricated minimum number of palette colors.
- **Limits:** Linux WebKit is not physical iOS hardware; this is strong automated coverage, not a claim that all angles or devices can never glitch. QA remains developer-owned.

No creative-scope changes, new figures, resets or save migrations are required.
