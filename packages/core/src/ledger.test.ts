import { describe, expect, it } from 'vitest';
import { parseLedger, summarizeLedger } from './ledger.js';

const ledger = `# Ledger

## Entries

| Date | Venture | Kind | GBP | Note |
|---|---|---|---|---|
| 2026-09-17 | portfolio | planned | 3.70 | Chrome dev fee |
| 2026-09-20 | v1 | cost | 0.50 | test purchase |
| 2026-10-01 | v1 | revenue | 12.25 | first sale |

## Notes
| not | a | ledger | row |
`;

describe('parseLedger', () => {
  it('parses rows under the Entries heading only', () => {
    const rows = parseLedger(ledger);
    expect(rows).toHaveLength(3);
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

describe('summarizeLedger', () => {
  it('totals by kind and applies the cap to spent + planned', () => {
    const s = summarizeLedger(parseLedger(ledger));
    expect(s).toEqual({
      spent: 0.5,
      planned: 3.7,
      revenue: 12.25,
      net: 11.75,
      committed: 4.2,
      overCap: false,
    });
    expect(summarizeLedger(parseLedger(ledger), 4).overCap).toBe(true);
  });
});
