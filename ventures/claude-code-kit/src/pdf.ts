// The PDF edition: the same chapters printed by Chromium (Playwright, the sandbox's browser) to a
// 7 × 10 in page (a technical-book trim; Leanpub takes any finished PDF as an upload), fonts
// embedded by the print engine, running head and page numbers from the print templates, each
// chapter on a new page. Mirrors ventures/tax-workbook/src/kindle/paperback.ts.
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';
import { BOOK, chapters } from './content.ts';
import { copyrightParagraphs, STYLESHEET, xmlEsc } from './epub.ts';

export const TRIM = { w: 7, h: 10 } as const;
export const MARGIN = { top: 0.75, bottom: 0.75, inside: 0.8, outside: 0.7 } as const;
const SANDBOX_CHROMIUM = '/opt/pw-browsers/chromium';
const SERIF = '"DejaVu Serif", "Liberation Serif", "Times New Roman", serif';
const HEAD_CSS = 'font-family: DejaVu Sans, Arial, sans-serif; font-size: 8pt; color: #666; width: 100%; text-align: center; padding: 0 0.5in;';

/** Count of pages in a Chromium-written PDF (one `/Type /Page` object per page; `/Pages` is the tree). */
export function pdfPageCount(pdf: Uint8Array): number {
  const text = Buffer.from(pdf).toString('latin1');
  return (text.match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length;
}

export function interiorHtml(): string {
  const chs = chapters();
  const toc = chs.map((ch) => `<li>${xmlEsc(ch.title)}</li>`).join('\n');
  return `<!DOCTYPE html><html lang="${BOOK.language}"><head><meta charset="UTF-8"/><title>${xmlEsc(BOOK.title)}</title>
<style>
${STYLESHEET}
body { font-family: ${SERIF}; font-size: 10.5pt; line-height: 1.45; margin: 0; }
section.chapter { page-break-before: always; }
section.front { page-break-before: always; text-align: center; padding-top: 2.5in; }
h1 { font-size: 26pt; margin: 0 0 0.3em; }
h2 { font-size: 18pt; margin: 0 0 0.8em; page-break-after: avoid; }
h3 { font-size: 12.5pt; }
pre { font-size: 8.3pt; page-break-inside: avoid; }
table { page-break-inside: avoid; }
.toc { text-align: left; padding-top: 0.5in; }
.toc li { font-size: 11pt; }
</style></head><body>
<section class="front"><h1>${xmlEsc(BOOK.title)}</h1><p class="subtitle">${xmlEsc(BOOK.subtitle)}</p><p class="edition">${xmlEsc(BOOK.author)}<br/>${xmlEsc(BOOK.edition)}</p></section>
<section class="chapter">${copyrightParagraphs()
    .map((t) => `<p>${xmlEsc(t)}</p>`)
    .join('\n')}</section>
<section class="chapter toc"><h2>Contents</h2><ol>${toc}</ol></section>
${chs.map((ch) => `<section class="chapter"><h2>${xmlEsc(ch.title)}</h2>\n${ch.body}\n</section>`).join('\n')}
</body></html>`;
}

function browserOptions(): { executablePath?: string } {
  const fromEnv = process.env['CHROMIUM_PATH'];
  if (fromEnv) return { executablePath: fromEnv };
  if (existsSync(chromium.executablePath())) return {};
  if (existsSync(SANDBOX_CHROMIUM)) return { executablePath: SANDBOX_CHROMIUM };
  throw new Error('no Chromium: run `npx playwright install chromium` or set CHROMIUM_PATH');
}

/** Prints the book to PDF bytes and reports the page count. */
export async function buildPdf(): Promise<{ pdf: Uint8Array; pages: number }> {
  const browser = await chromium.launch(browserOptions());
  try {
    const page = await browser.newPage();
    await page.setContent(interiorHtml(), { waitUntil: 'load' });
    const pdf = new Uint8Array(
      await page.pdf({
        width: `${TRIM.w}in`,
        height: `${TRIM.h}in`,
        margin: { top: `${MARGIN.top}in`, bottom: `${MARGIN.bottom}in`, left: `${MARGIN.inside}in`, right: `${MARGIN.outside}in` },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: `<div style="${HEAD_CSS}">${xmlEsc(BOOK.title)}</div>`,
        footerTemplate: `<div style="${HEAD_CSS}"><span class="pageNumber"></span></div>`,
      }),
    );
    return { pdf, pages: pdfPageCount(pdf) };
  } finally {
    await browser.close();
  }
}
