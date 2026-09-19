import { createHandler, type Env } from './worker.js';

export { ACTIVATION_WINDOW_MS, MAX_ACTIVATIONS_PER_WINDOW, createHandler, licenseEmail } from './worker.js';
export type { Deps, Env, KV } from './worker.js';

import { storeInbound, type InboundMessage } from './mail.js';

const handler = createHandler();

/** Cloudflare Workers module entry: HTTP (licences, admin) + inbound email (support inbox). */
export const worker = {
  fetch: (request: Request, env: Env): Promise<Response> => handler(request, env),
  email: async (message: InboundMessage, env: Env): Promise<void> => {
    await storeInbound(env, message);
  },
};

// Workers require the module's default export to be the handler object.
// eslint-disable-next-line no-restricted-syntax
export default worker;
