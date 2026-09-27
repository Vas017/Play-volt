# PLAY VOLT: FROSTBOUND — brand-new build

This folder is a clean production build and does **not** use the rejected `rebuild/` visual foundation.

## Non-negotiable visual target

- Third-person chase camera behind a futuristic electric snowmobile.
- Huge snowy alpine valley at night with aurora, cliffs, forests, cabins, castles, stone bridges, lamps, fences, banners, rivers and glowing waterfalls.
- Real photographic mountain/aurora imagery is used for distant cinematic scenery.
- Important close objects use real GLB/glTF assets rather than primitive placeholder geometry wherever suitable assets are available.
- Snow, fog, mist, powder spray, speed streaks, boost glow and warm/cold lighting contrast.
- Premium mobile arcade HUD.

## Gameplay target

Steer, boost, jump, hit ramps, collect Volt energy, avoid obstacles, build distance, complete missions and score airtime/tricks.

## Current implementation policy

The build lives only under `frostbound/` on branch `play-volt-frostbound-new` until it has been run in a real browser, tested on a mobile portrait viewport, captured in real in-game screenshots and visually compared with the user's target.

**Do not replace the repository root `index.html` before that acceptance gate passes.**

## External visual assets

The prototype uses a realistic aurora/snow landscape photo from Unsplash for the far-distance cinematic backdrop and web-optimised CC0 GLB assets from 3DAssets.dev for the hero snowmobile and alpine scene dressing. These are runtime-loaded from their public CDNs.
