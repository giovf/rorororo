// esbuild MV3 bundle: content/background/popup + static files + fonts + icons → dist/
import { Resvg } from '@resvg/resvg-js';
import { build, context } from 'esbuild';
import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const here = path.dirname(new URL(import.meta.url).pathname);
const dist = path.join(here, 'dist');
const watch = process.argv.includes('--watch');
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

const INTER = {
  'Inter-Regular.ttf':
    'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjQ.ttf',
  'Inter-Bold.ttf':
    'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hjQ.ttf',
};

async function interFonts() {
  await mkdir(cache, { recursive: true });
  const files = [];
  for (const [name, url] of Object.entries(INTER)) {
    const file = path.join(cache, name);
    try {
      await access(file);
    } catch {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Inter download failed: ${name}`);
      await writeFile(file, Buffer.from(await res.arrayBuffer()));
    }
    files.push(file);
  }
  return files;
}

function iconSvg() {
  // Clean white tile: bold capital A + regular lowercase a, dark ink, faint edge so it
  // stays visible on white toolbars.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect x="1" y="1" width="126" height="126" rx="26" fill="#FFFFFF" stroke="#D9D6CE" stroke-width="2"/>
  <text x="62" y="90" font-family="Inter" font-size="78" text-anchor="end" fill="#0F172A" font-weight="700">A</text>
  <text x="66" y="90" font-family="Inter" font-size="78" text-anchor="start" fill="#0F172A" font-weight="400">a</text>
</svg>`;
}

async function icons() {
  await mkdir(path.join(dist, 'icons'), { recursive: true });
  const svg = iconSvg();
  const font = {
    fontFiles: await interFonts(),
    loadSystemFonts: false,
    defaultFontFamily: 'Inter',
  };
  for (const size of [16, 32, 48, 128]) {
    const png = new Resvg(svg, { font, fitTo: { mode: 'width', value: size } }).render().asPng();
    await writeFile(path.join(dist, 'icons', `icon-${size}.png`), png);
  }
}

async function statics() {
  await mkdir(dist, { recursive: true });
  await copyFile(path.join(here, 'manifest.json'), path.join(dist, 'manifest.json'));
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
