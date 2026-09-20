# Remote scanner reconciliation — 2026-09-20

## Scope and decision

This record reconciles the two remote scanner commits that advanced `origin/main`
while the local hardened v2 provenance state was being integrated. The remote
commits were merged normally. Their legacy public projection was not copied over
the current v2 boundary, and no candidate was promoted into
`src/shared/constants/fallbackData.ts`.

Reddit was not mutated. This reconciliation uses only the public data committed
by the scanner; the original post bodies and scanner payloads were not available
in those commits, so the two newly preserved records remain `QUARANTINED`.

## Remote commits

| Commit | Parent | Author/time (UTC) | Files changed | Observed result |
|---|---|---|---|---|
| `37fabb556832b06c4fc570ecc56278fe21dfff06` | `b5d6536d948ae3ec678f3e5e60366fe0d7d5181f` | `vitaharbor-scan`, 2026-09-20 12:37:28 | `public/data/discovered.json`, `public/api/feed.json`, `public/api/rss.xml` | Legacy discovery projection with 6 candidates and a 22-item feed |
| `4ba193f56c1f9ef873deb721162348bee89f38b9` | `37fabb556832b06c4fc570ecc56278fe21dfff06` | `vitaharbor-scan`, 2026-09-20 16:41:43 | `public/data/discovered.json`, `public/api/rss.xml` | Legacy discovery projection with 7 candidates; feed remained the older 22-item projection |

The remote discovery files have no `schema_version` and expose legacy fields
such as `author`, `confidence` and `classification_reason`. The current local
state uses schema v2, keeps those fields internal, and derives public output via
`scripts/reddit-provenance.mjs`.

## Candidate reconciliation

Remote IDs were legacy URL-derived IDs. Matching was done on the canonical Reddit
URL, not on the legacy ID string.

| Reddit post | Remote disposition | Current disposition | Action |
|---|---|---|---|
| `1wkvzon` — 8BitDo Ultimate 2 | legacy candidate | `reddit-1wkvzon`, `QUARANTINED` | Deduplicated; current v2 record retained |
| `1wko6vu` — Ratchet & Clank controls | legacy candidate | `reddit-1wko6vu`, `QUARANTINED` | Deduplicated; current v2 record retained |
| `1wjte26` — TFoUAD update | legacy candidate | `reddit-1wjte26`, `QUARANTINED` | Deduplicated; current v2 record retained |
| `1wjn8zg` — RC Cars port progress | legacy candidate | `reddit-1wjn8zg`, `QUARANTINED` | Added to v2 quarantine with content hash and evidence gaps |
| `1wi5b10` — Building an app for all things Vita | legacy candidate | `reddit-1wi5b10`, `QUARANTINED` | Deduplicated; current v2 record retained |
| `1wh0klj` — Class of '09 Vita Port | legacy candidate | `reddit-1wh0klj`, `QUARANTINED` | Deduplicated; current v2 record retained |
| `1wllsbo` — Super Smash Bros Melee update | legacy candidate | `reddit-1wllsbo`, `QUARANTINED` | Added to v2 quarantine with content hash and evidence gaps |

The two new records explicitly record that the raw post body and scanner payload
were unavailable in the remote public projection. They are therefore leads for
fresh review, not proof of a working port or an endorsement. Their URLs do not
match the incident-contained IDs `1wlj9gd`, `1wlkdva` or `1wlkixu`; the absence of
the original bodies means that this is an identity check, not a full incident
re-assessment.

## Resulting tree state

- Normal merge commit: `7c1b17b` (`Merge remote scanner commits before provenance reconciliation`).
- Curated ledger: 28 projects; unchanged.
- Internal quarantine: 10 records; 7 public-safe `QUARANTINED` review-queue items, 2 `BLOCKED_UNVERIFIED` incident records and 1 `REJECTED` incident record.
- Public discovery: schema v2, 7 sanitized review-queue items; no author, body, risk, campaign or scanner-reason fields.
- JSON and RSS feeds: regenerated from the curated ledger, 28 items; the remote legacy 22-item feed was discarded.
- Audit: two append-only `remote_scanner_reconciliation` events identify both source commits and their evidence gaps.
- Deployment: none in this assignment; the existing production deployment remains unchanged.

The durable observation fixture is
`data/remote-scanner-reconciliation-2026-09-20.json`, and the idempotent
reconciliation script is `scripts/_oneoff/reconcile-remote-scanner.mjs`.
