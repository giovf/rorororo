import { describe, expect, it } from 'vitest';
import { locateSpan, sentenceSpans } from './speech.js';

describe('sentenceSpans', () => {
  it('splits a block into trimmed sentences with offsets', () => {
    const text = '  Reading is hard. It asks a lot!  Really?  ';
    const spans = sentenceSpans(text);
    expect(spans.map((s) => s.text)).toEqual(['Reading is hard.', 'It asks a lot!', 'Really?']);
    for (const s of spans) expect(text.slice(s.start, s.end)).toBe(s.text);
  });
  it('drops whitespace-only text', () => {
    expect(sentenceSpans('   \n ')).toEqual([]);
  });
});

describe('locateSpan', () => {
  it('finds the text nodes a span starts and ends in', () => {
    // pieces: "Some words are " | "already emphasised" | " by the author."
    expect(locateSpan([15, 18, 15], 5, 33)).toEqual({ startIndex: 0, startOffset: 5, endIndex: 1, endOffset: 18 });
    expect(locateSpan([15, 18, 15], 34, 48)).toEqual({ startIndex: 2, startOffset: 1, endIndex: 2, endOffset: 15 });
  });
  it('returns null past the end', () => {
    expect(locateSpan([3], 1, 9)).toBeNull();
  });
});
