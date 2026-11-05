// The handbook's text as data: chapters are XHTML fragments written with the helpers in
// content/helpers.ts, assembled here in reading order and packaged by epub.ts and pdf.ts.
// Everything in the chapters comes from this repository's own documents and history (CLAUDE.md,
// docs/routines, docs/pipeline, docs/STRATEGY.md §8, docs/RUNS.md, the exchange and review files);
// nothing is invented, and the test (kit.test.ts) checks the two hard requirements of the queue
// item — the preface that states how the book was written and the reader-facing needs line — plus
// the scrub rules: no secrets, no owner identity, no private third parties.

import { part1 } from './content/part1.ts';
import { part2 } from './content/part2.ts';
import { part3 } from './content/part3.ts';
import { part4 } from './content/part4.ts';
import { plainText, type Chapter } from './content/helpers.ts';

export type { Chapter } from './content/helpers.ts';
export { plainText } from './content/helpers.ts';
export { NEEDS_LINE, OWNER_PROCESS_PLACEHOLDER } from './content/constants.ts';

export const BOOK = {
  title: 'Running Claude Code Unattended',
  subtitle: 'The operations handbook of a self-running software business — routines, queues, gates, relays and watchdogs, with the incidents that shaped every rule',
  author: 'Foundry',
  publisher: 'Foundry',
  language: 'en-GB',
  identifier: 'urn:uuid:3b1d6c0e-9a4f-4e2b-8c7d-20261105a001',
  edition: 'First edition, November 2026 (covers the operation from September to November 2026)',
  description:
    'How one small software business runs itself with Claude Code: scheduled routines that build, research, triage mail, watch each other and ask a person only when a person is needed. Every rule in the operation is shown with the incident that made it, and the files that run it are the accompanying Extras.',
} as const;

export function chapters(): Chapter[] {
  return [...part1, ...part2, ...part3, ...part4];
}

export function wordCount(): number {
  return chapters().reduce((n, ch) => n + plainText(ch.body).split(/\s+/).filter(Boolean).length, 0);
}
