# Master acceptance and worker assignments — 2026-10-07

Actor: Codex master; model: GPT-6 (variant unrecorded).
Status: corrective work authorized by user; implementation delegated to existing workers.

## Verified findings

- Remote main fetched on 2026-10-07: bc6d187. Runtime UI feature commit e4e6c935fc4efd7d9f7836f05af53827c22793c1 remains in history; later commits modify scanner data, not these UI components.
- DirectoryTable in e4e6c93 labels project.repo_url as “Get VPK”. A source repository URL does not establish a Vita binary download.
- Current remote fallbackData maps Ren'Py to cave-story.jpg and Render96 SM64 to smash-melee.jpg.
- In master checkout, real-racing-2.png and test-drive-ii.png share SHA-256 EDCDACFC1D41D89AEF8429D2C6A8D7B15FA9F2A9482B641074B464C2A67ACA1F. Remote data labels the former Real Racing 2 PS Vita beta gameplay. This contradicts the prior blanket verified-media claim.
- Remote VitaConsoleScene renders generic “60 FPS TARGET”, “PLAYSTATION®VITA HARDWARE BUILD” and “VITAHARBOR · SOURCE FRAME”. These must not imply evidence absent for the selected project.
- Existing live mobile-audit ran at 375, 390, 412 and 768px; script completed successfully. This limited check is not proof of interaction correctness, hardware authenticity or complete accessibility. At 375px page scrollWidth equals clientWidth, canvas 335×320.
- Remote HANDOFF is still a September 27 release record; PROJECT_STATE lists contradictory historical current states. Latest feature WORKLOG omits exact release commit/deployment acceptance evidence.
- Shared main checkout is dirty: fallbackData.ts and ConsoleStage.tsx plus many new WebP assets/scripts. Preserve all changes. Do not reset, clean, overwrite or assume ownership.
- Halo playable/released status requires renewed primary-source verification: the linked upstream repository alone is not proof of a Vita release. Current source body/release assets have not been verified by this master.

## UI worker ownership

Own DirectoryTable, ConsoleStage and VitaConsoleScene component fixes. Preserve existing ConsoleStage modifications. Replace misleading repository CTA with “Source”; show a release/download action only when its destination and Vita build are verified and project policy allows it. Remove generic hardware/FPS/source-frame claims. Verify dock click/keyboard selection, search shortcut, stable scroll, image failure fallback, reduced motion and rendered front/rear at desktop/mobile. Follow premium-web-design and literal UI UX Pro Max targeted search workflow. Compare rear to an actual PCH-1000 reference before claiming accuracy. Do not edit ledger data or deploy while data integration is unresolved.

## Data worker ownership

Own ledger/media provenance and scanner validation. Reconcile existing uncommitted ledger changes without discarding them; use an isolated compatible checkout when ownership is uncertain. Audit all mapped images against actual project/game/version; replace wrong images only with supported sources, distinguish artwork from Vita gameplay and use honest title fallback when no suitable media is verified. Record source URLs and evidence. Reverify Halo author, platform, release and unsupported claims. Review known-author boosts for scope bypass and game-data signals. Prove latest scans cover all three subs, reporting failures internally only. Add focused regression coverage for actual classification defects.

## Integration and release

Each worker records findings and modifications in WORKLOG with time, actual model or unrecorded, commit/state and evidence. Data worker hands off its commit and verified provenance first; UI worker integrates compatible data, runs npm run verify and live/rendered acceptance, then deploys under existing user authorization. Record runtime commit, deployment ID/URL and alias. UI worker consolidates PROJECT_STATE and refreshes/ verifies final HANDOFF after repository state is final. No simultaneous edits to shared documentation; data worker uses a separate task evidence file until UI integrates it. Keep worker model/thinking settings unchanged. Existing user authorization includes asynchronous completion reporting to master; include verified handoff path, commits, actual tests and unresolved limitations.
