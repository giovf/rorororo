import type { NumberField } from './numbers.js';

/**
 * Pure model of "relink variables by name", in either direction. Everything
 * Figma-specific stays in figma/relink.ts.
 *
 * - `to-library` (default): layers are bound to local variables (a copied collection, a
 *   detached file) or to library variables whose library has since been unpublished or
 *   replaced. When a library enabled for the file publishes a variable with the same name
 *   and type, the binding can move onto it.
 * - `to-local`: the reverse — a file copied out of a team, or a team leaving a shared
 *   library, wants its layers back on the local variable of the same name and type
 *   (Figma forum request 44372). Every binding to a library variable, available or not,
 *   is a candidate; bindings already on local variables are left alone.
 */
export type RelinkDirection = 'to-library' | 'to-local';

/** A variable a binding can move onto: a library variable, or (to-local) a local one. */
export interface TargetVariableRef {
  /**
   * The handle the adapter rebinds with: Figma's publish key (`importVariableByKeyAsync`)
   * for a library variable, the variable id (`getVariableByIdAsync`) for a local one.
   */
  key: string;
  name: string;
  /** Figma's resolved type name ('COLOR', 'FLOAT', …); a relink never changes type. */
  type: string;
  collectionKey: string;
  collectionName: string;
  /** The library's name, or 'This file' for a local target. */
  libraryName: string;
}

/** @deprecated name kept for the to-library callers; same shape as {@link TargetVariableRef}. */
export type LibraryVariableRef = TargetVariableRef;

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

/** Why a binding is offered: what it points at today. `library` only occurs in the to-local direction. */
export type RelinkReason = 'local' | 'stale-library' | 'library';

export interface RelinkGroup {
  /** The target variable (library variable, or local variable in the to-local direction). */
  library: TargetVariableRef;
  /** The variables currently bound that this target replaces. */
  from: { id: string; name: string; reason: RelinkReason }[];
  sites: BoundSite[];
}

export interface RelinkPlan {
  direction: RelinkDirection;
  /** One group per target variable, most sites first. */
  groups: RelinkGroup[];
  /** Variables with no target variable of the same name and type. */
  unmatched: { variable: ReferencedVariable; sites: number }[];
  /** The same name and type exists in more than one collection (two libraries, or two local collections). */
  ambiguous: { variable: ReferencedVariable; candidates: TargetVariableRef[]; sites: number }[];
  /** Sites whose variable the file no longer knows at all — no name, nothing to match. */
  orphaned: number;
  /** Sites already where the direction wants them (on an available library variable, or on a local one) — left alone. */
  current: number;
}

export interface RelinkOptions {
  /** Only consider target variables from these collections (keys); every collection when omitted. */
  collectionKeys?: Set<string>;
  /** Which way bindings move; `to-library` when omitted. */
  direction?: RelinkDirection;
}

const nameKey = (name: string, type: string): string => `${type}|${name.trim()}`;

/**
 * @param targets every variable a binding may move onto: the enabled libraries' variables
 *   (to-library) or this file's local variables (to-local).
 */
export function planRelink(
  sites: BoundSite[],
  known: ReferencedVariable[],
  targets: TargetVariableRef[],
  options: RelinkOptions = {},
): RelinkPlan {
  const direction = options.direction ?? 'to-library';
  const candidates = options.collectionKeys ? targets.filter((v) => options.collectionKeys?.has(v.collectionKey)) : targets;
  const availableKeys = new Set(targets.map((v) => v.key));
  // Already where this direction wants it: on a published variable the file can still reach
  // (or this file is the library itself), or — moving to local — on a local variable.
  const isCurrent = (v: ReferencedVariable): boolean => (direction === 'to-local' ? !v.remote : availableKeys.has(v.key));
  const reasonOf = (v: ReferencedVariable): RelinkReason => (direction === 'to-local' ? 'library' : v.remote ? 'stale-library' : 'local');
  const byName = new Map<string, LibraryVariableRef[]>();
  for (const v of candidates) {
    const k = nameKey(v.name, v.type);
    byName.set(k, [...(byName.get(k) ?? []), v]);
  }
  const knownById = new Map(known.map((v) => [v.id, v]));

  const sitesByVariable = new Map<string, BoundSite[]>();
  for (const s of sites) sitesByVariable.set(s.variableId, [...(sitesByVariable.get(s.variableId) ?? []), s]);

  const groups = new Map<string, RelinkGroup>();
  const plan: RelinkPlan = { direction, groups: [], unmatched: [], ambiguous: [], orphaned: 0, current: 0 };

  for (const [variableId, list] of sitesByVariable) {
    const variable = knownById.get(variableId);
    if (!variable) {
      plan.orphaned += list.length;
      continue;
    }
    if (isCurrent(variable)) {
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
    g.from.push({ id: variable.id, name: variable.name, reason: reasonOf(variable) });
    g.sites.push(...list);
    groups.set(target.key, g);
  }

  plan.groups = [...groups.values()].sort((a, b) => b.sites.length - a.sites.length || a.library.name.localeCompare(b.library.name));
  plan.unmatched.sort((a, b) => b.sites - a.sites || a.variable.name.localeCompare(b.variable.name));
  plan.ambiguous.sort((a, b) => b.sites - a.sites || a.variable.name.localeCompare(b.variable.name));
  return plan;
}
