import { verifyLicense } from '@foundry/licensing';
import type { Tier } from './tier.js';

/** Public half of the Foundry signing key — safe to ship. */
export const LICENSE_PUBLIC_KEY = 'PkTQCEYFTv062z5DmS-saXuK_OPwhpIlGO6bxIPq5U0';
export const VENTURE = 'read-focus';

export async function tierForKey(key: string): Promise<Tier> {
  if (!key.trim()) return 'free';
  const result = await verifyLicense(LICENSE_PUBLIC_KEY, key, { venture: VENTURE });
  return result.valid ? 'pro' : 'free';
}
