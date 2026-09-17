import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { defineVenture, type PricingModel, type VentureManifest } from './venture.js';

export interface PortfolioLoad {
  ventures: VentureManifest[];
  /** One line per invalid or unreadable manifest: "<path>: <reason>". */
  errors: string[];
}

/** Reads and validates every `ventures/<slug>/venture.json` under `dir`. */
export async function loadPortfolio(dir: string): Promise<PortfolioLoad> {
  const ventures: VentureManifest[] = [];
  const errors: string[] = [];
  let entries: string[];
  try {
    entries = (await readdir(dir, { withFileTypes: true }))
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
  } catch {
    return { ventures, errors };
  }
  for (const slug of entries) {
    const file = path.join(dir, slug, 'venture.json');
    let raw: string;
    try {
      raw = await readFile(file, 'utf8');
    } catch {
      continue; // a folder without a manifest is not a venture (e.g. README-only dirs)
    }
    try {
      const manifest = defineVenture(JSON.parse(raw) as VentureManifest);
      if (manifest.slug !== slug) {
        throw new Error(`slug "${manifest.slug}" does not match folder "${slug}"`);
      }
      ventures.push(manifest);
    } catch (err) {
      errors.push(`${file}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return { ventures, errors };
}

export function describePricing(pricing: PricingModel): string {
  switch (pricing.kind) {
    case 'free':
      return 'free';
    case 'one-time':
      return `$${pricing.priceUsd} once`;
    case 'subscription':
      return pricing.yearlyUsd === undefined
        ? `$${pricing.monthlyUsd}/mo`
        : `$${pricing.monthlyUsd}/mo · $${pricing.yearlyUsd}/yr`;
  }
}

/** Plain-text table of the portfolio, one venture per line. */
export function formatPortfolio(ventures: VentureManifest[]): string {
  if (ventures.length === 0) return '(no ventures yet)';
  const rows = ventures.map((v) => [v.slug, v.channel, v.status, describePricing(v.pricing)]);
  const widths = [0, 1, 2, 3].map((i) => Math.max(...rows.map((r) => r[i]?.length ?? 0)));
  return rows
    .map((r) => r.map((cell, i) => cell.padEnd(widths[i] ?? 0)).join('  '))
    .join('\n');
}
