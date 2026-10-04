import { describe, expect, it } from 'vitest';
import { colourFor, parseSuperSimpleBackup, SSH_MAGIC } from './ssh-import.js';

// Shape of a real export: header, style definitions, PouchDB dump header, then `docs` lines
// (js/options/controllers/advanced.js + js/shared/db.js in dexterouslogic/super-simple-highlighter).
const DEFS = {
  highlightDefinitions: [
    { title: 'Red', className: 'default-red-aa94e3d5-ab2f-4205-b74e-18ce31c7c0ce', inherit_style_color: false, style: { 'background-color': '#ff8080', color: '#000000' } },
    { title: 'Mine', className: 'c6e1b0a2-custom', inherit_style_color: false, style: { 'background-color': '#80c0ff', color: '#000000' } },
  ],
  sharedHighlightStyle: null,
};
const doc = (id: string, extra: Record<string, unknown>): Record<string, unknown> => ({
  _id: id,
  _rev: '1-abc',
  verb: 'create',
  match: 'https://en.wikipedia.org/wiki/Highlighter',
  date: 1727700000000 + Number(id.slice(-1)) * 1000,
  range: { startContainerPath: '/html/body/div[1]/p[2]/text()[1]', startOffset: 3, endContainerPath: '/html/body/div[1]/p[2]/text()[1]', endOffset: 20, collapsed: false },
  className: 'default-yellow-aaddcf5c-0e41-4f83-8a64-58c91f7c6250',
  text: 'A highlighter  is a\n pen',
  title: 'Highlighter - Wikipedia',
  v: 4,
  ...extra,
});
const file = (...objects: unknown[]): string => objects.map((o) => JSON.stringify(o)).join('\n') + '\n';
const HEADER = { magic: SSH_MAGIC, version: 1 };
const DUMP_HEADER = { version: '1.2.6', db_type: 'idb', start_time: '2026-10-04T10:00:00.000Z', db_info: { doc_count: 4 } };

describe('parseSuperSimpleBackup', () => {
  it('turns create docs into pages keyed like ours, drops deleted ones, maps colours', () => {
    const text = file(
      HEADER,
      DEFS,
      DUMP_HEADER,
      { docs: [doc('d1', {}), doc('d2', { className: 'default-red-aa94e3d5-ab2f-4205-b74e-18ce31c7c0ce', text: 'second' })] },
      { docs: [doc('d3', { match: 'https://example.com/a/?q=1#frag', className: 'c6e1b0a2-custom', text: 'third', title: 'Example' }), doc('d4', { text: 'gone' }), { _id: 'd5', _rev: '1-x', verb: 'delete', match: 'https://en.wikipedia.org/wiki/Highlighter', date: 1727700009000, correspondingDocumentId: 'd4' }] },
    );
    const r = parseSuperSimpleBackup(text);
    expect(r.imported).toBe(3);
    expect(r.deleted).toBe(1);
    expect(r.skipped).toBe(0);
    expect(r.pages.map((p) => p.url)).toEqual(['https://en.wikipedia.org/wiki/Highlighter', 'https://example.com/a?q=1']);
    const wiki = r.pages[0]!;
    expect(wiki.title).toBe('Highlighter - Wikipedia');
    expect(wiki.highlights.map((h) => h.id)).toEqual(['ssh_d1', 'ssh_d2']);
    expect(wiki.highlights[0]?.anchor.quote).toBe('A highlighter is a pen');
    expect(wiki.highlights[0]?.colour).toBe('yellow');
    expect(wiki.highlights[1]?.colour).toBe('pink');
    expect(wiki.highlights[0]?.createdAt).toBe('2024-09-30T12:40:01.000Z');
    expect(wiki.updatedAt).toBe('2024-09-30T12:40:02.000Z');
    expect(r.pages[1]?.highlights[0]?.colour).toBe('blue'); // custom style by hue
    expect(r.pages[1]?.title).toBe('Example');
  });

  it('skips docs without text or a usable url, and tolerates null definitions', () => {
    const text = file(HEADER, { highlightDefinitions: null, sharedHighlightStyle: null }, DUMP_HEADER, { docs: [doc('e1', { text: '   ' }), doc('e2', { match: 'not a url' }), doc('e3', { className: 'unknown-class' })] });
    const r = parseSuperSimpleBackup(text);
    expect(r.skipped).toBe(2);
    expect(r.imported).toBe(1);
    expect(r.pages[0]?.highlights[0]?.colour).toBe('yellow');
  });

  it('rejects files that are not a Super Simple Highlighter backup', () => {
    expect(() => parseSuperSimpleBackup('{"version":1,"pages":[]}')).toThrow(/not a Super Simple Highlighter backup/);
    expect(() => parseSuperSimpleBackup('nope')).toThrow(/line 1 is not JSON/);
  });

  it('maps styles to our colours by default name first, then by hue', () => {
    expect(colourFor('default-cyan-f88e8827-e652-4d79-a9d9-f6c8b8ec9e2b', [])).toBe('blue');
    expect(colourFor('default-grey-da7cb902-89c6-46fe-b0e7-d3b35aaf237a', [])).toBe('yellow');
    expect(colourFor('x', [{ className: 'x', style: { 'background-color': '#FFAAFF' } }])).toBe('pink');
    expect(colourFor('x', [{ className: 'x', style: { 'background-color': '#AAffAA' } }])).toBe('green');
    expect(colourFor('x', [{ className: 'x', style: { 'background-color': '#ffd2AA' } }])).toBe('orange');
    expect(colourFor('x', [{ className: 'x', style: { 'background-color': '#c0a0ff' } }])).toBe('purple');
    expect(colourFor('x', [{ className: 'x', style: { 'background-color': '#777777' } }])).toBe('yellow');
    expect(colourFor(undefined, [])).toBe('yellow');
  });
});
