import { Hono } from 'hono';
import { z } from 'zod';
import { generateKey, hashKey } from '../auth/keys';
import { keyCacheKey, requireApiKey } from '../auth/middleware';
import { turnstileEnabled, verifyTurnstile } from '../auth/turnstile';
import { FREE_TIER_CREDITS } from '../lib/constants';
import { failure, success } from '../lib/envelope';
import { rateLimit } from '../metering/ratelimit';
import type { AppEnv } from '../types';

const issueBodySchema = z.object({
  email: z.email(),
  name: z.string().trim().min(1).max(100).optional(),
});

// Anti-farming: the free quota is metered per-email (metering/counters.ts), so
// issuing many keys for one email shares one 250/mo allowance rather than
// minting fresh credits. This per-IP window caps issuance velocity on top.
// Residual: distinct/disposable/plus-addressed emails still each get a free
// quota — closing that needs email verification, a documented post-v1 hardening.
const issueRateLimit = rateLimit({
  scope: 'keys',
  limit: 5,
  windowSeconds: 3600,
  identify: (c) => c.req.header('CF-Connecting-IP') ?? 'unknown',
});

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
  .post('/', issueRateLimit, async (c) => {
    const raw = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    if (turnstileEnabled(c.env)) {
      const token = (raw['cf-turnstile-response'] ?? raw['turnstile_token']) as string | undefined;
      if (!(await verifyTurnstile(c.env, token, c.req.header('CF-Connecting-IP')))) {
        return c.json(failure('bad_request', 'CAPTCHA verification failed; please retry'), 400);
      }
    }
    const parsed = issueBodySchema.safeParse(raw);
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
