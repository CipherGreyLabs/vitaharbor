# VitaHarbor project brief

## Purpose

VitaHarbor is an independent, static tracker for PlayStation Vita ports,
decompilations and ARM-wrapper updates surfaced by the community. It is not a
replacement for VitaDB, Brewology, GitHub or the original project pages.

## Repository

- Repository: `https://github.com/CipherGreyLabs/vitaharbor`
- Local project: `C:\Users\suloW\Documents\ChatGPT\VitaPort`
- Production: `https://vitaharbor.vercel.app`
- Integration branch: `main`
- Project id: `61e8d378-d2c9-409f-96b1-0e6d16827c94`

## Operating model

This project uses one visible master architect and one primary implementation
worker. The master plans and delegates. The worker implements, tests and
deploys only the bounded assignment received from the master. No native or
hidden subagents are used.

Additional workers are optional. When needed, they are visible persistent
Codex tasks using `gpt-5.6-luna` with `xhigh` reasoning and an isolated Git
worktree/branch. They never write directly to `main` and never create workers.

## Safety and scope

- Preserve the existing dirty worktree; never reset or discard user changes.
- Do not add ROMs, ISOs, game data or piracy links.
- Source-backed facts, tests and release evidence must be recorded.
- No production release claim without executed evidence.
