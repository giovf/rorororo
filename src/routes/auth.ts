import { Hono } from 'hono';
import { z } from 'zod';
import { getOrCreateAccount, normalizeEmail } from '../auth/accounts';
import { consumeMagicToken, issueMagicToken } from '../auth/magiclink';
import {
  clearedSessionCookie,
  createSession,
  destroySession,
  readSessionCookie,
  sessionCookie,
} from '../auth/session';
import { emailEnabled, sendEmail } from '../email/send';
import { magicLinkEmail } from '../email/templates';
import { API_BASE_URL } from '../lib/constants';
import { failure, success } from '../lib/envelope';
import { rateLimit } from '../metering/ratelimit';
import type { AppEnv } from '../types';

const loginSchema = z.object({ email: z.email() });

// Cap sign-in requests per IP so the endpoint can't be used to spam inboxes.
const loginRateLimit = rateLimit({
  scope: 'login',
  limit: 5,
  windowSeconds: 900,
  identify: (c) => c.req.header('CF-Connecting-IP') ?? 'unknown',
});

export const authRoutes = new Hono<AppEnv>()
  .post('/login', loginRateLimit, async (c) => {
    const parsed = loginSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(failure('bad_request', 'A valid email is required'), 400);
    if (!emailEnabled(c.env)) {
      return c.json(failure('unavailable', 'Email sign-in is not configured yet'), 503);
    }
    const email = normalizeEmail(parsed.data.email);
    const token = await issueMagicToken(c.env, email);
    await sendEmail(c.env, magicLinkEmail(email, `${API_BASE_URL}/v1/auth/verify?token=${token}`));
    // Same response whether or not the email has an account (no enumeration).
    return c.json(
      success({ sent: true, message: 'Check your email for a sign-in link — it expires in 15 minutes.' }),
    );
  })
  // Clicking the emailed link lands here (top-level GET): consume the token,
  // open a session, and redirect into the account page.
  .get('/verify', async (c) => {
    const email = await consumeMagicToken(c.env, c.req.query('token') ?? '');
    if (!email) return c.redirect(`${API_BASE_URL}/account?error=link_expired`, 302);
    const account = await getOrCreateAccount(c.env, email);
    const sid = await createSession(c.env, { accountId: account.id, email });
    c.header('Set-Cookie', sessionCookie(sid));
    return c.redirect(`${API_BASE_URL}/account`, 302);
  })
  .post('/logout', async (c) => {
    const sid = readSessionCookie(c);
    if (sid) await destroySession(c.env, sid);
    c.header('Set-Cookie', clearedSessionCookie());
    return c.json(success({ signed_out: true }));
  });
