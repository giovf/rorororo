import { describe, expect, it } from 'vitest';
import { parseHypothesisExport } from './hypothesis-import.js';

// Shapes from the Hypothesis client (annotations-exporter.tsx, types/api.ts, read 2026-10-05).
const JSON_FILE = JSON.stringify({
  export_date: '2026-10-05T18:00:00.000Z',
  export_userid: 'acct:me@hypothes.is',
  client_version: '1.1600.0',
  annotations: [
    {
      id: 'AbC123', created: '2026-10-01T10:00:00.000000+00:00', updated: '2026-10-01T10:00:00.000000+00:00', uri: 'https://en.wikipedia.org/wiki/Highlighter#History',
      text: 'Check the source', tags: ['thesis', 'to read'], user: 'acct:me@hypothes.is', document: { title: ['Highlighter - Wikipedia'] },
      target: [{ source: 'https://en.wikipedia.org/wiki/Highlighter', selector: [{ type: 'RangeSelector', startContainer: '/div[1]', endContainer: '/div[1]', startOffset: 0, endOffset: 5 }, { type: 'TextPositionSelector', start: 10, end: 32 }, { type: 'TextQuoteSelector', exact: 'A highlighter  is a\npen', prefix: 'history. ', suffix: ' used' }] }],
    },
    { id: 'Reply1', created: '2026-10-02T10:00:00Z', uri: 'https://en.wikipedia.org/wiki/Highlighter', text: 'a reply', tags: [], references: ['AbC123'], document: { title: 'Highlighter - Wikipedia' }, target: [{ source: 'https://en.wikipedia.org/wiki/Highlighter' }] },
    { id: 'Note1', created: '2026-10-02T11:00:00Z', uri: 'https://en.wikipedia.org/wiki/Highlighter', text: 'a page note', tags: [], document: { title: 'Highlighter - Wikipedia' }, target: [{ source: 'https://en.wikipedia.org/wiki/Highlighter' }] },
    { id: 'H2', created: '2026-09-30T08:00:00Z', uri: 'https://example.com/a/', text: '', tags: [], document: { title: 'Example' }, target: [{ source: 'https://example.com/a/', selector: [{ type: 'TextQuoteSelector', exact: 'plain highlight' }] }] },
    { id: 'H2', created: '2026-09-30T08:00:00Z', uri: 'https://example.com/a/', text: '', tags: [], document: { title: 'Example' }, target: [{ source: 'https://example.com/a/', selector: [{ type: 'TextQuoteSelector', exact: 'plain highlight' }] }] },
    { created: '2026-09-30T08:00:00Z', uri: 'not a url', text: '', tags: [], document: { title: '' }, target: [{ source: 'not a url', selector: [{ type: 'TextQuoteSelector', exact: 'x' }] }] },
  ],
});

const CSV_FILE =
  '\uFEFFCreated at,Author,Page,URL,Group,Type,Quote/description,Comment,Tags\r\n' +
  '2026-10-01 10:00:00,me,,https://en.wikipedia.org/wiki/Highlighter,Public,Annotation,"A highlighter is a pen, ""really""",Check the source,"thesis,to read"\r\n' +
  '2026-10-02 10:00:00,me,,https://en.wikipedia.org/wiki/Highlighter,Public,Reply,A highlighter is a pen,a reply,\r\n' +
  '2026-10-02 11:00:00,me,,https://en.wikipedia.org/wiki/Highlighter,Public,Page note,,a page note,\r\n' +
  '2026-09-30 08:00:00,me,3,https://example.com/a/,Public,Highlight,plain highlight,,\r\n';

describe('parseHypothesisExport', () => {
  it('reads the JSON export: quote selectors, comment as note, tags, title; skips replies and page notes', () => {
    const r = parseHypothesisExport(JSON_FILE);
    expect(r.format).toBe('json');
    expect(r.imported).toBe(2);
    expect(r.skipped).toBe(3);
    expect(r.pages.map((p) => p.url)).toEqual(['https://en.wikipedia.org/wiki/Highlighter', 'https://example.com/a']);
    const wiki = r.pages[0]!;
    expect(wiki.title).toBe('Highlighter - Wikipedia');
    expect(wiki.highlights).toHaveLength(1);
    const h = wiki.highlights[0]!;
    expect(h.id).toBe('hyp_AbC123');
    expect(h.anchor).toEqual({ quote: 'A highlighter is a pen', prefix: 'history. ', suffix: ' used', start: 0 });
    expect(h.note).toBe('Check the source');
    expect(h.tags).toEqual(['thesis', 'to-read']);
    expect(h.colour).toBe('yellow');
    expect(h.createdAt).toBe('2026-10-01T10:00:00.000Z');
    expect(r.pages[1]!.highlights[0]?.note).toBeUndefined();
    expect(r.pages[1]!.highlights[0]?.tags).toBeUndefined();
  });

  it('accepts a bare annotation array and a second import adds nothing new', () => {
    const list = (JSON.parse(JSON_FILE) as { annotations: unknown[] }).annotations;
    const a = parseHypothesisExport(JSON.stringify(list));
    const b = parseHypothesisExport(JSON.stringify(list));
    expect(a.imported).toBe(2);
    expect(b.pages.flatMap((p) => p.highlights.map((h) => h.id))).toEqual(a.pages.flatMap((p) => p.highlights.map((h) => h.id)));
  });

  it('reads the CSV export by its header, skipping Reply and Page note rows', () => {
    const r = parseHypothesisExport(CSV_FILE);
    expect(r.format).toBe('csv');
    expect(r.imported).toBe(2);
    expect(r.skipped).toBe(2);
    const h = r.pages[0]!.highlights[0]!;
    expect(h.anchor.quote).toBe('A highlighter is a pen, "really"');
    expect(h.note).toBe('Check the source');
    expect(h.tags).toEqual(['thesis', 'to-read']);
    expect(h.id).toMatch(/^hyp_[0-9a-f]{16}$/);
    expect(h.createdAt).toBe('2026-10-01T10:00:00.000Z');
    expect(r.pages[1]!.url).toBe('https://example.com/a');
  });

  it('refuses other files with a message that says what to export', () => {
    expect(() => parseHypothesisExport('Title,Note\nx,y\n')).toThrow(/Share → Export.*first line: "Title,Note"/);
    expect(() => parseHypothesisExport('{"version":1,"pages":[]}')).toThrow(/JSON without an "annotations" list/);
    expect(() => parseHypothesisExport('')).toThrow(/not a Hypothesis export/);
  });
});
