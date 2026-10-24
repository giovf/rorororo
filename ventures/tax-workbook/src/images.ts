// Renders the five Etsy listing images (2000 × 1500, 4:3) from SVG templates with @resvg/resvg-js
// and the sandbox's system fonts. Run: npm run images -w @foundry/tax-workbook → listing/*.png
// (the SVG sources are written next to them so the images can be edited by hand).
import { Resvg } from '@resvg/resvg-js';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { EXPENSE_CATEGORIES, RATES_2026_27 as R } from './rates.ts';
import { EXAMPLE_EXPECTED as E } from './tax.ts';

const W = 2000;
const H = 1500;
const NAVY = '#1F3A5F';
const PALE = '#F4F7FB';
const GREEN = '#2E7D4F';
const AMBER = '#B8860B';
const INK = '#1A1A1A';
const MUTED = '#5A6675';
const FONT = 'DejaVu Sans, Liberation Sans, Arial, sans-serif';

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const gbp = (n: number): string => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function frame(body: string, bg = PALE): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}">
<rect width="${W}" height="${H}" fill="${bg}"/>
${body}
</svg>`;
}

function text(x: number, y: number, s: string, size: number, opts: { fill?: string; weight?: string; anchor?: string } = {}): string {
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${opts.fill ?? INK}" font-weight="${opts.weight ?? 'normal'}" text-anchor="${opts.anchor ?? 'start'}">${esc(s)}</text>`;
}

function card(x: number, y: number, w: number, h: number, titleText: string, lines: string[], accent = NAVY): string {
  const body = lines.map((l, i) => text(x + 32, y + 118 + i * 44, l, 30, { fill: MUTED })).join('\n');
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="24" fill="#FFFFFF" stroke="#D9E1EC" stroke-width="3"/>
<rect x="${x}" y="${y}" width="16" height="${h}" rx="8" fill="${accent}"/>
${text(x + 32, y + 64, titleText, 38, { weight: 'bold', fill: accent })}
${body}`;
}

function hero(): string {
  return frame(
    `<rect width="${W}" height="${H}" fill="${NAVY}"/>
<rect x="120" y="120" width="1760" height="1260" rx="40" fill="#FFFFFF"/>
${text(1000, 330, 'UK Sole Trader', 120, { weight: 'bold', fill: NAVY, anchor: 'middle' })}
${text(1000, 470, 'Tax Workbook 2026/27', 120, { weight: 'bold', fill: NAVY, anchor: 'middle' })}
${text(1000, 570, 'Spreadsheet for self-employed records, Self Assessment and MTD quarters', 44, { fill: MUTED, anchor: 'middle' })}
<line x1="300" y1="640" x2="1700" y2="640" stroke="#D9E1EC" stroke-width="4"/>
${['Income, expense and mileage logs with SA103S categories', 'Quarterly totals for Making Tax Digital', 'SA103S year-end pack, box by box', 'Income Tax, Class 4 NI and payments on account estimate', 'Trading Allowance check and a worked example']
  .map((l, i) => `<circle cx="340" cy="${728 + i * 96}" r="16" fill="${GREEN}"/>${text(390, 742 + i * 96, l, 44)}`)
  .join('\n')}
<rect x="300" y="1220" width="1400" height="100" rx="20" fill="${PALE}"/>
${text(1000, 1283, 'Excel · Google Sheets · LibreOffice · Numbers  ·  formulas only, no macros  ·  instant download', 30, { fill: NAVY, anchor: 'middle', weight: 'bold' })}`,
    NAVY,
  );
}

function tabs(): string {
  const items: Array<[string, string]> = [
    ['Setup', '2026/27 rates and thresholds, each with its gov.uk source'],
    ['Income', 'One row per payment: sales turnover or other business income'],
    ['Expenses', 'SA103S category drop-down, business share, allowable amount'],
    ['Mileage', 'HMRC approved rates, 10,000-mile step-down worked out for you'],
    ['Quarterly', 'MTD quarters with income, expenses, profit and update deadlines'],
    ['Allowance', 'Trading Allowance versus actual expenses: which is lower'],
    ['SA103', 'Boxes 9 to 31 ready to copy into the short self-employment pages'],
    ['Tax', 'Income Tax, Class 4 NI, balancing payment, payments on account'],
    ['Example', 'A filled year checked by hand so you can see it finished'],
    ['README', 'What it covers, what it does not, how to import to Google Sheets'],
  ];
  const cols = 2;
  const cw = 860;
  const ch = 200;
  const cards = items
    .map(([t, d], i) => {
      const x = 120 + (i % cols) * (cw + 40);
      const y = 300 + Math.floor(i / cols) * (ch + 28);
      const accent = ['Income', 'Expenses', 'Mileage'].includes(t) ? GREEN : t === 'Example' ? AMBER : NAVY;
      return card(x, y, cw, ch, t, [d], accent);
    })
    .join('\n');
  return frame(`${text(1000, 150, 'Ten tabs, one file', 92, { weight: 'bold', fill: NAVY, anchor: 'middle' })}
${text(1000, 225, 'Type into the blue cells; every figure in black is a formula', 40, { fill: MUTED, anchor: 'middle' })}
${cards}`);
}

function estimate(): string {
  const rows: Array<[string, string, boolean]> = [
    ['Turnover', gbp(42_000), false],
    ['Allowable expenses', gbp(6_500), false],
    ['Mileage: 8,000 miles at 45p', gbp(E.mileage), false],
    ['Taxable profit', gbp(E.profit), true],
    ['Personal Allowance', gbp(R.personalAllowance), false],
    ['Income Tax at 20 %', gbp(E.incomeTax), false],
    ['Class 4 NI at 6 %', gbp(E.class4), false],
    ['Total due 31 January 2028', gbp(E.totalDue), true],
    ['Each payment on account for 2027/28', gbp(E.paymentOnAccountEach), false],
  ];
  const table = rows
    .map(([l, v, bold], i) => {
      const y = 420 + i * 92;
      return `${bold ? `<rect x="160" y="${y - 58}" width="1680" height="84" rx="14" fill="#DDEBD3"/>` : ''}
${text(200, y, l, 42, { weight: bold ? 'bold' : 'normal' })}
${text(1800, y, v, 42, { weight: bold ? 'bold' : 'normal', anchor: 'end', fill: bold ? GREEN : INK })}`;
    })
    .join('\n');
  return frame(`${text(1000, 150, 'See what the year will cost', 92, { weight: 'bold', fill: NAVY, anchor: 'middle' })}
${text(1000, 225, 'The worked example on the Example tab, every line a formula from the Setup rates', 40, { fill: MUTED, anchor: 'middle' })}
<rect x="120" y="300" width="1760" height="900" rx="32" fill="#FFFFFF" stroke="#D9E1EC" stroke-width="3"/>
${table}
${text(1000, 1320, 'England, Wales and Northern Ireland tax bands · Class 4 at 6 % and 2 % · payments on account above £1,000', 30, { fill: MUTED, anchor: 'middle' })}
${text(1000, 1380, 'An estimate for planning — HMRC’s own calculation is the one you pay', 32, { fill: MUTED, anchor: 'middle' })}`);
}

function mtd(): string {
  const quarters: Array<[string, string, string]> = [
    ['Q1', '6 Apr – 5 Jul 2026', 'update by 7 Aug 2026'],
    ['Q2', '6 Jul – 5 Oct 2026', 'update by 7 Nov 2026'],
    ['Q3', '6 Oct 2026 – 5 Jan 2027', 'update by 7 Feb 2027'],
    ['Q4', '6 Jan – 5 Apr 2027', 'update by 7 May 2027'],
  ];
  const qCards = quarters
    .map(([q, d, due], i) => card(120, 320 + i * 212, 860, 190, `${q}  ${d}`, [due, 'income · expenses · mileage · profit to date'], NAVY))
    .join('\n');
  const boxes = EXPENSE_CATEGORIES.filter((c) => c.box !== null && c.box < 20).map((c) => `${c.box}  ${c.label}`);
  const boxList = ['9  Your turnover', '10  Any other business income', ...boxes, '20  Total allowable expenses', '21 / 22  Net profit or loss', '23  Annual Investment Allowance', '31  Total taxable profits']
    .map((l, i) => text(1060, 440 + i * 56, l, 28, { fill: i === 0 || l.startsWith('31') ? NAVY : INK, weight: l.startsWith('31') ? 'bold' : 'normal' }))
    .join('\n');
  return frame(`${text(1000, 150, 'MTD quarters and the SA103S pack', 92, { weight: 'bold', fill: NAVY, anchor: 'middle' })}
${text(1000, 225, 'Quarterly totals from your logs, then the year end box by box', 40, { fill: MUTED, anchor: 'middle' })}
${qCards}
<rect x="1020" y="320" width="860" height="1040" rx="24" fill="#FFFFFF" stroke="#D9E1EC" stroke-width="3"/>
${text(1060, 372, 'SA103S boxes filled for you', 36, { weight: 'bold', fill: NAVY })}
${boxList}
${text(1000, 1430, 'Standard or calendar quarters · the MTD threshold (£50,000 from April 2026, £30,000 from April 2027) is a Setup cell', 30, { fill: MUTED, anchor: 'middle' })}`);
}

function fit(): string {
  const yes = ['Sole traders in England, Wales and Northern Ireland', 'One business, not VAT-registered', 'Cash-basis records through the tax year', 'Excel 2010 or later, Google Sheets, LibreOffice, Numbers', 'Change a rate on Setup and every formula follows'];
  const no = ['Not MTD-recognised filing software — it prepares the numbers', 'Scottish Income Tax bands', 'Partnerships, limited companies, VAT returns', 'Student loan, savings, dividends, pension relief', 'Tax advice — check figures with HMRC or an accountant'];
  return frame(`${text(1000, 150, 'Is it right for you?', 92, { weight: 'bold', fill: NAVY, anchor: 'middle' })}
${card(120, 260, 860, 660, 'Built for', yes, GREEN)}
${card(1020, 260, 860, 660, 'Not for', no, '#A23B3B')}
<rect x="120" y="980" width="1760" height="380" rx="24" fill="#FFFFFF" stroke="#D9E1EC" stroke-width="3"/>
${text(160, 1050, 'What you get', 38, { weight: 'bold', fill: NAVY })}
${text(160, 1120, 'One .xlsx file (about 1 MB), delivered instantly by Etsy after checkout. Open it in Excel, or import it into Google Sheets.', 32, { fill: MUTED })}
${text(160, 1180, 'Rates are the 2026/27 figures published on gov.uk, read October 2026, each with its source on the Setup tab.', 32, { fill: MUTED })}
${text(160, 1270, 'Refund policy: a replacement file or a full refund within 14 days if the file will not open on your device.', 32, { fill: INK, weight: 'bold' })}
${text(160, 1325, 'One purchase, one licence for your own business records.', 32, { fill: MUTED })}`);
}

const images: Array<[string, () => string]> = [
  ['1-hero', hero],
  ['2-tabs', tabs],
  ['3-tax-estimate', estimate],
  ['4-mtd-sa103', mtd],
  ['5-fit-and-refund', fit],
];

const out = path.resolve(import.meta.dirname, '..', 'listing');
await mkdir(out, { recursive: true });
for (const [stem, make] of images) {
  const svg = make();
  await writeFile(path.join(out, `${stem}.svg`), svg);
  const png = new Resvg(svg, { font: { loadSystemFonts: true, defaultFontFamily: 'DejaVu Sans' }, fitTo: { mode: 'width', value: W } })
    .render()
    .asPng();
  await writeFile(path.join(out, `${stem}.png`), png);
  console.log(`${stem}.png ${Math.round(png.length / 1024)} KB`);
}
