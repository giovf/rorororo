#!/usr/bin/env node
// CI-minutes guard. A private repo on GitHub's free plan has 2,000 Actions minutes a month and
// the cap is a cliff: past it every workflow stops until the month resets, silently. This sums
// the last 7 days of completed runs (GITHUB_TOKEN, actions:read) and, when the 30-day projection
// passes WARN_MINUTES, appends one `| watchdog | ci-minutes:` line to docs/RUNS.md (the watchdog
// job commits it and the notifier sends it). Prints the figures either way.
import { appendFileSync, readFileSync } from 'node:fs';

const repo = process.env.GITHUB_REPOSITORY ?? 'giovf/rorororo';
const token = process.env.GITHUB_TOKEN;
const WARN_MINUTES = Number(process.env.CI_WARN_MINUTES ?? 1700);
const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
const headers = { Authorization: `Bearer ${token}`, accept: 'application/vnd.github+json' };

let page = 1;
let minutes = 0;
let runs = 0;
const byName = new Map();
for (;;) {
  const url = `https://api.github.com/repos/${repo}/actions/runs?per_page=100&page=${page}&created=>=${since.slice(0, 10)}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    console.log(`actions-minutes: GitHub API ${res.status}; skipping`);
    process.exit(0);
  }
  const body = await res.json();
  const items = body.workflow_runs ?? [];
  for (const r of items) {
    if (r.status !== 'completed' || !r.run_started_at || !r.updated_at) continue;
    const m = (Date.parse(r.updated_at) - Date.parse(r.run_started_at)) / 60_000;
    minutes += m;
    runs += 1;
    byName.set(r.name, (byName.get(r.name) ?? 0) + m);
  }
  if (items.length < 100 || page >= 10) break;
  page += 1;
}
const projection = Math.round((minutes * 30) / 7);
const top = [...byName.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([n, m]) => `${n} ${Math.round(m)}`)
  .join(', ');
console.log(
  `actions-minutes: ${Math.round(minutes)} min in 7 days over ${runs} runs → ~${projection}/month (top: ${top})`,
);

if (projection > WARN_MINUTES) {
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  // RUNS.md caps the text after `| watchdog | ` at 120 chars (`npm run runs`, part of `npm run
  // check`): the first warning (2026-10-04 18:21, 131 chars) turned main red, so the text is cut.
  const text =
    `ci-minutes: ~${projection} Actions min/month projected (private cap 2,000, warn ${WARN_MINUTES}); top: ${top}`.slice(
      0,
      120,
    );
  const line = `- ${stamp} | watchdog | ${text}`;
  const runsMd = readFileSync('docs/RUNS.md', 'utf8');
  const today = stamp.slice(0, 10);
  if (!runsMd.includes(`${today}`) || !runsMd.includes('| watchdog | ci-minutes:')) {
    appendFileSync('docs/RUNS.md', line + '\n');
    console.log('warned in docs/RUNS.md');
  } else if (
    !runsMd.split('\n').some((l) => l.startsWith(`- ${today}`) && l.includes('ci-minutes:'))
  ) {
    appendFileSync('docs/RUNS.md', line + '\n');
    console.log('warned in docs/RUNS.md');
  } else {
    console.log('already warned today');
  }
}
