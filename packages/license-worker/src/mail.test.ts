import { describe, expect, it } from 'vitest';
import { getMail, listMail, markRead, parseRaw, reply, storeInbound, type MailEnv } from './mail.js';
import type { KV } from './worker.js';

class MemoryKV implements KV {
  readonly map = new Map<string, string>();
  get(k: string): Promise<string | null> {
    return Promise.resolve(this.map.get(k) ?? null);
  }
  put(k: string, v: string): Promise<void> {
    this.map.set(k, v);
    return Promise.resolve();
  }
  list(prefix: string): Promise<string[]> {
    return Promise.resolve([...this.map.keys()].filter((k) => k.startsWith(prefix)));
  }
}

const RAW = [
  'From: Ada Buyer <ada@example.com>',
  'To: info@gankdat.com',
  'Subject: Key not working',
  'Date: Sat, 19 Sep 2026 10:00:00 +0000',
  'Message-ID: <abc@example.com>',
  'Content-Type: text/plain; charset=utf-8',
  '',
  'Hi, my key says invalid. Order cs_live_123.',
].join('\r\n');

const env = (): MailEnv & { forwarded: string[]; sent: unknown[] } => {
  const e = { LICENSES: new MemoryKV(), RESEND_API_KEY: 're_x', ADMIN_TOKEN: 'admin', FORWARD_TO: 'owner@example.com', forwarded: [] as string[], sent: [] as unknown[] };
  return e;
};

describe('support inbox', () => {
  it('parses a raw message', async () => {
    const m = await parseRaw(RAW);
    expect(m).toMatchObject({ from: 'ada@example.com', fromName: 'Ada Buyer', subject: 'Key not working', messageId: '<abc@example.com>' });
    expect(m.text).toContain('cs_live_123');
  });

  it('stores inbound mail, forwards a copy, lists unread, marks read', async () => {
    const e = env();
    const stored = await storeInbound(e, { from: 'ada@example.com', to: 'info@gankdat.com', raw: RAW as unknown as ReadableStream<Uint8Array>, forward: (to) => { e.forwarded.push(to); return Promise.resolve(); } });
    expect(e.forwarded).toEqual(['owner@example.com']);
    expect((await listMail(e, true)).map((m) => m.id)).toEqual([stored.id]);
    expect(await markRead(e, stored.id)).toBe(true);
    expect(await listMail(e, true)).toEqual([]);
    expect((await getMail(e, stored.id))?.read).toBe(true);
  });

  it('replies threaded via Resend and records it', async () => {
    const e = env();
    const stored = await storeInbound(e, { from: 'ada@example.com', to: 'info@gankdat.com', raw: RAW as unknown as ReadableStream<Uint8Array>, forward: () => Promise.resolve() });
    const fakeFetch: typeof fetch = (_u, init) => { e.sent.push(JSON.parse(init?.body as string)); return Promise.resolve(new Response('{"id":"em"}', { status: 200 })); };
    expect(await reply(e, fakeFetch, stored.id, 'Sorry about that — new key below.')).toEqual({ ok: true });
    expect(e.sent[0]).toMatchObject({ from: 'Foundry Support <info@gankdat.com>', to: ['ada@example.com'], subject: 'Re: Key not working', headers: { 'In-Reply-To': '<abc@example.com>' } });
    expect((await getMail(e, stored.id))?.repliedAt).toBeTruthy();
    expect(await reply(e, fakeFetch, 'nope', 'x')).toEqual({ ok: false, error: 'not found' });
  });
});
