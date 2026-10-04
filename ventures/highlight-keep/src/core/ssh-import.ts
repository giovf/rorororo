/**
 * Import of a Super Simple Highlighter backup. Layout read from the extension's source
 * (github.com/dexterouslogic/super-simple-highlighter, js/options/controllers/advanced.js and
 * js/shared/db.js, 2026-10-04): a newline-delimited JSON file (`.ldjson`) whose first line is
 * `{"magic":"Super Simple Highlighter Exported Database","version":1}`, second line the style
 * definitions (`{"highlightDefinitions":[{title,className,style:{"background-color",color}}]|null,
 * "sharedHighlightStyle":…}`), then a PouchDB replication-stream dump: a header line
 * (`{"version","db_type","start_time","db_info"}`) followed by `{"docs":[…]}` lines. Each doc is
 * `{_id,_rev,verb:'create'|'delete',match,date,range,className,text,title,v}` where `match` is the
 * page URL without hash (decodeURI'd), `date` is epoch ms, `range` an XPath range (useless to us —
 * we anchor by the quoted text) and a `delete` doc names its `correspondingDocumentId`.
 */
import { pageKey, type Colour, type Highlight, type PageRecord } from './model.js';

export const SSH_MAGIC = 'Super Simple Highlighter Exported Database';

export interface SshDefinition {
  className?: string;
  title?: string;
  style?: Record<string, string>;
}

interface SshDoc {
  _id?: string;
  verb?: string;
  match?: string;
  date?: number;
  className?: string;
  text?: string;
  title?: string;
  correspondingDocumentId?: string;
}

export interface SshImport {
  pages: PageRecord[];
  /** Highlights carried over. */
  imported: number;
  /** `create` docs the user had deleted again in Super Simple Highlighter. */
  deleted: number;
  /** Docs with no usable text or page url. */
  skipped: number;
}

const DEFAULT_NAMES: Array<[RegExp, Colour]> = [
  [/default-red/, 'pink'],
  [/default-orange/, 'orange'],
  [/default-yellow/, 'yellow'],
  [/default-green/, 'green'],
  [/default-cyan/, 'blue'],
  [/default-purple/, 'purple'],
];

function hueOf(hex: string): { hue: number; sat: number } | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m || !m[1]) return null;
  const s = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
  const r = parseInt(s.slice(0, 2), 16) / 255;
  const g = parseInt(s.slice(2, 4), 16) / 255;
  const b = parseInt(s.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return { hue: 0, sat: 0 };
  let hue: number;
  if (max === r) hue = ((g - b) / d) % 6;
  else if (max === g) hue = (b - r) / d + 2;
  else hue = (r - g) / d + 4;
  hue = (hue * 60 + 360) % 360;
  return { hue, sat: d / max };
}

/** Our nearest colour for a Super Simple Highlighter style: by default class name, else by hue. */
export function colourFor(className: string | undefined, definitions: SshDefinition[]): Colour {
  if (!className) return 'yellow';
  for (const [re, colour] of DEFAULT_NAMES) if (re.test(className)) return colour;
  const def = definitions.find((d) => d.className === className);
  const bg = def?.style?.['background-color'];
  const hs = bg ? hueOf(bg) : null;
  if (!hs || hs.sat < 0.12) return 'yellow';
  const { hue } = hs;
  if (hue < 15 || hue >= 300) return 'pink';
  if (hue < 45) return 'orange';
  if (hue < 75) return 'yellow';
  if (hue < 170) return 'green';
  if (hue < 260) return 'blue';
  return 'purple';
}

function parseLines(text: string): unknown[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l, i) => {
      try {
        return JSON.parse(l) as unknown;
      } catch {
        throw new Error(`line ${i + 1} is not JSON`);
      }
    });
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

/** Parses the backup text into page records keyed like ours; throws when it is not such a file. */
export function parseSuperSimpleBackup(text: string): SshImport {
  const lines = parseLines(text);
  const header = lines[0];
  if (!isRecord(header) || header['magic'] !== SSH_MAGIC) {
    throw new Error('not a Super Simple Highlighter backup (.ldjson from its Options → Advanced page)');
  }
  const defsLine = lines[1];
  const rawDefs = isRecord(defsLine) ? defsLine['highlightDefinitions'] : undefined;
  const definitions: SshDefinition[] = Array.isArray(rawDefs) ? (rawDefs as SshDefinition[]) : [];

  const docs: SshDoc[] = [];
  for (const line of lines.slice(2)) {
    if (!isRecord(line)) continue;
    const d = line['docs'];
    if (Array.isArray(d)) docs.push(...(d as SshDoc[]));
    else if (typeof line['verb'] === 'string') docs.push(line);
  }
  const deletedIds = new Set(docs.filter((d) => d.verb === 'delete' && d.correspondingDocumentId).flatMap((d) => (d.correspondingDocumentId ? [d.correspondingDocumentId] : [])));

  const pages = new Map<string, PageRecord>();
  const seen = new Set<string>();
  let imported = 0;
  let deleted = 0;
  let skipped = 0;
  for (const d of docs) {
    if (d.verb !== 'create' || !d._id || seen.has(d._id)) continue;
    seen.add(d._id);
    if (deletedIds.has(d._id)) {
      deleted++;
      continue;
    }
    const quote = (d.text ?? '').replace(/\s+/g, ' ').trim();
    let url: string;
    try {
      url = pageKey(d.match ?? '');
    } catch {
      skipped++;
      continue;
    }
    if (!quote) {
      skipped++;
      continue;
    }
    const createdAt = typeof d.date === 'number' && Number.isFinite(d.date) ? new Date(d.date).toISOString() : new Date(0).toISOString();
    const h: Highlight = {
      id: `ssh_${d._id}`,
      anchor: { quote, prefix: '', suffix: '', start: 0 },
      colour: colourFor(d.className, definitions),
      createdAt,
    };
    const page = pages.get(url) ?? { url, title: '', highlights: [], updatedAt: '' };
    page.highlights.push(h);
    if (d.title && (!page.title || createdAt > page.updatedAt)) page.title = d.title;
    if (createdAt > page.updatedAt) page.updatedAt = createdAt;
    pages.set(url, page);
    imported++;
  }
  for (const p of pages.values()) {
    p.highlights.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    p.highlights.forEach((h, i) => (h.anchor.start = i));
  }
  return { pages: [...pages.values()], imported, deleted, skipped };
}
