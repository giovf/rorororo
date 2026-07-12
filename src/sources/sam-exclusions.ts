import { z } from 'zod';
import { csvRows } from './csv';
import fixtureRecords from './fixtures/sam-exclusions.json';
import type { DataSource } from './types';

// US SAM.gov Exclusions (debarment) — every party excluded from US federal
// awards, from GSA's official Exclusions API v4 (task 40).
//
// Ingest is the asynchronous EXTRACT flow (the paged JSON API caps at 10k of
// ~168k records): request a CSV extract, poll the tokenised download URL,
// then stream-parse it (gzip → csvRows) — the dataset is ~68MB normalized,
// far past Worker memory, so this is a storage:'d1' source with fetchStream.
//
// Data posture (terms reviewed 2026-07-12, logged on task 40): exclusion
// records are US-government works (public domain), BUT (a) the D&B Open Data
// fields (all addresses; legal-name provenance pre-2022) may not be
// disseminated in bulk — every address column is DROPPED at ingest (live
// extract verified 2026-07-13: dnbOpenData is null on all 167,695 active
// records, so residual D&B exposure is nil); (b) individual exclusions are
// personal data served for compliance purposes — same task-38 posture as
// uk-sanctions: no SSN/TIN/NPI, no addresses, no free-text comments, ever.
// Requires SAM_API_KEY (rotate every 90 days per SAM account terms; RUNBOOK).

const LIST_URL = 'https://api.sam.gov/entity-information/v4/exclusions';
const POLL_ATTEMPTS = 10;
const POLL_DELAY_MS = 20_000;

export const samExclusionsRecordSchema = z.object({
  /** Excluded party's name as designated (entityName; individuals included). */
  name: z.string(),
  /** Individual | Firm | Special Entity Designation | Vessel. */
  classification: z.string().nullable(),
  exclusion_type: z.string().nullable(),
  /** Reciprocal | Procurement | Nonprocurement. */
  exclusion_program: z.string().nullable(),
  excluding_agency: z.string().nullable(),
  excluding_agency_name: z.string().nullable(),
  uei_sam: z.string().nullable(),
  cage_code: z.string().nullable(),
  activation_date: z.string().nullable(),
  termination_date: z.string().nullable(),
  termination_type: z.string().nullable(),
});

export type SamExclusionsRecord = z.infer<typeof samExclusionsRecordSchema>;

/** Extract cells use '' AND the literal string 'null' for absent values. */
function clean(value: string | undefined): string | null {
  const trimmed = (value ?? '').trim();
  return trimmed === '' || trimmed.toLowerCase() === 'null' ? null : trimmed;
}

/** MM-DD-YYYY (SAM extract format) → YYYY-MM-DD; anything else → null. */
function isoDate(raw: string | null): string | null {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(raw ?? '');
  return match ? `${match[3]}-${match[1]}-${match[2]}` : null;
}

const REQUIRED_COLUMNS = [
  'classificationType',
  'exclusionType',
  'exclusionProgram',
  'excludingAgencyCode',
  'entityName',
  'activateDate',
] as const;

function normalizeRow(cols: string[], idx: Map<string, number>): SamExclusionsRecord | null {
  const col = (name: string): string | null => clean(cols[idx.get(name) ?? -1]);
  const name = col('entityName');
  if (!name) return null;
  return {
    name,
    classification: col('classificationType'),
    exclusion_type: col('exclusionType'),
    exclusion_program: col('exclusionProgram'),
    excluding_agency: col('excludingAgencyCode'),
    excluding_agency_name: col('excludingAgencyName'),
    uei_sam: col('ueiSAM'),
    cage_code: col('cageCode'),
    activation_date: isoDate(col('activateDate')),
    termination_date: isoDate(col('terminationDate')),
    termination_type: col('terminationType'),
  };
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

// Abort decompression if the extract expands past this — the real active
// dataset is ~68MB; this bounds a gzip-bomb from a compromised origin.
const MAX_DECOMPRESSED_BYTES = 256 * 1024 * 1024;

/** Caps the total bytes read from a stream, aborting past the limit. */
function byteCapTransform(limit: number): TransformStream<Uint8Array, Uint8Array> {
  let seen = 0;
  return new TransformStream({
    transform(chunk, controller) {
      seen += chunk.byteLength;
      if (seen > limit) {
        controller.error(new Error(`decompressed body exceeded ${limit} bytes`));
        return;
      }
      controller.enqueue(chunk);
    },
  });
}

/** Sniff the extract body: gzip (magic 1f 8b) → decompress; else use as-is. */
async function csvStream(body: ReadableStream<Uint8Array>): Promise<ReadableStream<Uint8Array>> {
  const [probe, rest] = body.tee();
  const reader = probe.getReader();
  const { value } = await reader.read();
  await reader.cancel();
  const isGzip = value !== undefined && value.length >= 2 && value[0] === 0x1f && value[1] === 0x8b;
  return isGzip
    ? rest
        .pipeThrough(new DecompressionStream('gzip'))
        .pipeThrough(byteCapTransform(MAX_DECOMPRESSED_BYTES))
    : rest;
}

async function requestExtractUrl(key: string): Promise<string> {
  // Key travels in the query string (SAM-mandated). Encoded for robustness;
  // NB: this URL and the derived download URL carry the live key — never log
  // or throw them (only status codes are surfaced below).
  const res = await fetch(`${LIST_URL}?api_key=${encodeURIComponent(key)}&isActive=Y&format=csv`, {
    headers: { 'user-agent': 'gankdat.com data refresh' },
    redirect: 'manual',
  });
  if (!res.ok) throw new Error(`SAM extract request failed: ${res.status}`);
  const text = await res.text();
  const match =
    /(https:\/\/api\.sam\.gov\/entity-information\/v\d+\/download-exclusions\?\S+token=[A-Za-z0-9]+)/.exec(
      text,
    );
  if (!match) throw new Error('SAM extract response had no download URL');
  return match[1]!.replace('REPLACE_WITH_API_KEY', key);
}

async function* streamFromOrigin(key: string): AsyncGenerator<SamExclusionsRecord> {
  const downloadUrl = await requestExtractUrl(key);
  for (let attempt = 1; attempt <= POLL_ATTEMPTS; attempt += 1) {
    // redirect:'manual' — the URL carries the key; don't follow a redirect off
    // api.sam.gov (host is regex-pinned, but this closes the redirect vector).
    const res = await fetch(downloadUrl, {
      headers: { 'user-agent': 'gankdat.com data refresh' },
      redirect: 'manual',
    });
    if (res.ok && res.body) {
      // A not-ready response can still be 200 with a small text body; the
      // header check below rejects it and we keep polling.
      const stream = await csvStream(res.body);
      let idx: Map<string, number> | null = null;
      let yielded = 0;
      for await (const row of csvRows(stream)) {
        if (idx === null) {
          idx = new Map(row.map((column, i) => [column.trim(), i]));
          const missing = REQUIRED_COLUMNS.filter((column) => !idx!.has(column));
          if (missing.length > 0) {
            if (attempt === POLL_ATTEMPTS) {
              throw new Error(`SAM extract format changed — missing: ${missing.join(', ')}`);
            }
            idx = null;
            break; // not the CSV yet (extract still generating) — poll again
          }
          continue;
        }
        const record = normalizeRow(row, idx);
        if (record) {
          yielded += 1;
          yield record;
        }
      }
      if (idx !== null) {
        if (yielded === 0) throw new Error('SAM extract parsed 0 records');
        return;
      }
    }
    await sleep(POLL_DELAY_MS);
  }
  throw new Error(`SAM extract not ready after ${POLL_ATTEMPTS} polls`);
}

function apiKey(env: CloudflareBindings): string {
  // String() so the check survives the generated literal binding type.
  const key = String(env.SAM_API_KEY ?? '');
  if (key === '') throw new Error('SAM_API_KEY not configured');
  return key;
}

function fixtures(): SamExclusionsRecord[] {
  return z.array(samExclusionsRecordSchema).parse(fixtureRecords);
}

async function* fetchStream(env: CloudflareBindings): AsyncIterable<SamExclusionsRecord> {
  let yielded = 0;
  try {
    for await (const record of streamFromOrigin(apiKey(env))) {
      yielded += 1;
      yield record;
    }
  } catch (err) {
    // Only fall back if the stream failed BEFORE yielding anything. A mid-stream
    // failure has already fed partial real rows to the D1 loader; appending
    // fixtures would build a real/fixture hybrid generation.
    if (yielded === 0 && String(env.FIXTURE_FALLBACK) === 'true') {
      console.log(
        JSON.stringify({
          level: 'warn',
          event: 'fixture_fallback',
          source: 'sam-exclusions',
          reason: err instanceof Error ? err.message : String(err),
        }),
      );
      yield* fixtures();
      return;
    }
    throw err;
  }
}

export const samExclusionsSource: DataSource<SamExclusionsRecord> = {
  slug: 'sam-exclusions',
  title: 'US federal exclusions (SAM.gov)',
  description:
    'Every active exclusion (debarment) on the official US SAM.gov list — individuals, firms, special entities, and vessels barred from federal awards, with agency, program, and dates — normalized for supplier due diligence. Served as published by the US government for compliance purposes; all addresses, identifiers (SSN/TIN/NPI), and free-text comments are dropped at ingest.',
  storage: 'd1',
  stats: {
    date: { field: 'activation_date', title: 'Exclusion actions by month' },
    groupBy: [
      { field: 'classification', title: 'By classification' },
      { field: 'excluding_agency', title: 'Most active excluding agencies' },
      { field: 'exclusion_program', title: 'By exclusion program' },
    ],
  },
  recordSchema: samExclusionsRecordSchema,
  queryParams: z.object({
    name: z.string().optional(),
    classification: z.string().optional(),
    exclusion_type: z.string().optional(),
    exclusion_program: z.string().optional(),
    excluding_agency: z.string().optional(),
    excluding_agency_name: z.string().optional(),
    uei_sam: z.string().optional(),
    cage_code: z.string().optional(),
    activation_date_after: z.iso.date().optional(),
    activation_date_before: z.iso.date().optional(),
    termination_date_after: z.iso.date().optional(),
    termination_date_before: z.iso.date().optional(),
  }),
  refresh: { cron: '0 5 * * *', cacheTtlSeconds: 86_400 },
  fetchStream,
  // Materializing path for callers that need an array (dev tooling); the D1
  // refresh always prefers fetchStream above.
  async fetchFresh(env: CloudflareBindings): Promise<SamExclusionsRecord[]> {
    const records: SamExclusionsRecord[] = [];
    for await (const record of fetchStream(env)) records.push(record);
    return records;
  },
};
