// Public mirror of the gankdat service (owner 2026-10-16: keep the monorepo private, surface only
// what must be public — the hackathon's code link, the MCP registry's source link, the Docker
// catalog's source link). Builds dist/mirror/ from ventures/gankdat with everything internal left
// out (strategy docs, research, task files, design, keys, build output), prepends a mirror banner
// to README.md, copies the licence, scans for secrets, and — with MIRROR_PUSH=1 — pushes the
// snapshot to github.com/giovf/gankdat as one commit per sync ("sync from rorororo@<sha>"). The
// mirror is never edited in place: the workflow overwrites it on every push touching the venture.
//
// Run: node --disable-warning=ExperimentalWarning scripts/mirror-gankdat.ts   (build only)
//      MIRROR_PUSH=1 MIRROR_TOKEN=… node --disable-warning=ExperimentalWarning scripts/mirror-gankdat.ts
// Node 22 runs .ts directly — keep syntax erasable, import only node builtins.
import { execSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'ventures', 'gankdat');
const OUT = path.join(ROOT, 'dist', 'mirror');
export const MIRROR_REPO = 'giovf/gankdat';

/** Directories (any depth) that never reach the mirror. */
export const EXCLUDE_DIRS = new Set([
  'node_modules',
  'dist',
  '.taskmaster',
  'docs',
  'design',
  '.wrangler',
  'coverage',
]);
/** File names that never reach the mirror. */
export const EXCLUDE_FILES = new Set([
  'CLAUDE.md',
  'RESEARCH.md',
  '.dev.vars',
  '.env',
  'mcp-registry-key.pem',
  'x402-test-wallet.key',
]);
export const EXCLUDE_EXT = new Set(['.pem', '.key', '.pdf', '.log']);
/** Fixture values the tests use on purpose (already public; not secrets). */
export const FIXTURES = ['whsec_testsecret'];
/** Patterns that must not appear in anything mirrored (a tripped scan aborts the sync). */
export const SECRET_PATTERNS = [
  /sk_live_[A-Za-z0-9]{8,}/,
  /whsec_[A-Za-z0-9]{8,}/,
  /re_[A-Za-z0-9]{24,}/,
  /apify_api_[A-Za-z0-9]{8,}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /AKIA[0-9A-Z]{16}/,
];

export function shouldSkip(rel: string): boolean {
  const parts = rel.split(path.sep);
  if (parts.some((p) => EXCLUDE_DIRS.has(p))) return true;
  const base = parts.at(-1) ?? '';
  return EXCLUDE_FILES.has(base) || EXCLUDE_EXT.has(path.extname(base));
}

function walk(dir: string, rel = ''): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const r = rel ? path.join(rel, name) : name;
    if (shouldSkip(r)) continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full, r));
    else out.push(r);
  }
  return out;
}

export function banner(sha: string, date: string): string {
  return `> **Public mirror.** This repository is a read-only snapshot of the gankdat service, synced
> automatically from a private monorepo (commit \`${sha.slice(0, 12)}\`, ${date}). Internal planning
> documents are not mirrored. Issues are welcome here; pull requests are read and applied upstream.
> Live service: https://gankdat.com · MCP: https://gankdat.com/mcp · docs: https://gankdat.com/docs

`;
}

/** The secret-scan findings for a set of mirrored files (empty when clean). */
export function scan(read: (rel: string) => string, files: string[]): string[] {
  const tripped: string[] = [];
  for (const rel of files) {
    let text = read(rel);
    for (const f of FIXTURES) text = text.replaceAll(f, '');
    for (const p of SECRET_PATTERNS) if (p.test(text)) tripped.push(`${rel}: ${String(p)}`);
  }
  return tripped;
}

export function build(): { files: number; sha: string; date: string } {
  rmSync(OUT, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  mkdirSync(OUT, { recursive: true });
  const files = walk(SRC);
  for (const rel of files) {
    const to = path.join(OUT, rel);
    mkdirSync(path.dirname(to), { recursive: true });
    cpSync(path.join(SRC, rel), to);
  }
  const sha = execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  const date = new Date().toISOString().slice(0, 10);
  const readme = path.join(OUT, 'README.md');
  writeFileSync(
    readme,
    banner(sha, date) + (existsSync(readme) ? readFileSync(readme, 'utf8') : '# gankdat\n'),
  );
  cpSync(path.join(ROOT, 'LICENSE'), path.join(OUT, 'LICENSE'));
  const tripped = scan((rel) => readFileSync(path.join(OUT, rel), 'utf8'), [...files, 'README.md']);
  if (tripped.length > 0) {
    rmSync(OUT, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    throw new Error(`secret scan tripped — mirror not built:\n${tripped.join('\n')}`);
  }
  return { files: files.length + 1, sha, date };
}

function push(sha: string): void {
  const token = process.env.MIRROR_TOKEN;
  if (!token) throw new Error('MIRROR_PUSH=1 needs MIRROR_TOKEN');
  const work = path.join(ROOT, 'dist', 'mirror-repo');
  rmSync(work, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  const url = `https://x-access-token:${token}@github.com/${MIRROR_REPO}.git`;
  const sh = (cmd: string, cwd = work): string =>
    execSync(cmd, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    sh(`git clone --quiet --depth 1 ${url} ${work}`, ROOT);
  } catch {
    mkdirSync(work, { recursive: true });
    sh('git init --quiet -b main');
    sh(`git remote add origin ${url}`);
  }
  for (const name of readdirSync(work))
    if (name !== '.git')
      rmSync(path.join(work, name), {
        recursive: true,
        force: true,
        maxRetries: 5,
        retryDelay: 100,
      });
  // File by file (not cpSync of the tree): the devcontainer's bind mount refused a directory copy.
  for (const rel of walk(OUT)) {
    mkdirSync(path.dirname(path.join(work, rel)), { recursive: true });
    cpSync(path.join(OUT, rel), path.join(work, rel));
  }
  sh('git add -A');
  if (sh('git status --porcelain').trim() === '') {
    console.log('mirror: no change');
    return;
  }
  sh(
    `git -c user.name=foundry-mirror[bot] -c user.email=info@gankdat.com commit --quiet -m "sync from rorororo@${sha.slice(0, 12)}"`,
  );
  sh('git push --quiet origin HEAD:main');
  console.log(`mirror: pushed sync from rorororo@${sha.slice(0, 12)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = build();
  console.log(`mirror built: ${r.files} files from ${r.sha.slice(0, 12)} → dist/mirror`);
  if (process.env.MIRROR_PUSH === '1') push(r.sha);
}
