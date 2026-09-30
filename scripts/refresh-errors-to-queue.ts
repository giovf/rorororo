// A dataset that errors on refresh two days running becomes a scored gankdat queue item.
//
// Why: uk-insolvency sat in the Daily numbers `refresh errors` field four days running
// (2026-09-27..30: a 500, an empty body, a 500, a zero-byte body with a declared content-length)
// and no queue item existed — a routine only sees the row it happens to read, the 09-29 build
// fixed the 500 case alone, and the live surface served a stale snapshot meanwhile. The 06:30
// `gankdat metrics` job already writes the row from CI, so it also compares today's error slugs
// with yesterday's and files an idempotent `refresh-<slug>` item for every slug present both days;
// `npm run pipeline next` then offers it to the next build (foundry item refresh-errors-to-queue).
//
// Run: npm run refresh-errors [-- --date=YYYY-MM-DD]   (from the repo root, in the metrics job)
// Node 22 runs .ts directly — keep syntax erasable, import only node builtins.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RESEARCH_FILE = path.join('ventures', 'gankdat', 'RESEARCH.md');
export const QUEUE_FILE = path.join('docs', 'pipeline', 'queues', 'gankdat.json');
/** A done or dropped item younger than this is not re-filed (the fix may still be deploying). */
export const COOL_OFF_DAYS = 14;
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

/**
 * Files or extends a `refresh-<slug>` item for every source that errored today and yesterday.
 * Pure: returns a new queue. An open item (todo/doing/blocked) gains today's evidence once; a
 * done or dropped item younger than COOL_OFF_DAYS is left alone; older ones are re-filed as
 * `refresh-<slug>-<date>` so the id stays unique.
 */
export function fileRepeatErrors(
  researchMd: string,
  queue: Queue,
  today: string,
  yesterday = previousDay(today),
): Outcome {
  const todayErrors = errorsOn(researchMd, today);
  const prevErrors = errorsOn(researchMd, yesterday);
  const out: Outcome = { queue, added: [], extended: [], skipped: [] };
  if (!todayErrors || !prevErrors) return out;
  const prevBySlug = new Map(prevErrors.map((e) => [e.slug, e.message]));
  const items = queue.items.map((it) => ({ ...it }));
  let changed = false;
  for (const e of todayErrors) {
    if (!prevBySlug.has(e.slug)) continue;
    const baseId = `refresh-${e.slug}`;
    const evidence = `${today}: ${e.message || 'no message'}`;
    const open = items.find(
      (it) =>
        (it.id === baseId || it.id.startsWith(`${baseId}-`)) &&
        (it.status === 'todo' || it.status === 'doing' || it.status === 'blocked'),
    );
    if (open) {
      if (!open.why.includes(`${today}:`)) {
        open.why = `${open.why} Still failing ${evidence}.`;
        changed = true;
        out.extended.push(open.id);
      } else out.skipped.push(open.id);
      continue;
    }
    const recent = items.find(
      (it) =>
        (it.id === baseId || it.id.startsWith(`${baseId}-`)) &&
        (it.status === 'done' || it.status === 'dropped') &&
        daysBetween(String(it.done_at ?? it.added), today) < COOL_OFF_DAYS,
    );
    if (recent) {
      out.skipped.push(recent.id);
      continue;
    }
    const id = items.some((it) => it.id === baseId) ? `${baseId}-${today}` : baseId;
    items.push({
      id,
      title: `${e.slug}: refresh has failed two days running — fix the source or keep the last snapshot without an error row`,
      why:
        `Filed by the 06:30 metrics job (scripts/refresh-errors-to-queue.ts): the Daily numbers row lists ${e.slug} under ` +
        `refresh errors on ${yesterday} (${prevBySlug.get(e.slug) || 'no message'}) and ${evidence}. The surface serves ` +
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
