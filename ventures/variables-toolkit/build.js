// esbuild: bundles the plugin main thread and inlines the UI into one HTML file.
import { build, context } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';

const watch = process.argv.includes('--watch');
const release = process.argv.includes('--release');
// --free builds the free companion plugin "Unused Variables Finder & Cleaner" (src/free/, manifest.free.json)
// into dist-free/: same hygiene module, no payments, no testing menu, so one output serves dev import and publish.
const free = process.argv.includes('--free');
// Development builds go to dist/ (root manifest.json points there, keeps the testing menu);
// release builds go to dist-release/ with a self-contained manifest and no testing commands.
const out = free ? 'dist-free' : release ? 'dist-release' : 'dist';
await mkdir(out, { recursive: true });

// Release builds ship no testing-only menu commands (demo page, simulated payments).
// The manifest written next to the bundle is self-contained (paths relative to its folder);
// the root manifest.json keeps dist/ paths so a development import works unchanged.
const manifest = {
  ...JSON.parse(await readFile(free ? 'manifest.free.json' : 'manifest.json', 'utf8')),
  main: 'code.js',
  ui: 'ui.html',
};
if (release) delete manifest.menu;
await writeFile(`${out}/manifest.json`, JSON.stringify(manifest, null, 2) + '\n');

const src = free ? 'src/free' : 'src';
const main = {
  entryPoints: [`${src}/code.ts`],
  bundle: true,
  outfile: `${out}/code.js`,
  target: 'es2020',
  format: 'iife',
  logLevel: 'info',
  define: { __DEV__: String(!release) },
};
const uiJs = {
  entryPoints: [free ? 'src/free/ui.ts' : 'src/ui/ui.ts'],
  bundle: true,
  write: false,
  target: 'es2020',
  format: 'iife',
  minify: !watch,
};

async function writeUi(js) {
  const html = await readFile(free ? 'src/free/ui.html' : 'src/ui/ui.html', 'utf8');
  const css = await readFile('src/ui/ui.css', 'utf8');
  await writeFile(`${out}/ui.html`, html.replace('/* __CSS__ */', css).replace('// __JS__', js));
}

if (watch) {
  const ctx = await context({
    ...main,
    plugins: [
      {
        name: 'ui',
        setup: (b) => b.onEnd(async () => writeUi((await build(uiJs)).outputFiles[0].text)),
      },
    ],
  });
  await ctx.watch();
} else {
  await build(main);
  await writeUi((await build(uiJs)).outputFiles[0].text);
}
