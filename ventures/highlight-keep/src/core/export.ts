// File exports of the library: one Markdown file per page for a notes vault (Obsidian, Logseq,
// any folder of .md files) and a CSV in the columns Readwise's bulk import reads. Both are pure
// so they are tested here; the library page only wraps them in a download.
import { siteOf, toMarkdown, type PageRecord } from './model.js';

export interface NamedFile {
  name: string;
  content: string;
}

/** A file-system-safe name from a page title (or its URL), ≤ 80 chars, never empty. */
export function fileNameFor(page: PageRecord): string {
  const fromTitle = page.title
    .replace(/[\\/:*?"<>|#^[\]]+|\p{Cc}+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/, '');
  if (fromTitle) return fromTitle.slice(0, 80).trim();
  const u = new URL(page.url);
  const path = decodeURIComponent(u.pathname).replace(/[^\w\s-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return `${siteOf(page.url)}${path ? ' ' + path : ''}`.slice(0, 80).trim();
}

function yaml(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ')}"`;
}

/** One Markdown document per page: YAML front matter (title, url, dates, count) + the page's Markdown. */
export function markdownFiles(pages: PageRecord[]): NamedFile[] {
  const taken = new Map<string, number>();
  return pages.map((page) => {
    const base = fileNameFor(page);
    const key = base.toLowerCase();
    const n = (taken.get(key) ?? 0) + 1;
    taken.set(key, n);
    const name = `${base}${n > 1 ? ` (${n})` : ''}.md`;
    const created = page.highlights.map((h) => h.createdAt).sort()[0] ?? page.updatedAt;
    const tags = [...new Set(page.highlights.flatMap((h) => h.tags ?? []))];
    const front = [
      '---',
      `title: ${yaml(page.title || page.url)}`,
      `url: ${yaml(page.url)}`,
      `site: ${yaml(siteOf(page.url))}`,
      `created: ${created.slice(0, 10)}`,
      `updated: ${page.updatedAt.slice(0, 10)}`,
      `highlights: ${page.highlights.length}`,
      ...(tags.length ? [`tags: [${tags.map(yaml).join(', ')}]`] : []),
      'source: Highlight Keep',
      '---',
      '',
    ];
    return { name, content: front.join('\n') + toMarkdown(page) };
  });
}

/** Readwise's bulk-import columns (readwise.io/import_bulk, read 2026-10-05): only Highlight is required. */
export const READWISE_COLUMNS = ['Highlight', 'Title', 'Author', 'URL', 'Note', 'Location', 'Date'] as const;

function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** `YYYY-MM-DD HH:MM:SS` in UTC, the form Readwise documents for the Date column. */
export function readwiseDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Readwise-import CSV, one row per highlight. Author is the site (how Readwise labels web articles),
 * Location the highlight's order on its page (an integer, as required), tags ride in Note as
 * Readwise inline tags (`.tag`, which it turns into real tags on import). CRLF line ends, RFC 4180 quoting.
 */
export function readwiseCsv(pages: PageRecord[]): string {
  const rows: string[] = [READWISE_COLUMNS.join(',')];
  for (const page of pages) {
    page.highlights.forEach((h, i) => {
      const inline = (h.tags ?? []).map((t) => `.${t.replace(/\s+/g, '-')}`).join(' ');
      const note = [inline, h.note?.trim() ?? ''].filter(Boolean).join(' ');
      rows.push(
        [h.anchor.quote.replace(/\s+/g, ' ').trim(), page.title || page.url, siteOf(page.url), page.url, note, i + 1, readwiseDate(h.createdAt)]
          .map(csvCell)
          .join(','),
      );
    });
  }
  return rows.join('\r\n') + '\r\n';
}
