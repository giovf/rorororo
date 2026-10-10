import { describe, expect, it } from 'vitest';
import {
  DIGEST_MAX_CHARS,
  actionIds,
  ageDays,
  askTitle,
  closeEntry,
  digestLine,
  formatLine,
  isOpen,
  ledger,
  medianAge,
  ownActionIds,
  parseArgs,
  parseEntries,
  parseMinutes,
  rankAsks,
  renderOpen,
  summary,
  type Queue,
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

describe('owner digest (OPEN.md, notify line, median age)', () => {
  const asksMd = `# Alerts

- 2026-09-20 owner: **one 2-minute dashboard edit** — move the privacy URL (steps in
  \`docs/for-owner/actions/013-repo-private.md\`). Then Claude flips the repo private.
- 2026-09-28 owner: **publish the free "Variables Playground" Community file** (~10 min, £0, Figma desktop):
  build it, publish, reply with the URL. Steps: \`docs/for-owner/actions/017-figma-playground-file.md\`.
- 2026-09-29 owner: **republish the Variables Toolkit** (~10 min, same Figma session as actions 017/018): new tab.
  Steps: \`docs/for-owner/actions/019-figma-toolkit-republish-relink.md\`.
- 2026-09-30 owner: GitHub emailed that the Claude GitHub App is requesting updated permissions: review at
  https://github.com/settings/installations/1/permissions/update — only the owner's identity can approve this.
- 2026-09-30 handoff: sign and upload ReadFocus 0.3.0 once 0.2.0 clears review.
- 2026-09-19 owner: closed one — Done 2026-09-20 (build): done.
`;
  const queues: Queue[] = [
    {
      venture: 'highlight-keep',
      items: [
        {
          id: 'cws-listing-keywords',
          score: 4,
          status: 'blocked',
          blocked_on: 'owner: Chrome dashboard pass (action 013)',
        },
        { id: 'done-one', score: 9, status: 'done', blocked_on: 'action 013' },
      ],
    },
    {
      venture: 'read-focus',
      items: [
        {
          id: 'cws-promo-tile',
          score: 3,
          status: 'blocked',
          blocked_on: 'owner: Chrome Web Store dashboard (action 013 visit)',
        },
      ],
    },
    {
      venture: 'variables-toolkit',
      items: [
        {
          id: 'playground-file-views',
          score: 3,
          status: 'blocked',
          blocked_on: 'owner publishes the file (ALERTS 2026-09-28, action 017)',
        },
      ],
    },
  ];
  const now = new Date('2026-10-06T18:00:00Z');

  it('reads the minutes an ask quotes and the actions it names', () => {
    expect(parseMinutes('(~15 min + Figma review, £0)')).toBe(15);
    expect(parseMinutes('one 2-minute dashboard edit')).toBe(2);
    expect(parseMinutes('no estimate here')).toBeUndefined();
    expect(
      actionIds('same session as actions 017/018; steps in docs/for-owner/actions/019-x.md'),
    ).toEqual(['017', '018', '019']);
    expect(actionIds('Chrome dashboard pass (action 013)')).toEqual(['013']);
    expect(ownActionIds('batch with action 017. Steps: docs/for-owner/actions/018-y.md')).toEqual([
      '018',
    ]);
    expect(ownActionIds('batch with action 017 and action 018')).toEqual(['017', '018']);
  });

  it('titles an ask from its bold phrase, else its first clause, without markup', () => {
    expect(askTitle('**publish the `free` file** (~10 min): build it')).toBe(
      'publish the free file',
    );
    expect(askTitle('GitHub emailed that the App needs permissions: review at …')).toBe(
      'GitHub emailed that the App needs permissions',
    );
    expect(
      askTitle('**a very long bold title that goes on and on and on and on and on and on**', 20),
    ).toBe('a very long bold ti…');
  });

  it('ranks asks by the score they unblock over their minutes, then oldest first', () => {
    const asks = rankAsks(ledger(asksMd, now).open, queues, now);
    expect(asks.map((a) => a.entry.date)).toEqual([
      '2026-09-20',
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
    ]);
    const [dashboard, playground, relink, github] = asks;
    expect(dashboard?.unblocks.map((u) => `${u.venture}/${u.id}`)).toEqual([
      'highlight-keep/cws-listing-keywords',
      'read-focus/cws-promo-tile',
    ]);
    expect(dashboard?.payoff).toBe(7);
    expect(dashboard?.minutes).toBe(2);
    expect(playground?.payoff).toBe(3);
    // "same session as actions 017/018" is not action 017: the relink ask inherits nothing from it.
    expect(relink?.actions).toEqual(['019']);
    expect(relink?.payoff).toBe(0);
    expect(github?.minutes).toBeUndefined();
    expect(github?.rank).toBe(0);
  });

  it('measures the median open age in whole days', () => {
    const asks = rankAsks(ledger(asksMd, now).open, queues, now);
    expect(asks.map((a) => a.age)).toEqual([16, 8, 7, 6]);
    expect(medianAge(asks)).toBe(8);
    expect(medianAge(asks.slice(0, 3))).toBe(8);
    expect(medianAge([])).toBe(0);
  });

  it('writes one short plain digest line only while an ask is older than 7 days', () => {
    const asks = rankAsks(ledger(asksMd, now).open, queues, now);
    const line = digestLine(asks);
    expect(line).toBe('4 requests waiting on you, oldest 16 days: one 2-minute dashboard edit');
    expect(line?.length).toBeLessThanOrEqual(DIGEST_MAX_CHARS);
    expect(digestLine(asks.filter((a) => a.age <= 7))).toBeUndefined();
    expect(digestLine([])).toBeUndefined();
    const fresh = rankAsks(
      ledger(asksMd, new Date('2026-09-30T00:00:00Z')).open,
      queues,
      new Date('2026-09-30T00:00:00Z'),
    );
    expect(digestLine(fresh)).toBe(
      '4 requests waiting on you, oldest 10 days: one 2-minute dashboard edit',
    );
    const long = rankAsks(
      ledger('- 2026-09-01 owner: **' + 'word '.repeat(40) + '** go\n', now).open,
      [],
      now,
    );
    expect(digestLine(long)?.length).toBeLessThanOrEqual(DIGEST_MAX_CHARS);
  });

  it('renders OPEN.md with the ranked asks, their step links and the attended handoffs', () => {
    const book = ledger(asksMd, now);
    const asks = rankAsks(book.open, queues, now);
    const handoffs = book.open.filter((e) => e.kind === 'handoff');
    const md = renderOpen(asks, handoffs, new Map([['013', '013-repo-private.md']]));
    expect(md).toContain('## Requests (4)');
    expect(md).toContain(
      '1. **one 2-minute dashboard edit** — ~2 min, since 2026-09-20; unblocks highlight-keep `cws-listing-keywords` (4), read-focus `cws-promo-tile` (3). Steps: [013](actions/013-repo-private.md).',
    );
    expect(md).toContain('Steps: 017.');
    expect(md).toContain('time not stated, since 2026-09-30');
    expect(md).toContain('## Waiting on an attended Claude session, not you (1)');
    expect(md).toContain('- since 2026-09-30 — sign and upload ReadFocus 0.3.0');
    expect(md).not.toContain('closed one');
    // No clock in the file: the same asks a day later render byte-identical (no daily churn).
    const later = new Date(now.getTime() + 86_400_000);
    const laterAsks = rankAsks(ledger(asksMd, later).open, queues, later);
    expect(renderOpen(laterAsks, handoffs, new Map([['013', '013-repo-private.md']]))).toBe(md);
    expect(md).not.toMatch(/waiting \d+ days|on 20\d\d-\d\d-\d\d from the open/);
    const empty = renderOpen([], [], new Map());
    expect(empty).toContain('Nothing is waiting on you.');
    expect(empty).toContain('None.');
  });
});
