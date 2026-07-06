---
name: verify
description: Build, launch, and drive faceless-api (Cloudflare Worker) to verify a change end-to-end at its HTTP surface. Use before committing nontrivial changes to product source.
---

# Verifying faceless-api changes

Single Cloudflare Worker (Hono) serving the REST API, MCP endpoint, and static
assets. The surface is HTTP on :8787 via wrangler dev — drive it with curl.

## Launch

```bash
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
- Data layer: `GET /v1/data` lists registered sources; `GET /v1/data/:source`
  queries records (filters per source's `queryParams`, `page`/`per_page`
  pagination, max per_page 100). Unknown params are stripped, not rejected;
  invalid typed params → 400 envelope with `details` array.
- Every response must use the envelope: success `{ok:true,data,...}`, error
  `{ok:false,error:{code,message,docs_url}}` — check unknown routes return the
  404 envelope, not bare text.
- Every response carries `X-Request-Id` (header names case-insensitive — grep
  with `-i`; wrangler capitalizes them).
- Structured JSON request logs (one line per request: requestId, method, path,
  status, latencyMs) appear on the dev-server stdout — capture the background
  task's output file and grep `^\{`.
- Static assets (landing/docs) are served from `public/` at `/` — asset paths
  are matched before Worker routes.
- Secrets for local dev come from `.dev.vars` (never `.env`).

## Gotchas

- `Date.now()` in Workers only advances on I/O, so `latencyMs` reads 0 for
  CPU-only requests locally — not a bug.
- Method mismatch on an existing route falls through to the 404 not_found
  envelope (Hono default), not 405.
- Client-supplied `X-Request-Id` is trusted and propagated into logs
  (JSON-escaped, so no injection).
