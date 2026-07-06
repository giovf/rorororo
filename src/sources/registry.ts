import { ukPlanningSource } from './uk-planning';
import { ukTendersSource } from './uk-tenders';
import type { DataSource } from './types';

// Adding a dataset = one source file + one entry here. Nothing else.
const SOURCES: DataSource[] = [ukPlanningSource, ukTendersSource];

export const registry: ReadonlyMap<string, DataSource> = new Map(
  SOURCES.map((source) => [source.slug, source]),
);

export function getSource(slug: string): DataSource | undefined {
  return registry.get(slug);
}

export function listSources(): DataSource[] {
  return [...registry.values()];
}
