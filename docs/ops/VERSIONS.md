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
| Claude model, build fallback | `claude-opus-5` | `trig_01GraXN5FPXmq5M9wJSYYeHN` | same | same |
| Claude model, metrics / triage / report / retro routines | `claude-sonnet-5` | their routine configs | same | same |
| Node on GitHub runners | `22` | `.github/workflows/*.yml` (`node-version`) | https://nodejs.org/dist/index.json (active LTS) | versions check → handoff; the repo moves one LTS at a time |
| npm packages (hono, wrangler, vitest, playwright, …) | `package-lock.json` | root | npm registry | Dependabot monthly, grouped; minor/patch auto-merged when the gate is green (`dependabot` workflow), majors by an attended session |
| GitHub Actions (`actions/checkout`, `setup-node`, `upload-artifact`) | per workflow | `.github/workflows/*.yml` | GitHub | Dependabot monthly, grouped, same merge rule |
| Playwright Chromium | `npx playwright install` at run time | demo video / media jobs | Playwright | follows the `playwright` package version |
| Cloudflare Worker compatibility dates | `wrangler.jsonc` per Worker | gankdat, landing, license-worker | https://developers.cloudflare.com/workers/configuration/compatibility-dates/ | reviewed when wrangler majors land (attended) |

## Log

- 2026-10-16 — register created. The models page already listed Opus 5.5, Sonnet 5.5 and Haiku 5.5
  (Fable 5.1 remains the newest Fable); the interactive session tested the new ids on the routine
  platform the same day (see §8 of `docs/STRATEGY.md` for the outcome).
