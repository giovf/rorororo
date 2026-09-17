# Foundry

A portfolio of small, self-funding digital products — Figma plugins, browser
extensions, single-purpose web tools — built and operated by Claude Code for one
owner whose brief is *make money, legally* with at most £100 of capital.

Products ("ventures") are sold through channels that bring their own customers
(Figma Community, Chrome Web Store, merchant-of-record storefronts). Each venture
costs under £10 to launch, runs on free tiers, and is killed if it doesn't earn.
The plan, research and compliance notes are in `.taskmaster/docs/prd.md`; the
stable decisions are in `docs/ARCHITECTURE.md`.

## Running it

```bash
npm install          # workspaces: packages/* and ventures/*
npm run check        # typecheck + lint + format check + tests (the gate for "done")
npm test             # just the tests
npm run build        # tsc -b
```

Each venture under `ventures/<slug>/` has its own `dev`/`build` scripts for its
framework (WXT, Figma plugin toolchain, Astro).

## Dev container
Open the folder in VS Code → "Reopen in Container". The container ships Node 22,
Claude Code and Taskmaster; per-project volumes keep Claude auth, `node_modules`
and shell history across rebuilds. Start `claude`, then `task-master next`.

## Layout
| Path | What |
| --- | --- |
| `packages/core` | Venture manifest types + `defineVenture()` validation |
| `ventures/` | One workspace per product (`venture.json`, `RESEARCH.md`, `src/`) |
| `docs/` | Architecture summary, ledger, launch checklists |
| `.taskmaster/` | PRD and the task backlog (`task-master list`) |
| `src/`, `environment/`, `data/` | Legacy Python crypto-trading prior art — reference only |
