#!/usr/bin/env node
// CI-minutes guard. A private repo on GitHub's free plan has 2,000 Actions minutes a month and
// the cap is a cliff: past it every workflow stops until the month resets, silently. This sums
// the last 7 days of completed runs (GITHUB_TOKEN, actions:read) and, when the 30-day projection
// passes WARN_MINUTES, appends one `| watchdog | ci-minutes:` line to docs/RUNS.md (the watchdog
// job commits it and the notifier sends it). Prints the figures either way.
//
// Which figure the cap meters (2026-10-12, foundry actions-minutes): GitHub bills every job's
// duration rounded UP to the next whole minute, so a 12-second poller run costs one minute and the
// week's bill is well above its wall-clock sum (10-05..10-12: 805 jobs, 731 wall min, 1,334 billed).
// Per-run rounding (one job per run here, gankdat's two aside) matched the per-job sum within 1 %
// on the six clean days (773 vs 781), so `billed` was max(1, ceil(run minutes)) per run.
// Per job since 2026-10-26 (the 10-26 reading): a run's span can outlive its job — two hourly
// owner-notes runs whose job took 110 s and 10 s stayed open 27 and 22 min (10-19 15:40, 10-21 15:18)
// and the per-run rule billed them 50 for GitHub's 3 — so a run over a minute fetches its jobs and
// bills max(1, ceil(job minutes)) per job, a run under a minute bills 1 without the call (≈ 75 calls a
// week), and a run concluded `skipped` (the installer's own push) bills 0. The week to 10-26 09:00
// read 521 per run but 459 per job; the wall sum stays in the log for comparison.
import { appendFileSync, readFileSync } from 'node:fs';
import { ciMinutesLine } from './actions-minutes-line.ts';

const repo = process.env.GITHUB_REPOSITORY ?? 'giovf/rorororo';
const token = process.env.GITHUB_TOKEN;
const WARN_MINUTES = Number(process.env.CI_WARN_MINUTES ?? 1700);
const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
const headers = { Authorization: `Bearer ${token}`, accept: 'application/vnd.github+json' };

/** Billed minutes of one run from its jobs: each non-skipped job rounded up to a whole minute. */
async function billedJobs(run) {
  const fallback = Math.max(
    1,
    Math.ceil((Date.parse(run.updated_at) - Date.parse(run.run_started_at)) / 60_000),
  );
  const res = await fetch(`${run.jobs_url}?per_page=100`, { headers });
  if (!res.ok) return fallback;
  const body = await res.json();
  const jobs = (body.jobs ?? []).filter(
    (j) => j.conclusion !== 'skipped' && j.started_at && j.completed_at,
  );
  if (jobs.length === 0) return body.jobs?.length ? 0 : fallback;
  return jobs.reduce(
    (sum, j) =>
      sum +
      Math.max(1, Math.ceil((Date.parse(j.completed_at) - Date.parse(j.started_at)) / 60_000)),
    0,
  );
}

let page = 1;
let minutes = 0;
let billed = 0;
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
    const b = r.conclusion === 'skipped' ? 0 : m > 1 ? await billedJobs(r) : 1;
    minutes += m;
    billed += b;
    runs += 1;
    byName.set(r.name, (byName.get(r.name) ?? 0) + b);
  }
  if (items.length < 100 || page >= 10) break;
  page += 1;
}
const projection = Math.round((billed * 30) / 7);
const topEntries = [...byName.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
const top = topEntries.map(([n, m]) => `${n} ${Math.round(m)}`).join(', ');
console.log(
  `actions-minutes: ${billed} billed min in 7 days over ${runs} runs (${Math.round(minutes)} wall) → ~${projection}/month, warn ${WARN_MINUTES} (top: ${top})`,
);

if (projection > WARN_MINUTES) {
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  // RUNS.md caps the text after `| watchdog | ` at 120 chars (`npm run runs`, part of `npm run
  // check`): the first warning (2026-10-04 18:21, 131 chars) turned main red. Until 2026-10-24 the
  // text was `.slice(0, 120)`d inside the top list (foundry `ci-minutes-line-fits-cap`); the line is
  // now built to fit with whole entries, and the wall figure and warn threshold live in the log above.
  const text = ciMinutesLine({ billed, projection, top: topEntries });
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
