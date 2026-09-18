# Setup progress

Tracks `/setup` (see `docs/SETUP.md`). Update after **every** completed step.

## Steps

- [x] Step 0 — Sanity checks
- [x] Step 1 — Get the project scope
- [x] Step 2 — Clarifying interview
- [x] Step 3 — Dev environment deltas
- [x] Step 4 — Scaffold the project
- [x] Step 5 — Write the PRD
- [x] Step 6 — Initialise Taskmaster
- [x] Step 7 — Update always-loaded docs
- [x] Step 8 — Wrap up

## Decisions so far

### Step 0 (2026-09-17)
- Git repo: yes. Branch `feature/data-retrieval-and-manipulation`, main branch `main`.
- Toolchain: node v22.23.1, npm 10.9.8, task-master 0.43.1, gh 2.101.0. All OK.
- **IMPORTANT — this is NOT a blank template.** The template was copied on top of an
  existing Python project. Pre-existing, git-tracked code:
  - `src/` — `data_fetch.py`, `data_loader.py`, `feature_engineering.py`,
    `data_splitter.py`, `verify_data.py`, `main.py`, `test_data_handling.py`
  - `environment/` — `trading_environment.py`, `transaction_costs.py` + tests
  - `data/raw` + `data/processed` — ETHUSDT 1h/12h OHLCV 2023–2024, engineered
    features, train/val/test splits and `.npy` state tensors (large, committed)
  - `requirements.txt` — pandas, numpy, scikit-learn, tensorflow, stable-baselines3,
    backtrader, ccxt, ta-lib, pytest…
  - `.venv/` present; Python 3.12
  - Domain: reinforcement-learning crypto trading system.
- Template files (untracked): `CLAUDE.md`, `docs/`, `.taskmaster/`, `.devcontainer/`,
  `.mcp.json`, `.env.example`, `README.md`, `.claude/`.
- **Conflict raised with user:** template `CLAUDE.md` mandates "TypeScript everywhere";
  the real project is Python. Awaiting the user's decision before Steps 2–4.

### Step 1 (2026-09-17) — in progress
- **User's call on the pre-existing Python code:** it's from an earlier project the user
  was working on, kept because it *may* be useful for where this project is going —
  "may also not be". So: treat it as **prior art / reference only**, not as the project.
  Nothing to be deleted or refactored; stack is **not** pre-committed to Python.
- Stack choice deferred to Step 2, driven by the scope.
- Scope will be provided by the user **as a chat description** (not a file).
- Note: `.venv/` in the repo was created on the macOS host and is broken inside the
  container (`.venv/bin/python` missing). Container has system Python 3.12.3 + pip 24.0,
  no `uv`. Ignore/recreate `.venv` if the project turns out to be Python.
- **Scope received** (saved verbatim to `.taskmaster/docs/scope.md`): "make money, legally;
  direction is Claude's choice; full authority; do not consult; stop only for actions Claude
  strictly cannot perform; small starting capital available on request."
- Operating terms Claude stated back to the user: decisions are Claude's and get logged here /
  in Taskmaster; hard stops only for (1) identity/KYC/accounts/funding, (2) putting real money
  at risk or deploying externally — those need an explicit go; sessions end, so state lives
  in Taskmaster and the next session resumes.
- **Direction chosen by Claude:** systematic (rules-based, not RL) crypto spot-trading system,
  built as a gated pipeline: realistic-cost backtester → strategy research → walk-forward
  validation → paper trading → live only with small capital and hard kill-switches, and only
  if the gates pass. Rationale: the only option that is genuinely autonomous (no customers,
  marketing, or support), reuses the prior-art data pipeline, and can be safely gated.
  Honest caveat recorded: retail systematic crypto has negative expected return after costs
  without a validated edge; the gates exist so capital is not spent on an unproven system.
- Awaiting three facts only the user has: jurisdiction (legality), capital ballpark, existing
  exchange account.

### Step 2 (2026-09-17) — interview answers + pivot
- Jurisdiction: **United Kingdom** (tax resident). Capital: **at most £100**, all at risk.
  Exchange account: none. User's nudge: "there is more than one way to generate income".
- **Trading direction DROPPED.** At £100, exchange fees (~0.26%/side) make any spot strategy
  net pennies per year. Not an income path; the old `src/`/`environment/` code stays as
  prior art only.
- **New direction (Claude's decision): portfolio of low-capital digital products** —
  several small, low-maintenance products sold through marketplaces that provide their own
  distribution (Chrome Web Store $5 one-off, Gumroad / Lemon Squeezy, RapidAPI, VS Code
  Marketplace free, Google Play $25 one-off). Each launch < £10. One shared TypeScript
  monorepo (`packages/` shared, `ventures/<name>/` per product). Concrete first ventures to be
  chosen by **market research** (Step 5 input), not by guess.
- **Payments:** use a merchant-of-record (Lemon Squeezy / Paddle / Gumroad) so EU/UK VAT on
  digital goods is handled by them, not by the user. Stripe direct is a later option.
- **UK compliance notes for the PRD:** £1,000/yr trading allowance — user must register for
  Self Assessment as sole trader once income exceeds it; consumer digital-content rules
  (Consumer Contracts Regs 2013) apply to sales; MoR handles VAT.
- Stack decided: **TypeScript (strict), Node 22, npm workspaces monorepo**, ESLint + Prettier
  + Vitest. Matches the template's own conventions. Per-venture framework chosen at venture
  time (e.g. WXT/Vite for extensions, Astro/Next on free tiers for web).

### Step 3 (2026-09-17)
- Dockerfile: **no changes** (Node 22 + build tools already present) → **no rebuild needed**.
- `devcontainer.json`: name → "Foundry (Claude Code + Taskmaster)"; forwardPorts 3000/4321/5173
  with labels; extensions + vitest.explorer, bradlc.vscode-tailwindcss. Picked up at next
  natural rebuild.
- `.claude/settings.json`: enabled `frontend-design@claude-plugins-official` (UI products).

### Step 4 (2026-09-17)
- Project name: **Foundry**. Scaffolded by hand (no scaffolder): root `package.json` with npm
  workspaces `packages/*`, `ventures/*`; `tsconfig.base.json` (strict, NodeNext, composite);
  `eslint.config.js` (typed rules, named-exports rule, ignores legacy `src/`, `environment/`,
  `data/`); `.prettierrc`, `.editorconfig`, `vitest.config.ts`; `packages/core` with
  `defineVenture()` + tests; `ventures/README.md`.
- Dev deps added (tooling only, per house style): typescript 6, eslint 10, @eslint/js,
  typescript-eslint 8, eslint-config-prettier, prettier 3, vitest 5, @types/node.
- Scripts: typecheck/build (`tsc -b`), lint, format, format:check, test, `check` (all).

### Step 5 (2026-09-17)
- PRD written to `.taskmaster/docs/prd.md` (Foundry: Engine + Venture Pipeline + V1 Figma
  plugin, V2 Chrome extension, V3 web micro-tool; owner-action list; UK compliance; research
  appendix). **Approval: self-approved under the user's "do not consult me" instruction**;
  summary given to the user so they can object.
- Step 4 verified: `npm run check` passes (tsc -b, eslint, prettier, vitest 4/4).
  Lint fixes: root `"type": "module"`; per-package `tsconfig.json` (incl. tests) +
  `tsconfig.build.json`; named-export rule scoped to packages/ventures/scripts;
  `allowDefaultProject: ['vitest.config.ts']`. Prettier scoped to product code only.
  `.gitignore` += `.venv/`, `__pycache__/`, `*.pyc`, `.codegpt/`.

### Step 6 (2026-09-17)
- `task-master init --yes` OK; models: claude-code provider (opus/opus/sonnet) — no keys.
  `projectName` set to Foundry.
- `parse-prd --num-tasks 14` → 14 tasks (1–9 Engine + owner-action request, 10–12 V1 Figma
  plugin discover/build/launch, 13–14 V2 Chrome extension).
- `analyze-complexity` + `expand --all` started (no `--research`: no research key).

### Step 7 (2026-09-17)
- `CLAUDE.md` markers filled (stack, commands, conventions, delegated-decision workflow,
  money/identity/ToS guardrails). `docs/ARCHITECTURE.md` filled. `.env.example` extended
  (MoR, telemetry, Cloudflare, CWS publish vars — all commented out). `README.md` replaced.

### Post-setup work started (2026-09-17) — while `expand --all` runs
- Task 1 done: `packages/core/src/portfolio.ts` (+tests) and `scripts/portfolio.ts`;
  `npm run portfolio` in `check`.
- Task 2 done: `docs/LEDGER.md` (Entries table; kinds cost/planned/revenue), 
  `packages/core/src/ledger.ts` (+tests), `scripts/ledger-check.ts`; `npm run ledger` in
  `check`, fails if cost+planned > £100. First row: planned £3.70 Chrome dev fee.
- Task 9 done: `docs/owner-actions/TEMPLATE.md` + `001-phase0-accounts.md` (Figma account +
  payouts, Chrome dev registration, Lemon Squeezy waitlist; domain deliberately deferred).
- Scripts run on Node 22 type-stripping (`scripts/tsconfig.json` has `erasableSyntaxOnly`,
  `noEmit`; typecheck = `tsc -b && tsc -p scripts`). TS 6 needs `"types": ["node"]` in base.
- Statuses NOT yet set in Taskmaster (tasks.json locked by the running expand) — set 1, 2, 9
  to done once it finishes, then `task-master next` (expect 3 or 10).
- Task 10 (V1 Figma discovery) research started.

### Steps 6 + 8 complete (2026-09-17)
- `expand --all` done: 14 tasks, 66 subtasks. Tasks 1, 2, 9 marked done. `task-master next`
  → #3 (licensing core). Critical path chosen: #10 V1 discovery next, #3 in parallel.
- Figma paid-plugin eligibility verified (open to all with Stripe; UK supported).
- Setup machinery (`docs/SETUP.md`, this file, `.claude/commands/setup.md`, post-create
  banner) left in place — delete only on the owner's say-so.
- Committed locally on `feature/data-retrieval-and-manipulation` (not pushed).

### 2026-09-17 late — landing site live
- `gh auth login` done by owner (user giovf). Branch pushed. GitHub Pages enabled via API
  (build_type=workflow); workflow run succeeded; https://giovf.github.io/rorororo/ returns 200.
- Owner guidance given: Chrome trader status = **Trader**. Lemon Squeezy URL = the Pages URL.
- Support email published: info@gankdat.com (2026-09-18). Pages env restricts deploys to `main`; feature branch added to its branch policy via API.
- 2026-09-18: owner completed Figma + Chrome accounts. MoR decision: Stripe Managed Payments (LS redirected). PRD/ARCHITECTURE/.env.example/owner-actions updated. Tasks 3/4 (licensing) will target Stripe webhooks + self-issued Ed25519 keys.
- 2026-09-18 (later): V1 = Variables Toolkit, **validated** (57 rival comments harvested; gaps
  documented in RESEARCH.md §5). Plugin implements link (colours + numbers, chunked scan,
  cancel, hidden/instance switches, daily free tier via clientStorage), styles→variables
  (colour free; text/effect paid), hygiene (unused/duplicates/broken; delete paid). 39 tests.
  Owner-action #2 (Figma desktop test) is READY. Task 3 (licensing) done. Tasks 10 done; 11
  in progress (11.7 manual test pending).
