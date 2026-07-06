import {
  createExecutionContext,
  createScheduledController,
  env,
  SELF,
  waitOnExecutionContext,
} from 'cloudflare:test';
import { afterEach, describe, expect, it, vi } from 'vitest';
import worker from '../src/index';
import type { ErrorEnvelope, SuccessEnvelope } from '../src/lib/envelope';
import { refreshSource } from '../src/sources/cache';
import type { DataSource } from '../src/sources/types';
import type { UkPlanningRecord } from '../src/sources/uk-planning';

// Raw origin entities, including personal-data fields that Blind Mode must drop.
const ORIGIN_ENTITIES = [
  {
    entity: 1,
    reference: 'A/1',
    'organisation-entity': 109,
    description: 'Rear extension to dwelling',
    'decision-date': '2023-05-09',
    'entry-date': '2025-05-30',
    'start-date': '2023-01-12',
    'end-date': '',
    point: 'POINT (-0.75 52.04)',
    'applicant-name': 'John Smith',
    'agent-email': 'agent@example.com',
  },
  {
    entity: 2,
    reference: 'B/2',
    'organisation-entity': 222,
    description: 'Solar panel installation',
    'decision-date': '2024-06-30',
    'entry-date': '2025-06-14',
    'start-date': '2024-03-21',
    'end-date': '',
    point: '',
  },
];

// Tests run in the same isolate as the worker under test, so stubbing the
// global fetch intercepts the worker's outbound origin calls (bindings like
// KV/D1 are unaffected — they don't go through global fetch).
function mockOrigin(handler: () => Response): ReturnType<typeof vi.fn> {
  const mock = vi.fn((input: RequestInfo | URL) => {
    const url = String(input instanceof Request ? input.url : input);
    if (!url.startsWith('https://www.planning.data.gov.uk/entity.json')) {
      throw new Error(`unexpected outbound fetch in test: ${url}`);
    }
    return Promise.resolve(handler());
  });
  vi.stubGlobal('fetch', mock);
  return mock;
}

function originPage(): Response {
  return Response.json({ entities: ORIGIN_ENTITIES, links: {}, count: ORIGIN_ENTITIES.length });
}

function originFailure(): Response {
  return new Response('origin exploded', { status: 500 });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('GET /v1/data/uk-planning', () => {
  it('serves normalized records and never exposes personal data (Blind Mode)', async () => {
    mockOrigin(originPage);
    const res = await SELF.fetch('https://example.com/v1/data/uk-planning');
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).not.toContain('John Smith');
    expect(text).not.toContain('agent@example.com');
    const body = JSON.parse(text) as SuccessEnvelope<UkPlanningRecord[]>;
    expect(body.data).toHaveLength(2);
    expect(body.data[0]).toEqual({
      entity: 1,
      reference: 'A/1',
      authority: 109,
      description: 'Rear extension to dwelling',
      decision_date: '2023-05-09',
      entry_date: '2025-05-30',
      start_date: '2023-01-12',
      end_date: null,
      point: 'POINT (-0.75 52.04)',
    });
    expect(body.meta?.last_refreshed_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('writes an ok row to refresh_log and caches into KV', async () => {
    mockOrigin(originPage);
    await SELF.fetch('https://example.com/v1/data/uk-planning');
    const cached = await env.CACHE.get('data:uk-planning', 'json');
    expect(cached).not.toBeNull();
    const rows = await env.DB.prepare(
      "SELECT source_slug, status, records FROM refresh_log WHERE source_slug = 'uk-planning'",
    ).all();
    expect(rows.results).toEqual([{ source_slug: 'uk-planning', status: 'ok', records: 2 }]);
  });

  it('serves the second request from cache without hitting the origin', async () => {
    const mock = mockOrigin(originPage);
    await SELF.fetch('https://example.com/v1/data/uk-planning');
    const res = await SELF.fetch('https://example.com/v1/data/uk-planning');
    expect(res.status).toBe(200);
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it('filters by authority and decision_date range', async () => {
    mockOrigin(originPage);
    const res = await SELF.fetch(
      'https://example.com/v1/data/uk-planning?decision_date_after=2024-01-01',
    );
    const body = (await res.json()) as SuccessEnvelope<UkPlanningRecord[]>;
    expect(body.data.map((r) => r.reference)).toEqual(['B/2']);

    const res2 = await SELF.fetch('https://example.com/v1/data/uk-planning?authority=109');
    const body2 = (await res2.json()) as SuccessEnvelope<UkPlanningRecord[]>;
    expect(body2.data.map((r) => r.reference)).toEqual(['A/1']);
  });

  it('rejects malformed date params with a 400 envelope', async () => {
    const res = await SELF.fetch(
      'https://example.com/v1/data/uk-planning?decision_date_after=yesterday',
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as ErrorEnvelope;
    expect(body.error.code).toBe('bad_request');
  });

  it('falls back to bundled fixtures when the origin fails (FIXTURE_FALLBACK=true)', async () => {
    mockOrigin(originFailure);
    const res = await SELF.fetch('https://example.com/v1/data/uk-planning');
    expect(res.status).toBe(200);
    const body = (await res.json()) as SuccessEnvelope<UkPlanningRecord[]>;
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0]?.reference).toBe('23/00002/FUL');
  });
});

describe('refreshSource error path', () => {
  it('records an error row and rethrows when fetchFresh fails', async () => {
    const failingSource: DataSource = {
      slug: 'always-broken',
      title: 'Broken',
      description: 'test-only',
      recordSchema: undefined as never,
      queryParams: undefined as never,
      refresh: { cron: '0 5 * * *', cacheTtlSeconds: 60 },
      fetchFresh: () => Promise.reject(new Error('origin exploded')),
    };
    await expect(refreshSource(env, failingSource)).rejects.toThrow('origin exploded');
    const rows = await env.DB.prepare(
      "SELECT status, message FROM refresh_log WHERE source_slug = 'always-broken'",
    ).all();
    expect(rows.results).toEqual([{ status: 'error', message: 'origin exploded' }]);
  });
});

describe('scheduled refresh', () => {
  it('refreshes all sources matching the cron and logs each', async () => {
    mockOrigin(originPage);
    const controller = createScheduledController({ cron: '0 5 * * *' });
    const ctx = createExecutionContext();
    await worker.scheduled(controller, env, ctx);
    await waitOnExecutionContext(ctx);

    expect(await env.CACHE.get('data:uk-planning', 'json')).not.toBeNull();
    expect(await env.CACHE.get('data:demo', 'json')).not.toBeNull();
    const rows = await env.DB.prepare(
      'SELECT source_slug, status FROM refresh_log ORDER BY source_slug',
    ).all();
    expect(rows.results).toEqual([
      { source_slug: 'demo', status: 'ok' },
      { source_slug: 'uk-planning', status: 'ok' },
    ]);
  });
});
