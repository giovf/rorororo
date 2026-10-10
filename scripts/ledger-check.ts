// Validates docs/LEDGER.md and fails if committed spend exceeds the capital cap.
// The cap (owner, 2026-10-10): the owner's net outlay never passes £100 — spent + planned may
// exceed the cap only by what revenue has already brought in, so anything beyond it comes out
// of profit. A `## Recurring` table names the standing monthly costs; fewer than three months
// of headroom is a warning the weekly report and the monthly review read (never a red gate:
// the subscription itself is owner-approved, the response is a decision, not a blocked push).
// Run: npm run ledger
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  CAPITAL_CAP_GBP,
  RUNWAY_WARN_MONTHS,
  parseLedger,
  parseRecurring,
  summarizeLedger,
} from '@foundry/core';

const file = path.resolve(import.meta.dirname, '..', 'docs', 'LEDGER.md');
const text = await readFile(file, 'utf8');
const rows = parseLedger(text);
const recurring = parseRecurring(text);
const s = summarizeLedger(rows, CAPITAL_CAP_GBP, recurring);
const gbp = (n: number): string => `£${n.toFixed(2)}`;

console.log(
  `Ledger — ${rows.length} row(s): spent ${gbp(s.spent)}, planned ${gbp(s.planned)}, ` +
    `revenue ${gbp(s.revenue)}, net ${gbp(s.net)}, contingent ${gbp(s.contingent)} (cap ${gbp(CAPITAL_CAP_GBP)} + revenue = ` +
    `allowance ${gbp(s.allowance)}; committed ${gbp(s.committed)}, headroom ${gbp(s.headroom)}` +
    `${s.runwayMonths === null ? '' : `, recurring ${gbp(s.recurringMonthly)}/month → ${s.runwayMonths} month(s) of headroom`})`,
);
if (s.overCap) {
  console.error(
    `Capital cap exceeded: committed ${gbp(s.committed)} > cap ${gbp(CAPITAL_CAP_GBP)} + revenue ${gbp(s.revenue)} — spend past the cap must come out of profit`,
  );
  process.exit(1);
}
if (s.runwayMonths !== null && s.runwayMonths < RUNWAY_WARN_MONTHS) {
  console.warn(
    `Ledger warning: ${s.runwayMonths} month(s) of headroom left at ${gbp(s.recurringMonthly)}/month — the next review decides what stops or what pays`,
  );
}
