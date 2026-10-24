import { describe, expect, it } from 'vitest';
import {
  buildSlotInFlight,
  lastExchangeSlot,
  missedExchange,
  datedArrived,
  dayStart,
  lineStamp,
  nightStart,
  preResearchSpent,
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
