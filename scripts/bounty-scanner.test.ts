import { describe, expect, it } from 'vitest';
import {
  fileBounties,
  fundingOf,
  ghAll,
  issueExcluded,
  itemId,
  openPrs,
  parseAmount,
  parseOpireRewards,
  parseReward,
  rankOf,
  renderBoard,
  repoExcluded,
  shapeExcluded,
  stripOpireFooter,
  takenBy,
  takenColumn,
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
  escrowed: true,
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
      escrowed: true,
      ignored: 0,
    });
    expect(
      fundingOf(issue('Fix parse_duration'), [
        comment('💎 **$1,200 bounty** created by acme', { login: 'algora-pbc[bot]' }),
      ]),
    ).toEqual({ amount: 1200, funding: 'funded', escrowed: true, ignored: 0 });
    expect(
      fundingOf(issue('Fix parse_duration'), [
        comment('/bounty $250', { author_association: 'MEMBER' }),
      ]),
    ).toEqual({ amount: 250, funding: 'funded', escrowed: true, ignored: 0 });
    // tt-metal#59732: the amount sits in a maintainer's own title.
    expect(
      fundingOf(issue('[Bounty $3,000] Fix sampling bias', 'Reward: $3,000 USD', 'MEMBER'), []),
    ).toEqual({ amount: 3000, funding: 'funded', escrowed: true, ignored: 0 });
  });
  it('reads a contributor asking for money as a proposal, not a bounty', () => {
    // turso#8749: a contributor wrote `/bounty $650` and nobody funded it.
    expect(
      fundingOf(issue('Expression index under a LEFT JOIN reads NULL'), [
        comment('/bounty $650 — I will open the PR once this is funded', {
          author_association: 'CONTRIBUTOR',
        }),
      ]),
    ).toEqual({ amount: 650, funding: 'proposed', escrowed: false, ignored: 0 });
    // omi#20175: the issue author's "Proposed Bounty: $150 – $250 USDC".
    expect(
      fundingOf(issue('[Bug]: token refresh', 'Proposed Bounty: $150 – $250 USDC to 0xabc'), []),
    ).toEqual({ amount: 250, funding: 'proposed', escrowed: false, ignored: 0 });
    // A maintainer's own text that reads as a proposal is still a proposal.
    expect(
      fundingOf(issue('fix(x): one bad doc 500s ($50 bounty proposal)', '', 'MEMBER'), []),
    ).toEqual({ amount: 50, funding: 'proposed', escrowed: false, ignored: 0 });
    expect(fundingOf(issue('Handle out-of-disk'), [comment('I can take this')])).toEqual({
      amount: 0,
      funding: 'none',
      escrowed: false,
      ignored: 0,
    });
  });
  it('lets a funded figure win over a larger proposed one', () => {
    expect(
      fundingOf(issue('Fix it', 'I propose $900 for this'), [
        comment('/bounty $100', { author_association: 'OWNER' }),
      ]),
    ).toEqual({ amount: 100, funding: 'funded', escrowed: true, ignored: 0 });
  });
  // Opire (docs.opire.dev/overview/commands and /rewards/pricing, read 2026-10-14): a code owner's
  // `/reward 20` is USD with no `$`; the creator pays by hand after the merge, so nothing is escrowed.
  it("reads a code owner's /reward as funded but not escrowed, and ignores anyone else's", () => {
    expect(
      fundingOf(issue('Open target URLs in the default browser'), [
        comment('/reward 30', { author_association: 'OWNER' }),
      ]),
    ).toEqual({ amount: 30, funding: 'funded', escrowed: false, ignored: 0 });
    expect(
      fundingOf(issue('Add a Windows build', '/reward 42\nSee the thread.', 'OWNER'), []),
    ).toEqual({ amount: 42, funding: 'funded', escrowed: false, ignored: 0 });
    expect(
      fundingOf(issue('Fix the installer on Alpine'), [
        comment('/reward 100', { author_association: 'NONE' }),
        comment('/try', { author_association: 'NONE' }),
        comment('😅 Ups... this issue does not have any reward yet!', { login: 'opirebot[bot]' }),
      ]),
    ).toEqual({ amount: 0, funding: 'none', escrowed: false, ignored: 1 });
    expect(
      fundingOf(issue('Fix it'), [
        comment('💵 A reward of $25 was created for this issue', { login: 'opirebot[bot]' }),
      ]),
    ).toEqual({ amount: 25, funding: 'funded', escrowed: false, ignored: 0 });
    // Escrowed money wins over an Opire reward of the same size; a larger reward wins on amount.
    expect(
      fundingOf(issue('Fix it', '', 'NONE', ['$50']), [
        comment('/reward 50', { author_association: 'MEMBER' }),
      ]),
    ).toEqual({ amount: 50, funding: 'funded', escrowed: true, ignored: 0 });
    expect(
      fundingOf(issue('Fix it', '', 'NONE', ['$50']), [
        comment('/reward 80', { author_association: 'MEMBER' }),
      ]),
    ).toEqual({ amount: 80, funding: 'funded', escrowed: false, ignored: 0 });
  });
});

describe('Opire footer and rewards', () => {
  // The footer OpireBot appends to every issue of a repository it is installed on (probe-rs#4355,
  // read 2026-10-14) — the `/reward 100` and `/tip 20` in it are examples, not money.
  const footer =
    '<br/>\n<hr/>\n\n<details><summary>This repo is using Opire - what does it mean? 👇</summary><br/>💵 Everyone can add rewards for this issue commenting <code>/reward 100</code> (replace <code>100</code> with the amount).<br/>🕵️‍♂️ If someone starts working on this issue to earn the rewards, they can comment <code>/try</code> to let everyone know!<br/>🙌 And when they open the PR, they can comment <code>/claim #35</code> either in the PR description or in a PR\'s comment.<br/><br/>🪙 Also, everyone can tip any user commenting <code>/tip 20 @someone</code> (replace <code>20</code> with the amount, and <code>@someone</code> with the user to tip).<br/><br/>📖 If you want to learn more, check out our <a href="https://docs.opire.dev">documentation</a>.</details>';
  it('strips the footer and the badge and marks the repository', () => {
    const body = `Installer fails on Alpine.\n\n${footer}`;
    expect(stripOpireFooter(body)).toEqual({ text: 'Installer fails on Alpine.', opire: true });
    const badge =
      '[![Opire Bounty](https://img.shields.io/badge/bounty-Opire-emerald?style=for-the-badge)](https://github.com/x/y)\n<br/>\n<hr/>\n\n' +
      footer.replace(/^<br\/>\n<hr\/>\n\n/, '');
    expect(stripOpireFooter(`Fix the flag leak.\n\n---\n\n${badge}`)).toEqual({
      text: 'Fix the flag leak.\n\n---',
      opire: true,
    });
    expect(stripOpireFooter('Plain issue')).toEqual({ text: 'Plain issue', opire: false });
    expect(parseReward([footer])).toBe(0);
    expect(parseReward(['/reward 20', 'please /reward 1,000 this', '/reward $35'])).toBe(35);
  });
  it('reads the open rewards from the app page and skips what is not an issue', () => {
    const reward = (url: string, cents: number, extra: Record<string, unknown> = {}) => ({
      id: 'x',
      title: 'Open target URLs [PWA] not in PWA',
      url,
      platform: 'GITHUB',
      programmingLanguages: ['TypeScript'],
      pendingPrice: { value: cents, unit: 'USD_CENT' },
      tryingUsers: [{ id: 'a' }, { id: 'b' }],
      claimerUsers: [{ id: 'a' }],
      ...extra,
    });
    const flight = JSON.stringify([
      '$',
      'div',
      null,
      {
        initialRewards: [
          reward('https://github.com/trovu/trovu/issues/329', 3000),
          reward('https://github.com/radumarias/rencfs/issues/3', 4200, {
            programmingLanguages: ['Rust'],
            tryingUsers: [],
            claimerUsers: [],
          }),
          reward('https://gitlab.com/x/y/-/issues/1', 2000),
          reward('https://github.com/a/b/issues/9', 0),
        ],
        stats: { bountiesAvailable: 6 },
      },
    ]);
    const half = Math.floor(flight.length / 2);
    const html = `<html><script>self.__next_f.push([1,${JSON.stringify(flight.slice(0, half))}])</script><script>self.__next_f.push([1,${JSON.stringify(flight.slice(half))}])</script></html>`;
    expect(parseOpireRewards(html)).toEqual([
      {
        url: 'https://github.com/trovu/trovu/issues/329',
        amount: 30,
        trying: 2,
        claimers: 1,
        languages: ['TypeScript'],
      },
      {
        url: 'https://github.com/radumarias/rencfs/issues/3',
        amount: 42,
        trying: 0,
        claimers: 0,
        languages: ['Rust'],
      },
    ]);
    expect(parseOpireRewards('<html>no payload</html>')).toEqual([]);
    expect(
      parseOpireRewards('<script>self.__next_f.push([1,"\\"initialRewards\\":[{"])</script>'),
    ).toEqual([]);
  });
});

describe('ghAll', () => {
  it('reads every page up to the first short one, and no more than maxPages', async () => {
    const calls: string[] = [];
    const pages: string[][] = [
      new Array<string>(100).fill('a'),
      new Array<string>(100).fill('b'),
      ['c'],
    ];
    const get = (u: string): Promise<string[]> => {
      calls.push(u);
      return Promise.resolve(pages[Number(/&page=(\d+)$/.exec(u)?.[1]) - 1] ?? []);
    };
    expect((await ghAll(get, 'https://x/issues/329/timeline?per_page=100')).length).toBe(201);
    expect(calls).toEqual([
      'https://x/issues/329/timeline?per_page=100&page=1',
      'https://x/issues/329/timeline?per_page=100&page=2',
      'https://x/issues/329/timeline?per_page=100&page=3',
    ]);
    calls.length = 0;
    const full = (): Promise<string[]> => Promise.resolve(new Array<string>(100).fill('x'));
    expect((await ghAll(full, 'https://x/list', 2)).length).toBe(200);
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
    expect(takenColumn({ assigned: false, prs: 0, escrowed: true })).toBe('free');
    expect(takenColumn({ assigned: false, prs: 0, escrowed: false })).toBe('free, not escrowed');
    expect(takenColumn({ assigned: false, prs: 2, escrowed: false })).toBe(
      '2 PRs open, not escrowed',
    );
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

describe('shapeExcluded', () => {
  // Wording quoted from useagent#61, the 2026-10-12 build's read; the other shapes are CONTEST_ISSUE's.
  it('drops the mobile app that needs real phones, then the maintainer-assigned claim', () => {
    const body =
      'Builds that install on a real iPhone and a real Android phone and a screen recording of each in the pull request. A maintainer assigns this issue before work counts.';
    expect(shapeExcluded(`Build the UseAgent mobile app for iOS and Android\n${body}`)).toBe(
      "needs a real device or the claimant's own recording",
    );
    expect(
      shapeExcluded(
        'Add the Discord transport\nA maintainer assigns this issue before work counts.',
      ),
    ).toBe('the maintainer picks the claimant first');
    expect(shapeExcluded('Fix sampling bias\nMust be verified on real hardware (Wormhole).')).toBe(
      'needs hardware the sandbox lacks',
    );
    // The contest regex already catches "screen recording"; the shape rule catches the device alone.
    expect(issueExcluded('Build the mobile app', ['bounty: $80'], body)).toBe(
      'contest or usage task, not a fix',
    );
    expect(
      issueExcluded(
        'Build the mobile app',
        ['bounty: $80'],
        'Builds that install on a real iPhone and a real Android phone. A maintainer assigns this issue before work counts.',
      ),
    ).toBe("needs a real device or the claimant's own recording");
  });
  // Wording quoted from trovu#329's 2026-05-23 edit, the 2026-10-15 build's read.
  it('drops the phone video and the human statement the trovu maintainer asks for', () => {
    expect(
      shapeExcluded(
        'Open target URLs not in PWA but in default browser\nA video recorded on an Android device, showing: you open the PWA.',
      ),
    ).toBe("needs a real device or the claimant's own recording");
    expect(
      shapeExcluded(
        'Open target URLs in default browser\nThe following statement: `I am a human who is writing this comment, not an AI.`',
      ),
    ).toBe('the maintainer wants a human in the thread');
    expect(
      shapeExcluded('Fix the video player\nThe video stutters on an Android phone.'),
    ).toBeUndefined();
  });
  it('keeps ordinary feature and bug-fix work', () => {
    expect(
      shapeExcluded(
        'Add CSV export to the table view\nRecord the export in the audit log, add a test; the maintainer assigns reviewers.',
      ),
    ).toBeUndefined();
    expect(
      issueExcluded('Add CSV export', ['💎 Bounty'], 'Please add a test for the session store.'),
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
      bounty({ number: 46, rank: 30, amount: 30, escrowed: false }),
    ];
    const md = renderBoard(b, { raw: 500, kept: 6, dropped: { fork: 3 }, opire: 5 }, '2026-10-11');
    expect(md).toMatch(/Read 500 issues \(5 listed on Opire\), kept 6; dropped: fork 3/);
    expect(md).toMatch(/\| \$30 \| 30 \| .* \| free, not escrowed \| 1 \|/);
    expect(renderBoard([], { raw: 1, kept: 0, dropped: {} }, '2026-10-11')).toMatch(
      /Read 1 issues, kept 0; dropped: none/,
    );
    expect(md).toMatch(/\| \$20 \| 20 \| /);
    expect(md).toMatch(/\| \$900 \| 900 \| \[acme\/widgets\].* \| assigned \| 1 \|/);
    expect(md).toMatch(/\| \$400 \| 400 \| \[acme\/widgets\].* \| free \| 1 \|/);
    expect(md).toMatch(/\| 2 PRs open \| 1 \|/);
    const out = fileBounties(queue, b, '2026-10-11', false);
    // #45 is under $25; #46 is the third free one, an Opire reward, and says so.
    expect(out.added).toEqual([
      'bounty-acme-widgets-42',
      'bounty-acme-widgets-43',
      'bounty-acme-widgets-46',
    ]);
    expect(out.queue.items[0]!.why).toMatch(/free when filed/);
    expect(out.queue.items[0]!.title).not.toMatch(/escrowed/);
    expect(out.queue.items[2]!.title).toMatch(
      /^Bounty \$30 \(Opire, not escrowed\) on acme\/widgets#46/,
    );
    expect(out.queue.items[2]!.why).toMatch(
      /not escrowed: the creator arranges payment after the merge/,
    );
    expect(out.queue.items[0]!.status).toBe('blocked');
    expect(out.queue.items[0]!.blocked_on).toMatch(/021/);
    const again = fileBounties(out.queue, b, '2026-10-12', true);
    expect(again.added).toEqual([]);
    expect(again.queue).toBe(out.queue);
    expect(fileBounties(queue, b, '2026-10-11', true).queue.items[0]!.status).toBe('todo');
    expect(itemId(bounty({ repo: 'Go-Gitea/gitea', number: 7 }))).toBe('bounty-go-gitea-gitea-7');
  });
});
