import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { EXAMPLE_EXPECTED, class4, incomeTax } from '../tax.ts';
import { RATES_2026_27 as R } from '../rates.ts';
import { AMY, BOOK, chapters, DATES, LEO, MILES, plainText, PRIYA, SAM, wordCount } from './content.ts';
import { COVER_H, COVER_W, coverSvg, renderCoverPng } from './cover.ts';
import { buildEpub, epubFiles } from './epub.ts';
import { KDP } from './kdp.ts';

/** A small well-formedness check: balanced tags, no stray `&`, no unescaped `<` in text. */
function assertWellFormed(xml: string, name: string): void {
  const body = xml.replace(/<\?xml[^>]*\?>/, '').replace(/<!DOCTYPE[^>]*>/, '');
  const stack: string[] = [];
  const tag = /<(\/?)([A-Za-z][\w:-]*)([^<>]*?)(\/?)>/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = tag.exec(body)) !== null) {
    const text = body.slice(last, m.index);
    expect(text, `${name}: stray < or & in text near "${text.slice(-40)}"`).not.toMatch(/<|&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/);
    last = m.index + m[0].length;
    const [, close, tagName, , selfClose] = m;
    if (close) {
      expect(stack.pop(), `${name}: closing </${tagName}>`).toBe(tagName);
    } else if (!selfClose) {
      stack.push(tagName ?? '');
    }
  }
  expect(stack, `${name}: unclosed tags`).toEqual([]);
}

describe('the Kindle guide text', () => {
  const chs = chapters();

  it('is a complete standalone guide: 17 sections, well over 7,000 words, every section well-formed', () => {
    expect(chs).toHaveLength(17);
    expect(wordCount()).toBeGreaterThan(7_000);
    for (const c of chs) {
      assertWellFormed(`<div>${c.body}</div>`, c.id);
      expect(plainText(c.body).length, c.id).toBeGreaterThan(300);
    }
  });

  it("names the workbook once, in the back matter only, and never redirects the reader for 'the full content' (KDP content quality)", () => {
    const all = chs.map((c) => ({ id: c.id, back: c.backMatter === true, text: plainText(c.body) }));
    const mentions = all.filter((c) => /Tax Workbook/i.test(c.text));
    expect(mentions.map((c) => c.id)).toEqual(['colophon']);
    expect(mentions[0]?.back).toBe(true);
    expect(mentions[0]?.text.match(/Tax Workbook/gi)).toHaveLength(1);
    const joined = all.map((c) => c.text).join(' ');
    expect(joined).not.toMatch(/full content|companion|buy the workbook|download the workbook|visit .* to get/i);
    expect(joined).not.toMatch(/https?:\/\//);
  });

  it('carries the 2026/27 figures from rates.ts in the prose and the tables', () => {
    const joined = chs.map((c) => plainText(c.body)).join(' ');
    for (const s of ['£12,570', '£37,700', '£50,270', '£125,140', '£7,105', '£3.65', '£1,000', '45p', '25p', '24p', '20p', '£50,000', '£30,000', '£20,000', '6%', '2%', '20%', '40%', '45%']) {
      expect(joined, s).toContain(s);
    }
    for (const d of [DATES.register, DATES.onlineReturn, DATES.secondPoa, '7 August 2026', '7 May 2027']) expect(joined, d).toContain(d);
  });

  it('works the examples with the same arithmetic as the workbook', () => {
    expect(SAM.mileage).toBe(EXAMPLE_EXPECTED.mileage);
    expect(SAM.profit).toBe(EXAMPLE_EXPECTED.profit);
    expect(SAM.year.incomeTax).toBe(EXAMPLE_EXPECTED.incomeTax);
    expect(SAM.year.class4).toBe(EXAMPLE_EXPECTED.class4);
    expect(SAM.year.totalDue).toBe(EXAMPLE_EXPECTED.totalDue);
    expect(SAM.year.paymentOnAccountEach).toBe(EXAMPLE_EXPECTED.paymentOnAccountEach);
    expect(PRIYA.year.incomeTax).toBe(incomeTax(58_000, R));
    expect(PRIYA.year.incomeTax).toBe(7_540 + 3_092);
    expect(PRIYA.year.class4).toBe(class4(58_000, R));
    expect(PRIYA.year.class4).toBe(2_262 + 154.6);
    expect(LEO.allowance).toBe(true);
    expect(LEO.profit).toBe(2_400);
    expect(AMY.voluntary).toBe(189.8);
    expect(AMY.tax).toBe(0);
    expect(MILES.claim).toBe(5_100);
    const joined = chs.map((c) => plainText(c.body)).join(' ');
    for (const s of ['£5,025.80', '£2,512.90', '£3,866.00', '£1,159.80', '£31,900.00', '£10,632.00', '£2,416.60', '£2,400.00', '£189.80', '£5,100.00']) {
      expect(joined, s).toContain(s);
    }
  });
});

describe('the EPUB package', () => {
  it('lists every file in the manifest and every manifest item exists, nav and ncx cover all chapters', () => {
    const { text } = epubFiles();
    const opf = text.get('OEBPS/package.opf') ?? '';
    const hrefs = [...opf.matchAll(/<item id="[^"]+" href="([^"]+)"/g)].map((m) => m[1]);
    const ids = [...opf.matchAll(/<item id="([^"]+)"/g)].map((m) => m[1]);
    const idrefs = [...opf.matchAll(/<itemref idref="([^"]+)"/g)].map((m) => m[1]);
    for (const h of hrefs) expect(h === 'cover.jpg' || text.has(`OEBPS/${h}`), h).toBe(true);
    for (const p of text.keys()) if (p.startsWith('OEBPS/') && p !== 'OEBPS/package.opf') expect(hrefs, p).toContain(p.slice('OEBPS/'.length));
    for (const r of idrefs) expect(ids, r).toContain(r);
    expect(opf).toContain('properties="nav"');
    expect(opf).toContain('properties="cover-image"');
    expect(opf).toContain(`<dc:identifier id="pub-id">${BOOK.identifier}</dc:identifier>`);
    const nav = text.get('OEBPS/nav.xhtml') ?? '';
    const ncx = text.get('OEBPS/toc.ncx') ?? '';
    for (const c of chapters()) {
      expect(nav).toContain(`href="${c.id}.xhtml"`);
      expect(ncx).toContain(`src="${c.id}.xhtml"`);
    }
    for (const [p, body] of text) if (p.endsWith('.xhtml') || p.endsWith('.opf') || p.endsWith('.ncx') || p.endsWith('.xml')) assertWellFormed(body, p);
  });

  it('zips with mimetype first and stored, and reads back as a valid archive', async () => {
    const stubJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
    const bytes = await buildEpub(stubJpeg, '2026-10-26T00:00:00Z');
    // Local file header of the first entry: name at offset 30, length 8 = "mimetype", method (offset 8) = 0 (stored).
    expect(Buffer.from(bytes.slice(30, 38)).toString('ascii')).toBe('mimetype');
    expect(bytes[8]).toBe(0);
    expect(bytes[9]).toBe(0);
    const zip = await JSZip.loadAsync(bytes);
    expect(await zip.file('mimetype')?.async('string')).toBe('application/epub+zip');
    expect(zip.file('META-INF/container.xml')).not.toBeNull();
    expect(zip.file('OEBPS/package.opf')).not.toBeNull();
    expect(zip.file('OEBPS/cover.jpg')).not.toBeNull();
    expect(Object.keys(zip.files).filter((f) => f.endsWith('.xhtml')).length).toBe(chapters().length + 4);
  });
});

describe('the cover and the KDP listing', () => {
  it('renders a 1600 × 2560 PNG that names the book and the tax year', () => {
    const svg = coverSvg();
    expect(svg).toContain('UK SOLE TRADER');
    expect(svg).toContain(R.taxYear);
    const png = renderCoverPng();
    expect(Buffer.from(png.slice(0, 8)).toString('hex')).toBe('89504e470d0a1a0a');
    const w = Buffer.from(png.slice(16, 20)).readUInt32BE(0);
    const h = Buffer.from(png.slice(20, 24)).readUInt32BE(0);
    expect([w, h]).toEqual([COVER_W, COVER_H]);
  });

  it('keeps the listing inside KDP form limits: title and subtitle ≤ 200, description ≤ 4,000, seven keywords ≤ 50, two categories', () => {
    expect(KDP.title.length).toBeLessThanOrEqual(200);
    expect(KDP.subtitle.length).toBeLessThanOrEqual(200);
    expect(KDP.description.length).toBeLessThanOrEqual(4_000);
    expect(KDP.description.length).toBeGreaterThan(1_000);
    expect(KDP.keywords).toHaveLength(7);
    for (const k of KDP.keywords) expect(k.length, k).toBeLessThanOrEqual(50);
    expect(new Set(KDP.keywords).size).toBe(7);
    expect(KDP.categories).toHaveLength(2);
    expect(KDP.pricing.listPriceGbp).toBeGreaterThanOrEqual(1.77);
    expect(KDP.pricing.listPriceGbp).toBeLessThanOrEqual(12.99);
    expect(KDP.description).not.toMatch(/only \d+ left|hurry|selling fast|limited time/i);
    expect(KDP.aiDisclosure.text).toMatch(/AI-generated/);
  });
});
