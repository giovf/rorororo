// esbuild MV3 bundle for Highlight Keep → dist/ (dev), dist-test/ (--test), dist-firefox/ (--firefox)
import { Resvg } from '@resvg/resvg-js';
import { build, context } from 'esbuild';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const here = path.dirname(new URL(import.meta.url).pathname);
const watch = process.argv.includes('--watch');
const test = process.argv.includes('--test');
const firefox = process.argv.includes('--firefox');
const dist = path.join(here, test ? 'dist-test' : firefox ? 'dist-firefox' : 'dist');

function iconSvg() {
  // White tile; a yellow highlighter stroke behind lines of "text".
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect x="1" y="1" width="126" height="126" rx="26" fill="#FFFFFF" stroke="#D9D6CE" stroke-width="2"/>
  <rect x="18" y="38" width="92" height="26" rx="6" fill="#FDE047"/>
  <rect x="24" y="47" width="60" height="9" rx="4.5" fill="#1F2937"/>
  <rect x="24" y="78" width="80" height="9" rx="4.5" fill="#94A3B8"/>
  <rect x="24" y="97" width="48" height="9" rx="4.5" fill="#94A3B8"/>
</svg>`;
}

async function icons() {
  await mkdir(path.join(dist, 'icons'), { recursive: true });
  for (const size of [16, 32, 48, 128]) {
    const png = new Resvg(iconSvg(), {
      font: { loadSystemFonts: false },
      fitTo: { mode: 'width', value: size },
    })
      .render()
      .asPng();
    await writeFile(path.join(dist, 'icons', `icon-${size}.png`), png);
  }
}

async function statics() {
  await mkdir(dist, { recursive: true });
  const manifest = JSON.parse(await readFile(path.join(here, 'manifest.json'), 'utf8'));
  if (firefox) {
    manifest.name = 'Highlight Keep — Web Highlighter & Notes'; // AMO caps names at 45
    manifest.background = { scripts: ['background.js'], type: 'module' };
    manifest.browser_specific_settings = {
      gecko: {
        id: 'highlightkeep@gankdat.com',
        strict_min_version: '140.0',
        data_collection_permissions: { required: ['none'] },
      },
    };
    delete manifest.minimum_chrome_version;
  }
  if (test) {
    manifest.name = manifest.name + ' (test build)';
    manifest.host_permissions = ['http://127.0.0.1/*'];
    manifest.content_scripts = [
      {
        matches: ['http://127.0.0.1/*'],
        js: ['content.js'],
        css: ['content.css'],
        run_at: 'document_idle',
      },
    ];
  }
  await writeFile(path.join(dist, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  for (const [from, to] of [
    ['src/content.css', 'content.css'],
    ['src/popup/popup.html', 'popup.html'],
    ['src/popup/popup.css', 'popup.css'],
    ['src/library/library.html', 'library.html'],
    ['src/library/library.css', 'library.css'],
    ['src/welcome/welcome.html', 'welcome.html'],
  ])
    await copyFile(path.join(here, from), path.join(dist, to));
}

const bundles = {
  entryPoints: {
    content: 'src/content.ts',
    background: 'src/background.ts',
    popup: 'src/popup/popup.ts',
    library: 'src/library/library.ts',
    welcome: 'src/welcome/welcome.ts',
  },
  bundle: true,
  outdir: dist,
  target: 'chrome116',
  format: 'iife',
  logLevel: 'info',
  minify: !watch && !firefox, // AMO reviewers read the code; ship Firefox unminified
};

await statics();
await icons();
if (watch) {
  const ctx = await context(bundles);
  await ctx.watch();
} else {
  await build(bundles);
  console.log(`Highlight Keep built → ${path.basename(dist)}/`);
}
