import { vi } from 'vitest';

const PLANNING_ORIGIN = 'https://www.planning.data.gov.uk/entity.json';
const TENDERS_ORIGIN = 'https://www.find-tender.service.gov.uk/api/1.0/ocdsReleasePackages';

/**
 * Tests run in the same isolate as the worker under test, so stubbing the
 * global fetch intercepts the worker's outbound origin calls (bindings like
 * KV/D1 are unaffected — they don't go through global fetch).
 */
export function stubOrigins(handlers: {
  planning?: () => Response;
  tenders?: () => Response;
}): ReturnType<typeof vi.fn> {
  const mock = vi.fn((input: RequestInfo | URL) => {
    const url = String(input instanceof Request ? input.url : input);
    if (url.startsWith(PLANNING_ORIGIN) && handlers.planning) {
      return Promise.resolve(handlers.planning());
    }
    if (url.startsWith(TENDERS_ORIGIN) && handlers.tenders) {
      return Promise.resolve(handlers.tenders());
    }
    throw new Error(`unexpected outbound fetch in test: ${url}`);
  });
  vi.stubGlobal('fetch', mock);
  return mock;
}
