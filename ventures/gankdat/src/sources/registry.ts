import { euTedSource } from './eu-ted';
import { ukCompaniesSource } from './uk-companies';
import { ukInsolvencySource } from './uk-insolvency';
import { ukPlanningSource } from './uk-planning';
import { ukSanctionsSource } from './uk-sanctions';
import { ukTendersSource } from './uk-tenders';
import type { DataSource } from './types';

// Adding a dataset = one source file + one entry here. Nothing else.
// Parked 2026-09-19: sam-exclusions (src/sources/sam-exclusions.ts) — never loaded in prod because
// the SAM.gov no-role key tier (10 req/day) cannot complete the extract poll. Re-add the entry once
// a role-linked SAM key is in place (owner action 010).
const SOURCES: DataSource[] = [
  ukPlanningSource,
  ukTendersSource,
  ukSanctionsSource,
  euTedSource,
  ukInsolvencySource,
  ukCompaniesSource,
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
