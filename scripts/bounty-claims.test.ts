import { describe, expect, it } from 'vitest';
import {
  HEADER,
  KILL_DAYS,
  KILL_MERGED_UNPAID,
  killLine,
  parseArgs,
  parseClaims,
  parseRow,
  tableLines,
  totals,
  totalsLine,
  week,
  weekLine,
} from './bounty-claims.ts';

const issue = (repo: string, n: number): string =>
  `[${repo}#${n}](https://github.com/${repo}/issues/${n})`;
const pr = (repo: string, n: number): string => `[#${n}](https://github.com/${repo}/pull/${n})`;

const md = `# Open-source bounties — research

## 5. Proof and kill

text

## Claims

Intro sentence.

${HEADER}
| --- | --- | --- | --- | --- | --- | --- | --- |
| ${issue('acme/widgets', 12)} | $300 | paid | ${pr('acme/widgets', 40)} | 2026-09-01 | 2026-09-05 | 2026-09-20 | first payout |
| ${issue('acme/widgets', 13)} | $120 | merged | ${pr('acme/widgets', 41)} | 2026-08-01 | 2026-08-03 | — | awaiting release |
| ${issue('acme/widgets', 14)} | $80 | claimed | ${pr('acme/widgets', 42)} | 2026-10-09 | — | — | review requested |
| ${issue('beta/tool', 7)} | $650 | dropped | — | — | — | — | 2026-10-11: a contributor's own ask, nobody funded it |
| ${issue('gamma/lib', 2)} | $50 | reading | — | — | — | — | |

## Metrics

| Date | Event |
| --- | --- |
`;

describe('tableLines', () => {
  it('returns the table rows of the Claims section only', () => {
    const lines = tableLines(md);
    expect(lines).toHaveLength(7);
    expect(lines?.[0]).toBe(HEADER);
  });
  it('is undefined without the section', () => {
    expect(tableLines('# nothing\n')).toBeUndefined();
  });
});

describe('parseRow', () => {
  it('reads a paid row', () => {
    const { claim, problems } = parseRow(
      `| ${issue('acme/widgets', 12)} | $300 | paid | ${pr('acme/widgets', 40)} | 2026-09-01 | 2026-09-05 | 2026-09-20 | note |`,
    );
    expect(problems).toEqual([]);
    expect(claim).toMatchObject({
      issue: 'acme/widgets#12',
      amount: 300,
      status: 'paid',
      paid: '2026-09-20',
      notes: 'note',
    });
  });
  it('rejects a paid claim with no merge date', () => {
    const { problems } = parseRow(
      `| ${issue('a/b', 1)} | $10 | paid | ${pr('a/b', 2)} | 2026-09-01 | — | 2026-09-20 | |`,
    );
    expect(problems.join(' ')).toContain('Merged date');
  });
  it('rejects a claimed row without a PR and an unknown status', () => {
    expect(
      parseRow(`| ${issue('a/b', 1)} | $10 | claimed | — | — | — | — | |`).problems.join(' '),
    ).toContain('needs its PR');
    expect(
      parseRow(`| ${issue('a/b', 1)} | $10 | won | — | — | — | — | |`).problems.join(' '),
    ).toContain('status must be one of');
  });
  it('rejects dates out of order, a bare amount and a drop without a reason', () => {
    expect(
      parseRow(
        `| ${issue('a/b', 1)} | $10 | merged | ${pr('a/b', 2)} | 2026-09-05 | 2026-09-01 | — | |`,
      ).problems.join(' '),
    ).toContain('Merged before Opened');
    expect(
      parseRow(`| ${issue('a/b', 1)} | 10 | reading | — | — | — | — | |`).problems.join(' '),
    ).toContain('amount must be $N');
    expect(
      parseRow(`| ${issue('a/b', 1)} | $10 | dropped | — | — | — | — | |`).problems.join(' '),
    ).toContain('says why');
  });
  it('rejects the wrong number of cells', () => {
    expect(parseRow('| a | b |').problems[0]).toContain('expected 8 cells');
  });
});

describe('parseClaims', () => {
  it('parses every row of a valid table', () => {
    const { claims, problems } = parseClaims(md);
    expect(problems).toEqual([]);
    expect(claims.map((c) => c.status)).toEqual([
      'paid',
      'merged',
      'claimed',
      'dropped',
      'reading',
    ]);
  });
  it('names the row of a problem and a duplicate issue', () => {
    const bad = md.replace(`${issue('gamma/lib', 2)} | $50`, `${issue('acme/widgets', 12)} | $50`);
    const { problems } = parseClaims(bad);
    expect(problems).toEqual(['row 5: acme/widgets#12 appears twice']);
  });
  it('fails on a missing section or a changed header', () => {
    expect(parseClaims('# x\n').problems[0]).toContain('no `## Claims` section');
    expect(parseClaims(md.replace('| Notes |', '| Note |')).problems[0]).toContain(
      'header must be',
    );
  });
});

describe('totals and week', () => {
  const { claims } = parseClaims(md);
  it('counts by status, the paid dollars and the stale unpaid merges', () => {
    const t = totals(claims, '2026-10-11');
    expect(t).toMatchObject({
      rows: 5,
      reading: 1,
      claimed: 1,
      merged: 1,
      paid: 1,
      paidUsd: 300,
      dropped: 1,
      rejected: 0,
    });
    expect(t.mergedUnpaidStale).toBe(1); // merged 2026-08-03, 69 days before 2026-10-11
    expect(totals(claims, '2026-09-30').mergedUnpaidStale).toBe(0);
    expect(totalsLine(t)).toBe(
      'claims: 5 rows — 1 reading, 1 claimed (PR open), 1 merged unpaid, 1 paid (US$300), 0 rejected, 1 dropped',
    );
    expect(killLine(t)).toBe(
      `kill rule: 1 of ${KILL_MERGED_UNPAID} merged PRs unpaid for ${KILL_DAYS} days`,
    );
  });
  it('counts the 7 days ending the given day by the date of each step', () => {
    const w = week(claims, '2026-10-11');
    expect(w).toEqual({ to: '2026-10-11', opened: 1, merged: 0, paid: 0, paidUsd: 0, dropped: 1 });
    expect(weekLine(w)).toBe(
      'week to 2026-10-11: 1 PRs opened, 0 merged, 0 paid (US$0), 1 dropped',
    );
    expect(week(claims, '2026-09-21')).toMatchObject({ paid: 1, paidUsd: 300, opened: 0 });
    expect(week(claims, '2026-10-20')).toMatchObject({ opened: 0, dropped: 0 });
  });
});

describe('parseArgs', () => {
  it('reads --week with or without a date and --json', () => {
    expect(parseArgs(['--week', '2026-10-05'])).toEqual({ week: '2026-10-05', json: false });
    expect(parseArgs(['--week']).week).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(parseArgs(['--json'])).toEqual({ json: true });
  });
});
