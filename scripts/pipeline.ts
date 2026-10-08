// Reads the work pipeline (docs/pipeline/) and prints it; fails on any invalid file.
// Run: npm run pipeline [status|next|empty|cold|claim <venture>/<id> [--by=<routine>]]
// (Node 22 runs .ts directly — keep syntax erasable)
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const dir = path.resolve(import.meta.dirname, '..', 'docs', 'pipeline');

// `cold` (2026-10-06, foundry burn-starvation-gate): the burn-down's GATE, run before `npm ci`, so it
// must not need @foundry/core's dist. Plain reads of the queue files and docs/RUNS.md; prints
// `starved-and-cooled` when nothing is buildable, no queue is flagged or empty, every starved
// queue was researched within 48 h (research-cooldown) and the night's one exchange pre-research
// is spent (a `| burn-down |` line since the night's 17:00 UTC starting `Exchange pre-research:`,
// scripts/pipeline-cold.ts) — the run then ends without npm ci; otherwise `work`. The night of
// 2026-10-05/06 four firings spent ~20 min each (npm ci + the full gate) to learn exactly this.
// Until 2026-10-07 the match was any line today or yesterday containing `pre-research`, which the
// `Stopping: … pre-research spent` lines satisfied for two nights after the one real pass.
// `claim` (2026-10-07, foundry build-claim-marker): the one-line `doing` push made right after
// `next`, before any work, so a concurrent build / burn-down session's `next` skips the item.
// Plain node, no dist, like `cold`; the logic and its tests are in scripts/pipeline-claim.ts.
if (process.argv[2] === 'claim') {
  const { main } = await import('./pipeline-claim.ts');
  try {
    main(process.argv.slice(3));
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(2);
  }
  process.exit(0);
}

if (process.argv[2] === 'cold') {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const dayMs = 86_400_000;
  const { datedArrived, preResearchSpent } = await import('./pipeline-cold.ts');
  type ColdItem = { status: string; not_before?: string; doing_since?: string; added: string };
  type ColdQueue = {
    venture: string;
    status: string;
    needs_research: boolean;
    researched?: string;
    research_after?: string;
    items: ColdItem[];
  };
  const cold = readdirSync(path.join(dir, 'queues'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(path.join(dir, 'queues', f), 'utf8')) as ColdQueue)
    .filter((q) => q.status === 'open');
  const buildable = (it: ColdItem): boolean =>
    datedArrived(it.not_before, now) &&
    (it.status === 'todo' ||
      (it.status === 'doing' &&
        Date.parse(today) - Date.parse(it.doing_since ?? it.added) > dayMs));
  const open = (it: ColdItem): boolean =>
    it.status === 'todo' || it.status === 'doing' || it.status === 'blocked';
  const cooling = (q: ColdQueue): boolean =>
    (q.researched !== undefined && Date.parse(today) - Date.parse(q.researched) < 2 * dayMs) ||
    (q.research_after !== undefined && q.research_after > today);
  const reasons: string[] = [];
  for (const q of cold) {
    if (q.items.some(buildable)) reasons.push(`${q.venture}: buildable item`);
    else if (q.needs_research || !q.items.some(open)) reasons.push(`${q.venture}: needs research`);
    else if (!cooling(q)) reasons.push(`${q.venture}: starved, not cooling`);
  }
  const runs = readFileSync(path.resolve(dir, '..', 'RUNS.md'), 'utf8');
  if (!preResearchSpent(runs, now)) reasons.push('exchange: pre-research pass unspent this night');
  console.log(reasons.length === 0 ? 'starved-and-cooled' : `work: ${reasons.join('; ')}`);
  process.exit(0);
}

const { formatPipeline, needsResearch, nextItem, parseExchange, parseQueue } =
  await import('@foundry/core');
type Pipeline = import('@foundry/core').Pipeline;
const errors: string[] = [];
const queues = readdirSync(path.join(dir, 'queues'))
  .filter((f) => f.endsWith('.json'))
  .sort()
  .flatMap((f) => {
    try {
      const q = parseQueue(readFileSync(path.join(dir, 'queues', f), 'utf8'), f);
      if (`${q.venture}.json` !== f)
        errors.push(`${f}: venture "${q.venture}" does not match the file name`);
      return [q];
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
      return [];
    }
  });
let pipeline: Pipeline = { exchange: { ideas: [] }, queues };
try {
  pipeline = {
    ...pipeline,
    exchange: parseExchange(readFileSync(path.join(dir, 'exchange.json'), 'utf8')),
  };
} catch (err) {
  errors.push(err instanceof Error ? err.message : String(err));
}
if (errors.length > 0) {
  console.error(`invalid pipeline:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}

const command = process.argv[2] ?? 'status';
if (command === 'next') {
  // `next --max-effort=0.3` restricts to small items (the Opus fallback routine's remit).
  const cap = process.argv
    .find((a) => a.startsWith('--max-effort='))
    ?.slice('--max-effort='.length);
  const next = nextItem(pipeline.queues, cap ? { maxEffortDays: Number(cap) } : {});
  console.log(JSON.stringify(next ?? null, null, 2));
} else if (command === 'empty') {
  // Flagged or empty queues; when nothing is buildable anywhere, the starved queues instead
  // (every open item blocked or dated), oldest `updated` first — a build slot researches then.
  console.log(JSON.stringify(needsResearch(pipeline.queues).map((q) => q.venture)));
} else {
  console.log(formatPipeline(pipeline));
}
