import { describe, expect, it } from 'vitest';
import {
  candidates,
  formatPipeline,
  isEmpty,
  isStaleDoing,
  needsResearch,
  nextItem,
  parseExchange,
  parseQueue,
  starved,
  cooling,
  isCooling,
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
    const text = formatPipeline({ exchange: { ideas: [] }, queues: [blockedOnly, datedOnly] }, today);
    expect(text).toContain('pipeline starved');
  });

  it('does not offer a queue researched within 48 h for research again', () => {
    // 2026-10-05: five research runs in a day, and the next morning the build was offered the
    // same venture eleven hours after its research because `updated` was all it had to go on.
    const blockedOnly = parseQueue(
      queue('gankdat', [item('sc', 'blocked', 4)], { updated: '2026-10-05', researched: '2026-10-05' }),
    );
    const older = parseQueue(
      queue('toolkit', [{ ...item('day-30', 'todo', 4), not_before: '2026-10-21' }], { updated: '2026-10-05', researched: '2026-10-03' }),
    );
    expect(isCooling(blockedOnly, '2026-10-06')).toBe(true);
    expect(isCooling(blockedOnly, '2026-10-07')).toBe(false);
    expect(isCooling(older, '2026-10-05')).toBe(false);
    // Yesterday's research is still cooling; the day-before's is not.
    expect(starved([blockedOnly, older], { today: '2026-10-06' }).map((q) => q.venture)).toEqual(['toolkit']);
    expect(cooling([blockedOnly, older], { today: '2026-10-06' }).map((q) => q.venture)).toEqual(['gankdat']);
    // Every starved queue cooling: nothing to research, and the status says to stop.
    const allCool = parseQueue(queue('toolkit', [item('sc', 'blocked', 4)], { researched: '2026-10-06' }));
    expect(needsResearch([blockedOnly, allCool], { today: '2026-10-06' })).toEqual([]);
    const text = formatPipeline({ exchange: { ideas: [] }, queues: [blockedOnly, allCool] }, { today: '2026-10-06' });
    expect(text).toContain('researched within 48 h');
    expect(text).toContain('cooling: gankdat (researched 2026-10-05), toolkit (researched 2026-10-06)');
    expect(() => parseQueue(queue('t', [], { researched: '5 Oct' }))).toThrow(/researched/);
  });

  it('skips a queue whose research run set research_after until that date', () => {
    // 2026-10-07: highlight-keep, read-focus and variables-toolkit had each been researched three
    // times in eight days on an unchanged zero (0 users, 7 views); the next evidence is a dated
    // day-30 review, so the research run points the fallback at it instead of inventing items.
    const waiting = parseQueue(
      queue('highlight-keep', [{ ...item('day-30', 'todo', 5), not_before: '2026-10-30' }], {
        updated: '2026-10-07',
        researched: '2026-10-05',
        research_after: '2026-10-30',
      }),
    );
    expect(isCooling(waiting, '2026-10-08')).toBe(true);
    expect(isCooling(waiting, '2026-10-29')).toBe(true);
    expect(isCooling(waiting, '2026-10-30')).toBe(false);
    expect(starved([waiting], { today: '2026-10-15' })).toEqual([]);
    expect(needsResearch([waiting], { today: '2026-10-15' })).toEqual([]);
    const text = formatPipeline({ exchange: { ideas: [] }, queues: [waiting] }, { today: '2026-10-15' });
    expect(text).toContain('waits for dated evidence');
    expect(text).toContain('cooling: highlight-keep (researched 2026-10-05, waiting until 2026-10-30)');
    // On the day itself the day-30 item is buildable, so nothing is starved anyway.
    expect(nextItem([waiting], { today: '2026-10-30' })?.item.id).toBe('day-30');
    expect(() => parseQueue(queue('t', [], { research_after: 'soon' }))).toThrow(/research_after/);
  });

  it('offers a stale doing item again and lists every doing item', () => {
    // 2026-10-04: foundry held a score-7 item in `doing` (a deliberate wait for a measured week)
    // and `next` reported starvation around it; a cut-off session's leftover would hide the same way.
    const q = parseQueue(
      queue('foundry', [
        { ...item('left', 'doing', 7, '2026-10-01'), doing_since: '2026-10-03' },
        { ...item('fresh', 'doing', 9, '2026-10-01'), doing_since: '2026-10-04' },
        { ...item('held', 'doing', 8, '2026-10-01'), not_before: '2026-10-12' },
        item('small', 'todo', 2),
      ]),
    );
    const left = q.items[0]!;
    // A day is not stale; more than a day is; a future not_before is a hold, never stale.
    expect(isStaleDoing(left, '2026-10-04')).toBe(false);
    expect(isStaleDoing(left, '2026-10-05')).toBe(true);
    expect(isStaleDoing(q.items[2]!, '2026-10-05')).toBe(false);
    expect(isStaleDoing(q.items[2]!, '2026-10-12')).toBe(true);
    // `doing_since` defaults to `added`.
    expect(isStaleDoing(parseQueue(queue('x', [item('a', 'doing', 1, '2026-10-01')])).items[0]!, '2026-10-05')).toBe(true);
    expect(nextItem([q], { today: '2026-10-05' })?.item.id).toBe('left');
    expect(candidates([q], { today: '2026-10-05' }).map((c) => c.item.id)).toEqual(['left', 'small']);
    expect(nextItem([q], { today: '2026-10-04' })?.item.id).toBe('small');
    // A stale doing item is buildable, so its queue is not starved.
    expect(starved([q], { today: '2026-10-05' })).toEqual([]);
    expect(() => parseQueue(queue('t', [{ ...item('a', 'doing', 1), doing_since: '3 Oct' }]))).toThrow(/doing_since/);
    const text = formatPipeline({ exchange: { ideas: [] }, queues: [q] }, { today: '2026-10-05' });
    expect(text).toContain('doing: foundry/left since 2026-10-03 (stale — offered again by next)');
    expect(text).toContain('foundry/held since 2026-10-01 (held until 2026-10-12)');
    expect(text).toContain('foundry/fresh since 2026-10-04');
  });

  it('formats a status summary with the next item', () => {
    const text = formatPipeline({ exchange: { ideas: [] }, queues });
    expect(text).toContain('toolkit');
    expect(text).toContain('NEEDS RESEARCH');
    expect(text).toContain('next: gankdat / old');
  });
});
