import type { NumberField } from '../core/numbers.js';
import type { BoundSite, ReferencedVariable, RelinkDirection, RelinkGroup, TargetVariableRef } from '../core/relink.js';
import { decide, type ScanOptions } from '../core/scan.js';

/** Every number field the Link tab can bind; a relink moves whatever is bound, options or not. */
const NUMBER_FIELDS: readonly NumberField[] = [
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'itemSpacing',
  'counterAxisSpacing',
  'topLeftRadius',
  'topRightRadius',
  'bottomLeftRadius',
  'bottomRightRadius',
  'width',
  'height',
];

const RELINK_SCAN: ScanOptions = { includeHidden: true, skipInstances: false, numbers: true, sizes: true };

/** The variables bindings may move onto, grouped by collection — library or local depending on the direction. */
export interface LibraryVariables {
  vars: TargetVariableRef[];
  collections: { key: string; name: string; libraryName: string }[];
}

/** What the UI shows as the library name of a local target. */
export const THIS_FILE = 'This file';

/** Reads every variable published by the libraries enabled for this file (needs the `teamlibrary` permission). */
export async function loadLibraryVariables(): Promise<LibraryVariables> {
  const collections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
  const vars: TargetVariableRef[] = [];
  for (const c of collections) {
    const list = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(c.key);
    for (const v of list) {
      vars.push({ key: v.key, name: v.name, type: v.resolvedType, collectionKey: c.key, collectionName: c.name, libraryName: c.libraryName });
    }
  }
  return { vars, collections: collections.map((c) => ({ key: c.key, name: c.name, libraryName: c.libraryName })) };
}

/**
 * Reads this file's own variables as relink targets (the to-local direction): the key is
 * the variable id, the collection key its collection id, so no publish is needed.
 */
export async function loadLocalVariables(): Promise<LibraryVariables> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const byId = new Map(collections.map((c) => [c.id, c]));
  const vars: TargetVariableRef[] = [];
  for (const v of await figma.variables.getLocalVariablesAsync()) {
    const c = byId.get(v.variableCollectionId);
    if (!c) continue;
    vars.push({ key: v.id, name: v.name, type: v.resolvedType, collectionKey: c.id, collectionName: c.name, libraryName: THIS_FILE });
  }
  return { vars, collections: collections.map((c) => ({ key: c.id, name: c.name, libraryName: THIS_FILE })) };
}

/** Loads whichever catalogue the direction moves bindings onto. */
export function loadTargets(direction: RelinkDirection): Promise<LibraryVariables> {
  return direction === 'to-local' ? loadLocalVariables() : loadLibraryVariables();
}

type BoundMap = Record<string, VariableAlias | VariableAlias[] | undefined>;

function collectSites(node: SceneNode, out: BoundSite[]): void {
  for (const property of ['fills', 'strokes'] as const) {
    if (!(property in node)) continue;
    const paints: readonly Paint[] | PluginAPI['mixed'] = (node as GeometryMixin)[property];
    if (typeof paints === 'symbol') continue; // figma.mixed
    paints.forEach((paint, index) => {
      if (paint.type !== 'SOLID') return;
      const id = paint.boundVariables?.color?.id;
      if (id !== undefined) out.push({ nodeId: node.id, nodeName: node.name, target: { kind: 'paint', property, index }, variableId: id });
    });
  }
  const bound = node.boundVariables as BoundMap | undefined;
  if (!bound) return;
  for (const field of NUMBER_FIELDS) {
    const alias = bound[field];
    if (alias && !Array.isArray(alias)) out.push({ nodeId: node.id, nodeName: node.name, target: { kind: 'field', field }, variableId: alias.id });
  }
}

export interface BoundScan {
  sites: BoundSite[];
  visited: number;
}

/** Chunked traversal (same shape as scanNodes) collecting every bound colour and number reference. */
export async function collectBoundSites(
  roots: readonly SceneNode[],
  onProgress: (visited: number, pending: number) => void,
  isCancelled: () => boolean,
  chunk = 250,
): Promise<BoundScan | null> {
  const stack: SceneNode[] = [...roots];
  const result: BoundScan = { sites: [], visited: 0 };
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node) break;
    if (decide(node, RELINK_SCAN) === 'skip-subtree') continue;
    collectSites(node, result.sites);
    if ('children' in node) for (const child of node.children) stack.push(child);
    result.visited++;
    if (result.visited % chunk === 0) {
      onProgress(result.visited, stack.length);
      await new Promise((r) => setTimeout(r, 0));
      if (isCancelled()) return null;
    }
  }
  return result;
}

/** Looks each referenced variable up once; ids Figma no longer knows are left out (orphaned). */
export async function describeVariables(ids: Iterable<string>): Promise<ReferencedVariable[]> {
  const out: ReferencedVariable[] = [];
  for (const id of new Set(ids)) {
    const v = await figma.variables.getVariableByIdAsync(id);
    if (v) out.push({ id: v.id, name: v.name, type: v.resolvedType, remote: v.remote, key: v.key });
  }
  return out;
}

/**
 * Resolves the group's target (importing the library variable, or looking the local one up)
 * and rebinds the group's sites to it, stopping when `budget` runs out. Returns how many
 * bindings moved; 0 when the local target has been deleted since the scan.
 */
export async function relinkGroup(group: RelinkGroup, budget: number, direction: RelinkDirection = 'to-library'): Promise<number> {
  if (budget <= 0) return 0;
  const variable =
    direction === 'to-local' ? await figma.variables.getVariableByIdAsync(group.library.key) : await figma.variables.importVariableByKeyAsync(group.library.key);
  if (!variable) return 0;
  let count = 0;
  for (const site of group.sites) {
    if (count >= budget) break;
    const node = await figma.getNodeByIdAsync(site.nodeId);
    if (!node || node.removed) continue;
    if (site.target.kind === 'paint') {
      const geometry = node as SceneNode & GeometryMixin;
      const current = geometry[site.target.property];
      if (typeof current === 'symbol') continue;
      const paints = [...current];
      const paint = paints[site.target.index];
      if (!paint || paint.type !== 'SOLID') continue;
      paints[site.target.index] = figma.variables.setBoundVariableForPaint(paint, 'color', variable);
      geometry[site.target.property] = paints;
    } else {
      if (!('setBoundVariable' in node)) continue;
      node.setBoundVariable(site.target.field, variable);
    }
    count++;
  }
  return count;
}
