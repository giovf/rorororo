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
`bad_key`, `double1` = 1. Anonymous traffic is crawlers/directories/agents
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
- **Cron health**: refresh runs daily at 05:00 UTC — if `last_refreshed_at`
  in any `/v1/data/:source` meta is >48h old, the cron or origin is broken.
- Optional: Sentry via a Workers integration (deferred — structured logs +
  UptimeRobot cover v1).

## Secret rotation

```bash
wrangler secret put ADMIN_TOKEN          # openssl rand -hex 32
wrangler secret put STRIPE_SECRET_KEY    # rotate in Stripe dashboard first
wrangler secret put SAM_API_KEY          # SAM.gov EXPIRES keys every 90 days — regenerate on the SAM.gov Account Details page, then update (calendar reminder!)
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put X402_WALLET_ADDRESS  # a config change, not a secret rotation
```

Local equivalents live in `.dev.vars` (see `.dev.vars.example`).

## Known caveats (accepted for v1)

- **KV counters are best-effort**: usage/rate-limit counters can lose
  increments under concurrency (slight over-serve). Accurate upgrade path =
  Durable Object per key; documented in `src/metering/counters.ts`, not built.
- **Key cache TTL**: auth records cache in KV for 1h; revocation and credit
  grants bypass it by deleting the entry, so they're immediate.
- **Snapshot caps**: uk-planning serves the most recent ~2000 records,
  uk-tenders ~1000 (KV value + memory bounds). Raising them = shard the cache
  per authority/window (post-v1).
- **SAM.gov daily quota — ONE refresh shot per day**: the non-federal no-role
  API key gets 10 requests/day, reset midnight UTC, and the extract's
  tokenised download polls count against it (verified 2026-07-13). The
  sam-exclusions refresh budgets 1 extract request + 8 polls = 9/day; if a
  day's cron fails, do NOT hand-retry the same day — every attempt 429s until
  00:00 UTC and the source just stays on its previous generation. A 429 from
  the extract request itself means the quota was already burnt (e.g. by
  manual curls). Durable upgrade: link a role/system account to the key
  (1,000/day tier) via SAM.gov Account Details.

## Pivot triggers (from the niche analysis — check monthly against reality)

- 3+ well-reviewed, actively maintained, self-serve planning APIs at scale →
  pivot the wedge to procurement-only or sanctions screening (swap
  `src/sources/` files; the platform stays).
- <£300 MRR after 4 months of real marketing → reposition toward
  bid-intelligence buyers or merge into a compliance feed.
- A single data source >40% of revenue exposure → add the next vertical.
