import { describe, expect, it } from 'vitest';
import {
  CAP,
  CAP_FROM,
  formatViolation,
  parseArgs,
  parseRuns,
  textLength,
  violations,
} from './runs-check.ts';

const short = 'Built the thing';
const exactly120 = 'x'.repeat(120);
const over = 'y'.repeat(121);

const md = `# Run log

Header prose with a date-like token 2026-09-22 that is not a bullet.

- 2026-09-22 12:05 | interactive | ${over}
- 2026-10-02 17:35 | build | ${short}
- 2026-10-03 08:06 | retro | ${exactly120}
- 2026-10-03 09:30 | build | ${over}
- 2026-10-03 09:31 | build | Em dash — and ≤ count as one each ${'z'.repeat(85)}
- 2026-10-03 missing the time and routine
- 2026-10-04 10:00 | report | ${short}
`;

describe('parseRuns', () => {
  it('splits dated bullets into run lines and malformed ones, ignoring prose', () => {
    const { runs, malformed } = parseRuns(md);
    expect(runs.map((r) => `${r.line}:${r.routine}`)).toEqual([
      '5:interactive',
      '6:build',
      '7:retro',
      '8:build',
      '9:build',
      '11:report',
    ]);
    expect(runs[1]).toMatchObject({ date: '2026-10-02', time: '17:35', text: short });
    expect(malformed).toEqual([
      { line: 10, date: '2026-10-03', raw: '- 2026-10-03 missing the time and routine' },
    ]);
  });
});

describe('textLength', () => {
  it('counts code points, not UTF-16 units', () => {
    expect(textLength('a — b ≤ c')).toBe(9);
    expect(textLength('🚀')).toBe(1);
  });
});

describe('violations', () => {
  it('grandfathers lines before CAP_FROM and accepts exactly the cap', () => {
    const found = violations(md);
    expect(found.map((v) => `${v.line}:${v.kind}`)).toEqual(['8:too-long', '10:malformed']);
    expect(found[0]).toMatchObject({ length: 121, preview: over });
  });

  it('honours --from and --cap overrides', () => {
    expect(violations(md, '2026-09-01').map((v) => v.line)).toEqual([5, 8, 10]);
    expect(violations(md, CAP_FROM, 200).map((v) => v.line)).toEqual([10]);
    expect(violations(md, '2026-10-04')).toEqual([]);
  });

  it('is clean on a file with only compliant new lines', () => {
    const clean = `- 2026-10-03 09:00 | build | ${exactly120}\n- 2026-10-05 17:00 | exchange | ok\n`;
    expect(violations(clean)).toEqual([]);
  });
});

describe('formatViolation', () => {
  it('names the file, line, length and overage for a long line', () => {
    const [v] = violations(md);
    if (!v) throw new Error('expected a violation');
    const line = formatViolation(v);
    expect(line).toMatch(/^docs\/RUNS\.md:8: 121 chars, cap 120 \(1 over\): y{79}…$/);
  });

  it('explains the expected shape for a malformed line', () => {
    const v = violations(md).find((x) => x.kind === 'malformed');
    if (!v) throw new Error('expected a malformed violation');
    expect(formatViolation(v)).toBe(
      'docs/RUNS.md:10: not `- YYYY-MM-DD HH:MM | <routine> | <text>`: - 2026-10-03 missing the time and routine',
    );
  });
});

describe('parseArgs', () => {
  it('defaults to check and reads --from / --cap', () => {
    expect(parseArgs([])).toEqual({ command: 'check', flags: {} });
    expect(parseArgs(['list', '--from', '2026-09-01', '--cap', '100'])).toEqual({
      command: 'list',
      flags: { from: '2026-09-01', cap: '100' },
    });
  });

  it('exports the documented constants', () => {
    expect(CAP).toBe(120);
    expect(CAP_FROM).toBe('2026-10-03');
  });
});
