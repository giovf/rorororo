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

function iconSvg() {
  // Three "lines of text": the start of each word bright (fixation), the rest dim; a warm
  // ruler band behind the middle line. Pure shapes, so it is crisp at 16px.
  const line = (y, words) =>
    words
      .map(
        ([x, w, head]) =>
          `<rect x="${x}" y="${y}" width="${w}" height="12" rx="6" fill="#64748B"/>` +
          `<rect x="${x}" y="${y}" width="${head}" height="12" rx="6" fill="#F8FAFC"/>`,
      )
      .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1E293B"/><stop offset="1" stop-color="#0F172A"/></linearGradient></defs>
  <rect width="128" height="128" rx="28" fill="url(#g)"/>
  <rect x="14" y="52" width="100" height="26" rx="8" fill="#FBBF24" opacity="0.85"/>
  ${line(28, [
    [22, 34, 16],
    [62, 44, 20],
  ])}
  ${line(59, [
    [22, 26, 12],
    [54, 52, 24],
  ])}
  ${line(90, [
    [22, 48, 22],
    [76, 30, 14],
  ])}
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
