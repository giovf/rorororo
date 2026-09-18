// Renders the Community listing assets (icon 128, cover 1920×960) from inline SVG.
// Run: node assets/build-assets.js   (from the venture folder). Output: assets/out/
import { Resvg } from '@resvg/resvg-js';
import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const here = path.dirname(new URL(import.meta.url).pathname);
const out = path.join(here, 'out');
const fontDir = path.join(here, '..', '..', '..', 'node_modules', '.cache', 'fonts');
const FONTS = {
  'Inter-Regular.ttf':
    'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjQ.ttf',
  'Inter-SemiBold.ttf':
    'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYAZ9hjQ.ttf',
  'Inter-Bold.ttf':
    'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hjQ.ttf',
};

async function ensureFonts() {
  await mkdir(fontDir, { recursive: true });
  const files = [];
  for (const [name, url] of Object.entries(FONTS)) {
    const file = path.join(fontDir, name);
    try {
      await access(file);
    } catch {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`font download failed: ${url}`);
      await writeFile(file, Buffer.from(await res.arrayBuffer()));
    }
    files.push(file);
  }
  return files;
}

const NAVY = '#0F172A';
const BLUE = '#3B82F6';
const CHIP = '#1E293B';
const TEXT = '#E2E8F0';
const MUTED = '#94A3B8';
const GREEN = '#34D399';

function iconSvg(size) {
  const r = size * 0.22;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="${(r / size) * 128}" fill="${NAVY}"/>
  <!-- two variable chips joined by a link -->
  <rect x="18" y="38" width="44" height="24" rx="12" fill="${BLUE}"/>
  <rect x="66" y="66" width="44" height="24" rx="12" fill="${GREEN}"/>
  <path d="M52 50 C 78 50, 50 78, 76 78" fill="none" stroke="${TEXT}" stroke-width="7" stroke-linecap="round"/>
  <circle cx="30" cy="50" r="5" fill="${NAVY}"/>
  <circle cx="98" cy="78" r="5" fill="${NAVY}"/>
</svg>`;
}

const arrow = (x, y) =>
  `<path d="M${x} ${y} h30 m-8 -8 l8 8 l-8 8" fill="none" stroke="${MUTED}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;

function coverSvg() {
  const chip = (x, y, label, color) =>
    `<rect x="${x}" y="${y}" width="${label.length * 13 + 34}" height="34" rx="17" fill="${color}"/>
     <circle cx="${x + 17}" cy="${y + 17}" r="6" fill="${NAVY}"/>
     <text x="${x + 30}" y="${y + 23}" font-family="Inter" font-weight="600" font-size="18" fill="${NAVY}">${label}</text>`;
  const row = (y, name, raw, chipLabel, chipColor) =>
    `<text x="1040" y="${y + 23}" font-family="Inter" font-size="20" fill="${MUTED}">${name}</text>
     <rect x="1200" y="${y}" width="150" height="34" rx="8" fill="${CHIP}"/>
     <text x="1216" y="${y + 23}" font-family="Inter" font-size="20" fill="${TEXT}">${raw}</text>
     ${arrow(1378, y + 17)}
     ${chip(1440, y, chipLabel, chipColor)}`;
  const rows = [
    ['Fill', '#3B82F6', 'color/brand/primary', BLUE],
    ['Stroke', '#CBD5E1', 'color/border/subtle', BLUE],
    ['Padding', '16', 'space/4', GREEN],
    ['Gap', '8', 'space/2', GREEN],
    ['Radius', '12', 'radius/lg', GREEN],
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="960" viewBox="0 0 1920 960">
  <rect width="1920" height="960" fill="${NAVY}"/>
  <g transform="translate(160 260)">
    <text font-family="Inter" font-weight="700" font-size="72" fill="${TEXT}">
      <tspan x="0" y="0">Raw values to variables,</tspan>
      <tspan x="0" y="88">in one click.</tspan>
    </text>
    <text font-family="Inter" font-size="30" fill="${MUTED}">
      <tspan x="0" y="170">Link colours and numbers to the variables</tspan>
      <tspan x="0" y="214">you already have. Convert styles. Clean up</tspan>
      <tspan x="0" y="258">collections. Runs entirely in your file.</tspan>
    </text>
    <g transform="translate(0 330)">
      ${chip(0, 0, 'Link', BLUE)}${chip(110, 0, 'Styles to Variables', GREEN)}${chip(392, 0, 'Clean up', '#FBBF24')}
    </g>
  </g>
  <rect x="1020" y="220" width="740" height="520" rx="24" fill="#111C33" stroke="#1E293B" stroke-width="2"/>
  <text x="1040" y="280" font-family="Inter" font-weight="600" font-size="22" fill="${TEXT}">Button / Primary</text>
  <text x="1040" y="312" font-family="Inter" font-size="18" fill="${MUTED}">5 values can be linked</text>
  ${rows.map((r, i) => row(350 + i * 68, ...r)).join('')}
</svg>`;
}

async function render(svg, file, fontFiles, width) {
  const png = new Resvg(svg, {
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Inter' },
    fitTo: { mode: 'width', value: width },
  })
    .render()
    .asPng();
  await writeFile(file, png);
  return png.length;
}

const fontFiles = await ensureFonts();
await mkdir(out, { recursive: true });
for (const size of [128, 512]) {
  const n = await render(iconSvg(size), path.join(out, `icon-${size}.png`), fontFiles, size);
  console.log(`icon-${size}.png ${n} bytes`);
}
console.log(
  `cover-1920x960.png ${await render(coverSvg(), path.join(out, 'cover-1920x960.png'), fontFiles, 1920)} bytes`,
);
await writeFile(path.join(out, 'icon.svg'), iconSvg(128));
await writeFile(path.join(out, 'cover.svg'), coverSvg());
process.exitCode = 0;
