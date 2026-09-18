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
  'AtkinsonHyperlegible-Regular.ttf':
    'https://github.com/googlefonts/atkinson-hyperlegible/raw/main/fonts/ttf/AtkinsonHyperlegible-Regular.ttf',
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

function iconSvg() {
  // Bold "R" over a ruler band — legible at 16px.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="28" fill="#0F172A"/>
  <rect x="16" y="72" width="96" height="22" rx="6" fill="#FBBF24" opacity="0.9"/>
  <text x="64" y="92" font-family="Inter" font-weight="700" font-size="84" text-anchor="middle" fill="#F8FAFC">R</text>
</svg>`;
}

const INTER_BOLD =
  'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hjQ.ttf';

async function interBold() {
  await mkdir(cache, { recursive: true });
  const file = path.join(cache, 'Inter-Bold.ttf');
  try {
    await access(file);
  } catch {
    const res = await fetch(INTER_BOLD);
    if (!res.ok) throw new Error('Inter download failed');
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
  }
  return file;
}

async function icons() {
  await mkdir(path.join(dist, 'icons'), { recursive: true });
  const svg = iconSvg();
  const font = {
    fontFiles: [await interBold()],
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
}

const bundles = {
  entryPoints: {
    content: 'src/content.ts',
    background: 'src/background.ts',
    popup: 'src/popup/popup.ts',
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
