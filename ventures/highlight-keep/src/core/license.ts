import { RemoteRevocations, verifyLicense, verifyLicenseOnline } from '@foundry/licensing';

export type Tier = 'free' | 'pro';
export const LICENSE_PUBLIC_KEY = 'PkTQCEYFTv062z5DmS-saXuK_OPwhpIlGO6bxIPq5U0';
export const VENTURE = 'highlight-keep';
export const LICENSE_SERVER = 'https://foundry-licenses.faceless-api.workers.dev';

export async function tierForKey(key: string): Promise<Tier> {
  if (!key.trim()) return 'free';
  return (await verifyLicense(LICENSE_PUBLIC_KEY, key, { venture: VENTURE })).valid ? 'pro' : 'free';
}

export async function activateKey(key: string, fetchImpl: typeof fetch = fetch): Promise<{ tier: Tier; reason?: string }> {
  if (!key.trim()) return { tier: 'free', reason: 'empty' };
  const result = await verifyLicenseOnline(LICENSE_PUBLIC_KEY, key, new RemoteRevocations(LICENSE_SERVER, fetchImpl, 'activate'), { venture: VENTURE });
  return result.valid ? { tier: 'pro' } : { tier: 'free', reason: result.reason };
}
