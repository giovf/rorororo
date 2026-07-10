#!/usr/bin/env node
// Stage 0 scoreboard: signups vs the validation gate (20 signups or 5
// pre-commits), from production D1 via the Cloudflare REST API.
//
//   npm run scoreboard          (loads CLOUDFLARE_API_TOKEN via --env-file=.env)
//
// Read-only companion to `npm run traffic`; see docs/STAGE0-PLAYBOOK.md.

const ACCOUNT_ID = '37e56f3ce4dfe49919e85d4380467f44'; // not a secret
const DATABASE_ID = 'ac051277-5f69-46ba-965b-50da2f1ec524'; // wrangler.jsonc

const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) {
  console.error('CLOUDFLARE_API_TOKEN missing — run via `npm run scoreboard` (reads .env)');
  process.exit(1);
}

const GREEN = '\x1b[32m';
const AMBER = '\x1b[33m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

async function sql(query) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ sql: query }),
    },
  );
  const body = await res.json();
  if (!body.success) throw new Error(`D1 API: ${JSON.stringify(body.errors).slice(0, 300)}`);
  return body.result[0].results;
}

const [totals] = await sql(`
  SELECT COUNT(*) AS accounts,
         SUM(CASE WHEN created_at > datetime('now', '-7 days') THEN 1 ELSE 0 END) AS last7,
         SUM(CASE WHEN plan != 'free' THEN 1 ELSE 0 END) AS paid
  FROM accounts
`);
const waitlist = await sql(`
  SELECT COALESCE(NULLIF(source, ''), '(none)') AS source, COUNT(*) AS n
  FROM waitlist GROUP BY 1 ORDER BY n DESC
`);
const recent = await sql(`
  SELECT date(created_at) AS day, COUNT(*) AS n
  FROM accounts WHERE created_at > datetime('now', '-14 days')
  GROUP BY 1 ORDER BY 1
`);

const GATE = 20;
const pct = Math.min(100, Math.round((totals.accounts / GATE) * 100));

console.log(`\n${GREEN}gankdat${RESET} Stage 0 scoreboard\n`);
console.log(
  `  signups (accounts):  ${GREEN}${totals.accounts}${RESET} / ${GATE} gate  ${DIM}(${pct}%)${RESET}`,
);
console.log(`  last 7 days:         ${totals.last7 ?? 0}`);
console.log(`  paid conversions:    ${AMBER}${totals.paid ?? 0}${RESET}`);
const wlTotal = waitlist.reduce((n, r) => n + r.n, 0);
console.log(
  `  waitlist:            ${wlTotal}${wlTotal ? '  ' + waitlist.map((r) => `${r.source}:${r.n}`).join(' ') : ''}`,
);
if (recent.length) {
  console.log(`\n  signups by day (14d):`);
  for (const r of recent) console.log(`    ${r.day}  ${'█'.repeat(r.n)} ${r.n}`);
}
console.log(
  `\n${DIM}  gate: 20 signups OR 5 "I'd pay" pre-commits (log pre-commits in STAGE0-PLAYBOOK.md)${RESET}\n`,
);
