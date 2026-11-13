// Daily currency check for what Dependabot cannot see (docs/ops/VERSIONS.md; owner 2026-10-16):
// the Claude model ids the cloud routines run on, read against the public models page, and the
// Node major the workflows pin, read against the active LTS.
//
// Models are data (owner 2026-11-12, foundry `routine-models-auto-update`): VERSIONS.md's
// "Model roles" table names each role's model line, its current id and its routines. A newer id on
// a role's line becomes one `handoff: models: <role>: <old> → <new>` line in docs/ALERTS.md — once
// per target id, ever — which the next build slot works (docs/routines/build.md MODELS): it probes
// the id in a child session and, on `model ok`, asks the owner to pick it on the routines page.
// A routine cannot switch a routine's model itself: `update_trigger` refuses every routine not
// created by an agent (read 2026-11-13). A model line the register has never reviewed (not a role's
// line, not on the "reviewed and not used" list) files one foundry review item, never a switch.
// Node findings stay one `handoff: versions check` line.
//
// Run: npm run versions                          the check (network; the gankdat metrics job, daily)
//      npm run versions -- pending               offline: the open model findings and what each needs
//      npm run versions -- probed <role> <id> ok|failed "<what the probe said>"
//      npm run versions -- record <role> <id>    the routines now run <id>: tables, log, finding closed
// Node 22 runs .ts directly — keep syntax erasable, import only node builtins.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serialize, type Queue, type QueueItem } from './refresh-errors-to-queue.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const VERSIONS_FILE = path.join('docs', 'ops', 'VERSIONS.md');
export const ALERTS_FILE = path.join('docs', 'ALERTS.md');
export const MODELS_URL = 'https://platform.claude.com/docs/en/about-claude/models/overview';
export const NODE_INDEX_URL = 'https://nodejs.org/dist/index.json';
export const FOUNDRY_QUEUE_FILE = path.join('docs', 'pipeline', 'queues', 'foundry.json');
// Any model line, not a fixed list: a line nobody has reviewed must be seen to be raised. One or
// two digits per part, so a date suffix (`-20251001`) is never read as a minor version.
const MODEL_ID = /\bclaude-([a-z]+)-(\d{1,2})(?!\d)(?:-(\d{1,2})(?!\d))?/g;

export interface ModelVersion {
  family: string;
  major: number;
  minor: number;
  id: string;
}

export function parseModelId(id: string): ModelVersion | undefined {
  const m = /^claude-([a-z]+)-(\d{1,2})(?:-(\d{1,2}))?$/.exec(id);
  return m ? { family: m[1]!, major: Number(m[2]), minor: Number(m[3] ?? 0), id } : undefined;
}

/** The newest version per family named anywhere in the page text (date-suffixed ids count as their base). */
export function newestPerFamily(text: string): Map<string, ModelVersion> {
  const out = new Map<string, ModelVersion>();
  for (const m of text.matchAll(MODEL_ID)) {
    const v = parseModelId(m[0])!;
    const cur = out.get(v.family);
    if (!cur || v.major > cur.major || (v.major === cur.major && v.minor > cur.minor))
      out.set(v.family, v);
  }
  return out;
}

export interface ModelRole {
  role: string;
  /** The model line the role follows: `fable`, `opus`, `sonnet`. */
  family: string;
  current: string;
  /** What the role ran before the last switch — what the owner sets back after a failed run. */
  previous: string;
  triggers: string[];
}

const ROLES_HEADING = '## Model roles';

/** The rows of VERSIONS.md's "Model roles" table. */
export function modelRoles(versionsMd: string): ModelRole[] {
  const at = versionsMd.indexOf(ROLES_HEADING);
  if (at < 0) return [];
  const out: ModelRole[] = [];
  for (const line of versionsMd.slice(at + ROLES_HEADING.length).split('\n')) {
    if (line.startsWith('## ')) break;
    const c = line.split('|').map((x) => x.trim());
    const current = /^`(claude-[a-z]+-\d{1,2}(?:-\d{1,2})?)`$/.exec(c[3] ?? '')?.[1];
    if (c.length < 7 || !c[1] || !current) continue;
    out.push({
      role: c[1],
      family: (c[2] ?? '').replaceAll('`', ''),
      current,
      previous: (c[4] ?? '').replaceAll('`', ''),
      triggers: [...(c[5] ?? '').matchAll(/trig_[A-Za-z0-9]+/g)].map((m) => m[0]),
    });
  }
  return out;
}

/** Model lines the register has looked at and does not use (`haiku`, `mythos`): never raised again. */
export function reviewedLines(versionsMd: string): string[] {
  const line = versionsMd.split('\n').find((l) => l.startsWith('Lines reviewed and not used:'));
  return line ? [...line.matchAll(/`([a-z]+)`/g)].map((m) => m[1]!) : [];
}

/** The ids the roles run on, in table order. */
export function pinnedModels(versionsMd: string): string[] {
  return [...new Set(modelRoles(versionsMd).map((r) => r.current))];
}

export function newerModels(
  pinned: string[],
  newest: Map<string, ModelVersion>,
): { pinned: string; newer: string }[] {
  const out: { pinned: string; newer: string }[] = [];
  for (const id of pinned) {
    const v = parseModelId(id);
    if (!v) continue;
    const n = newest.get(v.family);
    if (n && (n.major > v.major || (n.major === v.major && n.minor > v.minor)))
      out.push({ pinned: id, newer: n.id });
  }
  return out;
}

export interface ModelFinding {
  role: string;
  from: string;
  to: string;
  triggers: string[];
}

/** One finding per role whose line has a newer id on the page than the role runs. */
export function modelFindings(
  roles: ModelRole[],
  newest: Map<string, ModelVersion>,
): ModelFinding[] {
  return roles.flatMap((r) => {
    const n = newerModels([r.current], newest)[0];
    return n ? [{ role: r.role, from: r.current, to: n.newer, triggers: r.triggers }] : [];
  });
}

/** Model lines on the page that are neither a role's line nor reviewed: a review item, never a switch. */
export function unreviewedLines(
  newest: Map<string, ModelVersion>,
  roles: ModelRole[],
  reviewed: string[],
): ModelVersion[] {
  const known = new Set([...roles.map((r) => r.family), ...reviewed]);
  return [...newest.values()].filter((v) => !known.has(v.family));
}

const findingKey = (role: string, to: string): RegExp =>
  new RegExp(`handoff: models: ${role}: \\S+ → ${to}(?![\\d-])`);

export function modelsLine(today: string, f: ModelFinding): string {
  return `- ${today} handoff: models: ${f.role}: ${f.from} → ${f.to} (docs/ops/VERSIONS.md "Model roles", ${f.triggers.length} routine${f.triggers.length === 1 ? '' : 's'}) — the next build slot probes the new id and asks the owner to pick it on the routines page (docs/routines/build.md MODELS); a routine cannot switch a routine's model.`;
}

/** ALERTS.md with a line for every finding it has never carried (open or closed: once per target id). */
export function fileModelFindings(alertsMd: string, today: string, found: ModelFinding[]): string {
  const fresh = found.filter((f) => !findingKey(f.role, f.to).test(alertsMd));
  if (!fresh.length) return alertsMd;
  return `${alertsMd.trimEnd()}\n${fresh.map((f) => modelsLine(today, f)).join('\n')}\n`;
}

export interface PendingFinding extends ModelFinding {
  /** `ok` once a build slot's probe answered and the owner was asked; undefined before the probe. */
  probed?: string;
}

const isClosed = (line: string): boolean => /—\s*(Done|Superseded)\b/.test(line);

/** The open `handoff: models:` lines, joined with the role table. */
export function pendingFindings(alertsMd: string, roles: ModelRole[]): PendingFinding[] {
  const out: PendingFinding[] = [];
  for (const line of alertsMd.split('\n')) {
    const m = /^- \d{4}-\d{2}-\d{2} handoff: models: (.+?): (\S+) → (\S+)/.exec(line);
    if (!m || isClosed(line)) continue;
    const role = roles.find((r) => r.role === m[1]);
    if (!role) continue;
    const probed = /— probed \d{4}-\d{2}-\d{2}: (\w+)/.exec(line)?.[1];
    out.push({
      role: role.role,
      from: m[2]!,
      to: m[3]!,
      triggers: role.triggers,
      ...(probed ? { probed } : {}),
    });
  }
  return out;
}

function appendToFinding(alertsMd: string, role: string, to: string, suffix: string): string {
  const key = findingKey(role, to);
  let hit = false;
  const out = alertsMd.split('\n').map((l) => {
    if (hit || !key.test(l) || isClosed(l)) return l;
    hit = true;
    return `${l} ${suffix}`;
  });
  if (!hit) throw new Error(`no open models finding for ${role} → ${to} in ${ALERTS_FILE}`);
  return out.join('\n');
}

/** The one owner line a passed probe earns (≤ 120 chars after `owner: `; notify-owner sends it). */
export function ownerSwitchLine(today: string, f: ModelFinding): string {
  const n = f.triggers.length;
  return `- ${today} owner: New Claude model ${f.to} tested: at claude.ai/code/routines set it on the ${n} routine${n === 1 ? '' : 's'} still on ${f.from}`;
}

/**
 * A build slot probed the new id. `ok`: the finding is marked and the owner asked once. Anything
 * else: the finding closes as Superseded — that id is never proposed again, the next id is.
 */
export function markProbed(
  alertsMd: string,
  today: string,
  f: ModelFinding,
  result: string,
  note: string,
): string {
  if (result !== 'ok')
    return appendToFinding(
      alertsMd,
      f.role,
      f.to,
      `— Superseded ${today} (build): probe failed, routines stay on ${f.from}: ${note}`,
    );
  const marked = appendToFinding(
    alertsMd,
    f.role,
    f.to,
    `— probed ${today}: ok (${note}); owner asked`,
  );
  return `${marked.trimEnd()}\n${ownerSwitchLine(today, f)}\n`;
}

/** VERSIONS.md after the role's routines moved to `to`: role table, and one log line. */
export function recordSwitch(versionsMd: string, today: string, role: string, to: string): string {
  const r = modelRoles(versionsMd).find((x) => x.role === role);
  if (!r) throw new Error(`no role "${role}" in ${VERSIONS_FILE}`);
  if (r.current === to) return versionsMd;
  const lines = versionsMd.split('\n').map((l) => {
    const c = l.split('|').map((x) => x.trim());
    if (c[1] !== role || c[3] !== `\`${r.current}\``) return l;
    const cells = l.split('|');
    cells[3] = ` \`${to}\` `;
    cells[4] = ` \`${r.current}\` `;
    return cells.join('|');
  });
  const log = `- ${today} — **${r.current} → ${to}** on the ${r.triggers.length} "${role}" routine${r.triggers.length === 1 ? '' : 's'} (${r.triggers.map((t) => `\`${t}\``).join(', ')}): found by the daily check, probed by a build slot, picked by the owner on the routines page, read back with \`list_triggers\` and recorded by \`npm run versions -- record\`. A failed run of one of them after today: the owner sets it back to \`${r.current}\`.`;
  return `${lines.join('\n').trimEnd()}\n${log}\n`;
}

/** Closes the finding once the routines run the id (the owner's line, when there is one, too). */
export function closeFinding(alertsMd: string, today: string, role: string, to: string): string {
  const done = `— Done ${today} (build): the role's routines run ${to} (list_triggers); docs/ops/VERSIONS.md updated.`;
  const ownerKey = `owner: New Claude model ${to} tested`;
  return appendToFinding(alertsMd, role, to, done)
    .split('\n')
    .map((l) => (l.includes(ownerKey) && !isClosed(l) ? `${l} ${done}` : l))
    .join('\n');
}

/** Pure: one `model-line-<family>` review item per unreviewed line, never twice in any status. */
export function fileLineReviews(queue: Queue, lines: ModelVersion[], today: string): Queue {
  const items: QueueItem[] = [...queue.items];
  for (const v of lines) {
    const id = `model-line-${v.family}`;
    if (items.some((it) => it.id === id)) continue;
    items.push({
      id,
      title: `Review the Claude model line \`${v.family}\` (newest id on the models page: ${v.id}): give it a role in docs/ops/VERSIONS.md "Model roles" or add it to "Lines reviewed and not used" with the reason`,
      why: `Filed by the daily versions check (scripts/versions-check.ts) on ${today}: ${MODELS_URL} names ${v.id}, a line that is neither a role's line nor on the reviewed list. A new or limited-availability line is a decision (price, availability to this account, which routines), so it is raised here and never switched to silently (owner 2026-11-12, foundry \`routine-models-auto-update\`).`,
      effort_days: 0.1,
      proof: `docs/ops/VERSIONS.md names \`${v.family}\` in a role row or on the reviewed line, and the next daily check files nothing for it`,
      score: 5,
      status: 'todo',
      added: today,
    });
  }
  return items.length === queue.items.length ? queue : { ...queue, items, updated: today };
}

/** Node majors pinned by `node-version:` in the workflows. */
export function pinnedNodeMajors(dir: string): number[] {
  const majors = new Set<number>();
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.yml'))) {
    for (const m of readFileSync(path.join(dir, f), 'utf8').matchAll(/node-version:\s*['"]?(\d+)/g))
      majors.add(Number(m[1]));
  }
  return [...majors];
}

export function activeLtsMajor(
  index: { version: string; lts: string | false }[],
): number | undefined {
  const lts = index.find((r) => r.lts);
  return lts ? Number(lts.version.replace(/^v/, '').split('.')[0]) : undefined;
}

/** The Node handoff line, or undefined when the workflows are on the active LTS. */
export function handoffLine(
  today: string,
  nodePinned: number[],
  lts: number | undefined,
): string | undefined {
  const oldNode = nodePinned.filter((n) => lts !== undefined && n < lts);
  if (!oldNode.length) return undefined;
  return `- ${today} handoff: versions check (docs/ops/VERSIONS.md): workflows pin Node ${oldNode.join('/')} while the active LTS is ${lts} — a routine moves every workflow's \`node-version\` through docs/ci/ once the gates pass on it, or records why not.`;
}

/** True when an open (unclosed) versions-check handoff already exists. */
export function alreadyOpen(alertsMd: string): boolean {
  return alertsMd
    .split('\n')
    .some(
      (l) =>
        /^- \d{4}-\d{2}-\d{2} handoff: versions check/.test(l) &&
        !/—\s*(Done|Superseded)\b/.test(l),
    );
}

const read = (file: string): string => readFileSync(path.join(ROOT, file), 'utf8');
const write = (file: string, text: string): void => writeFileSync(path.join(ROOT, file), text);

async function check(today: string): Promise<void> {
  const page = await (
    await fetch(MODELS_URL, { headers: { 'user-agent': 'foundry-versions-check' } })
  ).text();
  const newest = newestPerFamily(page);
  const versionsMd = read(VERSIONS_FILE);
  const roles = modelRoles(versionsMd);
  // An empty page or a lost role table must not read as "everything current".
  if (!roles.length) throw new Error(`no "Model roles" rows in ${VERSIONS_FILE}`);
  if (!roles.some((r) => newest.has(r.family)))
    throw new Error(`no role's model line found on ${MODELS_URL} — layout changed or page blocked`);
  const found = modelFindings(roles, newest);
  const unreviewed = unreviewedLines(newest, roles, reviewedLines(versionsMd));
  const index = (await (await fetch(NODE_INDEX_URL)).json()) as {
    version: string;
    lts: string | false;
  }[];
  const lts = activeLtsMajor(index);
  const nodePinned = pinnedNodeMajors(path.join(ROOT, '.github', 'workflows'));
  console.log(
    `versions ${today}: newest ${[...newest.values()].map((v) => v.id).join(', ')}; node LTS ${lts}, pinned ${nodePinned.join('/')}; model findings ${found.length}, unreviewed lines ${unreviewed.length}`,
  );
  const alerts = read(ALERTS_FILE);
  let next = fileModelFindings(alerts, today, found);
  const line = handoffLine(today, nodePinned, lts);
  if (line && !alreadyOpen(next)) next = `${next.trimEnd()}\n${line}\n`;
  if (next !== alerts) {
    write(ALERTS_FILE, next);
    console.log(`written to ${ALERTS_FILE}:\n${next.slice(alerts.trimEnd().length).trim()}`);
  }
  const queue = JSON.parse(read(FOUNDRY_QUEUE_FILE)) as Queue;
  const reviewed = fileLineReviews(queue, unreviewed, today);
  if (reviewed !== queue) {
    write(FOUNDRY_QUEUE_FILE, serialize(reviewed));
    console.log(
      `review items filed: ${unreviewed.map((v) => `model-line-${v.family}`).join(', ')}`,
    );
  }
}

function pendingFor(role: string | undefined, to: string | undefined): PendingFinding {
  const f = pendingFindings(read(ALERTS_FILE), modelRoles(read(VERSIONS_FILE))).find(
    (x) => x.role === role && x.to === to,
  );
  if (!f)
    throw new Error(`no open models finding for "${role}" → ${to} (npm run versions -- pending)`);
  return f;
}

async function main(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const [cmd, role, to, result, ...note] = process.argv.slice(2);
  if (cmd === undefined) return check(today);
  if (cmd === 'pending') {
    const open = pendingFindings(read(ALERTS_FILE), modelRoles(read(VERSIONS_FILE)));
    if (!open.length) console.log('nothing pending');
    for (const f of open)
      console.log(
        `pending: role "${f.role}": ${f.from} → ${f.to}; ${f.probed ? `probed ${f.probed}, owner asked — read list_triggers, then \`record\` once every routine shows ${f.to}` : 'not probed — probe it (build.md MODELS)'}; routines ${f.triggers.join(', ')}`,
      );
    return;
  }
  if (cmd === 'probed') {
    if (result !== 'ok' && result !== 'failed')
      throw new Error('probed <role> <id> ok|failed "<note>"');
    const f = pendingFor(role, to);
    if (f.probed) throw new Error(`"${f.role}" → ${f.to} is already probed ${f.probed}`);
    write(
      ALERTS_FILE,
      markProbed(read(ALERTS_FILE), today, f, result, note.join(' ') || 'no note'),
    );
    console.log(
      result === 'ok'
        ? `owner asked in ${ALERTS_FILE}. Add to docs/RUNS.md: | notify | New Claude model ${f.to} is ready: one change per routine needed from you`
        : `finding closed: ${f.to} is not proposed again; the routines stay on ${f.from}`,
    );
    return;
  }
  if (cmd === 'record') {
    const f = pendingFor(role, to);
    write(VERSIONS_FILE, recordSwitch(read(VERSIONS_FILE), today, f.role, f.to));
    write(ALERTS_FILE, closeFinding(read(ALERTS_FILE), today, f.role, f.to));
    console.log(`recorded: "${f.role}" runs ${f.to} (was ${f.from}); finding closed`);
    return;
  }
  throw new Error(`unknown command "${cmd}" — pending | probed | record, or none for the check`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e: unknown) => {
    console.error(e instanceof Error ? e.message : String(e));
    process.exitCode = 1;
  });
}
