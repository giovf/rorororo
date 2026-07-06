export interface KeyContext {
  keyId: string;
  plan: string;
  /** Hex SHA-256 of the presented key — lets self-serve routes invalidate the KV cache. */
  keyHash: string;
  /** Sum of credit_ledger deltas, cached with the key record. */
  creditsGranted: number;
}

export type AppVariables = {
  requestId: string;
  keyCtx?: KeyContext;
  creditsCharged?: number;
};

export type AppEnv = {
  Bindings: CloudflareBindings;
  Variables: AppVariables;
};
