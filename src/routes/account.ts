import { Hono } from 'hono';
import { generateKey, hashKey } from '../auth/keys';
import { keyCacheKey } from '../auth/middleware';
import { requireSession } from '../auth/session';
import { createCheckoutUrl, createPortalUrl } from '../billing/checkout';
import { stripeClient } from '../billing/client';
import { FREE_TIER_CREDITS, publicBaseUrl } from '../lib/constants';
import { failure, success } from '../lib/envelope';
import { currentPeriod, getUsage } from '../metering/counters';
import { usageSummary } from '../metering/quota';
import type { AppEnv } from '../types';

const NOT_CONFIGURED = failure('unavailable', 'Billing is not configured yet (Stripe keys missing)');

// Self-serve account dashboard API — all cookie-session authed. Everything is
// scoped to the signed-in account, so a user manages exactly their own keys,
// usage, and subscription with no API key to paste.
export const accountRoutes = new Hono<AppEnv>()
  .use('*', requireSession())
  .get('/', async (c) => {
    const acct = c.get('accountCtx')!;
    const period = currentPeriod();
    const used = await getUsage(c.env, acct.email, period);
    const { granted, remaining, alerts } = usageSummary(acct.plan, used);
    const { results: keys } = await c.env.DB.prepare(
      'SELECT id, name, created_at, revoked_at FROM api_keys WHERE account_id = ?1 ORDER BY created_at DESC',
    )
      .bind(acct.accountId)
      .all();
    return c.json(
      success({ email: acct.email, plan: acct.plan, period, used, granted, remaining, alerts, keys }),
    );
  })
  // Issue a new key under this account (inherits the account's plan). Raw key
  // returned exactly once.
  .post('/keys', async (c) => {
    const acct = c.get('accountCtx')!;
    const raw = (await c.req.json().catch(() => ({}))) as { name?: unknown };
    const name = typeof raw.name === 'string' ? raw.name.trim().slice(0, 100) || null : null;
    const id = crypto.randomUUID();
    const key = generateKey();
    const hash = await hashKey(key);
    await c.env.DB.prepare(
      'INSERT INTO api_keys (id, key_hash, email, name, plan, credits_granted, account_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)',
    )
      .bind(id, hash, acct.email, name, acct.plan, FREE_TIER_CREDITS, acct.accountId)
      .run();
    return c.json(
      success({ id, key, name, message: 'Store this key now — it is shown only once.' }),
      201,
    );
  })
  .delete('/keys/:id', async (c) => {
    const acct = c.get('accountCtx')!;
    const row = await c.env.DB.prepare(
      'SELECT key_hash FROM api_keys WHERE id = ?1 AND account_id = ?2 AND revoked_at IS NULL',
    )
      .bind(c.req.param('id'), acct.accountId)
      .first<{ key_hash: string }>();
    if (!row) return c.json(failure('not_found', 'No active key with that id on this account'), 404);
    await c.env.DB.prepare("UPDATE api_keys SET revoked_at = datetime('now') WHERE id = ?1")
      .bind(c.req.param('id'))
      .run();
    await c.env.CACHE.delete(keyCacheKey(row.key_hash));
    return c.json(success({ revoked: true }));
  })
  .post('/checkout', async (c) => {
    const stripe = stripeClient(c.env);
    if (!stripe) return c.json(NOT_CONFIGURED, 503);
    const acct = c.get('accountCtx')!;
    const body = (await c.req.json().catch(() => ({}))) as { plan?: unknown };
    const result = await createCheckoutUrl(stripe, {
      accountId: acct.accountId,
      email: acct.email,
      plan: typeof body.plan === 'string' ? body.plan : '',
      baseUrl: publicBaseUrl(c.env),
      returnPath: '/account',
    });
    if (!result.ok) return c.json(failure(result.code, result.message), result.status);
    return c.json(success({ url: result.url }));
  })
  .post('/portal', async (c) => {
    const stripe = stripeClient(c.env);
    if (!stripe) return c.json(NOT_CONFIGURED, 503);
    const acct = c.get('accountCtx')!;
    const result = await createPortalUrl(stripe, c.env, acct.accountId, '/account');
    if (!result.ok) return c.json(failure(result.code, result.message), result.status);
    return c.json(success({ url: result.url }));
  });
