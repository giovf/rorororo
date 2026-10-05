import { RemoteRevocations, verifyLicense, verifyLicenseOnline } from '@foundry/licensing';
import type { Tier } from './tier.js';

/**
 * Public half of the Foundry signing key — safe to ship. A `--test` build without the production
 * signing key bakes a throwaway pair's public half here instead (build.js define; e2e/run.ts).
 */
declare const __LICENSE_TEST_PUBLIC_KEY__: string | undefined;
export const LICENSE_PUBLIC_KEY =
  (typeof __LICENSE_TEST_PUBLIC_KEY__ === 'string' && __LICENSE_TEST_PUBLIC_KEY__) ||
  'PkTQCEYFTv062z5DmS-saXuK_OPwhpIlGO6bxIPq5U0';
export const VENTURE = 'read-focus';
/** Licence worker; contacted ONCE, when a key is activated, to check it wasn't refunded. */
export const LICENSE_SERVER = 'https://foundry-licenses.faceless-api.workers.dev';

export async function tierForKey(key: string): Promise<Tier> {
  if (!key.trim()) return 'free';
  const result = await verifyLicense(LICENSE_PUBLIC_KEY, key, { venture: VENTURE });
  return result.valid ? 'pro' : 'free';
}

/**
 * Activation check: offline signature + one request to the revocation list. A network
 * failure counts as not revoked, so activation still works without connectivity.
 */
export async function activateKey(
  key: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ tier: Tier; reason?: string }> {
  if (!key.trim()) return { tier: 'free', reason: 'empty' };
  const result = await verifyLicenseOnline(LICENSE_PUBLIC_KEY, key, new RemoteRevocations(LICENSE_SERVER, fetchImpl, 'activate'), {
    venture: VENTURE,
  });
  return result.valid ? { tier: 'pro' } : { tier: 'free', reason: result.reason };
}
