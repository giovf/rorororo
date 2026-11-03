// SVG primitives shared by the listing-image renderers (images.ts, reseller-images.ts): a 2000 × 1500
// frame, text and a card, rendered to PNG with @resvg/resvg-js and the sandbox's system fonts.
import { Resvg } from '@resvg/resvg-js';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const W = 2000;
export const H = 1500;
export const NAVY = '#1F3A5F';
export const PALE = '#F4F7FB';
export const GREEN = '#2E7D4F';
export const AMBER = '#B8860B';
export const RED = '#A23B3B';
export const INK = '#1A1A1A';
export const MUTED = '#5A6675';
const FONT = 'DejaVu Sans, Liberation Sans, Arial, sans-serif';

export const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const gbp = (n: number): string => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function frame(body: string, bg = PALE): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}">
<rect width="${W}" height="${H}" fill="${bg}"/>
${body}
</svg>`;
}

export function text(x: number, y: number, s: string, size: number, opts: { fill?: string; weight?: string; anchor?: string } = {}): string {
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${opts.fill ?? INK}" font-weight="${opts.weight ?? 'normal'}" text-anchor="${opts.anchor ?? 'start'}">${esc(s)}</text>`;
}

export function card(x: number, y: number, w: number, h: number, titleText: string, lines: string[], accent = NAVY): string {
  const body = lines.map((l, i) => text(x + 32, y + 118 + i * 44, l, 30, { fill: MUTED })).join('\n');
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="24" fill="#FFFFFF" stroke="#D9E1EC" stroke-width="3"/>
<rect x="${x}" y="${y}" width="16" height="${h}" rx="8" fill="${accent}"/>
${text(x + 32, y + 64, titleText, 38, { weight: 'bold', fill: accent })}
${body}`;
}

/** Writes `<stem>.svg` and `<stem>.png` for each image into `out`. */
export async function renderAll(out: string, images: Array<[string, () => string]>): Promise<void> {
  await mkdir(out, { recursive: true });
  for (const [stem, make] of images) {
    const svg = make();
    await writeFile(path.join(out, `${stem}.svg`), svg);
    const png = new Resvg(svg, { font: { loadSystemFonts: true, defaultFontFamily: 'DejaVu Sans' }, fitTo: { mode: 'width', value: W } })
      .render()
      .asPng();
    await writeFile(path.join(out, `${stem}.png`), png);
    console.log(`${stem}.png ${Math.round(png.length / 1024)} KB`);
  }
}
