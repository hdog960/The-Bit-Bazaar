# The Bit Bazaar — The Great Figurine Sort

## v0.25.0 — Twelve original collector artworks and better browsing (November 3, 2026)

Phase 4 has advanced to **48 / 180 independently authored decorations** (26.7% by item count). The original 36 decorations, all 104 prior mount positions, the `bit-bazaar-save-v3` format, 3,000 unique figurines, 300 ten-figure collections, optional room finish workshop and original locked [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md) are unchanged.

**Twelve individual hand-authored pixel designs across six categories**
- **Framed Art — 8 / 35:** *The Foxfire Railway* (3 perfect rows) is a copper-lantern steam train crossing a glowing forest; *Keeper of the Deep* (6) is an underwater clock tower with fish and marine vegetation. Both are separately drawn 32×40 story scenes.
- **Statues — 5 / 25:** *The Moss-Crowned Golem* (8) has granite arms, moss, etched markings and a wildflower; *The Porcelain Fox* (4) features glazed ceramic fur, gold repair seams and a jade base.
- **Plants — 5 / 20:** *Twilight Bonsai* (4) is a twisted tree with amethyst leaves and starlight blossoms; *Honeybell Orchid* (3) features hanging golden flowers, emerald stems and a small copper bee.
- **Lighting — 6 / 20:** *The Firefly Jar Lamp* (2) contains individually positioned warm firefly lights and a smoked-glass vessel; *The Observatory Beacon* (7) is a taller astronomical signal lamp with etched brass and teal glass.
- **Rugs — 6 / 20:** *Patchwork Dragon Quilt* (3) is a 40×28 crimson patchwork with a dragon emblem; *Winter Observatory Carpet* (5) is a deep-blue floor textile with silver sextant/snowflake imagery.
- **Ceiling ornaments — 6 / 15:** *Singing Shell Cascade* (4) is a suspended array of pearls, shell forms and sea-glass chimes; *The Clockmaker's Comet* (6) is a copper-clockwork comet with staggered enamel and brass trails.
- Existing **Architecture 4/20, Shelf Trims 4/15 and Curios 4/10** remain in-game. All nine category targets still total 180.

**Better browsing and no broken purchases**
- A **✦ NEW 12** tab displays only the twelve additions, while the rest of the catalog remains available under ALL, each category, and OWNED.
- A thumb-sized **ORIGINAL ORDER / LOWEST COST / HIGHEST COST** sorter helps players choose the next sacrifice. Sorting is local to the view, never changes collection IDs, art ownership or pricing.
- The six category pairs use their original existing wall, standing-pad, rug or ceiling mount types. Existing purchased artwork stays put when a version is updated.
- Every purchase still requires confirmation (unless internal test mode) and spends only **currently perfect** ten-piece rows. Each sacrificed row returns all ten original figure IDs to collision-tested shop floor locations; historical perfection is not lost. Previously purchased decorations can be stored or moved for free.

**Compatibility, delivery and testing**
- New artwork is produced once at startup in individual small pixel canvases, never regenerated per frame. It uses the existing projection and sprite placement system; no expensive new floor atlas or blocking collision geometry was added.
- `assets/decor-expansion-v0.25.js` extends the 36-piece catalog append-only, with 12 new unique IDs and a thumbnail cache. `assets/decor-runtime-v0.25.js` adds the NEW filter and sorting. `assets/save-manager-v0.25.js` preserves the exact previous backup validation rules and accepts the new item IDs through the live catalog.
- Versioned normal `game-v0.25.0.js`, Low FX `game-v0.25.0-lowfx.js`, CSS, preview and Low FX recovery HTML are committed. `index.html` and the network-first offline `bit-bazaar-v0.25.0` worker reference the matching release, keeping best-effort v0.24 recovery assets.
- **13/13 artwork/metadata validations passed**, including distinct 48-artwork drawing streams, 12 detailed new compositions, prices, dimensions, and existing anchor preservation.
- **20/20 simulated purchase/ownership/menu tests passed:** six new categories + one existing purchase consumed exactly 25 perfect rows and scattered **250 unique original figurines**, restored seven owned items from save, validated room metadata, and demonstrated the NEW, cheapest and highest-cost sorts.
- **12/12 build checks passed** for standard/Low FX syntax, exact save serialization, original 3,000-figure game, dependency order, and the existing room-material workshop.

**Outstanding:** Live GitHub Pages propagation, real iPhone performance, and actual in-Safari visual verification are not claimed by these programmatic tests. The 180-piece catalog target still needs **132** more bespoke decorations; fully freeform placement remains a future goal.

**Next milestone:** improve variety, placement capacity and direct scene editing while continuing original decoration batches toward the full 180-piece roster.


## v0.24.0 — Live room-finish customization and reversible walk-around preview (November 3, 2026)

**The 36 original Sacrifice Catalog decorations and the locked 180-item roadmap are unchanged.** This milestone improves interior customization without new purchases, coins, customer systems, or any further sacrifices. [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md) remains authoritative.

**Real independent materials for four shop surfaces**
- **Floors:** Heirloom Slate (the original), Warm Honey Tiles, Sea Glass Stone and Terracotta Mosaic. The selected RGB tile palette is used directly in the 480×270 procedural per-pixel floor renderer, with its normal grout, grain and fog preserved. Palette colors are obtained once per floor draw, not recomputed per pixel.
- **Walls:** Mulberry Plaster (original), Morning Cream, Lagoon Teal, Old-Brick Rose. Changes are applied to the actual distant wall polygon fill, baseboard and upper border, not merely a menu thumbnail.
- **Ceiling:** Midnight Violet (original), Cloudlinen, Sapphire Night and Copper Glow. The actual ceiling background and horizontal tile details change; ceiling lights remain functional decorative geometry.
- **Shelving:** Heritage Walnut (original), Golden Oak, Painted Sage and Inkwood & Brass. The physical shelf backs, fascia and five miniature support boards update in both standard and Low FX game renderers; existing paid decorative shelf-rail motifs layer on top, retaining their independent gold/silver/copper accent selection.

**A genuine walk-around preview with apply or discard**
- From **◇ DECOR**, open the new **THE INTERIOR WORKSHOP**, choose any combination of the 4×4 material options, and tap **WALK-AROUND PREVIEW**.
- The drawer closes and world rendering resumes using a temporary draft. Players may walk and look around the real shop with normal touch/desktop movement controls; a compact overlay offers **APPLY** (saves all four finish choices), **EDIT** (return to the workshop retaining unsaved choices), and **DISCARD** (restore the previously saved room without writing anything). Normal pick-up/drop interactions and competing map/collection buttons are disabled while previewing.
- The workshop also offers **APPLY FINISHES** or **REVERT CHOICES** directly in the menu. No decoration ownership or sacrifice is required to style the core shop.
- Material choices are deliberately limited to four authored themes per surface, so this is a functional expanded-customization milestone, **not yet unrestricted per-tile editing or full freeform decoration placement**.

**Compatibility and performance**
- Existing save key `bit-bazaar-save-v3`, all 300 collections / 3,000 original figurines, 60 five-tier shelf faces, historical mastery, cleaning, and previous 36 decorations are preserved.
- The optional `decor.room` field stores a four-element integer array `[floor,wall,ceiling,shelves]` (indexes 0–3). Older saves missing the property use the exact original colors. The new `assets/save-manager-v0.24.js` rejects invalid room selectors on import and keeps accepting old v0.23 or pre-decoration backups.
- `assets/room-workshop-v0.24.js` handles draft/committed palettes, previews, save state and menu actions. `assets/decor-runtime-v0.24.js` integrates it into the existing gallery. Both full and Low FX game builds call the same color hooks directly from their old world draw paths.
- `index.html` and the versioned network-first service worker `bit-bazaar-v0.24.0` now reference all required release assets, preserving previous v0.23 fallback files. No new runtime sprite atlas or per-frame canvas allocations were added.

**Programmatic validation**
- **20/20** stand-alone room workshop tests passed, covering all original palettes, fully reversible previews, independent selections, apply/save, persistence, malformed settings, and legacy save imports.
- **20/20** integrated gameplay tests passed, covering exact 10/20/40 figurine scatter costs, genuine owned decoration persistence alongside room materials, zero historic mastery loss, 4-surface reloads and canceled previews.
- Standard and Low FX script syntax and structural build tests passed. The live published entry point and offline cache were updated, but **a full browser render, GitHub Pages propagation, and real iPhone visual QA remain unverified**.

**Next:** polish in-world preview interaction and mobile comfort after playtesting, add more original decorative items toward the remaining 144, and continue expanding independent materials without overloading the 24 FPS iPhone renderer.


## v0.23.0 — Phase 4 actual placement freedom and shelf material workshop (Nov 3, 2026)
This update adds **meaningful customization to the existing 36 original decorations**. Item count remains **36 / 180**. The approved [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md) still requires the remaining 144 bespoke decorations and eventually broader freeform placement/material controls.

**Real hands-on customization (not just thumbnails):**
- The catalog shows an interactive **FINE POSITION** panel on each owned *installed* piece, with touch-friendly **WEST / EAST / NORTH / SOUTH** controls. One tap moves a mounted decoration **0.25 world units**, to a maximum **±0.5 world units** from its chosen anchor in each allowed direction.
- Floor curios, plants, lamps, ceiling objects and rugs can be nudged along the real world X/Z axes. Wall art slides **only along its wall** (north/south wall: east/west; east/west wall: north/south). Shelf finishes stay physically locked to their real five-row fascia; they do not drift or become floating icons.
- Rugs now feature **true 0°, 90°, 180° and 270° physical orientation**. Their eight existing projected canvas strips transform in the correct rotated 3D plane, rather than merely rotating a menu image. Safe-footprint checks reject orientations or position tweaks that overlap permanent fixtures. The existing original unrotated rug at any of the eight long-standing locations remains fully supported, including older positions with slightly limited clearance.
- Shelf finishes gain independently selectable **ORIGINAL GOLD, PEARL SILVER and AGED COPPER** metal accent treatments. The variation changes actual in-world front rail strokes across all five tiers, preserving the distinctive original item patterns, not counting palettes as separate new decorations. An owned installed item can be reset to its initial position/material at no cost.
- The same existing purchase/move/store actions remain: purchasing sacrifices only currently perfect rows and scatters ten genuine original figure IDs per row; re-positioning, turning, changing metal accents and resetting cost **zero** additional rows. Moving an item to another main anchor resets its fine adjustments for safety; storing clears fine edits but retains ownership.

**Compatible save and import**
- The longstanding key `bit-bazaar-save-v3` is unchanged. Existing optional `decor:{owned,placed}` now additionally supports the optional compact property **`adjustments:[[itemId, dxSteps, dzSteps, quarterTurns, materialId], ...]`**, where offsets are bounded integer quarter-steps from -2 to +2, rug turns 0–3, shelf material IDs 0–2. Old saves simply load with original placements and default gold.
- `assets/decor-workshop-v0.23.js` manages all fine edits and validates mount compatibility, wall direction and collision clearance, and sanitizes any unexpected data on restoration.
- `assets/save-manager-v0.23.js` adds strict backup file checks rejecting unknown items, duplicate adjustments, invalid positions, out-of-range turns, wrong material categories and wall-through shifts. It still accepts pre-v0.23 backups without adjustments or even pre-Phase 4 data.
- Both `game-v0.23.0.js` and `game-v0.23.0-lowfx.js` remain compatible with the original 3,000 figures and full shelf data. They share `assets/decor-runtime-v0.23.js`, the new workshop module, unchanged original decoration art modules, `style-v0.23.0.css`, and the versioned HTML entry/recovery files.
- The network-first service worker `bit-bazaar-v0.23.0` caches the complete updated load order and retains best-effort last-version fallback files. It never reads or deletes user save data.

**Verification**
- **20/20** workshop migration, fine position, rug rotation, metal variants, store/load and import-validation checks passed, including a full set of legacy save cases.
- **15/15** full simulated engine purchases and customization checks passed: exact purchase costs (1+4+2+2 perfect rows), figure IDs and mastery unaffected, real rug geometry transformed, different in-world shelf metal strokes, and settings persisted across runtime reload.
- **9/9** build checks passed, including normal+low-effects JavaScript syntax, unchanged save serializer, original 3,000-figure engine and workshop script order.
- **No physical iPhone or full live-browser visual review has yet been confirmed.** Cosmetic layout, thumb target comfort and true device performance still require a player test.

**Next:** give the placement workshop an in-world live preview and expand material customization beyond shelf accents, then continue toward all 180 original decorations. The fixed-anchor positions are more flexible now, but full freeform placement is **not** complete.


## v0.22.0 — Phase 4 physical shelf finishing and collector curios (Nov 3, 2026)
This releases **36 of the 180 individually authored cosmetic decorations** specified in the approved [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md). The locked 180-piece category quotas and no-currency sacrifice design are unchanged. The first 28 previously authored and purchased items retain the same IDs and positions.

**Eight new distinct cosmetic designs**
- **Shelf finishes (4 / 15):** *Astral Brass Filigree* (4 perfect rows), *Ivyward Oak Lattice* (2), *Tidal Pearl Mosaic* (3), *Crimson Arcade Marquee* (5). Each has its own hand-authored 48×28 pixel texture, decorative material palette, and distinct physical geometric ornament design (stars, carved ivy, scalloped pearlescent waves, or arcade zigzags).
- **Collector curios (4 / 10):** *The Unfinished Clockwork Heart* (3 rows), *Pocket Cosmos in a Bottle* (4), *The Paper Dragon Diorama* (2), and *Ember-Key Typewriter* (5). Each is an original transparent 32×40 pixel freestanding work with distinct silhouettes and descriptions. Curios share the existing floor display pads with lamps, plants and sculptures.

**Physical shelf customization — functional implementation**
- Appended **60 new placement anchors**, numbered **44–103**, one for every actual shelf face (both sides of 20 floor fixtures and the 20 wall shelves); previous wall, standing, rug and ceiling anchors 0–43 remain untouched.
- The DECOR panel now offers **SHELF TRIMS** and **CURIOS** filters with real live counts, all 60 shelf-face locations in an iPhone-friendly dropdown, previous/next face controls, and **LOCATE SELECTED SHELF ON STORE MAP** for immediate spatial context.
- A purchased shelf finish renders on all **five physical front shelf rail fascias** of the selected face using the existing perspective shelf geometry and distinctive motif strokes. These are real front-of-shelf decorative rails rather than fake or freestanding pictures. Shelf finishes do **not** consume or rearrange figurine slots and do not block cleaning, walking or picking up figurines. Unfinished/dirty shelves still show their original grime.
- The newly attached rail-finishing renderer is called from the original `drawShelf` function in both normal and low-effects engines; drawing is culled beyond 19 floor units, with reduced detail at distance, no new image/canvas allocation per frame, and at most five tiers per visible decorated face. Shelf trims are excluded from the freestanding world-entity render list to prevent hovering icons.
- Each original pixel thumbnail is encoded and cached **once per decoration**, avoiding repeated 36-item canvas conversion during catalog filtering, shelf navigation and re-placement.

**Persistent purchases, compatibility and safety**
- Purchases still require explicit consent and sacrifice **only current perfect rows**. Each purchased item releases ten original real figure IDs per sacrificed row to planned collision-safe floor positions; original IDs, historical collection mastery, one-figure carrying, permanent cleaning and other progress survive.
- All eight items have permanent ownership, can be moved/stored/re-placed for free and are limited to their appropriate mount types. Two finishes cannot occupy one shelf face, and curios cannot take shelf trim positions.
- Save key `bit-bazaar-save-v3` and optional `decor:{owned,placed}` structure are **unchanged**. The four earlier decoration mount types, original 28 items and 44 site IDs are compatible; pre-v0.22 backup files load. `assets/save-manager-v0.22.js` validates the shelf vs. floor mount distinction and prevents invalid duplicate installs.
- Versioned full/Low FX engines `game-v0.22.0.js`, `game-v0.22.0-lowfx.js`, matching CSS and HTML and `assets/decor-expansion-v0.22.js` / `assets/decor-runtime-v0.22.js` are committed. `index.html` and the compact network-first `bit-bazaar-v0.22.0` offline worker point to the new build with optional v0.21 recovery assets.

**QA before publication**
- **18/18** catalog, authored artwork and save backup compatibility assertions passed: 36 unique ID/visual compositions, all 60 real shelf-anchor IDs, unchanged original 44 anchors, correct category quotas and rejecting invalid save imports.
- **20/20** mocked gameplay tests passed: exact 40/20/20 scattered-figure costs, current-perfect row consumption, no double placement, free moves and storage, reload and lifetime mastery preservation, actual five-row fascia rendering, 60-face selector/map UI, category counts.
- The JS in both normal and Low FX builds passed syntax and saved-data serializer regression checks. **Live GitHub Pages propagation, visual screenshots and physical iPhone gameplay/performance are not independently verified.**

**Next:** continue remaining 144 individually authored pieces and expand from fixed decoration anchors toward richer positioning/rotation/material customization, while retaining accessible touch controls and good iPhone frame time. The final 180-item Phase 4 and all its acceptance criteria remain open until fully implemented.


## v0.21.0 — Phase 4 stained-glass architecture and hanging ceiling art (Nov 3, 2026)
This release expands the true Sacrifice Catalog to **28 of 180 independently authored decorations**, introducing two *new* categories with visibly different mounting and rendering. The locked [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md) is unchanged. Physical-device acceptance and fully freeform interior decoration remain in progress.

**Eight new original 40×48 pixel compositions:**
- **Architectural wall features (4 / 20):** *Moonstone Rose Window* (4 perfect rows), *Whispering Library Arch* (6), *Coral Tide Viewport* (3), and *Sunclock Stone Alcove* (5). These are larger architecturally framed visual inserts with individually authored pixels: stained glass, library shelving, an underwater porthole, and a sandstone sundial.
- **Ceiling ornaments (4 / 15):** *Brass Celestial Orrery* (5 perfect rows), *Prism Rain Chandelier* (7), *Mothsilk Lantern Cloud* (3), and *Windsong Feather Mobile* (2). Each is independently drawn as a transparent suspended 2.5D ornament. These are decorative visuals, not interactive physics objects or dynamically cast real-time lighting.
- The previous **20 original framed artworks, statues, plants, lamps and rugs** remain unchanged and retain their complete catalog IDs and all existing 36 anchor IDs.

**Functional interior personalization**
- The DECOR screen now offers **ARCHITECTURE** and **CEILINGS** filters alongside earlier item types, all with correct actual item/category counts.
- Architecture uses existing wall mount points; a wall frame and an architecture feature cannot occupy the same point. Architecture renders larger than framed paintings, creating a distinct architectural treatment rather than a mere recolored picture.
- Added **eight ceiling-only hooks** (IDs 36–43), in open aisle positions above the original shelving. The rear C-D hook was repositioned to avoid a built-in ceiling bulb. Ceiling ornaments display as actual in-world hanging sprites beneath the shop's ceiling.
- A separate CEILING HANGING POINT dropdown and eight numbered, thumb-size quick-select controls let players choose, preview via catalog art, purchase, place, move, store or restore ceiling ornaments with no additional payment after purchase. Other placement selectors stay intact.
- No new physical obstacles; ceilings remain nonblocking, while existing wall fixtures, independent floor display pads and rug sites are fully preserved.

**Sacrifice, save, recovery and performance**
- Every new purchase spends 2–7 **currently PERFECT** numbered collection rows and scatters exactly ten existing IDs per sacrificed row. The random row selection, preplanned collision-safe floor placement, pre-write transaction, lifetime mastery, one-hand carrying and 3,000 total collectible identities are unchanged.
- The save key remains `bit-bazaar-save-v3`; the optional `decor:{owned,placed}` shape is unchanged. Pre-v0.21 purchases, ownership, wall hooks 0–15, standing pads 16–27 and rug sites 28–35 remain valid. Newly added ceiling anchors use 36–43.
- Normal `game-v0.21.0.js` and Low FX `game-v0.21.0-lowfx.js` use `assets/decor-v0.19.js`, `assets/decor-expansion-v0.20.js`, `assets/decor-expansion-v0.21.js`, shared `assets/decor-runtime-v0.21.js`, and `assets/save-manager-v0.21.js`. The network-first offline worker caches these dependencies and preserves optional previous-release recovery assets. Sprites are drawn into small canvases once at startup, not once per game frame.
- Save-file import validates the new ceiling/wall distinction and keeps accepting older shop backups without any decorations.

**Verified programmatic QA**
- **10/10 catalog checks:** 28 individually drawn original pixel compositions, unchanged prior item IDs and 36 earlier anchors, correct 8 new ceiling hook IDs, valid row costs and locked 180 quotas.
- **17/17 simulated purchase checks:** wall/ceiling placement restrictions, 40/50/20 figurine scattering, no duplicate IDs, older purchases, lifetime mastery, free move/store, persistence and reload.
- **14/14 UI, projection and backup checks:** correct category filters, hooks and quota counts, existing controls, in-world facade and ceiling rendering, legacy saves and rejection of invalid restore files.
- **10/10 normal/Low FX build checks:** JavaScript parses, game/save structure unchanged, proper versioned backup/recovery paths and load order.
- **Important:** These are static and simulated tests, not direct Safari or physical iPhone gameplay tests. The main GitHub repository has been updated; the live site may need to refresh its service worker cache.

**Next:** test ceiling and wall-facade visuals directly on an iPhone, then continue the full 180-item roster with **shelf trims, curios and additional environmental materials**, and move toward finer positional controls and rotation without degrading phone performance.


## v0.20.0 — Phase 4 lamps and woven floor rugs (Nov 3, 2026)
This is a playable **20 of 180** bespoke decoration milestone; it expands v0.19's 12 items without changing the approved [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md). The full final catalog and freeform placement are not implemented yet.

**Eight new original pixel-art designs**
- **Four floor lighting sculptures (4 / 20):** *Aurora Orrery Lamp* (3 perfect rows), *Hearthglass Lantern* (2), *Verdigris Lighthouse* (5), and *Moonflower Floorlight* (4). Each has independent hand-drawn transparent pixel silhouettes and different luminous details. These are decorative glowing objects, **not** dynamic room illumination.
- **Four horizontally displayed carpets (4 / 20):** *Sunken Compass Carpet* (1 perfect row), *Mosswork Runestone Rug* (2), *Starfall Observatory Runner* (3), and *Amber Honeycomb Mat* (4). Each rug has a separate 40×28 custom-authored textile drawing with individually designed compass, rune, constellation, or honeycomb patterns.
- All 12 pre-existing artworks remain intact: **6 frames / 35**, **3 sculptures / 25**, **3 plants / 20**. New counts across these five implemented categories are **6+3+3+4+4 = 20 / 180**. The other four roadmap categories remain unimplemented, not placeholders presented as inventory.

**New, genuinely different placement**
- Existing IDs and physical locations of all **16 wall hooks and 12 freestanding display pads** are unchanged. Eight unique **rug-only sites** are added as IDs 28–35, located in collision-checked open walkways.
- The decoration menu now has **LIGHTS** and **RUGS** filters, an independent rug-site selector, and quick-select numbered rug locations. Rug slots cannot hold wall frames, lamps or statues; rugs cannot occupy wall or stand positions.
- Lamps use the existing bounded freestanding 2.5D sprite projection. Rugs lie **flat on the actual shop floor**, using at most eight small projected texture strips per rug to approximate perspective. No additional per-frame canvas creation, collision obstacles or mandatory map redesign.
- A maximum of four rugs and four lamps from this release can be installed concurrently, keeping the added rendering cost bounded and preserving iPhone performance goals.

**Economy, persistence, and rollback**
- Purchases continue to select only **currently perfect** 1–10 rows and scatter exactly 10 real collectible IDs per row to safe floor positions. No coins or other currency exist. Once a decoration is purchased, it remains owned forever; moving or storing it costs nothing.
- The existing `bit-bazaar-save-v3` format and optional `decor:{owned,placed}` field are preserved. Older purchased items and their positions 0–27 remain valid; rug positions are append-only. `assets/save-manager-v0.20.js` validates exact placement-kind compatibility while accepting older saves.
- Normal engine `game-v0.20.0.js`, Low FX engine `game-v0.20.0-lowfx.js`, `assets/decor-expansion-v0.20.js`, `assets/decor-runtime-v0.20.js`, versioned CSS and two matching HTML launch pages are committed. `index.html` and network-first PWA worker `bit-bazaar-v0.20.0` reference the complete new release, retaining older emergency fallback assets.

**Development checks**
- Unique art drawings and backward compatibility of the first 12 decoration IDs passed **6/6** catalog checks.
- All eight rug sites were verified against the game's 40 actual shelf fixture collision rectangles and previously existing floor-pad positions.
- Normal and low-effects builds passed **10/10** build and structural checks. Purchase/ownership, category restrictions and reload passed **15/15** mocked behavioral checks. Perspective rug rendering and save validation passed **7/7** tests.
- Live browser display and physical iPhone testing have **not** been independently completed. Before broadening the catalog, confirm that rug floors render clearly in Safari, new menu tabs scroll, and previously purchased art remains intact.

**Next:** improve preview/placement freedom and introduce architectural finishes, ceiling ornaments, shelf trims and decorative curios while creating each of the remaining 160 individual art pieces under the locked 180-piece roster.


## v0.19.0 — Phase 4 living gallery: 12 original decorations across three categories (Nov 3, 2026)

This milestone expands the first playable Sacrifice Catalog **from 3 to 12 distinct, individually authored decorations**, while keeping the locked 180-piece [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md) target intact. The original three paintings and all existing purchased ownership/placement IDs remain preserved.

**Artwork now actually in the game (12 / 180):**
- **Six framed wall artworks (6 / 35):** the original *The Midnight Moth*, *Rain on the Glasshouse* and *The Ember Drake*, plus the new bespoke *Clockwork Koi*, *The Stargazer's Atlas* and *Lantern Tide*. Each illustration has its own pixel composition and original collector text.
- **Three sculptures (3 / 25):** *Copper Owl Sentinel*, *The Argent Knight* and *The Spiral Fossil* — independent silhouettes with pedestal, inlay, heraldry or carved growth bands.
- **Three plants (3 / 20):** *Cloudfern Terrarium*, *Ruby Crown Cactus* and *Mooncap Mushrooms* — individually authored transparent 32 × 40 pixel sprites, displayed as free-standing 2.5D world objects.
- Artwork prices are **1–7 current perfect rows**, not money. Purchases still randomly select distinct currently-perfect rows, return exactly ten original figurines per row to safe floor locations, and preserve their lifetime mastery.

**Placement and interface**
- The **◇ DECOR** panel gains functional filters for ALL, FRAMED, STATUES, PLANTS and OWNED, with actual counts rather than placeholder entries.
- The existing **16 wall hanging points remain exactly where they were**. Added **12 open floor display pads** in corner gardens and between shelving aisles. A frame can only hang on a wall; a statue/plant can only occupy a floor pad. Display positions never overlap, and non-blocking floor decor cannot trap the player.
- Separate wall and floor dropdowns, plus 12 numbered quick-select pad buttons, let players move furniture among available positions without paying more. Art not installed is still permanently owned and can be re-placed later.
- Freestanding art is drawn using transparent, original pixel artwork as projected in-world sprites. It faces the viewer without adding collision geometry, sprite atlas reprocessing, or thousands of new draw calls.

**Compatibility and safety**
- The save structure remains `bit-bazaar-save-v3` with optional `decor: {owned, placed}`. Old v0.18 save files restore correctly, including the first three purchased paintings, because old IDs and 0–15 wall anchor positions are unchanged.
- `assets/save-manager-v0.19.js` now rejects attempts to restore wall frames on floor positions or floor objects on wall positions. The existing backup, import confirmation and lifecycle save protections stay active.
- `game-v0.19.0.js` and `game-v0.19.0-lowfx.js` both load the shared `assets/decor-v0.19.js` and `assets/decor-runtime-v0.19.js`; a matching `baseline-v0.19.0-lowfx.html` is included, and v0.18 remains an optional offline fallback.

**Development checks**
- Twelve separately authored paint instruction streams passed uniqueness and asset checks; all 12 selected floor pads were checked against the actual 40-rack collision geometry and are accessible.
- Mock purchases and persistence passed **19/19** category, ownership, current-perfect-row, scattering, placement and save-loading tests.
- Both new JavaScript engines passed syntax checks and retain all 3,000 collectibles and existing figure-save fields.
- Live physical-iPhone art visibility, tapping, upload/backup behavior and longer-session performance remain to be tested by a player. The full 180-piece roster and unrestricted furnishing are **not yet complete**.

**Next:** expand the catalog into additional decoration categories and introduce richer previews, finer positioning and material customization without compromising iPhone frame time.


## v0.18.0 — Phase 4 first playable Sacrifice Catalog gallery (Nov 3, 2026)
This is a **small, real Phase 4 milestone: 3 of 180 original decorations now implemented**, not a claim that the final 180-piece catalog is complete. Phase 3's physical iPhone acceptance remains open. The canonical [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md) remains unchanged.

**Three completely original framed-pixel-art gallery pieces, out of the required 35 framed items / 180 total:**
- **The Midnight Moth:** an astral moth in a golden frame, costing **2 currently PERFECT rows** (exactly 20 figurines re-scattered).
- **Rain on the Glasshouse:** rain-lit glasshouse with lush ferns, costing **3 currently PERFECT rows** (30 figurines).
- **The Ember Drake:** a dragon defending a volcanic citadel, costing **5 currently PERFECT rows** (50 figurines).
- Each artwork is authored individually at 32×40 source pixels, not a recolor of another piece, and is rendered in the first-person store as a cached framed image. Artwork is created once on startup; no full 3,000-figure atlas changes or new artwork canvases during gameplay frames.

**Actual gameplay loop**
- A new **◇ DECOR** entry in the main HUD opens the Sacrifice Catalog, showing images, descriptions, permanent ownership, exact row costs, and all nine category quotas to reach 180 at the full release.
- Choose from **16 wall-mounted hanging points** distributed in the gaps between existing wall shelves. Selecting a free position and buying a piece requires sufficient currently perfect sets and a final explicit confirmation.
- The transaction chooses the specified number of *random, different, currently perfect* rows, not previously perfected-but-now-imperfect sets. Each is emptied completely, and all of its ten original IDs are placed into collision-checked real floor positions.
- Positions for *all* figures are planned before the purchase can proceed. The complete next save is written before the in-memory row arrays are changed; save-write failure cancels the purchase. One copy of the original shop before its first sacrifice is retained under `bit-bazaar-v3-before-first-sacrifice`.
- Decorations become **permanently owned**. Move between free hanging points, store, and re-place at zero additional cost. Existing lifetimes mastered and observed IDs never decrement. No currency, sales, customers or automated collection is introduced.

**Save, restoration and fallback**
- The same `bit-bazaar-save-v3` JSON carries a new optional `decor: {owned, placed}` property. Older saves without this field load with an empty gallery, preserving all earlier figure, shelf, floor, hidden discovery and lifetime progress.
- Matching normal and Low FX builds: `game-v0.18.0.js`, `game-v0.18.0-lowfx.js`, `style-v0.18.0.css`, `preview-v0.18.0.html`, and `baseline-v0.18.0-lowfx.html`.
- New cached modules `assets/decor-v0.18.js` and `assets/decor-runtime-v0.18.js` own the authored art and game transactions. `assets/save-manager-v0.18.js` extends manual file-import validation to reject fake purchased item IDs, duplicate placements, occupied hooks or unowned art. It accepts older undecorated backup files. Previous working v0.17 assets remain separately available.

**Verification**
- Normal and Low FX JavaScript passed syntax checks.
- Mocked Phase 4 purchases and storage passed **19/19** transaction/ownership cases, including 20/30 figure re-scattering, no repeat spending, exact current-perfect costs, permanent ownership and no double occupancy.
- Save manager passed **10/10** decor/legacy backup validation cases.
- **No physical iPhone or full browser render has yet been verified.** The first slice needs device testing before extending to the rest of the 180 required bespoke artworks and more flexible placement systems.

**Next:** real iPhone test of framed-world art visibility, scrolling, selecting a wall hang point and retaining ownership after reload; broaden the original decorated category roster and improve placement previews / layout freedom. Do not claim Phase 4 complete until all 180 bespoke decorations and the full positioning, material and sacrifice acceptance criteria are implemented.


## v0.17.0 — Phase 3 save protection and resilient iPhone offline updates (Nov 3, 2026)
This final Phase 3 safety pass extends the approved [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md). No Phase 4 decoration purchases, customer systems, new currency, or collection IDs are introduced.

**Save Protection in the Almanac**
- A new **YOUR SHOP · SAVE PROTECTION** section at the bottom of COLLECTION lets the player download a local `Bit-Bazaar-Save-YYYY-MM-DD.json` snapshot and import a previous snapshot.
- A small `assets/save-manager-v0.17.js` module handles file creation, local validation, consent and restoration; it makes no network requests or uploads. A backup contains the actual full 3,000-figure save, not just completion counts.
- Restore validates the existing v3 shape: 60 faces × 5 rows × 10 slot positions, exact shelf membership, unique figure IDs, one carried figure, cleaning stages, 45 permanent floor messes, 18 possible hidden IDs, discovered/bookmarked sets, ground positions and player coordinates.
- Invalid files or a cancelled confirmation leave the current save alone. A confirmed restore first copies the present save to `bit-bazaar-v3-before-file-import` in localStorage, then replaces `bit-bazaar-save-v3` and reloads.
- During that restore reload, engine saves are temporarily suppressed so an iOS `pagehide` or final animation tick cannot overwrite the imported snapshot with the old in-memory shop.
- The backup is manual. Players should keep downloaded files in Files/iCloud Drive or elsewhere they control; local Home Screen Safari storage alone is not a guaranteed archival backup.

**iPhone session durability**
- Both normal and low-effects engines flush the existing, unchanged save serializer on `visibilitychange` to hidden and on `pagehide` while playing. This protects the latest player position/camera direction when iOS suspends a Home Screen PWA between the regular autosave ticks.
- The full world, figurine, discovery, cleaning and shelf-placement mechanics are untouched. All recent HUNT, Almanac, map task navigation, and low-effects recovery features remain.

**Offline installation and Home Screen polish**
- The network-first service worker is `bit-bazaar-v0.17.0`. It pre-caches only the 12 essential current files (including the save-manager module), rather than demanding decades of obsolete builds; 4 prior v0.16 files are best-effort optional fallback assets and cannot block the installation.
- On offline misses, a navigation request can receive the cached index; missing scripts, styles and images are **not** incorrectly served HTML.
- The PWA manifest description now correctly states **3,000 collectible figures / 300 named sets**, replacing its obsolete 1,000/100 wording.

**Verification before publishing**
- Final repository integrity checks passed **20/20**, and the auto-save import guard was behavior-tested to prevent stale re-saves during page reload.
- Normal and Low-FX scripts passed syntax checks. Versioned `game-v0.17.0.js`, `game-v0.17.0-lowfx.js`, `style-v0.17.0.css`, `preview-v0.17.0.html`, `baseline-v0.17.0-lowfx.html` and manager module are committed.
- Backup validation passed **14/14** data-integrity cases. Mocked export/import behavior passed **7/7** scenarios, including refusal of malformed saves, cancelled confirmations, successful imports, and pre-import safety copies.
- Real Safari/iPhone Home Screen file download, file picker, low-effect recovery, and background suspend must still be tested on an actual iPhone. Simulated QA is not evidence of physical-device acceptance.

**Next:** review Phase 3 with a real iPhone, confirm downloads can be reopened from Files and that a manually imported backup reloads correctly, then begin carefully staged Phase 4 Sacrifice Catalog implementation under the locked 180-item design.


## v0.16.0 — Phase 3 store map restoration navigator and scroll-preservation (Nov 3, 2026)
Builds on v0.15's direct HUNT-to-shelf navigation; **Phase 4 remains unstarted**. The approved [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md) is unchanged.

**Faster, purposeful map navigation**
- The real 40-fixture map now includes **PREV UNIT / NEXT UNIT** controls to inspect every actual rack and wall unit without accurately tapping tiny SVG shelf shapes on a phone. When the map is zoomed, navigation recenters on the chosen fixture.
- **FIND DIRTY SHELF** cycles through actual unfinished faces of the 60 existing shelf faces, selects the specific face and recenters the map. The button disables itself when all shelves are clean.
- **FIND UNSORTED SET** finds the next real 10/10-filled but incorrectly ordered row, selects its physical shelf face, and highlights its assigned collection. Fully sorted and partly filled rows do not qualify. The button disables itself when no such rows remain.
- The map shows live **remaining dirty faces / full rows needing sorting**. These are derived from real saved cleaning stages, slot numbers and perfect-row validation, not invented objectives. No ground, hidden, or loose figurine coordinates are revealed.

**iPhone scroll fix**
- Rebuilding the map after tapping a fixture, switching faces, zooming or using a task shortcut now restores the `drawerBody` scroll offset, instead of jumping the entire map panel to the top. The existing map viewport's own scroll/pan position is also retained when appropriate. Opening a map from another screen starts cleanly at the top.
- New task controls have minimum 48px tap height; unit browsing buttons have minimum 44px tap height.

**Safety**
- New release files: `game-v0.16.0.js`, `game-v0.16.0-lowfx.js`, `style-v0.16.0.css`, `preview-v0.16.0.html`, `baseline-v0.16.0-lowfx.html`.
- Main `index.html` and the network-first `bit-bazaar-v0.16.0` service worker cache reference the release; the previous v0.15 assets remain for rollback.
- Existing `bit-bazaar-save-v3` serialization, 3,000 figures, 300 sets, dirty face records, 18 hidden IDs, 45 floor messes, pins, HUNT features, map-to-collection links and 112-canvas rendering cap remain unchanged. Task scanning happens only on opening or interacting with the map, never once per rendered frame.
- Normal and Low FX scripts passed JavaScript parsing and structural checks before publication. **Real iPhone/browser interaction tests are still needed.**

**Test on iPhone:** Open MAP, tap next and previous unit; tap FIND DIRTY SHELF twice and confirm it moves between dirty faces. When a row is actually full but out of order, tap FIND UNSORTED SET and verify the correct rack/face and highlighted set. Scroll down the map and change faces to check the panel does not jump. Reload your saved shop and check previous placements, cleaning, pins, and HUNT details.

**Next:** final real-device Phase 3 acceptance, then a carefully staged implementation of the 180-piece Phase 4 Sacrifice Catalog under the locked design.


## v0.15.0 — Phase 3 direct HUNT-to-shelf navigation and stable mobile panel (Nov 3, 2026)
This continues the locked [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md) without adding customers, shop sales, currency, new figure identities, or Sacrifice Catalog decorations.

**Assigned shelf shortcut**
- For a pinned HUNT collection that already has figures on a display, the live tracker now names the **actual shelf face and row** and offers **▦ SHOW SHELF ON MAP**. A tap opens the existing map in 2× zoom, centers the correct fixture, selects the correct face and highlights the matching collection row. The location is recomputed from live shelf state at tap time, so moving an assigned set is followed accurately.
- For an unstarted set, the same area explicitly says **NO SHELF ASSIGNED YET** and explains that the first figure must be placed in a clean row. It provides no shortcut to loose or hidden pieces. The six-phase roadmap's Coward's Glasses tracking remains intentionally exclusive to Phase 5.
- Almanac's prior **FIND THIS SHELF ON THE STORE MAP** now uses the same shared navigation function, reducing divergent implementations.

**Mobile stability**
- Retain the HUNT panel's scroll position and keyboard number focus when the tracker updates because of pickup, placement, sorting or pin refresh. Cycling to a different pinned set resets the tracker to the top.
- Maintain at least **44px** for numbered figure buttons, restore a 150px maximum HUNT body height on very short (620px or less) screens, and scroll details within the existing compact notebook.

**Save & performance:** unchanged `bit-bazaar-save-v3` JSON, including 3,000 figure IDs, all 300 assigned rows, 60 cleaned faces, 45 floor messes, 18 hidden collectible IDs, discovered ledger, pins and lifetime mastery. This is DOM/CSS-driven UI work only, with no new canvas sprite allocations, per-frame map loops or new artwork atlas.

**Release:** `index.html` uses `game-v0.15.0.js` and `style-v0.15.0.css`, with a network-first `bit-bazaar-v0.15.0` service-worker cache. A corresponding `game-v0.15.0-lowfx.js` and `baseline-v0.15.0-lowfx.html` preserve performance recovery. Prior versions are retained for fallback.

**QA status:** both JavaScript builds passed syntax checks and static structure checks prior to release. Confirm the actual GitHub Pages update and physically test an iPhone before considering Phase 3 complete. On a fresh save: pin an unstarted set, open HUNT and verify there is no map shortcut; place its first figure onto a cleaned shelf, and verify the new shortcut selects the exact face/row. Repeat after moving the set, cycling pins, reopening the app and in Low FX mode.

**Next:** final end-to-end Phase 3 iPhone acceptance including map accuracy, long-session resilience and compact screen accessibility, then proceed to the much larger Phase 4 Sacrifice Catalog under the locked roadmap.


## v0.14.0 — Phase 3 tracker readability and figure-level guidance (Nov 3, 2026)
This is a focused **Phase 3 mobile usability release**, not the Sacrifice Catalog. The approved [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md) remains unchanged.

- **A tap-friendly two-row HUNT checklist:** the 10 figure-number cells are now 5 across instead of one cramped 10-wide strip. Real buttons support selection and keyboard focus, while the prior green/orange/gold/purple status coding remains.
- **Tap any number for contextual guidance:** an optional in-world detail card shows the real figurine name **only after discovery**, plus the precise status: correct numbered slot, wrong actual slot versus desired slot, currently in hand, observed but unshelved, or still undiscovered. Tap again to dismiss. Selecting another pinned set clears the previous focused number.
- **Never spoil floor discoveries:** unknown figures still show anonymous entries; no scattered, secret, or loose figurine coordinates appear. The panel doesn't collect anything automatically.
- **Short-screen support:** HUNT details scroll within a bounded panel, so landscape/short iPhones do not require a full-height notebook. Collection navigation buttons retain at least 44 px height.
- **Save and performance protection:** figure placement, 300 × 10 memberships, secret IDs, cleaning stages, map, existing pins and the version-1 `bit-bazaar-save-v3` save shape remain unchanged. Focused number is deliberately transient; the panel still opens collapsed after reload. No added sprite canvases, frame work or new atlases.
- **Release paths:** `index.html` loads `game-v0.14.0.js` with `style-v0.14.0.css`; the network-first offline cache is `bit-bazaar-v0.14.0`. A matching `baseline-v0.14.0-lowfx.html` and `game-v0.14.0-lowfx.js` preserve the severe-frame recovery path. Older v0.13 files remain for comparison.
- **Verification:** both new JavaScript builds passed a syntax-compile check before publishing, and the versioned game, preview, low-effects fallback and offline cache files were generated. This is structural/syntax QA, **not** a claim of completed interactive or physical iPhone playtesting.

**iPhone smoke test:** open the game, select COLLECTION, pin a set, return to the shop, tap ★ HUNT; verify ten larger numbered buttons. Tap #1, read its detail, tap #1 again to close, then cycle pinned sets. Reopen a previously saved shop and confirm figures, pins and restoration counters remain intact. Check the low-effects fallback if performance degrades.

**Next:** assess real iPhone readability, HUNT overlay placement and map interaction, then finish Phase 3 before starting the much larger 180-decoration Sacrifice Catalog.


## v0.13.0 — Phase 3 in-store pinned hunt tracker and numbered collection checklists
Continues the approved [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md), with **no customers, no shop sales, and no decoration currency**. Phase 4 Sacrifice Catalog is deliberately not implemented yet.

**In-store HUNT tracker:** an optional, collapsible **★ HUNT** panel under the existing restoration counters. On an unpinned store, tapping it offers a button to open the Collection Almanac. Once sets are pinned, the tracker displays one chosen set at a time: actual name, pinned-set index, 0–10 genuinely discovered, 0–10 physically shelved, number correctly placed, and ten numbered tiles showing `CORRECT`, `WRONG SLOT`, `IN HAND`, `DISCOVERED` or `UNKNOWN` status. PREVIOUS/NEXT cycles the pinned collection list; COLLECTION opens its full illustrated page. The panel can be collapsed at any point and does not give even approximate loose-figurine coordinates.

**Much clearer detail checklist:** each individual collection now opens with a 10-cell numbered overview identifying which figures remain off the shelf and which already displayed figures are in incorrect numbered slots. It is derived from real stored figure numbers, not generated guesses, so it remains correct after drops, lifts, swaps, relocation and reordering.

**Save compatibility:** a single optional `trackedSetId` is added to the existing `bit-bazaar-save-v3` JSON. On reload, this value is accepted only if its set remains pinned; old v0.12 and earlier saves fall back to the lowest numbered pinned set. Removing the tracked set automatically chooses another bookmarked set, or returns the tracker to its empty state. The optional panel itself starts collapsed on reload so it never blocks the world view unexpectedly. Existing `pinnedSets`, `seenFigures`, 3,000-figure layout, 18 secrets, 60 shelf cleaning faces, 45 floor messes and permanent mastery data remain intact.

**Mobile visual work:** separate bright pixel-number tiles for correctly shelved pieces, misplaced items, held items, discovered-but-unshelved miniatures and unknowns; large touch targets for hunt cycling. After starting play, the original instructional mission paragraph collapses to free screen space; the optional tracker opens only when the player chooses to use it. All HUD art is CSS, not a new sprite atlas or canvas.

**QA:** staging and JavaScript syntax checks passed. Automated in-browser-simulation checks covered fresh stores, no-pins behavior, HUNT-to-Almanac access, pin/cycle/open controls, pickup/drop/placement live updates, a misplaced figure #1 in physical slot 8, valid figure numbers, saved hunt and shelf restoration after reload, unpinning active set, old-save fallback, matching low-effects build and extreme slow-frame recovery. A 1,440-tick 60fps simulation rendered 480 frames within the existing **112-canvas sprite cache** and 70/30/65 near/mid/far figure caps. **Real-device iPhone usability testing remains necessary.**

**Next:** finish Phase 3 quality/visual review on a physical iPhone, then assess readiness to begin the major 180-piece Sacrifice Catalog. Do not prematurely report Phase 4 completed.

## v0.12.0 — Phase 3 pinned collecting, faster browsing and precise shelf map navigation
Under the approved [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md), this is an additional **Phase 3 UI and usability milestone**. No customers, store sales, resource currencies or Sacrifice Catalog decoration mechanics have been introduced.

**Persistent pinned collections:**
- Pin/unpin any of the 300 named collectible sets directly from its illustrated Almanac detail. Add a seventh, horizontally scrollable **★ PINNED** filter, stars in the list and map, and a pinned count in the collector overview.
- `pinnedSets: number[]` is an optional backward-compatible property in the same `bit-bazaar-save-v3` JSON, validated against actual collection IDs. Older v0.11 and earlier saves load with an empty pin list and retain their figure locations, discovered IDs, clean faces, floor mess stages, hidden figures and lifetime mastered sets.
- Pinned sets are prioritized in the map's existing **FIND A SET ALREADY ON A SHELF** dropdown. Pinning is organization only: it never reveals the location of any loose or hidden figurine.

**Almanac navigation:**
- **PREVIOUS SET / NEXT SET** move through the currently searched, sorted or filtered 300-set list without rebuilding the entire book. When a set is removed from the PINNED filter, the next/previous controls still choose a valid remaining set.
- Returning to **COLLECTION LIST** restores the previously loaded results (48 per page) and the exact scroll position instead of sending an iPhone player back to the beginning of 300 entries.
- Mobile-friendly pixel-art pin, list-turn and navigation controls with clearly defined tap targets and focus indicators.

**Store Map:**
- New **⌖ FIND ME** button zooms and pans the overhead floor plan to the current player coordinates and chooses the nearest shelving unit. **◉ CENTER SELECTED SHELF** centers the currently inspected rack.
- Selecting a named set from the map dropdown or following **FIND THIS SHELF ON THE STORE MAP** from the Almanac selects the correct shelf/face, highlights the set, and automatically pans the 2× zoom view to that physical fixture. The map remains non-navigational for scattered/hidden figures.
- Real shelf rows show exactly which set numbers are **still missing** (e.g. NEED #2, #3, #4) and highlight existing figurines sitting in a wrong numbered slot. Full, disorderly rows show the number of misplaced figures. These hints only derive from set membership and in-shelf figure numbering, never from floor positions.

**Safety and QA:** Version-specific new assets and offline cache `bit-bazaar-v0.12.0`; the emergency fallback [baseline-v0.12.0-lowfx.html](./baseline-v0.12.0-lowfx.html) uses the same `pinnedSets` and existing save format with 20fps rendering and simplified floor geometry. Automated tests verified pin/unpin and reload, the seventh Almanac filter, 48/96-item paginated scrolling, next/previous/detail return, missing-number and wrong-slot map feedback, auto-centering on assigned shelf/player, old-save migration, low-effects continuity and severe-frame fallback. A 1,440-tick render simulation produced **480 drawn frames** with 112 cached canvases and the existing near/mid/far caps. **Physical iPhone playtesting remains necessary.**

**Next:** continue Phase 3's visual/readability and collection-navigation QA before evaluating readiness for the 180-item Phase 4 Sacrifice Catalog.

## v0.11.0 — Phase 3 Collection Almanac discovery journal & iPhone map zoom
Roadmap: [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md). **Phase 3 is still in progress**; do not begin Phase 4 Sacrifice Catalog prematurely. No customers or in-game shop sales.

**Discovery journal**
- Maintain `seenFigures: number[]` in the existing version-1 `bit-bazaar-save-v3` payload. A figurine becomes **discovered only when physically picked up or inspected in-world**. A shelf pickup also counts. Browsing an unobserved figure inside the Almanac cannot unlock its identity or lore.
- Old saves (before v0.11) populate the journal conservatively from already-shelved figures, figures in hand and dropped ground-position entries. All other figures remain undiscovered until observed. Existing shelves, saved slot positions, 45 floor patches, 60 clean faces, 18 hidden collectibles and lifetime perfected sets remain unchanged.
- For the 300 named sets, an interactive journal overview shows the number of real discovered figurines (of 3,000), figures on shelves, currently perfect rows, lifetime mastered sets, started sets, and full-but-unsorted rows.
- **Six filters:** all, in progress, needs sorting, perfect now, undiscovered, mastered ever. **Four sorts:** collection number, closest to completion, most discovered, A–Z. Search by set name, theme or numeric set ID. Results are paginated 48 at a time to keep mobile DOM work bounded.
- Individual set pages display ten real existing miniature sprites when discovered, **dark silhouette placeholders** for unseen IDs, set names/number, exact current shelf-slot order, and links to the specific assigned shelf. Unseen figure roles, names, lore and any loose/secret positions are NOT disclosed by the journal.
- Inspection cards remain available for known figurines, and all 3,000 figure IDs continue to use the original atlas and collision-safe world positions.

**Improved Store Map**
- **FIT STORE / ZOOM 2× · DRAG** modes, with a panning viewport for magnifying rack labels on iPhone.
- Dropdown to quickly locate only sets that have already been started in an actual assigned row. Selecting one zooms the logical focus to its real fixture, display face and highlighted collection row; the map still never points to scattered figurines.
- Existing 40 fixture polygons, 60 real shelf faces, and player location/direction remain driven by game state; no map redraw work is performed every render frame.

**QA:** automated tests checked initial 0/3,000 discoveries, paginated 48/96 set cards, unknown-vs-known figure privacy, pickup/drop/reload journal persistence, all six filters and closest-to-completion sort, a full unsorted 10-figure row earning 0 completion credit, rearranging to exact 1–10 earning 1 permanent mastered set, map collection lookup/zoom, old-save migration for carried/shelved/dropped figures and v0.11-compatible low-FX fallback. The 1,440-tick simulated performance run rendered 480 frames under the existing 112-canvas and near/mid/far limits. **Physical iPhone playtesting is still required.**

**Safe fallback:** [baseline-v0.11.0-lowfx.html](./baseline-v0.11.0-lowfx.html) runs a ~20fps, low-draw renderer with the same `seenFigures` and restoration save schema. Severe simulated frame stalls navigate there instead of an older build that could lose discovery history.

**Next:** Phase 3 polish for small-screen readability, longer session save QA and collector browsing; get feedback on the actual iPhone UI before Phase 4.

## v0.10.0 — Phase 2 polish + Phase 3 interactive floor-plan milestone
The six-phase creative plan is defined by [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md). This release finishes an initial **Phase 2 cleaning-feedback pass** and begins **Phase 3**; it does not claim Phase 3's entire almanac and mapping work is finished.

**Cleaning and restoration polish:**
- New reticle-targeted step meter: **CLEANING 0/1, 0/2 or 0/3** as appropriate for papers, cartons, stains and dirty shelf faces. Context adapts to a held figurine and still requires **empty hands**.
- Brief, CSS-only brush/sparkle feedback identifies the specific completed action (e.g. WIPE DUST, FLATTEN CARDBOARD, POLISH FLOOR), with no new texture atlases, canvas allocations, timer-driven chores, or ability to clean dirt multiple times.
- Completing **all 60 shelf faces** or **all 45 permanent floor messes** triggers a short milestone banner. If both are restored, it recognizes the **entire shop as spotless**. All 18 previously hidden figurines remain within the original 3,000 and discovery/save tracking remains untouched.

**The Store Map (first Phase 3 milestone):**
- New **▦ MAP** button in the iPhone top bar and **M** on desktop. The existing **COLLECTION** button remains accessible.
- Overhead, interactive SVG layout is built **directly from the 40 existing fixture records**, not a generic invented map: 20 double-sided freestanding racks + 20 wall displays, containing all **60 real display faces** and five rows per face.
- Shows the player's saved/current x/z position and heading as a bright directional arrow, updated whenever the map is opened. Selecting any fixture displays front/rear face controls (where relevant), current clean/dirty status, five individual rows, their assigned collection names, occupied slot numbers 1–10, current/perfect/sort-needed states and overall row totals.
- Tap a set on the map to open it in the existing collector almanac. From a set's almanac detail page, **SHOW SHELF ON STORE MAP** jumps back to the exact fixture, face and highlighted set row.
- Intentionally **does not reveal any loose or hidden figure locations**; the locator is only for already-shelved collections. SVG is created only when the map drawer opens or selection changes, so there are no continuous map-frame redraws.
- Map and cleaning feedback are presentation-only additions to the existing `bit-bazaar-save-v3` schema: no migration or player progress reset required.

**QA / release:** verified 40 clickable fixture shapes, 60 physical faces, real two-sided row assignments, saved figure slot order, player coordinates/heading, two-way map/almanac links, and 60-shelf + 45-floor + 18-hidden restoration milestones. Replayed 1,440 simulated animation ticks (480 drawn frames) with **≤112 cached sprite canvases** and unchanged 70/30/65 near/mid/far rendering limits. Existing [v0.9 low-effects recovery](./baseline-v0.9.0-lowfx.html) remains save-compatible and was exercised under simulated high frame latency. Real-device iPhone QA is still needed.

**Next Phase 3 work:** expand the illustrated Almanac and store-map readability, discoverability and selection polish; do not start decorations before Phase 3 is reviewed.

## Phase 2 environmental restoration milestone — v0.9.0 (Nov 3, 2026)
This is the next playable Phase 2 increment under [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md). The game still has no customers, sales, timers, or automatic dirt respawns.

**Implemented:**
- **45 permanent floor-cleaning locations** placed deterministically in collision-free aisles. Three visually distinct types, **15 each**: scattered papers/wrappers, cardboard shipping cartons and stained/scuffed floor patches. Real 16-bit world geometry (no new texture sheets, sprite atlases, or canvas allocations).
- **Three different cleanup interactions**, all requiring **EMPTY HANDS**, aimed with the existing center reticle and cleaned using the ordinary action button / E key:
  - Paper: **GATHER SCRAPS** in one action, removing scattered wrappers.
  - Cartons: **FLATTEN CARDBOARD → REMOVE PACKING**; box piles physically flatten before disappearing.
  - Scuffs: **SWEEP GRIT → SCRUB STAIN → POLISH FLOOR**, visibly improving with each stage.
- Objects disappear permanently when clean. Small in-world green feedback and messages celebrate progress. HUD tracks **SHELVES 0/60 · FLOOR 0/45 · HIDDEN 0/18** (or the player's saved values).
- **Existing v0.8 saves** gain the 45 new optional cleanup patches without resetting their prior clean shelves, discovered hidden figures, named figure placements, numbered slots or lifetime mastered collections. A one-time pre-update copy is kept at `bit-bazaar-v3-before-floor-cleaning`. All partial floor-cleaning stages are saved to `floorCleaning[45]` in `bit-bazaar-save-v3`.
- All **3,000 real figurines** remain unchanged. **18 secret figures** remain linked exclusively to their previous shelf packaging messes. Cleaning ambient floor objects never creates or consumes collectible figures.
- Enhanced **v0.9 low-effects recovery** at [baseline-v0.9.0-lowfx.html](./baseline-v0.9.0-lowfx.html), which retains the same current save format and targetable clutter, but replaces detailed cardboard/trash/stain geometry with simple in-world colored shapes, omits shelf grime art and lowers scene rendering to 42 near, 12 mid, 20 far and 20 FPS. Emergency slow-frame diversion never opens an old build that would discard floor-cleaning progress.
- **Regression QA**: all 45 locations checked for fixture collision, all cleanup types and 1/2/3-stage completions, midway-save reload, save migration, 18-figurine preservation, reticle aim to a floor mess, and a 1,200-tick simulated iPhone scene render (400 rendered frames; ≤112 cached sprite canvases). Simulated severe frame stalls reached the safe v0.9 recovery page. Physical iPhone testing still needed.

**Remaining Phase 2 polish**: optimize and visually refine individual cleaning actions based on iPhone feedback and ensure restoration goals/readability continue to feel satisfying. Phase 3 almanac map work begins after Phase 2 acceptance.

## Phase 2 cleaning first playable milestone — v0.8.0 (Nov 3, 2026)
The six-phase creative scope remains frozen in [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md). This is the **first Phase 2 slice**, not a claim that the entire cleaning phase is completed.

**Implemented:**
- New stores start with **all 60 shelf faces dusty, cobwebbed and littered**. Each face requires three brief, reticle-targeted empty-hand actions: **WIPE DUST → REMOVE COBWEBS → CLEAR PACKAGING**. The face's five rows cannot be used until all three stages are complete.
- Aimed dirty rows highlight teal and the normal PICK UP / PLACE button becomes **CLEAN**; the PUT DOWN action allows freeing the single occupied hand. With a held figure, the shelf rejects placement and explains why.
- Cleaning visibly strips low-cost procedural dust haze, spiderweb strands and cardboard scraps from that display. Restoration is permanent, and no grime respawns randomly.
- Exactly **18 unique IDs from the original 3,000 figurines** are hidden in 18 fixed shelf-face messes, not generated in addition. They have `onFloor=false` while concealed. Finishing their specific packaging cleanup reveals the real collectible with a nearby, collision-checked floor position, turquoise highlight and collectible discovery toast. Cleaned progress and discoveries are written to `bit-bazaar-save-v3`.
- Lightweight on-screen tracking of **restored faces (0–60)** and **hidden discoveries (0–18)**, with no additional texture atlas or permanent canvas allocations.
- Existing pre-cleaning saves are **grandfathered**: all 60 faces are already restored and all 18 special IDs remain accessible as before, without any saved positions getting locked or reset. The untouched original pre-cleaning v3 state is backed up once to `bit-bazaar-v3-before-cleaning`.
- The emergency fallback is now [baseline-v0.8.0-lowfx.html](./baseline-v0.8.0-lowfx.html), which uses the *same new save and cleaning/discovery rules*, but skips procedural grime drawing and runs at a reduced ~20 FPS, 42 near / 12 mid / 20 far budget. It does not register a conflicting service worker.
- QA tested 60 three-step cleans, 18 unique secret reveals, pickup/place/drop constraints, exact preservation of all 3,000 figures and slot positions, full save reload, old v0.7 migration including lifetime mastery, reticle CLEAN interaction and low-effects recovery. In 1,200 simulated 60 Hz frames, 400 images were rendered within the original 112-sprite canvas ceiling. **Real-world iPhone QA is still needed.**

**Next within Phase 2:** expand off-shelf environmental cleaning (loose trash, floor messes, packaging piles) and polish the cleaning actions/art, while preserving the 18-figure hidden-discovery cap and existing performance safeguards.

## Phase 1 inspection & presentation milestone — v0.7.0
The [locked master roadmap](./MASTER_ROADMAP_LOCKED.md) remains in effect. Development is continuing Phase 1 only: no customers, no shop sales, and no new high-memory sprite sheets.

**Implemented in v0.7.0:**
- **Figurine CLOSE-UP** inspection from the **⌕ LOOK** button when holding or aiming at a loose / shelved figure, desktop **F**, and now-tappable individual entries in the collector's almanac.
- A single lightweight inspection card magnifies the existing 32×40 pixel sprite; includes original figurine name, themed collection name, set and individual #1–10, role/codename, current hand/shelf status, and a distinct short dynamically generated lore vignette. It never reveals loose figures' map coordinates.
- Large **PERFECT 1–10** CSS-only celebration, naming the just-finished collection. It distinguishes the first time a set is perfected from perfecting it again. Short-lived reticle and highlighted shelf-cubby feedback on picking up, swapping, placing and undo.
- Persistently track **lifetime first-perfect sets** separately from *currently perfect rows*, preparing for future permanent achievements and Sacrifice Catalog re-scatters. Old v0.6 saves infer previously perfect sets and migrate automatically without modifying the old recovery save; new saves store `lifetimePerfect` as an array of 0–299 IDs.
- While the inspection overlay is open, walking and world drawing are paused. Closing returns to normal play, or to the previous almanac panel if inspection started there.
- Slow-render emergency recovery now loads [baseline-v0.6.0.html](./baseline-v0.6.0.html), which uses the former ordered-slot renderer; its recovery script preserves the new lifetime mastery property and ten-slot save positions instead of silently discarding them.
- QA verified a shuffled ten-figure row is NOT complete, one-handed sorting yields first-ever completion, reverting and re-perfecting retains lifetime count, in-game inspection content and 3,000 distinct micro-lore snippets, save reload and legacy mastery migration. Further 720 simulated animation ticks verified 240 rendered frames, 112-canvas ceiling, 70/30/65 visibility caps; severe slow-frame fallback was exercised successfully. **A physical iPhone browser test is still necessary.**
- **Still pending for Phase 1:** visual/art review of the individual figure inspection display and refinements based on real-device feedback. Phase 2 cleaning/cobwebs and 18 hidden figurines have not yet been implemented.

## Phase 1 first playable milestone — v0.6.0
Master scope and stage gates are locked in [MASTER_ROADMAP_LOCKED.md](./MASTER_ROADMAP_LOCKED.md). No customers, no standard store sales.

**Implemented and tested in v0.6.0:**
- Ten independently selectable **physical slots** for each shelf row; the center reticle targets individual slots on all 60 shelf faces (including the reverse sides of the 20 double-sided racks).
- Players decide where each figure is placed; collectible sets are clearly named with individual **#1–10** labels in the HUD, on close shelf art and in the almanac.
- With an empty hand, aim at a placed figure to **LIFT** it. While holding a matching figure, target another occupied slot to **SWAP** the two, carrying only the displaced figure.
- **PERFECT completion counts only a fully ordered 1–10 set.** Full but scrambled rows are marked “FULL — SORT 1–10” and do not advance the completion counter or grand finale.
- Explicit physical slot positions are saved alongside old compact membership rows in `bit-bazaar-save-v3`. Legacy saves migrate without losing existing placements; their pre-update contents are backed up once under `bit-bazaar-v3-before-ordered-slots`.
- Existing single-hand carrying, wrong-set rejection, deliberate whole-set movement to a new empty row, undo, up/down reticle camera, shelf occlusion and performance safeguards continue working. Repeated extreme slow frames recover to [baseline-v0.5.0.html](./baseline-v0.5.0.html).
- QA: fill one row with 10 out-of-order figurines (zero completions), reorder via physical one-hand swaps (one completion), save/reload slot positions, verify pre-v0.6 compact-save migrations, precise left-to-right slot aiming on both sides of a freestanding shelf, correct 3,000-figure totals, and 1,440 simulated 60 Hz ticks with <=112 cached sprite canvases.
- **Not yet implemented**: polished close-up inspection animation/lore and the rest of Phase 1; Phases 2–6 stay locked as later work. No claim of physical-iPhone certification.


iPhone-first pixel-art collectible-store game. Live: https://hdog960.github.io/The-Bit-Bazaar/

## v0.5.0 — center-reticle interactions and vertical camera (Nov 3, 2026)
- Players drag up/down to look vertically (about ±54°), in addition to yaw. Camera pitch is stored in the same v3 save; old saves default safely to level.
- The fixed reticle in the physical center of the screen is now the interaction target. Look directly at a loose figure within pickup distance to select it; press PICK UP/E or tap the view. Off-center tap hitboxes are removed.
- While holding exactly one figurine, aim at a **specific row** (bottom 1 to top 5) on the nearest visible rack face. The selected row glows mint when valid or pink/red when it holds a different set or is full; the action label reflects its state. No shelf panel appears.
- Any **empty** row accepts the figure; a row already holding the matching set accepts another member. Incorrect sets cannot be mixed; each physical row holds at most ten. If that set was started on a different shelf, placing into an empty targeted row **moves its already-shelved pieces together** to the new row, preserving full 10-figure set completion. UNDO restores the previous set location.
- Pitch applies to project(), clipped polygons and the floor raycast. The floor renderer uses one fixed 480×270 ImageData buffer and only writes below the current horizon; no per-frame canvas allocation.
- The original 70 near / 30 medium / 65 far display limits, 112 small-canvas recycled sprite ceiling, shelf occlusion and sticky LOD remain unchanged. Three repeated severe (>115ms) frame stalls now recover to `previous.html` (known v0.4.0 direct-shelving build) rather than the older v0.3.0 recovery.
- QA: five individually aimable rows on one shelf, physical floor sprite aim/pickup, rejection of wrong set, matching row insertion, group relocation/undo, portrait drag up/down, reload of pitch and collection progress, reverse-face and wall-shelf selection, 1,440 simulated ticks, and automated fallback check. Real iPhone validation still required.

## v0.4.0: one-at-a-time, direct shelving (Nov 3, 2026)
- The player holds **exactly one figurine** at a time, not ten. A second pickup is blocked until the first figure is placed or put down.
- The separate tote and shelf placement menus have been removed from the gameplay loop. On iPhone, approach any shelf face while carrying a figure and tap **PLACE** (or tap the shelf directly). Desktop players press **E**. Collection Almanac remains available.
- The engine chooses the matching row if that set is already assigned to this display face. Otherwise, it claims that face's first unused row. It refuses incompatible placement, mixing sets, full rows and splitting one set across different display faces.
- The bottom-right UI is now a compact **held figure display**, with actual pixel sprite, figure name, set name and a **PUT DOWN** button. Putting down places the figurine physically in a nearby open aisle; that location is saved with the normal game progress.
- After a successful placement, that same small button becomes **UNDO**, reclaiming the most recently shelved figure into the player's single free hand. Picking up another figure clears the undo state; no shelf menu is required.
- Existing v3 saves and shelf assignments remain. If an older tote saved multiple carried figures, the previously selected figurine is retained, extras are restored to their deterministic floor spawn locations, and an original full-save backup is written once to `bit-bazaar-v3-before-single-carry`. The old v1 recovery save remains untouched.
- Retains 3,000 figures, 300 sets, 60 display faces, 112 re-used pixel canvases, the existing occlusion and sticky distance rendering, and automatic performance fallback to `stable.html`.
- QA: one-hand pickup, wrong shelf rejection, same-set row continuation, wall-shelf direct placement, floor put-down and persistence, original save migration, and 1,440 simulated 60Hz animation ticks with 24 FPS render budget. Real-device iPhone confirmation remains needed.

## v0.3.3: shelf-depth visibility and occlusion (Nov 3, 2026)
- Previously a floor figurine or displayed collectible behind a shelving unit could be composited in front of it by the engine's center-depth painter sorting.
- The scene now uses a true 2D **line segment vs. rotated shelf rectangle** visibility check for both floor racks and perimeter wall shelving. A ray only blocks a figurine when the wooden rack physically intersects the sightline between the camera and the figure.
- The check applies consistently to 70 near, 30 midrange and 65 distant figurines, to recent persistent IDs, to focused pickups, and to figures placed on other shelves. A shelf is excluded from testing against its **own front-facing displayed figures**.
- Broad-phase centerline-distance filtering skips precise intersection math unless a shelf could be on the sightline. The shelf geometry is cached; only camera-local data is updated per rendered frame.
- 1,440 simulated animation steps and nine targeted occlusion geometry cases passed, including front/back, sides, shelf ends, wall units, clear aisles, and the case of one shelf's displayed items behind another shelf. No blocked sprites remained in the final render ID set.
- All 3,000 figure records, 300 sets, 60 faces, existing `bit-bazaar-save-v3` saves, ~24 FPS adaptive frame pacing, 112-canvas allocation ceiling, and `stable.html` fallback remain unchanged. Physical iPhone testing is still recommended.

## v0.3.2: fixed visible figure popping and re-selection (Nov 3, 2026)
- Previously the near renderer sorted candidate figures by proximity every frame, forcing large groups to appear/disappear after very small player movements or camera turns.
- The new renderer **retains actual visible IDs** across frames and chooses unoccupied drawing slots using a deterministic ID hash; figures no longer re-roll simply because the camera moved one step.
- Near/mid/far LOD distance boundaries now overlap by ~1.75 store units, with a hysteresis buffer that keeps each figure's previous tier rather than snapping exactly at 19 or 29 units.
- Figures within 6.5 units get priority in the near budget; distant figure representation still uses stable seven-per-cell samples.
- The original 480×270 canvas is displayed with `object-fit: cover`. On portrait iPhones most of the canvas's horizontal field is cropped off-screen. Rendering selection now accounts for the **actual portrait viewport width**, so offscreen figures don't use the 70/30/65 drawing allowance.
- Retains exactly the existing sprite memory limits (112 recycled 32×40 canvases), frame limiter (~24 fps, adaptive to 20), and the three-slow-frame fallback to `stable.html`.
- QA: 1,440 simulated animation ticks, valid 3000-figure/300-set /40-unit/60-face collection, valid front/rear/wall placement, no memory-cap overrun, and no mutation of original v1 saves.
- Comparative scene sampling before the final close-range priority improvement saw portrait one-step figure re-selection drop from about 24–34 IDs to 3–10 IDs, even though the old version was spending its budget on offscreen figures.
- This is simulation QA; users should still test on a real iPhone and use `stable.html` if device responsiveness decreases.

## v0.3.1: optional-distance upgrade to the stable 3,000-figure expansion
- Full unique pixel sprites still render with a hard 70-figure cap to 19 store units.
- Farther away, an additional **30** figures render as tiny sprites from the **already-loaded original atlas** (no extra sprite texture generation) between roughly 9 and 29 store units; selected figures are distributed across near/middle/outer depth bands.
- Beyond 29 units, up to **65** lightweight pixel silhouettes are visible out to **39 store units**, about twice the original view distance. These are simple colored rectangles, not new images.
- The distant renderer samples no more than 7 real figure references per six-unit spatial tile, so camera rotation doesn't scan all 3,000 figures.
- If the added distance causes repeated severe frame stalls, the game switches to [stable.html](https://hdog960.github.io/The-Bit-Bazaar/stable.html), the previously verified 3,000-figure v0.3.0 engine, which uses the SAME v3 save. That engine can still fall back to safe.html, the 1,000-figure recovery game, if needed.
- This was tested in 1,200 simulated animation iterations with 112 small sprite canvases maximum. Physical iPhone testing remains necessary to verify comfort and stability.

## v0.3.0: safe 3,000-figure expansion
- **3,000 unique collectible IDs and names**, distributed across **300 themed sets of exactly ten**.
- **20 freestanding racks with TWO usable faces**: 20 × 2 × 5 × 10 = **2,000 shelf slots**.
- **20 single-sided wall shelves**: 20 × 5 × 10 = **1,000 shelf slots**.
- **300 independent display rows**. Each row accepts one complete 10-figure set; different sets cannot be mixed, and a set cannot be split across rows.
- All 2,000 additional figures extend the original 1,000 sprites using eight distinct pixel-art edition palettes and silhouette accessories (crowns, wings, banners, horns and so forth). Each new visual is generated *only on demand*.

## Performance and safety
The earlier v0.2.0 release was rolled back after it apparently overwhelmed an iPhone. That version built a 800 × 4,800 pixel atlas synchronously, processed 2,000 additional recolors at launch and repeatedly scanned all 3,000 collectibles while rendering. **Do not restore v0.2.0's buildAtlas function.**

v0.3.0 instead:
- Keeps the original 800 × 1,600 pixel atlas loaded as a single static image.
- Generates tiny **32 × 40 pixel** alternate figures lazily (maximum two conversions per rendered frame).
- Has a **112-slot sprite-cache ceiling**. Old GPU canvas surfaces are *reused* rather than constantly allocated.
- Uses a fixed 6-unit spatial grid for the collectible floor. Nearby cells alone are searched for rendering and pickup.
- Renders at most 70 nearby floor figures each frame, or 42 in slow mode, while all 3,000 remain actually collectible and saved.
- Caps the mobile software renderer near 24 FPS (20 FPS during slow-frame protection).
- If three severe 115 ms render stalls occur, stops the expansion and navigates automatically to the safe 1,000-figure recovery page.

All of these limits have code-level and simulated-frame QA tests, but **they are not a guarantee of device stability**. Do not claim the build has been tested on a physical iPhone until it has.

## Recovery / saves
- Normal game: `index.html` → `game-v0.3.js` and assets. The save key is **`bit-bazaar-save-v3`**.
- Emergency recovery: [safe.html](https://hdog960.github.io/The-Bit-Bazaar/safe.html) → old original `game.js`, using its original **`bit-bazaar-save-v1`** key.
- The 3000-figure game copies old v1 progress on its first launch without deleting or overwriting v1 data. Its first 20 shelf fronts correspond to original shelves 1–20.
- The old `game.js` is retained deliberately. Do not replace it with the expanded renderer.
- `sw.js` caches both builds with network-first updating and offline support. To publish, GitHub Pages serves the `main` branch at root.

## Controls
iPhone: left joystick to move, drag the right side to look around, tap pick-up/shelf action button. Desktop: WASD, drag to look, E interact, TAB collection.

## QA
- [preview.html](https://hdog960.github.io/The-Bit-Bazaar/preview.html) is a non-service-worker preview for browser testing.
- `qa.html` includes a scripted camera-turning and performance harness. Some content-fetching services return its static HTML without executing JavaScript, so do not misinterpret static `QA: BOOTING` as a runtime failure or success.
- The game exports `window.BitBazaarQA.stats()` with visible/cached sprite counts, draw cadence, and 60-face capacity; it also supports placement tests across old, reverse and wall fixtures.
