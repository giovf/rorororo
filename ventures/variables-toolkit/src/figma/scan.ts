import type { ColorVariableRef, PaintSite } from '../core/link.js';
import { SIZE_FIELDS, type NumberField, type NumberSite, type NumberVariableRef } from '../core/numbers.js';
import { decide, type ScanOptions } from '../core/scan.js';

type BoundMap = Record<string, VariableAlias | VariableAlias[] | undefined>;
const boundId = (node: SceneNode, field: string): string | undefined => {
  const v = (node.boundVariables as BoundMap | undefined)?.[field];
  return v && !Array.isArray(v) ? v.id : undefined;
};

export async function loadColorVariables(): Promise<ColorVariableRef[]> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const byCollection = new Map(collections.map((c) => [c.id, c.name]));
  const vars = await figma.variables.getLocalVariablesAsync('COLOR');
  return vars.map((v) => {
    const valuesByMode: ColorVariableRef['valuesByMode'] = {};
    for (const [mode, value] of Object.entries(v.valuesByMode)) {
      if (typeof value === 'object' && value !== null && 'r' in value) {
        valuesByMode[mode] = { r: value.r, g: value.g, b: value.b, a: 'a' in value ? value.a : 1 };
      }
    }
    return { id: v.id, name: v.name, collection: byCollection.get(v.variableCollectionId) ?? '', valuesByMode };
  });
}

export async function loadNumberVariables(): Promise<NumberVariableRef[]> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const byCollection = new Map(collections.map((c) => [c.id, c.name]));
  const vars = await figma.variables.getLocalVariablesAsync('FLOAT');
  return vars.map((v) => {
    const valuesByMode: Record<string, number> = {};
    for (const [mode, value] of Object.entries(v.valuesByMode)) if (typeof value === 'number') valuesByMode[mode] = value;
    return { id: v.id, name: v.name, collection: byCollection.get(v.variableCollectionId) ?? '', valuesByMode };
  });
}

function collectPaints(node: SceneNode, out: PaintSite[]): void {
  for (const property of ['fills', 'strokes'] as const) {
    if (!(property in node)) continue;
    const paints: readonly Paint[] | PluginAPI['mixed'] = (node as GeometryMixin)[property];
    if (typeof paints === 'symbol') continue; // figma.mixed
    paints.forEach((paint, index) => {
      if (paint.type !== 'SOLID' || paint.visible === false) return;
      const bound = paint.boundVariables?.color?.id;
      out.push({
        nodeId: node.id,
        nodeName: node.name,
        property,
        index,
        color: { ...paint.color, a: paint.opacity ?? 1 },
        ...(bound === undefined ? {} : { boundVariableId: bound }),
      });
    });
  }
}

function collectNumbers(node: SceneNode, out: NumberSite[], sizes: boolean): void {
  const push = (field: NumberField, value: number | PluginAPI['mixed']): void => {
    if (typeof value !== 'number') return;
    const bound = boundId(node, field);
    out.push({ nodeId: node.id, nodeName: node.name, field, value, ...(bound === undefined ? {} : { boundVariableId: bound }) });
  };
  if ('layoutMode' in node && node.layoutMode !== 'NONE') {
    push('paddingTop', node.paddingTop);
    push('paddingRight', node.paddingRight);
    push('paddingBottom', node.paddingBottom);
    push('paddingLeft', node.paddingLeft);
    // "Auto" gap (space-between) is not a token; skip it — a documented rival mistake.
    if (node.primaryAxisAlignItems !== 'SPACE_BETWEEN') push('itemSpacing', node.itemSpacing);
    if (node.layoutWrap === 'WRAP' && node.counterAxisAlignContent !== 'SPACE_BETWEEN') push('counterAxisSpacing', node.counterAxisSpacing ?? 0);
  }
  if ('topLeftRadius' in node) {
    push('topLeftRadius', node.topLeftRadius);
    push('topRightRadius', node.topRightRadius);
    push('bottomLeftRadius', node.bottomLeftRadius);
    push('bottomRightRadius', node.bottomRightRadius);
  }
  if (sizes && 'width' in node) {
    const h = 'layoutSizingHorizontal' in node ? node.layoutSizingHorizontal : 'FIXED';
    const v = 'layoutSizingVertical' in node ? node.layoutSizingVertical : 'FIXED';
    if (h === 'FIXED') push('width', node.width);
    if (v === 'FIXED') push('height', node.height);
  }
}

export interface ScanResult {
  paints: PaintSite[];
  numbers: NumberSite[];
  visited: number;
}

/**
 * Iterative, chunked traversal: yields to the event loop every `chunk` nodes so
 * progress and cancel messages get through, instead of one blocking pass.
 */
export async function scanNodes(
  roots: readonly SceneNode[],
  options: ScanOptions,
  onProgress: (visited: number, pending: number) => void,
  isCancelled: () => boolean,
  chunk = 250,
): Promise<ScanResult | null> {
  const stack: SceneNode[] = [...roots];
  const result: ScanResult = { paints: [], numbers: [], visited: 0 };
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node) break;
    if (decide(node, options) === 'skip-subtree') continue;
    collectPaints(node, result.paints);
    if (options.numbers) collectNumbers(node, result.numbers, options.sizes);
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

export { SIZE_FIELDS };
