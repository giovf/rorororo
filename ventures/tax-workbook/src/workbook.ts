// Builds the UK Sole Trader Tax Workbook 2026/27 as an ExcelJS workbook: formulas only (no
// macros, no Excel-only functions — SUMIFS, IF, MIN, MAX, DATE, EDATE, EOMONTH, SUM, ROUND, AND,
// so the file imports into Google Sheets and recalculates in LibreOffice), every rate a named
// cell on the Setup tab, drop-downs from Setup ranges, blue text on a pale yellow fill for the
// cells the buyer types into.
import ExcelJS from 'exceljs';
import {
  EXPENSE_CATEGORIES,
  INCOME_TYPES,
  PROFIT_METHODS,
  QUARTER_BASES,
  RATES_2026_27,
  VEHICLE_TYPES,
  type TaxYearRates,
} from './rates.ts';
import { EXAMPLE_CASE } from './tax.ts';

export const WORKBOOK_VERSION = '1.0';
export const FILE_NAME = 'UK-Sole-Trader-Tax-Workbook-2026-27.xlsx';
export const SHEETS = [
  'README',
  'Setup',
  'Income',
  'Expenses',
  'Mileage',
  'Quarterly',
  'Allowance',
  'SA103',
  'Tax',
  'Example',
] as const;

export const INCOME_ROWS = 500;
export const EXPENSE_ROWS = 1000;
export const MILEAGE_ROWS = 500;
const LOG_FIRST_ROW = 6;

const FONT = 'Arial';
const GBP = '£#,##0.00;[Red]-£#,##0.00;-';
const GBP0 = '£#,##0;[Red]-£#,##0;-';
const PCT = '0.0%';
const DATE = 'dd/mm/yyyy';
const NUM0 = '#,##0';

const INPUT_FONT: Partial<ExcelJS.Font> = { name: FONT, size: 10, color: { argb: 'FF0000FF' } };
const INPUT_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF8DC' } };
const HEAD_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3A5F' } };
const TOTAL_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDEBD3' } };
const THIN: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFBFBFBF' } },
  bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
  left: { style: 'thin', color: { argb: 'FFBFBFBF' } },
  right: { style: 'thin', color: { argb: 'FFBFBFBF' } },
};

type Sheet = ExcelJS.Worksheet;

/** ExcelJS implements sheet-level data validations but its typings omit them. */
export interface SheetValidations {
  add(range: string, validation: ExcelJS.DataValidation): void;
  model: Record<string, ExcelJS.DataValidation | undefined>;
}

export function validations(ws: Sheet): SheetValidations {
  return (ws as unknown as { dataValidations: SheetValidations }).dataValidations;
}

function baseFont(ws: Sheet): void {
  ws.eachRow((row) => {
    row.eachCell((cell) => {
      cell.font = { name: FONT, size: 10, ...cell.font };
    });
  });
}

function title(ws: Sheet, text: string, subtitle?: string): void {
  ws.getCell('A1').value = text;
  ws.getCell('A1').font = { name: FONT, size: 16, bold: true, color: { argb: 'FF1F3A5F' } };
  ws.getRow(1).height = 24;
  if (subtitle) {
    ws.getCell('A2').value = subtitle;
    ws.getCell('A2').font = { name: FONT, size: 10, italic: true, color: { argb: 'FF595959' } };
  }
}

function header(ws: Sheet, row: number, labels: string[]): void {
  labels.forEach((label, i) => {
    const cell = ws.getCell(row, i + 1);
    cell.value = label;
    cell.font = { name: FONT, size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = HEAD_FILL;
    cell.alignment = { vertical: 'middle', wrapText: true };
    cell.border = THIN;
  });
  ws.getRow(row).height = 30;
}

function input(cell: ExcelJS.Cell, numFmt?: string): void {
  cell.font = INPUT_FONT;
  cell.fill = INPUT_FILL;
  cell.border = THIN;
  if (numFmt) cell.numFmt = numFmt;
}

function formula(cell: ExcelJS.Cell, f: string, numFmt?: string): void {
  cell.value = { formula: f };
  cell.font = { name: FONT, size: 10 };
  cell.border = THIN;
  if (numFmt) cell.numFmt = numFmt;
}

function label(cell: ExcelJS.Cell, text: string, bold = false): void {
  cell.value = text;
  cell.font = { name: FONT, size: 10, bold };
  cell.alignment = { vertical: 'middle', wrapText: true };
}

function note(cell: ExcelJS.Cell, text: string): void {
  cell.value = text;
  cell.font = { name: FONT, size: 9, italic: true, color: { argb: 'FF595959' } };
  cell.alignment = { vertical: 'middle', wrapText: true };
}

function total(cell: ExcelJS.Cell): void {
  cell.font = { name: FONT, size: 10, bold: true };
  cell.fill = TOTAL_FILL;
}

function name(wb: ExcelJS.Workbook, ref: string, n: string): void {
  wb.definedNames.add(ref, n);
}

function listValidation(ws: Sheet, range: string, source: string): void {
  validations(ws).add(range, {
    type: 'list',
    allowBlank: true,
    showErrorMessage: true,
    errorTitle: 'Pick from the list',
    error: 'Choose one of the options in the drop-down (set on the Setup tab).',
    formulae: [source],
  });
}

/* ----------------------------------------------------------------- README */

function buildReadme(ws: Sheet, r: TaxYearRates): void {
  ws.getColumn(1).width = 110;
  title(ws, `UK Sole Trader Tax Workbook ${r.taxYear}`, `Version ${WORKBOOK_VERSION} · tax year 6 April 2026 to 5 April 2027 · record-keeping for a self-employed sole trader`);
  const lines: Array<[string, boolean]> = [
    ['What this workbook does', true],
    ['Keeps your income, expenses and business mileage for the year in three logs, maps them to the boxes of the SA103S self-employment pages, adds up the quarterly totals Making Tax Digital asks for, checks whether the £1,000 Trading Allowance beats your actual expenses, and estimates your Income Tax, Class 4 National Insurance and payments on account.', false],
    ['', false],
    ['How to use it', true],
    ['1. Setup: check the tax-year rates (they are the 2026/27 figures published on gov.uk) and pick your quarter basis and profit method. Blue text on a pale yellow fill marks the cells you type into; everything in black is a formula — leave it alone.', false],
    ['2. Income: one row per payment received — date, who, type (sales or other business income), amount.', false],
    ['3. Expenses: one row per business cost — date, supplier, the SA103S category from the drop-down, amount, and the business share if a cost is partly private.', false],
    ['4. Mileage: one row per business journey — date, journey, purpose, vehicle, miles. The claim at HMRC approved rates is worked out for you, including the 10,000-mile step-down for cars and vans.', false],
    ['5. Quarterly: the four MTD quarters with income, expenses, profit and the update deadline for each, computed from your logs.', false],
    ['6. Allowance: whether the Trading Allowance or your actual expenses give the lower profit (Setup → Profit method = Auto uses the better one).', false],
    ['7. SA103: your year-end figures box by box, ready to copy into the self-employment pages or your filing software.', false],
    ['8. Tax: the estimate — add any other taxable income (a job, a pension) and tax already deducted so the payments-on-account logic is right.', false],
    ['9. Example: a filled, hand-checked case so you can see what a finished year looks like.', false],
    ['', false],
    ['What it is not', true],
    ['It is a record-keeping and estimating workbook, not MTD-recognised filing software and not tax advice. It covers English, Welsh and Northern Irish Income Tax bands (Scottish bands differ), a sole trader with one business, no VAT registration, no partnership, no student loan, no savings or dividend income, no Marriage or Blind Person\'s Allowance, no pension-contribution or Gift Aid relief and no losses brought forward. Check the final figures against HMRC\'s own calculation before you pay.', false],
    ['', false],
    ['Works in', true],
    ['Microsoft Excel 2010 or later, Google Sheets (File → Import, then save a copy to your Drive), LibreOffice Calc and Numbers. The workbook has no macros. Formulas were recalculated and checked for errors in LibreOffice before release.', false],
    ['', false],
    ['Rates and sources', true],
    ['Every rate on the Setup tab names the gov.uk page it came from (read October 2026). If HMRC changes a figure, change the one cell and every formula follows.', false],
    ['', false],
    ['Licence', true],
    ['One purchase is one licence for your own business records. Please do not resell or share the file. Questions: message the shop.', false],
  ];
  lines.forEach(([text, bold], i) => {
    const cell = ws.getCell(4 + i, 1);
    cell.value = text;
    cell.font = { name: FONT, size: bold ? 11 : 10, bold, color: { argb: bold ? 'FF1F3A5F' : 'FF000000' } };
    cell.alignment = { wrapText: true, vertical: 'top' };
  });
}

/* ------------------------------------------------------------------ Setup */

interface SetupRow {
  key: keyof TaxYearRates | null;
  label: string;
  value?: number | string;
  fmt?: string;
  name?: string;
  source: string;
}

function buildSetup(wb: ExcelJS.Workbook, ws: Sheet, r: TaxYearRates): void {
  ws.getColumn(1).width = 46;
  ws.getColumn(2).width = 18;
  ws.getColumn(3).width = 90;
  title(ws, 'Setup — tax year, rates and lists', 'Blue cells are yours to change. Each figure names its gov.uk source; the whole workbook reads these cells.');
  header(ws, 4, ['Setting', 'Value', 'Source / note']);

  const rows: SetupRow[] = [
    { key: null, label: 'Tax year starts', value: 'DATE', fmt: DATE, name: 'TaxYearStart', source: '6 April 2026. Change this (and the rates) to reuse the workbook for another year.' },
    { key: null, label: 'Tax year ends', fmt: DATE, name: 'TaxYearEnd', source: 'Formula: 5 April of the following year.' },
    { key: null, label: 'MTD quarter basis', value: QUARTER_BASES[0], name: 'QuarterBasis', source: 'Standard quarters run 6 April – 5 July and so on; you may elect calendar quarters (1 April – 30 June …) before your first update of the year. gov.uk: Making Tax Digital for Income Tax — quarterly updates.' },
    { key: null, label: 'Profit method', value: PROFIT_METHODS[0], name: 'ProfitMethod', source: 'Auto picks whichever of the Trading Allowance or your actual expenses gives the lower profit (see the Allowance tab). You cannot claim both.' },
    { key: null, label: '', source: '' },
    { key: 'personalAllowance', label: 'Personal Allowance', fmt: GBP0, name: 'PersonalAllowance', source: 'gov.uk Income Tax rates and Personal Allowances, 2026/27 (frozen until April 2031).' },
    { key: 'paTaperStart', label: 'Allowance tapers from (income over)', fmt: GBP0, name: 'PATaperStart', source: '£1 of allowance lost for every £2 of income over this.' },
    { key: 'basicRateBand', label: 'Basic-rate band (width)', fmt: GBP0, name: 'BasicRateBand', source: 'Taxable income from £1 to £37,700 after the allowance.' },
    { key: 'higherRateLimit', label: 'Additional rate starts at (total income)', fmt: GBP0, name: 'HigherRateLimit', source: '£125,140 — the point at which the allowance has fully tapered.' },
    { key: 'basicRate', label: 'Basic rate', fmt: PCT, name: 'BasicRate', source: 'England, Wales and Northern Ireland. Scottish rates differ — this workbook does not model them.' },
    { key: 'higherRate', label: 'Higher rate', fmt: PCT, name: 'HigherRate', source: '' },
    { key: 'additionalRate', label: 'Additional rate', fmt: PCT, name: 'AdditionalRate', source: '' },
    { key: null, label: '', source: '' },
    { key: 'class4Lower', label: 'Class 4 NI: lower profits limit', fmt: GBP0, name: 'Class4Lower', source: 'gov.uk Rates and allowances: National Insurance contributions, 2026 to 2027.' },
    { key: 'class4Upper', label: 'Class 4 NI: upper profits limit', fmt: GBP0, name: 'Class4Upper', source: '' },
    { key: 'class4MainRate', label: 'Class 4 rate between the limits', fmt: PCT, name: 'Class4MainRate', source: '' },
    { key: 'class4UpperRate', label: 'Class 4 rate above the upper limit', fmt: PCT, name: 'Class4UpperRate', source: '' },
    { key: 'class2SmallProfitsThreshold', label: 'Class 2 NI: small profits threshold', fmt: GBP0, name: 'Class2SPT', source: 'Profits at or above this earn your NI record for free. Below it you may pay Class 2 voluntarily to protect State Pension years.' },
    { key: 'class2WeeklyVoluntary', label: 'Class 2 voluntary rate (per week)', fmt: GBP, name: 'Class2Weekly', source: '2026/27 weekly rate; 52 weeks a year.' },
    { key: null, label: '', source: '' },
    { key: 'tradingAllowance', label: 'Trading Allowance', fmt: GBP0, name: 'TradingAllowance', source: 'gov.uk Tax-free allowances on property and trading income.' },
    { key: null, label: '', source: '' },
    { key: 'mileageCarFirst', label: 'Mileage: car or van, first miles (per mile)', fmt: GBP, name: 'MileageCarFirst', source: 'gov.uk Simplified expenses: vehicles — HMRC approved mileage rates. Claiming mileage replaces fuel, insurance, repairs and capital allowances for that vehicle.' },
    { key: 'mileageCarThresholdMiles', label: 'Mileage: car or van step-down after (miles)', fmt: NUM0, name: 'MileageCarThreshold', source: 'Per tax year, all business journeys added together.' },
    { key: 'mileageCarAfter', label: 'Mileage: car or van, further miles (per mile)', fmt: GBP, name: 'MileageCarAfter', source: '' },
    { key: 'mileageMotorcycle', label: 'Mileage: motorcycle (per mile)', fmt: GBP, name: 'MileageMotorcycle', source: '' },
    { key: 'mileageBicycle', label: 'Mileage: bicycle (per mile)', fmt: GBP, name: 'MileageBicycle', source: '' },
    { key: null, label: '', source: '' },
    { key: 'paymentsOnAccountMin', label: 'Payments on account: not needed if bill at or under', fmt: GBP0, name: 'POAMin', source: 'gov.uk Understand your Self Assessment tax bill: payments on account.' },
    { key: 'paymentsOnAccountSourceShare', label: 'Payments on account: not needed if this share was paid at source', fmt: PCT, name: 'POASourceShare', source: '80 % or more of your tax deducted at source (PAYE) means no payments on account.' },
    { key: 'mtdThreshold', label: 'Making Tax Digital applies above (qualifying income)', fmt: GBP0, name: 'MTDThreshold', source: 'From 6 April 2026 (over £50,000); over £30,000 from April 2027; over £20,000 from April 2028. Qualifying income is gross self-employment plus property income.' },
  ];

  let row = 5;
  for (const s of rows) {
    if (!s.label) {
      row += 1;
      continue;
    }
    label(ws.getCell(row, 1), s.label);
    const cell = ws.getCell(row, 2);
    if (s.name === 'TaxYearStart') {
      cell.value = new Date(Date.UTC(2026, 3, 6));
      input(cell, DATE);
    } else if (s.name === 'TaxYearEnd') {
      formula(cell, 'DATE(YEAR(TaxYearStart)+1,4,5)', DATE);
    } else if (s.key) {
      cell.value = r[s.key];
      input(cell, s.fmt);
    } else if (s.value !== undefined) {
      cell.value = s.value;
      input(cell);
    }
    if (s.name) name(wb, `Setup!$B$${row}`, s.name);
    note(ws.getCell(row, 3), s.source);
    row += 1;
  }
  listValidation(ws, `B7:B7`, 'QuarterBases');
  listValidation(ws, `B8:B8`, 'ProfitMethods');

  // Lists the drop-downs read from.
  const listsRow = row + 1;
  header(ws, listsRow, ['Lists (drop-down options)', 'SA103S box', 'Where it goes']);
  let lr = listsRow + 1;
  const incomeFirst = lr;
  for (const t of INCOME_TYPES) {
    label(ws.getCell(lr, 1), t);
    note(ws.getCell(lr, 3), 'Income tab → Type');
    lr += 1;
  }
  name(wb, `Setup!$A$${incomeFirst}:$A$${lr - 1}`, 'IncomeTypes');
  lr += 1;
  const catFirst = lr;
  for (const c of EXPENSE_CATEGORIES) {
    label(ws.getCell(lr, 1), c.label);
    ws.getCell(lr, 2).value = c.box ?? '—';
    ws.getCell(lr, 2).alignment = { horizontal: 'center' };
    note(ws.getCell(lr, 3), c.note);
    lr += 1;
  }
  name(wb, `Setup!$A$${catFirst}:$A$${lr - 1}`, 'ExpenseCategories');
  lr += 1;
  const vehFirst = lr;
  for (const v of VEHICLE_TYPES) {
    label(ws.getCell(lr, 1), v);
    note(ws.getCell(lr, 3), 'Mileage tab → Vehicle');
    lr += 1;
  }
  name(wb, `Setup!$A$${vehFirst}:$A$${lr - 1}`, 'VehicleTypes');
  lr += 1;
  const qbFirst = lr;
  for (const q of QUARTER_BASES) {
    label(ws.getCell(lr, 1), q);
    lr += 1;
  }
  name(wb, `Setup!$A$${qbFirst}:$A$${lr - 1}`, 'QuarterBases');
  lr += 1;
  const pmFirst = lr;
  for (const p of PROFIT_METHODS) {
    label(ws.getCell(lr, 1), p);
    lr += 1;
  }
  name(wb, `Setup!$A$${pmFirst}:$A$${lr - 1}`, 'ProfitMethods');
  ws.views = [{ state: 'frozen', ySplit: 4 }];
}

/* ------------------------------------------------------------------- Logs */

function buildIncome(wb: ExcelJS.Workbook, ws: Sheet): void {
  title(ws, 'Income log', 'One row per payment received. Type: sales turnover (SA103S box 9) or other business income such as grants (box 10). Dates dd/mm/yyyy.');
  [14, 40, 32, 16, 40].forEach((w, i) => (ws.getColumn(i + 1).width = w));
  header(ws, 5, ['Date', 'Customer / description', 'Type', 'Amount £', 'Notes']);
  const last = LOG_FIRST_ROW + INCOME_ROWS - 1;
  for (let row = LOG_FIRST_ROW; row <= last; row++) {
    input(ws.getCell(row, 1), DATE);
    input(ws.getCell(row, 2));
    input(ws.getCell(row, 3));
    input(ws.getCell(row, 4), GBP);
    input(ws.getCell(row, 5));
  }
  listValidation(ws, `C${LOG_FIRST_ROW}:C${last}`, 'IncomeTypes');
  // Example rows showing the expected format.
  const ex: Array<[Date, string, string, number, string]> = [
    [new Date(Date.UTC(2026, 3, 14)), 'Example Ltd — invoice 001 (delete this row)', INCOME_TYPES[0], 1250, 'Example row: paid by bank transfer'],
  ];
  ex.forEach((e, i) => {
    const row = LOG_FIRST_ROW + i;
    ws.getCell(row, 1).value = e[0];
    ws.getCell(row, 2).value = e[1];
    ws.getCell(row, 3).value = e[2];
    ws.getCell(row, 4).value = e[3];
    ws.getCell(row, 5).value = e[4];
  });
  label(ws.getCell(3, 3), 'Year total');
  formula(ws.getCell(3, 4), `SUM(D${LOG_FIRST_ROW}:D${last})`, GBP);
  total(ws.getCell(3, 4));
  name(wb, `Income!$A$${LOG_FIRST_ROW}:$A$${last}`, 'IncomeDates');
  name(wb, `Income!$C$${LOG_FIRST_ROW}:$C$${last}`, 'IncomeTypeCol');
  name(wb, `Income!$D$${LOG_FIRST_ROW}:$D$${last}`, 'IncomeAmounts');
  ws.views = [{ state: 'frozen', ySplit: 5 }];
  ws.autoFilter = `A5:E${last}`;
}

function buildExpenses(wb: ExcelJS.Workbook, ws: Sheet): void {
  title(ws, 'Expense log', 'One row per business cost. Pick the SA103S category; for a cost that is partly private, enter the business share (blank = 100 %). Keep the receipt.');
  [14, 36, 44, 14, 12, 14, 32].forEach((w, i) => (ws.getColumn(i + 1).width = w));
  header(ws, 5, ['Date', 'Supplier / description', 'SA103S category', 'Amount paid £', 'Business share', 'Allowable £', 'Receipt / notes']);
  const last = LOG_FIRST_ROW + EXPENSE_ROWS - 1;
  for (let row = LOG_FIRST_ROW; row <= last; row++) {
    input(ws.getCell(row, 1), DATE);
    input(ws.getCell(row, 2));
    input(ws.getCell(row, 3));
    input(ws.getCell(row, 4), GBP);
    input(ws.getCell(row, 5), '0%');
    formula(ws.getCell(row, 6), `IF(D${row}="","",D${row}*IF(E${row}="",1,E${row}))`, GBP);
    input(ws.getCell(row, 7));
  }
  listValidation(ws, `C${LOG_FIRST_ROW}:C${last}`, 'ExpenseCategories');
  validations(ws).add(`E${LOG_FIRST_ROW}:E${last}`, {
    type: 'decimal',
    operator: 'between',
    allowBlank: true,
    showErrorMessage: true,
    errorTitle: 'Business share',
    error: 'Enter the business share as a percentage between 0 % and 100 % (blank means 100 %).',
    formulae: [0, 1],
  });
  const ex: Array<[Date, string, string, number, number | null, string]> = [
    [new Date(Date.UTC(2026, 3, 20)), 'Mobile phone bill (delete this row)', EXPENSE_CATEGORIES[5]!.label, 30, 0.6, 'Example row: 60 % business use'],
  ];
  ex.forEach((e, i) => {
    const row = LOG_FIRST_ROW + i;
    ws.getCell(row, 1).value = e[0];
    ws.getCell(row, 2).value = e[1];
    ws.getCell(row, 3).value = e[2];
    ws.getCell(row, 4).value = e[3];
    if (e[4] !== null) ws.getCell(row, 5).value = e[4];
    ws.getCell(row, 7).value = e[5];
  });
  label(ws.getCell(3, 5), 'Year total');
  formula(ws.getCell(3, 6), `SUM(F${LOG_FIRST_ROW}:F${last})`, GBP);
  total(ws.getCell(3, 6));
  name(wb, `Expenses!$A$${LOG_FIRST_ROW}:$A$${last}`, 'ExpenseDates');
  name(wb, `Expenses!$C$${LOG_FIRST_ROW}:$C$${last}`, 'ExpenseCategoryCol');
  name(wb, `Expenses!$F$${LOG_FIRST_ROW}:$F$${last}`, 'ExpenseAllowable');
  ws.views = [{ state: 'frozen', ySplit: 5 }];
  ws.autoFilter = `A5:G${last}`;
}

function buildMileage(wb: ExcelJS.Workbook, ws: Sheet): void {
  title(ws, 'Mileage log', 'One row per business journey. The claim uses HMRC approved rates from Setup; cars and vans step down after 10,000 business miles in the year. Commuting to a regular workplace is not business mileage.');
  [14, 36, 28, 16, 10, 14, 14].forEach((w, i) => (ws.getColumn(i + 1).width = w));
  header(ws, 5, ['Date', 'Journey (from – to)', 'Purpose', 'Vehicle', 'Miles', 'Car/van miles to date', 'Claim £']);
  const last = LOG_FIRST_ROW + MILEAGE_ROWS - 1;
  const car = `"${VEHICLE_TYPES[0]}"`;
  for (let row = LOG_FIRST_ROW; row <= last; row++) {
    input(ws.getCell(row, 1), DATE);
    input(ws.getCell(row, 2));
    input(ws.getCell(row, 3));
    input(ws.getCell(row, 4));
    input(ws.getCell(row, 5), NUM0);
    formula(ws.getCell(row, 6), `IF(D${row}=${car},SUMIFS($E$${LOG_FIRST_ROW}:E${row},$D$${LOG_FIRST_ROW}:D${row},${car}),"")`, NUM0);
    formula(
      ws.getCell(row, 7),
      `IF(E${row}="","",IF(D${row}=${car},(MIN(F${row},MileageCarThreshold)-MIN(F${row}-E${row},MileageCarThreshold))*MileageCarFirst+(MAX(F${row}-MileageCarThreshold,0)-MAX(F${row}-E${row}-MileageCarThreshold,0))*MileageCarAfter,IF(D${row}="${VEHICLE_TYPES[1]}",E${row}*MileageMotorcycle,IF(D${row}="${VEHICLE_TYPES[2]}",E${row}*MileageBicycle,0))))`,
      GBP,
    );
  }
  listValidation(ws, `D${LOG_FIRST_ROW}:D${last}`, 'VehicleTypes');
  const row = LOG_FIRST_ROW;
  ws.getCell(row, 1).value = new Date(Date.UTC(2026, 3, 22));
  ws.getCell(row, 2).value = 'Home – client site, Reading (delete this row)';
  ws.getCell(row, 3).value = 'Example row: site visit';
  ws.getCell(row, 4).value = VEHICLE_TYPES[0];
  ws.getCell(row, 5).value = 64;
  label(ws.getCell(3, 5), 'Year total');
  formula(ws.getCell(3, 6), `SUMIFS(E${LOG_FIRST_ROW}:E${last},D${LOG_FIRST_ROW}:D${last},${car})`, NUM0);
  formula(ws.getCell(3, 7), `SUM(G${LOG_FIRST_ROW}:G${last})`, GBP);
  total(ws.getCell(3, 7));
  name(wb, `Mileage!$A$${LOG_FIRST_ROW}:$A$${last}`, 'MileageDates');
  name(wb, `Mileage!$G$${LOG_FIRST_ROW}:$G$${last}`, 'MileageClaims');
  name(wb, `Mileage!$G$3`, 'MileageClaim');
  ws.views = [{ state: 'frozen', ySplit: 5 }];
}

/* -------------------------------------------------------------- Quarterly */

function buildQuarterly(wb: ExcelJS.Workbook, ws: Sheet): void {
  title(ws, 'Quarterly totals (Making Tax Digital)', 'Cumulative figures per quarter from your logs, on the quarter basis chosen on Setup. Each update covers the year to date; the deadline is the 7th of the month after the quarter ends.');
  [10, 13, 13, 14, 14, 14, 14, 16, 16, 14].forEach((w, i) => (ws.getColumn(i + 1).width = w));
  header(ws, 5, ['Quarter', 'From', 'To', 'Income £', 'Expenses £', 'Mileage £', 'Profit £', 'Income to date £', 'Profit to date £', 'Update due']);
  const std = `QuarterBasis="${QUARTER_BASES[0]}"`;
  for (let q = 0; q < 4; q++) {
    const row = 6 + q;
    const m = q * 3;
    label(ws.getCell(row, 1), `Q${q + 1}`, true);
    formula(ws.getCell(row, 2), `IF(${std},EDATE(TaxYearStart,${m}),DATE(YEAR(TaxYearStart),${4 + m},1))`, DATE);
    formula(ws.getCell(row, 3), `IF(${std},EDATE(TaxYearStart,${m + 3})-1,EOMONTH(DATE(YEAR(TaxYearStart),${4 + m},1),2))`, DATE);
    formula(ws.getCell(row, 4), `SUMIFS(IncomeAmounts,IncomeDates,">="&B${row},IncomeDates,"<="&C${row})`, GBP);
    formula(ws.getCell(row, 5), `SUMIFS(ExpenseAllowable,ExpenseDates,">="&B${row},ExpenseDates,"<="&C${row})`, GBP);
    formula(ws.getCell(row, 6), `SUMIFS(MileageClaims,MileageDates,">="&B${row},MileageDates,"<="&C${row})`, GBP);
    formula(ws.getCell(row, 7), `D${row}-E${row}-F${row}`, GBP);
    formula(ws.getCell(row, 8), `SUM($D$6:D${row})`, GBP);
    formula(ws.getCell(row, 9), `SUM($G$6:G${row})`, GBP);
    // The deadline follows the standard quarter end whichever basis is elected.
    formula(ws.getCell(row, 10), `DATE(YEAR(EDATE(TaxYearStart,${m + 3})),MONTH(EDATE(TaxYearStart,${m + 3}))+1,7)`, DATE);
  }
  label(ws.getCell(10, 1), 'Year', true);
  for (let c = 4; c <= 7; c++) {
    formula(ws.getCell(10, c), `SUM(${String.fromCharCode(64 + c)}6:${String.fromCharCode(64 + c)}9)`, GBP);
    total(ws.getCell(10, c));
  }
  name(wb, 'Quarterly!$D$10', 'YearIncomeByQuarter');
  label(ws.getCell(12, 1), 'Does MTD apply to you?', true);
  formula(
    ws.getCell(12, 4),
    `IF(Turnover+OtherIncome>MTDThreshold,"Yes — your business income is over "&TEXT(MTDThreshold,"£#,##0")&": keep digital records and send quarterly updates.","Not yet on this year's income (threshold "&TEXT(MTDThreshold,"£#,##0")&"); it falls to £30,000 in April 2027 and £20,000 in April 2028.")`,
  );
  ws.mergeCells('D12:J12');
  ws.getCell(12, 4).alignment = { wrapText: true, vertical: 'top' };
  ws.getRow(12).height = 32;
  note(ws.getCell(14, 1), 'Qualifying income for MTD is your gross self-employment and property income for the tax year two years before (2024/25 for April 2026). The quarterly figures here are what the update asks for; the update itself is sent through MTD-compatible software.');
  ws.mergeCells('A14:J14');
  ws.getRow(14).height = 40;
}

/* -------------------------------------------------------------- Allowance */

function buildAllowance(wb: ExcelJS.Workbook, ws: Sheet): void {
  title(ws, 'Trading Allowance check', 'You may deduct the £1,000 Trading Allowance instead of your actual expenses and capital allowances — never both. This tab shows which is better; Setup → Profit method applies it.');
  ws.getColumn(1).width = 52;
  ws.getColumn(2).width = 18;
  ws.getColumn(3).width = 80;
  header(ws, 4, ['Item', '£', 'Note']);
  const rows: Array<[string, string, string, string]> = [
    ['Gross trading income (boxes 9 + 10)', 'Turnover+OtherIncome', GBP, 'From the Income log.'],
    ['Actual deductions: allowable expenses + mileage + capital items', `TotalExpenses+SUMIFS(ExpenseAllowable,ExpenseCategoryCol,"${EXPENSE_CATEGORIES[9]!.label}")`, GBP, 'From the Expenses and Mileage logs.'],
    ['Trading Allowance available', 'MIN(TradingAllowance,B5)', GBP, 'Capped at your gross income — it cannot create a loss.'],
    ['Profit using actual deductions', 'B5-B6', GBP, 'A negative figure is a loss you can relieve only on this method.'],
    ['Profit using the Trading Allowance', 'B5-B7', GBP, ''],
    ['Better method', 'IF(B5<=TradingAllowance,"Trading Allowance — income is within it, nothing to pay on this business",IF(B6<B7,"Trading Allowance (lower profit)","Actual expenses (lower profit)"))', '', 'What Auto chooses.'],
    ['Method in use', `IF(ProfitMethod="${PROFIT_METHODS[1]}","Actual expenses",IF(ProfitMethod="${PROFIT_METHODS[2]}","Trading Allowance",IF(B6<B7,"Trading Allowance","Actual expenses")))`, '', 'Setup → Profit method.'],
    ['Allowance in use? (1 = yes)', 'IF(B11="Trading Allowance",1,0)', '0', 'Read by the SA103 and Tax tabs.'],
  ];
  rows.forEach((r, i) => {
    const row = 5 + i;
    label(ws.getCell(row, 1), r[0]);
    formula(ws.getCell(row, 2), r[1], r[2] || undefined);
    note(ws.getCell(row, 3), r[3]);
  });
  total(ws.getCell(10, 2));
  name(wb, 'Allowance!$B$12', 'UseAllowance');
  note(ws.getCell(14, 1), 'If your gross trading income is £1,000 or less you do not need to tell HMRC about it unless you are already registered for Self Assessment or want to pay voluntary Class 2 NI. If you claim the allowance you cannot claim expenses, capital allowances or a loss for the same business.');
  ws.mergeCells('A14:C14');
  ws.getRow(14).height = 44;
}

/* ------------------------------------------------------------------ SA103 */

function buildSA103(wb: ExcelJS.Workbook, ws: Sheet): void {
  title(ws, 'SA103S year-end pack', 'Your figures box by box for the self-employment (short) pages. Boxes follow the 2025 SA103S; check the form for the year you file. Enter 11–20 only if you are not claiming the Trading Allowance.');
  ws.getColumn(1).width = 10;
  ws.getColumn(2).width = 58;
  ws.getColumn(3).width = 18;
  ws.getColumn(4).width = 60;
  header(ws, 4, ['Box', 'Description', '£', 'Note']);
  type Line = [string, string, string, string, boolean];
  const income: Line[] = [
    ['9', 'Your turnover', `SUMIFS(IncomeAmounts,IncomeTypeCol,"${INCOME_TYPES[0]}")`, 'Sales, fees and takings for the year.', false],
    ['10', 'Any other business income', `SUMIFS(IncomeAmounts,IncomeTypeCol,"${INCOME_TYPES[1]}")`, 'Grants, insurance proceeds and the like.', false],
    ['10.1', 'Trading income allowance', 'IF(UseAllowance=1,MIN(TradingAllowance,C5+C6),0)', 'Only when the allowance is in use (Allowance tab).', false],
  ];
  const exp: Line[] = EXPENSE_CATEGORIES.filter((c) => c.box !== null && c.box < 20).map((c) => [
    String(c.box),
    c.label,
    c.box === 12
      ? `SUMIFS(ExpenseAllowable,ExpenseCategoryCol,"${c.label}")+MileageClaim`
      : `SUMIFS(ExpenseAllowable,ExpenseCategoryCol,"${c.label}")`,
    c.box === 12 ? 'Expenses in this category plus the mileage claim.' : c.note,
    false,
  ]);
  const totals: Line[] = [
    ['20', 'Total allowable expenses (boxes 11 to 19)', 'SUM(C8:C16)', 'If your turnover is under £90,000 you may enter just this total.', true],
    ['21', 'Net profit', 'MAX(IF(UseAllowance=1,C5+C6-C7,C5+C6-C17),0)', 'Income less expenses or the allowance, when positive.', false],
    ['22', 'Or net loss', 'MAX(IF(UseAllowance=1,0,C17-C5-C6),0)', 'Positive when expenses exceed income (not with the allowance).', false],
    ['23', 'Annual Investment Allowance', `IF(UseAllowance=1,0,SUMIFS(ExpenseAllowable,ExpenseCategoryCol,"${EXPENSE_CATEGORIES[9]!.label}"))`, 'Capital items from the Expenses log, 100 % in the year of purchase (not with the allowance).', false],
    ['31', 'Total taxable profits from this business', 'MAX(C18-C20,0)', 'Net profit less capital allowances. Feeds the Tax tab. (Loss relief and adjustments are outside this workbook.)', true],
  ];
  let row = 5;
  for (const l of [...income, ...exp, ...totals]) {
    label(ws.getCell(row, 1), l[0], true);
    ws.getCell(row, 1).alignment = { horizontal: 'center' };
    label(ws.getCell(row, 2), l[1]);
    formula(ws.getCell(row, 3), l[2], GBP);
    if (l[4]) total(ws.getCell(row, 3));
    note(ws.getCell(row, 4), l[3]);
    row += 1;
  }
  // Row map: 5=9, 6=10, 7=10.1, 8..16 = boxes 11..19, 17=20, 18=21, 19=22, 20=23, 21=31
  name(wb, 'SA103!$C$5', 'Turnover');
  name(wb, 'SA103!$C$6', 'OtherIncome');
  name(wb, 'SA103!$C$17', 'TotalExpenses');
  name(wb, 'SA103!$C$20', 'AIA');
  name(wb, 'SA103!$C$21', 'TaxableProfit');
  ws.views = [{ state: 'frozen', ySplit: 4 }];
}

/* -------------------------------------------------------------------- Tax */

function buildTax(wb: ExcelJS.Workbook, ws: Sheet): void {
  title(ws, 'Tax and Class 4 NI estimate', 'An estimate for a sole trader with one business. Fill the blue cells; the rest comes from your logs and the Setup rates. Check against HMRC\'s calculation before paying.');
  ws.getColumn(1).width = 56;
  ws.getColumn(2).width = 18;
  ws.getColumn(3).width = 76;
  header(ws, 4, ['Line', '£', 'How it is worked out']);
  const put = (row: number, text: string, f: string | null, fmt: string, n: string, isInput = false, bold = false): void => {
    label(ws.getCell(row, 1), text, bold);
    const cell = ws.getCell(row, 2);
    if (isInput) {
      cell.value = 0;
      input(cell, fmt);
    } else if (f) {
      formula(cell, f, fmt);
    }
    if (bold) total(cell);
    note(ws.getCell(row, 3), n);
  };
  put(5, 'Your inputs', null, '', '', false, true);
  put(6, 'Other taxable income this year (salary, pension, before tax)', null, GBP, 'From a P60 or P45; needed for the right band and allowance.', true);
  put(7, 'Tax already deducted at source (PAYE)', null, GBP, 'From the same P60/P45.', true);
  put(8, 'Payments on account already made for this year', null, GBP, 'The two payments you made on 31 January and 31 July for 2026/27, if any.', true);
  ws.getCell(9, 1).value = 'Pay Class 2 NI voluntarily if profits are under the threshold?';
  ws.getCell(9, 1).font = { name: FONT, size: 10 };
  ws.getCell(9, 2).value = 'No';
  input(ws.getCell(9, 2));
  validations(ws).add('B9:B9', { type: 'list', allowBlank: false, formulae: ['"Yes,No"'] });
  note(ws.getCell(9, 3), 'Protects State Pension and benefit years when profit is under the small profits threshold.');

  put(11, 'Income', null, '', '', false, true);
  put(12, 'Taxable profit from this business (SA103 box 31)', 'TaxableProfit', GBP, 'SA103 tab.');
  put(13, 'Total income', 'B12+B6', GBP, 'Profit plus other taxable income.');
  put(14, 'Personal Allowance after taper', 'MAX(0,PersonalAllowance-MAX(0,B13-PATaperStart)/2)', GBP, '£1 lost per £2 over the taper start.');
  put(15, 'Taxable income', 'MAX(0,B13-B14)', GBP, '');

  put(17, 'Income Tax', null, '', '', false, true);
  put(18, 'Basic rate', 'MIN(B15,BasicRateBand)*BasicRate', GBP, 'First £37,700 of taxable income at 20 %.');
  put(19, 'Higher rate', 'MIN(MAX(B15-BasicRateBand,0),MAX((HigherRateLimit-B14)-BasicRateBand,0))*HigherRate', GBP, 'Up to the additional-rate point at 40 %.');
  put(20, 'Additional rate', 'MAX(B15-(HigherRateLimit-B14),0)*AdditionalRate', GBP, 'Above £125,140 of income at 45 %.');
  put(21, 'Income Tax on all your income', 'ROUND(B18+B19+B20,2)', GBP, '');
  put(22, 'Of which attributable to this business (approx.)', 'IF(B13=0,0,ROUND(B21*B12/B13,2))', GBP, 'Pro rata; the tax deducted at source is netted off below.');

  put(24, 'National Insurance', null, '', '', false, true);
  put(25, 'Class 4 between the limits', 'MIN(MAX(B12-Class4Lower,0),Class4Upper-Class4Lower)*Class4MainRate', GBP, '6 % of profit between £12,570 and £50,270.');
  put(26, 'Class 4 above the upper limit', 'MAX(B12-Class4Upper,0)*Class4UpperRate', GBP, '2 % above £50,270.');
  put(27, 'Class 4 total', 'ROUND(B25+B26,2)', GBP, '');
  put(28, 'Class 2 (voluntary, if chosen and under the threshold)', 'IF(AND(B9="Yes",B12<Class2SPT),ROUND(Class2Weekly*52,2),0)', GBP, 'Profits at or over the threshold earn the NI year with nothing to pay.');

  put(30, 'What you pay', null, '', '', false, true);
  put(31, 'Income Tax + Class 4 + Class 2', 'B21+B27+B28', GBP, '');
  put(32, 'Less tax deducted at source', 'B7', GBP, '');
  put(33, 'Total due for the year', 'B31-B32', GBP, 'Negative means a repayment is due to you.', false, true);
  put(34, 'Less payments on account already made', 'B8', GBP, '');
  put(35, 'Balancing payment due 31 January', 'B33-B34', GBP, '', false, true);
  formula(ws.getCell(36, 2), 'DATE(YEAR(TaxYearEnd)+1,1,31)', DATE);
  label(ws.getCell(36, 1), 'Balancing payment date');
  note(ws.getCell(36, 3), 'Self Assessment payment deadline for the tax year.');
  put(38, 'Payments on account for next year', null, '', '', false, true);
  put(39, 'Net liability (tax + Class 4 less tax at source)', 'B21+B27-B7', GBP, 'Class 2 is outside payments on account.');
  put(40, 'Payments on account required?', 'IF(AND(B39>POAMin,B7<POASourceShare*(B21+B27)),"Yes","No")', '', 'No when the bill is £1,000 or less, or 80 %+ was deducted at source.');
  put(41, 'Each payment on account', 'IF(B40="Yes",ROUND(B39/2,2),0)', GBP, 'Half of this year\'s net liability, twice.', false, true);
  label(ws.getCell(42, 1), 'Due 31 January and 31 July');
  formula(ws.getCell(42, 2), 'DATE(YEAR(TaxYearEnd)+1,1,31)', DATE);
  formula(ws.getCell(42, 3), 'DATE(YEAR(TaxYearEnd)+1,7,31)', DATE);
  ws.getCell(42, 3).alignment = { horizontal: 'left' };
  put(44, 'Effective rate on business profit', 'IF(B12=0,0,(B22+B27)/B12)', PCT, 'Tax attributable to the business plus Class 4, over profit.');
  put(46, 'Not covered: Scottish rates, student loan repayments, savings and dividend income, Marriage Allowance, pension contributions and Gift Aid (which extend the basic-rate band), losses carried forward, the High Income Child Benefit Charge, and more than one business. Figures are an estimate for planning; HMRC\'s calculation is the one you pay.', null, '', '');
  ws.mergeCells('A46:C46');
  ws.getCell(46, 1).font = { name: FONT, size: 9, italic: true, color: { argb: 'FF595959' } };
  ws.getRow(46).height = 48;
  name(wb, 'Tax!$B$33', 'TotalDue');
  name(wb, 'Tax!$B$41', 'PaymentOnAccount');
  ws.views = [{ state: 'frozen', ySplit: 4 }];
}

/* ---------------------------------------------------------------- Example */

function buildExample(wb: ExcelJS.Workbook, ws: Sheet): void {
  title(ws, 'Worked example (2026/27)', 'A finished year, checked by hand, using the Setup rates. Change the blue figures to try your own numbers — nothing here touches your logs.');
  ws.getColumn(1).width = 56;
  ws.getColumn(2).width = 18;
  ws.getColumn(3).width = 80;
  header(ws, 4, ['Line', '£', 'Worked by hand']);
  const e = EXAMPLE_CASE;
  const put = (row: number, text: string, value: number | string | null, fmt: string, n: string, bold = false): void => {
    label(ws.getCell(row, 1), text, bold);
    const cell = ws.getCell(row, 2);
    if (typeof value === 'number') {
      cell.value = value;
      input(cell, fmt);
    } else if (value) {
      formula(cell, value, fmt);
    }
    if (bold) total(cell);
    note(ws.getCell(row, 3), n);
  };
  put(5, 'Inputs', null, '', '', true);
  put(6, 'Turnover (box 9)', e.turnover, GBP, 'A year of invoices.');
  put(7, 'Other business income (box 10)', e.otherBusinessIncome, GBP, '');
  put(8, 'Allowable expenses (boxes 11–19, before mileage)', e.actualExpenses, GBP, 'Materials, phone, insurance, software, accountancy.');
  put(9, 'Business miles by car', e.carMiles, NUM0, '');
  put(10, 'Capital items (box 23)', e.capitalItems, GBP, '');
  put(11, 'Other taxable income (salary, pension)', e.otherTaxableIncome, GBP, '');
  put(12, 'Tax deducted at source', e.taxDeductedAtSource, GBP, '');
  put(13, 'Payments on account already made', e.paymentsOnAccountMade, GBP, '');

  put(15, 'Profit', null, '', '', true);
  put(16, 'Mileage claim', 'MIN(B9,MileageCarThreshold)*MileageCarFirst+MAX(B9-MileageCarThreshold,0)*MileageCarAfter', GBP, '8,000 miles × 45p = £3,600.00');
  put(17, 'Actual deductions (expenses + mileage + capital)', 'B8+B16+B10', GBP, '£6,500 + £3,600 = £10,100.00');
  put(18, 'Trading Allowance would give', 'B6+B7-MIN(TradingAllowance,B6+B7)', GBP, '£42,000 − £1,000 = £41,000 — worse, so actual expenses are used.');
  put(19, 'Taxable profit (box 31)', 'IF(B17<MIN(TradingAllowance,B6+B7),B18,MAX(B6+B7-B17,0))', GBP, '£42,000 − £10,100 = £31,900.00', true);

  put(21, 'Income Tax', null, '', '', true);
  put(22, 'Total income', 'B19+B11', GBP, '£31,900.00');
  put(23, 'Personal Allowance after taper', 'MAX(0,PersonalAllowance-MAX(0,B22-PATaperStart)/2)', GBP, '£12,570 — no taper under £100,000.');
  put(24, 'Taxable income', 'MAX(0,B22-B23)', GBP, '£31,900 − £12,570 = £19,330.00');
  put(25, 'Basic rate', 'MIN(B24,BasicRateBand)*BasicRate', GBP, '£19,330 × 20 % = £3,866.00');
  put(26, 'Higher rate', 'MIN(MAX(B24-BasicRateBand,0),MAX((HigherRateLimit-B23)-BasicRateBand,0))*HigherRate', GBP, 'Nothing above £37,700 of taxable income.');
  put(27, 'Additional rate', 'MAX(B24-(HigherRateLimit-B23),0)*AdditionalRate', GBP, '');
  put(28, 'Income Tax', 'ROUND(B25+B26+B27,2)', GBP, '£3,866.00', true);

  put(30, 'National Insurance', null, '', '', true);
  put(31, 'Class 4 between the limits', 'MIN(MAX(B19-Class4Lower,0),Class4Upper-Class4Lower)*Class4MainRate', GBP, '(£31,900 − £12,570) × 6 % = £1,159.80');
  put(32, 'Class 4 above the upper limit', 'MAX(B19-Class4Upper,0)*Class4UpperRate', GBP, 'Profit is under £50,270.');
  put(33, 'Class 4', 'ROUND(B31+B32,2)', GBP, '£1,159.80', true);

  put(35, 'What is due', null, '', '', true);
  put(36, 'Tax + Class 4 less tax at source', 'B28+B33-B12', GBP, '£3,866.00 + £1,159.80 = £5,025.80', true);
  put(37, 'Less payments on account made', 'B13', GBP, '');
  put(38, 'Balancing payment, 31 January 2028', 'B36-B37', GBP, '£5,025.80', true);
  put(39, 'Payments on account for 2027/28 (each, 31 Jan and 31 Jul 2028)', 'IF(AND(B36>POAMin,B12<POASourceShare*(B28+B33)),ROUND(B36/2,2),0)', GBP, 'Over £1,000 and nothing at source: £5,025.80 ÷ 2 = £2,512.90', true);
  put(40, 'Cash to set aside on 31 January 2028', 'B38+B39', GBP, 'Balancing payment plus the first payment on account: £7,538.70');
  put(41, 'Effective rate on profit', 'IF(B19=0,0,B36/B19)', PCT, '£5,025.80 ÷ £31,900 = 15.8 %');
  name(wb, 'Example!$B$36', 'ExampleTotalDue');
  name(wb, 'Example!$B$39', 'ExamplePOA');
  ws.views = [{ state: 'frozen', ySplit: 4 }];
}

/* ---------------------------------------------------------------- Builder */

export function buildWorkbook(r: TaxYearRates = RATES_2026_27): ExcelJS.Workbook {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'UK Sole Trader Tax Workbook';
  wb.created = new Date(Date.UTC(2026, 9, 24));
  wb.calcProperties.fullCalcOnLoad = true;
  const sheets = Object.fromEntries(
    SHEETS.map((s) => [s, wb.addWorksheet(s, { properties: { defaultRowHeight: 15 } })]),
  ) as Record<(typeof SHEETS)[number], Sheet>;
  buildReadme(sheets.README, r);
  buildSetup(wb, sheets.Setup, r);
  buildIncome(wb, sheets.Income);
  buildExpenses(wb, sheets.Expenses);
  buildMileage(wb, sheets.Mileage);
  buildQuarterly(wb, sheets.Quarterly);
  buildAllowance(wb, sheets.Allowance);
  buildSA103(wb, sheets.SA103);
  buildTax(wb, sheets.Tax);
  buildExample(wb, sheets.Example);
  for (const ws of wb.worksheets) {
    baseFont(ws);
    ws.getRow(2).height = 28;
    ws.getCell('A2').alignment = { wrapText: true, vertical: 'top' };
    if (ws.name !== 'README') ws.mergeCells(2, 1, 2, Math.max(3, ws.columnCount));
  }
  // Tab colours: inputs green, results blue.
  const colours: Record<string, string> = {
    Setup: 'FF7A9CC6', Income: 'FF8FBF8F', Expenses: 'FF8FBF8F', Mileage: 'FF8FBF8F',
    Quarterly: 'FF1F3A5F', Allowance: 'FF1F3A5F', SA103: 'FF1F3A5F', Tax: 'FF1F3A5F', Example: 'FFD9B26F',
  };
  for (const [s, c] of Object.entries(colours)) sheets[s as (typeof SHEETS)[number]].properties.tabColor = { argb: c };
  return wb;
}

/** Every `=`-formula in the workbook as `Sheet!A1 → formula`, for tests and the recalc check. */
export function listFormulas(wb: ExcelJS.Workbook): Array<{ ref: string; formula: string }> {
  const out: Array<{ ref: string; formula: string }> = [];
  for (const ws of wb.worksheets) {
    ws.eachRow((row) => {
      row.eachCell((cell) => {
        const v = cell.value;
        if (v && typeof v === 'object' && 'formula' in v && typeof v.formula === 'string') {
          out.push({ ref: `${ws.name}!${cell.address}`, formula: v.formula });
        }
      });
    });
  }
  return out;
}
