# Handoff - VitaHarbor data worker setup evidence and validation handoff

- Gegenereerd: 2026-10-08T21:46:02Z
- Actor: codex
- Model: gemini-3.7-flash
- ProjectRoot: C:\Users\suloW\.codex\worktrees\vh-data-acceptance-20261007\VitaPort
- Bronnen: 2

## Bronintegriteit

| Bestand | Bytes | SHA-256 |
|---|---|---|
| docs\DATA_WORKER_SETUP_EVIDENCE_ACCEPTANCE_2026-10-08.md | 2478 | 46C0FFC72C718C137D1F825C5B67A38FED60075DC5B65B77D4E9D37CDEB832D3 |
| src\shared\constants\fallbackData.ts | 74391 | 187EAA3FCEA9543ABE1EE3DA7B51DF8FD30C0D015583B3860B7D9274AE9BE035 |

## Samenvatting

# VitaHarbor data-worker setup evidence & activity validation acceptance — 2026-10-08

## Scope and actions taken

### 1. Structured `setup_evidence` for Active Playable / In-Game WIP Ports
Enriched `fallbackData.ts` with structured `setup_evidence` objects across all active ports:
- **GTA: Liberty City Stories (`gta-lcs-vita`):** `kubridge.skprx`, `fd_fix.skprx`, `libshacccg.suprx`, 444/500 MHz, `ux0:data/gtalcs/`, PSP/PS2 legal asset extraction via reStories PC extractor.
- **Need for Speed: Hot Pursuit (`nfs-hot-pursuit-vita`):** `kubridge.skprx`, `fd_fix.skprx`, `libshacccg.suprx`, 500 MHz, `ux0:data/nfshp/`, Android v1.0.62 APK extraction.
- **The Simpsons: Hit & Run (`simpsons-hit-and-run-vita`):** `kubridge.skprx`, `libshacccg.suprx`, 500 MHz, `ux0:data/shar/`, PC data files.
- **Spider-Man: Total Mayhem (`spider-man-total-mayhem-vita`):** `kubridge.skprx`, `fd_fix.skprx`, `libshacccg.suprx`, 444 MHz, `ux0:data/spiderman/`, Android APK data files.
- **Portal Vita Port (`portal-vita`):** `libshacccg.suprx`, 444 MHz, `ux0:data/portal/`, chamber map assets.
- **Real Racing 2 (`real-racing-2-vita`):** `kubridge.skprx`, `fd_fix.skprx`, `libshacccg.suprx`, 500 MHz, `ux0:data/rr2/`, Android APK data files.
- **RC Cars (`rc-cars-vita`):** `libshacccg.suprx`, 444 MHz, `ux0:data/rccars/`, PC game data files.
- **Call of Duty 4 (`call-of-duty-4-vita`):** `kubridge.skprx`, `libshacccg.suprx`, 500 MHz, `ux0:data/cod4/`, mission shaders.
- **Slingshot Racing (`slingshot-racing-vita`):** `kubridge.skprx`, `fd_fix.skprx`, `libshacccg.suprx`, 444 MHz, `ux0:data/slingshot/`, Android APK assets.
- **Celeste Classic (`celeste-classic-vita`):** 333 MHz stock, `ux0:app/CELESTE01/`, standalone VPK install.
- **Star Wars: Dark Forces (`the-force-engine-dark-forces-vita`):** `libshacccg.suprx`, 444 MHz, `ux0:data/tfe/`, DARK.GOB/SOUNDS.GOB PC data files.
- **SuperTuxKart (`supertuxkart-vulkan-vita`):** `libshacccg.suprx`, 500 MHz, `ux0:data/stk/`, Vulkan 1.1 runtime driver data.
- **Insurgency Vita (`insurgency-vita`):** `kubridge.skprx`, `libshacccg.suprx`, 500 MHz, `ux0:data/insurgency/`, PC map & audio assets.

### 2. Activity Timestamps & Repository URLs Validated
- Validated `last_activity_at` and `repo_url` across all 21 active projects.

### 3. Verification
- `npm run verify`: passed typecheck, all 23 unit test files (135 tests) passed, build generated 21 project pages and 24 sitemap URLs.
- `npm run test:integration`: 1 file (7 tests) passed.

## Verificatie

Controleer de hashes voordat je deze samenvatting vertrouwt:

    powershell -NoProfile -ExecutionPolicy Bypass -File %USERPROFILE%\.codex\workflow\NEW-HANDOFF.ps1 -Verify "docs\DATA_WORKER_SETUP_EVIDENCE_HANDOFF_2026-10-08.md"

Een handoff is context, geen bron van waarheid. Workspace en Git zijn leidend.
