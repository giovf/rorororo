import type { MiddlewareHandler } from 'hono';
import { hashKey } from './keys';
import { failure } from '../lib/envelope';
import type { AppEnv, KeyContext } from '../types';

interface KeyRecord {
  id: string;
  plan: string;
  revoked_at: string | null;
}

const KV_TTL_SECONDS = 3600;

export const keyCacheKey = (hash: string): string => `key:${hash}`;

async function lookupKey(env: CloudflareBindings, hash: string): Promise<KeyRecord | null> {
  const cached = await env.CACHE.get<KeyRecord>(keyCacheKey(hash), 'json');
  if (cached) return cached;

  const row = await env.DB.prepare(
    'SELECT id, plan, revoked_at FROM api_keys WHERE key_hash = ?1',
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

    const keyCtx: KeyContext = { keyId: record.id, plan: record.plan, keyHash: hash };
    c.set('keyCtx', keyCtx);
    await next();
  };
}
