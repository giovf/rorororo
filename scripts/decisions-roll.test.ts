import { describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  HEADING,
  ROLL_DAYS,
  appendMonth,
  cutoffDate,
  decisionsFileCount,
  pointerLine,
  renderStrategy,
  rollEntries,
  splitDecisionLog,
} from './decisions-roll.ts';

const SAMPLE = `# Strategy

## 7. Kill criteria

- keep this bullet: it is not dated

${HEADING}

- 2026-09-19 adopt gankdat.
- 2026-09-20 owner asks for planning
  → this file + the monthly routine.
- 2026-10-02 burn-down: **first October entry.** Two lines
  of detail.
- 2026-10-30 burn-down: latest.
`;

describe('decision-log rollover (foundry strategy-decision-log-rollover)', () => {
  it('splits §8 into entries with their continuation lines and keeps the text before it', () => {
    const log = splitDecisionLog(SAMPLE);
    expect(log.before.join('\n')).toContain('## 7. Kill criteria');
    expect(log.before.join('\n')).toContain('- keep this bullet');
    expect(log.entries.map((e) => e.date)).toEqual([
      '2026-09-19',
      '2026-09-20',
      '2026-10-02',
      '2026-10-30',
    ]);
    expect(log.entries[1]?.lines).toEqual([
      '- 2026-09-20 owner asks for planning',
      '  → this file + the monthly routine.',
    ]);
    expect(log.after).toEqual([]);
    expect(() => splitDecisionLog('# no log\n')).toThrow(/no "## 8\. Decision log"/);
  });

  it('rolls entries older than the cutoff by month and keeps the rest in order', () => {
    expect(cutoffDate('2026-10-31', 30)).toBe('2026-10-01');
    expect(cutoffDate('2026-03-01', 30)).toBe('2026-01-30');
    const { keep, rolled } = rollEntries(splitDecisionLog(SAMPLE).entries, '2026-10-01');
    expect(keep.map((e) => e.date)).toEqual(['2026-10-02', '2026-10-30']);
    expect([...rolled.keys()]).toEqual(['2026-09']);
    expect(rolled.get('2026-09')?.map((e) => e.date)).toEqual(['2026-09-19', '2026-09-20']);
  });

  it('writes §8 back with the pointer line, idempotently, and the month file append-only', () => {
    const log = splitDecisionLog(SAMPLE);
    const { keep, rolled } = rollEntries(log.entries, '2026-10-01');
    const next = renderStrategy(log, keep, ROLL_DAYS);
    expect(next).toContain(`${HEADING}\n\n${pointerLine(ROLL_DAYS)}\n\n- 2026-10-02`);
    expect(next).not.toContain('2026-09-19');
    expect(next.endsWith('- 2026-10-30 burn-down: latest.\n')).toBe(true);
    // A second roll of the written file changes nothing and finds the same entries.
    const again = splitDecisionLog(next);
    expect(again.entries.map((e) => e.date)).toEqual(['2026-10-02', '2026-10-30']);
    expect(renderStrategy(again, rollEntries(again.entries, '2026-10-01').keep, ROLL_DAYS)).toBe(
      next,
    );
    const sept = rolled.get('2026-09') ?? [];
    const created = appendMonth(undefined, '2026-09', sept);
    expect(created.startsWith('# Decision log — 2026-09\n')).toBe(true);
    expect(created.endsWith('  → this file + the monthly routine.\n')).toBe(true);
    const appended = appendMonth(created, '2026-09', [
      { date: '2026-09-21', lines: ['- 2026-09-21 x'] },
    ]);
    expect(appended).toBe(`${created}- 2026-09-21 x\n`);
  });

  it('counts the dated lines of every month file for the runs floor', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'decisions-'));
    expect(decisionsFileCount(path.join(dir, 'missing'))).toBe(0);
    writeFileSync(path.join(dir, '2026-09.md'), '# h\n\n- 2026-09-01 a\n- 2026-09-02 b\n  more\n');
    writeFileSync(path.join(dir, '2026-10.md'), '- 2026-10-01 c\n');
    writeFileSync(path.join(dir, 'README.md'), '- 2026-10-01 not a month file\n');
    expect(decisionsFileCount(dir)).toBe(3);
    expect(readFileSync(path.join(dir, '2026-10.md'), 'utf8')).toContain('2026-10-01');
  });
});
