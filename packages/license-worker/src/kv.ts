/**
 * The live KV binding behind the Worker's minimal `KV` surface (foundry `live-read-for-worker-summaries`,
 * 2026-11-07). `worker.ts` types `LICENSES` as `KV` — `get`, `put` and `list(prefix) → string[]` — because the
 * tests run on an in-memory map; Cloudflare's real `KVNamespace` matches `get` and `put` but its `list` takes an
 * options object and answers `{ keys: [{ name }], list_complete, cursor }` in pages of up to 1,000. From 2026-11-05
 * to 11-07 the Worker handed the binding straight to the handler, so the first route to call `list` from a request
 * (`GET /v1/downloads/summary`, `readDays` in sales.ts) iterated that object, threw, and the Daily numbers row read
 * `own checkout 30d: n/a (HTTP 500)` twice while every test passed; `listMail` had the same shape bug unexercised.
 * `adaptKV` wraps the binding once at the entry point: `list` walks every page under the prefix and returns the key
 * names, so the handler's contract is met by the thing that actually serves it.
 */
import type { KV } from './worker.js';

/** The subset of Cloudflare's `KVNamespace` this Worker calls — kept local so no Workers types are needed. */
export interface KVNamespaceBinding {
  get(key: string): Promise<string | null>;
  get(key: string, type: 'arrayBuffer'): Promise<ArrayBuffer | null>;
  put(key: string, value: string): Promise<void>;
  list(options: { prefix?: string; cursor?: string; limit?: number }): Promise<{
    keys: { name: string }[];
    list_complete: boolean;
    cursor?: string;
  }>;
}

/** Pages a binding's `list` answers before the walk stops: 1,000 keys a page, far above any key set here. */
export const LIST_PAGE_CAP = 100;

/** The binding as the handler's `KV`: `get`/`put` as they are, `list(prefix)` as the names of every key under it. */
export function adaptKV(binding: KVNamespaceBinding): KV {
  return {
    get: ((key: string, type?: 'arrayBuffer') => (type === 'arrayBuffer' ? binding.get(key, 'arrayBuffer') : binding.get(key))) as KV['get'],
    put: (key, value) => binding.put(key, value),
    list: async (prefix) => {
      const names: string[] = [];
      let cursor: string | undefined;
      for (let page = 0; page < LIST_PAGE_CAP; page += 1) {
        const res = await binding.list(cursor ? { prefix, cursor } : { prefix });
        for (const k of res.keys) names.push(k.name);
        if (res.list_complete || !res.cursor) break;
        cursor = res.cursor;
      }
      return names;
    },
  };
}
