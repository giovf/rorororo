import type { LicensePayload } from './license.js';
import { fromBase64Url, toBase64Url, utf8 } from './encoding.js';

/**
 * Stripe Managed Payments → licence issuing, kept SDK-free so it runs on
 * Cloudflare Workers. Only the parts we need: webhook signature verification
 * (HMAC-SHA256 over `${t}.${body}`) and mapping a completed Checkout Session
 * to a LicensePayload.
 */

export interface CheckoutSessionLike {
  id: string;
  payment_status?: string;
  customer_details?: { email?: string | null } | null;
  customer_email?: string | null;
  metadata?: Record<string, string> | null;
  /** Unix seconds; present on subscriptions we create with `expires_days` metadata. */
  created?: number;
}

export interface IssueInput {
  session: CheckoutSessionLike;
  /** Fallback tier when metadata has none. */
  defaultTier?: string;
  now?: Date;
}

/**
 * Builds the payload for a paid session. Metadata (set on the Payment Link /
 * Checkout Session) must carry `venture`; optional `tier`, `seats`,
 * `expires_days`. Returns null if the session is not paid or lacks a venture.
 */
export function payloadFromSession(input: IssueInput): { payload: LicensePayload; email: string | null } | null {
  const { session } = input;
  if (session.payment_status !== undefined && session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
    return null;
  }
  const meta = session.metadata ?? {};
  const venture = meta['venture'];
  if (!venture) return null;
  const now = input.now ?? new Date();
  const payload: LicensePayload = {
    venture,
    tier: meta['tier'] ?? input.defaultTier ?? 'pro',
    id: session.id,
    issued: now.toISOString().slice(0, 10),
  };
  const seats = Number(meta['seats']);
  if (Number.isInteger(seats) && seats > 1) payload.seats = seats;
  const days = Number(meta['expires_days']);
  if (Number.isInteger(days) && days > 0) {
    payload.expires = new Date(now.getTime() + days * 86_400_000).toISOString().slice(0, 10);
  }
  const email = session.customer_details?.email ?? session.customer_email ?? null;
  return { payload, email };
}

/** Parses Stripe's `Stripe-Signature` header into its timestamp and v1 signatures. */
export function parseStripeSignature(header: string): { t: number; v1: string[] } | null {
  const parts = header.split(',').map((p) => p.trim().split('='));
  const t = Number(parts.find(([k]) => k === 't')?.[1]);
  const v1 = parts.filter(([k]) => k === 'v1').map(([, v]) => v ?? '');
  if (!Number.isFinite(t) || v1.length === 0) return null;
  return { t, v1 };
}

const hex = (bytes: Uint8Array): string => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');

/**
 * Verifies a Stripe webhook the way the SDK does: HMAC-SHA256(secret, `${t}.${rawBody}`)
 * must equal one of the v1 signatures, and `t` must be within `toleranceSeconds`.
 */
export async function verifyStripeSignature(
  rawBody: string,
  header: string,
  secret: string,
  options: { now?: Date; toleranceSeconds?: number } = {},
): Promise<boolean> {
  const parsed = parseStripeSignature(header);
  if (!parsed) return false;
  const nowSec = Math.floor((options.now ?? new Date()).getTime() / 1000);
  if (Math.abs(nowSec - parsed.t) > (options.toleranceSeconds ?? 300)) return false;
  const key = await crypto.subtle.importKey('raw', utf8.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = hex(new Uint8Array(await crypto.subtle.sign('HMAC', key, utf8.encode(`${parsed.t}.${rawBody}`))));
  return parsed.v1.some((sig) => timingSafeEqual(sig, mac));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Test helper: produces a valid Stripe-Signature header for a body. */
export async function signStripePayload(rawBody: string, secret: string, t: number): Promise<string> {
  const key = await crypto.subtle.importKey('raw', utf8.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = hex(new Uint8Array(await crypto.subtle.sign('HMAC', key, utf8.encode(`${t}.${rawBody}`))));
  return `t=${t},v1=${mac}`;
}

// re-exported so the worker has one import surface
export { fromBase64Url, toBase64Url };
