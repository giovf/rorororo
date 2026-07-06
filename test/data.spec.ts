import { SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import type { ErrorEnvelope, SuccessEnvelope } from '../src/lib/envelope';
import type { DemoRecord } from '../src/sources/demo';

type SourceListing = {
  slug: string;
  title: string;
  supported_params: string[];
  credit_cost: number;
};

describe('GET /v1/data (sources listing)', () => {
  it('lists registered sources with their supported params', async () => {
    const res = await SELF.fetch('https://example.com/v1/data');
    expect(res.status).toBe(200);
    const body = (await res.json()) as SuccessEnvelope<SourceListing[]>;
    const demo = body.data.find((s) => s.slug === 'demo');
    expect(demo).toBeDefined();
    expect(demo?.supported_params).toEqual(
      expect.arrayContaining(['name', 'category', 'score', 'active']),
    );
    expect(demo?.credit_cost).toBe(1);
  });
});

describe('GET /v1/data/:source', () => {
  it('returns records with pagination meta', async () => {
    const res = await SELF.fetch('https://example.com/v1/data/demo');
    expect(res.status).toBe(200);
    const body = (await res.json()) as SuccessEnvelope<DemoRecord[]>;
    expect(body.data.length).toBe(5);
    expect(body.meta).toMatchObject({ source: 'demo', page: 1, per_page: 25, total: 5 });
  });

  it('applies declared filters and paginates', async () => {
    const res = await SELF.fetch(
      'https://example.com/v1/data/demo?category=residential&per_page=1&page=2',
    );
    const body = (await res.json()) as SuccessEnvelope<DemoRecord[]>;
    expect(body.data.map((r) => r.id)).toEqual(['r5']);
    expect(body.meta).toMatchObject({ page: 2, per_page: 1, total: 2 });
  });

  it('rejects invalid query params with a detailed 400 envelope', async () => {
    const res = await SELF.fetch('https://example.com/v1/data/demo?per_page=1000');
    expect(res.status).toBe(400);
    const body = (await res.json()) as ErrorEnvelope;
    expect(body.error.code).toBe('bad_request');
    expect(body.error.details).toEqual([
      expect.objectContaining({ param: 'per_page' }),
    ]);
  });

  it('returns the 404 envelope for unknown sources', async () => {
    const res = await SELF.fetch('https://example.com/v1/data/uk-unicorns');
    expect(res.status).toBe(404);
    const body = (await res.json()) as ErrorEnvelope;
    expect(body.error.code).toBe('not_found');
    expect(body.error.message).toContain('uk-unicorns');
  });
});
