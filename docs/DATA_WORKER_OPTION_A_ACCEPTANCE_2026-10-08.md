# VitaHarbor data-worker option A triage acceptance — 2026-10-08

## Scope and triage evaluation

### 1. Evaluation against live VitaDB catalog (1,146 items)
- **Insaniquarium! Deluxe v1.00 (`reddit-1wzrt36`):** Matched official release *Insaniquarium Vita* by KartingSackboy06 on VitaDB (ID 1585 on 2026-10-07). Status transitioned to `GRADUATED_TO_VITADB` (terminal state, excluded from active in-development WIP ledger).
- **Umineko Project v1.0 (`reddit-1wz3ow3`):** Matched official release *Umineko Project Vita* by stoicpingu on VitaDB (ID 1581 on 2026-10-06). Status transitioned to `GRADUATED_TO_VITADB` (terminal state, excluded from active in-development WIP ledger).
- **World at War Zombies preview (`reddit-1wkrhnp`):** Promoted as part of curated `cod-waw-zombies-vita`.
- **Real Racing 3 developer update / showcase (`reddit-1wy0409`, `reddit-1wsh59n`):** Promoted as part of curated `real-racing-3-vita`.

### 2. Active in-development WIP ports verified for review
- **SuperTuxKart Vulkan Driver (`reddit-1wkf9m5`):** Retained in `VERIFIED_FOR_REVIEW` with evidence notes covering Vulkan/GL translation driver and hardware renderer progress by nyabsi.
- **The Force Engine (Star Wars Dark Forces) (`reddit-1wlrv6x`):** Retained in `VERIFIED_FOR_REVIEW` with evidence notes covering native menu boot by SnooLobsters311.
- **Buckshot Roulette C++ Rewrite (`reddit-1wn46c9`):** Advanced from `QUARANTINED` to `VERIFIED_FOR_REVIEW` with evidence notes covering C++ engine rewrite targeting 60 FPS and vitaGL by JustAverage456.
- **Insurgency Vita (`reddit-1wvob17`):** Retained in `VERIFIED_FOR_REVIEW` with evidence notes covering gameplay showcase and map geometry by OneDumbFox.

### 3. State Machine Enhancement
- Added `GRADUATED_TO_VITADB` as a valid candidate and terminal state in `scripts/reddit-provenance.mjs` and updated `scripts/triage-summary.mjs` to reflect graduated items cleanly.
- Synchronized public feeds via `scripts/make-feeds.ts`.

### 4. Verification
- `npm run verify`: typecheck clean, 23 unit test files (135 tests) passed, build generated 17 project pages and 20 sitemap URLs.
- `npm run test:integration`: 1 file (7 tests) passed.