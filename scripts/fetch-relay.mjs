#!/usr/bin/env node
// Fetch relay for the cloud routines. Their sandboxes can push to GitHub but cannot reach most
// data hosts (figma.com, ipo.gov.uk, nhs.uk, data.gov.uk …), so a routine writes
// docs/relay/requests/<name>.txt (one request per line), pushes it, and this script — run by
// the `fetch relay` workflow on that push — fetches each URL and commits the results under
// docs/relay/responses/<name>/ (files + meta.json). The routine pulls a minute or two later.
//
// Line syntax:   [HEAD|GET] [RANGE=a-b] <https url>      (# comments and blank lines ignored)
//                POST <https url> <json>                  (foundry relay-post-json, 2026-10-14)
// Only hosts listed in docs/relay/hosts.txt are fetched (public data and store pages — never
// anything that needs a credential; a data file since 2026-10-16 so adding a host is not a code push). GET bodies are capped at MAX_BYTES; use RANGE for big files. A POST
// body is one JSON document, ≤ 4 kB, refused when a key or value is credential-shaped
// (scripts/fetch-relay-lines.ts) — for JSON-RPC reads and POST-only validation endpoints.
// A 429 or 503 is retried up to MAX_RETRIES times after Retry-After or a doubling pause, and two
// consecutive lines to the same host are SAME_HOST_PACE_MS apart (2026-10-17: Base's public RPC
// throttled 40 log queries fired in one second); meta.json carries `retries` when one was needed.
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  MAX_RETRIES,
  RETRY_STATUSES,
  SAME_HOST_PACE_MS,
  hostAllowed,
  parseHosts,
  parseLine,
  retryDelayMs,
} from './fetch-relay-lines.ts';

const ROOT = path.resolve(import.meta.dirname, '..', 'docs', 'relay');
const MAX_BYTES = 8 * 1024 * 1024;
const KEEP_DAYS = 7;
const TIMEOUT_MS = 90_000;
const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36 gankdat-relay';
/** Allowed hosts live in docs/relay/hosts.txt (suffixes `.x` match x and any subdomain; exact hosts otherwise). */
const HOSTS_FILE = path.join(ROOT, 'hosts.txt');
const ALLOWED = parseHosts(readFileSync(HOSTS_FILE, 'utf8'));

function allowed(hostname) {
  return hostAllowed(hostname, ALLOWED);
}

const sleep = (ms) => new Promise((resolve) => globalThis.setTimeout(resolve, ms));

function extOf(contentType) {
  const ct = (contentType ?? '').toLowerCase();
  if (ct.includes('json')) return 'json';
  if (ct.includes('xml')) return 'xml';
  if (ct.includes('csv')) return 'csv';
  if (ct.includes('html')) return 'html';
  if (ct.includes('text/')) return 'txt';
  if (ct.includes('zip')) return 'zip';
  return 'bin';
}

async function fetchOne(req, outDir, index) {
  const meta = { ...req, fetched_at: new Date().toISOString() };
  let url;
  try {
    url = new URL(req.url);
  } catch {
    return { ...meta, error: 'invalid url' };
  }
  if (url.protocol !== 'https:' || !allowed(url.hostname)) {
    return { ...meta, error: `host not on the relay allowlist: ${url.hostname}` };
  }
  if (req.error) return { ...meta, error: req.error }; // a malformed or credential-shaped POST line
  const headers = { 'user-agent': USER_AGENT, accept: '*/*' };
  if (req.range) headers.range = `bytes=${req.range}`;
  if (req.method === 'POST') {
    headers['content-type'] = 'application/json';
    headers.accept = 'application/json, */*';
  }
  try {
    let res;
    for (let attempt = 0; ; attempt++) {
      res = await fetch(url, {
        method: req.method,
        headers,
        body: req.method === 'POST' ? req.body : undefined,
        redirect: 'follow',
        signal: globalThis.AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!RETRY_STATUSES.has(res.status) || attempt >= MAX_RETRIES) break;
      await res.body?.cancel();
      meta.retries = attempt + 1;
      await sleep(retryDelayMs(res.headers.get('retry-after'), attempt));
    }
    meta.status = res.status;
    meta.final_url = res.url;
    meta.headers = Object.fromEntries(
      ['content-type', 'content-length', 'content-disposition', 'last-modified', 'etag']
        .filter((k) => res.headers.has(k))
        .map((k) => [k, res.headers.get(k)]),
    );
    if (req.method === 'HEAD' || !res.body) return meta;
    const chunks = [];
    let bytes = 0;
    let truncated = false;
    for await (const chunk of res.body) {
      if (bytes + chunk.length > MAX_BYTES) {
        chunks.push(chunk.subarray(0, MAX_BYTES - bytes));
        bytes = MAX_BYTES;
        truncated = true;
        break;
      }
      chunks.push(chunk);
      bytes += chunk.length;
    }
    const file = `${index}.${extOf(res.headers.get('content-type'))}`;
    writeFileSync(path.join(outDir, file), Buffer.concat(chunks));
    return { ...meta, file, bytes, truncated };
  } catch (err) {
    return { ...meta, error: err instanceof Error ? err.message : String(err) };
  }
}

async function processRequest(file) {
  const name = path.basename(file, '.txt');
  const outDir = path.join(ROOT, 'responses', name);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const lines = readFileSync(file, 'utf8').split('\n').map(parseLine).filter(Boolean);
  const results = [];
  let lastHost;
  for (const [i, req] of lines.entries()) {
    let host;
    try {
      host = new URL(req.url).hostname;
    } catch {
      host = undefined;
    }
    if (host && host === lastHost) await sleep(SAME_HOST_PACE_MS);
    lastHost = host;
    results.push(await fetchOne(req, outDir, i + 1));
  }
  writeFileSync(
    path.join(outDir, 'meta.json'),
    JSON.stringify({ request: name, fetched_at: new Date().toISOString(), results }, null, 2) +
      '\n',
  );
  rmSync(file);
  return { name, results };
}

function prune() {
  const dir = path.join(ROOT, 'responses');
  const cutoff = Date.now() - KEEP_DAYS * 86_400_000;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const metaPath = path.join(dir, entry.name, 'meta.json');
    let at;
    try {
      at = Date.parse(JSON.parse(readFileSync(metaPath, 'utf8')).fetched_at);
    } catch {
      at = statSync(path.join(dir, entry.name)).mtimeMs;
    }
    if (at < cutoff) rmSync(path.join(dir, entry.name), { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const reqDir = path.join(ROOT, 'requests');
  const files = readdirSync(reqDir)
    .filter((f) => f.endsWith('.txt'))
    .map((f) => path.join(reqDir, f));
  for (const f of files) {
    const { name, results } = await processRequest(f);
    for (const r of results) {
      console.log(
        `${name}: ${r.method} ${r.url} → ${r.error ? 'ERR ' + r.error : `${r.status} ${r.file ?? ''} ${r.bytes ?? ''}${r.truncated ? ' (truncated)' : ''}`}`,
      );
    }
  }
  prune();
  if (files.length === 0) console.log('no relay requests');
}
