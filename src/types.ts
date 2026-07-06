export interface KeyContext {
  keyId: string;
  plan: string;
  /** Hex SHA-256 of the presented key — lets self-serve routes invalidate the KV cache. */
  keyHash: string;
}

export type AppVariables = {
  requestId: string;
  keyCtx?: KeyContext;
};

export type AppEnv = {
  Bindings: CloudflareBindings;
  Variables: AppVariables;
};
