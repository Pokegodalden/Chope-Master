# Chope Master: Lunch Hour Rush

A complete browser game set in a Singapore hawker centre. Secure four seats with a tissue packet, buy four chicken rice sets, and return to your table before lunch ends.

## Run

Open the companion `Chope Master.html` directly in a modern browser. It contains the game, styles, and artwork in one file; no installation is needed. Fonts use Google Fonts when connected and system fallbacks offline.

For the editable source, run `node server.js` in this directory and open `http://127.0.0.1:4173`. No dependencies or build step are needed. Run `node --test tests/*.test.js` for the simulation and pacing checks.

## Controls

- WASD / arrow keys: move. Click or tap the map to walk using obstacle-aware paths.
- E: reserve a free table, place or collect an order at the red stall, collect supplies, or sit at your reserved table with food.
- Space: sprint using rechargeable stamina. Shift: sneak safely past tray robots.
- U: deploy the single umbrella beside your own outdoor table.
- L: use the single express lanyard at the chicken rice stall.
- P / Escape: pause. Touch movement and interaction buttons appear on small screens.

## Contextual actions

The mission bar sits above the game with the clock, three key objectives, compact inventory, pickup ticket, and current action. The old sidebar, explanatory action panel, and three-point presentation have been removed. The nearby interaction target is outlined on the map. Its prompt names the exact available action: `E · Chope 4 seats`, `E · Order chicken rice`, `E · Collect 4 plates`, supply collection, or `E · Sit & makan`. The mission-bar controls, touch button, keyboard, and inventory share one target state. Supply points take precedence over nearby tables; the stall takes precedence inside its serving area.

The mission bar also offers the umbrella or lanyard when usable, without explanatory paragraphs. Owned tables show a reservation countdown and shrinking bar, with an urgent color and a wash-away countdown during unprotected rain. The stall shows its pickup ticket, cooking countdown, progress bar, and ready state directly on the map. Screen readers receive target/action changes without announcing every countdown tick. Pausing removes active targets and disables interactions.

## Playable tutorial and collision fixes

Start the tutorial from the opening card or the “Learn by doing” panel. Seven lessons progress only when you perform the action: move to a marker, read the diner and reserve table 06, order, collect chilli, collect cutlery, collect lunch, and sit down. There is no countdown, reservation expiry, robot traffic, or rival competition. If you enter practice during a lunch run, that run is saved and restored when you exit or finish. Tutorial completions do not enter the regular high-score records.

Collision geometry includes stools, seated diners, plants, the tray station, other moving characters, and pickup displays. Movement uses small swept steps, finer pathfinding, and replanning around blocked actors. Chairs, diners, tabletops, plants, and walking characters are drawn in depth order.

The chilli and cutlery stations are fully illustrated Canvas assets in clear bays between the bottom tables. The red jar and chilli bowl, and the cutlery holder with spoons, forks, and napkins, stay visible before ordering and after collection. Their solid display areas prevent characters from walking over the artwork. Click either station to approach it from the entrance aisle; collection activates after ordering.

Rush is the default three-minute mode. Choose Relaxed before starting for a ten-minute clock and a longer reservation. The run unfolds in four stages: scout and chope, place your order, prepare and pick up, then bring lunch home.

Outdoor tables begin freeing at 42 seconds; the first sheltered table frees at 68 seconds. A forecast arrives at 8 seconds, before either choice, and the first downpour starts at 55 seconds and lasts 65 seconds. Outdoor reservations wash away after twelve rainy seconds unless protected by your umbrella. Reservations last 110 seconds in Rush and 150 seconds in Relaxed.

Uncle needs 70 seconds to prepare four plates. Your ticket keeps cooking while you leave the stall; the lanyard saves 12 seconds, and collecting chilli and cutlery from their marked bays saves another 10 seconds each. These supplies are optional. Return to the stall and press E when the ticket is ready. Losing a table does not cancel your food order: secure another table with a remaining tissue packet. Robots move 35% faster once you collect lunch, and collisions still cost five seconds. Hold Shift to sneak past them.

Best completion times are recorded separately for Rush and Relaxed in browser storage. The rebalanced version uses fresh records, so earlier 25-second runs do not compete with the new pacing.

## Artwork

`assets/hawker-cover.png` was generated with the built-in image generation tool. The complete prompt is in `assets/art-prompt.txt`. The interactive game board is drawn in Canvas so characters, clues, weather, and reservations respond to gameplay.

## Validation

Thirty-two tests cover the win loop, ordering prerequisites, reservations, rain, persistent cooking tickets, one-time bonuses, robot penalties, pause/timeout, pathfinding, rivals, mode selection, restart, contextual interaction, expanded collision geometry, clear pickup footprints, and all seven tutorial actions. End-to-end simulation runs use real movement, timers, and hazards: the sheltered route finishes in about 2:28; the prepared outdoor shortcut finishes in about 1:31. Faster play is rewarded rather than locked behind a minimum completion time.

Browser validation completed the updated outdoor route with a controlled browser clock and actual pointer/keyboard inputs: reservation, umbrella, ordering, both supply errands, ready-ticket pickup, return, victory, and restart.

The annotation update was also checked in the live browser: all seven tutorial lessons were completed with normal pointer and keyboard controls, both pickup illustrations and their clear approaches were inspected, and exiting practice restored an in-progress run with its timer preserved.

Sites publishing was attempted but the connector returned `sites_access_disabled`: Sites is not yet enabled for this workspace. No online deployment was created.

