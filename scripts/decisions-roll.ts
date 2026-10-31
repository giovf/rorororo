// Decision-log rollover (foundry `strategy-decision-log-rollover`, 2026-10-31): docs/STRATEGY.md §8
// keeps the last ROLL_DAYS of entries; older ones move into docs/decisions/<YYYY-MM>.md (newest
// last, same line shape, the entry's own month), and a pointer line under the §8 heading says so.
//
// Why: STRATEGY.md was 294 KB on 2026-10-31, 273 KB of it §8 (401 entries), and six routine
// prompts read §8 at the start of every slot — about 70k tokens a slot for decisions a slot never
// needs. The git history keeps every entry in place either way; the roll moves text between two
// tracked files in one commit and never deletes a line (the `npm run runs` floor counts the §8
// entries plus every docs/decisions file, so a roll is not read as a whole-file write).
//
// Run: npm run decisions-roll                → roll entries older than 30 days, print what moved
//      npm run decisions-roll -- --days 14   → a tighter window
//      npm run decisions-roll -- --dry-run   → print only
// Idempotent: a second run moves nothing. Node 22 runs .ts directly — keep syntax erasable, import
// only node builtins.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const STRATEGY_FILE = path.join('docs', 'STRATEGY.md');
export const DECISIONS_DIR = path.join('docs', 'decisions');
export const ROLL_DAYS = 30;
export const HEADING = '## 8. Decision log';
/** The one non-dated line the roll leaves under the heading; recognised on the next run. */
export const POINTER_PREFIX = '_Entries older than ';

const DATED = /^- (\d{4}-\d{2}-\d{2})\b/;

export interface Entry {
  date: string;
  /** The bullet and its continuation lines, no trailing blank lines. */
  lines: string[];
}

export interface DecisionLog {
  /** Everything before the §8 heading line. */
  before: string[];
  entries: Entry[];
  /** Everything after the log (a later `## ` section), normally nothing. */
  after: string[];
}

export function pointerLine(days: number): string {
  return `${POINTER_PREFIX}${days} days roll into \`docs/decisions/<YYYY-MM>.md\` (\`npm run decisions-roll\`, run by the Saturday retro); the git history keeps every entry in place. Read those files for an older month._`;
}

/**
 * Splits STRATEGY.md at §8: the text before, the dated entries (a `- YYYY-MM-DD …` bullet with
 * its indented or unindented continuation lines up to the next bullet), and anything after. Blank
 * lines and the pointer line inside the log are dropped; the writer puts them back.
 */
export function splitDecisionLog(md: string): DecisionLog {
  const lines = md.split('\n');
  const h = lines.indexOf(HEADING);
  if (h < 0) throw new Error(`${STRATEGY_FILE}: no "${HEADING}" heading`);
  const before = lines.slice(0, h);
  const entries: Entry[] = [];
  const after: string[] = [];
  let current: Entry | undefined;
  for (let i = h + 1; i < lines.length; i++) {
    const line = lines[i] ?? '';
    if (/^## /.test(line)) {
      after.push(...lines.slice(i));
      break;
    }
    const dated = DATED.exec(line);
    if (dated) {
      current = { date: dated[1] ?? '', lines: [line] };
      entries.push(current);
    } else if (line.startsWith(POINTER_PREFIX)) {
      current = undefined;
    } else if (line.trim() === '') {
      current = undefined;
    } else if (current) {
      current.lines.push(line);
    }
    // A non-blank, non-dated line before the first entry (there are none today) is dropped as noise.
  }
  while (after.length > 0 && after[after.length - 1] === '') after.pop();
  return { before, entries, after };
}

/** `YYYY-MM-DD` of `days` days before `today` (UTC). */
export function cutoffDate(today: string, days: number): string {
  const t = new Date(`${today}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() - days);
  return t.toISOString().slice(0, 10);
}

export interface Roll {
  keep: Entry[];
  /** Rolled entries by their `YYYY-MM`, in the order they stood in the log. */
  rolled: Map<string, Entry[]>;
}

/** Entries dated before the cutoff roll; the rest stay, in their original order. */
export function rollEntries(entries: Entry[], cutoff: string): Roll {
  const keep: Entry[] = [];
  const rolled = new Map<string, Entry[]>();
  for (const e of entries) {
    if (e.date < cutoff) {
      const month = e.date.slice(0, 7);
      const list = rolled.get(month) ?? [];
      list.push(e);
      rolled.set(month, list);
    } else keep.push(e);
  }
  return { keep, rolled };
}

/** STRATEGY.md text with the kept entries under the heading and the pointer line. */
export function renderStrategy(log: DecisionLog, keep: Entry[], days: number): string {
  const out = [...log.before, HEADING, '', pointerLine(days), ''];
  for (const e of keep) out.push(...e.lines);
  if (log.after.length > 0) out.push('', ...log.after);
  return `${out.join('\n')}\n`;
}

export function monthFileHeader(month: string): string {
  return `# Decision log — ${month}\n\nEntries rolled out of \`docs/STRATEGY.md\` §8 by \`npm run decisions-roll\` (older than ${ROLL_DAYS} days at the time of the roll; newest last, the same line shape). §8 holds the current window; this file is the log of record for ${month}. Append-only, like §8: \`npm run runs\` counts its dated lines in the floor.\n\n`;
}

/** The month file's text after appending `entries` (created with its header when absent). */
export function appendMonth(existing: string | undefined, month: string, entries: Entry[]): string {
  let text = existing ?? monthFileHeader(month);
  if (!text.endsWith('\n')) text += '\n';
  for (const e of entries) text += `${e.lines.join('\n')}\n`;
  return text;
}

/** Dated bullets across every docs/decisions/<YYYY-MM>.md (for the `npm run runs` floor). */
export function decisionsFileCount(dir = path.resolve(DECISIONS_DIR)): number {
  if (!existsSync(dir)) return 0;
  let n = 0;
  for (const f of readdirSync(dir)) {
    if (!/^\d{4}-\d{2}\.md$/.test(f)) continue;
    n += readFileSync(path.join(dir, f), 'utf8')
      .split('\n')
      .filter((l) => DATED.test(l)).length;
  }
  return n;
}

function main(): void {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const daysAt = argv.indexOf('--days');
  const days = daysAt >= 0 ? Number(argv[daysAt + 1]) : ROLL_DAYS;
  if (!Number.isInteger(days) || days <= 0)
    throw new Error('usage: decisions-roll [--days N] [--dry-run]');
  const today = new Date().toISOString().slice(0, 10);
  const cutoff = cutoffDate(today, days);
  const strategyPath = path.resolve(STRATEGY_FILE);
  const md = readFileSync(strategyPath, 'utf8');
  const log = splitDecisionLog(md);
  const { keep, rolled } = rollEntries(log.entries, cutoff);
  const next = renderStrategy(log, keep, days);
  const moved = [...rolled.values()].reduce((n, l) => n + l.length, 0);
  if (moved === 0 && next === md) {
    console.log(`decisions-roll: nothing older than ${cutoff} in §8 (${keep.length} entries kept)`);
    return;
  }
  const dir = path.resolve(DECISIONS_DIR);
  for (const [month, entries] of rolled) {
    const file = path.join(dir, `${month}.md`);
    const existing = existsSync(file) ? readFileSync(file, 'utf8') : undefined;
    console.log(
      `decisions-roll: ${entries.length} entries → ${path.relative(process.cwd(), file)}${existing ? ' (appended)' : ' (new)'}`,
    );
    if (!dryRun) {
      mkdirSync(dir, { recursive: true });
      writeFileSync(file, appendMonth(existing, month, entries));
    }
  }
  console.log(
    `decisions-roll: §8 keeps ${keep.length} entries dated ${cutoff} or later; ${STRATEGY_FILE} ${md.length} → ${next.length} bytes${dryRun ? ' (dry run, nothing written)' : ''}`,
  );
  if (!dryRun) writeFileSync(strategyPath, next);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
