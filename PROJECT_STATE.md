# VitaHarbor project state

Updated: 2026-09-20

## Confirmed current facts

- Primary checkout: `main` at integration commit `e89adff` (full hash recorded in Git).
- Primary worker task: `01a0bc84-7462-7f92-a672-5856bed2ae0f`.
- Master task: `01a0bed8-0aae-73d2-bff1-bb0b6e7dfd00`, running in the Codex-managed
  worktree `C:\Users\suloW\.codex\worktrees\5e46\VitaPort`.
- GitHub scanner run `35511117870` passed end-to-end: tests, Reddit scan, feed
  rebuild and discovery commit.
- Latest verified production deployment is `dpl_31SM83iB5WYTmjJTAZNPF3AVbkhv`,
  READY and aliased to `https://vitaharbor.vercel.app` after `VH-INCIDENT-010`
  containment.

## Integration commit state

- The reviewed 80-path selection was committed locally on `main` as
  `e89adff` (`Integrate VitaHarbor ledger and incident controls`).
- The commit contains the accumulated site, data, audit, screenshot, scanner,
  incident and test work plus durable project-control files. The machine-local
  restart handoff and ignored runtime/browser artifacts were excluded.
- Post-commit bookkeeping, handoff verification and the clean-tree result are
  complete. No push, merge, reset, clean or stash occurred.

## Completed evidence

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

- `VH-INTEGRATE-009` is the active assignment. The exact final checkout is
  undergoing inventory, safety gates and local integration on `main`.
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
  the final local/remote tree proof remain part of the release gate after push.
- GitHub Actions run `35526699613` succeeded on `17ada1a`; its scanner data
  commit `ef469277` was inspected and fast-forwarded locally. It kept schema v2,
  left curated `fallbackData.ts` unchanged and removed only the now-curated RC
  Cars quarantine duplicate.

## VH-POISON-008 and VH-INCIDENT-010 security state

- Exact threat post was reviewed read-only in a separate authenticated Chrome session and is recorded in `docs/REDDIT_POISONING_REVIEW_2026-09-20.md`: `r/VitaPiracy`, post `1wlj9gd`, published `2026-09-20T14:58:36.001Z`, explicit fake/troll intent. Reddit mutations: NONE.
- `data/quarantine.json` is schema v2 and contains 8 internal records: 5 unrelated candidates remain `QUARANTINED`, one confirmed campaign fake is `REJECTED` and two linked claims are `BLOCKED_UNVERIFIED`; the public projection contains five items and no author, body, campaign, risk signal or scanner-reason fields. The curated ledger remains 28 projects and no feed/sitemap item is sourced from quarantine.
- Scanner and Vercel fallback route use the same strict boundary. The scanner writes only quarantine/public projection; GitHub Actions stages only `data/quarantine.json`, `public/data` and generated `public/api`, never `fallbackData.ts`.
- Manual promotion requires `VERIFIED_FOR_REVIEW`, reviewer, rationale, allowlisted evidence URLs, repository evidence, Vita hardware result and append-only audit record. Explicit fake/troll signals additionally require `--allow-risk` and `risk_disposition`.
- Local release gates: typecheck, lint, verify with 65 unit tests/build, integration 7/7, diff-check, generated poison-output scan, live E2E 11/11, mobile 4/4, contrast 35/35, headers/SEO/crawler pass.
- Final production deployment `dpl_31SM83iB5WYTmjJTAZNPF3AVbkhv` is READY at the production alias. Live link crawl recorded 2,657 links across 29 routes with 0 runtime errors; final smoke and E2E were rerun after the clean hosted build. Incident-linked IDs, titles, body, author, campaign and rationale values are absent from public outputs.
- Security verdict: `GO` for the implemented poisoning controls. External RSS still returned mixed 429/available responses during the live read-only cron check; this affects freshness, not the no-auto-promotion invariant.
