# VitaHarbor project state

Updated: 2026-09-24

## Current state: VH-SCANNER-FRESHNESS-022 production release (2026-09-24)

- The reviewed implementation was fast-forwarded to `main` at `0e03addecb81258cf706be11425b23fad2cfaa50`, with no force push. GitHub Actions push run `35938345145` for that exact SHA succeeded; unit/integration verification passed and scan, backfill, feed rebuild, commit/publish, and publication-check steps were all `skipped`. No Reddit fetch or scanner data commit occurred.
- Production deployment `dpl_EEFGNckzUDjxn83YnFtpxivX2GUf` is `READY` and aliases `https://vitaharbor.vercel.app`. It was deployed from the clean local checkout at `0e03addecb81258cf706be11425b23fad2cfaa50`, matching `origin/main` at deployment time. Vercel's deployment inspection reports `gitSource: null`; source identity is evidenced by the exact pre-deploy local/remote SHA, not provider Git metadata.
- Live acceptance: `/api/projects?limit=1000` returned 29 projects; `/data/discovered.json` returned 11 leads, all with `verification: unverified`; `/api/cron-scan` returned HTTP 404. Browser checks of Home, Community posts and Updates showed no scanner/run/failure status. Production Playwright passed 20/20 with two workers; the isolated default WebGL test passed 1/1. An initial 8-worker production run had 19/20 because the default WebGL canvas was absent in that parallel run; all tests passed on the 2-worker rerun. Other 3D, screenshot, mobile and `Show on Vita` checks passed.
- The configured schedule is 07:17, 13:17 and 19:17 UTC. The post-push test event intentionally did not scan. No post-change scheduled RSS attempt has yet been observed, so Reddit availability/recovery and actual schedule punctuality remain `UNKNOWN`; GitHub may still delay scheduled workflows.
- Runtime changes are implementation commit `90a35895df1c8b4b8fcdfa6a1398f4dde34bc8ba`; traceability commit `0e03addecb81258cf706be11425b23fad2cfaa50` is documentation/handoff only. No curated records or public discovery data were edited. `npm ci` reported 8 dependency audit advisories (4 moderate, 4 high); manifests/lockfile were unchanged and no audit remediation was attempted.
- Vercel CLI created a gitignored `.env.local` during project linking. Its contents were not read or committed; local deletion was blocked by the execution policy, so it remains in this worktree for user cleanup. The `.vercel` project link also remains ignored. Tracked release and documentation changes are committed.
- Updated hash-protected `HANDOFF.md` contains 24 source hashes; `NEW-HANDOFF.ps1 -Verify` returned `HANDOFF GO` for all 24.

## Completed bounded worker assignment: VH-SCANNER-FRESHNESS-022 (pre-release snapshot, 2026-09-24)

The following records the candidate state before its authorized production release below.

- The master delegated scanner reliability work after the latest read-only evidence showed scheduled Actions runs starting hours after their cron slots and the most recent scanner attempt (2026-09-23T22:06:44Z) failing 0/3 on HTTP 429 from all three RSS sources. No fresh post-change scan has been observed; source access remains unverified.
- Implementation commit `90a35895df1c8b4b8fcdfa6a1398f4dde34bc8ba` is on isolated branch `codex/vh-scanner-reliability-022`, directly based on `origin/main` `d43070d88a33a8e2d781417c2e5ee1cefe162729`. Schedules now use 07:17, 13:17 and 19:17 UTC; push events run tests only, and scan/backfill/feed publication steps are restricted to schedule/manual dispatch. Backfill runs on the 07:17 slot or manual dispatch.
- Shared Reddit fetch handling makes a 429 a single attempt with no immediate sleep/retry, parses numeric or HTTP-date `Retry-After`, caps the internal hint at six hours, and stores it only in internal scanner health / operator logs. Network, 408 and 5xx failures get at most one retry after 1.2 seconds; permanent 4xx responses are not retried. Existing backfill early-exit preserves stored provenance when all feeds fail.
- Removed the unused Vercel `/api/cron-scan` route and its daily cron after confirming no application consumer; unrelated APIs remain untouched. No visitor-facing scanner fields, curated entries, or generated discovery data were changed.
- Exact candidate verification: `npm run verify` passed typecheck, 116/116 unit tests and production build (29 project pages, 32 sitemap URLs); lint passed; integration 7/7; local-preview Playwright 20/20 at `http://127.0.0.1:4176`; workflow YAML and `vercel.json` parsed successfully. No live Reddit request/scan, workflow dispatch, push or deployment was performed. Production remains on the existing deployment until master review and release authorization.
- `npm ci` reported 8 dependency audit advisories (4 moderate, 4 high); package manifests/lockfile were not changed and no audit remediation was attempted in this scanner-scoped assignment.

## Completed bounded worker assignment: VH-PROJECT-ACTIVITY-LABEL-021 (pre-scanner-release record, 2026-09-24)

- The master authorized a visitor-copy fix after a read-only production diagnosis. The fresh live Home, Community posts, and Updates views contain no “2 days ago” or scan-status text. Opening a Home project row did show `Last activity · 3d ago`; this is the project's source-backed `last_activity_at`, not a VitaHarbor scan timestamp. The live project API's newest activity record was Test Drive at `2026-09-20T19:50:09.288Z`.
- Code commit `1192b8e1b2c7b2975d3959a79eba2c58c9b9317b` changes the detail label to `Latest project activity`, keeps the absolute source date and removes the relative-age suffix. A Home deep-link regression assertion verifies the opened Test Drive panel has `20 Sept 2026` and no `Nd ago` label.
- Worker branch `codex/vh-visitor-ops-cleanup-20260923` is based on the latest `origin/main` data tip `e84e6aea178829f18669c37724638968701f710e`; runtime implementation commit `1192b8e1b2c7b2975d3959a79eba2c58c9b9317b` is directly atop that base. No push or deployment is authorized. Production still points to READY deployment `dpl_98bNGxsgXjCsnFMyYBty5FD5qsz6`, deployed from runtime source `25865ab1aa2ee717fa50942fec447738f2bcfee9`.
- Verification on the exact code commit: `npm run verify` passed typecheck, 110 unit tests, and build (29 project pages, 32 sitemap URLs); lint passed; integration 7/7; Playwright 20/20 at local preview `http://127.0.0.1:4174`. Manual desktop and 390px preview showed `LATEST PROJECT ACTIVITY` / `20 Sept 2026`, no relative-age or scanner-status string, and no mobile overflow. The first focused E2E invocation used the config's production default and therefore saw the unreleased live copy; it was rerun successfully against the local preview, followed by the full 20-test suite.
- Internal read-only scan evidence: scheduled Actions run `35926409183` completed at `2026-09-23T22:07:04Z`; scanner attempt `2026-09-23T22:06:44Z` was failed 0/3 because all three RSS sources were rate-limited. This remains internal and is not shown to visitors. Schedule remains 07:00, 13:00 and 19:00 UTC; worker made no cadence/provider changes.
- The incoming `HANDOFF.md` failed integrity only for `tests/e2e/archive.spec.ts`; `git status` was clean, and commit `25865ab` had changed that file after the previous handoff was generated. No user-owned uncommitted edit was found. Regenerated `HANDOFF.md` with 33 source hashes; `NEW-HANDOFF.ps1 -Verify` returned `HANDOFF GO` for all 33.

## Historical pre-release snapshot: visitor-facing diagnostics cleanup (2026-09-23)

The following block records the state before the authorized production release. Its pre-release status lines are historical; the current live deployment and worker candidate are recorded above.

- Removed scanner cadence, run IDs, source failure/rate-limit details, scan timestamps and review-queue mechanics from the public Home, Community Posts, project and methodology views. Kept useful post dates, source links, project facts, and explicit unverified labels.
- Master review found process language left in the no-JS methodology and standalone Discovery metadata. The prerender template now describes unverified community posts and visible evidence levels in plain visitor language; `/discovery/` title and description now match the Community Posts page.
- The public discovery feed is now a minimal schema-v1 projection. Scanner health remains internal at `data/scanner-health.json`; the static site no longer fetches or serves it. The Vercel cron endpoint returns no diagnostic body. The three-times-daily schedule was not changed.
- Exact candidate is local commit `25865ab1aa2ee717fa50942fec447738f2bcfee9` on `codex/vh-visitor-ops-cleanup-20260923`, based on `origin/main` `3b5f1614a222d49d2bcb861a33e6ab80dabb7ff9`. Awaiting master review; no push, merge, or deployment.
- Verification on the updated candidate: `npm run verify` passed typecheck, 110/110 unit tests, and production build (29 project pages, 32 sitemap URLs); lint passed; integration passed 7/7; Playwright passed 19/19 at `http://127.0.0.1:4180` with two workers. All 41 public HTML/JS/JSON/XML artifacts had zero matches for the selected scanner/run/rate-limit/queue/review-process patterns. Static Discovery title/description are visitor-facing; the 11-item public feed has only schema/items and title/url/community/publication-date/unverified fields. Mobile 390px had no horizontal overflow; no-JS Home retains Directory and evidence-level context; hydrated Home/Discovery display no scanner-health request or diagnostics. One initial eight-worker run had a transient WebGL failure; the complete two-worker rerun passed.
- Candidate screenshots are in `C:\Users\suloW\AppData\Local\Temp\vitaharbor-cleanup-67ad93fc6be641ec9977e5d1c42d0fad` (`home-desktop.png`, `community-posts-desktop.png`, `community-posts-mobile.png`).
- Internal-only freshness observation: scheduled GitHub run `35897506358` succeeded at 2026-09-23 17:42 UTC; the scan health record at 17:43 UTC was partial (r/vitahacks available; r/VitaPiracy and r/PSVitaHomebrew rate-limited). This is not a cadence/UI change ticket.

## Current follow-up: VH-SCAN-HEALTH-020

- Bounded master assignment: make the scanner-health constructor/test deterministic under
  local and GitHub Actions environments, prove real `GITHUB_*` context is retained, and keep
  `github_action.status` honestly `unknown` until publication is observable. No scanner/data,
  queue, curated ledger, link-audit, UI, manual-dispatch or Vercel-deploy changes are in scope.
- Reconciled base is `origin/main` `ed19710f972356688b4d6e49075a13eacc5ef02f`; remote
  `ls-remote` matched and it is an ancestor of the clean worker branch. The prior NO_GO
  trace remains in local commit `1f1d6ddb27025c83e0c1f527408d05f1ef94ed87`.
- `buildScannerHealth` now accepts an injectable GitHub Actions environment while defaulting
  production calls to `process.env`. The deterministic local fixture supplies `{}`; regression
  tests inject a push context and independently compare the actual runtime `GITHUB_*` values.
  Both GitHub-context cases assert completion remains `unknown`.
- Focused scanner-health tests pass 6/6 in both the ordinary local environment and a scoped
  GitHub-like process environment. Full exact-candidate release gates and commit are pending.
  The product UI is unchanged; the prior exact local E2E result remains 18/18. No Reddit scan
  was manually dispatched and no deployment was made.

## Active assignment: VH-SCAN-FRESH-017

- The user reported that the site showed its latest scan as two days old despite the stated
  three-times-daily cadence. The GitHub Actions workflow is configured for 07:00, 13:00 and
  19:00 UTC, and recent scheduled runs are present. The latest live attempt is
  `2026-09-23T05:09:00.830Z`; all three Reddit RSS sources returned rate limits, so the run
  did not detect new items.
- Root cause: the scheduled workflow commits updated scanner JSON to public `main`, but
  Vercel's static production deployment does not rebuild on those scanner commits. The site
  therefore kept rendering the deployed snapshot until another Vercel deployment.
- Worker fix is in the isolated worktree on `codex/vitaharbor-integration-015`: Home and
  Discovery now fetch current public scanner JSON from GitHub `main`, bypass short CDN/browser
  caching, refresh every 15 minutes, and label the deployed-file fallback as a snapshot.
  Vercel CSP permits only the required raw GitHub origin; `/data/*` responses are `no-store`.
- The release candidate validates the raw GitHub JSON with a bounded streaming reader
  (8 KiB health / 256 KiB queue, at most 100 candidates), strict schema/source/URL checks
  and an explicit public-field projection. Author, body, risk and scanner-internal timestamps
  are dropped before UI state. Invalid/unavailable live data falls back only to a separately
  labelled deployed snapshot.
- Verification: `npm run verify` passed typecheck, 98 unit tests and production build (29
  project pages, 32 sitemap URLs); lint passed; integration passed 7/7; full local Playwright
  passed 18/18 at `http://127.0.0.1:4173`; `git diff --check` passed. The exact current
  public assets were accepted by the sanitizer (13 queue candidates; scanner attempt
  `2026-09-23T05:09:00.830Z`, failed, 0/3 feeds due to rate limits).
- GitHub Actions history confirms the three daily schedules at 07:00, 13:00 and 19:00 UTC;
- Release commit `1b7c0a3f88e77d8b087bd2cb07d2aa0411de28f8` is pushed to
  `origin/codex/vitaharbor-integration-015`; `origin/main` was unchanged at `15b311f` before
  release. The production deployment is `dpl_Cj1uUTeAnZq4DpyCfQj2t6FVJsyv`, READY at
  `https://vitaharbor-gqs4zha5a-anonymusv1605-8308.vercel.app`, aliased to
  `https://vitaharbor.vercel.app`.
- Post-deploy acceptance: production Playwright 18/18; direct browser requests for both raw
  GitHub scanner assets returned 200 on Home and Discovery; both pages labelled the source
  `Live scan data` and accurately displayed `Latest scan failed`; 13 queue candidates; no
  browser page errors. With raw GitHub deliberately blocked, both pages switched to the
  labelled deployed snapshot and continued showing the honest failed status and 13 candidates.
- Production security/UX checks: header/SEO/crawler audit passed (including raw GitHub in CSP
  and `no-store` on `/data/*`); deeplinks returned 200 with matching title/canonical; mobile
  audit passed at 375/390/412/768px with no horizontal overflow or small targets; contrast
  passed 35/35.
- The live attempt shown is still `2026-09-23T05:09:00.830Z`, failed with all three sources
  rate-limited (0/3). This release fixes stale presentation; it does not claim Reddit returned
  successful content. The workflow remains configured for 07:00, 13:00 and 19:00 UTC. At
  07:11 UTC the public Actions API still listed the 05:08 push-triggered run as latest and no
  07:00 scheduled event; delivery of that individual schedule is `UNKNOWN` (it may be delayed).
  No manual scan was dispatched and the cadence was not changed.
- Master-authorized release and post-deploy acceptance are complete. The prior primary, UX
  contributor and master worktrees remain untouched. No subagents or additional workers were
  used.
- The prior primary, UX contributor and master worktrees remain untouched. No subagents or
  additional workers were used.

## Current worker milestone: VH-SCAN-RELEASE-019 and VH-LINKS-019

- The isolated worker branch `codex/vitaharbor-integration-015` is based on `origin/main`
  and release source `ed19710f972356688b4d6e49075a13eacc5ef02f` was fast-forwarded to
  `origin/main` from `a191c773e9bcc577d053043ad9ec5f64ee95263a`. The dirty primary, UX
  contributor and master worktrees were not touched. Production deployment is NO_GO pending
  the failed GitHub Actions gate below.
- The scanner workflow no longer writes `github_action.status=success` before publication. The
  generated scanner JSON now records Action completion as `unknown`; the workflow commits and
  pushes first, then verifies the published `main` SHA in the Action log. This avoids a false
  success marker and a self-referential commit loop when `git push` fails. The old finalizer
  script was removed.
- Push-triggered GitHub Actions run `35886994823` (#14) failed in 43 seconds at “Verify unit
  and integration tests”, before Reddit scan, backfill, feed rebuild or publish; those steps
  were skipped. The failing health test expected local metadata (`provider=local`, `event/run_id/
  sha=null`) but the GitHub runner correctly supplied `provider=github-actions`, `event=push`,
  `run_id=35886994823` and release SHA `ed19710f972356688b4d6e49075a13eacc5ef02f`. This CI
  failure is the explicit release stop condition; no retry, code fix or deployment was done.
- The latest local scan attempt is `2026-09-23T15:47:43.956Z`: `partial`, 1/3 sources available
  (`vitahacks` available, `VitaPiracy` and `PSVitaHomebrew` rate-limited), Action status
  `unknown`. The public review queue has 11 sanitized items; internal provenance has 18 records
  (13 active and 5 terminal). No curated ledger promotion occurred.
- Before publication, live `origin/main` serves the older 13-item queue, including rejected
  discussion `reddit-1wndxal`. The release candidate's queue has 11 items, includes restored WIP
  candidates `reddit-1wn46c9`, `reddit-1wmax82` and `reddit-1wkf9m5`, excludes that discussion,
  and leaves the 29-project curated ledger unchanged. No game-data archive links were found in
  the curated TypeScript ledger or generated JSON/RSS feeds.
- Queue reconciliation found that 5 records initially disappeared from the earlier 13-to-8
  projection: three real WIP/review records were restored, `reddit-1wndxal` remains terminally
  `REJECTED` as a false-positive discussion, and legacy `reddit-1wh0klj` remains internal and
  withheld because its original body/evidence was not stored. Non-terminal records are now kept
  internally even when the public classifier withholds them. Evidence is in
  `docs/SCANNER_QUEUE_RECONCILIATION_2026-09-23.{json,md}`.
- The report-only curated-link audit covers 52 references: 16 HTTP/API-checked `ok`, 36 direct
  Reddit fetches `unverifiable` because Reddit returned HTTP 403, and 0 dead/redirect/wrong-target.
  A separate authenticated Chrome review verified all 19 unique Reddit URLs. The Jedi `files`
  and `data_files` posts expose direct game-data archives, but only the Reddit/GitHub provenance
  remains curated; no data-file URL was adopted. Evidence is in
  `docs/CURATED_LINK_BROWSER_REVIEW_2026-09-23.json` and the linked audit report.
- Local verification on the exact worker tree: `npm run verify` passed typecheck, 108 unit tests
  and a production build with 29 project pages and 32 sitemap URLs; lint passed; integration
  passed 7/7; Playwright passed 18/18 with one worker against the exact built preview at
  `http://127.0.0.1:4174`; `git diff --check` passed. The public curated feed and prerender each
  contain 29 projects; the candidate queue has 11 items and restores all three requested WIP
  IDs while excluding `reddit-1wndxal`; the curated ledger and generated feeds have no game-data
  archive links.
- Because run #14 stopped before scanning, it produced no source observations and published no
  scanner result. The latest public health snapshot remains `2026-09-23T15:47:43.956Z`, partial
  1/3 (`vitahacks` available; `VitaPiracy` and `PSVitaHomebrew` rate-limited), with Action
  metadata still `local/unknown`; this is prior scan evidence, not an outcome from run #14.
- Vercel production was not changed. Read-only `vercel inspect` confirms the alias still points
  to READY deployment `dpl_Cj1uUTeAnZq4DpyCfQj2t6FVJsyv` at
  `https://vitaharbor.vercel.app`. No live DOM acceptance was run for the new candidate; its
  production UI state remains UNKNOWN. The existing production deployment is the prior baseline.

## Completed assignment: VH-INTEGRATE-015

- Worker implementation is isolated on branch `codex/vitaharbor-integration-015` at
  `C:\Users\suloW\.codex\worktrees\vitaharbor-integration-015\VitaPort`, based on
  `origin/main` `2e8cc90ced003671a3b42064fe82a4350ce32f67`. Implementation, local gates,
  production deployment and live acceptance are complete; final post-deploy documentation
  and handoff are being committed separately.
- The primary checkout `C:\Users\suloW\Documents\ChatGPT\VitaPort` is on a separate
  dirty `main` worktree at `96f1ffe60245dc697af908a0d88a11619a691ed2`. The UX contributor
  checkout is `codex/vitaharbor-ux9` at `2e8cc90ced003671a3b42064fe82a4350ce32f67`; the
  master checkout is detached at `b5d6536d948ae3ec678f3e5e60366fe0d7d5181f`. All three
  contain independent pre-existing dirty work and are preserved without edits or cleanup.
- Implementation commit: `8ba6e436c5a068ed2d6760fd20708f3ee3ad1b67` on the isolated
  feature branch; scanner-status regression-test follow-up is `6d716fbc1c54c68785462be8e0dbf2ab09b7999d`.
  The branch includes automatic scanner commit `0c776a9a2481a1b434e8657e8ce270d8a3ada26c`;
  deployed runtime source is `9854ed75ff8a2f60cd684412f8b8f65afc3e361b`.
- Master task `01a0bed8-0aae-73d2-bff1-bb0b6e7dfd00` remains the architecture/delegation
  owner; worker task `01a0bc84-7462-7f92-a672-5856bed2ae0f` implements, tests and reports.
  No native subagents or additional workers were used.
- Local gates on this branch after scanner reconciliation: typecheck passed; unit tests 92/92;
  integration tests 7/7; build prerendered 29 projects and 32 sitemap URLs; lint passed;
  Playwright 18/18;
  mobile audit passed 4/4 with no horizontal overflow or small targets; contrast passed
  35/35; `git diff --check` passed.
- Production deployment `dpl_FATqcqE9dHac5assD26HoVUiYCf9` reached READY at
  `https://vitaharbor-fezbysjeb-anonymusv1605-8308.vercel.app`, aliased to
  `https://vitaharbor.vercel.app`, from exact pushed runtime SHA `9854ed75ff8a2f60cd684412f8b8f65afc3e361b`.
- Production acceptance: 18/18 E2E; header/SEO/crawler audit passed; project deeplinks
  returned 200 with correct title/canonical; mobile 4/4 had no document overflow or small
  targets; contrast passed 35/35. Live project feed and project sitemap each contain 29;
  discovery contains 13 sanitized candidates. Scanner health correctly says `failed`
  because all three Reddit sources were rate-limited; no new candidate was added.
- `gh` (GitHub CLI) is unavailable in this environment. Git remote access is available;
  `origin/main` was at runtime source `9854ed75ff8a2f60cd684412f8b8f65afc3e361b` at
  deployment. Deployment evidence, project status, hash-verified handoff and ignore-rule
  hardening were pushed in documentation-only commit `5f1f853`; runtime code is unchanged.
- `npm audit --omit=dev --audit-level=moderate` found 0 production dependency
  vulnerabilities. Full `npm audit` found 8 development-toolchain advisories (4 moderate,
  4 high, through Vitest/Wrangler dependencies); no major toolchain upgrades were included
  in this site integration.

The sections below retain completed and historical state; where they conflict with the
active assignment above, VH-SCAN-FRESH-017 is current.

## Historical facts (2026-09-20; superseded by the active assignment block above)

- Primary checkout: `main` at integration commit `e89adff` (full hash recorded in Git).
- Primary worker task: `01a0bc84-7462-7f92-a672-5856bed2ae0f`.
- Master task: `01a0bed8-0aae-73d2-bff1-bb0b6e7dfd00`, running in the Codex-managed
  worktree `C:\Users\suloW\.codex\worktrees\5e46\VitaPort`.
- GitHub scanner run `35511117870` passed end-to-end: tests, Reddit scan, feed
  rebuild and discovery commit.
- Latest verified production deployment is `dpl_31SM83iB5WYTmjJTAZNPF3AVbkhv`,
  READY and aliased to `https://vitaharbor.vercel.app` after `VH-INCIDENT-010`
  containment.

## Prior integration commit state (2026-09-20)

- The reviewed 80-path selection was committed locally on `main` as
  `e89adff` (`Integrate VitaHarbor ledger and incident controls`).
- The commit contains the accumulated site, data, audit, screenshot, scanner,
  incident and test work plus durable project-control files. The machine-local
  restart handoff and ignored runtime/browser artifacts were excluded.
- Post-commit bookkeeping, handoff verification and the clean-tree result are
  complete. No push, merge, reset, clean or stash occurred.

## Historical completed evidence

- `VH-LINKS-003` evidence records its historical local audit. The earlier
  live-completeness conclusion is superseded as `NO_GO` by `VH-LINKS-005`.
- `VH-LINKS-005` evidence records the rendered live crawl, conditional source
  corrections, feed generation, typecheck, 48 unit tests, production build,
  lint, 7 integration tests, diff-check, local/live 11-test E2E and zero bad
  clickable links after deployment.
- Existing evidence records GitHub run `35511117870` as an end-to-end success.
- Existing evidence records the READY Vercel deployment and live alias.
- The link audit and its exact scope are recorded in
  `docs/LINK_AUDIT_2026-09-20.md` and `EVIDENCE.jsonl`.
- `VH-DEPLOY-004` remains historical. `VH-LINKS-005` records the current READY
  deployment, alias, 28-route post-deploy crawl, rendered-anchor regression,
  removed-target checks and runtime-console check.

## Orchestration state

- Master: `VitaHarbor Master — Architect & Delegator` task owns the architecture
  and integration decision in the isolated Codex worktree.
- Primary worker: this existing task, `VitaHarbor Worker — Implement, Test &
  Deploy`, thread `01a0bc84-7462-7f92-a672-5856bed2ae0f`.
- Optional Luna workers: none active.
- Native/hidden subagents: prohibited.

## Open work

- `VH-INTEGRATE-009` is historical. `VH-INTEGRATE-015` is the active assignment and
  its implementation is isolated on the feature worktree listed above.
- `VH-INCIDENT-010` is complete and production-verified; its implementation,
  evidence and handoff are part of the reviewed integration selection.
- No push, merge, tag, GitHub workflow trigger or Vercel deployment is allowed
  in this integration assignment. Production remains on
  `dpl_31SM83iB5WYTmjJTAZNPF3AVbkhv`.

## Blockers and unknowns

- The current task runtime does not expose a canonical model name for the
  primary worker; it is recorded as `unrecorded` rather than inferred.
- No optional Luna specialist is currently required or active.
- Production deployment is complete for `VH-INCIDENT-010` with a `GO` deployment
  and post-deploy rendered-crawl gate. The full archive E2E is now `GO` at
  11/11; the stale all-projects-have-source assertion was replaced by the
  approved verified-source policy test.

## VH-LINKS-005 current release state

- Post-deploy crawl: 28 routes, 2,471 observed link records, 260 unique hrefs,
  33 unique external hrefs, 30 exact and 3 intentional generic external
  classifications, zero runtime errors and zero forbidden/internal-broken
  clickable links.
- Source-less or blocked project candidates are visibly non-clickable and are
  not represented as generic substitutes. The exact Cave Story screenshot file
  source remains available; its generic upstream root repository was removed.
- Machine-readable evidence: `docs/link-audit-live.json`.

## VH-INCIDENT-010 current containment state

- Read-only Reddit review found one explicit fake-port campaign proposal and two
  same-day KeeperRL follow-up claims in the monitored communities. The exact
  incident-linked set is recorded in `docs/FAKE_PORT_INCIDENT_2026-09-20.md`.
- Internal state: one `REJECTED` confirmed malicious item and two
  `BLOCKED_UNVERIFIED` linked claims. The five pre-existing quarantine records
  remain `QUARANTINED` and unrelated.
- Public discovery projection contains five unrelated sanitized items and no
  incident title, body, author, campaign ID or risk details. Curated ledger
  remains 28 projects with zero incident promotions.
- General campaign correlation is implemented in
  `scripts/reddit-provenance.mjs`; author identity alone is not a linkage or
  blacklist signal. Focused tests cover copied content, explicit references,
  cross-community near duplicates and legitimate same-author false positives.
- Reddit mutations: `NONE`. Production is on `dpl_31SM83iB5WYTmjJTAZNPF3AVbkhv`;
  live containment checks passed with 28 projects, 5 sanitized queue items,
  no incident values in public responses/DOM, and 0 runtime errors across 29
  crawled routes.

## VH-COMMENTS-006 current review state

- Both authenticated posts were reviewed read-only in Best and New, with all
  visible More replies threads opened: 6 visible unique comments on r/vitahacks
  plus 7 on r/VitaPiracy. Reddit reports one additional r/vitahacks comment in
  its total counter but exposes no text, author or permalink for it in either
  new or legacy view.
- The old Simpsons link is confirmed dead and already absent from production;
  the Portal panel already has no clickable external source. The Medal of
  Honor comment points to a real separate experimental fork but does not prove
  that the existing OpenMoHAA record should be replaced. Broad port-expansion,
  Star Fox and PSP requests remain deferred or outside scope.
- Review artifact: `docs/REDDIT_COMMENT_REVIEW_2026-09-20.md`.
- No code/data implementation was justified by the current comments. Reddit
  mutations: NONE.

## VH-COMMENTS-006 release state

- Preflight passed: verify (48 unit tests/build), lint, integration 7/7, full
  E2E 11/11 and diff-check.
- Deployment `dpl_8UbJWaou4vx1XKVephmATfBZuq8q` is READY and aliased to the
  production URL.
- Post-deploy rendered crawl passed: 28 routes, 2,484 link records, 260 unique
  hrefs, 33 external unique hrefs, zero forbidden/internal-broken links and
  zero runtime errors. The old Simpsons target remains absent and Portal has
  no clickable external source.
- The review is `CONDITIONAL_GO` only because Reddit's r/vitahacks metadata
  says seven comments while new and legacy authenticated views expose six
  text-bearing comment nodes; the unavailable seventh slot has no actionable
  content, author or permalink.

## VH-REDDIT-007 current state

- Canonical discovery scope is now `r/vitahacks`, `r/VitaPiracy` and `r/PSVitaHomebrew`, shared by the local scanner and the Vercel fallback route.
- `public/data/discovered.json` was regenerated at `2026-09-20T15:04:46.357Z` with the three-community RSS label and five existing pending candidates. The bounded public fetch returned HTTP 429 for VitaPiracy and PSVitaHomebrew; this is recorded as an external rate-limit condition, not a missing source configuration.
- Manual authenticated review of all three communities is recorded in `docs/REDDIT_THREE_COMMUNITY_REVIEW_2026-09-20.md`. C-Dogs SDL Vita is the only new curated item; Real Racing 2 and source-less claims remain unverified.
- The ledger now contains 28 projects and the generated JSON/RSS feeds contain 28 items. C-Dogs source evidence is the Reddit pre-release thread plus GitHub `vita-preview-1` with Vita data, VPK and checksum assets.
- Local gates are green: typecheck, 52 unit tests, build, lint, 7 integration tests, 11 E2E tests and diff-check. The first post-deploy run exposed a stale 27-project CDN hydration response; `/api/*` is now `no-store` and the browser API client uses `cache: "no-store"`.
- Final production deployment: `dpl_CdWZSDm5fk8Nf88AHkAD3uwAEhsc` READY at `https://vitaharbor-pa2sv9ah2-anonymusv1605-8308.vercel.app`, aliased to `https://vitaharbor.vercel.app`.
- Post-deploy live DOM now confirms 28 projects indexed, 28 Vita selector buttons, C-Dogs SDL visible, three-community copy visible, and 3x daily scan status. Live `/api/projects` returns 28 records with `Cache-Control: no-store`; live JSON/RSS feeds return 28 items and include C-Dogs plus the new community label. Full live E2E is 11/11; mobile audit is 4/4 with no overflow/small targets and contrast is 36/36.
- Assignment status: `CONDITIONAL_GO`; the only remaining condition is that the unauthenticated RSS scan hit HTTP 429 for VitaPiracy and PSVitaHomebrew during this run, while both were manually reviewed in the authenticated browser.
- Reddit mutations: NONE. No GitHub Actions workflow was manually triggered.

## Current integration checkpoint

`VH-INTEGRATE-009` has committed the reviewed site, scanner, quarantine,
campaign-control, test, evidence and project-control files locally. The final
handoff hashes the post-commit state and the working tree contains only the
explicitly excluded machine-local restart handoff. All secret, cookie, temporary
or ambiguous artifacts remain excluded.

## Release gate

Every assignment ends with a status of `GO`, `NO_GO`, `UNKNOWN` or
`NOT_APPLICABLE`, supported by an entry in `EVIDENCE.jsonl` and the relevant
test/build/deployment output.

## VH-RECONCILE-012 remote scanner reconciliation state

- `origin/main` had two scanner-only commits beyond the local hardened v2
  integration point: `37fabb5` and `4ba193f`. A normal merge produced local
  merge commit `7c1b17b`; no rebase, force push, reset, clean or stash was used.
- Both remote discovery files were legacy public schema v1 projections. Their
  22-item feed was not treated as a source of truth. The local v2 quarantine and
  curated feed generation won the conflicts.
- Seven remote candidate URLs were reconciled: five matched existing quarantine
  records, RC Cars matched the already-curated canonical lead and was removed by
  the hardened scanner, and Super Smash Bros Melee update remains
  `reddit-1wllsbo` in `QUARANTINED` with a content hash and explicit missing-body
  evidence gap.
- Current post-scan counts are 28 curated projects, 9 internal quarantine
  records and 6 sanitized public review-queue items. No candidate was promoted
  by this reconciliation and Reddit was not mutated. The reconciliation fixture,
  idempotent one-off script, report and append-only audit events are committed
  with the worker result.
- Deployment was intentionally not performed. GitHub Actions verification and
  the final local/remote tree proof are recorded below as part of the release
  gate after push.
- GitHub Actions run `35526699613` succeeded on `17ada1a`; its scanner data
  commit `ef469277` was inspected and fast-forwarded locally. It kept schema v2,
  left curated `fallbackData.ts` unchanged and removed only the now-curated RC
  Cars quarantine duplicate.

## VH-DEPLOY-013 current production state

- Exact deployed source state: `95ee8b2f5892470f8b6f0d40366567376d279e72`,
  equal to `origin/main` before deployment. Vercel deployment
  `dpl_8uzDLxvodhXRBmTL1ftxsFBfWDvi` reached `READY` and is aliased to
  `https://vitaharbor.vercel.app`; deployment URL is
  `https://vitaharbor-cbn639a17-anonymusv1605-8308.vercel.app`.
- Pre-deploy gates passed on the exact state: verify (65 unit tests and 28
  prerendered pages), lint, integration 7/7, production E2E 11/11, JSON/JSONL
  validation, schema/count checks, public sanitization, incident containment,
  no-auto-promotion invariant, diff-check and npm audit with 0 vulnerabilities.
- Live counts and containment: `/api/projects?limit=100` returns 28; public
  discovery is schema v2 with 6 items and only approved sanitized fields;
  internal `data/quarantine.json` is not JSON-downloadable; JSON/RSS feeds each
  contain 28 curated items; the quarantined Melee item is absent from feeds and
  sitemap; incident IDs, titles, authors, bodies and campaign values are absent
  from root, all 29 sitemap routes, APIs, feeds and sitemap.
- Live acceptance passed: headers/SEO/crawler files, deeplinks, mobile audit
  (4 viewports, no document overflow or small targets), contrast 35/35,
  production E2E 11/11, browser console/runtime check with 0 errors, and
  rendered link crawl with 2,673 links across 29 routes and 0 runtime errors.
- Live bundle identity: `index-B6whtbJK.js`, `react-BN8AQLYF.js`,
  `icons-85dDDL3V.js`, `index-DQwSCEyv.css`. Key API responses are `no-store`;
  root and public discovery retain the documented Vercel cache policy.
- Reddit mutations: `NONE`. No GitHub workflow was manually triggered. The
  post-deploy documentation commit is intentionally not redeployed.

## VH-POISON-008 and VH-INCIDENT-010 security state

- Exact threat post was reviewed read-only in a separate authenticated Chrome session and is recorded in `docs/REDDIT_POISONING_REVIEW_2026-09-20.md`: `r/VitaPiracy`, post `1wlj9gd`, published `2026-09-20T14:58:36.001Z`, explicit fake/troll intent. Reddit mutations: NONE.
- `data/quarantine.json` is schema v2 and contains 8 internal records: 5 unrelated candidates remain `QUARANTINED`, one confirmed campaign fake is `REJECTED` and two linked claims are `BLOCKED_UNVERIFIED`; the public projection contains five items and no author, body, campaign, risk signal or scanner-reason fields. The curated ledger remains 28 projects and no feed/sitemap item is sourced from quarantine.
- Scanner and Vercel fallback route use the same strict boundary. The scanner writes only quarantine/public projection; GitHub Actions stages only `data/quarantine.json`, `public/data` and generated `public/api`, never `fallbackData.ts`.
- Manual promotion requires `VERIFIED_FOR_REVIEW`, reviewer, rationale, allowlisted evidence URLs, repository evidence, Vita hardware result and append-only audit record. Explicit fake/troll signals additionally require `--allow-risk` and `risk_disposition`.
- Local release gates: typecheck, lint, verify with 65 unit tests/build, integration 7/7, diff-check, generated poison-output scan, live E2E 11/11, mobile 4/4, contrast 35/35, headers/SEO/crawler pass.
- Final production deployment `dpl_31SM83iB5WYTmjJTAZNPF3AVbkhv` is READY at the production alias. Live link crawl recorded 2,657 links across 29 routes with 0 runtime errors; final smoke and E2E were rerun after the clean hosted build. Incident-linked IDs, titles, body, author, campaign and rationale values are absent from public outputs.
- Security verdict: `GO` for the implemented poisoning controls. External RSS still returned mixed 429/available responses during the live read-only cron check; this affects freshness, not the no-auto-promotion invariant.

## VH-PORTNEWS-015 / VH-TRACE-016 current state (2026-09-22)

- Halo CE (`reddit-1wadsa7`) is preserved as `VERIFIED_FOR_REVIEW` in the provenance ledger and appears once in the sanitized public discovery projection. It is not curated/promoted because no verified public Xita repository or public release artifact has been established.
- Test Drive (1987) remains `PROMOTED`; TheForceEngine-VITA, Real Racing 2 and Resident Evil 4 remain `VERIFIED_FOR_REVIEW`. The two KeeperRL records remain `BLOCKED_UNVERIFIED` and the confirmed fake-port campaign record remains `REJECTED`.
- `origin/main` advanced after the Halo repair through automatic scanner commit `3dbfd11` (`Scan: record newly surfaced port threads`). The isolated release worktree was fast-forwarded to that exact commit; the automation changed only `data/quarantine.json`, `public/data/discovered.json` and `public/api/rss.xml`.
- Full local release verification on `3dbfd11` passed: typecheck, 76/76 unit tests, production build with 29 prerendered project pages and 30 sitemap URLs, lint, integration 7/7 and E2E 11/11.
- Historical Reddit recovery remains bounded and incomplete where Reddit rate-limits requests. HTTP 429 is an external coverage limitation and must never be interpreted as proof that no historical post exists.
- Project traceability is now an explicit repository contract in `AGENTS.md`: every harness must record when, what, why, actor/model and verification in `docs/WORKLOG.md`, keep `PROJECT_STATE.md` current, and refresh/verify the hash-protected handoff after the final repository state.
- Production runtime commit: `a70a729` (`Enforce VitaHarbor project traceability`). Vercel deployment `dpl_8QeqpCERNv3rSAF7JDf59FQnjzrW` is `READY` at `https://vitaharbor-8emy7tpzs-anonymusv1605-8308.vercel.app` and aliased to `https://vitaharbor.vercel.app`.
- Live acceptance on 2026-09-22 passed with 29 curated projects, 29 feed items, one Halo CE review record, all four verified review records preserved, Test Drive curated-only, zero public incident leakage, production E2E 11/11, headers/deeplinks green, mobile 4/4 and contrast 35/35.
- The post-deploy continuity commit that records this deployment is documentation/evidence only and is not itself a runtime change; `a70a729` remains the exact deployed application/data source state.
- `HANDOFF.md` is refreshed as `VH-TRACE-016` with 36 hash-protected project sources, actor `codex` and model `gpt-5.6-sol`; final hash verification is performed after the traceability records are complete.
