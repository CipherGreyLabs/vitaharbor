# Reddit three-community review — 2026-09-20

Assignment: `VH-REDDIT-007`

## Boundary and method

- Previous persisted scanner boundary: `2026-09-20T12:34:23.014Z` from `public/data/discovered.json`.
- Review performed read-only in a separate authenticated Chrome task session on Reddit.
- Communities checked: `r/vitahacks/new`, `r/VitaPiracy/new` and `r/PSVitaHomebrew/new`; `r/PSVitaHomebrew/top/?t=week` was also checked for recent high-signal posts.
- No Reddit posts, comments, votes, saves or subscriptions were changed.
- The public RSS scan was run after the source change. `r/vitahacks` returned 25 parsed entries; `r/VitaPiracy` and `r/PSVitaHomebrew` returned HTTP 429 on both attempts, so their manual browser review is the authoritative review evidence for this run.

## Review dispositions

| Community | Post | Evidence and disposition |
|---|---|---|
| r/vitahacks | [C-Dogs SDL port for PS Vita / PSTV](https://www.reddit.com/r/vitahacks/comments/1wkw14c/prerelease_cdogs_sdl_port_for_ps_vita_pstv/) | Post reports a native Vita/PSTV pre-release and links the source/release repositories. GitHub API independently returned release tag `vita-preview-1` with Vita data, VPK and checksum assets. Promoted as curated project 28 with an early-WIP stage; no independent hardware claim added. |
| r/vitahacks | [Gameplay: World at War Zombies ported to the PS Vita](https://www.reddit.com/r/vitahacks/comments/1wkrhnp/gameplay_world_at_war_zombies_ported_to_the_ps/) | Links an X post, but no source repository or release evidence was exposed in the Reddit post. Not promoted. |
| r/vitahacks | [SuperTuxKart W.I.P port for PlayStation Vita with Vulkan](https://www.reddit.com/r/vitahacks/comments/1wkf9m5/supertuxkart_wip_port_for_playstation_vita_with/) | High-signal development claim, but no external repository or release link was exposed. Not promoted pending a canonical project source. |
| r/vitahacks | [Diddy Kong Racing (Golden Balloon) Update](https://www.reddit.com/r/vitahacks/comments/1wjzosl/diddy_kong_racing_golden_balloon_update/) | Claims a GitHub build exists, but no exact repository URL was exposed in the post body. Not promoted. |
| r/vitahacks | [I have a problem with my PS Vita](https://www.reddit.com/r/vitahacks/comments/1wlhkh1/i_have_a_problem_with_my_ps_vita/) | Question/help post after the previous scan boundary. Rejected by the question filter and not relevant to the ledger. |
| r/VitaPiracy | [Do I have a doubt, this benefits the ps vita in any way?](https://www.reddit.com/r/VitaPiracy/comments/1wlgwqk/do_i_have_a_doubt_this_benefits_the_ps_vita_in/) | Question post after the boundary. Not promoted. |
| r/VitaPiracy | [Can someone point me in the right direction](https://www.reddit.com/r/VitaPiracy/comments/1wlg66q/can_someone_point_me_in_the_right_direction/) | Help/request post after the boundary. Not promoted. |
| r/VitaPiracy | [Is dusklight vita still in development?](https://www.reddit.com/r/VitaPiracy/comments/1wla4gs/is_dusklight_vita_twilight_princess_port_still_in/) | Status question without a new source-backed update. Not promoted. |
| r/PSVitaHomebrew | [New Port Real Racing 2](https://www.reddit.com/r/PSVitaHomebrew/comments/1wli3yi/new_port_real_racing_2/) | Recent post reports menu progress and crashes in quick play, but the authenticated page exposed no external source or release link. Left as a review finding only; not promoted or added to the persisted queue. |
| r/PSVitaHomebrew | [Our Class Of 09 Vita Port Is Finally Finished!](https://www.reddit.com/r/PSVitaHomebrew/comments/1whque3/our_class_of_09_vita_port_is_finally_finished/) | Recent top-week duplicate of the already curated Class of '09 record. No new project or source relation added. |

## Result

The scanner now uses one canonical source list containing all three communities. The curated ledger gained only C-Dogs SDL Vita because its Reddit claim was paired with a verifiable GitHub preview release. Real Racing 2 and the other recent claims remain outside the ledger until an exact source or release is available.
