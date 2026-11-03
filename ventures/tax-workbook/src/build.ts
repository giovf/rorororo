// Writes release/<FILE_NAME> and release/<RESELLER_FILE_NAME> from the ExcelJS builders. Run
// `npm run recalc -w @foundry/tax-workbook` after it to prove the formulas evaluate (LibreOffice)
// before a file is listed.
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { buildResellerWorkbook, RESELLER_FILE_NAME } from './reseller.ts';
import { buildWorkbook, FILE_NAME, listFormulas } from './workbook.ts';

const releaseDir = path.resolve(import.meta.dirname, '..', 'release');
await mkdir(releaseDir, { recursive: true });
for (const [fileName, wb] of [
  [FILE_NAME, buildWorkbook()],
  [RESELLER_FILE_NAME, buildResellerWorkbook()],
] as const) {
  const file = path.join(releaseDir, fileName);
  await wb.xlsx.writeFile(file);
  console.log(`${file}: ${wb.worksheets.length} sheets, ${listFormulas(wb).length} formulas`);
}
