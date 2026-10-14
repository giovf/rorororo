import { describe, expect, it } from 'vitest';
import { POST_MAX_BYTES, credentialShaped, parseLine, postBodyError } from './fetch-relay-lines.ts';

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
