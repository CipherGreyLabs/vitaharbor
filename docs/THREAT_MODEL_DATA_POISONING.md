# VitaHarbor data-poisoning threat model

Status: implemented for `VH-POISON-008`; campaign containment added for `VH-INCIDENT-010` on 2026-09-20.

## Scope

The scanner reads public Reddit RSS entries from `r/vitahacks`, `r/VitaPiracy` and
`r/PSVitaHomebrew`. Reddit text, usernames, timestamps and outbound links are tainted
external input. A scanner match is a lead, not a project record.

## Attack paths and controls

| Attack path | Control | Public effect |
|---|---|---|
| Explicit fake/troll post | strict URL/field validation, poison signal, quarantine, withheld public projection | no source link, no author, no internal signal details |
| Convincing fake release | exact repository/release and Vita evidence required in a reviewer bundle | never enters curated data automatically |
| Copied legitimate post with changed link | canonical URL, bounded allowlisted evidence hosts, content hash and manual source comparison | remains quarantined |
| Generic upstream GitHub repository | project-specific Vita evidence gap and manual promotion gate | absent from curated feeds and sitemap |
| Empty/new repository | evidence gap and reviewer-controlled disposition | no promotion from scan result |
| Screenshot-only claim | screenshot-only risk signal; screenshot is not a release or hardware proof | no curated entry |
| Redirect/malformed/oversized input | ingestion boundary rejects the record | not written to the queue |
| HTML/script text in a title or body | text-only normalization, JSON serialization, React escaping and XML escaping | no executable markup |
| Cross-post burst | canonical Reddit post id plus content hash for correlation | duplicate is not independent corroboration |
| Coordinated fake-port campaign | wording fingerprint, media/link fingerprints, temporal burst and explicit prior-campaign references are correlated into an internal cluster | confirmed malicious records are rejected; linked no-evidence claims are blocked and omitted from every public projection |
| Legitimate developer shares an account or timing signal | campaign linkage requires content/artifact/reference evidence; author identity is never sufficient | account reuse alone cannot blacklist or merge a legitimate project |

No username blacklist or author reputation score is used. Legitimate sources can be
reviewed by evidence; suspicious sources can only be blocked by an explicit disposition.

Campaign metadata is internal-only. The public projection omits authors, bodies, campaign
IDs, fingerprints, risk signals and incident rationale. A public record is removed when
its incident disposition is `removed`; terminal `REJECTED` and `BLOCKED_UNVERIFIED`
records never enter the public queue, feeds, sitemap or curated ledger.

The 2026-09-20 incident is documented in
`docs/FAKE_PORT_INCIDENT_2026-09-20.md`. The exact troll proposal was treated as a
confirmed malicious item. Two same-day cross-community KeeperRL claims were not called
fake without proof; they were linked to the campaign by explicit reference and repeated
wording, then held as `BLOCKED_UNVERIFIED` because no repository or release evidence was
available.

## Non-negotiable invariant

`data/quarantine.json` is the scanner output. `src/shared/constants/fallbackData.ts` is
the curated source of truth. The scanner, GitHub Actions workflow and Vercel read-only
cron route cannot write curated projects, updates, feeds or sitemap entries.

The only route from a candidate to the curated ledger is an explicit operator command:

```text
DETECTED -> QUARANTINED -> VERIFIED_FOR_REVIEW -> PROMOTED
                    \-> REJECTED
                    \-> BLOCKED_UNVERIFIED
```

Promotion requires a reviewer, a minimum-length rationale, an evidence file with
allowlisted source URLs, repository evidence, and a Vita hardware result. Every state
change appends one line to `data/provenance-audit.jsonl`.
