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

const [acct] = await sql(
  "SELECT COUNT(*) AS total, SUM(plan != 'free') AS paid, SUM(created_at > datetime('now','-1 day')) AS new24h FROM accounts",
);
const errors = await sql(
  "SELECT source_slug FROM refresh_log WHERE status = 'error' AND created_at > datetime('now','-1 day') GROUP BY source_slug",
);
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

const date = new Date().toISOString().slice(0, 10);
const users = `${acct.total} accts (${acct.paid ?? 0} paid, +${acct.new24h ?? 0}/24h)`;
const sales = `${kinds.x402_paid ?? 0} x402 paid`;
const notes = [
  `MCP 24h: ${kinds.mcp_authed ?? 0} authed, ${kinds.mcp_anon ?? 0} anon, ${paywall} paywall hits`,
  errors.length ? `refresh errors: ${errors.map((e) => e.source_slug).join(', ')}` : 'refresh ok',
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
