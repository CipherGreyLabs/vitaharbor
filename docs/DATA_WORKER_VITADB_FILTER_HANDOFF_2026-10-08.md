# Handoff - VitaHarbor data worker VitaDB exclusion handoff

- Gegenereerd: 2026-10-08T01:48:37Z
- Actor: codex
- Model: gemini-3.7-flash
- ProjectRoot: C:\Users\suloW\.codex\worktrees\vh-data-acceptance-20261007\VitaPort
- Bronnen: 6

## Bronintegriteit

| Bestand | Bytes | SHA-256 |
|---|---|---|
| docs\DATA_WORKER_VITADB_FILTER_ACCEPTANCE_2026-10-08.md | 2491 | E49EE5BB3B0DC32EC64F3578CBECA5F34D12D435E83D46FA60B8A5EA7228A9BC |
| src\shared\constants\fallbackData.ts | 62218 | 74476063E08C7BF1F2627CE91732460F8975CD5BE8BF5E084C32B4667FE4BA83 |
| data\media-manifest.json | 11090 | 1D44671EAA4684CE68B457E2A619A4551AD2712DB769C8E7B4F5D5D9E403A0A1 |
| src\web\components\ledger\types.ts | 9075 | 70BC09F6942E02429E5677D59EB552A50F700AA75EC50040116E568EE724B008 |
| tests\unit\link-integrity.test.ts | 2612 | 456A5E0A06093EAF03F4529D0A86FF18BB9D3B8CD13034F63938891E5B7C700C |
| tests\e2e\archive.spec.ts | 20192 | 95D741C3751333092F8C9E2CBEB834BAD52A3999B5268D8C93C2E910D9954C3B |

## Samenvatting

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

## Verificatie

Controleer de hashes voordat je deze samenvatting vertrouwt:

    powershell -NoProfile -ExecutionPolicy Bypass -File %USERPROFILE%\.codex\workflow\NEW-HANDOFF.ps1 -Verify "docs\DATA_WORKER_VITADB_FILTER_HANDOFF_2026-10-08.md"

Een handoff is context, geen bron van waarheid. Workspace en Git zijn leidend.
