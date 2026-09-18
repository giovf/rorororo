import { parseLicense, verifyLicense, type VerifyOptions, type VerifyResult } from './license.js';

/** Online layer: a key can be revoked (refund, abuse) or temporarily blocked from new activations. */
export interface RevocationStore {
  isRevoked(id: string): Promise<boolean>;
  /** Only meaningful for activation stores; default false. */
  isBlocked?(id: string): Promise<boolean>;
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
  private last: { id: string; revoked: boolean; blocked: boolean } | null = null;

  private async call(id: string): Promise<{ revoked: boolean; blocked: boolean }> {
    if (this.last?.id === id) return this.last;
    let result = { revoked: false, blocked: false };
    try {
      const base = `${this.baseUrl.replace(/\/$/, '')}/v1/keys/${encodeURIComponent(id)}`;
      const res =
        this.mode === 'activate'
          ? await this.fetchImpl(`${base}/activate`, { method: 'POST' })
          : await this.fetchImpl(`${base}/status`);
      if (res.ok) {
        const body = (await res.json()) as { revoked?: boolean; blocked?: boolean };
        result = { revoked: body.revoked === true, blocked: body.blocked === true };
      }
    } catch {
      // network failure = grace
    }
    this.last = { id, ...result };
    return result;
  }

  async isRevoked(id: string): Promise<boolean> {
    return (await this.call(id)).revoked;
  }

  async isBlocked(id: string): Promise<boolean> {
    return (await this.call(id)).blocked;
  }
}

export type OnlineVerifyResult = VerifyResult | { valid: false; reason: 'revoked' | 'blocked' };

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
  if (revocations.isBlocked && (await revocations.isBlocked(id))) return { valid: false, reason: 'blocked' };
  return offline;
}
