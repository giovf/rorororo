/**
 * Text anchoring: describe a selection so it can be found again after the page re-renders,
 * even when surrounding content shifts. The description is the exact quote plus a short
 * prefix/suffix and the quote's character offset in the page text; re-anchoring tries
 * strictest-first. Pure string logic — the DOM mapping lives in the content script.
 */
export interface Anchor {
  quote: string;
  prefix: string;
  suffix: string;
  /** Character offset of the quote in the page's normalised text, at creation time. */
  start: number;
}

export const CONTEXT = 32;

/** Collapses whitespace the way the DOM walk does, so offsets line up. */
export function normalise(text: string): string {
  return text.replace(/\s+/g, ' ');
}

export function describe(pageText: string, start: number, end: number): Anchor {
  const text = normalise(pageText);
  return {
    quote: text.slice(start, end),
    prefix: text.slice(Math.max(0, start - CONTEXT), start),
    suffix: text.slice(end, end + CONTEXT),
    start,
  };
}

export type Match = { start: number; end: number; how: 'exact' | 'quote' | 'nearest' };

/**
 * Finds the anchor in (possibly changed) page text. Strategy order:
 * 1. prefix + quote + suffix exactly; 2. the quote alone, nearest to the original
 * offset when it occurs more than once; 3. null (the highlight is orphaned).
 */
export function locate(pageText: string, anchor: Anchor): Match | null {
  const text = normalise(pageText);
  if (anchor.quote.length === 0) return null;
  const full = anchor.prefix + anchor.quote + anchor.suffix;
  const exact = text.indexOf(full);
  if (exact !== -1 && text.indexOf(full, exact + 1) === -1) {
    const start = exact + anchor.prefix.length;
    return { start, end: start + anchor.quote.length, how: 'exact' };
  }
  const hits: number[] = [];
  for (let i = text.indexOf(anchor.quote); i !== -1; i = text.indexOf(anchor.quote, i + 1)) hits.push(i);
  if (hits.length === 0) return null;
  const best = hits.reduce((a, b) => (Math.abs(b - anchor.start) < Math.abs(a - anchor.start) ? b : a));
  return { start: best, end: best + anchor.quote.length, how: hits.length === 1 && exact === -1 ? 'quote' : 'nearest' };
}
