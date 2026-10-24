import { describe, expect, it } from 'vitest';
import {
  buildSlotInFlight,
  burnSlotsUsed,
  cutoffSeen,
  lastExchangeSlot,
  lastWeeklyReset,
  missedExchange,
  datedArrived,
  dayStart,
  lineStamp,
  nightStart,
  pacedStop,
  preResearchSpent,
  reportStale,
  datedWithinDay,
} from './pipeline-cold.ts';

const pass =
  '- 2026-10-07 21:38 | burn-down | Exchange pre-research: EA waste carriers register parked';
const stopping =
  '- 2026-10-07 18:25 | burn-down | Stopping: 2 items built; pipeline starved-and-cooled, pre-research spent';
const runs = (...lines: string[]): string => `# Runs\n\n${lines.join('\n')}\n`;

describe('nightStart', () => {
  it('is today 17:00 from 17:00 on', () => {
    expect(nightStart(new Date('2026-10-07T17:00:00Z'))).toBe('2026-10-07 17:00');
    expect(nightStart(new Date('2026-10-07T23:59:59Z'))).toBe('2026-10-07 17:00');
  });
  it('is yesterday 17:00 before 17:00 (the post-midnight firings)', () => {
    expect(nightStart(new Date('2026-10-08T02:19:00Z'))).toBe('2026-10-07 17:00');
    expect(nightStart(new Date('2026-10-08T16:59:00Z'))).toBe('2026-10-07 17:00');
  });
  it('crosses a month boundary', () => {
    expect(nightStart(new Date('2026-11-01T01:00:00Z'))).toBe('2026-10-31 17:00');
  });
});

describe('lineStamp', () => {
  it('reads the stamp of a run-log line and nothing else', () => {
    expect(lineStamp(pass)).toBe('2026-10-07 21:38');
    expect(lineStamp('# Runs')).toBeUndefined();
    expect(lineStamp('- 2026-10-07 | notify | no time')).toBeUndefined();
  });
});

describe('preResearchSpent', () => {
  it('counts a pass line stamped this night', () => {
    expect(preResearchSpent(runs(pass), new Date('2026-10-07T22:10:00Z'))).toBe(true);
    expect(preResearchSpent(runs(pass), new Date('2026-10-08T02:10:00Z'))).toBe(true);
  });
  it("ignores last night's pass once a new night starts", () => {
    expect(preResearchSpent(runs(pass), new Date('2026-10-08T17:10:00Z'))).toBe(false);
  });
  it('ignores a Stopping line that merely mentions pre-research', () => {
    expect(preResearchSpent(runs(stopping), new Date('2026-10-07T19:00:00Z'))).toBe(false);
  });
  it("ignores the prefix on another routine's line", () => {
    const other = pass.replace('| burn-down |', '| exchange |');
    expect(preResearchSpent(runs(other), new Date('2026-10-07T22:10:00Z'))).toBe(false);
  });
  it("counts a build pass inside the burn-down's night (the 17:10 build and the 17:00 burn)", () => {
    const build =
      '- 2026-10-07 17:25 | build | Exchange pre-research: EA waste carriers register parked';
    expect(preResearchSpent(runs(build), new Date('2026-10-07T18:10:00Z'))).toBe(true);
  });
  it("reads the build's day window from 07:00 with --routine=build", () => {
    const morning =
      '- 2026-10-07 09:40 | build | Exchange pre-research: EA waste carriers register parked';
    expect(preResearchSpent(runs(morning), new Date('2026-10-07T17:15:00Z'), 'build')).toBe(true);
    expect(preResearchSpent(runs(morning), new Date('2026-10-08T09:15:00Z'), 'build')).toBe(false);
    // a burn-down pass of the night before (01:30) is outside the day that starts at 07:00
    const night =
      '- 2026-10-08 01:30 | burn-down | Exchange pre-research: EA waste carriers register parked';
    expect(preResearchSpent(runs(night), new Date('2026-10-08T09:15:00Z'), 'build')).toBe(false);
    // but a burn-down pass at 17:21 spends the build's day too (the day runs to the next 07:00)
    const evening =
      '- 2026-10-08 17:21 | burn-down | Exchange pre-research: VOA rating list declined';
    expect(preResearchSpent(runs(evening), new Date('2026-10-08T17:40:00Z'), 'build')).toBe(true);
  });
  it('is false on an empty log', () => {
    expect(preResearchSpent('', new Date('2026-10-07T22:10:00Z'))).toBe(false);
  });
});

describe('dayStart', () => {
  it('is today 07:00 from 07:00 on, yesterday 07:00 before it', () => {
    expect(dayStart(new Date('2026-10-07T09:10:00Z'))).toBe('2026-10-07 07:00');
    expect(dayStart(new Date('2026-10-08T02:10:00Z'))).toBe('2026-10-07 07:00');
  });
});

describe('datedArrived', () => {
  it('counts today only from 07:00 UTC, any earlier day always, no date always', () => {
    expect(datedArrived('2026-10-08', new Date('2026-10-08T00:13:00Z'))).toBe(false);
    expect(datedArrived('2026-10-08', new Date('2026-10-08T07:00:00Z'))).toBe(true);
    expect(datedArrived('2026-10-07', new Date('2026-10-08T00:13:00Z'))).toBe(true);
    expect(datedArrived('2026-10-09', new Date('2026-10-08T23:59:00Z'))).toBe(false);
    expect(datedArrived(undefined, new Date('2026-10-08T00:13:00Z'))).toBe(true);
  });
});

describe('datedWithinDay', () => {
  it('is true for an item due today before 07:00 or tomorrow, false once arrived or further out', () => {
    const night = new Date('2026-10-20T00:07:00Z');
    expect(datedWithinDay('2026-10-20', night)).toBe(true);
    expect(datedWithinDay('2026-10-21', night)).toBe(true);
    expect(datedWithinDay('2026-10-22', night)).toBe(false);
    expect(datedWithinDay(undefined, night)).toBe(false);
    expect(datedWithinDay('2026-10-20', new Date('2026-10-20T07:00:00Z'))).toBe(false);
  });
});

describe('buildSlotInFlight', () => {
  const slots = (...lines: string[]): string => `# Slot starts\n\n${lines.join('\n')}\n`;
  const marker = '- 2026-10-23 17:10 | build | started';
  it('names a build marker of the last hour with no build run-log line after it', () => {
    expect(buildSlotInFlight(slots(marker), runs(pass), new Date('2026-10-23T17:11:00Z'))).toBe(
      '2026-10-23 17:10',
    );
    expect(buildSlotInFlight(slots(marker), runs(), new Date('2026-10-23T18:05:00Z'))).toBe(
      '2026-10-23 17:10',
    );
  });
  it('is over once the build slot logged a run-log line at or after its marker', () => {
    const built = '- 2026-10-23 17:40 | build | gankdat researched: 3 items filed';
    expect(buildSlotInFlight(slots(marker), runs(built), new Date('2026-10-23T17:45:00Z'))).toBe(
      undefined,
    );
    const earlier = '- 2026-10-23 09:25 | build | Bazaar week-1 read';
    expect(buildSlotInFlight(slots(marker), runs(earlier), new Date('2026-10-23T17:45:00Z'))).toBe(
      '2026-10-23 17:10',
    );
  });
  it('ignores a marker older than an hour, a future one, and other routines', () => {
    expect(buildSlotInFlight(slots(marker), runs(), new Date('2026-10-23T18:11:00Z'))).toBe(
      undefined,
    );
    expect(buildSlotInFlight(slots(marker), runs(), new Date('2026-10-23T17:00:00Z'))).toBe(
      undefined,
    );
    const metrics = '- 2026-10-23 17:10 | metrics | started';
    expect(buildSlotInFlight(slots(metrics), runs(), new Date('2026-10-23T17:11:00Z'))).toBe(
      undefined,
    );
  });
  it('never defers the build routine itself', () => {
    expect(
      buildSlotInFlight(slots(marker), runs(), new Date('2026-10-23T17:11:00Z'), 'build'),
    ).toBe(undefined);
  });
});

describe('lastExchangeSlot', () => {
  it('is this Wednesday 08:00 from Thursday on, and on Wednesday from 08:00', () => {
    expect(lastExchangeSlot(new Date('2026-10-22T09:05:00Z'))).toBe('2026-10-21 08:00');
    expect(lastExchangeSlot(new Date('2026-10-24T17:10:00Z'))).toBe('2026-10-21 08:00');
    expect(lastExchangeSlot(new Date('2026-10-21T08:00:00Z'))).toBe('2026-10-21 08:00');
  });
  it('is the Wednesday before on Wednesday morning and Sunday to Tuesday', () => {
    expect(lastExchangeSlot(new Date('2026-10-21T07:59:00Z'))).toBe('2026-10-14 08:00');
    expect(lastExchangeSlot(new Date('2026-10-27T09:00:00Z'))).toBe('2026-10-21 08:00');
  });
  it('crosses a month boundary', () => {
    expect(lastExchangeSlot(new Date('2026-11-01T09:00:00Z'))).toBe('2026-10-28 08:00');
  });
});

describe('missedExchange', () => {
  const thursday = new Date('2026-10-22T09:05:00Z');
  const saturday = new Date('2026-10-24T17:10:00Z');
  const exchangeLine =
    '- 2026-10-21 08:50 | exchange | Winner: Zoho Marketplace verification widget (score 6)';
  const reason = 'exchange missed: 2026-10-21 — run docs/routines/exchange.md';
  it('names the missed Wednesday from Thursday to Saturday when no trace exists since 08:00', () => {
    expect(missedExchange(thursday, runs(pass), '')).toBe(reason);
    expect(missedExchange(saturday, runs(pass), 'metrics: 2026-10-24 daily numbers\n')).toBe(
      reason,
    );
  });
  it('is satisfied by an | exchange | run-log line stamped since that Wednesday 08:00', () => {
    expect(missedExchange(thursday, runs(exchangeLine), '')).toBeUndefined();
    // the Thursday fallback's own lines count for Friday and Saturday
    const fallback = exchangeLine.replace('2026-10-21 08:50', '2026-10-22 09:40');
    expect(missedExchange(saturday, runs(fallback), '')).toBeUndefined();
  });
  it('ignores an exchange line from before the slot and another routine mentioning the exchange', () => {
    const old = exchangeLine.replace('2026-10-21 08:50', '2026-10-14 08:50');
    const burn = '- 2026-10-24 01:33 | burn-down | Call: promote reshaped for the 10-28 exchange';
    expect(missedExchange(thursday, runs(old, burn), '')).toBe(reason);
  });
  it('is satisfied by a (venture exchange) commit subject and by nothing else', () => {
    const subjects =
      'relay: exchange-2026-W43\nexchange: 2026-W43 Zoho widget (venture exchange)\n';
    expect(missedExchange(thursday, runs(), subjects)).toBeUndefined();
    const lookalike = 'exchange: Zoho Marketplace spike — promote reshaped (burn-down)\n';
    expect(missedExchange(thursday, runs(), lookalike)).toBe(reason);
  });
  it('is undefined from Sunday to Wednesday (the next exchange is nearer than the missed one)', () => {
    expect(missedExchange(new Date('2026-10-25T09:05:00Z'), runs(), '')).toBeUndefined();
    expect(missedExchange(new Date('2026-10-21T09:05:00Z'), runs(), '')).toBeUndefined();
  });
});

describe('lastWeeklyReset', () => {
  it('is this Thursday 03:00 from Thursday 03:00 on, the one before until then', () => {
    expect(lastWeeklyReset(new Date('2026-10-22T03:00:00Z')).toISOString()).toBe(
      '2026-10-22T03:00:00.000Z',
    );
    expect(lastWeeklyReset(new Date('2026-10-24T17:10:00Z')).toISOString()).toBe(
      '2026-10-22T03:00:00.000Z',
    );
    expect(lastWeeklyReset(new Date('2026-10-22T02:59:00Z')).toISOString()).toBe(
      '2026-10-15T03:00:00.000Z',
    );
    expect(lastWeeklyReset(new Date('2026-10-21T21:00:00Z')).toISOString()).toBe(
      '2026-10-15T03:00:00.000Z',
    );
  });
});

describe('reportStale', () => {
  const now = new Date('2026-10-24T17:10:00Z');
  it('is stale past seven days, missing or unreadable; fresh within seven', () => {
    expect(reportStale('2026-10-04', now)).toBe(true);
    expect(reportStale('2026-10-16', now)).toBe(true);
    expect(reportStale('2026-10-18', now)).toBe(false);
    expect(reportStale('2026-10-24', now)).toBe(false);
    expect(reportStale(undefined, now)).toBe(true);
    expect(reportStale('soon', now)).toBe(true);
  });
});

describe('burnSlotsUsed', () => {
  it('counts the distinct hours of burn-down lines since 17:00, not other routines or last night', () => {
    const log = runs(
      '- 2026-10-19 16:40 | burn-down | Stopping: last night',
      '- 2026-10-19 17:40 | burn-down | Built gankdat x',
      '- 2026-10-19 17:52 | burn-down | Stopping for time',
      '- 2026-10-19 18:33 | burn-down | Built foundry y',
      '- 2026-10-19 19:05 | build | Built something',
      '- 2026-10-20 01:12 | burn-down | Exchange pre-research: skipped (2 spikes open)',
    );
    expect(burnSlotsUsed(log, new Date('2026-10-20T02:03:00Z'))).toBe(3);
    // the next night starts at 17:00 and sees none of them
    expect(burnSlotsUsed(log, new Date('2026-10-20T17:03:00Z'))).toBe(0);
    expect(burnSlotsUsed(runs(), new Date('2026-10-19T19:03:00Z'))).toBe(0);
  });
});

describe('cutoffSeen', () => {
  const slotsText = (...lines: string[]): string => `# Slot starts\n\n${lines.join('\n')}\n`;
  const day = slotsText(
    '- 2026-10-20 09:10 | build | started',
    '- 2026-10-20 17:10 | build | started',
  );
  const missed =
    '- 2026-10-21 12:16 | watchdog | missed: build slot 2026-10-21 09:00 UTC left no commit or run line by 11:00; usage limit? claude.ai/code/routines';
  const stalled =
    '- 2026-10-20 23:21 | watchdog | stalled: build slot 2026-10-20 17:00 UTC started 17:10, no push by 19:00; usage limit? claude.ai/code/routines';
  it('names a watchdog usage-limit line of the last 24 h', () => {
    expect(cutoffSeen(runs(missed), day, new Date('2026-10-21T17:03:00Z'))).toBe(
      'watchdog 2026-10-21 12:16: missed: build slot 2026-10-21 09:00 UTC left no commit or run line by 11:00',
    );
    expect(cutoffSeen(runs(stalled), day, new Date('2026-10-20T23:30:00Z'))).toBe(
      'watchdog 2026-10-20 23:21: stalled: build slot 2026-10-20 17:00 UTC started 17:10, no push by 19:00',
    );
  });
  it('ignores a watchdog line older than 24 h, before the Thursday reset, or without the hint', () => {
    const twoDays = slotsText(
      '- 2026-10-20 09:10 | build | started',
      '- 2026-10-20 17:10 | build | started',
      '- 2026-10-21 09:10 | build | started',
      '- 2026-10-21 17:10 | build | started',
    );
    expect(cutoffSeen(runs(stalled), twoDays, new Date('2026-10-22T00:03:00Z'))).toBeUndefined();
    // Wednesday 21:56 lines are 19 h old on Thursday 17:00 but the week reset at 03:00
    const wed = missed.replace('2026-10-21 12:16', '2026-10-21 21:56');
    const thuSlots = slotsText(
      '- 2026-10-22 09:10 | build | started',
      '- 2026-10-22 17:10 | build | started',
    );
    expect(cutoffSeen(runs(wed), thuSlots, new Date('2026-10-22T17:03:00Z'))).toBeUndefined();
    const minutes =
      '- 2026-10-21 01:00 | watchdog | ci-minutes: 630 billed min/7d (~2700/month); top: fetch relay 139';
    expect(cutoffSeen(runs(minutes), day, new Date('2026-10-21T01:30:00Z'))).toBeUndefined();
  });
  it('names a build slot of the last 24 h with no start marker half an hour on', () => {
    // 10-21: the 09:00 build was rejected at start; the burn-down of 17:00 reads it before the watchdog
    const tue = slotsText('- 2026-10-20 17:10 | build | started');
    expect(cutoffSeen(runs(), tue, new Date('2026-10-21T17:03:00Z'))).toBe(
      'build slot 2026-10-21 09:00 UTC left no start marker or run line',
    );
    // the 17:00 slot is judged only once its grace has passed
    expect(cutoffSeen(runs(), tue, new Date('2026-10-21T17:29:00Z'))).toBe(
      'build slot 2026-10-21 09:00 UTC left no start marker or run line',
    );
    const ok = slotsText(
      '- 2026-10-20 17:10 | build | started',
      '- 2026-10-21 09:09 | build | started',
    );
    expect(cutoffSeen(runs(), ok, new Date('2026-10-21T17:29:00Z'))).toBeUndefined();
    expect(cutoffSeen(runs(), ok, new Date('2026-10-21T17:31:00Z'))).toBe(
      'build slot 2026-10-21 17:00 UTC left no start marker or run line',
    );
  });
  it('takes a build run-log line within two hours of the slot for the marker', () => {
    const built = '- 2026-10-21 09:40 | build | Built gankdat x';
    const tue = slotsText('- 2026-10-20 17:10 | build | started');
    expect(cutoffSeen(runs(built), tue, new Date('2026-10-21T17:03:00Z'))).toBeUndefined();
    const late = '- 2026-10-21 11:40 | build | Built gankdat x';
    expect(cutoffSeen(runs(late), tue, new Date('2026-10-21T17:03:00Z'))).toBe(
      'build slot 2026-10-21 09:00 UTC left no start marker or run line',
    );
  });
  it('does not look at slots before the Thursday reset', () => {
    // Thursday 17:03: the Wednesday 17:00 slot (no marker, usage limit) is before the 03:00 reset
    const thu = slotsText('- 2026-10-22 09:10 | build | started');
    expect(cutoffSeen(runs(), thu, new Date('2026-10-22T17:03:00Z'))).toBeUndefined();
  });
});

describe('pacedStop', () => {
  const slotsText = (...lines: string[]): string => `# Slot starts\n\n${lines.join('\n')}\n`;
  const marked = (d: string): string =>
    slotsText(`- ${d} 09:10 | build | started`, `- ${d} 17:10 | build | started`);
  const three = runs(
    '- 2026-10-19 17:40 | burn-down | Built gankdat x',
    '- 2026-10-19 18:33 | burn-down | Built foundry y',
    '- 2026-10-19 19:41 | burn-down | Built foundry z',
  );
  it('does nothing while the report is fresh, whatever the night', () => {
    expect(
      pacedStop('2026-10-18', three, marked('2026-10-19'), new Date('2026-10-19T20:03:00Z')),
    ).toBeUndefined();
  });
  it('caps a Monday or Tuesday night at three slots that found work when the report is stale', () => {
    const mon = new Date('2026-10-19T20:03:00Z');
    expect(pacedStop('2026-10-04', three, marked('2026-10-19'), mon)).toBe(
      'usage report 2026-10-04 is stale; Monday night 2026-10-19 used 3 of 3 slots',
    );
    const two = runs(
      '- 2026-10-19 17:40 | burn-down | Built gankdat x',
      '- 2026-10-19 18:33 | burn-down | Built foundry y',
    );
    expect(pacedStop('2026-10-04', two, marked('2026-10-19'), mon)).toBeUndefined();
    // the post-midnight slots belong to the same night
    const tueNight = three.replaceAll('2026-10-19', '2026-10-20');
    expect(
      pacedStop('2026-10-04', tueNight, marked('2026-10-20'), new Date('2026-10-21T01:03:00Z')),
    ).toBe('usage report 2026-10-04 is stale; Tuesday night 2026-10-20 used 3 of 3 slots');
    expect(pacedStop(undefined, three, marked('2026-10-19'), mon)).toBe(
      'no usage report; Monday night 2026-10-19 used 3 of 3 slots',
    );
  });
  it('leaves Wednesday night and Thursday to Sunday uncapped', () => {
    const wed = three.replaceAll('2026-10-19', '2026-10-21');
    expect(
      pacedStop('2026-10-04', wed, marked('2026-10-21'), new Date('2026-10-21T20:03:00Z')),
    ).toBeUndefined();
    const sat = three.replaceAll('2026-10-19', '2026-10-24');
    expect(
      pacedStop('2026-10-04', sat, marked('2026-10-24'), new Date('2026-10-24T20:03:00Z')),
    ).toBeUndefined();
  });
  it('ends any night at once on a cutoff signal while the report is stale', () => {
    const wed = new Date('2026-10-21T17:03:00Z');
    const tue = slotsText('- 2026-10-20 17:10 | build | started');
    expect(pacedStop('2026-10-04', runs(), tue, wed)).toBe(
      'usage report 2026-10-04 is stale; cutoff seen — build slot 2026-10-21 09:00 UTC left no start marker or run line',
    );
    expect(pacedStop('2026-10-18', runs(), tue, wed)).toBeUndefined();
  });
});
