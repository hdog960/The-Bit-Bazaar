# The Bit Bazaar — Developer-Owned QA Policy

**Adopted November 5, 2026** after explicit user feedback that player-performed QA should not be required.

## Required developer work, not player chores

The player must **never** be asked to take screenshots, run a 30-second device check, manually share a JSON, test a destructive restore, or approve a phase merely to let development continue. Game updates must still be patched and shipped with automated regression coverage. Existing in-game diagnostic tools remain **optional** for anyone who voluntarily uses them.

### Automated evidence
- The existing `Bit Bazaar safety checks` GitHub Action runs historical collection, decoration, save, renderer and snapshot tests in Node.
- The separate `Bit Bazaar mobile WebKit acceptance` GitHub Action launches a real WebKit browser engine at a 390×844 touch-screen viewport against a local HTTP server. It uses a disposable test profile, never a player's localStorage or device.
- The mobile WebKit test covers actual page load, game canvas non-blankness, 3,000-figure integrity, 180 original decorations and 232 anchors, read-only JSON File picker validation, browser-generated JSON download, test-only restore and undo, and loading 160 synthetic decorations in normal and Low FX builds.
- Developer must triage CI failures and fix the underlying code/test before declaring automated acceptance. A green static test or an HTTP 200 response alone is not enough to claim interactive browser QA.
- Keep old builds and backups available, enforce 112-sprite-cache memory bounds, protect the `bit-bazaar-save-v3` format, and never run destructive tests in a real user's session.

### Scope of proof
A Linux WebKit build shares an engine family with Safari but **does not replicate an actual physical iPhone, iOS Files integration, thermal throttling, Home Screen lifecycle, or device-specific memory pressure**. We can establish browser-level correctness and synthetic load behavior, not certify all iPhone hardware behaviors. Any unverified hardware concerns are documented limitations, not tasks assigned to the player or permanent excuses to halt the roadmap.

### Phase transition rule
Phase 4 may be closed and Phase 5 started based on passing automated historical tests plus mobile WebKit browser checks, absence of known high-severity data-loss/blocker defects, and an honest account of what was and wasn't tested. Physical-device signoff from the player is **not required**. If the browser acceptance suite fails, development continues with developer-owned fixes, rather than asking the player to test it for us.

## Phase 4 automated acceptance recorded

Historical suite, real Linux WebKit mobile viewport, disposable JSON download and restore/undo, and a 160-decoration dense render all passed on November 5, 2026. Evidence: [PHASE4_AUTOMATED_SIGNOFF.md](PHASE4_AUTOMATED_SIGNOFF.md). Phase 5 development may begin without any user device interaction.
