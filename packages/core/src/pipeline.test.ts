import { describe, expect, it } from 'vitest';
import {
  candidates,
  formatPipeline,
  isEmpty,
  needsResearch,
  nextItem,
  parseExchange,
  parseQueue,
  starved,
  type VentureQueue,
} from './pipeline.js';

const item = (id: string, status: string, score: number, added = '2026-09-22'): object => ({
  id,
  title: `Item ${id}`,
  why: 'buyers pay for this',
  effort_days: 1,
  proof: 'runs per month',
  score,
  status,
  added,
  ...(status === 'blocked' ? { blocked_on: 'store review' } : {}),
});

const queue = (venture: string, items: object[], extra: object = {}): string =>
  JSON.stringify({ venture, status: 'open', needs_research: false, updated: '2026-09-22', items, ...extra });

describe('parseQueue', () => {
  it('accepts a valid queue and rejects malformed ones', () => {
    const q = parseQueue(queue('gankdat', [item('a', 'todo', 5)]));
    expect(q.items[0]?.id).toBe('a');
    expect(() => parseQueue(queue('Bad Slug', []))).toThrow(/slug/);
    expect(() => parseQueue(queue('x', [item('a', 'todo', 5), item('a', 'todo', 1)]))).toThrow(/duplicate/);
    expect(() => parseQueue(queue('x', [{ ...item('a', 'blocked', 1), blocked_on: undefined }]))).toThrow(
      /blocked_on/,
    );
    expect(() => parseQueue(queue('x', [], { status: 'finished' }))).toThrow(/finished_reason/);
    expect(() => parseQueue(queue('x', [{ ...item('a', 'todo', 1), effort_days: 0 }]))).toThrow(/effort_days/);
  });
});

describe('parseExchange', () => {
  it('requires a trigger on parked ideas and a venture on promoted ones', () => {
    const ok = parseExchange(
      JSON.stringify({
        ideas: [
          { id: 'm', title: 'Marketplace', why: 'x', status: 'parked', trigger: '1k users', added: '2026-09-21' },
          { id: 'l', title: 'Leads', why: 'x', status: 'promoted', venture: 'gankdat', added: '2026-09-21' },
        ],
      }),
    );
    expect(ok.ideas).toHaveLength(2);
    expect(() =>
      parseExchange(JSON.stringify({ ideas: [{ id: 'm', title: 't', why: 'x', status: 'parked', added: '2026-09-21' }] })),
    ).toThrow(/trigger/);
  });
});

describe('scheduling', () => {
  const queues: VentureQueue[] = [
    parseQueue(queue('gankdat', [item('nhs', 'todo', 6, '2026-09-22'), item('old', 'todo', 6, '2026-09-20'), item('x', 'done', 9)])),
    parseQueue(queue('read-focus', [item('links', 'blocked', 8)])),
    parseQueue(queue('toolkit', [item('rev', 'done', 3)])),
    parseQueue(queue('dead', [], { status: 'finished', finished_reason: 'killed 2026-09-01' })),
  ];

  it('picks the best-scoring todo item on an open queue, oldest first on ties', () => {
    expect(nextItem(queues)).toMatchObject({ venture: 'gankdat', item: { id: 'old' } });
    expect(candidates(queues).map((c) => c.item.id)).toEqual(['old', 'nhs']);
  });

  it('skips a dated checkpoint until its not_before day, then offers it', () => {
    const q = parseQueue(
      queue('toolkit', [
        { ...item('day-30', 'todo', 9), not_before: '2026-10-21' },
        item('now', 'todo', 2),
      ]),
    );
    expect(nextItem([q], { today: '2026-09-29' })?.item.id).toBe('now');
    expect(candidates([q], { today: '2026-09-29' }).map((c) => c.item.id)).toEqual(['now']);
    // On the day itself and after, the higher score wins again.
    expect(nextItem([q], { today: '2026-10-21' })?.item.id).toBe('day-30');
    expect(nextItem([q], { today: '2026-11-01' })?.item.id).toBe('day-30');
    // A scheduled item still counts as work, so the queue does not ask for research.
    expect(isEmpty(parseQueue(queue('t', [{ ...item('later', 'todo', 9), not_before: '2026-12-01' }])))).toBe(false);
    expect(() => parseQueue(queue('t', [{ ...item('a', 'todo', 1), not_before: '21-10-2026' }]))).toThrow(
      /not_before/,
    );
  });

  it('caps candidates by effort when asked', () => {
    const q = parseQueue(
      queue('x', [{ ...item('big', 'todo', 9), effort_days: 2 }, { ...item('small', 'todo', 3), effort_days: 0.2 }]),
    );
    expect(nextItem([q])?.item.id).toBe('big');
    expect(nextItem([q], { maxEffortDays: 0.5 })?.item.id).toBe('small');
    expect(candidates([q], { maxEffortDays: 0.5 })).toHaveLength(1);
  });

  it('treats a queue with only done/dropped items as empty, blocked as not empty', () => {
    expect(isEmpty(queues[2]!)).toBe(true);
    expect(isEmpty(queues[1]!)).toBe(false);
    expect(needsResearch(queues).map((q) => q.venture)).toEqual(['toolkit']);
  });

  it('honours an explicit needs_research flag and ignores finished queues', () => {
    const flagged = parseQueue(queue('gankdat', [item('a', 'todo', 1)], { needs_research: true }));
    expect(needsResearch([flagged, queues[3]!]).map((q) => q.venture)).toEqual(['gankdat']);
  });

  it('lists starved queues for research only when nothing at all is buildable', () => {
    // 2026-10-01: every remaining item was blocked or dated, no queue was flagged, and both
    // build slots had nothing to do — blocked and scheduled items count as work, but a slot
    // with no buildable item anywhere must research rather than idle.
    const blockedOnly = parseQueue(
      queue('gankdat', [item('sc', 'blocked', 4), item('x', 'done', 9)], { updated: '2026-09-30' }),
    );
    const datedOnly = parseQueue(
      queue('toolkit', [{ ...item('day-30', 'todo', 4), not_before: '2026-10-21' }], { updated: '2026-09-29' }),
    );
    const buildable = parseQueue(queue('read-focus', [item('page', 'todo', 6)], { updated: '2026-09-28' }));
    const finished = queues[3]!;
    const today = { today: '2026-10-01' };
    // Oldest `updated` first; a finished queue is never starved.
    expect(starved([blockedOnly, datedOnly, finished], today).map((q) => q.venture)).toEqual(['toolkit', 'gankdat']);
    expect(needsResearch([blockedOnly, datedOnly, finished], today).map((q) => q.venture)).toEqual([
      'toolkit',
      'gankdat',
    ]);
    // One buildable item anywhere: the starved queues are not research, the build takes the item.
    expect(needsResearch([blockedOnly, datedOnly, buildable], today)).toEqual([]);
    // A flagged or empty queue wins over starvation, as before.
    const empty = parseQueue(queue('dead-end', [item('rev', 'done', 3)]));
    expect(needsResearch([blockedOnly, datedOnly, empty], today).map((q) => q.venture)).toEqual(['dead-end']);
    // The dated item comes due: its queue is buildable again.
    expect(needsResearch([blockedOnly, datedOnly], { today: '2026-10-21' })).toEqual([]);
    const text = formatPipeline({ exchange: { ideas: [] }, queues: [blockedOnly, datedOnly] });
    expect(text).toContain('pipeline starved');
  });

  it('formats a status summary with the next item', () => {
    const text = formatPipeline({ exchange: { ideas: [] }, queues });
    expect(text).toContain('toolkit');
    expect(text).toContain('NEEDS RESEARCH');
    expect(text).toContain('next: gankdat / old');
  });
});
