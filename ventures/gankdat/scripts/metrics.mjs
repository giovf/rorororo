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
// stats.totalRuns, stats.totalUsers30Days, isPublic. `?my=1` is documented with a reduced actor
// object, so an entry that carries no stats is read from its own endpoint (publish-actors.mjs
// does the same for pricingInfos); the first run logs which path it took and the keys it saw.
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
    `apify: ${items.length} actors, ${fromDetail} needed their own endpoint (list keys: ${Object.keys(items[0] ?? {}).join(',')})`,
  );
  return { runs, users, publicCount };
}
const apify = await apifyShelf().catch((e) => {
  console.error(`apify: ${e.message}`);
  return null;
});

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
