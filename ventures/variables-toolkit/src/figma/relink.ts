import type { NumberField } from '../core/numbers.js';
import type { BoundSite, LibraryVariableRef, ReferencedVariable, RelinkGroup } from '../core/relink.js';
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

export interface LibraryVariables {
  vars: LibraryVariableRef[];
  collections: { key: string; name: string; libraryName: string }[];
}

/** Reads every variable published by the libraries enabled for this file (needs the `teamlibrary` permission). */
export async function loadLibraryVariables(): Promise<LibraryVariables> {
  const collections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
  const vars: LibraryVariableRef[] = [];
  for (const c of collections) {
    const list = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(c.key);
    for (const v of list) {
      vars.push({ key: v.key, name: v.name, type: v.resolvedType, collectionKey: c.key, collectionName: c.name, libraryName: c.libraryName });
    }
  }
  return { vars, collections: collections.map((c) => ({ key: c.key, name: c.name, libraryName: c.libraryName })) };
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
 * Imports the library variable and rebinds the group's sites to it, stopping when `budget`
 * runs out. Returns how many bindings moved.
 */
export async function relinkGroup(group: RelinkGroup, budget: number): Promise<number> {
  if (budget <= 0) return 0;
  const variable = await figma.variables.importVariableByKeyAsync(group.library.key);
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
