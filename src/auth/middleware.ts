import type { MiddlewareHandler } from 'hono';
import { hashKey } from './keys';
import { failure } from '../lib/envelope';
import type { AppEnv, KeyContext } from '../types';

interface KeyRecord {
  id: string;
  plan: string;
  revoked_at: string | null;
  credits_granted: number;
}

const KV_TTL_SECONDS = 3600;

export const keyCacheKey = (hash: string): string => `key:${hash}`;

async function lookupKey(env: CloudflareBindings, hash: string): Promise<KeyRecord | null> {
  const cached = await env.CACHE.get<KeyRecord>(keyCacheKey(hash), 'json');
  if (cached) return cached;

  // credits_granted = ledger sum, so Stripe top-ups (task 8) only need to
  // insert a ledger row and delete this KV entry to take effect.
  const row = await env.DB.prepare(
    `SELECT a.id, a.plan, a.revoked_at, COALESCE(SUM(l.delta), 0) AS credits_granted
     FROM api_keys a LEFT JOIN credit_ledger l ON l.key_id = a.id
     WHERE a.key_hash = ?1
     GROUP BY a.id, a.plan, a.revoked_at`,
  )
    .bind(hash)
    .first<KeyRecord>();
  if (!row) return null;

  await env.CACHE.put(keyCacheKey(hash), JSON.stringify(row), {
    expirationTtl: KV_TTL_SECONDS,
  });
  return row;
}

/**
 * Bearer API-key auth: KV hot path, D1 fallback (repopulating KV).
 * Revocation deletes the KV entry, so it takes effect immediately.
 */
export function requireApiKey(): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const header = c.req.header('Authorization') ?? '';
    const match = /^Bearer\s+(\S+)$/.exec(header);
    if (!match) {
      return c.json(
        failure('unauthorized', 'Missing API key. Send it as: Authorization: Bearer <key>'),
        401,
      );
    }

    const hash = await hashKey(match[1]!);
    const record = await lookupKey(c.env, hash);
    if (!record || record.revoked_at !== null) {
      return c.json(failure('unauthorized', 'Unknown or revoked API key'), 401);
    }

    const keyCtx: KeyContext = {
      keyId: record.id,
      plan: record.plan,
      keyHash: hash,
      creditsGranted: record.credits_granted,
    };
    c.set('keyCtx', keyCtx);
    await next();
  };
}
