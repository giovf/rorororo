import { Hono } from 'hono';
import { paymentMiddleware } from 'x402-hono';
import { failure } from '../lib/envelope';
import { handleSourceQuery } from '../routes/data';
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

export const x402Routes = new Hono<AppEnv>()
  .use('/data/:source', async (c, next) => {
    const wallet = c.env.X402_WALLET_ADDRESS;
    if (!wallet) {
      return c.json(failure('not_found', `No route for ${c.req.method} ${c.req.path}`), 404);
    }
    // Built per request: Workers only expose env at request time, and the
    // middleware itself only calls the facilitator when a payment is presented.
    const middleware = paymentMiddleware(
      wallet as `0x${string}`,
      {
        '/x402/data/*': {
          price: c.env.X402_PRICE_USD || DEFAULT_PRICE_USD,
          network: (c.env.X402_NETWORK || DEFAULT_NETWORK) as 'base',
        },
      },
      c.env.X402_FACILITATOR_URL ? { url: c.env.X402_FACILITATOR_URL as `${string}://${string}` } : undefined,
    );
    const paid = c.req.header('X-PAYMENT') !== undefined;
    const response = await middleware(c, async () => {
      await next();
    });
    if (paid && c.res.ok) {
      console.log(
        JSON.stringify({
          level: 'info',
          event: 'x402_paid',
          path: c.req.path,
          price: c.env.X402_PRICE_USD || DEFAULT_PRICE_USD,
        }),
      );
    }
    return response;
  })
  .get('/data/:source', handleSourceQuery);
