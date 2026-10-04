import type { NumberField } from './numbers.js';

/**
 * Pure model of "relink to library variables by name": layers in a file are bound
 * to local variables (a copied collection, a detached file) or to library variables
 * whose library has since been unpublished or replaced. When a library enabled for
 * the file publishes a variable with the same name and type, the binding can move
 * onto it. Everything Figma-specific stays in figma/relink.ts.
 */
export interface LibraryVariableRef {
  /** Figma's publish key — the handle `importVariableByKeyAsync` takes. */
  key: string;
  name: string;
  /** Figma's resolved type name ('COLOR', 'FLOAT', …); a relink never changes type. */
  type: string;
  collectionKey: string;
  collectionName: string;
  libraryName: string;
}

/** A bound-variable reference found on a layer. */
export interface BoundSite {
  nodeId: string;
  nodeName: string;
  target: { kind: 'paint'; property: 'fills' | 'strokes'; index: number } | { kind: 'field'; field: NumberField };
  variableId: string;
}

/** What the file still knows about a variable a layer points at. */
export interface ReferencedVariable {
  id: string;
  name: string;
  type: string;
  /** True for a variable that came from a library (even one no longer available). */
  remote: boolean;
  /** Publish key; equal to a library variable's key when the binding is already current. */
  key: string;
}

export type RelinkReason = 'local' | 'stale-library';

export interface RelinkGroup {
  library: LibraryVariableRef;
  /** The variables currently bound that this library variable replaces. */
  from: { id: string; name: string; reason: RelinkReason }[];
  sites: BoundSite[];
}

export interface RelinkPlan {
  /** One group per library variable, most sites first. */
  groups: RelinkGroup[];
  /** Local or stale variables with no library variable of the same name and type. */
  unmatched: { variable: ReferencedVariable; sites: number }[];
  /** The same name and type is published by more than one enabled library. */
  ambiguous: { variable: ReferencedVariable; candidates: LibraryVariableRef[]; sites: number }[];
  /** Sites whose variable the file no longer knows at all — no name, nothing to match. */
  orphaned: number;
  /** Sites already bound to an available library variable — left alone. */
  current: number;
}

export interface RelinkOptions {
  /** Only consider library variables from these collections (keys); every collection when omitted. */
  collectionKeys?: Set<string>;
}

const nameKey = (name: string, type: string): string => `${type}|${name.trim()}`;

export function planRelink(
  sites: BoundSite[],
  known: ReferencedVariable[],
  library: LibraryVariableRef[],
  options: RelinkOptions = {},
): RelinkPlan {
  const candidates = options.collectionKeys ? library.filter((v) => options.collectionKeys?.has(v.collectionKey)) : library;
  const availableKeys = new Set(library.map((v) => v.key));
  const byName = new Map<string, LibraryVariableRef[]>();
  for (const v of candidates) {
    const k = nameKey(v.name, v.type);
    byName.set(k, [...(byName.get(k) ?? []), v]);
  }
  const knownById = new Map(known.map((v) => [v.id, v]));

  const sitesByVariable = new Map<string, BoundSite[]>();
  for (const s of sites) sitesByVariable.set(s.variableId, [...(sitesByVariable.get(s.variableId) ?? []), s]);

  const groups = new Map<string, RelinkGroup>();
  const plan: RelinkPlan = { groups: [], unmatched: [], ambiguous: [], orphaned: 0, current: 0 };

  for (const [variableId, list] of sitesByVariable) {
    const variable = knownById.get(variableId);
    if (!variable) {
      plan.orphaned += list.length;
      continue;
    }
    if (availableKeys.has(variable.key)) {
      // Bound to a published variable the file can still reach (or this file is the library itself).
      plan.current += list.length;
      continue;
    }
    const matches = byName.get(nameKey(variable.name, variable.type)) ?? [];
    const [target] = matches;
    if (target === undefined) {
      plan.unmatched.push({ variable, sites: list.length });
      continue;
    }
    if (matches.length > 1) {
      plan.ambiguous.push({ variable, candidates: matches, sites: list.length });
      continue;
    }
    const g = groups.get(target.key) ?? { library: target, from: [], sites: [] };
    g.from.push({ id: variable.id, name: variable.name, reason: variable.remote ? 'stale-library' : 'local' });
    g.sites.push(...list);
    groups.set(target.key, g);
  }

  plan.groups = [...groups.values()].sort((a, b) => b.sites.length - a.sites.length || a.library.name.localeCompare(b.library.name));
  plan.unmatched.sort((a, b) => b.sites - a.sites || a.variable.name.localeCompare(b.variable.name));
  plan.ambiguous.sort((a, b) => b.sites - a.sites || a.variable.name.localeCompare(b.variable.name));
  return plan;
}
