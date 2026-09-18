import { fromBase64Url, toBase64Url, utf8, type Bytes } from './encoding.js';

/**
 * License keys are self-contained and verifiable offline:
 *
 *   FNDRY1.<base64url(JSON payload)>.<base64url(Ed25519 signature)>
 *
 * The private key lives only in the issuing webhook; each product embeds the
 * public key. No server call is needed to unlock, and the same code runs in
 * Node (webhook, tests) and browsers (extensions, plugins) via WebCrypto.
 */
export const KEY_PREFIX = 'FNDRY1';

export interface LicensePayload {
  /** Venture slug the key unlocks (`ventures/<slug>`). */
  venture: string;
  /** Feature tier, e.g. "pro". */
  tier: string;
  /** Unique id (order or checkout session id) — lets a key be revoked online. */
  id: string;
  /** ISO date issued. */
  issued: string;
  /** ISO date after which the key is invalid (subscriptions); absent = perpetual. */
  expires?: string;
  /** Optional seat count for team licences. */
  seats?: number;
}

export type VerifyResult =
  | { valid: true; payload: LicensePayload }
  | { valid: false; reason: 'malformed' | 'bad-signature' | 'expired' | 'wrong-venture' };

export interface KeyPair {
  publicKey: string; // base64url raw 32-byte Ed25519 public key
  privateKey: string; // base64url PKCS#8 private key
}

const subtle = (): SubtleCrypto => {
  const c = globalThis.crypto;
  if (!c?.subtle) throw new Error('WebCrypto is not available in this runtime');
  return c.subtle;
};

export async function generateKeyPair(): Promise<KeyPair> {
  const pair = (await subtle().generateKey({ name: 'Ed25519' }, true, [
    'sign',
    'verify',
  ]));
  const pub = new Uint8Array(await subtle().exportKey('raw', pair.publicKey));
  const priv = new Uint8Array(await subtle().exportKey('pkcs8', pair.privateKey));
  return { publicKey: toBase64Url(pub), privateKey: toBase64Url(priv) };
}

export async function issueLicense(privateKey: string, payload: LicensePayload): Promise<string> {
  const key = await subtle().importKey(
    'pkcs8',
    fromBase64Url(privateKey),
    { name: 'Ed25519' },
    false,
    ['sign'],
  );
  const body = utf8.encode(JSON.stringify(payload));
  const sig = new Uint8Array(await subtle().sign({ name: 'Ed25519' }, key, body));
  return `${KEY_PREFIX}.${toBase64Url(body)}.${toBase64Url(sig)}`;
}

/** Splits a key into its parts without verifying it. Returns null if malformed. */
export function parseLicense(
  text: string,
): { payload: LicensePayload; body: Bytes; sig: Bytes } | null {
  const parts = text.trim().split('.');
  if (parts.length !== 3 || parts[0] !== KEY_PREFIX || !parts[1] || !parts[2]) return null;
  try {
    const body = fromBase64Url(parts[1]);
    const payload = JSON.parse(utf8.decode(body)) as unknown;
    if (!isPayload(payload)) return null;
    return { payload, body, sig: fromBase64Url(parts[2]) };
  } catch {
    return null;
  }
}

export interface VerifyOptions {
  /** Reject keys issued for a different venture. */
  venture?: string;
  /** Clock override for tests. */
  now?: Date;
}

export async function verifyLicense(
  publicKey: string,
  text: string,
  options: VerifyOptions = {},
): Promise<VerifyResult> {
  const parsed = parseLicense(text);
  if (!parsed) return { valid: false, reason: 'malformed' };
  const key = await subtle().importKey('raw', fromBase64Url(publicKey), { name: 'Ed25519' }, false, [
    'verify',
  ]);
  const ok = await subtle().verify({ name: 'Ed25519' }, key, parsed.sig, parsed.body);
  if (!ok) return { valid: false, reason: 'bad-signature' };
  const { payload } = parsed;
  if (options.venture !== undefined && payload.venture !== options.venture) {
    return { valid: false, reason: 'wrong-venture' };
  }
  const now = options.now ?? new Date();
  if (payload.expires !== undefined && new Date(payload.expires) < now) {
    return { valid: false, reason: 'expired' };
  }
  return { valid: true, payload };
}

function isPayload(x: unknown): x is LicensePayload {
  if (typeof x !== 'object' || x === null) return false;
  const p = x as Record<string, unknown>;
  return (
    typeof p['venture'] === 'string' &&
    typeof p['tier'] === 'string' &&
    typeof p['id'] === 'string' &&
    typeof p['issued'] === 'string' &&
    (p['expires'] === undefined || typeof p['expires'] === 'string') &&
    (p['seats'] === undefined || typeof p['seats'] === 'number')
  );
}
