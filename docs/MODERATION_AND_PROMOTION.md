# Manual candidate review

The scheduled scanner is deliberately not a publisher. It records a bounded,
provenance-first candidate in `data/quarantine.json` and emits only a sanitized public
review queue in `public/data/discovered.json`.

## Inspect

```text
npm run data:list
npm run data:inspect -- --id reddit-<post-id>
```

The public queue intentionally omits author names, scanner reasons and risk details. An
explicit fake/troll source is shown only as a withheld review item and has no outbound
link.

## Campaign containment

The scanner derives internal-only campaign metadata from bounded, normalized evidence:

- repeated wording or content fingerprints;
- shared media or outbound-link fingerprints;
- a bounded publication-time burst; and
- an explicit reference to a previous fake/troll post.

An author name alone never creates a campaign and is never a blacklist. A legitimate
project with a reused account, shared timing or a normal repository/release claim stays
reviewable unless independent campaign evidence links it.

For a confirmed incident, use the terminal states deliberately: `REJECTED` for the
malicious item itself and `BLOCKED_UNVERIFIED` for linked claims that lack enough evidence
to call them fake. Both states are omitted from the public discovery projection. The
internal decision and every state change are appended to
`data/provenance-audit.jsonl`; the public queue contains no incident ID, author, body or
fingerprint.

`VH-INCIDENT-010` is the reference containment record for this control and is detailed
in `docs/FAKE_PORT_INCIDENT_2026-09-20.md`.

## Verify for review

Create a local JSON evidence bundle. It must contain `reviewer`, `findings`, and a
non-empty `sources` array. Sources may be the canonical Reddit post or an HTTPS GitHub,
GitLab or Codeberg URL. The command moves only to `VERIFIED_FOR_REVIEW`:

```text
npm run data:verify -- --id reddit-<post-id> --reviewer "name" --reason "At least twelve characters explaining the review" --evidence-file review.json
```

This state still cannot appear in the curated ledger.

## Promote

Promotion is a separate explicit action. The evidence bundle must also contain
`repository_url`, `vita_hardware_result`, and a `risk_disposition` whenever signals
were recorded. A fake/troll signal requires the additional `--allow-risk` acknowledgement;
the operator must explain why the evidence resolves it.

```text
npm run data:promote -- --id reddit-<post-id> --reviewer "name" --reason "..." --evidence-file review.json --name "Exact project name" --repo-url https://github.com/org/repo
```

Reject or block without promotion:

```text
npm run data:reject -- --id reddit-<post-id> --reviewer "name" --reason "..."
npm run data:block -- --id reddit-<post-id> --reviewer "name" --reason "..."
```

Do not copy a Reddit title into a curated summary unless the linked evidence proves the
claim. Never add ROMs, ISOs or game data.
