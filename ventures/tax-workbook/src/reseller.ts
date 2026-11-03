// Builds the second listing: the UK Reseller Profit & Tax Workbook 2026/27 for people who buy to
// sell on eBay, Vinted, Depop and Etsy. Same rules as workbook.ts (formulas only, every rate a
// named Setup cell, blue-on-yellow inputs) and the same Setup, Expenses, Mileage, Allowance and
// Tax tabs; its own Inventory, Sales, Platforms, SA103 and Example tabs. The platform fee rates
// and the HMRC platform-reporting threshold (30 sales or £1,700 a calendar year) are Setup cells.
import ExcelJS from 'exceljs';
import { EXPENSE_CATEGORIES, RATES_2026_27, type TaxYearRates } from './rates.ts';
import { EXAMPLE_RESELLER } from './tax.ts';
import {
  baseFont,
  buildAllowance,
  buildExpenses,
  buildMileage,
  buildSetup,
  buildTax,
  DATE,
  FONT,
  formula,
  GBP,
  GBP0,
  header,
  input,
  label,
  listValidation,
  LOG_FIRST_ROW,
  name,
  note,
  NUM0,
  PCT,
  type SetupRow,
  type Sheet,
  title,
  total,
  WORKBOOK_VERSION,
} from './workbook.ts';

export const RESELLER_FILE_NAME = 'UK-Reseller-Profit-and-Tax-Workbook-2026-27.xlsx';
export const RESELLER_SHEETS = [
  'README',
  'Setup',
  'Inventory',
  'Sales',
  'Expenses',
  'Mileage',
  'Platforms',
  'Allowance',
  'SA103',
  'Tax',
  'Example',
] as const;

export const INVENTORY_ROWS = 1000;
export const SALES_ROWS = 1000;

/** Platform fee defaults, each platform's own fee page read 2026-11-03; every figure is a Setup cell. */
export interface Platform {
  label: string;
  /** Named cells on Setup. */
  rateName: string;
  fixedName: string;
  /** Fee as a share of the gross sale (item price plus postage charged). */
  rate: number;
  /** Fixed fee per order, £. */
  fixed: number;
  source: string;
}

export const PLATFORMS: readonly Platform[] = [
  {
    label: 'eBay',
    rateName: 'EbayRate',
    fixedName: 'EbayFixed',
    rate: 0.129,
    fixed: 0.4,
    source:
      'eBay "Fees for business sellers" (ebay.co.uk help 4809, updated 30 September 2026): final value fee by category — Clothes, Shoes & Accessories 11.9 %, Books 9.9 %, Business & Office 12.5 %, Crafts 12.9 % — on the total amount of the sale including postage, plus 30p per order up to £10 and 40p over £10 (from 12 February 2026). Set your category\'s rate here; private accounts pay no final value fee but a trader needs a business account.',
  },
  {
    label: 'Vinted',
    rateName: 'VintedRate',
    fixedName: 'VintedFixed',
    rate: 0,
    fixed: 0,
    source:
      'Vinted "Is using Vinted free?" and "Buyer Protection Pro fee" (vinted.co.uk help 373 and 908): no selling fees for sellers, including Pro sellers; the buyer pays the Vinted fee at checkout. Paid Bumps are optional — log them on the Expenses tab.',
  },
  {
    label: 'Depop',
    rateName: 'DepopRate',
    fixedName: 'DepopFixed',
    rate: 0.029,
    fixed: 0.3,
    source:
      'Depop "Seller fees and charges" (depop.com/help): no selling fee for UK sellers; Depop Payments charges 2.9 % + £0.30 on the item price plus postage. A Boosted Listing adds 8 % (12 % before 23 March 2026) only when it sells — use the fee override on the Sales tab for those.',
  },
  {
    label: 'Etsy',
    rateName: 'EtsyRate',
    fixedName: 'EtsyFixed',
    rate: 0.1098,
    fixed: 0.36,
    source:
      'Etsy Fees & Payments Policy (read October 2026): 6.5 % transaction fee and 4 % + £0.20 payment processing on the price plus postage, 0.48 % regulatory operating fee, and a US$0.20 (≈ £0.16) listing renewal after each sale; VAT on the fees comes on top if you are not VAT-registered — add it to the rate if you want it included.',
  },
  {
    label: 'Other / own website',
    rateName: 'OtherRate',
    fixedName: 'OtherFixed',
    rate: 0,
    fixed: 0,
    source: 'Any other marketplace, a card reader or your own site: enter its rate and fixed fee, or leave 0 and type the fee on each sale.',
  },
];

export const STOCK_METHODS = ['Cash basis (cost when paid)', 'Traditional accounting (cost when sold)'] as const;
export const ITEM_SOURCES = ['Car boot / market', 'Charity shop', 'Wholesale / supplier', 'Online purchase', 'Other'] as const;

const SETUP_ROWS: SetupRow[] = [
  { key: null, label: 'Stock deduction method', value: STOCK_METHODS[0], name: 'StockMethod', source: 'Cash basis is HMRC\'s default for sole traders since April 2024: stock counts as a cost when you pay for it. Traditional accounting counts an item\'s cost when it sells (the per-item profit on the Sales tab). gov.uk: Cash basis.' },
  { key: null, label: 'Platform reporting: sales a calendar year', value: 30, fmt: NUM0, name: 'ReportSalesCount', source: 'gov.uk "Selling goods or services on a digital platform": a platform reports you to HMRC unless you made fewer than 30 sales of goods AND received no more than €2,000 (about £1,700) on it in the calendar year (1 January – 31 December).' },
  { key: null, label: 'Platform reporting: amount a calendar year', value: 1_700, fmt: GBP0, name: 'ReportSalesValue', source: 'The sterling figure HMRC gives for €2,000. A report is a data share, not a tax bill: tax is due on trading profit, and selling your own unwanted possessions is not trading.' },
  { key: null, label: '', source: '' },
  ...PLATFORMS.flatMap((p): SetupRow[] => [
    { key: null, label: `${p.label}: fee as a share of the sale`, value: p.rate, fmt: '0.00%', name: p.rateName, source: p.source },
    { key: null, label: `${p.label}: fixed fee per order`, value: p.fixed, fmt: GBP, name: p.fixedName, source: '' },
  ]),
];

/* ----------------------------------------------------------------- README */

function buildReadme(ws: Sheet, r: TaxYearRates): void {
  ws.getColumn(1).width = 110;
  title(ws, `UK Reseller Profit & Tax Workbook ${r.taxYear}`, `Version ${WORKBOOK_VERSION} · tax year 6 April 2026 to 5 April 2027 · for sole traders who buy items to sell on eBay, Vinted, Depop, Etsy and elsewhere`);
  const lines: Array<[string, boolean]> = [
    ['What this workbook does', true],
    ['Tracks every item you buy to resell and every sale, works out the platform fees from each marketplace\'s rates, shows the profit on each flip and on each platform, checks whether a platform will report your sales to HMRC this year, maps the year to the SA103S self-employment boxes, checks the £1,000 Trading Allowance against your real costs, and estimates your Income Tax and Class 4 National Insurance — with room for a job or pension so the bands are right.', false],
    ['', false],
    ['How to use it', true],
    ['1. Setup: check the 2026/27 rates and the platform fee rates (they are the figures published by gov.uk and each platform, read November 2026), pick the stock method and profit method. Blue text on a pale yellow fill marks the cells you type into; everything in black is a formula — leave it alone.', false],
    ['2. Inventory: one row per item bought to resell — your own item ID, date bought, description, where from, what it cost, any cleaning or repair cost. The tab shows whether it has sold, when and for how much.', false],
    ['3. Sales: one row per sale — date, platform, the item ID, price, postage the buyer paid, postage you paid. Fees come from the Setup rates (type the real fee in the override column if the platform charged something different). The item\'s cost and the profit on the sale appear beside it.', false],
    ['4. Expenses: other business costs — packaging, Bumps and promoted listings, a phone or internet share, storage, software — with the SA103S category from the drop-down.', false],
    ['5. Mileage: business journeys (car boots, the post office, collecting stock) at HMRC approved rates.', false],
    ['6. Platforms: the year by platform — sales, takings, fees, postage, cost of items, profit — and the calendar-year check against HMRC\'s platform-reporting threshold.', false],
    ['7. Allowance: whether the £1,000 Trading Allowance or your actual costs give the lower profit (Setup → Profit method = Auto uses the better one).', false],
    ['8. SA103: your year-end figures box by box, ready to copy into the self-employment pages or your filing software.', false],
    ['9. Tax: the estimate — add any salary or pension and the tax already deducted so the payments-on-account logic is right.', false],
    ['10. Example: a filled, hand-checked year for a part-time reseller with a job.', false],
    ['', false],
    ['Trading or clearing out?', true],
    ['Selling your own unwanted things is not trading and is not taxed as income, however many you sell. Buying things to sell on, making things to sell, or selling regularly for profit is trading: once your gross takings pass £1,000 in a tax year you must tell HMRC and file a return. Log only the items you bought to resell here. A platform reporting your sales to HMRC is a data share, not a tax bill.', false],
    ['', false],
    ['What it is not', true],
    ['It is a record-keeping and estimating workbook, not MTD-recognised filing software and not tax advice. It covers English, Welsh and Northern Irish Income Tax bands (Scottish bands differ), a sole trader with one business, no VAT registration, no partnership, no student loan, no savings or dividend income, no Marriage or Blind Person\'s Allowance, no pension-contribution or Gift Aid relief and no losses brought forward. Making Tax Digital quarterly totals are in the companion UK Sole Trader Tax Workbook. Check the final figures against HMRC\'s own calculation before you pay.', false],
    ['', false],
    ['Works in', true],
    ['Microsoft Excel 2010 or later, Google Sheets (File → Import, then save a copy to your Drive), LibreOffice Calc and Numbers. The workbook has no macros. Formulas were recalculated and checked for errors in LibreOffice before release.', false],
    ['', false],
    ['Rates and sources', true],
    ['Every rate on the Setup tab names the page it came from. Platform fees change often — if yours differ, change the one cell and every sale follows, or type the actual fee on the sale.', false],
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

/* -------------------------------------------------------------- Inventory */

function buildInventory(wb: ExcelJS.Workbook, ws: Sheet): void {
  title(ws, 'Inventory — items bought to resell', 'One row per item. Give each item an ID and use the same ID on the Sales tab; the Sold, Date sold and Sale price columns fill in from there. Your own unwanted possessions are not stock — leave them out.');
  [10, 14, 40, 22, 12, 12, 13, 11, 14, 14, 30].forEach((w, i) => (ws.getColumn(i + 1).width = w));
  header(ws, 5, ['Item ID', 'Date bought', 'Description', 'Bought from', 'Cost £', 'Extra costs £', 'Total cost £', 'Status', 'Date sold', 'Sale price £', 'Notes']);
  const last = LOG_FIRST_ROW + INVENTORY_ROWS - 1;
  for (let row = LOG_FIRST_ROW; row <= last; row++) {
    input(ws.getCell(row, 1));
    input(ws.getCell(row, 2), DATE);
    input(ws.getCell(row, 3));
    input(ws.getCell(row, 4));
    input(ws.getCell(row, 5), GBP);
    input(ws.getCell(row, 6), GBP);
    formula(ws.getCell(row, 7), `IF(AND(E${row}="",F${row}=""),"",N(E${row})+N(F${row}))`, GBP);
    formula(ws.getCell(row, 8), `IF(A${row}="","",IF(COUNTIFS(SalesItemIDs,A${row})>0,"Sold","In stock"))`);
    formula(ws.getCell(row, 9), `IF(H${row}="Sold",SUMIFS(SalesDates,SalesItemIDs,A${row}),"")`, DATE);
    formula(ws.getCell(row, 10), `IF(H${row}="Sold",SUMIFS(SalesGross,SalesItemIDs,A${row}),"")`, GBP);
    input(ws.getCell(row, 11));
  }
  listValidation(ws, `D${LOG_FIRST_ROW}:D${last}`, 'ItemSources');
  // Example row showing the expected format.
  const row = LOG_FIRST_ROW;
  ws.getCell(row, 1).value = '001';
  ws.getCell(row, 2).value = new Date(Date.UTC(2026, 3, 10));
  ws.getCell(row, 3).value = 'Vintage denim jacket (delete this row)';
  ws.getCell(row, 4).value = ITEM_SOURCES[1];
  ws.getCell(row, 5).value = 8;
  ws.getCell(row, 11).value = 'Example row: sold on the Sales tab as item 001';
  label(ws.getCell(3, 6), 'Stock on hand');
  formula(ws.getCell(3, 7), `SUMIFS(G${LOG_FIRST_ROW}:G${last},H${LOG_FIRST_ROW}:H${last},"In stock")`, GBP);
  total(ws.getCell(3, 7));
  formula(ws.getCell(3, 8), `COUNTIFS(H${LOG_FIRST_ROW}:H${last},"In stock")&" items"`);
  label(ws.getCell(3, 9), 'Bought this tax year');
  formula(ws.getCell(3, 10), `SUMIFS(G${LOG_FIRST_ROW}:G${last},B${LOG_FIRST_ROW}:B${last},">="&TaxYearStart,B${LOG_FIRST_ROW}:B${last},"<="&TaxYearEnd)`, GBP);
  total(ws.getCell(3, 10));
  name(wb, `Inventory!$A$${LOG_FIRST_ROW}:$A$${last}`, 'InventoryIDs');
  name(wb, `Inventory!$B$${LOG_FIRST_ROW}:$B$${last}`, 'InventoryDates');
  name(wb, `Inventory!$G$${LOG_FIRST_ROW}:$G$${last}`, 'InventoryCost');
  name(wb, `Inventory!$H$${LOG_FIRST_ROW}:$H$${last}`, 'InventoryStatus');
  name(wb, 'Inventory!$G$3', 'StockOnHand');
  name(wb, 'Inventory!$J$3', 'StockBoughtThisYear');
  ws.views = [{ state: 'frozen', ySplit: 5 }];
  ws.autoFilter = `A5:K${last}`;
}

/* ------------------------------------------------------------------ Sales */

function feeFormula(row: number): string {
  const gross = `G${row}`;
  let f = `${gross}*${PLATFORMS[PLATFORMS.length - 1]!.rateName}+${PLATFORMS[PLATFORMS.length - 1]!.fixedName}`;
  for (let i = PLATFORMS.length - 2; i >= 0; i--) {
    const p = PLATFORMS[i]!;
    f = `IF(B${row}="${p.label}",${gross}*${p.rateName}+${p.fixedName},${f})`;
  }
  return `IF(E${row}="","",IF(I${row}<>"",I${row},ROUND(${f},2)))`;
}

function buildSales(wb: ExcelJS.Workbook, ws: Sheet): void {
  title(ws, 'Sales log', 'One row per sale. Fees are worked out from the Setup rates for the platform you pick; if the platform charged something else (a Boosted Listing, a promoted sale), type the real fee in the override column. Cost of item comes from Inventory by ID.');
  [14, 20, 10, 36, 13, 14, 13, 13, 13, 13, 13, 13, 28].forEach((w, i) => (ws.getColumn(i + 1).width = w));
  header(ws, 5, ['Date', 'Platform', 'Item ID', 'Description', 'Item price £', 'Postage charged to buyer £', 'Gross sale £', 'Platform & payment fees £', 'Fee override £', 'Postage you paid £', 'Cost of item £', 'Profit on sale £', 'Notes']);
  const last = LOG_FIRST_ROW + SALES_ROWS - 1;
  for (let row = LOG_FIRST_ROW; row <= last; row++) {
    input(ws.getCell(row, 1), DATE);
    input(ws.getCell(row, 2));
    input(ws.getCell(row, 3));
    input(ws.getCell(row, 4));
    input(ws.getCell(row, 5), GBP);
    input(ws.getCell(row, 6), GBP);
    formula(ws.getCell(row, 7), `IF(E${row}="","",N(E${row})+N(F${row}))`, GBP);
    formula(ws.getCell(row, 8), feeFormula(row), GBP);
    input(ws.getCell(row, 9), GBP);
    input(ws.getCell(row, 10), GBP);
    formula(ws.getCell(row, 11), `IF(C${row}="","",SUMIFS(InventoryCost,InventoryIDs,C${row}))`, GBP);
    formula(ws.getCell(row, 12), `IF(E${row}="","",G${row}-H${row}-N(J${row})-N(K${row}))`, GBP);
    input(ws.getCell(row, 13));
  }
  listValidation(ws, `B${LOG_FIRST_ROW}:B${last}`, 'Platforms');
  const row = LOG_FIRST_ROW;
  ws.getCell(row, 1).value = new Date(Date.UTC(2026, 3, 20));
  ws.getCell(row, 2).value = PLATFORMS[1]!.label;
  ws.getCell(row, 3).value = '001';
  ws.getCell(row, 4).value = 'Vintage denim jacket (delete this row)';
  ws.getCell(row, 5).value = 25;
  ws.getCell(row, 6).value = 3.5;
  ws.getCell(row, 10).value = 3.2;
  ws.getCell(row, 13).value = 'Example row: Vinted charges the buyer, not you';
  label(ws.getCell(3, 6), 'Year totals');
  for (const c of [7, 8, 10, 11, 12]) {
    const col = String.fromCharCode(64 + c);
    formula(ws.getCell(3, c), `SUM(${col}${LOG_FIRST_ROW}:${col}${last})`, GBP);
    total(ws.getCell(3, c));
  }
  name(wb, `Sales!$A$${LOG_FIRST_ROW}:$A$${last}`, 'SalesDates');
  name(wb, `Sales!$B$${LOG_FIRST_ROW}:$B$${last}`, 'SalesPlatform');
  name(wb, `Sales!$C$${LOG_FIRST_ROW}:$C$${last}`, 'SalesItemIDs');
  name(wb, `Sales!$G$${LOG_FIRST_ROW}:$G$${last}`, 'SalesGross');
  name(wb, `Sales!$H$${LOG_FIRST_ROW}:$H$${last}`, 'SalesFees');
  name(wb, `Sales!$J$${LOG_FIRST_ROW}:$J$${last}`, 'SalesPostage');
  name(wb, `Sales!$K$${LOG_FIRST_ROW}:$K$${last}`, 'SalesCOGS');
  name(wb, `Sales!$L$${LOG_FIRST_ROW}:$L$${last}`, 'SalesProfit');
  name(wb, 'Sales!$G$3', 'SalesTotal');
  name(wb, 'Sales!$H$3', 'FeesTotal');
  name(wb, 'Sales!$J$3', 'PostagePaidTotal');
  name(wb, 'Sales!$K$3', 'COGSTotal');
  ws.views = [{ state: 'frozen', ySplit: 5 }];
  ws.autoFilter = `A5:M${last}`;
}

/* -------------------------------------------------------------- Platforms */

function buildPlatforms(wb: ExcelJS.Workbook, ws: Sheet): void {
  title(ws, 'The year by platform, and the HMRC reporting check', 'Takings, fees and profit per platform from the Sales log, then whether each platform will report your sales to HMRC: it does unless you made fewer than 30 sales AND took no more than £1,700 on it in the calendar year.');
  [24, 10, 14, 14, 14, 14, 14, 12].forEach((w, i) => (ws.getColumn(i + 1).width = w));
  header(ws, 4, ['Platform', 'Sales', 'Takings £', 'Fees £', 'Postage paid £', 'Cost of items £', 'Profit £', 'Fees % of takings']);
  let row = 5;
  for (const p of PLATFORMS) {
    label(ws.getCell(row, 1), p.label, true);
    const crit = `SalesPlatform,"${p.label}"`;
    formula(ws.getCell(row, 2), `COUNTIFS(${crit})`, NUM0);
    formula(ws.getCell(row, 3), `SUMIFS(SalesGross,${crit})`, GBP);
    formula(ws.getCell(row, 4), `SUMIFS(SalesFees,${crit})`, GBP);
    formula(ws.getCell(row, 5), `SUMIFS(SalesPostage,${crit})`, GBP);
    formula(ws.getCell(row, 6), `SUMIFS(SalesCOGS,${crit})`, GBP);
    formula(ws.getCell(row, 7), `SUMIFS(SalesProfit,${crit})`, GBP);
    formula(ws.getCell(row, 8), `IF(C${row}=0,0,D${row}/C${row})`, PCT);
    row += 1;
  }
  const lastP = row - 1;
  label(ws.getCell(row, 1), 'All platforms', true);
  for (let c = 2; c <= 7; c++) {
    const col = String.fromCharCode(64 + c);
    formula(ws.getCell(row, c), `SUM(${col}5:${col}${lastP})`, c === 2 ? NUM0 : GBP);
    total(ws.getCell(row, c));
  }
  formula(ws.getCell(row, 8), `IF(C${row}=0,0,D${row}/C${row})`, PCT);
  total(ws.getCell(row, 8));
  name(wb, `Platforms!$G$${row}`, 'ProfitAllPlatforms');

  // Calendar-year reporting check: the tax year spans two calendar years.
  row += 3;
  label(ws.getCell(row - 1, 1), 'Will the platform report you to HMRC? (calendar years inside this tax year)', true);
  ws.getCell(row - 1, 1).font = { name: FONT, size: 12, bold: true, color: { argb: 'FF1F3A5F' } };
  header(ws, row, ['Platform', 'Sales Apr–Dec 2026', 'Takings Apr–Dec 2026 £', 'Reported for 2026?', 'Sales Jan–Apr 2027', 'Takings Jan–Apr 2027 £', 'Reported for 2027 so far?', '']);
  const y1 = `SalesDates,">="&TaxYearStart,SalesDates,"<="&DATE(YEAR(TaxYearStart),12,31)`;
  const y2 = `SalesDates,">="&DATE(YEAR(TaxYearEnd),1,1),SalesDates,"<="&TaxYearEnd`;
  const verdict = (n: string, v: string): string =>
    `IF(OR(${n}>=ReportSalesCount,${v}>=ReportSalesValue),"Yes — over the threshold","Not on these figures")`;
  row += 1;
  for (const p of PLATFORMS) {
    label(ws.getCell(row, 1), p.label, true);
    const crit = `SalesPlatform,"${p.label}"`;
    formula(ws.getCell(row, 2), `COUNTIFS(${crit},${y1})`, NUM0);
    formula(ws.getCell(row, 3), `SUMIFS(SalesGross,${crit},${y1})`, GBP);
    formula(ws.getCell(row, 4), verdict(`B${row}`, `C${row}`));
    formula(ws.getCell(row, 5), `COUNTIFS(${crit},${y2})`, NUM0);
    formula(ws.getCell(row, 6), `SUMIFS(SalesGross,${crit},${y2})`, GBP);
    formula(ws.getCell(row, 7), verdict(`E${row}`, `F${row}`));
    row += 1;
  }
  row += 1;
  note(ws.getCell(row, 1), 'The threshold counts the whole calendar year, so add any sales you made on the platform from 1 January to 5 April 2026 (last year\'s records) to the 2026 columns before reading the verdict. The figures use your gross takings; platforms report takings less their fees, so a borderline case is read in your favour here. A report is a data share, not a tax bill — tax is due on the trading profit shown on the Tax tab, whether or not a platform reports.');
  ws.mergeCells(row, 1, row, 8);
  ws.getRow(row).height = 56;
  row += 2;
  label(ws.getCell(row, 1), 'Does MTD apply to you?', true);
  formula(
    ws.getCell(row, 2),
    `IF(Turnover+OtherIncome>MTDThreshold,"Yes — your business income is over "&TEXT(MTDThreshold,"£#,##0")&": keep digital records and send quarterly updates (the companion Sole Trader workbook has the quarterly totals).","Not yet on this year's income (threshold "&TEXT(MTDThreshold,"£#,##0")&"); it falls to £30,000 in April 2027 and £20,000 in April 2028.")`,
  );
  ws.mergeCells(row, 2, row, 8);
  ws.getCell(row, 2).alignment = { wrapText: true, vertical: 'top' };
  ws.getRow(row).height = 32;
  ws.views = [{ state: 'frozen', ySplit: 4 }];
}

/* ------------------------------------------------------------------ SA103 */

function buildSA103(wb: ExcelJS.Workbook, ws: Sheet): void {
  title(ws, 'SA103S year-end pack', 'Your figures box by box for the self-employment (short) pages. Boxes follow the 2025 SA103S; check the form for the year you file. Enter 11–20 only if you are not claiming the Trading Allowance.');
  ws.getColumn(1).width = 10;
  ws.getColumn(2).width = 58;
  ws.getColumn(3).width = 18;
  ws.getColumn(4).width = 70;
  header(ws, 4, ['Box', 'Description', '£', 'Note']);
  type Line = [string, string, string | null, string, boolean];
  const cat = (i: number): string => `SUMIFS(ExpenseAllowable,ExpenseCategoryCol,"${EXPENSE_CATEGORIES[i]!.label}")`;
  const stockCash = `SUMIFS(InventoryCost,InventoryDates,">="&TaxYearStart,InventoryDates,"<="&TaxYearEnd)`;
  const income: Line[] = [
    ['9', 'Your turnover', 'SalesTotal', 'Gross takings from the Sales log: item prices plus postage the buyers paid, before any fees.', false],
    ['10', 'Any other business income', null, 'Type it in: grants, insurance proceeds and the like (0 if none).', false],
    ['10.1', 'Trading income allowance', 'IF(UseAllowance=1,MIN(TradingAllowance,C5+C6),0)', 'Only when the allowance is in use (Allowance tab).', false],
  ];
  const exp: Line[] = [
    ['11', EXPENSE_CATEGORIES[0]!.label, `IF(StockMethod="${STOCK_METHODS[0]}",${stockCash},COGSTotal)+${cat(0)}`, 'Stock: on the cash basis every item paid for this tax year (Inventory); on traditional accounting the cost of the items sold (Sales). Plus anything logged under this category on Expenses.', false],
    ['12', EXPENSE_CATEGORIES[1]!.label, `${cat(1)}+MileageClaim`, 'Expenses in this category plus the mileage claim.', false],
    ['13', EXPENSE_CATEGORIES[2]!.label, cat(2), EXPENSE_CATEGORIES[2]!.note, false],
    ['14', EXPENSE_CATEGORIES[3]!.label, cat(3), EXPENSE_CATEGORIES[3]!.note, false],
    ['15', EXPENSE_CATEGORIES[4]!.label, cat(4), EXPENSE_CATEGORIES[4]!.note, false],
    ['16', EXPENSE_CATEGORIES[5]!.label, `${cat(5)}+PostagePaidTotal`, 'Postage you paid on sales (Sales log) plus phone, packaging, printing and other office costs from Expenses.', false],
    ['17', EXPENSE_CATEGORIES[6]!.label, cat(6), EXPENSE_CATEGORIES[6]!.note, false],
    ['18', EXPENSE_CATEGORIES[7]!.label, cat(7), EXPENSE_CATEGORIES[7]!.note, false],
    ['19', EXPENSE_CATEGORIES[8]!.label, `${cat(8)}+FeesTotal`, 'Marketplace selling and payment fees from the Sales log, plus subscriptions, accountancy and other costs from Expenses.', false],
  ];
  const totals: Line[] = [
    ['20', 'Total allowable expenses (boxes 11 to 19)', 'SUM(C8:C16)', 'If your turnover is under £90,000 you may enter just this total.', true],
    ['21', 'Net profit', 'MAX(IF(UseAllowance=1,C5+C6-C7,C5+C6-C17),0)', 'Income less expenses or the allowance, when positive.', false],
    ['22', 'Or net loss', 'MAX(IF(UseAllowance=1,0,C17-C5-C6),0)', 'Positive when expenses exceed income (not with the allowance).', false],
    ['23', 'Annual Investment Allowance', `IF(UseAllowance=1,0,${cat(9)})`, 'Capital items from the Expenses log (a printer, shelving, a laptop), 100 % in the year of purchase (not with the allowance).', false],
    ['31', 'Total taxable profits from this business', 'MAX(C18-C20,0)', 'Net profit less capital allowances. Feeds the Tax tab. (Loss relief and adjustments are outside this workbook.)', true],
  ];
  let row = 5;
  for (const l of [...income, ...exp, ...totals]) {
    label(ws.getCell(row, 1), l[0], true);
    ws.getCell(row, 1).alignment = { horizontal: 'center' };
    label(ws.getCell(row, 2), l[1]);
    if (l[2] === null) {
      ws.getCell(row, 3).value = 0;
      input(ws.getCell(row, 3), GBP);
    } else {
      formula(ws.getCell(row, 3), l[2], GBP);
    }
    if (l[4]) total(ws.getCell(row, 3));
    note(ws.getCell(row, 4), l[3]);
    row += 1;
  }
  // Row map (same as the Sole Trader workbook): 5=9, 6=10, 7=10.1, 8..16 = boxes 11..19, 17=20, 18=21, 19=22, 20=23, 21=31
  name(wb, 'SA103!$C$5', 'Turnover');
  name(wb, 'SA103!$C$6', 'OtherIncome');
  name(wb, 'SA103!$C$17', 'TotalExpenses');
  name(wb, 'SA103!$C$20', 'AIA');
  name(wb, 'SA103!$C$21', 'TaxableProfit');
  ws.views = [{ state: 'frozen', ySplit: 4 }];
}

/* ---------------------------------------------------------------- Example */

function buildExample(wb: ExcelJS.Workbook, ws: Sheet): void {
  title(ws, 'Worked example (2026/27)', 'A part-time reseller with a job, cash basis, checked by hand using the Setup rates. Change the blue figures to try your own numbers — nothing here touches your logs.');
  ws.getColumn(1).width = 56;
  ws.getColumn(2).width = 18;
  ws.getColumn(3).width = 80;
  header(ws, 4, ['Line', '£', 'Worked by hand']);
  const e = EXAMPLE_RESELLER;
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
  put(6, 'Gross takings (item prices + postage charged, box 9)', e.grossSales, GBP, 'About 320 sales across eBay, Vinted and Depop.');
  put(7, 'Platform and payment fees (box 19)', e.platformFees, GBP, 'From the Sales log fee column.');
  put(8, 'Postage paid (box 16)', e.postagePaid, GBP, 'Labels bought for the parcels.');
  put(9, 'Stock paid for in the year (box 11, cash basis)', e.stockBought, GBP, 'Every item bought this tax year, sold or not.');
  put(10, 'Other expenses (packaging, phone share, Bumps)', e.otherExpenses, GBP, '');
  put(11, 'Business miles by car (car boots, post office)', e.carMiles, NUM0, '');
  put(12, 'Salary from a job (before tax)', e.otherTaxableIncome, GBP, '');
  put(13, 'Tax deducted at source (PAYE)', e.taxDeductedAtSource, GBP, '(£22,000 − £12,570) × 20 % = £1,886.00');

  put(15, 'Profit', null, '', '', true);
  put(16, 'Mileage claim', 'MIN(B11,MileageCarThreshold)*MileageCarFirst+MAX(B11-MileageCarThreshold,0)*MileageCarAfter', GBP, '1,500 miles × 45p = £675.00');
  put(17, 'Actual deductions (stock + fees + postage + expenses + mileage)', 'B9+B7+B8+B10+B16', GBP, '£4,200 + £900 + £1,100 + £400 + £675 = £7,275.00');
  put(18, 'Trading Allowance would give', 'B6-MIN(TradingAllowance,B6)', GBP, '£12,000 − £1,000 = £11,000 — worse, so actual costs are used.');
  put(19, 'Taxable profit (box 31)', 'IF(B17<MIN(TradingAllowance,B6),B18,MAX(B6-B17,0))', GBP, '£12,000 − £7,275 = £4,725.00', true);
  put(20, 'Profit on the Sales tab would differ', null, '', 'The Sales tab shows profit per item sold; the tax figure deducts stock when paid (cash basis), so unsold stock lowers this year\'s tax bill and raises next year\'s.');

  put(22, 'Income Tax', null, '', '', true);
  put(23, 'Total income', 'B19+B12', GBP, '£4,725 + £22,000 = £26,725.00');
  put(24, 'Personal Allowance after taper', 'MAX(0,PersonalAllowance-MAX(0,B23-PATaperStart)/2)', GBP, '£12,570 — no taper under £100,000.');
  put(25, 'Taxable income', 'MAX(0,B23-B24)', GBP, '£26,725 − £12,570 = £14,155.00');
  put(26, 'Basic rate', 'MIN(B25,BasicRateBand)*BasicRate', GBP, '£14,155 × 20 % = £2,831.00');
  put(27, 'Higher rate', 'MIN(MAX(B25-BasicRateBand,0),MAX((HigherRateLimit-B24)-BasicRateBand,0))*HigherRate', GBP, 'Nothing above £37,700 of taxable income.');
  put(28, 'Additional rate', 'MAX(B25-(HigherRateLimit-B24),0)*AdditionalRate', GBP, '');
  put(29, 'Income Tax on all income', 'ROUND(B26+B27+B28,2)', GBP, '£2,831.00 — the job\'s PAYE already covers £1,886 of it.', true);

  put(31, 'National Insurance', null, '', '', true);
  put(32, 'Class 4 between the limits', 'MIN(MAX(B19-Class4Lower,0),Class4Upper-Class4Lower)*Class4MainRate', GBP, 'Profit is under £12,570: nothing to pay.');
  put(33, 'Class 4 above the upper limit', 'MAX(B19-Class4Upper,0)*Class4UpperRate', GBP, '');
  put(34, 'Class 4', 'ROUND(B32+B33,2)', GBP, '£0.00. Profit is also under the £7,105 Class 2 threshold — pay Class 2 voluntarily (£189.80) only if you need the State Pension year.', true);

  put(36, 'What is due', null, '', '', true);
  put(37, 'Tax + Class 4 less tax at source', 'B29+B34-B13', GBP, '£2,831.00 − £1,886.00 = £945.00', true);
  put(38, 'Balancing payment, 31 January 2028', 'B37', GBP, '£945.00', true);
  put(39, 'Payments on account for 2027/28 (each)', 'IF(AND(B37>POAMin,B13<POASourceShare*(B29+B34)),ROUND(B37/2,2),0)', GBP, 'The bill is £1,000 or under, so none.', true);
  put(40, 'Effective rate on reselling profit', 'IF(B19=0,0,B37/B19)', PCT, '£945 ÷ £4,725 = 20.0 % — every pound of profit is taxed at the basic rate on top of the salary.');
  put(42, 'Platform reporting', null, '', '', true);
  put(43, 'Sales in the calendar year', 320, NUM0, '');
  put(44, 'Reported to HMRC?', 'IF(OR(B43>=ReportSalesCount,B6>=ReportSalesValue),"Yes — over 30 sales and over £1,700","Not on these figures")', '', 'A data share: HMRC can compare it with the return, which this workbook prepares.');
  name(wb, 'Example!$B$37', 'ExampleTotalDue');
  name(wb, 'Example!$B$39', 'ExamplePOA');
  ws.views = [{ state: 'frozen', ySplit: 4 }];
}

/* ---------------------------------------------------------------- Builder */

export function buildResellerWorkbook(r: TaxYearRates = RATES_2026_27): ExcelJS.Workbook {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'UK Reseller Profit & Tax Workbook';
  wb.created = new Date(Date.UTC(2026, 10, 3));
  wb.calcProperties.fullCalcOnLoad = true;
  const sheets = Object.fromEntries(
    RESELLER_SHEETS.map((s) => [s, wb.addWorksheet(s, { properties: { defaultRowHeight: 15 } })]),
  ) as Record<(typeof RESELLER_SHEETS)[number], Sheet>;
  buildReadme(sheets.README, r);
  buildSetup(wb, sheets.Setup, r, {
    rows: SETUP_ROWS,
    lists: [
      { name: 'Platforms', items: PLATFORMS.map((p) => p.label), note: 'Sales tab → Platform' },
      { name: 'ItemSources', items: ITEM_SOURCES, note: 'Inventory tab → Bought from' },
      { name: 'StockMethods', items: STOCK_METHODS, note: 'Setup → Stock deduction method' },
    ],
  });
  // The Stock deduction method row is the first extra row: find it by its name and add the drop-down.
  const setup = sheets.Setup;
  for (let row = 5; row <= setup.rowCount; row++) {
    if (setup.getCell(row, 1).value === 'Stock deduction method') listValidation(setup, `B${row}:B${row}`, 'StockMethods');
  }
  buildInventory(wb, sheets.Inventory);
  buildSales(wb, sheets.Sales);
  buildExpenses(wb, sheets.Expenses);
  buildMileage(wb, sheets.Mileage);
  buildPlatforms(wb, sheets.Platforms);
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
  const colours: Record<string, string> = {
    Setup: 'FF7A9CC6', Inventory: 'FF8FBF8F', Sales: 'FF8FBF8F', Expenses: 'FF8FBF8F', Mileage: 'FF8FBF8F',
    Platforms: 'FF1F3A5F', Allowance: 'FF1F3A5F', SA103: 'FF1F3A5F', Tax: 'FF1F3A5F', Example: 'FFD9B26F',
  };
  for (const [s, c] of Object.entries(colours)) sheets[s as (typeof RESELLER_SHEETS)[number]].properties.tabColor = { argb: c };
  return wb;
}
