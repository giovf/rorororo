import { describe, expect, it } from 'vitest';
import {
  errorsOn,
  fileRepeatErrors,
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
].join('\n');

const queue = (items: Queue['items'] = []): Queue => ({
  venture: 'gankdat',
  status: 'open',
  needs_research: false,
  updated: '2026-09-01',
  items,
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
    expect(errorsOn(md, '2026-10-02')).toBeUndefined();
  });
});

describe('fileRepeatErrors', () => {
  it('files an item only for a source that errored on both days', () => {
    const out = fileRepeatErrors(md, queue(), '2026-09-30');
    expect(out.added).toEqual(['refresh-uk-insolvency']);
    const item = out.queue.items[0]!;
    expect(item.status).toBe('todo');
    expect(item.why).toContain('2026-09-29 (thegazette.co.uk responded 500)');
    expect(item.why).toContain('2026-09-30: thegazette.co.uk page');
    expect(out.queue.updated).toBe('2026-09-30');
    expect(out.queue.items.some((it) => it.id === 'refresh-nhs-ods')).toBe(false);
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

  it('leaves a recently done item alone and re-files after the cool-off with a unique id', () => {
    const done = queue([
      {
        id: 'refresh-uk-insolvency',
        title: 't',
        why: 'w',
        effort_days: 0.1,
        proof: 'p',
        score: 6,
        status: 'done',
        added: '2026-09-20',
        done_at: '2026-09-25',
      },
    ]);
    expect(fileRepeatErrors(md, done, '2026-09-30').skipped).toEqual(['refresh-uk-insolvency']);
    const old = queue([{ ...done.items[0]!, done_at: '2026-09-10' }]);
    const out = fileRepeatErrors(md, old, '2026-09-30');
    expect(out.added).toEqual(['refresh-uk-insolvency-2026-09-30']);
  });

  it('does nothing when either day has no row', () => {
    expect(fileRepeatErrors(md, queue(), '2026-10-02').queue.items).toEqual([]);
    expect(fileRepeatErrors(md, queue(), '2026-09-28').queue.items).toEqual([]);
  });

  it('previousDay crosses a month boundary', () => {
    expect(previousDay('2026-10-01')).toBe('2026-09-30');
  });
});
