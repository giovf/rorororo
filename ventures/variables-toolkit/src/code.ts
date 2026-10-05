import { planStyleConversion, type StyleInfo } from './core/convert.js';
import { hygieneReport } from './core/hygiene.js';
import { groupByVariable, suggestLinks, type ColorVariableRef, type PaintSite } from './core/link.js';
import { suggestNumberLinks, type NumberSite, type NumberVariableRef } from './core/numbers.js';
import { planRelink, type RelinkDirection, type RelinkPlan } from './core/relink.js';
import type { ScanOptions } from './core/scan.js';
import { FREE_LINKS_PER_DAY, allowedLinks, rollover, today, type TierState } from './core/tier.js';
import { executePlan, readExistingVariables } from './figma/convert.js';
import { readVariableUsage } from './figma/hygiene.js';
import { collectBoundSites, describeVariables, loadTargets, relinkGroup, type LibraryVariables } from './figma/relink.js';
import { loadColorVariables, loadNumberVariables, scanNodes } from './figma/scan.js';
import { readLocalStyles } from './figma/styles.js';
import { createDemoPage } from './figma/demo.js';
import { createPlaygroundFile } from './figma/playground.js';
import type { LinkGroup, ToMain, ToUi } from './messages.js';

declare const __DEV__: boolean;

if (__DEV__ && (figma.command === 'dev-paid' || figma.command === 'dev-unpaid')) {
  // Development builds only: Figma ignores this once the plugin is published.
  const type = figma.command === 'dev-paid' ? 'PAID' : 'UNPAID';
  try {
    figma.payments?.setPaymentStatusInDevelopment({ type });
    figma.closePlugin(`Payment status set to ${type}. Now run Variables Toolkit → Open.`);
  } catch (err: unknown) {
    figma.closePlugin(`Couldn't set status: ${err instanceof Error ? err.message : String(err)}`);
  }
} else if (__DEV__ && figma.command === 'playground') {
  createPlaygroundFile()
    .then((summary) => figma.closePlugin(summary))
    .catch((err: unknown) => figma.closePlugin(`Playground failed: ${err instanceof Error ? err.message : String(err)}`));
} else if (__DEV__ && figma.command === 'demo') {
  createDemoPage()
    .then((name) => figma.closePlugin(`Created page "${name}". Now run Variables Toolkit → Open.`))
    .catch((err: unknown) => figma.closePlugin(`Demo failed: ${err instanceof Error ? err.message : String(err)}`));
} else {
  figma.showUI(__html__, { width: 400, height: 560, themeColors: true });
}

const post = (msg: ToUi): void => figma.ui.postMessage(msg);
const TIER_KEY = 'tier-v1';

let tier: TierState = { paid: figma.payments?.status.type === 'PAID', day: today(), used: 0 };
let lastPaints: PaintSite[] = [];
let lastNumbers: NumberSite[] = [];
let colorVars: ColorVariableRef[] = [];
let numberVars: NumberVariableRef[] = [];
let scanToken = 0;
let lastRelink: RelinkPlan | null = null;

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

async function convertPreview(kinds: StyleInfo['kind'][], styleIds?: string[]): Promise<void> {
  const styles = await readLocalStyles();
  const counts: Record<StyleInfo['kind'], number> = { paint: 0, text: 0, effect: 0 };
  for (const s of styles) counts[s.kind]++;
  const permitted = permittedKinds(kinds);
  const plan = planStyleConversion(styles, {
    kinds: permitted,
    existing: await readExistingVariables(),
    ...(styleIds ? { onlyStyleIds: new Set(styleIds) } : {}),
  });
  post({
    type: 'convert-plan',
    plan,
    counts,
    styles: styles.filter((s) => permitted.has(s.kind)).map((s) => ({ id: s.id, name: s.name, kind: s.kind })),
  });
}

async function convertApply(kinds: StyleInfo['kind'][], collectionName: string, styleIds: string[]): Promise<void> {
  const styles = await readLocalStyles();
  const plan = planStyleConversion(styles, {
    kinds: permittedKinds(kinds),
    existing: await readExistingVariables(),
    onlyStyleIds: new Set(styleIds),
  });
  const result = await executePlan(plan, collectionName.trim() || 'Tokens');
  post({ type: 'converted', ...result });
  figma.notify(result.warning ?? `Created ${result.created}, reused ${result.reused}, bound ${result.bound} style properties`);
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

// ---------- feature 4: relink to library variables (or back to local ones) ----------

async function readTargets(direction: RelinkDirection): Promise<LibraryVariables> {
  try {
    return await loadTargets(direction);
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new Error(
      direction === 'to-local'
        ? `Couldn't read this file's variables (${reason}).`
        : `Couldn't read the enabled libraries (${reason}). Enable a library with variables under Assets → Libraries, then scan again.`,
      { cause: err },
    );
  }
}

async function relinkScan(scope: 'selection' | 'page', direction: RelinkDirection = 'to-library', collectionKeys?: string[]): Promise<void> {
  const roots = scope === 'selection' ? figma.currentPage.selection : figma.currentPage.children;
  if (roots.length === 0) {
    post({ type: 'error', message: scope === 'selection' ? 'Select something first.' : 'This page is empty.' });
    return;
  }
  const token = ++scanToken;
  const library = await readTargets(direction);
  if (library.vars.length === 0) {
    post({
      type: 'error',
      message:
        direction === 'to-local'
          ? 'This file has no local variables to move onto. Create or copy a collection first, then scan again.'
          : 'No enabled library publishes variables. Enable one under Assets → Libraries, then scan again.',
    });
    return;
  }
  const result = await collectBoundSites(
    roots,
    (visited, pending) => post({ type: 'progress', visited, pending }),
    () => token !== scanToken,
  );
  if (!result) {
    post({ type: 'scan-cancelled' });
    return;
  }
  const known = await describeVariables(result.sites.map((s) => s.variableId));
  const plan = planRelink(result.sites, known, library.vars, { direction, ...(collectionKeys?.length ? { collectionKeys: new Set(collectionKeys) } : {}) });
  lastRelink = plan;
  post({
    type: 'relink-result',
    direction,
    groups: plan.groups.map((g) => ({
      key: g.library.key,
      name: g.library.name,
      libraryName: g.library.libraryName,
      collectionName: g.library.collectionName,
      from: g.from.map((f) => ({ name: f.name, reason: f.reason })),
      sites: g.sites.length,
    })),
    unmatched: plan.unmatched.map((u) => ({ name: u.variable.name, type: u.variable.type, sites: u.sites })),
    ambiguous: plan.ambiguous.map((a) => ({ name: a.variable.name, libraries: a.candidates.map((c) => `${c.libraryName} / ${c.collectionName}`), sites: a.sites })),
    orphaned: plan.orphaned,
    current: plan.current,
    visited: result.visited,
    collections: library.collections,
    libraryVariables: library.vars.length,
  });
}

async function relinkApply(keys: string[], direction: RelinkDirection = 'to-library'): Promise<void> {
  if (!lastRelink || lastRelink.direction !== direction) {
    post({ type: 'error', message: 'Scan first.' });
    return;
  }
  tier = rollover(tier);
  const wanted = new Set(keys);
  const todo = lastRelink.groups.filter((g) => wanted.has(g.library.key));
  const requested = todo.reduce((n, g) => n + g.sites.length, 0);
  let budget = allowedLinks(tier, requested);
  let count = 0;
  for (const g of todo) {
    if (budget === 0) break;
    const moved = await relinkGroup(g, budget, direction);
    count += moved;
    budget -= moved;
  }
  if (!tier.paid) {
    tier.used += count;
    await saveTier();
  }
  const capped = count < requested;
  post({ type: 'relinked', count, capped });
  postStatus();
  const where = direction === 'to-local' ? 'local variables' : 'library variables';
  figma.notify(capped ? `Relinked ${count} — free limit reached for today. Unlock for unlimited.` : `Relinked ${count} binding${count === 1 ? '' : 's'} to ${where}`);
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
        return convertPreview(msg.kinds, msg.styleIds);
      case 'convert-apply':
        return convertApply(msg.kinds, msg.collectionName, msg.styleIds);
      case 'hygiene':
        return hygiene();
      case 'delete-variables':
        return deleteVariables(msg.ids);
      case 'relink-scan':
        return relinkScan(msg.scope, msg.direction, msg.collectionKeys);
      case 'relink-apply':
        return relinkApply(msg.keys, msg.direction);
      case 'upgrade':
        return upgrade();
    }
  })();
  run.catch((err: unknown) => post({ type: 'error', message: err instanceof Error ? err.message : String(err) }));
};

void loadTier();
