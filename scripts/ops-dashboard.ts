// Generates the owner's operations page from repo data (ventures, ledger, backlog,
// owner actions, git activity). Output: an HTML file to publish as a private artifact.
//   node --disable-warning=ExperimentalWarning scripts/ops-dashboard.ts <out.html>
import { execSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  loadPortfolio,
  parseLedger,
  summarizeLedger,
  CAPITAL_CAP_GBP,
  type VentureManifest,
} from '@foundry/core';

const root = path.resolve(import.meta.dirname, '..');
const out = process.argv[2] ?? path.join(root, 'ops.html');
const esc = (s: string): string =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);
const today = new Date().toISOString().slice(0, 10);

// ---- ventures + metrics ----
const { ventures } = await loadPortfolio(path.join(root, 'ventures'));
interface MetricRow {
  date: string;
  event: string;
  users: string;
  rating: string;
  sales: string;
  notes: string;
}
async function metricsFor(v: VentureManifest): Promise<MetricRow[]> {
  try {
    const md = await readFile(path.join(root, 'ventures', v.slug, 'RESEARCH.md'), 'utf8');
    const i = md.search(/^## (\d+\. )?Metrics/m);
    if (i === -1) return [];
    return md
      .slice(i)
      .split('\n')
      .filter((l) => /^\| \d{4}-/.test(l))
      .map((l) => {
        const c = l.split('|').map((x) => x.trim());
        return {
          date: c[1] ?? '',
          event: c[2] ?? '',
          users: c[3] ?? '',
          rating: c[4] ?? '',
          sales: c[5] ?? '',
          notes: c[6] ?? '',
        };
      });
  } catch {
    return [];
  }
}
const ventureRows = await Promise.all(
  ventures.map(async (v) => ({ v, metrics: await metricsFor(v) })),
);

// ---- ledger ----
const ledgerRows = parseLedger(await readFile(path.join(root, 'docs', 'LEDGER.md'), 'utf8'));
const money = summarizeLedger(ledgerRows);

// ---- backlog ----
interface Task {
  id: number;
  title: string;
  status: string;
  subtasks?: { id: number; title: string; status: string }[];
}
const tasksJson = JSON.parse(
  await readFile(path.join(root, '.taskmaster', 'tasks', 'tasks.json'), 'utf8'),
) as { master?: { tasks: Task[] }; tasks?: Task[] };
const tasks = tasksJson.master?.tasks ?? tasksJson.tasks ?? [];
const counts: Record<string, number> = {};
for (const t of tasks) counts[t.status] = (counts[t.status] ?? 0) + 1;
const active = tasks.filter((t) => t.status === 'in-progress');

// ---- owner actions ----
interface Action {
  id: string;
  title: string;
  status: string;
  open: boolean;
}
const actionsDir = path.join(root, 'docs', 'for-owner', 'actions');
const actions: Action[] = [];
for (const f of (await readdir(actionsDir)).filter((f) => /^\d{3}-.*\.md$/.test(f)).sort()) {
  const md = await readFile(path.join(actionsDir, f), 'utf8');
  const title = (md.match(/^# Owner action request #\d+ — (.+)$/m)?.[1] ?? f).replace(/\*\*/g, '');
  const status = (md.match(/^- \*\*Status:\*\* (.+)$/m)?.[1] ?? 'unknown')
    .replace(/\*\*/g, '')
    .replace(/~~[^~]+~~/g, '')
    .trim();
  const open =
    !/^(done|all done|submitted|DONE)/i.test(status) &&
    !/— DONE/.test(status) &&
    !/^\*?\*?SUBMITTED/i.test(status);
  actions.push({ id: f.slice(0, 3), title, status, open });
}

// ---- activity ----
const log = execSync('git log -14 --date=short --format=%ad%x09%s', { cwd: root, encoding: 'utf8' })
  .trim()
  .split('\n')
  .map((l) => {
    const [date, ...rest] = l.split('\t');
    return { date: date ?? '', msg: rest.join('\t') };
  });

// ---- render ----
const gbp = (n: number): string => `£${n.toFixed(2)}`;
const pill = (status: string): string => {
  const cls =
    {
      earning: 'good',
      launched: 'good',
      building: 'accent',
      validated: 'accent',
      idea: 'muted',
      killed: 'crit',
    }[status] ?? 'muted';
  return `<span class="pill ${cls}">${esc(status)}</span>`;
};
const channelName: Record<string, string> = {
  'figma-community': 'Figma Community',
  'chrome-web-store': 'Chrome Web Store',
  web: 'Web',
  'vscode-marketplace': 'VS Code',
  'api-marketplace': 'API marketplace',
};
const price = (v: VentureManifest): string =>
  v.pricing.kind === 'one-time'
    ? `$${v.pricing.priceUsd} once`
    : v.pricing.kind === 'subscription'
      ? `$${v.pricing.monthlyUsd}/mo`
      : 'free';

const ventureHtml = ventureRows
  .map(({ v, metrics }) => {
    const last = metrics[metrics.length - 1];
    return `<article class="venture">
    <header><h3>${esc(v.name)}</h3>${pill(v.status)}</header>
    <p class="meta"><span>${esc(channelName[v.channel] ?? v.channel)}</span><span class="mono">${esc(price(v))}</span></p>
    <p class="thesis">${esc(v.thesis)}</p>
    ${last ? `<p class="latest"><span class="mono">${esc(last.date)}</span> ${esc(last.event)}${last.notes ? ` <span class="muted">— ${esc(last.notes)}</span>` : ''}</p>` : ''}
    ${metrics.length ? `<table class="metrics"><thead><tr><th>Date</th><th>Event</th><th>Users</th><th>Rating</th><th>Sales</th></tr></thead><tbody>${metrics.map((m) => `<tr><td class="mono">${esc(m.date)}</td><td>${esc(m.event)}</td><td class="mono">${esc(m.users)}</td><td class="mono">${esc(m.rating)}</td><td class="mono">${esc(m.sales)}</td></tr>`).join('')}</tbody></table>` : ''}
  </article>`;
  })
  .join('');

const openActions = actions.filter((a) => a.open);
const actionsHtml = actions.length
  ? actions
      .map(
        (a) =>
          `<li data-action="${a.id}" class="${a.open ? 'open' : 'done'}"><span class="mono">#${a.id}</span> <strong>${esc(a.title)}</strong><br /><span class="muted">${esc(a.status)}</span>${a.open ? `<button class="mark" data-id="${a.id}" type="button">Mark done</button>` : ''}</li>`,
      )
      .join('')
  : '<li class="muted">Nothing open.</li>';

const html = `<title>Foundry Ops</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" />
<style>
:root { --ground:#F3F5F7; --surface:#FFFFFF; --ink:#131A22; --muted:#5F6B78; --line:#DDE3E9; --accent:#0E7C86; --accent-ink:#FFFFFF; --good:#2F855A; --warn:#B7791F; --crit:#C53030; --chip:#EEF2F5; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --ground:#0E1318; --surface:#151C24; --ink:#E7ECF1; --muted:#93A0AD; --line:#24303B; --accent:#3DB1BB; --accent-ink:#0E1318; --good:#5CBF86; --warn:#D9A441; --crit:#E06666; --chip:#1D2731; } }
:root[data-theme="dark"] { --ground:#0E1318; --surface:#151C24; --ink:#E7ECF1; --muted:#93A0AD; --line:#24303B; --accent:#3DB1BB; --accent-ink:#0E1318; --good:#5CBF86; --warn:#D9A441; --crit:#E06666; --chip:#1D2731; }
body { background: var(--ground); color: var(--ink); font: 15px/1.5 "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif; margin: 0; padding-block: 0 3rem; padding-inline: 16px; }
.mono { font-family: "IBM Plex Mono", ui-monospace, Menlo, monospace; font-variant-numeric: tabular-nums; }
.wrap { max-width: 1120px; margin: 0 auto; }
.top { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px 16px; padding-block: 1.6rem 1rem; }
.top h1 { font-size: 1.35rem; margin: 0; font-weight: 600; letter-spacing: -0.01em; }
.top .asof { color: var(--muted); }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 1.4rem; }
.stat { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; }
.stat .label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
.stat .value { font-size: 1.45rem; font-weight: 600; margin-top: 2px; }
.stat .sub { color: var(--muted); font-size: 0.85rem; }
.cols { display: grid; grid-template-columns: 1fr; gap: 1.4rem; }
@media (min-width: 900px) { .cols { grid-template-columns: 3fr 2fr; } }
section h2 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin: 0 0 0.6rem; font-weight: 600; }
.stack { display: flex; flex-direction: column; gap: 1.4rem; }
.venture { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; }
.venture header { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.venture h3 { margin: 0; font-size: 1.05rem; font-weight: 600; }
.venture .meta { display: flex; gap: 12px; color: var(--muted); margin: 4px 0 6px; font-size: 0.9rem; }
.venture .thesis { margin: 0 0 8px; max-width: 65ch; }
.venture .latest { margin: 0; font-size: 0.9rem; }
.metrics { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 0.85rem; }
.metrics th, .metrics td { text-align: left; padding: 4px 6px; border-top: 1px solid var(--line); }
.metrics th { color: var(--muted); font-weight: 500; border-top: 0; }
.pill { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 8px; border-radius: 999px; background: var(--chip); color: var(--muted); font-weight: 600; white-space: nowrap; }
.pill.good { color: var(--good); } .pill.accent { color: var(--accent); } .pill.crit { color: var(--crit); }
.muted { color: var(--muted); }
.card { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; }
.card ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.card li { padding-bottom: 10px; border-bottom: 1px solid var(--line); }
.card li:last-child { border-bottom: 0; padding-bottom: 0; }
.card li.done { opacity: 0.6; }
button, textarea { font: inherit; }
button { background: var(--accent); color: var(--accent-ink); border: 0; border-radius: 8px; padding: 6px 12px; cursor: pointer; font-weight: 600; }
button.mark { margin-top: 6px; background: var(--chip); color: var(--ink); }
button:disabled { opacity: 0.5; cursor: default; }
button:focus-visible, textarea:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
textarea { width: 100%; box-sizing: border-box; min-height: 88px; border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; background: var(--ground); color: var(--ink); resize: vertical; }
.inbox-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-top: 8px; }
.note { font-size: 0.9rem; }
.note .mono { color: var(--muted); margin-right: 6px; }
.activity li { display: grid; grid-template-columns: 6.5em 1fr; gap: 8px; font-size: 0.9rem; padding-bottom: 6px; border-bottom: 0; }
.backlog { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
.ledger td, .ledger th { padding: 4px 6px; text-align: left; border-top: 1px solid var(--line); font-size: 0.85rem; }
.ledger th { color: var(--muted); font-weight: 500; border-top: 0; }
.ledger { width: 100%; border-collapse: collapse; }
.tablewrap { overflow-x: auto; }
@media (prefers-reduced-motion: no-preference) { button { transition: opacity 120ms; } }
</style>
<div class="wrap">
  <div class="top"><h1>Foundry Ops</h1><span class="asof">as of <span class="mono">${today}</span> · regenerated by Claude after each working session</span></div>

  <div class="stats">
    <div class="stat"><div class="label">Revenue</div><div class="value mono">${gbp(money.revenue)}</div><div class="sub">net of platform fees</div></div>
    <div class="stat"><div class="label">Spent</div><div class="value mono">${gbp(money.spent)}</div><div class="sub">${gbp(money.planned)} planned · cap ${gbp(CAPITAL_CAP_GBP)}</div></div>
    <div class="stat"><div class="label">Net</div><div class="value mono">${gbp(money.net)}</div><div class="sub">revenue − spent</div></div>
    <div class="stat"><div class="label">Ventures</div><div class="value mono">${ventures.length}</div><div class="sub">${ventures.filter((v) => ['launched', 'earning'].includes(v.status)).length} live · ${ventures.filter((v) => v.status === 'building').length} in review/build</div></div>
    <div class="stat"><div class="label">Needs you</div><div class="value mono">${openActions.length}</div><div class="sub">open requests</div></div>
  </div>

  <div class="cols">
    <div class="stack">
      <section><h2>Ventures</h2>${ventureHtml}</section>
      <section><h2>Activity</h2><div class="card"><ul class="activity">${log.map((l) => `<li><span class="mono muted">${esc(l.date)}</span><span>${esc(l.msg)}</span></li>`).join('')}</ul></div></section>
    </div>
    <div class="stack">
      <section><h2>Your queue</h2><div class="card"><ul id="actions">${actionsHtml}</ul></div></section>
      <section><h2>Note to Claude</h2><div class="card">
        <p class="muted" style="margin:0 0 8px">Anything you want done, changed or answered. Claude reads this at the start of each session.</p>
        <textarea id="note" placeholder="e.g. Figma approved the plugin today." aria-label="Note to Claude"></textarea>
        <div class="inbox-row"><span id="inbox-status" class="muted note"></span><button id="send" type="button">Send</button></div>
        <ul id="notes" style="margin-top:12px"></ul>
      </div></section>
      <section><h2>Backlog</h2><div class="card">
        <div class="backlog">${Object.entries(counts)
          .map(([s, n]) => `<span class="pill">${esc(s)} ${n}</span>`)
          .join('')}</div>
        ${active.length ? `<ul>${active.map((t) => `<li><span class="mono muted">#${t.id}</span> ${esc(t.title)}<br /><span class="muted">${(t.subtasks ?? []).filter((s) => s.status === 'done').length}/${(t.subtasks ?? []).length} subtasks done</span></li>`).join('')}</ul>` : '<p class="muted" style="margin:0">Nothing in progress.</p>'}
      </div></section>
      <section><h2>Ledger</h2><div class="card tablewrap"><table class="ledger"><thead><tr><th>Date</th><th>Venture</th><th>Kind</th><th>GBP</th><th>Note</th></tr></thead><tbody>${ledgerRows.map((r) => `<tr><td class="mono">${esc(r.date)}</td><td>${esc(r.venture)}</td><td>${esc(r.kind)}</td><td class="mono">${r.gbp.toFixed(2)}</td><td>${esc(r.note)}</td></tr>`).join('')}</tbody></table></div></section>
    </div>
  </div>
</div>
<script>
(async () => {
  const status = document.getElementById('inbox-status');
  const send = document.getElementById('send');
  const note = document.getElementById('note');
  const list = document.getElementById('notes');
  const db = window.claude && window.claude.use ? await window.claude.use('db') : null;
  if (!db) { status.textContent = 'Notes need the claude.ai viewer to save.'; send.disabled = true; document.querySelectorAll('button.mark').forEach((b) => (b.disabled = true)); return; }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const render = (snap) => {
    list.innerHTML = snap.docs.map((d) => { const x = d.data(); return '<li class="note"><span class="mono">' + esc((x.at || '').slice(0, 16).replace('T', ' ')) + '</span>' + esc(x.text || '') + (x.readBy ? ' <span class="muted">· read by Claude</span>' : '') + '</li>'; }).join('') || '<li class="muted note">No notes yet.</li>';
  };
  db.collection('inbox').orderBy('at', 'desc').limit(20).onSnapshot(render, () => { status.textContent = 'Notes unavailable right now.'; });
  send.onclick = async () => {
    const text = note.value.trim(); if (!text) return;
    send.disabled = true;
    try { await db.collection('inbox').add({ text, at: new Date().toISOString(), from: 'owner' }); note.value = ''; status.textContent = 'Sent.'; }
    catch (e) { status.textContent = 'Could not send (' + (e && e.code ? e.code : 'error') + ').'; }
    send.disabled = false;
  };
  document.querySelectorAll('button.mark').forEach((b) => { b.onclick = async () => {
    b.disabled = true;
    try { await db.doc('actions/' + b.dataset.id).set({ status: 'done-by-owner', at: new Date().toISOString() }); b.textContent = 'Marked — Claude will confirm'; }
    catch { b.textContent = 'Could not save'; b.disabled = false; }
  }; });
})();
</script>
`;
const { writeFile } = await import('node:fs/promises');
await writeFile(out, html);
console.log(
  `ops page → ${out} (${ventures.length} ventures, ${openActions.length} open actions, ${ledgerRows.length} ledger rows)`,
);
