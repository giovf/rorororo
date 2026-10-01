import { describe, expect, it } from 'vitest';
import {
  ageDays,
  closeEntry,
  formatLine,
  isOpen,
  ledger,
  parseArgs,
  parseEntries,
  summary,
} from './handoffs.ts';

const today = new Date('2026-10-01T00:30:00Z');

function pick<T>(items: readonly T[], index: number): T {
  const item = items.at(index);
  if (item === undefined) throw new Error(`no item at ${index}`);
  return item;
}

const md = `# Alerts and handoffs

Convention text that is not an entry.

## Open

- 2026-09-21 handoff: verify the new \`uk-schools\` ingest against the real files — the daily
  build container has no egress, so the mappings are written from the research doc.
- 2026-09-21 owner: Telegram notifications are live — nothing to do.
- 2026-09-21 done: handoffs from the daily build executed by the interactive session — registry at v0.12.0.
- 2026-09-25 gankdat/apify: Actor flagged "under maintenance" by Apify's automated QA.
- 2026-09-28 handoff: inbox backlog catch-up found two store mails — add the listing to STORE.md. — Done 2026-09-30 (burn-down): already in the listings log.
- 2026-09-29 handoff: apply the prompt change to two routines —
  the build routine cannot. — Superseded 2026-09-30 (burn-down): the prompts-from-repo handoff swaps both.
- 2026-09-30 owner: **one 2-minute dashboard edit** — the Chrome Web Store privacy-policy URL must move
  to apps.gankdat.com.
- 2026-09-30 handoff: ship Highlight Keep 0.1.1 from a machine with \`.env\`.
`;

describe('parseEntries', () => {
  it('finds every dated entry with its continuation lines', () => {
    const entries = parseEntries(md);
    expect(entries.map((e) => e.kind)).toEqual([
      'handoff',
      'owner',
      'done',
      'gankdat/apify',
      'handoff',
      'handoff',
      'owner',
      'handoff',
    ]);
    expect(pick(entries, 0).start).toBe(6);
    expect(pick(entries, 0).end).toBe(7);
    expect(pick(entries, 0).text).toContain('research doc.');
    expect(pick(entries, 6).text).toContain('to apps.gankdat.com.');
  });

  it('reads the Done / Superseded suffix, with its date', () => {
    const entries = parseEntries(md);
    expect(pick(entries, 4).closed).toEqual({ state: 'Done', on: '2026-09-30' });
    expect(pick(entries, 5).closed).toEqual({ state: 'Superseded', on: '2026-09-30' });
    expect(pick(entries, 0).closed).toBeUndefined();
  });
});

describe('isOpen / ledger', () => {
  it('counts only handoff and owner entries without a suffix as open, oldest first', () => {
    const book = ledger(md, today);
    expect(book.open.map((e) => `${e.date} ${e.kind}`)).toEqual([
      '2026-09-21 handoff',
      '2026-09-21 owner',
      '2026-09-30 owner',
      '2026-09-30 handoff',
    ]);
    expect(book.closed).toHaveLength(2);
    expect(parseEntries(md).filter(isOpen)).toHaveLength(4);
  });

  it('flags entries older than the stale threshold', () => {
    const book = ledger(md, today, 7);
    expect(book.stale.map((e) => e.date)).toEqual(['2026-09-21', '2026-09-21']);
    expect(ledger(md, today, 30).stale).toHaveLength(0);
  });
});

describe('ageDays / formatLine / summary', () => {
  it('measures whole UTC days', () => {
    expect(ageDays('2026-09-21', today)).toBe(10);
    expect(ageDays('2026-10-01', today)).toBe(0);
    expect(ageDays('2026-10-05', today)).toBe(0);
  });

  it('prints age, kind, date and a bounded one-line summary', () => {
    const first = pick(ledger(md, today).open, 0);
    const line = formatLine(first, today);
    expect(line.startsWith(' 10d | handoff | 2026-09-21 | verify the new `uk-schools`')).toBe(true);
    expect(line).not.toContain('\n');
    expect(summary(first, 40).length).toBeLessThanOrEqual(40);
    expect(summary(first, 40).endsWith('…')).toBe(true);
    const closed = pick(parseEntries(md), 4);
    expect(formatLine(closed, today)).toContain('[Done 2026-09-30]');
    expect(formatLine(pick(parseEntries(md), 6), today)).not.toContain('**');
  });
});

describe('closeEntry', () => {
  const opts = { on: '2026-10-01', by: 'burn-down', how: 'verified live:  52,578 schools loaded' };

  it('appends the suffix to the last line of the matching open entry and nothing else', () => {
    const out = closeEntry(md, 'verify the new `uk-schools`', opts);
    const before = md.split('\n');
    const after = out.split('\n');
    expect(after).toHaveLength(before.length);
    expect(after[7]).toBe(
      `${pick(before, 7)} — Done 2026-10-01 (burn-down): verified live: 52,578 schools loaded`,
    );
    after.forEach((l, i) => {
      if (i !== 7) expect(l).toBe(before[i]);
    });
    expect(pick(parseEntries(out), 0).closed).toEqual({ state: 'Done', on: '2026-10-01' });
    expect(ledger(out, today).open).toHaveLength(3);
  });

  it('can mark an entry Superseded', () => {
    const out = closeEntry(md, 'ship Highlight Keep', { ...opts, state: 'Superseded' });
    expect(parseEntries(out).at(-1)?.closed).toEqual({ state: 'Superseded', on: '2026-10-01' });
  });

  it('refuses when nothing open matches, including an already-closed entry', () => {
    expect(() => closeEntry(md, 'no such entry', opts)).toThrow(/no open/);
    expect(() => closeEntry(md, 'inbox backlog catch-up', opts)).toThrow(/no open/);
    expect(() => closeEntry(md, 'Actor flagged', opts)).toThrow(/no open/);
  });

  it('refuses an ambiguous match and names the candidates', () => {
    expect(() => closeEntry(md, '2026-09-21', opts)).toThrow(
      /matches 2 open entries[\s\S]*line 7[\s\S]*line 9/,
    );
  });
});

describe('parseArgs', () => {
  it('defaults to list and reads flags with and without values', () => {
    expect(parseArgs([])).toEqual({ command: 'list', positional: [], flags: {} });
    expect(parseArgs(['list', '--stale', '3', '--json'])).toEqual({
      command: 'list',
      positional: [],
      flags: { stale: '3', json: true },
    });
    expect(
      parseArgs(['close', 'uk-schools', '--by', 'burn-down', '--how', 'done', '--superseded']),
    ).toEqual({
      command: 'close',
      positional: ['uk-schools'],
      flags: { by: 'burn-down', how: 'done', superseded: true },
    });
  });
});
