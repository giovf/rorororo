# Schedulers — everything that runs on its own, where, and what it invokes

Maintained by Claude; reviewed whenever a scheduler is added or changed. Times are UTC.
Three kinds of scheduled work exist, each running on different infrastructure:

| Kind | Runs where | Has secrets? | Persists? | Where to look |
| --- | --- | --- | --- | --- |
| **Cloud routines** (Claude agents) | Anthropic's cloud, a fresh sandbox per run that clones `giovf/rorororo`, does the job, pushes, and is discarded | **No** — no `.env`; only the claude.ai connectors attached (Gmail where listed) | Nothing survives a run except what it commits | https://claude.ai/code/routines (each run has a transcript) |
| **GitHub Actions** (scripts) | GitHub-hosted runners | Repo secrets: `CLOUDFLARE_API_TOKEN`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | No | https://github.com/giovf/rorororo/actions |
| **Cloudflare Cron Triggers** (the gankdat Worker itself) | Cloudflare's edge, the deployed `faceless-api` Worker | The Worker's own bindings/secrets | State in D1/KV | Cloudflare dashboard → Workers → faceless-api → Logs; `refresh_log` table |

The interactive Claude session (this devcontainer, the only instance with `.env`) is not
scheduled; it runs when the owner opens Claude Code and executes the `handoff:` lines the
routines leave in `docs/ALERTS.md`.

## Daily timeline

| Time (UTC) | Kind | Name / id | Invokes | Writes |
| --- | --- | --- | --- | --- |
| 05:00 | Cloudflare cron `0 5 * * *` | wave 1 | `scheduled` handler → `refreshAllSources(env, cron)` → KV snapshot sources (planning, tenders, contract awards, sanctions, EU TED, insolvency, companies) | KV snapshots, `refresh_log` |
| 05:15 | Cloudflare cron `15 5 * * *` | wave 2 | D1 sources: sam-exclusions, uk-sponsors | D1 `source_records`, `source_changes`, `refresh_log` |
| 05:30 | Cloudflare cron `30 5 * * *` | wave 3 | uk-charities, uk-care-locations | same |
| 05:45 | Cloudflare cron `45 5 * * *` | wave 4 | uk-food-hygiene (largest) | same |
| 05:50 | Cloudflare cron `50 5 * * *` | wave 5 | uk-schools | same |
| 06:30 | GitHub Actions `gankdat metrics` (`.github/workflows/gankdat-metrics.yml`) | — | `ventures/gankdat/scripts/schedules.mjs reset` (self-heal cron triggers), then `scripts/metrics.mjs` (D1 + Analytics Engine numbers) | commits a `Daily numbers` row to `ventures/gankdat/RESEARCH.md` |
| 07:00 | Cloud routine `trig_01JBrWDAZLeWEAhSBBnA9g8K` **Foundry daily metrics** (Sonnet) | — | reads each `STORE.md`, fetches public store stats (Figma, Chrome, Firefox) | `Daily check` rows in each venture's `RESEARCH.md`; `docs/ALERTS.md` on bad reviews |
| 09:30 | Cloud routine `trig_01P9WT733fg3qnuJeKUHE8fx` **Foundry daily build** (Opus) | — | heals `main` if red, then builds ONE item by `docs/STRATEGY.md` §5 (alert fix, next dataset, research, distribution) behind `npm run check` | one commit to `main`; `handoff:` lines in `docs/ALERTS.md`; a line in `STRATEGY.md` §8 |
| every hour at :05 | Cloud routine `trig_011NfGaSrEEsr5B1xTHEBRAr` **Foundry inbox triage** (Sonnet, Gmail connector) | — | reads unread inbox mail, classifies, drafts customer replies (never sends) | `docs/INBOX.md`, `docs/ALERTS.md` (`needs owner` / listing changes) |

## Weekly and monthly

| When (UTC) | Kind | Name / id | Invokes | Writes |
| --- | --- | --- | --- | --- |
| Monday 07:30 | Cloud routine `trig_01PjxdBAcvYSAT32fCyzcvQg` **Foundry weekly report** (Sonnet) | — | ledger, ventures, metrics deltas, alerts, open actions, git activity | `docs/reports/<year>-W<week>.md` |
| 1st of month 08:00 | Cloud routine `trig_01Mv7z5Ae9gEGq9zBnrfDH6R` **Foundry monthly strategy review** (Sonnet) | — | scores every venture against `docs/STRATEGY.md` (targets, kill criteria), market signals, next three moves | `docs/reviews/<year>-<month>.md`; Claude rewrites `STRATEGY.md` after it |

## Event-driven (not on a clock)

| Trigger | Kind | Workflow | Does |
| --- | --- | --- | --- |
| push to `main` | GitHub Actions `check` | `.github/workflows/check.yml` | full root gate (`npm run check`); a red result is what the daily build fixes first |
| push touching `ventures/gankdat/**` | GitHub Actions `gankdat` | `.github/workflows/gankdat.yml` | gankdat gate, then `wrangler deploy` (resets the Worker's cron triggers to `wrangler.jsonc`), then verifies the deployment via the Workers API |
| push touching `packages/landing/**` | GitHub Actions `landing` | `.github/workflows/landing.yml` | deploys the static site Worker at apps.gankdat.com |
| push touching `packages/landing/site/**` | GitHub Actions `Deploy landing site to GitHub Pages` | `.github/workflows/pages.yml` | legacy github.io copy, kept until store listings switch (action 013) |
| push touching `docs/ALERTS.md` or `docs/for-owner/actions/**` | GitHub Actions `notify owner` | `.github/workflows/notify-owner.yml` → `scripts/notify-owner.mjs` | sends new `owner:` lines and new action files to the owner's Telegram |

## Conventions the schedulers rely on

- `docs/ALERTS.md` line prefixes: `owner:` (sent to the owner's phone), `handoff:` (for the
  next interactive session — needs secrets), `done:` (closed by the interactive session).
- Cron-trigger minute selects the refresh wave (`ventures/gankdat/src/sources/store.ts`
  `WAVE_BY_MINUTE`): 0 → 1, 15 → 2, 30 → 3, 45 → 4, 50 → 5; any other minute → all waves. A
  temporary trigger on one of those minutes forces just that wave (≥ 16 min lead; a deploy or
  the 06:30 self-heal removes it).
- Routines push exactly once, at the end, after the gates; a run killed by a usage limit leaves
  nothing behind (`docs/OPERATIONS.md`, "Interrupted runs").
- Routine ids and prompts are managed with the RemoteTrigger API from the interactive session;
  the owner can pause or delete any routine at https://claude.ai/code/routines.
