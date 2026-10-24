// Writes release/<FILE_NAME> from the ExcelJS builder. Run `npm run recalc -w @foundry/tax-workbook`
// after it to prove the formulas evaluate (LibreOffice) before the file is listed.
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { buildWorkbook, FILE_NAME, listFormulas } from './workbook.ts';

const releaseDir = path.resolve(import.meta.dirname, '..', 'release');
await mkdir(releaseDir, { recursive: true });
const wb = buildWorkbook();
const file = path.join(releaseDir, FILE_NAME);
await wb.xlsx.writeFile(file);
console.log(`${file}: ${wb.worksheets.length} sheets, ${listFormulas(wb).length} formulas`);
