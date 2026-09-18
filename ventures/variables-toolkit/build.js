// esbuild: bundles the plugin main thread and inlines the UI into one HTML file.
import { build, context } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';

const watch = process.argv.includes('--watch');
await mkdir('dist', { recursive: true });

const main = {
  entryPoints: ['src/code.ts'],
  bundle: true,
  outfile: 'dist/code.js',
  target: 'es2020',
  format: 'iife',
  logLevel: 'info',
};
const uiJs = {
  entryPoints: ['src/ui/ui.ts'],
  bundle: true,
  write: false,
  target: 'es2020',
  format: 'iife',
  minify: !watch,
};

async function writeUi(js) {
  const html = await readFile('src/ui/ui.html', 'utf8');
  const css = await readFile('src/ui/ui.css', 'utf8');
  await writeFile('dist/ui.html', html.replace('/* __CSS__ */', css).replace('// __JS__', js));
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
