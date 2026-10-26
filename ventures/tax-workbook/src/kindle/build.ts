// Builds the Kindle guide: npm run kindle -w @foundry/tax-workbook →
// kindle/UK-Sole-Trader-Tax-2026-27.epub, kindle/cover.jpg, kindle/cover.svg.
// The owner uploads the EPUB and the JPEG cover to KDP (ventures/tax-workbook/KINDLE.md).
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { wordCount } from './content.ts';
import { coverSvg, renderCoverJpeg, renderCoverPng } from './cover.ts';
import { buildEpub } from './epub.ts';

export const EPUB_FILE = 'UK-Sole-Trader-Tax-2026-27.epub';

export async function buildKindle(outDir: string): Promise<{ epub: string; words: number; bytes: number }> {
  await mkdir(outDir, { recursive: true });
  const png = renderCoverPng();
  const jpeg = await renderCoverJpeg(png);
  const epub = await buildEpub(jpeg, new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'));
  const epubPath = path.join(outDir, EPUB_FILE);
  await Promise.all([
    writeFile(path.join(outDir, 'cover.svg'), coverSvg()),
    writeFile(path.join(outDir, 'cover.jpg'), jpeg),
    writeFile(epubPath, epub),
  ]);
  return { epub: epubPath, words: wordCount(), bytes: epub.byteLength };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const out = path.resolve(import.meta.dirname, '..', '..', 'kindle');
  const r = await buildKindle(out);
  console.log(`wrote ${r.epub} (${(r.bytes / 1024).toFixed(0)} kB, ${r.words.toLocaleString('en-GB')} words), cover.jpg/svg`);
}
