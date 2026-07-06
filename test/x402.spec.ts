import { createExecutionContext, env, SELF, waitOnExecutionContext } from 'cloudflare:test';
import { afterEach, describe, expect, it, vi } from 'vitest';
import worker from '../src/index';
import type { ErrorEnvelope } from '../src/lib/envelope';
import { stubOrigins } from './helpers/origin-mock';

const X402_URL = 'https://example.com/x402/data/uk-planning';
const TEST_WALLET = '0x1111111111111111111111111111111111111111';

/** Run a request through the real worker with x402 env vars switched on. */
async function litFetch(
  url: string,
  init?: RequestInit,
  overrides: Partial<CloudflareBindings> = {},
): Promise<Response> {
  const ctx = createExecutionContext();
  const litEnv = {
    ...env,
    X402_WALLET_ADDRESS: TEST_WALLET,
    X402_NETWORK: 'base-sepolia',
    ...overrides,
  } as CloudflareBindings;
  const res = await worker.fetch(new Request(url, init), litEnv, ctx);
  await waitOnExecutionContext(ctx);
  return res;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('/x402/data/:source', () => {
  it('is dark (404) while X402_WALLET_ADDRESS is unset', async () => {
    const res = await SELF.fetch(X402_URL);
    expect(res.status).toBe(404);
    const body = (await res.json()) as ErrorEnvelope;
    expect(body.error.code).toBe('not_found');
  });

  it('returns 402 payment requirements naming the wallet and price when lit', async () => {
    const res = await litFetch(X402_URL);
    expect(res.status).toBe(402);
    const body = (await res.json()) as {
      x402Version: number;
      accepts: { payTo: string; network: string; maxAmountRequired: string; resource: string }[];
    };
    expect(body.accepts).toHaveLength(1);
    expect(body.accepts[0]?.payTo.toLowerCase()).toBe(TEST_WALLET);
    expect(body.accepts[0]?.network).toBe('base-sepolia');
    expect(Number(body.accepts[0]?.maxAmountRequired)).toBeGreaterThan(0);
  });

  it('rejects a malformed X-PAYMENT header with 402, not a crash', async () => {
    stubOrigins({}); // any facilitator call would throw loudly
    const res = await litFetch(X402_URL, {
      headers: { 'X-PAYMENT': 'not-a-real-payment' },
    });
    expect(res.status).toBe(402);
  });

  it('does not leak the paid lane into the authed REST lane', async () => {
    // Same slug via /v1 still requires an API key even when x402 is lit.
    const res = await litFetch('https://example.com/v1/data/uk-planning');
    expect(res.status).toBe(401);
  });

  // #11 — a bad price/network env override returns a clean 503, not a 500 from
  // paymentMiddleware throwing on every request.
  it('returns 503 (not 500) when misconfigured', async () => {
    const badPrice = await litFetch(X402_URL, undefined, { X402_PRICE_USD: '0' });
    expect(badPrice.status).toBe(503);
    expect(((await badPrice.json()) as ErrorEnvelope).error.code).toBe('unavailable');

    const badNetwork = await litFetch(X402_URL, undefined, { X402_NETWORK: 'ethereum' });
    expect(badNetwork.status).toBe(503);
  });
});
