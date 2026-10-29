import { generateKeyPair, signStripePayload, verifyLicense } from '@foundry/licensing';
import { beforeAll, describe, expect, it } from 'vitest';
import { createHandler, type Env, type KV } from './worker.js';

class MemoryKV implements KV {
  readonly map = new Map<string, string>();
  readonly binary = new Map<string, ArrayBuffer>();
  get(key: string): Promise<string | null>;
  get(key: string, type: 'arrayBuffer'): Promise<ArrayBuffer | null>;
  get(key: string, type?: 'arrayBuffer'): Promise<string | ArrayBuffer | null> {
    if (type === 'arrayBuffer') return Promise.resolve(this.binary.get(key) ?? null);
    return Promise.resolve(this.map.get(key) ?? null);
  }
  put(key: string, value: string): Promise<void> {
    this.map.set(key, value);
    return Promise.resolve();
  }
  list(prefix: string): Promise<string[]> {
    return Promise.resolve([...this.map.keys()].filter((k) => k.startsWith(prefix)));
  }
}

const now = new Date('2026-09-18T12:00:00Z');
let env: Env;
let kv: MemoryKV;
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
  kv = new MemoryKV();
  env = {
    LICENSES: kv,
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

  it('declines new activations past the rolling window without revoking', async () => {
    await webhook({ ...completed, data: { object: { ...completed.data.object, id: 'cs_share' } } });
    const activate = async (): Promise<{ revoked: boolean; blocked: boolean; known: boolean }> =>
      (await (await handle(new Request('https://w.test/v1/keys/cs_share/activate', { method: 'POST' }), env)).json()) as {
        revoked: boolean;
        blocked: boolean;
        known: boolean;
      };
    for (let i = 0; i < 5; i++) expect(await activate()).toMatchObject({ revoked: false, blocked: false, known: true });
    expect(await activate()).toMatchObject({ revoked: false, blocked: true, known: true });
    // status stays clean: nothing was revoked
    const status = (await (await handle(new Request('https://w.test/v1/keys/cs_share/status'), env)).json()) as { revoked: boolean };
    expect(status.revoked).toBe(false);
    const unknown: unknown = await (await handle(new Request('https://w.test/v1/keys/nope/activate', { method: 'POST' }), env)).json();
    expect(unknown).toEqual({ revoked: false, blocked: false, known: false });
  });

  it('re-sends a stored key on request and reports provider errors', async () => {
    const before = sent.length;
    const ok = await handle(new Request('https://w.test/admin/resend/cs_1', { method: 'POST', headers: { authorization: 'Bearer admin' } }), env);
    expect(await ok.json()).toEqual({ ok: true, to: 'buyer@example.com' });
    expect(sent).toHaveLength(before + 1);
    const failing = createHandler({ fetch: () => Promise.resolve(new Response('{"message":"API key is invalid"}', { status: 401 })), now: () => now });
    const bad = await failing(new Request('https://w.test/admin/resend/cs_1?to=x@y.z', { method: 'POST', headers: { authorization: 'Bearer admin' } }), env);
    expect(await bad.json()).toMatchObject({ ok: false, to: 'x@y.z', error: expect.stringContaining('resend 401') as string });
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

  describe('download products (tax-workbook own-checkout-listing)', () => {
    const sale = {
      id: 'evt_wb',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_wb', payment_status: 'paid', customer_details: { email: 'trader@example.com' }, metadata: { venture: 'tax-workbook' } } },
    };
    const file = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 1, 2, 3]).buffer;
    const linkOf = (text: string): string => text.split('\n').find((l) => l.startsWith('https://w.test/v1/downloads/')) ?? '';

    it('mails a signed download link instead of a key, valid for 30 days', async () => {
      const before = sent.length;
      const res = (await (await webhook(sale)).json()) as { ok: boolean; emailed: boolean };
      expect(res).toMatchObject({ ok: true, emailed: true });
      const mail = sent[before];
      expect(mail?.subject).toBe('Your UK Sole Trader Tax Workbook 2026/27 download');
      expect(mail?.text).not.toContain('FNDRY1.');
      expect(mail?.text).toContain('works until 2026-10-18');
      expect(linkOf(mail?.text ?? '')).not.toBe('');
      // the order is still a stored, revocable licence record
      expect(kv.map.has('license:cs_wb')).toBe(true);
    });

    it('serves the file from the private asset for a valid link and counts the download', async () => {
      const link = linkOf(sent.at(-1)?.text ?? '');
      const missing = await handle(new Request(link), env);
      expect(missing.status).toBe(503);
      kv.binary.set('asset:tax-workbook', file);
      const ok = await handle(new Request(link), env);
      expect(ok.status).toBe(200);
      expect(ok.headers.get('content-type')).toContain('spreadsheetml');
      expect(ok.headers.get('content-disposition')).toBe('attachment; filename="UK-Sole-Trader-Tax-Workbook-2026-27.xlsx"');
      expect(new Uint8Array(await ok.arrayBuffer())).toEqual(new Uint8Array(file));
      expect((JSON.parse(kv.map.get('license:cs_wb') ?? '{}') as { downloads?: number }).downloads).toBe(1);
    });

    it('refuses a tampered, expired or revoked link', async () => {
      const link = linkOf(sent.at(-1)?.text ?? '');
      expect((await handle(new Request(`${link}x`), env)).status).toBe(403);
      expect((await handle(new Request('https://w.test/v1/downloads/nope'), env)).status).toBe(403);
      const later = createHandler({ fetch: fakeFetch, now: () => new Date(now.getTime() + 31 * 86_400_000) });
      expect((await later(new Request(link), env)).status).toBe(403);
      await handle(new Request('https://w.test/admin/revoke/cs_wb', { method: 'POST', headers: { authorization: 'Bearer admin' } }), env);
      expect((await handle(new Request(link), env)).status).toBe(403);
    });

    it('re-sends a fresh link on request', async () => {
      const first = linkOf(sent.at(-1)?.text ?? '');
      const later = createHandler({ fetch: fakeFetch, now: () => new Date(now.getTime() + 10 * 86_400_000) });
      const res = await later(new Request('https://w.test/admin/resend/cs_wb', { method: 'POST', headers: { authorization: 'Bearer admin' } }), env);
      expect(await res.json()).toEqual({ ok: true, to: 'trader@example.com' });
      const fresh = linkOf(sent.at(-1)?.text ?? '');
      expect(fresh).not.toBe('');
      expect(fresh).not.toBe(first);
      expect(sent.at(-1)?.text).toContain('works until 2026-10-28');
    });
  });
});
