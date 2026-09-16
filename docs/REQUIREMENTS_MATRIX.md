# VitaPortWatch — Requirements Traceability Matrix

Authoritative requirements matrix tracked against `docs/MASTER_BLUEPRINT.md`.

Allowed Statuses: `TODO` | `IN_PROGRESS` | `BLOCKED` | `DONE`

| Requirement | Category | Status | Evidence / Notes |
| :--- | :--- | :--- | :--- |
| Cloudflare Workers + Static Assets | Infrastructure | DONE | `wrangler.jsonc`, `src/worker/index.ts`, `vite.config.ts` |
| Cloudflare D1 Initial Database Schema | Database | DONE | `migrations/0001_initial.sql` |
| Strict TypeScript & Lint Tooling | Tooling | DONE | `tsconfig.json`, `package.json`, `eslint.config.js` |
| Dark PS Vita OLED Design System | Frontend | DONE | `tailwind.config.js`, `src/web/styles/index.css`, `index.html` |
| Game vs. Port Project Domain Separation | Domain | DONE | `src/shared/types/index.ts`, `src/worker/repositories/games.ts`, `src/worker/repositories/projects.ts` |
| Developer vs. Reddit Identity Separation | Domain | DONE | `src/shared/types/index.ts`, `src/worker/repositories/developers.ts`, `src/worker/repositories/identities.ts` |
| Project Aliases & Matching Strength | Domain | DONE | `src/worker/repositories/aliases.ts`, `src/worker/services/matching/projectMatcher.ts` |
| Stage History & Transitions Tracking | Domain | DONE | `src/worker/repositories/stageHistory.ts` |
| Technology Taxonomy Linkage | Domain | DONE | `src/worker/repositories/technologies.ts` |
| Project Relationships & Dependencies | Domain | DONE | `src/worker/repositories/relationships.ts` |
| Source -> Observation -> Update Evidence Model | Domain | DONE | `src/worker/repositories/sourceItems.ts`, `src/worker/repositories/observations.ts`, `src/worker/repositories/updates.ts` |
| Provenance Verification & Deletion Reconciliation | Service | DONE | `src/worker/services/provenance/provenanceService.ts`, `tests/unit/evidence.test.ts` |
| Safe Health Endpoint (/api/health) | API | DONE | `src/worker/index.ts` (Section 125 compliant) |
| Public API Routes (/api/projects, /api/developers, /api/updates, /api/stats) | API | DONE | `src/worker/routes/public.ts` |
| Public UI (Homepage, Projects, Project Detail, Developers, Updates Feed) | Frontend | DONE | `src/web/routes/*`, `src/web/components/*` |
| Reddit Client with OAuth & Rate Limits | Ingestion | DONE | `src/worker/services/reddit/redditClient.ts`, `src/worker/services/reddit/redditUrlValidator.ts` |
| Discovery Engine & Scoring Rules | Ingestion | DONE | `src/worker/services/discovery/discoveryEngine.ts`, `src/worker/services/discovery/discoveryScorer.ts` |
| Admin Moderation API & UI | Moderation | DONE | `src/worker/routes/admin.ts`, `src/web/routes/AdminPage.tsx` |
| Cron Ingestion & Maintenance Scheduling | Operations | DONE | `src/worker/services/discovery/ingestionRunner.ts`, `src/worker/services/cleanup/maintenanceService.ts` |
| Data Repair (Project/Developer Merge, Revert) | Data Integrity | DONE | `src/worker/services/projects/projectMergeService.ts`, `tests/unit/merge.test.ts` |
| Security Headers & CSP | Security | DONE | `src/worker/index.ts` |
| Zero Paid AI & Zero Fake Percentages | Guardrail | DONE | Architecture policy strictly enforced |

