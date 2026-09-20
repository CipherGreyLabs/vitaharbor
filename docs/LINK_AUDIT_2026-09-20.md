# VitaHarbor link audit — 2026-09-20

Assignment: `VH-LINKS-003`
Scope: curated project/update links, repository links, screenshot sources, prerendered outbound links and generated feeds.
Status: `GO` for the link-audit scope. Deployment was intentionally **not performed**.

## Boundary

The earlier broad audit `VH-AUDIT-002` was stopped by the master before completion. This document is not a completion claim for that audit. It covers only the bounded link assignment.

Sources inspected:

- `src/shared/constants/fallbackData.ts`
- `src/web/components/ledger/types.ts`
- `scripts/prerender.mjs`
- `scripts/make-feeds.ts`
- `index.html`, `vercel.json`
- generated `public/api/feed.json`, `public/api/rss.xml`
- detection-only `public/data/discovered.json`
- built `dist/web/index.html` and generated project pages

Reddit post identity was checked in a separate authenticated Chrome task session because direct public requests are blocked or rate-limited. GitHub repository identity was checked through the repository pages/API. No existing user browser tab was used.

## Inventory

The raw scan found 61 unique URL literals or serialized URL values across the audited source and generated surfaces. This includes duplicated feed/prerender output, internal project URLs, generic namespaces and detection-only candidates; it is not a count of curated outbound links.

The curated outbound inventory after the corrections is:

| Surface | Unique entries | Result |
|---|---:|---|
| Curated Reddit post URLs | 19 | 16 `VALID`, 1 `INTENTIONAL_GENERIC`, 2 `BLOCKED_UNVERIFIED` |
| Curated GitHub/repository or screenshot URLs | 14 | HTTP 200; exact project repositories where available, with two intentional upstream roots |
| Generated internal URLs | 28 sitemap URLs | Root plus 27 project pages generated and checked |
| Detection-only Reddit candidates | 5 | Remain in `public/data/discovered.json`; not promoted as curated sources |

### Curated Reddit URLs

These are the 19 unique Reddit URLs still used by curated projects or updates:

```text
https://www.reddit.com/r/vitahacks/comments/17eneu2/upcoming_hollow_knight_ps_vita_port_wip/
https://www.reddit.com/r/vitahacks/comments/18zdtep/new_port_psvita_hot_pursuit/
https://www.reddit.com/r/vitahacks/comments/1h4yhyi/release_renpy_vita_8_port/
https://www.reddit.com/r/vitahacks/comments/1tapf2b/wip_openmohaa_on_ps_vita_medal_of_honor_allied/
https://www.reddit.com/r/vitahacks/comments/1v8zqrw/barony_vita/
https://www.reddit.com/r/vitahacks/comments/1w4y5tz/release_illusia_vita_a_port_of_illusia_to_the/
https://www.reddit.com/r/vitahacks/comments/1w8b9pp/barony_online_update_v002/
https://www.reddit.com/r/vitahacks/comments/1w9ys9f/the_new_psvita_ports/
https://www.reddit.com/r/vitahacks/comments/1wgp613/renegade_vita_demo_release/
https://www.reddit.com/r/vitahacks/comments/1whm4hp/smash_bros_melee_vita/
https://www.reddit.com/r/vitahacks/comments/1wivnp0/super_smash_melee/
https://www.reddit.com/r/vitahacks/comments/1wjjx7w/a_bounty_that_deserves_more_visibility/
https://www.reddit.com/r/vitahacks/comments/1wjn8zg/rc_cars_port_progress/
https://www.reddit.com/r/VitaPiracy/comments/1leugn2/ocarina_of_time_ship_of_harkinian_is_out_now_baby/
https://www.reddit.com/r/VitaPiracy/comments/1vvp4j6/star_wars_jedi_knight_jedi_academy_files/
https://www.reddit.com/r/VitaPiracy/comments/1vws22e/star_wars_jedi_knight_ii_jedi_outcast_data_files/
https://www.reddit.com/r/VitaPiracy/comments/1wdxtxu/welp_i_was_planning_it_being_a_surprise_release/
https://www.reddit.com/r/VitaPiracy/comments/1whqvmz/class_of_09_vita_port_is_finally_released/
https://www.reddit.com/r/VitaPiracy/comments/1wj8dvz/d2vita_is_here_diablo_ii_lord_of_destruction/
```

### Curated GitHub URLs

```text
https://github.com/alexbatalov/fallout2-ce
https://github.com/Brendonm17/Barony-Vita
https://github.com/Grimiku/RenPy-Vita-8
https://github.com/HarbourMasters/Shipwright
https://github.com/HenryKun55/openmohaa/tree/vita-port
https://github.com/NDRWhun/JAVITA
https://github.com/NDRWhun/JK2VITA
https://github.com/nxengine/nxengine-evo
https://github.com/nxengine/nxengine-evo/blob/master/screenshot.png
https://github.com/PatnosDD/Hollow-Knight-PsVita
https://github.com/robin994/SmashMeleeVita
https://github.com/TheSpasticGamer/Class-Of-09-Vita-Port
https://github.com/withLogic/illusia-vita
https://github.com/withLogic/illusia-vita/blob/master/extras/screenshots/screenshot1.jpg
```

## Findings and corrections

### Confirmed replacements

| Old target | Correction | Reason |
|---|---|---|
| `github.com/openmohaa/openmohaa` | `github.com/HenryKun55/openmohaa/tree/vita-port` | The old root was not the Vita port; the Vita branch is the confirmed target |
| `github.com/doldecomp/melee` | `github.com/robin994/SmashMeleeVita` | The old repository was upstream Melee, not the Vita project |
| `github.com/patnosDD/Hollow-Knight-Vita` | `github.com/PatnosDD/Hollow-Knight-PsVita` | Confirmed repository name/casing and project identity |
| `github.com/SonicMastr/renpy-vita` | `github.com/Grimiku/RenPy-Vita-8` | Project-specific Vita 8 port repository |
| Reddit `126a9bf` | Reddit `1leugn2` | Old Ship of Harkinian/Simpsons target was dead; current Ocarina of Time Ship of Harkinian post was confirmed |
| Reddit `192k7s9` | Reddit `1whqvmz` | Old Class of 09 URL redirected to an unrelated referral page; exact current title was confirmed |

### Confirmed wrong or unsupported targets removed

No generic substitute was inserted for these. The outbound action is now omitted when no project-specific replacement was proven:

| Project/update | Removed target | Evidence |
|---|---|---|
| Portal Vita | Reddit `16l8h0m` | Reddit page not found; no replacement verified |
| Fallout 2 CE | Reddit `q1910a` | Reddit page not found; no replacement verified |
| Spider-Man: Total Mayhem | Reddit `1ij1vzf` | Post was about a different project/context |
| KOTOR Vita | Reddit `1iuoe4u` | Generic exploitation post, not KOTOR |
| Slingshot Racing Vita | Reddit `1iuoe4u` / `1ij1vzf` context | Neither post identified the project |
| Baldur's Gate: Dark Alliance | Reddit `1inclw4` | Generic list/question post, not this project |
| Celeste Classic | Reddit `1inclw4` | Generic list/question post, not this project |
| Cave Story | Reddit `1inclw4` | Generic list/question post, not this project |
| Simpsons: Hit & Run | Reddit `126a9bf` | Dead page; no replacement verified |
| Render96 SM64 HD | Reddit `1whm4hp` | The post is Smash Bros. Melee, not Render96 |
| OpenMoHAA/Portal/Spider-Man updates | source arrays | Removed when the prior source was dead or wrong |

`prerender.mjs` now renders no outbound Reddit/source anchor when the curated value is absent. This prevents a removed target from becoming a misleading `#directory` or `#` link in static HTML.

## Unresolved classifications

- Reddit `18zdtep` (Need for Speed: Hot Pursuit) has the expected slug/title but was behind Reddit's age/content gate in the verification session: `BLOCKED_UNVERIFIED`.
- Reddit `1whqvmz` (Class of 09) has the exact title from Reddit search, while the direct page intermittently returned a Reddit server error: `BLOCKED_UNVERIFIED`.
- Reddit `1w9ys9f` is intentionally generic: its post is a broad Vita-ports update and explicitly mentions Zelda: Twilight Princess as a WIP. It is retained as a source, not presented as a project-specific post.
- `https://www.reddit.com` and `https://reddit.com/user/${id.username}` are framework/profile-navigation values, not project evidence. Public fetches of Reddit are blocked; they were not silently promoted to `VALID`.
- Five Reddit URLs in `public/data/discovered.json` are detection-only scan candidates. They remain untouched and are not rendered as curated project/update sources.

## Verification

Completed after the corrections:

- `npm run data:feeds` — generated feed files successfully.
- `npm run verify` — typecheck, 48 unit tests and production build passed; 27 project pages prerendered and sitemap contains 28 URLs.
- `npm run lint` — passed.
- `npm run test:integration` — 7/7 passed.
- `git diff --check` — exit 0; only pre-existing line-ending warnings were reported for unrelated dirty files.
- Built HTML and generated feeds — no known removed dead/wrong target remains in the user-facing generated output.
- Link-integrity regression tests — present in `tests/unit/link-integrity.test.ts` and included in the 48-unit-test pass.

## Delivery state

- Changed only the bounded link/data/render/test/documentation surfaces; unrelated dirty work was preserved.
- No commit, push, merge or Vercel deployment was performed for `VH-LINKS-003`.
- Deployment status: `NOT_PERFORMED`.

## Superseding correction — VH-LINKS-005 (2026-09-20)

This section supersedes the earlier `VH-LINKS-003`/`VH-DEPLOY-004` live-completeness conclusion. The earlier audit was not sufficient as a production rendered-link audit: a complete crawl exposed additional fallback, blocked and generic targets. That earlier live-completeness conclusion is therefore treated as `NO_GO` and remains in the file only as historical evidence.

### Live crawl before correction

The fresh rendered-site crawl started from the public sitemap, visited all 28 routes (root plus 27 project routes), expanded every directory row and panel, and captured static prerender, hydrated, latest-update, navigation and footer anchors. It found 2,770 link records, 268 unique hrefs and 38 unique external hrefs (24 Reddit and 14 GitHub), with no browser runtime errors.

### Missed targets found and corrected

| Surface / item | Finding | Correction |
|---|---|---|
| Community ticker | Source-less Spider-Man and Portal updates fell back to clickable `#directory` links | Render a non-clickable source-less label with an explicit “no verified source” state |
| Need for Speed: Hot Pursuit | Reddit `18zdtep` exposed no post title/body in the authenticated verification browser | Removed the project Reddit URL and the related update source; no substitute inserted |
| Call of Duty 4 | Reddit `1wdxtxu` exposed only a subreddit navigation shell, not the claimed post | Removed the project Reddit URL, screenshot-source URL and related update source; retained only the local screenshot asset |
| Zelda: Ship of Harkinian | `HarbourMasters/Shipwright` is the upstream project, not a Vita-specific source | Removed the generic `KNOWN_REPOS` link |
| Fallout 2 CE | `alexbatalov/fallout2-ce` is an upstream generic repository, not a Vita-specific source | Removed the generic `KNOWN_REPOS` link |
| Cave Story | `nxengine/nxengine-evo` root is a generic engine repository | Removed the root repository link; retained the exact screenshot file source because it identifies the displayed image |
| Latest-update project label | Empty project slugs could become `#p=` links in prerendered output | Render the project label as a link only when a verified slug exists |
| Methodology/footer copy | Claimed every entry links to a source | Reworded to state that only verified project-specific sources receive outbound links |

No generic replacement was used for a removed or blocked target. Project panels with no verified external source now show a non-clickable `No verified external source` state.

### Post-deploy live result

After correction and deployment, the same crawl recorded 2,471 link records across 28 routes, 260 unique hrefs and 33 unique external hrefs: 22 Reddit and 11 GitHub. The unique external classification was 30 `VALID_EXACT` and 3 `VALID_INTENTIONAL_GENERIC`; the latter are real Reddit discussion posts deliberately retained as detection/context sources, not presented as exact project repositories. There were zero `BLOCKED_UNVERIFIED`, `DEAD_HARD`, `DEAD_SOFT`, `WRONG_TARGET` or `INTERNAL_BROKEN` clickable links, and zero runtime errors. The machine-readable result is `docs/link-audit-live.json`.

The two blocked Reddit references (`18zdtep` and `1wdxtxu`) remain documented as removed/unverified audit evidence only; they are absent from the rendered site and generated feeds. The authenticated Reddit checks also confirmed the remaining Reddit titles/body identity. GitHub checks confirmed the remaining 11 exact repository/file targets; generic upstream repositories are absent.

### Verification and release evidence

- `npm run data:feeds` — passed.
- `npm run verify` — passed typecheck, 48 unit tests and production build; 27 project pages prerendered and sitemap contains 28 URLs.
- `npm run lint` — passed.
- `npm run test:integration` — 7/7 passed.
- Local production preview E2E — 11/11 passed.
- Post-deploy production E2E — 11/11 passed, including the rendered outbound-anchor regression.
- `test-deeplinks-live.mjs` — passed for root, representative project routes and sitemap.
- `audit-headers.mjs` and `check-live.mjs` — passed; security headers, crawler files, metadata, JSON-LD and 27 rendered entries confirmed.
- Targeted live DOM check — zero ticker `#directory` fallback links, zero empty/JavaScript anchors, and no external source anchors in the intentionally unlinked NFS/COD4/upstream-only panels.
- `git diff --check` — exit 0 with only pre-existing line-ending warnings in unrelated dirty files.
- Deployment `dpl_6s3znwgNckgAHnzXTNANuAZhKyfn` — `READY`, aliased to `https://vitaharbor.vercel.app`.

The crawl JSON preserves route, surface, label, original href, final URL/title, identifying text, classification and evidence for each observed link. Precise DOM/title evidence was used for the blocked and generic findings; separate image captures were not required because the audit concerned link identity and clickability.

No commit, push, merge, reset, clean or stash was performed. Unrelated dirty work was preserved.
