/**
 * Pure copy for the free companion plugin "Unused Variables Finder & Cleaner" (queue
 * `free-unused-variables-finder`, 2026-10-04). The free plugin ships the hygiene module's
 * unused list with delete; its result screen names what the paid toolkit adds and links to it.
 */
import type { HygieneReport } from './hygiene.js';

/** The paid toolkit's Community listing — the funnel this free plugin exists for. */
export const TOOLKIT_URL = 'https://www.figma.com/community/plugin/1682711656065145288';
export const TOOLKIT_NAME = 'Variables Toolkit';

export interface FreeSummary {
  /** One line under the Analyse button. */
  headline: string;
  /** What the paid toolkit adds for this file — only the parts this report actually found. */
  upsell: string;
}

const plural = (n: number, word: string): string => `${n} ${word}${n === 1 ? '' : 's'}`;

export function freeSummary(report: HygieneReport, total: number): FreeSummary {
  const headline =
    total === 0
      ? 'No local variables in this file.'
      : `${plural(total, 'local variable')} · ${report.unused.length} unused in this file`;
  const found: string[] = [];
  if (report.duplicates.length > 0) found.push(`${plural(report.duplicates.length, 'group')} of variables sharing one value`);
  if (report.dangling.length > 0) found.push(`${plural(report.dangling.length, 'alias')} pointing at a deleted variable`);
  const also = found.length ? `This file also has ${found.join(' and ')}. ` : '';
  const upsell = `${also}${TOOLKIT_NAME} shows and fixes those, converts styles to variables and links hard-coded values to variables — $12 once.`;
  return { headline, upsell };
}
