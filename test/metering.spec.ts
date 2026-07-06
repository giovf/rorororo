import { env, SELF } from 'cloudflare:test';
import { Hono } from 'hono';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { hashKey } from '../src/auth/keys';
import type { ErrorEnvelope, SuccessEnvelope } from '../src/lib/envelope';
import { currentPeriod } from '../src/metering/counters';
import { rateLimit } from '../src/metering/ratelimit';
import type { AppEnv } from '../src/types';
import { authedFetch, bearer, issueKey } from './helpers/auth';
import { stubOrigins } from './helpers/origin-mock';

const DATA_URL = 'https://example.com/v1/data/uk-planning?per_page=1';
const USAGE_URL = 'https://example.com/v1/usage';

function planningPage(): Response {
  return Response.json({ entities: [], links: {}, count: 0 });
}

type UsageBody = SuccessEnvelope<{
  plan: string;
  period: string;
  used: number;
  granted: number;
  remaining: number;
  alerts: string[];
}>;

/** Shrink a key's quota by inserting a negative ledger adjustment. */
async function shrinkQuota(keyId: string, key: string, grantedTarget: number): Promise<void> {
  await env.DB.prepare('INSERT INTO credit_ledger (key_id, delta, reason) VALUES (?1, ?2, ?3)')
    .bind(keyId, grantedTarget - 250, 'test_adjustment')
    .run();
  // Drop the cached key record so the new total is picked up immediately.
  await env.CACHE.delete(`key:${await hashKey(key)}`);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('currentPeriod', () => {
  it('formats yyyymm in UTC', () => {
    expect(currentPeriod(new Date('2026-07-15T10:00:00Z'))).toBe('202607');
    expect(currentPeriod(new Date('2026-12-31T23:59:59Z'))).toBe('202612');
  });
});

describe('GET /v1/usage', () => {
  it('shows the free-tier grant with zero usage for a fresh key', async () => {
    const { key } = await issueKey();
    const res = await SELF.fetch(USAGE_URL, { headers: bearer(key) });
    expect(res.status).toBe(200);
    const body = (await res.json()) as UsageBody;
    expect(body.data).toMatchObject({
      plan: 'free',
      used: 0,
      granted: 250,
      remaining: 250,
      alerts: [],
    });
    expect(body.data.period).toMatch(/^\d{6}$/);
  });

  it('is free to call: checking usage never changes usage', async () => {
    const { key } = await issueKey();
    await SELF.fetch(USAGE_URL, { headers: bearer(key) });
    const res = await SELF.fetch(USAGE_URL, { headers: bearer(key) });
    const body = (await res.json()) as UsageBody;
    expect(body.data.used).toBe(0);
  });
});

describe('credit metering on data routes', () => {
  it('decrements X-Credits-Remaining monotonically and matches /v1/usage', async () => {
    stubOrigins({ planning: planningPage });
    const { key } = await issueKey();

    const first = await authedFetch(DATA_URL, key);
    expect(first.headers.get('X-Credits-Limit')).toBe('250');
    expect(first.headers.get('X-Credits-Remaining')).toBe('249');

    const second = await authedFetch(DATA_URL, key);
    expect(second.headers.get('X-Credits-Remaining')).toBe('248');

    const usage = (await (
      await SELF.fetch(USAGE_URL, { headers: bearer(key) })
    ).json()) as UsageBody;
    expect(usage.data).toMatchObject({ used: 2, remaining: 248 });
  });

  it('does not charge failed requests', async () => {
    const { key } = await issueKey();
    const bad = await authedFetch('https://example.com/v1/data/uk-planning?per_page=1000', key);
    expect(bad.status).toBe(400);
    const usage = (await (
      await SELF.fetch(USAGE_URL, { headers: bearer(key) })
    ).json()) as UsageBody;
    expect(usage.data.used).toBe(0);
  });

  it('nudges at 80%, alerts at 100%, and blocks past the quota with 402', async () => {
    stubOrigins({ planning: planningPage });
    const { id, key } = await issueKey();
    await shrinkQuota(id, key, 5);

    const statuses: (string | null)[] = [];
    for (let i = 1; i <= 5; i++) {
      const res = await authedFetch(DATA_URL, key);
      expect(res.status).toBe(200);
      statuses.push(res.headers.get('X-Upgrade-Nudge') && res.headers.get('X-Credits-Remaining'));
      if (i === 4) {
        const body = (await res.json()) as SuccessEnvelope<unknown[]>;
        expect(body.meta?.usage_alert).toBe('80');
      }
      if (i === 5) {
        const body = (await res.json()) as SuccessEnvelope<unknown[]>;
        expect(body.meta?.usage_alert).toBe('100');
      }
    }
    expect(statuses).toEqual([null, null, null, '1', '0']);

    const blocked = await authedFetch(DATA_URL, key);
    expect(blocked.status).toBe(402);
    expect(blocked.headers.get('X-Credits-Remaining')).toBe('0');
    const body = (await blocked.json()) as ErrorEnvelope;
    expect(body.error.code).toBe('quota_exceeded');

    const usage = (await (
      await SELF.fetch(USAGE_URL, { headers: bearer(key) })
    ).json()) as UsageBody;
    expect(usage.data).toMatchObject({ used: 5, granted: 5, remaining: 0, alerts: ['100'] });
  });
});

describe('rate limiting', () => {
  it('caps a fixed window and reports Retry-After', async () => {
    const app = new Hono<AppEnv>();
    app.use(
      '*',
      rateLimit({ scope: 'test', limit: 3, windowSeconds: 60, identify: () => 'fixed' }),
    );
    app.get('/ping', (c) => c.json({ ok: true }));

    for (let i = 0; i < 3; i++) {
      const res = await app.request('/ping', {}, env);
      expect(res.status).toBe(200);
    }
    const limited = await app.request('/ping', {}, env);
    expect(limited.status).toBe(429);
    expect(Number(limited.headers.get('Retry-After'))).toBeGreaterThan(0);
    const body = (await limited.json()) as ErrorEnvelope;
    expect(body.error.code).toBe('rate_limited');
  });
});
