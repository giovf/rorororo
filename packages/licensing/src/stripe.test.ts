import { describe, expect, it } from 'vitest';
import { parseStripeSignature, payloadFromSession, signStripePayload, verifyStripeSignature } from './stripe.js';

const now = new Date('2026-09-18T12:00:00Z');

describe('payloadFromSession', () => {
  it('maps a paid session with metadata to a payload and email', () => {
    const r = payloadFromSession({
      session: { id: 'cs_1', payment_status: 'paid', customer_details: { email: 'a@b.c' }, metadata: { venture: 'tool', tier: 'team', seats: '5', expires_days: '365' } },
      now,
    });
    expect(r).toEqual({ payload: { venture: 'tool', tier: 'team', id: 'cs_1', issued: '2026-09-18', seats: 5, expires: '2027-09-18' }, email: 'a@b.c' });
  });
  it('defaults tier and ignores bad seat/expiry values', () => {
    const r = payloadFromSession({ session: { id: 'cs_2', payment_status: 'paid', metadata: { venture: 'tool', seats: 'x', expires_days: '-3' } }, now });
    expect(r?.payload).toEqual({ venture: 'tool', tier: 'pro', id: 'cs_2', issued: '2026-09-18' });
    expect(r?.email).toBeNull();
  });
  it('refuses unpaid sessions and sessions without a venture', () => {
    expect(payloadFromSession({ session: { id: 'x', payment_status: 'unpaid', metadata: { venture: 'tool' } } })).toBeNull();
    expect(payloadFromSession({ session: { id: 'x', payment_status: 'paid', metadata: {} } })).toBeNull();
  });
});

describe('stripe signatures', () => {
  const secret = 'whsec_test';
  const body = '{"id":"evt_1","type":"checkout.session.completed"}';
  const t = Math.floor(now.getTime() / 1000);

  it('parses the header', () => {
    expect(parseStripeSignature('t=1,v1=aa,v1=bb')).toEqual({ t: 1, v1: ['aa', 'bb'] });
    expect(parseStripeSignature('garbage')).toBeNull();
  });
  it('accepts a correctly signed body within tolerance', async () => {
    const header = await signStripePayload(body, secret, t);
    expect(await verifyStripeSignature(body, header, secret, { now })).toBe(true);
  });
  it('rejects a tampered body, wrong secret, or stale timestamp', async () => {
    const header = await signStripePayload(body, secret, t);
    expect(await verifyStripeSignature(body + ' ', header, secret, { now })).toBe(false);
    expect(await verifyStripeSignature(body, header, 'other', { now })).toBe(false);
    expect(await verifyStripeSignature(body, header, secret, { now: new Date(now.getTime() + 600_000) })).toBe(false);
  });
});
