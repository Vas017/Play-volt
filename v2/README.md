# PLAY-VOLT V2 — asset-first rebuild

This branch intentionally does **not** reuse the previous procedural rebuild.

## Rule

1. Approve real GLB/glTF visual assets first.
2. Build the playable scene around approved assets.
3. Run the game in a real browser and capture screenshots from the running game.
4. Compare those screenshots with the target quality bar.
5. Only after that passes may the root live `index.html` be replaced.

## Current asset stage

`v2/index.html` is an asset review studio, not the game. It loads real external GLB assets so the snowmobile, rider, alpine environment, village, waterfalls, bridge, ramps and collectibles can be visually judged before gameplay is built.

The live/root `index.html` is untouched on this branch.
