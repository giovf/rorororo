export const APP_VERSION = '0.1.0';

// Placeholder free-tier size (PRD open question #5 — pricing is launch config).
export const FREE_TIER_CREDITS = 250;

// Public base URL — used in OpenAPI server, error docs_url, Stripe checkout
// redirects, and MCP/x402 messages. Swap for the custom domain when set up.
export const API_BASE_URL = 'https://faceless-api.faceless-api.workers.dev';
export const DOCS_ERRORS_URL = `${API_BASE_URL}/docs`;
