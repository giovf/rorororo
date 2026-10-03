// A dataset that errors on refresh in two of its last four Daily numbers rows becomes a scored
// gankdat queue item.
//
// Why: uk-insolvency sat in the Daily numbers `refresh errors` field four days running
// (2026-09-27..30: a 500, an empty body, a 500, a zero-byte body with a declared content-length)
// and no queue item existed — a routine only sees the row it happens to read, the 09-29 build
// fixed the 500 case alone, and the live surface served a stale snapshot meanwhile. The 06:30
// `gankdat metrics` job already writes the row from CI, so it also files an idempotent
// `refresh-<slug>` item for every slug that errored today and in at least one more of the last
// four rows; `npm run pipeline next` then offers it to the next build (foundry item
// refresh-errors-to-queue). 2026-10-03 (foundry refresh-errors-rolling-window): the rule was
// "today and yesterday", which an every-other-day flake never meets (uk-insolvency: fixed 09-30,
// clean 10-01, the same truncation 10-02 and 10-03), and a done item was shielded by a flat 14-day
// cool-off whatever happened after its fix. Now the window is the last four rows, and a done item
// is re-filed as soon as two rows dated after its fix list the slug — a fix proven wrong twice is
// the evidence, not a reason to wait; only a dropped item keeps the 14-day cool-off, because a
// drop is a decision rather than a fix that may not have worked.
//
// Run: npm run refresh-errors [-- --date=YYYY-MM-DD]   (from the repo root, in the metrics job)
// Node 22 runs .ts directly — keep syntax erasable, import only node builtins.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RESEARCH_FILE = path.join('ventures', 'gankdat', 'RESEARCH.md');
export const QUEUE_FILE = path.join('docs', 'pipeline', 'queues', 'gankdat.json');
/** A dropped item younger than this is not re-filed (a drop is a decision, not a fix). */
export const COOL_OFF_DAYS = 14;
/** How many Daily numbers rows (today's included) one slug is judged over. */
export const WINDOW_ROWS = 4;
/** Rows in the window that must list the slug (today's always one of them) before it is filed. */
export const MIN_HITS = 2;
export const SCORE = 6;
export const EFFORT_DAYS = 0.1;

export interface RefreshError {
  slug: string;
  message: string;
}
export interface QueueItem {
  id: string;
  title: string;
  why: string;
  effort_days: number;
  proof: string;
  score: number;
  status: string;
  added: string;
  done_at?: string;
  [key: string]: unknown;
}
export interface Queue {
  venture: string;
  status: string;
  needs_research: boolean;
  updated: string;
  items: QueueItem[];
  [key: string]: unknown;
}

/** The `refresh errors:` field of one Daily numbers row, by date. Missing row → undefined. */
export function errorsOn(researchMd: string, date: string): RefreshError[] | undefined {
  const row = researchMd.split('\n').find((l) => l.startsWith(`| ${date} | Daily numbers |`));
  if (row === undefined) return undefined;
  const m = row.match(/refresh errors: (.*?)\s*\|\s*$/);
  if (!m?.[1]) return [];
  return splitErrors(m[1]);
}

export interface ErrorRow {
  date: string;
  errors: RefreshError[];
}

/** Every Daily numbers row's `refresh errors:` field, oldest first (a clean row has `[]`). */
export function allErrorRows(researchMd: string): ErrorRow[] {
  const rows: ErrorRow[] = [];
  for (const line of researchMd.split('\n')) {
    const m = line.match(/^\| (\d{4}-\d{2}-\d{2}) \| Daily numbers \|/);
    if (!m?.[1]) continue;
    const errs = errorsOn(line, m[1]);
    rows.push({ date: m[1], errors: errs ?? [] });
  }
  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

/** The last `n` rows dated on or before `today`, oldest first; empty unless today's row exists. */
export function lastRows(researchMd: string, today: string, n = WINDOW_ROWS): ErrorRow[] {
  const rows = allErrorRows(researchMd).filter((r) => r.date <= today);
  if (!rows.some((r) => r.date === today)) return [];
  return rows.slice(-n);
}

/** `a (msg, with commas), b, c (msg)` → one entry per source; parentheses may nest commas. */
export function splitErrors(field: string): RefreshError[] {
  const out: RefreshError[] = [];
  let depth = 0;
  let cur = '';
  const push = (): void => {
    const s = cur.trim();
    cur = '';
    if (!s) return;
    const m = s.match(/^([a-z0-9-]+)(?:\s*\((.*)\))?$/s);
    if (m?.[1]) out.push({ slug: m[1], message: (m[2] ?? '').trim() });
  };
  for (const ch of field) {
    if (ch === '(') depth += 1;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    if (ch === ',' && depth === 0) push();
    else cur += ch;
  }
  push();
  return out;
}

export function previousDay(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

export interface Outcome {
  queue: Queue;
  added: string[];
  extended: string[];
  skipped: string[];
}

/** The rows in `window` that list `slug`, oldest first. */
function hitsFor(window: ErrorRow[], slug: string): { date: string; message: string }[] {
  const out: { date: string; message: string }[] = [];
  for (const row of window) {
    const e = row.errors.find((x) => x.slug === slug);
    if (e) out.push({ date: row.date, message: e.message || 'no message' });
  }
  return out;
}

const evidenceOf = (h: { date: string; message: string }): string => `${h.date} (${h.message})`;

/**
 * Files or extends a `refresh-<slug>` item for every source that errored today and in at least
 * MIN_HITS of the last WINDOW_ROWS Daily numbers rows (today's included). Pure: returns a new
 * queue. An open item (todo/doing/blocked) gains today's evidence once. A done item counts only
 * rows dated after its `done_at` (the day its fix landed) and is re-filed once MIN_HITS of them
 * list the slug; a dropped item younger than COOL_OFF_DAYS is left alone. A re-filed item is
 * `refresh-<slug>-<date>` so the id stays unique.
 */
export function fileRepeatErrors(researchMd: string, queue: Queue, today: string): Outcome {
  const window = lastRows(researchMd, today);
  const out: Outcome = { queue, added: [], extended: [], skipped: [] };
  const todayRow = window.find((r) => r.date === today);
  if (!todayRow) return out;
  const items = queue.items.map((it) => ({ ...it }));
  let changed = false;
  for (const e of todayRow.errors) {
    const hits = hitsFor(window, e.slug);
    if (hits.length < MIN_HITS) continue;
    const baseId = `refresh-${e.slug}`;
    const sameSlug = (it: QueueItem): boolean => it.id === baseId || it.id.startsWith(`${baseId}-`);
    const open = items.find(
      (it) =>
        sameSlug(it) && (it.status === 'todo' || it.status === 'doing' || it.status === 'blocked'),
    );
    const todayEvidence = `${today}: ${e.message || 'no message'}`;
    if (open) {
      if (!open.why.includes(`${today}:`)) {
        open.why = `${open.why} Still failing ${todayEvidence}.`;
        changed = true;
        out.extended.push(open.id);
      } else out.skipped.push(open.id);
      continue;
    }
    const closed = items
      .filter((it) => sameSlug(it) && (it.status === 'done' || it.status === 'dropped'))
      .sort((a, b) => String(b.done_at ?? b.added).localeCompare(String(a.done_at ?? a.added)))[0];
    let evidence = hits;
    if (closed) {
      const closedOn = String(closed.done_at ?? closed.added);
      if (closed.status === 'dropped' && daysBetween(closedOn, today) < COOL_OFF_DAYS) {
        out.skipped.push(closed.id);
        continue;
      }
      if (closed.status === 'done') {
        evidence = hits.filter((h) => h.date > closedOn);
        if (evidence.length < MIN_HITS) {
          out.skipped.push(closed.id);
          continue;
        }
      }
    }
    const id = items.some((it) => it.id === baseId) ? `${baseId}-${today}` : baseId;
    const earlier = evidence.slice(0, -1).map(evidenceOf).join(', ');
    const after =
      closed?.status === 'done'
        ? ` after the fix of ${closed.id} (${closed.done_at ?? closed.added})`
        : '';
    items.push({
      id,
      title: `${e.slug}: refresh has failed ${evidence.length} times in the last ${window.length} days — fix the source or keep the last snapshot without an error row`,
      why:
        `Filed by the 06:30 metrics job (scripts/refresh-errors-to-queue.ts): the Daily numbers rows list ${e.slug} under ` +
        `refresh errors on ${earlier} and ${todayEvidence}${after}. The surface serves ` +
        `the last good snapshot meanwhile (Blind Mode). Read ventures/gankdat/src/sources/${e.slug}.ts, verify the origin's ` +
        `current response through the relay before changing the parser, and make a transient origin fault log \`skipped\` ` +
        `rather than \`error\` once retries are exhausted.`,
      effort_days: EFFORT_DAYS,
      proof: `${e.slug} absent from refresh errors for 7 consecutive Daily numbers rows`,
      score: SCORE,
      status: 'todo',
      added: today,
    });
    changed = true;
    out.added.push(id);
  }
  if (changed) out.queue = { ...queue, items, updated: today };
  return out;
}

export function serialize(queue: Queue): string {
  return `${JSON.stringify(queue, null, 2)}\n`;
}

function main(): void {
  const dateArg = process.argv.find((a) => a.startsWith('--date='))?.slice('--date='.length);
  const today = dateArg ?? new Date().toISOString().slice(0, 10);
  const md = readFileSync(RESEARCH_FILE, 'utf8');
  const queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf8')) as Queue;
  const out = fileRepeatErrors(md, queue, today);
  if (out.queue !== queue) writeFileSync(QUEUE_FILE, serialize(out.queue));
  console.log(
    `refresh errors ${today}: added [${out.added.join(', ')}] extended [${out.extended.join(', ')}] skipped [${out.skipped.join(', ')}]`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
