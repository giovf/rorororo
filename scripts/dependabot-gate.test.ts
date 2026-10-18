import { describe, expect, it } from 'vitest';
import {
  DEPENDABOT,
  SCORE_MAJOR,
  SCORE_MINOR,
  dependabotGate,
  gateLine,
  groupOf,
  redGates,
  type GateRun,
  type PullRequest,
} from './dependabot-gate.js';
import type { Queue } from './refresh-errors-to-queue.js';

const now = new Date('2026-10-18T00:40:00Z');
const minor: PullRequest = {
  number: 5,
  title: 'build(deps): bump the minor-and-patch group with 13 updates',
  headSha: '9a7d3326cdba5a69f316431b21de0f11026c97a3',
  author: DEPENDABOT,
  url: 'https://github.com/giovf/rorororo/pull/5',
};
const majors: PullRequest = {
  number: 6,
  title: 'build(deps): bump the majors group with 4 updates',
  headSha: 'df37191c7e1b40b0ae3b6ff51d416a5c473b880d',
  author: DEPENDABOT,
  url: 'https://github.com/giovf/rorororo/pull/6',
};
const human: PullRequest = {
  number: 2,
  title: 'Develop',
  headSha: '0ae18078',
  author: 'giovf',
  url: 'u',
};
const redRun = (pr: PullRequest, createdAt = '2026-10-16T18:31:45Z'): GateRun => ({
  headSha: pr.headSha,
  conclusion: 'failure',
  createdAt,
  url: `https://github.com/giovf/rorororo/actions/runs/${pr.number}`,
  failingStep: 'Run npm run check',
});
const queue = (): Queue => ({
  venture: 'foundry',
  status: 'open',
  needs_research: false,
  updated: '2026-10-17',
  items: [],
});
const runsText = '# Run log\n\n- 2026-10-17 19:30 | burn-down | something\n';

describe('groupOf', () => {
  it('reads the Dependabot group from the title and falls back to deps', () => {
    expect(groupOf(minor.title)).toBe('minor-and-patch');
    expect(groupOf('build(deps): bump typescript from 6 to 7')).toBe('deps');
  });
});

describe('redGates', () => {
  it('keeps only Dependabot PRs whose latest run on the head sha failed', () => {
    const runs: GateRun[] = [
      redRun(minor),
      {
        headSha: minor.headSha,
        conclusion: 'success',
        createdAt: '2026-10-17T10:00:00Z',
        url: 'u',
      },
      redRun(majors),
      {
        headSha: human.headSha,
        conclusion: 'failure',
        createdAt: '2026-10-16T00:00:00Z',
        url: 'u',
      },
    ];
    expect(redGates([minor, majors, human], runs).map((g) => g.pr.number)).toEqual([6]);
  });

  it('ignores a PR with no run on its head and one whose run is still going', () => {
    const runs: GateRun[] = [
      { headSha: minor.headSha, conclusion: null, createdAt: '2026-10-18T00:30:00Z', url: 'u' },
    ];
    expect(redGates([minor, majors], runs)).toEqual([]);
  });
});

describe('dependabotGate', () => {
  it('writes one line per red gate and files a scored item per PR', () => {
    const out = dependabotGate({
      prs: [minor, majors, human],
      runs: [redRun(minor), redRun(majors)],
      runsText,
      queue: queue(),
      now,
    });
    expect(out.lines).toEqual([
      '- 2026-10-18 00:40 | watchdog | dependabot: PR #5 minor-and-patch gate red at Run npm run check (9a7d332); foundry dependabot-pr-5 filed',
      '- 2026-10-18 00:40 | watchdog | dependabot: PR #6 majors gate red at Run npm run check (df37191); foundry dependabot-pr-6 filed',
    ]);
    for (const line of out.lines)
      expect(line.replace(/^- \S+ \S+ \| watchdog \| /, '').length).toBeLessThanOrEqual(120);
    expect(out.queue.items.map((i) => [i.id, i.score, i.status])).toEqual([
      ['dependabot-pr-5', SCORE_MINOR, 'todo'],
      ['dependabot-pr-6', SCORE_MAJOR, 'todo'],
    ]);
    expect(out.queue.updated).toBe('2026-10-18');
    expect(out.queue.items[0]?.why).toContain('actions/runs/5');
    expect(out.queue.items[0]?.title).toContain('@dependabot rebase');
    expect(out.queue.items[1]?.title).toContain('attended session');
  });

  it('files nothing when the line for that PR and head sha is already on main', () => {
    const first = dependabotGate({
      prs: [minor],
      runs: [redRun(minor)],
      runsText,
      queue: queue(),
      now,
    });
    const again = dependabotGate({
      prs: [minor],
      runs: [redRun(minor)],
      runsText: `${runsText}${first.lines.join('\n')}\n`,
      queue: first.queue,
      now,
    });
    expect(again.lines).toEqual([]);
    expect(again.queue).toBe(first.queue);
    expect(again.red).toHaveLength(1);
  });

  it('refreshes the open item instead of duplicating it when the PR goes red on a new head', () => {
    const first = dependabotGate({
      prs: [minor],
      runs: [redRun(minor)],
      runsText,
      queue: queue(),
      now,
    });
    const rebased = { ...minor, headSha: 'b2c3d4e5f6a7b2c3d4e5f6a7b2c3d4e5f6a7b2c3' };
    const out = dependabotGate({
      prs: [rebased],
      runs: [redRun(rebased, '2026-10-18T01:00:00Z')],
      runsText: `${runsText}${first.lines.join('\n')}\n`,
      queue: first.queue,
      now,
    });
    expect(out.lines).toHaveLength(1);
    expect(out.lines[0]).toContain('(b2c3d4e)');
    expect(out.queue.items).toHaveLength(1);
    expect(out.queue.items[0]?.why.match(/Filed by/g)).toHaveLength(2);
  });

  it('reopens a done item when the PR is red again on a newer head', () => {
    const q = queue();
    q.items.push({
      id: 'dependabot-pr-5',
      title: 'old',
      why: 'fixed once',
      effort_days: 0.2,
      proof: 'merged',
      score: 5,
      status: 'done',
      added: '2026-10-16',
      done_at: '2026-10-17',
    });
    const out = dependabotGate({ prs: [minor], runs: [redRun(minor)], runsText, queue: q, now });
    expect(out.queue.items[0]?.status).toBe('todo');
    expect(out.queue.items[0]?.done_at).toBeUndefined();
    expect(out.queue.items[0]?.updated).toBe('2026-10-18');
  });

  it('cuts a long step name so the run-log line stays under the cap', () => {
    const run = {
      ...redRun(minor),
      failingStep: 'A step whose name goes on and on far beyond forty characters',
    };
    const line = gateLine({ pr: minor, run, group: 'minor-and-patch' }, now);
    expect(line).toContain('…');
    expect(line).toContain('(9a7d332); foundry dependabot-pr-5 filed');
    expect(line.replace(/^- \S+ \S+ \| watchdog \| /, '').length).toBeLessThanOrEqual(120);
  });
});
