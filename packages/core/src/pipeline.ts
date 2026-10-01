/**
 * The work pipeline (`docs/pipeline/`): one JSON queue per venture plus an "exchange" of
 * ideas not yet assigned to a venture. Routines read it with `npm run pipeline`:
 *
 *   docs/pipeline/exchange.json          ideas: parked / promoted / declined, with the trigger
 *   docs/pipeline/queues/<venture>.json  status open|finished, needs_research, scored items
 *
 * Rules (mirrored in docs/pipeline/README.md):
 * - the build routine takes the highest-scoring `todo` item across OPEN queues, skipping any
 *   whose `not_before` date has not arrived (a dated checkpoint, e.g. a day-30 review);
 * - an open queue with nothing left to do (no todo/doing/blocked) needs research — the build
 *   routine researches before it builds; `needs_research` is also set explicitly by the run
 *   that empties a queue;
 * - when no queue is flagged but nothing is buildable anywhere (every remaining item is
 *   blocked or dated), the pipeline is starved: `needsResearch()` then lists the open queues
 *   with no buildable item, oldest `updated` first, so a build slot researches instead of
 *   idling (2026-10-01: both build slots found `next` null and `empty` [] and did nothing);
 * - a `finished` queue is a venture with no more work; the weekly exchange routine may reopen
 *   it when enhancing that venture scores above starting a new one.
 */

export type QueueStatus = 'open' | 'finished';
export type ItemStatus = 'todo' | 'doing' | 'done' | 'dropped' | 'blocked';
export type IdeaStatus = 'parked' | 'promoted' | 'declined';

export interface QueueItem {
  id: string;
  title: string;
  /** Why it is worth doing: buyer, job, evidence of paying demand. */
  why: string;
  /** Build effort in days (fractions allowed). */
  effort_days: number;
  /** The number that proves it worked, and where it is measured. */
  proof: string;
  /** STRATEGY.md §5 score: evidence × reach ÷ (build days + owner minutes). Higher first. */
  score: number;
  status: ItemStatus;
  /** ISO date the item was added. */
  added: string;
  /**
   * ISO date before which the item is not buildable — a checkpoint that needs elapsed time
   * (a day-30 review) rather than a blocker. It stays `todo` but is not offered by
   * `candidates()`/`nextItem()` until that date.
   */
  not_before?: string;
  done_at?: string;
  /** For `blocked`: what it waits on (a store review, a support ticket, an owner action). */
  blocked_on?: string;
}

export interface VentureQueue {
  venture: string;
  status: QueueStatus;
  needs_research: boolean;
  /** Why the queue is finished (required when status is `finished`). */
  finished_reason?: string;
  updated: string;
  items: QueueItem[];
}

export interface ExchangeIdea {
  id: string;
  title: string;
  why: string;
  status: IdeaStatus;
  /** For parked ideas: the observable condition that promotes them. */
  trigger?: string;
  /** For promoted ideas: which venture queue received the work. */
  venture?: string;
  added: string;
}

export interface Exchange {
  ideas: ExchangeIdea[];
}

export interface Pipeline {
  exchange: Exchange;
  queues: VentureQueue[];
}

const ITEM_STATUSES: ItemStatus[] = ['todo', 'doing', 'done', 'dropped', 'blocked'];
const IDEA_STATUSES: IdeaStatus[] = ['parked', 'promoted', 'declined'];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9][a-z0-9-]*$/;

function fail(where: string, message: string): never {
  throw new Error(`${where}: ${message}`);
}

function str(where: string, o: Record<string, unknown>, key: string, optional = false): string {
  const v = o[key];
  if (v === undefined && optional) return '';
  if (typeof v !== 'string' || (v === '' && !optional)) fail(where, `${key} must be a non-empty string`);
  return v;
}

/** Validates and returns one venture queue parsed from JSON text. */
export function parseQueue(text: string, where = 'queue'): VentureQueue {
  const raw: unknown = JSON.parse(text);
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) fail(where, 'must be an object');
  const o = raw as Record<string, unknown>;
  const venture = str(where, o, 'venture');
  if (!SLUG.test(venture)) fail(where, `venture "${venture}" is not a slug`);
  const status = str(where, o, 'status');
  if (status !== 'open' && status !== 'finished') fail(where, `status must be open|finished`);
  if (typeof o.needs_research !== 'boolean') fail(where, 'needs_research must be a boolean');
  const updated = str(where, o, 'updated');
  if (!ISO_DATE.test(updated)) fail(where, 'updated must be YYYY-MM-DD');
  const finished_reason = str(where, o, 'finished_reason', true);
  if (status === 'finished' && finished_reason === '') fail(where, 'finished queues need finished_reason');
  if (!Array.isArray(o.items)) fail(where, 'items must be an array');
  const ids = new Set<string>();
  const items = o.items.map((it: unknown, i: number): QueueItem => {
    const w = `${where} item[${i}]`;
    if (typeof it !== 'object' || it === null) fail(w, 'must be an object');
    const r = it as Record<string, unknown>;
    const id = str(w, r, 'id');
    if (!SLUG.test(id)) fail(w, `id "${id}" is not a slug`);
    if (ids.has(id)) fail(w, `duplicate id "${id}"`);
    ids.add(id);
    const st = str(w, r, 'status') as ItemStatus;
    if (!ITEM_STATUSES.includes(st)) fail(w, `status must be one of ${ITEM_STATUSES.join('|')}`);
    if (typeof r.effort_days !== 'number' || !(r.effort_days > 0)) fail(w, 'effort_days must be > 0');
    if (typeof r.score !== 'number' || !Number.isFinite(r.score)) fail(w, 'score must be a number');
    const added = str(w, r, 'added');
    if (!ISO_DATE.test(added)) fail(w, 'added must be YYYY-MM-DD');
    const blocked_on = str(w, r, 'blocked_on', true);
    if (st === 'blocked' && blocked_on === '') fail(w, 'blocked items need blocked_on');
    const done_at = str(w, r, 'done_at', true);
    const not_before = str(w, r, 'not_before', true);
    if (not_before !== '' && !ISO_DATE.test(not_before)) fail(w, 'not_before must be YYYY-MM-DD');
    const item: QueueItem = {
      id,
      title: str(w, r, 'title'),
      why: str(w, r, 'why'),
      effort_days: r.effort_days,
      proof: str(w, r, 'proof'),
      score: r.score,
      status: st,
      added,
    };
    if (done_at !== '') item.done_at = done_at;
    if (not_before !== '') item.not_before = not_before;
    if (blocked_on !== '') item.blocked_on = blocked_on;
    return item;
  });
  const queue: VentureQueue = { venture, status, needs_research: o.needs_research, updated, items };
  if (finished_reason !== '') queue.finished_reason = finished_reason;
  return queue;
}

/** Validates and returns the exchange parsed from JSON text. */
export function parseExchange(text: string, where = 'exchange'): Exchange {
  const raw: unknown = JSON.parse(text);
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) fail(where, 'must be an object');
  const o = raw as Record<string, unknown>;
  if (!Array.isArray(o.ideas)) fail(where, 'ideas must be an array');
  const ids = new Set<string>();
  const ideas = o.ideas.map((it: unknown, i: number): ExchangeIdea => {
    const w = `${where} idea[${i}]`;
    if (typeof it !== 'object' || it === null) fail(w, 'must be an object');
    const r = it as Record<string, unknown>;
    const id = str(w, r, 'id');
    if (!SLUG.test(id)) fail(w, `id "${id}" is not a slug`);
    if (ids.has(id)) fail(w, `duplicate id "${id}"`);
    ids.add(id);
    const status = str(w, r, 'status') as IdeaStatus;
    if (!IDEA_STATUSES.includes(status)) fail(w, `status must be one of ${IDEA_STATUSES.join('|')}`);
    const trigger = str(w, r, 'trigger', true);
    if (status === 'parked' && trigger === '') fail(w, 'parked ideas need a trigger');
    const venture = str(w, r, 'venture', true);
    if (status === 'promoted' && venture === '') fail(w, 'promoted ideas need a venture');
    const added = str(w, r, 'added');
    if (!ISO_DATE.test(added)) fail(w, 'added must be YYYY-MM-DD');
    const idea: ExchangeIdea = { id, title: str(w, r, 'title'), why: str(w, r, 'why'), status, added };
    if (trigger !== '') idea.trigger = trigger;
    if (venture !== '') idea.venture = venture;
    return idea;
  });
  return { ideas };
}

/** Today in UTC as YYYY-MM-DD — the clock the queues are dated in. */
export function utcToday(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/**
 * Items the build routine may pick: `todo` items on open queues whose `not_before` has
 * arrived, best score first, oldest first on ties. `today` overrides the clock (tests).
 */
export function candidates(
  queues: VentureQueue[],
  options: { maxEffortDays?: number; today?: string } = {},
): { venture: string; item: QueueItem }[] {
  const cap = options.maxEffortDays ?? Number.POSITIVE_INFINITY;
  const today = options.today ?? utcToday();
  return queues
    .filter((q) => q.status === 'open')
    .flatMap((q) =>
      q.items
        .filter(
          (it) =>
            it.status === 'todo' &&
            it.effort_days <= cap &&
            (it.not_before === undefined || it.not_before <= today),
        )
        .map((item) => ({ venture: q.venture, item })),
    )
    .sort((a, b) => b.item.score - a.item.score || a.item.added.localeCompare(b.item.added));
}

/** The next item to build (optionally only items up to `maxEffortDays`), or undefined when nothing qualifies. */
export function nextItem(
  queues: VentureQueue[],
  options: { maxEffortDays?: number; today?: string } = {},
): { venture: string; item: QueueItem } | undefined {
  return candidates(queues, options)[0];
}

/** An open queue is empty when nothing is todo, doing or blocked (done/dropped do not count). */
export function isEmpty(queue: VentureQueue): boolean {
  return !queue.items.some((it) => it.status === 'todo' || it.status === 'doing' || it.status === 'blocked');
}

/**
 * Open queues with no item the build routine could pick today: everything left is blocked or
 * waits on a `not_before` date. Oldest `updated` first, so research rotates between ventures.
 */
export function starved(queues: VentureQueue[], options: { today?: string } = {}): VentureQueue[] {
  return queues
    .filter((q) => q.status === 'open' && candidates([q], options).length === 0)
    .sort((a, b) => a.updated.localeCompare(b.updated) || a.venture.localeCompare(b.venture));
}

/**
 * Open queues that need research before anything can be built for that venture: the flagged
 * or empty ones, else — only when nothing at all is buildable — the starved ones (see above).
 * `today` overrides the clock (tests).
 */
export function needsResearch(queues: VentureQueue[], options: { today?: string } = {}): VentureQueue[] {
  const flagged = queues.filter((q) => q.status === 'open' && (q.needs_research || isEmpty(q)));
  if (flagged.length > 0 || nextItem(queues, options) !== undefined) return flagged;
  return starved(queues, options);
}

export function formatPipeline(pipeline: Pipeline): string {
  const lines: string[] = [];
  const today = utcToday();
  const research = new Set(needsResearch(pipeline.queues, { today }).map((q) => q.venture));
  for (const q of pipeline.queues) {
    const count = (s: ItemStatus): number => q.items.filter((it) => it.status === s).length;
    const flag = q.status === 'finished' ? 'finished' : research.has(q.venture) ? 'open — NEEDS RESEARCH' : 'open';
    lines.push(
      `${q.venture.padEnd(18)} ${flag.padEnd(22)} todo ${count('todo')}  doing ${count('doing')}  blocked ${count('blocked')}  done ${count('done')}`,
    );
  }
  const next = nextItem(pipeline.queues, { today });
  lines.push(
    next
      ? `next: ${next.venture} / ${next.item.id} (score ${next.item.score}) — ${next.item.title}`
      : `next: nothing to build — research ${[...research][0] ?? 'needed'}${research.size > 0 ? ' (pipeline starved: every open item is blocked or dated)' : ''}`,
  );
  const scheduled = pipeline.queues
    .filter((q) => q.status === 'open')
    .flatMap((q) => q.items.filter((it) => it.status === 'todo' && it.not_before !== undefined && it.not_before > today).map((it) => `${q.venture}/${it.id} on ${it.not_before!}`));
  if (scheduled.length > 0) lines.push(`scheduled: ${scheduled.join(', ')}`);
  const parked = pipeline.exchange.ideas.filter((i) => i.status === 'parked').length;
  lines.push(`exchange: ${pipeline.exchange.ideas.length} idea(s), ${parked} parked`);
  return lines.join('\n');
}
