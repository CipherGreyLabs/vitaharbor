# VitaHarbor durable decisions

## 2026-09-20 — master/worker split

- The master chat owns architecture, prioritisation, bounded assignments and
  release decisions.
- Git history, the current repository state and the canonical project files are
  the authority; older chat summaries and handoffs are context only.
- The primary worker chat owns implementation, tests, evidence updates and
  deployment after receiving an assignment.
- The primary worker does not broaden an assignment into a new architecture
  exercise. It asks for clarification when the assignment is not executable.
- No native, hidden or nested subagents are allowed in either chat.
- Optional specialist workers use `gpt-5.6-luna`/`xhigh` and their own
  `codex/worker/<assignmentId>` worktree. Their changes return to the primary
  worker for review and integration; they never commit directly to `main`.

## Git tree policy

```text
main                              primary worker integration + verified deploy
codex/master/<task-id>            master planning worktree; no implementation writes
codex/worker/<assignmentId>       optional Luna specialist worktree
```

The master worktree is context-isolated, not an implementation branch. An
optional worker branch may be merged or cherry-picked only after the primary
worker verifies its handoff and tests. `git worktree list` is the authoritative
checkout map.

## Evidence policy

`EVIDENCE.jsonl` is append-only for assignments, runtime identity, tests,
reviews and releases. `docs/WORKLOG.md` remains the human-readable project
history. `PROJECT_STATE.md` records only the latest verified state and next
action; it is not a chat transcript.
