import { describe, expect, it } from 'vitest';
import { ROUTINES } from './run-watchdog.js';
import {
  BURN_DOWN_HOURS,
  COLD_SIGNAL_RE,
  classOfTraces,
  classifySlots,
  idleLines,
  parseArgs,
  slotsIn,
  table,
  usageAsk,
  utilisationRoutines,
  windowOf,
} from './slot-utilisation.js';

const at = (iso: string): Date => new Date(iso);
const day = (d: string): { from: Date; to: Date } => ({
  from: at(`${d}T00:00:00Z`),
  to: at(`${d}T23:59:59Z`),
});

/** The 2026-10-13 night as RUNS.md recorded it: a pass at 17:17, seven cold fires, research at 00:40. */
const NIGHT_10_13 = [
  '# Run log',
  '- 2026-10-13 09:16 | build | Exchange pre-research: Ofsted childcare providers parked (OGL v3)',
  '- 2026-10-13 17:17 | burn-down | Exchange pre-research: Ireland CRO company register parked (CC BY 4.0)',
  '- 2026-10-13 17:17 | build | Nothing buildable: every queue cooling or dated, pass spent at 09:16; stopping',
  '- 2026-10-14 00:40 | burn-down | Foundry research: 10-13 ran 31 Actions runs, check 0 min with the cache',
  '- 2026-10-14 00:40 | burn-down | Queue: foundry +3 (slot utilisation 4, metrics cron short-circuit 2)',
  '',
].join('\n');

describe('utilisationRoutines', () => {
  it('widens the burn-down to every hourly fire and keeps the other routines as the watchdog has them', () => {
    const defs = utilisationRoutines();
    const burn = defs.filter((d) => d.routine === 'burn-down');
    expect(burn.map((d) => d.hour)).toEqual([...BURN_DOWN_HOURS]);
    expect(burn.every((d) => d.graceMinutes === 60 && d.since !== undefined)).toBe(true);
    expect(defs.filter((d) => d.routine !== 'burn-down')).toEqual(
      ROUTINES.filter((d) => d.routine !== 'burn-down'),
    );
  });
});

describe('slotsIn', () => {
  it('lists a Tuesday: metrics, two builds and ten burn-down fires, by the day each fire falls on', () => {
    const { from, to } = day('2026-10-13');
    const slots = slotsIn(utilisationRoutines(), from, to, at('2026-10-14T03:00:00Z'));
    expect(slots.map((s) => `${s.routine}@${s.at.toISOString().slice(11, 16)}`)).toEqual([
      'burn-down@00:00',
      'burn-down@01:00',
      'burn-down@02:00',
      'metrics@07:00',
      'build@09:00',
      'build@17:00',
      'burn-down@17:00',
      'burn-down@18:00',
      'burn-down@19:00',
      'burn-down@20:00',
      'burn-down@21:00',
      'burn-down@22:00',
      'burn-down@23:00',
    ]);
  });

  it('leaves out a slot whose deadline has not passed and the weekly slots on other days', () => {
    const { from, to } = day('2026-10-13');
    const slots = slotsIn(utilisationRoutines(), from, to, at('2026-10-13T18:30:00Z'));
    const hours = slots.filter((s) => s.routine === 'burn-down').map((s) => s.at.getUTCHours());
    expect(hours).toEqual([0, 1, 2, 17]);
    expect(slots.some((s) => s.routine === 'exchange' || s.routine === 'report')).toBe(false);
  });

  it('knows the Wednesday exchange and never a burn-down fire before it went nightly', () => {
    const wed = day('2026-10-07');
    const slots = slotsIn(utilisationRoutines(), wed.from, wed.to, at('2026-10-08T12:00:00Z'));
    expect(slots.some((s) => s.routine === 'exchange')).toBe(true);
    const early = day('2026-10-02');
    const none = slotsIn(utilisationRoutines(), early.from, early.to, at('2026-10-08T12:00:00Z'));
    expect(none.some((s) => s.routine === 'burn-down')).toBe(false);
  });
});

describe('classifySlots', () => {
  const now = at('2026-10-14T03:30:00Z');

  it('reads the 2026-10-13 night: pass, seven cold fires, a research fire, two cold fires after it', () => {
    const slots = slotsIn(
      utilisationRoutines(),
      at('2026-10-13T17:00:00Z'),
      at('2026-10-14T02:00:00Z'),
      now,
    );
    const classes = classifySlots({ runsText: NIGHT_10_13, slots })
      .filter((s) => s.routine === 'burn-down')
      .map((s) => `${s.at.toISOString().slice(11, 13)}:${s.class}`);
    expect(classes).toEqual([
      '17:pre-research',
      '18:cold',
      '19:cold',
      '20:cold',
      '21:cold',
      '22:cold',
      '23:cold',
      '00:researched',
      '01:cold',
      '02:cold',
    ]);
  });

  it('counts the morning pass as pre-research and the build slot that found nothing as ran', () => {
    const { from, to } = day('2026-10-13');
    const slots = slotsIn(utilisationRoutines(), from, to, now);
    const build = classifySlots({ runsText: NIGHT_10_13, slots }).filter(
      (s) => s.routine === 'build',
    );
    expect(build.map((s) => s.class)).toEqual(['pre-research', 'ran']);
  });

  it('calls a silent hour after "Stopping for time" silent (the limit), not cold', () => {
    const runs = [
      '- 2026-10-11 17:20 | burn-down | Queue: hackathons demo-video-pipeline done; proof is the artifact',
      '- 2026-10-11 17:34 | burn-down | Stopping for time: 1 item built this slot; next is oss-bounties x (5 × 2)',
      '',
    ].join('\n');
    const slots = slotsIn(
      utilisationRoutines(),
      at('2026-10-11T17:00:00Z'),
      at('2026-10-11T19:00:00Z'),
      now,
    );
    const burn = classifySlots({ runsText: runs, slots }).filter((s) => s.routine === 'burn-down');
    expect(burn.map((s) => s.class)).toEqual(['built', 'silent', 'silent']);
    expect(COLD_SIGNAL_RE.test('Stopping for time: 1 item built')).toBe(false);
    expect(COLD_SIGNAL_RE.test('Stopping: pipeline starved and cooled after 1 item')).toBe(true);
  });

  it('takes the watchdog line as the verdict on a watched slot and a commit as a fixed routine trace', () => {
    const runs = [
      '- 2026-10-12 19:10 | watchdog | missed: burn-down slot 2026-10-12 17:00 UTC left no commit or run line by 19:00; usage limit?',
      '',
    ].join('\n');
    const commits = '2026-10-12T07:16:00+00:00\tmetrics: 2026-10-12 daily check\n';
    const { from, to } = day('2026-10-12');
    const slots = slotsIn(utilisationRoutines(), from, to, now);
    const byKey = new Map(
      classifySlots({ runsText: runs, commitsText: commits, slots }).map((s) => [
        `${s.routine}@${s.at.getUTCHours()}`,
        s.class,
      ]),
    );
    expect(byKey.get('burn-down@17')).toBe('missed');
    expect(byKey.get('metrics@7')).toBe('ran');
    expect(byKey.get('build@9')).toBe('missed');
    expect(byKey.get('burn-down@18')).toBe('silent');
  });

  it('counts the metrics routine as ran when its start marker and both dispatched commits exist', () => {
    const now = at('2026-10-15T12:00:00Z');
    const metrics = ROUTINES.filter((d) => d.routine === 'metrics');
    const slots = slotsIn(metrics, day('2026-10-15').from, day('2026-10-15').to, now);
    const commitsText = [
      '2026-10-15T07:02:10+00:00\tmetrics: slot 2026-10-15 07:02 UTC started (metrics)',
      '2026-10-15T07:15:40+00:00\tstore-metrics: 2026-10-15 daily check',
      '2026-10-15T07:17:05+00:00\tmetrics(gankdat): 2026-10-15 daily numbers',
      '',
    ].join('\n');
    const slotsText = '# Slot starts\n\n- 2026-10-15 07:02 | metrics | started\n';
    const ran = classifySlots({ runsText: '# Run log\n', commitsText, slotsText, slots });
    expect(ran.map((s) => s.class)).toEqual(['ran']);
    expect(ran[0]?.traces.map((t) => t.text)).toEqual([
      'store-metrics: 2026-10-15 daily check',
      'metrics(gankdat): 2026-10-15 daily numbers',
    ]);
    // Without the marker the same commits are the late cron's: the slot stays missed.
    const missed = classifySlots({ runsText: '# Run log\n', commitsText, slots });
    expect(missed.map((s) => s.class)).toEqual(['missed']);
  });

  it('never counts a start or claim marker commit as the trace', () => {
    const commits = [
      '2026-10-12T17:01:00+00:00\tpipeline: claim foundry/x (burn-down)',
      '2026-10-12T17:02:00+00:00\tbuild: slot 2026-10-12 17:00 UTC started (build)',
      '',
    ].join('\n');
    const slots = slotsIn(
      utilisationRoutines(),
      at('2026-10-12T17:00:00Z'),
      at('2026-10-12T17:00:00Z'),
      now,
    );
    const classes = classifySlots({ runsText: '', commitsText: commits, slots }).map(
      (s) => `${s.routine}:${s.class}`,
    );
    expect(classes).toEqual(['build:missed', 'burn-down:missed']);
  });
});

describe('classOfTraces', () => {
  const t = (text: string, kind = 'burn-down'): { at: Date; kind: string; text: string } => ({
    at: at('2026-10-12T17:30:00Z'),
    kind,
    text,
  });

  it('ranks built over researched over pre-research over ran', () => {
    expect(
      classOfTraces([
        t('Scanner drops contests; 2 tests'),
        t('Queue: oss-bounties x done; proof is y'),
      ]),
    ).toBe('built');
    expect(classOfTraces([t('Queue: oss-bounties useagent#113 dropped — a $5 usage task')])).toBe(
      'ran',
    );
    expect(
      classOfTraces([
        t('gankdat research: 10-12 row has the first 2 sign-ups'),
        t('Queue: gankdat research_after 2026-10-15'),
      ]),
    ).toBe('researched');
    expect(classOfTraces([t('Exchange pre-research: EPC register declined')])).toBe('pre-research');
    expect(
      classOfTraces([t('Exchange pre-research: x parked'), t('Queue: foundry +3 (a, b, c)')]),
    ).toBe('researched');
    expect(classOfTraces([t('Stopping: pipeline starved; pre-research spent at 17:21')])).toBe(
      'ran',
    );
    expect(classOfTraces([t('metrics: 2026-10-12 daily check', 'commit')])).toBe('ran');
  });
});

describe('table and idleLines', () => {
  it('prints one row per routine, a total row, and the two percentages', () => {
    const slots = slotsIn(
      utilisationRoutines(),
      at('2026-10-13T17:00:00Z'),
      at('2026-10-14T02:00:00Z'),
      at('2026-10-14T03:30:00Z'),
    );
    const classified = classifySlots({ runsText: NIGHT_10_13, slots });
    const out = table(classified, at('2026-10-13T00:00:00Z'), at('2026-10-13T23:59:59Z'));
    expect(out).toContain('Slots 2026-10-13..2026-10-13 UTC');
    expect(out).toContain(
      '| Routine | Slots | Built | Researched | Pre-research | Ran | Cold | Silent | Missed | Built % | Idle % |',
    );
    // burn-down: 10 fires, 1 pass + 1 research, 8 cold → 0 of 2 with work built, 80% idle; build 17:00 ran.
    expect(out).toContain('| burn-down | 10 | 0 | 1 | 1 | 0 | 8 | 0 | 0 | 0% | 80% |');
    expect(out).toContain('| build | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0% | 0% |');
    expect(out).toContain('| **total** | 11 | 0 | 1 | 1 | 1 | 8 | 0 | 0 | 0% | 73% |');
    expect(idleLines(classified)[0]).toBe('cold: burn-down 2026-10-13 18:00');
    expect(idleLines(classified)).toHaveLength(8);
  });
});

describe('usageAsk', () => {
  const now = at('2026-10-14T01:00:00Z');

  it('asks once the report is older than 7 days and nothing asked in the last 7 days', () => {
    const ask = usageAsk({ date: '2026-10-04', total_pct: 14 }, '', now);
    expect(ask).toContain('usage note');
    expect(ask).toContain('the last one was 2026-10-04');
    expect(usageAsk(undefined, '', now)).toContain('none received yet');
  });

  it('stays quiet while the report is fresh or a notify ask from the last 7 days is in RUNS.md', () => {
    expect(usageAsk({ date: '2026-10-10', total_pct: 40 }, '', now)).toBeUndefined();
    const asked =
      '- 2026-10-12 08:00 | notify | Please send a usage note like "usage 62% fable 71%"\n';
    expect(usageAsk({ date: '2026-10-04', total_pct: 14 }, asked, now)).toBeUndefined();
    const old =
      '- 2026-10-05 08:00 | notify | Please send a usage note like "usage 62% fable 71%"\n';
    expect(usageAsk({ date: '2026-10-04', total_pct: 14 }, old, now)).toBeDefined();
  });
});

describe('parseArgs and windowOf', () => {
  it('defaults to the 7 complete days before today and honours --to / --days / --from', () => {
    const now = at('2026-10-14T01:12:00Z');
    expect(windowOf(parseArgs([]), now)).toEqual({
      from: at('2026-10-07T00:00:00Z'),
      to: at('2026-10-13T23:59:59Z'),
    });
    expect(windowOf(parseArgs(['--to=2026-10-12']), now).from.toISOString()).toBe(
      '2026-10-06T00:00:00.000Z',
    );
    expect(windowOf(parseArgs(['--days=14']), now).from.toISOString()).toBe(
      '2026-09-30T00:00:00.000Z',
    );
    expect(windowOf(parseArgs(['--from=2026-10-10']), now).from.toISOString()).toBe(
      '2026-10-10T00:00:00.000Z',
    );
    expect(parseArgs(['--days=zero']).days).toBe(7);
  });
});
