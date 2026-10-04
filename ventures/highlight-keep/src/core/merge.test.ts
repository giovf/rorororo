import { describe, expect, it } from 'vitest';
import { mergePages } from './merge.js';
import type { Highlight, PageRecord } from './model.js';

const h = (id: string, start = 0, note?: string): Highlight => ({
  id,
  anchor: { quote: `q${id}`, prefix: '', suffix: '', start },
  colour: 'yellow',
  createdAt: '2026-10-01T00:00:00.000Z',
  ...(note ? { note } : {}),
});
const page = (url: string, highlights: Highlight[], updatedAt: string, title = 'T'): PageRecord => ({ url, title, highlights, updatedAt });

describe('mergePages', () => {
  it('adds unknown pages and unions highlights by id, never removing anything', () => {
    const current = [page('https://a.com/x', [h('1'), h('2', 5)], '2026-10-02T00:00:00.000Z')];
    const incoming = [page('https://a.com/x', [h('2', 5), h('3', 2)], '2026-10-01T00:00:00.000Z'), page('https://b.com/', [h('9')], '2026-09-01T00:00:00.000Z')];
    const r = mergePages(current, incoming);
    expect(r.added).toBe(2);
    expect(r.pages).toHaveLength(2);
    expect(r.changed.map((p) => p.url)).toEqual(['https://a.com/x', 'https://b.com/']);
    expect(r.pages[0]?.highlights.map((x) => x.id)).toEqual(['1', '3', '2']);
  });

  it('lets the newer page win on a shared highlight id and on the title, the older one keeps its copy', () => {
    const cur = page('https://a.com/', [h('1', 0, 'old note')], '2026-10-01T00:00:00.000Z', 'Old');
    const newerInc = page('https://a.com/', [h('1', 0, 'new note')], '2026-10-03T00:00:00.000Z', 'New');
    const r1 = mergePages([cur], [newerInc]);
    expect(r1.added).toBe(0);
    expect(r1.pages[0]?.highlights[0]?.note).toBe('new note');
    expect(r1.pages[0]?.title).toBe('New');
    expect(r1.pages[0]?.updatedAt).toBe('2026-10-03T00:00:00.000Z');
    const olderInc = { ...newerInc, updatedAt: '2026-09-01T00:00:00.000Z' };
    const r2 = mergePages([cur], [olderInc]);
    expect(r2.changed).toHaveLength(0);
    expect(r2.pages[0]?.highlights[0]?.note).toBe('old note');
    expect(r2.pages[0]?.title).toBe('Old');
  });

  it('is idempotent and tolerates malformed incoming records', () => {
    const current = [page('https://a.com/', [h('1')], '2026-10-01T00:00:00.000Z')];
    const once = mergePages(current, current);
    expect(once.changed).toHaveLength(0);
    expect(once.added).toBe(0);
    const junk = mergePages(current, [{ url: 42 } as unknown as PageRecord, null as unknown as PageRecord]);
    expect(junk.pages).toEqual(current);
  });
});
