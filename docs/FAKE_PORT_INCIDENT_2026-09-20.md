# Fake-port incident review — 2026-09-20

Incident: `VH-INCIDENT-010`
Status: contained, deployed and production-verified
Scope: `r/vitahacks`, `r/VitaPiracy`, `r/PSVitaHomebrew`

## Executive result

The public Reddit post proposing fake ports to troll VitaHarbor was confirmed as a
malicious campaign signal. It is recorded internally as `REJECTED` and is absent from the
public discovery projection. Two same-day KeeperRL announcement posts were found in the
two monitored communities. They explicitly referred back to the trolling post and reused
near-identical wording, but no repository or release evidence was available. They are
therefore recorded as `BLOCKED_UNVERIFIED`, not asserted to be fake.

| Classification | Count | State | Public exposure after containment |
|---|---:|---|---|
| Confirmed campaign fake | 1 | `REJECTED` | removed from public queue, feeds, sitemap and curated path |
| Linked but unverified claim | 2 | `BLOCKED_UNVERIFIED` | removed from public queue and not eligible for promotion |
| Existing unrelated quarantine records | 5 | `QUARANTINED` | unchanged, sanitized review queue only |
| Incident records in curated ledger | 0 | n/a | none |

## Evidence observed read-only

The Reddit pages were opened in a separate task-specific authenticated Chrome session.
No vote, reply, report, save, follow, message, edit or other Reddit mutation was made.

| ID | Community and permalink | Observed fact | Disposition |
|---|---|---|---|
| `reddit-1wlj9gd` | `r/VitaPiracy/comments/1wlj9gd/` | Title explicitly proposed making fake ports to troll VitaHarbor; the visible post body was observed as “would be very funny” before the post became deleted. A reply from the author stated that the post was deleted because they felt guilty. | `REJECTED`, `CONFIRMED_CAMPAIGN_FAKE` |
| `reddit-1wlkdva` | `r/VitaPiracy/comments/1wlkdva/` | KeeperRL Vita announcement; text referred to the previous trolling post while claiming the new attempt was real. It promised a future GitHub link but provided no repository or release evidence. | `BLOCKED_UNVERIFIED`, `UNVERIFIED_CLAIM` |
| `reddit-1wlkixu` | `r/vitahacks/comments/1wlkixu/` | Same KeeperRL announcement in a second monitored community, with near-identical wording and the same missing repository/release evidence. | `BLOCKED_UNVERIFIED`, `UNVERIFIED_CLAIM` |

The author profile and global author search did not expose a complete public post history in
the current Reddit UI. That limitation is recorded as unknown rather than treated as proof
that no other posts exist. Community searches for `VitaHarbor`, `fake`, `fake ports`,
`troll`, `troll VitaHarbor`, `C-Dogs` and follow-up wording found the three records above
as the incident-linked set in the monitored scope. The legitimate C-Dogs result had
separate Vita and GitHub release evidence and was not linked to this campaign.

## Exposure matrix

| Surface | Before containment | After containment | Verification target |
|---|---|---|---|
| Reddit | threat post and two follow-up claims were publicly viewable during review; threat later showed deleted state | outside VitaHarbor control; no Reddit mutations made | source pages and deletion state captured read-only |
| Internal quarantine | five unrelated records; incident IDs were not present before local incident recording | all three incident records retained for provenance; one rejected and two blocked | `data/quarantine.json` plus state history |
| Public discovery JSON | five unrelated sanitized records; no incident ID/title/body/author | five unrelated sanitized records; all three incident records omitted | `public/data/discovered.json` |
| Curated ledger | 28 projects; no KeeperRL or incident item | unchanged at 28; no incident item | `src/shared/constants/fallbackData.ts` |
| Feeds, sitemap and prerendered HTML | no incident item in the curated source | rebuilt and checked; no incident item exposed | build output and live smoke checks |

## Generalized control implemented

`scripts/reddit-provenance.mjs` now derives internal-only campaign metadata and correlates
records using multiple independent signals:

- normalized wording and near-duplicate fingerprints;
- content hashes independent of URL and author;
- shared media or outbound-link fingerprints;
- a bounded publication-time burst; and
- explicit references to a previous fake/troll campaign.

An author name by itself never links records and is never a blacklist. A legitimate project
with a reused account remains unmerged unless content, artifact or explicit-reference
evidence also links it. `publicCandidate()` omits terminal incident records, while public
serialization continues to omit authors, bodies, campaign metadata, risk signals and
review rationale.

## Durable evidence

- Internal decisions: `data/quarantine.json`
- Append-only state audit: `data/provenance-audit.jsonl`
- Sanitized public projection: `public/data/discovered.json`
- Generic controls: `docs/THREAT_MODEL_DATA_POISONING.md` and
  `docs/MODERATION_AND_PROMOTION.md`
- Focused regressions: `tests/unit/data-poisoning.test.mjs`
- Containment runner: `scripts/contain-fake-port-incident.mjs`

## Unknowns and boundaries

- Reddit’s UI currently hides the complete author history and the original post is now
  deleted; historical body/author observations are retained only in the internal incident
  record and audit evidence.
- Reddit RSS/API access can be rate-limited. The scanner remains conservative and cannot
  claim completeness outside the configured communities and observed search results.
- No media binary hash was available for the text-only KeeperRL posts. The control remains
  available for future RSS entries that expose media URLs or hashes.

Reddit mutations: `NONE`.
