# VitaHarbor integration checkpoint — 2026-09-20

Assignment: `VH-INTEGRATE-009`
Checkout: `C:\Users\suloW\Documents\ChatGPT\VitaPort`
Branch: `main`
Base before integration: `b5d6536d948ae3ec678f3e5e60366fe0d7d5181f`
Production reference: `dpl_31SM83iB5WYTmjJTAZNPF3AVbkhv` (unchanged by this assignment)

## Inventory decision

The checkout contained 44 modified tracked paths and 36 untracked paths. The reviewed
selection contains the intentional VitaHarbor product, data, scanner, campaign-control,
test, audit, evidence and project-control work accumulated through `VH-INCIDENT-010`.
The five pre-existing quarantine candidates, three incident dispositions, 28 curated
projects and five-item sanitized public queue are all included in that selection.

### Included tracked families

- Product and ledger: `index.html`, `src/`, `public/api/`, `public/data/`,
  `public/og.png`, `migrations/0002_seed.sql`, `vercel.json`, `package.json`.
- Discovery and provenance: `api/cron-scan.ts`, `scripts/cron-reddit-scan.mjs`,
  `scripts/reddit-*.mjs`, `scripts/reddit-*.d.mts`, `scripts/promote-candidate.mjs`,
  `scripts/make-feeds.ts`, `scripts/prerender.mjs`, `scripts/make-og.mjs`.
- Audits and tests: `scripts/_oneoff/contrast-audit.mjs`,
  `scripts/_oneoff/mobile-audit.mjs`, `tests/e2e/archive.spec.ts`,
  `tests/unit/data.test.ts`.
- Project instructions and durable documentation: `AGENTS.md`, `README.md`,
  `docs/AUTOMATION.md`, `docs/MASTER_BLUEPRINT.md`, `docs/WORKLOG.md`,
  `.github/workflows/reddit-scanner.yml`, `.gitignore`.

### Included untracked families

- Project control and evidence: `AGENT_TEAM.json`, `DECISIONS.md`, `EVIDENCE.jsonl`,
  `HANDOFF.md`, `PROJECT_BRIEF.md`, `PROJECT_STATE.md`, `data/`, `docs/`, excluding
  the machine-local restart handoff listed below.
- Incident and provenance implementation: `scripts/contain-fake-port-incident.mjs`,
  `scripts/migrate-quarantine.mjs`, `scripts/_oneoff/live-link-crawl.mjs`,
  `tests/unit/data-poisoning.test.mjs`, `tests/unit/ledger-types.test.ts`,
  `tests/unit/link-integrity.test.ts`, `tests/unit/reddit-scanner.test.mjs`.
- Reviewed visual assets: `public/screenshots/`.

`docs/link-audit-live.json` is included as the machine-readable result of the live
29-route crawl. It is evidence, not runtime input.

## Explicit exclusions

- `VITAHARBOR_THREAD_RESTART_HANDOFF_2026-09-20.md` is preserved but excluded: it
  contains machine-local Codex session paths, thread IDs and historical restart context,
  and is not needed as a project runtime or durable source of truth.
- Ignored `.vercel/`, `.wrangler/`, `dist/`, `node_modules/`, `test-results/`, local
  browser screenshots, diagnostic images/logs, `cloudflared.exe` and `cloudflared.log`
  remain outside Git. No cookies, browser profiles, session exports, secrets or `.env`
  files were selected.

## Safety and release state

- Reddit mutations: `NONE`.
- No push, merge, tag, GitHub workflow trigger or Vercel deployment is permitted.
- `VH-INCIDENT-010` is already production-verified; this checkpoint only integrates
  the reviewed local state.
- The final staged manifest and commit hash are recorded in the updated project state,
  worklog, evidence and handoff after all gates pass.
