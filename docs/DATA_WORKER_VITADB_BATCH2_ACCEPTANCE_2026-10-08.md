# VitaHarbor data-worker VitaDB live sync batch 2 acceptance — 2026-10-08

## Scope and core rule application

- **Rule:** RELEASED ports and games already listed on VitaDB are excluded from the active VitaHarbor tracker.
- **Verified live VitaDB catalogue release additions (4 projects):**
  1. `halo-ce-vita` ('Halo CE Vita' by BirchWoodGod on VitaDB since 2026-10-07)
  2. `kotor-vita` ('VitaKotor' by ScoobyDouche on VitaDB since 2026-10-04)
  3. `test-drive-ii-vita` ('Test Drive II Vita' by smart-pickle on VitaDB since 2026-09-30)
  4. `test-drive-iii-vita` ('Test Drive III Vita' by smart-pickle on VitaDB since 2026-09-30)

## Final Active Curated Ledger Summary (15 active in-development/WIP projects)

1. `zelda-twilight-princess-vita` (The Legend of Zelda: Twilight Princess)
2. `portal-vita` (Portal Source Engine / N64 Decomp)
3. `spider-man-total-mayhem-vita` (Spider-Man: Total Mayhem)
4. `simpsons-hit-and-run-vita` (The Simpsons: Hit & Run)
5. `nfs-hot-pursuit-vita` (Need for Speed: Hot Pursuit)
6. `renpy-8-runtime-engine` (Ren'Py 8 Runtime Engine)
7. `slingshot-racing-vita` (Slingshot Racing)
8. `render96-sm64-hd-vita` (Render96 HD SM64)
9. `celeste-classic-vita` (Celeste Classic)
10. `rc-cars-vita` (RC Cars)
11. `cod-zombies-ios-loader` (Call of Duty: Zombies iOS Loader)
12. `call-of-duty-4-vita` (Call of Duty 4: Modern Warfare)
13. `resident-evil-4-vita` (Resident Evil 4)
14. `real-racing-2-vita` (Real Racing 2)
15. `gta-lcs-vita` (GTA: Liberty City Stories reStories)

## Synchronized files

- `src/shared/constants/fallbackData.ts`: 15 projects, 15 games, 10 developers, 12 updates.
- `data/media-manifest.json`: rebuilt for 15 projects (2 hardware captures, 11 promotional art, 2 title cards).
- `src/web/components/ledger/types.ts`: updated `KNOWN_REPOS`.
- `tests/unit/project-media.test.ts`: updated project media assertions.
- `tests/unit/link-integrity.test.ts`: verified clean link assertions.

## Verification

- `npm run verify`: typecheck clean, 23 unit test files (135 tests) passed, build generated 15 project pages and 18 sitemap URLs.
- `npm run test:integration`: 1 file (7 tests) passed.