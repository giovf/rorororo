// A Cloudflare metered overage in today's Daily numbers row becomes a scored gankdat queue item.
//
// Why: the 2026-09-10→10-10 invoice was US$49 against the US$5 Workers Paid line — 94M D1 rows
// written by nightly full reloads, found only when Cloudflare's own budget email arrived on
// 10-01 and fixed on 10-04 (delta refresh). The owner's rule since 2026-10-10: the £100 cap is
// the owner's net outlay, so any spend past it comes out of profit, and a metered overage is a
// bug to fix the day it shows, not a cost to carry. The 06:30 `gankdat metrics` job already
// writes `cf usage (<from>→<to>): … ≈ US$N overage (<drivers>)` into the row (metrics.mjs,
// cloudflare-usage-breakdown); this files an idempotent `cf-overage-<period start>` item once
// N ≥ THRESHOLD_USD, keeps the amount current while the item is open, and re-opens a done item
// when the overage keeps growing after its fix (the fix did not hold).
//
// Run: npm run cf-overage [-- --date=YYYY-MM-DD]   (from the repo root, in the metrics job)
// Node 22 runs .ts directly — keep syntax erasable, import only node builtins.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  QUEUE_FILE,
  RESEARCH_FILE,
  serialize,
  type Queue,
  type QueueItem,
} from './refresh-errors-to-queue.ts';

/** Overage below this (USD) is rounding, not a signal. */
export const THRESHOLD_USD = 1;
/** A done item is re-opened once the overage has grown by this much since its fix. */
export const REGROWTH_USD = 5;
export const SCORE = 8;
export const EFFORT_DAYS = 0.3;

export interface Overage {
  /** Billing period start, YYYY-MM-DD (the invoice runs 10th → 10th). */
  periodStart: string;
  /** The row's `≈ US$N overage` figure. */
  usd: number;
  /** `d1 writes US$44, kv writes US$2` — what carries it, or '' when under US$0.5 each. */
  drivers: string;
  /** The whole `cf usage` field, for the item's evidence. */
  field: string;
}

/** The `cf usage` field of the Daily numbers row dated `date`; undefined when absent or n/a. */
export function overageOn(researchMd: string, date: string): Overage | undefined {
  const row = researchMd.split('\n').find((l) => l.startsWith(`| ${date} | Daily numbers |`));
  if (row === undefined) return undefined;
  const m = row.match(
    /cf usage \((\d{2}-\d{2})→(\d{2}-\d{2})\): (.*?≈ US\$(\d+(?:\.\d+)?) overage(?: \(([^)]*)\))?)/,
  );
  if (!m?.[1] || m[4] === undefined) return undefined;
  const [year, month, day] = date.split('-').map(Number);
  const [fm, fd] = m[1].split('-').map(Number);
  // The period start is this year's unless it is later than today (a January row reads December's).
  const startYear =
    year !== undefined &&
    month !== undefined &&
    day !== undefined &&
    fm !== undefined &&
    fd !== undefined &&
    (fm > month || (fm === month && fd > day))
      ? year - 1
      : year;
  return {
    periodStart: `${startYear}-${m[1]}`,
    usd: Number(m[4]),
    drivers: (m[5] ?? '').trim(),
    field: `cf usage (${m[1]}→${m[2]}): ${m[3]}`,
  };
}

export interface Outcome {
  queue: Queue;
  action: 'none' | 'added' | 'updated' | 'reopened' | 'skipped';
  id?: string;
}

const title = (o: Overage): string =>
  `Cloudflare metered overage ≈ US$${o.usd.toFixed(0)} this billing period${o.drivers ? ` (${o.drivers})` : ''} — find the writer and stop it before the 10th`;

const why = (o: Overage, today: string): string =>
  `Filed by the 06:30 metrics job (scripts/cf-overage-to-queue.ts): the ${today} Daily numbers row reads \`${o.field}\`. ` +
  `The owner's rule (2026-10-10, docs/LEDGER.md): the £100 cap is the owner's net outlay and anything past it comes out of ` +
  `profit, so a metered charge above the US$5 Workers Paid line is a bug to fix the day it shows, not a cost to carry — the ` +
  `2026-09-10→10-10 invoice was US$49 from nightly full reloads nobody read until Cloudflare's email. Read the per-day ` +
  `rows written (GraphQL d1AnalyticsAdaptiveGroups by date, as the 10-10 session did), name the source or job behind the ` +
  `driver, and make it stop; a refresh that must write that much gets a smaller window, not a bigger bill.`;

/** Pure: files, updates or re-opens the period's `cf-overage-<period start>` item. */
export function fileOverage(researchMd: string, queue: Queue, today: string): Outcome {
  const o = overageOn(researchMd, today);
  if (!o || o.usd < THRESHOLD_USD) return { queue, action: 'none' };
  const id = `cf-overage-${o.periodStart}`;
  const items = queue.items.map((it) => ({ ...it }));
  const existing = items.find((it) => it.id === id);
  const stamp = (it: QueueItem): void => {
    it.amount_usd = o.usd;
    it.title = title(o);
  };
  if (!existing) {
    items.push({
      id,
      title: title(o),
      why: why(o, today),
      effort_days: EFFORT_DAYS,
      proof: `the Daily numbers row's cf usage overage stops growing day over day and the next invoice (10th) is US$5`,
      score: SCORE,
      status: 'todo',
      added: today,
      amount_usd: o.usd,
    });
    return { queue: { ...queue, items, updated: today }, action: 'added', id };
  }
  const was = Number(existing.amount_usd ?? 0);
  if (existing.status === 'todo' || existing.status === 'doing' || existing.status === 'blocked') {
    if (o.usd <= was) return { queue, action: 'skipped', id };
    stamp(existing);
    return { queue: { ...queue, items, updated: today }, action: 'updated', id };
  }
  if (existing.status === 'done' && o.usd >= was + REGROWTH_USD) {
    stamp(existing);
    existing.status = 'todo';
    existing.why = `${existing.why} Re-opened ${today}: the overage reached US$${o.usd.toFixed(0)} after the fix of ${String(existing.done_at ?? '?')} — it did not hold.`;
    delete existing.done_at;
    return { queue: { ...queue, items, updated: today }, action: 'reopened', id };
  }
  return { queue, action: 'skipped', id };
}

function main(): void {
  const dateArg = process.argv.find((a) => a.startsWith('--date='))?.slice('--date='.length);
  const today = dateArg ?? new Date().toISOString().slice(0, 10);
  const md = readFileSync(RESEARCH_FILE, 'utf8');
  const queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf8')) as Queue;
  const out = fileOverage(md, queue, today);
  if (out.queue !== queue) writeFileSync(QUEUE_FILE, serialize(out.queue));
  console.log(`cf overage ${today}: ${out.action}${out.id ? ` ${out.id}` : ''}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
