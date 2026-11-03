// The KDP paperback of the Kindle guide (tax-workbook `kdp-paperback-edition`, spike
// docs/exchange/spikes/kdp-paperback-tax-guide.md): the same chapters as the EPUB printed by
// Chromium to a 6" × 9" interior PDF (fonts embedded by the print engine, running heads and page
// numbers from the print templates, each chapter on a new page), plus the wrap cover PDF whose
// width depends on the page count (KDP white paper: spine = pages × 0.002252"). No spine text —
// KDP allows it only from 79 pages and the guide prints under that. The owner adds the paperback
// as a second format of the live Kindle title (KINDLE.md "Paperback"); nothing is uploaded here.
//
//   npm run paperback -w @foundry/tax-workbook → kindle/paperback/*.pdf
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { BOOK, chapters, type Chapter } from './content.ts';
import { coverSvg, COVER_H, COVER_W } from './cover.ts';
import { copyrightParagraphs, STYLESHEET, xmlEsc } from './epub.ts';

/** KDP trim size, inches. */
export const TRIM = { w: 6, h: 9 } as const;
/** Bleed KDP adds to each outer edge of the cover, inches. */
export const BLEED = 0.125;
/** Spine thickness per page on white paper, inches (KDP's cover calculator). */
export const SPINE_PER_PAGE = 0.002252;
/** Interior page margins, inches: KDP wants ≥ 0.375" inside and ≥ 0.25" outside up to 150 pages; 0.5" on every side meets both without mirrored pages. */
export const MARGIN = { top: 0.6, bottom: 0.6, inside: 0.5, outside: 0.5 } as const;
/** The page range the build accepts (KDP's fixed print cost holds to 110 pages; under 24 KDP will not bind). */
export const PAGE_RANGE = { min: 24, max: 110 } as const;
export const LIST_PRICE_GBP = 9.99;
export const INTERIOR_FILE = 'UK-Sole-Trader-Tax-2026-27-paperback-interior.pdf';
export const COVER_FILE = 'UK-Sole-Trader-Tax-2026-27-paperback-cover.pdf';

const SANDBOX_CHROMIUM = '/opt/pw-browsers/chromium';
const SERIF = '"DejaVu Serif", "Liberation Serif", "Times New Roman", serif';

/** The wrap cover's size for a page count, inches, and its spine. */
export function coverSize(pages: number): { width: number; height: number; spine: number } {
  const spine = Math.round(pages * SPINE_PER_PAGE * 10000) / 10000;
  return {
    width: Math.round((BLEED + TRIM.w + spine + TRIM.w + BLEED) * 10000) / 10000,
    height: TRIM.h + 2 * BLEED,
    spine,
  };
}

/** Count of pages in a Chromium-written PDF (one `/Type /Page` object per page; `/Pages` is the tree). */
export function pdfPageCount(pdf: Uint8Array): number {
  const text = Buffer.from(pdf).toString('latin1');
  return (text.match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length;
}

const PRINT_CSS = `${STYLESHEET}
@page { size: ${TRIM.w}in ${TRIM.h}in; }
html { font-size: 11pt; }
body { font-family: ${SERIF}; margin: 0; line-height: 1.45; orphans: 2; widows: 2; }
h1 { font-size: 2em; margin: 2.5in 0 0.4em; }
h2 { font-size: 1.45em; margin: 0.4in 0 0.5em; }
section.chapter { page-break-before: always; }
section.front { page-break-before: always; }
p { text-align: justify; hyphens: auto; }
table { page-break-inside: auto; font-size: 0.9em; }
tr { page-break-inside: avoid; }
th, td { padding: 0.3em 0.35em; }
.tip { page-break-inside: avoid; background: #eef1f5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.toc { margin-top: 0.3in; }
.toc li { margin-bottom: 0.45em; }
.copyright p { font-size: 0.9em; text-align: left; }
`;

function tocHtml(chs: Chapter[]): string {
  const main = chs.filter((c) => !c.backMatter && c.id !== 'about');
  const back = chs.filter((c) => c.backMatter);
  const li = (c: Chapter): string => `<li>${xmlEsc(c.title)}</li>`;
  return `<section class="front toc"><h2>Contents</h2><ul class="toc">${main.map(li).join('')}${back.map(li).join('')}</ul></section>`;
}

/** The whole interior as one HTML document: title page, copyright, contents, every chapter on a new page. */
export function interiorHtml(chs: Chapter[] = chapters()): string {
  const about = chs.find((c) => c.id === 'about');
  const rest = chs.filter((c) => c.id !== 'about');
  return `<!DOCTYPE html>
<html lang="${BOOK.language}">
<head>
<meta charset="utf-8">
<title>${xmlEsc(BOOK.title)}</title>
<style>${PRINT_CSS}</style>
</head>
<body>
<section class="title"><h1>${xmlEsc(BOOK.title)}</h1><p class="subtitle">${xmlEsc(BOOK.subtitle)}</p><p class="edition">${xmlEsc(BOOK.author)}<br>${xmlEsc(BOOK.edition)}<br>Paperback edition</p></section>
<section class="front copyright">${copyrightParagraphs()
    .map((t) => `<p>${xmlEsc(t)}</p>`)
    .join('')}<p>Also available as a Kindle e-book.</p></section>
${tocHtml(chs)}
${about ? `<section class="chapter">${about.body}</section>` : ''}
${rest.map((c) => `<section class="chapter">${c.body}</section>`).join('\n')}
</body>
</html>
`;
}

const HEAD_CSS = `font-family: ${SERIF}; font-size: 8pt; color: #333; width: 100%; padding: 0 0.5in; text-align: center;`;

/** The wrap cover SVG for a page count: back cover (blurb), spine (plain), front (the Kindle cover, cropped to 6 × 9). */
export function wrapCoverSvg(pages: number): string {
  const { width, height, spine } = coverSize(pages);
  const pt = (inches: number): number => Math.round(inches * 72 * 100) / 100;
  const W = pt(width);
  const H = pt(height);
  const frontX = pt(BLEED + TRIM.w + spine);
  const inner = coverSvg()
    .replace(
      /^<svg[^>]*>/,
      `<svg x="${frontX}" y="0" width="${pt(TRIM.w + BLEED)}" height="${H}" viewBox="0 0 ${COVER_W} ${COVER_H}" preserveAspectRatio="none">`,
    )
    .trim();
  const esc = (s: string): string =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const blurb = [
    'The tax a UK sole trader pays for 2026/27, in the order',
    'a tax year runs:',
    '',
    'Registering and records · the cash basis',
    'Expenses, mileage and working from home',
    'Income Tax, Class 4 National Insurance',
    'Payments on account and the deadlines',
    'Making Tax Digital quarterly updates',
    'Four worked examples, every figure shown',
  ];
  const backX = pt(BLEED + 0.5);
  const lines = blurb
    .map((t, i) =>
      t
        ? `<text x="${backX}" y="${pt(1.7 + i * 0.3)}" font-size="${pt(0.15)}" fill="#FFFFFF">${esc(t)}</text>`
        : '',
    )
    .join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}in" height="${height}in" viewBox="0 0 ${W} ${H}" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif">
<rect width="${W}" height="${H}" fill="#1F3A5F"/>
<text x="${backX}" y="${pt(1.1)}" font-size="${pt(0.3)}" font-weight="bold" fill="#F2C14E">${esc(BOOK.title)}</text>
${lines}
<text x="${backX}" y="${pt(TRIM.h - 2.05)}" font-size="${pt(0.15)}" fill="#C9D6E8">${esc(BOOK.author)} · ${esc(BOOK.edition)}</text>
<text x="${backX}" y="${pt(TRIM.h - 1.8)}" font-size="${pt(0.13)}" fill="#C9D6E8">Rates from gov.uk, read October 2026. Not tax advice.</text>
<rect x="${pt(BLEED + TRIM.w - 2.25)}" y="${pt(BLEED + TRIM.h - 1.45)}" width="${pt(2)}" height="${pt(1.2)}" fill="#FFFFFF"/>
${inner}
</svg>
`;
}

function browserOptions(): { executablePath?: string } {
  const fromEnv = process.env['CHROMIUM_PATH'];
  if (fromEnv) return { executablePath: fromEnv };
  if (existsSync(chromium.executablePath())) return {};
  if (existsSync(SANDBOX_CHROMIUM)) return { executablePath: SANDBOX_CHROMIUM };
  throw new Error(`no Chromium: run \`npx playwright install chromium\` or set CHROMIUM_PATH`);
}

export interface PaperbackBuild {
  interior: string;
  cover: string;
  pages: number;
  cover_in: { width: number; height: number; spine: number };
}

/** Prints the interior and the cover PDFs into outDir; throws when the page count leaves PAGE_RANGE. */
export async function buildPaperback(outDir: string): Promise<PaperbackBuild> {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch(browserOptions());
  try {
    const page = await browser.newPage();
    await page.setContent(interiorHtml(), { waitUntil: 'load' });
    const interior = await page.pdf({
      width: `${TRIM.w}in`,
      height: `${TRIM.h}in`,
      margin: {
        top: `${MARGIN.top}in`,
        bottom: `${MARGIN.bottom}in`,
        left: `${MARGIN.inside}in`,
        right: `${MARGIN.outside}in`,
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `<div style="${HEAD_CSS}">${xmlEsc(BOOK.title)}</div>`,
      footerTemplate: `<div style="${HEAD_CSS}"><span class="pageNumber"></span></div>`,
    });
    const pages = pdfPageCount(new Uint8Array(interior));
    if (pages < PAGE_RANGE.min || pages > PAGE_RANGE.max) {
      throw new Error(
        `interior is ${pages} pages; KDP build accepts ${PAGE_RANGE.min}–${PAGE_RANGE.max}`,
      );
    }
    const size = coverSize(pages);
    await page.setContent(
      `<!DOCTYPE html><html><head><style>@page{size:${size.width}in ${size.height}in;margin:0}html,body{margin:0}svg{display:block}</style></head><body>${wrapCoverSvg(pages)}</body></html>`,
      { waitUntil: 'load' },
    );
    const cover = await page.pdf({
      width: `${size.width}in`,
      height: `${size.height}in`,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
      printBackground: true,
    });
    if (pdfPageCount(new Uint8Array(cover)) !== 1) throw new Error('cover PDF must be one page');
    const interiorPath = path.join(outDir, INTERIOR_FILE);
    const coverPath = path.join(outDir, COVER_FILE);
    await Promise.all([writeFile(interiorPath, interior), writeFile(coverPath, cover)]);
    return { interior: interiorPath, cover: coverPath, pages, cover_in: size };
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const out = path.resolve(import.meta.dirname, '..', '..', 'kindle', 'paperback');
  const r = await buildPaperback(out);
  console.log(
    `wrote ${r.interior} (${r.pages} pages) and ${r.cover} (${r.cover_in.width}" × ${r.cover_in.height}", spine ${r.cover_in.spine}")`,
  );
}
