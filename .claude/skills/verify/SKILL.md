---
name: verify
description: Build, launch, and drive gankdat (Cloudflare Worker) to verify a change end-to-end at its HTTP surface. Use before committing nontrivial changes to product source.
---

# Verifying gankdat changes

Single Cloudflare Worker (Hono) serving the REST API, MCP endpoint, and static
assets. The surface is HTTP on :8787 via wrangler dev — drive it with curl.

## Launch

```bash
npx wrangler d1 migrations apply DB --local     # once per fresh .wrangler state
npx wrangler dev --port 8787 --test-scheduled   # run in background
# readiness: poll until curl -s http://localhost:8787/v1/health returns a body
```

- Local mode (miniflare) simulates KV (`CACHE`, `RATE`) and D1 (`DB`) — no
  Cloudflare account or network needed; placeholder binding ids are fine.
- `--test-scheduled` exposes `GET /__scheduled?cron=0+5+*+*+*` to drive the
  cron/scheduled handler.
- Stop with `pkill -f "wrangler dev"` (exit 144 is the kill signal, not a failure).

## Drive

- API routes live under `/v1/*`; liveness: `GET /v1/health`.
- Data layer: `GET /v1/data` lists registered sources (`uk-planning`,
  `uk-tenders`); `GET /v1/data/:source` queries records (filters per source's
  `queryParams`, `page`/`per_page` pagination, max per_page 100, reserved `q`,
  `_after`/`_before` date ranges, `_min`/`_max` numeric ranges). Unknown params
  are stripped, not rejected; invalid typed params → 400 envelope with
  `details` array. Cold cache hits the real origins (planning.data.gov.uk,
  find-tender.service.gov.uk) — first request takes seconds; warm is ms.
- Blind Mode check: response text must contain no `contactPoint`/applicant
  fields (free-text descriptions may legitimately contain org emails).
- Auth: `/v1/data/:source` needs `Authorization: Bearer <key>`. Get one:
  `curl -s -X POST localhost:8787/v1/keys -H 'content-type: application/json'
  -d '{"email":"t@example.com"}'` — key issuance is rate-limited to 5/hour/IP;
  if POSTs start returning 429 in dev, clear the counter:
  `npx wrangler kv key delete --binding RATE --local "ratelimit:keys:127.0.0.1"`.
  Admin ops use `X-Admin-Token` (value from `.dev.vars`). Public: /v1/health,
  /v1/data (listing), /openapi.json, POST /v1/keys.
- After adding a migration, re-run the `d1 migrations apply DB --local` step or
  dev-server D1 queries 500 with `internal` (tests won't catch it — they apply
  migrations themselves).
- MCP: POST JSON-RPC to `/mcp` with the bearer key + header
  `accept: application/json, text/event-stream`; responses are SSE — extract
  with `sed -n 's/^data: //p'`. Tools: list_sources, get_usage (free),
  query_uk_planning, query_uk_tenders (metered, same counters as REST).
  Interop check: `npx @modelcontextprotocol/inspector` against localhost:8787/mcp.
- Metering: data routes cost 1 credit and set `X-Credits-Limit`/`-Remaining`
  (+ `X-Upgrade-Nudge` and `meta.usage_alert` from 80%); `GET /v1/usage`
  (authed) is free. Quota = the plan's monthly allowance (billing/plans.ts
  planAllowance: free 250 / starter 5000 / growth 20000 / scale 100000), NOT
  the ledger sum — renewals don't inflate it. Usage is keyed by EMAIL, not key
  id (`usage:<lowercased-email>:<yyyymm>` in CACHE), so keys sharing an email
  share the quota. To test thresholds fast, seed that KV counter. HEAD requests
  are not billed. Bearer scheme is case-insensitive.
- Every response must use the envelope: success `{ok:true,data,...}`, error
  `{ok:false,error:{code,message,docs_url}}` — check unknown routes return the
  404 envelope, not bare text.
- Every response carries `X-Request-Id` (header names case-insensitive — grep
  with `-i`; wrangler capitalizes them).
- Structured JSON request logs (one line per request: requestId, method, path,
  status, latencyMs) appear on the dev-server stdout — capture the background
  task's output file and grep `^\{`.
- Static assets (landing/docs) are served from `public/` at `/` — asset paths
  are matched before Worker routes. Assets are NOT emulated by the vitest
  pool (SELF.fetch 404s on them) — verify them live only. `html_handling`
  redirects `/docs.html` → `/docs` (307): link to the pretty URL.
- Waitlist: `POST /v1/waitlist {email, source?}` — idempotent per email,
  10/hour/IP limit.
- Secrets for local dev come from `.dev.vars` (never `.env`).

## Gotchas

- `Date.now()` in Workers only advances on I/O, so `latencyMs` reads 0 for
  CPU-only requests locally — not a bug.
- Method mismatch on an existing route falls through to the 404 not_found
  envelope (Hono default), not 405.
- Client-supplied `X-Request-Id` is trusted and propagated into logs
  (JSON-escaped, so no injection).
