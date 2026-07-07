// Passwordless sign-in tokens. A token is a 256-bit random hex string stored in
// KV (CACHE) mapping token -> normalized email, with a short TTL and single use
// (consume deletes it). No secret/signing needed: the token itself is the
// unguessable capability.

const MAGIC_TTL_SECONDS = 15 * 60;
const magicKey = (token: string): string => `magic:${token}`;

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function issueMagicToken(env: CloudflareBindings, email: string): Promise<string> {
  const token = randomToken();
  await env.CACHE.put(magicKey(token), email, { expirationTtl: MAGIC_TTL_SECONDS });
  return token;
}

/** Single-use: returns the email and invalidates the token, or null if invalid. */
export async function consumeMagicToken(
  env: CloudflareBindings,
  token: string,
): Promise<string | null> {
  if (!token) return null;
  const email = await env.CACHE.get(magicKey(token));
  if (!email) return null;
  await env.CACHE.delete(magicKey(token));
  return email;
}
