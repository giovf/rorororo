/**
 * The ledger (`docs/LEDGER.md`) is the source of truth for money in and out.
 * It is a markdown table under an `## Entries` heading:
 *
 * | Date       | Venture   | Kind    | GBP  | Note |
 * |------------|-----------|---------|------|------|
 * | 2026-09-17 | portfolio | planned | 3.70 | Chrome Web Store developer fee ($5) |
 *
 * `cost` is money already spent, `planned` is committed-but-unspent budget,
 * `revenue` is money received (net of platform fees), `contingent` is money that will be spent
 * only when a stated condition is met (the ICO fee once the first customer pays) — shown, not
 * counted against the cap until the condition holds and the row becomes `planned`.
 *
 * The cap (owner, 2026-10-10): the owner's net outlay never exceeds £100 — `spent + planned`
 * may pass the cap only by what revenue has already brought in, so anything beyond the cap
 * comes out of profit. A `## Recurring` table (Venture | GBP/month | Note) names the standing
 * monthly costs so the check can say how many months of headroom are left.
 */
export type LedgerKind = 'cost' | 'planned' | 'revenue' | 'contingent';

export interface LedgerRow {
  date: string;
  venture: string;
  kind: LedgerKind;
  gbp: number;
  note: string;
}

export interface RecurringRow {
  venture: string;
  gbpPerMonth: number;
  note: string;
}

export interface LedgerSummary {
  spent: number;
  planned: number;
  revenue: number;
  /** `contingent` rows: condition-gated spend, shown but outside `committed` */
  contingent: number;
  /** revenue − spent */
  net: number;
  /** spent + planned, the number the capital cap applies to */
  committed: number;
  /** cap + revenue: what `committed` may reach (spend past the cap comes out of profit) */
  allowance: number;
  /** allowance − committed */
  headroom: number;
  /** standing monthly cost from the Recurring table */
  recurringMonthly: number;
  /** headroom ÷ recurringMonthly, or null when nothing recurs */
  runwayMonths: number | null;
  overCap: boolean;
}

export const CAPITAL_CAP_GBP = 100;
/** Fewer months of headroom than this and the check warns (the review has time to act). */
export const RUNWAY_WARN_MONTHS = 3;

const KINDS: ReadonlySet<string> = new Set<LedgerKind>(['cost', 'planned', 'revenue', 'contingent']);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Parses the entries table. Throws a message naming the first bad line. */
export function parseLedger(markdown: string): LedgerRow[] {
  const lines = markdown.split('\n');
  const start = lines.findIndex((l) => /^##\s+Entries\b/.test(l));
  if (start === -1) throw new Error('ledger has no "## Entries" section');
  const rows: LedgerRow[] = [];
  let sawHeader = false;
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i] ?? '';
    if (/^#{1,6}\s/.test(line)) break;
    if (!line.trim().startsWith('|')) continue;
    const cells = line
      .trim()
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((c) => c.trim());
    if (!sawHeader) {
      sawHeader = true;
      continue;
    }
    if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
    const [date, venture, kind, gbpText, note = ''] = cells;
    const where = `LEDGER.md line ${i + 1}`;
    if (cells.length < 4) throw new Error(`${where}: expected 5 columns`);
    if (date === undefined || !ISO_DATE.test(date)) {
      throw new Error(`${where}: date must be YYYY-MM-DD`);
    }
    if (venture === undefined || venture.length === 0) {
      throw new Error(`${where}: venture is empty`);
    }
    if (kind === undefined || !KINDS.has(kind)) {
      throw new Error(`${where}: kind must be cost | planned | revenue | contingent`);
    }
    const gbp = Number(gbpText);
    if (gbpText === undefined || gbpText.length === 0 || !Number.isFinite(gbp) || gbp < 0) {
      throw new Error(`${where}: GBP must be a non-negative number`);
    }
    rows.push({ date, venture, kind: kind as LedgerKind, gbp, note });
  }
  return rows;
}

/** The `## Recurring` table (Venture | GBP/month | Note); an absent section is no recurring cost. */
export function parseRecurring(markdown: string): RecurringRow[] {
  const lines = markdown.split('\n');
  const start = lines.findIndex((l) => /^##\s+Recurring\b/.test(l));
  if (start === -1) return [];
  const rows: RecurringRow[] = [];
  let sawHeader = false;
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i] ?? '';
    if (/^#{1,6}\s/.test(line)) break;
    if (!line.trim().startsWith('|')) continue;
    const cells = line
      .trim()
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((c) => c.trim());
    if (!sawHeader) {
      sawHeader = true;
      continue;
    }
    if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
    const [venture, gbpText, note = ''] = cells;
    const where = `LEDGER.md line ${i + 1}`;
    if (venture === undefined || venture.length === 0) throw new Error(`${where}: venture is empty`);
    const gbp = Number(gbpText);
    if (gbpText === undefined || gbpText.length === 0 || !Number.isFinite(gbp) || gbp < 0) {
      throw new Error(`${where}: GBP/month must be a non-negative number`);
    }
    rows.push({ venture, gbpPerMonth: gbp, note });
  }
  return rows;
}

export function summarizeLedger(
  rows: LedgerRow[],
  capGbp = CAPITAL_CAP_GBP,
  recurring: RecurringRow[] = [],
): LedgerSummary {
  const sum = (kind: LedgerKind): number =>
    rows.filter((r) => r.kind === kind).reduce((acc, r) => acc + r.gbp, 0);
  const spent = round2(sum('cost'));
  const planned = round2(sum('planned'));
  const revenue = round2(sum('revenue'));
  const contingent = round2(sum('contingent'));
  const committed = round2(spent + planned);
  const allowance = round2(capGbp + revenue);
  const headroom = round2(allowance - committed);
  const recurringMonthly = round2(recurring.reduce((acc, r) => acc + r.gbpPerMonth, 0));
  return {
    spent,
    planned,
    revenue,
    contingent,
    net: round2(revenue - spent),
    committed,
    allowance,
    headroom,
    recurringMonthly,
    runwayMonths: recurringMonthly > 0 ? Math.floor(headroom / recurringMonthly) : null,
    overCap: committed > allowance,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
