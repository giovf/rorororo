/** Pure helpers for read-aloud: sentence spans in a block's text and where a span falls across its text nodes. */

export interface Span {
  start: number;
  end: number;
  text: string;
}

/** Sentence spans of a block's text (trimmed; whitespace-only spans dropped). */
export function sentenceSpans(text: string): Span[] {
  const out: Span[] = [];
  const push = (start: number, end: number): void => {
    const raw = text.slice(start, end);
    const lead = raw.length - raw.trimStart().length;
    const trail = raw.length - raw.trimEnd().length;
    if (raw.trim().length === 0) return;
    out.push({ start: start + lead, end: end - trail, text: raw.trim() });
  };
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const seg = new Intl.Segmenter(undefined, { granularity: 'sentence' });
    for (const s of seg.segment(text)) push(s.index, s.index + s.segment.length);
    return out;
  }
  const re = /[^.!?]+[.!?]*\s*/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) push(m.index, m.index + m[0].length);
  return out;
}

export interface Located {
  startIndex: number;
  startOffset: number;
  endIndex: number;
  endOffset: number;
}

/** Maps a [start, end) span over the concatenation of pieces with the given lengths to piece indices + offsets. */
export function locateSpan(lengths: number[], start: number, end: number): Located | null {
  let at = 0;
  let found: Partial<Located> = {};
  for (let i = 0; i < lengths.length; i++) {
    const len = lengths[i] ?? 0;
    if (found.startIndex === undefined && start < at + len) found = { startIndex: i, startOffset: start - at };
    if (found.startIndex !== undefined && end <= at + len) {
      return { ...found, endIndex: i, endOffset: end - at } as Located;
    }
    at += len;
  }
  return null;
}
