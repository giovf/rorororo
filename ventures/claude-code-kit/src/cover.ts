// The cover: a 1600 × 2400 (2:3) SVG rendered to PNG with @resvg/resvg-js and the sandbox's fonts,
// then encoded as JPEG with sharp. Leanpub asks for a cover at least 1024 px wide at 2:3 (its own
// help page, read 2026-10-31); the SVG is written next to the image so it can be edited by hand.
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { BOOK } from './content.ts';

export const COVER_W = 1600;
export const COVER_H = 2400;
const INK = '#14213D';
const PALE = '#F3F5F9';
const ACCENT = '#E0A426';
const MUTED = '#8A94A6';
const FONT = 'DejaVu Sans, Liberation Sans, Arial, sans-serif';
const MONO = 'DejaVu Sans Mono, Liberation Mono, monospace';

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function text(x: number, y: number, s: string, size: number, opts: { fill?: string; weight?: string; anchor?: string; family?: string } = {}): string {
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${opts.fill ?? PALE}" font-weight="${opts.weight ?? 'normal'}" text-anchor="${opts.anchor ?? 'start'}"${opts.family ? ` font-family="${opts.family}"` : ''}>${esc(s)}</text>`;
}

export function coverSvg(): string {
  const mid = COVER_W / 2;
  const lines = [
    '17:00  burn-down   claimed tax-workbook/own-checkout',
    '17:10  build       slot started — marker pushed',
    '17:12  burn-down   npm ci · npm run check · main green',
    '17:21  burn-down   one commit, one push: item done',
    '17:40  watchdog    nothing missed, nothing stalled',
    '18:00  burn-down   next item: gankdat/x402-change-feed',
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${COVER_W}" height="${COVER_H}" viewBox="0 0 ${COVER_W} ${COVER_H}" font-family="${FONT}">
<rect width="${COVER_W}" height="${COVER_H}" fill="${INK}"/>
${text(120, 300, 'RUNNING', 170, { weight: 'bold' })}
${text(120, 480, 'CLAUDE CODE', 170, { weight: 'bold' })}
${text(120, 660, 'UNATTENDED', 170, { weight: 'bold', fill: ACCENT })}
<line x1="120" y1="740" x2="${COVER_W - 120}" y2="740" stroke="${ACCENT}" stroke-width="6"/>
${text(120, 860, 'The operations handbook of a', 64)}
${text(120, 950, 'self-running software business', 64)}
<rect x="120" y="1080" width="${COVER_W - 240}" height="760" rx="24" fill="#0B1226" stroke="#2A3A5F" stroke-width="4"/>
${lines.map((l, i) => text(170, 1190 + i * 112, l, 40, { fill: i === 3 ? ACCENT : '#C7D0E0', family: MONO })).join('\n')}
${text(120, 2010, 'Routines, queues, gates, relays and watchdogs —', 52, { fill: '#C7D0E0' })}
${text(120, 2080, 'with the incidents that shaped every rule', 52, { fill: '#C7D0E0' })}
${text(mid, 2260, BOOK.author, 56, { fill: PALE, anchor: 'middle' })}
${text(mid, 2330, 'First edition · November 2026', 40, { fill: MUTED, anchor: 'middle' })}
</svg>
`;
}

export function renderCoverPng(): Uint8Array {
  const r = new Resvg(coverSvg(), { fitTo: { mode: 'width', value: COVER_W }, font: { loadSystemFonts: true } });
  return r.render().asPng();
}

export async function renderCoverJpeg(png: Uint8Array = renderCoverPng()): Promise<Uint8Array> {
  return new Uint8Array(await sharp(Buffer.from(png)).jpeg({ quality: 90, mozjpeg: true }).toBuffer());
}
