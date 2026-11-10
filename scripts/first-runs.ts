// `npm run first-runs`: the CI WORKFLOWS check in one command (2026-10-28, foundry
// `first-run-check-script`). Every slot used to re-derive the rule by hand — list the installer
// commits of the last 3 days, read each file's triggers, compare run-log stamps with the installer's
// commit time — and on 10-24 and 10-26 two slots stamped the same `<name> first run:` line because
// the second re-derived it with the first's line already in the file. This prints one line per
// workflow still owed (or `nothing owed`); a workflow with a line is never read again.
//
// A line counts when it is stamped after the latest installer commit naming the workflow and its
// result starts with `success` or `failure`; a `none since the install` note leaves it owed.
// 2026-11-10 (foundry `first-runs-event-only-workflow-waiver`): a workflow whose triggers are all
// events a routine cannot raise (no `workflow_dispatch`, `push` or `schedule` — dependabot.yml runs
// on a Dependabot pull request only) is printed as `waits for <event>` and settled by one
// `<name> first run: waits for <event>` line: four slots read dependabot.yml's empty run list
// 11-07..11-10 and then the installer left the window and the check ended unrecorded. The window
// is 14 days now and a workflow owed for more than 3 days prints `overdue` instead of vanishing.
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
  /** The events the workflow waits for when a routine can raise none of its triggers (event-only). */
  waitsFor?: string;
  /** Installed more than OVERDUE_DAYS ago and still unrecorded: the slot settles it now, not later. */
  overdue: boolean;
}

/** Triggers a routine can raise or see on its own; a workflow with none of them only waits for its event. */
export const ROUTINE_TRIGGERS: readonly string[] = ['workflow_dispatch', 'push', 'schedule'];
/** Days an owed workflow may wait before the check prints it as overdue. */
export const OVERDUE_DAYS = 3;
/** Days of installer commits the check reads (was 3: an unrecorded workflow left the window silently). */
export const WINDOW_DAYS = 14;

/**
 * The trigger names under the file's `on:` (comments ignored): a scalar (`on: push`), a flow list
 * (`on: [push, pull_request]`), a block list or a mapping (`on:\n  pull_request:\n    branches: …`).
 */
export function triggerEvents(yaml: string): string[] {
  const lines = yaml.split('\n').map((l) => l.replace(/#.*$/, '').trimEnd());
  const start = lines.findIndex((l) => /^(on|"on"|'on'):/.test(l));
  if (start < 0) return [];
  const head = lines[start]!.replace(/^(on|"on"|'on'):\s*/, '');
  if (head.startsWith('[')) {
    return head
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0);
  }
  if (head.length > 0) return [head.trim()];
  const events: string[] = [];
  let indent: number | undefined;
  for (const line of lines.slice(start + 1)) {
    if (line.trim().length === 0) continue;
    const lead = line.length - line.trimStart().length;
    if (lead === 0) break;
    if (indent === undefined) indent = lead;
    if (lead !== indent) continue;
    const m = /^\s*(?:-\s*)?([\w.-]+)\s*:?\s*$/.exec(line);
    if (m) events.push(m[1]!);
  }
  return events;
}

/** The events an event-only workflow waits for, joined; undefined when a routine can raise one of its triggers. */
export function waitsFor(yaml: string): string | undefined {
  const events = triggerEvents(yaml);
  if (events.length === 0 || events.some((e) => ROUTINE_TRIGGERS.includes(e))) return undefined;
  return events.join(', ');
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

/** The file name without its `.yml` / `.yaml` suffix — the bare name a slot may stamp instead. */
export function workflowStem(name: string): string {
  return name.replace(/\.ya?ml$/, '');
}

/**
 * The `<name> first run: <result>` lines of RUNS.md, with stamp and result. The name counts with
 * or without its `.yml` (2026-11-05, foundry `first-runs-bare-workflow-name`: the 18:32 slot wrote
 * `epubcheck first run: success` and the next slot, told `no line`, re-read and re-stamped it).
 */
function firstRunLines(runs: string, name: string): { stamp: string; result: string }[] {
  const out: { stamp: string; result: string }[] = [];
  const markers = [...new Set([name, workflowStem(name)])].map((n) => `| ${n} first run: `);
  for (const line of runs.split('\n')) {
    const m = /^- (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) \| [^|]+ /.exec(line);
    if (!m) continue;
    for (const marker of markers) {
      const at = line.indexOf(marker);
      if (at < 0) continue;
      out.push({ stamp: m[1]!, result: line.slice(at + marker.length).trim() });
      break;
    }
  }
  return out;
}

/** The workflows whose first run after their latest installer commit is not yet recorded. */
export function owedFirstRuns(
  installers: Installer[],
  runs: string,
  dispatchable: (name: string) => boolean,
  events: (name: string) => string | undefined = () => undefined,
  now: Date = new Date(),
): Owed[] {
  const owed: Owed[] = [];
  const overdueBefore = new Date(now.getTime() - OVERDUE_DAYS * 86_400_000)
    .toISOString()
    .slice(0, 16)
    .replace('T', ' ');
  for (const [name, installedAt] of [...latestInstalls(installers)].sort()) {
    const lines = firstRunLines(runs, name).filter((l) => l.stamp > installedAt);
    if (lines.some((l) => /^(success|failure|waits for)\b/i.test(l.result))) continue;
    const note = lines.at(-1)?.result;
    const waits = events(name);
    owed.push({
      name,
      installedAt,
      dispatchable: dispatchable(name),
      ...(note === undefined ? {} : { note }),
      ...(waits === undefined ? {} : { waitsFor: waits }),
      overdue: installedAt < overdueBefore,
    });
  }
  return owed;
}

export function formatOwed(o: Owed): string {
  const how =
    o.waitsFor !== undefined
      ? `waits for ${o.waitsFor} — write "${o.name} first run: waits for ${o.waitsFor}" and let the triage record the run`
      : NEVER_DISPATCH.includes(o.name)
        ? 'never dispatched (publishes or spends), read only'
        : o.dispatchable
          ? 'dispatchable'
          : 'not dispatchable, read only';
  const age = o.overdue ? `overdue (installed over ${OVERDUE_DAYS} days ago), ` : '';
  return `${o.name}: ${age}installer ${o.installedAt} UTC, ${how}, ${o.note === undefined ? 'no line' : `last note "${o.note}"`}`;
}

function main(): void {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const log = execFileSync(
    'git',
    ['log', `--since=${WINDOW_DAYS} days ago`, '--format=%cI|%s', '--grep=^ci: install workflow'],
    { cwd: root, encoding: 'utf8' },
  );
  const runs = readFileSync(path.join(root, 'docs/RUNS.md'), 'utf8');
  const read = (name: string): string | undefined => {
    const file = path.join(root, '.github/workflows', name);
    return existsSync(file) ? readFileSync(file, 'utf8') : undefined;
  };
  const owed = owedFirstRuns(
    parseInstallers(log),
    runs,
    (name) => {
      const yaml = read(name);
      return yaml !== undefined && hasDispatch(yaml);
    },
    (name) => {
      const yaml = read(name);
      return yaml === undefined ? undefined : waitsFor(yaml);
    },
  );
  if (owed.length === 0) console.log('nothing owed');
  for (const o of owed) console.log(formatOwed(o));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
