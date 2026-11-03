// Bundles the free estimate page's script: npm run calculator -w @foundry/tax-workbook →
// packages/landing/site/sole-trader-tax-calculator.js (committed; the landing Worker serves site/
// as static assets, so no build step runs at deploy). Re-run after any change to rates.ts, tax.ts
// or the calculator sources; calculator.test.ts fails when the committed bundle is stale.
import { build } from 'esbuild';
import path from 'node:path';

export const BUNDLE = path.resolve(import.meta.dirname, '..', '..', '..', 'packages', 'landing', 'site', 'sole-trader-tax-calculator.js');
export const ENTRY = path.resolve(import.meta.dirname, 'calculator-entry.ts');

export async function bundleCalculator(outfile = BUNDLE, write = true): Promise<string> {
  const r = await build({
    entryPoints: [ENTRY],
    bundle: true,
    minify: true,
    format: 'iife',
    target: ['es2020'],
    platform: 'browser',
    outfile,
    write,
    legalComments: 'none',
    banner: { js: `/* Foundry — free UK sole trader tax estimate ${new Date().getUTCFullYear()}; built from ventures/tax-workbook (rates from gov.uk). No tracking. */` },
  });
  return write ? outfile : (r.outputFiles?.[0]?.text ?? '');
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const out = await bundleCalculator();
  console.log(`wrote ${out}`);
}
