/**
 * Import of a Hypothesis export. Layout read from the Hypothesis client's source
 * (github.com/hypothesis/client, src/sidebar/services/annotations-exporter.tsx and src/types/api.ts,
 * 2026-10-05). Sidebar → Share → Export writes one of:
 *  - JSON: `{export_date, export_userid, client_version, annotations: APIAnnotationData[]}`, each
 *    annotation `{id, created, updated, uri, text (the comment), tags[], user, document:{title},
 *    target:[{source, selector:[{type:'TextQuoteSelector', exact, prefix?, suffix?}, …]}], references?}`;
 *    a reply carries `references`, a page note has no selector — neither has words to anchor to.
 *  - CSV: header `Created at,Author,Page,URL,Group,Type,Quote/description,Comment,Tags`, one row per
 *    annotation; Type is Annotation, Highlight, Reply or Page note.
 * Hypothesis has no colours, so every highlight arrives yellow; tags and the comment come along.
 */
import { pageKey, type Highlight, type PageRecord } from './model.js';
import { detectDelimiter, parseCsv, rowId } from './weava-import.js';

export interface HypothesisImport {
  pages: PageRecord[];
  /** Highlights carried over. */
  imported: number;
  /** Replies and page notes: no quoted words, nothing to anchor. */
  skipped: number;
  format: 'json' | 'csv';
}

interface Annotation {
  id?: string;
  created?: string;
  uri?: string;
  text?: string;
  tags?: string[];
  references?: string[];
  document?: { title?: string | string[] };
  target?: Array<{ source?: string; selector?: Array<{ type?: string; exact?: string; prefix?: string; suffix?: string }> }>;
}

interface Row {
  id: string;
  url: string;
  title: string;
  quote: string;
  prefix: string;
  suffix: string;
  note: string;
  tags: string[];
  createdAt: string;
}

function isoDate(value: string | undefined): string {
  const ms = value ? Date.parse(value.trim()) : NaN;
  return Number.isFinite(ms) ? new Date(ms).toISOString() : new Date(0).toISOString();
}

function rowsFromJson(text: string): Row[] | null {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  const list = Array.isArray(data) ? data : (data as { annotations?: unknown })?.annotations;
  if (!Array.isArray(list)) return null;
  return list.map((raw): Row => {
    const a = raw as Annotation;
    const quoteSel = (a.target ?? []).flatMap((t) => t.selector ?? []).find((s) => s.type === 'TextQuoteSelector' && typeof s.exact === 'string');
    const title = Array.isArray(a.document?.title) ? (a.document.title[0] ?? '') : (a.document?.title ?? '');
    return {
      id: typeof a.id === 'string' && a.id ? `hyp_${a.id}` : '',
      url: a.uri ?? a.target?.[0]?.source ?? '',
      title,
      quote: a.references?.length ? '' : (quoteSel?.exact ?? ''),
      prefix: quoteSel?.prefix ?? '',
      suffix: quoteSel?.suffix ?? '',
      note: a.text ?? '',
      tags: Array.isArray(a.tags) ? a.tags.filter((t): t is string => typeof t === 'string') : [],
      createdAt: isoDate(a.created),
    };
  });
}

function rowsFromCsv(text: string): Row[] | null {
  const rows = parseCsv(text, detectDelimiter(text));
  const header = (rows[0] ?? []).map((h) => h.replace(/^\uFEFF/, '').trim().toLowerCase());
  const col = (name: string): number => header.indexOf(name);
  if (col('url') < 0 || col('quote/description') < 0 || col('type') < 0) return null;
  return rows.slice(1).map((r): Row => {
    const cell = (name: string): string => (col(name) >= 0 ? (r[col(name)] ?? '') : '');
    const type = cell('type').trim().toLowerCase();
    return {
      id: '',
      url: cell('url'),
      title: '',
      quote: type === 'reply' || type === 'page note' ? '' : cell('quote/description'),
      prefix: '',
      suffix: '',
      note: cell('comment'),
      tags: cell('tags').split(',').map((t) => t.trim()).filter(Boolean),
      createdAt: isoDate(cell('created at')),
    };
  });
}

/** Parses a Hypothesis JSON or CSV export into page records keyed like ours; throws when it is neither. */
export function parseHypothesisExport(text: string): HypothesisImport {
  const trimmed = text.trimStart();
  const json = trimmed.startsWith('{') || trimmed.startsWith('[') ? rowsFromJson(trimmed) : null;
  const rows = json ?? rowsFromCsv(text);
  if (!rows) {
    throw new Error(
      'not a Hypothesis export we can read — in the Hypothesis sidebar choose Share → Export and pick JSON (or CSV); ' +
        `this file is neither (${trimmed.slice(0, 1).match(/[{[]/) ? 'JSON without an "annotations" list' : `first line: "${text.split(/\r?\n/)[0]?.slice(0, 80) ?? ''}"`}). ` +
        'If that is the file you picked, send its first lines to info@gankdat.com and we will add it.',
    );
  }
  const pages = new Map<string, PageRecord>();
  const seen = new Set<string>();
  let imported = 0;
  let skipped = 0;
  for (const r of rows) {
    const quote = r.quote.replace(/\s+/g, ' ').trim();
    let url: string;
    try {
      url = pageKey(r.url.trim());
    } catch {
      skipped++;
      continue;
    }
    if (!quote) {
      skipped++;
      continue;
    }
    const note = r.note.trim();
    const id = r.id || rowId(url, quote, note).replace(/^weava_/, 'hyp_');
    if (seen.has(id)) continue;
    seen.add(id);
    const h: Highlight = {
      id,
      anchor: { quote, prefix: r.prefix, suffix: r.suffix, start: 0 },
      colour: 'yellow',
      createdAt: r.createdAt,
      ...(note ? { note } : {}),
      ...(r.tags.length ? { tags: r.tags.map((t) => t.replace(/\s+/g, '-')) } : {}),
    };
    const page = pages.get(url) ?? { url, title: '', highlights: [], updatedAt: '' };
    page.highlights.push(h);
    const title = r.title.trim();
    if (title && (!page.title || r.createdAt > page.updatedAt)) page.title = title;
    if (r.createdAt > page.updatedAt) page.updatedAt = r.createdAt;
    pages.set(url, page);
    imported++;
  }
  return { pages: [...pages.values()], imported, skipped, format: json ? 'json' : 'csv' };
}
