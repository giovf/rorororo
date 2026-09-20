# Runbook — the <2 hrs/week operation

Everything here is copy-paste executable. Local commands use `--local`; the
production variants (`--remote`) touch the live database — treat them as
ask-first while the operator model beds in.

## Weekly checklist (~15 min)

1. **Refresh health** — any failed source pulls?

   ```bash
   npx wrangler d1 execute DB --local --command \
     "SELECT source_slug, status, records, duration_ms, message, created_at
      FROM refresh_log ORDER BY id DESC LIMIT 14"
   ```

   An `error` row = the origin broke or changed shape. Reproduce locally with
   `npm run dev` + `curl localhost:8787/v1/data/<slug>?per_page=1` (fixture
   fallback masks it locally — check the `fixture_fallback` log line).

2. **Log scan** — error spikes or usage anomalies. Production logs:
   `npx wrangler tail --format json | grep -E '"level":"error"|usage_alert'`.
   Every request line carries `requestId, path, status, latencyMs, keyId,
   creditsCharged`; alerts fire as `event: "usage_alert"` at 80%/100%.

3. **Stripe glance** (once live): dashboard → payments/disputes. Dunning,
   retries, and cancellations are Stripe-native; nothing to operate here.

4. **Waitlist export** (pre-launch):

   ```bash
   npx wrangler d1 execute DB --local --command \
     "SELECT email, source, created_at FROM waitlist ORDER BY id" --json
   ```

## Monthly (~15 min)

- Merge Dependabot PRs (CI must be green).
- **D1 backup**: `npx wrangler d1 export DB --remote --output backup-$(date +%Y%m%d).sql`
  and stash it somewhere off-Cloudflare.

## Traffic analytics (Analytics Engine, since 2026-07-10)

Every `/mcp` request writes a datapoint to the `gankdat_traffic` dataset:
`blob1` = `mcp_anon` | `mcp_authed` | `mcp_denied` (401 before the handler),
`blob2` = User-Agent, `blob3` = JSON-RPC method(s), comma-joined (task 45;
empty on rows written before 2026-07-12), `blob4` (denied only) = `no_key` |
`bad_key`, `blob5` (since 2026-09-20) = tool name(s) on `tools/call` — i.e. which dataset an
agent asked for, the per-dataset demand signal — `double1` = 1. Anonymous traffic is crawlers/directories/agents
window-shopping; the UA names them. A `mcp_denied` + `tools/call` + `no_key`
row is the conversion signal: an agent wanted the data and stopped at the
paywall. ~90-day retention, queryable via the SQL API:

```bash
# Which crawlers/agents hit /mcp this week, by volume?
curl -s "https://api.cloudflare.com/client/v4/accounts/37e56f3ce4dfe49919e85d4380467f44/analytics_engine/sql" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -d "SELECT blob2 AS user_agent, blob1 AS kind,
             SUM(_sample_interval * double1) AS requests
      FROM gankdat_traffic
      WHERE timestamp > NOW() - INTERVAL '7' DAY
      GROUP BY user_agent, kind
      ORDER BY requests DESC
      LIMIT 25"
```

(`$CLOUDFLARE_API_TOKEN` from `.env`; `SUM(_sample_interval * double1)`
corrects for sampling.) Day-to-day request logs stay in Workers Logs
(dashboard → Worker → Logs; filter `path = /mcp`, no `keyId` = anonymous).

## Alerting (external, free tiers)

- **UptimeRobot**: HTTP monitor on `https://<domain>/v1/health` (expects 200,
  body contains `"status":"ok"`), 5-min interval, alert → phone.
- **Cron health**: the daily refresh runs in four waves — 05:00 UTC (KV snapshot
  sources), 05:15 (exclusions, sponsors), 05:30 (charities, care locations), 05:45
  (uk-food-hygiene alone) — because a Cron Trigger is killed at 15 minutes; one combined run
  reached ~13 min and a four-source D1 wave was killed on 2026-09-20. A trigger's minute
  selects the wave (`store.ts waveForCron`: 0 → 1, 15 → 2, 30 → 3, 45 → 4, anything else →
  all). If `last_refreshed_at` in any `/v1/data/:source` meta is >48h old, the trigger or
  origin is broken. To force a wave by hand, add a temporary trigger via the Cloudflare
  schedules API with ≥16 min lead on a :00/:15/:30/:45 minute, then restore the four crons
  (a deploy also restores them).
- Optional: Sentry via a Workers integration (deferred — structured logs +
  UptimeRobot cover v1).

## Secret rotation

```bash
wrangler secret put ADMIN_TOKEN          # openssl rand -hex 32
wrangler secret put STRIPE_SECRET_KEY    # rotate in Stripe dashboard first
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put X402_WALLET_ADDRESS  # a config change, not a secret rotation
```

Local equivalents live in `.dev.vars` (see `.dev.vars.example`).

## Known caveats (accepted for v1)

- **Cloudflare challenges vs API clients** (found 2026-09-19, fixed 2026-09-20): the zone's
  security level (`medium`) served a "Just a moment…" HTML 403 to low-reputation IPs —
  GitHub Actions runners and Glama's health checker both hit it on `/mcp` and `/v1/*`.
  A JSON client can never pass a JS challenge, so on 2026-09-20 the zone was set to
  `security_level: essentially_off` and `browser_check: off` via the API (the API tokens
  cannot manage WAF rulesets, which would have allowed a path-scoped skip rule — if a
  token with Zone WAF permission ever exists, prefer a skip rule for `/mcp`, `/v1/*`,
  `/x402/*`, `/.well-known/*`). The Worker's own rate limiters remain the abuse control.
  **Bot Fight Mode was the actual culprit** — it issues managed challenges to traffic it
  judges automated (Glama's health checker, CI runners), i.e. exactly this API's customers.
  The owner switched it off on 2026-09-20 (dashboard-only setting: Security → Bots) and
  Glama's connection test passed immediately. Keep it off; keep "Block AI bots" off too.
  CI verifies deploys via the Workers API instead of the edge.

- **KV counters are best-effort**: usage/rate-limit counters can lose
  increments under concurrency (slight over-serve). Accurate upgrade path =
  Durable Object per key; documented in `src/metering/counters.ts`, not built.
- **Key cache TTL**: auth records cache in KV for 1h; revocation and credit
  grants bypass it by deleting the entry, so they're immediate.
- **Snapshot caps**: uk-planning serves the most recent ~2000 records,
  uk-tenders ~1000 (KV value + memory bounds). Raising them = shard the cache
  per authority/window (post-v1).
- **SAM.gov**: the exclusions refresh reads the keyless daily public extract ZIP
  (~12MB → ~78MB CSV, streamed). No API key, no quota. If the refresh fails, check
  `refresh_log` for the message: a listing/download HTTP error is transient (retry next
  day); "format changed" means the extract's header row changed — fix the column map
  in `src/sources/sam-exclusions.ts`.
- 3+ well-reviewed, actively maintained, self-serve planning APIs at scale →
  pivot the wedge to procurement-only or sanctions screening (swap
  `src/sources/` files; the platform stays).
- <£300 MRR after 4 months of real marketing → reposition toward
  bid-intelligence buyers or merge into a compliance feed.
- A single data source >40% of revenue exposure → add the next vertical.
