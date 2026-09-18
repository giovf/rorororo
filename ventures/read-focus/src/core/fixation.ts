/**
 * Fixation bolding: emphasise the first part of each word so the eye lands on
 * fixation points and glides through the rest. Pure string logic; the DOM
 * walker lives in content.ts.
 */
export type Preset = 'light' | 'medium' | 'heavy';

/** Fraction of each word to bold per preset. */
export const PRESET_STRENGTH: Record<Preset, number> = { light: 0.3, medium: 0.5, heavy: 0.7 };

export interface Segment {
  text: string;
  bold: boolean;
}

const WORD = /[\p{L}\p{M}][\p{L}\p{M}\p{N}'’-]*/gu;

/** How many leading characters of a word to bold at `strength` (0..1). */
export function boldLength(word: string, strength: number): number {
  const s = Math.min(1, Math.max(0, strength));
  const letters = [...word].length;
  if (letters <= 1) return s > 0 ? 1 : 0;
  if (letters <= 3) return 1;
  return Math.max(1, Math.min(letters - 1, Math.round(letters * s)));
}

/** Splits text into alternating bold/plain segments. Numbers, URLs-ish tokens untouched. */
export function segment(text: string, strength: number): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  for (const m of text.matchAll(WORD)) {
    const start = m.index;
    const word = m[0];
    if (start > last) out.push({ text: text.slice(last, start), bold: false });
    const n = boldLength(word, strength);
    const chars = [...word];
    out.push({ text: chars.slice(0, n).join(''), bold: true });
    if (n < chars.length) out.push({ text: chars.slice(n).join(''), bold: false });
    last = start + word.length;
  }
  if (last < text.length) out.push({ text: text.slice(last), bold: false });
  return out;
}

/** True when a text node is worth processing (has at least one word of 2+ letters). */
export function hasWords(text: string): boolean {
  return /[\p{L}]{2,}/u.test(text);
}
