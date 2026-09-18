import { beforeAll, describe, expect, it } from 'vitest';
import {
  generateKeyPair,
  issueLicense,
  parseLicense,
  verifyLicense,
  type KeyPair,
  type LicensePayload,
} from './license.js';

let keys: KeyPair;
let other: KeyPair;
const payload: LicensePayload = {
  venture: 'flow-tool',
  tier: 'pro',
  id: 'cs_test_123',
  issued: '2026-09-18',
};

beforeAll(async () => {
  keys = await generateKeyPair();
  other = await generateKeyPair();
});

describe('license keys', () => {
  it('round-trips a perpetual key', async () => {
    const key = await issueLicense(keys.privateKey, payload);
    expect(key.startsWith('FNDRY1.')).toBe(true);
    const result = await verifyLicense(keys.publicKey, key, { venture: 'flow-tool' });
    expect(result).toEqual({ valid: true, payload });
  });

  it('tolerates surrounding whitespace when pasted', async () => {
    const key = await issueLicense(keys.privateKey, payload);
    expect((await verifyLicense(keys.publicKey, `  ${key}\n`)).valid).toBe(true);
  });

  it('rejects a key signed by another private key', async () => {
    const key = await issueLicense(other.privateKey, payload);
    expect(await verifyLicense(keys.publicKey, key)).toEqual({ valid: false, reason: 'bad-signature' });
  });

  it('rejects a tampered payload', async () => {
    const key = await issueLicense(keys.privateKey, payload);
    const [prefix, , sig] = key.split('.');
    const forged = btoa(JSON.stringify({ ...payload, tier: 'enterprise' }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    expect(await verifyLicense(keys.publicKey, `${prefix}.${forged}.${sig}`)).toEqual({
      valid: false,
      reason: 'bad-signature',
    });
  });

  it('rejects malformed input', async () => {
    expect(parseLicense('nope')).toBeNull();
    expect(parseLicense('FNDRY1.!!!.???')).toBeNull();
    expect(await verifyLicense(keys.publicKey, 'FNDRY1.abc')).toEqual({ valid: false, reason: 'malformed' });
  });

  it('enforces venture and expiry', async () => {
    const key = await issueLicense(keys.privateKey, { ...payload, expires: '2026-12-31' });
    expect(await verifyLicense(keys.publicKey, key, { venture: 'other' })).toEqual({
      valid: false,
      reason: 'wrong-venture',
    });
    expect((await verifyLicense(keys.publicKey, key, { now: new Date('2026-12-01') })).valid).toBe(true);
    expect(await verifyLicense(keys.publicKey, key, { now: new Date('2027-01-01') })).toEqual({
      valid: false,
      reason: 'expired',
    });
  });
});
