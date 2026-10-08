# Handoff - VitaHarbor data worker 4 WIP promotion handoff

- Gegenereerd: 2026-10-08T20:52:36Z
- Actor: codex
- Model: gemini-3.7-flash
- ProjectRoot: C:\Users\suloW\.codex\worktrees\vh-data-acceptance-20261007\VitaPort
- Bronnen: 5

## Bronintegriteit

| Bestand | Bytes | SHA-256 |
|---|---|---|
| docs\DATA_WORKER_WIP_PROMOTION_ACCEPTANCE_2026-10-08.md | 1635 | C60CEFB1178BC0F63CE2138DBC953D99A4AC40D54104C62507F8403DDEDF7600 |
| src\shared\constants\fallbackData.ts | 68725 | DE9BA93477741AB169E5BAD882DB487510806456A499CA6D99DC6E38B83137F4 |
| data\media-manifest.json | 12467 | 0A34AA0183B4BC4AA622B8F39CB261D05AB7619A894CC3905622B37EE02CAEA6 |
| data\quarantine.json | 235938 | A021FDCBF22A7B3E55B710AF72ACFBE88330C209AEB1B5C68B27238556604D57 |
| public\api\feed.json | 14131 | 05CE1B84EF9143FF944F33CCE65A8955357641E5F8E347B5EFA020087F3A9A7D |

## Samenvatting

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

## Verificatie

Controleer de hashes voordat je deze samenvatting vertrouwt:

    powershell -NoProfile -ExecutionPolicy Bypass -File %USERPROFILE%\.codex\workflow\NEW-HANDOFF.ps1 -Verify "docs\DATA_WORKER_WIP_PROMOTION_HANDOFF_2026-10-08.md"

Een handoff is context, geen bron van waarheid. Workspace en Git zijn leidend.
