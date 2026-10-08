# VitaHarbor data-worker improvements 1 & 2 acceptance — 2026-10-08

## Scope and tasks completed

### 1. Automated VitaDB synchronization in the scanner pipeline
- Created `scripts/sync-vitadb-cache.mjs` which fetches the live VitaDB catalog from `https://www.rinnegatamante.eu/vitadb/list_hbs_json.php` using a realistic browser User-Agent.
- Successfully cached 1,146 live VitaDB entries into `data/vitadb-cache.json`.
- Integrated `node scripts/sync-vitadb-cache.mjs` into `.github/workflows/reddit-scanner.yml` so every scheduled scan refreshes the VitaDB catalog and commits the updated cache.

### 2. Promoted verified non-VitaDB quarantine releases to `fallbackData.ts`
- Promoted **Real Racing 3 Vita Beta 1.1** (by chutA7X, ARMv7 wrapper, playable release).
- Promoted **Call of Duty: World at War Zombies iOS port** (by devnoname120, playable v1.0 release).
- Curated active dataset expanded from 15 to **17 active in-development/WIP projects** (17 games, 11 developers, 14 updates).
- Updated `data/media-manifest.json` and `scripts/build-media-manifest.mjs` covering all 17 projects with proper artwork classification (`is_vita_gameplay: false`).
- Marked candidate items `reddit-1ww8upq` and `reddit-1wzdh5y` as `PROMOTED` in `data/quarantine.json`.

### 3. Public feeds synchronized
- Regenerated `public/api/feed.json` and `public/api/rss.xml` via `scripts/make-feeds.ts`.

### 4. Verification
- `npm run verify`: typecheck clean, all 23 unit test files (135 tests) passed, build generated 17 project pages and 20 sitemap URLs.
- `npm run test:integration`: 1 file (7 tests) passed.