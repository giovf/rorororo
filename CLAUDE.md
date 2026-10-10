# Project guidelines for Claude Code

This file is loaded automatically by Claude Code at the start of every session
(both `claude` in the terminal and the IDE extension). Keep it small and
high-signal — it's part of every prompt, so verbosity costs tokens.

## Architecture
- Product/system architecture lives in `docs/ARCHITECTURE.md` (imported
  below). That file tracks the PRD (`.taskmaster/docs/prd.md`); this file is
  conventions and practices only — keep PRD-specific detail out of here.

## Stack
- **Package manager**: npm workspaces (don't switch to pnpm/yarn without asking)
- **Language**: TypeScript 6, strict, NodeNext ESM — `packages/*` shared code,
  `ventures/*` one workspace per product
- **Tooling**: ESLint 10 (typed rules) + Prettier 3 + Vitest 5; Node 22
- **Per-venture frameworks**: WXT (browser extensions), Figma plugin API + esbuild
  (Figma plugins), Astro (landing pages), Hono (small APIs). Pick per venture, note
  it in that venture's `RESEARCH.md`.
- **Commands** (run from repo root):
  - `npm run check` — typecheck + lint + format check + tests; must pass before a
    task is marked done
  - `npm run typecheck` / `npm run build` — `tsc -b` over project references
  - `npm run lint`, `npm run format`, `npm test`, `npm run test:watch`
- **Legacy**: `src/`, `environment/`, `data/`, `requirements.txt`, `.venv/` are a
  prior-art Python crypto project. Reference only — excluded from lint/format, never
  extended.

## Conventions
- All new code in TypeScript with explicit return types on exported functions
- No `any`, no `// @ts-ignore` without a comment explaining why
- Prefer named exports over default exports (enforced by ESLint in
  `packages/`, `ventures/`, `scripts/`; config files are exempt)
- Each package: `tsconfig.json` (editor/lint, includes tests) +
  `tsconfig.build.json` (excludes tests) referenced from the root `tsconfig.json`
- Tests live next to the code as `*.test.ts`; test the core logic, not the UI shell
- Every venture has `venture.json` (validated by `@foundry/core`'s `defineVenture`)
  and `RESEARCH.md` (demand evidence). No venture reaches `validated` without it
- Money in/out is recorded in `docs/LEDGER.md` the day it happens
- UI copy: upgrade prompts state what the user gains, never what is blocked;
  permissions and data use are disclosed on every listing

## Workflow
- **Session start (every interactive session):** `git status` — uncommitted work from a
  cut-off session is finished or discarded, never left; `git fetch --unshallow origin` when
  `git rev-parse --is-shallow-repository` says true (a depth-50 sandbox clone makes a plain
  fast-forward look diverged, 2026-10-10); `git pull --no-rebase`; read
  `docs/OWNER-NOTES.md` (answer new notes in place), `docs/ALERTS.md` (`handoff:` lines are
  yours to execute) and `docs/INBOX.md`; check CI is
  green (`gh run list -L 3`) and fix `main` first if not; `npm run schedules -w @foundry/gankdat`
  to confirm no temporary cron trigger was left armed.
- **Slot start (routines that have a fallback — today the 09:00/17:00 build):** the very first action of
  the run, before `npm ci`, is `npm run slot -- start build`: it pushes a one-line marker so the :20
  fallback and the watchdog can see the slot is in flight (`docs/ops/SLOTS.md`). Burn-down, exchange,
  review and retro runs do not need it. Every build and burn-down run claims its item right after
  `npm run pipeline next` with `npm run pipeline claim <venture>/<id> -- --by=<routine>` (one `doing` push),
  so two sessions never build the same item (2026-10-07).
- **Atomic pushes:** build fully, run the gates, then ONE commit and push. Never push partial
  work "to save progress" — a session can be cut off by usage limits at any moment, and the
  sandbox is discarded, which is safe only if nothing half-done reached `main`.
  `.githooks/pre-push` (armed by `npm ci`) re-checks Prettier, ESLint, the run-log cap and the pipeline files on
  the pushed range, because the edit made after `npm run check` is what turned `main` red three times in two days.
- **Interruptible side effects:** anything that changes live state and must be undone later
  (temporary cron triggers, schedule edits) is restored by CI's daily self-heal if the session
  dies (`ventures/gankdat/scripts/schedules.mjs`). Apply D1 migrations before pushing code that
  needs them, never after.
- Every scheduled job (cloud routines, GitHub Actions, Worker crons) is listed in
  `docs/SCHEDULERS.md`; update it in the same commit as any scheduler change. Routine prompts
  live in `docs/routines/<name>.md` (the stored prompt only reads that file): change the file,
  never file a prompt handoff (README there).
- **Self-expansion is in scope** (owner 2026-09-24): when a blocker repeats, build the general
  fix (a routine, a relay, a watchdog) and queue it in `docs/pipeline/queues/foundry.json`;
  do not wait to be asked. Hosts the sandbox cannot reach: use `docs/relay/` (README there). New or changed CI
  workflows from a routine: write them to `docs/ci/` (README there); the installer moves them.
- **Self-caused mail:** anything you automate that makes a third party email us (publishing, pricing,
  key rotation, DNS, registry submissions) gets a row in `docs/ops/SELF-CAUSED.md` in the same commit;
  triage and the weekly report read it and never escalate a match.
- Work queue of record: `docs/pipeline/` (exchange + one queue per venture, see its README;
  `npm run pipeline` validates and prints the next item). Build the next item, mark it in the
  same commit; an emptied queue gets `needs_research: true`.
- Owner overview: routines append one line per piece of work done to `docs/RUNS.md` (repo log).
  The owner's phone gets ONLY `| notify |` lines — new product version in a store, new product
  live, owner action needed — and `owner:` ALERTS lines; all short, plain, non-technical.
- Plan of record: `docs/STRATEGY.md` (thesis, 90-day targets, prioritisation rule, kill
  criteria). Research before build, distribution before new features, monthly review
  (`docs/reviews/`). Rewrite STRATEGY.md when the facts change; log decisions in its §8.
- The owner has delegated all product and strategy decisions. Decide, log the
  decision (task notes, `RESEARCH.md`, ARCHITECTURE.md), keep going. Batch the rare
  owner-only actions (accounts, payments, keys) into one request per channel.
- Use Taskmaster for breaking down work. Before implementing any non-trivial
  feature, check `task-master next` or read `.taskmaster/tasks/tasks.json`.
- Update task status with `task-master set-status --id <id> --status done` as
  you complete each one. No CLI or MCP (cloud sandboxes): `npm run task -- add|done|list`
  edits `tasks.json` offline (`scripts/taskmaster-add.ts`).
- Don't commit `node_modules/`, `.taskmaster/reports/`, or anything in
  `.gitignore`.

## Things to ask before doing
- Changing the package manager (new dependencies are fine — note them in the
  venture's `RESEARCH.md` or the task)
- Modifying anything inside `.devcontainer/`
- Deploying, publishing, or submitting to any store/registry
- Spending any money (hard cap £100 total — see `docs/LEDGER.md`)
- Anything that puts the owner's identity on a service (account creation, KYC)
- Anything that could breach a platform's ToS or store policy (scraping,
  restricted OAuth scopes, ad injection) — don't do it at all

## Product architecture
**Import the architecture overview; treat as if inlined here.**
@./docs/ARCHITECTURE.md

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md
