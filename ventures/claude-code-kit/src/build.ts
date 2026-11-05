// Builds the handbook: npm run build -w @foundry/claude-code-kit →
// release/Running-Claude-Code-Unattended.epub, .pdf, cover.jpg, cover.svg. The owner uploads the
// EPUB, the PDF and the cover to Leanpub (the listing-pack item writes the copy and the step).
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { wordCount } from './content.ts';
import { coverSvg, renderCoverJpeg, renderCoverPng } from './cover.ts';
import { buildEpub } from './epub.ts';
import { buildPdf } from './pdf.ts';

export const EPUB_FILE = 'Running-Claude-Code-Unattended.epub';
export const PDF_FILE = 'Running-Claude-Code-Unattended.pdf';

export async function buildBook(outDir: string): Promise<{ epub: string; pdf: string; words: number; bytes: number; pages: number }> {
  await mkdir(outDir, { recursive: true });
  const png = renderCoverPng();
  const jpeg = await renderCoverJpeg(png);
  const epub = await buildEpub(jpeg, new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'));
  const { pdf, pages } = await buildPdf();
  const epubPath = path.join(outDir, EPUB_FILE);
  const pdfPath = path.join(outDir, PDF_FILE);
  await Promise.all([
    writeFile(path.join(outDir, 'cover.svg'), coverSvg()),
    writeFile(path.join(outDir, 'cover.jpg'), jpeg),
    writeFile(epubPath, epub),
    writeFile(pdfPath, pdf),
  ]);
  return { epub: epubPath, pdf: pdfPath, words: wordCount(), bytes: epub.byteLength, pages };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const out = path.resolve(import.meta.dirname, '..', 'release');
  const r = await buildBook(out);
  console.log(`wrote ${r.epub} (${(r.bytes / 1024).toFixed(0)} kB, ${r.words.toLocaleString('en-GB')} words), ${r.pdf} (${r.pages} pages), cover.jpg/svg`);
}
