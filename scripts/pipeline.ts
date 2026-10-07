// Reads the work pipeline (docs/pipeline/) and prints it; fails on any invalid file.
// Run: npm run pipeline [status|next|empty|cold]   (Node 22 runs .ts directly — keep syntax erasable)
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const dir = path.resolve(import.meta.dirname, '..', 'docs', 'pipeline');

// `cold` (2026-10-06, foundry burn-starvation-gate): the burn-down's GATE, run before `npm ci`, so it
// must not need @foundry/core's dist. Plain reads of the queue files and docs/RUNS.md; prints
// `starved-and-cooled` when nothing is buildable, no queue is flagged or empty, every starved
// queue was researched within 48 h (research-cooldown) and the night's one exchange pre-research
// is spent (a `| burn-down |` line today or yesterday saying `pre-research`) — the run then ends
// without npm ci; otherwise `work`. The night of 2026-10-05/06 four firings spent ~20 min each
// (npm ci + the full gate) to learn exactly this.
if (process.argv[2] === 'cold') {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const dayMs = 86_400_000;
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
    (it.status === 'todo' && (it.not_before === undefined || it.not_before <= today)) ||
    (it.status === 'doing' &&
      (it.not_before === undefined || it.not_before <= today) &&
      Date.parse(today) - Date.parse(it.doing_since ?? it.added) > dayMs);
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
  const preResearched = runs
    .split('\n')
    .some(
      (l) =>
        (l.startsWith(`- ${today}`) || l.startsWith(`- ${yesterday}`)) &&
        l.includes('| burn-down |') &&
        l.includes('pre-research'),
    );
  if (!preResearched) reasons.push('exchange: pre-research pass unspent this night');
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
