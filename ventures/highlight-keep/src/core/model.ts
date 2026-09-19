import type { Anchor } from './anchor.js';

export type Colour = 'yellow' | 'green' | 'blue' | 'pink' | 'orange' | 'purple';
export const COLOURS: Colour[] = ['yellow', 'green', 'blue', 'pink', 'orange', 'purple'];
export const FREE_COLOURS: Colour[] = ['yellow'];
export const FREE_SITE_LIMIT = 3;

export interface Highlight {
  id: string;
  anchor: Anchor;
  colour: Colour;
  note?: string;
  tags?: string[];
  createdAt: string;
}

export interface PageRecord {
  /** Canonical page key: origin + path + search, no hash, trailing slash trimmed. */
  url: string;
  title: string;
  highlights: Highlight[];
  updatedAt: string;
}

/** Storage layout: one record per page under `pages/<key>`; an index doc lists keys. */
export function pageKey(href: string): string {
  const u = new URL(href);
  u.hash = '';
  const path = u.pathname.replace(/\/+$/, '') || '/';
  return `${u.origin}${path}${u.search}`;
}

export function siteOf(key: string): string {
  return new URL(key).hostname.replace(/^www\./, '');
}

export function newId(): string {
  return `h_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Free tier: highlights may exist on at most FREE_SITE_LIMIT distinct sites. */
export function canAddOnSite(existingSites: Set<string>, site: string, pro: boolean): boolean {
  return pro || existingSites.has(site) || existingSites.size < FREE_SITE_LIMIT;
}

/** Markdown export of one page: title, link, then each highlight as a quote with its note. */
export function toMarkdown(page: PageRecord): string {
  const lines = [`# ${page.title || page.url}`, '', `Source: ${page.url}`, ''];
  for (const h of page.highlights) {
    lines.push(`> ${h.anchor.quote.replace(/\n/g, ' ')}`);
    if (h.note) lines.push('', h.note);
    if (h.tags?.length) lines.push('', h.tags.map((t) => `#${t}`).join(' '));
    lines.push('');
  }
  return lines.join('\n').trimEnd() + '\n';
}
