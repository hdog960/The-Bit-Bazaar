# The Bit Bazaar — The Great Figurine Sort

An iPhone-ready first-person pixel-art sorting game. Live site: https://hdog960.github.io/The-Bit-Bazaar/

## Play on iPhone
Open the live link in Safari, tap Share, then **Add to Home Screen**. The game uses touch controls: left joystick to move, drag the right side to look, tap the action button to interact, and the Pocket Tote button for inventory. Rotating the phone into landscape provides more room.

## Collectibles and progression
- **1,000 individually unique 32×40-pixel figurines** in `assets/figurines.png`
- **100 named sets of ten** in `assets/collection.js`
- **20 store shelves**, each with **five ten-slot rows**
- Each row must contain all ten figures from **one** set; a set cannot be split across rows.
- Progress is saved locally to this browser/home-screen app on this device.
- All assets are local to the site; the service worker supports cached offline play and network-first updates.

## Source
`index.html` is the entry point; `game.js` contains the renderer and gameplay, `style.css` covers desktop and mobile interfaces, and `assets/collection.js` plus `assets/figurines.png` provide the complete collection. `manifest.webmanifest`, `sw.js`, and `icon.png` support iPhone Home Screen installation.

Publishing: GitHub Pages from `main`, `/(root)`. Every push to `main` updates the same website. For best reliability after updates, close and reopen the home-screen app.
