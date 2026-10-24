import { describe, expect, it } from 'vitest';
import {
  ciFailedRuns,
  failedLine,
  itemId,
  reportedWeek,
  type FailedRun,
} from './ci-failed-runs.js';
import type { Queue } from './refresh-errors-to-queue.js';

const now = new Date('2026-10-23T18:40:00Z');
const publish: FailedRun = {
  workflow: 'gankdat-publish.yml',
  name: 'gankdat publish',
  runNumber: 54,
  createdAt: '2026-10-23T17:34:10Z',
  url: 'https://github.com/giovf/rorororo/actions/runs/39996133213',
  failingStep: 'Publish to the MCP registry',
  later: { runNumber: 55, conclusion: 'success' },
};
const relay: FailedRun = {
  workflow: 'fetch-relay.yml',
  name: 'fetch relay',
  runNumber: 152,
  createdAt: '2026-10-22T21:24:30Z',
  url: 'https://github.com/giovf/rorororo/actions/runs/39856156578',
  failingStep: 'Fetch the requested URLs',
};
const queue = (): Queue => ({
  venture: 'foundry',
  status: 'open',
  needs_research: false,
  updated: '2026-10-22',
  items: [],
});
const log = (...lines: string[]): string => `# Run log\n\n${lines.join('\n')}\n`;

describe('failedLine', () => {
  it('names the workflow, run, time, step and the repair, within the 120-char cap', () => {
    expect(failedLine(publish, now)).toBe(
      '- 2026-10-23 18:40 | watchdog | ci-failed: gankdat-publish.yml run 54 17:34 — step Publish to the MCP registry; later run 55 ok',
    );
    expect(failedLine(relay, now)).toBe(
      '- 2026-10-23 18:40 | watchdog | ci-failed: fetch-relay.yml run 152 21:24 — step Fetch the requested URLs; no later run',
    );
    const long = {
      ...relay,
      failingStep: 'A'.repeat(90),
      later: { runNumber: 153, conclusion: 'failure' },
    };
    const line = failedLine(long, now);
    expect(line.split(' | ')[2]!.length).toBeLessThanOrEqual(120);
    expect(line).toContain('; later run 153 failure');
    const unnamed: FailedRun = { ...relay };
    delete unnamed.failingStep;
    expect(failedLine(unnamed, now)).toContain('step an unnamed step;');
  });
});

describe('itemId and reportedWeek', () => {
  it('derives the item id from the file and counts the week of reported runs per workflow', () => {
    expect(itemId('fetch-relay.yml')).toBe('ci-fetch-relay-failing');
    const text = log(
      '- 2026-10-15 10:40 | watchdog | ci-failed: fetch-relay.yml run 140 10:12 — step Fetch; no later run',
      '- 2026-10-22 18:40 | watchdog | ci-failed: fetch-relay.yml run 148 18:38 — step Fetch; later run 149 ok',
      '- 2026-10-22 22:40 | watchdog | ci-failed: fetch-relay.yml run 152 21:24 — step Fetch; no later run',
      '- 2026-10-22 22:40 | watchdog | ci-minutes: 630 billed min/7d',
    );
    const week = reportedWeek(text, now);
    expect([...(week.get('fetch-relay.yml') ?? [])]).toEqual([148, 152]);
    expect(week.has('ci-minutes:')).toBe(false);
  });
});

describe('ciFailedRuns', () => {
  it('writes one line per fresh failed run, skips reported ones, files no item for a single failure', () => {
    const out = ciFailedRuns({ runs: [publish, relay], runsText: log(), queue: queue(), now });
    expect(out.lines).toHaveLength(2);
    expect(out.lines[0]).toContain('fetch-relay.yml run 152');
    expect(out.lines[1]).toContain('gankdat-publish.yml run 54');
    expect(out.repeating).toEqual([]);
    expect(out.queue.items).toEqual([]);
    const again = ciFailedRuns({
      runs: [publish, relay],
      runsText: log(...out.lines),
      queue: queue(),
      now,
    });
    expect(again.lines).toEqual([]);
  });
  it('ignores a run older than the lookback window', () => {
    const old = { ...relay, runNumber: 140, createdAt: '2026-10-21T10:12:00Z' };
    expect(ciFailedRuns({ runs: [old], runsText: log(), queue: queue(), now }).lines).toEqual([]);
  });
  it('files an idempotent item once a workflow fails twice in seven days, counting reported lines', () => {
    const earlier =
      '- 2026-10-22 20:40 | watchdog | ci-failed: fetch-relay.yml run 148 18:38 — step Fetch; later run 149 ok';
    const out = ciFailedRuns({ runs: [relay], runsText: log(earlier), queue: queue(), now });
    expect(out.repeating).toEqual(['fetch-relay.yml']);
    expect(out.queue.items).toHaveLength(1);
    const item = out.queue.items[0]!;
    expect(item.id).toBe('ci-fetch-relay-failing');
    expect(item.score).toBe(5);
    expect(item.status).toBe('todo');
    expect(item.why).toContain('run 152');
    expect(out.queue.updated).toBe('2026-10-23');
    // a third failure refreshes the open item instead of duplicating it
    const third = { ...relay, runNumber: 156, createdAt: '2026-10-23T09:14:00Z' };
    const next = ciFailedRuns({
      runs: [third],
      runsText: log(earlier, ...out.lines),
      queue: out.queue,
      now,
    });
    expect(next.queue.items).toHaveLength(1);
    expect(next.queue.items[0]!.why).toContain('run 156');
    expect(next.queue.items[0]!.status).toBe('todo');
  });
  it('reopens a done item when the workflow fails again', () => {
    const done: Queue = {
      ...queue(),
      items: [
        {
          id: 'ci-fetch-relay-failing',
          title: 't',
          why: 'w',
          effort_days: 0.2,
          proof: 'p',
          score: 5,
          status: 'done',
          added: '2026-10-18',
          done_at: '2026-10-19',
        },
      ],
    };
    const earlier =
      '- 2026-10-22 20:40 | watchdog | ci-failed: fetch-relay.yml run 148 18:38 — step Fetch; no later run';
    const out = ciFailedRuns({ runs: [relay], runsText: log(earlier), queue: done, now });
    expect(out.queue.items[0]!.status).toBe('todo');
    expect(out.queue.items[0]!.done_at).toBeUndefined();
  });
  it('does not count a week-old line toward the repeat', () => {
    const stale =
      '- 2026-10-15 20:40 | watchdog | ci-failed: fetch-relay.yml run 120 18:38 — step Fetch; no later run';
    const out = ciFailedRuns({ runs: [relay], runsText: log(stale), queue: queue(), now });
    expect(out.repeating).toEqual([]);
  });
});
