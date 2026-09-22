# AGENTS.md

Read this file plus `docs/WORKLOG.md` before touching anything else. Those two files replace
most repo exploration. Do not scan the whole tree to orient yourself.

## What this is

VitaHarbor: an independent, static ledger of PlayStation Vita ports, decompilations and ARM
wrappers, sourced from r/vitahacks, r/VitaPiracy and r/PSVitaHomebrew. React + Vite, deployed to Vercel.

- Live: https://vitaharbor.vercel.app
- Source of truth for *what changed and why*: `docs/WORKLOG.md`
- Source of truth for *project intent*: `README.md`, `docs/MASTER_BLUEPRINT.md`
- Ledger data: `src/shared/constants/fallbackData.ts`

## Token discipline

1. **Do not re-derive the project.** `docs/WORKLOG.md` already records every change, the reason,
   and the verification. Read it instead of grepping the repo.
2. **Reuse the scripts in `scripts/_oneoff/`.** They already measure the things that matter.
   Writing a new throwaway script for the same job wastes tokens and time.
3. **Prefer targeted reads.** `rg -n "symbol" path` instead of reading whole files.
4. **Do not paste build logs back.** Report the outcome line, not the whole output.

## Existing tools — use these, do not rebuild

| Script | Purpose |
|---|---|
| `scripts/_oneoff/mobile-audit.mjs` | Overflow and touch-target audit at 4 mobile viewports |
| `scripts/_oneoff/mobile-measure.mjs` | Bounding box of every interactive element at 390px |
| `scripts/_oneoff/contrast-audit.mjs` | WCAG contrast ratio for every text style on the live site |
| `scripts/_oneoff/audit-headers.mjs` | Security headers, SEO tags, crawler files |
| `scripts/_oneoff/validate-jsonld.mjs` | Parses the structured data out of `dist/web/index.html` |
| `scripts/_oneoff/test-deeplinks-live.mjs` | Checks that `/projects/<slug>/` serves its own title and canonical |
| `scripts/make-sitemap.ts` | Writes `dist/web/sitemap.xml` from the ledger |
| `scripts/cron-reddit-scan.mjs` | Reddit discovery via RSS (writes `public/data/discovered.json`) |
| `scripts/prerender.mjs` | Injects the static ledger and ItemList schema into the built HTML |

## Commands

```
npm run verify       # typecheck + unit tests + build. The single gate before shipping.
npm run audit:mobile # touch targets and overflow on the live site
npx vercel --prod --yes
```

## Hard rules

1. **Line endings are LF.** `.gitattributes` enforces it. Editing a CRLF file with LF-based
   string replacement silently does nothing — this shipped broken code twice. If a replacement
   reports no match, check the line endings before assuming the string is wrong.
2. **Use `apply_patch` for edits.** If a patch fails to find context, read the exact lines first
   with `rg -n "anchor" -A 4` rather than guessing.
3. **Log every change in `docs/WORKLOG.md`** with date, commit, what, why, model, and evidence.
   Never guess the model — write `unrecorded` if unknown.
4. **Verify before claiming.** "Build succeeded" is not proof the UI works. Check the built
   artifact or the live DOM. Several past "fixes" were only ever verified by a green build and
   were still broken in the browser.
5. **Never invent ledger content.** If a Reddit thread body cannot be read, say so and mark the
   entry `detection: detected`. Do not fill in performance numbers that were not stated.
6. **No piracy.** Never link ROMs, ISOs or game data. Only discussion threads and source repos.

## Project traceability contract

Every harness, agent or LLM that changes VitaHarbor must leave enough project-local evidence for the next harness to continue from Git alone.

1. Record every project mutation, reconciliation, release action and material finding in `docs/WORKLOG.md` with the exact date/time, commit or working-tree state, what changed, why it changed, the actor/model, and concrete verification evidence.
2. For LLM work, the model field must name the actual model used. Do not inherit or guess a model from an earlier row. For non-LLM automation, record the automation actor explicitly and use `no LLM` for the model.
3. Update `PROJECT_STATE.md` after every meaningful decision, milestone, deployment or external limitation so it describes the current source-of-truth state rather than only historical releases.
4. A production deployment record must include the exact deployed commit, Vercel deployment ID/URL when available, production alias, reason, actor/model and live acceptance evidence.
5. Refresh the hash-protected `HANDOFF.md` after the final repository state for a task and verify it with `NEW-HANDOFF.ps1 -Verify`. A post-deploy documentation-only traceability commit does not require another production deployment, but it must name the exact deployed runtime commit so the distinction is explicit.
6. Keep traceability append-only where possible. Correct earlier records with a later superseding entry instead of silently rewriting history.

## Known traps (each one cost real time)

| Trap | What happens | Guard |
|---|---|---|
| CRLF vs LF | String replacement matches nothing, edit is a silent no-op | `.gitattributes`, check line endings |
| `data-reveal` + `opacity: 0` | Whole sections sit invisible while present in the DOM | Reveal rules removed; do not reintroduce |
| Counting DOM rows as proof | Rows can exist at `opacity: 0` | Check computed opacity and take a screenshot |
| React component names in HTML | Searching HTML for a component name always fails | Check the DOM node, not the source string |
| Reddit public API | JSON returns 403, RSS returns 429 | Use the logged-in Chrome session via computer use |
| PowerShell escaping | Backticks and `$` inside here-strings get eaten | Write scripts to a file, do not inline them |
| Vercel deploy auth | Intermittent `Not authorized` | Re-run once; confirm with `npx vercel whoami` |
| Vercel header order | The last matching rule wins, so a broad rule silently overrides a specific one | Put the catch-all first and the specific paths after it |

## Layout map

```
src/shared/constants/fallbackData.ts   ledger data (projects, updates, games, developers)
src/web/routes/HomePage.tsx            single page, keyboard nav, state
src/web/components/ledger/             DirectoryTable, ConsoleStage, ProjectPanel, stats, method
src/web/components/3d/VitaConsoleScene.tsx   three.js console with raycast press controls
src/web/components/ui/                 shared UI
src/web/styles/index.css               theme tokens and utilities
tailwind.config.js                     palette, type scale, shadows
docs/WORKLOG.md                        the log. Read this one.
```
