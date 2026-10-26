// The Kindle cover: a 1600 × 2560 (1:1.6, KDP's recommended size) SVG rendered to PNG with
// @resvg/resvg-js and the sandbox's fonts, then encoded as JPEG with sharp (KDP's cover uploader
// takes JPEG or TIFF). The SVG is written next to the images so it can be edited by hand.
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { RATES_2026_27 as R } from '../rates.ts';
import { BOOK } from './content.ts';

export const COVER_W = 1600;
export const COVER_H = 2560;
const NAVY = '#1F3A5F';
const PALE = '#F4F7FB';
const GREEN = '#2E7D4F';
const INK = '#1A1A1A';
const MUTED = '#5A6675';
const FONT = 'DejaVu Sans, Liberation Sans, Arial, sans-serif';

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function text(x: number, y: number, s: string, size: number, opts: { fill?: string; weight?: string; anchor?: string } = {}): string {
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${opts.fill ?? INK}" font-weight="${opts.weight ?? 'normal'}" text-anchor="${opts.anchor ?? 'start'}">${esc(s)}</text>`;
}

export function coverSvg(): string {
  const bullets = [
    'Registering, records and the cash basis',
    'Expenses, mileage and working from home',
    `The ${R.taxYear} rates, bands and thresholds`,
    'Income Tax, Class 4 NI, payments on account',
    'Making Tax Digital quarterly updates',
    'Four worked examples, every figure shown',
  ];
  const mid = COVER_W / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${COVER_W}" height="${COVER_H}" viewBox="0 0 ${COVER_W} ${COVER_H}" font-family="${FONT}">
<rect width="${COVER_W}" height="${COVER_H}" fill="${NAVY}"/>
<rect x="0" y="0" width="${COVER_W}" height="1180" fill="${NAVY}"/>
${text(mid, 280, 'UK SOLE TRADER', 150, { weight: 'bold', fill: '#FFFFFF', anchor: 'middle' })}
${text(mid, 560, 'TAX', 300, { weight: 'bold', fill: '#FFFFFF', anchor: 'middle' })}
${text(mid, 800, R.taxYear, 230, { weight: 'bold', fill: '#F2C14E', anchor: 'middle' })}
<line x1="200" y1="870" x2="${COVER_W - 200}" y2="870" stroke="#F2C14E" stroke-width="6"/>
${text(mid, 960, 'Self Assessment, Making Tax Digital', 72, { fill: '#FFFFFF', anchor: 'middle' })}
${text(mid, 1050, 'and the numbers', 72, { fill: '#FFFFFF', anchor: 'middle' })}
${text(mid, 1160, 'A plain guide for the self-employed', 56, { fill: '#C9D6E8', anchor: 'middle' })}
<rect x="120" y="1260" width="${COVER_W - 240}" height="1040" rx="40" fill="${PALE}"/>
${bullets.map((b, i) => `<circle cx="220" cy="${1380 + i * 150}" r="22" fill="${GREEN}"/>${text(290, 1398 + i * 150, b, 52)}`).join('\n')}
${text(mid, 2440, BOOK.author, 60, { fill: '#C9D6E8', anchor: 'middle' })}
${text(mid, 2510, 'Rates from gov.uk, read October 2026', 40, { fill: MUTED, anchor: 'middle' })}
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
