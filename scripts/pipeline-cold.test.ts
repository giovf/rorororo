import { describe, expect, it } from 'vitest';
import {
  datedArrived,
  dayStart,
  lineStamp,
  nightStart,
  preResearchSpent,
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
