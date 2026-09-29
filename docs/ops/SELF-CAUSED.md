# Self-caused notifications — mail our own automation triggers

Read by the hourly inbox triage before it classifies any store, vendor or platform mail, and by
the weekly report before its Alerts and Suggested-next-step sections. Foundry item
`self-caused-alerts` (2026-09-29): in one week three false alarms reached the owner or the
handoff list, every one caused by a script of ours. A mail that matches a row below is
**logged in `docs/INBOX.md` as `logged (self-caused: <cause>)` and never becomes an
`ALERTS.md` line, a `needs owner`, a ledger entry or a "next step"**.

Rule for every routine and session (also in `CLAUDE.md` § Workflow): whenever you automate
something that makes a third party email us — publishing, pricing, key rotation, DNS, a
registry submission, a new sending domain — add its row here **in the same commit**.

## Self-caused: log and move on

| Sender (domain) | Subject fragment | Cause (script / file) | What it really is | Log as |
| --- | --- | --- | --- | --- |
| `community.apify.com` | `Pricing change for <actor title>` | `ventures/gankdat/scripts/publish-actors.mjs` sets `PAY_PER_EVENT`, US$0.001 per result, on every actor it finds unpriced (daily 04:00 UTC and on push) | The **sale price we set** as the actor's publisher ("$1.00 / 1,000 results" is 0.001 × 1,000). Apify mails the publisher whenever a pricing model is set. Not a cost; nothing for `docs/LEDGER.md`. Seen 2026-09-27 (uk-trademark-journal-watch), 2026-09-28 (uk-gambling-commission-licence-register); both handoffs closed 2026-09-29 | `logged (self-caused: publish-actors.mjs pricing)` |
| `apify.com` / `community.apify.com` | `is now public`, `has been published`, `was updated` for an actor under `faceless-api` | Same script: `isPublic = true` for up to 5 actors per run, and every push under `ventures/gankdat/apify/**` rebuilds the actor | Our own publish job confirming itself | `logged (self-caused: publish-actors.mjs publish)` |
| `sam.gov` | `Rotate your Individual Account API Key`, `API Key … expire` | None any more: `ventures/gankdat/src/sources/sam-exclusions.ts` reads the **keyless** "Exclusions / Public V2" file extract since 2026-09-20; the key belongs to the abandoned API-v4 flow | A reminder for a key nothing uses. Letting it expire changes nothing (owner-confirmed false alarm, 2026-09-28) | `logged (self-caused: sam-exclusions is keyless)` |
| `registry.modelcontextprotocol.io`, `modelcontextprotocol.io`, `mcpservers.org` | `published`, `updated`, `new version` for `com.gankdat/gankdat` | `ventures/gankdat/scripts/registry-publish.sh` publishes `server.json` in CI whenever its version is newer than the registry's | Our own registry publish confirming itself (a first-time **approval** of a new listing is different: that is a `store` event, see below) | `logged (self-caused: registry-publish.sh)` |
| `google.com`, `microsoft.com` (`protection.outlook.com`), `amazonses.com`, any mailbox provider | `Report domain: gankdat.com`, `Report Domain: mail.gankdat.com`, `Dmarc Aggregate Report` | Our DMARC policy on `gankdat.com` / `mail.gankdat.com` asks every receiver to send these (Resend and SES send our support and licence mail) | Routine aggregate report, arrives daily from each provider that received mail from us | `logged (self-caused: DMARC policy)` |
| `github.com` | `[giovf/rorororo] Run failed: <workflow> - main (<sha>)` | Our own pushes; every routine pushes several times a day | A red `main` is healed by the next push or the build routine (STEP 0). Already a triage rule since 2026-09-21; listed here so the rule has one home | `logged (self-caused: CI on our push)` — never `needs owner` |
| `github.com` | `Run failed: fetch relay`, `Run failed: gankdat publish` | Our relay requests and publish job | Agent work, same as above; the build routine that filed the relay request reads the failure in `docs/relay/responses/<name>/meta.json` | `logged (self-caused: CI on our push)` |
| `cloudflare.com` | `deployed`, `Worker … updated`, `DNS record … changed` | `.github/workflows/gankdat.yml` and `landing.yml` deploy on every push | Deploy confirmation | `logged (self-caused: CI deploy)` |

## Caused by us but real work (agent, never owner)

These are also triggered by our automation, but they report a **defect** the build routine must
fix. Log them as `logged` with the plain cause and, if no queue item exists, the build routine
adds one; still never `needs owner`.

| Sender | Subject fragment | Cause | What to do |
| --- | --- | --- | --- |
| `apify.com` | `Your Actor <title> has been flagged as under maintenance` | Apify's QA ran our actor for 3 days and it failed (seen 2026-09-25, uk-planning-applications) | A failing actor: queue item in `docs/pipeline/queues/gankdat.json` if none, fix the actor, CI republishes it |
| `apify.com` | `Your Actor <title> run failed` / `ABORTED` | An actor of ours errored on a customer's run | Same: read the run log via the Apify API in CI or the relay, fix, republish |
| `github.com` | `Run failed: check - main` on **two consecutive** commits | A gate that stays red | STEP 0 of the build routine heals it; the watchdog reports a slot that pushed nothing |

## What is NOT self-caused (a genuine `store` / `customer` event)

A first-time decision on a listing we submitted — **approved**, **rejected**, **needs action**,
**identity verified**, **payout connected**, **limit lifted** — is a real state change: log it
as `store` and add the ALERTS line as before (`store-approval-to-store-md` will route it into
`STORE.md`). A person writing to info@gankdat.com is always `customer`. An invoice or receipt
from a service we pay (Cloudflare Workers Paid, a domain renewal) is a real cost for
`docs/LEDGER.md`, not a false alarm.

## History

- 2026-09-29 — file created (foundry `self-caused-alerts`); triage and weekly-report prompts
  point here (`docs/routines/inbox-triage.md`, `docs/routines/weekly-report.md`). Rows 1–8.
