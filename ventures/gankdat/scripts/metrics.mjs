#!/usr/bin/env node
// Daily gankdat numbers → one row in ventures/gankdat/RESEARCH.md "## Metrics" (the table the
// Foundry Ops page reads). Runs in CI (.github/workflows/gankdat-metrics.yml) with
// CLOUDFLARE_API_TOKEN; also `npm run metrics -w @foundry/gankdat` locally (reads .env).
//   accounts / paid accounts        — D1 (accounts table)
//   MCP authed calls, paywall hits  — Analytics Engine gankdat_traffic (last 24 h)
//   x402 paid requests              — Analytics Engine (last 24 h)
//   refresh health                  — D1 refresh_log (last 24 h errors)

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

const date = new Date().toISOString().slice(0, 10);
const users = `${acct.total} accts (${acct.paid ?? 0} paid, +${acct.new24h ?? 0}/24h)`;
const sales = `${kinds.x402_paid ?? 0} x402 paid`;
const notes = [
  // preview = keyless data-tool calls (5 rows, 20/day per client, since 2026-09-30 for the
  // Claude Connectors Directory); paywall hits = the plan text shown when that budget is spent
  // or a presented key is bad. Both are blob1 kinds written by routes/mcp.ts + mcp/server.ts.
  `MCP 24h: ${kinds.mcp_authed ?? 0} authed, ${kinds.mcp_anon ?? 0} anon, ${kinds.mcp_preview ?? 0} preview, ${paywall} paywall hits${wantedNote}`,
  `changes 7d: ${changesMcp + changesRest} (mcp ${changesMcp}, rest ${changesRest})`,
  agentKeys
    ? `agent sign-up: ${agentKeys.requests24h ?? 0} req/24h, ${agentKeys.keys24h ?? 0} keys/24h, ${agentKeys.keys30d ?? 0} keys/30d`
    : 'agent sign-up: n/a',
  oauthNote,
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

const file = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'RESEARCH.md');
let md = await readFile(file, 'utf8');
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
