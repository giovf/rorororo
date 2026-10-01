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
// Run: npm run handoffs                                → open entries: `<age>d | <kind> | <date> | <text>`
//      npm run handoffs -- list [--stale 7] [--all] [--json]
//      npm run handoffs -- close "<substring of the entry's first line>" --by <routine> --how "<how>"
//                               [--superseded] [--on YYYY-MM-DD]
// Node 22 runs .ts directly — keep syntax erasable, import only node builtins.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ALERTS_FILE = path.join('docs', 'ALERTS.md');
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
