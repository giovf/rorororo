// Run-log line check: every docs/RUNS.md line written from CAP_FROM on must keep its text within
// the file's own cap (`- YYYY-MM-DD HH:MM | <routine> | <one thing done, ≤ 120 chars>`).
//
// Why: the 2026-W40 ops retro found that nothing had ever machine-checked the cap since the file
// was created on 2026-09-22; over-long lines still reach the owner's phone as Telegram bullets,
// which is exactly what the cap exists to prevent. The measure is the text after the
// `| <routine> | ` prefix, as the header states it; the prefix itself is 27–33 characters and
// is not the routine's to shorten. Lines dated before CAP_FROM are grandfathered (24 of 375 broke
// the text cap when this landed) so `npm run check` stays green without rewriting history.
//
// Why a date cutoff and not the push's diff range: the `check` workflow checks out depth 1, so
// no range exists in CI, and a cutoff gives the same verdict locally and in CI for the same file.
//
// Run: npm run runs                       → check lines dated >= CAP_FROM, exit 1 on a violation
//      npm run runs -- check [--from YYYY-MM-DD] [--cap 120]
//      npm run runs -- list  [--from YYYY-MM-DD] [--cap 120]   → every offender, never fails
// Node 22 runs .ts directly — keep syntax erasable, import only node builtins.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RUNS_FILE = path.join('docs', 'RUNS.md');
export const CAP = 120;
/** Lines dated before this day are grandfathered; the check landed on this date. */
export const CAP_FROM = '2026-10-03';

const DATED = /^- (\d{4}-\d{2}-\d{2})\b/;
const RUN_LINE = /^- (\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}) \| ([^|]+?) \| (.*)$/;

export interface RunLine {
  /** 1-based line number in the file. */
  line: number;
  date: string;
  time: string;
  routine: string;
  text: string;
}

export interface Malformed {
  /** 1-based line number in the file. */
  line: number;
  date: string;
  raw: string;
}

export interface Parsed {
  runs: RunLine[];
  /** Dated bullets that do not have the `- date time | routine | text` shape. */
  malformed: Malformed[];
}

/** Every `- YYYY-MM-DD …` bullet, split into well-formed run lines and malformed ones. */
export function parseRuns(md: string): Parsed {
  const runs: RunLine[] = [];
  const malformed: Malformed[] = [];
  md.split('\n').forEach((raw, i) => {
    const dated = DATED.exec(raw);
    if (!dated) return;
    const m = RUN_LINE.exec(raw);
    if (!m) {
      malformed.push({ line: i + 1, date: dated[1] ?? '', raw });
      return;
    }
    const [, date = '', time = '', routine = '', text = ''] = m;
    runs.push({ line: i + 1, date, time, routine: routine.trim(), text: text.trim() });
  });
  return { runs, malformed };
}

/** Characters as a reader counts them (code points), so an em dash or `≤` is one. */
export function textLength(text: string): number {
  return [...text].length;
}

export interface Violation {
  line: number;
  kind: 'too-long' | 'malformed';
  /** Text length for `too-long`; 0 for `malformed`. */
  length: number;
  preview: string;
}

/** Violations among lines dated on or after `from`: text over `cap`, or an unparseable bullet. */
export function violations(md: string, from = CAP_FROM, cap = CAP): Violation[] {
  const { runs, malformed } = parseRuns(md);
  const out: Violation[] = [];
  for (const r of runs) {
    if (r.date < from) continue;
    const length = textLength(r.text);
    if (length > cap) out.push({ line: r.line, kind: 'too-long', length, preview: r.text });
  }
  for (const m of malformed) {
    if (m.date < from) continue;
    out.push({ line: m.line, kind: 'malformed', length: 0, preview: m.raw });
  }
  return out.sort((a, b) => a.line - b.line);
}

export function formatViolation(v: Violation, cap = CAP): string {
  const head = v.preview.length > 80 ? `${v.preview.slice(0, 79).trimEnd()}…` : v.preview;
  return v.kind === 'too-long'
    ? `${RUNS_FILE}:${v.line}: ${v.length} chars, cap ${cap} (${v.length - cap} over): ${head}`
    : `${RUNS_FILE}:${v.line}: not \`- YYYY-MM-DD HH:MM | <routine> | <text>\`: ${head}`;
}

export interface Args {
  command: string;
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
  return { command: positional[0] ?? 'check', flags };
}

function main(): void {
  const { command, flags } = parseArgs(process.argv.slice(2));
  const from = typeof flags.from === 'string' ? flags.from : CAP_FROM;
  const cap = typeof flags.cap === 'string' ? Number(flags.cap) : CAP;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !Number.isInteger(cap) || cap <= 0) {
    throw new Error('usage: runs -- check|list [--from YYYY-MM-DD] [--cap N]');
  }
  const md = readFileSync(path.resolve(RUNS_FILE), 'utf8');
  const found = violations(md, from, cap);
  switch (command) {
    case 'check': {
      if (found.length === 0) {
        console.log(
          `runs: every ${RUNS_FILE} line dated ${from} or later keeps its text ≤ ${cap} chars`,
        );
        return;
      }
      for (const v of found) console.error(formatViolation(v, cap));
      console.error(
        `runs: ${found.length} line(s) dated ${from} or later break the ${cap}-char cap — shorten the text after \`| <routine> | \``,
      );
      process.exitCode = 1;
      return;
    }
    case 'list': {
      for (const v of found) console.log(formatViolation(v, cap));
      console.log(`${found.length} offender(s) dated ${from} or later (cap ${cap})`);
      return;
    }
    default:
      throw new Error('usage: runs -- check|list [--from YYYY-MM-DD] [--cap N]');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
