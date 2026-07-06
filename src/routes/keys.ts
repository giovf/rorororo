import { Hono } from 'hono';
import { z } from 'zod';
import { generateKey, hashKey } from '../auth/keys';
import { keyCacheKey, requireApiKey } from '../auth/middleware';
import { FREE_TIER_CREDITS } from '../lib/constants';
import { failure, success } from '../lib/envelope';
import type { AppEnv } from '../types';

const issueBodySchema = z.object({
  email: z.email(),
  name: z.string().trim().min(1).max(100).optional(),
});

// Best-effort KV counter to stop key-farming (PRD accepts KV consistency).
const ISSUE_LIMIT_PER_HOUR = 5;

async function overIssueLimit(env: CloudflareBindings, ip: string): Promise<boolean> {
  const key = `ratelimit:keys:${ip}`;
  const current = Number((await env.RATE.get(key)) ?? '0');
  if (current >= ISSUE_LIMIT_PER_HOUR) return true;
  await env.RATE.put(key, String(current + 1), { expirationTtl: 3600 });
  return false;
}

async function revokeKey(env: CloudflareBindings, keyId: string): Promise<boolean> {
  const row = await env.DB.prepare(
    'SELECT key_hash FROM api_keys WHERE id = ?1 AND revoked_at IS NULL',
  )
    .bind(keyId)
    .first<{ key_hash: string }>();
  if (!row) return false;

  await env.DB.prepare("UPDATE api_keys SET revoked_at = datetime('now') WHERE id = ?1")
    .bind(keyId)
    .run();
  // Delete the hot-path cache entry so revocation is immediate.
  await env.CACHE.delete(keyCacheKey(row.key_hash));
  return true;
}

export const keysRoutes = new Hono<AppEnv>()
  .post('/', async (c) => {
    const ip = c.req.header('CF-Connecting-IP') ?? 'unknown';
    if (await overIssueLimit(c.env, ip)) {
      return c.json(failure('rate_limited', 'Too many keys issued from this IP; try later'), 429);
    }

    const parsed = issueBodySchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        code: issue.code,
        message: issue.message,
      }));
      return c.json(failure('bad_request', 'Invalid request body', details), 400);
    }

    const id = crypto.randomUUID();
    const key = generateKey();
    const hash = await hashKey(key);
    await c.env.DB.batch([
      c.env.DB.prepare(
        'INSERT INTO api_keys (id, key_hash, email, name, plan, credits_granted) VALUES (?1, ?2, ?3, ?4, ?5, ?6)',
      ).bind(id, hash, parsed.data.email, parsed.data.name ?? null, 'free', FREE_TIER_CREDITS),
      c.env.DB.prepare(
        'INSERT INTO credit_ledger (key_id, delta, reason) VALUES (?1, ?2, ?3)',
      ).bind(id, FREE_TIER_CREDITS, 'free_tier'),
    ]);

    return c.json(
      success({
        id,
        key,
        plan: 'free',
        credits: FREE_TIER_CREDITS,
        message: 'Store this key now — it is shown only once and cannot be recovered.',
      }),
      201,
    );
  })
  // Self-serve revocation of the presented key.
  .delete('/', requireApiKey(), async (c) => {
    const keyCtx = c.get('keyCtx')!;
    await revokeKey(c.env, keyCtx.keyId);
    return c.json(success({ revoked: true }));
  })
  // Operator revocation by key id, guarded by the ADMIN_TOKEN secret.
  .delete('/:id', async (c) => {
    const token = c.req.header('X-Admin-Token');
    if (!c.env.ADMIN_TOKEN || token !== c.env.ADMIN_TOKEN) {
      return c.json(failure('unauthorized', 'Admin token required'), 401);
    }
    const revoked = await revokeKey(c.env, c.req.param('id'));
    if (!revoked) {
      return c.json(failure('not_found', 'No active key with that id'), 404);
    }
    return c.json(success({ revoked: true }));
  });
