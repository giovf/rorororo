import { SELF } from 'cloudflare:test';
import type { SuccessEnvelope } from '../../src/lib/envelope';

export interface IssuedKey {
  id: string;
  key: string;
  /** The email the key was issued under — the usage-counter subject. */
  email: string;
}

// Unique default email per call so keyless issueKey()/authedFetch() calls get
// independent quotas (usage is now metered per-email, not per-key).
let issueSeq = 0;

/** Issue a fresh key through the real route (per-test storage is reset). */
export async function issueKey(email = `user${(issueSeq += 1)}@example.com`): Promise<IssuedKey> {
  const res = await SELF.fetch('https://example.com/v1/keys', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (res.status !== 201) throw new Error(`key issuance failed: ${res.status}`);
  const body = (await res.json()) as SuccessEnvelope<{ id: string; key: string }>;
  return { id: body.data.id, key: body.data.key, email };
}

export function bearer(key: string): HeadersInit {
  return { Authorization: `Bearer ${key}` };
}

/** Convenience for authed GETs against the worker under test. */
export async function authedFetch(url: string, key?: string): Promise<Response> {
  const issued = key ?? (await issueKey()).key;
  return SELF.fetch(url, { headers: bearer(issued) });
}
