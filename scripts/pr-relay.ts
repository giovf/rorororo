// PR relay: open a fork pull request on a third-party repository from a GitHub runner
// (foundry `third-party-pr-relay`, burn-down 2026-10-10).
//
// Why: every directory listing that is a PR has needed the interactive session — public-apis
// and APIs.guru (2026-09-20), awesome-remote-mcp-servers (2026-09-23), the Docker MCP Catalog
// (2026-10-10, entry built and validated, PR handed off): a cloud sandbox's GitHub token is
// scoped to this repository and CI's WORKFLOW_TOKEN is a fine-grained PAT on it too, so
// `fork` and `pulls` on another account's repository answer 403.
//
// How: a routine writes docs/relay/prs/<name>/request.json —
//   { "repo": "docker/mcp-registry", "branch": "add-gankdat", "title": "…",
//     "body_file": "ventures/gankdat/docs/docker-mcp-catalog/PR.md", "commit": "Add gankdat (remote)",
//     "files": { "servers/gankdat/server.yaml": "ventures/gankdat/docs/docker-mcp-catalog/server.yaml", … } }
// (published path in the target repository → source path in this one) and pushes it; the
// `pr relay` workflow (docs/ci/pr-relay.yml) runs this with the owner's classic PAT `PR_TOKEN`
// (`public_repo`: fine-grained tokens cannot fork another account's repository): fork, clone
// the fork, copy the files onto <branch>, push, `gh pr create`, and commit
// docs/relay/prs/<name>/result.json ({ pr, fork, branch, done_at } or { error, failed_at }).
// A request with a result.json is finished; delete the folder to run it again.
// Node 22 runs .ts directly — keep syntax erasable, import only node builtins.
import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PRS_DIR = path.join('docs', 'relay', 'prs');

export interface PrRequest {
  repo: string;
  branch: string;
  title: string;
  body: string;
  commit: string;
  /** published path in the target repository → source path in this repository */
  files: Record<string, string>;
}

const REPO_RE = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const BRANCH_RE = /^[A-Za-z0-9][A-Za-z0-9_./-]{0,99}$/;
const SAFE_PATH_RE = /^(?!\/)(?!.*(^|\/)\.\.(\/|$))[^\0]+$/;

/**
 * Validate a request.json body (`read` resolves body_file and checks the source files exist
 * under `root`). Throws a message naming the field, so a bad request fails in its result.json
 * and never half-opens a PR.
 */
export function parsePrRequest(
  raw: unknown,
  read: (sourcePath: string) => string | null,
): PrRequest {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error('request.json must be a JSON object');
  }
  const r = raw as Record<string, unknown>;
  const str = (k: string, max = 200): string => {
    const v = r[k];
    if (typeof v !== 'string' || v.trim() === '' || v.length > max) {
      throw new Error(`${k} must be a non-empty string (≤ ${max} chars)`);
    }
    return v.trim();
  };
  const repo = str('repo');
  if (!REPO_RE.test(repo)) throw new Error('repo must be owner/name');
  const branch = str('branch', 100);
  if (!BRANCH_RE.test(branch) || branch.endsWith('.lock') || branch.includes('..')) {
    throw new Error('branch must be a plain git branch name');
  }
  const title = str('title', 256);
  const commit = typeof r.commit === 'string' && r.commit.trim() ? r.commit.trim() : title;
  let body: string;
  if (typeof r.body_file === 'string') {
    if (!SAFE_PATH_RE.test(r.body_file)) throw new Error('body_file must be a relative path');
    const text = read(r.body_file);
    if (text === null) throw new Error(`body_file not found: ${r.body_file}`);
    body = text;
  } else if (typeof r.body === 'string') {
    body = r.body;
  } else {
    throw new Error('body or body_file is required');
  }
  if (typeof r.files !== 'object' || r.files === null || Array.isArray(r.files)) {
    throw new Error('files must map published path → source path');
  }
  const files: Record<string, string> = {};
  for (const [published, source] of Object.entries(r.files as Record<string, unknown>)) {
    if (!SAFE_PATH_RE.test(published) || published.startsWith('.git/')) {
      throw new Error(`files: unsafe published path ${published}`);
    }
    if (typeof source !== 'string' || !SAFE_PATH_RE.test(source)) {
      throw new Error(`files: unsafe source path for ${published}`);
    }
    if (read(source) === null) throw new Error(`files: source not found: ${source}`);
    files[published] = source;
  }
  if (Object.keys(files).length === 0) throw new Error('files must list at least one file');
  return { repo, branch, title, body, commit, files };
}

/** Request folders with a request.json and no result.json yet. */
export function pendingRequests(root: string): string[] {
  const dir = path.join(root, PRS_DIR);
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter(
      (name) =>
        existsSync(path.join(dir, name, 'request.json')) &&
        !existsSync(path.join(dir, name, 'result.json')),
    )
    .sort();
}

function sh(cmd: string, args: string[], cwd: string): string {
  return execFileSync(cmd, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  }).trim();
}

/** Fork, branch, copy, push, open (or find) the PR. Returns the PR URL. */
function openPr(
  root: string,
  name: string,
  req: PrRequest,
  token: string,
): Record<string, unknown> {
  const me = sh('gh', ['api', 'user', '--jq', '.login'], root);
  const [, repoName] = req.repo.split('/');
  // Idempotent: gh says "already exists" and exits 0 when the fork is there.
  sh('gh', ['repo', 'fork', req.repo, '--clone=false', '--default-branch-only'], root);
  const fork = `${me}/${repoName}`;
  const base = sh('gh', ['api', `repos/${req.repo}`, '--jq', '.default_branch'], root);
  const work = path.join(root, '.pr-relay', name);
  mkdirSync(path.dirname(work), { recursive: true });
  if (existsSync(work)) sh('rm', ['-rf', work], root);
  sh(
    'git',
    [
      'clone',
      '--depth',
      '1',
      '--branch',
      base,
      `https://x-access-token:${token}@github.com/${req.repo}.git`,
      work,
    ],
    root,
  );
  sh(
    'git',
    ['-C', work, 'remote', 'add', 'fork', `https://x-access-token:${token}@github.com/${fork}.git`],
    root,
  );
  sh('git', ['-C', work, 'checkout', '-B', req.branch], root);
  for (const [published, source] of Object.entries(req.files)) {
    const target = path.join(work, published);
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(path.join(root, source), target);
  }
  sh('git', ['-C', work, 'config', 'user.name', 'foundry-relay[bot]'], root);
  sh('git', ['-C', work, 'config', 'user.email', 'info@gankdat.com'], root);
  sh('git', ['-C', work, 'add', '-A'], root);
  sh('git', ['-C', work, 'commit', '--allow-empty', '-m', req.commit], root);
  sh('git', ['-C', work, 'push', '--force-with-lease', 'fork', `HEAD:${req.branch}`], root);
  const existing = sh(
    'gh',
    [
      'pr',
      'list',
      '-R',
      req.repo,
      '--head',
      `${me}:${req.branch}`,
      '--state',
      'open',
      '--json',
      'url',
      '--jq',
      '.[0].url // empty',
    ],
    root,
  );
  const pr =
    existing ||
    sh(
      'gh',
      [
        'pr',
        'create',
        '-R',
        req.repo,
        '--head',
        `${me}:${req.branch}`,
        '--base',
        base,
        '--title',
        req.title,
        '--body',
        req.body,
      ],
      root,
    );
  sh('rm', ['-rf', work], root);
  return { pr, fork, branch: req.branch, base, done_at: new Date().toISOString() };
}

function main(): void {
  const root = path.resolve(import.meta.dirname, '..');
  const token = process.env.GH_TOKEN ?? '';
  const pending = pendingRequests(root);
  if (pending.length === 0) {
    console.log('pr-relay: nothing pending');
    return;
  }
  if (!token) {
    // The owner has not stored PR_TOKEN yet (docs/for-owner/actions/021-pr-relay-token.md):
    // leave the requests pending; the next push or dispatch retries.
    console.log(
      `pr-relay: PR_TOKEN not set; ${pending.length} request(s) stay pending: ${pending.join(', ')}`,
    );
    return;
  }
  const read = (p: string): string | null =>
    existsSync(path.join(root, p)) ? readFileSync(path.join(root, p), 'utf8') : null;
  for (const name of pending) {
    const dir = path.join(root, PRS_DIR, name);
    let result: Record<string, unknown>;
    try {
      const req = parsePrRequest(
        JSON.parse(readFileSync(path.join(dir, 'request.json'), 'utf8')),
        read,
      );
      result = openPr(root, name, req, token);
      console.log(`pr-relay: ${name} → ${String(result.pr)}`);
    } catch (err) {
      result = {
        error: err instanceof Error ? err.message : String(err),
        failed_at: new Date().toISOString(),
      };
      console.log(`pr-relay: ${name} failed: ${String(result.error)}`);
    }
    writeFileSync(path.join(dir, 'result.json'), `${JSON.stringify(result, null, 2)}\n`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
