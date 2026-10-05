/**
 * Import of a Weava dashboard export (.csv). What Weava documents (weavatools.com "How To Export Your
 * Highlights and Notes" and the Weava Manual §8, read through the relay 2026-10-05): the dashboard's
 * export button writes Word, Excel, .csv or .txt — nothing about the columns. Its knowledge-base page
 * on the export (weavatools.atlassian.net/wiki/spaces/WEAV/pages/84967585) redirects to an Atlassian
 * login, its web app could not be fetched, and the two rivals that import the file (web-highlights.com,
 * glasp.co) show only the dashboard steps in their guides. So no sample file exists here and the
 * parser is driven by the header row: it finds the columns by name — the page URL and the highlighted
 * text are required; a note, a title, a folder, a colour and a date are used when present — and
 * refuses any other file naming the headers it saw, so the first real file tells us what to map.
 * The same header-driven reader takes Glasp's CSV export (glasp.co documents CSV/Markdown/JSON but no
 * columns either, blog.glasp.co read through the relay 2026-10-05): a tags/folder cell is split on commas.
 */
import { pageKey, type Colour, type Highlight, type PageRecord } from './model.js';
import { colourOfHex } from './ssh-import.js';

export type WeavaColumn = 'url' | 'quote' | 'note' | 'title' | 'folder' | 'colour' | 'date';

export interface WeavaImport {
  pages: PageRecord[];
  /** Highlights carried over. */
  imported: number;
  /** Rows with no highlight text or no usable page URL. */
  skipped: number;
  /** Header cells as they appeared in the file. */
  headers: string[];
  /** Which header each role was read from. */
  columns: Partial<Record<WeavaColumn, string>>;
}

/** RFC 4180 reader: quoted cells, doubled quotes, newlines inside quotes, CRLF, a BOM. */
export function parseCsv(text: string, delimiter: string): string[][] {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i]!;
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === delimiter) {
      row.push(cell);
      cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim().length > 0));
}

/** The delimiter that splits the header line into the most cells (outside quotes). */
export function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  let best = ',';
  let bestCount = -1;
  for (const d of [',', ';', '\t', '|']) {
    const count = parseCsv(firstLine, d)[0]?.length ?? 0;
    if (count > bestCount) {
      best = d;
      bestCount = count;
    }
  }
  return best;
}

const norm = (h: string): string => h.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** Header patterns per role, most specific first; a header may serve one role only. */
const ROLES: Array<[WeavaColumn, RegExp[]]> = [
  ['url', [/\b(url|link|href)\b/, /^(source|resource|website|web ?page|location)$/, /\b(source|resource)\b/]],
  ['quote', [/\bhighlight(ed)?\b( text)?$/, /^(text|quote|quotation|content|excerpt|snippet|selection)$/, /\b(highlight|quote|text)\b/]],
  ['note', [/\b(note|notes|annotation|annotations|comment|comments|remark)\b/]],
  ['title', [/\btitle\b/, /\b(resource|page|document|website) name\b/, /^name$/]],
  ['folder', [/\b(folder|collection|category|tag|tags|group|project)\b/]],
  ['colour', [/\bcolou?r\b/]],
  ['date', [/\b(date|created|time|timestamp|when|added)\b/]],
];

function mapColumns(headers: string[]): { index: Partial<Record<WeavaColumn, number>>; columns: Partial<Record<WeavaColumn, string>> } {
  const normed = headers.map(norm);
  const taken = new Set<number>();
  const index: Partial<Record<WeavaColumn, number>> = {};
  const columns: Partial<Record<WeavaColumn, string>> = {};
  for (const [role, patterns] of ROLES) {
    for (const re of patterns) {
      const i = normed.findIndex((h, k) => !taken.has(k) && re.test(h) && !(role !== 'colour' && /colou?r/.test(h)) && !(role === 'quote' && /\b(url|link|note|date|title|id)\b/.test(h)));
      if (i >= 0) {
        taken.add(i);
        index[role] = i;
        columns[role] = headers[i]!.trim();
        break;
      }
    }
  }
  return { index, columns };
}

const COLOUR_NAMES: Array<[RegExp, Colour]> = [
  [/yellow|gold|amber/, 'yellow'],
  [/green|lime|teal|mint/, 'green'],
  [/blue|cyan|sky|navy|aqua/, 'blue'],
  [/pink|red|rose|magenta|crimson/, 'pink'],
  [/orange|peach|coral/, 'orange'],
  [/purple|violet|lavender|lilac|indigo/, 'purple'],
];

/** Our nearest colour for a Weava colour cell: by name, else by hex hue, else yellow. */
export function colourOfCell(value: string | undefined): Colour {
  const v = (value ?? '').trim().toLowerCase();
  if (!v) return 'yellow';
  for (const [re, colour] of COLOUR_NAMES) if (re.test(v)) return colour;
  return colourOfHex(v) ?? 'yellow';
}

/** Stable id for a row so a second import of the same file is a no-op (two 32-bit hashes). */
export function rowId(url: string, quote: string, note: string): string {
  const s = `${url}\u0000${quote}\u0000${note}`;
  let fnv = 0x811c9dc5;
  let djb = 5381;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    fnv = Math.imul(fnv ^ c, 0x01000193) >>> 0;
    djb = (Math.imul(djb, 33) + c) >>> 0;
  }
  return `weava_${fnv.toString(16).padStart(8, '0')}${djb.toString(16).padStart(8, '0')}`;
}

function isoDate(value: string | undefined): string {
  const ms = value ? Date.parse(value.trim()) : NaN;
  return Number.isFinite(ms) ? new Date(ms).toISOString() : new Date(0).toISOString();
}

/** Parses the export into page records keyed like ours; throws, naming the headers, when it is not one. */
export function parseWeavaExport(text: string): WeavaImport {
  const delimiter = detectDelimiter(text);
  const rows = parseCsv(text, delimiter);
  const headers = rows[0] ?? [];
  const { index, columns } = mapColumns(headers);
  if (index.url === undefined || index.quote === undefined) {
    const seen = headers.length ? headers.map((h) => `"${h.trim()}"`).join(', ') : 'none';
    throw new Error(
      `not a Weava .csv export we can read — it needs a page-URL column and a highlight-text column; headers seen: ${seen}. ` +
        'In Weava open the dashboard, click the export icon and choose .csv (in Glasp: My Highlights → Export → CSV); if that is the file you picked, send its first line to info@gankdat.com and we will add it.',
    );
  }
  const pages = new Map<string, PageRecord>();
  const seenIds = new Set<string>();
  let imported = 0;
  let skipped = 0;
  const cell = (row: string[], role: WeavaColumn): string | undefined => {
    const i = index[role];
    return i === undefined ? undefined : row[i];
  };
  for (const row of rows.slice(1)) {
    const quote = (cell(row, 'quote') ?? '').replace(/\s+/g, ' ').trim();
    let url: string;
    try {
      url = pageKey((cell(row, 'url') ?? '').trim());
    } catch {
      skipped++;
      continue;
    }
    if (!quote) {
      skipped++;
      continue;
    }
    const note = (cell(row, 'note') ?? '').trim();
    const id = rowId(url, quote, note);
    if (seenIds.has(id)) continue;
    seenIds.add(id);
    const createdAt = isoDate(cell(row, 'date'));
    const tags = (cell(row, 'folder') ?? '').split(/[,;]/).map((t) => t.trim().replace(/\s+/g, '-')).filter(Boolean);
    const h: Highlight = {
      id,
      anchor: { quote, prefix: '', suffix: '', start: 0 },
      colour: colourOfCell(cell(row, 'colour')),
      createdAt,
      ...(note ? { note } : {}),
      ...(tags.length ? { tags } : {}),
    };
    const page = pages.get(url) ?? { url, title: '', highlights: [], updatedAt: '' };
    page.highlights.push(h);
    const title = (cell(row, 'title') ?? '').trim();
    if (title && (!page.title || createdAt > page.updatedAt)) page.title = title;
    if (createdAt > page.updatedAt) page.updatedAt = createdAt;
    pages.set(url, page);
    imported++;
  }
  for (const p of pages.values()) {
    p.highlights.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    p.highlights.forEach((h, i) => (h.anchor.start = i));
  }
  return { pages: [...pages.values()], imported, skipped, headers: headers.map((h) => h.trim()), columns };
}
