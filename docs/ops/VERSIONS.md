# Pinned versions — what the schedulers depend on and how each stays current

Owner 2026-10-16: "check that schedulers with dependencies have their versions maintained over
time automatically — we don't want to be using outdated Claude models." This is the register.
`scripts/versions-check.ts` (daily in the `gankdat metrics` job since 2026-11-13, monthly `versions` workflow
as the fallback, `npm run versions` by hand) reads the **Model roles** table and the **Node** row below and
compares them with the public sources named.

| What | Pinned | Where | Source of truth | Kept current by |
| --- | --- | --- | --- | --- |
| Claude models of the cloud routines | see **Model roles** below | cloud routine configs (`docs/routines/README.md`) | https://platform.claude.com/docs/en/about-claude/models/overview | daily check → `handoff: models:` line → a build slot probes the new id → the owner picks it on the routines page → a build slot reads it back and records it |
| Claude Code CLI inside a routine's container | platform-managed (`2.1.323` on 2026-11-13) | `get_session` → `external_metadata.container_cc_version` | the platform | nothing to do: the platform updates it; no pin of ours exists |
| Node on GitHub runners | `24` | `.github/workflows/*.yml` (`node-version`) | https://nodejs.org/dist/index.json (active LTS) | daily check → handoff; the repo moves one LTS at a time |
| npm packages (hono, wrangler, vitest, playwright, …) | `package-lock.json` | root | npm registry | Dependabot monthly, grouped; minor/patch auto-merged when the gate is green (`dependabot` workflow), majors reviewed and merged — or closed with a lift condition — by the burn-down within 7 days (2026-10-24, foundry `dependabot-majors-review-by-routine`); a red gate files foundry `dependabot-pr-<N>` and a `watchdog | dependabot:` line within 6 h (`scripts/dependabot-gate.ts`, 2026-10-18) |
| GitHub Actions (`actions/checkout`, `setup-node`, `upload-artifact`) | per workflow | `.github/workflows/*.yml` | GitHub | Dependabot monthly, grouped, same merge rule |
| Playwright Chromium | `npx playwright install` at run time | demo video / media jobs | Playwright | follows the `playwright` package version |
| Cloudflare Worker compatibility dates | `wrangler.jsonc` per Worker | gankdat, landing, license-worker | https://developers.cloudflare.com/workers/configuration/compatibility-dates/ | reviewed when wrangler majors land (attended) |

## Model roles

Model selection as data (owner 2026-11-12, foundry `routine-models-auto-update`). The check follows each role's
**line**: a newer id on that line is a finding for that role's routines; nothing else moves a routine.

| Role | Line | Current | Previous | Routines |
| --- | --- | --- | --- | --- |
| deep work | `fable` | `claude-fable-5-2` | `claude-fable-5-1` | build `trig_01P9WT733fg3qnuJeKUHE8fx`, evening burns `trig_011mbqaUzm3qTK2ZdevCuYpH` and `trig_013tLPWgysoiHWpciYGgXJQ2`, exchange `trig_01CaSyBqwyKVL6NiPqPzhM8L`, review `trig_01Mv7z5Ae9gEGq9zBnrfDH6R` |
| build fallback | `opus` | `claude-opus-5-5` | `claude-opus-5` | `trig_01GraXN5FPXmq5M9wJSYYeHN` |
| read and summarise | `sonnet` | `claude-sonnet-5-5` | `claude-sonnet-5` | metrics `trig_01JBrWDAZLeWEAhSBBnA9g8K`, triage `trig_011NfGaSrEEsr5B1xTHEBRAr`, weekly report `trig_01PjxdBAcvYSAT32fCyzcvQg`, retro `trig_015Uvn63XZUVqx1TAiWZrZL6` |

Lines reviewed and not used: `haiku` (no routine is small enough to want it), `mythos` (limited availability — approved organisations only; the same underlying model as Fable).

A line on the models page that is neither in the table nor on that list files one foundry review item
(`model-line-<name>`) and switches nothing.

**How a new id reaches the routines** (each step a routine's except the one marked):

1. The daily check writes `handoff: models: <role>: <old> → <new>` to `docs/ALERTS.md` — once per target id.
2. The next build slot (`docs/routines/build.md` MODELS; `npm run versions -- pending`) probes the id: a child session
   created with `create_session` and `model: <new>`, read back with `get_session` — `external_metadata.last_served_model`
   equal to the new id is `model ok`. `npm run versions -- probed <role> <new> ok "<note>"` marks the finding and writes
   the owner's line; a failed probe closes the finding and the routines stay where they are.
3. **Owner, about a minute per routine:** https://claude.ai/code/routines → each routine of the role → model menu → the new id.
4. A later build slot sees the new id on every routine of the role in `list_triggers` (`derived_state.model`) and runs
   `npm run versions -- record <role> <new>`: this table, the log below and the finding are updated in one commit.
5. The model a run actually used is `get_session` → `external_metadata.last_served_model` for the run's
   `last_run.session_id`. A switched routine whose run fails afterwards is set back to **Previous** by the owner
   (one `owner:` line from the slot that sees the failed `last_run`).

**Why step 3 is the owner's** (read 2026-11-13, build slot): `update_trigger` answered `this routine was created via
"http_api", not by an agent. Agents can only update routines they created` for the disabled probe routine, and every
Foundry routine but the retro was created that way. The belief of 2026-11-12 that the routines' Claude_Code_Remote
connector is the full trigger API was half right: `list_triggers`, `get_session`, `create_session` and `fire_trigger`
are there; changing a routine someone else created is not. Deleting and recreating the routines as agent-created ones
to get past that is not done: it is the platform's control over who may re-point a scheduled task, it would lose every
routine's run history, and the tool itself reserves a model change for the person's own request.

## Log

- 2026-10-16 — register created. The models page already listed Opus 5.5, Sonnet 5.5 and Haiku 5.5
  (Fable 5.1 remains the newest Fable); the interactive session tested the new ids on the routine
  platform the same day (see §8 of `docs/STRATEGY.md` for the outcome).
- 2026-10-16 — first check found Opus 5 → 5.5 and Sonnet 5 → 5.5 behind the page, and Node 22 vs LTS 24.
  Two one-off probe routines answered on `claude-sonnet-5-5` and `claude-opus-5-5` (both "model ok",
  2–7 s), so the four Sonnet routines and the Opus fallback moved to 5.5 the same hour (probes left
  disabled; delete them at https://claude.ai/code/routines). Node 24 is a foundry queue item
  (`node-24-runners`): every workflow's `node-version` plus the devcontainer, one PR, gate green.
- 2026-10-18 — Dependabot ignores two majors (`.github/dependabot.yml`, burn-down, PR #6): **typescript 7** until
  typescript-eslint's peer range includes 7 (8.71.2 stops at `<6.1.0` and refuses TS 7 at load; TS 7's `tsc -b` also
  fails on a fresh clone because `@foundry/licensing`'s `exports` points at an unbuilt `dist/index.d.ts`), and
  **vitest majors** until `@cloudflare/vitest-pool-workers` accepts vitest 5 (0.23.0 wants ^4.1.0; the root is already
  on vitest 5, gankdat stays on 4). Lifting either is a one-line delete here plus a green gate.
- 2026-10-20 — Node 24 on the runners (build, foundry `node-24-runners`): every workflow's `node-version` moved 22 → 24
  through `docs/ci/` (16 files, one line each); the root and gankdat gates passed on Node 24.22.0 in the sandbox before
  the push. The devcontainer still installs Node 22 (`.devcontainer/Dockerfile`, nodesource `setup_22.x`): CLAUDE.md
  asks before any `.devcontainer/` change, so an attended session bumps it (handoff in `docs/ALERTS.md`).
- 2026-10-29 — Devcontainer on Node 24 (owner's yes, action 030 step 2): `.devcontainer/Dockerfile` nodesource `setup_22.x`
  → `setup_24.x`. Takes effect the next time the container is rebuilt (VS Code: "Dev Containers: Rebuild Container");
  `package.json` keeps `engines.node >=22`, so a machine still on 22 works until then. Runners and devcontainer now match.
- 2026-10-24 — Majors reviewed by the burn-down (foundry `dependabot-majors-review-by-routine`, PR #7: **stripe 22.6.2 → 23.0.0**,
  **postal-mime 3.0.0 → 4.0.6**). Stripe 23's breaking changes (`verifyHeader`/`verifyHeaderAsync` default tolerance, the
  top-level `Stripe.constructEventWithoutVerification` and `ErrorType` removed, V2 list types and V2 address params, Node 18
  dropped, API version pinned to 2026-09-30) touch none of gankdat's calls — `new Stripe(key, { httpClient })`,
  `Stripe.createFetchHttpClient()`, `Stripe.createSubtleCryptoProvider()` and `stripe.webhooks.constructEventAsync(body,
  sig, secret, undefined, provider)`, whose omitted tolerance already meant the default. postal-mime 4 changes how legacy
  mail is read (lax parsing, LF-normalised text, windows-1252 fallback, attachment bytes as sent) and bounds MIME parts;
  `packages/license-worker/src/mail.ts` reads `from`, `to`, `subject`, `date`, `text`, `html`, `messageId`, `inReplyTo`,
  `references` from `new PostalMime().parse(raw)` — all still there; its new `prepare` script runs only on installs from git,
  not from the registry tarball. Rule from today: a green majors PR is reviewed and merged (or closed with a lift condition)
  by the burn-down within 7 days; the burn-down prompt carries the method, the `dependabot` workflow comment says so.
- 2026-10-30 (burn-down, gankdat `mcp-protocol-2026-07-28`): gankdat's MCP server moved from `@hono/mcp` ^0.3 + `@modelcontextprotocol/sdk` ^1.32 to the SDK v2 line — `@modelcontextprotocol/server` ^2.4.0 (dependency) and `@modelcontextprotocol/client` ^2.4.0 (tests only). v2 implements protocol revision 2026-07-28 and serves 2025-era clients by era detection; the 1.x line (latest 1.32.2, 10-23) still lists 2025-11-25 as its newest revision and 404s the current Claude clients. `@hono/mcp` 0.3.5 (10-28) still peers on SDK ^1.29; take it back only if it ships a v2-based release.
- 2026-11-12 — **Fable 5.1 → 5.2** on all five Fable routines (build `trig_01P9WT733fg3qnuJeKUHE8fx`, evening burns
  `trig_011mbqaUzm3qTK2ZdevCuYpH` and `trig_013tLPWgysoiHWpciYGgXJQ2`, exchange `trig_01CaSyBqwyKVL6NiPqPzhM8L`, review
  `trig_01Mv7z5Ae9gEGq9zBnrfDH6R`), interactive session on the owner's note. `claude-fable-5-2` is on the models page (US$8/40 per
  MTok, below 5.1's 10/50; retirement not before 2027-11-09); the old Opus probe routine was repointed and answered `model ok` in 2 s
  before the switch (left disabled). The monthly check (3rd of the month) would not have seen it until 12-03 — the owner did first;
  foundry `routine-models-auto-update` makes the check daily and the apply step a routine's.
- 2026-11-13 — **Check daily, roles as data, switch stays one owner step** (build, foundry `routine-models-auto-update`). The check runs
  in the `gankdat metrics` job every morning and reads the Model roles table; a build slot probes a new id in a child session and
  asks the owner once; a later slot reads the routines back and records the switch. The live read of all twelve routines this
  morning matched the table (five on `claude-fable-5-2`, the fallback on `claude-opus-5-5`, four on `claude-sonnet-5-5`); the
  models page's newest ids are those three plus `claude-haiku-5-5` and `claude-mythos-5-2`, so nothing is pending. The two old
  probe routines (`trig_011oCQKcRaMpb4EBoNm76jWT`, `trig_01GuRg5sAo65bKPmLRoEwoD3`, both disabled) are no longer used and can be
  deleted on the routines page.
