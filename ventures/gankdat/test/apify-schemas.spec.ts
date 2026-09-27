/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { getSource, listSources } from '../src/sources/registry';

// Every Apify actor under apify/<slug>/ pushes the records the API returns for the dataset
// `<slug>` straight into its run dataset, and Apify validates each item against the actor's
// `.actor/dataset_schema.json`. A field whose JSON type there disagrees with the source's zod
// record schema fails every run (uk-planning-applications, 2026-09-25: `authority` declared
// string, served as number — three failed QA runs and a "under maintenance" flag). This test
// keeps the two in step so that mismatch cannot ship again.

interface DatasetSchema {
  fields: { properties: Record<string, { type: string | string[] }> };
  views: Record<string, { transformation: { fields: string[] } }>;
}

const actorSchemas = import.meta.glob<DatasetSchema>('../apify/*/.actor/dataset_schema.json', {
  eager: true,
  import: 'default',
});

/** Primitive JSON types (minus null) a JSON-schema property admits. */
function jsonTypes(prop: unknown): Set<string> {
  const out = new Set<string>();
  const visit = (node: unknown): void => {
    if (!node || typeof node !== 'object') return;
    const n = node as { type?: string | string[]; anyOf?: unknown[]; oneOf?: unknown[] };
    for (const t of Array.isArray(n.type) ? n.type : n.type ? [n.type] : []) out.add(t);
    for (const alt of [...(n.anyOf ?? []), ...(n.oneOf ?? [])]) visit(alt);
  };
  visit(prop);
  out.delete('null');
  return out;
}

interface InputSchema {
  properties: Record<string, { type: string }>;
}

const inputSchemas = import.meta.glob<InputSchema>('../apify/*/.actor/input_schema.json', {
  eager: true,
  import: 'default',
});

const folders = Object.keys(actorSchemas)
  .map((p) => /\.\.\/apify\/([^/]+)\//.exec(p)?.[1] ?? '')
  .filter((f) => f !== 'uk-no-website-leads'); // merged feed with its own row shape

describe('Apify actor dataset schemas match the source record schemas', () => {
  it('finds one actor folder per dataset actor', () => {
    expect(folders.length).toBeGreaterThanOrEqual(16);
  });

  for (const folder of folders) {
    it(`${folder}: every field's JSON type matches the source`, () => {
      const source = getSource(folder);
      expect(source, `apify/${folder} is not a dataset slug`).toBeDefined();
      if (!source) return;
      const actor = actorSchemas[`../apify/${folder}/.actor/dataset_schema.json`];
      const sourceJson = z.toJSONSchema(source.recordSchema, { unrepresentable: 'any' }) as {
        properties?: Record<string, unknown>;
      };
      const sourceProps = sourceJson.properties ?? {};
      const problems: string[] = [];
      for (const [field, prop] of Object.entries(actor.fields.properties)) {
        const wanted = jsonTypes(sourceProps[field]);
        if (!(field in sourceProps)) {
          problems.push(`${field}: declared by the actor but not in the record schema`);
          continue;
        }
        const declared = jsonTypes(prop);
        for (const t of wanted) {
          const ok = declared.has(t) || (t === 'integer' && declared.has('number'));
          if (!ok)
            problems.push(`${field}: source serves ${t}, actor allows ${[...declared].join('|')}`);
        }
      }
      for (const field of Object.keys(sourceProps)) {
        if (!(field in actor.fields.properties))
          problems.push(`${field}: served by the source but missing from the actor schema`);
      }
      expect(problems, problems.join('\n')).toEqual([]);
      for (const view of Object.values(actor.views)) {
        for (const field of view.transformation.fields) {
          expect(field in actor.fields.properties, `view field ${field} not in fields`).toBe(true);
        }
      }
    });
  }

  for (const folder of folders) {
    it(`${folder}: every input field is a query param of the right type`, () => {
      const source = getSource(folder);
      if (!source) return;
      const input = inputSchemas[`../apify/${folder}/.actor/input_schema.json`];
      const params =
        (
          z.toJSONSchema(source.queryParams, { unrepresentable: 'any' }) as {
            properties?: Record<string, unknown>;
          }
        ).properties ?? {};
      const problems: string[] = [];
      for (const [field, prop] of Object.entries(input.properties)) {
        if (field === 'max_results') continue;
        if (field === 'q') continue; // free text, every dataset
        if (!(field in params)) {
          problems.push(`${field}: not a query param of ${folder} (the API answers 400)`);
          continue;
        }
        const wanted = jsonTypes(params[field]);
        const declared = prop.type === 'integer' ? 'number' : prop.type;
        if (!wanted.has(declared)) {
          problems.push(
            `${field}: API takes ${[...wanted].join('|')}, actor input is ${prop.type}`,
          );
        }
      }
      expect(problems, problems.join('\n')).toEqual([]);
    });
  }

  it('lists every dataset with an actor folder (the merged lead feed aside)', () => {
    const missing = listSources()
      .map((s) => s.slug)
      .filter((slug) => !folders.includes(slug));
    expect(missing).toEqual([]);
  });
});
