// Bounty claim ledger (oss-bounties `bounty-claim-ledger`, 2026-10-11): the `## Claims` table in
// ventures/oss-bounties/RESEARCH.md is the line's record of every bounty the routines took up — issue,
// amount, status, PR, the dates it was opened, merged and paid — kept by the build and burn-down
// routines in the commit that moves a claim. This script validates the table and prints the numbers
// STRATEGY §4 and the kill rule in RESEARCH §5 read (claims opened, merged, paid; merged PRs unpaid
// for 60 days), plus the one `week:` line the weekly report copies.
//
// Why a script: the first bounty board (2026-10-11) produced three reads and three drops and nothing
// recorded them; the review cannot apply "five merged-quality PRs with no payout in 60 days" to a
// number that lives nowhere, and a hand-kept table drifts (a `paid` row with no merge date). So the
// table has a fixed shape, `npm run check` fails on a malformed row, and the counts are computed.
//
// Run: npm run claims                         → validate, print the totals and the week line, exit 1 on a bad row
//      npm run claims -- --week [YYYY-MM-DD]  → only the `week:` line for the 7 days ending that day (today)
//      npm run claims -- --json               → the rows and totals as JSON
// Node 22 runs .ts directly — keep syntax erasable, import only node builtins.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RESEARCH_FILE = path.join('ventures', 'oss-bounties', 'RESEARCH.md');
export const SECTION = '## Claims';
export const HEADER = '| Issue | Amount | Status | PR | Opened | Merged | Paid | Notes |';
/** RESEARCH §5: this many merged PRs unpaid for KILL_DAYS → the line is finished. */
export const KILL_MERGED_UNPAID = 5;
export const KILL_DAYS = 60;
export const STATUSES = ['reading', 'claimed', 'merged', 'paid', 'rejected', 'dropped'] as const;
export type Status = (typeof STATUSES)[number];
const DAY_MS = 86_400_000;

export interface Claim {
  /** `owner/repo#N` */
  issue: string;
  issueUrl: string;
  /** US dollars, whole. */
  amount: number;
  status: Status;
  prUrl?: string;
  opened?: string;
  merged?: string;
  paid?: string;
  notes: string;
}

export interface Totals {
  rows: number;
  reading: number;
  claimed: number;
  merged: number;
  paid: number;
  paidUsd: number;
  rejected: number;
  dropped: number;
  /** Rows merged at least KILL_DAYS ago with no payout. */
  mergedUnpaidStale: number;
}

export interface WeekTotals {
  to: string;
  opened: number;
  merged: number;
  paid: number;
  paidUsd: number;
  dropped: number;
}

const ISSUE =
  /^\[([\w.-]+\/[\w.-]+)#(\d+)\]\((https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/issues\/\d+)\)$/;
const PR = /^\[#(\d+)\]\((https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+)\)$/;
const AMOUNT = /^\$(\d+)$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const EMPTY = '—';

/** The lines of the `## Claims` section's table (header row, rule, data rows), or undefined when the section is missing. */
export function tableLines(md: string): string[] | undefined {
  const lines = md.split('\n');
  const start = lines.findIndex((l) => l.trim() === SECTION);
  if (start < 0) return undefined;
  const out: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith('## ')) break;
    if (line.startsWith('|')) out.push(line);
  }
  return out;
}

function cells(row: string): string[] {
  return row
    .replace(/^\|/, '')
    .replace(/\|\s*$/, '')
    .split('|')
    .map((c) => c.trim());
}

function dateOrNone(cell: string, what: string, problems: string[]): string | undefined {
  if (cell === EMPTY || cell === '') return undefined;
  if (!DATE.test(cell)) problems.push(`${what} is not a date: ${cell}`);
  return cell;
}

/** One table row → a claim, or the problems that make it invalid. */
export function parseRow(row: string): { claim?: Claim; problems: string[] } {
  const c = cells(row);
  const problems: string[] = [];
  if (c.length !== 8) return { problems: [`expected 8 cells, found ${c.length}`] };
  const [issueCell, amountCell, statusCell, prCell, openedCell, mergedCell, paidCell, notes] =
    c as [string, string, string, string, string, string, string, string];
  const issue = ISSUE.exec(issueCell);
  if (!issue)
    problems.push(
      `issue must be [owner/repo#N](https://github.com/owner/repo/issues/N): ${issueCell}`,
    );
  const amount = AMOUNT.exec(amountCell);
  if (!amount) problems.push(`amount must be $N: ${amountCell}`);
  if (!(STATUSES as readonly string[]).includes(statusCell))
    problems.push(`status must be one of ${STATUSES.join(', ')}: ${statusCell}`);
  const status = statusCell as Status;
  const pr = prCell === EMPTY ? undefined : PR.exec(prCell);
  if (prCell !== EMPTY && !pr)
    problems.push(`PR must be — or [#N](https://github.com/owner/repo/pull/N): ${prCell}`);
  const opened = dateOrNone(openedCell, 'Opened', problems);
  const merged = dateOrNone(mergedCell, 'Merged', problems);
  const paid = dateOrNone(paidCell, 'Paid', problems);
  if (['claimed', 'merged', 'paid', 'rejected'].includes(status) && !pr)
    problems.push(`a ${status} claim needs its PR`);
  if (pr && !opened) problems.push('a PR needs its Opened date');
  if (!pr && opened) problems.push('Opened without a PR');
  if (['merged', 'paid'].includes(status) && !merged)
    problems.push(`a ${status} claim needs its Merged date`);
  if (status === 'paid' && !paid) problems.push('a paid claim needs its Paid date');
  if (merged && !['merged', 'paid'].includes(status))
    problems.push(`a Merged date on a ${status} claim`);
  if (paid && status !== 'paid') problems.push(`a Paid date on a ${status} claim`);
  if (opened && merged && merged < opened) problems.push('Merged before Opened');
  if (merged && paid && paid < merged) problems.push('Paid before Merged');
  if (['dropped', 'rejected'].includes(status) && notes === '')
    problems.push(`a ${status} claim says why in Notes`);
  if (problems.length > 0 || !issue || !amount) return { problems };
  const claim: Claim = {
    issue: `${issue[1]}#${issue[2]}`,
    issueUrl: issue[3] as string,
    amount: Number(amount[1]),
    status,
    notes,
  };
  if (pr) claim.prUrl = pr[2] as string;
  if (opened) claim.opened = opened;
  if (merged) claim.merged = merged;
  if (paid) claim.paid = paid;
  return { claim, problems };
}

/** Every claim in the file's `## Claims` table, with the problems found (an empty list means the table is valid). */
export function parseClaims(md: string): { claims: Claim[]; problems: string[] } {
  const lines = tableLines(md);
  if (!lines) return { claims: [], problems: [`no \`${SECTION}\` section`] };
  const [header, rule, ...rows] = lines;
  const problems: string[] = [];
  if (header?.replace(/\s+/g, ' ').trim() !== HEADER) problems.push(`header must be ${HEADER}`);
  if (!rule || !/^\|( ?-+ ?\|)+$/.test(rule.replace(/\s+/g, ' ').trim()))
    problems.push('the header rule row is missing');
  const claims: Claim[] = [];
  const seen = new Set<string>();
  rows.forEach((row, i) => {
    const parsed = parseRow(row);
    for (const p of parsed.problems) problems.push(`row ${i + 1}: ${p}`);
    if (parsed.claim) {
      if (seen.has(parsed.claim.issue))
        problems.push(`row ${i + 1}: ${parsed.claim.issue} appears twice`);
      seen.add(parsed.claim.issue);
      claims.push(parsed.claim);
    }
  });
  return { claims, problems };
}

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);
}

export function totals(claims: Claim[], today: string): Totals {
  const t: Totals = {
    rows: claims.length,
    reading: 0,
    claimed: 0,
    merged: 0,
    paid: 0,
    paidUsd: 0,
    rejected: 0,
    dropped: 0,
    mergedUnpaidStale: 0,
  };
  for (const c of claims) {
    t[c.status] += 1;
    if (c.status === 'paid') t.paidUsd += c.amount;
    if (c.status === 'merged' && c.merged && daysBetween(c.merged, today) >= KILL_DAYS)
      t.mergedUnpaidStale += 1;
  }
  return t;
}

/** Counts for the 7 days ending `to` (inclusive), by the date each step happened. */
export function week(claims: Claim[], to: string): WeekTotals {
  const inWeek = (d: string | undefined): boolean =>
    d !== undefined && daysBetween(d, to) >= 0 && daysBetween(d, to) < 7;
  const w: WeekTotals = { to, opened: 0, merged: 0, paid: 0, paidUsd: 0, dropped: 0 };
  for (const c of claims) {
    if (inWeek(c.opened)) w.opened += 1;
    if (inWeek(c.merged)) w.merged += 1;
    if (inWeek(c.paid)) {
      w.paid += 1;
      w.paidUsd += c.amount;
    }
    if (c.status === 'dropped' && inWeek(c.notes.match(/^(\d{4}-\d{2}-\d{2})/)?.[1]))
      w.dropped += 1;
  }
  return w;
}

export function totalsLine(t: Totals): string {
  return `claims: ${t.rows} rows — ${t.reading} reading, ${t.claimed} claimed (PR open), ${t.merged} merged unpaid, ${t.paid} paid (US$${t.paidUsd}), ${t.rejected} rejected, ${t.dropped} dropped`;
}

export function killLine(t: Totals): string {
  return `kill rule: ${t.mergedUnpaidStale} of ${KILL_MERGED_UNPAID} merged PRs unpaid for ${KILL_DAYS} days`;
}

export function weekLine(w: WeekTotals): string {
  return `week to ${w.to}: ${w.opened} PRs opened, ${w.merged} merged, ${w.paid} paid (US$${w.paidUsd}), ${w.dropped} dropped`;
}

export function parseArgs(argv: string[]): { week?: string; json: boolean } {
  const out: { week?: string; json: boolean } = { json: argv.includes('--json') };
  const i = argv.indexOf('--week');
  if (i >= 0)
    out.week =
      argv[i + 1] && DATE.test(argv[i + 1] as string) ? (argv[i + 1] as string) : todayIso();
  return out;
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const md = readFileSync(RESEARCH_FILE, 'utf8');
  const { claims, problems } = parseClaims(md);
  if (problems.length > 0) {
    console.error(`${RESEARCH_FILE} ${SECTION}: ${problems.length} problem(s)`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  const today = args.week ?? todayIso();
  const t = totals(claims, today);
  const w = week(claims, today);
  if (args.json) {
    console.log(JSON.stringify({ claims, totals: t, week: w }, null, 2));
    return;
  }
  if (args.week) {
    console.log(weekLine(w));
    return;
  }
  console.log(totalsLine(t));
  console.log(killLine(t));
  console.log(weekLine(w));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
