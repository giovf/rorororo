import { describe, expect, it } from 'vitest';
import { lineStamp, nightStart, preResearchSpent } from './pipeline-cold.ts';

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
    const other = pass.replace('| burn-down |', '| build |');
    expect(preResearchSpent(runs(other), new Date('2026-10-07T22:10:00Z'))).toBe(false);
  });
  it('is false on an empty log', () => {
    expect(preResearchSpent('', new Date('2026-10-07T22:10:00Z'))).toBe(false);
  });
});
