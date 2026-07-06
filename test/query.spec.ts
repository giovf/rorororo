import { describe, expect, it } from 'vitest';
import { demoSource } from '../src/sources/demo';
import { applyQuery, buildQuerySchema } from '../src/sources/query';
import { getSource, listSources } from '../src/sources/registry';

const RECORDS = [
  { id: 'r1', name: 'Alpha Works', category: 'industrial', score: 82, active: true },
  { id: 'r2', name: 'Beta House', category: 'residential', score: 67, active: true },
  { id: 'r3', name: 'Gamma Yard', category: 'industrial', score: 45, active: false },
];

function parseQuery(query: Record<string, string>): Record<string, unknown> {
  const result = buildQuerySchema(demoSource).safeParse(query);
  if (!result.success) throw new Error(`unexpected parse failure: ${result.error.message}`);
  return result.data;
}

describe('registry', () => {
  it('looks up sources by slug and lists them', () => {
    expect(getSource('demo')?.slug).toBe('demo');
    expect(getSource('nope')).toBeUndefined();
    expect(listSources().map((s) => s.slug)).toContain('demo');
  });
});

describe('buildQuerySchema', () => {
  it('applies pagination defaults and source filters', () => {
    const parsed = parseQuery({ category: 'industrial' });
    expect(parsed).toMatchObject({ page: 1, per_page: 25, category: 'industrial' });
  });

  it('rejects out-of-bounds pagination', () => {
    const schema = buildQuerySchema(demoSource);
    expect(schema.safeParse({ per_page: '1000' }).success).toBe(false);
    expect(schema.safeParse({ page: '0' }).success).toBe(false);
    expect(schema.safeParse({ page: '2.5' }).success).toBe(false);
  });

  it('coerces typed filters from query strings', () => {
    const parsed = parseQuery({ score: '82', active: 'true' });
    expect(parsed.score).toBe(82);
    expect(parsed.active).toBe(true);
  });
});

describe('applyQuery', () => {
  it('matches string filters as case-insensitive substrings', () => {
    const result = applyQuery(RECORDS, parseQuery({ name: 'alpha' }));
    expect(result.records.map((r) => r.id)).toEqual(['r1']);
  });

  it('matches non-string filters by strict equality', () => {
    expect(applyQuery(RECORDS, parseQuery({ score: '67' })).records.map((r) => r.id)).toEqual([
      'r2',
    ]);
    expect(applyQuery(RECORDS, parseQuery({ active: 'false' })).records.map((r) => r.id)).toEqual([
      'r3',
    ]);
  });

  it('combines filters with AND semantics', () => {
    const result = applyQuery(RECORDS, parseQuery({ category: 'industrial', active: 'true' }));
    expect(result.records.map((r) => r.id)).toEqual(['r1']);
  });

  it('paginates after filtering and reports the filtered total', () => {
    const result = applyQuery(RECORDS, { page: 2, per_page: 1, category: 'industrial' });
    expect(result).toMatchObject({ page: 2, perPage: 1, total: 2 });
    expect(result.records.map((r) => (r as { id: string }).id)).toEqual(['r3']);
  });

  it('returns an empty page beyond the last record without erroring', () => {
    const result = applyQuery(RECORDS, { page: 99, per_page: 25 });
    expect(result.records).toEqual([]);
    expect(result.total).toBe(3);
  });
});
