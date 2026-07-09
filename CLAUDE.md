# Project guidelines for Claude Code

This file is loaded automatically by Claude Code at the start of every session
(both `claude` in the terminal and the IDE extension). Keep it small and
high-signal — it's part of every prompt, so verbosity costs tokens.

## Architecture
- Product/system architecture lives in `docs/ARCHITECTURE.md` (imported
  below). That file tracks the PRD (`.taskmaster/docs/prd.md`); this file is
  conventions and practices only — keep PRD-specific detail out of here.

## Stack
- **Runtime**: Cloudflare Workers (Hono framework) — single Worker serves API,
  MCP endpoint, and static landing/docs assets
- **Package manager**: npm (don't switch to pnpm/yarn without asking)
- **Language**: TypeScript everywhere — strict mode
- **Validation**: zod schemas are the single source of truth (REST validation,
  OpenAPI spec, MCP tool definitions all derive from them)
- **Storage**: Cloudflare KV (cache, counters, key lookup) + D1 (durable records)

### Commands
- `npm run dev` — wrangler dev server on http://localhost:8787
- `npm run build` — dry-run deploy (bundles + validates, no upload)
- `npm run lint` / `npm run typecheck` / `npm run format` — quality gates
- `npm test` — vitest (Workers pool) once wired (Phase 1 task)
- `npm run deploy` — real Cloudflare deploy (ask first, see below)
- `npm run cf-typegen` — regenerate binding types after `wrangler.jsonc` changes

## Conventions
- All new code in TypeScript with explicit return types on exported functions
- No `any`, no `// @ts-ignore` without a comment explaining why
- Prefer named exports over default exports
- **Dataset isolation rule**: anything specific to a dataset lives in
  `src/sources/<slug>.ts` + a registry entry — nothing else. Dataset-specific
  logic anywhere else is a design bug (the niche must stay swappable).
- Worker runtime secrets go in `.dev.vars` locally / `wrangler secret put` in
  prod — never in `.env` (that's for CLI tooling only) and never committed.
- Personal data from sources is dropped at ingest (Blind Mode) — never stored.

## Sources of truth & drift control
- Architecture: `docs/ARCHITECTURE.md` (auto-loaded below; the stable summary).
  Volatile detail: `.taskmaster/docs/prd.md`. Work plan: `.taskmaster/tasks/tasks.json`.
- If a task conflicts with ARCHITECTURE.md, reconcile BEFORE implementing —
  usually by fixing the task; change the architecture doc only when the code
  genuinely changes a contract (data model, API surface, auth, billing).
- Architecture-doc edits are surgical and land in their own
  `docs(architecture):` commit stating what changed and why — git is the
  change log. Then note it on the driving task (`task-master update-subtask`
  or the commit ref in the task description).
- **Same-commit rule**: a code change that alters anything ARCHITECTURE.md,
  the privacy policy, or the terms describe updates those docs in the same
  commit/PR. Drift is a bug.

## Workflow — when to create a Taskmaster task
- **Task required (create it BEFORE coding):** new modules/routes/sources;
  contract changes (zod schemas, D1 migrations, `wrangler.jsonc`,
  `plans.json`, API surface, auth/billing flows); refactors >~50 lines across
  files. Manual form works everywhere:
  `task-master add-task --title="..." --description="..."`.
- **No task needed:** typos/formatting, config tweaks without behavior
  change, spikes not meant to be committed, fixes <~30 lines in one private
  function, docs-only edits.
- In doubt → create the task. One Taskmaster row is near-free; untracked work
  breaks the audit trail.
- Check `task-master next` when picking up work; `task-master set-status
  --id <id> --status done` as you finish.
- Don't commit `node_modules/`, `.taskmaster/reports/`, or anything in
  `.gitignore`.

## Things to ask before doing
- Adding a new top-level dependency
- Changing the package manager
- Modifying anything inside `.devcontainer/`
- Deploying, publishing, or submitting to any store/registry
- `npm run deploy` / `wrangler deploy` (real Cloudflare deploy)
- Running D1 migrations against the production database
- Creating/modifying Stripe objects in **live** mode (test mode is fine)
- Anything that sends real payments, emails, or publishes data externally

## Product architecture
**Import the architecture overview; treat as if inlined here.**
@./docs/ARCHITECTURE.md

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md
