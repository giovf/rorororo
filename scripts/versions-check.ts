// Monthly currency check for what Dependabot cannot see (docs/ops/VERSIONS.md; owner 2026-10-16):
// the Claude model ids the cloud routines run on, read against the public models page, and the
// Node major the workflows pin, read against the active LTS. Anything newer becomes one
// `handoff:` line in docs/ALERTS.md (the interactive session changes routine models — the
// RemoteTrigger API is reachable only there) — once per finding, never twice while it is open.
//
// Run: npm run versions   (CI: .github/workflows/versions.yml, monthly + dispatch)
// Node 22 runs .ts directly — keep syntax erasable, import only node builtins.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const VERSIONS_FILE = path.join('docs', 'ops', 'VERSIONS.md');
export const ALERTS_FILE = path.join('docs', 'ALERTS.md');
export const MODELS_URL = 'https://platform.claude.com/docs/en/about-claude/models/overview';
export const NODE_INDEX_URL = 'https://nodejs.org/dist/index.json';
const MODEL_ID = /claude-(opus|sonnet|haiku|fable)-(\d)(?:-(\d))?\b/g;

export interface ModelVersion {
  family: string;
  major: number;
  minor: number;
  id: string;
}

export function parseModelId(id: string): ModelVersion | undefined {
  const m = /^claude-(opus|sonnet|haiku|fable)-(\d)(?:-(\d))?$/.exec(id);
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

/** The `claude-…` ids pinned in VERSIONS.md's table (the Pinned column). */
export function pinnedModels(versionsMd: string): string[] {
  const ids = new Set<string>();
  for (const line of versionsMd.split('\n')) {
    if (!line.startsWith('| Claude model')) continue;
    for (const m of line.matchAll(/`(claude-[a-z]+-\d(?:-\d)?)`/g)) ids.add(m[1]!);
  }
  return [...ids];
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

/** The handoff line for the findings, or undefined when everything is current. */
export function handoffLine(
  today: string,
  models: { pinned: string; newer: string }[],
  nodePinned: number[],
  lts: number | undefined,
): string | undefined {
  const parts: string[] = [];
  if (models.length)
    parts.push(
      `routine models behind the models page: ${models.map((m) => `${m.pinned} → ${m.newer}`).join(', ')}`,
    );
  const oldNode = nodePinned.filter((n) => lts !== undefined && n < lts);
  if (oldNode.length)
    parts.push(`workflows pin Node ${oldNode.join('/')} while the active LTS is ${lts}`);
  if (!parts.length) return undefined;
  return `- ${today} handoff: versions check (docs/ops/VERSIONS.md): ${parts.join('; ')} — an attended session tests the newer ids on one routine, updates the routine configs and the register, or records why not.`;
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

async function main(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const page = await (
    await fetch(MODELS_URL, { headers: { 'user-agent': 'foundry-versions-check' } })
  ).text();
  const newest = newestPerFamily(page);
  const versionsMd = readFileSync(path.join(ROOT, VERSIONS_FILE), 'utf8');
  const models = newerModels(pinnedModels(versionsMd), newest);
  const index = (await (await fetch(NODE_INDEX_URL)).json()) as {
    version: string;
    lts: string | false;
  }[];
  const lts = activeLtsMajor(index);
  const nodePinned = pinnedNodeMajors(path.join(ROOT, '.github', 'workflows'));
  console.log(
    `versions ${today}: newest ${[...newest.values()].map((v) => v.id).join(', ')}; node LTS ${lts}, pinned ${nodePinned.join('/')}; findings ${models.length + nodePinned.filter((n) => lts !== undefined && n < lts).length}`,
  );
  const line = handoffLine(today, models, nodePinned, lts);
  if (!line) return;
  const alertsPath = path.join(ROOT, ALERTS_FILE);
  const alerts = readFileSync(alertsPath, 'utf8');
  if (alreadyOpen(alerts)) {
    console.log('handoff already open — not repeated');
    return;
  }
  writeFileSync(alertsPath, `${alerts.trimEnd()}\n${line}\n`);
  console.log(`handoff written: ${line}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e: unknown) => {
    console.error(e instanceof Error ? e.message : String(e));
    process.exitCode = 1;
  });
}
