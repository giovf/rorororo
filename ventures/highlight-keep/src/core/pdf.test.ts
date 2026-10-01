import { describe, expect, it } from 'vitest';
import { documentUrl, fitScale, isPdfUrl, pdfTitle, viewerUrl } from './pdf.js';

describe('pdf helpers', () => {
  it('recognises web PDFs only', () => {
    expect(isPdfUrl('https://example.com/papers/a.PDF')).toBe(true);
    expect(isPdfUrl('http://example.com/a.pdf?dl=1#page=2')).toBe(true);
    expect(isPdfUrl('https://example.com/a.pdf.html')).toBe(false);
    expect(isPdfUrl('file:///home/me/a.pdf')).toBe(false);
    expect(isPdfUrl('not a url')).toBe(false);
  });

  it('builds the viewer URL and reads the file back out of it', () => {
    const base = 'chrome-extension://abcdefghijklmnop/';
    const file = 'https://example.com/a b.pdf?x=1';
    const v = viewerUrl(base, file);
    expect(v).toBe('chrome-extension://abcdefghijklmnop/pdf.html?file=https%3A%2F%2Fexample.com%2Fa%20b.pdf%3Fx%3D1');
    expect(documentUrl(v)).toBe(file);
    expect(documentUrl(viewerUrl('moz-extension://uuid', file))).toBe(file);
  });

  it('leaves ordinary pages and malformed viewer URLs alone', () => {
    expect(documentUrl('https://example.com/a.pdf')).toBe('https://example.com/a.pdf');
    expect(documentUrl('chrome-extension://x/library.html')).toBe('chrome-extension://x/library.html');
    expect(documentUrl('chrome-extension://x/pdf.html')).toBe('chrome-extension://x/pdf.html');
    expect(documentUrl('chrome-extension://x/pdf.html?file=file:///etc/a.pdf')).toBe('chrome-extension://x/pdf.html?file=file:///etc/a.pdf');
    expect(documentUrl('garbage')).toBe('garbage');
  });

  it('titles a PDF from its metadata, else its file name', () => {
    expect(pdfTitle('  A Study  ', 'https://e.com/x.pdf')).toBe('A Study');
    expect(pdfTitle('', 'https://e.com/dir/My%20Paper.pdf?dl=1')).toBe('My Paper.pdf');
    expect(pdfTitle(null, 'https://e.com/')).toBe('https://e.com/');
  });

  it('fits a page to the window within bounds', () => {
    expect(fitScale(612, 1280)).toBeCloseTo(920 / 612, 5);
    expect(fitScale(612, 700)).toBeCloseTo(668 / 612, 5);
    expect(fitScale(612, 100)).toBeCloseTo(240 / 612, 5);
    expect(fitScale(10, 5000)).toBe(3);
  });
});
