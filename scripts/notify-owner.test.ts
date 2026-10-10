import { describe, expect, it } from 'vitest';
import {
  addedLines,
  buildMessages,
  MAX_RUN_BULLETS,
  cursorText,
  ownerItems,
  parseCursor,
  pickRange,
  runBullets,
  send,
} from './notify-owner.ts';

const SHA = '1007fe1354a19ed2e4a5e3c4d8c0b940f853504b';

describe('cursor file', () => {
  it('round-trips the cursor through the file text', () => {
    const text = cursorText(SHA, new Date('2026-09-30T21:30:05.123Z'), 3);
    expect(parseCursor(text)).toBe(SHA);
    expect(text).toContain('sent: 2026-09-30T21:30:05Z (3 lines)');
    expect(text.startsWith('# Notified cursor')).toBe(true);
  });

  it('has no cursor when the line is missing or malformed', () => {
    expect(parseCursor('# Notified cursor\n\nnothing here\n')).toBeUndefined();
    expect(parseCursor('cursor: not-a-sha\n')).toBeUndefined();
    expect(parseCursor('cursor: 1007fe1\n')).toBe('1007fe1');
  });
});

describe('pickRange', () => {
  const only = (ok: string[]) => (range: string) => ok.includes(range);

  it('prefers the cursor', () => {
    expect(pickRange({ cursor: SHA, pushBefore: 'abc1234', resolvable: () => true })).toEqual({
      range: `${SHA}..HEAD`,
      reason: 'cursor',
    });
  });

  it('falls back to the push range when the cursor does not resolve (force-push, moved cursor)', () => {
    expect(
      pickRange({ cursor: SHA, pushBefore: 'abc1234', resolvable: only(['abc1234..HEAD']) }),
    ).toEqual({ range: 'abc1234..HEAD', reason: 'push' });
  });

  it('never sends nothing: the last commit when neither resolves, and an all-zero before is not a commit', () => {
    expect(pickRange({ cursor: undefined, pushBefore: undefined, resolvable: () => true })).toEqual(
      {
        range: 'HEAD~1..HEAD',
        reason: 'last-commit',
      },
    );
    expect(
      pickRange({
        cursor: SHA,
        pushBefore: '0'.repeat(40),
        resolvable: only(['0'.repeat(40) + '..HEAD']),
      }),
    ).toEqual({ range: 'HEAD~1..HEAD', reason: 'last-commit' });
  });
});

const alertsDiff = [
  'diff --git a/docs/ALERTS.md b/docs/ALERTS.md',
  '--- a/docs/ALERTS.md',
  '+++ b/docs/ALERTS.md',
  '@@ -1,3 +1,6 @@',
  ' - 2026-09-29 handoff: old line',
  '+- 2026-09-30 owner: gankdat is ready for the directory — one portal form',
  '+- 2026-09-30 handoff: not for the phone',
  '+- 2026-09-30 owner: confirm the payout — Done 2026-09-30 (build): confirmed in Stripe',
  '-- 2026-09-28 owner: deleted false alarm',
  '+  continuation line that needs owner attention',
].join('\n');

const runsDiff = [
  '+++ b/docs/RUNS.md',
  '+- 2026-09-30 21:00 | burn-down | Built foundry refresh-errors-to-queue (8)',
  '+- 2026-09-30 21:00 | burn-down | Stopping for time; next is a | b',
  '+- 2026-09-30 21:05 | notify | ReadFocus 0.2 submitted to Chrome and Firefox: reads web PDFs',
  '+- 2026-09-30 21:06 | notify | Repo flipped private | nothing to do',
  '+not a run line',
].join('\n');

describe('message building', () => {
  it('takes only added lines', () => {
    expect(addedLines(alertsDiff)).toHaveLength(4);
  });

  it('sends owner lines, skips handoffs, deletions and lines closed in the same range', () => {
    expect(ownerItems(alertsDiff)).toEqual([
      'gankdat is ready for the directory — one portal form',
      'continuation line that needs owner attention',
    ]);
  });

  it('sends only notify-tagged run lines, as plain bullets, keeping a | inside the text', () => {
    expect(runBullets(runsDiff)).toEqual([
      '• ReadFocus 0.2 submitted to Chrome and Firefox: reads web PDFs',
      '• Repo flipped private | nothing to do',
    ]);
  });

  it('builds the two messages and counts the lines behind them', () => {
    const m = buildMessages({
      alertsDiff,
      runsDiff,
      newActions: [{ file: 'docs/for-owner/actions/014-x.md', title: 'Rotate the key' }],
    });
    expect(m.lines).toBe(5);
    expect(m.texts).toHaveLength(2);
    expect(m.texts[0]).toContain('Foundry needs you:\n• gankdat is ready for the directory');
    expect(m.texts[0]).toContain('• New request: Rotate the key (docs/for-owner/actions/014-x.md)');
    expect(m.texts[1]).toBe(
      'Foundry:\n• ReadFocus 0.2 submitted to Chrome and Firefox: reads web PDFs\n• Repo flipped private | nothing to do',
    );
  });

  it('caps one push at MAX_RUN_BULLETS run bullets and says how many it left out', () => {
    const many = Array.from(
      { length: 470 },
      (_, i) => `+- 2026-09-${String(22 + (i % 8)).padStart(2, '0')} 10:00 | notify | line ${i}`,
    ).join('\n');
    const m = buildMessages({ alertsDiff: '', runsDiff: many, newActions: [] });
    expect(m.lines).toBe(470);
    const bullets = (m.texts[0] ?? '').split('\n').slice(1);
    expect(bullets).toHaveLength(MAX_RUN_BULLETS + 1);
    expect(bullets[MAX_RUN_BULLETS]).toBe(
      '… 430 more run lines not sent here — read them in docs/RUNS.md',
    );
    expect(
      buildMessages({
        alertsDiff: '',
        runsDiff: many.split('\n').slice(0, 40).join('\n'),
        newActions: [],
      }).texts[0],
    ).not.toContain('more run lines');
  });

  it('builds nothing from an empty range', () => {
    expect(buildMessages({ alertsDiff: '', runsDiff: '', newActions: [] })).toEqual({
      texts: [],
      lines: 0,
    });
  });
});

describe('send', () => {
  const telegram = { TELEGRAM_BOT_TOKEN: 't', TELEGRAM_CHAT_ID: '1' };

  it('counts a 2xx as accepted and never puts the text in the URL for Telegram', async () => {
    const calls: string[] = [];
    const r = await send('hello', telegram, (url) => {
      calls.push(url);
      return Promise.resolve({ ok: true, status: 200 });
    });
    expect(r).toEqual({ configured: 1, accepted: 1 });
    expect(calls[0]).toBe('https://api.telegram.org/bott/sendMessage');
  });

  it('a 5xx or a thrown fetch leaves the message unaccepted (the cursor then stays put)', async () => {
    expect(await send('x', telegram, () => Promise.resolve({ ok: false, status: 502 }))).toEqual({
      configured: 1,
      accepted: 0,
    });
    expect(await send('x', telegram, () => Promise.reject(new Error('ECONNRESET')))).toEqual({
      configured: 1,
      accepted: 0,
    });
  });

  it('with no secrets nothing is configured', async () => {
    expect(await send('x', {}, () => Promise.resolve({ ok: true, status: 200 }))).toEqual({
      configured: 0,
      accepted: 0,
    });
  });

  it('sends to both channels when both are configured', async () => {
    const r = await send('x', { ...telegram, CALLMEBOT_PHONE: '+44', CALLMEBOT_APIKEY: 'k' }, () =>
      Promise.resolve({ ok: true, status: 200 }),
    );
    expect(r).toEqual({ configured: 2, accepted: 2 });
  });
});
