/**
 * Free companion plugin: "Unused Variables Finder & Cleaner". One job — list the local variables
 * nothing in this file references, and delete the ones you tick. Same hygiene module as the paid
 * toolkit (`core/hygiene.ts`, `figma/hygiene.ts`); no payments permission, no network.
 */
import { hygieneReport } from '../core/hygiene.js';
import { readVariableUsage } from '../figma/hygiene.js';
import type { FreeToMain, FreeToUi } from './messages.js';

figma.showUI(__html__, { width: 360, height: 480, themeColors: true });

const post = (msg: FreeToUi): void => figma.ui.postMessage(msg);

async function analyse(): Promise<void> {
  const usage = await readVariableUsage();
  post({ type: 'report', report: hygieneReport(usage), total: usage.length });
}

async function deleteVariables(ids: string[]): Promise<void> {
  let count = 0;
  for (const id of ids) {
    const variable = await figma.variables.getVariableByIdAsync(id);
    if (variable) {
      variable.remove();
      count++;
    }
  }
  figma.notify(`Deleted ${count} variable${count === 1 ? '' : 's'}`);
  post({ type: 'deleted', count });
  await analyse();
}

figma.ui.onmessage = (msg: FreeToMain) => {
  const run = msg.type === 'analyse' ? analyse() : deleteVariables(msg.ids);
  run.catch((err: unknown) => post({ type: 'error', message: err instanceof Error ? err.message : String(err) }));
};
