// Validates docs/LEDGER.md and fails if committed spend exceeds the capital cap.
// Run: npm run ledger
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { CAPITAL_CAP_GBP, parseLedger, summarizeLedger } from '@foundry/core';

const file = path.resolve(import.meta.dirname, '..', 'docs', 'LEDGER.md');
const rows = parseLedger(await readFile(file, 'utf8'));
const s = summarizeLedger(rows);
const gbp = (n: number): string => `£${n.toFixed(2)}`;

console.log(
  `Ledger — ${rows.length} row(s): spent ${gbp(s.spent)}, planned ${gbp(s.planned)}, ` +
    `revenue ${gbp(s.revenue)}, net ${gbp(s.net)} (cap ${gbp(CAPITAL_CAP_GBP)}, ` +
    `committed ${gbp(s.committed)})`,
);
if (s.overCap) {
  console.error(`Capital cap exceeded: committed ${gbp(s.committed)} > ${gbp(CAPITAL_CAP_GBP)}`);
  process.exit(1);
}
