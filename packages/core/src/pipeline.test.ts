import { describe, expect, it } from 'vitest';
import {
  awaitsDatedItem,
  candidates,
  formatPipeline,
  isEmpty,
  isStaleDoing,
  needsResearch,
  nextItem,
  researchFirst,
  notBeforeArrived,
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
    // `toolkit` is empty, so research comes first and `next` is null; the raw ranking is still there.
    expect(nextItem(queues)).toBeUndefined();
    expect(nextItem(queues, { researchFirst: false })).toMatchObject({ venture: 'gankdat', item: { id: 'old' } });
    expect(nextItem(queues.filter((q) => q.venture !== 'toolkit'))).toMatchObject({
      venture: 'gankdat',
      item: { id: 'old' },
    });
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

  it('offers an item dated today only from 07:00 UTC, after the morning metrics rows', () => {
    const q = parseQueue(queue('gankdat', [{ ...item('d1-read', 'todo', 6), not_before: '2026-10-08' }]));
    const night = new Date('2026-10-08T00:13:00Z');
    const morning = new Date('2026-10-08T07:00:00Z');
    expect(notBeforeArrived('2026-10-08', night)).toBe(false);
    expect(notBeforeArrived('2026-10-08', morning)).toBe(true);
    expect(notBeforeArrived('2026-10-07', night)).toBe(true);
    expect(notBeforeArrived(undefined, night)).toBe(true);
    expect(nextItem([q], { now: night })).toBeUndefined();
    expect(nextItem([q], { now: morning })?.item.id).toBe('d1-read');
    // A stale doing item dated today waits the same way.
    const stale = parseQueue(
      queue('gankdat', [{ ...item('d1-read', 'doing', 6), doing_since: '2026-10-01', not_before: '2026-10-08' }]),
    );
    expect(nextItem([stale], { now: night })).toBeUndefined();
    expect(nextItem([stale], { now: morning })?.item.id).toBe('d1-read');
    // The status text lists it as scheduled with the hour, and the queue counts as starved, not empty.
    const text = formatPipeline({ exchange: { ideas: [] }, queues: [q] }, { now: night });
    expect(text).toContain('scheduled: gankdat/d1-read on 2026-10-08 from 07:00 UTC');
    expect(formatPipeline({ exchange: { ideas: [] }, queues: [q] }, { now: morning })).toContain(
      'next: gankdat / d1-read',
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

  it('claims nothing while a flagged queue out of cooling waits for research (claim-only-when-buildable)', () => {
    // 2026-10-22 17:20: the build slot claimed a gankdat item right after `next`, then found
    // new-ventures flagged, researched it and released the claim; the 19:11 slot claimed it again.
    const buildable = parseQueue(queue('gankdat', [item('journal', 'todo', 6)]));
    const flagged = parseQueue(queue('new-ventures', [item('spike', 'done', 5)], { needs_research: true }));
    const cooled = parseQueue(
      queue('new-ventures', [item('spike', 'done', 5)], { needs_research: true, researched: '2026-10-22' }),
    );
    const today = { today: '2026-10-22' };
    expect(researchFirst([buildable, flagged], today).map((q) => q.venture)).toEqual(['new-ventures']);
    expect(nextItem([buildable, flagged], today)).toBeUndefined();
    expect(needsResearch([buildable, flagged], today).map((q) => q.venture)).toEqual(['new-ventures']);
    // The fallback's capped call keeps the raw ranking.
    expect(nextItem([buildable, flagged], { ...today, maxEffortDays: 1, researchFirst: false })?.item.id).toBe('journal');
    // A cooling flagged queue is not research tonight, so the build goes ahead.
    expect(researchFirst([buildable, cooled], today)).toEqual([]);
    expect(nextItem([buildable, cooled], today)?.item.id).toBe('journal');
    // A starved queue (blocked only) never holds the build: it is research only when nothing is buildable.
    const starvedQ = parseQueue(queue('read-focus', [item('links', 'blocked', 8)]));
    expect(nextItem([buildable, starvedQ], today)?.item.id).toBe('journal');
    const text = formatPipeline({ exchange: { ideas: [] }, queues: [buildable, flagged] }, today);
    expect(text).toContain('next: research new-ventures first — the build waits (gankdat / journal');
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

  it('treats a queue whose only open item is dated for today or tomorrow as waiting, not starved', () => {
    // 2026-10-20 00:07 UTC: foundry and hackathons each held one todo item dated 2026-10-20 (buildable
    // from 07:00) and nothing else open; the night gate listed both for research. Within a day of
    // the item the queue waits; a later date still starves it; at 07:00 the item is simply next.
    const dueToday = parseQueue(
      queue('foundry', [{ ...item('node-24', 'todo', 4), not_before: '2026-10-20' }], { updated: '2026-10-19' }),
    );
    const dueTomorrow = parseQueue(
      queue('hackathons', [{ ...item('rules', 'todo', 7), not_before: '2026-10-21' }], { updated: '2026-10-18' }),
    );
    const dueLater = parseQueue(
      queue('toolkit', [{ ...item('day-30', 'todo', 4), not_before: '2026-10-22' }], { updated: '2026-10-17' }),
    );
    const night = { now: new Date('2026-10-20T00:07:00Z') };
    expect(awaitsDatedItem(dueToday, night.now)).toBe(true);
    expect(awaitsDatedItem(dueTomorrow, night.now)).toBe(true);
    expect(awaitsDatedItem(dueLater, night.now)).toBe(false);
    expect(starved([dueToday, dueTomorrow, dueLater], night).map((q) => q.venture)).toEqual(['toolkit']);
    expect(needsResearch([dueToday, dueTomorrow], night)).toEqual([]);
    const text = formatPipeline({ exchange: { ideas: [] }, queues: [dueToday, dueTomorrow] }, night);
    expect(text).toContain('waits for dated evidence');
    expect(text).toContain('foundry/node-24 on 2026-10-20 from 07:00 UTC');
    // From 07:00 the dated item is buildable and nothing waits.
    const morning = { now: new Date('2026-10-20T07:00:00Z') };
    expect(awaitsDatedItem(dueToday, morning.now)).toBe(false);
    expect(nextItem([dueToday, dueTomorrow], morning)?.item.id).toBe('node-24');
  });

  it('leaves a flagged or emptied queue out of research while it is cooling', () => {
    // 2026-10-17: the last new-ventures spike emptied the queue, the build rule flagged it, and
    // `empty` listed a venture researched that same day — the prompt said it would not.
    const spent = parseQueue(
      queue('new-ventures', [item('spike', 'done', 6)], { needs_research: true, researched: '2026-10-17' }),
    );
    const buildable = parseQueue(queue('foundry', [item('fix', 'todo', 4)]));
    expect(needsResearch([spent, buildable], { today: '2026-10-17' })).toEqual([]);
    expect(needsResearch([spent, buildable], { today: '2026-10-18' })).toEqual([]);
    expect(needsResearch([spent, buildable], { today: '2026-10-19' }).map((q) => q.venture)).toEqual(['new-ventures']);
    // Nothing buildable and the flagged queue cooling: starved and cooled, not research.
    expect(needsResearch([spent], { today: '2026-10-18' })).toEqual([]);
    expect(formatPipeline({ exchange: { ideas: [] }, queues: [spent] }, { today: '2026-10-18' })).toContain(
      'cooling: new-ventures (researched 2026-10-17)',
    );
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
    // The empty `toolkit` queue is researched first; the best item is named but not offered.
    expect(text).toContain('next: research toolkit first — the build waits (gankdat / old');
    const built = formatPipeline({ exchange: { ideas: [] }, queues: queues.filter((q) => q.venture !== 'toolkit') });
    expect(built).toContain('next: gankdat / old');
  });
});

describe('queue weight', () => {
  it('ranks items by score × weight across queues and keeps score order within a queue', () => {
    const a = parseQueue(queue('alpha', [item('a1', 'todo', 8), item('a2', 'todo', 5)]));
    const b = parseQueue(queue('beta', [item('b1', 'todo', 5)], { weight: 2 }));
    expect(candidates([a, b]).map((c) => `${c.venture}/${c.item.id}`)).toEqual(['beta/b1', 'alpha/a1', 'alpha/a2']);
    expect(a.weight).toBeUndefined();
    expect(b.weight).toBe(2);
    expect(formatPipeline({ exchange: { ideas: [] }, queues: [a, b] })).toMatch(/next: beta \/ b1 \(score 5 × weight 2\)/);
    expect(formatPipeline({ exchange: { ideas: [] }, queues: [a, b] })).toMatch(/beta .*weight 2/);
  });
  it('rejects a weight that is not a positive number', () => {
    expect(() => parseQueue(queue('alpha', [], { weight: 0 }))).toThrow(/weight must be a positive number/);
    expect(() => parseQueue(queue('alpha', [], { weight: 'high' }))).toThrow(/weight/);
  });
});
