# Pinned versions — what the schedulers depend on and how each stays current

Owner 2026-10-16: "check that schedulers with dependencies have their versions maintained over
time automatically — we don't want to be using outdated Claude models." This is the register.
`scripts/versions-check.ts` (monthly `versions` workflow, and `npm run versions` by hand) reads the
**Claude models** and **Node** rows below, compares them with the public sources named, and writes a
`handoff:` line to `docs/ALERTS.md` when something newer exists — the interactive session applies
routine-model changes (the RemoteTrigger API is only reachable there) and records them here.

| What | Pinned | Where | Source of truth | Kept current by |
| --- | --- | --- | --- | --- |
| Claude model, build / burn-down / exchange / review routines | `claude-fable-5-1` | cloud routine configs (`docs/routines/README.md`) | https://platform.claude.com/docs/en/about-claude/models/overview | versions check → handoff → interactive session updates the routines |
| Claude model, build fallback | `claude-opus-5-5` | `trig_01GraXN5FPXmq5M9wJSYYeHN` | same | same |
| Claude model, metrics / triage / report / retro routines | `claude-sonnet-5-5` | their routine configs | same | same |
| Node on GitHub runners | `24` | `.github/workflows/*.yml` (`node-version`) | https://nodejs.org/dist/index.json (active LTS) | versions check → handoff; the repo moves one LTS at a time |
| npm packages (hono, wrangler, vitest, playwright, …) | `package-lock.json` | root | npm registry | Dependabot monthly, grouped; minor/patch auto-merged when the gate is green (`dependabot` workflow), majors reviewed and merged — or closed with a lift condition — by the burn-down within 7 days (2026-10-24, foundry `dependabot-majors-review-by-routine`); a red gate files foundry `dependabot-pr-<N>` and a `watchdog | dependabot:` line within 6 h (`scripts/dependabot-gate.ts`, 2026-10-18) |
| GitHub Actions (`actions/checkout`, `setup-node`, `upload-artifact`) | per workflow | `.github/workflows/*.yml` | GitHub | Dependabot monthly, grouped, same merge rule |
| Playwright Chromium | `npx playwright install` at run time | demo video / media jobs | Playwright | follows the `playwright` package version |
| Cloudflare Worker compatibility dates | `wrangler.jsonc` per Worker | gankdat, landing, license-worker | https://developers.cloudflare.com/workers/configuration/compatibility-dates/ | reviewed when wrangler majors land (attended) |

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
