import type { Context, MiddlewareHandler } from 'hono';
import { failure } from '../lib/envelope';
import type { AccountContext, AppEnv } from '../types';

// Browser sessions for the self-serve account page. Opaque 256-bit random id
// stored in KV (CACHE) -> { accountId, email }; the cookie value IS the
// credential (no signing needed). httpOnly + Secure + SameSite=Lax gives CSRF
// protection for state-changing POSTs while allowing the magic-link GET to set it.

const SESSION_TTL_SECONDS = 30 * 24 * 3600;
const COOKIE_NAME = 'fapi_session';
const sessionKey = (sid: string): string => `session:${sid}`;

export interface SessionRecord {
  accountId: string;
  email: string;
}

export async function createSession(env: CloudflareBindings, rec: SessionRecord): Promise<string> {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const sid = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  await env.CACHE.put(sessionKey(sid), JSON.stringify(rec), { expirationTtl: SESSION_TTL_SECONDS });
  return sid;
}

export async function readSession(
  env: CloudflareBindings,
  sid: string,
): Promise<SessionRecord | null> {
  return env.CACHE.get<SessionRecord>(sessionKey(sid), 'json');
}

export async function destroySession(env: CloudflareBindings, sid: string): Promise<void> {
  await env.CACHE.delete(sessionKey(sid));
}

export function sessionCookie(sid: string): string {
  return `${COOKIE_NAME}=${sid}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_SECONDS}`;
}

export function clearedSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export function readSessionCookie(c: Context<AppEnv>): string | null {
  const cookie = c.req.header('Cookie') ?? '';
  const match = new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`).exec(cookie);
  return match ? match[1]! : null;
}

/**
 * Cookie-session auth for account routes. Resolves the current plan from the
 * account row each request (not cached in the session) so a plan change is
 * reflected immediately.
 */
export function requireSession(): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const sid = readSessionCookie(c);
    const rec = sid ? await readSession(c.env, sid) : null;
    if (!rec) return c.json(failure('unauthorized', 'Not signed in'), 401);

    const acct = await c.env.DB.prepare('SELECT plan FROM accounts WHERE id = ?1')
      .bind(rec.accountId)
      .first<{ plan: string }>();
    const accountCtx: AccountContext = {
      accountId: rec.accountId,
      email: rec.email,
      plan: acct?.plan ?? 'free',
    };
    c.set('accountCtx', accountCtx);
    await next();
  };
}
