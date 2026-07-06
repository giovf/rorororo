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

## Workflow
- Use Taskmaster for breaking down work. Before implementing any non-trivial
  feature, check `task-master next` or read `.taskmaster/tasks/tasks.json`.
- Update task status with `task-master set-status --id <id> --status done` as
  you complete each one.
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
