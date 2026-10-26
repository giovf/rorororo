// Node-run TypeScript is gated for extensionless relative imports (foundry `node-entry-import-extensions`,
// 2026-10-26). On 2026-10-26 07:18 the gankdat Daily numbers job died with
// ERR_MODULE_NOT_FOUND src/lib/x402-sales: two metrics libs imported `./x402-sales` without an
// extension. The venture's tsconfig resolves Bundler-style (the Worker is bundled by wrangler, so
// its 335 extensionless relative imports are fine there) and vitest resolves them too, so every
// gate was green while Node 24's type stripping on the runner refused the import; the row was
// missing for a day. This module walks every `node … <file>.ts|.mjs|.js` entry point named in
// `.github/workflows/*.yml`, follows the relative imports it reaches (static and dynamic) and
// reports each specifier that carries no extension. The root test fails on one, so the pre-push
// hook sees it. Bare specifiers (packages, node: builtins) are not followed.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

export interface Violation {
  /** repo-relative file that holds the import */
  file: string;
  /** the specifier as written */
  specifier: string;
}

const ENTRY_RE =
  /\bnode\s+(?:--[\w-]+(?:=\S+)?\s+)*((?:\S|\$\{\{[^}]*\}\})+\.(?:ts|mts|mjs|js))\b/g;
const SPECIFIER_RE = /(?:\bfrom\s*|\bimport\s*\(?\s*)['"](\.{1,2}\/[^'"]+)['"]/g;
const EXTENSION_RE = /\.(?:ts|mts|cts|js|mjs|cjs|json)$/;

/** The script paths a workflow's `run:` lines hand to `node`, in order of appearance. */
export function entryPointsOf(workflowText: string): string[] {
  const out: string[] = [];
  for (const m of workflowText.matchAll(ENTRY_RE)) {
    const p = m[1]!;
    if (!out.includes(p)) out.push(p);
  }
  return out;
}

/** Relative import specifiers (`./x`, `../y`) a source file names, static or dynamic. */
export function relativeSpecifiers(source: string): string[] {
  const out: string[] = [];
  for (const m of source.matchAll(SPECIFIER_RE)) out.push(m[1]!);
  return out;
}

/** True when the specifier ends in an extension Node resolves without guessing. */
export function hasExtension(specifier: string): boolean {
  return EXTENSION_RE.test(specifier.split('?')[0]!);
}

/**
 * Expands an entry that carries a workflow expression (`scripts/demo-${{ inputs.entry }}.ts`) to the
 * files that match it; a plain entry is returned as is when it exists, else not at all.
 */
export function expandEntry(entry: string, root: string): string[] {
  if (!entry.includes('${{')) return existsSync(path.join(root, entry)) ? [entry] : [];
  const dir = path.dirname(entry);
  const base = path.basename(entry);
  const pattern = new RegExp(
    '^' +
      base
        .split(/\$\{\{[^}]*\}\}/)
        .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('.+') +
      '$',
  );
  const absDir = path.join(root, dir);
  if (!existsSync(absDir)) return [];
  return readdirSync(absDir)
    .filter((f) => pattern.test(f) && !f.endsWith('.test.ts'))
    .sort()
    .map((f) => path.join(dir, f));
}

/** The file a specifier with an extension points at (`./x.js` written for an `x.ts` source resolves to it). */
function resolveWithExtension(
  fromFile: string,
  specifier: string,
  root: string,
): string | undefined {
  const clean = specifier.split('?')[0]!;
  const abs = path.resolve(root, path.dirname(fromFile), clean);
  const candidates = [abs];
  if (/\.js$/.test(abs)) candidates.push(abs.replace(/\.js$/, '.ts'));
  if (/\.mjs$/.test(abs)) candidates.push(abs.replace(/\.mjs$/, '.mts'));
  for (const c of candidates) {
    if (existsSync(c) && statSync(c).isFile()) return path.relative(root, c);
  }
  return undefined;
}

/** Walks the relative-import graph from one entry and returns every extensionless specifier met. */
export function walkEntry(entry: string, root: string): Violation[] {
  const violations: Violation[] = [];
  const seen = new Set<string>();
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.shift()!;
    if (seen.has(file)) continue;
    seen.add(file);
    const abs = path.join(root, file);
    if (!existsSync(abs) || !statSync(abs).isFile()) continue;
    const source = readFileSync(abs, 'utf8');
    for (const specifier of relativeSpecifiers(source)) {
      if (!hasExtension(specifier)) {
        violations.push({ file, specifier });
        continue;
      }
      const next = resolveWithExtension(file, specifier, root);
      if (next !== undefined && !seen.has(next)) queue.push(next);
    }
  }
  return violations;
}

/** Every violation reachable from the Node entry points of the repo's workflows, deduplicated. */
export function checkWorkflows(root: string): Violation[] {
  const dir = path.join(root, '.github', 'workflows');
  if (!existsSync(dir)) return [];
  const entries = new Set<string>();
  for (const name of readdirSync(dir).sort()) {
    if (!/\.ya?ml$/.test(name)) continue;
    for (const e of entryPointsOf(readFileSync(path.join(dir, name), 'utf8'))) {
      for (const expanded of expandEntry(e, root)) entries.add(expanded);
    }
  }
  const out: Violation[] = [];
  const keys = new Set<string>();
  for (const entry of [...entries].sort()) {
    for (const v of walkEntry(entry, root)) {
      const key = `${v.file} ${v.specifier}`;
      if (keys.has(key)) continue;
      keys.add(key);
      out.push(v);
    }
  }
  return out;
}

/** One line per violation, the form the test prints. */
export function formatViolations(violations: Violation[]): string {
  return violations
    .map((v) => `${v.file}: import '${v.specifier}' has no extension (Node refuses it)`)
    .join('\n');
}
