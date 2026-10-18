// Bounty scanner (oss-bounties `bounty-scanner`, 2026-10-11): reads GitHub for open issues that carry
// a posted cash bounty, drops the noise, ranks what is left and writes docs/bounties/BOARD.md plus
// up to three queue items (none while the queue is `finished`; weekly since 2026-10-18, the board is the
// exchange's re-open reading). Feature and bug-fix work only — issues that read as security findings and
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
// Contests and usage tasks (burn-down 2026-10-12, oss-bounties `bounty-scanner-contest-floor`): the next
// two filed items were a "$5 per task" ask to record oneself using the maintainer's product and email a
// report, and a "build something with our language" community reward paying the first two of twenty
// submissions. Neither is a fix on the repository, so an issue whose title or body reads as a contest,
// a showcase or a usage task is dropped by rule, and nothing under MIN_AMOUNT is filed: a day of work
// for $5 is not a line of income (STRATEGY §4 counts $50–$800 per merged PR).
//
// Shape (build 2026-10-12, oss-bounties `bounty-scanner-work-shape`, same slot as the contest floor above):
// the third filed item, useagent#61 ($80), was a whole mobile app the maintainer assigns to one of four
// claimants and verifies on a real iPhone and Android with the claimant's own recordings; tt-metal#59732
// needed vendor hardware. SHAPE_RULES catches those three shapes the contest regex does not — a result
// the claimant records on a real device, a claim the maintainer hands out first, a fix that needs
// hardware — on the title and body, each with its own reason in the board's dropped counts.
//
// Opire (build 2026-10-14, oss-bounties `bounty-board-opire-source`): a second source beside Algora, read from
// docs.opire.dev and GitHub through the relay. OpireBot appends the same footer ("This repo is using Opire …
// commenting `/reward 100`") to every issue of a repository it is installed on, funded or not, so the footer
// is stripped before any text is read and only marks the repository; a reward is a code owner's `/reward N`
// (USD, no `$`) in the issue text or a comment, or OpireBot's own reward comment. Opire holds no money:
// "a claim does not create an automatic payment; the creator arranges payment only if the pull request meets
// the issue requirements" (rewards/pricing), so such a row is `not escrowed` in the Taken column and the
// filed item says so. A `/reward` from anyone else is dropped as `reward not from a code owner` (Opire
// ignores it: only code owners create bounties). The footer search (`"This repo is using Opire" in:body`)
// found 525 open issues since 07-16, three agent farms among them; the repository rules drop those.
//
// Pages and two more shapes (build 2026-10-15, trovu#329): the first Opire item filed as "free" had PR #718
// open — the timeline read one page of 100 events and the issue had 100+, so every PR of 2026 sat on page
// two; comments and timeline now read up to MAX_PAGES. The same issue's body asks for a video recorded on
// an Android phone and the line "I am a human who is writing this comment, not an AI", which neither the
// contest regex nor the device rule matched: SHAPE_RULES gained both (no routine records a phone or
// signs a human statement), and the 10-14 Opire read had already judged the issue not takeable.
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
/** Smallest posted amount worth a queue item; smaller ones stay on the board for the record. */
export const MIN_AMOUNT = 25;
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
/**
 * An issue that pays for something other than a change to the repository: a contest, a showcase, a
 * "build something with X" reward, or a task that asks the taker to use the product, record it and
 * email a report. Matched against the title and the body.
 */
export const CONTEST_ISSUE =
  /community reward|build something with|giveaway|\bcontest\b|taking task \d|\$\s?\d+ (each|per (task|run|submission|project))|screen[- ]?record|recording link|email [\w.-]+@[\w.-]+|post (the|your|a) (public )?(repo|repository|project) link|submit (your|a) (project|repo|repository|app) (link|url|as a comment)|first (\d+ |two |three |five )?accepted (projects?|submissions?|reports?)|one reward per/i;

/**
 * Work no routine can deliver as a pull request with tests, beyond CONTEST_ISSUE: a result the claimant
 * must record on a real device, a claim the maintainer hands out before work counts, a fix that needs
 * hardware. The first rule that matches names the drop reason.
 */
export const SHAPE_RULES: readonly { re: RegExp; why: string }[] = [
  {
    re: /real (iphone|android|device|phone)|installable builds?|record(ing)? (of )?(the )?(whole|entire|full|your) session|(video|screencast|recording) (recorded |captured |made |taken )?(on|from) (an? |your |the )?(real |physical )?(android|ios|iphone|mobile) (device|phone)/i,
    why: "needs a real device or the claimant's own recording",
  },
  {
    re: /i am a human|written by a human|human,? not (an )?ai\b|not (an )?ai\.?`/i,
    why: 'the maintainer wants a human in the thread',
  },
  {
    re: /maintainer (must |will |has to |needs to )?assigns? (this|the) issue|assigned by a maintainer|maintainer picks|before (any )?work counts/i,
    why: 'the maintainer picks the claimant first',
  },
  {
    re: /requires? (access to )?(real |physical )?hardware|on (real |physical )hardware|hardware (access|required|needed)/i,
    why: 'needs hardware the sandbox lacks',
  },
  {
    // verdikta#76 (2026-10-16): the claimant posts and funds an on-chain task from their own wallet and
    // the slot pays on Poidh, "not here"; the issue says nothing is paid for pull requests.
    re: /\b(post|create|publish|open) and fund\b|fund(ed)? (it |one |a task )?with at least|funding (transaction|tx) hash|claim (it )?on \w+,? not here|nothing is paid for (comments (or|and) )?pull requests|paid (out )?(on|via|in) (poidh|base|ethereum|solana|polygon|arbitrum|optimism|crypto|a wallet)/i,
    why: 'the claimant must fund it or it pays to a wallet off GitHub',
  },
];

/** The SHAPE_RULES reason for an issue's title and body, or undefined when it reads as code work. */
export function shapeExcluded(text: string): string | undefined {
  return SHAPE_RULES.find((r) => r.re.test(text))?.why;
}

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
/**
 * OpireBot's footer on every issue of a repository it is installed on, and the badge some add above it;
 * both carry example amounts (`/reward 100`, `/tip 20`) that are not money on offer.
 */
export const OPIRE_FOOTER_RE =
  /(\[!\[Opire Bounty\]\([^)]*\)\]\([^)]*\)\s*)?(<br\s*\/?>\s*)*(<hr\s*\/?>\s*)*<details>\s*<summary>This repo is using Opire[\s\S]*?<\/details>/i;
/** Opire's reward command (USD, no `$`): `/reward 20` by a code owner in the issue text or a comment. */
export const REWARD_RE = /^\s*\/reward\s+\$?(\d{1,3}(?:,\d{3})*|\d+)(?:\.\d+)?\b/m;
/** OpireBot's login on GitHub. */
export const OPIRE_BOT = /^opirebot\[bot\]$/i;
/** The search that finds issues in repositories where OpireBot is installed (its footer is on every one). */
export const OPIRE_QUERY = '"This repo is using Opire" in:body is:issue is:open';
/** Most Opire-footer issues whose comments are read for a `/reward` per run (two calls each). */
export const OPIRE_READ = 40;

/** The issue text without OpireBot's footer, and whether the footer was there. */
export function stripOpireFooter(body: string): { text: string; opire: boolean } {
  const text = body.replace(OPIRE_FOOTER_RE, '').trimEnd();
  return { text, opire: text !== body.trimEnd() };
}

/** Where Opire lists its open rewards; a server-rendered Next.js page the scanner's runner can read. */
export const OPIRE_APP = 'https://app.opire.dev/';
export interface OpireReward {
  /** The GitHub issue URL. */
  url: string;
  /** Pending reward in USD. */
  amount: number;
  trying: number;
  claimers: number;
  languages: string[];
}

/**
 * Opire's open rewards from its app page: the Next.js flight payload (`self.__next_f.push([1, "…"])`
 * chunks) carries an `initialRewards` array with each issue's URL and `pendingPrice` in USD cents.
 * Rewards created from the app leave no `/reward` on GitHub (oxc#611 read 2026-10-14), so this is
 * the only complete list. Empty when the page's shape changed — the board then says 0 from Opire.
 */
export function parseOpireRewards(html: string): OpireReward[] {
  const chunks = [...html.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)];
  let flat = '';
  for (const m of chunks) {
    try {
      flat += JSON.parse(m[1] ?? '""') as string;
    } catch {
      /* a chunk that is not a JSON string literal carries no data */
    }
  }
  const at = flat.indexOf('"initialRewards":');
  if (at < 0) return [];
  const start = flat.indexOf('[', at);
  if (start < 0) return [];
  let depth = 0;
  let inString = false;
  let end = -1;
  for (let i = start; i < flat.length; i++) {
    const ch = flat[i];
    if (inString) {
      if (ch === '\\') i++;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '[') depth++;
    else if (ch === ']' && --depth === 0) {
      end = i;
      break;
    }
  }
  if (end < 0) return [];
  let rows: unknown;
  try {
    rows = JSON.parse(flat.slice(start, end + 1));
  } catch {
    return [];
  }
  if (!Array.isArray(rows)) return [];
  const out: OpireReward[] = [];
  for (const r of rows as Record<string, unknown>[]) {
    const url = typeof r.url === 'string' ? r.url : '';
    const price = r.pendingPrice as { value?: unknown; unit?: unknown } | undefined;
    const cents = typeof price?.value === 'number' ? price.value : 0;
    if (!/^https:\/\/github\.com\/[^/]+\/[^/]+\/issues\/\d+$/.test(url) || cents <= 0) continue;
    const count = (v: unknown): number => (Array.isArray(v) ? v.length : 0);
    out.push({
      url,
      amount: Math.round(cents) / 100,
      trying: count(r.tryingUsers),
      claimers: count(r.claimerUsers),
      languages: Array.isArray(r.programmingLanguages)
        ? r.programmingLanguages.filter((l): l is string => typeof l === 'string')
        : [],
    });
  }
  return out;
}

/** The largest `/reward N` command amount in the texts; 0 when none. */
export function parseReward(texts: string[]): number {
  let best = 0;
  for (const t of texts) {
    for (const m of t.matchAll(new RegExp(REWARD_RE.source, 'gm'))) {
      const n = Number((m[1] ?? '0').replaceAll(',', ''));
      if (n > best) best = n;
    }
  }
  return best;
}

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
  /**
   * The board holds the money (Algora's label, bot or `/bounty`); false when the only funding is an Opire
   * reward, which the creator pays by hand after the merge, if at all.
   */
  escrowed: boolean;
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
 * its author's association (the bot only labels what it holds). An Opire reward — a maintainer's
 * `/reward N` in the issue text or a comment, or OpireBot's own reward comment — is funded too but
 * `escrowed: false`; a `/reward` from anyone else is `ignored` (Opire only takes a code owner's).
 * Proposed: a `$N` written by anyone else, or any text that reads as a proposal or a request. The
 * largest funded figure wins, escrowed money over an Opire reward of the same size; a proposed figure
 * is reported only when nothing funded it.
 */
export function fundingOf(
  issue: IssueText,
  comments: Comment[],
): { amount: number; funding: Funding; escrowed: boolean; ignored: number } {
  const funded: string[] = [...issue.labels];
  const rewarded: string[] = [];
  const proposed: string[] = [];
  let ignored = 0;
  const own = stripOpireFooter(`${issue.title}\n${issue.body}`).text;
  const labelled = issue.labels.some((l) => /bounty/i.test(l));
  const ownIsProposal = PROPOSAL_RE.test(own);
  const maintainer = MAINTAINER.has(issue.author_association);
  if ((labelled || maintainer) && !ownIsProposal) funded.push(own);
  else proposed.push(own);
  if (REWARD_RE.test(own)) {
    if (maintainer) rewarded.push(own);
    else ignored += 1;
  }
  for (const c of comments) {
    const body = c.body ?? '';
    if (OPIRE_BOT.test(c.login)) {
      if (/reward/i.test(body) && !/not have any reward/i.test(body)) rewarded.push(body);
      continue;
    }
    if (REWARD_RE.test(body)) {
      if (MAINTAINER.has(c.author_association)) rewarded.push(body);
      else ignored += 1;
      continue;
    }
    if (!/bounty/i.test(body)) continue;
    const bot = /\[bot\]$/.test(c.login) || /^algora/i.test(c.login);
    const command = /^\s*\/bounty\b/m.test(body);
    if (bot || (command && MAINTAINER.has(c.author_association) && !PROPOSAL_RE.test(body))) {
      funded.push(body);
    } else {
      proposed.push(body);
    }
  }
  const escrowedAmount = parseAmount(funded);
  const rewardAmount = Math.max(parseReward(rewarded), parseAmount(rewarded));
  if (escrowedAmount > 0 && escrowedAmount >= rewardAmount)
    return { amount: escrowedAmount, funding: 'funded', escrowed: true, ignored };
  if (rewardAmount > 0)
    return { amount: rewardAmount, funding: 'funded', escrowed: false, ignored };
  const asked = parseAmount(proposed);
  return asked > 0
    ? { amount: asked, funding: 'proposed', escrowed: false, ignored }
    : { amount: 0, funding: 'none', escrowed: false, ignored };
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

/** Pages read per list endpoint: trovu#329 had 100+ timeline events and its open PR sat on page two. */
export const MAX_PAGES = 5;

/**
 * Every page of a `per_page=100` list endpoint, up to `maxPages`, through `get` (the authenticated
 * reader; injected so a test can count pages). Stops at the first short page.
 */
export async function ghAll<T>(
  get: (url: string) => Promise<T[]>,
  url: string,
  maxPages = MAX_PAGES,
): Promise<T[]> {
  const out: T[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const items = await get(`${url}${url.includes('?') ? '&' : '?'}page=${page}`);
    out.push(...items);
    if (items.length < 100) break;
  }
  return out;
}

/** What stands between a new claim and the money: `free`, `assigned`, or the open PRs. */
export function takenBy(b: Pick<Bounty, 'assigned' | 'prs'>): string {
  if (b.assigned) return 'assigned';
  if (b.prs > 0) return `${b.prs} PR${b.prs === 1 ? '' : 's'} open`;
  return 'free';
}

/** The Taken column: `takenBy` plus `not escrowed` when no board holds the money (an Opire reward). */
export function takenColumn(b: Pick<Bounty, 'assigned' | 'prs' | 'escrowed'>): string {
  return b.escrowed ? takenBy(b) : `${takenBy(b)}, not escrowed`;
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

export function issueExcluded(title: string, labels: string[], body = ''): string | undefined {
  if (EXCLUDED_ISSUE.test(title)) return 'reads as a security finding';
  if (labels.some((l) => /rewarded|paid|completed/i.test(l))) return 'already rewarded';
  const text = `${title}\n${body}`;
  if (CONTEST_ISSUE.test(text)) return 'contest or usage task, not a fix';
  return shapeExcluded(text);
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
  stats: { raw: number; kept: number; dropped: Record<string, number>; opire?: number },
  today: string,
): string {
  const rows = bounties
    .slice(0, BOARD_SIZE)
    .map(
      (b) =>
        `| $${b.amount} | ${b.rank} | [${b.repo}](https://github.com/${b.repo}) (${b.stars}★, ${b.language ?? '—'}, ${b.license ?? 'no licence'}) | [#${b.number}](${b.url}) ${b.title.replaceAll('|', '\\|').slice(0, 90)} | ${daysBetween(b.created_at.slice(0, 10), today)} d | ${takenColumn(b)} | ${b.attempts} |`,
    );
  const dropped = Object.entries(stats.dropped)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k} ${v}`)
    .join(', ');
  return `# Open-source bounty board — ${today}

Written daily by \`scripts/bounty-scanner.ts\` (\`.github/workflows/bounty-board.yml\`) from GitHub's search API:
open issues that received a \`/bounty $N\` command in the last ${LOOKBACK_DAYS} days or carry a bounty label, plus the issues
of repositories where OpireBot is installed (its footer on every issue) whose code owner posted a \`/reward N\`. Feature and
bug-fix work only: sandbox and security repositories and issues that read as security findings are dropped by
rule, and so are contests, showcases and usage tasks that pay for something other than a change to the repository,
results the claimant must record on a real device, claims the maintainer hands out first, fixes that need hardware, and
tasks the claimant must fund or that pay to a wallet off GitHub.
Only money a maintainer, the bounty bot or a label posted counts; a contributor's "bounty proposal" is dropped, and so
is a \`/reward\` from anyone but a code owner (Opire ignores it). Algora holds the money it lists; Opire does not — the
creator arranges payment after the merge, if the PR meets the issue — so an Opire row reads \`not escrowed\` under Taken.
Rank = amount × language fit ÷ (1 + age in months) ÷ (1 + open PRs + assigned). Taken says what stands between a new
claim and the money; the top ${FILE_TOP} free ones at $${MIN_AMOUNT} or more become \`oss-bounties\` queue items.

Read ${stats.raw} issues${stats.opire === undefined ? '' : ` (${stats.opire} listed on Opire)`}, kept ${stats.kept}; dropped: ${dropped || 'none'}.

| Amount | Rank | Repository | Issue | Age | Taken | Attempts |
| --- | --- | --- | --- | --- | --- | --- |
${rows.join('\n')}
`;
}

export function itemId(b: Bounty): string {
  return `bounty-${b.repo.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${b.number}`;
}

/**
 * Files the top free bounties (no assignee, no open PR, at least MIN_AMOUNT) as queue items,
 * idempotent on id; blocked until CI can push a fork. A `finished` queue (review 2026-W42 killed
 * oss-bounties) is returned untouched with `finished: true`: the board is still written as the
 * exchange's re-open reading, but no row may reopen work in it (foundry `bounty-scanner-finished-queue`).
 */
export function fileBounties(
  queue: Queue,
  bounties: Bounty[],
  today: string,
  canPush: boolean,
): { queue: Queue; added: string[]; finished?: boolean } {
  if (queue.status === 'finished') return { queue, added: [], finished: true };
  const items = queue.items.map((it) => ({ ...it }));
  const added: string[] = [];
  for (const b of bounties
    .filter((x) => takenBy(x) === 'free' && x.amount >= MIN_AMOUNT)
    .slice(0, FILE_TOP)) {
    const id = itemId(b);
    if (items.some((it) => it.id === id)) continue;
    const item: QueueItem = {
      id,
      title: `Bounty $${b.amount}${b.escrowed ? '' : ' (Opire, not escrowed)'} on ${b.repo}#${b.number}: ${b.title.slice(0, 100)} — fork, fix with tests in the project's conventions, open the PR with \`/claim #${b.number}\` and a plain note on how it was built`,
      why: `Filed by the bounty scanner (${today}, docs/bounties/BOARD.md): $${b.amount} posted on ${b.url} by ${b.escrowed ? 'a maintainer, the bounty bot or a label' : "a code owner's Opire reward — not escrowed: the creator arranges payment after the merge only if the PR meets the issue, so read the thread for how earlier rewards were paid before building"}; free when filed (no assignee, no open PR); ${b.repo} has ${b.stars} stars, ${b.language ?? 'no main language'}, ${b.license ?? 'no licence file'}, ${b.attempts} attempt comment(s). Read CONTRIBUTING first; a project that forbids AI-assisted work is skipped and the item dropped.`,
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
  for (const [q, pages] of [
    [`is:issue is:open "/bounty $" in:comments created:>=${since}`, 3],
    ['is:issue is:open label:"💎 Bounty" -label:"💰 Rewarded"', 3],
    // Repositories with OpireBot installed: its footer is on every issue, funded or not; the
    // `/reward N` that funds one is read from the body here and from the comments below.
    [`${OPIRE_QUERY} created:>=${since}`, 1],
  ] as const) {
    for (const it of await search(tok, q, pages)) raw.set(it.html_url, it);
  }
  // Opire's own list: rewards created from its app leave no trace on GitHub, so each listed issue
  // is read by its API URL and joins the pool as funded (not escrowed) at the listed amount.
  const opireApp = new Map<string, OpireReward>();
  for (const r of parseOpireRewards(
    await fetch(OPIRE_APP, {
      headers: { 'User-Agent': 'foundry-bounty-scanner' },
      signal: AbortSignal.timeout(30_000),
    })
      .then((res) => (res.ok ? res.text() : ''))
      .catch(() => ''),
  )) {
    opireApp.set(r.url, r);
    if (raw.has(r.url)) continue;
    const api = r.url.replace('https://github.com/', 'https://api.github.com/repos/');
    const it = await gh<SearchItem & { state?: string; repository_url?: string }>(tok, api).catch(
      () => undefined,
    );
    if (!it || it.state !== 'open') continue;
    raw.set(r.url, { ...it, repository_url: api.replace(/\/issues\/\d+$/, '') });
  }
  const dropped: Record<string, number> = {};
  const drop = (why: string): void => {
    dropped[why] = (dropped[why] ?? 0) + 1;
  };
  const repos = new Map<string, Repo | undefined>();
  const authors = new Map<string, string>();
  /** Issues carrying OpireBot's footer, with their comment counts: a `/reward` may sit in the comments. */
  const opire = new Map<string, number>();
  const ignored = new Map<string, number>();
  const kept: Bounty[] = [];
  for (const it of raw.values()) {
    const full = it.repository_url.replace('https://api.github.com/repos/', '');
    const labels = it.labels.map((l) => l.name);
    const stripped = stripOpireFooter(it.body ?? '');
    if (stripped.opire) opire.set(it.html_url, it.comments);
    const why = issueExcluded(it.title, labels, stripped.text);
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
    let first = fundingOf(
      {
        title: it.title,
        body: stripped.text,
        labels,
        author_association: it.author_association ?? 'NONE',
      },
      [],
    );
    authors.set(it.html_url, it.author_association ?? 'NONE');
    ignored.set(it.html_url, first.ignored);
    const listed = opireApp.get(it.html_url);
    if (listed && listed.amount > first.amount) {
      first = { ...first, amount: listed.amount, funding: 'funded', escrowed: false };
    }
    kept.push({
      repo: full,
      number: it.number,
      url: it.html_url,
      title: it.title,
      created_at: it.created_at,
      labels,
      body: stripped.text,
      amount: first.amount,
      attempts: 0,
      funding: first.funding,
      escrowed: first.escrowed,
      assigned: (it.assignees?.length ?? 0) > 0,
      prs: 0,
      stars: repo.stargazers_count,
      language: repo.language,
      license: repo.license,
      rank: 0,
    });
  }
  // Comments carry the bot's `$N bounty` line, who posted it and the attempts; the timeline carries
  // the linked PRs. Both are read for the shortlist only (two calls per issue, more for a busy one), plus the newest
  // OPIRE_READ commented issues of OpireBot repositories, whose `/reward` leaves no label to sort by.
  kept.sort((a, b) => b.amount - a.amount || a.created_at.localeCompare(b.created_at));
  const toRead = new Set(kept.slice(0, SHORTLIST));
  for (const b of kept
    .filter((x) => !toRead.has(x) && (opire.get(x.url) ?? 0) > 0)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, OPIRE_READ)) {
    toRead.add(b);
  }
  for (const b of toRead) {
    const comments = await ghAll<{
      body: string | null;
      user?: { login?: string };
      author_association?: string;
    }>(
      (u) => gh(tok, u),
      `https://api.github.com/repos/${b.repo}/issues/${b.number}/comments?per_page=100`,
    ).catch(() => []);
    const read: Comment[] = comments.map((c) => ({
      body: c.body ?? '',
      login: c.user?.login ?? '',
      author_association: c.author_association ?? 'NONE',
    }));
    let f = fundingOf(
      {
        title: b.title,
        body: b.body,
        labels: b.labels,
        author_association: authors.get(b.url) ?? 'NONE',
      },
      read,
    );
    const listed = opireApp.get(b.url);
    if (listed && listed.amount > f.amount) {
      f = { ...f, amount: listed.amount, funding: 'funded', escrowed: false };
    }
    b.amount = f.amount;
    b.funding = f.funding;
    b.escrowed = f.escrowed;
    ignored.set(b.url, f.ignored);
    b.attempts = Math.max(
      read.filter((c) => /^\s*\/(attempt|claim|try)\b/m.test(c.body)).length,
      listed?.trying ?? 0,
    );
    b.prs = openPrs(
      await ghAll<TimelineEvent>(
        (u) => gh(tok, u),
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
  const rewardIgnored = kept.filter(
    (b) => b.funding !== 'funded' && (ignored.get(b.url) ?? 0) > 0,
  ).length;
  if (rewardIgnored) dropped['reward not from a code owner'] = rewardIgnored;
  const proposedOnly = kept.filter(
    (b) => b.funding === 'proposed' && !(ignored.get(b.url) ?? 0),
  ).length;
  if (proposedOnly) dropped['proposed, not funded'] = proposedOnly;
  const noAmount = kept.length - board.length - proposedOnly - rewardIgnored;
  if (noAmount) dropped['no amount found'] = noAmount;
  board.sort((a, b) => b.rank - a.rank || b.amount - a.amount);
  mkdirSync(path.dirname(BOARD_FILE), { recursive: true });
  writeFileSync(
    BOARD_FILE,
    renderBoard(board, { raw: raw.size, kept: board.length, dropped, opire: opireApp.size }, today),
  );
  const queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf8')) as Queue;
  const out = fileBounties(queue, board, today, Boolean(process.env.PR_TOKEN_PRESENT));
  if (out.queue !== queue) writeFileSync(QUEUE_FILE, serialize(out.queue));
  console.log(
    `bounties ${today}: read ${raw.size} (${opireApp.size} listed on Opire), kept ${board.length}, ${out.finished ? 'queue finished — not filing' : `filed [${out.added.join(', ')}]`}; dropped ${JSON.stringify(dropped)}`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e: unknown) => {
    console.error(e instanceof Error ? e.message : String(e));
    process.exitCode = 1;
  });
}
