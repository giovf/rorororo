// esbuild MV3 bundle: content/background/popup + static files + fonts + icons → dist/
import { Resvg } from '@resvg/resvg-js';
import { build, context } from 'esbuild';
import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const here = path.dirname(new URL(import.meta.url).pathname);
const dist = path.join(here, process.argv.includes('--test') ? 'dist-test' : 'dist');
const watch = process.argv.includes('--watch');
// --test: a build for automated tests that pre-grants one local origin (no permission
// prompt to click) and registers the content script for it statically.
const test = process.argv.includes('--test');
const cache = path.join(here, '..', '..', 'node_modules', '.cache', 'fonts');

const FONTS = {
  'OpenDyslexic-Regular.otf':
    'https://raw.githubusercontent.com/antijingoist/opendyslexic/master/compiled/OpenDyslexic-Regular.otf',
  'OpenDyslexic-Bold.otf':
    'https://raw.githubusercontent.com/antijingoist/opendyslexic/master/compiled/OpenDyslexic-Bold.otf',
  'AtkinsonHyperlegible-Regular.ttf':
    'https://github.com/googlefonts/atkinson-hyperlegible/raw/main/fonts/ttf/AtkinsonHyperlegible-Regular.ttf',
  'AtkinsonHyperlegible-Bold.ttf':
    'https://github.com/googlefonts/atkinson-hyperlegible/raw/main/fonts/ttf/AtkinsonHyperlegible-Bold.ttf',
};

async function fonts() {
  await mkdir(path.join(dist, 'fonts'), { recursive: true });
  await mkdir(cache, { recursive: true });
  for (const [name, url] of Object.entries(FONTS)) {
    const cached = path.join(cache, name);
    try {
      await access(cached);
    } catch {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`font download failed: ${url}`);
      await writeFile(cached, Buffer.from(await res.arrayBuffer()));
    }
    await copyFile(cached, path.join(dist, 'fonts', name));
  }
}

// Tinos: metric-compatible open twin of Times New Roman (Apache 2.0).
const ICON_FONTS = {
  'Tinos-Regular.ttf': 'https://fonts.gstatic.com/s/tinos/v26/buE4poGnedXvwjX7fmE.ttf',
  'Tinos-Bold.ttf': 'https://fonts.gstatic.com/s/tinos/v26/buE1poGnedXvwj1AW3Fu0Co.ttf',
};

async function interFonts() {
  await mkdir(cache, { recursive: true });
  const files = [];
  for (const [name, url] of Object.entries(ICON_FONTS)) {
    const file = path.join(cache, name);
    try {
      await access(file);
    } catch {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`icon font download failed: ${name}`);
      await writeFile(file, Buffer.from(await res.arrayBuffer()));
    }
    files.push(file);
  }
  return files;
}

function iconSvg({ ruler = true } = {}) {
  // White tile; "Read" / "Focus" on two lines with the first letter bold — the product's
  // own effect — and, optionally, the reading ruler as a soft band behind the second line.
  const band = ruler
    ? `<rect x="8" y="70" width="112" height="40" rx="8" fill="#FDE68A" opacity="0.9"/>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect x="1" y="1" width="126" height="126" rx="26" fill="#FFFFFF" stroke="#D9D6CE" stroke-width="2"/>
  ${band}
  <text x="64" y="58" font-family="Tinos" font-size="44" text-anchor="middle" fill="#0F172A"><tspan font-weight="700">R</tspan><tspan font-weight="400">ead</tspan></text>
  <text x="64" y="102" font-family="Tinos" font-size="44" text-anchor="middle" fill="#0F172A"><tspan font-weight="700">F</tspan><tspan font-weight="400">ocus</tspan></text>
</svg>`;
}

async function icons() {
  await mkdir(path.join(dist, 'icons'), { recursive: true });
  const svg = iconSvg();
  const font = {
    fontFiles: await interFonts(),
    loadSystemFonts: false,
    defaultFontFamily: 'Tinos',
  };
  for (const size of [16, 32, 48, 128]) {
    const png = new Resvg(svg, { font, fitTo: { mode: 'width', value: size } }).render().asPng();
    await writeFile(path.join(dist, 'icons', `icon-${size}.png`), png);
  }
}

async function statics() {
  await mkdir(dist, { recursive: true });
  const manifest = JSON.parse(await readFile(path.join(here, 'manifest.json'), 'utf8'));
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
  await copyFile(path.join(here, 'src', 'content.css'), path.join(dist, 'content.css'));
  await copyFile(path.join(here, 'src', 'popup', 'popup.html'), path.join(dist, 'popup.html'));
  await copyFile(path.join(here, 'src', 'popup', 'popup.css'), path.join(dist, 'popup.css'));
  await copyFile(
    path.join(here, 'src', 'welcome', 'welcome.html'),
    path.join(dist, 'welcome.html'),
  );
  await copyFile(path.join(here, 'src', 'welcome', 'welcome.css'), path.join(dist, 'welcome.css'));
}

const bundles = {
  entryPoints: {
    content: 'src/content.ts',
    background: 'src/background.ts',
    popup: 'src/popup/popup.ts',
    welcome: 'src/welcome/welcome.ts',
  },
  bundle: true,
  outdir: dist,
  target: 'chrome116',
  format: 'iife',
  logLevel: 'info',
  minify: !watch,
};

await statics();
await icons();
await fonts();
if (watch) {
  const ctx = await context(bundles);
  await ctx.watch();
} else {
  await build(bundles);
  const manifest = JSON.parse(await readFile(path.join(dist, 'manifest.json'), 'utf8'));
  console.log(`ReadFocus ${manifest.version} built → dist/`);
}
