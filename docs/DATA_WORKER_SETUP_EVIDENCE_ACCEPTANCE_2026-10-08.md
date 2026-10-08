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