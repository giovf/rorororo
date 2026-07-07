// The account (email identity) is the single subject for plan, quota, usage, and
// billing. Keys are issued under it and inherit its plan. This helper upserts by
// normalized email so both key issuance and magic-link sign-in resolve the same
// account.

export interface Account {
  id: string;
  plan: string;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getOrCreateAccount(
  env: CloudflareBindings,
  emailRaw: string,
): Promise<Account> {
  const email = normalizeEmail(emailRaw);
  const id = crypto.randomUUID();
  await env.DB.prepare('INSERT INTO accounts (id, email) VALUES (?1, ?2) ON CONFLICT (email) DO NOTHING')
    .bind(id, email)
    .run();
  // Re-select rather than trust the insert: on conflict we want the existing row
  // (and its current, possibly-paid plan).
  return (await env.DB.prepare('SELECT id, plan FROM accounts WHERE email = ?1')
    .bind(email)
    .first<Account>())!;
}
