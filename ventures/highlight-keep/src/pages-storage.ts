import { pageKey, siteOf, type Highlight, type PageRecord } from './core/model.js';

/** Highlights live in chrome.storage.local: `page:<key>` → PageRecord; `index` → summary map. */
export interface IndexEntry {
  title: string;
  site: string;
  count: number;
  updatedAt: string;
}
export type PageIndex = Record<string, IndexEntry>;

const INDEX = 'index';
const keyOf = (url: string): string => `page:${pageKey(url)}`;

export async function loadPage(url: string): Promise<PageRecord> {
  const k = pageKey(url);
  const data = await chrome.storage.local.get(keyOf(k));
  const rec = data[keyOf(k)] as PageRecord | undefined;
  return rec ?? { url: k, title: '', highlights: [], updatedAt: '' };
}

export async function savePage(page: PageRecord): Promise<void> {
  const index = await loadIndex();
  const now = new Date().toISOString();
  const rec = { ...page, updatedAt: now };
  if (rec.highlights.length === 0) {
    delete index[rec.url];
    await chrome.storage.local.remove(keyOf(rec.url));
  } else {
    index[rec.url] = { title: rec.title, site: siteOf(rec.url), count: rec.highlights.length, updatedAt: now };
    await chrome.storage.local.set({ [keyOf(rec.url)]: rec });
  }
  await chrome.storage.local.set({ [INDEX]: index });
}

export async function loadIndex(): Promise<PageIndex> {
  const data = await chrome.storage.local.get(INDEX);
  return (data[INDEX] as PageIndex | undefined) ?? {};
}

export async function loadAllPages(): Promise<PageRecord[]> {
  const index = await loadIndex();
  const keys = Object.keys(index).map(keyOf);
  if (keys.length === 0) return [];
  const data = await chrome.storage.local.get(keys);
  return keys.map((k) => data[k] as PageRecord | undefined).filter((p): p is PageRecord => p !== undefined);
}

export function sitesInIndex(index: PageIndex): Set<string> {
  return new Set(Object.values(index).map((e) => e.site));
}

export async function replaceAll(pages: PageRecord[]): Promise<void> {
  const existing = await loadIndex();
  await chrome.storage.local.remove([...Object.keys(existing).map(keyOf), INDEX]);
  for (const p of pages) await savePage(p);
}

export function upsertHighlight(page: PageRecord, h: Highlight): PageRecord {
  const others = page.highlights.filter((x) => x.id !== h.id);
  return { ...page, highlights: [...others, h].sort((a, b) => a.anchor.start - b.anchor.start) };
}
