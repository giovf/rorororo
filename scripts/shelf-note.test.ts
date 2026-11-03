import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  appendMetricsRows,
  kindleStatusRow,
  lastSales,
  metricsRows,
  parseNoteLine,
  parseShelfNote,
  recordShelfNotes,
  shelfRows,
  tableRows,
  STATUS_HEADING,
} from './shelf-note.ts';

const kindlePack = `# Kindle guide

## Status

| Date | Event |
| --- | --- |
| 2026-10-31 | KDP mail: live |

## After
`;

const research = `# UK Sole Trader Tax Workbook

## 6. Numbers that decide

- **Kill**: 0 sales 60 days after listing with ≥ 5 listing views a day.

## 7. Metrics

Row kinds text.

| Date | Event | Users | Rating | Sales | Notes |
| --- | --- | --- | --- | --- | --- |
| 2026-10-24 | Opened | — | — | 0 | venture opened |
| 2026-10-29 | Listed | — | — | 0 | Etsy listing live |
| 2026-11-12 | Sale | — | — | 1 | listing 4605571079, £6.99 × 1, mail 10:02 |

## 8. Owner steps

- none
`;

describe('parseShelfNote', () => {
  it('reads the asked shape', () => {
    expect(parseShelfNote('etsy views 4/day kindle 2 sold')).toEqual({
      etsyViews: 4,
      kindleSold: 2,
    });
  });

  it('reads either figure alone and small variations', () => {
    expect(parseShelfNote('Etsy: 12 views a day')).toEqual({ etsyViews: 12 });
    expect(parseShelfNote('kindle: 3 sold')).toEqual({ kindleSold: 3 });
    expect(parseShelfNote('Kindle sold 0, etsy views 0.5 per day')).toEqual({
      etsyViews: 0.5,
      kindleSold: 0,
    });
    expect(parseShelfNote('etsy views 7 per day; kindle 1 copy sold')).toEqual({
      etsyViews: 7,
      kindleSold: 1,
    });
  });

  it('reads the Kindle page from an Amazon link or a bare ASIN (kdp-listing-live)', () => {
    expect(
      parseShelfNote(
        'kindle 2 sold https://www.amazon.co.uk/UK-Sole-Trader-Tax-2026/dp/B0ABCDEFGH/ref=sr_1_1',
      ),
    ).toEqual({
      kindleSold: 2,
      asin: 'B0ABCDEFGH',
      kindleUrl: 'https://www.amazon.co.uk/dp/B0ABCDEFGH',
    });
    expect(parseShelfNote('amazon.com page: https://amazon.com/gp/product/B0ABCDEFGH')).toEqual({
      asin: 'B0ABCDEFGH',
      kindleUrl: 'https://www.amazon.co.uk/dp/B0ABCDEFGH',
    });
    expect(parseShelfNote('kindle asin: b0abcdefgh')).toEqual({
      asin: 'B0ABCDEFGH',
      kindleUrl: 'https://www.amazon.co.uk/dp/B0ABCDEFGH',
    });
    expect(parseShelfNote('bought on amazon.co.uk today')).toBeUndefined();
  });

  it('ignores notes that name neither reading', () => {
    expect(parseShelfNote('usage 62% fable 71%')).toBeUndefined();
    expect(parseShelfNote('the kindle guide looks good, 5 stars')).toBeUndefined();
    expect(parseShelfNote('etsy fee was 14 today')).toBeUndefined();
  });
});

describe('metricsRows / lastSales', () => {
  it('lists the data rows of §7 only and carries the running total', () => {
    const rows = metricsRows(research);
    expect(rows.map((r) => r.line.split('|')[2]?.trim())).toEqual(['Opened', 'Listed', 'Sale']);
    expect(lastSales(research)).toBe('1');
    expect(lastSales('# nothing')).toBe('0');
  });
});

describe('shelfRows / appendMetricsRows', () => {
  const note = parseNoteLine('- 2026-11-30 10:12 | etsy views 4/day kindle 2 sold');

  it('parses the note line stamp', () => {
    expect(note).toEqual({
      date: '2026-11-30',
      time: '10:12',
      text: 'etsy views 4/day kindle 2 sold',
    });
    expect(parseNoteLine('  - Claude: answered')).toBeUndefined();
  });

  it('writes one row per figure after the last §7 row, Sales carried', () => {
    if (!note) throw new Error('note expected');
    const rows = shelfRows(note, lastSales(research));
    expect(rows).toHaveLength(2);
    expect(rows[0]).toBe(
      '| 2026-11-30 | Etsy views | — | — | 1 | 4 listing views a day in Shop Manager (owner note 2026-11-30 10:12); §6 kill needs ≥ 5/day with 0 sales |',
    );
    expect(rows[1]).toContain(
      '| 2026-11-30 | Kindle sold | — | — | 1 | 2 copies sold in KDP Reports',
    );
    const md = appendMetricsRows(research, rows);
    const lines = md.split('\n');
    const sale = lines.findIndex((l) => l.includes('| Sale |'));
    expect(lines[sale + 1]).toBe(rows[0]);
    expect(lines[sale + 2]).toBe(rows[1]);
    expect(lines[sale + 3]).toBe('');
    expect(lines[sale + 4]).toBe('## 8. Owner steps');
  });

  it('leaves a file without the table untouched', () => {
    expect(appendMetricsRows('# no table', ['| x |'])).toBe('# no table');
  });
});

describe('recordShelfNotes', () => {
  it('appends rows from the new note lines and skips everything else', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'shelf-note-'));
    const file = path.join(dir, 'RESEARCH.md');
    writeFileSync(file, research);
    const written = recordShelfNotes(
      [
        '- 2026-11-30 10:12 | usage 60% fable 70%',
        '- 2026-11-30 10:13 | etsy views 4/day kindle 2 sold',
        '- 2026-11-30 10:14 | [dashboard idea] kindle: 3 sold',
      ],
      file,
    );
    expect(written).toHaveLength(3);
    const md = readFileSync(file, 'utf8');
    const rows = metricsRows(md).map((r) => r.line);
    expect(rows).toHaveLength(6);
    expect(rows[3]).toContain('| Etsy views |');
    expect(rows[4]).toContain('| Kindle sold | — | — | 1 | 2 copies');
    expect(rows[5]).toContain('| Kindle sold | — | — | 1 | 3 copies');
    expect(recordShelfNotes(['- 2026-12-01 09:00 | hello'], file)).toEqual([]);
    expect(
      recordShelfNotes(['- 2026-12-01 09:00 | kindle 1 sold'], path.join(dir, 'none.md')),
    ).toEqual([]);
  });
});

describe('kindleStatusRow / KINDLE.md (kdp-listing-live, 2026-11-03)', () => {
  it('yields a Status row only for a note that names the book page', () => {
    const note = parseNoteLine(
      '- 2026-11-30 10:12 | kindle 2 sold https://www.amazon.co.uk/dp/B0ABCDEFGH',
    );
    expect(note && kindleStatusRow(note)).toContain('https://www.amazon.co.uk/dp/B0ABCDEFGH');
    const plain = parseNoteLine('- 2026-11-30 10:12 | kindle 2 sold');
    expect(plain && kindleStatusRow(plain)).toBeUndefined();
  });

  it('appends the row to the Status table and the sold figure to §7 in one call', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'kindle-'));
    const researchFile = path.join(dir, 'RESEARCH.md');
    const kindle = path.join(dir, 'KINDLE.md');
    writeFileSync(researchFile, research);
    writeFileSync(kindle, kindlePack);
    const written = recordShelfNotes(
      ['- 2026-11-30 10:12 | kindle 1 sold, ASIN B0ABCDEFGH'],
      researchFile,
      kindle,
    );
    expect(written).toHaveLength(2);
    const status = tableRows(readFileSync(kindle, 'utf8'), STATUS_HEADING);
    expect(status).toHaveLength(2);
    expect(status[1]?.line).toContain('ASIN B0ABCDEFGH');
    expect(readFileSync(researchFile, 'utf8')).toContain('| 2026-11-30 | Kindle sold |');
    // a note without a figure or a link writes nothing
    expect(
      recordShelfNotes(['- 2026-11-30 10:12 | nothing to read'], researchFile, kindle),
    ).toEqual([]);
  });
});
