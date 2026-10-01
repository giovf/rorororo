/**
 * PDF support: the browsers' built-in PDF viewers cannot host a content script, and PDF.js's
 * usual invisible text layer over a canvas would hide bold starts and fonts. So the extension
 * ships its own reader page (pdf.html) that reflows the PDF's text into real paragraphs, which
 * the normal content script then bolds, rules, focuses and re-fonts like any web page.
 * Pure helpers here; the rendering lives in src/pdf/pdf.ts.
 */
export const VIEWER_PATH = 'pdf.html';

/** Pages a free user can read per PDF; the rest is part of the unlock. */
export const FREE_PAGES = 1;

/** A web address whose path ends in .pdf — the only PDFs the reader can fetch (not file://). */
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

/** The address settings are keyed by: the PDF's own URL when on the reader page, else `href`. */
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

/** Title for the tab: the PDF's metadata title, else its file name. */
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

/** The subset of a PDF.js text item the reflow needs. */
export interface TextRun {
  str: string;
  /** PDF.js transform: [a, b, c, d, x, y]; y grows upwards. */
  transform: number[];
  width: number;
  height: number;
  hasEOL?: boolean;
}

/**
 * Reflows one page's text runs into paragraphs. Runs on the same baseline form a line; a
 * vertical gap wider than the line height, or a line ending well short of the page's text
 * width after sentence punctuation, starts a new paragraph. Hyphenated line breaks are joined.
 */
export function paragraphs(runs: TextRun[]): string[] {
  type Line = { y: number; h: number; x0: number; x1: number; text: string };
  const lines: Line[] = [];
  let cur: Line | null = null;
  for (const r of runs) {
    const str = r.str.replace(/\s+/g, ' ');
    const y = r.transform[5] ?? 0;
    const x = r.transform[4] ?? 0;
    const h = Math.max(r.height || 0, Math.abs(r.transform[3] ?? 0), 1);
    const sameLine = cur !== null && Math.abs(cur.y - y) < h * 0.5;
    if (!sameLine) {
      if (cur && cur.text.trim()) lines.push(cur);
      cur = { y, h, x0: x, x1: x + (r.width || 0), text: '' };
    }
    if (!cur) continue;
    if (str.trim()) {
      const gap = x - cur.x1;
      if (cur.text && !cur.text.endsWith(' ') && !str.startsWith(' ') && gap > h * 0.15) cur.text += ' ';
      cur.text += str;
      cur.x1 = Math.max(cur.x1, x + (r.width || 0));
    } else if (str && cur.text && !cur.text.endsWith(' ')) cur.text += ' ';
    if (r.hasEOL) {
      lines.push(cur);
      cur = null;
    }
  }
  if (cur && cur.text.trim()) lines.push(cur);
  if (lines.length === 0) return [];
  const right = Math.max(...lines.map((l) => l.x1));
  const out: string[] = [];
  let para = '';
  let prev: Line | null = null;
  const flush = (): void => {
    const t = para.replace(/\s+/g, ' ').trim();
    if (t) out.push(t);
    para = '';
  };
  for (const line of lines) {
    const text = line.text.trim();
    if (prev) {
      const gap = prev.y - line.y; // y grows upwards: a lower line has a smaller y
      const bigGap = gap > prev.h * 1.6 || gap < 0;
      const shortEnd = prev.x1 < right - prev.h * 4 && /[.!?:]["')\]]?$/.test(para.trimEnd());
      const heading = prev.h > line.h * 1.2 || line.h > prev.h * 1.2;
      if (bigGap || shortEnd || heading) flush();
    }
    if (para && /[A-Za-z]-$/.test(para) && /^[a-z]/.test(text)) para = para.slice(0, -1) + text;
    else para += (para ? ' ' : '') + text;
    prev = line;
  }
  flush();
  return out;
}
