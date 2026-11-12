// `npm run pipeline claim <venture>/<id> [--by=<routine>]` — the one-line push that marks a queue
// item `doing` (with `doing_since`) BEFORE a session builds it, so a concurrent session's
// `npm run pipeline next` skips it.
//
// Why (foundry `build-claim-marker`, 2026-10-07): the 17:00 evening burn-down and the 17:10 daily
// build both took `next` = foundry `search-console-api-reading` and built it in parallel; the
// burn-down pushed first and the build's 420-line duplicate was discarded at push time — about
// 40 minutes of a Fable session for nothing. The `doing` status (2026-10-05) was meant to be that
// guard, but atomic pushes keep the `doing` edit local until the item's own commit, so no other
// session could see it. The slot marker (`npm run slot -- start build`, pushed before any work)
// is the precedent: a claim is the same one-line push, for the item. A claim older than a day is
// a cut-off session's leftover that `next` already offers again (core `nextItem`), so a dead
// session blocks nothing for long. Like the start marker, a claim commit is never a routine's
// trace for the watchdog (`claimMarkerRoutine`): a session that claimed and died still reads as
// stalled, not as done.
//
// `--by=<routine>` (foundry `claim-by-npm-flag`, 2026-10-08): npm consumes a `--flag=value` written
// after `npm run pipeline claim …` as its own config and hands the script only the env var
// `npm_config_by`, so the first burn-down claim was committed as `(build)`; `routineFrom` reads
// argv first (the `-- --by=…` form) and that env var second.
//
// `claim-research <venture>` (foundry `research-claim-marker`, 2026-11-03): the same one-line push
// for a research pass — `researching_since` (the minute, YYYY-MM-DDTHH:MMZ) and `researching_by` on
// the queue — because research had no marker: on 2026-10-22 and again on 2026-11-03 the 17:00 build
// slot and the 17:00 burn-down both researched the starved tax-workbook queue and pushed within the
// same minute (the build's duplicate pass was discarded in a conflict merge). A claim under
// RESEARCH_CLAIM_HOURS old makes the queue cooling for the other slot's `next`, `empty`, `cold` and
// `starved()`; the research commit removes both fields when it sets `researched`. The claim is
// refused while another session's claim is live, and while the queue is cooling anyway (researched
// within 48 h or waiting on `research_after`) — research then is not due.
// `research-landed <venture> --since=<ISO>` is the fetch-and-abort step a research commit runs
// first: two claims can land in the same minute (each pull saw a clean queue), so before the pass is
// committed the script fetches `origin/main` and reports any `<venture>: research …` commit since
// the slot; the routine then merges theirs and writes one run-log line instead of pushing a duplicate.
//
// The edit is JSON.parse → JSON.stringify(…, null, 2): the queue files are kept in exactly that
// shape (Prettier agrees), so the pre-push hook's format check passes. Only node builtins.
// Node 22 runs .ts directly — keep syntax erasable.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_BY = 'build';
const DAY_MS = 86_400_000;
/** Same as @foundry/core's RESEARCH_CLAIM_HOURS (no dist import here). */
export const RESEARCH_CLAIM_HOURS = 2;
/** Same as @foundry/core's DATED_READY_HOUR_UTC (no dist import here). */
const DATED_READY_HOUR_UTC = 7;

interface ClaimItem {
  id: string;
  status: string;
  added: string;
  doing_since?: string;
  not_before?: string;
}
interface ClaimQueue {
  venture: string;
  status: string;
  researched?: string;
  research_after?: string;
  researching_since?: string;
  researching_by?: string;
  items: ClaimItem[];
}

/** `<venture>` (a slug) for `claim-research` / `research-landed`; throws on anything else. */
export function parseVenture(target: string | undefined, command: string): string {
  if (!/^[a-z0-9-]+$/.test(target ?? '')) {
    throw new Error(`usage: npm run pipeline ${command} <venture> [--by=<routine>]`);
  }
  return target as string;
}

/** `now` as the minute the claim is stamped with: YYYY-MM-DDTHH:MMZ. */
export function claimMinute(now: Date): string {
  return `${now.toISOString().slice(0, 16)}Z`;
}

/**
 * The queue text with the research claim set at `now` by `by`. Refuses a finished queue, a queue
 * cooling anyway (researched within 48 h, or `research_after` ahead — research is not due) and
 * another session's claim under RESEARCH_CLAIM_HOURS old; an older claim is a cut-off session's
 * leftover and is taken over.
 */
export function claimResearch(
  queueText: string,
  by: string,
  now: Date,
): { text: string; since: string } {
  const queue = JSON.parse(queueText) as ClaimQueue;
  const today = now.toISOString().slice(0, 10);
  if (queue.status !== 'open')
    throw new Error(`claim-research: ${queue.venture} is ${queue.status}`);
  // 48 h from the pass's minute, a plain day from 00:00 (2026-11-12, research-cooling-from-the-minute).
  if (queue.researched !== undefined && now.getTime() - Date.parse(queue.researched) < 2 * DAY_MS) {
    throw new Error(
      `claim-research: ${queue.venture} was researched ${queue.researched} — cooling, research is not due`,
    );
  }
  if (queue.research_after !== undefined && queue.research_after > today) {
    throw new Error(
      `claim-research: ${queue.venture} waits until ${queue.research_after} — research is not due`,
    );
  }
  if (queue.researching_since !== undefined) {
    const age = now.getTime() - Date.parse(queue.researching_since);
    if (age < RESEARCH_CLAIM_HOURS * 3_600_000) {
      throw new Error(
        `claim-research: ${queue.venture} is being researched since ${queue.researching_since} by ${queue.researching_by ?? '?'} — another session has it; skip this venture`,
      );
    }
  }
  const since = claimMinute(now);
  // Keep the two fields after the research fields and before `weight`/`items`, the shape a research commit leaves.
  const { items, weight, ...head } = queue as ClaimQueue & { weight?: number };
  const out: Record<string, unknown> = { ...head, researching_since: since, researching_by: by };
  if (weight !== undefined) out.weight = weight;
  out.items = items;
  return { text: `${JSON.stringify(out, null, 2)}\n`, since };
}

/** Commit subject of a research claim: `pipeline: claim-research <venture> (<routine>)`. */
export function claimResearchSubject(venture: string, by: string): string {
  return `pipeline: claim-research ${venture} (${by})`;
}

/**
 * The first subject among `subjects` (one per line, newest first) that is a research commit for
 * `venture` — `<venture>: research …`, `<venture>: research pass …` or `<venture>: exchange
 * pre-research …`, any case — else undefined. Claim commits and the venture's build commits are not.
 */
export function researchLanded(subjects: string, venture: string): string | undefined {
  const re = new RegExp(`^${venture}: (?:exchange )?(?:pre-)?research\\b`, 'i');
  return subjects
    .split('\n')
    .map((l) => l.trim())
    .find((l) => re.test(l));
}

/** `<venture>/<id>` → its parts; throws on anything else. */
export function parseTarget(target: string | undefined): { venture: string; id: string } {
  const m = /^([a-z0-9-]+)\/([a-z0-9-]+)$/.exec(target ?? '');
  if (!m) throw new Error('usage: npm run pipeline claim <venture>/<id> [--by=<routine>]');
  return { venture: m[1] as string, id: m[2] as string };
}

/**
 * The queue text with the item set `doing` as of `today`. Refuses an item that is not `todo`,
 * dated after today (or today before `utcHour` 07), or `doing` since less than a day (another session's live claim) — the
 * caller must take `next` again. A `doing` item older than a day is a leftover and claimable.
 */
export function claimItem(
  queueText: string,
  id: string,
  today: string,
  utcHour = 12,
): { text: string; item: ClaimItem } {
  const queue = JSON.parse(queueText) as ClaimQueue;
  const item = queue.items.find((it) => it.id === id);
  if (!item) throw new Error(`claim: no item "${id}" in queue ${queue.venture}`);
  if (item.not_before !== undefined && item.not_before > today) {
    throw new Error(
      `claim: ${queue.venture}/${id} is dated ${item.not_before}, not buildable today`,
    );
  }
  // An item dated today waits for the morning metrics rows (core DATED_READY_HOUR_UTC).
  if (item.not_before === today && utcHour < DATED_READY_HOUR_UTC) {
    throw new Error(
      `claim: ${queue.venture}/${id} is dated ${item.not_before}, buildable from 07:00 UTC`,
    );
  }
  if (item.status === 'doing') {
    const since = item.doing_since ?? item.added;
    if (Date.parse(today) - Date.parse(since) <= DAY_MS) {
      throw new Error(
        `claim: ${queue.venture}/${id} is already doing since ${since} — another session has it; take next again`,
      );
    }
  } else if (item.status !== 'todo') {
    throw new Error(`claim: ${queue.venture}/${id} is ${item.status}, not todo`);
  }
  item.status = 'doing';
  item.doing_since = today;
  return { text: `${JSON.stringify(queue, null, 2)}\n`, item };
}

/**
 * The routine a claim is made by: `--by=<routine>` in argv (the `npm run pipeline claim … -- --by=x`
 * form), else npm's `npm_config_by` (what `npm run … --by=x` without the `--` leaves), else build.
 */
export function routineFrom(
  argv: readonly string[],
  env: Readonly<Record<string, string | undefined>>,
): string {
  const by =
    argv.find((a) => a.startsWith('--by='))?.slice('--by='.length) ??
    env['npm_config_by'] ??
    DEFAULT_BY;
  if (!/^[a-z-]+$/.test(by)) throw new Error(`claim: --by must be a routine name, got "${by}"`);
  return by;
}

/** Commit subject of a claim: `pipeline: claim <venture>/<id> (<routine>)`. */
export function claimSubject(venture: string, id: string, by: string): string {
  return `pipeline: claim ${venture}/${id} (${by})`;
}

/**
 * The routine a claim commit subject names (an item claim or, since 2026-11-03, a research claim),
 * else undefined — the watchdog and the slot table exclude these from traces.
 */
export function claimMarkerRoutine(subject: string): string | undefined {
  const m = /^pipeline: claim(?: [a-z0-9-]+\/[a-z0-9-]+|-research [a-z0-9-]+) \(([a-z-]+)\)$/.exec(
    subject,
  );
  return m?.[1];
}

function git(root: string, args: string): string {
  return execSync(`git ${args}`, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  });
}

function pushWithRetry(root: string): void {
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      git(root, 'push origin HEAD:main');
      return;
    } catch {
      if (attempt === 4) throw new Error('claim: push to main failed four times');
      console.log(`claim: push rejected (attempt ${attempt}), pulling and retrying`);
      git(root, 'pull --no-rebase --no-edit origin main');
    }
  }
}

export function main(argv: string[]): void {
  const target = argv.find((a) => !a.startsWith('--'));
  const by = routineFrom(argv, process.env);
  const { venture, id } = parseTarget(target);
  const root = path.resolve(import.meta.dirname, '..');
  const file = path.join('docs', 'pipeline', 'queues', `${venture}.json`);
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  // Claim what main has now, not a stale clone: the other session's claim may already be there.
  git(root, 'pull -q --no-rebase --no-edit origin main');
  const { text } = claimItem(
    readFileSync(path.join(root, file), 'utf8'),
    id,
    today,
    now.getUTCHours(),
  );
  writeFileSync(path.join(root, file), text);
  git(root, `add ${JSON.stringify(file)}`);
  git(root, `commit -q -m ${JSON.stringify(claimSubject(venture, id, by))}`);
  pushWithRetry(root);
  console.log(`claimed ${venture}/${id} as doing since ${today} (${by})`);
}

/** `claim-research <venture> [--by=<routine>]`: pull, stamp the research claim, commit, push. */
export function mainClaimResearch(argv: string[]): void {
  const by = routineFrom(argv, process.env);
  const venture = parseVenture(
    argv.find((a) => !a.startsWith('--')),
    'claim-research',
  );
  const root = path.resolve(import.meta.dirname, '..');
  const file = path.join('docs', 'pipeline', 'queues', `${venture}.json`);
  const now = new Date();
  git(root, 'pull -q --no-rebase --no-edit origin main');
  const { text, since } = claimResearch(readFileSync(path.join(root, file), 'utf8'), by, now);
  writeFileSync(path.join(root, file), text);
  git(root, `add ${JSON.stringify(file)}`);
  git(root, `commit -q -m ${JSON.stringify(claimResearchSubject(venture, by))}`);
  pushWithRetry(root);
  console.log(`claimed ${venture} for research since ${since} (${by})`);
}

/**
 * `research-landed <venture> --since=<ISO datetime>`: fetches `origin/main` and prints
 * `landed: <subject>` (exit 1) when a research commit for the venture is on it since `--since`
 * (the slot's start), else `clear: …` (exit 0). Run by a research pass before its commit.
 */
export function mainResearchLanded(argv: string[]): number {
  const venture = parseVenture(
    argv.find((a) => !a.startsWith('--')),
    'research-landed',
  );
  const since =
    argv.find((a) => a.startsWith('--since='))?.slice('--since='.length) ??
    process.env['npm_config_since'];
  if (since === undefined || Number.isNaN(Date.parse(since))) {
    throw new Error('usage: npm run pipeline research-landed <venture> -- --since=<ISO datetime>');
  }
  const root = path.resolve(import.meta.dirname, '..');
  git(root, 'fetch -q origin main');
  const subjects = git(root, `log origin/main --since=${JSON.stringify(since)} --format=%s`);
  const hit = researchLanded(subjects, venture);
  if (hit !== undefined) {
    console.log(`landed: ${hit}`);
    return 1;
  }
  console.log(`clear: no research commit for ${venture} on origin/main since ${since}`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2));
}
