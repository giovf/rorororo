// Builds the owner dashboard's data snapshot (packages/landing/src/ops-data.json) from the repo:
// ventures with their latest metrics and money, the pipeline queues, the owner's open requests,
// the owner notes with Claude's answers, and recent run-log lines. The landing deploy workflow
// runs it before `wrangler deploy` every six hours and on landing changes (owner 2026-10-16:
// a maintained dashboard at apps.gankdat.com/ops — ventures by type, pipeline by queue, an
// owner page with one-time-code sign-in and an idea box). Nothing secret goes in: the file is
// bundled into the Worker and served only behind the owner's session, but it is also committed.
//
// Run: npm run ops:data   (then `wrangler deploy` in packages/landing)
// Node 22 runs .ts directly — keep syntax erasable, import only node builtins and @foundry/core.
import { execSync } from 'node:child_process';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CAPITAL_CAP_GBP,
  loadPortfolio,
  parseExchange,
  parseLedger,
  parseQueue,
  parseRecurring,
  summarizeLedger,
  type QueueItem,
  type VentureManifest,
  type VentureQueue,
} from '@foundry/core';
import { ageDays, isOpen, parseEntries } from './handoffs.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const OUT_FILE = path.join('packages', 'landing', 'src', 'ops-data.json');

export type Group =
  | 'Data API'
  | 'Browser extensions'
  | 'Figma plugins'
  | 'Prize entries'
  | 'Bounties'
  | 'Digital downloads'
  | 'Other';
export function groupOf(channel: string): Group {
  switch (channel) {
    case 'api-marketplace':
    case 'web':
      return 'Data API';
    case 'chrome-web-store':
      return 'Browser extensions';
    case 'figma-community':
      return 'Figma plugins';
    case 'hackathon':
      return 'Prize entries';
    case 'bounty-board':
      return 'Bounties';
    case 'etsy':
      return 'Digital downloads';
    default:
      return 'Other';
  }
}

export interface MetricRow {
  date: string;
  event: string;
  users: string;
  rating: string;
  sales: string;
  notes: string;
}

/** Rows of the venture's Metrics table (any `## Metrics` heading), oldest first. */
export function parseMetrics(md: string): MetricRow[] {
  const i = md.search(/^## (\d+\. )?Metrics/m);
  if (i === -1) return [];
  return md
    .slice(i)
    .split('\n')
    .filter((l) => /^\| \d{4}-\d{2}-\d{2} \|/.test(l))
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
}

export interface Note {
  when: string;
  text: string;
  answer: string;
}

/** `- YYYY-MM-DD HH:MM | text` entries of OWNER-NOTES.md with their `  - Claude:` answers, newest first. */
export function parseNotes(md: string): Note[] {
  const out: Note[] = [];
  let cur: Note | undefined;
  let inAnswer = false;
  for (const line of md.split('\n')) {
    const m = /^- (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) \| (.*)$/.exec(line);
    if (m) {
      cur = { when: m[1] ?? '', text: (m[2] ?? '').trim(), answer: '' };
      out.push(cur);
      inAnswer = false;
      continue;
    }
    if (!cur) continue;
    const a = /^ {2}- Claude: ?(.*)$/.exec(line);
    if (a) {
      cur.answer = (a[1] ?? '').trim();
      inAnswer = true;
      continue;
    }
    if (inAnswer && /^ {4}\S/.test(line)) cur.answer = `${cur.answer} ${line.trim()}`.trim();
    else if (!inAnswer && /^ {2}\S/.test(line) && !line.startsWith('  - '))
      cur.text = `${cur.text} ${line.trim()}`;
  }
  return out.reverse();
}

const pick = (
  it: QueueItem,
): {
  id: string;
  title: string;
  score: number;
  status: string;
  blocked_on?: string;
  not_before?: string;
  done_at?: string;
  added: string;
} => ({
  id: it.id,
  title: it.title.length > 160 ? `${it.title.slice(0, 157)}…` : it.title,
  score: it.score,
  status: it.status,
  ...(it.blocked_on ? { blocked_on: it.blocked_on.slice(0, 160) } : {}),
  ...(it.not_before ? { not_before: it.not_before } : {}),
  ...(it.done_at ? { done_at: it.done_at } : {}),
  added: it.added,
});

export function queueView(q: VentureQueue, today: string): Record<string, unknown> {
  const weekAgo = new Date(Date.parse(`${today}T00:00:00Z`) - 7 * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const by = (s: string): QueueItem[] => q.items.filter((it) => it.status === s);
  const todo = by('todo')
    .filter((it) => !it.not_before || it.not_before <= today)
    .sort((a, b) => b.score - a.score);
  return {
    venture: q.venture,
    status: q.status,
    weight: q.weight ?? 1,
    needs_research: q.needs_research,
    counts: {
      todo: by('todo').length,
      doing: by('doing').length,
      blocked: by('blocked').length,
      done: by('done').length,
      dropped: by('dropped').length,
    },
    next: todo[0] ? pick(todo[0]) : null,
    doing: by('doing').map(pick),
    blocked: by('blocked').map(pick),
    scheduled: by('todo')
      .filter((it) => it.not_before && it.not_before > today)
      .sort((a, b) => (a.not_before ?? '').localeCompare(b.not_before ?? ''))
      .map(pick),
    done_recent: by('done')
      .filter((it) => (it.done_at ?? '') >= weekAgo)
      .sort((a, b) => (b.done_at ?? '').localeCompare(a.done_at ?? ''))
      .map(pick),
  };
}

async function main(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const read = (rel: string): Promise<string> => readFile(path.join(ROOT, rel), 'utf8');
  const { ventures } = await loadPortfolio(path.join(ROOT, 'ventures'));
  const ledgerMd = await read('docs/LEDGER.md');
  const rows = parseLedger(ledgerMd);
  const money = summarizeLedger(rows, CAPITAL_CAP_GBP, parseRecurring(ledgerMd));
  const ventureViews = await Promise.all(
    ventures.map(async (v: VentureManifest) => {
      const metrics = parseMetrics(await read(`ventures/${v.slug}/RESEARCH.md`).catch(() => ''));
      const latest = metrics.at(-1) ?? null;
      const mine = rows.filter((r) => r.venture === v.slug);
      const sum = (kind: string): number =>
        Math.round(mine.filter((r) => r.kind === kind).reduce((a, r) => a + r.gbp, 0) * 100) / 100;
      return {
        slug: v.slug,
        name: v.name,
        channel: v.channel,
        group: groupOf(v.channel),
        status: v.status,
        statusChangedOn: v.statusChangedOn,
        pricing: v.pricing,
        thesis: v.thesis.length > 220 ? `${v.thesis.slice(0, 217)}…` : v.thesis,
        latest: latest
          ? {
              ...latest,
              notes: latest.notes.length > 240 ? `${latest.notes.slice(0, 237)}…` : latest.notes,
            }
          : null,
        metricRows: metrics.length,
        revenue: sum('revenue'),
        cost: sum('cost'),
      };
    }),
  );
  const queuesDir = path.join(ROOT, 'docs', 'pipeline', 'queues');
  const queues = [];
  for (const f of (await readdir(queuesDir)).filter((f) => f.endsWith('.json')).sort()) {
    queues.push(queueView(parseQueue(await readFile(path.join(queuesDir, f), 'utf8'), f), today));
  }
  const entries = parseEntries(await read('docs/ALERTS.md'));
  const now = new Date();
  // Plain text for the dashboard: no markdown emphasis or code ticks, and a closed entry's
  // "— Done …" tail (the handoff ledger's closing note) left out.
  const plain = (t: string): string =>
    t
      .replace(/^- \d{4}-\d{2}-\d{2} [^:]+: ?/, '')
      .replace(/\s+—\s+(Done|Superseded)\b[\s\S]*$/, '')
      .replace(/\*\*/g, '')
      .replace(/`/g, '')
      .trim()
      .slice(0, 400);
  const toView = (e: {
    date: string;
    kind: string;
    text: string;
    closed?: { on?: string };
  }): Record<string, unknown> => ({
    date: e.date,
    kind: e.kind,
    age_days: ageDays(e.date, now),
    text: plain(e.text),
    ...(e.closed?.on ? { closed_on: e.closed.on } : {}),
  });
  const open = entries.filter(isOpen);
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000).toISOString().slice(0, 10);
  const owner = {
    open: open.filter((e) => /^owner\b/.test(e.kind)).map(toView),
    waiting_on_claude: open.filter((e) => /^handoff\b/.test(e.kind)).map(toView),
    closed_recent: entries
      .filter(
        (e) => e.closed && (e.closed.on ?? '') >= weekAgo && /^(owner|handoff)\b/.test(e.kind),
      )
      .sort(
        (a, b) =>
          (b.closed?.on ?? '').localeCompare(a.closed?.on ?? '') || b.date.localeCompare(a.date),
      )
      .slice(0, 8)
      .map(toView),
  };
  const notes = parseNotes(await read('docs/OWNER-NOTES.md').catch(() => '')).slice(0, 30);
  const runs = (await read('docs/RUNS.md'))
    .split('\n')
    .filter((l) => /^- \d{4}-\d{2}-\d{2} \d{2}:\d{2} \| /.test(l))
    .slice(-12)
    .reverse()
    .map((l) => {
      const m = /^- (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) \| ([^|]+) \| (.*)$/.exec(l);
      return m ? { when: m[1], who: (m[2] ?? '').trim(), text: (m[3] ?? '').trim() } : null;
    })
    .filter(Boolean);
  // The exchange: ideas by status, the latest decision, and when it next runs (Wednesdays 08:00 UTC).
  const exchange = parseExchange(await read('docs/pipeline/exchange.json'));
  const exchangeFiles = (await readdir(path.join(ROOT, 'docs', 'exchange')))
    .filter((f) => /^\d{4}-W\d{2}\.md$/.test(f))
    .sort();
  const latestFile = exchangeFiles.at(-1);
  const latestMd = latestFile ? await read(`docs/exchange/${latestFile}`) : '';
  const decision = (/^## Decision\s*\n([\s\S]*?)(?=\n## |$)/m.exec(latestMd)?.[1] ?? '')
    .replace(/\s+/g, ' ')
    .replace(/\*\*/g, '')
    .trim()
    .slice(0, 700);
  const nextWednesday = ((): string => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 8));
    while (d.getUTCDay() !== 3 || d.getTime() <= now.getTime()) d.setUTCDate(d.getUTCDate() + 1);
    return d.toISOString().slice(0, 16).replace('T', ' ');
  })();
  const ideaView = (i: {
    id: string;
    title: string;
    status: string;
    trigger?: string;
    venture?: string;
    added: string;
  }): Record<string, unknown> => ({
    id: i.id,
    title: i.title.length > 140 ? `${i.title.slice(0, 137)}…` : i.title,
    status: i.status,
    added: i.added,
    ...(i.trigger
      ? { trigger: i.trigger.length > 200 ? `${i.trigger.slice(0, 197)}…` : i.trigger }
      : {}),
    ...(i.venture ? { venture: i.venture } : {}),
  });
  const byAddedDesc = (a: { added: string }, b: { added: string }): number =>
    b.added.localeCompare(a.added);
  const exchangeView = {
    last_run: latestFile ? latestFile.replace('.md', '') : null,
    decision,
    next_run: `${nextWednesday} UTC`,
    promoted: exchange.ideas
      .filter((i) => i.status === 'promoted')
      .sort(byAddedDesc)
      .map(ideaView),
    parked: exchange.ideas
      .filter((i) => i.status === 'parked')
      .sort(byAddedDesc)
      .map(ideaView),
    declined: exchange.ideas
      .filter((i) => i.status === 'declined')
      .sort(byAddedDesc)
      .slice(0, 10)
      .map(ideaView),
  };
  const sha = execSync('git rev-parse --short=12 HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  const data = {
    generated_at: now.toISOString(),
    commit: sha,
    money: { ...money, cap: CAPITAL_CAP_GBP },
    ventures: ventureViews,
    queues,
    owner,
    exchange: exchangeView,
    notes,
    runs,
  };
  await writeFile(path.join(ROOT, OUT_FILE), `${JSON.stringify(data, null, 2)}\n`);
  console.log(
    `ops data: ${ventureViews.length} ventures, ${queues.length} queues, ${owner.open.length} open owner items, ${notes.length} notes → ${OUT_FILE}`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e: unknown) => {
    console.error(e instanceof Error ? e.message : String(e));
    process.exitCode = 1;
  });
}
