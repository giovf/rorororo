import { vi } from 'vitest';

const PLANNING_ORIGIN = 'https://www.planning.data.gov.uk/entity.json';
const TENDERS_ORIGIN = 'https://www.find-tender.service.gov.uk/api/1.0/ocdsReleasePackages';
const SANCTIONS_ORIGIN = 'https://sanctionslist.fcdo.gov.uk/docs/UK-Sanctions-List.csv';

/**
 * Tests run in the same isolate as the worker under test, so stubbing the
 * global fetch intercepts the worker's outbound origin calls (bindings like
 * KV/D1 are unaffected — they don't go through global fetch).
 */
export function stubOrigins(handlers: {
  planning?: () => Response;
  tenders?: () => Response;
  sanctions?: () => Response;
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
