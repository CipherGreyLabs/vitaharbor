# VitaHarbor data-worker VitaDB exclusion acceptance — 2026-10-08

## Scope and core rule application

- **Rule:** RELEASED ports and games already listed on VitaDB are not tracked in the VitaHarbor active development/discovery ledger. VitaHarbor exists to track in-development WIPs, decompilations, and newly surfacing ports before/outside VitaDB releases.
- **Removed 9 projects:**
  1. `openmohaa-vita` (Medal of Honor: Allied Assault / OpenMoHAA)
  2. `smash-melee-vita` (Super Smash Bros. Melee)
  3. `hollow-knight-vita` (Hollow Knight)
  4. `zelda-ship-of-harkinian-vita` (Zelda: Ship of Harkinian)
  5. `fallout-2-ce-vita` (Fallout 2 Community Edition)
  6. `renegade-vita-demo-release` (Renegade Vita Demo)
  7. `c-dogs-sdl-vita` (C-Dogs SDL)
  8. `diddy-kong-racing-golden-balloon` (Diddy Kong Racing Golden Balloon)
  9. `cnc-renegade-vita` (Command & Conquer: Renegade)

## Remaining Curated Ledger Summary (19 active projects)

1. `zelda-twilight-princess-vita` (The Legend of Zelda: Twilight Princess)
2. `portal-vita` (Portal Source Engine / N64 Decomp)
3. `spider-man-total-mayhem-vita` (Spider-Man: Total Mayhem)
4. `simpsons-hit-and-run-vita` (The Simpsons: Hit & Run)
5. `kotor-vita` (Star Wars: Knights of the Old Republic)
6. `nfs-hot-pursuit-vita` (Need for Speed: Hot Pursuit)
7. `renpy-8-runtime-engine` (Ren'Py 8 Runtime Engine)
8. `slingshot-racing-vita` (Slingshot Racing)
9. `render96-sm64-hd-vita` (Render96 HD SM64)
10. `celeste-classic-vita` (Celeste Classic)
11. `rc-cars-vita` (RC Cars)
12. `cod-zombies-ios-loader` (Call of Duty: Zombies iOS Loader)
13. `call-of-duty-4-vita` (Call of Duty 4: Modern Warfare)
14. `resident-evil-4-vita` (Resident Evil 4)
15. `real-racing-2-vita` (Real Racing 2)
16. `gta-lcs-vita` (GTA: Liberty City Stories reStories)
17. `test-drive-iii-vita` (Test Drive III)
18. `test-drive-ii-vita` (Test Drive II)
19. `halo-ce-vita` (Halo: Combat Evolved)

## Synchronized files

- `src/shared/constants/fallbackData.ts`: pruned games, projects, developers, and updates.
- `data/media-manifest.json`: rebuilt for 19 projects.
- `src/web/components/ledger/types.ts`: updated `KNOWN_REPOS`.
- `tests/unit/link-integrity.test.ts`: updated repository assertions.
- `tests/e2e/archive.spec.ts`: updated deep links and selector assertions.

## Verification

- `npm run verify`: typecheck clean, 23 unit test files (135 tests) passed, build generated 19 project pages, 22 sitemap URLs.
- `npm run test:integration`: 1 file (7 tests) passed.