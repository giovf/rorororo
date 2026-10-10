import { describe, expect, it } from 'vitest';
import {
  ROUTINES,
  missedLine,
  missedSlots,
  parseCommits,
  parseRuns,
  reportedSlots,
  slotKey,
  slotsDue,
} from './run-watchdog.js';

const at = (iso: string): Date => new Date(iso);
const SINCE = Date.parse('2026-09-25T17:00:00Z');

const runsOk = [
  '# Run log',
  '',
  '- 2026-09-25 09:37 | build | Agent-side sign-up shipped (v0.18.0)',
  '- 2026-09-25 17:41 | build | Run watchdog shipped',
  '',
].join('\n');

describe('slotsDue', () => {
  it('reports nothing while a slot is still inside its grace window', () => {
    expect(slotsDue(ROUTINES, at('2026-09-25T18:30:00Z'), SINCE)).toEqual([]);
  });

  it('lists the 17:00 build once its 2h deadline has passed, and nothing before SINCE', () => {
    const due = slotsDue(ROUTINES, at('2026-09-25T19:05:00Z'), SINCE);
    expect(due.map((s) => slotKey(s.routine, s.at))).toEqual(['build@2026-09-25 17:00']);
    expect(due[0]?.deadline.toISOString()).toBe('2026-09-25T19:00:00.000Z');
  });

  it('knows the weekly slots by weekday and keeps to the lookback window', () => {
    // Thursday 2026-10-01 12:00: Wednesday's exchange is due, Monday's report and Sunday's
    // review are outside 48 h (Tuesday 17:00 is just inside), today's 17:00 build is not due
    // yet; the burn-down slot did not exist before it went nightly on 2026-10-04.
    const keys = slotsDue(ROUTINES, at('2026-10-01T12:00:00Z'), 0, 48).map((s) =>
      slotKey(s.routine, s.at),
    );
    expect(keys).toEqual([
      'build@2026-09-29 17:00',
      'metrics@2026-09-30 07:00',
      'exchange@2026-09-30 08:00',
      'build@2026-09-30 09:00',
      'build@2026-09-30 17:00',
      'metrics@2026-10-01 07:00',
      'build@2026-10-01 09:00',
    ]);
  });

  it('includes the Sunday review and Monday report on their days', () => {
    const keys = slotsDue(ROUTINES, at('2026-09-28T10:00:00Z'), 0, 30).map((s) =>
      slotKey(s.routine, s.at),
    );
    expect(keys).toContain('review@2026-09-27 08:00');
    expect(keys).toContain('report@2026-09-28 07:30');
    expect(keys).not.toContain('exchange@2026-09-27 08:00');
  });

  it('watches the burn-down every night at 17:00 from 2026-10-04, not only Wednesdays', () => {
    // Monday 2026-10-05 and Tuesday 2026-10-06 are not Wednesdays; both nights are watched.
    const keys = slotsDue(ROUTINES, at('2026-10-07T12:00:00Z'), 0, 48).map((s) =>
      slotKey(s.routine, s.at),
    );
    expect(keys).toContain('burn-down@2026-10-05 17:00');
    expect(keys).toContain('burn-down@2026-10-06 17:00');
    expect(keys.filter((k) => k.startsWith('burn-down@'))).toHaveLength(2);
    // A full week lists seven burn-down slots, one per night.
    const week = slotsDue(ROUTINES, at('2026-10-18T12:00:00Z'), 0, 7 * 24).filter(
      (s) => s.routine === 'burn-down',
    );
    expect(week).toHaveLength(7);
    // Before the schedule went nightly there was no slot to miss (Wednesday 18:00 included).
    const before = slotsDue(ROUTINES, at('2026-10-04T12:00:00Z'), 0, 7 * 24).filter(
      (s) => s.routine === 'burn-down',
    );
    expect(before).toEqual([]);
  });

  it('includes the Saturday ops retro only on Saturdays', () => {
    const keys = slotsDue(ROUTINES, at('2026-10-03T10:30:00Z'), 0, 30).map((s) =>
      slotKey(s.routine, s.at),
    );
    expect(keys).toContain('retro@2026-10-03 07:59');
    expect(keys).not.toContain('retro@2026-10-02 07:59');
  });
});

describe('parsers', () => {
  it('reads RUNS.md lines and git log lines as traces', () => {
    const runs = parseRuns(runsOk);
    expect(runs).toHaveLength(2);
    expect(runs[1]).toMatchObject({ kind: 'build', at: at('2026-09-25T17:41:00Z') });
    const commits = parseCommits(
      '2026-09-25T07:18:22+00:00\tmetrics: 2026-09-25 daily check\n2026-09-25T07:18:36+00:00\tmetrics(gankdat): 2026-09-25 daily numbers\n',
    );
    expect(commits).toHaveLength(2);
    expect(commits[0]).toMatchObject({ kind: 'commit', text: 'metrics: 2026-09-25 daily check' });
  });
});

describe('missedSlots', () => {
  const now = at('2026-09-25T19:40:00Z');

  it('is quiet when the routine wrote its RUNS.md line inside the window', () => {
    expect(missedSlots({ now, runsText: runsOk, commitsText: '' })).toEqual([]);
  });

  it('accepts a matching commit as the trace when RUNS.md is silent', () => {
    const commitsText = '2026-09-25T17:44:00+00:00\tgankdat: something useful (build)\n';
    expect(missedSlots({ now, runsText: '# Run log\n', commitsText })).toEqual([]);
  });

  it('reports a slot whose only activity is outside the grace window or from another job', () => {
    const commitsText = [
      '2026-09-25T19:30:00+00:00\tgankdat: late push (build)',
      '2026-09-25T17:20:00+00:00\tmetrics(gankdat): 2026-09-25 daily numbers',
      '2026-09-25T17:10:00+00:00\tinbox: 2026-09-25 17:05 triage',
    ].join('\n');
    const missed = missedSlots({ now, runsText: '# Run log\n', commitsText });
    expect(missed.map((s) => slotKey(s.routine, s.at))).toEqual(['build@2026-09-25 17:00']);
  });

  it('distinguishes the 07:00 metrics routine from the CI metrics job', () => {
    const later = at('2026-09-26T11:30:00Z');
    // 2026-09-26 is a Saturday, so the ops retro's 07:59 slot is due too; give it its trace.
    const retro = '2026-09-26T09:40:00+00:00\tretro: 2026-W39 ops\n';
    const ci = `${retro}2026-09-26T07:15:00+00:00\tmetrics(gankdat): 2026-09-26 daily numbers\n`;
    const routine = `${ci}2026-09-26T07:14:00+00:00\tmetrics: 2026-09-26 daily check\n`;
    const only = (text: string): string[] =>
      missedSlots({ now: later, runsText: runsOk, commitsText: text }).map((s) =>
        slotKey(s.routine, s.at),
      );
    expect(only(ci)).toEqual(['metrics@2026-09-26 07:00', 'build@2026-09-26 09:00']);
    expect(only(routine)).toEqual(['build@2026-09-26 09:00']);
  });

  it('does not take a start marker for the work, and reports a started-then-dead slot as stalled', () => {
    const slotsText = '# Slot starts\n\n- 2026-09-25 17:03 | build | started\n';
    const marker = '2026-09-25T17:03:20+00:00\tbuild: slot 2026-09-25 17:03 UTC started (build)\n';
    const stalled = missedSlots({ now, runsText: '# Run log\n', commitsText: marker, slotsText });
    expect(stalled.map((s) => slotKey(s.routine, s.at))).toEqual(['build@2026-09-25 17:00']);
    expect(stalled[0]?.startedAt?.toISOString()).toBe('2026-09-25T17:03:00.000Z');
    expect(missedLine(stalled[0]!, now)).toBe(
      '- 2026-09-25 19:40 | watchdog | stalled: build slot 2026-09-25 17:00 UTC started 17:03 but pushed nothing by 19:00; usage limit? see claude.ai/code/routines',
    );
    // The stalled line dedupes like a missed one, and a real commit after the marker is the trace.
    expect(reportedSlots(`# Run log\n${missedLine(stalled[0]!, now)}\n`)).toEqual(
      new Set(['build@2026-09-25 17:00']),
    );
    const finished = `${marker}2026-09-25T17:44:00+00:00\tgankdat: something useful (build)\n`;
    expect(missedSlots({ now, runsText: '# Run log\n', commitsText: finished, slotsText })).toEqual(
      [],
    );
  });

  it('never reports the same slot twice: the RUNS.md line is the dedupe record', () => {
    const first = missedSlots({ now, runsText: '# Run log\n', commitsText: '' });
    expect(first).toHaveLength(1);
    const line = missedLine(first[0]!, now);
    const runsText = `# Run log\n${line}\n`;
    expect(reportedSlots(runsText)).toEqual(new Set(['build@2026-09-25 17:00']));
    expect(missedSlots({ now, runsText, commitsText: '' })).toEqual([]);
    // The watchdog's own line is not a build trace either.
    expect(parseRuns(runsText)[0]?.kind).toBe('watchdog');
  });
});

describe('missedLine', () => {
  it('follows the RUNS.md format with a ≤ 120-char sentence', () => {
    const [slot] = missedSlots({
      now: at('2026-09-25T19:40:00Z'),
      runsText: '# Run log\n',
      commitsText: '',
    });
    const line = missedLine(slot!, at('2026-09-25T19:40:00Z'));
    expect(line).toBe(
      '- 2026-09-25 19:40 | watchdog | missed: build slot 2026-09-25 17:00 UTC left no commit or run line by 19:00; usage limit? see claude.ai/code/routines',
    );
    const text = line.split('|')[2]?.trim() ?? '';
    expect(text.length).toBeLessThanOrEqual(120);
  });
});
