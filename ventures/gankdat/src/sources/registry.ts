import { euTedSource } from './eu-ted';
import { samExclusionsSource } from './sam-exclusions';
import { ukCareLocationsSource } from './uk-care-locations';
import { ukCharitiesSource } from './uk-charities';
import { ukCompaniesSource } from './uk-companies';
import { ukFoodHygieneSource } from './uk-food-hygiene';
import { ukInsolvencySource } from './uk-insolvency';
import { ukPlanningSource } from './uk-planning';
import { ukSanctionsSource } from './uk-sanctions';
import { ukSponsorsSource } from './uk-sponsors';
import { ukTendersSource } from './uk-tenders';
import type { DataSource } from './types';

// Adding a dataset = one source file + one entry here. Nothing else.
const SOURCES: DataSource[] = [
  ukPlanningSource,
  ukTendersSource,
  ukSanctionsSource,
  euTedSource,
  samExclusionsSource,
  ukInsolvencySource,
  ukCompaniesSource,
  ukFoodHygieneSource,
  ukSponsorsSource,
  ukCharitiesSource,
  ukCareLocationsSource,
];

export const registry: ReadonlyMap<string, DataSource> = new Map(
  SOURCES.map((source) => [source.slug, source]),
);

export function getSource(slug: string): DataSource | undefined {
  return registry.get(slug);
}

export function listSources(): DataSource[] {
  return [...registry.values()];
}
