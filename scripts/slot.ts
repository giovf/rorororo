// Slot marker: makes an in-flight routine slot visible on `main` before it commits anything.
//
// Why: the 09:00/17:00 Fable build pushes ONE commit at the end of its run, 26–45 min after the
// slot. The 09:20/17:20 Opus fallback checks for that commit at :20, sees nothing, and builds
// too — three collisions in two days (2026-09-29/30, foundry item `fallback-slot-race`), two of
// them a merge conflict, one a whole slot spent on a duplicate. The check can only see a run
// that has already finished. This script closes that window: the build routine's first action
// is `npm run slot -- start build`, which appends one line to docs/ops/SLOTS.md and pushes a
// commit whose subject ends in `(build)` — exactly the trace the fallback's existing check
// already stops on. The fallback (and anyone) can also ask `npm run slot -- check build`.
//
// docs/ops/SLOTS.md is deliberately NOT docs/RUNS.md: RUNS.md lines are sent to the owner's
// phone by the `notify owner` job; a started marker is ops plumbing, not news.
// The run watchdog (scripts/run-watchdog.ts) reads the same file so a slot that started and
// then died is reported as `stalled:`, not silently treated as traced.
//
// Run: npm run slot -- start <routine>        stamp + commit + push (from `main` or a `work` branch)
//      npm run slot -- check <routine> [--window=120]   prints running | done | missed
// Node 22 runs .ts directly — keep syntax erasable, import only node builtins.
import { execSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SLOTS_FILE = path.join('docs', 'ops', 'SLOTS.md');
export const DEFAULT_WINDOW_MINUTES = 120;
const MINUTE = 60_000;
const pad = (n: number): string => String(n).padStart(2, '0');

/** `YYYY-MM-DD HH:MM` in UTC — the RUNS.md / SLOTS.md timestamp format. */
export function stamp(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

/** The SLOTS.md line for a slot start. */
export function startedLine(routine: string, now: Date): string {
  return `- ${stamp(now)} | ${routine} | started`;
}

/** Commit subject for the marker: ends in `(<routine>)` so the routine's own trace check sees it. */
export function startedSubject(routine: string, now: Date): string {
  return `${routine}: slot ${stamp(now)} UTC started (${routine})`;
}

const SUBJECT_RE = /^([a-z-]+): slot (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) UTC started \(\1\)$/;

/** Routine name when a commit subject is a start marker (never a finished-work trace). */
export function startMarkerRoutine(subject: string): string | undefined {
  const m = SUBJECT_RE.exec(subject.trim());
  return m?.[1];
}

export interface Started {
  routine: string;
  at: Date;
}

/** `- YYYY-MM-DD HH:MM | <routine> | started` lines of docs/ops/SLOTS.md. */
export function parseStarted(text: string): Started[] {
  const out: Started[] = [];
  for (const line of text.split('\n')) {
    const m = /^-\s*(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})\s*\|\s*([a-z-]+)\s*\|\s*started\s*$/.exec(
      line,
    );
    if (!m) continue;
    const at = new Date(`${m[1]}T${m[2]}:00Z`);
    if (Number.isNaN(at.getTime())) continue;
    out.push({ routine: m[3] ?? '', at });
  }
  return out;
}

export type SlotState = 'running' | 'done' | 'missed';

export interface CheckInput {
  routine: string;
  now: Date;
  slotsText: string;
  /** `git log --format=%cI%x09%s` output. */
  commitsText: string;
  windowMinutes?: number;
}

export interface CheckResult {
  state: SlotState;
  /** The evidence: the start line or the finishing commit subject. */
  evidence?: string;
}

/**
 * State of `routine`'s current slot: `done` when a finished-work commit tagged `(<routine>)`
 * landed inside the window, `running` when only a start marker did, `missed` otherwise.
 */
export function checkSlot(input: CheckInput): CheckResult {
  const window = (input.windowMinutes ?? DEFAULT_WINDOW_MINUTES) * MINUTE;
  const from = input.now.getTime() - window;
  const tag = `(${input.routine})`;
  for (const line of input.commitsText.split('\n')) {
    const [iso, ...rest] = line.split('\t');
    if (!iso) continue;
    const at = new Date(iso).getTime();
    if (Number.isNaN(at) || at < from) continue;
    const subject = rest.join('\t').trim();
    if (subject.endsWith(tag) && startMarkerRoutine(subject) === undefined)
      return { state: 'done', evidence: subject };
  }
  const started = parseStarted(input.slotsText)
    .filter((s) => s.routine === input.routine && s.at.getTime() >= from)
    .sort((a, b) => b.at.getTime() - a.at.getTime())[0];
  if (started) return { state: 'running', evidence: startedLine(input.routine, started.at) };
  return { state: 'missed' };
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
      if (attempt === 4) throw new Error('slot: push to main failed four times');
      console.log(`slot: push rejected (attempt ${attempt}), pulling and retrying`);
      git(root, 'pull --no-rebase --no-edit origin main');
    }
  }
}

function main(): void {
  const [command, routine, ...flags] = process.argv.slice(2);
  if (!routine || !/^[a-z-]+$/.test(routine) || (command !== 'start' && command !== 'check')) {
    console.error('usage: npm run slot -- start <routine> | check <routine> [--window=MINUTES]');
    process.exit(2);
  }
  const root = path.resolve(import.meta.dirname, '..');
  const slotsPath = path.join(root, SLOTS_FILE);
  const now = new Date();
  if (command === 'start') {
    const header =
      "# Slot starts\n\nOne line per routine run, written by `npm run slot -- start <routine>` as the run's first push, so\nthe fallback and the watchdog can tell an in-flight slot from a missed one. Not sent to the owner.\n\n";
    const existing = existsSync(slotsPath) ? readFileSync(slotsPath, 'utf8') : '';
    const line = startedLine(routine, now);
    appendFileSync(
      slotsPath,
      `${existing === '' ? header : existing.endsWith('\n') ? '' : '\n'}${line}\n`,
    );
    git(root, `add ${JSON.stringify(SLOTS_FILE)}`);
    git(root, `commit -q -m ${JSON.stringify(startedSubject(routine, now))}`);
    pushWithRetry(root);
    console.log(line);
    return;
  }
  const windowFlag = flags.find((f) => f.startsWith('--window='))?.slice('--window='.length);
  const windowMinutes = windowFlag ? Number(windowFlag) : DEFAULT_WINDOW_MINUTES;
  const sinceIso = new Date(now.getTime() - (windowMinutes + 5) * MINUTE).toISOString();
  const commitsText = git(root, `log --since=${sinceIso} --format=%cI%x09%s`);
  const slotsText = existsSync(slotsPath) ? readFileSync(slotsPath, 'utf8') : '';
  const result = checkSlot({ routine, now, slotsText, commitsText, windowMinutes });
  console.log(result.evidence ? `${result.state}\t${result.evidence}` : result.state);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
