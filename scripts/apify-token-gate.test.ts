import { describe, expect, it } from 'vitest';
import {
  BACK_TEXT,
  PROBE_URL,
  WAIT_TEXT,
  gate,
  probe,
  stamp,
  tokenState,
  waitedOn,
  waiting,
} from './apify-token-gate.ts';
import { CAP, parseRuns } from './runs-check.ts';

const RUNS = [
  '# Runs',
  '',
  '- 2026-11-12 09:22 | build | Built gankdat uk-payment-practices: register, 7 tests',
  '',
].join('\n');
const at = (iso: string): Date => new Date(iso);

describe('tokenState', () => {
  it('reads 200 as ok and 401 as a wait', () => {
    expect(tokenState(200)).toBe('ok');
    expect(tokenState(401)).toBe('wait');
  });

  it('raises every other status, so a real outage still fails the job', () => {
    for (const status of [403, 404, 429, 500, 503])
      expect(() => tokenState(status)).toThrow(`unexpected HTTP ${status}`);
  });
});

describe('probe', () => {
  it('calls /v2/users/me with the bearer token', async () => {
    const calls: Array<[string, Record<string, string>]> = [];
    const state = await probe('tok_1', (url, init) => {
      calls.push([url, init.headers]);
      return Promise.resolve({ status: 401 });
    });
    expect(state).toBe('wait');
    expect(calls).toEqual([[PROBE_URL, { Authorization: 'Bearer tok_1' }]]);
  });

  it('lets a network error through', async () => {
    await expect(probe('tok_1', () => Promise.reject(new Error('ENOTFOUND')))).rejects.toThrow(
      'ENOTFOUND',
    );
  });
});

describe('gate', () => {
  it('writes nothing while the token works and no wait is open', () => {
    const r = gate('ok', RUNS, at('2026-11-14T11:03:00Z'));
    expect(r).toEqual({ state: 'ok', catchup: false, runsMd: RUNS });
  });

  it('writes one wait line on a 401, in the run-log shape and inside the cap', () => {
    const r = gate('wait', RUNS, at('2026-11-12T11:58:10Z'));
    expect(r.line).toBe(`- 2026-11-12 11:58 | watchdog | ${WAIT_TEXT}`);
    expect(r.runsMd).toBe(`${RUNS.trimEnd()}\n${r.line}\n`);
    expect(r.catchup).toBe(false);
    const { runs, malformed } = parseRuns(r.runsMd);
    expect(malformed).toEqual([]);
    expect(runs.at(-1)?.routine).toBe('watchdog');
    expect(WAIT_TEXT.length).toBeLessThanOrEqual(CAP);
    expect(BACK_TEXT.length).toBeLessThanOrEqual(CAP);
  });

  it('writes the wait line once a day, however many runs see the 401', () => {
    const first = gate('wait', RUNS, at('2026-11-12T11:58:10Z'));
    const second = gate('wait', first.runsMd, at('2026-11-12T17:35:00Z'));
    expect(second.line).toBeUndefined();
    expect(second.runsMd).toBe(first.runsMd);
    const nextDay = gate('wait', second.runsMd, at('2026-11-13T11:41:00Z'));
    expect(nextDay.line).toBe(`- 2026-11-13 11:41 | watchdog | ${WAIT_TEXT}`);
  });

  it('asks for a full push on the first ok after a wait, then goes quiet', () => {
    const waited = gate('wait', RUNS, at('2026-11-12T11:58:10Z'));
    expect(waiting(waited.runsMd)).toBe(true);
    const back = gate('ok', waited.runsMd, at('2026-11-13T11:41:19Z'));
    expect(back.catchup).toBe(true);
    expect(back.line).toBe(`- 2026-11-13 11:41 | watchdog | ${BACK_TEXT}`);
    expect(waiting(back.runsMd)).toBe(false);
    const later = gate('ok', back.runsMd, at('2026-11-14T11:03:00Z'));
    expect(later).toEqual({ state: 'ok', catchup: false, runsMd: back.runsMd });
  });

  it('opens a new wait after an answered one', () => {
    const waited = gate('wait', RUNS, at('2026-11-12T11:58:10Z'));
    const back = gate('ok', waited.runsMd, at('2026-11-13T11:41:19Z'));
    const again = gate('wait', back.runsMd, at('2026-12-01T04:00:00Z'));
    expect(again.line).toContain('2026-12-01 04:00 | watchdog | wait: apify token');
    expect(waiting(again.runsMd)).toBe(true);
  });
});

describe('helpers', () => {
  it('stamps in UTC to the minute', () => {
    expect(stamp(at('2026-11-14T17:09:59Z'))).toBe('2026-11-14 17:09');
  });

  it('matches the wait line by its day only', () => {
    const waited = gate('wait', RUNS, at('2026-11-12T11:58:10Z')).runsMd;
    expect(waitedOn(waited, '2026-11-12')).toBe(true);
    expect(waitedOn(waited, '2026-11-13')).toBe(false);
  });
});
