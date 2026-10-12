import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CAP,
  CAP_FROM,
  datedLineCount,
  floorViolations,
  formatViolation,
  parseFloor,
  raisedFloor,
  serialiseFloor,
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

describe('append-only floor', () => {
  const floor = { runs: 472, strategy: 569, updated: '2026-10-04' };

  it('counts dated bullets only', () => {
    expect(datedLineCount(md)).toBe(7);
    expect(datedLineCount('# Run log\n\nprose 2026-09-22 here\n')).toBe(0);
  });

  it('fails when either file lost dated lines, naming the loss', () => {
    const lost = floorViolations({ runs: 3, strategy: 569 }, floor);
    expect(lost).toHaveLength(1);
    expect(lost[0]).toMatch(/^docs\/RUNS\.md: 3 dated lines, floor 472 \(469 lost\)/);
    expect(floorViolations({ runs: 480, strategy: 6 }, floor)[0]).toMatch(
      /^docs\/STRATEGY\.md: 6 dated lines, floor 569/,
    );
    expect(floorViolations({ runs: 472, strategy: 569 }, floor)).toEqual([]);
    expect(floorViolations({ runs: 500, strategy: 570 }, floor)).toEqual([]);
  });

  it('raises the floor to the current counts and never lowers it', () => {
    expect(raisedFloor({ runs: 480, strategy: 569 }, floor, '2026-10-05')).toEqual({
      runs: 480,
      strategy: 569,
      updated: '2026-10-05',
    });
    expect(raisedFloor({ runs: 400, strategy: 600 }, floor, '2026-10-05')).toEqual({
      runs: 472,
      strategy: 600,
      updated: '2026-10-05',
    });
  });

  it('reads a floor file, tolerating missing fields', () => {
    expect(parseFloor('{"runs":10,"strategy":20,"updated":"2026-10-04"}')).toEqual({
      runs: 10,
      strategy: 20,
      updated: '2026-10-04',
    });
    expect(parseFloor('{}')).toEqual({ runs: 0, strategy: 0, updated: '' });
  });
});

describe('union merge (2026-10-12, append-only-union-merge)', () => {
  const unionMerge = (base: string, ours: string, theirs: string): string => {
    const dir = mkdtempSync(path.join(tmpdir(), 'union-'));
    const file = (name: string, text: string): string => {
      const p = path.join(dir, name);
      writeFileSync(p, text);
      return p;
    };
    const out = execFileSync(
      'git',
      [
        'merge-file',
        '-p',
        '--union',
        file('ours', ours),
        file('base', base),
        file('theirs', theirs),
      ],
      { encoding: 'utf8' },
    );
    rmSync(dir, { recursive: true, force: true });
    return out;
  };

  it('keeps every line of two concurrent appends to RUNS.md exactly once', () => {
    const base = '# Run log\n\n- 2026-10-11 17:05 | build | first\n';
    const ours = `${base}- 2026-10-11 17:20 | burn-down | ours A\n- 2026-10-11 17:21 | burn-down | ours B\n`;
    const theirs = `${base}- 2026-10-11 17:22 | build | theirs C\n`;
    const merged = unionMerge(base, ours, theirs);
    const lines = merged.split('\n').filter((l) => l.startsWith('- '));
    expect(lines).toHaveLength(4);
    expect(new Set(lines).size).toBe(4);
    for (const l of ['first', 'ours A', 'ours B', 'theirs C'])
      expect(lines.filter((x) => x.endsWith(l))).toHaveLength(1);
    expect(merged).not.toContain('<<<<<<<');
    expect(violations(merged, '2026-10-03')).toEqual([]);
  });

  it('keeps both sides of a union-merged RUNS-COUNT.json and parseFloor reads the higher count', () => {
    const base = serialiseFloor({ runs: 954, strategy: 187, updated: '2026-10-12' });
    const ours = serialiseFloor({ runs: 957, strategy: 188, updated: '2026-10-12' });
    const theirs = serialiseFloor({ runs: 960, strategy: 187, updated: '2026-10-12' });
    const merged = unionMerge(base, ours, theirs);
    expect(merged).not.toContain('<<<<<<<');
    expect(merged.match(/"runs"/g)).toHaveLength(2);
    expect(parseFloor(merged)).toEqual({ runs: 960, strategy: 188, updated: '2026-10-12' });
    expect(merged).not.toBe(serialiseFloor(parseFloor(merged)));
  });

  it('parseFloor of a clean file is unchanged and serialises back to the same text', () => {
    const text = serialiseFloor({ runs: 10, strategy: 20, updated: '2026-10-04' });
    expect(parseFloor(text)).toEqual({ runs: 10, strategy: 20, updated: '2026-10-04' });
    expect(serialiseFloor(parseFloor(text))).toBe(text);
  });
});
