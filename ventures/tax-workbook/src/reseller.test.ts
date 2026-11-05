import { existsSync } from 'node:fs';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { RATES_2026_27 } from './rates.ts';
import { recalcAsync } from './recalc.ts';
import { buildResellerWorkbook, INVENTORY_ROWS, PLATFORMS, RESELLER_FILE_NAME, RESELLER_SHEETS, SALES_ROWS } from './reseller.ts';
import { EXAMPLE_RESELLER, RESELLER_EXPECTED, yearEnd } from './tax.ts';
import { GUIDE_README_LINE, listFormulas, validations } from './workbook.ts';

const FORBIDDEN = /\b(XLOOKUP|XMATCH|FILTER|SORT|UNIQUE|SEQUENCE|LET|LAMBDA|IFS|SWITCH|TEXTJOIN|CONCAT|MAXIFS|MINIFS|VLOOKUP|INDEX|MATCH)\s*\(/;

function hasSoffice(): boolean {
  try {
    execFileSync('soffice', ['--version'], { stdio: 'ignore', timeout: 20_000 });
    return true;
  } catch {
    return false;
  }
}

describe('the reseller workbook', () => {
  it('has the eleven tabs in order, the shared and its own named cells, and the drop-down lists', () => {
    const wb = buildResellerWorkbook();
    expect(wb.worksheets.map((w) => w.name)).toEqual([...RESELLER_SHEETS]);
    const names = new Set<string>();
    wb.definedNames.model.forEach((n) => names.add(n.name));
    for (const n of [
      'TaxYearStart', 'TaxYearEnd', 'ProfitMethod', 'PersonalAllowance', 'Class4Lower', 'TradingAllowance', 'MileageCarFirst', 'MTDThreshold',
      'StockMethod', 'ReportSalesCount', 'ReportSalesValue', 'Platforms', 'ItemSources', 'StockMethods', 'ExpenseCategories', 'VehicleTypes',
      'InventoryIDs', 'InventoryDates', 'InventoryCost', 'SalesDates', 'SalesPlatform', 'SalesItemIDs', 'SalesGross', 'SalesFees', 'SalesPostage',
      'SalesCOGS', 'SalesTotal', 'FeesTotal', 'PostagePaidTotal', 'COGSTotal', 'Turnover', 'OtherIncome', 'TotalExpenses', 'TaxableProfit',
      'UseAllowance', 'MileageClaim', 'TotalDue', 'PaymentOnAccount', 'ExampleTotalDue',
      ...PLATFORMS.flatMap((p) => [p.rateName, p.fixedName]),
    ]) {
      expect(names, n).toContain(n);
    }
    expect(validations(wb.getWorksheet('Sales')!).model[`B6:B${5 + SALES_ROWS}`]?.formulae).toEqual(['Platforms']);
    expect(validations(wb.getWorksheet('Inventory')!).model[`D6:D${5 + INVENTORY_ROWS}`]?.formulae).toEqual(['ItemSources']);
    const setup = wb.getWorksheet('Setup')!;
    const stockRow = [...Array(setup.rowCount).keys()].map((i) => i + 1).find((r) => setup.getCell(r, 1).value === 'Stock deduction method');
    expect(stockRow).toBeDefined();
    expect(validations(setup).model[`B${stockRow}:B${stockRow}`]?.formulae).toEqual(['StockMethods']);
  });

  it('names the Kindle guide once on its README tab, the same row as the first workbook', () => {
    const readme = buildResellerWorkbook().getWorksheet('README')!;
    const texts = [...Array(readme.rowCount).keys()].map((i) => readme.getCell(i + 1, 1).text);
    expect(texts.filter((t) => /UK Sole Trader Tax 2026\/27/.test(t))).toEqual([GUIDE_README_LINE]);
    expect(texts[texts.indexOf(GUIDE_README_LINE) - 1]).toBe('Also from the publisher');
  });

  it('uses only formulas Google Sheets and LibreOffice evaluate, and no lookups', () => {
    const formulas = listFormulas(buildResellerWorkbook());
    expect(formulas.length).toBeGreaterThan(2000);
    for (const f of formulas) expect(f.formula, f.ref).not.toMatch(FORBIDDEN);
  });

  it('works each sale\'s fee out from the platform picked, with the override winning', () => {
    const sales = buildResellerWorkbook().getWorksheet('Sales')!;
    const fee = (sales.getCell(6, 8).value as { formula: string }).formula;
    for (const p of PLATFORMS) {
      if (p.label !== 'Other / own website') expect(fee).toContain(`IF(B6="${p.label}",G6*${p.rateName}+${p.fixedName}`);
    }
    expect(fee).toContain('OtherRate');
    expect(fee.startsWith('IF(E6="","",IF(I6<>"",I6,ROUND(')).toBe(true);
  });

  it('puts stock in box 11 by the Setup method, postage in 16 and platform fees in 19', () => {
    const sa = buildResellerWorkbook().getWorksheet('SA103')!;
    const box = (row: number): string => (sa.getCell(row, 3).value as { formula: string }).formula;
    expect(box(8)).toContain('IF(StockMethod="Cash basis (cost when paid)",SUMIFS(InventoryCost,InventoryDates');
    expect(box(8)).toContain('COGSTotal');
    expect(box(9)).toContain('MileageClaim');
    expect(box(13)).toContain('PostagePaidTotal');
    expect(box(16)).toContain('FeesTotal');
    expect(box(21)).toBe('MAX(C18-C20,0)');
  });

  it('has a hand-worked example that src/tax.ts agrees with', () => {
    const e = EXAMPLE_RESELLER;
    const r = RATES_2026_27;
    const mileage = Math.min(e.carMiles, r.mileageCarThresholdMiles) * r.mileageCarFirst;
    expect(mileage).toBe(RESELLER_EXPECTED.mileage);
    const deductions = e.stockBought + e.platformFees + e.postagePaid + e.otherExpenses + mileage;
    expect(deductions).toBe(RESELLER_EXPECTED.deductions);
    const profit = e.grossSales - deductions;
    expect(profit).toBe(RESELLER_EXPECTED.profit);
    const y = yearEnd(
      { tradingProfit: profit, otherTaxableIncome: e.otherTaxableIncome, taxDeductedAtSource: e.taxDeductedAtSource, paymentsOnAccountMade: 0, payClass2Voluntarily: false },
      r,
    );
    expect(y.incomeTax).toBe(RESELLER_EXPECTED.incomeTax);
    expect(y.class4).toBe(RESELLER_EXPECTED.class4);
    expect(y.totalDue).toBe(RESELLER_EXPECTED.totalDue);
    expect(y.paymentOnAccountEach).toBe(RESELLER_EXPECTED.paymentOnAccountEach);
  });

  it.skipIf(!hasSoffice())(
    'recalculates in LibreOffice with zero formula errors and the hand-worked example figures',
    async () => {
      const dir = await mkdtemp(path.join(tmpdir(), 'reseller-workbook-test-'));
      const file = path.join(dir, RESELLER_FILE_NAME);
      await buildResellerWorkbook().xlsx.writeFile(file);
      expect(existsSync(file)).toBe(true);
      const result = await recalcAsync(file);
      expect(result.errors).toEqual([]);
      expect(result.checks.filter((c) => !c.ok)).toEqual([]);
      expect(result.ok).toBe(true);
    },
    240_000,
  );
});
