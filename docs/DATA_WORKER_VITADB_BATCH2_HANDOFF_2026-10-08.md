# Handoff - VitaHarbor data worker VitaDB batch 2 exclusion handoff

- Gegenereerd: 2026-10-08T02:06:26Z
- Actor: codex
- Model: gemini-3.7-flash
- ProjectRoot: C:\Users\suloW\.codex\worktrees\vh-data-acceptance-20261007\VitaPort
- Bronnen: 6

## Bronintegriteit

| Bestand | Bytes | SHA-256 |
|---|---|---|
| docs\DATA_WORKER_VITADB_BATCH2_ACCEPTANCE_2026-10-08.md | 2138 | 38A7A0B88D7853913CA8ABBE26AD9FE23D9644225A49D74C46E55D49C3C5DC85 |
| src\shared\constants\fallbackData.ts | 49424 | C50F4BDAE1BA8C62DEF603A0387F6725A8217D924F7D185874BBB4992CC5420B |
| data\media-manifest.json | 8813 | 74385561C58BA1D3A22DEA3CBE8A4FDAF2A25DA92626DF57861756CABA8090A9 |
| src\web\components\ledger\types.ts | 8827 | 71659360EE6C4EB345FDEF240A87334209310F0EF2F88F17D0DD78BED4442285 |
| tests\unit\project-media.test.ts | 2137 | 40C6A7517299E856D3B971340F174419B44B727C1358D18A99522919DD0AF468 |
| tests\unit\link-integrity.test.ts | 2612 | 456A5E0A06093EAF03F4529D0A86FF18BB9D3B8CD13034F63938891E5B7C700C |

## Samenvatting

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

## Verificatie

Controleer de hashes voordat je deze samenvatting vertrouwt:

    powershell -NoProfile -ExecutionPolicy Bypass -File %USERPROFILE%\.codex\workflow\NEW-HANDOFF.ps1 -Verify "docs\DATA_WORKER_VITADB_BATCH2_HANDOFF_2026-10-08.md"

Een handoff is context, geen bron van waarheid. Workspace en Git zijn leidend.
