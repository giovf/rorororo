import { parseLicense, verifyLicense, type VerifyOptions, type VerifyResult } from './license.js';

/** Online layer: a key can be revoked (refund, abuse) by its payload id. */
export interface RevocationStore {
  isRevoked(id: string): Promise<boolean>;
}

export class InMemoryRevocations implements RevocationStore {
  private readonly ids = new Set<string>();
  revoke(id: string): void {
    this.ids.add(id);
  }
  isRevoked(id: string): Promise<boolean> {
    return Promise.resolve(this.ids.has(id));
  }
}

/** Calls the worker's status endpoint; any network failure counts as "not revoked" (grace). */
export class RemoteRevocations implements RevocationStore {
  constructor(
    private readonly baseUrl: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}
  async isRevoked(id: string): Promise<boolean> {
    try {
      const res = await this.fetchImpl(`${this.baseUrl.replace(/\/$/, '')}/v1/keys/${encodeURIComponent(id)}/status`);
      if (!res.ok) return false;
      const body = (await res.json()) as { revoked?: boolean };
      return body.revoked === true;
    } catch {
      return false;
    }
  }
}

export type OnlineVerifyResult = VerifyResult | { valid: false; reason: 'revoked' };

/** Offline verification first (cheap, authoritative on signature), then the revocation check. */
export async function verifyLicenseOnline(
  publicKey: string,
  text: string,
  revocations: RevocationStore,
  options: VerifyOptions = {},
): Promise<OnlineVerifyResult> {
  const offline = await verifyLicense(publicKey, text, options);
  if (!offline.valid) return offline;
  const id = parseLicense(text)?.payload.id ?? offline.payload.id;
  if (await revocations.isRevoked(id)) return { valid: false, reason: 'revoked' };
  return offline;
}
