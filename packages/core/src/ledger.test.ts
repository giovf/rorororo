import { describe, expect, it } from 'vitest';
import { parseLedger, parseRecurring, summarizeLedger } from './ledger.js';

const ledger = `# Ledger

## Entries

| Date | Venture | Kind | GBP | Note |
|---|---|---|---|---|
| 2026-09-17 | portfolio | planned | 3.70 | Chrome dev fee |
| 2026-09-20 | v1 | cost | 0.50 | test purchase |
| 2026-10-01 | v1 | revenue | 12.25 | first sale |
| 2026-10-02 | v1 | contingent | 47.00 | ICO fee once the first customer pays |

## Recurring

| Venture | GBP/month | Note |
|---|---|---|
| v1 | 3.70 | Workers Paid |

## Notes
| not | a | ledger | row |
`;

describe('parseLedger', () => {
  it('parses rows under the Entries heading only', () => {
    const rows = parseLedger(ledger);
    expect(rows).toHaveLength(4);
    expect(rows[0]).toEqual({
      date: '2026-09-17',
      venture: 'portfolio',
      kind: 'planned',
      gbp: 3.7,
      note: 'Chrome dev fee',
    });
  });

  it('names the offending line', () => {
    const bad = ledger.replace('| 2026-09-20 | v1 | cost |', '| 20/09/2026 | v1 | cost |');
    expect(() => parseLedger(bad)).toThrow(/line 8: date must be YYYY-MM-DD/);
  });

  it('rejects unknown kinds and negative amounts', () => {
    expect(() => parseLedger(ledger.replace('| cost |', '| spend |'))).toThrow(/kind must be/);
    expect(() => parseLedger(ledger.replace('| 0.50 |', '| -1 |'))).toThrow(/non-negative/);
  });

  it('requires the Entries section', () => {
    expect(() => parseLedger('# nothing')).toThrow(/Entries/);
  });
});

describe('parseRecurring', () => {
  it('reads the Recurring table and tolerates its absence', () => {
    expect(parseRecurring(ledger)).toEqual([{ venture: 'v1', gbpPerMonth: 3.7, note: 'Workers Paid' }]);
    expect(parseRecurring('# nothing\n\n## Entries\n')).toEqual([]);
    expect(() => parseRecurring(ledger.replace('| v1 | 3.70 |', '| v1 | lots |'))).toThrow(/GBP\/month/);
  });
});

describe('summarizeLedger', () => {
  it('totals by kind; contingent rows stay outside committed', () => {
    const s = summarizeLedger(parseLedger(ledger), 100, parseRecurring(ledger));
    expect(s).toEqual({
      spent: 0.5,
      planned: 3.7,
      revenue: 12.25,
      contingent: 47,
      net: 11.75,
      committed: 4.2,
      allowance: 112.25,
      headroom: 108.05,
      recurringMonthly: 3.7,
      runwayMonths: 29,
      overCap: false,
    });
  });

  it('lets committed pass the cap only by what revenue brought in', () => {
    const rows = parseLedger(ledger);
    expect(summarizeLedger(rows, 4).overCap).toBe(false); // 4.2 ≤ 4 + 12.25
    const noRevenue = rows.filter((r) => r.kind !== 'revenue');
    expect(summarizeLedger(noRevenue, 4).overCap).toBe(true); // 4.2 > 4 + 0
    expect(summarizeLedger(noRevenue, 4).runwayMonths).toBeNull();
  });
});
