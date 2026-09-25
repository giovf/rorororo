import { Hono } from 'hono';
import { z } from 'zod';
import { getOrCreateAccount, normalizeEmail } from '../auth/accounts';
import { emailSendAllowed, recordEmailSend } from '../auth/emailcap';
import { consumeMagicToken, issueMagicToken } from '../auth/magiclink';
import {
  clearedSessionCookie,
  createSession,
  destroySession,
  readSessionCookie,
  sessionCookie,
} from '../auth/session';
import {
  approveAgentSignup,
  claimAgentKey,
  createAgentSignup,
  peekAgentSignup,
  CLAIM_RETRY_SECONDS,
  SIGNUP_RATE_LIMIT,
} from '../auth/signup';
import { turnstileEnabled, verifyTurnstile } from '../auth/turnstile';
import { emailEnabled, sendEmail } from '../email/send';
import { agentKeyRequestEmail, magicLinkEmail } from '../email/templates';
import { publicBaseUrl } from '../lib/constants';
import { failure, success } from '../lib/envelope';
import { rateLimit } from '../metering/ratelimit';
import type { AppEnv } from '../types';

const loginSchema = z.object({ email: z.email() });
const agentSignupSchema = z.object({
  email: z.email(),
  client_name: z.string().trim().min(1).max(60).optional(),
});
const claimSchema = z.object({ request_id: z.string().min(1), claim_secret: z.string().min(1) });

// Cap sign-in requests per IP so the endpoint can't be used to spam inboxes.
const loginRateLimit = rateLimit({
  scope: 'login',
  limit: 5,
  windowSeconds: 900,
  identify: (c) => c.req.header('CF-Connecting-IP') ?? 'unknown',
});

// Agent sign-up requests share the login budget shape (per IP) and, via
// auth/emailcap.ts, the per-email cap with browser login.
const signupRateLimit = rateLimit({
  ...SIGNUP_RATE_LIMIT,
  identify: (c) => c.req.header('CF-Connecting-IP') ?? 'unknown',
});

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

const PAGE_STYLE = `:root{--bg:#0A0A0A;--panel:#111315;--green:#00FF41;--border:#2A2E33;--fg:#E6E8EA;--muted:#8B9299;
--mono:"JetBrains Mono","Fira Code",ui-monospace,Menlo,Consolas,monospace;--sans:Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
*{box-sizing:border-box;border-radius:0}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);color:var(--fg);font:15px/1.6 var(--sans);padding:20px}
.card{border:1px solid var(--border);background:var(--panel);max-width:420px;width:100%;padding:28px;text-align:center}
img{width:44px;height:40px;image-rendering:pixelated}
h1{font:800 1.3rem var(--sans);letter-spacing:-.02em;margin:16px 0 6px}
p{color:var(--muted);font:.88rem var(--mono);margin:0 0 20px}
.code{color:var(--green);font:700 1.5rem var(--mono);letter-spacing:.12em;margin:0 0 16px}
a{color:var(--green)}
button{width:100%;padding:13px;border:1px solid var(--green);background:var(--green);color:#0A0A0A;font:700 .9rem var(--mono);cursor:pointer;letter-spacing:.03em}
button:hover{box-shadow:0 0 22px rgba(0,255,65,.35)}`;

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function page(title: string, body: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" type="image/png" href="/favicon.png">
<meta name="robots" content="noindex"><title>${title} — gankdat</title>
<style>${PAGE_STYLE}</style></head><body>
<div class="card">
<img src="/favicon.png" alt="">
${body}
</div></body></html>`;
}

function confirmPage(token: string): string {
  const t = token.replace(/[^a-zA-Z0-9]/g, ''); // token is hex; strip anything else defensively
  return page(
    'Sign in',
    `<h1>Confirm sign-in</h1>
<p>Click to finish signing in to gankdat on this device.</p>
<form method="POST" action="/v1/auth/verify">
<input type="hidden" name="token" value="${t}">
<button type="submit">$ sign me in</button>
</form>`,
  );
}

// The approval page for an agent's key request: shows the code the agent
// displayed so the user can tell their own request from a stranger's, and
// says plainly what approving does (a key on THEIR account, inheriting its plan).
function approvePage(
  token: string,
  pending: { email: string; code: string; client_name: string | null },
): string {
  const t = token.replace(/[^a-zA-Z0-9]/g, '');
  const who = pending.client_name ? `"${escapeHtml(pending.client_name)}"` : 'An AI agent or app';
  return page(
    'Approve API key',
    `<h1>Approve an API key request</h1>
<p>${who} asked for a gankdat API key for <strong>${escapeHtml(pending.email)}</strong>. Approve only if this code matches the one your agent showed you:</p>
<p class="code">${escapeHtml(pending.code)}</p>
<p>The key is issued to your account (created if new), inherits its plan and can be revoked any time at <a href="/account">/account</a>. If you didn't ask for this, close this page — nothing happens.</p>
<form method="POST" action="/v1/auth/approve">
<input type="hidden" name="token" value="${t}">
<button type="submit">$ approve and issue the key</button>
</form>`,
  );
}

function approvedPage(code: string): string {
  return page(
    'Approved',
    `<h1>Key request ${escapeHtml(code)} approved</h1>
<p>Your agent can now collect its key (it has 24 hours to do so). Manage or revoke keys at <a href="/account">/account</a>.</p>`,
  );
}

function linkExpiredPage(): string {
  return page(
    'Link expired',
    `<h1>This link has expired</h1>
<p>Approval links work once and expire after 30 minutes. Ask your agent to request a key again.</p>`,
  );
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
    if (await emailSendAllowed(c.env, email)) {
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
      await recordEmailSend(c.env, email);
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
  // ── Agent-side sign-up (REST twin of the MCP tools request_api_key /
  // claim_api_key; see auth/signup.ts). No CAPTCHA (agents can't solve one):
  // the per-IP and per-email caps are the abuse valves, and the human's click
  // is the gate.
  .post('/agent-signup', signupRateLimit, async (c) => {
    const raw = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsed = agentSignupSchema.safeParse(raw);
    if (!parsed.success) return c.json(failure('bad_request', 'A valid email is required'), 400);
    if (!emailEnabled(c.env)) {
      return c.json(failure('unavailable', 'Email sign-up is not configured yet'), 503);
    }
    const email = normalizeEmail(parsed.data.email);
    if (!(await emailSendAllowed(c.env, email))) {
      return c.json(
        failure('rate_limited', 'Too many sign-up emails for this address; retry in an hour'),
        429,
      );
    }
    const { request, approveToken } = await createAgentSignup(
      c.env,
      email,
      parsed.data.client_name ?? null,
    );
    const link = `${publicBaseUrl(c.env)}/v1/auth/approve?token=${approveToken}`;
    const sent = await sendEmail(
      c.env,
      agentKeyRequestEmail(email, link, request.code, parsed.data.client_name ?? null),
    );
    if (!sent) {
      return c.json(
        failure('unavailable', 'Could not send the approval email — please try again shortly'),
        502,
      );
    }
    await recordEmailSend(c.env, email);
    return c.json(
      success({
        ...request,
        next: `Show the user the code ${request.code}; they approve the emailed link. Then POST /v1/auth/agent-signup/claim with request_id and claim_secret (every ${CLAIM_RETRY_SECONDS}s) until status is "approved".`,
      }),
      202,
    );
  })
  .post('/agent-signup/claim', async (c) => {
    const raw = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsed = claimSchema.safeParse(raw);
    if (!parsed.success) {
      return c.json(failure('bad_request', 'request_id and claim_secret are required'), 400);
    }
    const result = await claimAgentKey(c.env, parsed.data.request_id, parsed.data.claim_secret);
    switch (result.status) {
      case 'approved':
        return c.json(
          success({
            status: 'approved',
            api_key: result.api_key,
            key_id: result.key_id,
            plan: result.plan,
            message:
              'Store this key now — it is shown only once. Send it as: Authorization: Bearer <key>',
          }),
        );
      case 'pending':
        return c.json(
          success({
            status: 'pending',
            approve_by: result.approve_by,
            retry_after_seconds: CLAIM_RETRY_SECONDS,
          }),
        );
      case 'not_found':
        return c.json(failure('not_found', 'Unknown request_id or wrong claim_secret'), 404);
      case 'claimed':
        return c.json(failure('gone', 'This request already issued its key'), 410);
      case 'key_limit':
        return c.json(
          failure('bad_request', 'Key limit reached (25 active) — revoke a key at /account first'),
          400,
        );
      default:
        return c.json(failure('gone', 'This request expired; start a new one'), 410);
    }
  })
  // Clicking the emailed approval link: GET renders, POST (same-origin) approves —
  // the same anti-prefetch / anti-CSRF shape as /verify.
  .get('/approve', async (c) => {
    const token = c.req.query('token') ?? '';
    const pending = await peekAgentSignup(c.env, token);
    if (!pending) return c.html(linkExpiredPage(), 410);
    return c.html(approvePage(token, pending));
  })
  .post('/approve', async (c) => {
    if (!isSameOrigin(c.req.url, c.req.header('Sec-Fetch-Site'), c.req.header('Origin'))) {
      return c.html(linkExpiredPage(), 403);
    }
    const body = await c.req.parseBody().catch(() => ({}) as Record<string, unknown>);
    const token = typeof body.token === 'string' ? body.token : '';
    const approved = await approveAgentSignup(c.env, token);
    if (!approved) return c.html(linkExpiredPage(), 410);
    return c.html(approvedPage(approved.code));
  })
  .post('/logout', async (c) => {
    const sid = readSessionCookie(c);
    if (sid) await destroySession(c.env, sid);
    c.header('Set-Cookie', clearedSessionCookie());
    return c.json(success({ signed_out: true }));
  });
