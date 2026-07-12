import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ErrorEnvelope, SuccessEnvelope } from '../src/lib/envelope';
import fixtureEntries from '../src/sources/fixtures/uk-insolvency.json';
import type { UkInsolvencyRecord } from '../src/sources/uk-insolvency';
import { authedFetch, issueKey } from './helpers/auth';
import { stubOrigins } from './helpers/origin-mock';

const INSOLVENCY_URL = 'https://example.com/v1/data/uk-insolvency';

function feedResponse(entries: unknown[] = fixtureEntries): Response {
  return Response.json({ 'f:total': entries.length, entry: entries });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('GET /v1/data/uk-insolvency', () => {
  it('normalizes entries to the whitelist and never serves person fields', async () => {
    const mock = stubOrigins({ gazette: feedResponse });
    const res = await authedFetch(INSOLVENCY_URL);
    expect(res.status).toBe(200);
    // 25 fixture entries < page size → a single origin request, no pagination.
    expect(mock).toHaveBeenCalledTimes(1);
    const text = await res.text();
    // Blind Mode: the feed's person fields and notice text must never appear.
    expect(text).not.toContain('familyName');
    expect(text).not.toContain('"content"');
    const body = JSON.parse(text) as SuccessEnvelope<UkInsolvencyRecord[]>;
    expect(body.data).toHaveLength(25);
    expect(body.data[0]).toEqual({
      notice_id: '5172215',
      company: 'MCGAWLEY CONTRACTING LTD',
      notice_code: '2452',
      notice_type: 'Winding-Up Orders',
      published_at: '2026-07-12T16:10:07',
      updated_at: '2026-07-12T15:10:08Z',
      notice_url: 'https://www.thegazette.co.uk/notice/5172215',
    });
  });

  it('filters by company substring, notice code, and date range', async () => {
    stubOrigins({ gazette: feedResponse });
    const { key } = await issueKey();

    const byCompany = (await (
      await authedFetch(`${INSOLVENCY_URL}?company=mcgawley`, key)
    ).json()) as SuccessEnvelope<UkInsolvencyRecord[]>;
    expect(byCompany.data.map((r) => r.notice_id)).toEqual(['5172215']);

    const petitions = (await (
      await authedFetch(`${INSOLVENCY_URL}?notice_code=2450`, key)
    ).json()) as SuccessEnvelope<UkInsolvencyRecord[]>;
    expect(petitions.data.every((r) => r.notice_code === '2450')).toBe(true);
    expect(petitions.data.length).toBeGreaterThan(0);

    const none = (await (
      await authedFetch(`${INSOLVENCY_URL}?published_at_before=2000-01-01`, key)
    ).json()) as SuccessEnvelope<UkInsolvencyRecord[]>;
    expect(none.data).toEqual([]);
  });

  it('falls back to bundled fixtures when the origin fails', async () => {
    stubOrigins({ gazette: () => new Response('gone fishing', { status: 500 }) });
    const res = await authedFetch(INSOLVENCY_URL);
    expect(res.status).toBe(200);
    const body = (await res.json()) as SuccessEnvelope<UkInsolvencyRecord[]>;
    expect(body.data).toHaveLength(25);
  });

  it('rejects malformed date params with a 400 envelope', async () => {
    const res = await authedFetch(`${INSOLVENCY_URL}?published_at_after=yesterday`);
    expect(res.status).toBe(400);
    const body = (await res.json()) as ErrorEnvelope;
    expect(body.error.code).toBe('bad_request');
  });
});
