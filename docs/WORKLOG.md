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
| 00:55 | pending | Fonts and assets cached for a year, HTML moved to edge caching with stale-while-revalidate, AGENTS.md added, npm run verify gate | Fonts sat outside the asset cache rule so they were refetched on every visit, and every new agent had to rediscover the repo and its traps from scratch | deepseek-v4-flash | npm run verify green, cache headers confirmed live |

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
