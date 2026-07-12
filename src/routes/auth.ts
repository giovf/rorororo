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
import { turnstileEnabled, verifyTurnstile } from '../auth/turnstile';
import { emailEnabled, sendEmail } from '../email/send';
import { magicLinkEmail } from '../email/templates';
import { publicBaseUrl } from '../lib/constants';
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

// Per-EMAIL send cap (on top of the per-IP limit): stops an attacker rotating
// IPs from bombing one victim's inbox. Enforced silently — a capped request
// returns the same generic response and just doesn't send, so it neither
// enumerates accounts nor tells the attacker they were throttled.
const EMAIL_CAP = 4;
const EMAIL_CAP_WINDOW = 3600;

// True only for a same-origin browser request — a cross-site auto-submitted
// form (the login-CSRF vector) is 'cross-site'/'same-site' or carries a
// mismatched Origin. Fails closed: modern browsers always send one of these on
// a form POST, so a request with neither is rejected.
function isSameOrigin(reqUrl: string, secFetchSite?: string, origin?: string): boolean {
  if (secFetchSite) return secFetchSite === 'same-origin';
  if (origin) {
    try {
      return new URL(origin).origin === new URL(reqUrl).origin;
    } catch {
      return false;
    }
  }
  return false;
}

function confirmPage(token: string): string {
  const t = token.replace(/[^a-zA-Z0-9]/g, ''); // token is hex; strip anything else defensively
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" type="image/png" href="/favicon.png">
<meta name="robots" content="noindex"><title>Sign in — gankdat</title>
<style>
:root{--bg:#0A0A0A;--panel:#111315;--green:#00FF41;--border:#2A2E33;--fg:#E6E8EA;--muted:#8B9299;
--mono:"JetBrains Mono","Fira Code",ui-monospace,Menlo,Consolas,monospace;--sans:Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
*{box-sizing:border-box;border-radius:0}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);color:var(--fg);font:15px/1.6 var(--sans);padding:20px}
.card{border:1px solid var(--border);background:var(--panel);max-width:420px;width:100%;padding:28px;text-align:center}
img{width:44px;height:40px;image-rendering:pixelated}
h1{font:800 1.3rem var(--sans);letter-spacing:-.02em;margin:16px 0 6px}
p{color:var(--muted);font:.88rem var(--mono);margin:0 0 20px}
button{width:100%;padding:13px;border:1px solid var(--green);background:var(--green);color:#0A0A0A;font:700 .9rem var(--mono);cursor:pointer;letter-spacing:.03em}
button:hover{box-shadow:0 0 22px rgba(0,255,65,.35)}
</style></head><body>
<div class="card">
<img src="/favicon.png" alt="">
<h1>Confirm sign-in</h1>
<p>Click to finish signing in to gankdat on this device.</p>
<form method="POST" action="/v1/auth/verify">
<input type="hidden" name="token" value="${t}">
<button type="submit">$ sign me in</button>
</form>
</div></body></html>`;
}

export const authRoutes = new Hono<AppEnv>()
  .post('/login', loginRateLimit, async (c) => {
    const raw = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) return c.json(failure('bad_request', 'A valid email is required'), 400);
    // CAPTCHA before the (rate-limited but still abusable) email send. Dark
    // until TURNSTILE_SECRET_KEY is set — verifyTurnstile returns true then.
    if (turnstileEnabled(c.env)) {
      const token = (raw['cf-turnstile-response'] ?? raw['turnstile_token']) as string | undefined;
      if (!(await verifyTurnstile(c.env, token, c.req.header('CF-Connecting-IP')))) {
        return c.json(failure('bad_request', 'CAPTCHA verification failed; please retry'), 400);
      }
    }
    if (!emailEnabled(c.env)) {
      return c.json(failure('unavailable', 'Email sign-in is not configured yet'), 503);
    }
    const email = normalizeEmail(parsed.data.email);

    // Silent per-email cap: skip the send when over the cap, but still return the
    // generic response so the behaviour is identical to a normal request.
    const capKey = `loginsent:${email}`;
    const already = Number((await c.env.CACHE.get(capKey)) ?? '0');
    if (already < EMAIL_CAP) {
      const token = await issueMagicToken(c.env, email);
      const base = publicBaseUrl(c.env);
      const sent = await sendEmail(
        c.env,
        magicLinkEmail(email, `${base}/v1/auth/verify?token=${token}`),
      );
      if (!sent) {
        return c.json(
          failure('unavailable', 'Could not send the sign-in email — please try again shortly'),
          502,
        );
      }
      await c.env.CACHE.put(capKey, String(already + 1), { expirationTtl: EMAIL_CAP_WINDOW });
    }
    // Same response whether or not the email has an account or was capped (no
    // enumeration, no throttle signal).
    return c.json(
      success({
        sent: true,
        message: 'Check your email for a sign-in link — it expires in 15 minutes.',
      }),
    );
  })
  // Clicking the emailed link lands here (GET): show a confirm page but do NOT
  // consume the token or create a session. This defeats passive link-prefetchers
  // /mail scanners (which issue a GET) and forces the actual sign-in through a
  // same-origin POST — closing login-CSRF, where an attacker's own token could
  // otherwise be auto-submitted to log a victim into the attacker's account.
  .get('/verify', (c) => {
    const token = c.req.query('token') ?? '';
    if (!token) return c.redirect(`${publicBaseUrl(c.env)}/account?error=link_expired`, 302);
    return c.html(confirmPage(token));
  })
  .post('/verify', async (c) => {
    const base = publicBaseUrl(c.env);
    if (!isSameOrigin(c.req.url, c.req.header('Sec-Fetch-Site'), c.req.header('Origin'))) {
      return c.redirect(`${base}/account?error=link_expired`, 302);
    }
    const body = await c.req.parseBody().catch(() => ({}) as Record<string, unknown>);
    const token = typeof body.token === 'string' ? body.token : '';
    const email = await consumeMagicToken(c.env, token);
    if (!email) return c.redirect(`${base}/account?error=link_expired`, 302);
    const account = await getOrCreateAccount(c.env, email);
    const sid = await createSession(c.env, { accountId: account.id, email });
    c.header('Set-Cookie', sessionCookie(sid));
    return c.redirect(`${base}/account`, 302);
  })
  .post('/logout', async (c) => {
    const sid = readSessionCookie(c);
    if (sid) await destroySession(c.env, sid);
    c.header('Set-Cookie', clearedSessionCookie());
    return c.json(success({ signed_out: true }));
  });
