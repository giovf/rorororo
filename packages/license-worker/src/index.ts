import { createHandler, type Env } from './worker.js';
import { adaptKV, type KVNamespaceBinding } from './kv.js';

export { ACTIVATION_WINDOW_MS, MAX_ACTIVATIONS_PER_WINDOW, createHandler, licenseEmail } from './worker.js';
export type { Deps, Env, KV } from './worker.js';
export { adaptKV } from './kv.js';
export type { KVNamespaceBinding } from './kv.js';
export { DOWNLOADS, downloadEmail, mintDownloadToken, verifyDownloadToken } from './downloads.js';
export type { DownloadClaim, DownloadProduct } from './downloads.js';

import { storeInbound, type InboundMessage } from './mail.js';

const handler = createHandler();

/** What Cloudflare binds: the raw KV namespace, which `adaptKV` turns into the handler's `KV` (kv.ts). */
export type BoundEnv = Omit<Env, 'LICENSES'> & { LICENSES: KVNamespaceBinding };

const withKV = (env: BoundEnv): Env => ({ ...env, LICENSES: adaptKV(env.LICENSES) });

/** Cloudflare Workers module entry: HTTP (licences, admin) + inbound email (support inbox). */
export const worker = {
  fetch: (request: Request, env: BoundEnv): Promise<Response> => handler(request, withKV(env)),
  email: async (message: InboundMessage, env: BoundEnv): Promise<void> => {
    await storeInbound(withKV(env), message);
  },
};

// Workers require the module's default export to be the handler object.
// eslint-disable-next-line no-restricted-syntax
export default worker;
