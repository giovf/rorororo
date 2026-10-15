#!/usr/bin/env node
// Fetch relay for the cloud routines. Their sandboxes can push to GitHub but cannot reach most
// data hosts (figma.com, ipo.gov.uk, nhs.uk, data.gov.uk …), so a routine writes
// docs/relay/requests/<name>.txt (one request per line), pushes it, and this script — run by
// the `fetch relay` workflow on that push — fetches each URL and commits the results under
// docs/relay/responses/<name>/ (files + meta.json). The routine pulls a minute or two later.
//
// Line syntax:   [HEAD|GET] [RANGE=a-b] <https url>      (# comments and blank lines ignored)
//                POST <https url> <json>                  (foundry relay-post-json, 2026-10-14)
// Only hosts on the allowlist below are fetched (public data and store pages — never anything
// that needs a credential). GET bodies are capped at MAX_BYTES; use RANGE for big files. A POST
// body is one JSON document, ≤ 4 kB, refused when a key or value is credential-shaped
// (scripts/fetch-relay-lines.ts) — for JSON-RPC reads and POST-only validation endpoints.
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { parseLine } from './fetch-relay-lines.ts';

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
  '.ico.org.uk',
  'registry.modelcontextprotocol.io',
  'claude.ai', // Claude's public OAuth client metadata document (CIMD), read by the OAuth funnel walk
  '.glama.ai',
  '.mcpservers.org',
  '.gankdat.com',
  'ea-edubase-api-prod.azurewebsites.net',
  'ccewuksprdoneregsadata1.blob.core.windows.net',
  'voaratinglists.blob.core.windows.net', // VOA non-domestic rating list downloads (exchange pre-research 2026-10-09)
  '.companieshouse.gov.uk',
  '.gamblingcommission.gov.uk',
  '.data.gov.uk',
  '.ons.gov.uk',
  '.hmrc.gov.uk',
  '.openstreetmap.org',
  '.web-highlights.com',
  '.marqly.com',
  '.dyslexly.com',
  'halfbold.vercel.app',
  '.weavatools.com',
  'weavatools.atlassian.net',
  '.readwise.io',
  '.glasp.co',
  '.hypothes.is',
  '.opendatacommunities.org', // EPC open data terms (exchange pre-research 2026-10-12)
  '.nebius.com', // Token Factory billing rule and Nemotron catalogue (hackathons research 2026-10-13)
  '.genai.works', // Open Agent Hackathon rules (hackathons research 2026-10-13)
  'lablab.ai', // lablab.ai hackathon pages (hackathons research 2026-10-13)
  'developer.amazon.com', // Amazon developer hackathon / Alexa+ pages (hackathons research 2026-10-13)
  '.cro.ie', // Irish Companies Registration Office open data, API and bulk-licence pages (exchange pre-research 2026-10-13)
  '.data.gov.ie', // Irish open data portal dataset pages (exchange pre-research 2026-10-13)
  '.vision-net.ie', // CRIF Vision-net price list, the paid rival (exchange pre-research 2026-10-13)
  '.solocheck.ie', // SoloCheck (CRIF) company-report prices, the paid rival (exchange pre-research 2026-10-13)
  '.coinbase.com', // x402 Bazaar discovery API, CDP docs, facilitator pricing and CDP terms (exchange 2026-W42)
  'base.blockscout.com', // Base block explorer public API: Aave v3 liquidation logs and gas prices (exchange 2026-W42, keeper idea)
  'build.avax.network', // Avalanche Hack2Build x402 hackathon page (exchange 2026-W42)
  'solana.com', // Solana x402 hackathon page (exchange 2026-W42)
  'docs.opire.dev', // Opire bounty bot docs (exchange 2026-W42, bounty boards)
  'docs.algora.io', // Algora bounty workflow docs (exchange 2026-W42, bounty boards)
  'algora.io', // Algora's own open-bounty board, server-rendered (exchange 2026-W42)
  'console.algora.io', // Algora console API: keyless tRPC bounty.list read (oss-bounties research 2026-10-15)
  'oss.issuehunt.io', // IssueHunt funded-issue list (oss-bounties research 2026-10-15)
  '.opire.dev', // Opire bounty platform pages (exchange 2026-W42)
  'api.routescan.io', // Routescan keyless Etherscan-compatible API for Base: liquidation logs, gas price (exchange 2026-W42, keeper idea)
  'mainnet.base.org', // Base's public JSON-RPC endpoint (POST eth_blockNumber, eth_getLogs — foundry relay-post-json, 2026-10-14)
  'api.github.com', // GitHub REST API, unauthenticated: issue comments and searches a bounty scanner rule is verified against (oss-bounties `bounty-board-opire-source`, 2026-10-14)
];

function allowed(hostname) {
  const h = hostname.toLowerCase();
  return ALLOWED.some((a) => (a.startsWith('.') ? h === a.slice(1) || h.endsWith(a) : h === a));
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
  if (req.error) return { ...meta, error: req.error }; // a malformed or credential-shaped POST line
  const headers = { 'user-agent': USER_AGENT, accept: '*/*' };
  if (req.range) headers.range = `bytes=${req.range}`;
  if (req.method === 'POST') {
    headers['content-type'] = 'application/json';
    headers.accept = 'application/json, */*';
  }
  try {
    const res = await fetch(url, {
      method: req.method,
      headers,
      body: req.method === 'POST' ? req.body : undefined,
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
