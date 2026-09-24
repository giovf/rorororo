#!/usr/bin/env node
// Fetch relay for the cloud routines. Their sandboxes can push to GitHub but cannot reach most
// data hosts (figma.com, ipo.gov.uk, nhs.uk, data.gov.uk …), so a routine writes
// docs/relay/requests/<name>.txt (one request per line), pushes it, and this script — run by
// the `fetch relay` workflow on that push — fetches each URL and commits the results under
// docs/relay/responses/<name>/ (files + meta.json). The routine pulls a minute or two later.
//
// Line syntax:   [HEAD|GET] [RANGE=a-b] <https url>      (# comments and blank lines ignored)
// Only hosts on the allowlist below are fetched (public data and store pages — never anything
// that needs a credential). GET bodies are capped at MAX_BYTES; use RANGE for big files.
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', 'docs', 'relay');
const MAX_BYTES = 8 * 1024 * 1024;
const KEEP_DAYS = 7;
const TIMEOUT_MS = 90_000;
const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36 gankdat-relay';
/** Host suffixes (".x" matches x and any subdomain) and exact hosts the relay will fetch. */
const ALLOWED = [
  '.gov.uk',
  '.nhs.uk',
  '.europa.eu',
  '.sam.gov',
  '.thegazette.co.uk',
  '.cqc.org.uk',
  '.figma.com',
  '.fig-stats.com',
  'chromewebstore.google.com',
  '.addons.mozilla.org',
  '.apify.com',
  'registry.modelcontextprotocol.io',
  '.glama.ai',
  '.mcpservers.org',
  '.gankdat.com',
  'ea-edubase-api-prod.azurewebsites.net',
  'ccewuksprdoneregsadata1.blob.core.windows.net',
  '.companieshouse.gov.uk',
  '.gamblingcommission.gov.uk',
  '.data.gov.uk',
  '.ons.gov.uk',
  '.hmrc.gov.uk',
  '.openstreetmap.org',
];

function allowed(hostname) {
  const h = hostname.toLowerCase();
  return ALLOWED.some((a) => (a.startsWith('.') ? h === a.slice(1) || h.endsWith(a) : h === a));
}

function parseLine(line) {
  const t = line.trim();
  if (t === '' || t.startsWith('#')) return null;
  const parts = t.split(/\s+/);
  let method = 'GET';
  let range;
  while (parts.length > 1) {
    const p = parts[0].toUpperCase();
    if (p === 'GET' || p === 'HEAD') method = parts.shift().toUpperCase();
    else if (p.startsWith('RANGE=')) range = parts.shift().slice(6);
    else break;
  }
  return { method, range, url: parts.join(' ') };
}

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
  const headers = { 'user-agent': USER_AGENT, accept: '*/*' };
  if (req.range) headers.range = `bytes=${req.range}`;
  try {
    const res = await fetch(url, {
      method: req.method,
      headers,
      redirect: 'follow',
      signal: globalThis.AbortSignal.timeout(TIMEOUT_MS),
    });
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
  for (const [i, req] of lines.entries()) results.push(await fetchOne(req, outDir, i + 1));
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
