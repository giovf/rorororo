import type { Context, MiddlewareHandler } from 'hono';
import { failure } from '../lib/envelope';
import type { AppEnv } from '../types';

export interface RateLimitOptions {
  /** Namespaces the RATE KV keys, e.g. 'data', 'keys'. */
  scope: string;
  limit: number;
  windowSeconds: number;
  /** What to count by — key id for authed routes, IP for public ones. */
  identify: (c: Context<AppEnv>) => string;
}

/**
 * Sliding-window-counter on the RATE KV namespace: the current bucket plus a
 * time-weighted share of the previous bucket. This bounds the classic
 * fixed-window flaw where up to 2×limit slip through across a bucket boundary
 * (which matters for the anti-abuse limiters, e.g. key issuance). Best-effort by
 * design — KV is eventually consistent; a Durable Object is the accurate upgrade
 * path (PRD), not built for v1.
 */
export function rateLimit(options: RateLimitOptions): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const bucket = Math.floor(nowSeconds / options.windowSeconds);
    const elapsed = nowSeconds % options.windowSeconds;
    const prevWeight = (options.windowSeconds - elapsed) / options.windowSeconds;

    const id = options.identify(c);
    const currKey = `rl:${options.scope}:${id}:${bucket}`;
    const prevKey = `rl:${options.scope}:${id}:${bucket - 1}`;
    const [currRaw, prevRaw] = await Promise.all([
      c.env.RATE.get(currKey),
      c.env.RATE.get(prevKey),
    ]);
    const current = Number(currRaw ?? '0');
    const estimated = current + Number(prevRaw ?? '0') * prevWeight;

    if (estimated >= options.limit) {
      c.header('Retry-After', String(options.windowSeconds - elapsed));
      return c.json(
        failure(
          'rate_limited',
          `Rate limit exceeded (${options.limit} per ${options.windowSeconds}s); retry later`,
        ),
        429,
      );
    }
    await c.env.RATE.put(currKey, String(current + 1), {
      expirationTtl: Math.max(60, options.windowSeconds * 2),
    });
    await next();
  };
}
