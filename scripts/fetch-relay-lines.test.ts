import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  MAX_RETRIES,
  POST_MAX_BYTES,
  RETRY_STATUSES,
  SAME_HOST_PACE_MS,
  credentialShaped,
  hostAllowed,
  needsRender,
  parseHosts,
  parseLine,
  postBodyError,
  retryDelayMs,
} from './fetch-relay-lines.ts';

describe('parseLine', () => {
  it('keeps the GET/HEAD/RANGE syntax as it was', () => {
    expect(parseLine('')).toBeNull();
    expect(parseLine('  # a comment')).toBeNull();
    expect(parseLine('https://a.gov.uk/x.csv')).toEqual({
      method: 'GET',
      url: 'https://a.gov.uk/x.csv',
    });
    expect(parseLine('head https://a.gov.uk/x.csv')).toEqual({
      method: 'HEAD',
      url: 'https://a.gov.uk/x.csv',
    });
    expect(parseLine('GET RANGE=0-4095 https://a.gov.uk/x.csv')).toEqual({
      method: 'GET',
      range: '0-4095',
      url: 'https://a.gov.uk/x.csv',
    });
    expect(parseLine('RANGE=0-9 GET https://a.gov.uk/x.csv')).toEqual({
      method: 'GET',
      range: '0-9',
      url: 'https://a.gov.uk/x.csv',
    });
  });

  it('reads a RENDER line as a GET whose DOM is rendered in Chromium, and refuses it elsewhere', () => {
    expect(parseLine('GET RENDER https://www.wix.com/app-market/category/forms')).toEqual({
      method: 'GET',
      render: true,
      url: 'https://www.wix.com/app-market/category/forms',
    });
    expect(parseLine('render https://www.wix.com/app-market/category/forms')).toEqual({
      method: 'GET',
      render: true,
      url: 'https://www.wix.com/app-market/category/forms',
    });
    expect(parseLine('HEAD RENDER https://a.gov.uk/x')).toMatchObject({
      method: 'HEAD',
      render: true,
      error: 'RENDER applies to GET only, not HEAD',
    });
    expect(parseLine('GET RENDER RANGE=0-9 https://a.gov.uk/x')?.error).toMatch(
      /^RANGE does not apply to RENDER/,
    );
    expect(parseLine('POST RENDER https://mainnet.base.org {"a":1}')).toMatchObject({
      method: 'POST',
      body: '{"a":1}',
      error: 'RENDER applies to GET only, not POST',
    });
  });

  it('needsRender sees a usable RENDER line only, never a comment or a refused one', () => {
    expect(needsRender('GET https://a.gov.uk/x\nHEAD https://a.gov.uk/y\n')).toBe(false);
    expect(needsRender('# RENDER https://a.gov.uk/x\n')).toBe(false);
    expect(needsRender('HEAD RENDER https://a.gov.uk/x\n')).toBe(false);
    expect(needsRender('GET https://a.gov.uk/x\nRENDER https://a.gov.uk/y\n')).toBe(true);
    expect(needsRender('')).toBe(false);
  });

  it('reads a POST line: the url, then the JSON body as the rest of the line, spaces included', () => {
    const body = '{"jsonrpc": "2.0", "id": 1, "method": "eth_blockNumber", "params": []}';
    expect(parseLine(`POST https://mainnet.base.org ${body}`)).toEqual({
      method: 'POST',
      url: 'https://mainnet.base.org',
      body,
    });
    expect(parseLine('post https://x.coinbase.com/v {"a":[1,2]}')).toEqual({
      method: 'POST',
      url: 'https://x.coinbase.com/v',
      body: '{"a":[1,2]}',
    });
  });

  it('marks a malformed POST line instead of sending it', () => {
    expect(parseLine('POST https://mainnet.base.org')).toMatchObject({
      method: 'POST',
      error: 'POST needs a JSON body after the url',
    });
    expect(parseLine('POST https://mainnet.base.org not json')).toMatchObject({
      body: 'not json',
      error: 'POST body is not valid JSON',
    });
    expect(parseLine('POST https://mainnet.base.org "just a string"')).toMatchObject({
      error: 'POST body must be a JSON object or array',
    });
    expect(parseLine('POST RANGE=0-1 https://mainnet.base.org {"a":1}')).toMatchObject({
      error: 'RANGE does not apply to POST',
    });
    expect(
      parseLine(`POST https://mainnet.base.org {"pad":"${'x'.repeat(POST_MAX_BYTES)}"}`)?.error,
    ).toMatch(/bytes; the cap is 4096$/);
  });
});

describe('credential refusal', () => {
  it('refuses credential-shaped keys wherever they sit', () => {
    expect(postBodyError('{"api_key":"abc"}')).toBe(
      'refused: $.api_key is a credential-shaped key (never a credential through the relay)',
    );
    for (const key of [
      'token',
      'access_token',
      'secret',
      'clientSecret',
      'password',
      'privateKey',
      'Authorization',
      'cookie',
      'key',
      'pk',
    ])
      expect(credentialShaped({ params: [{ [key]: 'v' }] }), key).toContain(
        'credential-shaped key',
      );
  });

  it('refuses credential-shaped values', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abcdefghijklmnop';
    expect(credentialShaped({ q: jwt })).toBe('$.q looks like a JWT');
    expect(credentialShaped(['sk_live_abcdefghijkl'])).toBe('$[0] looks like a Stripe key');
    expect(credentialShaped({ h: 'Bearer abc.def' })).toBe('$.h looks like a Bearer header');
    expect(credentialShaped({ h: 'ghp_' + 'a'.repeat(30) })).toBe('$.h looks like a GitHub token');
    expect(credentialShaped({ pem: '-----BEGIN EC PRIVATE KEY-----\nabc' })).toBe(
      '$.pem looks like a PEM private key',
    );
  });

  it('lets JSON-RPC and validate bodies through: hex topics and tokenAddress are not credentials', () => {
    const topic = '0x' + 'e4'.repeat(32);
    expect(
      postBodyError(
        JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getLogs',
          params: [
            {
              fromBlock: '0x1',
              toBlock: 'latest',
              address: '0x' + 'ab'.repeat(20),
              topics: [topic],
            },
          ],
        }),
      ),
    ).toBeNull();
    expect(
      postBodyError('{"resource":"https://gankdat.com/x402/data/uk-tenders","method":"GET"}'),
    ).toBeNull();
    expect(
      postBodyError(
        '{"tokenAddress":"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913","requestKey":"q-1"}',
      ),
    ).toBeNull();
  });
});

describe('hosts.txt allowlist', () => {
  it('reads entries, drops comments and blank lines, and fails loud on a malformed line', () => {
    expect(parseHosts('# c\n\n.gov.uk  # suffix\napi.github.com\n')).toEqual([
      '.gov.uk',
      'api.github.com',
    ]);
    expect(() => parseHosts('.gov.uk\nhttps://a.gov.uk\n')).toThrow(/line 2: not a host/);
    expect(() => parseHosts('Api.GitHub.com')).toThrow(/line 1/);
    expect(() => parseHosts('a.gov.uk b.gov.uk')).toThrow(/line 1/);
    expect(() => parseHosts('localhost')).toThrow(/line 1/);
  });

  it('matches a suffix entry on the host itself and its subdomains, an exact entry only exactly', () => {
    const hosts = ['.gov.uk', 'api.github.com'];
    expect(hostAllowed('gov.uk', hosts)).toBe(true);
    expect(hostAllowed('data.gov.uk', hosts)).toBe(true);
    expect(hostAllowed('GOV.UK', hosts)).toBe(true);
    expect(hostAllowed('notgov.uk', hosts)).toBe(false);
    expect(hostAllowed('api.github.com', hosts)).toBe(true);
    expect(hostAllowed('github.com', hosts)).toBe(false);
    expect(hostAllowed('evil.api.github.com', hosts)).toBe(false);
  });

  it('parses the real docs/relay/hosts.txt and keeps the entries the routines rely on', () => {
    const file = path.resolve(import.meta.dirname, '..', 'docs', 'relay', 'hosts.txt');
    const hosts = parseHosts(readFileSync(file, 'utf8'));
    expect(hosts.length).toBeGreaterThan(50);
    for (const h of [
      '.gov.uk',
      '.figma.com',
      'chromewebstore.google.com',
      '.gankdat.com',
      'api.github.com',
    ])
      expect(hosts).toContain(h);
    expect(new Set(hosts).size).toBe(hosts.length);
    expect(hostAllowed('find-and-update.company-information.service.gov.uk', hosts)).toBe(true);
    expect(hostAllowed('example.com', hosts)).toBe(false);
  });
});

describe('retryDelayMs', () => {
  it('honours a sane Retry-After, capped at 30 s, else backs off 1 s doubling', () => {
    expect(retryDelayMs('2', 0)).toBe(2000);
    expect(retryDelayMs('0.5', 3)).toBe(500);
    expect(retryDelayMs('120', 0)).toBe(30_000);
    expect(retryDelayMs(null, 0)).toBe(1000);
    expect(retryDelayMs(undefined, 1)).toBe(2000);
    expect(retryDelayMs('Wed, 21 Oct 2026 07:28:00 GMT', 2)).toBe(4000);
    expect(retryDelayMs('0', 2)).toBe(4000);
    expect(retryDelayMs('-3', 0)).toBe(1000);
  });

  it('retries 429 and 503 only, three times, with a half-second same-host pace', () => {
    expect([...RETRY_STATUSES].sort()).toEqual([429, 503]);
    expect(RETRY_STATUSES.has(500)).toBe(false);
    expect(MAX_RETRIES).toBe(3);
    expect(SAME_HOST_PACE_MS).toBe(500);
  });
});
