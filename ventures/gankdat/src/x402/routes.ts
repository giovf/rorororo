import { createFacilitatorConfig } from '@coinbase/x402';
import { Hono } from 'hono';
import { paymentMiddleware } from 'x402-hono';
import { failure } from '../lib/envelope';
import { handleSourceQuery } from '../routes/data';
import { listSources } from '../sources/registry';
import type { AppEnv } from '../types';

// Pay-per-request lane for agents with no account: payment IS the auth, so no
// API key and no credit metering here. Dark by default — everything 404s until
// X402_WALLET_ADDRESS is configured (PRD: ships dark, wallet is open question).
//
// Protocol flow (x402-hono): unpaid request → 402 + payment-requirements body
// → agent pays → retries with X-PAYMENT header → middleware verifies via the
// facilitator → handler runs → settlement recorded in X-PAYMENT-RESPONSE.

const DEFAULT_PRICE_USD = '$0.005';
const DEFAULT_NETWORK = 'base';
// x402-hono networks we accept as an override (it throws on anything else).
const SUPPORTED_NETWORKS = new Set(['base', 'base-sepolia']);

export const x402Routes = new Hono<AppEnv>()
  .use('/data/:source', async (c, next) => {
    const wallet = c.env.X402_WALLET_ADDRESS;
    if (!wallet) {
      return c.json(failure('not_found', `No route for ${c.req.method} ${c.req.path}`), 404);
    }

    const price = c.env.X402_PRICE_USD || DEFAULT_PRICE_USD;
    const network = c.env.X402_NETWORK || DEFAULT_NETWORK;
    // Validate the operator-supplied overrides up front: paymentMiddleware THROWS
    // on a bad price/network, which would 500 every request (paid and unpaid).
    // A clean 503 + log names the misconfiguration instead.
    if (!/^\$\d+(\.\d+)?$/.test(price) || !SUPPORTED_NETWORKS.has(network)) {
      console.error(
        JSON.stringify({ level: 'error', event: 'x402_misconfigured', price, network }),
      );
      return c.json(failure('unavailable', 'x402 is misconfigured; retry later'), 503);
    }

    // Facilitator (verify + settle): prefer Coinbase CDP (authenticated, works
    // on base + base-sepolia) when CDP creds are set; else an explicit URL; else
    // the default public facilitator (rate-limited — fine only for probing).
    const facilitator =
      c.env.CDP_API_KEY_ID && c.env.CDP_API_KEY_SECRET
        ? createFacilitatorConfig(c.env.CDP_API_KEY_ID, c.env.CDP_API_KEY_SECRET)
        : c.env.X402_FACILITATOR_URL
          ? { url: c.env.X402_FACILITATOR_URL as `${string}://${string}` }
          : undefined;
    // Built per request: Workers only expose env at request time, and the
    // middleware itself only calls the facilitator when a payment is presented.
    // Per-source pricing (source.x402PriceUsd, default the platform price) so each
    // niche can be priced to its value. Built from the registry.
    const routesConfig = Object.fromEntries(
      listSources().map((s) => [
        `/x402/data/${s.slug}`,
        { price: s.x402PriceUsd || price, network: network as 'base' },
      ]),
    );
    const middleware = paymentMiddleware(
      wallet as `0x${string}`,
      routesConfig,
      // @coinbase/x402 and x402-hono ship structurally-identical but nominally
      // distinct FacilitatorConfig types (url: string vs `${string}://${string}`).
      facilitator as Parameters<typeof paymentMiddleware>[2],
    );
    const paid = c.req.header('X-PAYMENT') !== undefined;
    const response = await middleware(c, async () => {
      await next();
    });
    // On a rejected payment the middleware RETURNS its 402 (so `response` is the
    // 402); on success it mutates c.res and may return void. Check the actual
    // outcome, not c.res.ok alone — the c.res getter lazily materializes a 200
    // when unset, which would log a false settlement for every failed payment.
    const outcome = response ?? c.res;
    if (paid && outcome.ok) {
      console.log(
        JSON.stringify({ level: 'info', event: 'x402_paid', path: c.req.path, price }),
      );
      // Revenue analytics (90-day history via `npm run traffic`) — Workers
      // Logs alone rotates out in days. UA names the paying agent.
      c.env.TRAFFIC.writeDataPoint({
        blobs: ['x402_paid', c.req.header('User-Agent') ?? '', c.req.path],
        doubles: [1],
        indexes: ['x402_paid'],
      });
    }
    return response;
  })
  .get('/data/:source', handleSourceQuery);
