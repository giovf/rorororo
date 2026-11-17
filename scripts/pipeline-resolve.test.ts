import { describe, expect, it } from 'vitest';
import { mergeQueues, pickItem } from './pipeline-resolve.ts';

type Item = Record<string, unknown> & { id: string };
const item = (id: string, extra: Record<string, unknown> = {}): Item => ({
  id,
  title: 't',
  why: 'w',
  score: 3,
  status: 'todo',
  added: '2026-11-10',
  ...extra,
});
const queue = (
  items: Item[],
  extra: Record<string, unknown> = {},
): { venture: string; items: Item[] } & Record<string, unknown> => ({
  venture: 'gankdat',
  status: 'open',
  needs_research: false,
  updated: '2026-11-15',
  researched: '2026-11-12',
  ...extra,
  items,
});

describe('mergeQueues', () => {
  // The 2026-11-17 pair: the build finished one item and appended one, the burn-down finished
  // another and appended three, both from the same ancestor (each item claimed `doing` first).
  const base = queue([
    item('day-7-read', { status: 'doing', doing_since: '2026-11-17' }),
    item('uk-esg', { status: 'doing', doing_since: '2026-11-17' }),
    item('day-60', { not_before: '2026-12-15' }),
  ]);
  const theirs = queue([
    item('day-7-read', { status: 'done', done_at: '2026-11-17' }),
    item('uk-esg', { status: 'doing', doing_since: '2026-11-17' }),
    item('day-60', { not_before: '2026-12-15' }),
    item('harness-as-prober', { added: '2026-11-17' }),
  ]);
  const ours = queue(
    [
      item('day-7-read', { status: 'doing', doing_since: '2026-11-17' }),
      item('uk-esg', { status: 'done', done_at: '2026-11-17', why: 'w — built' }),
      item('day-60', { not_before: '2026-12-15' }),
      item('live-read', { added: '2026-11-17' }),
      item('backfill', { added: '2026-11-17' }),
    ],
    { updated: '2026-11-17' },
  );

  it("keeps each side's finished item and every appended item, theirs first", () => {
    const { queue: merged, notes } = mergeQueues(base, ours, theirs);
    expect(merged.items.map((i) => `${i.id}:${String(i.status)}`)).toEqual([
      'day-7-read:done',
      'uk-esg:done',
      'day-60:todo',
      'harness-as-prober:todo',
      'live-read:todo',
      'backfill:todo',
    ]);
    expect(merged.items[1]?.why).toBe('w — built');
    expect(merged.updated).toBe('2026-11-17');
    expect(notes).toEqual([]);
    expect(Object.keys(merged).pop()).toBe('items');
  });

  it('is the same whichever side is ours', () => {
    const statuses = (q: { items: Item[] }): Record<string, unknown> =>
      Object.fromEntries(q.items.map((i) => [i.id, i.status]));
    expect(statuses(mergeQueues(base, ours, theirs).queue)).toEqual(
      statuses(mergeQueues(base, theirs, ours).queue),
    );
  });

  it('takes the side further along when both changed one item, and says so', () => {
    const o = queue([item('x', { status: 'blocked', blocked_on: 'a key', updated: '2026-11-17' })]);
    const t = queue([item('x', { status: 'done', done_at: '2026-11-16' })]);
    const { queue: merged, notes } = mergeQueues(queue([item('x')]), o, t);
    expect(merged.items[0]?.status).toBe('done');
    expect(notes).toEqual(['x: both sides changed it (ours blocked, theirs done) — kept theirs']);
    expect(pickItem(item('x', { status: 'done' }), item('x', { status: 'doing' }))).toBe('ours');
    // The same step on both sides: the later stamp, then theirs.
    expect(
      pickItem(
        item('x', { status: 'done', done_at: '2026-11-17' }),
        item('x', { status: 'dropped', updated: '2026-11-16' }),
      ),
    ).toBe('ours');
    expect(pickItem(item('x', { why: 'a' }), item('x', { why: 'b' }))).toBe('theirs');
  });

  it('merges the queue fields: later dates win, a removed research marker stays removed', () => {
    const b = queue([], { researching_since: '2026-11-17T17:38Z', researching_by: 'burn-down' });
    const o = queue([], { researched: '2026-11-17T17:40Z', updated: '2026-11-17' });
    const t = queue([], {
      researching_since: '2026-11-17T17:38Z',
      researching_by: 'burn-down',
      updated: '2026-11-16',
      needs_research: true,
    });
    const { queue: merged, notes } = mergeQueues(b, o, t);
    expect(merged.researching_since).toBeUndefined();
    expect(merged.researching_by).toBeUndefined();
    expect(merged.researched).toBe('2026-11-17T17:40Z');
    expect(merged.updated).toBe('2026-11-17');
    expect(merged.needs_research).toBe(true); // only theirs changed it
    expect(notes).toEqual([]);
    const clash = mergeQueues(queue([]), queue([], { weight: 2 }), queue([], { weight: 0.5 }));
    expect(clash.queue.weight).toBe(0.5);
    expect(clash.notes).toEqual(['weight: both sides changed it — kept theirs (0.5)']);
  });

  it('works without a common ancestor and refuses two different queues', () => {
    const merged = mergeQueues(null, queue([item('a')]), queue([item('b')])).queue;
    expect(merged.items.map((i) => i.id)).toEqual(['b', 'a']);
    expect(() => mergeQueues(null, queue([]), { ...queue([]), venture: 'foundry' })).toThrow(
      /different queues/,
    );
  });
});
