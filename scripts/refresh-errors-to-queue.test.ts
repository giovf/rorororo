import { describe, expect, it } from 'vitest';
import {
  errorsOn,
  fileRepeatErrors,
  lastRows,
  previousDay,
  splitErrors,
  type Queue,
} from './refresh-errors-to-queue.ts';

const row = (date: string, tail: string): string =>
  `| ${date} | Daily numbers | 1 accts | — | 0 x402 paid | MCP 24h: 1 authed; ${tail} |`;
const md = [
  '## Metrics',
  '',
  '| Date | Event | Users | Rating | Sales | Notes |',
  '|---|---|---|---|---|---|',
  row(
    '2026-09-28',
    'refresh errors: uk-charities (D1_ERROR: Network connection lost.), uk-insolvency (Unexpected end of JSON input)',
  ),
  row('2026-09-29', 'refresh errors: uk-insolvency (thegazette.co.uk responded 500)'),
  row(
    '2026-09-30',
    'refresh errors: uk-insolvency (thegazette.co.uk page results-page=1: Unexpected end of JSON input after 3 reads (0 bytes, content-length 12345)), nhs-ods',
  ),
  row('2026-10-01', 'refresh ok'),
  // The every-other-day flake the 2026-W40 retro saw: fixed 09-30, clean 10-01, back 10-02 and 10-03.
  row(
    '2026-10-02',
    'refresh errors: uk-food-hygiene (D1_ERROR: Network connection lost.), uk-insolvency (body cut)',
  ),
  row(
    '2026-10-03',
    'refresh errors: uk-contract-awards (refresh returned 0 records), uk-insolvency (body cut)',
  ),
].join('\n');

const queue = (items: Queue['items'] = []): Queue => ({
  venture: 'gankdat',
  status: 'open',
  needs_research: false,
  updated: '2026-09-01',
  items,
});

const doneItem = (done_at: string, status = 'done'): Queue['items'][number] => ({
  id: 'refresh-uk-insolvency',
  title: 't',
  why: 'w',
  effort_days: 0.1,
  proof: 'p',
  score: 6,
  status,
  added: '2026-09-20',
  done_at,
});

describe('splitErrors', () => {
  it('keeps commas inside parentheses with the source they belong to', () => {
    expect(splitErrors('a (x, y (z)), b, c (m)').map((e) => `${e.slug}=${e.message}`)).toEqual([
      'a=x, y (z)',
      'b=',
      'c=m',
    ]);
  });
});

describe('errorsOn', () => {
  it('reads one row by date and distinguishes a missing row from refresh ok', () => {
    expect(errorsOn(md, '2026-09-29')).toEqual([
      { slug: 'uk-insolvency', message: 'thegazette.co.uk responded 500' },
    ]);
    expect(errorsOn(md, '2026-10-01')).toEqual([]);
    expect(errorsOn(md, '2026-10-04')).toBeUndefined();
  });
});

describe('lastRows', () => {
  it('returns the last four rows up to today, oldest first, and nothing without a row for today', () => {
    expect(lastRows(md, '2026-10-03').map((r) => r.date)).toEqual([
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
    ]);
    expect(lastRows(md, '2026-09-29').map((r) => r.date)).toEqual(['2026-09-28', '2026-09-29']);
    expect(lastRows(md, '2026-10-04')).toEqual([]);
  });
});

describe('fileRepeatErrors', () => {
  it('files an item only for a source that errored today and in another of the last four rows', () => {
    const out = fileRepeatErrors(md, queue(), '2026-09-30');
    expect(out.added).toEqual(['refresh-uk-insolvency']);
    const item = out.queue.items[0]!;
    expect(item.status).toBe('todo');
    expect(item.title).toContain('failed 3 times in the last 3 days');
    expect(item.why).toContain('2026-09-28 (Unexpected end of JSON input)');
    expect(item.why).toContain('2026-09-29 (thegazette.co.uk responded 500)');
    expect(item.why).toContain('2026-09-30: thegazette.co.uk page');
    expect(out.queue.updated).toBe('2026-09-30');
    expect(out.queue.items.some((it) => it.id === 'refresh-nhs-ods')).toBe(false);
  });

  it('files an every-other-day flake that never errors two days running', () => {
    const flaky = [
      md.split('\n').slice(0, 4).join('\n'),
      row('2026-10-01', 'refresh errors: eu-ted (429)'),
      row('2026-10-02', 'refresh ok'),
      row('2026-10-03', 'refresh errors: eu-ted (429)'),
    ].join('\n');
    const out = fileRepeatErrors(flaky, queue(), '2026-10-03');
    expect(out.added).toEqual(['refresh-eu-ted']);
    expect(out.queue.items[0]!.title).toContain('failed 2 times in the last 3 days');
  });

  it('extends an open item once and never twice for the same day', () => {
    const first = fileRepeatErrors(md, queue(), '2026-09-29');
    expect(first.added).toEqual(['refresh-uk-insolvency']);
    const second = fileRepeatErrors(md, first.queue, '2026-09-30');
    expect(second.extended).toEqual(['refresh-uk-insolvency']);
    expect(second.queue.items[0]!.why).toContain('Still failing 2026-09-30:');
    const third = fileRepeatErrors(md, second.queue, '2026-09-30');
    expect(third.skipped).toEqual(['refresh-uk-insolvency']);
    expect(third.queue).toBe(second.queue);
  });

  it('re-files a done item once two rows after its fix list the slug, with a unique id', () => {
    const fixed = queue([doneItem('2026-09-30')]);
    // 10-02: only one post-fix row errors (09-30 itself is the fix day and does not count).
    const early = fileRepeatErrors(md, fixed, '2026-10-02');
    expect(early.added).toEqual([]);
    expect(early.skipped).toEqual(['refresh-uk-insolvency']);
    // 10-03: 10-02 and 10-03 both error after the fix → re-filed inside the old 14-day cool-off.
    const out = fileRepeatErrors(md, fixed, '2026-10-03');
    expect(out.added).toEqual(['refresh-uk-insolvency-2026-10-03']);
    const item = out.queue.items[1]!;
    expect(item.title).toContain('failed 2 times in the last 4 days');
    expect(item.why).toContain('2026-10-02 (body cut) and 2026-10-03: body cut');
    expect(item.why).toContain('after the fix of refresh-uk-insolvency (2026-09-30)');
    expect(item.why).not.toContain('2026-09-30 (');
    expect(out.queue.items.some((it) => it.id === 'refresh-uk-contract-awards')).toBe(false);
  });

  it('judges a re-filed slug against its latest closed item', () => {
    const twice = queue([
      doneItem('2026-09-20'),
      { ...doneItem('2026-10-02'), id: 'refresh-uk-insolvency-2026-10-02' },
    ]);
    const out = fileRepeatErrors(md, twice, '2026-10-03');
    expect(out.added).toEqual([]);
    expect(out.skipped).toEqual(['refresh-uk-insolvency-2026-10-02']);
  });

  it('leaves a dropped item alone for the cool-off and re-files it afterwards', () => {
    const dropped = queue([doneItem('2026-09-25', 'dropped')]);
    expect(fileRepeatErrors(md, dropped, '2026-10-03').skipped).toEqual(['refresh-uk-insolvency']);
    const old = queue([doneItem('2026-09-15', 'dropped')]);
    expect(fileRepeatErrors(md, old, '2026-10-03').added).toEqual([
      'refresh-uk-insolvency-2026-10-03',
    ]);
  });

  it('does nothing when today has no row or the slug errored only today', () => {
    expect(fileRepeatErrors(md, queue(), '2026-10-04').queue.items).toEqual([]);
    expect(fileRepeatErrors(md, queue(), '2026-09-28').queue.items).toEqual([]);
  });

  it('previousDay crosses a month boundary', () => {
    expect(previousDay('2026-10-01')).toBe('2026-09-30');
  });
});

describe('a failed live /mcp probe', () => {
  it('is filed with its own wording, not as a source refresh', () => {
    const probeMd = [
      '## Metrics',
      '',
      '| Date | Event | Users | Rating | Sales | Notes |',
      '|---|---|---|---|---|---|',
      row('2026-10-08', 'refresh errors: mcp-probe (init 500 (Internal server error))'),
      row('2026-10-09', 'refresh errors: mcp-probe (authed init 500 (Internal server error))'),
    ].join('\n');
    const queue: Queue = {
      venture: 'gankdat',
      status: 'open',
      needs_research: false,
      updated: '2026-10-01',
      items: [],
    };
    const out = fileRepeatErrors(probeMd, queue, '2026-10-09');
    expect(out.added).toEqual(['refresh-mcp-probe']);
    const item = out.queue.items[0];
    expect(item?.title).toContain('live /mcp has failed the CI probe 2 times');
    expect(item?.why).toContain('scripts/mcp-probe.ts');
    expect(item?.why).not.toContain('src/sources/mcp-probe.ts');
  });
});
