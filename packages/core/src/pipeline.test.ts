import { describe, expect, it } from 'vitest';
import {
  candidates,
  formatPipeline,
  isEmpty,
  needsResearch,
  nextItem,
  parseExchange,
  parseQueue,
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

  it('treats a queue with only done/dropped items as empty, blocked as not empty', () => {
    expect(isEmpty(queues[2]!)).toBe(true);
    expect(isEmpty(queues[1]!)).toBe(false);
    expect(needsResearch(queues).map((q) => q.venture)).toEqual(['toolkit']);
  });

  it('honours an explicit needs_research flag and ignores finished queues', () => {
    const flagged = parseQueue(queue('gankdat', [item('a', 'todo', 1)], { needs_research: true }));
    expect(needsResearch([flagged, queues[3]!]).map((q) => q.venture)).toEqual(['gankdat']);
  });

  it('formats a status summary with the next item', () => {
    const text = formatPipeline({ exchange: { ideas: [] }, queues });
    expect(text).toContain('toolkit');
    expect(text).toContain('NEEDS RESEARCH');
    expect(text).toContain('next: gankdat / old');
  });
});
