# VitaHarbor data-worker 4 WIP ports promotion acceptance — 2026-10-08

## Scope and actions taken

### 1. Promoted 4 verified active in-development WIP homebrew ports to `fallbackData.ts`
- **Buckshot Roulette (BuckshotRoulettePortable) (`buckshot-roulette-vita`, ID 46):** Native C++ rewrite by JustAverage456 targeting 60 FPS and vitaGL on Vita.
- **Star Wars: Dark Forces (TheForceEngine-VITA) (`the-force-engine-dark-forces-vita`, ID 47):** Native PlayStation Vita port of The Force Engine by SnooLobsters311, booting into interactive main menu.
- **SuperTuxKart (Vulkan 1.1 Native) (`supertuxkart-vulkan-vita`, ID 48):** Low-level Vulkan 1.1 graphics driver and 3D kart racing port in-game on Vita hardware by nyabsi.
- **Insurgency Vita (Tactical FPS) (`insurgency-vita`, ID 49):** Handheld recreation of the 2014 tactical FPS with weapons, attachments, maps, and audio by OneDumbFox.

### 2. Quarantined status synchronization
- Marked items `reddit-1wn46c9`, `reddit-1wlrv6x`, `reddit-1wkf9m5`, and `reddit-1wvob17` as `PROMOTED` in `data/quarantine.json`.
- Synchronized `public/data/discovered.json` via `scripts/reddit-provenance.mjs`.

### 3. Media manifest updated
- Updated `data/media-manifest.json` and `scripts/build-media-manifest.mjs` covering all 21 active projects with honest title card fallbacks.

### 4. Feeds and verification
- Synchronized `public/api/feed.json` and `public/api/rss.xml` via `scripts/make-feeds.ts`.
- `npm run verify`: passed typecheck, all 23 unit test files (135 tests) passed, build generated 21 project pages and 24 sitemap URLs.
- `npm run test:integration`: 1 file (7 tests) passed.