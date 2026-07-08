export const APP_VERSION = '0.1.0';

// Placeholder free-tier size (PRD open question #5 — pricing is launch config).
export const FREE_TIER_CREDITS = 250;

// Public base URL. API_BASE_URL is the default (workers.dev); PUBLIC_BASE_URL
// overrides it at runtime for the correctness-critical URLs (magic-link sign-in
// + Stripe redirects) so pointing a custom domain (e.g. faceless.com) at the
// Worker is a config change, not a code change. OpenAPI server/docs_url display
// strings stay on the default until the domain lands.
export const API_BASE_URL = 'https://faceless-api.faceless-api.workers.dev';
export const DOCS_ERRORS_URL = `${API_BASE_URL}/docs`;

export function publicBaseUrl(env: CloudflareBindings): string {
  return env.PUBLIC_BASE_URL || API_BASE_URL;
}
