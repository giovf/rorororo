// The routines' pause switch (owner 2026-11-20): the owner pauses a Claude routine on the dashboard
// (apps.gankdat.com/ops?view=schedules, packages/landing/src/schedules.ts) to save usage; the owner-notes
// poll copies the switch into docs/ops/PAUSED.json, and every routine's first step runs
//   npm run paused -- <routine>
// which prints `paused: <routine> …` (end the run there: no npm ci, no commit) or `run: <routine>`.
// Plain Node, no dependencies, so it runs before the install. The fallback also stops while the build is
// paused (it would otherwise build in the build's place). The run watchdog reads the same file so a paused
// slot is reported `paced:`, never `missed … usage limit?`.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PAUSED_FILE = 'docs/ops/PAUSED.json';

/** Routine keys as the dashboard and the watchdog name them. */
export const PAUSABLE = [
  'build',
  'fallback',
  'burn-down',
  'exchange',
  'review',
  'metrics',
  'inbox',
  'report',
  'retro',
] as const;

export interface PausedDoc {
  paused: Record<string, string>;
  history: { routine: string; from: string; to: string }[];
  updated: string | null;
}

export function parsePaused(text: string | undefined): PausedDoc {
  const empty: PausedDoc = { paused: {}, history: [], updated: null };
  if (!text) return empty;
  try {
    const d = JSON.parse(text) as Partial<PausedDoc>;
    return {
      paused: d.paused && typeof d.paused === 'object' ? d.paused : {},
      history: Array.isArray(d.history) ? d.history : [],
      updated: typeof d.updated === 'string' ? d.updated : null,
    };
  } catch {
    return empty;
  }
}

/** The keys whose switch stops `routine`: itself, and the build's for the fallback. */
function switches(routine: string): string[] {
  return routine === 'fallback' ? ['fallback', 'build'] : [routine];
}

/** Why `routine` is paused now (`<key> since <iso>`), or undefined when it runs. */
export function pausedNow(doc: PausedDoc, routine: string): string | undefined {
  for (const key of switches(routine)) {
    const since = doc.paused[key];
    if (since !== undefined)
      return `${key} paused since ${since.slice(0, 16).replace('T', ' ')} UTC`;
  }
  return undefined;
}

/** True when `routine` was paused at `at` — an open pause that began by then, or a closed one around it. */
export function pausedAt(doc: PausedDoc, routine: string, at: Date): boolean {
  const t = at.getTime();
  return switches(routine).some((key) => {
    const since = doc.paused[key];
    if (since !== undefined && Date.parse(since) <= t) return true;
    return doc.history.some(
      (h) => h.routine === key && Date.parse(h.from) <= t && t < Date.parse(h.to),
    );
  });
}

/** The gate's one line for `routine`. */
export function gateLine(doc: PausedDoc, routine: string): string {
  const why = pausedNow(doc, routine);
  return why === undefined
    ? `run: ${routine}`
    : `paused: ${routine} — ${why} from the ops page; end the run now`;
}

function main(): void {
  const routine = process.argv[2] ?? process.env['npm_config_routine'] ?? '';
  if (!(PAUSABLE as readonly string[]).includes(routine)) {
    console.error(`usage: npm run paused -- <${PAUSABLE.join('|')}>`);
    process.exit(2);
  }
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const file = path.join(root, PAUSED_FILE);
  console.log(
    gateLine(parsePaused(existsSync(file) ? readFileSync(file, 'utf8') : undefined), routine),
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
