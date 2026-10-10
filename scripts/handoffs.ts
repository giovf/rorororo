// Handoff ledger: every open `handoff:` / `owner:` entry in docs/ALERTS.md, oldest first, with its age.
//
// Why: on 2026-09-30 ALERTS.md carried eight open handoffs, four of them already satisfied by later
// work whose `done:` lines sat further down the file — every reader (weekly report, retro, exchange,
// the interactive session) re-derived which were live. Convention from today (docs/OPERATIONS.md
// §Owner notifications): closing an entry APPENDS ` — Done YYYY-MM-DD (<routine>): <how>` (or
// ` — Superseded …`) to the original entry instead of writing a new line or deleting it; the
// `notify owner` job already treats such a suffix as closed. This script lists what is still open
// and performs that append so no routine edits the file by hand.
//
// Run: npm run handoffs                                → open entries: `<age>d | <kind> | <date> | <text>`,
//                                                        then rebuilds docs/for-owner/OPEN.md (the owner's list, by payoff),
//                                                        prints the median open age of the owner asks and — when one is older
//                                                        than 7 days — one `notify:` digest line for the weekly report
//      npm run handoffs -- list [--stale 7] [--all] [--json] [--no-write]
//      npm run handoffs -- close "<substring of the entry's first line>" --by <routine> --how "<how>"
//                               [--superseded] [--on YYYY-MM-DD]
// Node 22 runs .ts directly — keep syntax erasable, import only node builtins.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ALERTS_FILE = path.join('docs', 'ALERTS.md');
export const OPEN_FILE = path.join('docs', 'for-owner', 'OPEN.md');
export const ACTIONS_DIR = path.join('docs', 'for-owner', 'actions');
export const QUEUES_DIR = path.join('docs', 'pipeline', 'queues');
export const DEFAULT_STALE_DAYS = 7;
export const OPEN_KINDS = /^(handoff|owner)\b/;
export const CLOSED_SUFFIX = /—\s*(Done|Superseded)\b(?:\s+(\d{4}-\d{2}-\d{2}))?/;

export interface Entry {
  /** 0-based line index of the entry's first line in the file. */
  start: number;
  /** 0-based line index of the entry's last line (inclusive). */
  end: number;
  date: string;
  /** The word(s) between the date and the colon: `handoff`, `owner`, `done (burn-down)`, … */
  kind: string;
  /** The whole entry, continuation lines joined with one space. */
  text: string;
  closed?: { state: 'Done' | 'Superseded'; on?: string };
}

const ENTRY_START = /^- (\d{4}-\d{2}-\d{2}) ([^:]{1,60}): ?(.*)$/;

/** Every `- YYYY-MM-DD <kind>: …` entry with its indented continuation lines. */
export function parseEntries(md: string): Entry[] {
  const lines = md.split('\n');
  const entries: Entry[] = [];
  let current: Entry | undefined;
  const finish = (): void => {
    if (!current) return;
    const m = CLOSED_SUFFIX.exec(current.text);
    if (m) {
      const state = m[1] as 'Done' | 'Superseded';
      current.closed = m[2] ? { state, on: m[2] } : { state };
    }
    entries.push(current);
    current = undefined;
  };
  lines.forEach((line, i) => {
    const m = ENTRY_START.exec(line);
    if (m) {
      finish();
      const [, date = '', kind = '', rest = ''] = m;
      current = { start: i, end: i, date, kind: kind.trim(), text: rest.trim() };
      return;
    }
    if (current && /^ {2,}\S/.test(line)) {
      current.end = i;
      current.text = `${current.text} ${line.trim()}`;
      return;
    }
    finish();
  });
  finish();
  return entries;
}

export function isOpen(entry: Entry): boolean {
  return OPEN_KINDS.test(entry.kind) && !entry.closed;
}

/** Whole days from the entry's date to `today` (UTC calendar dates). */
export function ageDays(date: string, today: Date): number {
  const then = Date.parse(`${date}T00:00:00Z`);
  const now = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.max(0, Math.round((now - then) / 86_400_000));
}

export interface Ledger {
  open: Entry[];
  stale: Entry[];
  closed: Entry[];
}

/** Open entries oldest first; `stale` is the subset older than `staleDays`. */
export function ledger(md: string, today: Date, staleDays = DEFAULT_STALE_DAYS): Ledger {
  const all = parseEntries(md);
  const open = all.filter(isOpen).sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start);
  return {
    open,
    stale: open.filter((e) => ageDays(e.date, today) > staleDays),
    closed: all.filter((e) => OPEN_KINDS.test(e.kind) && e.closed),
  };
}

const isoDate = (d: Date): string => d.toISOString().slice(0, 10);

export function summary(entry: Entry, width = 110): string {
  const plain = entry.text.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  return plain.length <= width ? plain : `${plain.slice(0, width - 1).trimEnd()}…`;
}

export function formatLine(entry: Entry, today: Date): string {
  const age = `${ageDays(entry.date, today)}d`.padStart(4);
  const state = entry.closed
    ? ` [${entry.closed.state}${entry.closed.on ? ` ${entry.closed.on}` : ''}]`
    : '';
  return `${age} | ${entry.kind} | ${entry.date}${state} | ${summary(entry)}`;
}

export interface CloseOptions {
  on: string;
  by: string;
  how: string;
  state?: 'Done' | 'Superseded';
}

/**
 * Appends the closing suffix to the one OPEN entry whose first line contains `match`.
 * Throws when no open entry matches or more than one does (the caller narrows the match).
 */
export function closeEntry(md: string, match: string, opts: CloseOptions): string {
  const lines = md.split('\n');
  const hits = parseEntries(md).filter((e) => isOpen(e) && (lines[e.start] ?? '').includes(match));
  if (hits.length === 0) throw new Error(`no open handoff/owner entry matches "${match}"`);
  if (hits.length > 1) {
    const which = hits
      .map((e) => `  line ${e.start + 1}: ${(lines[e.start] ?? '').slice(0, 90)}`)
      .join('\n');
    throw new Error(`"${match}" matches ${hits.length} open entries — narrow it:\n${which}`);
  }
  const [hit] = hits;
  if (!hit) throw new Error('unreachable: exactly one hit expected');
  const how = opts.how.trim().replace(/\s+/g, ' ');
  lines[hit.end] =
    `${(lines[hit.end] ?? '').trimEnd()} — ${opts.state ?? 'Done'} ${opts.on} (${opts.by}): ${how}`;
  return lines.join('\n');
}

// ---------------------------------------------------------------------------------------------
// Owner digest (2026-10-06, foundry `owner-ask-digest`): the phone received each `owner:` line
// exactly once, when it was pushed, and nothing ordered or reminded — 8 asks were open, the oldest
// 6 days, none acted on. `npm run handoffs` now also writes docs/for-owner/OPEN.md, the asks ordered
// by payoff (the STRATEGY §5 score of the queue items each one unblocks ÷ the minutes it takes the
// owner), and prints one `notify:` line when an ask is older than DIGEST_AFTER_DAYS, which the
// Monday weekly report copies as its one `| notify |` run line. The retro records the median age.
// Open `handoff:` entries get their own digest (handoffDigestLine, HANDOFF_AFTER_DAYS): the
// 2-hourly run watchdog appends it to RUNS.md as a `| notify |` line, once a week while it holds.

/** Minutes assumed for an ask whose text gives none (`~N min`). */
export const DEFAULT_MINUTES = 10;
/** An owner ask open for more than this many days puts the digest line on the phone. */
export const DIGEST_AFTER_DAYS = 7;
/**
 * A `handoff:` entry (agent work only an attended Claude Code session can clear — signing a
 * built release, a fork PR) older than this is a job the owner's next session owes; shorter than
 * the owner-ask threshold because the work is already done and the hop is minutes (foundry
 * handoff-aging-escalation, 2026-10-10: ReadFocus 0.3.0 and Highlight Keep 0.4.0 sat unsigned
 * 5–6 days with nothing on the phone naming them).
 */
export const HANDOFF_AFTER_DAYS = 3;
/** Every handoff digest line carries this phrase: the watchdog dedupes on it. */
export const HANDOFF_DIGEST_MARK = 'your next Claude Code session';
/** Phone lines stay short and plain (burn-down / report NOTIFY rule: ≤ 90 chars). */
export const DIGEST_MAX_CHARS = 90;

/** The `~N min` an ask quotes for the owner's time, or undefined. `~15 min + Figma review` → 15. */
export function parseMinutes(text: string): number | undefined {
  const m = /~\s*(\d{1,3})\s*min/i.exec(text) ?? /\b(\d{1,3})-minute\b/i.exec(text);
  return m ? Number(m[1]) : undefined;
}

/** Owner action numbers an entry names: `action 013`, `actions 017/018`, `actions/019-…md`. */
export function actionIds(text: string): string[] {
  const ids = new Set<string>();
  for (const m of text.matchAll(/\bactions?\s+((?:\d{3}(?:\s*[/,&]\s*|\s+and\s+)?)+)/gi)) {
    for (const id of (m[1] ?? '').match(/\d{3}/g) ?? []) ids.add(id);
  }
  for (const id of actionFilesNamed(text)) ids.add(id);
  return [...ids].sort();
}

/** Only the action files an entry links (`docs/for-owner/actions/NNN-…md`). */
export function actionFilesNamed(text: string): string[] {
  const ids = new Set<string>();
  for (const m of text.matchAll(/\bactions\/(\d{3})-/g)) if (m[1]) ids.add(m[1]);
  return [...ids].sort();
}

/**
 * The actions an ask is about: the step files it links, else every action it mentions. An ask
 * that says "batch with action 017" is not action 017 and must not inherit what 017 unblocks.
 */
export function ownActionIds(text: string): string[] {
  const files = actionFilesNamed(text);
  return files.length > 0 ? files : actionIds(text);
}

/** Short plain title: the entry's first bold phrase, else its text up to the first dash, bracket or colon. */
export function askTitle(text: string, width = 60): string {
  const bold = /\*\*(.+?)\*\*/.exec(text);
  let title = bold?.[1] ?? text.split(/\s[—(]|:\s/)[0] ?? text;
  title = title.replace(/[`*]/g, '').replace(/\s+/g, ' ').trim();
  return title.length <= width ? title : `${title.slice(0, width - 1).trimEnd()}…`;
}

export interface QueueItem {
  id: string;
  score?: number;
  status?: string;
  blocked_on?: string;
}
export interface Queue {
  venture: string;
  items: QueueItem[];
}
export interface Unblocked {
  venture: string;
  id: string;
  score: number;
}

/** An open `owner:` entry with what it unblocks and its rank. */
export interface Ask {
  entry: Entry;
  age: number;
  minutes: number | undefined;
  actions: string[];
  unblocks: Unblocked[];
  /** Sum of the scores of the blocked queue items the ask unblocks. */
  payoff: number;
  /** payoff ÷ minutes (DEFAULT_MINUTES when the ask gives none); 0 when nothing queued waits on it. */
  rank: number;
}

/**
 * A blocked queue item waits on an ask when its `blocked_on` names one of the ask's action numbers
 * or the ask's ALERTS date (`ALERTS 2026-10-02`).
 */
export function unblockedBy(entry: Entry, actions: string[], queues: Queue[]): Unblocked[] {
  const out: Unblocked[] = [];
  for (const q of queues) {
    for (const item of q.items) {
      if (item.status !== 'blocked' || !item.blocked_on) continue;
      const ids = actionIds(item.blocked_on);
      const byAction = actions.some((a) => ids.includes(a));
      const byDate = item.blocked_on.includes(`ALERTS ${entry.date}`);
      if (byAction || byDate) out.push({ venture: q.venture, id: item.id, score: item.score ?? 0 });
    }
  }
  return out;
}

/** Open owner asks ranked by payoff ÷ minutes, highest first; equal ranks oldest first. */
export function rankAsks(open: Entry[], queues: Queue[], today: Date): Ask[] {
  const asks: Ask[] = open
    .filter((e) => /^owner\b/.test(e.kind))
    .map((entry) => {
      const actions = ownActionIds(entry.text);
      const unblocks = unblockedBy(entry, actions, queues);
      const payoff = unblocks.reduce((sum, u) => sum + u.score, 0);
      const minutes = parseMinutes(entry.text);
      return {
        entry,
        age: ageDays(entry.date, today),
        minutes,
        actions,
        unblocks,
        payoff,
        rank: payoff / (minutes ?? DEFAULT_MINUTES),
      };
    });
  return asks.sort(
    (a, b) =>
      b.rank - a.rank || a.entry.date.localeCompare(b.entry.date) || a.entry.start - b.entry.start,
  );
}

/** Median of the asks' ages in whole days; 0 when there are none. */
export function medianAge(asks: readonly Ask[]): number {
  if (asks.length === 0) return 0;
  const ages = asks.map((a) => a.age).sort((x, y) => x - y);
  const mid = Math.floor(ages.length / 2);
  const lo = ages[mid - 1] ?? 0;
  const hi = ages[mid] ?? 0;
  return ages.length % 2 === 1 ? hi : Math.round((lo + hi) / 2);
}

/**
 * The one plain phone line for the weekly report, or undefined while no ask is older than
 * DIGEST_AFTER_DAYS: count, oldest age, the top ask by payoff. ≤ DIGEST_MAX_CHARS.
 */
export function digestLine(asks: readonly Ask[]): string | undefined {
  const oldest = Math.max(0, ...asks.map((a) => a.age));
  if (asks.length === 0 || oldest <= DIGEST_AFTER_DAYS) return undefined;
  const top = asks[0];
  if (!top) return undefined;
  const head = `${asks.length} request${asks.length === 1 ? '' : 's'} waiting on you, oldest ${oldest} days: `;
  const room = Math.max(12, DIGEST_MAX_CHARS - head.length);
  return `${head}${askTitle(top.entry.text, room)}`;
}

/**
 * The phone line for open `handoff:` entries, or undefined while none is older than
 * HANDOFF_AFTER_DAYS: count, oldest age, the oldest entry's title. ≤ DIGEST_MAX_CHARS. The run
 * watchdog sends it (once per week while it holds, `run-watchdog.ts handoffNotifyLine`); the
 * weekly report never copies it.
 */
export function handoffDigestLine(handoffs: readonly Entry[], today: Date): string | undefined {
  const aged = handoffs
    .filter((e) => /^handoff\b/.test(e.kind))
    .map((e) => ({ entry: e, age: ageDays(e.date, today) }))
    .sort((a, b) => b.age - a.age);
  const oldest = aged[0];
  if (!oldest || oldest.age <= HANDOFF_AFTER_DAYS) return undefined;
  const n = aged.length;
  const head = `${n} job${n === 1 ? '' : 's'} for ${HANDOFF_DIGEST_MARK}, oldest ${oldest.age} days: `;
  const room = Math.max(12, DIGEST_MAX_CHARS - head.length);
  return `${head}${askTitle(oldest.entry.text, room)}`;
}

/**
 * docs/for-owner/OPEN.md: the ranked asks, then handoffs an attended session owes, as plain Markdown.
 * No clock in the file (2026-10-08, foundry `open-md-stable-render`): a generated-on date and
 * "waiting N days" made `npm run check` rewrite it every day with nothing new, so a 24-line
 * date-only diff rode every routine commit; the ages live in the `notify:` digest instead and the
 * file changes only when an ask opens, closes or the work it unblocks changes.
 */
export function renderOpen(
  asks: readonly Ask[],
  handoffs: readonly Entry[],
  actionFiles: ReadonlyMap<string, string>,
): string {
  const lines: string[] = [
    '# Open requests — what is waiting on you',
    '',
    'Generated by `npm run handoffs` from the open `owner:` entries of `docs/ALERTS.md`' +
      ' (`scripts/handoffs.ts`); edits here are overwritten — a request is closed with `npm run handoffs -- close …`.',
    'Ordered by payoff: the score of the queued work each request unblocks (`docs/pipeline/`, STRATEGY §5) divided by',
    'the minutes it takes you; a request that unblocks nothing queued yet follows, oldest first. Decisions already',
    'taken and the history stay in [OUTSTANDING.md](OUTSTANDING.md).',
    '',
    `## Requests (${asks.length})`,
    '',
  ];
  if (asks.length === 0) lines.push('Nothing is waiting on you.', '');
  asks.forEach((ask, i) => {
    const minutes = ask.minutes === undefined ? 'time not stated' : `~${ask.minutes} min`;
    const unblocks =
      ask.unblocks.length === 0
        ? 'nothing queued waits on it'
        : `unblocks ${ask.unblocks.map((u) => `${u.venture} \`${u.id}\` (${u.score})`).join(', ')}`;
    const steps = ask.actions
      .map((id) => {
        const file = actionFiles.get(id);
        return file ? `[${id}](actions/${file})` : id;
      })
      .join(', ');
    lines.push(
      `${i + 1}. **${askTitle(ask.entry.text)}** — ${minutes}, since ${ask.entry.date}; ${unblocks}${steps ? `. Steps: ${steps}` : ''}.`,
      `   ${summary(ask.entry, 320)}`,
      '',
    );
  });
  lines.push(`## Waiting on an attended Claude session, not you (${handoffs.length})`, '');
  if (handoffs.length === 0) lines.push('None.', '');
  for (const h of handoffs) {
    lines.push(`- since ${h.date} — ${summary(h, 200)}`);
  }
  if (handoffs.length > 0) lines.push('');
  return lines.join('\n');
}

/** Every queue under docs/pipeline/queues (venture + items); unreadable files are skipped. */
export function loadQueues(dir: string): Queue[] {
  if (!existsSync(dir)) return [];
  const queues: Queue[] = [];
  for (const file of readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()) {
    try {
      const raw = JSON.parse(readFileSync(path.join(dir, file), 'utf8')) as Partial<Queue>;
      if (Array.isArray(raw.items)) {
        queues.push({ venture: raw.venture ?? file.replace(/\.json$/, ''), items: raw.items });
      }
    } catch {
      // a malformed queue is npm run pipeline's finding, not this script's
    }
  }
  return queues;
}

/** `013` → `013-repo-private.md` for every file under docs/for-owner/actions. */
export function loadActionFiles(dir: string): Map<string, string> {
  const map = new Map<string, string>();
  if (!existsSync(dir)) return map;
  for (const file of readdirSync(dir)) {
    const m = /^(\d{3})-.*\.md$/.exec(file);
    if (m?.[1]) map.set(m[1], file);
  }
  return map;
}

/** Writes OPEN.md when its content changed; returns whether it did. */
export function writeOpen(file: string, content: string): boolean {
  const current = existsSync(file) ? readFileSync(file, 'utf8') : undefined;
  if (current === content) return false;
  writeFileSync(file, content);
  return true;
}

export interface Args {
  command: string;
  positional: string[];
  flags: Record<string, string | true>;
}

export function parseArgs(argv: string[]): Args {
  const positional: string[] = [];
  const flags: Record<string, string | true> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i] ?? '';
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else flags[key] = true;
    } else positional.push(a);
  }
  const [command = 'list', ...rest] = positional;
  return { command, positional: rest, flags };
}

function main(): void {
  const { command, positional, flags } = parseArgs(process.argv.slice(2));
  const file = path.resolve(ALERTS_FILE);
  const md = readFileSync(file, 'utf8');
  const today = new Date();
  switch (command) {
    case 'list': {
      const staleDays = typeof flags.stale === 'string' ? Number(flags.stale) : DEFAULT_STALE_DAYS;
      const book = ledger(md, today, staleDays);
      const rows = flags.all ? [...book.open, ...book.closed] : book.open;
      if (flags.json) {
        console.log(JSON.stringify(rows, null, 2));
        return;
      }
      for (const e of rows) console.log(formatLine(e, today));
      console.log(
        `${book.open.length} open (${book.stale.length} older than ${staleDays} days), ${book.closed.length} closed with a Done/Superseded suffix`,
      );
      const asks = rankAsks(book.open, loadQueues(path.resolve(QUEUES_DIR)), today);
      const handoffs = book.open.filter((e) => /^handoff\b/.test(e.kind));
      console.log(
        `owner asks: ${asks.length} open, median open age of owner asks: ${medianAge(asks)} d, ${asks.filter((a) => a.payoff > 0).length} unblock queued work`,
      );
      const digest = digestLine(asks);
      if (digest) console.log(`notify: ${digest}`);
      const handoffDigest = handoffDigestLine(handoffs, today);
      if (handoffDigest) console.log(`handoffs (the watchdog sends this one): ${handoffDigest}`);
      if (!flags['no-write']) {
        const content = renderOpen(asks, handoffs, loadActionFiles(path.resolve(ACTIONS_DIR)));
        if (writeOpen(path.resolve(OPEN_FILE), content)) console.log(`${OPEN_FILE} rebuilt`);
      }
      return;
    }
    case 'close': {
      const match = positional[0] ?? '';
      const by = typeof flags.by === 'string' ? flags.by : '';
      const how = typeof flags.how === 'string' ? flags.how : '';
      if (!match || !by || !how) {
        throw new Error(
          'usage: handoffs -- close "<first-line substring>" --by <routine> --how "<how>" [--superseded] [--on YYYY-MM-DD]',
        );
      }
      const on = typeof flags.on === 'string' ? flags.on : isoDate(today);
      const state = flags.superseded ? 'Superseded' : 'Done';
      writeFileSync(file, closeEntry(md, match, { on, by, how, state }));
      console.log(`${state} ${on} (${by}): ${match}`);
      return;
    }
    default:
      throw new Error('usage: handoffs -- list|close … (see the header of scripts/handoffs.ts)');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
