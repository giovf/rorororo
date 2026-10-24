// Proves the released workbook evaluates: copies it to a scratch folder, has LibreOffice
// recalculate every formula through a Basic macro (the same route the xlsx skill's recalc.py
// takes), reads the result back with ExcelJS, counts error cells (#NAME?, #REF!, #VALUE!, …)
// and checks the Example tab and the chain Income → SA103 → Tax against src/tax.ts.
// Usage: node src/recalc.ts [path-to-xlsx]   (default: release/<FILE_NAME>). Exit 1 on any failure.
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ExcelJS from 'exceljs';
import { RATES_2026_27 } from './rates.ts';
import { EXAMPLE_EXPECTED, mileageClaim, taxableProfit, useTradingAllowance } from './tax.ts';
import { FILE_NAME } from './workbook.ts';

const MACRO = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE script:module PUBLIC "-//OpenOffice.org//DTD OfficeDocument 1.0//EN" "module.dtd">
<script:module xmlns:script="http://openoffice.org/2000/script" script:name="Module1" script:language="StarBasic">
    Sub RecalculateAndSave()
      ThisComponent.calculateAll()
      ThisComponent.store()
      ThisComponent.close(True)
    End Sub
</script:module>`;

export interface RecalcResult {
  file: string;
  formulas: number;
  errors: Array<{ ref: string; error: string }>;
  checks: Array<{ name: string; expected: number; actual: number | null; ok: boolean }>;
  ok: boolean;
}

function cellNumber(wb: ExcelJS.Workbook, sheet: string, address: string): number | null {
  const v = wb.getWorksheet(sheet)?.getCell(address).value;
  if (typeof v === 'number') return v;
  if (v && typeof v === 'object' && 'result' in v && typeof v.result === 'number') return v.result;
  // ExcelJS omits a cached result of 0 when it reads a file, so a formula cell with no result
  // after LibreOffice has stored every value is a zero (an unevaluated cell would be an error).
  if (v && typeof v === 'object' && 'formula' in v && !('result' in v)) return 0;
  return null;
}

async function load(file: string): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);
  return wb;
}

export async function readBackAsync(file: string): Promise<RecalcResult> {
  const wb = await load(file);
  const errors: RecalcResult['errors'] = [];
  let formulas = 0;
  for (const ws of wb.worksheets) {
    ws.eachRow((row) => {
      row.eachCell((cell) => {
        const v = cell.value;
        if (v && typeof v === 'object') {
          if ('formula' in v || 'sharedFormula' in v) formulas += 1;
          if ('error' in v && typeof v.error === 'string') errors.push({ ref: `${ws.name}!${cell.address}`, error: v.error });
          if ('result' in v && v.result && typeof v.result === 'object' && 'error' in v.result) {
            errors.push({ ref: `${ws.name}!${cell.address}`, error: String(v.result.error) });
          }
        }
        if (typeof v === 'string' && /^#(NAME\?|REF!|VALUE!|DIV\/0!|N\/A|NUM!|NULL!)/.test(v)) {
          errors.push({ ref: `${ws.name}!${cell.address}`, error: v });
        }
      });
    });
  }
  const r = RATES_2026_27;
  // The sample rows left in the logs: £1,250 income, £30 × 60 % phone, 64 car miles.
  const sampleMileage = mileageClaim(64, 0, 0, r);
  const sampleDeductions = 18 + sampleMileage;
  const sampleAllowance = useTradingAllowance(1250, sampleDeductions, r);
  const checks: RecalcResult['checks'] = [];
  const check = (name: string, sheet: string, address: string, expected: number): void => {
    const actual = cellNumber(wb, sheet, address);
    checks.push({ name, expected, actual, ok: actual !== null && Math.abs(actual - expected) < 0.005 });
  };
  check('Example: mileage claim', 'Example', 'B16', EXAMPLE_EXPECTED.mileage);
  check('Example: taxable profit', 'Example', 'B19', EXAMPLE_EXPECTED.profit);
  check('Example: income tax', 'Example', 'B28', EXAMPLE_EXPECTED.incomeTax);
  check('Example: Class 4', 'Example', 'B33', EXAMPLE_EXPECTED.class4);
  check('Example: total due', 'Example', 'B36', EXAMPLE_EXPECTED.totalDue);
  check('Example: payment on account', 'Example', 'B39', EXAMPLE_EXPECTED.paymentOnAccountEach);
  check('Sample rows: Mileage!G3 claim', 'Mileage', 'G3', sampleMileage);
  check('Sample rows: Expenses!F3 allowable', 'Expenses', 'F3', 18);
  check('Sample rows: SA103 box 9', 'SA103', 'C5', 1250);
  check('Sample rows: Allowance in use', 'Allowance', 'B12', sampleAllowance ? 1 : 0);
  check('Sample rows: SA103 box 31', 'SA103', 'C21', taxableProfit(1250, sampleDeductions, sampleAllowance, r));
  check('Sample rows: Quarterly Q1 income', 'Quarterly', 'D6', 1250);
  check('Sample rows: Tax total due', 'Tax', 'B33', 0);
  return { file, formulas, errors, checks, ok: errors.length === 0 && checks.every((c) => c.ok) };
}

export async function recalcAsync(source: string): Promise<RecalcResult> {
  const scratch = mkdtempSync(path.join(tmpdir(), 'tax-workbook-'));
  const profile = path.join(scratch, 'profile');
  mkdirSync(profile, { recursive: true });
  const profileUrl = pathToFileURL(profile).href;
  execFileSync('soffice', ['--headless', '--terminate_after_init', `-env:UserInstallation=${profileUrl}`], {
    stdio: 'ignore',
    timeout: 120_000,
  });
  const macroDir = path.join(profile, 'user', 'basic', 'Standard');
  if (!existsSync(macroDir)) throw new Error('LibreOffice did not create a profile with a Standard basic library');
  writeFileSync(path.join(macroDir, 'Module1.xba'), MACRO);
  const copy = path.join(scratch, path.basename(source));
  copyFileSync(source, copy);
  execFileSync(
    'soffice',
    [
      '--headless',
      '--norestore',
      `-env:UserInstallation=${profileUrl}`,
      'vnd.sun.star.script:Standard.Module1.RecalculateAndSave?language=Basic&location=application',
      copy,
    ],
    { stdio: 'ignore', timeout: 180_000 },
  );
  return readBackAsync(copy);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const source = process.argv[2] ?? path.resolve(import.meta.dirname, '..', 'release', FILE_NAME);
  const result = await recalcAsync(source);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}
