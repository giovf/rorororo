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

  // Happy path: structurally-valid payment → facilitator verifies → data served
  // → facilitator settles → receipt in X-PAYMENT-RESPONSE. The facilitator is
  // stubbed (its /verify + /settle are the only crypto in the flow); the real
  // settlement was proven live on base-sepolia and base mainnet.
  it('serves data and returns a settlement receipt for a verified payment', async () => {
    const FACILITATOR = 'https://facilitator.test';
    const TX_HASH = `0x${'ab'.repeat(32)}`;
    const PAYER = '0x2222222222222222222222222222222222222222';
    const calls: string[] = [];

    // One stub, three outbound surfaces: verify, settle, and the data origin.
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input instanceof Request ? input.url : input);
        calls.push(url);
        if (url === `${FACILITATOR}/verify`) {
          return Promise.resolve(Response.json({ isValid: true, payer: PAYER }));
        }
        if (url === `${FACILITATOR}/settle`) {
          return Promise.resolve(
            Response.json({
              success: true,
              transaction: TX_HASH,
              network: 'base-sepolia',
              payer: PAYER,
            }),
          );
        }
        if (url.startsWith('https://www.planning.data.gov.uk/')) {
          return Promise.resolve(
            Response.json({
              entities: [
                { entity: 1, reference: 'A/1', 'organisation-entity': 109, description: 'x' },
              ],
              links: {},
              count: 1,
            }),
          );
        }
        throw new Error(`unexpected outbound fetch in test: ${url}`);
      }),
    );

    // Matches x402's PaymentPayloadSchema (exact/evm); signature validity is the
    // facilitator's concern, so any well-formed hex passes to /verify.
    const payment = btoa(
      JSON.stringify({
        x402Version: 1,
        scheme: 'exact',
        network: 'base-sepolia',
        payload: {
          signature: `0x${'11'.repeat(65)}`,
          authorization: {
            from: PAYER,
            to: TEST_WALLET,
            value: '5000', // $0.005 in USDC atomic units
            validAfter: '0',
            validBefore: '99999999999',
            nonce: `0x${'33'.repeat(32)}`,
          },
        },
      }),
    );

    // X402_FACILITATOR_URL points the middleware at the stub (no CDP creds in tests).
    const res = await litFetch(
      X402_URL,
      { headers: { 'X-PAYMENT': payment } },
      { X402_FACILITATOR_URL: FACILITATOR },
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; data: unknown[] };
    expect(body.ok).toBe(true);

    // Settlement receipt: base64 JSON in X-PAYMENT-RESPONSE.
    const receiptHeader = res.headers.get('X-PAYMENT-RESPONSE');
    expect(receiptHeader).toBeTruthy();
    const receipt = JSON.parse(atob(receiptHeader!)) as { success: boolean; transaction: string };
    expect(receipt.success).toBe(true);
    expect(receipt.transaction).toBe(TX_HASH);

    // Exactly one verify and one settle, in that order.
    const facilitatorCalls = calls.filter((u) => u.startsWith(FACILITATOR));
    expect(facilitatorCalls).toEqual([`${FACILITATOR}/verify`, `${FACILITATOR}/settle`]);
  });

  it('does not settle when the facilitator rejects the payment', async () => {
    const FACILITATOR = 'https://facilitator.test';
    const calls: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input instanceof Request ? input.url : input);
        calls.push(url);
        if (url === `${FACILITATOR}/verify`) {
          return Promise.resolve(
            Response.json({ isValid: false, invalidReason: 'insufficient_funds' }),
          );
        }
        throw new Error(`unexpected outbound fetch in test: ${url}`);
      }),
    );

    const payment = btoa(
      JSON.stringify({
        x402Version: 1,
        scheme: 'exact',
        network: 'base-sepolia',
        payload: {
          signature: `0x${'11'.repeat(65)}`,
          authorization: {
            from: '0x2222222222222222222222222222222222222222',
            to: TEST_WALLET,
            value: '5000',
            validAfter: '0',
            validBefore: '99999999999',
            nonce: `0x${'33'.repeat(32)}`,
          },
        },
      }),
    );

    const res = await litFetch(
      X402_URL,
      { headers: { 'X-PAYMENT': payment } },
      { X402_FACILITATOR_URL: FACILITATOR },
    );
    expect(res.status).toBe(402);
    expect(res.headers.get('X-PAYMENT-RESPONSE')).toBeNull();
    expect(calls).toEqual([`${FACILITATOR}/verify`]); // no settle, no origin hit
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
