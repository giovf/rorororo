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
// The edit is JSON.parse → JSON.stringify(…, null, 2): the queue files are kept in exactly that
// shape (Prettier agrees), so the pre-push hook's format check passes. Only node builtins.
// Node 22 runs .ts directly — keep syntax erasable.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_BY = 'build';
const DAY_MS = 86_400_000;

interface ClaimItem {
  id: string;
  status: string;
  added: string;
  doing_since?: string;
  not_before?: string;
}
interface ClaimQueue {
  venture: string;
  items: ClaimItem[];
}

/** `<venture>/<id>` → its parts; throws on anything else. */
export function parseTarget(target: string | undefined): { venture: string; id: string } {
  const m = /^([a-z0-9-]+)\/([a-z0-9-]+)$/.exec(target ?? '');
  if (!m) throw new Error('usage: npm run pipeline claim <venture>/<id> [--by=<routine>]');
  return { venture: m[1] as string, id: m[2] as string };
}

/**
 * The queue text with the item set `doing` as of `today`. Refuses an item that is not `todo`,
 * dated after today, or `doing` since less than a day (another session's live claim) — the
 * caller must take `next` again. A `doing` item older than a day is a leftover and claimable.
 */
export function claimItem(
  queueText: string,
  id: string,
  today: string,
): { text: string; item: ClaimItem } {
  const queue = JSON.parse(queueText) as ClaimQueue;
  const item = queue.items.find((it) => it.id === id);
  if (!item) throw new Error(`claim: no item "${id}" in queue ${queue.venture}`);
  if (item.not_before !== undefined && item.not_before > today) {
    throw new Error(
      `claim: ${queue.venture}/${id} is dated ${item.not_before}, not buildable today`,
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

/** The routine a claim commit subject names, else undefined — the watchdog excludes these from traces. */
export function claimMarkerRoutine(subject: string): string | undefined {
  const m = /^pipeline: claim [a-z0-9-]+\/[a-z0-9-]+ \(([a-z-]+)\)$/.exec(subject);
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
  const today = new Date().toISOString().slice(0, 10);
  // Claim what main has now, not a stale clone: the other session's claim may already be there.
  git(root, 'pull -q --no-rebase --no-edit origin main');
  const { text } = claimItem(readFileSync(path.join(root, file), 'utf8'), id, today);
  writeFileSync(path.join(root, file), text);
  git(root, `add ${JSON.stringify(file)}`);
  git(root, `commit -q -m ${JSON.stringify(claimSubject(venture, id, by))}`);
  pushWithRetry(root);
  console.log(`claimed ${venture}/${id} as doing since ${today} (${by})`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2));
}
