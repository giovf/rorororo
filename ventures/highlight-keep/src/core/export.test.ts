import { describe, expect, it } from 'vitest';
import { fileNameFor, markdownFiles, readwiseCsv, readwiseDate } from './export.js';
import type { PageRecord } from './model.js';

const anchor = (quote: string): PageRecord['highlights'][number]['anchor'] => ({ quote, prefix: "", suffix: "", start: 0 });
const wiki: PageRecord = {
  url: 'https://en.wikipedia.org/wiki/Highlighter',
  title: 'Highlighter - Wikipedia: "pens" / markers?',
  updatedAt: '2026-10-05T18:00:00.000Z',
  highlights: [
    { id: 'h1', anchor: anchor('A highlighter is a\n pen'), colour: 'yellow', createdAt: '2026-10-04T09:30:15.000Z' },
    { id: 'h2', anchor: anchor('Said "fluorescent", really'), colour: 'blue', note: 'Check the source', tags: ['thesis', 'to read'], createdAt: '2026-10-03T23:59:59.000Z' },
  ],
};
const untitled: PageRecord = { url: 'https://example.com/a/b?q=1', title: '', updatedAt: '2026-10-05T00:00:00.000Z', highlights: [{ id: 'h3', anchor: anchor('third'), colour: 'green', createdAt: 'not a date' }] };

describe('fileNameFor', () => {
  it('strips what file systems and Obsidian reject, falls back to site + path', () => {
    expect(fileNameFor(wiki)).toBe('Highlighter - Wikipedia pens markers');
    expect(fileNameFor(untitled)).toBe('example.com a b');
    expect(fileNameFor({ ...untitled, title: 'x'.repeat(100) }).length).toBe(80);
    expect(fileNameFor({ ...untitled, title: '...' })).toBe('example.com a b');
  });
});

describe('markdownFiles', () => {
  it('writes front matter then the page Markdown, one file per page, unique names', () => {
    const files = markdownFiles([wiki, untitled, { ...wiki, highlights: [] }]);
    expect(files.map((f) => f.name)).toEqual(['Highlighter - Wikipedia pens markers.md', 'example.com a b.md', 'Highlighter - Wikipedia pens markers (2).md']);
    const md = files[0]!.content;
    expect(md.slice(0, 230)).toBe(('---\ntitle: "Highlighter - Wikipedia: \\"pens\\" / markers?"\nurl: "https://en.wikipedia.org/wiki/Highlighter"\nsite: "en.wikipedia.org"\ncreated: 2026-10-03\nupdated: 2026-10-05\nhighlights: 2\ntags: ["thesis", "to read"]\nsource: Highlight Keep\n---\n\n# Highlighter').slice(0, 230));
    expect(md).toContain('> A highlighter is a  pen');
    expect(md).toContain('\nCheck the source\n');
    expect(md).toContain('#thesis #to read');
    expect(files[1]!.content).toContain('title: "https://example.com/a/b?q=1"');
    expect(files[1]!.content).not.toContain('tags:');
    expect(files[2]!.content).toContain('created: 2026-10-05');
  });
});

describe('readwiseCsv', () => {
  it('uses the documented header, one row per highlight, quoting, inline tags, UTC dates', () => {
    const csv = readwiseCsv([wiki, untitled]);
    const lines = csv.split('\r\n');
    expect(lines[0]).toBe('Highlight,Title,Author,URL,Note,Location,Date');
    expect(lines[1]).toBe('A highlighter is a pen,"Highlighter - Wikipedia: ""pens"" / markers?",en.wikipedia.org,https://en.wikipedia.org/wiki/Highlighter,,1,2026-10-04 09:30:15');
    expect(lines[2]).toBe('"Said ""fluorescent"", really","Highlighter - Wikipedia: ""pens"" / markers?",en.wikipedia.org,https://en.wikipedia.org/wiki/Highlighter,.thesis .to-read Check the source,2,2026-10-03 23:59:59');
    expect(lines[3]).toBe('third,https://example.com/a/b?q=1,example.com,https://example.com/a/b?q=1,,1,');
    expect(lines[4]).toBe('');
    expect(lines).toHaveLength(5);
  });
  it('formats dates the way Readwise reads them', () => {
    expect(readwiseDate('2026-10-05T18:11:49.123Z')).toBe('2026-10-05 18:11:49');
    expect(readwiseDate('')).toBe('');
  });
});
