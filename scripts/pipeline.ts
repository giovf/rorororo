// Reads the work pipeline (docs/pipeline/) and prints it; fails on any invalid file.
// Run: npm run pipeline [status|next|empty|cold [--routine=build]|claim <venture>/<id> [--by=<routine>]]
// (Node 22 runs .ts directly — keep syntax erasable)
import { existsSync, readFileSync, readdirSync } from 'node:fs';
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
// `next`, `empty` and `status` (2026-10-12, foundry claim-before-install): plain node too — the
// parse/rank code is imported from packages/core/src/pipeline.ts through Node's type stripping
// (no imports of its own, erasable syntax), not from @foundry/core's dist, which exists only after
// `npm ci` + `tsc -b`. Until then `next` failed with ERR_MODULE_NOT_FOUND for the first 5–7 minutes
// of every slot, so the 17:00 burn-down and the 17:10 build claimed their items after their own
// install and gate and still collided (10-07 duplicate build, 10-10 dropped build). The routines
// now run `next` + `claim` right after the GATE, before `npm ci`.
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
  const { buildSlotInFlight, datedArrived, datedWithinDay, preResearchSpent } =
    await import('./pipeline-cold.ts');
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
  // Research reasons first (2026-10-22, foundry claim-only-when-buildable): a flagged queue out of
  // cooling is what the slot does before any build, and `next` is null while one exists.
  const research: string[] = [];
  const build: string[] = [];
  for (const q of cold) {
    if (!cooling(q) && (q.needs_research || !q.items.some(open)))
      research.push(`${q.venture}: needs research (research first; next claims nothing)`);
    else if (q.items.some(buildable)) build.push(`${q.venture}: buildable item`);
    else if (cooling(q))
      continue; // researched within 48 h or waiting: flagged or not, not tonight
    else if (q.items.some((it) => it.status === 'todo' && datedWithinDay(it.not_before, now)))
      continue; // an item comes due today at 07:00 or tomorrow: waiting, not starved (2026-10-20)
    else build.push(`${q.venture}: starved, not cooling`);
  }
  const runs = readFileSync(path.resolve(dir, '..', 'RUNS.md'), 'utf8');
  // `-- --routine=build` (npm keeps a bare flag for itself, so npm_config_routine is read too)
  const routineArg =
    process.argv.find((a) => a.startsWith('--routine='))?.slice('--routine='.length) ??
    process.env['npm_config_routine'];
  const routine = routineArg === 'build' ? 'build' : 'burn-down';
  // A build slot in flight is researching the same starved or flagged queue (2026-10-23, foundry
  // research-defers-to-build-slot): the burn-down leaves every research reason to it for the hour
  // and says so; buildable items are unaffected — the claim marker covers those.
  const slotsFile = path.resolve(dir, '..', 'ops', 'SLOTS.md');
  const slots = existsSync(slotsFile) ? readFileSync(slotsFile, 'utf8') : '';
  const inFlight = buildSlotInFlight(slots, runs, now, routine);
  const deferred: string[] = [];
  const reasons: string[] = [];
  for (const r of [...research, ...build]) {
    if (inFlight !== undefined && !r.endsWith(': buildable item')) deferred.push(r.split(':')[0]!);
    else reasons.push(r);
  }
  if (!preResearchSpent(runs, now, routine))
    reasons.push(
      `exchange: pre-research pass unspent this ${routine === 'build' ? 'day' : 'night'}`,
    );
  const note =
    deferred.length === 0
      ? ''
      : ` (deferred: ${deferred.join(', ')} research — build slot started ${inFlight} UTC is in flight)`;
  console.log(
    reasons.length === 0 ? `starved-and-cooled${note}` : `work: ${reasons.join('; ')}${note}`,
  );
  process.exit(0);
}

const { formatPipeline, needsResearch, nextItem, parseExchange, parseQueue } =
  await import('../packages/core/src/pipeline.ts');
type Pipeline = import('../packages/core/src/pipeline.ts').Pipeline;
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
  // A plain `next` is null while a flagged queue out of cooling waits for research, so the CLAIM
  // FIRST step claims nothing on a slot that will research (2026-10-22, foundry
  // claim-only-when-buildable); the capped call (the fallback, which never does market research)
  // keeps the raw ranking.
  const next = nextItem(
    pipeline.queues,
    cap ? { maxEffortDays: Number(cap), researchFirst: false } : {},
  );
  console.log(JSON.stringify(next ?? null, null, 2));
} else if (command === 'empty') {
  // Flagged or empty queues; when nothing is buildable anywhere, the starved queues instead
  // (every open item blocked or dated), oldest `updated` first — a build slot researches then.
  console.log(JSON.stringify(needsResearch(pipeline.queues).map((q) => q.venture)));
} else {
  console.log(formatPipeline(pipeline));
}
