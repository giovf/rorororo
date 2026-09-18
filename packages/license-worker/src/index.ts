import { createHandler, type Env } from './worker.js';

export { ACTIVATION_WINDOW_MS, MAX_ACTIVATIONS_PER_WINDOW, createHandler, licenseEmail } from './worker.js';
export type { Deps, Env, KV } from './worker.js';

const handler = createHandler();

/** Cloudflare Workers module entry. */
export const worker = {
  fetch: (request: Request, env: Env): Promise<Response> => handler(request, env),
};
