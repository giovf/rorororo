import { env, SELF } from 'cloudflare:test';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SuccessEnvelope } from '../src/lib/envelope';

const BASE = 'https://example.com';

// Make the outbound Resend call hermetic (login sends the magic-link email).
function stubResend(): void {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url.startsWith('https://api.resend.com/')) return Promise.resolve(Response.json({ id: 'email_1' }));
      throw new Error(`unexpected outbound fetch in test: ${url}`);
    }),
  );
}

afterEach(() => vi.unstubAllGlobals());

async function latestMagicToken(): Promise<string> {
  const list = await env.CACHE.list({ prefix: 'magic:' });
  return list.keys.at(-1)!.name.slice('magic:'.length);
}

/** Full passwordless flow → returns the session Cookie header for authed calls. */
async function signIn(email: string): Promise<string> {
  stubResend();
  const login = await SELF.fetch(`${BASE}/v1/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  expect(login.status).toBe(200);
  const token = await latestMagicToken();
  vi.unstubAllGlobals();

  const verify = await SELF.fetch(`${BASE}/v1/auth/verify?token=${token}`, { redirect: 'manual' });
  expect(verify.status).toBe(302);
  expect(verify.headers.get('location')).toContain('/account');
  const setCookie = verify.headers.get('set-cookie') ?? '';
  const m = /fapi_session=([^;]+)/.exec(setCookie);
  expect(m).toBeTruthy();
  return `fapi_session=${m![1]}`;
}

describe('magic-link auth + account API', () => {
  it('signs in via magic link and exposes the account', async () => {
    const cookie = await signIn('owner@example.com');
    const res = await SELF.fetch(`${BASE}/v1/account`, { headers: { Cookie: cookie } });
    expect(res.status).toBe(200);
    const body = (await res.json()) as SuccessEnvelope<{ email: string; plan: string; keys: unknown[] }>;
    expect(body.data).toMatchObject({ email: 'owner@example.com', plan: 'free' });
  });

  it('creates a key that authenticates, then revokes it', async () => {
    const cookie = await signIn('keys@example.com');
    const created = (await (
      await SELF.fetch(`${BASE}/v1/account/keys`, {
        method: 'POST',
        headers: { Cookie: cookie, 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'prod' }),
      })
    ).json()) as SuccessEnvelope<{ id: string; key: string }>;
    expect(created.data.key).toMatch(/^fapi_/);

    // /v1/usage is authed but origin-free — a clean check that the key resolves.
    const ok = await SELF.fetch(`${BASE}/v1/usage`, {
      headers: { Authorization: `Bearer ${created.data.key}` },
    });
    expect(ok.status).toBe(200);

    const del = await SELF.fetch(`${BASE}/v1/account/keys/${created.data.id}`, {
      method: 'DELETE',
      headers: { Cookie: cookie },
    });
    expect(del.status).toBe(200);

    const after = await SELF.fetch(`${BASE}/v1/usage`, {
      headers: { Authorization: `Bearer ${created.data.key}` },
    });
    expect(after.status).toBe(401);
  });

  it('rejects account routes without a session', async () => {
    expect((await SELF.fetch(`${BASE}/v1/account`)).status).toBe(401);
  });

  it('returns 502 when the email provider rejects the send', async () => {
    // e.g. Resend's sandbox 403 ("can only send to your own address") — the
    // API must not claim the email is on its way.
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(Response.json({ statusCode: 403, name: 'validation_error' }, { status: 403 })),
      ),
    );
    const res = await SELF.fetch(`${BASE}/v1/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'rejected@example.com' }),
    });
    expect(res.status).toBe(502);
    const body = (await res.json()) as { ok: boolean; error: { code: string } };
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('unavailable');
  });

  it('rejects an invalid or reused magic token', async () => {
    const bad = await SELF.fetch(`${BASE}/v1/auth/verify?token=deadbeef`, { redirect: 'manual' });
    expect(bad.status).toBe(302);
    expect(bad.headers.get('location')).toContain('error=link_expired');

    stubResend();
    await SELF.fetch(`${BASE}/v1/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'single@example.com' }),
    });
    const token = await latestMagicToken();
    vi.unstubAllGlobals();

    const first = await SELF.fetch(`${BASE}/v1/auth/verify?token=${token}`, { redirect: 'manual' });
    expect(first.headers.get('location')).toContain('/account');
    const second = await SELF.fetch(`${BASE}/v1/auth/verify?token=${token}`, { redirect: 'manual' });
    expect(second.headers.get('location')).toContain('error=link_expired'); // single-use
  });
});
