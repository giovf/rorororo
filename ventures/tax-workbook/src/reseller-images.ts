// Renders the four Etsy listing images for the reseller workbook (2000 × 1500) into listing/reseller/.
// Run: npm run images:reseller -w @foundry/tax-workbook. Lines are kept short: the sandbox renders
// DejaVu Sans, about 17 px a character at 30 px, so a card line is ≤ 46 characters.
import path from 'node:path';
import { PLATFORMS } from './reseller.ts';
import { AMBER, card, frame, gbp, GREEN, INK, MUTED, NAVY, PALE, RED, renderAll, text, W } from './svg.ts';
import { EXAMPLE_RESELLER as E, RESELLER_EXPECTED as X } from './tax.ts';

const pct = (rate: number): string => `${(rate * 100).toFixed(2).replace(/\.?0+$/, '')} %`;

function hero(): string {
  return frame(
    `<rect width="${W}" height="1500" fill="${NAVY}"/>
<rect x="120" y="120" width="1760" height="1260" rx="40" fill="#FFFFFF"/>
${text(1000, 330, 'UK Reseller Profit', 120, { weight: 'bold', fill: NAVY, anchor: 'middle' })}
${text(1000, 470, '& Tax Workbook 2026/27', 120, { weight: 'bold', fill: NAVY, anchor: 'middle' })}
${text(1000, 570, 'For eBay, Vinted, Depop and Etsy sellers: stock, sales, fees, profit, Self Assessment', 36, { fill: MUTED, anchor: 'middle' })}
<line x1="300" y1="640" x2="1700" y2="640" stroke="#D9E1EC" stroke-width="4"/>
${['Inventory and sales logs linked by item ID: profit on every flip', 'Platform fees worked out from each marketplace\'s own rates', 'HMRC platform-reporting check: 30 sales or £1,700 a year', 'SA103S boxes, Trading Allowance check, cash basis or traditional', 'Income Tax and Class 4 NI estimate, with room for a job']
  .map((l, i) => `<circle cx="340" cy="${728 + i * 96}" r="16" fill="${GREEN}"/>${text(390, 742 + i * 96, l, 42)}`)
  .join('\n')}
<rect x="300" y="1220" width="1400" height="100" rx="20" fill="${PALE}"/>
${text(1000, 1283, 'Excel · Google Sheets · LibreOffice · Numbers  ·  formulas only, no macros  ·  instant download', 30, { fill: NAVY, anchor: 'middle', weight: 'bold' })}`,
    NAVY,
  );
}

function tabs(): string {
  const items: Array<[string, string]> = [
    ['Setup', '2026/27 tax rates and each platform\'s fee rate'],
    ['Inventory', 'Items bought to resell: cost, sold or in stock'],
    ['Sales', 'Platform, price, postage; fees and profit done'],
    ['Expenses', 'Packaging, Bumps, phone share, storage'],
    ['Mileage', 'Car boots and post-office runs at HMRC rates'],
    ['Platforms', 'Profit by platform; HMRC reporting check'],
    ['Allowance', 'Trading Allowance versus real costs: lower?'],
    ['SA103', 'Boxes 9 to 31 ready to copy into the return'],
    ['Tax', 'Income Tax, Class 4 NI, payments on account'],
    ['Example', 'A part-time reseller with a job, by hand'],
  ];
  const cw = 860;
  const ch = 200;
  const cards = items
    .map(([t, d], i) => {
      const x = 120 + (i % 2) * (cw + 40);
      const y = 300 + Math.floor(i / 2) * (ch + 28);
      const accent = ['Inventory', 'Sales', 'Expenses', 'Mileage'].includes(t) ? GREEN : t === 'Example' ? AMBER : NAVY;
      return card(x, y, cw, ch, t, [d], accent);
    })
    .join('\n');
  return frame(`${text(1000, 150, 'Eleven tabs, one file', 92, { weight: 'bold', fill: NAVY, anchor: 'middle' })}
${text(1000, 225, 'Type into the blue cells; every figure in black is a formula', 40, { fill: MUTED, anchor: 'middle' })}
${cards}`);
}

function fees(): string {
  const rows = PLATFORMS.map((p): [string, string] => [
    p.label,
    p.rate === 0 && p.fixed === 0 ? (p.label === 'Vinted' ? 'no seller fee — the buyer pays' : 'enter your own rate') : `${pct(p.rate)} + ${gbp(p.fixed)} an order`,
  ]);
  const table = rows
    .map(([l, v], i) => {
      const y = 430 + i * 92;
      return `${text(200, y, l, 42, { weight: 'bold' })}${text(1800, y, v, 40, { anchor: 'end', fill: INK })}`;
    })
    .join('\n');
  const est: Array<[string, string, boolean]> = [
    ['Gross takings for the year', gbp(E.grossSales), false],
    ['Stock, fees, postage, expenses, mileage', gbp(X.deductions), false],
    ['Taxable profit', gbp(X.profit), true],
    [`Tax due after a ${gbp(E.otherTaxableIncome)} salary's PAYE`, gbp(X.totalDue), true],
  ];
  const estTable = est
    .map(([l, v, bold], i) => {
      const y = 1070 + i * 72;
      return `${bold ? `<rect x="160" y="${y - 48}" width="1680" height="66" rx="12" fill="#DDEBD3"/>` : ''}${text(200, y, l, 36, { weight: bold ? 'bold' : 'normal' })}${text(1800, y, v, 36, { weight: bold ? 'bold' : 'normal', anchor: 'end', fill: bold ? GREEN : INK })}`;
    })
    .join('\n');
  return frame(`${text(1000, 150, 'Fees from each platform\'s own rates', 92, { weight: 'bold', fill: NAVY, anchor: 'middle' })}
${text(1000, 215, 'Read from eBay, Vinted, Depop and Etsy in November 2026', 32, { fill: MUTED, anchor: 'middle' })}
${text(1000, 262, 'Change a rate once on Setup, or type the real fee on any sale', 32, { fill: MUTED, anchor: 'middle' })}
<rect x="120" y="300" width="1760" height="600" rx="32" fill="#FFFFFF" stroke="#D9E1EC" stroke-width="3"/>
${table}
<rect x="120" y="960" width="1760" height="400" rx="32" fill="#FFFFFF" stroke="#D9E1EC" stroke-width="3"/>
${text(160, 1020, 'The worked example: a part-time reseller with a job', 36, { weight: 'bold', fill: NAVY })}
${estTable}
${text(1000, 1430, 'An estimate for planning — HMRC’s own calculation is the one you pay', 30, { fill: MUTED, anchor: 'middle' })}`);
}

function fit(): string {
  const yes = ['Buy-to-sell on eBay, Vinted, Depop, Etsy, more', 'Sole traders in England, Wales and N. Ireland', 'One business, not VAT-registered', 'Cash basis or traditional accounting', 'Excel, Google Sheets, LibreOffice, Numbers', 'A side hustle beside a job: PAYE netted off'];
  const no = ['Clearing out your own things (not trading)', 'Filing software: it prepares the numbers', 'Scottish Income Tax bands', 'Partnerships, limited companies, VAT returns', 'Tax advice: check with HMRC or an accountant'];
  return frame(`${text(1000, 150, 'Is it right for you?', 92, { weight: 'bold', fill: NAVY, anchor: 'middle' })}
${card(120, 260, 860, 660, 'Built for', yes, GREEN)}
${card(1020, 260, 860, 660, 'Not for', no, RED)}
<rect x="120" y="980" width="1760" height="380" rx="24" fill="#FFFFFF" stroke="#D9E1EC" stroke-width="3"/>
${text(160, 1050, 'What you get', 38, { weight: 'bold', fill: NAVY })}
${text(160, 1120, 'One .xlsx file (0.3 MB) delivered instantly by Etsy; opens in Excel, imports into Google Sheets.', 30, { fill: MUTED })}
${text(160, 1180, 'Tax rates: 2026/27 gov.uk figures. Fees: each platform\'s published rates, read November 2026.', 30, { fill: MUTED })}
${text(160, 1270, 'Refunds: replacement file or full refund within 14 days if it will not open on your device.', 30, { fill: INK, weight: 'bold' })}
${text(160, 1325, 'One purchase, one licence for your own business records.', 30, { fill: MUTED })}`);
}

await renderAll(path.resolve(import.meta.dirname, '..', 'listing', 'reseller'), [
  ['1-hero', hero],
  ['2-tabs', tabs],
  ['3-fees-and-example', fees],
  ['4-fit-and-refund', fit],
]);
