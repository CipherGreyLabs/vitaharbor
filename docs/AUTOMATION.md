# Automation

The archive stays current in two steps that run without you: a scheduled scan that
records newly surfaced threads, and a deployment that publishes them.

Right now only the first step exists locally. There is **no git remote** on this
checkout and the Vercel project is **not connected to a repository** — every
deployment so far was a manual CLI upload. Until both links are closed, the chain
runs by hand.

## 1. The scan (already working)

```
npm run data:scan      # writes public/data/discovered.json
npm run data:list      # shows the candidates
npm run data:promote -- --index 1
npm test               # the data invariants must pass
npm run data:feeds     # refreshes the JSON and RSS feeds
```

The scanner records candidates only. It never invents a stage, framerate or credit,
because a thread title cannot prove those things. Promotion is a deliberate step and
the resulting entry is tagged `verification: "detected"` so the interface can label it
as unverified until someone supplies a hardware report.

## 2. Close the chain (needs your accounts)

Create an empty repository, then:

```
git remote add origin <repository-url>
git push -u origin main
```

Then connect the Vercel project to that repository so a push deploys on its own.
In the Vercel dashboard: Project -> Settings -> Git -> Connect Git Repository. After
that the scheduled workflow in `.github/workflows/reddit-scanner.yml` can run at
08:00 and 20:00 UTC: it installs, runs the tests, scans, rebuilds the feeds and
commits only when something actually changed.

Verify the connection took effect: the deployment list should start showing commit
metadata instead of `cli-upload` as the source.

## Checks worth keeping

- `npm test` enforces the ledger invariants, including a ban on clock-derived
  timestamps so the archive cannot silently look fresher than it is.
- Every entry must carry a Reddit source URL, and every update must point at a
  project that exists.

