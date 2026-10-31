// Request-line parsing for the fetch relay (`scripts/fetch-relay.mjs`), split out so it is testable:
//
//   [HEAD|GET] [RANGE=a-b] <https url>
//   POST <https url> <json>              (foundry `relay-post-json`, 2026-10-14)
//   [GET] RENDER <https url>             (foundry `relay-rendered-fetch`, 2026-10-22)
//   [GET] RAW <https url>                (foundry `relay-bodies-cap-in-history`, 2026-10-31)
//
// Bodies are what grows the git history (relay blobs were 469 MB of it on 2026-10-31, 201 and
// 188 MB added in two weeks, mostly rendered shelf pages of 4 MB each; the 7-day prune bounds the
// working tree only, every `git fetch --unshallow` still downloads the pack). So an HTML body —
// a GET whose content-type says html, or any RENDER — is committed as extracted text (`htmlToText`:
// script/style dropped, tags stripped, anchors kept as `text (href)`, JSON-LD and the description
// meta kept, whitespace folded), about a tenth of the size and what the readers grep anyway; a
// line that needs the markup says RAW. Every saved body is capped at MAX_BYTES (2 MB, was 8),
// `truncated: true` in meta.json when cut; RANGE still reads a slice of a big file.
//
// A RENDER line opens the page in Playwright's Chromium on the runner and saves the rendered DOM
// (`scripts/fetch-relay.mjs` renderOne) for shelves whose listing pages are client-rendered shells
// (the Wix App Market category pages came back as 0.2–2.5 MB of script tags and zero app links,
// 2026-10-22). GET only — RENDER with HEAD, POST or RANGE is refused on the line; the workflow
// installs Chromium only when a request file carries one (`needsRender`).
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
/** Bytes a saved body may take (foundry `relay-bodies-cap-in-history`, 2026-10-31; was 8 MB). */
export const MAX_BYTES = 2 * 1024 * 1024;
/** Bytes read from a response before extraction: an HTML page is read this far so its text can be
 * kept whole, then the saved body is capped at MAX_BYTES. */
export const FETCH_MAX_BYTES = 8 * 1024 * 1024;

export interface RelayLine {
  method: 'GET' | 'HEAD' | 'POST';
  range?: string;
  /** GET only: open the page in Chromium and save the rendered DOM instead of the raw body. */
  render?: true;
  /** GET only: commit an HTML body as it came (capped) instead of its extracted text. */
  raw?: true;
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
  let render = false;
  let raw = false;
  for (;;) {
    const m = /^(\S+)(?:\s+|$)/.exec(rest);
    if (!m || m[0].length === rest.length) break; // the last token is the url
    const token = m[1]!;
    const upper = token.toUpperCase();
    if (upper === 'GET' || upper === 'HEAD' || upper === 'POST') method = upper;
    else if (upper.startsWith('RANGE=')) range = token.slice(6);
    else if (upper === 'RENDER') render = true;
    else if (upper === 'RAW') raw = true;
    else break;
    rest = rest.slice(m[0].length);
  }
  const urlMatch = /^(\S+)(?:\s+([\s\S]*))?$/.exec(rest);
  const url = urlMatch?.[1] ?? rest;
  const tail = urlMatch?.[2]?.trim();
  if (method !== 'POST') {
    const out: RelayLine = { method, url: tail ? `${url} ${tail}` : url };
    if (range) out.range = range;
    if (render) {
      out.render = true;
      if (method === 'HEAD') out.error = 'RENDER applies to GET only, not HEAD';
      else if (range)
        out.error = 'RANGE does not apply to RENDER (the rendered DOM is capped at 2 MB)';
    }
    if (raw) {
      out.raw = true;
      if (method === 'HEAD') out.error ??= 'RAW applies to GET only, not HEAD';
    }
    return out;
  }
  const out: RelayLine = { method: 'POST', url };
  if (tail) out.body = tail;
  const error = postBodyError(tail);
  if (error) out.error = error;
  if (range) out.error ??= 'RANGE does not apply to POST';
  if (render) out.error ??= 'RENDER applies to GET only, not POST';
  if (raw) out.error ??= 'RAW applies to GET only, not POST';
  return out;
}

/**
 * True when a request file holds at least one RENDER line (ignoring comments and malformed lines):
 * the `fetch relay` workflow installs Chromium only then, so an ordinary relay run stays at ~15 s.
 */
export function needsRender(text: string): boolean {
  return text.split('\n').some((line) => {
    const parsed = parseLine(line);
    return parsed !== null && parsed.render === true && !parsed.error;
  });
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
/** HEAD, GET and POST lines abort after this long (foundry `relay-round-survives-stalled-host`,
 * 2026-10-26; was 90 s for every line — 70 lines at 90 s is 105 min against the step's 12-minute
 * cap). RENDER keeps its own 90 s in fetch-relay.mjs. */
export const FETCH_TIMEOUT_MS = 30_000;
/** Consecutive timeouts on one host after which the round skips that host's remaining lines. */
export const HOST_STALL_LIMIT = 3;

/**
 * Whether a response with `status` is retried: 429 and 503, unless its `Retry-After` says longer
 * than the cap — the server said tomorrow, not soon (gankdat's "being prepared" 503 carries 3600;
 * three capped retries cost the 10-26 sitemap rounds ~95 s a line and the whole step).
 */
export function shouldRetry(status: number, retryAfter: string | null | undefined): boolean {
  if (!RETRY_STATUSES.has(status)) return false;
  const secs = Number(retryAfter);
  return !(retryAfter && Number.isFinite(secs) && secs * 1000 > RETRY_AFTER_CAP_MS);
}

/** Consecutive timeouts per host within one round; at the limit the host is skipped. */
export class HostStalls {
  private readonly runs = new Map<string, number>();
  record(host: string, timedOut: boolean): void {
    this.runs.set(host, timedOut ? (this.runs.get(host) ?? 0) + 1 : 0);
  }
  stalled(host: string): boolean {
    return (this.runs.get(host) ?? 0) >= HOST_STALL_LIMIT;
  }
}

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

/** Elements whose content is never text a reader wants (JSON-LD scripts are kept, see below). */
const DROP_BLOCKS =
  /<(script|style|noscript|template|svg|iframe|object)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
const JSON_LD =
  /<script\b[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script\s*>/gi;
const META_KEPT =
  /<meta\b[^>]*\b(?:name|property)\s*=\s*["']?((?:description|og:|twitter:|product:)[^"'\s>]*)["']?[^>]*\bcontent\s*=\s*("([^"]*)"|'([^']*)')[^>]*>/gi;
const ANCHOR = /<a\b[^>]*\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a\s*>/gi;
const IMG_ALT = /<img\b[^>]*\balt\s*=\s*("([^"]*)"|'([^']*)')[^>]*>/gi;
const CELL = /<\/?(td|th)\b[^>]*>/gi;
const BLOCK =
  /<\/?(p|div|br|li|ul|ol|dl|dt|dd|tr|table|thead|tbody|tfoot|h[1-6]|section|article|header|footer|nav|main|aside|form|fieldset|blockquote|pre|hr|option|figure|figcaption|details|summary|title|caption|label|button)\b[^>]*>/gi;
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  copy: '©',
  reg: '®',
  trade: '™',
  pound: '£',
  euro: '€',
  yen: '¥',
  cent: '¢',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  laquo: '«',
  raquo: '»',
  lsquo: '\u2018',
  rsquo: '\u2019',
  ldquo: '\u201c',
  rdquo: '\u201d',
  bull: '•',
  middot: '·',
  times: '×',
  deg: '°',
  ensp: ' ',
  emsp: ' ',
  thinsp: ' ',
  lrm: '',
  rlm: '',
  zwj: '',
  zwnj: '',
  shy: '',
};

/** HTML entities → characters: the named ones above, decimal and hex numerics; others stay. */
export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (whole, body: string) => {
    if (body[0] === '#') {
      const code =
        body[1]?.toLowerCase() === 'x' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : whole;
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? whole;
  });
}

/**
 * The text of an HTML page, as a reader greps it (foundry `relay-bodies-cap-in-history`,
 * 2026-10-31): comments, script, style, svg and the like dropped; JSON-LD blocks and the
 * description / og / twitter / product metas kept as their own lines (ratings, prices and counts
 * often live only there); an anchor becomes `text (href)` so a listing's slugs survive, an image
 * its alt text; block elements end a line, table cells are tab-separated; entities decoded;
 * runs of blanks folded and blank lines collapsed. A page that keeps its data in attributes or
 * in scripts other than JSON-LD is asked for with RAW.
 */
export function htmlToText(html: string): string {
  const kept: string[] = [];
  let s = html.replace(/<!--[\s\S]*?-->/g, '');
  s = s.replace(JSON_LD, (_, body: string) => {
    const t = body.trim();
    if (t) kept.push(t.replace(/\s+/g, ' '));
    return '\n';
  });
  s = s.replace(DROP_BLOCKS, '\n');
  s = s.replace(META_KEPT, (_, name: string, _q, dq?: string, sq?: string) => {
    const content = (dq ?? sq ?? '').trim();
    if (content) kept.push(`meta ${name}: ${decodeEntities(content)}`);
    return '\n';
  });
  s = s.replace(ANCHOR, (_, _q, dq?: string, sq?: string, bare?: string, inner?: string) => {
    const href = (dq ?? sq ?? bare ?? '').trim();
    const text = (inner ?? '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!href || href === '#' || /^javascript:/i.test(href)) return ` ${text} `;
    return text && text !== href ? ` ${text} (${href}) ` : ` ${href} `;
  });
  s = s.replace(IMG_ALT, (_, _q, dq?: string, sq?: string) => {
    const alt = (dq ?? sq ?? '').trim();
    return alt ? ` [${alt}] ` : ' ';
  });
  s = s.replace(CELL, '\t');
  s = s.replace(BLOCK, '\n');
  s = s.replace(/<[^>]+>/g, ' ');
  s = decodeEntities(s);
  const lines = s
    .split('\n')
    .map((line) =>
      line
        .replace(/[ \u00a0\r\f\v]+/g, ' ')
        .replace(/[ \t]*\t[ \t]*/g, '\t')
        .trim(),
    )
    .filter((line) => line !== '');
  const body = [...kept, ...lines].join('\n');
  return body ? body + '\n' : '';
}
