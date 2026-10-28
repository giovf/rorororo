// `npm run first-runs`: the CI WORKFLOWS check in one command (2026-10-28, foundry
// `first-run-check-script`). Every slot used to re-derive the rule by hand — list the installer
// commits of the last 3 days, read each file's triggers, compare run-log stamps with the installer's
// commit time — and on 10-24 and 10-26 two slots stamped the same `<name> first run:` line because
// the second re-derived it with the first's line already in the file. This prints one line per
// workflow still owed (or `nothing owed`); a workflow with a line is never read again.
//
// A line counts when it is stamped after the latest installer commit naming the workflow and its
// result starts with `success` or `failure`; a `none since the install` note leaves it owed.
// (Node 22 runs .ts directly — keep syntax erasable)

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Workflows a routine never dispatches: they spend money, publish or submit to a store. */
export const NEVER_DISPATCH: readonly string[] = [
  'gankdat-publish.yml',
  'mirror-gankdat.yml',
  'demo-video.yml',
];

export interface Installer {
  /** `YYYY-MM-DD HH:MM` (UTC) of the installer commit. */
  at: string;
  names: string[];
}

export interface Owed {
  name: string;
  installedAt: string;
  dispatchable: boolean;
  /** The run-log line found for an earlier install, or a `none` note, if any. */
  note?: string;
}

/** Parse `git log --format='%cI|%s'` lines of `ci: install workflow(s) …` commits. */
export function parseInstallers(log: string): Installer[] {
  const out: Installer[] = [];
  for (const line of log.split('\n')) {
    const bar = line.indexOf('|');
    if (bar < 0) continue;
    const when = new Date(line.slice(0, bar));
    const subject = line.slice(bar + 1);
    if (Number.isNaN(when.getTime()) || !subject.startsWith('ci: install workflow')) continue;
    const names = subject.replace(/\s\([^()]*\)\s*$/, '').match(/[\w.-]+\.ya?ml\b/g) ?? [];
    if (names.length === 0) continue;
    out.push({ at: when.toISOString().slice(0, 16).replace('T', ' '), names });
  }
  return out;
}

/** The latest installer time per workflow name. */
export function latestInstalls(installers: Installer[]): Map<string, string> {
  const latest = new Map<string, string>();
  for (const { at, names } of installers) {
    for (const name of names) {
      const seen = latest.get(name);
      if (seen === undefined || at > seen) latest.set(name, at);
    }
  }
  return latest;
}

/** True when the file's triggers include `workflow_dispatch` (comments ignored). */
export function hasDispatch(yaml: string): boolean {
  return yaml
    .split('\n')
    .some((line) => /^\s*(-\s*)?workflow_dispatch\b/.test(line.replace(/#.*$/, '')));
}

/** The `<name> first run: <result>` lines of RUNS.md, with stamp and result. */
function firstRunLines(runs: string, name: string): { stamp: string; result: string }[] {
  const out: { stamp: string; result: string }[] = [];
  const marker = `| ${name} first run: `;
  for (const line of runs.split('\n')) {
    const m = /^- (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) \| [^|]+ /.exec(line);
    const at = line.indexOf(marker);
    if (!m || at < 0) continue;
    out.push({ stamp: m[1]!, result: line.slice(at + marker.length).trim() });
  }
  return out;
}

/** The workflows whose first run after their latest installer commit is not yet recorded. */
export function owedFirstRuns(
  installers: Installer[],
  runs: string,
  dispatchable: (name: string) => boolean,
): Owed[] {
  const owed: Owed[] = [];
  for (const [name, installedAt] of [...latestInstalls(installers)].sort()) {
    const lines = firstRunLines(runs, name).filter((l) => l.stamp > installedAt);
    if (lines.some((l) => /^(success|failure)\b/i.test(l.result))) continue;
    const note = lines.at(-1)?.result;
    owed.push({
      name,
      installedAt,
      dispatchable: dispatchable(name),
      ...(note === undefined ? {} : { note }),
    });
  }
  return owed;
}

export function formatOwed(o: Owed): string {
  const how = NEVER_DISPATCH.includes(o.name)
    ? 'never dispatched (publishes or spends), read only'
    : o.dispatchable
      ? 'dispatchable'
      : 'not dispatchable, read only';
  return `${o.name}: installer ${o.installedAt} UTC, ${how}, ${o.note === undefined ? 'no line' : `last note "${o.note}"`}`;
}

function main(): void {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const log = execFileSync(
    'git',
    ['log', '--since=3 days ago', '--format=%cI|%s', '--grep=^ci: install workflow'],
    { cwd: root, encoding: 'utf8' },
  );
  const runs = readFileSync(path.join(root, 'docs/RUNS.md'), 'utf8');
  const owed = owedFirstRuns(parseInstallers(log), runs, (name) => {
    const file = path.join(root, '.github/workflows', name);
    return existsSync(file) && hasDispatch(readFileSync(file, 'utf8'));
  });
  if (owed.length === 0) console.log('nothing owed');
  for (const o of owed) console.log(formatOwed(o));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
