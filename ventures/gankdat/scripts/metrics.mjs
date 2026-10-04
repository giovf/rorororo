#!/usr/bin/env node
// Daily gankdat numbers → one row in ventures/gankdat/RESEARCH.md "## Metrics" (the table the
// Foundry Ops page reads). Runs in CI (.github/workflows/gankdat-metrics.yml) with
// CLOUDFLARE_API_TOKEN; also `npm run metrics -w @foundry/gankdat` locally (reads .env).
//   accounts / paid accounts        — D1 (accounts table)
//   MCP authed calls, paywall hits  — Analytics Engine gankdat_traffic (last 24 h)
//   x402 paid requests              — Analytics Engine (last 24 h)
//   refresh health                  — D1 refresh_log (last 24 h errors)
//   Apify actor runs / users        — Apify API (optional APIFY_TOKEN; omitted without it)

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ACCOUNT_ID = '37e56f3ce4dfe49919e85d4380467f44'; // not a secret
const DATABASE_ID = 'ac051277-5f69-46ba-965b-50da2f1ec524'; // wrangler.jsonc
const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) {
  console.error('CLOUDFLARE_API_TOKEN missing');
  process.exit(1);
}
const headers = { Authorization: `Bearer ${token}` };

// A push-triggered run only fills a day the 06:30 cron missed (METRICS_IF_MISSING). Before the
// refresh waves have finished (05:00–06:05 UTC, docs/SCHEDULERS.md) the day's numbers do not
// exist yet: on 2026-10-01 a 00:23 push wrote the row from the previous day's 24 h — yesterday's
// refresh errors as today's — the cron was skipped, and every later push left the row alone.
// So a fill run before the waves leaves the day missing for the cron or the next push.
const WAVES_DONE_UTC_MINUTES = 6 * 60 + 20;
{
  const now = new Date();
  if (
    process.env.METRICS_IF_MISSING &&
    now.getUTCHours() * 60 + now.getUTCMinutes() < WAVES_DONE_UTC_MINUTES
  ) {
    console.log(
      `fill-only run at ${now.toISOString().slice(11, 16)} UTC, before the refresh waves finish (06:20); leaving today's row to the 06:30 cron or a later push`,
    );
    process.exit(0);
  }
}

async function sql(query) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`,
    {
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({ sql: query }),
    },
  );
  const body = await res.json();
  if (!body.success) throw new Error(`D1: ${JSON.stringify(body.errors).slice(0, 200)}`);
  return body.result[0].results;
}
async function ae(query) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/analytics_engine/sql`,
    {
      method: 'POST',
      headers,
      body: query,
    },
  );
  const body = await res.json();
  if (!body.data) throw new Error(`Analytics Engine: ${JSON.stringify(body).slice(0, 200)}`);
  return body.data;
}
const n = (rows, key) => Math.round(Number(rows[0]?.[key] ?? 0));

// Internal accounts (ours: info@, apify@ …@gankdat.com and the owner's own) are not customers.
const [acct] = await sql(
  "SELECT COUNT(*) AS total, SUM(plan != 'free') AS paid, SUM(created_at > datetime('now','-1 day')) AS new24h FROM accounts WHERE email NOT LIKE '%@gankdat.com' AND email NOT LIKE '%@1402celsius.com' AND email NOT LIKE '%@example.com' AND email NOT LIKE 'giova1506@%'",
);
// Build 2026-09-28: carry the error text, not just the slug. Twice (nhs-ods 2026-09-23, three
// sources 2026-09-28) a routine saw a slug in this row and could not fix it because refresh_log
// is not reachable from a sandbox. One line per source, whitespace collapsed, table-safe, capped;
// anything shaped like a credential in a URL is redacted before it lands in a public repo.
const errors = await sql(
  "SELECT source_slug, MAX(message) AS message FROM refresh_log WHERE status = 'error' AND created_at > datetime('now','-1 day') GROUP BY source_slug",
);
const errorText = (m) =>
  String(m ?? '')
    .replace(/\s+/g, ' ')
    .replace(/\|/g, '/')
    .replace(/([?&](?:api_key|apikey|key|token|secret|password)=)[^&\s]+/gi, '$1<redacted>')
    .trim()
    .slice(0, 90);
// Agent-side sign-up funnel (build 2026-09-25; proof: ≥ 5 keys issued via the agent path in 30
// days). Tolerant of the migration not being applied yet on the day it ships.
const agentKeys = await sql(
  "SELECT SUM(claimed_at IS NOT NULL) AS keys30d, SUM(claimed_at IS NOT NULL AND claimed_at > (strftime('%s','now') - 86400) * 1000) AS keys24h, SUM(created_at > (strftime('%s','now') - 86400) * 1000) AS requests24h FROM agent_signups WHERE email NOT LIKE '%@gankdat.com' AND email NOT LIKE '%@1402celsius.com' AND email NOT LIKE '%@example.com' AND email NOT LIKE 'giova1506@%'",
)
  .then(([row]) => row ?? null)
  .catch(() => null);
// Lazy OAuth (2026-09-30): consents = authorization codes minted for real
// accounts (internal mailboxes excluded like agent sign-up); per-client hosts
// from the oauth_token analytics point (blob4) — the "first key connected from
// claude.ai" proof of mcp-oauth-lazy-auth.
const oauth = await sql(
  "SELECT COUNT(*) AS connects30d, SUM(g.created_at > (strftime('%s','now') - 86400) * 1000) AS connects24h FROM oauth_grants g JOIN accounts a ON a.id = g.account_id WHERE g.kind = 'code' AND g.created_at > (strftime('%s','now') - 30 * 86400) * 1000 AND a.email NOT LIKE '%@gankdat.com' AND a.email NOT LIKE '%@1402celsius.com' AND a.email NOT LIKE '%@example.com' AND a.email NOT LIKE 'giova1506@%'",
)
  .then(([row]) => row ?? null)
  .catch(() => null);
const oauthClients = await ae(
  "SELECT blob4 AS client, SUM(_sample_interval * double1) AS n FROM gankdat_traffic WHERE blob1 = 'oauth_token' AND blob3 = 'authorization_code' AND timestamp > NOW() - INTERVAL '7' DAY GROUP BY client ORDER BY n DESC LIMIT 3",
).catch(() => []);
const oauthNote = oauth
  ? `oauth: ${oauth.connects24h ?? 0} connects/24h, ${oauth.connects30d ?? 0}/30d${oauthClients.length ? ` (7d by client: ${oauthClients.map((r) => `${r.client} ${Math.round(Number(r.n))}`).join(', ')})` : ''}`
  : 'oauth: n/a';
const kinds = Object.fromEntries(
  (
    await ae(
      "SELECT blob1 AS kind, SUM(_sample_interval * double1) AS n FROM gankdat_traffic WHERE timestamp > NOW() - INTERVAL '1' DAY GROUP BY kind",
    )
  ).map((r) => [r.kind, Math.round(Number(r.n))]),
);
const paywall = n(
  await ae(
    "SELECT SUM(_sample_interval * double1) AS n FROM gankdat_traffic WHERE blob1 = 'mcp_denied' AND blob3 LIKE '%tools/call%' AND timestamp > NOW() - INTERVAL '1' DAY",
  ),
  'n',
);

const wanted = await ae(
  "SELECT blob5 AS tool, SUM(_sample_interval * double1) AS n FROM gankdat_traffic WHERE blob1 = 'mcp_denied' AND blob5 != '' AND timestamp > NOW() - INTERVAL '1' DAY GROUP BY tool ORDER BY n DESC LIMIT 3",
);
const wantedNote = wanted.length
  ? `; wanted: ${wanted.map((r) => `${r.tool} ${Math.round(Number(r.n))}`).join(', ')}`
  : '';

// STRATEGY §4 targets "change-feed calls / week: 50" and change-feed-upsell /
// trademark-watch-surface are both proved by that number, but nothing counted it:
// review 2026-W39 §1 had to write "unknown, likely 0". Both surfaces in one query,
// over 7 days to match the weekly target — MCP get_changes tool calls (blob5 carries
// the tool names) plus the REST /v1/changes data point added in the same commit.
const changeFeed = Object.fromEntries(
  (
    await ae(
      "SELECT blob1 AS kind, SUM(_sample_interval * double1) AS n FROM gankdat_traffic WHERE timestamp > NOW() - INTERVAL '7' DAY AND ((blob1 = 'mcp_authed' AND blob5 LIKE '%get_changes%') OR blob1 = 'rest_changes') GROUP BY kind",
    )
  ).map((r) => [r.kind, Math.round(Number(r.n))]),
);
const changesMcp = changeFeed.mcp_authed ?? 0;
const changesRest = changeFeed.rest_changes ?? 0;

// STRATEGY §4 target "Apify paid runs / month: 100" was unmeasured — review 2026-W39 §4 had to
// write "no run count reaches the repo" — yet all 17 actors are public since 2026-09-28, so the
// shelf either produces runs or it does not. Field names confirmed against a live
// GET /v2/acts/apify~web-scraper through the relay (docs/relay), not from memory:
// stats.totalRuns, stats.totalUsers30Days, isPublic. The `?my=1` list itself was then read in CI
// (run 36753533977): its entries carry `stats` but NOT `isPublic`, so every actor falls through to
// its own endpoint for the public count — as publish-actors.mjs already does for pricingInfos.
// Do not drop that fallback because the list looks complete: without it `P public` reads 0. Each
// run logs the keys it saw, so a shape change shows up in the log before it shows up in the row.
// APIFY_TOKEN is optional: without it, or if the API is down, the row still lands as `apify: n/a`
// rather than losing the D1 and Analytics Engine numbers with it.
const apifyToken = process.env.APIFY_TOKEN;
async function apifyShelf() {
  if (!apifyToken) return null;
  const H = { Authorization: `Bearer ${apifyToken}` };
  const res = await fetch('https://api.apify.com/v2/acts?my=1&limit=100', { headers: H });
  if (!res.ok) throw new Error(`GET /v2/acts: HTTP ${res.status}`);
  const items = (await res.json()).data?.items ?? [];
  let runs = 0;
  let users = 0;
  let publicCount = 0;
  let fromDetail = 0;
  for (const item of items) {
    let act = item;
    if (!item.stats || item.isPublic === undefined) {
      const one = await fetch(`https://api.apify.com/v2/acts/${item.id}`, { headers: H });
      if (!one.ok) throw new Error(`GET /v2/acts/${item.id}: HTTP ${one.status}`);
      act = { ...item, ...((await one.json()).data ?? {}) };
      fromDetail += 1;
    }
    runs += Math.round(Number(act.stats?.totalRuns ?? 0));
    users += Math.round(Number(act.stats?.totalUsers30Days ?? 0));
    if (act.isPublic) publicCount += 1;
  }
  console.log(
    `apify: ${items.length} actors, ${fromDetail} read from their own endpoint for isPublic (list keys: ${Object.keys(items[0] ?? {}).join(',')})`,
  );
  return { runs, users, publicCount };
}
const apify = await apifyShelf().catch((e) => {
  console.error(`apify: ${e.message}`);
  return null;
});

// Cloudflare metered usage, billing period to date (cloudflare-usage-breakdown, build 2026-10-04).
// The invoice runs 10th → 10th (the 2026-10-01 budget alert covered 2026-09-10..10-10 and said
// US$15 against the US$5 Workers Paid line with GBP 0 revenue — STRATEGY §7's cost rule), and
// nothing in the repo knew which product carried it. GraphQL Analytics (needs "Account
// Analytics: Read" on the token) gives rows written/read per D1 database, KV operations by
// kind, Worker requests and D1 storage; data points come from the Analytics Engine SQL API the
// row already uses. Each reading is its own query, so one missing permission or renamed field
// degrades to `n/a (<reason>)` in the row — the next routine can fix that query — and never
// loses the other numbers. Prices are the Workers Paid plan's published rates (USD, 2026-10):
// the "≈ US$" figure is the overage above the included allowances, to be read against the
// invoice, not instead of it.
const CF_PRICES = {
  d1Writes: { included: 50e6, perMillion: 1.0 },
  d1Reads: { included: 25e9, perMillion: 0.001 },
  d1StorageGb: { included: 5, perUnit: 0.75 },
  kvReads: { included: 10e6, perMillion: 0.5 },
  kvWrites: { included: 1e6, perMillion: 5.0 },
  workersRequests: { included: 10e6, perMillion: 0.3 },
  aePoints: { included: 10e6, perMillion: 0.25 },
};
const fmtM = (v) => (v >= 1e9 ? `${(v / 1e9).toFixed(1)}B` : `${(v / 1e6).toFixed(1)}M`);
const overage = (value, { included, perMillion }) =>
  Math.max(0, value - included) * (perMillion / 1e6);
async function cfUsage() {
  const now = new Date();
  const periodStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (now.getUTCDate() < 10 ? 1 : 0), 10),
  );
  const from = periodStart.toISOString().slice(0, 10);
  const to = now.toISOString().slice(0, 10);
  const days = Math.max(1, Math.ceil((now - periodStart) / 86_400_000));
  const gql = async (selection) => {
    const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({
        query: `{ viewer { accounts(filter: { accountTag: "${ACCOUNT_ID}" }) { ${selection} } } }`,
      }),
    });
    const body = await res.json();
    if (body.errors?.length) {
      throw new Error(
        body.errors
          .map((e) => e.message)
          .join('; ')
          .slice(0, 100),
      );
    }
    const account = body.data?.viewer?.accounts?.[0];
    if (!account) throw new Error(`HTTP ${res.status}, no account in response`);
    return account;
  };
  const sumOf = (rows, key) => rows.reduce((acc, r) => acc + Number(r.sum?.[key] ?? 0), 0);
  const reading = async (label, fn) => {
    try {
      return await fn();
    } catch (e) {
      console.error(`cf usage ${label}: ${e.message}`);
      return { error: `${label}: ${e.message}` };
    }
  };
  const d1 = await reading('d1', async () => {
    const { d1AnalyticsAdaptiveGroups: rows } = await gql(
      `d1AnalyticsAdaptiveGroups(limit: 1000, filter: { date_geq: "${from}", date_leq: "${to}" }) { dimensions { databaseId } sum { rowsRead rowsWritten readQueries writeQueries } }`,
    );
    return { writes: sumOf(rows, 'rowsWritten'), reads: sumOf(rows, 'rowsRead') };
  });
  const storage = await reading('d1 storage', async () => {
    const { d1StorageAdaptiveGroups: rows } = await gql(
      `d1StorageAdaptiveGroups(limit: 1000, filter: { date_geq: "${from}", date_leq: "${to}" }, orderBy: [date_DESC]) { dimensions { date databaseId } max { databaseSizeBytes } }`,
    );
    const latest = rows[0]?.dimensions?.date;
    const bytes = rows
      .filter((r) => r.dimensions?.date === latest)
      .reduce((acc, r) => acc + Number(r.max?.databaseSizeBytes ?? 0), 0);
    return { gb: bytes / 1e9 };
  });
  const kv = await reading('kv', async () => {
    const { kvOperationsAdaptiveGroups: rows } = await gql(
      `kvOperationsAdaptiveGroups(limit: 1000, filter: { date_geq: "${from}", date_leq: "${to}" }) { dimensions { actionType } sum { requests } }`,
    );
    const reads = sumOf(
      rows.filter((r) => r.dimensions?.actionType === 'read'),
      'requests',
    );
    return { reads, writes: sumOf(rows, 'requests') - reads };
  });
  const workers = await reading('workers', async () => {
    const { workersInvocationsAdaptive: rows } = await gql(
      `workersInvocationsAdaptive(limit: 1000, filter: { datetime_geq: "${periodStart.toISOString()}", datetime_leq: "${now.toISOString()}" }) { sum { requests } }`,
    );
    return { requests: sumOf(rows, 'requests') };
  });
  const aePoints = await reading('ae', async () => {
    const rows = await ae(
      `SELECT SUM(_sample_interval) AS points FROM gankdat_traffic WHERE timestamp > NOW() - INTERVAL '${days}' DAY`,
    );
    return { points: Math.round(Number(rows[0]?.points ?? 0)) };
  });
  const parts = [];
  const costs = [];
  if (!d1.error) {
    parts.push(`d1 ${fmtM(d1.writes)} writes / ${fmtM(d1.reads)} reads`);
    costs.push(['d1 writes', overage(d1.writes, CF_PRICES.d1Writes)]);
    costs.push(['d1 reads', overage(d1.reads, CF_PRICES.d1Reads)]);
  }
  if (!storage.error) {
    parts.push(`${storage.gb.toFixed(1)} GB`);
    costs.push([
      'd1 storage',
      Math.max(0, storage.gb - CF_PRICES.d1StorageGb.included) * CF_PRICES.d1StorageGb.perUnit,
    ]);
  }
  if (!kv.error) {
    parts.push(`kv ${fmtM(kv.reads)} reads / ${fmtM(kv.writes)} writes`);
    costs.push(['kv reads', overage(kv.reads, CF_PRICES.kvReads)]);
    costs.push(['kv writes', overage(kv.writes, CF_PRICES.kvWrites)]);
  }
  if (!workers.error) {
    parts.push(`workers ${fmtM(workers.requests)} req`);
    costs.push(['workers', overage(workers.requests, CF_PRICES.workersRequests)]);
  }
  if (!aePoints.error) {
    parts.push(`ae ${fmtM(aePoints.points)} pts`);
    costs.push(['ae', overage(aePoints.points, CF_PRICES.aePoints)]);
  }
  const errors = [d1, storage, kv, workers, aePoints].filter((r) => r.error).map((r) => r.error);
  if (parts.length === 0) return `cf usage: n/a (${errors.join('; ').slice(0, 160)})`;
  const total = costs.reduce((acc, [, v]) => acc + v, 0);
  const drivers = costs
    .filter(([, v]) => v >= 0.5)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k} US${v.toFixed(0)}`)
    .join(', ');
  return `cf usage (${from.slice(5)}→${to.slice(5)}): ${parts.join(', ')} ≈ US${total.toFixed(0)} overage${drivers ? ` (${drivers})` : ''}${errors.length ? `; n/a: ${errors.join('; ').slice(0, 120)}` : ''}`;
}
const cfNote = await cfUsage().catch((e) => `cf usage: n/a (${e.message.slice(0, 100)})`);

const date = new Date().toISOString().slice(0, 10);
const users = `${acct.total} accts (${acct.paid ?? 0} paid, +${acct.new24h ?? 0}/24h)`;
const sales = `${kinds.x402_paid ?? 0} x402 paid`;

const file = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'RESEARCH.md');
let md = await readFile(file, 'utf8');
// The Apify API gives lifetime run totals, so the 24 h delta has to come from the row before
// this one — the only place a previous total is kept. Today's row is skipped: a re-run rewrites
// it, and it must not become its own baseline. Only the immediately preceding row counts, so the
// first row after this ships reads `baseline` rather than inventing a delta against nothing.
const prevRuns = (() => {
  const rows = (md.match(/^\| \d{4}-\d{2}-\d{2} \| Daily numbers \|.*$/gm) ?? []).reverse();
  for (const r of rows) {
    if (r.startsWith(`| ${date} `)) continue;
    const m = r.match(/apify: (\d+) runs/);
    return m ? Number(m[1]) : null;
  }
  return null;
})();

const notes = [
  // preview = keyless data-tool calls (5 rows, 20/day per client, since 2026-09-30 for the
  // Claude Connectors Directory); paywall hits = the plan text shown when that budget is spent
  // or a presented key is bad. Both are blob1 kinds written by routes/mcp.ts + mcp/server.ts.
  `MCP 24h: ${kinds.mcp_authed ?? 0} authed, ${kinds.mcp_anon ?? 0} anon, ${kinds.mcp_preview ?? 0} preview, ${paywall} paywall hits${wantedNote}`,
  `changes 7d: ${changesMcp + changesRest} (mcp ${changesMcp}, rest ${changesRest})`,
  apify
    ? `apify: ${apify.runs} runs (${prevRuns === null ? 'baseline' : `+${apify.runs - prevRuns}/24h`}), ${apify.users} users/30d, ${apify.publicCount} public`
    : 'apify: n/a',
  agentKeys
    ? `agent sign-up: ${agentKeys.requests24h ?? 0} req/24h, ${agentKeys.keys24h ?? 0} keys/24h, ${agentKeys.keys30d ?? 0} keys/30d`
    : 'agent sign-up: n/a',
  oauthNote,
  cfNote,
  errors.length
    ? `refresh errors: ${errors
        .map((e) => {
          const text = errorText(e.message);
          return text ? `${e.source_slug} (${text})` : e.source_slug;
        })
        .join(', ')}`
    : 'refresh ok',
].join('; ');
const row = `| ${date} | Daily numbers | ${users} | — | ${sales} | ${notes} |`;

if (!/^## Metrics/m.test(md)) {
  md =
    md.trimEnd() +
    '\n\n## Metrics\n\n| Date | Event | Users | Rating | Sales | Notes |\n|---|---|---|---|---|---|\n';
}
if (md.includes(`| ${date} | Daily numbers |`)) {
  if (process.env.METRICS_IF_MISSING) {
    console.log(`row for ${date} already present; METRICS_IF_MISSING set, leaving it`);
    process.exit(0);
  }
  md = md.replace(new RegExp(`^\\| ${date} \\| Daily numbers \\|.*$`, 'm'), row);
} else {
  const i = md.search(/^## Metrics/m);
  const rest = md.slice(i);
  const lastRow = rest.lastIndexOf('\n|');
  const end = i + (lastRow === -1 ? rest.length : rest.indexOf('\n', lastRow + 1));
  md =
    md.slice(0, end === -1 ? undefined : end).trimEnd() +
    '\n' +
    row +
    '\n' +
    (end === -1 ? '' : md.slice(end).replace(/^\n/, '\n'));
}
await writeFile(file, md.endsWith('\n') ? md : md + '\n');
console.log(row);
