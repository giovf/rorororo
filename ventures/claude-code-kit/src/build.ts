// Builds the handbook: npm run build -w @foundry/claude-code-kit →
// release/Running-Claude-Code-Unattended.epub, .pdf, cover.jpg, cover.svg and the Extras zip
// (claude-code-kit-extras.zip, the scrubbed files of the operation). The owner uploads the EPUB,
// the PDF, the cover and the zip to Leanpub (the listing-pack item writes the copy and the step).
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { wordCount } from './content.ts';
import { coverSvg, renderCoverJpeg, renderCoverPng } from './cover.ts';
import { buildEpub } from './epub.ts';
import { assembleExtras, buildExtrasZip, EXTRAS_FILE } from './extras.ts';
import { buildPdf } from './pdf.ts';

export const EPUB_FILE = 'Running-Claude-Code-Unattended.epub';
export const PDF_FILE = 'Running-Claude-Code-Unattended.pdf';

export async function buildBook(
  outDir: string,
): Promise<{ epub: string; pdf: string; extras: string; words: number; bytes: number; pages: number; extrasFiles: number }> {
  await mkdir(outDir, { recursive: true });
  const png = renderCoverPng();
  const jpeg = await renderCoverJpeg(png);
  const epub = await buildEpub(jpeg, new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'));
  const { pdf, pages } = await buildPdf();
  const extrasFiles = await assembleExtras(path.resolve(import.meta.dirname, '..', '..', '..'));
  const extras = await buildExtrasZip(extrasFiles);
  const epubPath = path.join(outDir, EPUB_FILE);
  const pdfPath = path.join(outDir, PDF_FILE);
  const extrasPath = path.join(outDir, EXTRAS_FILE);
  await Promise.all([
    writeFile(path.join(outDir, 'cover.svg'), coverSvg()),
    writeFile(path.join(outDir, 'cover.jpg'), jpeg),
    writeFile(epubPath, epub),
    writeFile(pdfPath, pdf),
    writeFile(extrasPath, extras),
  ]);
  return { epub: epubPath, pdf: pdfPath, extras: extrasPath, words: wordCount(), bytes: epub.byteLength, pages, extrasFiles: extrasFiles.size };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const out = path.resolve(import.meta.dirname, '..', 'release');
  const r = await buildBook(out);
  console.log(
    `wrote ${r.epub} (${(r.bytes / 1024).toFixed(0)} kB, ${r.words.toLocaleString('en-GB')} words), ${r.pdf} (${r.pages} pages), cover.jpg/svg, ${r.extras} (${r.extrasFiles} files)`,
  );
}
