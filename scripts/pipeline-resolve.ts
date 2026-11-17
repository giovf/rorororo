// `npm run pipeline resolve [<venture> …]` (2026-11-17, foundry `queue-merge-by-item-id`): rewrites a
// queue file that `git pull --no-rebase` left conflicted, from the three versions git keeps in the
// index, by item id — no hand edit. Plain Node like `claim` (runs before `npm ci`).
//
// Why: the claim markers keep two sessions off the same item, but not off the same file. On
// 2026-11-17 the 17:10 build finished gankdat `x402-journal-buyer-day-7-read` (done, one item
// appended) and the 17:00 burn-down finished `uk-esg-disclosures` (done, three appended) inside one
// window; both edits touch the end of `items`, git conflicted, and the merge was done with a
// throwaway script. `.gitattributes` keeps queue files out of `merge=union` because they are edited
// in place — a union would keep both versions of a changed item.
//
// The rule, per item id against the common ancestor:
//   - only one side has it, or only one side changed it → that side's version;
//   - both changed it → the side further along (`done`/`dropped` over `blocked` over `doing` over
//     `todo`), then the later `done_at`/`updated`/`doing_since`, then theirs (already on main);
//     printed, so the run log can name it.
// Order: theirs' order (what main has), then the items only ours has, in our order.
// Queue-level fields: one side changed → that side; both changed → the later value for the dated
// fields, theirs otherwise; a `researching_*` marker either side removed stays removed.
// (Node 22 runs .ts directly — keep syntax erasable)
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

type Json = Record<string, unknown>;
interface RawQueue extends Json {
  venture: string;
  items: (Json & { id: string })[];
}

const RANK: Record<string, number> = { todo: 0, doing: 1, blocked: 2, dropped: 3, done: 3 };
/** Queue-level fields where the later of two changed values is the truth. */
const LATER_WINS = ['updated', 'researched', 'research_after'];
/** A research claim's marker: removed by the research commit, so a removal always wins. */
const MARKERS = ['researching_since', 'researching_by'];

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);
const text = (v: unknown): string => (typeof v === 'string' ? v : '');
const stamp = (item: Json): string =>
  [item.done_at, item.updated, item.doing_since]
    .filter((v): v is string => typeof v === 'string')
    .sort()
    .pop() ?? '';

/** Which side's version of an item both sides changed: `ours` or `theirs`. */
export function pickItem(ours: Json, theirs: Json): 'ours' | 'theirs' {
  const rank = (item: Json): number => RANK[String(item.status)] ?? 0;
  if (rank(ours) !== rank(theirs)) return rank(ours) > rank(theirs) ? 'ours' : 'theirs';
  return stamp(ours) > stamp(theirs) ? 'ours' : 'theirs';
}

export interface MergeResult {
  queue: RawQueue;
  /** One line per item both sides changed, and per queue field both sides changed. */
  notes: string[];
}

/** Three-way merge of a queue file by item id; `base` is null when the file is new on both sides. */
export function mergeQueues(base: RawQueue | null, ours: RawQueue, theirs: RawQueue): MergeResult {
  if (ours.venture !== theirs.venture) {
    throw new Error(
      `resolve: the two sides are different queues (${ours.venture}, ${theirs.venture})`,
    );
  }
  const notes: string[] = [];
  const baseItems = new Map((base?.items ?? []).map((item) => [item.id, item]));
  const ourItems = new Map(ours.items.map((item) => [item.id, item]));
  const items: RawQueue['items'] = [];
  for (const theirItem of theirs.items) {
    const ourItem = ourItems.get(theirItem.id);
    const baseItem = baseItems.get(theirItem.id);
    if (!ourItem || same(ourItem, theirItem) || same(ourItem, baseItem)) {
      items.push(theirItem);
    } else if (same(theirItem, baseItem)) {
      items.push(ourItem);
    } else {
      const side = pickItem(ourItem, theirItem);
      notes.push(
        `${theirItem.id}: both sides changed it (ours ${String(ourItem.status)}, theirs ${String(theirItem.status)}) — kept ${side}`,
      );
      items.push(side === 'ours' ? ourItem : theirItem);
    }
  }
  const theirIds = new Set(theirs.items.map((item) => item.id));
  for (const ourItem of ours.items) if (!theirIds.has(ourItem.id)) items.push(ourItem);

  const queue: Json = {};
  const keys = [...new Set([...Object.keys(theirs), ...Object.keys(ours)])].filter(
    (key) => key !== 'items',
  );
  for (const key of keys) {
    const b = base?.[key];
    const o = ours[key];
    const t = theirs[key];
    let value: unknown;
    if (same(o, t) || same(o, b)) value = t;
    else if (same(t, b)) value = o;
    else if (MARKERS.includes(key)) value = o === undefined || t === undefined ? undefined : t;
    else if (LATER_WINS.includes(key)) value = text(o) > text(t) ? o : t;
    else {
      value = t;
      notes.push(`${key}: both sides changed it — kept theirs (${JSON.stringify(t)})`);
    }
    if (value !== undefined) queue[key] = value;
  }
  queue.items = items;
  return { queue: queue as RawQueue, notes };
}

function git(root: string, args: string[]): string {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

/** A file's version in one index stage (1 base, 2 ours, 3 theirs); null when the stage has none. */
function stage(root: string, n: 1 | 2 | 3, file: string): RawQueue | null {
  try {
    return JSON.parse(git(root, ['show', `:${n}:${file}`])) as RawQueue;
  } catch {
    return null;
  }
}

/** Resolves the named ventures' queue files, or every conflicted queue file when none is named. */
export function main(argv: string[]): number {
  const root = path.resolve(import.meta.dirname, '..');
  const dir = 'docs/pipeline/queues';
  const conflicted = git(root, ['diff', '--name-only', '--diff-filter=U'])
    .split('\n')
    .filter((file) => file.startsWith(`${dir}/`) && file.endsWith('.json'));
  const named = argv.filter((a) => !a.startsWith('--')).map((venture) => `${dir}/${venture}.json`);
  const files = named.length > 0 ? named : conflicted;
  if (files.length === 0) {
    console.log('resolve: no conflicted queue file');
    return 0;
  }
  for (const file of files) {
    if (!conflicted.includes(file)) {
      console.error(`resolve: ${file} is not in conflict`);
      return 2;
    }
    const ours = stage(root, 2, file);
    const theirs = stage(root, 3, file);
    if (!ours || !theirs) {
      console.error(`resolve: ${file} was deleted on one side — resolve it by hand`);
      return 2;
    }
    const { queue, notes } = mergeQueues(stage(root, 1, file), ours, theirs);
    writeFileSync(path.join(root, file), `${JSON.stringify(queue, null, 2)}\n`);
    git(root, ['add', file]);
    console.log(`resolved ${file}: ${queue.items.length} items`);
    for (const note of notes) console.log(`  ${note}`);
  }
  console.log('resolve: run `npm run pipeline`, then commit the merge');
  return 0;
}
