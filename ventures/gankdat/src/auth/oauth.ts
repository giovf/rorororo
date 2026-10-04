// Lazy OAuth for the MCP server (build routine 2026-09-30, exchange 2026-W40
// item 2). Claude (web, desktop, mobile, Code, Cowork), Cursor and ChatGPT's
// Apps SDK start sign-in ONLY when a tools/call fails at the HTTP layer with
// 401 + `WWW-Authenticate: Bearer resource_metadata=…`; a 200 tool error never
// does. So gankdat is now its own small authorization server:
//
//   /.well-known/oauth-protected-resource[/mcp]   RFC 9728 — who issues tokens
//   /.well-known/oauth-authorization-server       RFC 8414 — where /authorize + /token are
//   /authorize   CIMD (draft-ietf-oauth-client-id-metadata-document): the
//                client_id IS an https URL; we fetch it, check redirect_uri
//                against the document, and render consent on the magic-link
//                session. No client database, no dynamic registration.
//   /token       PKCE S256, public clients only (token_endpoint_auth_method
//                none), rotating refresh tokens, invalid_grant on replay.
//
// Tokens are mapped to an API key on the account (named `oauth:<client host>`,
// created at consent, visible and revocable at /account), so plan, credits,
// rate limits and metering apply exactly as for a pasted key — an access token
// resolves to the same KeyContext as a key (auth/middleware.ts). Only SHA-256
// hashes of codes and tokens are stored (migration 0013).

import { generateKey, hashKey } from './keys';
import { FREE_TIER_CREDITS, publicBaseUrl } from '../lib/constants';

/** The one scope: query datasets and change feeds with the account's credits. */
export const OAUTH_SCOPE = 'data:read';
export const ACCESS_TOKEN_PREFIX = 'gkat_';
const REFRESH_TOKEN_PREFIX = 'gkrt_';
const CODE_PREFIX = 'gkac_';

export const ACCESS_TTL_SECONDS = 3600;
const REFRESH_TTL_MS = 30 * 24 * 3600 * 1000;
const CODE_TTL_MS = 5 * 60 * 1000;
/** A pending /authorize request lives this long (the magic-link email is 15 min). */
const REQUEST_TTL_MS = 30 * 60 * 1000; // email delivery + the magic-link hop; was 15 min
/** CIMD documents are re-fetched after this (Claude's own discovery cache is ~5 min). */
const CLIENT_METADATA_TTL_SECONDS = 600;
const CLIENT_METADATA_MAX_BYTES = 64 * 1024;
const CLIENT_FETCH_TIMEOUT_MS = 5000;
/** KV hot path for access tokens, same bound as keys (revocation lag ≤ this). */
const TOKEN_CACHE_TTL_SECONDS = 60;

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

// ── Discovery documents ──────────────────────────────────────────────────

export function resourceUrl(env: CloudflareBindings): string {
  return `${publicBaseUrl(env)}/mcp`;
}

export function resourceMetadataUrl(env: CloudflareBindings): string {
  return `${publicBaseUrl(env)}/.well-known/oauth-protected-resource/mcp`;
}

/** RFC 9728: names /mcp as the resource and this origin as its issuer. */
export function protectedResourceMetadata(env: CloudflareBindings): Record<string, unknown> {
  const base = publicBaseUrl(env);
  return {
    resource: resourceUrl(env),
    authorization_servers: [base],
    scopes_supported: [OAUTH_SCOPE],
    bearer_methods_supported: ['header'],
    resource_name: 'gankdat',
    resource_documentation: `${base}/docs#claude`,
  };
}

/**
 * RFC 8414. Claude picks CIMD only when BOTH `client_id_metadata_document_supported`
 * and `"none"` in `token_endpoint_auth_methods_supported` are present (its CIMD
 * client is a public client); otherwise it looks for a registration endpoint we
 * do not have.
 */
export function authorizationServerMetadata(env: CloudflareBindings): Record<string, unknown> {
  const base = publicBaseUrl(env);
  return {
    issuer: base,
    authorization_endpoint: `${base}/authorize`,
    token_endpoint: `${base}/token`,
    scopes_supported: [OAUTH_SCOPE],
    response_types_supported: ['code'],
    response_modes_supported: ['query'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    token_endpoint_auth_methods_supported: ['none'],
    code_challenge_methods_supported: ['S256'],
    client_id_metadata_document_supported: true,
    service_documentation: `${base}/docs#claude`,
  };
}

/**
 * The `WWW-Authenticate` value that makes Claude show its Connect card. Claude's
 * own example uses error="invalid_token" for the no-token case too, so we do.
 * The description is a short ASCII sentence (header values must be; the full
 * paywall text, pound signs included, goes in the JSON body).
 */
export function bearerChallenge(env: CloudflareBindings, description: string): string {
  const desc = description
    .replaceAll('"', "'")
    .replaceAll(/[^\x20-\x7e]/g, '')
    .slice(0, 120);
  return `Bearer error="invalid_token", error_description="${desc}", resource_metadata="${resourceMetadataUrl(env)}", scope="${OAUTH_SCOPE}"`;
}

// ── Client ID Metadata Documents ─────────────────────────────────────────

export interface ClientMetadata {
  clientId: string;
  redirectUris: string[];
  clientName: string | null;
}

/**
 * A CIMD client_id must be an https URL with a path (so `https://claude.ai/`
 * alone cannot claim to be a client), no fragment, and a real hostname — never
 * an IP literal or loopback, which is also the SSRF guard on the fetch below.
 */
export function parseClientId(clientId: string): URL | null {
  let url: URL;
  try {
    url = new URL(clientId);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;
  if (url.hash !== '' || url.username !== '' || url.password !== '') return null;
  if (url.pathname === '' || url.pathname === '/') return null;
  const host = url.hostname;
  if (LOOPBACK_HOSTS.has(host) || host.startsWith('[') || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return null;
  }
  if (!host.includes('.')) return null;
  return url;
}

/** What the consent screen names as the asking app: the client_id URL's host, never the self-asserted client_name. */
export function clientHost(clientId: string): string {
  return parseClientId(clientId)?.hostname ?? 'unknown client';
}

const clientCacheKey = async (clientId: string): Promise<string> =>
  `oauth:cimd:${(await hashKey(clientId)).slice(0, 32)}`;

/**
 * Fetch and validate the client's metadata document. null when the URL is not
 * a valid client_id, the document cannot be fetched within the budget, or its
 * own `client_id` field does not equal the URL (the binding that makes CIMD
 * safe: only the party controlling that URL can register those redirect URIs).
 */
export async function fetchClientMetadata(
  env: CloudflareBindings,
  clientId: string,
): Promise<ClientMetadata | null> {
  const url = parseClientId(clientId);
  if (!url) return null;
  const cacheKey = await clientCacheKey(clientId);
  try {
    const cached = await env.CACHE.get<ClientMetadata>(cacheKey, 'json');
    if (cached) return cached;
  } catch {
    // cache miss on KV trouble — fetch
  }
  let doc: unknown;
  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json', 'User-Agent': 'gankdat-oauth/1.0' },
      redirect: 'manual',
      signal: AbortSignal.timeout(CLIENT_FETCH_TIMEOUT_MS),
    });
    if (res.status !== 200) return null;
    const length = Number(res.headers.get('content-length') ?? '0');
    if (length > CLIENT_METADATA_MAX_BYTES) return null;
    const text = await res.text();
    if (text.length > CLIENT_METADATA_MAX_BYTES) return null;
    doc = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof doc !== 'object' || doc === null) return null;
  const record = doc as { client_id?: unknown; redirect_uris?: unknown; client_name?: unknown };
  if (record.client_id !== clientId) return null;
  if (!Array.isArray(record.redirect_uris)) return null;
  const redirectUris = record.redirect_uris.filter((u): u is string => typeof u === 'string');
  if (redirectUris.length === 0) return null;
  const metadata: ClientMetadata = {
    clientId,
    redirectUris,
    clientName: typeof record.client_name === 'string' ? record.client_name.slice(0, 80) : null,
  };
  try {
    await env.CACHE.put(cacheKey, JSON.stringify(metadata), {
      expirationTtl: CLIENT_METADATA_TTL_SECONDS,
    });
  } catch {
    // best-effort cache
  }
  return metadata;
}

export function isLoopbackRedirect(redirectUri: string): boolean {
  try {
    const url = new URL(redirectUri);
    return url.protocol === 'http:' && LOOPBACK_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

/**
 * Exact match against the document's redirect_uris, except that a loopback
 * redirect (http://127.0.0.1, http://[::1] and, for Claude Code, http://localhost)
 * matches with the port ignored — native clients bind an ephemeral port
 * (RFC 8252 §7.3).
 */
export function redirectUriAllowed(requested: string, registered: string[]): boolean {
  if (registered.includes(requested)) return true;
  if (!isLoopbackRedirect(requested)) return false;
  let want: URL;
  try {
    want = new URL(requested);
  } catch {
    return false;
  }
  return registered.some((entry) => {
    try {
      const have = new URL(entry);
      return (
        have.protocol === 'http:' &&
        have.hostname === want.hostname &&
        have.pathname === want.pathname &&
        have.search === want.search
      );
    } catch {
      return false;
    }
  });
}

// ── PKCE ─────────────────────────────────────────────────────────────────

function base64url(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
}

export async function pkceChallenge(verifier: string): Promise<string> {
  return base64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
}

const VERIFIER_RE = /^[A-Za-z0-9\-._~]{43,128}$/;
const CHALLENGE_RE = /^[A-Za-z0-9\-_]{43}$/;

// ── Grants (D1) ──────────────────────────────────────────────────────────

function randomHex(bytes: number): string {
  return [...crypto.getRandomValues(new Uint8Array(bytes))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface AuthRequestInput {
  clientId: string;
  redirectUri: string;
  state: string | null;
  codeChallenge: string;
  scope: string;
  resource: string | null;
}

export interface AuthRequest extends AuthRequestInput {
  id: string;
  expiresAt: number;
}

export type AuthorizeParamError =
  | { error: 'invalid_request'; description: string }
  | { error: 'invalid_scope'; description: string }
  | { error: 'invalid_target'; description: string };

/**
 * Validate the protocol parameters of an /authorize request once the client
 * and redirect_uri are verified (these errors may be redirected to the client).
 */
export function validateAuthorizeParams(
  env: CloudflareBindings,
  q: Record<string, string | undefined>,
): AuthorizeParamError | null {
  if (q.response_type !== 'code') {
    return { error: 'invalid_request', description: 'response_type must be "code"' };
  }
  if ((q.code_challenge_method ?? 'plain') !== 'S256') {
    return { error: 'invalid_request', description: 'code_challenge_method must be S256' };
  }
  if (!q.code_challenge || !CHALLENGE_RE.test(q.code_challenge)) {
    return { error: 'invalid_request', description: 'a base64url S256 code_challenge is required' };
  }
  const scopes = (q.scope ?? '').split(/\s+/).filter(Boolean);
  if (scopes.some((s) => s !== OAUTH_SCOPE && s !== 'offline_access')) {
    return { error: 'invalid_scope', description: `supported scopes: ${OAUTH_SCOPE}` };
  }
  if (q.resource && q.resource !== resourceUrl(env)) {
    return { error: 'invalid_target', description: `resource must be ${resourceUrl(env)}` };
  }
  return null;
}

export async function createAuthRequest(
  env: CloudflareBindings,
  input: AuthRequestInput,
): Promise<AuthRequest> {
  const id = randomHex(16);
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO oauth_grants (id_hash, kind, family, client_id, redirect_uri, scope, state, code_challenge, resource, created_at, expires_at)
     VALUES (?1, 'request', ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`,
  )
    .bind(
      await hashKey(id),
      id,
      input.clientId,
      input.redirectUri,
      input.scope,
      input.state,
      input.codeChallenge,
      input.resource,
      now,
      now + REQUEST_TTL_MS,
    )
    .run();
  return { ...input, id, expiresAt: now + REQUEST_TTL_MS };
}

export const REQUEST_ID_RE = /^[a-f0-9]{32}$/;

interface GrantRow {
  client_id: string;
  redirect_uri: string | null;
  scope: string;
  state: string | null;
  code_challenge: string | null;
  resource: string | null;
  expires_at: number;
  family: string;
  account_id: string | null;
  key_id: string | null;
}

/** A pending (unused, unexpired) authorize request, for rendering consent. */
export async function readAuthRequest(
  env: CloudflareBindings,
  id: string,
): Promise<AuthRequest | null> {
  if (!REQUEST_ID_RE.test(id)) return null;
  const row = await env.DB.prepare(
    `SELECT client_id, redirect_uri, scope, state, code_challenge, resource, expires_at, family, account_id, key_id
       FROM oauth_grants WHERE id_hash = ?1 AND kind = 'request' AND used_at IS NULL AND expires_at > ?2`,
  )
    .bind(await hashKey(id), Date.now())
    .first<GrantRow>();
  if (!row) return null;
  return {
    id,
    clientId: row.client_id,
    redirectUri: row.redirect_uri ?? '',
    state: row.state,
    codeChallenge: row.code_challenge ?? '',
    scope: row.scope,
    resource: row.resource,
    expiresAt: row.expires_at,
  };
}

async function consumeAuthRequest(env: CloudflareBindings, id: string): Promise<GrantRow | null> {
  if (!REQUEST_ID_RE.test(id)) return null;
  return env.DB.prepare(
    `UPDATE oauth_grants SET used_at = ?2
      WHERE id_hash = ?1 AND kind = 'request' AND used_at IS NULL AND expires_at > ?2
      RETURNING client_id, redirect_uri, scope, state, code_challenge, resource, expires_at, family, account_id, key_id`,
  )
    .bind(await hashKey(id), Date.now())
    .first<GrantRow>();
}

/** The key a client's tokens bill through: `oauth:<client host>`, one active per account and client. */
export function oauthKeyName(clientId: string): string {
  return `oauth:${clientHost(clientId)}`;
}

/**
 * Find or mint the account's key for this client. The raw key is never shown to
 * anyone — the token is the credential — but the row makes the connection
 * visible and revocable at /account and gives metering its key id.
 */
async function ensureClientKey(
  env: CloudflareBindings,
  account: { accountId: string; email: string; plan: string },
  clientId: string,
): Promise<string> {
  const name = oauthKeyName(clientId);
  const existing = await env.DB.prepare(
    'SELECT id FROM api_keys WHERE account_id = ?1 AND name = ?2 AND revoked_at IS NULL ORDER BY created_at DESC LIMIT 1',
  )
    .bind(account.accountId, name)
    .first<{ id: string }>();
  if (existing) return existing.id;
  const id = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO api_keys (id, key_hash, email, name, plan, credits_granted, account_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)',
  )
    .bind(
      id,
      await hashKey(generateKey()),
      account.email,
      name,
      account.plan,
      FREE_TIER_CREDITS,
      account.accountId,
    )
    .run();
  return id;
}

export interface Approved {
  redirectUri: string;
  state: string | null;
  code: string;
}

/**
 * Consent given: consume the request (single use), bind it to the signed-in
 * account's client key and mint a 5-minute authorization code.
 */
export async function approveAuthRequest(
  env: CloudflareBindings,
  id: string,
  account: { accountId: string; email: string; plan: string },
): Promise<Approved | null> {
  const row = (await consumeAuthRequest(env, id)) ?? (await recentlyApprovedBy(env, id, account));
  if (!row?.redirect_uri || !row.code_challenge) return null;
  const keyId = await ensureClientKey(env, account, row.client_id);
  const code = `${CODE_PREFIX}${randomHex(32)}`;
  const now = Date.now();
  // The code row's family is the request id, so a repeated approval (double-submitted form,
  // browser retry) can be recognised and answered with a fresh code — see recentlyApprovedBy.
  await env.DB.prepare(
    `INSERT INTO oauth_grants (id_hash, kind, family, client_id, redirect_uri, scope, state, code_challenge, resource, account_id, key_id, created_at, expires_at)
     VALUES (?1, 'code', ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)`,
  )
    .bind(
      await hashKey(code),
      id,
      row.client_id,
      row.redirect_uri,
      row.scope,
      row.state,
      row.code_challenge,
      row.resource,
      account.accountId,
      keyId,
      now,
      now + CODE_TTL_MS,
    )
    .run();
  return { redirectUri: row.redirect_uri, state: row.state, code };
}

/**
 * Idempotent approval: the request was already consumed, but this same account approved it
 * within the last CODE_TTL_MS. The 2026-10-04 incident: the consent form was submitted twice;
 * the second POST got "expired" and its navigation cancelled the first one's redirect, so the
 * client never received a code. Re-issuing to the same signed-in account is safe — the
 * request's client, redirect_uri and PKCE challenge are copied from the earlier code row.
 */
async function recentlyApprovedBy(
  env: CloudflareBindings,
  requestId: string,
  account: { accountId: string },
): Promise<GrantRow | null> {
  if (!REQUEST_ID_RE.test(requestId)) return null;
  return env.DB.prepare(
    `SELECT client_id, redirect_uri, scope, state, code_challenge, resource, expires_at, family, account_id, key_id
       FROM oauth_grants
      WHERE kind = 'code' AND family = ?1 AND account_id = ?2 AND created_at > ?3
      ORDER BY created_at DESC LIMIT 1`,
  )
    .bind(requestId, account.accountId, Date.now() - CODE_TTL_MS)
    .first<GrantRow>();
}

/** Consent refused: consume the request and say where to send the error. */
export async function denyAuthRequest(
  env: CloudflareBindings,
  id: string,
): Promise<{ redirectUri: string; state: string | null } | null> {
  const row = await consumeAuthRequest(env, id);
  if (!row?.redirect_uri) return null;
  return { redirectUri: row.redirect_uri, state: row.state };
}

// ── Token endpoint ───────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export type TokenResult =
  | { ok: true; body: TokenResponse; clientId: string }
  | { ok: false; error: string; description: string };

const fail = (error: string, description: string): TokenResult => ({
  ok: false,
  error,
  description,
});

async function issueTokenPair(
  env: CloudflareBindings,
  grant: { family: string; client_id: string; scope: string; account_id: string; key_id: string },
): Promise<TokenResponse> {
  const access = `${ACCESS_TOKEN_PREFIX}${randomHex(32)}`;
  const refresh = `${REFRESH_TOKEN_PREFIX}${randomHex(32)}`;
  const now = Date.now();
  const insert = (
    kind: 'access' | 'refresh',
    hash: string,
    expiresAt: number,
  ): D1PreparedStatement =>
    env.DB.prepare(
      `INSERT INTO oauth_grants (id_hash, kind, family, client_id, scope, account_id, key_id, created_at, expires_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`,
    ).bind(
      hash,
      kind,
      grant.family,
      grant.client_id,
      grant.scope,
      grant.account_id,
      grant.key_id,
      now,
      expiresAt,
    );
  await env.DB.batch([
    insert('access', await hashKey(access), now + ACCESS_TTL_SECONDS * 1000),
    insert('refresh', await hashKey(refresh), now + REFRESH_TTL_MS),
    // Sweep: anything a day past its expiry (a used refresh token must outlive
    // its expiry only long enough for replay detection, which this keeps).
    env.DB.prepare('DELETE FROM oauth_grants WHERE expires_at < ?1').bind(now - 86_400_000),
  ]);
  return {
    access_token: access,
    token_type: 'Bearer',
    expires_in: ACCESS_TTL_SECONDS,
    refresh_token: refresh,
    scope: grant.scope,
  };
}

interface TokenGrantRow extends GrantRow {
  key_revoked_at: string | null;
}

async function consumeGrant(
  env: CloudflareBindings,
  kind: 'code' | 'refresh',
  secret: string,
): Promise<TokenGrantRow | null | 'replayed'> {
  const hash = await hashKey(secret);
  const now = Date.now();
  const row = await env.DB.prepare(
    `UPDATE oauth_grants SET used_at = ?2
      WHERE id_hash = ?1 AND kind = ?3 AND used_at IS NULL AND expires_at > ?2
      RETURNING client_id, redirect_uri, scope, state, code_challenge, resource, expires_at, family, account_id, key_id`,
  )
    .bind(hash, now, kind)
    .first<GrantRow>();
  if (row) {
    // The key the grant bills through may have been revoked at /account since
    // consent — that is how a user disconnects a client.
    const key = row.key_id
      ? await env.DB.prepare('SELECT revoked_at FROM api_keys WHERE id = ?1')
          .bind(row.key_id)
          .first<{ revoked_at: string | null }>()
      : null;
    return { ...row, key_revoked_at: key ? key.revoked_at : 'missing' };
  }
  // Already used? A presented-again code or refresh token means the secret
  // leaked or was replayed (OAuth 2.1 §4.3.1 / §6.1): revoke the whole family.
  const spent = await env.DB.prepare(
    'SELECT family FROM oauth_grants WHERE id_hash = ?1 AND kind = ?2 AND used_at IS NOT NULL',
  )
    .bind(hash, kind)
    .first<{ family: string }>();
  if (spent) {
    await env.DB.prepare(
      'UPDATE oauth_grants SET used_at = ?2 WHERE family = ?1 AND used_at IS NULL',
    )
      .bind(spent.family, now)
      .run();
    return 'replayed';
  }
  return null;
}

export async function exchangeAuthorizationCode(
  env: CloudflareBindings,
  params: { code: string; clientId: string; redirectUri: string | null; codeVerifier: string },
): Promise<TokenResult> {
  if (!params.code.startsWith(CODE_PREFIX)) return fail('invalid_grant', 'unknown code');
  if (!VERIFIER_RE.test(params.codeVerifier)) {
    return fail('invalid_request', 'code_verifier must be 43–128 unreserved characters');
  }
  const row = await consumeGrant(env, 'code', params.code);
  if (row === 'replayed') return fail('invalid_grant', 'code already used; connection revoked');
  if (!row) return fail('invalid_grant', 'unknown or expired code');
  if (row.client_id !== params.clientId) return fail('invalid_grant', 'client_id mismatch');
  if (params.redirectUri !== null && params.redirectUri !== row.redirect_uri) {
    return fail('invalid_grant', 'redirect_uri mismatch');
  }
  if ((await pkceChallenge(params.codeVerifier)) !== row.code_challenge) {
    return fail('invalid_grant', 'PKCE verification failed');
  }
  if (row.key_revoked_at !== null || !row.account_id || !row.key_id) {
    return fail('invalid_grant', 'the connection was revoked');
  }
  // Tokens get their own family per exchange (refresh rotation / replay revocation scope);
  // the code row's family is the authorize request id, see approveAuthRequest.
  const body = await issueTokenPair(env, {
    family: crypto.randomUUID(),
    client_id: row.client_id,
    scope: row.scope,
    account_id: row.account_id,
    key_id: row.key_id,
  });
  return { ok: true, body, clientId: row.client_id };
}

export async function refreshAccessToken(
  env: CloudflareBindings,
  params: { refreshToken: string; clientId: string | null },
): Promise<TokenResult> {
  if (!params.refreshToken.startsWith(REFRESH_TOKEN_PREFIX)) {
    return fail('invalid_grant', 'unknown refresh token');
  }
  const row = await consumeGrant(env, 'refresh', params.refreshToken);
  if (row === 'replayed') {
    return fail('invalid_grant', 'refresh token already used; connection revoked, sign in again');
  }
  if (!row) return fail('invalid_grant', 'unknown or expired refresh token');
  if (params.clientId !== null && params.clientId !== row.client_id) {
    return fail('invalid_grant', 'client_id mismatch');
  }
  if (row.key_revoked_at !== null || !row.account_id || !row.key_id) {
    return fail('invalid_grant', 'the connection was revoked at /account; sign in again');
  }
  const body = await issueTokenPair(env, {
    family: row.family,
    client_id: row.client_id,
    scope: row.scope,
    account_id: row.account_id,
    key_id: row.key_id,
  });
  return { ok: true, body, clientId: row.client_id };
}

// ── Bearer resolution (auth/middleware.ts) ───────────────────────────────

/** The shape auth/middleware.ts builds a KeyContext from — identical for a key and a token. */
export interface ResolvedToken {
  id: string;
  plan: string;
  revoked_at: string | null;
  account_id: string;
  account_email: string;
  /** Epoch ms; the middleware re-checks it on every request (cached copies included). */
  expires_at: number;
}

const tokenCacheKey = (hash: string): string => `key:${hash}`;

/**
 * Resolve an access token to its key's account. Cached in KV under the same
 * `key:<hash>` layout as API keys (60 s), so revoking the `oauth:<host>` key at
 * /account cuts the token off within that bound, like any key.
 */
export async function resolveAccessToken(
  env: CloudflareBindings,
  token: string,
  hash: string,
): Promise<ResolvedToken | null> {
  const isLive = (r: ResolvedToken): boolean => r.revoked_at === null && r.expires_at > Date.now();
  if (!token.startsWith(ACCESS_TOKEN_PREFIX)) return null;
  try {
    const cached = await env.CACHE.get<ResolvedToken>(tokenCacheKey(hash), 'json');
    if (cached) return isLive(cached) ? cached : null;
  } catch {
    // KV miss → D1
  }
  const row = await env.DB.prepare(
    `SELECT k.id AS id, a.plan AS plan, k.revoked_at AS revoked_at, a.id AS account_id, a.email AS account_email, g.expires_at AS expires_at
       FROM oauth_grants g
       JOIN api_keys k ON k.id = g.key_id
       JOIN accounts a ON a.id = k.account_id
      WHERE g.id_hash = ?1 AND g.kind = 'access' AND g.used_at IS NULL`,
  )
    .bind(hash)
    .first<ResolvedToken>();
  if (!row || !isLive(row)) return null;
  try {
    await env.CACHE.put(tokenCacheKey(hash), JSON.stringify(row), {
      expirationTtl: TOKEN_CACHE_TTL_SECONDS,
    });
  } catch {
    // best-effort cache
  }
  return row;
}
