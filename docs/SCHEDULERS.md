# Schedulers — everything that runs on its own, where, and what it invokes

Maintained by Claude; reviewed whenever a scheduler is added or changed. Times are UTC.
Three kinds of scheduled work exist, each running on different infrastructure:

| Kind | Runs where | Has secrets? | Persists? | Where to look |
| --- | --- | --- | --- | --- |
| **Cloud routines** (Claude agents) | Anthropic's cloud, a fresh sandbox per run that clones `giovf/rorororo`, does the job, pushes, and is discarded | **No** — no `.env`; only the claude.ai connectors attached (Gmail where listed) | Nothing survives a run except what it commits | https://claude.ai/code/routines (each run has a transcript) |
| **GitHub Actions** (scripts) | GitHub-hosted runners | Repo secrets: `CLOUDFLARE_API_TOKEN`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | No | https://github.com/giovf/rorororo/actions |
| **Cloudflare Cron Triggers** (the gankdat Worker itself) | Cloudflare's edge, the deployed `faceless-api` Worker | The Worker's own bindings/secrets | State in D1/KV | Cloudflare dashboard → Workers → faceless-api → Logs; `refresh_log` table |

The interactive Claude session (this devcontainer, the only instance with `.env`) is not
scheduled; it runs when the owner opens Claude Code. Since 2026-09-21 the daily build no longer
depends on it: publishing, registry updates and migrations run in CI after each push. The
interactive session handles what is left (Stripe, DNS, accounts) via `handoff:` lines, and the
owner leaves notes for every agent by messaging the Telegram bot (`docs/OWNER-NOTES.md`).

## Daily timeline

| Time (UTC) | Kind | Name / id | Invokes | Writes |
| --- | --- | --- | --- | --- |
| 05:00 | Cloudflare cron `0 5 * * *` | wave 1 | `scheduled` handler → `refreshAllSources(env, cron)` → KV snapshot sources (planning, tenders, contract awards, sanctions, EU TED, insolvency, companies) | KV snapshots, `refresh_log` |
| 05:15 | Cloudflare cron `15 5 * * *` | wave 2 | D1 sources: sam-exclusions, uk-sponsors, uk-gambling-operators (added 2026-09-24, ~15k rows, five small CSVs) | D1 `source_records`, `source_changes`, `refresh_log` |
| 05:30 | Cloudflare cron `30 5 * * *` | wave 3 | uk-charities, uk-care-locations | same |
| 05:45 | Cloudflare cron `45 5 * * *` | wave 4 | uk-food-hygiene (largest) | same |
| 05:50 | Cloudflare cron `50 5 * * *` | wave 5 | uk-schools | same |
| 05:55 | Cloudflare cron `55 5 * * *` | wave 6 | nhs-ods (added 2026-09-22) | same |
| 06:05 | Cloudflare cron `5 6 * * *` | wave 7 | uk-trademark-journal (added 2026-09-23): downloads at most 4 new weekly journal issues into KV, rebuilds the 52-issue window in D1 | same, plus KV `tmj:issue:*` / `tmj:missing:*` |
| every hour at :20 **and on every push to `main`** | GitHub Actions `owner notes` (`.github/workflows/owner-notes.yml`) | — | `scripts/owner-notes.mjs`: pulls messages the owner sent to the Telegram bot | appends to `docs/OWNER-NOTES.md` (read by every routine; the build routine answers in place) |
| 06:30 **and on pushes to `main`** (push runs only fill a missing day) | GitHub Actions `gankdat metrics` (`.github/workflows/gankdat-metrics.yml`) | — | `ventures/gankdat/scripts/schedules.mjs reset` (self-heal cron triggers), then `scripts/metrics.mjs` (D1 + Analytics Engine numbers) | commits a `Daily numbers` row to `ventures/gankdat/RESEARCH.md` |
| 07:00 | Cloud routine `trig_01JBrWDAZLeWEAhSBBnA9g8K` **Foundry daily metrics** (Sonnet) | — | reads each `STORE.md`, fetches public store stats (Figma, Chrome, Firefox) | `Daily check` rows in each venture's `RESEARCH.md`; `docs/ALERTS.md` on bad reviews |
| 09:00 **and 17:00** (10:00 and 18:00 UK time) | Cloud routine `trig_01P9WT733fg3qnuJeKUHE8fx` **Foundry daily build** (Fable, twice daily since 2026-09-22) | — | heals `main` if red, then takes `npm run pipeline next` (the highest-scoring item across open venture queues, `docs/pipeline/`) and builds it behind `npm run check`; if any open queue needs research it researches that venture instead (≥ 3 scored items or `finished`) | one commit to `main` including the queue change; `handoff:` lines in `docs/ALERTS.md`; a line in `STRATEGY.md` §8 |
| every hour at :40 **and on every push to `main`** — **drafted, not yet active** | GitHub Actions `run watchdog` (draft at `docs/ci/run-watchdog.yml`, 2026-09-25; routine tokens lack the `workflow` scope, so the interactive session moves it to `.github/workflows/`) | — | `scripts/run-watchdog.ts`: for every routine slot in this file (metrics 07:00, build 09:00/17:00, exchange Wed 08:00, review Sun 08:00, report Mon 07:30, burn-down Wed 18:00) checks that a trace exists within 2 h — a `docs/RUNS.md` line with the routine's tag or a commit with its subject (`(build)`, `metrics: `, `(venture exchange)` …); triage is not watched (it commits only when there is mail). The slot list is `ROUTINES` in the script — change it in the same commit as any routine slot here | appends one `- … \| watchdog \| missed: <routine> slot <when> UTC …` line per silent slot to `docs/RUNS.md` (the line is the dedupe record; `notify owner` sends it as a bullet) |
| every hour at :05 | Cloud routine `trig_011NfGaSrEEsr5B1xTHEBRAr` **Foundry inbox triage** (Sonnet, Gmail connector) | — | reads unread inbox mail, classifies, drafts customer replies (never sends) | `docs/INBOX.md`, `docs/ALERTS.md` (`needs owner` / listing changes) |

## Weekly

| When (UTC) | Kind | Name / id | Invokes | Writes |
| --- | --- | --- | --- | --- |
| Sunday 08:00 | Cloud routine `trig_01Mv7z5Ae9gEGq9zBnrfDH6R` **Foundry strategy review** (Fable; weekly since 2026-09-22, was monthly) | — | scores every venture against `docs/STRATEGY.md` (targets, kill criteria), market signals, next three moves; may mark a venture queue `finished` or re-park/promote exchange ideas | `docs/reviews/<year>-W<week>.md`; edits under `docs/pipeline/` |
| Monday 07:30 | Cloud routine `trig_01PjxdBAcvYSAT32fCyzcvQg` **Foundry weekly report** (Sonnet) | — | ledger, ventures, metrics deltas, alerts, open actions, git activity | `docs/reports/<year>-W<week>.md` |
| Wednesday 18:00–23:00 and Thursday 00:00–02:00, hourly | Cloud routines `trig_011mbqaUzm3qTK2ZdevCuYpH` (Wed) + `trig_013tLPWgysoiHWpciYGgXJQ2` (Thu) **Foundry Wednesday burn-down** (Fable; created 2026-09-24; the owner's Fable allowance resets Thursday 03:00 UTC) | — | same loop as the build routine but back to back: item → gate → commit → push, repeat until nothing is buildable, ~50 min elapsed, or the usage limit cuts the session (harmless: one commit per finished item). Spends the allowance left before the owner's Thursday reset | commits to `main`, `docs/RUNS.md` lines tagged `burn-down` |
| Wednesday 08:00 | Cloud routine `trig_01CaSyBqwyKVL6NiPqPzhM8L` **Foundry venture exchange** (Fable; created 2026-09-22) | — | market research over `docs/pipeline/exchange.json` and fresh candidates; opens a NEW venture queue (folder, `venture.json` idea, `RESEARCH.md`, scored items) or reopens/extends an existing one when enhancing scores higher | new files under `ventures/<slug>/` and `docs/pipeline/`; `STRATEGY.md` §8 line |

## Event-driven (not on a clock)

| Trigger | Kind | Workflow | Does |
| --- | --- | --- | --- |
| push to `main` | GitHub Actions `check` | `.github/workflows/check.yml` | full root gate (`npm run check`); a red result is what the daily build fixes first |
| push touching `ventures/gankdat/**` | GitHub Actions `gankdat` | `.github/workflows/gankdat.yml` | gankdat gate, D1 migrations, then `wrangler deploy` (resets the Worker's cron triggers to `wrangler.jsonc`), then verifies the deployment via the Workers API |
| push touching `ventures/gankdat/apify/**` or `server.json` | GitHub Actions `gankdat publish` | `.github/workflows/gankdat-publish.yml` → `scripts/publish-actors.mjs`, `scripts/registry-publish.sh` | pushes changed Apify actors, prices and publishes every actor on the account, publishes the MCP registry entry when `server.json` is newer. **The keys live in CI, not in any Claude sandbox** — this is what makes the daily build fully autonomous |
| push touching `docs/relay/requests/**` | GitHub Actions `fetch relay` | `.github/workflows/fetch-relay.yml` → `scripts/fetch-relay.mjs` | fetches the listed URLs (allowlisted public hosts) from the runner and commits the responses under `docs/relay/responses/<name>/` — how routines read hosts their sandbox cannot reach |
| push touching `packages/landing/**` | GitHub Actions `landing` | `.github/workflows/landing.yml` | deploys the static site Worker at apps.gankdat.com |
| push touching `packages/landing/site/**` | GitHub Actions `Deploy landing site to GitHub Pages` | `.github/workflows/pages.yml` | legacy github.io copy, kept until store listings switch (action 013) |
| push touching `docs/ALERTS.md`, `docs/RUNS.md` or `docs/for-owner/actions/**` | GitHub Actions `notify owner` | `.github/workflows/notify-owner.yml` → `scripts/notify-owner.mjs` | sends new `owner:` lines and new action files ("Foundry needs you") and new `docs/RUNS.md` lines ("Foundry run", one bullet per line) to the owner's Telegram |

## Conventions the schedulers rely on

- `docs/RUNS.md`: build, exchange, review and report routines append one line per piece of
  work done at the end of every run (`- YYYY-MM-DD HH:MM | <routine> | <text>`); each new line
  reaches the owner's phone as a bullet. Triage and metrics do not post there (hourly/daily noise).
- `docs/ALERTS.md` line prefixes: `owner:` (sent to the owner's phone), `handoff:` (for the
  next interactive session — needs secrets), `done:` (closed by the interactive session).
- `needs owner` (in `docs/INBOX.md`) is reserved for things only the owner can do (account
  clicks under their identity, payments, identity checks, refund/complaint/deletion requests) and
  must be paired with an `owner:` line in ALERTS.md, otherwise nothing reaches the phone. CI
  "Run failed" mail is never owner work: the next push or the daily build heals `main`
  (triage prompt updated 2026-09-21).
- Cron-trigger minute selects the refresh wave (`ventures/gankdat/src/sources/store.ts`
  `WAVE_BY_MINUTE`): 0 → 1, 15 → 2, 30 → 3, 45 → 4, 50 → 5, 55 → 6, 5 → 7; any other minute → all waves. A
  temporary trigger on one of those minutes forces just that wave (≥ 16 min lead; a deploy or
  the 06:30 self-heal removes it).
- **GitHub's cron is best-effort**: overnight 2026-09-21/22 the hourly job fired 3 times in 14
  hours and the 06:30 job not at all. Anything time-sensitive on GitHub Actions therefore also
  triggers on `push` to `main` (routines push several times a day). Cloud routines and
  Cloudflare crons fired on time every slot.
- **Stale sandbox clone**: a routine's sandbox once started with local `main` at the repo's
  initial commit and `git pull` refused to merge; the auto-mode classifier then blocked the
  reset and the run stalled (2026-09-22 04:05 triage). Every routine prompt now says: do not
  reset/force, `git switch -c work origin/main`, push `HEAD:main`.
- **Usage limit**: no routine can read the owner's remaining allowance. Evidence so far: the
  Wednesday 2026-09-23 17:09 build was rejected at start (`rate_limit: rejected
  (seven_day_overage_included) resets_at=Thu 03:00 UTC`) — the week's Fable allowance was gone
  before the burn-down window, so under the current cadence (2 builds/day + exchange + review
  + interactive sessions on Fable) there may be nothing left to burn on Wednesdays. The signals are a
  `rate_limit_event` in a run's log (`RemoteTrigger get_run_log`), a run that ends within
  seconds of starting, and — once `docs/ci/run-watchdog.yml` is moved into `.github/workflows/` — the `run
  watchdog` job's `missed:` bullet on the owner's phone within 2 h of the silent slot; the owner sees the real figure with `/usage` in
  Claude Code. The
  Wednesday burn-down is designed to be cut off: each item is one commit, pushed as soon as its
  gate passes, so a cut leaves nothing half-done.
- **Every routine slot is watched** (once the drafted job is active): a routine's trace is its tagged `docs/RUNS.md` line (build,
  exchange, review, report, burn-down) or, for the metrics routine, its `metrics: <date> daily
  check` commit. A slot with neither within 2 h becomes a `watchdog | missed:` line in RUNS.md and
  a Telegram bullet (`docs/ci/run-watchdog.yml`). Keep the tags and commit subjects
  stable, or update `ROUTINES` in `scripts/run-watchdog.ts` in the same commit.
- **Routines cannot add or change workflows**: both the git token and the GitHub API token a cloud
  routine holds lack the `workflow` scope (2026-09-25). A routine that needs a new GitHub Actions job
  drafts it under `docs/ci/` and files a `handoff:`; the general fix is the `workflow-scope` item in
  `docs/pipeline/queues/foundry.json`.
- Routines push exactly once, at the end, after the gates; a run killed by a usage limit leaves
  nothing behind (`docs/OPERATIONS.md`, "Interrupted runs").
- Routine ids and prompts are managed with the RemoteTrigger API from the interactive session;
  the owner can pause or delete any routine at https://claude.ai/code/routines.
