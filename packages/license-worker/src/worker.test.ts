import { generateKeyPair, signStripePayload, verifyLicense } from '@foundry/licensing';
import { beforeAll, describe, expect, it } from 'vitest';
import { createHandler, type Env, type KV } from './worker.js';

class MemoryKV implements KV {
  readonly map = new Map<string, string>();
  get(key: string): Promise<string | null> {
    return Promise.resolve(this.map.get(key) ?? null);
  }
  put(key: string, value: string): Promise<void> {
    this.map.set(key, value);
    return Promise.resolve();
  }
}

const now = new Date('2026-09-18T12:00:00Z');
let env: Env;
let publicKey: string;
const sent: { to: string[]; subject: string; text: string }[] = [];
const fakeFetch: typeof fetch = (_url, init) => {
  sent.push(JSON.parse(init?.body as string) as (typeof sent)[number]);
  return Promise.resolve(new Response('{"id":"em_1"}', { status: 200 }));
};
const handle = createHandler({ fetch: fakeFetch, now: () => now });

beforeAll(async () => {
  const keys = await generateKeyPair();
  publicKey = keys.publicKey;
  env = {
    LICENSES: new MemoryKV(),
    STRIPE_WEBHOOK_SECRET: 'whsec_x',
    LICENSE_SIGNING_KEY: keys.privateKey,
    RESEND_API_KEY: 're_x',
    ADMIN_TOKEN: 'admin',
    FROM_EMAIL: 'Foundry <info@example.com>',
  };
});

async function webhook(body: object, secret = env.STRIPE_WEBHOOK_SECRET): Promise<Response> {
  const raw = JSON.stringify(body);
  const sig = await signStripePayload(raw, secret, Math.floor(now.getTime() / 1000));
  return handle(new Request('https://w.test/stripe/webhook', { method: 'POST', body: raw, headers: { 'stripe-signature': sig } }), env);
}

const completed = {
  id: 'evt_1',
  type: 'checkout.session.completed',
  data: { object: { id: 'cs_1', payment_status: 'paid', customer_details: { email: 'buyer@example.com' }, metadata: { venture: 'flow-tool' } } },
};

describe('license worker', () => {
  it('issues, stores and emails a key for a completed checkout; retries are idempotent', async () => {
    const first = (await (await webhook(completed)).json()) as { ok: boolean; emailed: boolean; duplicate: boolean };
    expect(first).toEqual({ ok: true, id: 'cs_1', emailed: true, duplicate: false });
    expect(sent).toHaveLength(1);
    expect(sent[0]?.to).toEqual(['buyer@example.com']);
    const key = sent[0]?.text.split('\n').find((l) => l.startsWith('FNDRY1.')) ?? '';
    expect((await verifyLicense(publicKey, key, { venture: 'flow-tool' })).valid).toBe(true);

    const again = (await (await webhook(completed)).json()) as { duplicate: boolean; emailed: boolean };
    expect(again.duplicate).toBe(true);
    expect(again.emailed).toBe(false);
    expect(sent).toHaveLength(1);
  });

  it('rejects bad signatures and ignores other events', async () => {
    expect((await webhook(completed, 'wrong')).status).toBe(400);
    const other = (await (await webhook({ ...completed, type: 'invoice.paid' })).json()) as { ignored: string };
    expect(other.ignored).toBe('invoice.paid');
  });

  it('counts activations and auto-revokes a shared key', async () => {
    await webhook({ ...completed, data: { object: { ...completed.data.object, id: 'cs_share' } } });
    const activate = async (): Promise<{ revoked: boolean; activations?: number; known: boolean }> =>
      (await (await handle(new Request('https://w.test/v1/keys/cs_share/activate', { method: 'POST' }), env)).json()) as {
        revoked: boolean;
        activations?: number;
        known: boolean;
      };
    for (let i = 1; i <= 20; i++) expect(await activate()).toEqual({ revoked: false, known: true, activations: i });
    expect((await activate()).revoked).toBe(true);
    const unknown: unknown = await (await handle(new Request('https://w.test/v1/keys/nope/activate', { method: 'POST' }), env)).json();
    expect(unknown).toEqual({ revoked: false, known: false });
  });

  it('reports and applies revocation behind the admin token', async () => {
    const status = async (): Promise<boolean> =>
      ((await (await handle(new Request('https://w.test/v1/keys/cs_1/status'), env)).json()) as { revoked: boolean }).revoked;
    expect(await status()).toBe(false);
    const denied = await handle(new Request('https://w.test/admin/revoke/cs_1', { method: 'POST' }), env);
    expect(denied.status).toBe(401);
    const ok = await handle(new Request('https://w.test/admin/revoke/cs_1', { method: 'POST', headers: { authorization: 'Bearer admin' } }), env);
    expect(ok.status).toBe(200);
    expect(await status()).toBe(true);
    expect((await handle(new Request('https://w.test/admin/revoke/nope', { method: 'POST', headers: { authorization: 'Bearer admin' } }), env)).status).toBe(404);
  });
});
