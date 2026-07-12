import { vi } from 'vitest';

const PLANNING_ORIGIN = 'https://www.planning.data.gov.uk/entity.json';
const TENDERS_ORIGIN = 'https://www.find-tender.service.gov.uk/api/1.0/ocdsReleasePackages';
const SANCTIONS_ORIGIN = 'https://sanctionslist.fcdo.gov.uk/docs/UK-Sanctions-List.csv';
const EU_TED_ORIGIN = 'https://api.ted.europa.eu/v3/notices/search';
const SAM_DOWNLOAD_ORIGIN = 'https://api.sam.gov/entity-information/v4/download-exclusions';
const SAM_EXTRACT_ORIGIN = 'https://api.sam.gov/entity-information/v4/exclusions';
const GAZETTE_ORIGIN = 'https://www.thegazette.co.uk/insolvency/notice/data.json';

/**
 * Tests run in the same isolate as the worker under test, so stubbing the
 * global fetch intercepts the worker's outbound origin calls (bindings like
 * KV/D1 are unaffected — they don't go through global fetch).
 */
export function stubOrigins(handlers: {
  planning?: () => Response;
  tenders?: () => Response;
  sanctions?: () => Response;
  euTed?: () => Response;
  samExtract?: () => Response;
  samDownload?: () => Response;
  gazette?: () => Response;
}): ReturnType<typeof vi.fn> {
  const mock = vi.fn((input: RequestInfo | URL) => {
    const url = String(input instanceof Request ? input.url : input);
    if (url.startsWith(PLANNING_ORIGIN) && handlers.planning) {
      return Promise.resolve(handlers.planning());
    }
    if (url.startsWith(TENDERS_ORIGIN) && handlers.tenders) {
      return Promise.resolve(handlers.tenders());
    }
    if (url.startsWith(SANCTIONS_ORIGIN) && handlers.sanctions) {
      return Promise.resolve(handlers.sanctions());
    }
    if (url.startsWith(EU_TED_ORIGIN) && handlers.euTed) {
      return Promise.resolve(handlers.euTed());
    }
    // download- first: the extract prefix would also match it.
    if (url.startsWith(SAM_DOWNLOAD_ORIGIN) && handlers.samDownload) {
      return Promise.resolve(handlers.samDownload());
    }
    if (url.startsWith(SAM_EXTRACT_ORIGIN) && handlers.samExtract) {
      return Promise.resolve(handlers.samExtract());
    }
    if (url.startsWith(GAZETTE_ORIGIN) && handlers.gazette) {
      return Promise.resolve(handlers.gazette());
    }
    throw new Error(`unexpected outbound fetch in test: ${url}`);
  });
  vi.stubGlobal('fetch', mock);
  return mock;
}

// Minimal non-empty origin payloads. Sources treat a 0-record refresh as an
// origin failure, so stubs that just exercise auth/metering still need ≥1 row.
export function planningResponse(
  entities: unknown[] = [
    { entity: 1, reference: 'A/1', 'organisation-entity': 109, description: 'x' },
  ],
): Response {
  return Response.json({ entities, links: {}, count: entities.length });
}

export function tendersResponse(
  releases: unknown[] = [{ id: 'n/1', ocid: 'ocds-x', tender: { title: 't' } }],
): Response {
  return Response.json({ releases, links: {} });
}
