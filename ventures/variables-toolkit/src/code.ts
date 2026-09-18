import { planStyleConversion, type StyleInfo } from './core/convert.js';
import { hygieneReport } from './core/hygiene.js';
import { groupByVariable, suggestLinks, type ColorVariableRef, type PaintSite } from './core/link.js';
import { suggestNumberLinks, type NumberSite, type NumberVariableRef } from './core/numbers.js';
import type { ScanOptions } from './core/scan.js';
import { FREE_LINKS_PER_DAY, allowedLinks, rollover, today, type TierState } from './core/tier.js';
import { executePlan, readExistingVariables } from './figma/convert.js';
import { readVariableUsage } from './figma/hygiene.js';
import { loadColorVariables, loadNumberVariables, scanNodes } from './figma/scan.js';
import { readLocalStyles } from './figma/styles.js';
import type { LinkGroup, ToMain, ToUi } from './messages.js';

figma.showUI(__html__, { width: 400, height: 560, themeColors: true });

const post = (msg: ToUi): void => figma.ui.postMessage(msg);
const TIER_KEY = 'tier-v1';

let tier: TierState = { paid: figma.payments?.status.type === 'PAID', day: today(), used: 0 };
let lastPaints: PaintSite[] = [];
let lastNumbers: NumberSite[] = [];
let colorVars: ColorVariableRef[] = [];
let numberVars: NumberVariableRef[] = [];
let scanToken = 0;

async function loadTier(): Promise<void> {
  const saved = (await figma.clientStorage.getAsync(TIER_KEY)) as Partial<TierState> | undefined;
  tier = rollover({ ...tier, day: saved?.day ?? tier.day, used: saved?.used ?? 0 });
  postStatus();
}

async function saveTier(): Promise<void> {
  await figma.clientStorage.setAsync(TIER_KEY, { day: tier.day, used: tier.used });
}

function postStatus(): void {
  post({ type: 'status', paid: tier.paid, freeLeftToday: allowedLinks(tier, FREE_LINKS_PER_DAY) });
}

// ---------- feature 1: link raw values ----------

async function scan(scope: 'selection' | 'page', options: ScanOptions): Promise<void> {
  const roots = scope === 'selection' ? figma.currentPage.selection : figma.currentPage.children;
  if (roots.length === 0) {
    post({ type: 'error', message: scope === 'selection' ? 'Select something first.' : 'This page is empty.' });
    return;
  }
  const token = ++scanToken;
  [colorVars, numberVars] = await Promise.all([loadColorVariables(), loadNumberVariables()]);
  const result = await scanNodes(
    roots,
    options,
    (visited, pending) => post({ type: 'progress', visited, pending }),
    () => token !== scanToken,
  );
  if (!result) {
    post({ type: 'scan-cancelled' });
    return;
  }
  lastPaints = result.paints;
  lastNumbers = result.numbers;
  const colors = suggestLinks(lastPaints, colorVars);
  const numbers = suggestNumberLinks(lastNumbers, numberVars);
  const numberGroups = new Map<string, LinkGroup<NumberSite>>();
  for (const s of numbers.suggestions) {
    const g = numberGroups.get(s.variable.id) ?? { variableId: s.variable.id, variableName: s.variable.name, sites: [] };
    g.sites.push(s.site);
    numberGroups.set(s.variable.id, g);
  }
  post({
    type: 'scan-result',
    colors: groupByVariable(colors.suggestions).map((g) => ({ variableId: g.variable.id, variableName: g.variable.name, sites: g.sites })),
    numbers: [...numberGroups.values()].sort((a, b) => b.sites.length - a.sites.length),
    unmatchedColors: colors.unmatched.length,
    unmatchedNumbers: numbers.unmatched.length,
    visited: result.visited,
  });
}

async function apply(colorVariableIds: string[], numberVariableIds: string[]): Promise<void> {
  tier = rollover(tier);
  const wantedColors = new Set(colorVariableIds);
  const wantedNumbers = new Set(numberVariableIds);
  const colorTodo = suggestLinks(lastPaints, colorVars).suggestions.filter((s) => wantedColors.has(s.variable.id));
  const numberTodo = suggestNumberLinks(lastNumbers, numberVars).suggestions.filter((s) => wantedNumbers.has(s.variable.id));
  const requested = colorTodo.length + numberTodo.length;
  let budget = allowedLinks(tier, requested);
  let count = 0;

  for (const s of colorTodo) {
    if (budget === 0) break;
    const node = (await figma.getNodeByIdAsync(s.site.nodeId)) as (SceneNode & GeometryMixin) | null;
    const variable = await figma.variables.getVariableByIdAsync(s.variable.id);
    if (!node || !variable) continue;
    const paints = [...(node[s.site.property] as readonly Paint[])];
    const paint = paints[s.site.index];
    if (!paint || paint.type !== 'SOLID') continue;
    paints[s.site.index] = figma.variables.setBoundVariableForPaint(paint, 'color', variable);
    node[s.site.property] = paints;
    count++;
    budget--;
  }
  for (const s of numberTodo) {
    if (budget === 0) break;
    const node = await figma.getNodeByIdAsync(s.site.nodeId);
    const variable = await figma.variables.getVariableByIdAsync(s.variable.id);
    if (!node || !variable || !('setBoundVariable' in node)) continue;
    node.setBoundVariable(s.site.field, variable);
    count++;
    budget--;
  }
  if (!tier.paid) {
    tier.used += count;
    await saveTier();
  }
  const capped = count < requested;
  post({ type: 'applied', count, capped });
  postStatus();
  figma.notify(capped ? `Linked ${count} — free limit reached for today. Unlock for unlimited.` : `Linked ${count} value${count === 1 ? '' : 's'}`);
}

// ---------- feature 2: styles → variables ----------

const FREE_KINDS: ReadonlySet<StyleInfo['kind']> = new Set(['paint']);
const permittedKinds = (kinds: StyleInfo['kind'][]): Set<StyleInfo['kind']> => new Set(kinds.filter((k) => tier.paid || FREE_KINDS.has(k)));

async function convertPreview(kinds: StyleInfo['kind'][]): Promise<void> {
  const styles = await readLocalStyles();
  const counts: Record<StyleInfo['kind'], number> = { paint: 0, text: 0, effect: 0 };
  for (const s of styles) counts[s.kind]++;
  const plan = planStyleConversion(styles, { kinds: permittedKinds(kinds), existing: await readExistingVariables() });
  post({ type: 'convert-plan', plan, counts });
}

async function convertApply(kinds: StyleInfo['kind'][], collectionName: string): Promise<void> {
  const styles = await readLocalStyles();
  const plan = planStyleConversion(styles, { kinds: permittedKinds(kinds), existing: await readExistingVariables() });
  const result = await executePlan(plan, collectionName.trim() || 'Tokens');
  post({ type: 'converted', ...result });
  figma.notify(`Created ${result.created}, reused ${result.reused}, bound ${result.bound} style properties`);
}

// ---------- feature 3: hygiene ----------

async function hygiene(): Promise<void> {
  const usage = await readVariableUsage();
  post({ type: 'hygiene', report: hygieneReport(usage), total: usage.length });
}

async function deleteVariables(ids: string[]): Promise<void> {
  if (!tier.paid) {
    post({ type: 'error', message: 'Deleting unused variables is part of the unlock.' });
    return;
  }
  let n = 0;
  for (const id of ids) {
    const v = await figma.variables.getVariableByIdAsync(id);
    if (v) {
      v.remove();
      n++;
    }
  }
  figma.notify(`Deleted ${n} variable${n === 1 ? '' : 's'}`);
  await hygiene();
}

// ---------- payments ----------

async function upgrade(): Promise<void> {
  if (!figma.payments) return;
  await figma.payments.initiateCheckoutAsync({ interstitial: 'PAID_FEATURE' });
  tier.paid = figma.payments.status.type === 'PAID';
  postStatus();
}

figma.ui.onmessage = (msg: ToMain) => {
  const run = ((): Promise<void> => {
    switch (msg.type) {
      case 'scan':
        return scan(msg.scope, msg.options);
      case 'cancel-scan':
        scanToken++;
        return Promise.resolve();
      case 'apply':
        return apply(msg.colorVariableIds, msg.numberVariableIds);
      case 'convert-preview':
        return convertPreview(msg.kinds);
      case 'convert-apply':
        return convertApply(msg.kinds, msg.collectionName);
      case 'hygiene':
        return hygiene();
      case 'delete-variables':
        return deleteVariables(msg.ids);
      case 'upgrade':
        return upgrade();
    }
  })();
  run.catch((err: unknown) => post({ type: 'error', message: err instanceof Error ? err.message : String(err) }));
};

void loadTier();
