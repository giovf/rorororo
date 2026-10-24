import { existsSync } from 'node:fs';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { EXPENSE_CATEGORIES } from './rates.ts';
import { recalcAsync } from './recalc.ts';
import { buildWorkbook, EXPENSE_ROWS, INCOME_ROWS, listFormulas, MILEAGE_ROWS, SHEETS, validations } from './workbook.ts';

const FORBIDDEN = /\b(XLOOKUP|XMATCH|FILTER|SORT|UNIQUE|SEQUENCE|LET|LAMBDA|IFS|SWITCH|TEXTJOIN|CONCAT|MAXIFS|MINIFS)\s*\(/;

function hasSoffice(): boolean {
  try {
    execFileSync('soffice', ['--version'], { stdio: 'ignore', timeout: 20_000 });
    return true;
  } catch {
    return false;
  }
}

describe('the workbook', () => {
  it('has the ten tabs in order, the named cells and the drop-down lists', () => {
    const wb = buildWorkbook();
    expect(wb.worksheets.map((w) => w.name)).toEqual([...SHEETS]);
    const names = new Set<string>();
    wb.definedNames.model.forEach((n) => names.add(n.name));
    for (const n of [
      'TaxYearStart', 'TaxYearEnd', 'QuarterBasis', 'ProfitMethod', 'PersonalAllowance', 'BasicRateBand', 'HigherRateLimit',
      'Class4Lower', 'Class4Upper', 'Class2SPT', 'TradingAllowance', 'MileageCarFirst', 'MileageCarThreshold', 'POAMin',
      'MTDThreshold', 'IncomeTypes', 'ExpenseCategories', 'VehicleTypes', 'Turnover', 'TotalExpenses', 'TaxableProfit',
      'UseAllowance', 'MileageClaim', 'TotalDue', 'PaymentOnAccount', 'ExampleTotalDue',
    ]) {
      expect(names, n).toContain(n);
    }
    expect(validations(wb.getWorksheet('Expenses')!).model[`C6:C${5 + EXPENSE_ROWS}`]?.formulae).toEqual(['ExpenseCategories']);
    expect(validations(wb.getWorksheet('Income')!).model[`C6:C${5 + INCOME_ROWS}`]?.formulae).toEqual(['IncomeTypes']);
    expect(validations(wb.getWorksheet('Mileage')!).model[`D6:D${5 + MILEAGE_ROWS}`]?.formulae).toEqual(['VehicleTypes']);
  });

  it('uses only formulas Google Sheets and LibreOffice evaluate', () => {
    const wb = buildWorkbook();
    const formulas = listFormulas(wb);
    expect(formulas.length).toBeGreaterThan(2000);
    for (const f of formulas) expect(f.formula, f.ref).not.toMatch(FORBIDDEN);
  });

  it('maps every SA103S expense box from the category list and adds mileage to box 12', () => {
    const wb = buildWorkbook();
    const sa = wb.getWorksheet('SA103')!;
    const boxes = EXPENSE_CATEGORIES.filter((c) => c.box !== null && c.box < 20);
    boxes.forEach((c, i) => {
      const cell = sa.getCell(8 + i, 3).value as { formula: string };
      expect(cell.formula).toContain(`"${c.label}"`);
      if (c.box === 12) expect(cell.formula).toContain('MileageClaim');
    });
    expect((sa.getCell(21, 3).value as { formula: string }).formula).toBe('MAX(C18-C20,0)');
  });

  it.skipIf(!hasSoffice())(
    'recalculates in LibreOffice with zero formula errors and the hand-worked example figures',
    async () => {
      const dir = await mkdtemp(path.join(tmpdir(), 'tax-workbook-test-'));
      const file = path.join(dir, 'workbook.xlsx');
      const wb = buildWorkbook();
      await wb.xlsx.writeFile(file);
      expect(existsSync(file)).toBe(true);
      const result = await recalcAsync(file);
      expect(result.errors).toEqual([]);
      expect(result.checks.filter((c) => !c.ok)).toEqual([]);
      expect(result.ok).toBe(true);
    },
    240_000,
  );
});
