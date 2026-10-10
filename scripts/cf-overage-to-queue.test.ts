import { describe, expect, it } from 'vitest';
import { fileOverage, overageOn } from './cf-overage-to-queue.ts';
import type { Queue } from './refresh-errors-to-queue.ts';

const row = (date: string, cf: string): string =>
  `| ${date} | Daily numbers | 1 accts | — | 0 x402 paid | MCP 24h: 1 authed; ${cf}; refresh ok |`;
const md = [
  row(
    '2026-10-09',
    'cf usage (09-10→10-09): d1 93.9M writes / 1.0B reads, 3.5 GB, kv 0.0M reads / 0.0M writes, workers 0.1M req, ae 0.1M pts ≈ US$44 overage (d1 writes US$44)',
  ),
  row('2026-10-10', 'cf usage (10-10→10-10): d1 0.0M writes / 46.5M reads, 3.5 GB ≈ US$0 overage'),
  row('2026-10-11', 'cf usage: n/a (authentication error)'),
  row(
    '2026-01-03',
    'cf usage (12-10→01-03): d1 60.0M writes / 1.0B reads ≈ US$10 overage (d1 writes US$10)',
  ),
].join('\n');
const queue: Queue = {
  venture: 'gankdat',
  status: 'open',
  needs_research: false,
  updated: '2026-10-01',
  items: [],
};

describe('overageOn', () => {
  it('reads the period, the amount and the drivers', () => {
    expect(overageOn(md, '2026-10-09')).toEqual({
      periodStart: '2026-09-10',
      usd: 44,
      drivers: 'd1 writes US$44',
      field:
        'cf usage (09-10→10-09): d1 93.9M writes / 1.0B reads, 3.5 GB, kv 0.0M reads / 0.0M writes, workers 0.1M req, ae 0.1M pts ≈ US$44 overage (d1 writes US$44)',
    });
    expect(overageOn(md, '2026-10-10')?.usd).toBe(0);
    expect(overageOn(md, '2026-10-10')?.drivers).toBe('');
  });
  it('is undefined for an n/a reading or a missing row', () => {
    expect(overageOn(md, '2026-10-11')).toBeUndefined();
    expect(overageOn(md, '2026-10-12')).toBeUndefined();
  });
  it('dates a January row to the previous December', () => {
    expect(overageOn(md, '2026-01-03')?.periodStart).toBe('2025-12-10');
  });
});

describe('fileOverage', () => {
  it('files one item per billing period once the overage is at least US$1', () => {
    expect(fileOverage(md, queue, '2026-10-10').action).toBe('none');
    const out = fileOverage(md, queue, '2026-10-09');
    expect(out.action).toBe('added');
    expect(out.queue.items).toHaveLength(1);
    const item = out.queue.items[0]!;
    expect(item.id).toBe('cf-overage-2026-09-10');
    expect(item.status).toBe('todo');
    expect(item.score).toBe(8);
    expect(item.amount_usd).toBe(44);
    expect(item.title).toMatch(/US\$44 this billing period \(d1 writes US\$44\)/);
    expect(out.queue.updated).toBe('2026-10-09');
  });
  it('keeps the amount current while open and leaves it alone otherwise', () => {
    const filed = fileOverage(md, queue, '2026-10-09').queue;
    const later = md.replace('US$44 overage (d1 writes US$44)', 'US$50 overage (d1 writes US$50)');
    const up = fileOverage(later, filed, '2026-10-09');
    expect(up.action).toBe('updated');
    expect(up.queue.items[0]!.amount_usd).toBe(50);
    expect(fileOverage(md, up.queue, '2026-10-09').action).toBe('skipped');
  });
  it('re-opens a done item only when the overage grew by US$5 after the fix', () => {
    const filed = fileOverage(md, queue, '2026-10-09').queue;
    const done: Queue = {
      ...filed,
      items: filed.items.map((it) => ({ ...it, status: 'done', done_at: '2026-10-04' })),
    };
    expect(fileOverage(md, done, '2026-10-09').action).toBe('skipped');
    const grown = md.replace('US$44 overage (d1 writes US$44)', 'US$49 overage (d1 writes US$49)');
    const re = fileOverage(grown, done, '2026-10-09');
    expect(re.action).toBe('reopened');
    expect(re.queue.items[0]!.status).toBe('todo');
    expect(re.queue.items[0]!.done_at).toBeUndefined();
    expect(re.queue.items[0]!.why).toMatch(/Re-opened 2026-10-09/);
  });
});
