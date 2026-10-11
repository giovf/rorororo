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

/** amount × language fit ÷ (1 + age in months): a fresh $400 TypeScript issue outranks an old $700 one. */
export function rankOf(
  amount: number,
  language: string | null,
  created: string,
  today: string,
): number {
  const fit = language && PREFERRED_LANGUAGES.has(language) ? 1 : 0.4;
  const age = Math.max(0, daysBetween(created.slice(0, 10), today));
  return Math.round((amount * fit) / (1 + age / 30));
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
        `| $${b.amount} | ${b.rank} | [${b.repo}](https://github.com/${b.repo}) (${b.stars}★, ${b.language ?? '—'}, ${b.license ?? 'no licence'}) | [#${b.number}](${b.url}) ${b.title.replaceAll('|', '\\|').slice(0, 90)} | ${daysBetween(b.created_at.slice(0, 10), today)} d | ${b.attempts} |`,
    );
  const dropped = Object.entries(stats.dropped)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k} ${v}`)
    .join(', ');
  return `# Open-source bounty board — ${today}

Written daily by \`scripts/bounty-scanner.ts\` (\`.github/workflows/bounty-board.yml\`) from GitHub's search API:
open issues that received a \`/bounty $N\` command in the last ${LOOKBACK_DAYS} days or carry a bounty label. Feature and
bug-fix work only: sandbox and security repositories and issues that read as security findings are dropped by
rule. Rank = amount × language fit ÷ (1 + age in months). The top ${FILE_TOP} become \`oss-bounties\` queue items.

Read ${stats.raw} issues, kept ${stats.kept}; dropped: ${dropped || 'none'}.

| Amount | Rank | Repository | Issue | Age | Attempts |
| --- | --- | --- | --- | --- | --- |
${rows.join('\n')}
`;
}

export function itemId(b: Bounty): string {
  return `bounty-${b.repo.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${b.number}`;
}

/** Files the top bounties as queue items, idempotent on id; blocked until CI can push a fork. */
export function fileBounties(
  queue: Queue,
  bounties: Bounty[],
  today: string,
  canPush: boolean,
): { queue: Queue; added: string[] } {
  const items = queue.items.map((it) => ({ ...it }));
  const added: string[] = [];
  for (const b of bounties.slice(0, FILE_TOP)) {
    const id = itemId(b);
    if (items.some((it) => it.id === id)) continue;
    const item: QueueItem = {
      id,
      title: `Bounty $${b.amount} on ${b.repo}#${b.number}: ${b.title.slice(0, 100)} — fork, fix with tests in the project's conventions, open the PR with \`/claim #${b.number}\` and a plain note on how it was built`,
      why: `Filed by the bounty scanner (${today}, docs/bounties/BOARD.md): $${b.amount} posted on ${b.url}; ${b.repo} has ${b.stars} stars, ${b.language ?? 'no main language'}, ${b.license ?? 'no licence file'}, ${b.attempts} attempt comment(s). Read CONTRIBUTING first; a project that forbids AI-assisted work is skipped and the item dropped.`,
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
    const amount = parseAmount([...labels, it.title, it.body ?? '']);
    kept.push({
      repo: full,
      number: it.number,
      url: it.html_url,
      title: it.title,
      created_at: it.created_at,
      labels,
      body: it.body ?? '',
      amount,
      attempts: 0,
      stars: repo.stargazers_count,
      language: repo.language,
      license: repo.license,
      rank: 0,
    });
  }
  // Comments carry the bot's `$N bounty` line and the attempts; read them for the shortlist only.
  kept.sort((a, b) => b.amount - a.amount || a.created_at.localeCompare(b.created_at));
  for (const b of kept.slice(0, SHORTLIST)) {
    const comments = await gh<{ body: string }[]>(
      tok,
      `https://api.github.com/repos/${b.repo}/issues/${b.number}/comments?per_page=100`,
    ).catch(() => []);
    const texts = comments.map((c) => c.body ?? '');
    b.amount = Math.max(b.amount, parseAmount(texts.filter((t) => /bounty/i.test(t))));
    b.attempts = texts.filter((t) => /^\s*\/(attempt|claim)\b/m.test(t)).length;
  }
  const board = kept
    .filter((b) => b.amount > 0)
    .map((b) => ({ ...b, rank: rankOf(b.amount, b.language, b.created_at, today) }));
  const noAmount = kept.length - board.length;
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
