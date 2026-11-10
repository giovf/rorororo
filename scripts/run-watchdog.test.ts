import { describe, expect, it } from 'vitest';
import {
  ROUTINES,
  dispatchRunsFrom,
  handoffNotifyLine,
  missedLine,
  missedSlots,
  pacedReason,
  pacedSlots,
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
      '- 2026-09-25 19:40 | watchdog | stalled: build slot 2026-09-25 17:00 UTC started 17:03, no push by 19:00; usage limit? claude.ai/code/routines',
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

  it('takes the metrics start marker plus both dispatched job commits as the 07:00 trace', () => {
    // 2026-10-15 as it happened: the routine dispatched both jobs at 07:14, the rows landed by
    // 07:17, and its own `metrics:` commit never came (nothing changed). Only that day's slots
    // are in scope (`since`); the 09:00 build slot is due too at 11:30, give it its line.
    const later = at('2026-10-15T11:30:00Z');
    const since = Date.parse('2026-10-15T00:00:00Z');
    const runsText = '# Run log\n- 2026-10-15 09:17 | build | Pipeline starved and cooled\n';
    const slotsText = '# Slot starts\n\n- 2026-10-15 07:02 | metrics | started\n';
    const marker =
      '2026-10-15T07:02:10+00:00\tmetrics: slot 2026-10-15 07:02 UTC started (metrics)\n';
    const store = `${marker}2026-10-15T07:15:40+00:00\tstore-metrics: 2026-10-15 daily check\n`;
    const both = `${store}2026-10-15T07:17:05+00:00\tmetrics(gankdat): 2026-10-15 daily numbers\n`;
    const keys = (commitsText: string, slots = slotsText): string[] =>
      missedSlots({ now: later, runsText, commitsText, slotsText: slots, since }).map(
        (s) => `${slotKey(s.routine, s.at)}${s.startedAt ? ' stalled' : ''}`,
      );
    expect(keys(both)).toEqual([]);
    // One job's commit is not enough: the run stamped its marker and died before the second dispatch.
    expect(keys(store)).toEqual(['metrics@2026-10-15 07:00 stalled']);
    // The marker commit alone is a start, not a trace, even though it begins with `metrics: `.
    expect(keys(marker)).toEqual(['metrics@2026-10-15 07:00 stalled']);
    // Both commits with no marker are a late cron's work, not the routine's: still missed.
    expect(keys(both.replace(marker, ''), '')).toEqual(['metrics@2026-10-15 07:00']);
    // A build slot has no dispatched jobs: a marker plus unrelated commits never traces it.
    expect(ROUTINES.find((d) => d.routine === 'build')?.dispatched).toBeUndefined();
  });

  it('takes a workflow_dispatch run of both metrics jobs as the 07:00 trace when the marker is missing', () => {
    // 2026-10-17 as it happened: the routine dispatched both jobs at 07:13 and never stamped
    // docs/ops/SLOTS.md; the rows landed 07:14 and 07:17 and the 09:13 watchdog wrote `missed:`.
    const later = at('2026-10-17T09:13:00Z');
    const since = Date.parse('2026-10-17T00:00:00Z');
    const runsText = '# Run log\n';
    const commitsText = [
      '2026-10-17T07:14:30+00:00\tstore-metrics: 2026-10-17 daily check',
      '2026-10-17T07:17:05+00:00\tmetrics(gankdat): 2026-10-17 daily numbers',
      '',
    ].join('\n');
    const run = (workflow: string, event: string, iso: string) => ({
      workflow,
      event,
      startedAt: at(iso),
    });
    const both = [
      run('gankdat-metrics.yml', 'workflow_dispatch', '2026-10-17T07:13:53Z'),
      run('store-metrics.yml', 'workflow_dispatch', '2026-10-17T07:13:40Z'),
    ];
    const keys = (dispatchRuns: ReturnType<typeof run>[]): string[] =>
      missedSlots({ now: later, runsText, commitsText, slotsText: '', since, dispatchRuns }).map(
        (s) => slotKey(s.routine, s.at),
      );
    expect(keys(both)).toEqual([]);
    // The late cron's runs carry `schedule`: commits plus scheduled runs stay missed.
    expect(keys(both.map((r) => ({ ...r, event: 'schedule' })))).toEqual([
      'metrics@2026-10-17 07:00',
    ]);
    // One dispatched workflow of two is a run that died between its dispatches.
    expect(keys(both.slice(0, 1))).toEqual(['metrics@2026-10-17 07:00']);
    // A dispatch outside the window (yesterday's 17:22 re-run) is not this slot's.
    expect(keys(both.map((r) => ({ ...r, startedAt: at('2026-10-16T17:22:38Z') })))).toEqual([
      'metrics@2026-10-17 07:00',
    ]);
    // Without the API (no token, an error) the input is absent and the 10-17 morning is still missed.
    expect(keys([])).toEqual(['metrics@2026-10-17 07:00']);
  });

  it('maps the Actions API run list to dispatch runs and drops runs that never started', () => {
    expect(
      dispatchRunsFrom([
        {
          path: '.github/workflows/gankdat-metrics.yml',
          event: 'workflow_dispatch',
          run_started_at: '2026-10-17T07:13:53Z',
        },
        { path: '.github/workflows/check.yml', event: 'push', run_started_at: null },
        { event: 'workflow_dispatch', run_started_at: '2026-10-17T07:13:53Z' },
      ]),
    ).toEqual([
      {
        workflow: 'gankdat-metrics.yml',
        event: 'workflow_dispatch',
        startedAt: at('2026-10-17T07:13:53Z'),
      },
    ]);
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

describe('paced burn-down slots (foundry cutoff-signal-ignores-paced-burn-down, 2026-11-10)', () => {
  const burnText = JSON.stringify({
    enabled: true,
    nights: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    stop_if_weekly_pct_at_least: 80,
    report: { date: '2026-10-04', total_pct: 14, fable_pct: null },
    week_slots: 33,
    week_reserve: 3,
  });
  // Friday 11-06: the 09:00 build stalled (watchdog 11:07), so the 17:00 burn-down ended at its gate
  const runsText = [
    '# Run log',
    '- 2026-11-06 11:07 | watchdog | stalled: build slot 2026-11-06 09:00 UTC started 09:09, no push by 11:00; usage limit? claude.ai/code/routines',
    '- 2026-11-06 17:40 | build | Built gankdat x',
    '',
  ].join('\n');
  const slotsText =
    '# Slot starts\n\n- 2026-11-05 17:10 | build | started\n- 2026-11-06 09:09 | build | started\n- 2026-11-06 17:10 | build | started\n';
  const now = at('2026-11-06T19:39:00Z');
  const slot = at('2026-11-06T17:00:00Z');

  it('pacedReason replays the gate at the slot with the lines before it', () => {
    expect(pacedReason(slot, runsText, slotsText, burnText)).toBe(
      'usage report 2026-10-04 is stale; cutoff seen — watchdog 2026-11-06 11:07: stalled: build slot 2026-11-06 09:00 UTC started 09:09, no push by 11:00',
    );
    // no BURN.json, or a fresh report under the cap: no gate stop
    expect(pacedReason(slot, runsText, slotsText, undefined)).toBeUndefined();
    const fresh = burnText.replace('"date":"2026-10-04"', '"date":"2026-11-05"');
    expect(pacedReason(slot, runsText, slotsText, fresh)).toBeUndefined();
    // the switches of BURN.json stop a slot too
    expect(
      pacedReason(slot, runsText, slotsText, burnText.replace('"enabled":true', '"enabled":false')),
    ).toBe('BURN.json enabled is false');
    expect(pacedReason(slot, runsText, slotsText, burnText.replace('"fri",', ''))).toBe(
      'fri is not in BURN.json nights',
    );
    const over = fresh.replace('"total_pct":14', '"total_pct":85');
    expect(pacedReason(slot, runsText, slotsText, over)).toBe(
      'usage 85% on 2026-11-05 is at or above 80%',
    );
    // lines stamped after the slot are not what the gate saw
    const later = `${runsText}- 2026-11-06 18:30 | watchdog | stalled: build slot 2026-11-06 17:00 UTC started 17:10, no push by 18:30; usage limit? claude.ai/code/routines\n`;
    const fridayClean = runsText.replace(/- 2026-11-06 11:07 .*\n/, '');
    expect(pacedReason(slot, `${fridayClean}`, slotsText, burnText)).toBeUndefined();
    expect(
      pacedReason(slot, later.replace(/- 2026-11-06 11:07 .*\n/, ''), slotsText, burnText),
    ).toBeUndefined();
  });

  it('reports the gated 17:00 burn-down as paced, without the usage-limit hint, and dedupes on it', () => {
    const missed = missedSlots({
      now,
      runsText,
      commitsText: '',
      slotsText,
      burnText,
      lookbackHours: 4,
    });
    expect(missed.map((s) => slotKey(s.routine, s.at))).toEqual(['burn-down@2026-11-06 17:00']);
    const line = missedLine(missed[0]!, now);
    expect(
      line.startsWith(
        '- 2026-11-06 19:39 | watchdog | paced: burn-down slot 2026-11-06 17:00 UTC stopped by the gate — usage report 2026-10-04 is stale; cutoff seen — ',
      ),
    ).toBe(true);
    expect(line.endsWith('…')).toBe(true);
    const text = line.split('|')[2]?.trim() ?? '';
    expect(text.length).toBe(120);
    expect(text).not.toContain('usage limit?');
    const withLine = `${runsText}${line}\n`;
    expect(reportedSlots(withLine)).toEqual(
      new Set(['build@2026-11-06 09:00', 'burn-down@2026-11-06 17:00']),
    );
    expect(pacedSlots(withLine)).toEqual(new Set(['burn-down@2026-11-06 17:00']));
    expect(
      missedSlots({
        now,
        runsText: withLine,
        commitsText: '',
        slotsText,
        burnText,
        lookbackHours: 4,
      }),
    ).toEqual([]);
    // a build slot is never paced, and without BURN.json the burn-down stays missed
    const noBurn = missedSlots({ now, runsText, commitsText: '', slotsText, lookbackHours: 4 });
    expect(missedLine(noBurn[0]!, now)).toContain('missed: burn-down slot 2026-11-06 17:00 UTC');
    expect(pacedSlots(runsText)).toEqual(new Set());
  });

  it('leaves a burn-down the gate would have let through as missed', () => {
    const quiet = '# Run log\n- 2026-11-06 17:40 | build | Built gankdat x\n';
    const missed = missedSlots({
      now,
      runsText: quiet,
      commitsText: '',
      slotsText,
      burnText,
      lookbackHours: 4,
    });
    expect(missed[0]?.paced).toBeUndefined();
    expect(missedLine(missed[0]!, now)).toContain('missed: burn-down slot 2026-11-06 17:00 UTC');
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
      '- 2026-09-25 19:40 | watchdog | missed: build slot 2026-09-25 17:00 UTC left no commit or run line by 19:00; usage limit? claude.ai/code/routines',
    );
    const text = line.split('|')[2]?.trim() ?? '';
    expect(text.length).toBeLessThanOrEqual(120);
  });

  it('keeps missed and stalled lines within the cap for every routine name', () => {
    const now = at('2026-09-25T19:40:00Z');
    for (const def of ROUTINES) {
      const base = {
        routine: def.routine,
        at: at('2026-09-25T17:00:00Z'),
        deadline: at('2026-09-25T19:00:00Z'),
        def,
      };
      for (const slot of [base, { ...base, startedAt: at('2026-09-25T17:03:00Z') }]) {
        const text = missedLine(slot, now).split('|')[2]?.trim() ?? '';
        expect(text.length, text).toBeLessThanOrEqual(120);
      }
    }
  });
});

describe('handoffNotifyLine', () => {
  const alerts = [
    '# Alerts',
    '',
    '- 2026-10-04 handoff: **sign and upload ReadFocus 0.3.0** (ruler controls) with amo-publish.sh.',
    '- 2026-10-05 handoff: **sign and upload Highlight Keep 0.4.0** (Weava import) the same way.',
    '- 2026-10-07 owner: **let CI read Google Search Console** (~10 min, £0).',
    '- 2026-10-01 handoff: closed one — Done 2026-10-02 (build): done.',
    '',
  ].join('\n');
  const now = at('2026-10-10T08:40:00Z');

  it('sends one phone line naming the oldest handoff once any is older than 3 days', () => {
    expect(handoffNotifyLine(alerts, '# Run log\n', now)).toBe(
      '- 2026-10-10 08:40 | notify | 2 jobs for your next Claude Code session, oldest 6 days: sign and upload ReadFocus 0.3.0',
    );
    expect(handoffNotifyLine(alerts, '# Run log\n', at('2026-10-07T08:40:00Z'))).toBeUndefined();
  });

  it('repeats it only after 7 days: the notify line in RUNS.md is the dedupe record', () => {
    const line = handoffNotifyLine(alerts, '# Run log\n', at('2026-10-08T06:40:00Z'))!;
    const runsText = `# Run log\n${line}\n`;
    expect(handoffNotifyLine(alerts, runsText, now)).toBeUndefined();
    expect(handoffNotifyLine(alerts, runsText, at('2026-10-15T08:40:00Z'))).toMatch(
      /^- 2026-10-15 08:40 \| notify \| 2 jobs for your next Claude Code session, oldest 11 days: /,
    );
    // Another notify line (an owner-ask digest) is not the record.
    const other =
      '# Run log\n- 2026-10-09 07:30 | notify | 5 requests waiting on you, oldest 9 days: x\n';
    expect(handoffNotifyLine(alerts, other, now)).toBeDefined();
  });
});
