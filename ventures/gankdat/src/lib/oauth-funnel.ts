// The connect-funnel sentence of the Daily numbers row (gankdat oauth-connect-funnel-check,
// 2026-10-09). routes/oauth.ts writes one `oauth_funnel` analytics point per leg (blob3 step,
// blob5 detail); routes/mcp.ts writes the 401 challenges that start the hop (`mcp_denied`,
// blob4 reason). metrics.mjs reads both over 7 days and renders them here, so the step where
// every attempt stops is a number on the row and never again a guess. Pure: no I/O.

export interface FunnelRow {
  step: string;
  detail: string | null;
  n: number | string;
}

export interface ChallengeRow {
  reason: string;
  n: number | string;
}

const whole = (n: number | string): number => Math.round(Number(n)) || 0;

/** blob5 is free text (an OAuth error description): keep it row-safe and short. */
function detailText(detail: string): string {
  return detail.replace(/[|;,]/g, '/').replace(/\s+/g, ' ').trim().slice(0, 60);
}

/**
 * `oauth funnel 7d: 12 challenges (protected_tool 10, preview_exhausted 2), 3 authorize,
 * 1 rejected (unknown_client 1), 3 sign-in, 2 email, 1 consent, 1 approved, 0 denied,
 * 0 expired, 1 token, 0 token errors` — every leg as a count, the detail breakdown only where
 * it names a cause (a rejected authorize, a non-sent email, an expired leg, a refused token).
 */
export function oauthFunnelNote(challenges: ChallengeRow[], rows: FunnelRow[]): string {
  const count = (step: string): number =>
    rows.filter((r) => r.step === step).reduce((a, r) => a + whole(r.n), 0);
  const detail = (step: string, skip: string[] = []): string => {
    const parts = rows
      .filter((r) => r.step === step && r.detail && !skip.includes(r.detail))
      .map((r) => `${detailText(r.detail ?? '')} ${whole(r.n)}`);
    return parts.length ? ` (${parts.join(', ')})` : '';
  };
  const challengeTotal = challenges.reduce((a, r) => a + whole(r.n), 0);
  const challengeDetail = challenges.length
    ? ` (${challenges.map((r) => `${r.reason} ${whole(r.n)}`).join(', ')})`
    : '';
  return [
    `oauth funnel 7d: ${challengeTotal} challenges${challengeDetail}`,
    `${count('authorize')} authorize`,
    `${count('authorize_rejected')} rejected${detail('authorize_rejected')}`,
    `${count('signin_shown')} sign-in`,
    `${count('email_sent')} email${detail('email_sent', ['sent'])}`,
    `${count('consent_shown')} consent`,
    `${count('approved')} approved`,
    `${count('denied')} denied`,
    `${count('expired')} expired${detail('expired')}`,
    `${count('token')} token${detail('token', ['authorization_code'])}`,
    `${count('token_rejected')} token errors${detail('token_rejected')}`,
  ].join(', ');
}

/** `connect_account 7d by UA: <ua> N, …` — who sends the 401s that start the hop. */
export function connectCallersNote(rows: { ua: string | null; n: number | string }[]): string {
  if (rows.length === 0) return 'connect_account 7d by UA: none';
  const uaText = (ua: string | null): string =>
    (ua ?? '').replace(/\s+/g, ' ').replace(/[|;]/g, '/').trim().slice(0, 48) || '(no UA)';
  return `connect_account 7d by UA: ${rows.map((r) => `${uaText(r.ua)} ${whole(r.n)}`).join(', ')}`;
}
