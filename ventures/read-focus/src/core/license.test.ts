import { generateKeyPair, issueLicense } from '@foundry/licensing';
import { describe, expect, it } from 'vitest';
import { activateKey } from './license.js';

describe('activateKey', () => {
  it('rejects keys signed by another key pair and empty input, regardless of the server', async () => {
    const other = await generateKeyPair();
    const key = await issueLicense(other.privateKey, { venture: 'read-focus', tier: 'pro', id: 'cs_x', issued: '2026-09-18' });
    const neverCalled: typeof fetch = () => Promise.reject(new Error('should not be called'));
    expect(await activateKey(key, neverCalled)).toEqual({ tier: 'free', reason: 'bad-signature' });
    expect(await activateKey('   ', neverCalled)).toEqual({ tier: 'free', reason: 'empty' });
  });
});
