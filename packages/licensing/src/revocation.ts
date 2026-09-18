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

/**
 * Calls the worker; any network failure counts as "not revoked" (grace). In `activate` mode
 * the call is a POST that also counts the activation (used once, when a key is entered).
 */
export class RemoteRevocations implements RevocationStore {
  constructor(
    private readonly baseUrl: string,
    private readonly fetchImpl: typeof fetch = fetch,
    private readonly mode: 'status' | 'activate' = 'status',
  ) {}
  async isRevoked(id: string): Promise<boolean> {
    try {
      const base = `${this.baseUrl.replace(/\/$/, '')}/v1/keys/${encodeURIComponent(id)}`;
      const res =
        this.mode === 'activate'
          ? await this.fetchImpl(`${base}/activate`, { method: 'POST' })
          : await this.fetchImpl(`${base}/status`);
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
