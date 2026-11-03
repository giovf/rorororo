import { describe, expect, it } from 'vitest';
import { chapters } from './content.ts';
import {
  BLEED,
  coverSize,
  interiorHtml,
  PAGE_RANGE,
  pdfPageCount,
  SPINE_PER_PAGE,
  TRIM,
  wrapCoverSvg,
} from './paperback.ts';

describe('paperback (kdp-paperback-edition)', () => {
  it('sizes the wrap cover from the page count the KDP way', () => {
    const c = coverSize(49);
    expect(c.spine).toBeCloseTo(49 * SPINE_PER_PAGE, 4);
    expect(c.width).toBeCloseTo(BLEED + TRIM.w + c.spine + TRIM.w + BLEED, 4);
    expect(c.height).toBeCloseTo(9.25, 4);
    expect(coverSize(100).width).toBeGreaterThan(c.width);
  });

  it('counts pages of a PDF from its page objects, not the page tree', () => {
    const pdf =
      '%PDF-1.4\n1 0 obj << /Type /Pages /Kids [2 0 R 3 0 R] >> endobj\n2 0 obj << /Type /Page >> endobj\n3 0 obj <</Type/Page>> endobj\n';
    expect(pdfPageCount(new TextEncoder().encode(pdf))).toBe(2);
    expect(PAGE_RANGE.min).toBeLessThan(PAGE_RANGE.max);
  });

  it('prints every chapter on its own page after the title, copyright and contents', () => {
    const html = interiorHtml();
    const chs = chapters();
    expect(html).toContain('@page { size: 6in 9in; }');
    expect(html.match(/<section class="chapter">/g)).toHaveLength(chs.length);
    for (const c of chs) expect(html).toContain(c.body.slice(0, 60));
    expect(html).toContain('<section class="front copyright">');
    expect(html).toContain('<ul class="toc">');
    expect(html).toContain('Paperback edition');
  });

  it('draws the wrap cover at the computed size with the front panel on the right and no spine text', () => {
    const svg = wrapCoverSvg(49);
    const { width, height, spine } = coverSize(49);
    expect(svg).toContain(`width="${width}in" height="${height}in"`);
    const frontX = Math.round((BLEED + TRIM.w + spine) * 72 * 100) / 100;
    expect(svg).toContain(`<svg x="${frontX}"`);
    expect(svg).toContain('UK SOLE TRADER');
    expect(svg).toContain('Not tax advice');
    expect((svg.match(/<svg\b/g) ?? []).length).toBe(2);
  });
});
