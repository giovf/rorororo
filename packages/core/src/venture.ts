/**
 * A venture is one product in the Foundry portfolio. Every venture ships a
 * `venture.json` matching this shape so tooling and reports can treat all
 * products uniformly regardless of channel.
 */
export type Channel =
  | 'chrome-web-store'
  | 'figma-community'
  | 'vscode-marketplace'
  | 'web'
  | 'api-marketplace';

export type VentureStatus =
  | 'idea' // named, not yet validated
  | 'validated' // demand evidence recorded, build approved
  | 'building'
  | 'launched' // live in its channel
  | 'earning' // ≥1 paid sale
  | 'killed'; // retired; keep the record

export type PricingModel =
  | { kind: 'one-time'; priceUsd: number }
  | { kind: 'subscription'; monthlyUsd: number; yearlyUsd?: number }
  | { kind: 'free' };

export interface VentureManifest {
  /** Kebab-case slug, also the folder name under `ventures/`. */
  slug: string;
  name: string;
  channel: Channel;
  status: VentureStatus;
  pricing: PricingModel;
  /** One sentence: who pays, for what pain. */
  thesis: string;
  /** ISO date the status last changed. */
  statusChangedOn: string;
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates a venture manifest and returns it typed. Throws with a
 * human-readable message on the first problem found.
 */
export function defineVenture(input: VentureManifest): VentureManifest {
  if (!SLUG.test(input.slug)) {
    throw new Error(`venture slug "${input.slug}" must be kebab-case`);
  }
  if (input.name.trim().length === 0) {
    throw new Error(`venture "${input.slug}" needs a name`);
  }
  if (input.thesis.trim().length === 0) {
    throw new Error(`venture "${input.slug}" needs a thesis`);
  }
  if (!ISO_DATE.test(input.statusChangedOn)) {
    throw new Error(`venture "${input.slug}" statusChangedOn must be YYYY-MM-DD`);
  }
  const price =
    input.pricing.kind === 'one-time'
      ? input.pricing.priceUsd
      : input.pricing.kind === 'subscription'
        ? input.pricing.monthlyUsd
        : 0;
  if (price < 0 || !Number.isFinite(price)) {
    throw new Error(`venture "${input.slug}" has an invalid price`);
  }
  return input;
}
