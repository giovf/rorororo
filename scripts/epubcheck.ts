// `npm run epubcheck [file …]`: W3C epubcheck over the release EPUBs (foundry `runner-script-dispatch`,
// 2026-11-06). The sandbox refuses both the jar download and running a downloaded jar (two slots lost
// to it on 2026-11-05), so the command is meant for a GitHub runner — the `run script` workflow
// (`.github/workflows/run-script.yml`) dispatched with `script: epubcheck` — where curl, unzip and
// Java 21 are preinstalled. With no file argument it checks every `ventures/*/release/*.epub`; the
// report is printed as epubcheck writes it and the exit code is 1 when any file has errors.
// (Node 22 runs .ts directly — keep syntax erasable)

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const EPUBCHECK_VERSION = '5.2.1';
const RELEASE_URL = `https://github.com/w3c/epubcheck/releases/download/v${EPUBCHECK_VERSION}/epubcheck-${EPUBCHECK_VERSION}.zip`;

/** The EPUBs to check: the arguments as given, else every `ventures/<slug>/release/*.epub` under `root`. */
export function epubFiles(root: string, args: readonly string[]): string[] {
  if (args.length > 0) return [...args];
  const ventures = path.join(root, 'ventures');
  if (!existsSync(ventures)) return [];
  const out: string[] = [];
  for (const slug of readdirSync(ventures).sort()) {
    const release = path.join(ventures, slug, 'release');
    if (!existsSync(release) || !statSync(release).isDirectory()) continue;
    for (const name of readdirSync(release).sort()) {
      if (name.toLowerCase().endsWith('.epub'))
        out.push(path.join('ventures', slug, 'release', name));
    }
  }
  return out;
}

/** Downloads and unzips epubcheck into `cacheDir` once; returns the jar path. */
export function ensureJar(cacheDir: string): string {
  const jar = path.join(cacheDir, `epubcheck-${EPUBCHECK_VERSION}`, 'epubcheck.jar');
  if (existsSync(jar)) return jar;
  mkdirSync(cacheDir, { recursive: true });
  const zip = path.join(cacheDir, 'epubcheck.zip');
  execFileSync('curl', ['-sSL', '-o', zip, RELEASE_URL], { stdio: 'inherit' });
  execFileSync('unzip', ['-q', '-o', zip, '-d', cacheDir], { stdio: 'inherit' });
  if (!existsSync(jar)) throw new Error(`epubcheck.jar not found after unzip: ${jar}`);
  return jar;
}

function main(): void {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const files = epubFiles(root, process.argv.slice(2));
  if (files.length === 0) {
    console.log('epubcheck: no EPUB to check (ventures/*/release/*.epub)');
    return;
  }
  const jar = ensureJar(path.join(root, 'dist', 'epubcheck'));
  let failed = 0;
  for (const file of files) {
    console.log(`== ${file}`);
    const r = spawnSync('java', ['-jar', jar, path.resolve(root, file)], { stdio: 'inherit' });
    if (r.status !== 0) failed += 1;
  }
  console.log(`epubcheck ${EPUBCHECK_VERSION}: ${files.length} file(s), ${failed} with errors`);
  process.exitCode = failed === 0 ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
