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
| 09:20 **and 17:20** | Cloud routine `trig_01GraXN5FPXmq5M9wJSYYeHN` **Foundry build fallback** (Opus 5; owner rule 2026-09-28: low-complexity items only) | — | stops if the Fable build left a `| build |` line or a `(build)` commit in the last 2 h — since 2026-09-30 that includes the build's **start marker** (`npm run slot -- start build`, commit `build: slot … started (build)` at ~:03, before its 20-40 min run), which is what closes the 6-9 min race window of 2026-09-29/30; `npm run slot -- check build` prints `running`, `done` or `missed` for the same question; otherwise takes `npm run pipeline -- next --max-effort=0.3` and builds it | one commit `(fallback)`, `| fallback |` lines in `docs/RUNS.md` |
| every hour at :20 **and on every push to `main`** | GitHub Actions `owner notes` (`.github/workflows/owner-notes.yml`) | — | `scripts/owner-notes.mjs`: pulls messages the owner sent to the Telegram bot | appends to `docs/OWNER-NOTES.md` (read by every routine; the build routine answers in place) |
| 06:30 **and on pushes to `main`** (push runs only fill a missing day) | GitHub Actions `gankdat metrics` (`.github/workflows/gankdat-metrics.yml`) | — | `ventures/gankdat/scripts/schedules.mjs reset` (self-heal cron triggers), then `scripts/metrics.mjs` (D1 + Analytics Engine numbers, plus Apify actor runs/users via `APIFY_TOKEN` — optional, the row degrades to `apify: n/a`), then `scripts/refresh-errors-to-queue.ts` (2026-09-30: a source in `refresh errors` today and yesterday gets an idempotent `refresh-<slug>` todo item, score 6, in the gankdat queue — uk-insolvency had errored four days with no item) | commits a `Daily numbers` row to `ventures/gankdat/RESEARCH.md` and, when a source repeats, `docs/pipeline/queues/gankdat.json` |
| 06:45 **and on pushes to `main`** (push runs only fill a missing day) | GitHub Actions `store metrics` (`.github/workflows/store-metrics.yml`; drafted 2026-09-30 burn-down under `docs/ci/`, the installer moves it) | — | `scripts/store-metrics.ts`: for every `ventures/*/STORE.md` reads the listing URLs and fetches the public source from the runner (Chrome Web Store detail page — "Add to Chrome" = live, users, rating; AMO add-on API — `status: public`, `average_daily_users`, `weekly_downloads`, ratings; Figma versions API — `approved_public`, install/like/view/run/purchase counts); a STORE.md still saying `not live yet` for a channel whose page answers is flipped with the date. Built because the 07:00 routine's sandbox cannot reach the stores and wrote `not live yet` for ten days of live listings | commits a `Daily check` row per venture (`store-metrics: <date> daily check`; not the 07:00 routine's `metrics: ` trace, so the watchdog still watches that slot) |
| 07:00 | Cloud routine `trig_01JBrWDAZLeWEAhSBBnA9g8K` **Foundry daily metrics** (Sonnet) | — | reads each venture's `Daily check` row of the day (written by `store metrics` at 06:45; since 2026-09-30 the routine no longer needs to reach the stores, which its sandbox cannot), Figma comments via the relay, STORE.md | `Daily check` rows only where the 06:45 job left none; `docs/ALERTS.md` on bad reviews (live prompt still fetches itself — sentence pending the 2026-09-30 handoff) |
| 09:00 **and 17:00** (10:00 and 18:00 UK time) | Cloud routine `trig_01P9WT733fg3qnuJeKUHE8fx` **Foundry daily build** (Fable, twice daily since 2026-09-22) | — | **first pushes its start marker** (`npm run slot -- start build`: one line in `docs/ops/SLOTS.md`, commit subject `build: slot YYYY-MM-DD HH:MM UTC started (build)`, so the :20 fallback sees the slot is taken — CLAUDE.md rule 2026-09-30; the prompt sentence rides the ALERTS handoff), heals `main` if red, then takes `npm run pipeline next` (the highest-scoring item across open venture queues, `docs/pipeline/`) and builds it behind `npm run check`; if any open queue needs research it researches that venture instead (≥ 3 scored items or `finished`) | one commit to `main` including the queue change; `handoff:` lines in `docs/ALERTS.md`; a line in `STRATEGY.md` §8 |
| every hour at :40 **and on every push to `main`** | GitHub Actions `run watchdog` (`.github/workflows/run-watchdog.yml`; drafted 2026-09-25 under `docs/ci/`, installed 2026-09-28 by the interactive session) | — | `scripts/run-watchdog.ts`: for every routine slot in this file (metrics 07:00, build 09:00/17:00, exchange Wed 08:00, review Sun 08:00, report Mon 07:30, burn-down Wed 18:00, retro Sat 07:59) checks that a trace exists within 2 h — a `docs/RUNS.md` line with the routine's tag or a commit with its subject (`(build)`, `metrics: ` — not `store-metrics: `, which is the 06:45 job, `(venture exchange)`, `retro: ` …); a start-marker commit (`… started (build)`) is never the trace: a slot that stamped `docs/ops/SLOTS.md` and then died is reported as `stalled:` instead of `missed:` (2026-09-30); triage is not watched (it commits only when there is mail). The slot list is `ROUTINES` in the script — change it in the same commit as any routine slot here | appends one `- … \| watchdog \| missed: <routine> slot <when> UTC …` line per silent slot to `docs/RUNS.md` (the line is the dedupe record; `notify owner` sends it as a bullet) |
| every hour at :05 | Cloud routine `trig_011NfGaSrEEsr5B1xTHEBRAr` **Foundry inbox triage** (Sonnet, Gmail connector) | — | reads unread inbox mail — `in:inbox is:unread` with no age window since 2026-09-30, oldest first, 30 threads a run, so a missed slot delays mail instead of losing it — classifies (checking `docs/ops/SELF-CAUSED.md` first — mail our own automation triggered is logged, never escalated; prompt mirror `docs/routines/inbox-triage.md`, sentences added 2026-09-29 and 2026-09-30, live prompt pending the one handoff that carries both), drafts customer replies (never sends) | `docs/INBOX.md`, `docs/ALERTS.md` (`needs owner` / listing changes) |

## Weekly

| When (UTC) | Kind | Name / id | Invokes | Writes |
| --- | --- | --- | --- | --- |
| Sunday 08:00 | Cloud routine `trig_01Mv7z5Ae9gEGq9zBnrfDH6R` **Foundry strategy review** (Fable; weekly since 2026-09-22, was monthly) | — | scores every venture against `docs/STRATEGY.md` (targets, kill criteria), market signals, next three moves; may mark a venture queue `finished` or re-park/promote exchange ideas | `docs/reviews/<year>-W<week>.md`; edits under `docs/pipeline/` |
| Monday 07:30 | Cloud routine `trig_01PjxdBAcvYSAT32fCyzcvQg` **Foundry weekly report** (Sonnet) | — | ledger, ventures, metrics deltas, alerts (self-caused notices per `docs/ops/SELF-CAUSED.md` counted, never a next step; prompt mirror `docs/routines/weekly-report.md`, sentence added 2026-09-29, live prompt pending the handoff), open actions, git activity | `docs/reports/<year>-W<week>.md` |
| Wednesday 18:00–23:00 and Thursday 00:00–02:00, hourly | Cloud routines `trig_011mbqaUzm3qTK2ZdevCuYpH` (Wed) + `trig_013tLPWgysoiHWpciYGgXJQ2` (Thu) **Foundry Wednesday burn-down** (Fable; created 2026-09-24; the owner's Fable allowance resets Thursday 03:00 UTC) | — | same loop as the build routine but back to back: item → gate → commit → push, repeat until nothing is buildable, ~50 min elapsed, or the usage limit cuts the session (harmless: one commit per finished item). Spends the allowance left before the owner's Thursday reset | commits to `main`, `docs/RUNS.md` lines tagged `burn-down` |
| Saturday 07:59 (enabled 2026-09-28: repo attached, Sonnet) | Cloud routine `trig_015Uvn63XZUVqx1TAiWZrZL6` **Foundry ops retro** (created by the build routine with `create_trigger`; that tool sets no repository source, so its validation firing, session `cse_01FzQ9gN1R2KVqFD6hTCvva6`, stalled in "requires action" with 0 tokens used; the model resolved to Sonnet by itself. The interactive session attaches `giovf/rorororo` to the routine (routines UI or the RemoteTrigger HTTP API, as for every other routine) and enables it, or recreates it from the mirrored prompt at `docs/routines/ops-retro.md`; handoff in ALERTS.md 2026-09-26) | — | audits the operation itself over the last 7 days against this file: slot reliability (traced / missed / pushed nothing), pipeline throughput, blockers grouped by cause (a cause seen twice is a repeat → a general fix), defects in the routines (datasets shipped blind that errored, red CI after a push, wrong RUNS shape, stale handoffs, prompt sentences events contradicted), owner load; checks what became of the previous retro's proposals. Proposes fixes (prompt sentences quoted verbatim, scripts, CI jobs, relay hosts, schedule changes); never more Fable runs, never owner actions | `docs/retros/<year>-W<week>.md`; proposals scoring ≥ 4 become `todo` items in `docs/pipeline/queues/foundry.json` (evidence added to an existing item instead of a duplicate); `docs/RUNS.md` lines tagged `retro`; commit `retro: <year>-W<week> ops` |
| Wednesday 08:00 | Cloud routine `trig_01CaSyBqwyKVL6NiPqPzhM8L` **Foundry venture exchange** (Fable; created 2026-09-22) | — | market research over `docs/pipeline/exchange.json` and fresh candidates; opens a NEW venture queue (folder, `venture.json` idea, `RESEARCH.md`, scored items) or reopens/extends an existing one when enhancing scores higher | new files under `ventures/<slug>/` and `docs/pipeline/`; `STRATEGY.md` §8 line |

## Event-driven (not on a clock)

| Trigger | Kind | Workflow | Does |
| --- | --- | --- | --- |
| push to `main` | GitHub Actions `check` | `.github/workflows/check.yml` | full root gate (`npm run check`); a red result is what the daily build fixes first |
| push touching `ventures/gankdat/**` | GitHub Actions `gankdat` | `.github/workflows/gankdat.yml` | gankdat gate, D1 migrations, then `wrangler deploy` (resets the Worker's cron triggers to `wrangler.jsonc`), then verifies the deployment via the Workers API |
| push touching `ventures/gankdat/apify/**` or `server.json`, **and daily 04:00** (publish only) | GitHub Actions `gankdat publish` | `.github/workflows/gankdat-publish.yml` → `scripts/publish-actors.mjs`, `scripts/registry-publish.sh` | pushes changed Apify actors (changed = the whole push range from a full-depth checkout, 2026-09-30; before that a two-commit push would have crashed the job), prices every actor and makes at most 5 public per run (Apify: 5 publications / 24 h per organisation, support 2026-09-28), publishes the MCP registry entry when `server.json` is newer. **The keys live in CI, not in any Claude sandbox** — this is what makes the daily build fully autonomous |
| push touching `docs/ci/**` | GitHub Actions `workflow installer` | `.github/workflows/workflow-installer.yml` (uses the owner's `WORKFLOW_TOKEN`) | moves `docs/ci/*.yml` into `.github/workflows/` and pushes — how routines add or change CI jobs without the `workflow` scope |
| push touching `docs/relay/requests/**` | GitHub Actions `fetch relay` | `.github/workflows/fetch-relay.yml` → `scripts/fetch-relay.mjs` | fetches the listed URLs (allowlisted public hosts) from the runner and commits the responses under `docs/relay/responses/<name>/` — how routines read hosts their sandbox cannot reach |
| push touching `packages/landing/**` | GitHub Actions `landing` | `.github/workflows/landing.yml` | deploys the static site Worker at apps.gankdat.com |
| push touching `packages/landing/site/**` | GitHub Actions `Deploy landing site to GitHub Pages` | `.github/workflows/pages.yml` | legacy github.io copy, kept until store listings switch (action 013) |
| push touching `docs/ALERTS.md`, `docs/RUNS.md` or `docs/for-owner/actions/**` | GitHub Actions `notify owner` | `.github/workflows/notify-owner.yml` → `scripts/notify-owner.mjs` | sends new `owner:` lines and new action files ("Foundry needs you") and new `docs/RUNS.md` lines ("Foundry run", one bullet per line) to the owner's Telegram. Diffs the whole push (`github.event.before..sha`) from a full-depth checkout since 2026-09-30 — a two-commit push crashed the depth-2 job and lost four bullets (run 63); an unresolvable range falls back to the last commit |

## Conventions the schedulers rely on

- `docs/RUNS.md`: build, exchange, review, report and retro routines append one line per piece of
  work done at the end of every run (`- YYYY-MM-DD HH:MM | <routine> | <text>`); each new line
  reaches the owner's phone as a bullet. Triage and metrics do not post there (hourly/daily noise).
- **Slot start markers** (`docs/ops/SLOTS.md`, 2026-09-30): a routine that has a fallback (today: the
  09:00/17:00 build) runs `npm run slot -- start <routine>` as its very first push, before `npm ci`; the
  marker commit is the trace the fallback stops on and the watchdog reads it to tell `stalled` from
  `missed`. The file is not sent to the owner (only RUNS.md and ALERTS.md are). Trade-off accepted: a
  build that stamps and then dies loses its slot to nobody until the watchdog's 2 h `stalled:` line.
- **Routine prompts of record** (`docs/routines/<name>.md`, 2026-09-30): each stored prompt is a three-line bootstrap that
  clones `main` and reads its file, so a prompt change is a commit to that file in the same commit as the work that needs it
  (the README there has the bootstrap text, the trigger ids and which prompts are swapped). Until a routine is swapped its
  file is a mirror and the edit rides a `handoff:` line.
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
- **Self-caused mail** (`docs/ops/SELF-CAUSED.md`, 2026-09-29): every scheduler above that makes a third
  party email us (Apify pricing/publish, MCP registry, DMARC, CI runs) has a row there; a new one gets
  its row in the same commit. Routine prompts created via the HTTP API cannot be edited by agents
  (`update_trigger` refuses them); their mirrors under `docs/routines/` carry the exact text for the
  interactive session.
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
  seconds of starting, and the `run
  watchdog` job's `missed:` bullet on the owner's phone within 2 h of the silent slot; the owner sees the real figure with `/usage` in
  Claude Code. The
  Wednesday burn-down is designed to be cut off: each item is one commit, pushed as soon as its
  gate passes, so a cut leaves nothing half-done.
- **Every routine slot is watched** (since 2026-09-28): a routine's trace is its tagged `docs/RUNS.md` line (build,
  exchange, review, report, burn-down, retro) or, for the metrics routine, its `metrics: <date> daily
  check` commit. A slot with neither within 2 h becomes a `watchdog | missed:` line in RUNS.md and
  a Telegram bullet (`.github/workflows/run-watchdog.yml`). Keep the tags and commit subjects
  stable, or update `ROUTINES` in `scripts/run-watchdog.ts` in the same commit.
- **Routines add or change workflows through `docs/ci/`**: both the git token and the GitHub API
  token a cloud routine holds lack the `workflow` scope (2026-09-25), so a routine writes the job to
  `docs/ci/<name>.yml` and the `workflow installer` (owner's `WORKFLOW_TOKEN`, live 2026-09-28) moves it
  into `.github/workflows/` on the next push — no handoff (`docs/ci/README.md`).
- Routines push exactly once, at the end, after the gates; a run killed by a usage limit leaves
  nothing behind (`docs/OPERATIONS.md`, "Interrupted runs").
- Routine ids and prompts are managed with the RemoteTrigger API from the interactive session.
  **A routine cannot create a working routine** (2026-09-26): the `create_trigger` tool in the
  Claude_Code_Remote connector takes a cron and a prompt but sets no repository source, model or
  connectors, so a routine it creates starts a session with nothing checked out and stalls in
  "requires action". A routine that needs a new routine therefore writes the prompt to
  `docs/routines/<name>.md`, may create the trigger disabled so the id exists, and files a
  `handoff:` for the interactive session to attach the repo and enable it. The owner can pause or
  delete any routine at https://claude.ai/code/routines.
- **The ops retro closes the loop on this file**: every Saturday it audits each slot listed here,
  so a scheduler change that is not recorded here shows up as a defect in the next retro.
