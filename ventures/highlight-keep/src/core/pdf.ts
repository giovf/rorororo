/**
 * PDF support: Chrome's and Firefox's built-in PDF viewers cannot host a content script, so
 * the extension ships its own viewer page (pdf.html, PDF.js) and opens web PDFs there. The
 * viewer URL carries the PDF's address in `?file=`; highlights are stored under the PDF's own
 * URL, so the popup, the library and the Markdown export see it as any other page.
 * Pure helpers here; the rendering lives in src/pdf/pdf.ts.
 */
export const VIEWER_PATH = 'pdf.html';

/** A web address whose path ends in .pdf — the only PDFs the viewer can fetch (not file://). */
export function isPdfUrl(href: string): boolean {
  try {
    const u = new URL(href);
    return (u.protocol === 'https:' || u.protocol === 'http:') && /\.pdf$/i.test(u.pathname);
  } catch {
    return false;
  }
}

/** The extension page that shows `fileUrl`; `base` is chrome.runtime.getURL(''). */
export function viewerUrl(base: string, fileUrl: string): string {
  return `${base.replace(/\/+$/, '')}/${VIEWER_PATH}?file=${encodeURIComponent(fileUrl)}`;
}

/** The address highlights are stored under: the PDF's own URL when on the viewer page, else `href`. */
export function documentUrl(href: string): string {
  try {
    const u = new URL(href);
    if ((u.protocol !== 'chrome-extension:' && u.protocol !== 'moz-extension:') || !u.pathname.endsWith(`/${VIEWER_PATH}`)) return href;
    const file = u.searchParams.get('file');
    return file && isPdfUrl(file) ? file : href;
  } catch {
    return href;
  }
}

/** Title for the record and the tab: the PDF's metadata title, else its file name. */
export function pdfTitle(metaTitle: string | null | undefined, fileUrl: string): string {
  const t = (metaTitle ?? '').trim();
  if (t) return t;
  try {
    const name = new URL(fileUrl).pathname.split('/').pop() ?? '';
    return decodeURIComponent(name) || fileUrl;
  } catch {
    return fileUrl;
  }
}

/** Width that fits the page in the window, capped so text stays readable on wide screens. */
export function fitScale(pageWidth: number, windowWidth: number, maxWidth = 920, gutter = 32): number {
  const target = Math.max(240, Math.min(maxWidth, windowWidth - gutter));
  return Math.max(0.25, Math.min(3, target / pageWidth));
}
