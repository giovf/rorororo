/**
 * Support inbox: Cloudflare Email Routing delivers mail for info@ to this worker's
 * `email()` handler. Each message is parsed, stored in KV (`mail:<id>`), and forwarded
 * unchanged to the owner's existing destination. Admin endpoints list/read/reply so
 * support can be handled from a Claude session; replies go out via Resend.
 */
import PostalMime from 'postal-mime';
import type { KV } from './worker.js';

export interface StoredMail {
  id: string;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  date: string;
  text: string;
  messageId: string;
  inReplyTo: string;
  references: string;
  read: boolean;
  repliedAt?: string;
}

export interface MailEnv {
  LICENSES: KV;
  RESEND_API_KEY: string;
  ADMIN_TOKEN: string;
  /** Where info@ mail was forwarded before the worker existed; kept as a copy. */
  FORWARD_TO?: string;
  SUPPORT_FROM?: string;
}

/** Minimal shape of Cloudflare's ForwardableEmailMessage that we use. */
export interface InboundMessage {
  from: string;
  to: string;
  raw: ReadableStream<Uint8Array>;
  forward(to: string): Promise<void>;
}

const newId = (): string => `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const key = (id: string): string => `mail:${id}`;

export async function parseRaw(raw: ReadableStream<Uint8Array> | string): Promise<Omit<StoredMail, 'id' | 'read'>> {
  const parsed = await new PostalMime().parse(raw);
  return {
    from: parsed.from?.address ?? '',
    fromName: parsed.from?.name ?? '',
    to: parsed.to?.map((t) => t.address ?? '').join(', ') ?? '',
    subject: parsed.subject ?? '(no subject)',
    date: parsed.date ?? new Date().toISOString(),
    text: (parsed.text ?? parsed.html?.replace(/<[^>]+>/g, ' ') ?? '').trim().slice(0, 20_000),
    messageId: parsed.messageId ?? '',
    inReplyTo: parsed.inReplyTo ?? '',
    references: parsed.references ?? '',
  };
}

export async function storeInbound(env: MailEnv, message: InboundMessage): Promise<StoredMail> {
  const parsed = await parseRaw(message.raw);
  const stored: StoredMail = { id: newId(), read: false, ...parsed };
  await env.LICENSES.put(key(stored.id), JSON.stringify(stored));
  if (env.FORWARD_TO) await message.forward(env.FORWARD_TO).catch(() => undefined);
  return stored;
}

export async function listMail(env: MailEnv, unreadOnly: boolean): Promise<StoredMail[]> {
  const keys = await env.LICENSES.list('mail:');
  const items: StoredMail[] = [];
  for (const k of keys) {
    const raw = await env.LICENSES.get(k);
    if (!raw) continue;
    const m = JSON.parse(raw) as StoredMail;
    if (!unreadOnly || !m.read) items.push(m);
  }
  return items.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getMail(env: MailEnv, id: string): Promise<StoredMail | null> {
  const raw = await env.LICENSES.get(key(id));
  return raw ? (JSON.parse(raw) as StoredMail) : null;
}

export async function markRead(env: MailEnv, id: string): Promise<boolean> {
  const m = await getMail(env, id);
  if (!m) return false;
  await env.LICENSES.put(key(id), JSON.stringify({ ...m, read: true }));
  return true;
}

/** Replies via Resend from the support address, threaded onto the original message. */
export async function reply(
  env: MailEnv,
  fetchImpl: typeof fetch,
  id: string,
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  const m = await getMail(env, id);
  if (!m) return { ok: false, error: 'not found' };
  const from = env.SUPPORT_FROM ?? 'Foundry Support <info@gankdat.com>';
  const subject = /^re:/i.test(m.subject) ? m.subject : `Re: ${m.subject}`;
  const headers: Record<string, string> = {};
  if (m.messageId) {
    headers['In-Reply-To'] = m.messageId;
    headers['References'] = [m.references, m.messageId].filter(Boolean).join(' ');
  }
  try {
    const res = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to: [m.from], subject, text, headers }),
    });
    if (!res.ok) return { ok: false, error: `resend ${res.status}: ${(await res.text()).slice(0, 200)}` };
    await env.LICENSES.put(key(id), JSON.stringify({ ...m, read: true, repliedAt: new Date().toISOString() }));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
