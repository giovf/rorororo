import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ErrorEnvelope, SuccessEnvelope } from '../src/lib/envelope';
import type { SamExclusionsRecord } from '../src/sources/sam-exclusions';
import { authedFetch, issueKey } from './helpers/auth';
import { stubOrigins } from './helpers/origin-mock';

const SAM_URL = 'https://example.com/v1/data/sam-exclusions';

const EXTRACT_TEXT =
  'Extract File will be available for download with url: ' +
  'https://api.sam.gov/entity-information/v4/download-exclusions?api_key=REPLACE_WITH_API_KEY&token=TESTTOKEN0 ' +
  'in some time. If you have requested for an email notification, you will receive it once the file is ready for download.';

const CSV = [
  'classificationType,exclusionType,exclusionProgram,excludingAgencyCode,excludingAgencyName,ueiSAM,cageCode,entityName,activateDate,terminationDate,terminationType',
  'Firm,Prohibition/Restriction,Reciprocal,TREAS-OFAC,"TREASURY, OFAC",UEI123456789,null,ACME SANCTIONED LLC,03-15-2026,03-15-2027,Definite',
  'Individual,Ineligible (Proceedings Complete),Reciprocal,DOJ,"JUSTICE, DEPARTMENT OF",null,null,Jane Q Debarred,01-05-2025,12-31-2199,Indefinite',
  'Vessel,Prohibition/Restriction,Reciprocal,OFAC,"OFFICE OF FOREIGN ASSETS CONTROL","null",null,"FISHING, VESSEL ONE",06-01-2026,06-01-2036,Definite',
  'Firm,Preliminarily Ineligible (Proceedings Pending),Procurement,EPA,ENVIRONMENTAL PROTECTION AGENCY,null,1ABC2,,02-02-2026,null,null',
].join('\n');

function gzipped(text: string): Response {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Response(stream);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('GET /v1/data/sam-exclusions', () => {
  it('runs the extract flow, gunzips, normalizes, and never serves dropped fields', async () => {
    stubOrigins({
      samExtract: () => new Response(EXTRACT_TEXT),
      samDownload: () => gzipped(CSV),
    });
    const res = await authedFetch(SAM_URL);
    expect(res.status).toBe(200);
    const text = await res.text();
    // D&B / personal-data strip: address, identifier, and comment fields must
    // never appear in any response, in any casing.
    for (const banned of ['addressLine', 'zipCode', 'ssn', 'npi', 'additionalComments', 'city']) {
      expect(text.toLowerCase()).not.toContain(banned.toLowerCase());
    }
    const body = JSON.parse(text) as SuccessEnvelope<SamExclusionsRecord[]>;
    // The empty-entityName row is skipped.
    expect(body.data).toHaveLength(3);
    expect(body.data[0]).toEqual({
      name: 'ACME SANCTIONED LLC',
      classification: 'Firm',
      exclusion_type: 'Prohibition/Restriction',
      exclusion_program: 'Reciprocal',
      excluding_agency: 'TREAS-OFAC',
      excluding_agency_name: 'TREASURY, OFAC',
      uei_sam: 'UEI123456789',
      cage_code: null,
      activation_date: '2026-03-15',
      termination_date: '2027-03-15',
      termination_type: 'Definite',
    });
    const vessel = body.data.find((r) => r.classification === 'Vessel');
    expect(vessel?.name).toBe('FISHING, VESSEL ONE');
    expect(vessel?.uei_sam).toBeNull();
  });

  it('polls until the extract is ready (not-ready body, then CSV)', async () => {
    vi.stubGlobal('setTimeout', ((fn: () => void): number => {
      fn();
      return 0;
    }) as never);
    let downloads = 0;
    stubOrigins({
      samExtract: () => new Response(EXTRACT_TEXT),
      samDownload: () => {
        downloads += 1;
        return downloads < 3 ? new Response('Extract is being generated') : new Response(CSV);
      },
    });
    const res = await authedFetch(SAM_URL);
    expect(res.status).toBe(200);
    expect(downloads).toBe(3);
    const body = (await res.json()) as SuccessEnvelope<SamExclusionsRecord[]>;
    expect(body.data).toHaveLength(3);
  });

  it('filters by name substring, classification, and activation date', async () => {
    stubOrigins({
      samExtract: () => new Response(EXTRACT_TEXT),
      samDownload: () => new Response(CSV),
    });
    const { key } = await issueKey();

    const byName = (await (
      await authedFetch(`${SAM_URL}?name=acme`, key)
    ).json()) as SuccessEnvelope<SamExclusionsRecord[]>;
    expect(byName.data.map((r) => r.name)).toEqual(['ACME SANCTIONED LLC']);

    const individuals = (await (
      await authedFetch(`${SAM_URL}?classification=Individual`, key)
    ).json()) as SuccessEnvelope<SamExclusionsRecord[]>;
    expect(individuals.data.map((r) => r.name)).toEqual(['Jane Q Debarred']);

    const recent = (await (
      await authedFetch(`${SAM_URL}?activation_date_after=2026-01-01`, key)
    ).json()) as SuccessEnvelope<SamExclusionsRecord[]>;
    expect(recent.data.map((r) => r.name)).toEqual(['ACME SANCTIONED LLC', 'FISHING, VESSEL ONE']);
  });

  it('falls back to bundled fixtures when the origin fails', async () => {
    stubOrigins({ samExtract: () => new Response('nope', { status: 500 }) });
    const res = await authedFetch(SAM_URL);
    expect(res.status).toBe(200);
    const body = (await res.json()) as SuccessEnvelope<SamExclusionsRecord[]>;
    expect(body.meta?.total).toBe(28);
  });

  it('rejects malformed date params with a 400 envelope', async () => {
    const res = await authedFetch(`${SAM_URL}?activation_date_after=recently`);
    expect(res.status).toBe(400);
    const body = (await res.json()) as ErrorEnvelope;
    expect(body.error.code).toBe('bad_request');
  });
});
