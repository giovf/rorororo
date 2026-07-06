# faceless-api

A niche data API sold on usage-based pricing to **human developers** (self-serve
Stripe billing) and **AI agents** (MCP server + x402 USDC micropayments). v1
ships UK public-sector open data — planning applications and procurement
notices, normalized to clean JSON — behind a swappable data-source layer, so
the dataset can pivot without touching the platform (auth, metering, billing,
MCP, x402, docs).

Built with TypeScript (strict) + [Hono](https://hono.dev) on Cloudflare
Workers. Storage: Workers KV + D1. Data refresh: Cron Triggers. Everything is
designed for solo, near-zero-touch operation.

## Running it

```bash
npm install
npm run dev        # wrangler dev → http://localhost:8787
```

Other scripts: `npm run build` (dry-run deploy), `npm run lint`,
`npm run typecheck`, `npm test`, `npm run format`, `npm run deploy` (real
deploy — needs a Cloudflare account), `npm run cf-typegen` (regenerate binding
types after editing `wrangler.jsonc`).

Local secrets (Stripe test keys etc.) go in `.dev.vars` — see the documented
variable list in `.env.example`.

## Dev container

Open the folder in VS Code and choose **"Reopen in Container"** — you get
Node 22, Claude Code, and Taskmaster preinstalled, with per-project volumes
for auth, `node_modules`, and shell history. Port 8787 is forwarded.

## Project docs

- `docs/ARCHITECTURE.md` — the stable architecture summary
- `.taskmaster/docs/prd.md` — the approved PRD; backlog in `.taskmaster/tasks/`
- `.taskmaster/docs/scope.md` + `niche-analysis.md` — business rationale
- Daily loop: `task-master next` → implement → `task-master set-status
  --id <id> --status done`
