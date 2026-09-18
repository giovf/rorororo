import { issueLicense, payloadFromSession, verifyStripeSignature, type LicensePayload } from '@foundry/licensing';

/** Minimal KV surface so tests don't need Cloudflare types. */
export interface KV {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

export interface Env {
  LICENSES: KV;
  STRIPE_WEBHOOK_SECRET: string;
  LICENSE_SIGNING_KEY: string;
  RESEND_API_KEY: string;
  ADMIN_TOKEN: string;
  FROM_EMAIL: string;
}

export interface Deps {
  fetch: typeof fetch;
  now: () => Date;
}

interface StoredLicense {
  key: string;
  email: string | null;
  payload: LicensePayload;
  revoked?: boolean;
  /** Times the key was activated (one request per activation); no device data. */
  activations?: number;
}

/** A key activated more times than one person plausibly would is treated as shared. */
export const MAX_ACTIVATIONS = 20;

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export function createHandler(deps: Deps = { fetch, now: () => new Date() }) {
  return async function handle(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '');

    if (request.method === 'POST' && path === '/stripe/webhook') return webhook(request, env, deps);

    const status = /^\/v1\/keys\/([^/]+)\/status$/.exec(path);
    if (request.method === 'GET' && status?.[1]) {
      const stored = await readLicense(env, decodeURIComponent(status[1]));
      return json({ revoked: stored?.revoked === true });
    }

    // Activation: counts the activation and auto-revokes a key that is clearly being shared.
    const activate = /^\/v1\/keys\/([^/]+)\/activate$/.exec(path);
    if (request.method === 'POST' && activate?.[1]) {
      const id = decodeURIComponent(activate[1]);
      const stored = await readLicense(env, id);
      if (!stored) return json({ revoked: false, known: false });
      const activations = (stored.activations ?? 0) + 1;
      const revoked = stored.revoked === true || activations > MAX_ACTIVATIONS;
      await env.LICENSES.put(`license:${id}`, JSON.stringify({ ...stored, activations, revoked }));
      return json({ revoked, known: true, activations });
    }

    const revoke = /^\/admin\/revoke\/([^/]+)$/.exec(path);
    if (request.method === 'POST' && revoke?.[1]) {
      if (request.headers.get('authorization') !== `Bearer ${env.ADMIN_TOKEN}`) return json({ error: 'unauthorized' }, 401);
      const id = decodeURIComponent(revoke[1]);
      const stored = await readLicense(env, id);
      if (!stored) return json({ error: 'not found' }, 404);
      await env.LICENSES.put(`license:${id}`, JSON.stringify({ ...stored, revoked: true }));
      return json({ ok: true, id });
    }

    if (request.method === 'GET' && path === '/health') return json({ ok: true });
    return json({ error: 'not found' }, 404);
  };
}

async function readLicense(env: Env, id: string): Promise<StoredLicense | null> {
  const raw = await env.LICENSES.get(`license:${id}`);
  return raw ? (JSON.parse(raw) as StoredLicense) : null;
}

async function webhook(request: Request, env: Env, deps: Deps): Promise<Response> {
  const rawBody = await request.text();
  const sig = request.headers.get('stripe-signature') ?? '';
  if (!(await verifyStripeSignature(rawBody, sig, env.STRIPE_WEBHOOK_SECRET, { now: deps.now() }))) {
    return json({ error: 'bad signature' }, 400);
  }
  const event = JSON.parse(rawBody) as { id: string; type: string; data: { object: Parameters<typeof payloadFromSession>[0]['session'] } };
  if (event.type !== 'checkout.session.completed') return json({ ignored: event.type });

  const issued = payloadFromSession({ session: event.data.object, now: deps.now() });
  if (!issued) return json({ ignored: 'session not paid or missing venture metadata' });

  // Idempotent: Stripe retries; a session id yields one key.
  const existing = await readLicense(env, issued.payload.id);
  const key = existing?.key ?? (await issueLicense(env.LICENSE_SIGNING_KEY, issued.payload));
  if (!existing) {
    const stored: StoredLicense = { key, email: issued.email, payload: issued.payload };
    await env.LICENSES.put(`license:${issued.payload.id}`, JSON.stringify(stored));
  }

  let emailed = false;
  if (issued.email && !existing) emailed = await sendKeyEmail(deps.fetch, env, issued.email, issued.payload, key);
  return json({ ok: true, id: issued.payload.id, emailed, duplicate: existing !== null });
}

export function licenseEmail(payload: LicensePayload, key: string): { subject: string; text: string } {
  const name = payload.venture.replace(/-/g, ' ');
  return {
    subject: `Your ${name} licence key`,
    text: [
      `Thanks for buying ${name}.`,
      '',
      'Your licence key (paste it into the product’s Unlock box):',
      '',
      key,
      '',
      `Tier: ${payload.tier}${payload.seats ? ` · seats: ${payload.seats}` : ''}${payload.expires ? ` · valid until ${payload.expires}` : ' · perpetual'}`,
      '',
      'Keep this email; the key works offline and is tied to your purchase, not a device.',
      'Questions or refunds (14 days; one refund per customer, the key is then revoked): reply to this email.',
      '',
      '— Foundry',
    ].join('\n'),
  };
}

async function sendKeyEmail(fetchImpl: typeof fetch, env: Env, to: string, payload: LicensePayload, key: string): Promise<boolean> {
  const { subject, text } = licenseEmail(payload, key);
  try {
    const res = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: env.FROM_EMAIL, to: [to], subject, text }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
