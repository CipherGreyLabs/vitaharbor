# Automation

Scheduled scanning runs completely free via **GitHub Actions**. It triggers three times a day
at 07:00, 13:00 and 19:00 UTC, fetches r/vitahacks, r/VitaPiracy and r/PSVitaHomebrew,
and commits quarantined candidates back to the repo
without using Codex tokens.

The Vercel site reads `scanner-health.json` and `discovered.json` from the public `main`
branch when visitors load the page, with a 15-minute refresh while it remains open. This is
necessary because scanner commits do not themselves rebuild the static Vercel deployment.
The deployed JSON files are a clearly labelled fallback snapshot, not the live source.

The repository remote is configured and the workflow is present in
`.github/workflows/reddit-scanner.yml`. GitHub Actions is the current scheduled scan engine;
the Vercel `/api/cron-scan` route remains a fallback for dashboard-visible runs. This document
does not claim a current Vercel Git-integration state without dashboard evidence.

## 1. The scan (already working)

```
 npm run data:migrate   # one-time migration of the old queue
 npm run data:scan      # writes data/quarantine.json and a safe public projection
 npm run data:list      # shows candidates awaiting review
 npm run data:verify -- --id reddit-<post-id> --reviewer "name" --reason "..." --evidence-file review.json
 npm run data:promote -- --id reddit-<post-id> --reviewer "name" --reason "..." --evidence-file review.json --name "Exact name" --repo-url https://github.com/org/repo
npm test               # the data invariants must pass
npm run data:feeds     # refreshes the JSON and RSS feeds
```

The scanner records candidates from all three configured communities only. It never invents a stage, framerate or credit,
because a thread title cannot prove those things. Every accepted result first enters
`data/quarantine.json` as `QUARANTINED`; the public file is a sanitized projection and
never includes author names or internal risk details. Promotion is a separate operator
action after `VERIFIED_FOR_REVIEW`, with an evidence bundle and an append-only audit
line in `data/provenance-audit.jsonl`. The workflow never writes `fallbackData.ts`.

## 2. Current workflow

The scheduled workflow installs dependencies, runs the tests, scans, rebuilds the feeds and
commits the refreshed scan timestamp and queue to `main`. Its current schedule is 07:00,
13:00 and 19:00 UTC. A manual run is available through GitHub Actions' `workflow_dispatch`
trigger. The site reports per-community errors honestly; a successful Actions job does not
mean Reddit accepted the requests.

## Checks worth keeping

- `npm test` enforces the ledger invariants, including a ban on clock-derived
  timestamps so the archive cannot silently look fresher than it is.
- Every entry must carry a Reddit source URL, and every update must point at a
  project that exists.
