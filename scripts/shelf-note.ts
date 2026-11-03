// Shelf readings only the owner can see (tax-workbook `shelf-stats-owner-note`, 2026-11-01).
//
// Why: RESEARCH §6 of the tax workbook kills the Etsy listing at 0 sales with "≥ 5 listing views a
// day in Shop Manager" and judges the Kindle guide on KDP Reports' copies sold, but nothing could read
// either: Etsy forbids automated reads, the sandbox never opens kdp.amazon.com, and sale mail counts
// sales, not views. So once a month the Monday report's digest line asks the owner for one Telegram
// note — `etsy views 4/day kindle 2 sold` — (`shelfAsk` in scripts/handoffs.ts) and the owner-notes
// poller (scripts/owner-notes.mjs) turns each figure in a note into a row of the RESEARCH §7 Metrics
// table (`Etsy views`, `Kindle sold`) the run it arrives, so the dated reads cite numbers, not guesses.
//
// Node 22 runs .ts directly — keep syntax erasable, import only node builtins.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const RESEARCH_FILE = path.join('ventures', 'tax-workbook', 'RESEARCH.md');
export const METRICS_HEADING = /^## 7\. Metrics\b/;
/** The Kindle guide's listing pack; its `## Status` table takes the book's Amazon page once the owner sends it. */
export const KINDLE_FILE = path.join('ventures', 'tax-workbook', 'KINDLE.md');
export const STATUS_HEADING = /^## Status\b/;

export interface ShelfNote {
  /** Etsy Shop Manager listing views per day. */
  etsyViews?: number;
  /** Copies sold on KDP Reports (all time, as the owner reads it). */
  kindleSold?: number;
  /** The book's ASIN (`B0` + 8), from an Amazon link or `ASIN B0…` in the note (kdp-listing-live, 2026-11-03). */
  asin?: string;
  /** The book's page, normalised to `https://www.amazon.co.uk/dp/<ASIN>`. */
  kindleUrl?: string;
}

const ETSY_RE = /\betsy\b[^\d\n]{0,20}?(\d+(?:[.,]\d+)?)\s*(?:views?\s*)?(?:\/|per|a|each)\s*day/i;
const KINDLE_RE = /\bkindle\b[^\d\n]{0,20}?(\d+)\s*(?:copies\s+|copy\s+)?sold/i;
const KINDLE_ALT_RE = /\bkindle\b[^\d\n]{0,20}?sold\s*:?\s*(\d+)/i;
// The ASIN sits after `/dp/` (also `/gp/product/`) on any Amazon storefront; a bare `ASIN B0…` also counts.
const AMAZON_URL_RE =
  /https?:\/\/(?:[a-z0-9-]+\.)*amazon\.[a-z.]+\/(?:[^\s|)]*?\/)?(?:dp|gp\/product)\/(B0[A-Z0-9]{8})\b/i;
const ASIN_RE = /\bASIN\s*:?\s*(B0[A-Z0-9]{8})\b/i;

const num = (s: string): number => Number(s.replace(',', '.'));

/**
 * The figures a note carries, or undefined when it names neither. Accepts the asked shape
 * (`etsy views 4/day kindle 2 sold`), the §6 shape (`kindle: 2 sold`) and small variations
 * (`Etsy: 12 views a day`, `kindle sold 3`); never a bare number.
 */
export function parseShelfNote(text: string): ShelfNote | undefined {
  const out: ShelfNote = {};
  const etsy = ETSY_RE.exec(text);
  if (etsy?.[1]) out.etsyViews = num(etsy[1]);
  const kindle = KINDLE_RE.exec(text) ?? KINDLE_ALT_RE.exec(text);
  if (kindle?.[1]) out.kindleSold = Number(kindle[1]);
  const asin = (AMAZON_URL_RE.exec(text) ?? ASIN_RE.exec(text))?.[1]?.toUpperCase();
  if (asin) {
    out.asin = asin;
    out.kindleUrl = `https://www.amazon.co.uk/dp/${asin}`;
  }
  return Object.keys(out).length === 0 ? undefined : out;
}

/** The Sales cell of the last row of the §7 table (the running total), or `0` with no rows. */
export function lastSales(md: string): string {
  const rows = metricsRows(md);
  const last = rows.at(-1);
  if (!last) return '0';
  const cells = last.line.split('|').map((c) => c.trim());
  return cells[5] ?? '0';
}

interface Row {
  index: number;
  line: string;
}

/** Every data row (not the header or its rule) of the §7 Metrics table, with its line index. */
export function metricsRows(md: string): Row[] {
  return tableRows(md, METRICS_HEADING);
}

/** The data rows of the first table under the heading, with their line indexes. */
export function tableRows(md: string, heading: RegExp): Row[] {
  const lines = md.split('\n');
  const start = lines.findIndex((l) => heading.test(l));
  if (start < 0) return [];
  const rows: Row[] = [];
  let seenHeader = false;
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i] ?? '';
    if (/^## /.test(line)) break;
    if (!line.startsWith('|')) continue;
    if (!seenHeader) {
      seenHeader = true; // the header row
      continue;
    }
    if (/^\|\s*-{3}/.test(line)) continue; // the rule under the header
    rows.push({ index: i, line });
  }
  return rows;
}

/** `2026-11-30` / `10:12` from a note line stamp (`- 2026-11-30 10:12 | …`). */
export interface NoteLine {
  date: string;
  time: string;
  text: string;
}

const NOTE_LINE = /^- (\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}) \| (.*)$/;

export function parseNoteLine(line: string): NoteLine | undefined {
  const m = NOTE_LINE.exec(line);
  if (!m) return undefined;
  return { date: m[1] ?? '', time: m[2] ?? '', text: m[3] ?? '' };
}

/** The §7 rows a note yields, in the table's column order; `[]` when it carries no figure. */
export function shelfRows(note: NoteLine, sales: string): string[] {
  const parsed = parseShelfNote(note.text);
  if (!parsed) return [];
  const src = `owner note ${note.date} ${note.time}`;
  const rows: string[] = [];
  if (parsed.etsyViews !== undefined) {
    const n = parsed.etsyViews;
    rows.push(
      `| ${note.date} | Etsy views | — | — | ${sales} | ${n} listing view${n === 1 ? '' : 's'} a day in Shop Manager (${src}); §6 kill needs ≥ 5/day with 0 sales |`,
    );
  }
  if (parsed.kindleSold !== undefined) {
    const n = parsed.kindleSold;
    rows.push(
      `| ${note.date} | Kindle sold | — | — | ${sales} | ${n} cop${n === 1 ? 'y' : 'ies'} sold in KDP Reports, all time (${src}); §6 Kindle proof ≥ 10 by day 60 |`,
    );
  }
  return rows;
}

/** The KINDLE.md `## Status` row a note with the book's page yields, or undefined without one. */
export function kindleStatusRow(note: NoteLine): string | undefined {
  const parsed = parseShelfNote(note.text);
  if (!parsed?.kindleUrl) return undefined;
  return `| ${note.date} | Kindle page: ${parsed.kindleUrl} (ASIN ${parsed.asin ?? ''}, owner note ${note.date} ${note.time}); live since 2026-10-31, the §6 proof clock runs from that day |`;
}

/** RESEARCH.md with the rows appended to the §7 table; unchanged when the table is not found. */
export function appendMetricsRows(md: string, rows: readonly string[]): string {
  return appendTableRows(md, METRICS_HEADING, rows);
}

/** The file with the rows appended to the first table under the heading; unchanged when none. */
export function appendTableRows(md: string, heading: RegExp, rows: readonly string[]): string {
  if (rows.length === 0) return md;
  const existing = tableRows(md, heading);
  const last = existing.at(-1);
  if (!last) return md;
  const lines = md.split('\n');
  lines.splice(last.index + 1, 0, ...rows);
  return lines.join('\n');
}

/**
 * Writes a §7 row per figure found in the new note lines and a KINDLE.md Status row for the book's
 * Amazon page; returns the rows written. Never throws on a missing file or table (the poller must
 * never lose a note over this), only on a write error.
 */
export function recordShelfNotes(
  noteLines: readonly string[],
  file = RESEARCH_FILE,
  kindleFile = KINDLE_FILE,
): string[] {
  const notes = noteLines.map(parseNoteLine).filter((n): n is NoteLine => n !== undefined);
  const written: string[] = [];
  if (existsSync(file)) {
    let md = readFileSync(file, 'utf8');
    for (const note of notes) {
      const rows = shelfRows(note, lastSales(md));
      const next = appendMetricsRows(md, rows);
      if (next === md) continue;
      md = next;
      written.push(...rows);
    }
    if (written.length > 0) writeFileSync(file, md);
  }
  if (existsSync(kindleFile)) {
    let md = readFileSync(kindleFile, 'utf8');
    const rows: string[] = [];
    for (const note of notes) {
      const row = kindleStatusRow(note);
      if (!row) continue;
      const next = appendTableRows(md, STATUS_HEADING, [row]);
      if (next === md) continue;
      md = next;
      rows.push(row);
    }
    if (rows.length > 0) {
      writeFileSync(kindleFile, md);
      written.push(...rows);
    }
  }
  return written;
}
