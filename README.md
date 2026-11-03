# The Bit Bazaar — The Great Figurine Sort (v0.2.0)

A first-person 16-bit-inspired figurine-store sorting game optimized for the iPhone Home Screen. Live game: https://hdog960.github.io/The-Bit-Bazaar/

## Play on iPhone
Open the live site in Safari, use Share → **Add to Home Screen**, and launch from the icon. Walk with the left joystick, drag the right side to look around, and use the action button to collect and shelve. Desktop: WASD + pointer drag + E. Saves remain local to the same browser/Home Screen installation.

## Figurine collection and displays
- **3,000 individually identified collectible figures**, grouped into **300 named sets** of exactly ten characters.
- **20 freestanding, double-sided aisle racks** (two genuinely independent, fillable faces × five rows × ten per row) = **2,000 slots**.
- **20 wall shelves** (one display face × five rows × ten per row) = **1,000 slots**.
- In total: **40 physical shelf units, 60 usable faces, 300 ten-figure display rows, exactly 3,000 slots**.
- A row can only hold figures from one complete set; a set cannot span different rows.
- Existing saves from the original 20-shelf release migrate to the original racks' front faces; collected figure IDs and progress are preserved.
- Original 1,000 sprites remain intact in `assets/figurines.png`. `assets/collection-extension.js` contributes 200 new themed ten-figure sets, and `game.js` builds additional pixel-art atlas tiles with new colorways, silhouettes and accessories after the source sheet loads.

## Visual approach
- Center-floor shelving has stocked fronts and backs, with no floating shelf-number billboard text.
- 20 one-sided wall displays are placed around the north, south, west and east interior walls.
- No arbitrary wall slogans; shelf IDs remain available in the actual interaction/drawer interface.
- Uses hard-edged pixel rendering and the existing burgundy, gold and violet wooden shop aesthetic.

## Tech and deployment
`index.html` loads both collection data files before `game.js`. `style.css` styles menus and dynamic sprite thumbnails. `sw.js` is network-first and caches the new extension script for offline use. GitHub Pages deploys automatically from `main` at repository root; reopen the Safari/Home Screen game after the Pages deployment to receive this version.

### QA checklist
1. On first entry, the HUD reports 0/3,000 figures and 0/300 sets, and the floor has loose figurines.
2. Approach both sides of an aisle rack with a figure in the tote; interact with each side and verify separate rows.
3. Approach a perimeter wall shelf and place a figure; check that it uses one 50-figure bank.
4. Verify no giant SHELF NN world-space text or nonsense wall signs appear.
5. Check that a figure from one set cannot join a different set's row, tote holds a maximum of ten, and saved progress survives reopening.
6. Open Collection Almanac to browse all 300 sets and ensure both original and newly recolored/accessorized figurines are shown.
