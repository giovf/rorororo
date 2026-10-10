import { describe, expect, it } from 'vitest';
import { colourOfCell, detectDelimiter, parseCsv, parseWeavaExport, rowId } from './weava-import.js';

// No sample of Weava's export exists (its knowledge base needs a login — see weava-import.ts), so the
// fixtures exercise the header-driven mapping with the columns its help names (URL, highlight, note)
// plus the ones a dashboard export plausibly adds (folder, title, colour, date), in several spellings.
const FILE =
  '﻿Folder,Resource Title,Resource URL,Highlight,Annotation,Color,Date Created\r\n' +
  'Thesis,Highlighter - Wikipedia,https://en.wikipedia.org/wiki/Highlighter#History,"A highlighter  is a\r\n pen",,Yellow,2024-08-04 13:14\r\n' +
  'Thesis,Highlighter - Wikipedia,https://en.wikipedia.org/wiki/Highlighter,"Said ""fluorescent"", really",Check the source,#80c0ff,2024-08-05T09:00:00Z\r\n' +
  'Thesis / Sources,Example,https://example.com/a/?q=1,third,,,\r\n' +
  ',,https://example.com/a/?q=1,   ,empty quote is skipped,,\r\n' +
  'Thesis,No url,not a url,some words,,,\r\n' +
  'Thesis,Highlighter - Wikipedia,https://en.wikipedia.org/wiki/Highlighter,"Said ""fluorescent"", really",Check the source,#80c0ff,2024-08-05T09:00:00Z\r\n';

describe('parseWeavaExport', () => {
  it('maps columns by header name and turns rows into pages keyed like ours', () => {
    const r = parseWeavaExport(FILE);
    expect(r.columns).toEqual({ url: 'Resource URL', quote: 'Highlight', note: 'Annotation', title: 'Resource Title', folder: 'Folder', colour: 'Color', date: 'Date Created' });
    expect(r.imported).toBe(3);
    expect(r.skipped).toBe(2);
    expect(r.pages.map((p) => p.url)).toEqual(['https://en.wikipedia.org/wiki/Highlighter', 'https://example.com/a?q=1']);
    const wiki = r.pages[0]!;
    expect(wiki.title).toBe('Highlighter - Wikipedia');
    expect(wiki.highlights.map((h) => h.anchor.quote)).toEqual(['A highlighter is a pen', 'Said "fluorescent", really']);
    expect(wiki.highlights[0]?.colour).toBe('yellow');
    expect(wiki.highlights[0]?.note).toBeUndefined();
    expect(wiki.highlights[0]?.tags).toEqual(['Thesis']);
    expect(wiki.highlights[1]?.colour).toBe('blue');
    expect(wiki.highlights[1]?.note).toBe('Check the source');
    expect(wiki.highlights[1]?.createdAt).toBe('2024-08-05T09:00:00.000Z');
    expect(wiki.updatedAt).toBe('2024-08-05T09:00:00.000Z');
    expect(wiki.highlights.map((h) => h.anchor.start)).toEqual([0, 1]);
    expect(r.pages[1]?.highlights[0]?.tags).toEqual(['Thesis-/-Sources']);
    expect(r.pages[1]?.highlights[0]?.createdAt).toBe('1970-01-01T00:00:00.000Z');
    expect(r.pages[1]?.title).toBe('Example');
  });

  it('gives every row a stable id, so importing the same file twice adds nothing', () => {
    const a = parseWeavaExport(FILE);
    const b = parseWeavaExport(FILE);
    expect(a.pages[0]?.highlights.map((h) => h.id)).toEqual(b.pages[0]?.highlights.map((h) => h.id));
    expect(a.pages[0]?.highlights[0]?.id).toMatch(/^weava_[0-9a-f]{16}$/);
    expect(rowId('u', 'q', 'n')).not.toBe(rowId('u', 'q', 'm'));
  });

  it('accepts the minimal two columns in other spellings and other delimiters', () => {
    const r = parseWeavaExport('Link;Highlighted text;Notes\nhttps://a.example/x;first;\nhttps://a.example/x;second;a note\n');
    expect(r.columns).toEqual({ url: 'Link', quote: 'Highlighted text', note: 'Notes' });
    expect(r.imported).toBe(2);
    const t = parseWeavaExport('url\ttext\nhttps://b.example/\tonly\n');
    expect(t.pages[0]?.url).toBe('https://b.example/');
    expect(t.pages[0]?.highlights[0]?.anchor.quote).toBe('only');
    expect(t.pages[0]?.highlights[0]?.colour).toBe('yellow');
  });

  it('refuses a file without the two essential columns, naming the headers it saw', () => {
    expect(() => parseWeavaExport('Title,Note\nx,y\n')).toThrow(/headers seen: "Title", "Note"/);
    expect(() => parseWeavaExport('')).toThrow(/headers seen: none/);
    expect(() => parseWeavaExport('{"version":1,"pages":[]}')).toThrow(/not a Weava \.csv export/);
  });

  it('never lets a colour or title header pose as the text or url column', () => {
    const r = parseWeavaExport('Highlight Color,Page Title,URL,Highlight\nred,T,https://c.example/p,words\n');
    expect(r.columns.quote).toBe('Highlight');
    expect(r.columns.colour).toBe('Highlight Color');
    expect(r.columns.title).toBe('Page Title');
    expect(r.pages[0]?.highlights[0]?.colour).toBe('pink');
  });
});

describe('csv helpers', () => {
  it('reads quoted cells, doubled quotes and newlines inside quotes', () => {
    expect(parseCsv('a,"b,c","d ""e""","f\ng"\r\n1,2,3,4\n', ',')).toEqual([
      ['a', 'b,c', 'd "e"', 'f\ng'],
      ['1', '2', '3', '4'],
    ]);
    expect(parseCsv('\n\n', ',')).toEqual([]);
  });

  it('picks the delimiter that splits the header most', () => {
    expect(detectDelimiter('a,b,c\n')).toBe(',');
    expect(detectDelimiter('a;b;c\n')).toBe(';');
    expect(detectDelimiter('a\tb\tc\n')).toBe('\t');
    expect(detectDelimiter('"a,b";c\n')).toBe(';');
  });

  it('maps colour cells by name, then by hex hue, else yellow', () => {
    expect(colourOfCell('Light Green')).toBe('green');
    expect(colourOfCell('purple')).toBe('purple');
    expect(colourOfCell('#ffaaff')).toBe('pink');
    expect(colourOfCell('#777777')).toBe('yellow');
    expect(colourOfCell('')).toBe('yellow');
    expect(colourOfCell(undefined)).toBe('yellow');
  });
});
