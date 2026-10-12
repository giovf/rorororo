import { describe, expect, it } from 'vitest';
import {
  fileBounties,
  fundingOf,
  issueExcluded,
  itemId,
  openPrs,
  parseAmount,
  rankOf,
  renderBoard,
  repoExcluded,
  takenBy,
  type Bounty,
  type Comment,
  type Repo,
} from './bounty-scanner.ts';
import type { Queue } from './refresh-errors-to-queue.ts';

const repo = (over: Partial<Repo> = {}): Repo => ({
  full_name: 'acme/widgets',
  fork: false,
  archived: false,
  stargazers_count: 900,
  language: 'TypeScript',
  license: 'MIT',
  pushed_at: '2026-10-09T10:00:00Z',
  description: 'A widget toolkit',
  ...over,
});
const bounty = (over: Partial<Bounty> = {}): Bounty => ({
  repo: 'acme/widgets',
  number: 42,
  url: 'https://github.com/acme/widgets/issues/42',
  title: 'Add CSV export to the table view',
  created_at: '2026-10-01T00:00:00Z',
  labels: ['💎 Bounty', '$400'],
  body: '',
  amount: 400,
  attempts: 1,
  funding: 'funded',
  assigned: false,
  prs: 0,
  stars: 900,
  language: 'TypeScript',
  license: 'MIT',
  rank: 0,
  ...over,
});
const queue: Queue = {
  venture: 'oss-bounties',
  status: 'open',
  needs_research: false,
  updated: '2026-10-11',
  items: [],
};

describe('parseAmount', () => {
  it('takes the largest dollar figure across labels, body and bot comments', () => {
    expect(parseAmount(['$50', 'Fix parse_duration', '💎 **$1,200 bounty** created by acme'])).toBe(
      1200,
    );
    expect(parseAmount(['/bounty $250.00', '$ 20'])).toBe(250);
    expect(parseAmount(['no money here'])).toBe(0);
  });
});

const comment = (body: string, over: Partial<Comment> = {}): Comment => ({
  body,
  login: 'someone',
  author_association: 'NONE',
  ...over,
});

describe('fundingOf', () => {
  const issue = (title: string, body = '', author_association = 'NONE', labels: string[] = []) => ({
    title,
    body,
    labels,
    author_association,
  });
  it('counts a label, the bounty bot and a maintainer as funding', () => {
    expect(fundingOf(issue('Add CSV export', '', 'NONE', ['💎 Bounty', '$400']), [])).toEqual({
      amount: 400,
      funding: 'funded',
    });
    expect(
      fundingOf(issue('Fix parse_duration'), [
        comment('💎 **$1,200 bounty** created by acme', { login: 'algora-pbc[bot]' }),
      ]),
    ).toEqual({ amount: 1200, funding: 'funded' });
    expect(
      fundingOf(issue('Fix parse_duration'), [
        comment('/bounty $250', { author_association: 'MEMBER' }),
      ]),
    ).toEqual({ amount: 250, funding: 'funded' });
    // tt-metal#59732: the amount sits in a maintainer's own title.
    expect(
      fundingOf(issue('[Bounty $3,000] Fix sampling bias', 'Reward: $3,000 USD', 'MEMBER'), []),
    ).toEqual({ amount: 3000, funding: 'funded' });
  });
  it('reads a contributor asking for money as a proposal, not a bounty', () => {
    // turso#8749: a contributor wrote `/bounty $650` and nobody funded it.
    expect(
      fundingOf(issue('Expression index under a LEFT JOIN reads NULL'), [
        comment('/bounty $650 — I will open the PR once this is funded', {
          author_association: 'CONTRIBUTOR',
        }),
      ]),
    ).toEqual({ amount: 650, funding: 'proposed' });
    // omi#20175: the issue author's "Proposed Bounty: $150 – $250 USDC".
    expect(
      fundingOf(issue('[Bug]: token refresh', 'Proposed Bounty: $150 – $250 USDC to 0xabc'), []),
    ).toEqual({ amount: 250, funding: 'proposed' });
    // A maintainer's own text that reads as a proposal is still a proposal.
    expect(
      fundingOf(issue('fix(x): one bad doc 500s ($50 bounty proposal)', '', 'MEMBER'), []),
    ).toEqual({ amount: 50, funding: 'proposed' });
    expect(fundingOf(issue('Handle out-of-disk'), [comment('I can take this')])).toEqual({
      amount: 0,
      funding: 'none',
    });
  });
  it('lets a funded figure win over a larger proposed one', () => {
    expect(
      fundingOf(issue('Fix it', 'I propose $900 for this'), [
        comment('/bounty $100', { author_association: 'OWNER' }),
      ]),
    ).toEqual({ amount: 100, funding: 'funded' });
  });
});

describe('openPrs and takenBy', () => {
  it('counts open linked pull requests from the timeline and names what blocks a claim', () => {
    expect(
      openPrs([
        { event: 'labeled' },
        { event: 'cross-referenced', source: { issue: { state: 'open', pull_request: {} } } },
        { event: 'cross-referenced', source: { issue: { state: 'closed', pull_request: {} } } },
        { event: 'cross-referenced', source: { issue: { state: 'open' } } },
      ]),
    ).toBe(1);
    expect(takenBy({ assigned: false, prs: 0 })).toBe('free');
    expect(takenBy({ assigned: true, prs: 1 })).toBe('assigned');
    expect(takenBy({ assigned: false, prs: 2 })).toBe('2 PRs open');
    expect(takenBy({ assigned: false, prs: 1 })).toBe('1 PR open');
  });
});

describe('exclusions', () => {
  it('drops sandboxes, security repositories, forks, small and stale repositories', () => {
    expect(repoExcluded(repo(), '2026-10-11')).toBeUndefined();
    expect(repoExcluded(repo({ full_name: 'x/bug-bounty' }), '2026-10-11')).toBe(
      'sandbox or security repository',
    );
    expect(
      repoExcluded(
        repo({ description: 'Sandbox fixture for testing bounty hunters' }),
        '2026-10-11',
      ),
    ).toBe('sandbox or security repository');
    expect(repoExcluded(repo({ fork: true }), '2026-10-11')).toBe('fork');
    expect(repoExcluded(repo({ stargazers_count: 3 }), '2026-10-11')).toMatch(/stars/);
    expect(repoExcluded(repo({ pushed_at: '2026-05-01T00:00:00Z' }), '2026-10-11')).toMatch(
      /no push/,
    );
  });
  it('drops issues that read as security findings or are already rewarded', () => {
    expect(issueExcluded('Add CSV export', ['💎 Bounty'])).toBeUndefined();
    expect(
      issueExcluded('Upload endpoint lacks authentication — unauthenticated file upload', []),
    ).toBe('reads as a security finding');
    expect(issueExcluded('Handle out-of-disk gracefully', ['💎 Bounty', '💰 Rewarded'])).toBe(
      'already rewarded',
    );
  });
  it('drops contests, showcases and usage tasks that pay for something other than a fix', () => {
    const contest = 'contest or usage task, not a fix';
    expect(
      issueExcluded('🎁 Build Something with Salam Programming Language (Community Reward)', [
        '$5',
      ]),
    ).toBe(contest);
    expect(
      issueExcluded(
        'Coding with an agent: 3 tasks (website, real bug fix, tests)',
        ['bounty: $5'],
        'Payment: $5 per task to the first report that passes. Claim with "Taking task N", record the whole session and email hi@useagent.org.',
      ),
    ).toBe(contest);
    expect(issueExcluded('Fix parse_duration on negative input', ['$100'], 'Repro below')).toBe(
      undefined,
    );
    expect(
      issueExcluded('Add CSV export', ['$200'], 'Users email us about this every week.'),
    ).toBeUndefined();
  });
});

describe('rankOf', () => {
  it('prefers fresh issues in the languages the routines build in', () => {
    expect(rankOf(400, 'TypeScript', '2026-10-11', '2026-10-11')).toBe(400);
    expect(rankOf(400, 'TypeScript', '2026-09-11', '2026-10-11')).toBe(200);
    expect(rankOf(700, 'Solidity', '2026-10-11', '2026-10-11')).toBe(280);
  });
  it('ranks a contested issue below a free one', () => {
    expect(rankOf(400, 'TypeScript', '2026-10-11', '2026-10-11', 2)).toBe(133);
    expect(rankOf(400, 'TypeScript', '2026-10-11', '2026-10-11', 1)).toBe(200);
  });
});

describe('board and queue', () => {
  it('renders the board with counts and files the top free ones, blocked until CI can push', () => {
    const b = [
      bounty({ number: 41, rank: 900, amount: 900, assigned: true }),
      bounty({ rank: 400 }),
      bounty({ number: 43, rank: 100, amount: 100 }),
      bounty({ number: 44, rank: 50, amount: 100, prs: 2 }),
      bounty({ number: 45, rank: 20, amount: 20 }),
    ];
    const md = renderBoard(b, { raw: 500, kept: 5, dropped: { fork: 3 } }, '2026-10-11');
    expect(md).toMatch(/Read 500 issues, kept 5; dropped: fork 3/);
    expect(md).toMatch(/\| \$20 \| 20 \| /);
    expect(md).toMatch(/\| \$900 \| 900 \| \[acme\/widgets\].* \| assigned \| 1 \|/);
    expect(md).toMatch(/\| \$400 \| 400 \| \[acme\/widgets\].* \| free \| 1 \|/);
    expect(md).toMatch(/\| 2 PRs open \| 1 \|/);
    const out = fileBounties(queue, b, '2026-10-11', false);
    expect(out.added).toEqual(['bounty-acme-widgets-42', 'bounty-acme-widgets-43']); // #45 is under $25
    expect(out.queue.items[0]!.why).toMatch(/free when filed/);
    expect(out.queue.items[0]!.status).toBe('blocked');
    expect(out.queue.items[0]!.blocked_on).toMatch(/021/);
    const again = fileBounties(out.queue, b, '2026-10-12', true);
    expect(again.added).toEqual([]);
    expect(again.queue).toBe(out.queue);
    expect(fileBounties(queue, b, '2026-10-11', true).queue.items[0]!.status).toBe('todo');
    expect(itemId(bounty({ repo: 'Go-Gitea/gitea', number: 7 }))).toBe('bounty-go-gitea-gitea-7');
  });
});
