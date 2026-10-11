// Bounty scanner (oss-bounties `bounty-scanner`, 2026-10-11): reads GitHub for open issues that carry
// a posted cash bounty, drops the noise, ranks what is left and writes docs/bounties/BOARD.md plus
// up to three queue items. Feature and bug-fix work only — issues that read as security findings and
// repositories that are testing sandboxes are excluded by rule, never ranked.
//
// Why these searches (measured 2026-10-11): the `💎 Bounty` label alone is thin and stale — 522 open
// issues, 287 outside three fixture repos, and 182 of those in one more — while the bounty bot's
// `/bounty $N` command appears on 1,496 issues created since 2026-09-01. So the board is built from
// `"/bounty $" in:comments` over the last 90 days plus the label search, de-duplicated, with the
// amount read from labels, the body and (for the shortlist) the comments.
//
// Funding and competition (build 2026-10-11, oss-bounties `bounty-scanner-funding-and-taken`): the first
// board's top three were a $3,000 issue already assigned with a PR submitted, a "$650" that a contributor
// had asked for and nobody funded, and an $80 issue with two PRs open; the omi "$250" rows were the issue
// authors' own "bounty proposals". So a `$N` counts as funded only when it comes from a label, from the
// bounty bot, or from a maintainer (the issue's author or a `/bounty` commenter with OWNER, MEMBER or
// COLLABORATOR association) and the text is not a proposal; everything else is "proposed" and dropped.
// The shortlist also reads assignees and the timeline's open linked PRs: a taken issue stays on the board
// (ranked down by its competition) but is never filed as a queue item.
//
// Run: npm run bounties [-- --date=YYYY-MM-DD]   (GITHUB_TOKEN in CI; `gh auth token` locally)
// Node 22 runs .ts directly — keep syntax erasable, import only node builtins.
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serialize, type Queue, type QueueItem } from './refresh-errors-to-queue.ts';

export const BOARD_FILE = path.join('docs', 'bounties', 'BOARD.md');
export const QUEUE_FILE = path.join('docs', 'pipeline', 'queues', 'oss-bounties.json');
export const LOOKBACK_DAYS = 90;
export const MIN_STARS = 20;
export const MAX_REPO_AGE_DAYS = 90;
export const BOARD_SIZE = 40;
export const SHORTLIST = 60;
export const FILE_TOP = 3;
export const SCORE = 7;
export const EFFORT_DAYS = 1;
/** Languages the routines build in well; others rank at 0.4. */
export const PREFERRED_LANGUAGES = new Set(['TypeScript', 'JavaScript', 'Python', 'Rust', 'Go']);
/** A repository whose name or description reads like a testing sandbox or a security exercise. */
export const EXCLUDED_REPO =
  /bounty[- ]?hunt|bug[- ]?bount|sandbox|fixture|livefire|test[- ]?target|pentest|security|vulnerab|\bctf\b|exploit|anticheat/i;
/** An issue that reads as a security finding rather than a feature or bug-fix task. */
export const EXCLUDED_ISSUE =
  /vulnerab|exploit|\bcve-?\d|\bxss\b|injection|auth(entication|orization)? bypass|privilege|csrf|ssrf|\brce\b|security (bug|issue|flaw)|unauthenticated/i;

export interface Repo {
  full_name: string;
  fork: boolean;
  archived: boolean;
  stargazers_count: number;
  language: string | null;
  license: string | null;
  pushed_at: string;
  description: string | null;
}

export type Funding = 'funded' | 'proposed' | 'none';
/** GitHub `author_association` values that mean the writer can fund a bounty on the repository. */
export const MAINTAINER = new Set(['OWNER', 'MEMBER', 'COLLABORATOR']);
/** Text that offers or asks for a bounty rather than posting one. */
export const PROPOSAL_RE =
  /propos|suggest|request(ing|ed)? (a )?bounty|would (like|love) (a )?bounty|asking for|if (a |the )?bounty/i;

export interface IssueText {
  title: string;
  body: string;
  labels: string[];
  /** `author_association` of the issue author. */
  author_association: string;
}
export interface Comment {
  body: string;
  login: string;
  author_association: string;
}

export interface Bounty {
  repo: string;
  number: number;
  url: string;
  title: string;
  created_at: string;
  labels: string[];
  body: string;
  amount: number;
  /** `/attempt` or `/claim` comments seen (0 when comments were not read). */
  attempts: number;
  funding: Funding;
  /** The issue has an assignee. */
  assigned: boolean;
  /** Open pull requests linked to the issue (timeline cross-references); 0 when not read. */
  prs: number;
  stars: number;
  language: string | null;
  license: string | null;
  rank: number;
}

/** The largest `$N` in the texts (labels, title, body, comments); 0 when none. */
export function parseAmount(texts: string[]): number {
  let best = 0;
  for (const t of texts) {
    for (const m of t.matchAll(/\$\s?(\d{1,3}(?:,\d{3})*|\d+)(?:\.\d+)?\b/g)) {
      const n = Number((m[1] ?? '0').replaceAll(',', ''));
      if (n > best) best = n;
    }
  }
  return best;
}

/**
 * Amount and provenance. Funded: a `$N` in a label, in the bounty bot's comment, in a maintainer's
 * `/bounty` command, or in a maintainer's own issue text; a labelled bounty issue is funded whatever
 * its author's association (the bot only labels what it holds). Proposed: a `$N` written by anyone
 * else, or any text that reads as a proposal or a request. The largest funded figure wins; a proposed
 * figure is reported only when nothing funded it.
 */
export function fundingOf(
  issue: IssueText,
  comments: Comment[],
): { amount: number; funding: Funding } {
  const funded: string[] = [...issue.labels];
  const proposed: string[] = [];
  const own = `${issue.title}\n${issue.body}`;
  const labelled = issue.labels.some((l) => /bounty/i.test(l));
  const ownIsProposal = PROPOSAL_RE.test(own);
  if ((labelled || MAINTAINER.has(issue.author_association)) && !ownIsProposal) funded.push(own);
  else proposed.push(own);
  for (const c of comments) {
    const body = c.body ?? '';
    if (!/bounty/i.test(body)) continue;
    const bot = /\[bot\]$/.test(c.login) || /^algora/i.test(c.login);
    const command = /^\s*\/bounty\b/m.test(body);
    if (bot || (command && MAINTAINER.has(c.author_association) && !PROPOSAL_RE.test(body))) {
      funded.push(body);
    } else {
      proposed.push(body);
    }
  }
  const amount = parseAmount(funded);
  if (amount > 0) return { amount, funding: 'funded' };
  const asked = parseAmount(proposed);
  return asked > 0 ? { amount: asked, funding: 'proposed' } : { amount: 0, funding: 'none' };
}

export interface TimelineEvent {
  event: string;
  source?: { issue?: { state?: string; pull_request?: unknown } };
}

/** Open pull requests that reference the issue (GitHub's "Development" links arrive as cross-references). */
export function openPrs(events: TimelineEvent[]): number {
  return events.filter(
    (e) =>
      e.event === 'cross-referenced' &&
      e.source?.issue?.pull_request !== undefined &&
      e.source.issue.state === 'open',
  ).length;
}

/** What stands between a new claim and the money: `free`, `assigned`, or the open PRs. */
export function takenBy(b: Pick<Bounty, 'assigned' | 'prs'>): string {
  if (b.assigned) return 'assigned';
  if (b.prs > 0) return `${b.prs} PR${b.prs === 1 ? '' : 's'} open`;
  return 'free';
}

export function repoExcluded(repo: Repo, today: string): string | undefined {
  if (repo.fork) return 'fork';
  if (repo.archived) return 'archived';
  if (repo.stargazers_count < MIN_STARS) return `under ${MIN_STARS} stars`;
  if (EXCLUDED_REPO.test(`${repo.full_name} ${repo.description ?? ''}`))
    return 'sandbox or security repository';
  if (daysBetween(repo.pushed_at.slice(0, 10), today) > MAX_REPO_AGE_DAYS)
    return `no push in ${MAX_REPO_AGE_DAYS} days`;
  return undefined;
}

export function issueExcluded(title: string, labels: string[]): string | undefined {
  if (EXCLUDED_ISSUE.test(title)) return 'reads as a security finding';
  if (labels.some((l) => /rewarded|paid|completed/i.test(l))) return 'already rewarded';
  return undefined;
}

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

/**
 * amount × language fit ÷ (1 + age in months) ÷ (1 + competition): a fresh $400 TypeScript issue
 * outranks an old $700 one, and one with two PRs open ranks a third of a free one. Competition is
 * the open linked PRs plus one when the issue is assigned.
 */
export function rankOf(
  amount: number,
  language: string | null,
  created: string,
  today: string,
  competition = 0,
): number {
  const fit = language && PREFERRED_LANGUAGES.has(language) ? 1 : 0.4;
  const age = Math.max(0, daysBetween(created.slice(0, 10), today));
  return Math.round((amount * fit) / (1 + age / 30) / (1 + Math.max(0, competition)));
}

export function renderBoard(
  bounties: Bounty[],
  stats: { raw: number; kept: number; dropped: Record<string, number> },
  today: string,
): string {
  const rows = bounties
    .slice(0, BOARD_SIZE)
    .map(
      (b) =>
        `| $${b.amount} | ${b.rank} | [${b.repo}](https://github.com/${b.repo}) (${b.stars}★, ${b.language ?? '—'}, ${b.license ?? 'no licence'}) | [#${b.number}](${b.url}) ${b.title.replaceAll('|', '\\|').slice(0, 90)} | ${daysBetween(b.created_at.slice(0, 10), today)} d | ${takenBy(b)} | ${b.attempts} |`,
    );
  const dropped = Object.entries(stats.dropped)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k} ${v}`)
    .join(', ');
  return `# Open-source bounty board — ${today}

Written daily by \`scripts/bounty-scanner.ts\` (\`.github/workflows/bounty-board.yml\`) from GitHub's search API:
open issues that received a \`/bounty $N\` command in the last ${LOOKBACK_DAYS} days or carry a bounty label. Feature and
bug-fix work only: sandbox and security repositories and issues that read as security findings are dropped by
rule. Only money a maintainer, the bounty bot or a label posted counts; a contributor's "bounty proposal" is dropped.
Rank = amount × language fit ÷ (1 + age in months) ÷ (1 + open PRs + assigned). Taken says what stands between a new
claim and the money; the top ${FILE_TOP} free ones become \`oss-bounties\` queue items.

Read ${stats.raw} issues, kept ${stats.kept}; dropped: ${dropped || 'none'}.

| Amount | Rank | Repository | Issue | Age | Taken | Attempts |
| --- | --- | --- | --- | --- | --- | --- |
${rows.join('\n')}
`;
}

export function itemId(b: Bounty): string {
  return `bounty-${b.repo.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${b.number}`;
}

/**
 * Files the top free bounties (no assignee, no open PR) as queue items, idempotent on id; blocked
 * until CI can push a fork.
 */
export function fileBounties(
  queue: Queue,
  bounties: Bounty[],
  today: string,
  canPush: boolean,
): { queue: Queue; added: string[] } {
  const items = queue.items.map((it) => ({ ...it }));
  const added: string[] = [];
  for (const b of bounties.filter((x) => takenBy(x) === 'free').slice(0, FILE_TOP)) {
    const id = itemId(b);
    if (items.some((it) => it.id === id)) continue;
    const item: QueueItem = {
      id,
      title: `Bounty $${b.amount} on ${b.repo}#${b.number}: ${b.title.slice(0, 100)} — fork, fix with tests in the project's conventions, open the PR with \`/claim #${b.number}\` and a plain note on how it was built`,
      why: `Filed by the bounty scanner (${today}, docs/bounties/BOARD.md): $${b.amount} posted on ${b.url} by a maintainer, the bounty bot or a label; free when filed (no assignee, no open PR); ${b.repo} has ${b.stars} stars, ${b.language ?? 'no main language'}, ${b.license ?? 'no licence file'}, ${b.attempts} attempt comment(s). Read CONTRIBUTING first; a project that forbids AI-assisted work is skipped and the item dropped.`,
      effort_days: EFFORT_DAYS,
      proof: 'PR merged and the bounty paid (revenue row in docs/LEDGER.md)',
      score: SCORE,
      status: canPush ? 'todo' : 'blocked',
      added: today,
    };
    if (!canPush) item.blocked_on = 'owner actions 021 (PR_TOKEN) and 022 (board sign-in)';
    items.push(item);
    added.push(id);
  }
  return { queue: added.length ? { ...queue, items, updated: today } : queue, added };
}

// ---------------------------------------------------------------- GitHub reads (not unit-tested)

function token(): string {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    return execSync('gh auth token', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    throw new Error('no GITHUB_TOKEN and gh is not logged in');
  }
}

async function gh<T>(tok: string, url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${tok}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'foundry-bounty-scanner',
    },
  });
  if (res.status === 403 || res.status === 429) {
    const reset = Number(res.headers.get('x-ratelimit-reset') ?? 0) * 1000;
    const wait = Math.min(65_000, Math.max(2_000, reset - Date.now()));
    await new Promise((r) => setTimeout(r, wait));
    return gh(tok, url);
  }
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return (await res.json()) as T;
}

interface SearchItem {
  repository_url: string;
  number: number;
  html_url: string;
  title: string;
  created_at: string;
  labels: { name: string }[];
  body: string | null;
  comments: number;
  author_association?: string;
  assignees?: { login: string }[];
}

async function search(tok: string, q: string, pages: number): Promise<SearchItem[]> {
  const out: SearchItem[] = [];
  for (let page = 1; page <= pages; page++) {
    const r = await gh<{ items: SearchItem[] }>(
      tok,
      `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&sort=updated&order=desc&per_page=100&page=${page}`,
    );
    out.push(...r.items);
    if (r.items.length < 100) break;
  }
  return out;
}

async function main(): Promise<void> {
  const dateArg = process.argv.find((a) => a.startsWith('--date='))?.slice('--date='.length);
  const today = dateArg ?? new Date().toISOString().slice(0, 10);
  const since = new Date(Date.parse(`${today}T00:00:00Z`) - LOOKBACK_DAYS * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const tok = token();
  const raw = new Map<string, SearchItem>();
  for (const q of [
    `is:issue is:open "/bounty $" in:comments created:>=${since}`,
    'is:issue is:open label:"💎 Bounty" -label:"💰 Rewarded"',
  ]) {
    for (const it of await search(tok, q, 3)) raw.set(it.html_url, it);
  }
  const dropped: Record<string, number> = {};
  const drop = (why: string): void => {
    dropped[why] = (dropped[why] ?? 0) + 1;
  };
  const repos = new Map<string, Repo | undefined>();
  const authors = new Map<string, string>();
  const kept: Bounty[] = [];
  for (const it of raw.values()) {
    const full = it.repository_url.replace('https://api.github.com/repos/', '');
    const labels = it.labels.map((l) => l.name);
    const why = issueExcluded(it.title, labels);
    if (why) {
      drop(why);
      continue;
    }
    if (!repos.has(full)) {
      repos.set(
        full,
        await gh<Record<string, unknown>>(tok, it.repository_url)
          .then((r) => ({
            full_name: String(r.full_name),
            fork: Boolean(r.fork),
            archived: Boolean(r.archived),
            stargazers_count: Number(r.stargazers_count ?? 0),
            language: (r.language as string | null) ?? null,
            license:
              ((r.license as { spdx_id?: string } | null)?.spdx_id ?? null) === 'NOASSERTION'
                ? null
                : ((r.license as { spdx_id?: string } | null)?.spdx_id ?? null),
            pushed_at: typeof r.pushed_at === 'string' ? r.pushed_at : '1970-01-01',
            description: (r.description as string | null) ?? null,
          }))
          .catch(() => undefined),
      );
    }
    const repo = repos.get(full);
    if (!repo) {
      drop('repository unreadable');
      continue;
    }
    const rwhy = repoExcluded(repo, today);
    if (rwhy) {
      drop(rwhy);
      continue;
    }
    const first = fundingOf(
      {
        title: it.title,
        body: it.body ?? '',
        labels,
        author_association: it.author_association ?? 'NONE',
      },
      [],
    );
    authors.set(it.html_url, it.author_association ?? 'NONE');
    kept.push({
      repo: full,
      number: it.number,
      url: it.html_url,
      title: it.title,
      created_at: it.created_at,
      labels,
      body: it.body ?? '',
      amount: first.amount,
      attempts: 0,
      funding: first.funding,
      assigned: (it.assignees?.length ?? 0) > 0,
      prs: 0,
      stars: repo.stargazers_count,
      language: repo.language,
      license: repo.license,
      rank: 0,
    });
  }
  // Comments carry the bot's `$N bounty` line, who posted it and the attempts; the timeline carries
  // the linked PRs. Both are read for the shortlist only (two calls per issue).
  kept.sort((a, b) => b.amount - a.amount || a.created_at.localeCompare(b.created_at));
  for (const b of kept.slice(0, SHORTLIST)) {
    const comments = await gh<
      { body: string | null; user?: { login?: string }; author_association?: string }[]
    >(tok, `https://api.github.com/repos/${b.repo}/issues/${b.number}/comments?per_page=100`).catch(
      () => [],
    );
    const read: Comment[] = comments.map((c) => ({
      body: c.body ?? '',
      login: c.user?.login ?? '',
      author_association: c.author_association ?? 'NONE',
    }));
    const f = fundingOf(
      {
        title: b.title,
        body: b.body,
        labels: b.labels,
        author_association: authors.get(b.url) ?? 'NONE',
      },
      read,
    );
    b.amount = f.amount;
    b.funding = f.funding;
    b.attempts = read.filter((c) => /^\s*\/(attempt|claim)\b/m.test(c.body)).length;
    b.prs = openPrs(
      await gh<TimelineEvent[]>(
        tok,
        `https://api.github.com/repos/${b.repo}/issues/${b.number}/timeline?per_page=100`,
      ).catch(() => []),
    );
  }
  const board = kept
    .filter((b) => b.funding === 'funded' && b.amount > 0)
    .map((b) => ({
      ...b,
      rank: rankOf(b.amount, b.language, b.created_at, today, b.prs + (b.assigned ? 1 : 0)),
    }));
  const proposedOnly = kept.filter((b) => b.funding === 'proposed').length;
  if (proposedOnly) dropped['proposed, not funded'] = proposedOnly;
  const noAmount = kept.length - board.length - proposedOnly;
  if (noAmount) dropped['no amount found'] = noAmount;
  board.sort((a, b) => b.rank - a.rank || b.amount - a.amount);
  mkdirSync(path.dirname(BOARD_FILE), { recursive: true });
  writeFileSync(
    BOARD_FILE,
    renderBoard(board, { raw: raw.size, kept: board.length, dropped }, today),
  );
  const queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf8')) as Queue;
  const out = fileBounties(queue, board, today, Boolean(process.env.PR_TOKEN_PRESENT));
  if (out.queue !== queue) writeFileSync(QUEUE_FILE, serialize(out.queue));
  console.log(
    `bounties ${today}: read ${raw.size}, kept ${board.length}, filed [${out.added.join(', ')}]; dropped ${JSON.stringify(dropped)}`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e: unknown) => {
    console.error(e instanceof Error ? e.message : String(e));
    process.exitCode = 1;
  });
}
