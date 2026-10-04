import type { HygieneReport } from '../core/hygiene.js';

/** Messages between the free plugin's main thread (free/code.ts) and its UI iframe. */
export type FreeToUi = { type: 'report'; report: HygieneReport; total: number } | { type: 'deleted'; count: number } | { type: 'error'; message: string };

export type FreeToMain = { type: 'analyse' } | { type: 'delete-variables'; ids: string[] };
