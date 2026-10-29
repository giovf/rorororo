// A workflow file GitHub cannot parse never reaches main (foundry `ci-workflow-yaml-gate`,
// 2026-10-29). On 2026-10-29 18:27–18:35 the licence Worker's first workflow (docs/ci/license-worker.yml,
// moved into place by the installer) carried a step name with an unquoted colon; GitHub refused the
// file ("No jobs were run" — an invalid file has no path filters either), so it failed on all seven
// pushes until the fix: seven failed runs, seven mails, seven watchdog lines and a scanner item,
// while `npm run check` stayed green because nothing in the repo parsed YAML. This module parses
// every docs/ci/*.yml and .github/workflows/*.yml with the `yaml` package and checks the shape
// GitHub needs (`on`, `jobs`, each job with `runs-on` or `uses`, a non-empty `steps` list whose
// steps carry `run` or `uses` and string names). `npm run ci-yaml` (part of `npm run check`) and the
// pre-push hook run it on any pushed workflow file; the root test holds the 18:27 lines as the red
// fixture. (Node runs this file directly — keep the syntax erasable.)

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument, isMap, isSeq, isScalar } from 'yaml';

export interface Problem {
  /** repo-relative workflow file */
  file: string;
  /** what GitHub would refuse, with the line when the parser names one */
  message: string;
}

/** The directories a workflow lives in: written by routines, and installed. */
export const WORKFLOW_DIRS: readonly string[] = ['docs/ci', '.github/workflows'];

const isYaml = (name: string): boolean => /\.ya?ml$/.test(name);

/** The problems of one workflow text, empty when GitHub would accept it. */
export function checkWorkflowText(text: string, file: string): Problem[] {
  const doc = parseDocument(text, { prettyErrors: true });
  const problems: Problem[] = [];
  for (const err of doc.errors) {
    // prettyErrors puts `at line L, column C` in the message's first line
    const first = err.message.split('\n')[0]!.replace(/:\s*$/, '');
    problems.push({ file, message: `${err.code}: ${first}` });
  }
  if (problems.length > 0) return problems;
  const root = doc.contents;
  if (!isMap(root)) return [{ file, message: 'the file is not a mapping' }];
  const key = (node: unknown, name: string): unknown =>
    isMap(node) ? node.get(name, true) : undefined;
  // YAML 1.2 (the `yaml` package default) reads `on` as a string key; GitHub does too.
  if (key(root, 'on') === undefined) problems.push({ file, message: 'no `on` trigger' });
  const jobs = key(root, 'jobs');
  if (!isMap(jobs) || jobs.items.length === 0) {
    problems.push({ file, message: 'no `jobs` mapping' });
    return problems;
  }
  for (const pair of jobs.items) {
    const name = isScalar(pair.key) ? String(pair.key.value) : '?';
    const job = pair.value;
    if (!isMap(job)) {
      problems.push({ file, message: `job ${name} is not a mapping` });
      continue;
    }
    if (key(job, 'uses') !== undefined) continue;
    if (key(job, 'runs-on') === undefined)
      problems.push({ file, message: `job ${name} has no runs-on (nor uses)` });
    const steps = key(job, 'steps');
    if (!isSeq(steps) || steps.items.length === 0) {
      problems.push({ file, message: `job ${name} has no steps` });
      continue;
    }
    steps.items.forEach((step, i) => {
      if (!isMap(step)) {
        problems.push({ file, message: `job ${name} step ${i + 1} is not a mapping` });
        return;
      }
      const stepName = key(step, 'name');
      if (stepName !== undefined && !(isScalar(stepName) && typeof stepName.value === 'string'))
        problems.push({ file, message: `job ${name} step ${i + 1}: name is not a string` });
      if (key(step, 'run') === undefined && key(step, 'uses') === undefined)
        problems.push({ file, message: `job ${name} step ${i + 1} has neither run nor uses` });
    });
  }
  return problems;
}

/** Every workflow file under WORKFLOW_DIRS, repo-relative, sorted. */
export function workflowFiles(root: string): string[] {
  const out: string[] = [];
  for (const dir of WORKFLOW_DIRS) {
    const abs = path.join(root, dir);
    if (!existsSync(abs)) continue;
    for (const name of readdirSync(abs)) if (isYaml(name)) out.push(path.posix.join(dir, name));
  }
  return out.sort();
}

/** The problems of every workflow file in the repo. */
export function checkWorkflowFiles(root: string): { files: string[]; problems: Problem[] } {
  const files = workflowFiles(root);
  const problems: Problem[] = [];
  for (const file of files)
    problems.push(...checkWorkflowText(readFileSync(path.join(root, file), 'utf8'), file));
  return { files, problems };
}

export function formatProblems(problems: Problem[]): string {
  return problems.map((p) => `  ${p.file}: ${p.message}`).join('\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const { files, problems } = checkWorkflowFiles(root);
  if (problems.length > 0) {
    console.error(`ci-yaml: ${problems.length} problem(s) GitHub would refuse:`);
    console.error(formatProblems(problems));
    console.error(
      'Fix the file in docs/ci/ (quote a value that holds `: ` or `#`); see docs/ci/README.md.',
    );
    process.exit(1);
  }
  console.log(`ci-yaml: ok (${files.length} workflow files parse with the shape GitHub needs)`);
}
