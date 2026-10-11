import { describe, expect, it } from 'vitest';
import {
  fileBounties,
  issueExcluded,
  itemId,
  parseAmount,
  rankOf,
  renderBoard,
  repoExcluded,
  type Bounty,
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
});

describe('rankOf', () => {
  it('prefers fresh issues in the languages the routines build in', () => {
    expect(rankOf(400, 'TypeScript', '2026-10-11', '2026-10-11')).toBe(400);
    expect(rankOf(400, 'TypeScript', '2026-09-11', '2026-10-11')).toBe(200);
    expect(rankOf(700, 'Solidity', '2026-10-11', '2026-10-11')).toBe(280);
  });
});

describe('board and queue', () => {
  it('renders the board with counts and files the top three, blocked until CI can push', () => {
    const b = [bounty({ rank: 400 }), bounty({ number: 43, rank: 100, amount: 100 })];
    const md = renderBoard(b, { raw: 500, kept: 2, dropped: { fork: 3 } }, '2026-10-11');
    expect(md).toMatch(/Read 500 issues, kept 2; dropped: fork 3/);
    expect(md).toMatch(/\| \$400 \| 400 \| \[acme\/widgets\]/);
    const out = fileBounties(queue, b, '2026-10-11', false);
    expect(out.added).toEqual(['bounty-acme-widgets-42', 'bounty-acme-widgets-43']);
    expect(out.queue.items[0]!.status).toBe('blocked');
    expect(out.queue.items[0]!.blocked_on).toMatch(/021/);
    const again = fileBounties(out.queue, b, '2026-10-12', true);
    expect(again.added).toEqual([]);
    expect(again.queue).toBe(out.queue);
    expect(fileBounties(queue, b, '2026-10-11', true).queue.items[0]!.status).toBe('todo');
    expect(itemId(bounty({ repo: 'Go-Gitea/gitea', number: 7 }))).toBe('bounty-go-gitea-gitea-7');
  });
});
