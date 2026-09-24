# Handoff - VH-SCANNER-FRESHNESS-022 worker to master

- Gegenereerd: 2026-09-24T00:21:40Z
- Actor: codex
- Model: gpt-5
- ProjectRoot: C:\Users\suloW\.codex\worktrees\vh-scanner-reliability-022\VitaPort
- Bronnen: 22

## Bronintegriteit

| Bestand | Bytes | SHA-256 |
|---|---|---|
| AGENTS.md | 6555 | 22C948A1AB4CC94DD04174661AC6F93A7224C1579D1B668A9EA63C9B13416351 |
| PROJECT_STATE.md | 38039 | BFCE2385EACD7CD7BB6199921790D2872E66F7FE45BBC8E83D65A164ABC75B16 |
| AGENT_TEAM.json | 4211 | DCA03537E811DFB6C18B83B0DC13491C453F8288C9AC750CA003C866A6AB8E3C |
| EVIDENCE.jsonl | 55012 | D6B2802C2EBC567F33AFA73BEE98B7E556BE8EB7ACC372FB9148A35E4672BCFB |
| docs\WORKLOG.md | 103630 | F29C899394FB21DC2ECDD96282506793B6F8D288303103D529AEAA157F085AD7 |
| docs\AUTOMATION.md | 3524 | 96113306BDA360A43F4AB2CC9EC775AA6658CB7EF023B614D740E813695C5ABF |
| .github\workflows\reddit-scanner.yml | 3492 | B618CF87500E7F26F152C2CE5FB058CB24F1716F05D8C5A0883FCDB365DF11C7 |
| vercel.json | 1995 | B567FB1ECECB1D5B0B100A05BC3F134896D7794BDDA2AABF4B9E37B557E0F723 |
| scripts\cron-reddit-scan.mjs | 7673 | 9C64B9448AB952ECD43242CA8068BB51D6FC4F5925537D7F5EACF2D4DE0D7EA9 |
| scripts\reddit-backfill.ts | 7709 | 865C0A5A435AA2781575E8F856A30733B3D1FDC84F2D6C8866517EFD56715E39 |
| scripts\reddit-fetch.mjs | 2086 | EA6308D189E526621C6B7286C92307BF57A0C3559750C0679ADE0647FA53C49C |
| scripts\reddit-fetch.d.mts | 732 | 9A30E711FEC77C41256873BCCD978381D7C5F6A9ACE88E1C68E875CAF5909149 |
| scripts\reddit-scan-health.mjs | 3813 | D62E19237420FC160D17497534063D21178A466FAD7C20FAC507FED1D88EED1A |
| scripts\reddit-sources.mjs | 1145 | 33BE640F752818A89D8000DBB649731E464F80FA68ED05F5E89FA30309F8493C |
| scripts\make-feeds.ts | 2875 | 4AF567351C3DC9C5DF86593BF7E6A7C4132A0594FDF094F0CDB5DB7F6BA634AA |
| tests\unit\reddit-fetch.test.mjs | 3229 | DF231A2E2A99093289E519DD622D7BB95A24E8D6360C56BF3711242592AE2140 |
| tests\unit\reddit-scan-health.test.mjs | 4661 | 52191261FE667C73FAD42729E558F0C05AA1F6C915D635C04199B70DCBDA2F6C |
| tests\unit\reddit-scanner.test.mjs | 12328 | 4C01D5B7C822DAA00D4FC5861236D639663CF954478C232DFD12B9DFA24222B7 |
| tests\unit\data-poisoning.test.mjs | 13627 | 9ABCE98C5A80D9CC27A629691790FD154622348D63D44619DA18E7B9CBD33F73 |
| tests\e2e\archive.spec.ts | 16805 | FE1EE21E5D0545A208B0250018130B52063413A266B74B57E246C7F553DB345B |
| package.json | 3194 | 003E5C41FEF5F2E89E84CA6AB320A1D8AC592D0D86E6C928DFA4E75E28A3CB4D |
| data\scanner-health.json | 2761 | CC2838EDB70A8930962176C32D00FC095305756357B3A039438F83E84DD5632C |

## Samenvatting

Master delegation VH-SCANNER-FRESHNESS-022 is implemented on local branch codex/vh-scanner-reliability-022 at code commit 90a35895df1c8b4b8fcdfa6a1398f4dde34bc8ba, based on origin/main d43070d88a33a8e2d781417c2e5ee1cefe162729. The GitHub scan slots are 07:17, 13:17 and 19:17 UTC; push events run tests only; only schedule/manual dispatch scans and publishes; historical backfill runs on 07:17 or manual dispatch. Shared fetch logic performs no immediate retry for 429, parses numeric/HTTP-date Retry-After with a six-hour cap, and retries network/408/5xx at most once after 1.2 seconds. Removed the unused Vercel cron route. Verify: npm run verify (typecheck, 116 unit tests, build of 29 project pages and 32 sitemap URLs), lint, integration 7/7, local preview Playwright 20/20, focused scanner tests 27/27, YAML/JSON parse. No scan, dispatch, push, or deployment occurred. Latest measured live scanner attempt remains 0/3 on 2026-09-23T22:06:44Z from HTTP 429; post-change source availability is UNKNOWN and GitHub schedule punctuality is not guaranteed. npm ci reported 8 audit advisories (4 moderate, 4 high), with no dependency edits or remediation.

## Verificatie

Controleer de hashes voordat je deze samenvatting vertrouwt:

    powershell -NoProfile -ExecutionPolicy Bypass -File %USERPROFILE%\.codex\workflow\NEW-HANDOFF.ps1 -Verify "C:\Users\suloW\.codex\worktrees\vh-scanner-reliability-022\VitaPort\HANDOFF.md"

Een handoff is context, geen bron van waarheid. Workspace en Git zijn leidend.
