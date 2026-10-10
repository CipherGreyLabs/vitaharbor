# VitaHarbor data-worker graduated games and RS2 promotion acceptance — 2026-10-11

## Scope and actions taken

### 1. Expanded `GRADUATED_PROJECTS` (27 VitaDB Releases)
Synchronized `src/shared/constants/graduatedData.ts` with all 27 officially released VitaDB titles, including their live VitaDB IDs and URLs:
- `predators-vita` (PREDATORS Vita, ID 1604, by AJ170 on 2026-10-10)
- `halo-ce-vita` (Halo CE Vita, ID 1558, by BirchWoodGod)
- `kotor-vita` (VitaKotor, ID 1515, by ScoobyDouche)
- `openmohaa-vita` (OpenMoHAA Vita, ID 1496, by HenryKun55)
- `smash-melee-vita` (Smash Melee Vita, ID 1524, by zm2283145)
- `hollow-knight-vita` (Hollow Knight Vita, ID 1168, by PatnosD)
- `zelda-ship-of-harkinian-vita` (Ship of Harkinian Vita, ID 1276, by Rinnegatamante)
- `fallout-2-ce-vita` (Fallout 2 CE, ID 842, by Northfear)
- `c-dogs-sdl-vita` (C-Dogs SDL Vita, ID 1527, by abduct)
- `diddy-kong-racing-golden-balloon` (Golden Balloon Vita, ID 1512, by zm2283145)
- `rebounce-vita` (reBounce Vita, ID 1597, by myname24)
- `plants-vs-zombies-2-vita` (Plants vs Zombies 2 Vita, ID 1574, by LeZergan)
- `insaniquarium-vita` (Insaniquarium Vita, ID 1585, by KartingSackboy06)
- `umineko-project-vita` (Umineko Project Vita, ID 1581, by stoicpingu)
- And previous graduated releases (Class of '09, Cave Story, Diablo II, Illusia, Jedi Academy, Jedi Outcast, Barony, Test Drive 1987, Test Drive II, Test Drive III, Aleph One, Apotris, Prince of Persia Classic).

### 2. Active Curated Ledger Alignment & RuneScape 2 Promotion
- Removed `predators-vita` from `FALLBACK_PROJECTS` in `src/shared/constants/fallbackData.ts` (graduated to VitaDB).
- Promoted **RuneScape 2 Singleplayer Client** (`runescape-2-vita`, ID 54) by *me11yb3an* based on `client-c` to active WIP in `fallbackData.ts` with complete `setup_evidence` (`ux0:data/rs2/`, `libshacccg.suprx`, 444 MHz overclock).
- Active in-development WIP count remains exactly **24 active projects** (24 games, 17 developers, 21 updates).

### 3. Visuals and Media Manifest Synchronized
- Generated 960×544 OLED-native WebP screenshot card: `public/screenshots/runescape-2.webp`.
- Updated `data/media-manifest.json` and `scripts/build-media-manifest.mjs` for all 24 active projects.
- Updated `KNOWN_REPOS` in `src/web/components/ledger/types.ts` with `runescape-2-vita`.

### 4. Feeds and Verification
- Synchronized `public/api/feed.json` and `public/api/rss.xml` via `scripts/make-feeds.ts`.
- `npm run verify`: passed typecheck, all 23 unit test files (135 tests) passed, build generated 24 project pages and 27 sitemap URLs.
- `npm run test:integration`: 1 file (7 tests) passed.