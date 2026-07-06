import type { MiddlewareHandler } from 'hono';
import { hashKey } from './keys';
import { failure } from '../lib/envelope';
import type { AppEnv, KeyContext } from '../types';

interface KeyRecord {
  id: string;
  plan: string;
  revoked_at: string | null;
  email: string;
}

// The quota cap derives from the plan (billing/plans.ts planAllowance), so the
// hot path only needs the plan — no ledger join. Kept short (KV minimum, 60s)
// so revocation and plan changes propagate quickly: the KV-delete on revoke/
// top-up races with this put and KV is eventually consistent, so staleness is
// bounded to ~this TTL rather than being truly instant. A Durable Object per
// key is the accurate upgrade path (PRD), deliberately not built for v1.
const KV_TTL_SECONDS = 60;

export const keyCacheKey = (hash: string): string => `key:${hash}`;

async function lookupKey(env: CloudflareBindings, hash: string): Promise<KeyRecord | null> {
  const cached = await env.CACHE.get<KeyRecord>(keyCacheKey(hash), 'json');
  if (cached) return cached;

  const row = await env.DB.prepare(
    'SELECT id, plan, revoked_at, email FROM api_keys WHERE key_hash = ?1',
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
 * Revocation deletes the KV entry; it propagates within the cache TTL.
 */
export function requireApiKey(): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const header = c.req.header('Authorization') ?? '';
    // RFC 7235 auth-scheme is case-insensitive.
    const match = /^Bearer\s+(\S+)$/i.exec(header);
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
      usageSubject: record.email.toLowerCase(),
    };
    c.set('keyCtx', keyCtx);
    await next();
  };
}
