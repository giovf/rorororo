// Monthly usage counters in KV (CACHE), keyed usage:<keyId>:<yyyymm>.
//
// Best-effort by design (PRD): KV is eventually consistent and the
// read-modify-write below can lose increments under concurrency, slightly
// over-serving. The accurate upgrade path is a Durable Object per key
// (single-writer counter) — documented here and in the runbook, deliberately
// NOT built for v1.

const COUNTER_TTL_SECONDS = 62 * 24 * 3600; // two billing periods, then self-cleans

export function currentPeriod(date: Date = new Date()): string {
  return `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

const usageKey = (keyId: string, period: string): string => `usage:${keyId}:${period}`;

export async function getUsage(
  env: CloudflareBindings,
  keyId: string,
  period: string,
): Promise<number> {
  return Number((await env.CACHE.get(usageKey(keyId, period))) ?? '0');
}

/** Returns the new period total. */
export async function incrementUsage(
  env: CloudflareBindings,
  keyId: string,
  cost: number,
  period: string,
): Promise<number> {
  const next = (await getUsage(env, keyId, period)) + cost;
  await env.CACHE.put(usageKey(keyId, period), String(next), {
    expirationTtl: COUNTER_TTL_SECONDS,
  });
  return next;
}
