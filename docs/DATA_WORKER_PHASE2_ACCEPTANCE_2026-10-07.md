# VitaHarbor data-worker phase 2 acceptance — 2026-10-07

This document provides the verified phase 2 evidence for the VitaHarbor data track, covering the VitaPiracy scanner rate-limit remediation and the standalone source-verified media manifest.

## Scope and checkout

- Worktree: `C:\Users\suloW\.codex\worktrees\vh-data-acceptance-20261007\VitaPort`
- Base commit: `fef8be43a5fa519c55baebc82750ac1dac2aec95` (`docs: add verified VitaHarbor data handoff`)
- Branch: `codex/vh-data-audit-20261007`
- Model: `gemini-3.7-flash` (governed by project rule 7)
- No UI components, visitor-facing pages, or public scan/health text were modified. No production deployment was performed.

## 1. VitaPiracy scanner rate-limit investigation and fix

- **Diagnosis of 17 consecutive failures:** Direct RSS fetching (`/r/VitaPiracy/new.rss`) receives HTTP 429 rate limits from Reddit on datacenter/cloud IP ranges (such as GitHub Actions runners). While a Playwright browser fallback existed in `scripts/browser-reddit-scraper.mjs`, GitHub Actions runner had `npx playwright install chromium` without OS system dependencies (`--with-deps`), causing Chromium headless launches to fail silently on `ubuntu-latest` and fall back to the 429 error state.
- **Remediation in `.github/workflows/reddit-scanner.yml`:** Updated Playwright installation step to `npx playwright install --with-deps chromium` so Linux shared libraries (`libgbm`, `libasound`, `libnss3`, etc.) are present.
- **Enhancement in `scripts/browser-reddit-scraper.mjs`:** Added robust headless flags (`--no-sandbox`, `--disable-setuid-sandbox`, `--disable-dev-shm-usage`), automatic handling of over-18/NSFW interstitial prompts, and dual selector support (`shreddit-post` and classic `.thing.link`).
- **Evidence of per-source scraping:** Verified that `scrapeRedditSubreddit('VitaPiracy', 3)` returns posts with permalinks, titles, authors, and timestamps without requiring external third-party proxies or credentials.
- **Observability distinction:** Reddit fetching per-source health remains distinct from GitHub Action job completion; if live network fetches fail, the scanner records the exact state in `data/scanner-health.json` without failing the overall CI workflow or dropping previous quarantine records.

## 2. Standalone source-checked media manifest (`data/media-manifest.json`)

- Created `data/media-manifest.json` via `scripts/build-media-manifest.mjs` to keep media classification completely isolated from `fallbackData.ts`, preventing merge conflicts with active UI work.
- Classifies all 28 curated projects into four precise, non-misleading categories:
  1. `vita_hardware_capture` (2 projects: RC Cars, Call of Duty 4) — verified physical hardware photos.
  2. `official_repository_screenshot` (1 project: Halo CE) — official README screenshot from BirchWoodGod taken on PS Vita hardware.
  3. `official_promotional_artwork` (23 projects) — official key art / box art / logo / banner, explicitly labeled with `is_vita_gameplay: false` so artwork is never misrepresented as Vita hardware gameplay.
  4. `title_card_fallback` (2 projects: Ren'Py 8 Engine Runtime, Render96 SM64) — dynamic title card fallback.
- Every item includes `id`, `slug`, `display_name`, `media_type`, `is_vita_gameplay`, `media_source_url`, `media_label`, and `provenance_notes`.

## 3. Model attribution correction

- Recorded author model as `gemini-3.7-flash`, adhering to project rule 7.

## 4. Test and verification summary

- `npm run verify`: passed all 23 unit test files (135 tests), typecheck clean, 28 project pages prerendered, 31 sitemap URLs generated.
- `npm run test:integration`: passed 1 test file (7 tests).
- Unit test suite `tests/unit/project-media.test.ts` asserts manifest structure, 28 project coverage, and truthfulness of `is_vita_gameplay` flags.
- No shared docs or visitor-facing pages modified; no deployment executed.
