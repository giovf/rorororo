import { suggestLinks, groupByVariable, type ColorVariableRef, type PaintSite } from './core/link.js';
import { allowedLinks, type TierState } from './core/tier.js';
import type { ToMain, ToUi } from './messages.js';

figma.showUI(__html__, { width: 360, height: 480, themeColors: true });

const post = (msg: ToUi): void => figma.ui.postMessage(msg);
const tier: TierState = { paid: figma.payments?.status.type === 'PAID', usedThisRun: 0 };
let lastSites: PaintSite[] = [];
let lastVars: ColorVariableRef[] = [];

post({ type: 'status', paid: tier.paid });

async function loadColorVariables(): Promise<ColorVariableRef[]> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const vars = await figma.variables.getLocalVariablesAsync('COLOR');
  const byCollection = new Map(collections.map((c) => [c.id, c.name]));
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

function collectPaintSites(nodes: readonly SceneNode[]): PaintSite[] {
  const sites: PaintSite[] = [];
  const visit = (node: SceneNode): void => {
    for (const property of ['fills', 'strokes'] as const) {
      if (!(property in node)) continue;
      const paints: readonly Paint[] | PluginAPI['mixed'] = (node as GeometryMixin)[property];
      if (typeof paints === 'symbol') continue; // figma.mixed
      paints.forEach((paint, index) => {
        if (paint.type !== 'SOLID' || paint.visible === false) return;
        const bound = paint.boundVariables?.color?.id;
        sites.push({
          nodeId: node.id,
          nodeName: node.name,
          property,
          index,
          color: { ...paint.color, a: paint.opacity ?? 1 },
          ...(bound === undefined ? {} : { boundVariableId: bound }),
        });
      });
    }
    if ('children' in node) node.children.forEach(visit);
  };
  nodes.forEach(visit);
  return sites;
}

async function scan(scope: 'selection' | 'page'): Promise<void> {
  const roots = scope === 'selection' ? figma.currentPage.selection : figma.currentPage.children;
  if (roots.length === 0) {
    post({ type: 'error', message: scope === 'selection' ? 'Select something first.' : 'This page is empty.' });
    return;
  }
  lastVars = await loadColorVariables();
  lastSites = collectPaintSites(roots);
  const { suggestions, unmatched } = suggestLinks(lastSites, lastVars);
  post({
    type: 'scan-result',
    groups: groupByVariable(suggestions).map((g) => ({ variableId: g.variable.id, variableName: g.variable.name, sites: g.sites })),
    unmatched: unmatched.length,
    scanned: lastSites.length,
  });
}

async function apply(variableIds: string[]): Promise<void> {
  const wanted = new Set(variableIds);
  const { suggestions } = suggestLinks(lastSites, lastVars);
  const todo = suggestions.filter((s) => wanted.has(s.variable.id));
  const limit = allowedLinks(tier, todo.length);
  let count = 0;
  for (const s of todo.slice(0, limit)) {
    const node = (await figma.getNodeByIdAsync(s.site.nodeId)) as (SceneNode & GeometryMixin) | null;
    const variable = await figma.variables.getVariableByIdAsync(s.variable.id);
    if (!node || !variable) continue;
    const paints = [...(node[s.site.property] as readonly Paint[])];
    const paint = paints[s.site.index];
    if (!paint || paint.type !== 'SOLID') continue;
    paints[s.site.index] = figma.variables.setBoundVariableForPaint(paint, 'color', variable);
    node[s.site.property] = paints;
    count++;
  }
  tier.usedThisRun += tier.paid ? 0 : count;
  post({ type: 'applied', count, capped: limit < todo.length });
  figma.notify(limit < todo.length ? `Linked ${count} (free limit reached — unlock for unlimited)` : `Linked ${count} paint${count === 1 ? '' : 's'}`);
}

async function upgrade(): Promise<void> {
  if (!figma.payments) return;
  await figma.payments.initiateCheckoutAsync({ interstitial: 'PAID_FEATURE' });
  tier.paid = figma.payments.status.type === 'PAID';
  post({ type: 'status', paid: tier.paid });
}

figma.ui.onmessage = (msg: ToMain) => {
  const run = msg.type === 'scan' ? scan(msg.scope) : msg.type === 'apply' ? apply(msg.variableIds) : upgrade();
  run.catch((err: unknown) => post({ type: 'error', message: err instanceof Error ? err.message : String(err) }));
};
