// Request-line parsing for the fetch relay (`scripts/fetch-relay.mjs`), split out so it is testable:
//
//   [HEAD|GET] [RANGE=a-b] <https url>
//   POST <https url> <json>              (foundry `relay-post-json`, 2026-10-14)
//
// A POST line carries one JSON document after the URL — the rest of the line, so spaces inside the
// JSON are fine. The body must parse, stay under POST_MAX_BYTES, and never look like a credential:
// a key named like one (token, secret, password, api_key, private_key, authorization, cookie…) or
// a value shaped like one (JWT, Stripe/GitHub/Slack/OpenAI/AWS key prefixes, a Bearer header, a
// PEM private key) is refused before anything is sent. Everything the relay fetches lands in a
// public repo, so the public-hosts-and-public-bodies rule is the same as for GET. A 32-byte hex
// value on its own is NOT refused: JSON-RPC `eth_getLogs` topics and block hashes are 0x + 64 hex
// too, and a private key under a key named `privateKey`/`key`/`secret` is caught by the key rule.

export const POST_MAX_BYTES = 4096;

export interface RelayLine {
  method: 'GET' | 'HEAD' | 'POST';
  range?: string;
  url: string;
  /** POST only: the JSON body exactly as written on the line. */
  body?: string;
  /** Set when the line is malformed: the relay records it under meta.json and sends nothing. */
  error?: string;
}

const CREDENTIAL_KEY =
  /(^|[^a-z])(api[-_]?key|apikey|token|password|passwd|private[-_]?key|privkey|authorization|bearer|cookie|credential|mnemonic|seed[-_]?phrase)$|secret/i;
const EXACT_KEY = /^(key|pk|sk|auth|pass|pwd)$/i;
const CREDENTIAL_VALUE: [RegExp, string][] = [
  [/^eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]*$/, 'a JWT'],
  [/^(sk|pk|rk|whsec)_(live|test)_[A-Za-z0-9]{8,}/, 'a Stripe key'],
  [/^(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}|^github_pat_[A-Za-z0-9_]{20,}/, 'a GitHub token'],
  [/^xox[abprs]-[A-Za-z0-9-]{10,}/, 'a Slack token'],
  [/^AKIA[0-9A-Z]{16}$/, 'an AWS access key id'],
  [/^(sk-|xai-|AIza)[A-Za-z0-9_-]{16,}/, 'an API key'],
  [/^Bearer\s+\S+/i, 'a Bearer header'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'a PEM private key'],
  [/^(apify_api_|re_|shpat_|glpat-|npm_)[A-Za-z0-9_-]{16,}/, 'an API token'],
];

/** The first credential-shaped key or value in a parsed JSON document, or null when it is clean. */
export function credentialShaped(doc: unknown, at = '$'): string | null {
  if (typeof doc === 'string') {
    for (const [re, what] of CREDENTIAL_VALUE) if (re.test(doc)) return `${at} looks like ${what}`;
    return null;
  }
  if (Array.isArray(doc)) {
    for (const [i, v] of doc.entries()) {
      const hit = credentialShaped(v, `${at}[${i}]`);
      if (hit) return hit;
    }
    return null;
  }
  if (doc && typeof doc === 'object') {
    for (const [k, v] of Object.entries(doc)) {
      if (CREDENTIAL_KEY.test(k) || EXACT_KEY.test(k))
        return `${at}.${k} is a credential-shaped key`;
      const hit = credentialShaped(v, `${at}.${k}`);
      if (hit) return hit;
    }
  }
  return null;
}

/** Validates a POST body: JSON, under the byte cap, no credential. Returns the error text or null. */
export function postBodyError(body: string | undefined): string | null {
  if (!body) return 'POST needs a JSON body after the url';
  const bytes = new TextEncoder().encode(body).length;
  if (bytes > POST_MAX_BYTES) return `POST body is ${bytes} bytes; the cap is ${POST_MAX_BYTES}`;
  let doc: unknown;
  try {
    doc = JSON.parse(body);
  } catch {
    return 'POST body is not valid JSON';
  }
  if (!doc || typeof doc !== 'object') return 'POST body must be a JSON object or array';
  const hit = credentialShaped(doc);
  return hit ? `refused: ${hit} (never a credential through the relay)` : null;
}

/** One request line → a RelayLine, or null for a blank or `#` comment line. */
export function parseLine(line: string): RelayLine | null {
  const t = line.trim();
  if (t === '' || t.startsWith('#')) return null;
  let rest = t;
  let method: RelayLine['method'] = 'GET';
  let range: string | undefined;
  for (;;) {
    const m = /^(\S+)(?:\s+|$)/.exec(rest);
    if (!m || m[0].length === rest.length) break; // the last token is the url
    const token = m[1]!;
    const upper = token.toUpperCase();
    if (upper === 'GET' || upper === 'HEAD' || upper === 'POST') method = upper;
    else if (upper.startsWith('RANGE=')) range = token.slice(6);
    else break;
    rest = rest.slice(m[0].length);
  }
  const urlMatch = /^(\S+)(?:\s+([\s\S]*))?$/.exec(rest);
  const url = urlMatch?.[1] ?? rest;
  const tail = urlMatch?.[2]?.trim();
  if (method !== 'POST') {
    const out: RelayLine = { method, url: tail ? `${url} ${tail}` : url };
    if (range) out.range = range;
    return out;
  }
  const out: RelayLine = { method: 'POST', url };
  if (tail) out.body = tail;
  const error = postBodyError(tail);
  if (error) out.error = error;
  if (range) out.error ??= 'RANGE does not apply to POST';
  return out;
}

/** An allowlist entry: an exact host, or a `.suffix` that matches the suffix itself and any subdomain. */
const HOST_ENTRY = /^\.?[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/;

/**
 * docs/relay/hosts.txt → entries (foundry `relay-allowlist-as-data`, 2026-10-16). One entry per
 * line, `#` comments and blank lines ignored; a line that is not a lower-case host or `.suffix`
 * throws with its line number, so a typo fails the relay run loud instead of silently allowing
 * nothing — or everything.
 */
export function parseHosts(text: string): string[] {
  const out: string[] = [];
  text.split('\n').forEach((raw, i) => {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line) return;
    if (/\s/.test(line) || !HOST_ENTRY.test(line)) {
      throw new Error(`docs/relay/hosts.txt line ${i + 1}: not a host or .suffix: ${raw.trim()}`);
    }
    out.push(line);
  });
  return out;
}

/** True when `hostname` is an exact entry or under a `.suffix` entry of `hosts`. */
export function hostAllowed(hostname: string, hosts: readonly string[]): boolean {
  const h = hostname.toLowerCase();
  return hosts.some((a) => (a.startsWith('.') ? h === a.slice(1) || h.endsWith(a) : h === a));
}

/** Statuses the relay retries after a pause (rate limit, overloaded backend). */
export const RETRY_STATUSES: ReadonlySet<number> = new Set([429, 503]);
/** Retries per line after the first attempt (1 s, 2 s, 4 s → 7 s at most per line). */
export const MAX_RETRIES = 3;
/** Pause between two consecutive lines to the same host (keeper spike 2026-10-17: Base's public RPC
 * answered 429 `request limit reached` to every log query fired back to back; the first three
 * calls in the same second had been served). */
export const SAME_HOST_PACE_MS = 500;
const RETRY_AFTER_CAP_MS = 30_000;

/**
 * How long to wait before retry `attempt` (0-based): the server's `Retry-After` seconds when it
 * sends a sane one (capped at 30 s), else 1 s doubling per attempt.
 */
export function retryDelayMs(retryAfter: string | null | undefined, attempt: number): number {
  const secs = Number(retryAfter);
  if (retryAfter && Number.isFinite(secs) && secs > 0) {
    return Math.min(Math.round(secs * 1000), RETRY_AFTER_CAP_MS);
  }
  return 1000 * 2 ** Math.max(0, attempt);
}
