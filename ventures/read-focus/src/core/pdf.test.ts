import { describe, expect, it } from 'vitest';
import { documentUrl, isPdfUrl, paragraphs, pdfTitle, viewerUrl, type TextRun } from './pdf.js';

const run = (str: string, x: number, y: number, h = 12, extra: Partial<TextRun> = {}): TextRun => ({
  str,
  transform: [h, 0, 0, h, x, y],
  width: str.length * h * 0.5,
  height: h,
  ...extra,
});

describe('pdf url helpers', () => {
  it('recognises only web PDFs', () => {
    expect(isPdfUrl('https://example.org/a/paper.PDF')).toBe(true);
    expect(isPdfUrl('http://example.org/x.pdf?dl=1')).toBe(true);
    expect(isPdfUrl('file:///home/me/x.pdf')).toBe(false);
    expect(isPdfUrl('https://example.org/x.pdf.html')).toBe(false);
    expect(isPdfUrl('nonsense')).toBe(false);
  });
  it('builds the viewer url and reads the file back out of it', () => {
    const base = 'chrome-extension://abc/';
    const v = viewerUrl(base, 'https://example.org/a b.pdf');
    expect(v).toBe('chrome-extension://abc/pdf.html?file=https%3A%2F%2Fexample.org%2Fa%20b.pdf');
    expect(documentUrl(v)).toBe('https://example.org/a b.pdf');
    expect(documentUrl('https://example.org/page')).toBe('https://example.org/page');
    expect(documentUrl('chrome-extension://abc/pdf.html?file=file:///x.pdf')).toBe('chrome-extension://abc/pdf.html?file=file:///x.pdf');
  });
  it('titles from metadata, else the file name', () => {
    expect(pdfTitle('  A Paper ', 'https://x/y.pdf')).toBe('A Paper');
    expect(pdfTitle('', 'https://x/some%20file.pdf')).toBe('some file.pdf');
  });
});

describe('paragraphs', () => {
  it('joins runs on one baseline and lines in one block', () => {
    const p = paragraphs([
      run('The quick', 72, 700),
      run('brown fox', 140, 700, 12, { hasEOL: true }),
      run('jumps over the lazy dog and keeps going', 72, 686, 12, { hasEOL: true }),
    ]);
    expect(p).toEqual(['The quick brown fox jumps over the lazy dog and keeps going']);
  });
  it('splits on a vertical gap and on a short sentence end', () => {
    const p = paragraphs([
      run('First paragraph line one is fairly long here.', 72, 700, 12, { hasEOL: true }),
      run('It ends here.', 72, 686, 12, { hasEOL: true }),
      run('Second paragraph starts after a short line.', 72, 672, 12, { hasEOL: true }),
      run('Third paragraph after a big gap.', 72, 620, 12, { hasEOL: true }),
    ]);
    expect(p).toEqual([
      'First paragraph line one is fairly long here. It ends here.',
      'Second paragraph starts after a short line.',
      'Third paragraph after a big gap.',
    ]);
  });
  it('keeps a heading apart and joins hyphenated breaks', () => {
    const p = paragraphs([
      run('Chapter One', 72, 720, 24, { hasEOL: true }),
      run('Reading is a well-known pas-', 72, 690, 12, { hasEOL: true }),
      run('time for many people.', 72, 676, 12, { hasEOL: true }),
    ]);
    expect(p).toEqual(['Chapter One', 'Reading is a well-known pastime for many people.']);
  });
  it('ignores empty runs', () => {
    expect(paragraphs([run('', 0, 0), run('   ', 0, 0)])).toEqual([]);
  });
});
