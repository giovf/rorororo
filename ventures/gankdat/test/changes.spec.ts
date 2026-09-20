import { env } from 'cloudflare:test';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ErrorEnvelope, SuccessEnvelope } from '../src/lib/envelope';
import { getOpenApiDocument } from '../src/lib/openapi';
import { refreshD1Source } from '../src/sources/d1store';
import type { ChangeRow } from '../src/sources/d1store';
import { ukCareLocationsSource } from '../src/sources/uk-care-locations';
import { authedFetch } from './helpers/auth';
import { stubOrigins } from './helpers/origin-mock';

const URL_ = 'https://example.com/v1/changes/uk-care-locations';
const PAGE = '<a href="https://www.cqc.org.uk/system/files/2026-09/x_CQC_directory.csv">csv</a>';
const HEADER =
  "Name,Also known as,Address,Postcode,Phone number,Service's website (if available),Service types,Date of latest check,Specialisms/services,Provider name,Local authority,Region,Location URL,CQC Location ID (for office use only),CQC Provider ID (for office use only)";
const row = (id: string, name: string, check: string): string =>
  `${name},,"1 Road,Town",AB1 2CD,,,Care home,${check},Dementia,Prov Ltd,Leeds,Yorkshire & Humberside,https://www.cqc.org.uk/location/${id},${id},1-9`;
const DAY1 = [
  HEADER,
  row('1-A', 'Alpha House', '01/Jan/2024 - 00:00'),
  row('1-B', 'Beta Lodge', '01/Jan/2024 - 00:00'),
  row('1-C', 'Gamma Court', '01/Jan/2024 - 00:00'),
].join('\n');
// Day 2: Beta removed, Gamma re-inspected (changed), Delta added; Alpha untouched.
const DAY2 = [
  HEADER,
  row('1-A', 'Alpha House', '01/Jan/2024 - 00:00'),
  row('1-C', 'Gamma Court', '15/Sep/2026 - 00:00'),
  row('1-D', 'Delta Villa', '10/Sep/2026 - 00:00'),
].join('\n');

async function loadWith(csv: string): Promise<void> {
  stubOrigins({ cqcPage: () => new Response(PAGE), cqcFile: () => new Response(csv) });
  await refreshD1Source(env, ukCareLocationsSource);
  vi.unstubAllGlobals();
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('GET /v1/changes/:source', () => {
  it('records added, removed and changed rows between two refreshes', async () => {
    await loadWith(DAY1);
    await loadWith(DAY2);
    const res = await authedFetch(URL_);
    expect(res.status).toBe(200);
    const body = (await res.json()) as SuccessEnvelope<ChangeRow[]>;
    expect(body.meta?.total).toBe(3);
    const byKind = Object.fromEntries(body.data.map((r) => [r.change, r]));
    expect(byKind.added?.record_id).toBe('1-D');
    expect((byKind.added?.record as { name: string }).name).toBe('Delta Villa');
    expect(byKind.removed?.record_id).toBe('1-B');
    expect(byKind.changed?.record_id).toBe('1-C');
    expect((byKind.changed?.record as { latest_check_date: string }).latest_check_date).toBe(
      '2026-09-15',
    );
    expect(body.data.every((r) => typeof r.changed_at === 'string')).toBe(true);
  });

  it('filters by change kind and by since, and pages', async () => {
    await loadWith(DAY1);
    await loadWith(DAY2);
    const removed = (await (await authedFetch(`${URL_}?change=removed`)).json()) as SuccessEnvelope<
      ChangeRow[]
    >;
    expect(removed.data.map((r) => r.record_id)).toEqual(['1-B']);
    const future = (await (
      await authedFetch(`${URL_}?since=2099-01-01`)
    ).json()) as SuccessEnvelope<ChangeRow[]>;
    expect(future.meta?.total).toBe(0);
    const paged = (await (
      await authedFetch(`${URL_}?per_page=2&page=2`)
    ).json()) as SuccessEnvelope<ChangeRow[]>;
    expect(paged.data).toHaveLength(1);
    expect(paged.meta?.total).toBe(3);
  });

  it('is empty after a single load and rejects bad params', async () => {
    await loadWith(DAY1);
    const body = (await (await authedFetch(URL_)).json()) as SuccessEnvelope<ChangeRow[]>;
    expect(body.meta?.total).toBe(0);
    const bad = await authedFetch(`${URL_}?since=yesterday`);
    expect(bad.status).toBe(400);
    const err = (await bad.json()) as ErrorEnvelope;
    expect(err.error.code).toBe('bad_request');
  });

  it('404s for unknown sources and for sources without a stable id', async () => {
    expect((await authedFetch('https://example.com/v1/changes/nope')).status).toBe(404);
    expect((await authedFetch('https://example.com/v1/changes/uk-planning')).status).toBe(404);
  });

  it('is documented in the OpenAPI spec for register datasets only', () => {
    const doc = getOpenApiDocument('https://example.com') as { paths: Record<string, unknown> };
    expect(doc.paths['/v1/changes/uk-care-locations']).toBeDefined();
    expect(doc.paths['/v1/changes/uk-charities']).toBeDefined();
    expect(doc.paths['/v1/changes/uk-planning']).toBeUndefined();
  });
});
