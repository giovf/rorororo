import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { queryD1Source, refreshD1Source } from '../src/sources/d1store';
import { readSourceStats } from '../src/sources/cache';
import { computeStats } from '../src/lib/stats';
import { applyQuery, buildQuerySchema } from '../src/sources/query';
import type { DataSource } from '../src/sources/types';

// Semantics parity: a D1-backed source must answer every query exactly like
// the KV path's applyQuery — including non-ASCII case folding (record_lc is
// JS-lowercased at ingest) and boolean params (strict equality).

const RECORDS = [
  {
    name: 'Alpha Corp',
    classification: 'Firm',
    country: 'USA',
    amount: 100,
    listed_on: '2026-01-05',
    flagged: true,
  },
  {
    name: 'beta LLC',
    classification: 'Firm',
    country: 'GBR',
    amount: 250,
    listed_on: '2026-02-10',
    flagged: false,
  },
  {
    name: 'Charlie Person',
    classification: 'Individual',
    country: 'USA',
    amount: null,
    listed_on: '2026-02-20',
    flagged: false,
  },
  {
    name: 'Delta Vessel',
    classification: 'Vessel',
    country: 'PAN',
    amount: 75,
    listed_on: null,
    flagged: true,
  },
  {
    name: 'Epsilon Firm',
    classification: 'Firm',
    country: 'ESP',
    amount: 300,
    listed_on: '2026-03-01',
    flagged: false,
  },
  // Accented name (item 10): uppercase non-ASCII must fold like JS toLowerCase.
  {
    name: 'José Müller SL',
    classification: 'Individual',
    country: 'ESP',
    amount: 500,
    listed_on: '2026-04-01',
    flagged: true,
  },
];

function makeSource(slug: string, records: unknown[] = RECORDS): DataSource {
  return {
    slug,
    title: 'D1 test source',
    description: 'test-only',
    storage: 'd1',
    recordSchema: z.looseObject({}),
    queryParams: z.object({
      name: z.string().optional(),
      classification: z.string().optional(),
      country: z.string().optional(),
      amount_min: z.coerce.number().optional(),
      amount_max: z.coerce.number().optional(),
      listed_on_after: z.iso.date().optional(),
      listed_on_before: z.iso.date().optional(),
      // Boolean param (item 11): parsed to a real boolean so both engines
      // compare strictly. z.coerce.boolean would make "false" truthy.
      flagged: z
        .enum(['true', 'false'])
        .transform((v) => v === 'true')
        .optional(),
    }),
    stats: {
      date: { field: 'listed_on', title: 'Listed by month' },
      groupBy: [{ field: 'classification', title: 'By classification' }],
    },
    refresh: { cron: '0 5 * * *', cacheTtlSeconds: 60 },
    fetchFresh: () => Promise.resolve(records),
  };
}

const QUERIES: Record<string, string>[] = [
  {},
  { name: 'alpha' },
  { name: 'ALPHA' },
  { classification: 'firm' },
  { q: 'usa' },
  { q: 'person' },
  { amount_min: '100' },
  { amount_max: '100' },
  { amount_min: '80', amount_max: '260' },
  { listed_on_after: '2026-02-01' },
  { listed_on_before: '2026-02-10' },
  { listed_on_after: '2026-02-10', listed_on_before: '2026-02-20' },
  { classification: 'Firm', amount_min: '200' },
  { name: 'josé' }, // accented, lowercase needle vs uppercase-É record (item 10)
  { name: 'MÜLLER' }, // uppercase non-ASCII needle
  { flagged: 'true' }, // boolean param parity (item 11)
  { flagged: 'false' },
  { per_page: '2' },
  { per_page: '2', page: '2' },
  { per_page: '2', page: '3' },
  { name: 'zzz-no-match' },
];

describe('d1store', () => {
  it('answers every query with the same result as applyQuery (parity)', async () => {
    const source = makeSource('d1-parity');
    await refreshD1Source(env, source);
    const schema = buildQuerySchema(source);
    for (const raw of QUERIES) {
      const parsed = schema.parse(raw);
      const viaJs = applyQuery(RECORDS, parsed);
      const viaSql = await queryD1Source(env, source, parsed);
      expect(viaSql.page, JSON.stringify(raw)).toEqual(viaJs);
    }
  });

  it('flips generations atomically and drops old rows', async () => {
    const source = makeSource('d1-swap');
    await refreshD1Source(env, source);
    const smaller = RECORDS.slice(0, 2);
    await refreshD1Source(env, { ...source, fetchFresh: () => Promise.resolve(smaller) });

    const parsed = buildQuerySchema(source).parse({});
    const result = await queryD1Source(env, source, parsed);
    expect(result.page.total).toBe(2);

    const rows = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM source_records WHERE source_slug = 'd1-swap'",
    ).first<{ n: number }>();
    expect(rows?.n).toBe(2);
  });

  it('keeps the previous generation when a refresh returns 0 records', async () => {
    const source = makeSource('d1-empty');
    await refreshD1Source(env, source);
    await expect(
      refreshD1Source(env, { ...source, fetchFresh: () => Promise.resolve([]) }),
    ).rejects.toThrow('0 records');

    const parsed = buildQuerySchema(source).parse({});
    const result = await queryD1Source(env, source, parsed);
    expect(result.page.total).toBe(RECORDS.length);
  });

  it('precomputes stats at refresh matching the JS aggregation', async () => {
    const source = makeSource('d1-stats');
    await refreshD1Source(env, source);
    // Stats are computed once at refresh and cached in KV; /stats reads this.
    const cached = await readSourceStats(env, 'd1-stats');
    expect(cached).not.toBeNull();
    // Ties in group counts have no canonical order in the JS engine (insertion
    // order); normalize both sides to (count desc, value asc) before comparing.
    const canonical = (
      stats: ReturnType<typeof computeStats>,
    ): ReturnType<typeof computeStats> => ({
      ...stats,
      groups: stats.groups.map((group) => ({
        ...group,
        rows: [...group.rows].sort((a, b) => b.count - a.count || a.value.localeCompare(b.value)),
      })),
    });
    expect(canonical(cached!.stats)).toEqual(canonical(computeStats(RECORDS, source.stats)));
  });

  it('does not refresh on query when the source is not loaded (503 path)', async () => {
    const source = makeSource('d1-cold');
    const parsed = buildQuerySchema(source).parse({});
    // No prior refresh → no meta row → must throw, never trigger a cold-start.
    await expect(queryD1Source(env, source, parsed)).rejects.toThrow(/not been loaded/);
  });

  it('self-heals after a mid-refresh crash left orphan rows at the target generation', async () => {
    const source = makeSource('d1-orphan');
    await refreshD1Source(env, source); // generation 1 committed

    // Simulate a crash after partial insert at generation 2: meta stays at 1,
    // orphan rows linger at generation 2.
    await env.DB.prepare(
      "INSERT INTO source_records (source_slug, generation, seq, search, record) VALUES ('d1-orphan', 2, 0, 'orphan', '{}')",
    ).run();

    // Next refresh recomputes generation 2 and must sweep the orphan first
    // (else a PK collision would throw and wedge the dataset forever).
    await refreshD1Source(env, source);
    const parsed = buildQuerySchema(source).parse({});
    const result = await queryD1Source(env, source, parsed);
    expect(result.page.total).toBe(RECORDS.length);
  });
});
