# Automation

Scheduled scanning runs via **GitHub Actions** at 07:17, 13:17 and 19:17 UTC. The minute is
offset from the top of the hour because GitHub can delay scheduled workflows during busy
hour-boundary periods; the offset is not a punctuality guarantee. The scanner fetches
r/vitahacks, r/VitaPiracy and r/PSVitaHomebrew and commits quarantined candidates back to the
repo without using Codex tokens. Push-triggered workflow runs are verification-only; scans,
backfills, feed rebuilds and data publication run only for scheduled or manually dispatched
events.

The visitor-facing site reads only the sanitized `public/data/discovered.json` community-post
projection from the public `main` branch, with a 15-minute refresh while the page remains open.
It contains only a post title, Reddit link, community, publication date and an explicit
`unverified` label. It does not fetch or publish scanner-health or workflow metadata. The
internal `data/scanner-health.json` file remains available to the scanner and tests, but is not
copied to the static site.

The repository workflow is `.github/workflows/reddit-scanner.yml`. GitHub Actions is the only
scheduled scan engine. The old Vercel `/api/cron-scan` route and its daily cron were removed:
they read feeds but had no publication consumer. Unrelated Vercel API routes remain unchanged.

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

On a scheduled or manually dispatched run, the workflow installs dependencies, runs unit and
integration tests, scans, rebuilds the feeds and commits discovery results to `main`. Its
schedule is 07:17, 13:17 and 19:17 UTC; only the 07:17 run performs historical backfill. A
manual run is available through GitHub Actions' `workflow_dispatch` trigger. Pushes matching
the workflow's scanner-related path filters run tests only and cannot scan or write data. A
successful Actions job does not mean Reddit accepted the requests. HTTP 429 responses are
recorded internally with a bounded `Retry-After` hint and are not retried immediately; a
later scheduled run may still receive another rate limit.

## Checks worth keeping

- `npm test` enforces the ledger invariants, including a ban on clock-derived
  timestamps so the archive cannot silently look fresher than it is.
- Every entry must carry a Reddit source URL, and every update must point at a
  project that exists.
