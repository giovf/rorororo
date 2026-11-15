import { describe, expect, it } from 'vitest';
import {
  CHECKS,
  MAX_INTRO_SECONDS,
  MIN_SECONDS,
  SHOTS,
  answerFromRelay,
  answerLines,
  cardHtml,
  cell,
  dryRunAnswers,
  publicFile,
  terminalTitle,
  toolSource,
  transcriptMarkdown,
} from './demo-clay-intro.ts';
import { plannedSeconds } from './demo-video.ts';

const call = (name: string, args: Record<string, string>): unknown => ({
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: { name, arguments: args },
});
const result = (payload: unknown): unknown => ({
  jsonrpc: '2.0',
  id: 1,
  result: { content: [{ type: 'text', text: JSON.stringify(payload) }] },
});

describe('demo-clay-intro', () => {
  it('plans seven shots inside the 60–90 s the queue item asks for', () => {
    expect(SHOTS.map((s) => s.n)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    const held = SHOTS.reduce((sum, s) => sum + s.seconds, 0);
    expect(held).toBeGreaterThanOrEqual(MIN_SECONDS);
    expect(plannedSeconds(SHOTS)).toBeLessThanOrEqual(MAX_INTRO_SECONDS);
  });

  it('names the five registers the Clay page documents', () => {
    expect(CHECKS.map((c) => c.source)).toEqual([
      'uk-company-profiles',
      'uk-charities',
      'uk-insolvency',
      'uk-sanctions',
      'uk-sponsors',
    ]);
    expect(toolSource('query_uk_company_profiles')).toBe('uk-company-profiles');
  });

  it('reads a saved relay answer: the request, the hit count and the first record', () => {
    const answer = answerFromRelay(
      call('query_uk_company_profiles', { company_number: '00000006' }),
      result({ ok: true, data: [{ company: 'ACME', status: 'active' }], meta: { total: 1 } }),
      200,
      '2026-11-15T18:20:00.000Z',
    );
    expect(answer).toMatchObject({
      source: 'uk-company-profiles',
      param: 'company_number',
      value: '00000006',
      total: 1,
      record: { company: 'ACME', status: 'active' },
    });
    expect(terminalTitle([answer!])).toContain('read 2026-11-15 18:20 UTC');
  });

  it('never invents an answer: a tool error, an HTTP error and a stray line are said as such', () => {
    const request = call('query_uk_charities', { company_number: '00000006' });
    const toolError = answerFromRelay(
      request,
      { result: { content: [{ type: 'text', text: 'temporarily unavailable' }], isError: true } },
      200,
      null,
    );
    expect(toolError).toMatchObject({
      total: null,
      record: null,
      error: 'temporarily unavailable',
    });
    expect(answerLines(toolError!)[1]).toContain('no answer in this reading');
    expect(answerFromRelay(request, null, 406, null)?.error).toBe('HTTP 406');
    expect(answerFromRelay({ method: 'tools/list' }, {}, 200, null)).toBeNull();
  });

  it('prints a check as the REST request a Clay column sends and its field paths', () => {
    const [company, charity, , , sponsor] = dryRunAnswers();
    const lines = answerLines(company!, false);
    expect(lines[0]).toBe('$ GET /v1/data/uk-company-profiles?company_number=00000006');
    expect(lines).toContain(`  ${'data.0.status'.padEnd(36)}"active"`);
    expect(lines.some((l) => l.includes('meta.total'))).toBe(false);
    expect(answerLines(charity!)).toEqual([
      '$ GET /v1/data/uk-charities?company_number=00000006',
      `  ${'meta.total'.padEnd(36)}0`,
    ]);
    expect(answerLines(sponsor!)[0]).toBe('$ GET /v1/data/uk-sponsors?organisation=Acme%20Widgets');
    expect(cell('x'.repeat(80))).toHaveLength(56);
  });

  it('serves only files under the public directory, with clean URLs', () => {
    expect(publicFile('/')).toBe('index.html');
    expect(publicFile('/clay')).toBe('clay.html');
    expect(publicFile('/js/index.js?v=2')).toBe('js/index.js');
    expect(publicFile('/../../.env')).toBeNull();
  });

  it('escapes the cards and writes a transcript that says where the answers came from', () => {
    expect(cardHtml('<b>', ['a & b'])).toContain('<h1>&lt;b&gt;</h1><p>a &amp; b</p>');
    const dry = transcriptMarkdown(dryRunAnswers(), true);
    expect(dry).toContain('Dry run (fixture answers, placeholder pages).');
    expect(dry).toContain('$ GET /v1/data/uk-sanctions?name=Acme%20Widgets');
    const live = transcriptMarkdown(
      dryRunAnswers().map((a) => ({ ...a, fetchedAt: '2026-11-15T18:20:00.000Z' })),
      false,
    );
    expect(live).toContain('read 2026-11-15 18:20 UTC from gankdat.com by a GitHub runner');
  });
});
