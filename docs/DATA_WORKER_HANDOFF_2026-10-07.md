# Handoff - VitaHarbor data worker handoff

- Gegenereerd: 2026-10-07T04:26:17Z
- Actor: codex
- Model: GPT-6 (variant unrecorded)
- ProjectRoot: C:\Users\suloW\.codex\worktrees\vh-data-acceptance-20261007\VitaPort
- Bronnen: 7

## Bronintegriteit

| Bestand | Bytes | SHA-256 |
|---|---|---|
| docs\DATA_WORKER_ACCEPTANCE_2026-10-07.md | 7819 | C41930391AA0D961FF82580ECE77B1DEE694C9FABA26EA0C2CB9A696F52C0DB7 |
| src\shared\constants\fallbackData.ts | 69507 | 41949DBD7FA8E3DA9E47386212B8D2AA3EF9AD3C0C9044B3CAC8735A14C50FD4 |
| scripts\reddit-classifier.mjs | 14066 | 8A258E2CCA235D90EB06F6C0F6D5304AC29765543B1D75828726392B61807F36 |
| tests\unit\reddit-scanner.test.mjs | 16113 | 8CAB3E2A4FC779FFC37A1DDAF760BF842239F48CAF75498B49B6DE3EC40FBBBC |
| tests\unit\project-media.test.ts | 1658 | 56465108CDF033405A7DDFD503180F81B8BAD25B4AC5D74C2D9C7046A5538AC1 |
| data\scanner-health.json | 4240 | A82BC9C67C5941D5C4D6B51041A53E960492FA292A5AB16A31955CFFF45D3179 |
| .github\workflows\reddit-scanner.yml | 3826 | 4D25F3D6605CEAEE542522230A31B72D3961ED4F1953D309D5BCF14288896A94 |

## Samenvatting

# VitaHarbor data-worker acceptance — 2026-10-07

This file is the data-worker handoff evidence for the master/UI worker. It is intentionally separate from `docs/WORKLOG.md`, `PROJECT_STATE.md`, and the shared `HANDOFF.md` so concurrent UI work can be integrated first.

## Scope and checkout

- Worktree: `C:\Users\suloW\.codex\worktrees\vh-data-acceptance-20261007\VitaPort`
- Base: `origin/main` at `bc6d187120f6c28ddbbb6928c0fa55cbfb011eb6`
- Branch: `codex/vh-data-audit-20261007`
- Implementation commit: `fdda6db972f49850749e631ddea1c95d357c13d3` (`fix(data): correct Vita screenshot provenance and Halo release`)
- Model: `GPT-6 (variant unrecorded; as supplied by the master handoff)`
- No UI source/component/style files, scanner runtime schedules, public scan-health endpoint, shared project status, or production deployment were changed.

## Scan freshness finding

The scheduled scanner is running; the homepage date is a different thing.

- The live workflow is scheduled at `17 7`, `17 13`, and `17 19` UTC every day. The last checked run, [Reddit discovery scan #95](https://github.com/CipherGreyLabs/vitaharbor/actions/runs/37544635189), was triggered by schedule on 2026-10-06 at 23:06 and has GitHub status **Success**.
- The published scanner-health record for that attempt is `2026-10-06T23:06:53.686Z`, state `partial`, 2/3 successful sources. Its embedded `github_action.status: unknown` is deliberate (the workflow does not write a self-referential success marker); the Actions page independently establishes that run #95 succeeded.
- Per-source status in that record: `vitahacks` available at `2026-10-06T23:06:53.686Z` (0 consecutive failures); `PSVitaHomebrew` available at the same time (0 failures); `VitaPiracy` rate-limited, last success `2026-09-30T19:19:05.523Z`, 17 consecutive failures.
- Live homepage HTML labels its newest curated item **Latest signal**, dated `2026-10-02T10:00:00.000Z` (Real Racing 2 Beta 2). It does not show a scan timestamp. `/data/scanner-health.json` on the Vercel host returned the app HTML fallback, not the health JSON.
- Scanner discoveries are recorded in the internal quarantine and are not automatically promoted into the curated homepage. The visible Oct 2 signal therefore does not mean the scanner stopped. Preserve this human-curation boundary.
- UI handoff: display the latest scan time separately from “Latest signal”; do not expose the per-subreddit failure details to visitors. The latter remain internal diagnostics.

Sources checked: `.github/workflows/reddit-scanner.yml`, the current `data/scanner-health.json` on GitHub, [workflow run #95](https://github.com/CipherGreyLabs/vitaharbor/actions/runs/37544635189), and the live homepage at `https://vitaharbor.vercel.app/`.

## Curated-data corrections

### Halo CE

The previous record joined two distinct facts: a PC/Android decompilation discussion and a separately maintained PS Vita port. The Vita port README identifies `cybersecurity/halo-ce-universal` as an upstream project, credits the PS Vita port to BirchWoodGod, says the screenshots were taken on a PS Vita, and states that no game data is included. The old Reddit discussion is retained only as upstream context; it is no longer used as proof of a Vita build or release.

- Canonical Vita project: `halo-ce-vita`, repository `https://github.com/BirchWoodGod/halo-ce-vita`.
- The record now uses official release v1.0 at `2026-10-02T01:36:54Z` and v1.0.3 activity at `2026-10-06T22:49:53Z`, as returned by the GitHub Releases API.
- The project-level release notes state that campaign play is available, system-link is still being tested, and users must provide their own Xbox copy. Performance notes are explicitly attributed to the maintainer.
- Replaced the old Halo Anniversary promotional art with the upstream README's Warthog screenshot. The README says its screenshots were taken on Vita; the raw image returned HTTP 200 as `image/png` (518,161 bytes). No game data was downloaded or added.
- Removed the unsupported `karat46` Vita-author attribution and scanner known-author boost. No evidence linked that Reddit poster to the separately credited Vita port.

Primary sources: [Vita port README](https://github.com/BirchWoodGod/halo-ce-vita#readme), [v1.0 release](https://github.com/BirchWoodGod/halo-ce-vita/releases/tag/v1.0), [v1.0.3 release](https://github.com/BirchWoodGod/halo-ce-vita/releases/tag/v1.0.3), [upstream Reddit discussion](https://www.reddit.com/r/PSVitaHomebrew/comments/1wtm0y6/halo_ce_decomp_pc_and_android/), and [Vita release announcement](https://www.reddit.com/r/VitaPiracy/comments/1wvhkaf/halo_ce_port_release/).

### Screenshot mapping

The prior ledger had an image path for all 28 projects, but only RC Cars had a `screenshot_source_url`. The image-addition commit (`e3b81b2`) recorded filenames and alt text, not source URLs or image provenance. I removed the unsupported mappings from the active ledger without deleting the local files. Only RC Cars (source Reddit post shows the game on Vita hardware) and Halo CE (official Vita README screenshot) remain mapped with explicit source URLs. Projects without verified media now fall back to their text title. Both `ConsoleStage` and `VitaConsoleScene` already render the project title when `screenshot_url` is absent; no UI edit was needed.

Visually confirmed mismatches include:

- Ren'Py runtime mapped to Cave Story art.
- Render96/Super Mario 64 mapped to a Super Smash Bros. Melee cover.
- Real Racing 2 mapped to a Test Drive II/DOS-style racing screen.
- Need for Speed: Hot Pursuit mapped to image text explicitly identifying **Hot Pursuit Remastered**, a different title/version.
- Call of Duty: Zombies mapped to a mobile-touch-controls image, not a Vita capture.
- Halo CE mapped to Halo Anniversary promotional art, not Vita gameplay.

The separate Call of Duty 4 image visually depicts a Vita, but the curated record had no source thread or `screenshot_source_url`; it is not retained until its origin can be verified. Existing files under `public/screenshots/` remain untouched for a future source-backed review.

## Classifier changes

- Known-author reputation no longer changes an `out_of_scope` category into `project_update` or independently admits a post. It can still raise confidence for content that already passes the in-scope test.
- “Data files” alone no longer counts as strong development evidence; explicit VPK-release evidence remains.
- A concrete first/initial alpha or beta release is recognized as development evidence.
- Generic upstream repository references remain available to internal quarantine/risk review, but retain their actual `out_of_scope` category.
- Focused tests cover known-author out-of-scope content, data-file requests, alpha releases, and a valid Halo Vita release.

## Verification and remaining work

- `npm ci`: completed using the checked-in lockfile; installed 409 packages. npm reported 18 existing dependency advisories (5 moderate, 11 high, 2 critical); no dependency changes were made.
- Focused regression run: `npx vitest run tests/unit/reddit-scanner.test.mjs tests/unit/data-poisoning.test.mjs tests/unit/project-media.test.ts` — **3 files, 43 tests passed**.
- `npm run verify`: passed typecheck, all 23 unit-test files / 134 tests, Vite build, prerender of 28 project pages, and sitemap generation.
- `npm run test:integration`: passed, 1 file / 7 tests.
- The build regenerated tracked `public/og.png` from the corrected ledger. The Halo deep link is present in the prerendered 28-project output; production/live acceptance still belongs to the integrating master/UI worker.
- Integration with concurrent UI edits and deployment remain pending; do not report them as passed.
- No Reddit scan was manually triggered and no production changes were made.


## Verificatie

Controleer de hashes voordat je deze samenvatting vertrouwt:

    powershell -NoProfile -ExecutionPolicy Bypass -File %USERPROFILE%\.codex\workflow\NEW-HANDOFF.ps1 -Verify "docs\DATA_WORKER_HANDOFF_2026-10-07.md"

Een handoff is context, geen bron van waarheid. Workspace en Git zijn leidend.
