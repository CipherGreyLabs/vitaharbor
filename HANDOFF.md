# Handoff - VitaHarbor project activity label fix - worker to master

- Gegenereerd: 2026-09-23T22:34:01Z
- Actor: codex
- Model: gpt-5
- Candidate: `1192b8e1b2c7b2975d3959a79eba2c58c9b9317b` on the isolated worker branch; no push or redeploy; awaiting master release decision.
- ProjectRoot: C:\Users\suloW\.codex\worktrees\vitaharbor-public-ops-cleanup\VitaPort
- Bronnen: 33

## Bronintegriteit

| Bestand | Bytes | SHA-256 |
|---|---|---|
| AGENTS.md | 6555 | 22C948A1AB4CC94DD04174661AC6F93A7224C1579D1B668A9EA63C9B13416351 |
| PROJECT_STATE.md | 35894 | BFF4B272E2712F9CF6203E8D288A5F5FB077849159237E926DF218E41240A095 |
| AGENT_TEAM.json | 4240 | 399B4B68F40A8570092D2095792244897ED4172311ED7AB20407D01CC553270D |
| EVIDENCE.jsonl | 54122 | 5E393F312501B268359992AB8B82B06C4A3BC0D0E3A53C956538071E043783CD |
| docs\WORKLOG.md | 102048 | B21129D3BB3472CE5CD72542ECF1F8F3456385905977C64BB8B1B7E7666C0110 |
| docs\AUTOMATION.md | 2988 | 5E6BEED7AB377B7C527EF912E42E1C0BD23704A55121C20F079FB6DA931E5021 |
| .github\workflows\reddit-scanner.yml | 2853 | 9E681D5BDA560A33B3674DA3BEE0830FB79EB24EF425FC0C888D9F7ECFD981D0 |
| api\cron-scan.ts | 1670 | E6FC0F16FF41A29EFC05006DE1E9F2BB99B87762C59AE948B031134247C7F7D1 |
| scripts\prerender.mjs | 12136 | 6494DA7B3E1FD843F911E7A7E96BCDCB61D8A2BFB80A623661FF58AE7CDAF26F |
| data\scanner-health.json | 2761 | CC2838EDB70A8930962176C32D00FC095305756357B3A039438F83E84DD5632C |
| public\data\discovered.json | 3313 | B88B72A0A3B26C2683E5833945209188D56CBB0E73F3F6C4F9347A7C597AFE89 |
| public\api\feed.json | 19118 | C43804EA25717BA90563445A7DB14C75138B1553581B7C9039FC789CE987C848 |
| public\api\rss.xml | 17268 | 5A03F29E5EE5B6E4A5191EBC82E5EDC0F206F804810026B7691D73E533B4C507 |
| scripts\cron-reddit-scan.mjs | 7586 | 626C92B7CF80DF6F07F5A7EAA31A7C99C75B34E40CE19B0AF0056EDA2D2147E1 |
| scripts\reddit-provenance.mjs | 30566 | 37AA3C4493CDBFDC4CF9FA75030D178BE84EC834F06A204039B93BE273F25B1A |
| scripts\migrate-quarantine.mjs | 1768 | 93094ACA69C0B312E3C822D34BBD5F8081FF4BAD0CE3C554E7085C199AA51E05 |
| scripts\promote-candidate.mjs | 19034 | C4BD5E6BACD674ABC215919D756C736E1AE9E8716D55F4FEA5654C57B7372893 |
| src\shared\constants\fallbackData.ts | 63531 | 3E11DBF65449C2118194955947B0EBFBEA0154E3AA4711FC8ABA9EE4E5CF3C84 |
| src\web\lib\scannerAssets.ts | 5265 | 34D7E09CC4DDAB4A1AA3D2F18FF8768E907625BD8C30B42E72BEC659A0F23066 |
| src\web\routes\HomePage.tsx | 33765 | 6DF08B00C25C8BA1344BBA5D088C020B3BA562490D597937A8C22BC52F0881ED |
| src\web\routes\DiscoveryPage.tsx | 3787 | FAC643CAD11FD84213E9DAA2449E97ADBC274443CDF384E672B4D34D4D329D68 |
| src\web\routes\ProjectDetailPage.tsx | 10085 | 4B01ADCC3698CDDBBC60AEF84A871540D1BA86FDA9D9D1852EDAF6C909B0BA90 |
| src\web\components\ledger\DirectoryTable.tsx | 19965 | 9A941126751EB5E5BF02CA16737F3AB8C42A11E369E898F0DFFCD7C20B9EB6BD |
| src\web\components\ledger\MethodologySection.tsx | 2139 | DEA8C91A665BEC9575DC6137C68316B25A90A3A3D72ACAD08468414AB3EAC210 |
| src\web\components\ledger\ProjectPanel.tsx | 14635 | C911C97585C73184C1DAFA52911320BE596C0C9C02432BAB48AC6A1F8D89D17F |
| src\web\components\ledger\types.ts | 8455 | 4A79AF334B2E38E369299A3A4CAF117CC9356D31CC6A3998BCB1A37D08225C90 |
| tests\e2e\archive.spec.ts | 16665 | 4C8304D1DFE1D88D751A3B0263959CCA5CB385961966880162215A6646F395A1 |
| tests\unit\scanner-assets.test.ts | 4773 | A82918BD749DE91041E5272C588C855E3E6D944E90DE0158A674337C73CC6DA2 |
| tests\unit\data-poisoning.test.mjs | 13627 | 9ABCE98C5A80D9CC27A629691790FD154622348D63D44619DA18E7B9CBD33F73 |
| tests\unit\promotion-workflow.test.mjs | 13129 | 7B9FC4CF061C8703FC0A67BE532CC69C2A895B55A769F6A80FEF44CF4BDA8597 |
| tests\unit\routes.test.tsx | 2418 | FD49FB0699C7CF89498AA2567B74D479344BB70B4FD3838B4094A76A70728036 |
| tests\unit\ledger-types.test.ts | 1710 | 483441EF61DCA487A0F7FEB8C1388CEA0480BCDB51A6C269B10B7BAA39E50EF9 |
| tests\unit\cron-scan-route.test.ts | 714 | 00C6593EF0270D0B526119CE56963CE8D600340D8F1144BBA77B3FD1016A8E02 |

## Samenvatting

Master-authorized visitor-copy correction. Runtime candidate commit 1192b8e1b2c7b2975d3959a79eba2c58c9b9317b changes the Home project panel to Latest project activity with the absolute source date only. Released public-ops cleanup is live at READY deployment dpl_98bNGxsgXjCsnFMyYBty5FD5qsz6. npm run verify passed typecheck, 110 unit tests and production build (29 project pages, 32 sitemap URLs); lint and integration 7/7 passed; local-preview Playwright 20/20; mobile and static no-JS checks pass. GitHub scheduled run 35926409183 attempted 2026-09-23T22:06:44Z; all three sources were rate-limited and scanner health remains internal. No cadence/provider changes, push or redeploy. Prior HANDOFF mismatch traced to archive.spec.ts change in commit 25865ab; refreshed handoff verifies GO for all 33 sources. Awaiting master release decision.

## Verificatie

Controleer de hashes voordat je deze samenvatting vertrouwt:

    powershell -NoProfile -ExecutionPolicy Bypass -File %USERPROFILE%\.codex\workflow\NEW-HANDOFF.ps1 -Verify "C:\Users\suloW\.codex\worktrees\vitaharbor-public-ops-cleanup\VitaPort\HANDOFF.md"

Een handoff is context, geen bron van waarheid. Workspace en Git zijn leidend.
