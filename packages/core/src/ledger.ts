/**
 * The ledger (`docs/LEDGER.md`) is the source of truth for money in and out.
 * It is a markdown table under an `## Entries` heading:
 *
 * | Date       | Venture   | Kind    | GBP  | Note |
 * |------------|-----------|---------|------|------|
 * | 2026-09-17 | portfolio | planned | 3.70 | Chrome Web Store developer fee ($5) |
 *
 * `cost` is money already spent, `planned` is committed-but-unspent budget,
 * `revenue` is money received (net of platform fees).
 */
export type LedgerKind = 'cost' | 'planned' | 'revenue';

export interface LedgerRow {
  date: string;
  venture: string;
  kind: LedgerKind;
  gbp: number;
  note: string;
}

export interface LedgerSummary {
  spent: number;
  planned: number;
  revenue: number;
  /** revenue − spent */
  net: number;
  /** spent + planned, the number the capital cap applies to */
  committed: number;
  overCap: boolean;
}

export const CAPITAL_CAP_GBP = 100;

const KINDS: ReadonlySet<string> = new Set<LedgerKind>(['cost', 'planned', 'revenue']);
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
      throw new Error(`${where}: kind must be cost | planned | revenue`);
    }
    const gbp = Number(gbpText);
    if (gbpText === undefined || gbpText.length === 0 || !Number.isFinite(gbp) || gbp < 0) {
      throw new Error(`${where}: GBP must be a non-negative number`);
    }
    rows.push({ date, venture, kind: kind as LedgerKind, gbp, note });
  }
  return rows;
}

export function summarizeLedger(rows: LedgerRow[], capGbp = CAPITAL_CAP_GBP): LedgerSummary {
  const sum = (kind: LedgerKind): number =>
    rows.filter((r) => r.kind === kind).reduce((acc, r) => acc + r.gbp, 0);
  const spent = round2(sum('cost'));
  const planned = round2(sum('planned'));
  const revenue = round2(sum('revenue'));
  const committed = round2(spent + planned);
  return { spent, planned, revenue, net: round2(revenue - spent), committed, overCap: committed > capGbp };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
