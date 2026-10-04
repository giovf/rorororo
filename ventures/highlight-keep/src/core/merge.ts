import type { Highlight, PageRecord } from './model.js';

export interface MergeResult {
  /** Every page after the merge (untouched current pages included). */
  pages: PageRecord[];
  /** Pages whose record changed (new page, or new/updated highlights). */
  changed: PageRecord[];
  /** Highlights that did not exist before. */
  added: number;
}

function newer(a: string, b: string): boolean {
  return a.localeCompare(b) > 0;
}

/**
 * Pure merge of two sets of page records — used by Restore and by every importer so a backup
 * from another machine adds to the store instead of replacing it. Pages are matched by url;
 * highlights are unioned by id, the copy from the more recently updated page winning when both
 * have the same id; the newer page supplies the title. Nothing is ever removed.
 */
export function mergePages(current: PageRecord[], incoming: PageRecord[]): MergeResult {
  const byUrl = new Map(current.map((p) => [p.url, p]));
  const changed: PageRecord[] = [];
  let added = 0;
  for (const inc of incoming) {
    if (!inc || typeof inc.url !== 'string' || !Array.isArray(inc.highlights)) continue;
    const cur = byUrl.get(inc.url);
    if (!cur) {
      const page = { ...inc, title: inc.title ?? '', updatedAt: inc.updatedAt ?? '' };
      byUrl.set(inc.url, page);
      changed.push(page);
      added += inc.highlights.length;
      continue;
    }
    const incWins = newer(inc.updatedAt ?? '', cur.updatedAt ?? '');
    const merged = new Map<string, Highlight>(cur.highlights.map((h) => [h.id, h]));
    let touched = false;
    for (const h of inc.highlights) {
      const have = merged.get(h.id);
      if (!have) {
        merged.set(h.id, h);
        added++;
        touched = true;
      } else if (incWins && JSON.stringify(have) !== JSON.stringify(h)) {
        merged.set(h.id, h);
        touched = true;
      }
    }
    const title = incWins && inc.title ? inc.title : cur.title || inc.title || '';
    if (title !== cur.title) touched = true;
    if (!touched) continue;
    const page: PageRecord = {
      ...cur,
      title,
      highlights: [...merged.values()].sort((a, b) => a.anchor.start - b.anchor.start),
      updatedAt: incWins ? inc.updatedAt : cur.updatedAt,
    };
    byUrl.set(inc.url, page);
    changed.push(page);
  }
  return { pages: [...byUrl.values()], changed, added };
}
