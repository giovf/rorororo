import { describe, expect, it } from 'vitest';
import { boldLength, hasWords, segment } from './fixation.js';

describe('boldLength', () => {
  it('bolds one letter of short words and a fraction of longer ones', () => {
    expect(boldLength('a', 0.5)).toBe(1);
    expect(boldLength('the', 0.5)).toBe(1);
    expect(boldLength('reading', 0.5)).toBe(4);
    expect(boldLength('reading', 0.3)).toBe(2);
    expect(boldLength('reading', 0.7)).toBe(5);
  });
  it('never bolds a whole long word', () => {
    expect(boldLength('focus', 1)).toBe(4);
    expect(boldLength('a', 0)).toBe(0);
  });
});

describe('segment', () => {
  it('splits into bold/plain runs and preserves everything', () => {
    const text = 'Read faster, stay focused.';
    const segs = segment(text, 0.5);
    expect(segs.map((s) => s.text).join('')).toBe(text);
    expect(segs.filter((s) => s.bold).map((s) => s.text)).toEqual(['Re', 'fas', 'st', 'focu']);
  });
  it('leaves numbers and punctuation alone but handles apostrophes and accents', () => {
    const segs = segment("It's 2026 — café", 0.5);
    expect(segs.filter((s) => s.bold).map((s) => s.text)).toEqual(['It', 'ca']);
    expect(segs.map((s) => s.text).join('')).toBe("It's 2026 — café");
  });
  it('returns a single plain segment for wordless text', () => {
    expect(segment('42 + 7', 0.5)).toEqual([{ text: '42 + 7', bold: false }]);
    expect(hasWords('42 + 7')).toBe(false);
    expect(hasWords('ok')).toBe(true);
  });
});
