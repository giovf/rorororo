#!/usr/bin/env node
// Terminal dashboard for the gankdat_traffic Analytics Engine dataset:
// daily anonymous-vs-authed /mcp volume and top crawler user-agents.
//
//   npm run traffic            (loads CLOUDFLARE_API_TOKEN via --env-file=.env)
//
// Local-only by design — no deployed admin surface, no token in a browser
// (see RUNBOOK.md "Traffic analytics"). Read-only: worst case a leaked token
// with this permission reads request counts.

const ACCOUNT_ID = '37e56f3ce4dfe49919e85d4380467f44'; // not a secret
const DATASET = 'gankdat_traffic';

const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) {
  console.error('CLOUDFLARE_API_TOKEN missing — run via `npm run traffic` (reads .env)');
  process.exit(1);
}

const GREEN = '\x1b[32m';
const MAGENTA = '\x1b[35m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

async function sql(query) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/analytics_engine/sql`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: `${query} FORMAT JSON` },
  );
  const text = await res.text();
  if (!res.ok) {
    // A dataset only exists after its first write — friendlier than a raw 4xx.
    if (/does not exist|no such table|not found/i.test(text)) return null;
    throw new Error(`SQL API ${res.status}: ${text.slice(0, 300)}`);
  }
  return JSON.parse(text).data ?? [];
}

function bar(value, max, width = 30) {
  const filled = max > 0 ? Math.round((value / max) * width) : 0;
  return '█'.repeat(filled).padEnd(width);
}

const kindColor = (kind) => (kind === 'mcp_anon' ? GREEN : MAGENTA);

const daily = await sql(`
  SELECT toStartOfInterval(timestamp, INTERVAL '1' DAY) AS day,
         blob1 AS kind,
         SUM(_sample_interval * double1) AS requests
  FROM ${DATASET}
  WHERE timestamp > NOW() - INTERVAL '14' DAY
  GROUP BY day, kind
  ORDER BY day ASC
`);

if (daily === null) {
  console.log(
    `${DIM}No data yet — the dataset appears on its first /mcp request after deploy.${RESET}`,
  );
  process.exit(0);
}

console.log(
  `\n${GREEN}gankdat${RESET} /mcp traffic — last 14 days  ${DIM}(${GREEN}█${RESET}${DIM} anon · ${MAGENTA}█${RESET}${DIM} authed)${RESET}\n`,
);

const byDay = new Map();
for (const row of daily) {
  const day = String(row.day).slice(0, 10);
  if (!byDay.has(day)) byDay.set(day, {});
  byDay.get(day)[row.kind] = Number(row.requests);
}
const dayMax = Math.max(1, ...[...byDay.values()].flatMap((k) => Object.values(k)));
for (const [day, kinds] of byDay) {
  for (const kind of ['mcp_anon', 'mcp_authed']) {
    if (!kinds[kind]) continue;
    const n = Math.round(kinds[kind]);
    const label = kind === 'mcp_anon' ? day : ' '.repeat(10);
    console.log(`  ${label}  ${kindColor(kind)}${bar(n, dayMax)}${RESET} ${n}`);
  }
}
if (byDay.size === 0) console.log(`  ${DIM}(no requests in window)${RESET}`);

const agents = await sql(`
  SELECT blob2 AS ua, blob1 AS kind,
         SUM(_sample_interval * double1) AS requests
  FROM ${DATASET}
  WHERE timestamp > NOW() - INTERVAL '7' DAY
  GROUP BY ua, kind
  ORDER BY requests DESC
  LIMIT 15
`);

console.log(`\ntop user-agents — last 7 days\n`);
if (!agents?.length) {
  console.log(`  ${DIM}(none yet)${RESET}`);
} else {
  const uaWidth = Math.min(60, Math.max(...agents.map((a) => (a.ua || '(none)').length)));
  for (const a of agents) {
    const ua = (a.ua || '(none)').slice(0, 60).padEnd(uaWidth);
    const kind = a.kind === 'mcp_anon' ? `${GREEN}anon  ${RESET}` : `${MAGENTA}authed${RESET}`;
    console.log(`  ${ua}  ${kind}  ${Math.round(Number(a.requests))}`);
  }
}
console.log();
