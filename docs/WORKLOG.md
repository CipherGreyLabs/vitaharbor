# VitaHarbor work log

This file records what changed, why it changed, when it happened, and which model did the
work. It exists because git history alone does not capture the *reason* or the *author model*.

## Why this file exists

Git records the diff and the date. It does not record:

- why a change was made,
- which model produced it,
- what was verified versus assumed.

This log fills that gap. Treat it as the authoritative narrative for VitaHarbor changes.

## Protocol (apply from 2026-09-19 onward)

Every change adds one row to the changelog below with these fields:

| Field | Meaning |
|---|---|
| Date / time | Local time (Europe/Brussels) when the change was committed |
| Commit | Short git hash |
| Change | What actually changed in the repo |
| Why | The reason, and the problem it solved |
| Model | Which model authored the change |
| Verified | The evidence that it works (tests, build, live check) |

Rules:

1. **Never guess the model.** If the author model is not directly known, write
   `unrecorded` and say so. A wrong model name is worse than an honest gap.
2. **Log failed attempts too.** Reverted or superseded work is logged with the outcome
   and the reason it was dropped. A missing row is worse than an uncertain row.
3. **Separate fact from inference.** Verified = build/tests/live evidence. Observed =
   seen in the browser or logs without a test. Reported = taken from a thread or a claim.
4. **Corrections are appended, not rewritten.** Supersede an older row with a new row
   that references it. Do not silently edit history.

### Why model attribution is weak before 2026-09-19

The Codex CLI does not persist the active model in git, in the commit object, or in any
artifact inside this repository. So for every commit before this log existed, the model
column is `unrecorded`. That is a tooling limitation, not an oversight, and it is stated
here rather than papered over with guesses.

From 2026-09-19 forward the authoring model is written into the row at commit time.

## Model switches observed in the working session

Reconstructed from the model-switch notices present in the session context of
2026-09-18 / 2026-09-19. These are the models that served this thread, in order:

| Model | Note |
|---|---|
| openrouter/free | Early session |
| gemini-3.8-flash | Mid session |
| gemini-3.1-pro | Mid session |
| gemini-3.1-pro / deepseek-v4-flash | Final segment of 2026-09-18 into 2026-09-19 |

Confidence: **reconstructed**. The session recorded *that* these models were active, not
which commit each one authored. No row below claims a per-commit model unless it was
written at commit time.

## Changelog

### 2026-09-19

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 00:12 | `ce05149` | Keyboard navigation (j/k, arrow keys), header status breakdown, editorial footer | Make the ledger operable without the mouse and show ecosystem state at a glance | unrecorded | typecheck clean, 42/42 tests, build 22 projects, live check |
| 00:21 | `798da77` | Mobile audit plus touch-target fixes, responsive console hint, badge trimming, neon glow removed from the active filter | Header links, filter pills and row actions were 20 to 32px tall, which is uncomfortable to tap on a phone | deepseek-v4-flash | typecheck clean, 42/42 tests, build 22 projects, live mobile re-measure |
| 00:23 | `75b637e` | Muted text raised to #7d848c, .gitattributes forcing LF | Measured contrast was 4.09:1, below the 4.5:1 WCAG AA floor; CRLF line endings had already broken edits twice | deepseek-v4-flash | 35 text styles measured, 0 contrast failures, lowest 4.79 |
| 00:26 | `316b577` | Open Graph, Twitter card, WebSite and ItemList JSON-LD, dark theme-color | The site is shared on Reddit and Discord, but had no social preview image or structured data at all | deepseek-v4-flash | live headers confirm og:image, twitter:card, 2 valid JSON-LD blocks |
| 00:29 | `3a55026` | Year-long caching for fonts and assets, HTML moved to edge caching with stale-while-revalidate, AGENTS.md added, npm run verify gate | Fonts sat outside the asset cache rule so they were refetched on every visit, and every new agent had to rediscover the repo and its traps from scratch | deepseek-v4-flash | npm run verify green |
| 00:31 | `8e60b0e` | Header rule order corrected so the catch-all no longer overrides per-path caching | Vercel lets the last matching rule win, so the broad `/(.*)` rule was overwriting the asset and font rules | deepseek-v4-flash | live: fonts and all /assets js+css return max-age=31536000, immutable; HTML returns s-maxage=300 with stale-while-revalidate |
| 02:17 | `19994b0` | Static per-project pages at `/projects/<slug>/` with their own title, description, canonical and OG tags; sitemap now lists all 23 urls; curated threads filtered out of the pending-review list | Reddit, Discord and X do not run JavaScript, so a shared project link showed the site-wide preview. The pending list also showed RC Cars and Class of '09 after they had already been curated, so the same port appeared twice | deepseek-v4-flash | live: `/projects/d2vita/` and `/projects/d2vita` both return the project title and canonical; app selects `entry-d2vita` on load; pending count dropped 3 to 2; sitemap 23 urls; 42/42 tests |
| 02:41 | `88b60b7` | Reordered the page so the directory comes before the statistics, compressed the console and hero, pinned the filter bar under the header, made the type axis visually secondary, added a New badge for entries younger than seven days, raised body type from 13 to 14px, added a section hairline above the stats | The directory started at 1443px, so a visitor scrolled 1.6 screens past a decorative console before reaching the list the site exists for. Filters also scrolled out of reach after one screen | deepseek-v4-flash | directory now starts at 1060px; console 792 to 637px; page 5048 to 5015px; no horizontal overflow at 375/390/412/768px; 22 rows; header counts match the filter counts; 42/42 tests |

### 2026-09-18

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 21:02 | `e7eec6b` | Methodology, stats band and project panels moved to the quiet-dark theme | Those three sections still used the old glass and glow styling, so the page looked inconsistent | unrecorded | typecheck clean, 42/42 tests, build 22 projects |
| 20:57 | `6a7dcf4` | Live filter counters, hardware/engine tags in table rows, console prev/next zapper | Users could not see how many entries a filter contained, and there was no way to step through ports | unrecorded | typecheck clean, 42/42 tests, build 22 projects |
| 17:11 | `75d8e44` | Real details for RC Cars, plus D2Vita and COD Zombies entries | Reddit scan found three genuine items; the earlier RC Cars row was a placeholder without content | unrecorded | 42/42 tests, build 22 projects, live DOM check |
| 17:06 | `da210e9` | Restrained 2026 dark art direction: muted palette, flat surfaces, neon glow removed | The neon-on-pure-black look read as generic AI output rather than a designed product | unrecorded | build 22 projects, live background confirmed rgb(11,12,14) |
| 17:02 | `4c738de` | Console reduced again (max-w-3xl, 400px tall) | Requested smaller presentation | unrecorded | canvas measured 672x400 on the live site |
| 16:57 | `bdb7014` | All 15 controls pressable: shoulders, D-pad, face buttons, sticks, PS, select/start | Only the four face buttons responded to clicks | unrecorded | pressTravel and pressBaseZ present in the live bundle |
| 16:48 | `b2d4688` | Removed the reveal rule that pinned the directory at opacity 0 | The section carried data-reveal="" and the reveal never fired, so all 22 rows were invisible while present in the DOM | unrecorded | live section opacity 1, 19 then 20 then 22 rows visible |
| 16:45 | `ba1aac2` | Custom cursor import and component actually removed | Earlier edits searched for CRLF while the file used LF, so the replacement silently did nothing and the cursor stayed live | unrecorded | no z-[9999] element in the live DOM |
| 16:43 | `099867b` | Oversized full-width Vita hero, softer panels, larger display type | Requested a larger hero console and less boxed layout | unrecorded | build and live screenshot |
| 16:37 | `ece6a7f` | HTML served no-store, hashed assets immutable | Stale HTML in the browser kept showing an old build after deploys | unrecorded | response headers confirmed live |
| 16:32 | `fb38a80` | First raycast press interaction on the four face buttons | Buttons were decorative only | unrecorded | setFromCamera and intersectObjects in the bundle |
| 16:20 to 16:28 | `72a95e5`, `9caded7`, `7f236f5`, `b530a3c` | WebGL fallback forced off, repeated attempts to remove the cursor and force list rendering | Chasing a list that appeared missing and a cursor that appeared sticky; the real causes were found later (reveal opacity and the LF line endings) | unrecorded | superseded by `ba1aac2` and `b2d4688` |
| 16:02 to 16:09 | `29f8fdb`, `b07fa8a`, `843ce01` | Row entrance animations removed, API refresh made fail-safe | Unstable entrance animations and a missing API endpoint could blank the UI | unrecorded | build and 42/42 tests |
| 15:38 to 16:00 | `9d95b6b` through `19b84bc` | Cursor component added, then syntax repaired; PlayStation face-button colours and press physics restored | A generated cursor component had broken string escapes and the build failed; colours and physics were requested | unrecorded | build green after the CSS rewrite |

### Earlier work (2026-09-15 to 2026-09-17)

Commits `adfa2e6` and older belong to the initial build-out: ledger data model, directory
table, 3D console scene, prerender pipeline, RSS and JSON feeds, and the first Reddit
scanner. They predate this log. Run `git log --oneline` for the full list.

## Known open items

| Item | Status | Evidence |
|---|---|---|
| Model attribution per commit | Not possible for history | Codex does not persist the model in this repo |
| Reddit thread bodies via the public API | Blocked | Reddit returns 403 on JSON and 429 on RSS; the logged-in Chrome session works |
| r/VitaPiracy scan | Partial | Returned 429 during the RSS attempt; read successfully via the browser session |
| Mobile layout | Audited and fixed 2026-09-19 | See the mobile audit section below |
| Scheduled Reddit scan | Active via GitHub Actions | `origin` is configured; `.github/workflows/reddit-scanner.yml` schedules scans at 07:00, 13:00 and 19:00 UTC. Run history was not independently checked in this turn. |
| Per-project social image | Open | All project pages share the single `og.png`. Generating a per-project card would need the imagegen pipeline wired into the build. |

## Mobile audit (2026-09-19)

Method: Playwright with real mobile emulation (`isMobile`, `hasTouch`, deviceScaleFactor 2)
at 375x667, 390x844, 412x915 and 768x1024, measuring `documentElement.scrollWidth` against
`clientWidth` and the bounding box of every interactive element.

### What already held up

| Check | Result |
|---|---|
| Horizontal overflow | None on all four viewports (scrollWidth == clientWidth) |
| Viewport meta | Present in `index.html` |
| Body font size | 16px, so iOS does not zoom on input focus |
| 3D canvas scaling | 327 to 364 px wide on phones, 672 px on tablet |
| Directory table | Collapses to one column below the `md` breakpoint |
| Search input | 342 x 42, comfortably tappable |

The ticks that appeared as "overflow" were the community ticker marquee, which is
intentionally wider than the viewport. It does not create page scroll.

### What was too small to tap (measured at 390 px)

| Element | Before | After | Standard |
|---|---|---|---|
| Header nav links | 57 x 20 | 44px tall | WCAG 2.2 SC 2.5.8 wants 24px minimum |
| Console prev/next | 32 x 32 | 44 x 44 on mobile, 36 on desktop | 44px recommended |
| Status filter pills | 112 x 30 | 40px tall on mobile | 44px recommended |
| Sort select | 130 x 31 | 40px tall on mobile | 44px recommended |
| Category pills | 30px tall | 36px tall on mobile | 24px minimum |
| Row actions (copy, source, clear) | 28 x 28 | 40 x 40 on mobile | 44px recommended |
| Footer links | 20px tall | 32px tall | 24px minimum |

### Other mobile fixes

- The hint under the console used to say "Drag to rotate - Press / to search the directory",
  which is meaningless on a touch device. It now switches to "Swipe to rotate - use the arrows
  to switch ports" below the `sm` breakpoint.
- Table rows measured 199px tall on mobile because every row showed three technology badges.
  The third badge is now hidden below `sm`, which shortens the scan list.
- The active status filter carried an inline neon glow (`rgba(0, 210, 255, 0.2)`) left over
  from the earlier direction. It is removed; the filter now uses the same hairline surface
  treatment as the rest of the page.

### Verification

- `npm run typecheck` clean
- `npm run test:unit` 42/42 passing
- `npm run build` prerenders 22 projects

### Still open

| Item | Status |
|---|---|
| 3D face buttons on a touch screen | The controls are physically small at phone width. The prev/next zapper is the intended touch path. Tapping the 3D buttons still works but requires precision. |
| Header status pill | Hidden below `sm` to keep the mobile header uncluttered. The directory filters carry the same numbers. |

## 2026-09-20 -- Smart Reddit classifier + automation

**Model:** claude-sonnet-4-6
**Commit:** 83e0f0e

### Wat gedaan

- Scanner classifier herschreven in scripts/cron-reddit-scan.mjs
  - Oud: naieve PORT_TERMS keyword-count (hits >= 2)
  - Nieuw: drie-assige classifier:
    - DEVELOPMENT_SIGNALS (30+ patronen): WIP-tags, releases, GitHub-links, FPS, port progress, has arrived
    - QUESTION_SIGNALS (16 patronen): vraagzinnen zoals "anyone working on", "can someone port", "when will"
    - PASSIVE_PORT_TERMS: neutrale termen alleen geldig zonder vraag-context
  - Vraag-titel met <3 dev-signalen: reject. 3+ dev-signalen: high. 1+ dev + geen vragen: medium
  - Elk item krijgt nu confidence en classification_reason veld
- Regex bugfix in parseEntries: [\s\S] was weggevallen, forward slashes in tags niet geescaped
- Scan getest: 25 posts, correcte accept/skip (bv vraagpost "Super Smash Melee" correct geskipt)
- At this commit the scan was still described as a heartbeat-driven schedule; later commits moved
  scheduled ownership to GitHub Actions and corrected the cadence.

### Verificatie
- Scanner: 6 kandidaten uit 25 posts, geen errors
- Vercel: Ready, live op https://vitaharbor.vercel.app

### Later automation commits (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 03:14 | `830491a` | Added `/api/cron-scan` and a Vercel cron schedule at 07:00, 13:00 and 19:00 UTC | Provide a server-side fallback scan route | unrecorded | commit diff and `vercel.json` inspected |
| 03:14 | `86a26f7` | Reduced the Vercel cron fallback to once daily at 06:00 UTC for the Hobby plan | Keep the Vercel fallback within the plan limit | unrecorded | commit diff and `vercel.json` inspected |
| 03:19 | `4688afb` | Set the GitHub Actions discovery workflow to 07:00, 13:00 and 19:00 UTC | Make GitHub Actions the scheduled scan engine | unrecorded | commit diff and workflow file inspected; remote branch exists |

### This-thread execution (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 04:00 | working tree (uncommitted) | Reconciled `docs/AUTOMATION.md` and the known open-item text with the repository remote and current schedules | Remove stale claims that no remote or scheduled engine exists | unrecorded | `git remote -v`, `git ls-remote`, recent commit diffs and workflow file inspected |
| 04:00 | working tree (uncommitted) | Ran the Reddit discovery scan and regenerated `public/data/discovered.json` | Complete the previously interrupted scan request | unrecorded | 25 `r/vitahacks` entries scanned, 6 candidates written; `r/VitaPiracy` returned HTTP 429; `npm run data:list` showed all 6 |
| 04:00 | working tree (uncommitted) | Refreshed JSON/RSS feeds and ran the project verification gate | Ensure generated outputs and the build remain coherent after the scan | unrecorded | feeds created; typecheck clean; 42/42 unit tests; build/prerender 22 projects; sitemap 23 URLs |
| 04:08 | working tree (uncommitted) | Scanner now prunes persisted candidates whose exact source URL is already in the curated ledger | Prevent curated entries from remaining in the review queue forever | unrecorded | Rescan reduced the queue from 6 to 5 and removed the curated RC Cars URL; no curated ledger file changed |
| 04:09 | working tree (uncommitted) | Re-ran the verification gate and feed generation after the scanner fix | Verify the cleanup did not regress the site or generated outputs | unrecorded | typecheck clean; 42/42 unit tests; build/prerender 22 projects; sitemap 23 URLs; feeds created |

### Discovery review (2026-09-20)

The five remaining candidates were checked against their source threads. None was promoted:

- 8BitDo Ultimate 2: genuine pre-release Vita/PSTV controller plugin, tested on real hardware; not a port, decompilation or ARM wrapper.
- Ratchet & Clank: Size Matters: genuine Adrenaline control plugin release with USA hardware testing; not a port entry.
- TFoUAD: genuine active Vita renderer/port development and real-hardware focus, but the post does not identify the underlying game and announces no new public build; insufficient for a ledger entry without inventing scope.
- Building an app for all things Vita: project idea for a general app, not a port or decompilation.
- Class of '09: a real release post, but it is a newer source thread for the already-curated Class of '09 project; it must be attached as an update, not promoted as a new project.

### Site improvements (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 04:31 | working tree (uncommitted) | Replaced inferred setup instructions with optional project-specific setup evidence; added explicit verification, freshness and last-verified fields to project panels | Prevent generic plugins, clock speeds and asset paths from being presented as project facts | unrecorded | typecheck clean; 45/45 unit tests; local E2E smoke passed |
| 04:31 | working tree (uncommitted) | Added native/decompilation/wrapper/engine/classic taxonomy, alias/developer-aware search, active-filter chips and URL-persisted directory state | Make the archive easier to query, share and interpret without adding a database feature | unrecorded | 5/5 local E2E tests; no horizontal overflow at 375/390/412/768px |
| 04:31 | working tree (uncommitted) | Added discovery candidate-type signals, related-project warnings and scanner persistence of classification fields | Keep plugins/tools/app signals distinct from curated port records and surface possible updates without auto-promotion | unrecorded | 25 r/vitahacks entries scanned; 5 candidates retained; r/VitaPiracy returned HTTP 429 |
| 04:31 | working tree (uncommitted) | Added reproducible per-project OG cards generated during build and wired project-specific social image metadata into prerendered pages | Make shared project links identify the actual record while keeping cards grounded in ledger data | unrecorded | 22 PNG cards generated; `d2vita` HTML points to `/og/projects/d2vita.png`; JSON-LD 2/2 valid |
| 04:31 | working tree (uncommitted) | Added reduced-motion/data-saving static console fallback and corrected methodology/prerender copy to keep evidence claims bounded | Preserve the visual signature without forcing 3D and avoid claiming every stage is hardware-verified | unrecorded | `npm run verify` green; local E2E and mobile audit passed |
| 04:33 | working tree (uncommitted) | Removed stale unused imports and variables across the remaining web components | Keep the release lint gate clean after the site pass | unrecorded | `npm run lint` completed with no warnings or errors |

### Freshness pass (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 04:44 | working tree (uncommitted) | Added source-backed records for Illusia, Jedi Academy, Jedi Outcast, Barony and the early Call of Duty 4 Vita work; refreshed Class of '09 to its September release thread | Correct the curated ledger's visible port coverage and replace stale release dates with dates from current primary/community sources | unrecorded | source threads and repositories checked; 27 project pages and 28 sitemap URLs generated |
| 04:44 | working tree (uncommitted) | Exposed latest activity and per-entry observed dates in the directory, and added project-specific setup evidence for the new records | Make data age visible instead of hiding it inside expanded panels; keep setup notes bounded by repository evidence | unrecorded | typecheck clean; lint clean; 45/45 unit tests; local E2E 5/5 |
| 04:46 | working tree (uncommitted) | Removed generated-feed and directory fallbacks that implied hardware testing when no evidence field existed | Keep the freshness pass evidence-aware and avoid turning missing hardware notes into claims | unrecorded | regenerated JSON/RSS feeds; typecheck and lint clean; production build generated 27 project pages |
| 04:48 | working tree (uncommitted) | Confirmed the public Vercel HTML is still the older 22-project deployment and does not contain the new Illusia record | Separate the live deployment lag from the local ledger freshness problem before reporting status | unrecorded | `https://vitaharbor.vercel.app/?inspect=20260920` returned 200 with the old `index-Ca63xSKe.js`, `22 verified projects`, and no `Illusia Vita` |
| 04:50 | working tree (uncommitted) | Made OG generation tolerant of CI environments without a downloaded Playwright browser | Prevent a non-critical social-card enhancement from blocking the production deployment | unrecorded | local build green; Vercel first attempt failed at Playwright launch, second build completed with the checked-in OG fallback |
| 04:52 | working tree (uncommitted) | Published the refreshed ledger and site build to Vercel production | Put the current port records, dates and evidence-aware UI on the live domain after explicit user authorization | unrecorded | deployment `dpl_4WntqytMr5o3qgTfZTmYxrC4HE7Y` READY; live home HTML contains 27 projects and Illusia; Illusia deep-link title/meta and JSON feed verified |
| 04:53 | working tree (uncommitted) | Ran the existing archive smoke suite against the production domain | Verify browser behavior after deployment rather than relying only on static HTML and Vercel status | unrecorded | live E2E 5/5 passed |

### Screenshot-backed console preview (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 04:59 | working tree (uncommitted) | Added source-backed screenshot assets for Illusia and Cave Story, with original repository links in the ledger | Show real game frames where a reliable source image exists without inventing media | unrecorded | downloaded assets inspected visually; source URLs stored beside each record |
| 04:59 | working tree (uncommitted) | Added screenshot-aware Vita screen rendering and an explicit record-card fallback for entries without a source frame | Make directory selection visibly update the console while keeping missing media honest | unrecorded | typecheck clean; lint clean; 45/45 unit tests; local E2E 6/6 including list selection and screenshot preview |

### Compact directory and scroll affordance (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 05:06 | working tree (uncommitted) | Replaced the long directory row list with a responsive card grid: 1 column on mobile, 2 on small screens, 3 on desktop and 4 on wide screens; expanded records span the available row | Reduce vertical scrolling while keeping each record readable and preserving the expanded evidence panel | unrecorded | desktop and mobile full-page screenshots visually inspected; no horizontal overflow observed |
| 05:06 | working tree (uncommitted) | Added a fixed, keyboard-accessible Scroll to top control that appears after 520px and respects prefers-reduced-motion | Keep navigation back to the archive header available during long directory browsing | unrecorded | local archive E2E 7/7 passed, including scroll-to-top behavior |

### Production redeploy (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 05:11 | working tree (uncommitted) | Published the current verified build to Vercel production and aliased it to `https://vitaharbor.vercel.app` | Replace the stale client bundle that still rendered the 22-project archive | unrecorded | deployment `dpl_DnmdGPwy55eXctvEpUKDQNwQKJiH` READY; live bundle is `index-Brt1GAeQ.js`; live E2E 7/7 passed |

### Audit fixes (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 05:33 | working tree (uncommitted) | Raised the interactive hit areas for the VitaHarbor logo, community ticker, stage filters and pending-review links to at least 44px; kept the animated ticker clipped to the viewport | Remove the only real mobile touch-target findings while preserving the ticker interaction | unrecorded | local mobile audit: no small targets and no horizontal overflow at 375, 390, 412 and 768px |
| 05:33 | working tree (uncommitted) | Changed the New badge to a high-contrast foreground and made the contrast audit resolve translucent ancestor backgrounds; hidden assistive-only and duplicate ticker nodes are excluded from mobile target findings | Remove the confirmed badge contrast failure and prevent deterministic audit false positives | unrecorded | local alpha-aware contrast audit: 34/34 styles passed |
| 05:33 | working tree (uncommitted) | Re-ran the full local regression gate after the audit fixes | Ensure the UX and audit-tool changes did not regress the archive | unrecorded | typecheck clean; lint clean; 45/45 unit tests; production build; local E2E 7/7 |

### Audit fixes production release (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 05:47 | working tree (uncommitted) | Published the audit fixes to Vercel production and aliased the READY deployment to `https://vitaharbor.vercel.app` | Make the corrected touch targets and contrast-safe badge available to visitors | unrecorded | deployment `dpl_3mAhMttjomtTHUQEnENZk8gzhnf1` READY; live bundle `index-BiBbKpVE.js`; live E2E 7/7; live contrast 34/34; live mobile audit no small targets/no overflow |

### Console selection fallback (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 05:57 | working tree (uncommitted) | Added a responsive static Vita screen that renders the selected project screenshot or title card when reduced motion, data saving or unavailable WebGL bypasses the 3D scene | Make “Show on the console” visibly work in every supported rendering mode | unrecorded | local reduced-motion E2E passed; the selected Illusia screenshot appears inside the static Vita screen |
| 05:57 | working tree (uncommitted) | Added a regression test for the full Show on the console flow and increased its button hit area | Prevent the fallback selection path from silently regressing | unrecorded | typecheck clean; lint clean; 45/45 unit tests; production build; local archive E2E 8/8 |

### Console fallback production release (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 06:01 | working tree (uncommitted) | Published the console-selection fallback fix to Vercel production and aliased it to `https://vitaharbor.vercel.app` | Make “Show on the console” work for reduced-motion, data-saving and WebGL-unavailable visitors | unrecorded | deployment `dpl_3d5pTGVQdHP3xuJPaJ8PHaQT6Uws` READY; live bundle `index-bqG-AcJg.js`; live E2E 8/8 passed |

### UX improvements (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 11:55 | working tree (uncommitted) | Fixed "Show on Vita" scroll: replaced scrollIntoView with getBoundingClientRect + window.scrollTo with 64px header offset and prefers-reduced-motion respect | scrollIntoView(block:start) placed the console behind the sticky 56px header; user clicks "Show on console" and nothing visible happened | claude-sonnet-4-6 | typecheck clean; 45/45 unit tests; production build green |
| 11:55 | working tree (uncommitted) | Console pill bar now always includes the selected project even when it is outside the first 6 positions | Selecting entry #15 in the directory left the pill bar stuck on projects 1-6 with no way to see the active selection highlighted | claude-sonnet-4-6 | typecheck clean |
| 11:55 | working tree (uncommitted) | Added camera icon indicator on directory cards that have a screenshot_url; lucide Camera icon wrapped in a titled span | Makes it immediately visible which ports have real screenshots before expanding the panel | claude-sonnet-4-6 | typecheck clean (title prop removed from SVG to fix TS2322) |
| 11:55 | working tree (uncommitted) | Renamed "Show on the console" to "Show on Vita" and added MonitorPlay icon to the button | Clearer label and visual cue for the action; the old text was vague about what "the console" meant | claude-sonnet-4-6 | typecheck clean |
| 11:55 | working tree (uncommitted) | Added screenshot coverage count to directory heading subtitle | Makes the data completeness immediately visible alongside project count and latest activity | claude-sonnet-4-6 | typecheck clean |
| 11:57 | working tree (uncommitted) | Published all UX improvements to Vercel production | Make the fixes available on vitaharbor.vercel.app | claude-sonnet-4-6 | deployment dpl_66qps2bmg READY; live bundle index-BTQENM5H.js; 27 projects confirmed in live JSON-LD |

### Screenshot coverage and mobile navigation (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 12:35 | working tree (uncommitted) | Added four verified local screenshots for D2Vita, RC Cars, Call of Duty 4 and Jedi Academy, each with a source-post URL and descriptive alt text | Increase the archive's real screenshot coverage without inventing media URLs or ledger facts | unrecorded | Images were opened from visible Reddit posts in a separate Chrome task session, downloaded locally, and visually inspected; coverage increased from 2/27 to 6/27 |
| 12:35 | working tree (uncommitted) | Made the Vita project selector render all 27 projects in a horizontally scrollable pill bar and clipped page-level horizontal overflow for mobile ticker content | Keep every port reachable from the Vita preview and prevent wide animated content from widening the mobile document | unrecorded | typecheck clean; lint clean; 45/45 unit tests; production build; new archive E2E assertion requires 27 selector buttons |

### Screenshot coverage production release (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 12:42 | working tree (uncommitted) | Published the screenshot coverage, all-project Vita selector and mobile overflow fixes to Vercel production | Make the verified images and navigation improvements available on vitaharbor.vercel.app | unrecorded | deployment `dpl_HxrtFkFbzbMGPhq39qtoZ4UZiZDs` READY and aliased; all four new screenshot URLs return HTTP 200 with image content |
| 12:42 | working tree (uncommitted) | Stabilized the archive E2E suite by matching the renamed “Show on Vita” action and sending `/` directly instead of clicking under the sticky header | Keep browser verification aligned with the current UI and remove a confirmed click-interception flake | unrecorded | live archive E2E 10/10 passed; live mobile audit reports no horizontal document overflow and no small targets; contrast 35/35 passed; security/SEO header audit passed |

### Full release audit and CSP hardening (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 12:48 | working tree (uncommitted) | Removed `unsafe-inline` from `script-src` in the Vercel Content-Security-Policy while retaining the required inline-style allowance for React canvas sizing | Reduce script injection surface without changing the existing visual runtime | unrecorded | local production build, typecheck, lint, 45/45 unit tests, 7/7 integration tests and diff-check passed; built HTML contains only external module code plus JSON-LD data scripts |
| 12:52 | working tree (uncommitted) | Published the CSP hardening build to Vercel production | Make the audited security header effective on the live alias | unrecorded | deployment `dpl_5bCkriotZn5KB9aNfbooFFX3vLfH` READY and aliased; live CSP now reports `script-src 'self'` |
| 12:52 | working tree (uncommitted) | Completed the full production audit: browser flows, 3D/static fallback, responsive layout, touch targets, contrast, assets, links, metadata, JSON-LD, deeplinks, headers, dependency vulnerabilities and visual console-error scan | Establish release evidence rather than relying on a green build alone | unrecorded | live E2E 10/10; mobile 4/4 viewports with no horizontal document overflow and no small targets; contrast 35/35; npm audit 0 high-or-higher vulnerabilities; 6/6 screenshot assets HTTP 200; internal links 5/5; JSON-LD 2/2 valid with 27 items; deeplinks passed; desktop/mobile screenshots had no browser console errors |

### Tracker positioning and exact source dates (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 14:22 | working tree (uncommitted) | Repositioned the homepage from a static archive headline to a Vita port update tracker with a visible three-times-daily scan status, exact last-scan time, review-queue count and a Latest updates section | Make the site's purpose obvious within the first viewport and surface the newest source-backed changes before the long directory | unrecorded | local production preview DOM shows the new title, status band, four latest update cards, exact UTC dates and the existing 27-project Vita selector |
| 14:22 | working tree (uncommitted) | Replaced relative “days ago” labels in the ticker, update cards and discovery queue with explicit UTC source timestamps; added a shared `formatUtcDateTime` helper | Prevent stale-looking relative labels such as “3d ago” and keep source dates unambiguous across time zones | unrecorded | typecheck clean; 45/45 unit tests; 7/7 integration tests; live E2E 10/10; live contrast 36/36 |
| 14:22 | working tree (uncommitted) | Updated static HTML, Open Graph, Twitter and WebSite JSON-LD metadata to use the update-tracker position, and raised the new latest-card project links to 44px touch targets | Keep no-JavaScript previews and crawlers aligned with the rendered homepage and remove the confirmed mobile target findings | unrecorded | live header/SEO audit reports the new title and description; mobile audit passes all 4 viewports with no horizontal overflow and no small targets |
| 14:22 | working tree (uncommitted) | Published the tracker improvements to Vercel production and aliased them to `https://vitaharbor.vercel.app` | Make the completed release available on the public site | unrecorded | deployment `https://vitaharbor-r7hj2p2au-anonymusv1605-8308.vercel.app` READY and aliased; live E2E 10/10, mobile 4/4, contrast 36/36 and security/SEO checks passed |

### Directory freshness label correction (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 14:29 | working tree (uncommitted) | Replaced the ambiguous `Latest activity` directory label with `source screenshots` and the actual `Source scan` date from `discovered.json`; removed the now-unused curated-activity prop | The old line mixed the last curated project update (18 Sept) with the scanner state and made the site look stale | unrecorded | live DOM after refresh shows `27 projects indexed · 6 source screenshots · Source scan 20 Sept 2026`; the status band shows `5 candidates`; live E2E 10/10 passed |
| 14:29 | working tree (uncommitted) | Published the directory freshness correction to Vercel production | Make the corrected wording visible on the public site | unrecorded | deployment `https://vitaharbor-fijfh5q2q-anonymusv1605-8308.vercel.app` READY and aliased to `https://vitaharbor.vercel.app` |

### GitHub scanner CI repair (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 14:33 | `b5d6536` | Changed the Reddit scanner workflow to run the unit and integration suites explicitly, and added a push trigger for scanner-related changes on `main` | The previous `npm test` command let Vitest collect Playwright E2E files and failed before the Reddit scanner started | unrecorded | GitHub run `35511117870` succeeded: tests, Reddit scan, feed rebuild and discovery commit all passed; local 45 unit + 7 integration + 10 E2E passed |

### GitHub scanner repair production release (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 14:38 | working tree (uncommitted) | Published the current verified VitaHarbor build after the scanner CI repair | Keep the live site aligned with the verified ledger, feeds and screenshots while the GitHub scan pipeline is healthy | unrecorded | Vercel deployment `dpl_77ZwwgZu1KA52NHGxErkwMKYUp4H` READY and aliased to `https://vitaharbor.vercel.app` |

### Curated link audit and dead-target cleanup (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 15:19 | working tree (uncommitted) | Completed bounded assignment `VH-LINKS-003`: corrected confirmed repository/post targets, removed unsupported project/update sources, made prerendered outbound anchors conditional, and added link-integrity regression coverage | Prevent dead, wrong-project and misleading generic links from being presented as valid VitaHarbor sources | unrecorded | `npm run data:feeds`, `npm run verify` (48 unit tests/build), `npm run lint`, `npm run test:integration` (7/7), `git diff --check`, and generated-output scan passed; deployment intentionally not performed |

### VH-LINKS-003 production deployment (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 15:28 | working tree (uncommitted) | Deployed the verified link-audit checkout to Vercel production | Publish the confirmed link corrections and conditional source anchors | unrecorded | deployment `dpl_GQW1rms2AcLfZL2S3JR7J1LdDmWg` READY at `https://vitaharbor-pafckmx35-anonymusv1605-8308.vercel.app`, aliased to `https://vitaharbor.vercel.app`; live bundle `/assets/index-ZDzEdfqE.js` |
| 15:28 | working tree (uncommitted) | Ran post-deployment link and runtime acceptance checks | Prove the public site serves the corrected set without reviving removed targets | unrecorded | Root, representative project pages and feeds HTTP 200; corrected targets 6/6 present in live panels; unlinked project panels 10/10 have no Reddit anchor; known old targets absent; 9/9 relevant live E2E tests passed; browser console/runtime errors none |
| 15:28 | working tree (uncommitted) | Recorded the existing archive E2E mismatch without changing unrelated tests | The old test requires every one of 27 projects to have a Reddit source, which conflicts with the verified removal of unsupported sources | unrecorded | Full existing archive E2E 9/10: 9 passed and 1 failed only at `lists every entry with a source link` (`expected 27`, `received 17`); this is documented as a stale assertion, not a live product failure |

### VH-LINKS-005 superseding live crawl and correction (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 16:07 | working tree (uncommitted) | Completed a second, rendered-site-first link audit over the public sitemap, all 27 project routes, expanded panels, feeds and generated output; discovered and corrected source-less `#directory` fallbacks, two blocked Reddit targets and three generic upstream GitHub targets | The earlier VH-LINKS-003 live completeness conclusion was incomplete and is superseded as `NO_GO`; only exact, verified external sources may remain clickable | unrecorded | Pre-fix inventory: 28 routes, 2,770 link records, 268 unique hrefs, 38 external unique; post-fix inventory: 28 routes, 2,471 link records, 260 unique hrefs, 33 external unique; 30 exact and 3 intentional generic external classifications; zero forbidden/internal-broken links and zero runtime errors |
| 16:07 | working tree (uncommitted) | Added conditional source rendering and non-clickable unverified states in ticker, latest updates, project panels and prerender output; corrected methodology copy; retained only the exact Cave Story screenshot file source | Prevent dead, misleading, empty-hash and generic outbound actions from appearing in static or hydrated UI | unrecorded | `npm run verify` passed with 48 unit tests and build; `npm run lint` passed; `npm run test:integration` passed 7/7; local and live E2E passed 11/11; targeted DOM check found zero ticker fallback links and zero empty/JavaScript anchors |
| 16:07 | working tree (uncommitted) | Published the corrected checkout to Vercel production | Make the link corrections effective on the public alias | unrecorded | Deployment `dpl_6s3znwgNckgAHnzXTNANuAZhKyfn` reached `READY` and was aliased to `https://vitaharbor.vercel.app` |
| 16:07 | working tree (uncommitted) | Recorded machine-readable live evidence and superseding handoff state | Preserve exact route/surface/href/classification evidence for the master task | unrecorded | `docs/link-audit-live.json` records 2,471 observed links across 28 routes; post-deploy crawl has zero `BLOCKED_UNVERIFIED`, `DEAD_HARD`, `DEAD_SOFT`, `WRONG_TARGET` or `INTERNAL_BROKEN` clickable links; no commit, push, merge, reset, clean or stash |

### VH-COMMENTS-006 Reddit comment review (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 16:37 | working tree (uncommitted) | Reviewed both authenticated VitaHarbor posts in `Best` and `New`, opened all visible `More replies` threads, and recorded 13 visible unique comments plus the one r/vitahacks comment-count slot Reddit did not expose as text/permalink | Establish a read-only, evidence-backed disposition for every current comment without treating comment text as proof | unrecorded | Exact post/comment permalinks, UTC creation attributes, authors and dispositions are recorded in `docs/REDDIT_COMMENT_REVIEW_2026-09-20.md`; no edited markers were exposed; Reddit mutations: none |
| 16:37 | working tree (uncommitted) | Independently verified the concrete claims: the Medal of Honor post/repository exists; the old Simpsons target returns Reddit Page not found; focused Star Fox and Portal searches expose no exact current Vita project source; current production already omits the old Simpsons/Portal external actions | Avoid speculative additions and confirm whether comment-reported defects are already corrected | unrecorded | The exact Medal of Honor post was read in the authenticated browser and both GitHub repositories returned HTTP 200; Reddit-only pages were not promoted from unauthenticated HTTP failures |
| 16:37 | working tree (uncommitted) | Added the append-only Reddit review artifact; no project code/data change was justified because concrete defects were already fixed by VH-LINKS-005 and remaining requests lacked canonical evidence or were outside VitaHarbor scope | Preserve source accuracy and avoid inventing ports, status, screenshots or repositories | unrecorded | Review artifact added; unrelated dirty work preserved; no commit, push, merge, reset, clean or stash |

### VH-COMMENTS-006 release verification (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 16:44 | working tree (uncommitted) | Re-ran the complete release gates for the comment review without adding speculative project data | Confirm the current source-accurate checkout remains shippable after the review artifact | unrecorded | `npm run verify` passed typecheck, 48 unit tests and build; `npm run lint` passed; `npm run test:integration` passed 7/7; full `npm run test:e2e` passed 11/11; `git diff --check` exited 0 with only pre-existing CRLF warnings |
| 16:44 | working tree (uncommitted) | Published the reviewed checkout to Vercel production | The assignment explicitly authorized deployment after all gates passed | unrecorded | Deployment `dpl_8UbJWaou4vx1XKVephmATfBZuq8q` reached `READY` at `https://vitaharbor-ptks5dsv0-anonymusv1605-8308.vercel.app` and was aliased to `https://vitaharbor.vercel.app` |
| 16:44 | working tree (uncommitted) | Repeated the VH-LINKS-005 rendered live crawl and affected-panel checks after deployment | Reconfirm that the already-fixed Simpsons/Portal link findings did not regress | unrecorded | 28 live routes, 2,484 link records, 260 unique hrefs, 33 unique external hrefs, zero runtime errors, zero forbidden/internal-broken classifications, old target `126a9bf` absent; Portal and Simpsons panels have no external anchors; OpenMoHAA retains its verified exact links; targeted browser console errors 0 |
| 16:44 | working tree (uncommitted) | Repeated production E2E, deeplink, header/SEO/feed/crawler and live DOM checks | Prove the public alias, affected flows and full regression suite remain green | unrecorded | Post-deploy full E2E 11/11; deeplinks, headers/SEO, crawler files and live entry count checks passed; no Reddit mutation performed |

### VH-REDDIT-007 three-community scanner expansion (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 17:08 | working tree (uncommitted) | Added `r/PSVitaHomebrew` to the canonical Reddit source configuration and wired the local scanner, Vercel fallback scan, UI status copy, README, automation docs, blueprint source keys and generated feed descriptions to the same three-community scope | Ensure the newly requested community is scanned permanently instead of being a one-off manual check | unrecorded | `tests/unit/reddit-scanner.test.mjs` asserts all three feeds and RSS URL; typecheck clean; RSS source label regenerated in `public/data/discovered.json`, `public/api/feed.json` and `public/api/rss.xml` |
| 17:08 | working tree (uncommitted) | Extracted the classifier into pure testable helpers and added conservative promotional-spam rejection while preserving the existing question-title guard | Make the question/spam boundary regression-testable without network calls or queue writes | unrecorded | 52/52 unit tests passed, including accepted development, rejected question and rejected promotional-spam cases |
| 17:08 | working tree (uncommitted) | Added C-Dogs SDL Vita as project 28 after checking the Reddit pre-release post and GitHub `vita-preview-1` release assets; kept Real Racing 2 and source-less claims out of the curated ledger | Only promote an independently source-backed item from the three-community review | unrecorded | Review artifact `docs/REDDIT_THREE_COMMUNITY_REVIEW_2026-09-20.md`; GitHub API returned Vita data, VPK and checksum assets; no Reddit mutations |

### VH-REDDIT-007 local release gate (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 17:08 | working tree (uncommitted) | Ran the complete local release checks after the scanner/data change | Catch code, generated-feed, rendering and browser regressions before deployment | unrecorded | `npm run verify` passed typecheck, 52 unit tests, production build and 28 prerendered project pages; `npm run lint`, `npm run test:integration` 7/7, `npm run test:e2e` 11/11 and `git diff --check` passed (only existing line-ending warnings) |
| 17:12 | working tree (uncommitted) | Made `/api/*` responses non-cacheable and added `cache: "no-store"` to the browser API client | Post-deploy DOM verification showed the CDN could hydrate the page with a stale 27-project API response after the 28-project static build was deployed | unrecorded | Reproduction captured 28 items with a cache-busted API request but 27 after normal hydration; fix is covered by the next production deploy and live E2E run |

### VH-REDDIT-007 production release (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 17:19 | working tree (uncommitted) | Published the three-community ledger, C-Dogs entry, feeds and scanner configuration to Vercel production | Make the requested source expansion and source-backed project available on the public site | unrecorded | First deployment `dpl_7XfQYq3rvZrLvjvGe4yPERvGQ1Hk` reached READY and was aliased; the first hydration smoke exposed the stale 27-project cache condition recorded above |
| 17:19 | working tree (uncommitted) | Published the cache-invalidation fix and updated the E2E assertion to derive the selector count from `FALLBACK_PROJECTS.length` | Keep the interactive client, static HTML and authored ledger on the same project count | unrecorded | Final deployment `dpl_CdWZSDm5fk8Nf88AHkAD3uwAEhsc` reached READY and was aliased; live `/api/projects` returned 28 with `Cache-Control: no-store`, and live DOM showed 28 directory projects and 28 selector buttons |
| 17:19 | working tree (uncommitted) | Completed post-deploy acceptance and refreshed the integrity handoff | Close the assignment with proof from the public alias and hash-protected handoff | unrecorded | Live E2E 11/11; root, C-Dogs deeplink, JSON feed, RSS and sitemap HTTP 200; feeds contain 28 items and the three-community label; `NEW-HANDOFF.ps1 -Verify HANDOFF.md` returned HANDOFF GO for 15 sources; Reddit mutations NONE |
| 17:19 | working tree (uncommitted) | Re-ran the existing responsive and contrast audits against the production alias | Confirm the additional source copy and 28-project state did not regress the visitor surface | unrecorded | Mobile audit passed 4/4 viewports with no document overflow or small targets; contrast audit passed 36/36 styles |

### VH-POISON-008 data-poisoning hardening (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 17:48 | working tree (uncommitted) | Added a shared provenance boundary with bounded text/URLs, canonical Reddit identity, content hashes, explainable risk signals, evidence gaps and the explicit state machine `DETECTED -> QUARANTINED -> VERIFIED_FOR_REVIEW -> PROMOTED` with `REJECTED`/`BLOCKED_UNVERIFIED` terminals | Prevent hostile Reddit content from becoming curated VitaHarbor data through scanner or public API paths | unrecorded | `tests/unit/data-poisoning.test.mjs` passes 10/10; exact threat fixture is captured as a quarantined explicit fake/troll signal; no username blacklist is used |
| 17:48 | working tree (uncommitted) | Migrated the legacy five-item `public/data/discovered.json` queue into internal `data/quarantine.json`; public discovery output is now a sanitized projection without authors, scanner reasons or risk details | Preserve existing candidates while preventing public amplification and making provenance review explicit | unrecorded | Migration reports 5 items and 0 promotions; all 5 are `QUARANTINED`; curated ledger remains 28 projects |
| 17:48 | working tree (uncommitted) | Replaced direct promotion with reviewer/evidence-gated verify, reject, block and promote commands; appended audit events go to `data/provenance-audit.jsonl` | Make promotion an explicit, reviewable action and ensure evidence survives the decision | unrecorded | `npm run data:list` and `data:inspect` show state/gaps; scanner/workflow static regression confirms no fallbackData write |
| 17:48 | working tree (uncommitted) | Updated local scanner, Vercel read-only cron route, public queue UI, RSS escaping, threat-model/moderation docs and adversarial regression tests | Apply the same boundary consistently and keep hostile text non-executable/non-amplified | unrecorded | Typecheck, lint, verify (62 unit tests/build), integration 7/7, generated output scan, security headers/CSP/HSTS, and no poison text in build/feed outputs passed |

### VH-POISON-008 production release (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 17:56 | working tree (uncommitted) | Deployed the hardened scanner/public-queue build to Vercel production, then removed the Vercel TypeScript declaration warnings for the new `.mjs` imports and redeployed | Publish the final quarantine boundary with a clean hosted build | unrecorded | Final deployment `dpl_FPfm7yZJkNskN8ojvk2KVan1KZDH` is READY and aliased to `https://vitaharbor.vercel.app`; Vercel build output completed without TypeScript diagnostics |
| 17:56 | working tree (uncommitted) | Ran final post-deploy live acceptance across the public alias | Verify curated count, safe queue schema, API behavior and hostile-output containment in production | unrecorded | `/api/projects` returns 28 with `no-store`; public queue has 5 items and no `author`/`risk_signals`; `/api/cron-scan` returned only sanitized accepted records; all public feeds/sitemap returned 200 with no poison text; final live E2E 11/11; earlier link crawl recorded 2,695 links across 29 routes with 0 runtime errors; mobile 4/4; contrast 35/35 |

### VH-INCIDENT-010 campaign containment (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 19:01 | working tree (uncommitted) | Added generalized campaign correlation using wording/content/media/link fingerprints, bounded timing and explicit prior-campaign references; author identity alone cannot link or blacklist records | Detect coordinated fake-port campaigns without turning a username into a reputation rule or false-positive filter | unrecorded | Focused data-poisoning suite covers copied content, cross-community near duplicates, explicit references and legitimate same-author separation |
| 19:01 | working tree (uncommitted) | Recorded the observed incident set in internal quarantine: one confirmed malicious proposal as `REJECTED` and two linked no-evidence KeeperRL claims as `BLOCKED_UNVERIFIED` | Remove confirmed campaign exposure while preserving the distinction between proven malicious intent and an unverified project claim | unrecorded | `node scripts/contain-fake-port-incident.mjs` added 3 records, appended 3 audit events and regenerated a public projection with 5 unrelated items |
| 19:01 | working tree (uncommitted) | Added incident report, threat-model controls, moderation guidance and project-state evidence | Preserve scope, exposure, unknowns, public containment and the no-Reddit-mutation record for handoff | unrecorded | `docs/FAKE_PORT_INCIDENT_2026-09-20.md`, `docs/THREAT_MODEL_DATA_POISONING.md`, `docs/MODERATION_AND_PROMOTION.md`, `PROJECT_STATE.md` |

### VH-INCIDENT-010 release and live containment (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 19:08 | working tree (uncommitted) | Published the campaign correlation and incident containment changes to Vercel production | Remove confirmed campaign exposure from the public tracker while preserving internal provenance | unrecorded | Deployment `dpl_31SM83iB5WYTmjJTAZNPF3AVbkhv` reached READY and is aliased to `https://vitaharbor.vercel.app` |
| 19:08 | working tree (uncommitted) | Ran post-deploy API, DOM, feed, sitemap, header, responsive and link-crawl checks | Confirm that rejection/blocking is effective across every public surface, not only the local JSON file | unrecorded | Live `limit=100` API returned 28 projects; discovery queue returned 5 sanitized items; DOM showed 28 directory entries, 28 selector buttons and 4 grid columns; forbidden incident values were absent; headers passed; mobile and contrast passed; live crawl recorded 2,657 links across 29 routes with 0 runtime errors |

### VH-INTEGRATE-009 pre-commit integration gate (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 19:20 | working tree (staged) | Refreshed the path-level inventory and selected the reviewed 80-path project state; excluded the machine-local restart handoff and ignored local runtime/browser artifacts | Integrate the accumulated site, ledger, scanner, provenance, incident, evidence, test and project-control work without committing session data or ambiguous artifacts | unrecorded | `docs/INTEGRATION_CHECKPOINT_2026-09-20.md`; staged manifest contains 80 paths; restart handoff is not staged; no cookies, profiles, secrets or `.env` files selected |
| 19:20 | working tree (staged) | Ran the complete local safety and release gates against the exact staged checkout | Establish a commit-ready state before creating the local integration commit | unrecorded | `npm run verify` passed typecheck, 65 unit tests and build/prerender; lint passed; integration 7/7; full E2E 11/11; `npm audit --omit=dev` reported 0 vulnerabilities; staged secret-pattern scan reported 0 hits; 9 JSON/JSONL artifacts validated; `git diff --cached --check` and `git diff --check` passed; ledger/public/incident counts are 28/5/1+2; auto-promotion invariant passed |

### VH-INTEGRATE-009 local commit (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 19:21 | `e89adff` | Committed the reviewed 80-path VitaHarbor integration selection on `main` | Establish a local, reviewable project baseline without pushing or changing production | unrecorded | `Integrate VitaHarbor ledger and incident controls`; commit created on `main`; machine-local restart handoff remained excluded |
| 19:22 | local bookkeeping | Recorded the post-commit project state, evidence, integration checkpoint and hash-protected handoff | Make the final local integration state self-describing and verifiable before handoff | unrecorded | Handoff verification remained `GO`; only the explicitly excluded restart handoff remains outside Git; production unchanged |

### VH-RECONCILE-012 remote scanner reconciliation (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 19:30 | `7c1b17b` | Merged remote scanner commits `37fabb5` and `4ba193f` normally and resolved generated-file conflicts in favor of the current schema-v2 provenance boundary | Reconcile remote scanner history without allowing a legacy public projection or stale 22-item feed to overwrite the hardened local state | unrecorded | Merge parents are the local integration tip and `4ba193f`; no rebase, force push, reset, clean or stash |
| 19:37 | working tree | Preserved the two remote-only observations (`RC Cars` and `Super Smash Bros Melee [Update]`) as v2 `QUARANTINED` records with content hashes, missing-body evidence gaps and append-only audit events; five matching URLs were deduplicated | Keep scanner discoveries available for review without promotion or unsupported claims | unrecorded | `data/quarantine.json` has 10 records, `public/data/discovered.json` has 7 sanitized items, curated ledger remains 28, and rerunning the reconciliation is an idempotent no-op |
| 19:37 | working tree | Regenerated JSON/RSS feeds from the curated ledger and added the reconciliation fixture, script and evidence report | Keep public feeds separate from unverified scanner queue data and make the decision reproducible | unrecorded | `npm run data:feeds` completed; feed count is 28; report: `docs/REMOTE_SCANNER_RECONCILIATION_2026-09-20.md` |

### VH-RECONCILE-012 scanner follow-up (2026-09-20)

| Time | Commit | Change | Why | Model | Verified |
|---|---|---|---|---|---|
| 19:43 | `ef46927` | Accepted the automatic scanner data commit after the push and fast-forwarded local `main` | Settle the generated state produced by the hardened workflow instead of leaving local state ahead of its own scanner result | unrecorded | GitHub Actions run `35526699613` concluded `success`; commit changed only `data/quarantine.json`, `public/data/discovered.json` and `public/api/rss.xml` |
| 19:43 | `ef46927` | Retained schema v2 and 28 curated feed items; removed only the RC Cars quarantine duplicate because its canonical Reddit URL is already a known lead in the curated ledger | Confirm the scanner does not delete a discovery that is still uncurated and does not promote new candidates | unrecorded | Remote tip has 9 internal records, 6 sanitized queue items, 28 feed items, no `fallbackData.ts` diff; incident state counts remain 1 `REJECTED` + 2 `BLOCKED_UNVERIFIED` |
| 19:47 | working tree | Re-ran the complete local release checks after accepting the scanner data commit | Verify the final post-scan checkout rather than relying only on the remote workflow result | unrecorded | `npm run verify` passed typecheck, 65 unit tests, build/prerender 28 pages; lint passed; integration 7/7; full E2E 11/11 |
| 19:50 | working tree | Refreshed the hash-protected project handoff with the reconciled data, report, script and generated feeds | Make the final cross-chat state verifiable without trusting stale context | unrecorded | `NEW-HANDOFF.ps1` recorded 36 source hashes and `-Verify HANDOFF.md` returned `HANDOFF GO`; only the explicitly excluded restart handoff remains untracked |
