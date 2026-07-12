import { z } from 'zod';
import fixtureEntries from './fixtures/uk-insolvency.json';
import type { DataSource } from './types';

// The Gazette — corporate insolvency notices (task 41). Official public
// record, Crown copyright, OGL v3; the OGL grant EXCLUDES personal data, so
// this source is the corporate-only slice with a STRICT structured-field
// whitelist: entry id, title (company name), notice code, category, dates.
// The feed's person fields (f:name / f:familyName) and the free-text content
// HTML (which names insolvency practitioners) are never read — Blind Mode.
//
// Notice-code whitelist verified live 2026-07-13 (per-code category probe):
// the 24xx block is corporate insolvency (moratoria, administrators,
// receivers, liquidators, winding-up, dividends). Excluded: 2403 "Re-use of
// a Prohibited Name" (notice titles are PERSONS, fails Blind Mode) and
// 2437/2440/2448 (no category name published; unverifiable). Personal
// insolvency (25xx bankruptcy, 29xx) is out of scope by design.
//
// Fair-use policy (thegazette.co.uk/data): max 5 requests / 10 seconds and
// an identifiable User-Agent — pages are fetched sequentially with a pacing
// delay, ~10 requests per daily refresh.
const ORIGIN_URL = 'https://www.thegazette.co.uk/insolvency/notice/data.json';
const CORPORATE_NOTICE_CODES = [
  2401, 2402, 2404, 2405, 2406, 2407, 2408, 2409, 2410, 2411, 2412, 2413, 2414, 2421, 2422, 2423,
  2431, 2432, 2433, 2434, 2435, 2441, 2442, 2443, 2444, 2445, 2446, 2447, 2450, 2451, 2452, 2453,
  2454, 2455, 2456, 2457, 2458, 2459, 2460, 2461, 2462, 2463, 2464, 2465,
].join(',');
const PAGE_SIZE = 100;
// Snapshot cap (KV window, same rationale as uk-tenders): the product is the
// freshest corporate-insolvency events, newest-first as the feed returns them.
const MAX_RECORDS = 1000;
const PAGE_DELAY_MS = 2_100;

const categoryShape = z.object({ '@term': z.string().nullish() });
const rawEntrySchema = z.object({
  id: z.string(),
  'f:notice-code': z.coerce.string().nullish(),
  title: z.string().nullish(),
  published: z.string().nullish(),
  updated: z.string().nullish(),
  category: z.union([categoryShape, z.array(categoryShape)]).nullish(),
});

const feedSchema = z.object({
  'f:total': z.coerce.number().nullish(),
  entry: z.union([z.array(z.unknown()), z.unknown()]).nullish(),
});

export const ukInsolvencyRecordSchema = z.object({
  notice_id: z.string(),
  /** Company name as published in the notice title. */
  company: z.string().nullable(),
  notice_code: z.string().nullable(),
  /** Category name, e.g. "Petitions to Wind Up (Companies)". */
  notice_type: z.string().nullable(),
  published_at: z.string().nullable(),
  updated_at: z.string().nullable(),
  notice_url: z.string(),
});

export type UkInsolvencyRecord = z.infer<typeof ukInsolvencyRecordSchema>;

function categoryTerm(raw: z.infer<typeof rawEntrySchema>['category']): string | null {
  if (!raw) return null;
  const first = Array.isArray(raw) ? raw[0] : raw;
  return first?.['@term'] ?? null;
}

function normalize(raw: z.infer<typeof rawEntrySchema>): UkInsolvencyRecord {
  const noticeId = raw.id.slice(raw.id.lastIndexOf('/') + 1);
  return {
    notice_id: noticeId,
    company: raw.title ?? null,
    notice_code: raw['f:notice-code'] ?? null,
    notice_type: categoryTerm(raw.category),
    published_at: raw.published ?? null,
    updated_at: raw.updated ?? null,
    notice_url: `https://www.thegazette.co.uk/notice/${noticeId}`,
  };
}

function mapEntries(entries: unknown[]): UkInsolvencyRecord[] {
  const records: UkInsolvencyRecord[] = [];
  for (const entry of entries) {
    const parsed = rawEntrySchema.safeParse(entry);
    if (parsed.success) records.push(normalize(parsed.data));
  }
  return records;
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchFromOrigin(): Promise<UkInsolvencyRecord[]> {
  const records: UkInsolvencyRecord[] = [];
  const pages = Math.ceil(MAX_RECORDS / PAGE_SIZE);
  for (let page = 1; page <= pages; page += 1) {
    if (page > 1) await sleep(PAGE_DELAY_MS);
    const url = `${ORIGIN_URL}?noticetypes=${CORPORATE_NOTICE_CODES}&results-page-size=${PAGE_SIZE}&results-page=${page}`;
    // No accept header: the Gazette's content negotiation 500s when one is
    // sent alongside the .json path (verified 2026-07-13); the extension
    // alone selects the format.
    const res = await fetch(url, {
      headers: { 'user-agent': 'gankdat.com data refresh (info@gankdat.com)' },
    });
    if (!res.ok) throw new Error(`thegazette.co.uk responded ${res.status}`);
    const feed = feedSchema.parse(await res.json());
    const entries =
      feed.entry === undefined || feed.entry === null
        ? []
        : Array.isArray(feed.entry)
          ? feed.entry
          : [feed.entry];
    records.push(...mapEntries(entries));
    if (entries.length < PAGE_SIZE) break;
  }
  return records.slice(0, MAX_RECORDS);
}

export const ukInsolvencySource: DataSource<UkInsolvencyRecord> = {
  slug: 'uk-insolvency',
  title: 'UK corporate insolvency notices',
  description:
    'The latest corporate insolvency notices from The Gazette (official UK public record) — winding-up petitions and orders, administrator, receiver and liquidator appointments, moratoria, and creditor notices, company-level facts only. Blind Mode: person fields and notice text in the source are never ingested.',
  stats: {
    date: { field: 'published_at', title: 'Notices published by month' },
    groupBy: [
      { field: 'notice_type', title: 'By notice type' },
      { field: 'notice_code', title: 'By notice code' },
    ],
  },
  recordSchema: ukInsolvencyRecordSchema,
  queryParams: z.object({
    company: z.string().optional(),
    notice_type: z.string().optional(),
    notice_code: z.string().optional(),
    published_at_after: z.iso.date().optional(),
    published_at_before: z.iso.date().optional(),
  }),
  refresh: { cron: '0 5 * * *', cacheTtlSeconds: 86_400 },
  fetchFresh: async (env) => {
    try {
      return await fetchFromOrigin();
    } catch (err) {
      // String() so the check survives the generated literal binding type
      // (prod pins FIXTURE_FALLBACK="false"); local dev / tests set "true".
      if (String(env.FIXTURE_FALLBACK) === 'true') {
        console.log(
          JSON.stringify({
            level: 'warn',
            event: 'fixture_fallback',
            source: 'uk-insolvency',
            reason: err instanceof Error ? err.message : String(err),
          }),
        );
        return mapEntries(fixtureEntries);
      }
      throw err;
    }
  },
};
