import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import {
  appendFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  CURRENT_FILE,
  CURRENT_NAME,
  HEADING,
  ROLL_DAYS,
  appendMonth,
  currentFileHeader,
  cutoffDate,
  decisionsFileCount,
  pointerLine,
  renderCurrent,
  renderStrategy,
  rollEntries,
  splitCurrent,
  splitDecisionLog,
} from './decisions-roll.ts';
import { strayDecisions } from './runs-check.ts';

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

  it('reduces §8 to the pointer line and keeps the window in current.md, idempotently', () => {
    const log = splitDecisionLog(SAMPLE);
    const { keep, rolled } = rollEntries(log.entries, '2026-10-01');
    const strategy = renderStrategy(log, ROLL_DAYS);
    expect(strategy.endsWith(`${HEADING}\n\n${pointerLine(ROLL_DAYS)}\n`)).toBe(true);
    expect(strategy).toContain('- keep this bullet');
    expect(strategy).not.toContain('2026-10-30');
    expect(pointerLine(ROLL_DAYS)).toContain(CURRENT_FILE);
    // The written §8 holds no entry, and a second render is the same text.
    const again = splitDecisionLog(strategy);
    expect(again.entries).toEqual([]);
    expect(renderStrategy(again, ROLL_DAYS)).toBe(strategy);
    expect(strayDecisions(strategy)).toBe(0);
    // A file still carrying the pre-2026-11-17 pointer and its entries is read the same way.
    const old = `${HEADING}\n\n_Entries older than 30 days roll into x._\n\n- 2026-11-01 a\n- 2026-11-02 b\n`;
    expect(splitDecisionLog(old).entries.map((e) => e.date)).toEqual(['2026-11-01', '2026-11-02']);
    expect(strayDecisions(old)).toBe(2);
    expect(strayDecisions('# no log\n')).toBe(0);

    const current = renderCurrent(splitCurrent('').header, keep);
    expect(current.startsWith(currentFileHeader())).toBe(true);
    expect(current.endsWith('  of detail.\n- 2026-10-30 burn-down: latest.\n')).toBe(true);
    const parsed = splitCurrent(current);
    expect(parsed.entries.map((e) => e.date)).toEqual(['2026-10-02', '2026-10-30']);
    expect(parsed.entries[0]?.lines).toHaveLength(2);
    expect(renderCurrent(parsed.header, parsed.entries)).toBe(current);
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
    writeFileSync(path.join(dir, CURRENT_NAME), `${currentFileHeader()}- 2026-11-01 d\n  more\n`);
    expect(decisionsFileCount(dir)).toBe(4);
    expect(readFileSync(path.join(dir, '2026-10.md'), 'utf8')).toContain('2026-10-01');
  });

  it('two sessions appending a decision in the same window merge without a conflict', () => {
    // The repository's own attribute line, in a temporary repo: the proof of foundry `decision-log-union-merge`.
    const attribute = readFileSync(path.resolve('.gitattributes'), 'utf8')
      .split('\n')
      .find((l) => l.startsWith(`${CURRENT_FILE.split(path.sep).join('/')} `));
    expect(attribute).toBe('docs/decisions/current.md merge=union');
    const repo = mkdtempSync(path.join(tmpdir(), 'decision-merge-'));
    const git = (...args: string[]): string =>
      execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.com', ...args], {
        cwd: repo,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    const file = path.join(repo, 'docs', 'decisions', CURRENT_NAME);
    git('init', '-q', '-b', 'main');
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(path.join(repo, '.gitattributes'), `${attribute ?? ''}\n`);
    writeFileSync(file, `${currentFileHeader()}- 2026-11-17 build: base entry.\n`);
    git('add', '.');
    git('commit', '-q', '-m', 'base');
    git('switch', '-q', '-c', 'burn-down');
    appendFileSync(file, '- 2026-11-17 burn-down: **ours.** One line\n  and its continuation.\n');
    git('commit', '-q', '-am', 'ours');
    git('switch', '-q', 'main');
    appendFileSync(file, '- 2026-11-17 build: theirs.\n');
    git('commit', '-q', '-am', 'theirs');
    // Throws on a conflict (git exits 1), which is what the default driver does with these two commits.
    git('merge', '-q', '--no-edit', 'burn-down');
    const merged = readFileSync(file, 'utf8');
    rmSync(repo, { recursive: true, force: true });
    expect(merged).not.toContain('<<<<<<<');
    const entries = splitCurrent(merged).entries;
    expect(entries.map((e) => e.lines[0])).toEqual([
      '- 2026-11-17 build: base entry.',
      '- 2026-11-17 build: theirs.',
      '- 2026-11-17 burn-down: **ours.** One line',
    ]);
    expect(entries[2]?.lines[1]).toBe('  and its continuation.');
  });
});
