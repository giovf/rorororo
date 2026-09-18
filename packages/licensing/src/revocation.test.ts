import { describe, expect, it } from 'vitest';
import { generateKeyPair, issueLicense } from './license.js';
import { InMemoryRevocations, RemoteRevocations, verifyLicenseOnline } from './revocation.js';

describe('verifyLicenseOnline', () => {
  it('passes valid keys and blocks revoked ones', async () => {
    const keys = await generateKeyPair();
    const key = await issueLicense(keys.privateKey, { venture: 't', tier: 'pro', id: 'cs_9', issued: '2026-09-18' });
    const store = new InMemoryRevocations();
    expect((await verifyLicenseOnline(keys.publicKey, key, store)).valid).toBe(true);
    store.revoke('cs_9');
    expect(await verifyLicenseOnline(keys.publicKey, key, store)).toEqual({ valid: false, reason: 'revoked' });
  });

  it('treats network failure as not revoked (grace)', async () => {
    const remote = new RemoteRevocations('https://x.invalid', () => Promise.reject(new Error('offline')));
    expect(await remote.isRevoked('any')).toBe(false);
    const ok = new RemoteRevocations('https://x.invalid/', () => Promise.resolve(new Response(JSON.stringify({ revoked: true }))));
    expect(await ok.isRevoked('any')).toBe(true);
  });
});
