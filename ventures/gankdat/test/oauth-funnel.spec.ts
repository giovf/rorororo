import { describe, expect, it } from 'vitest';
import { connectCallersNote, oauthFunnelNote } from '../src/lib/oauth-funnel';

// The two Daily numbers sentences of gankdat oauth-connect-funnel-check (2026-10-09), rendered
// from Analytics Engine rows as metrics.mjs hands them over (numbers arrive as strings).

describe('oauthFunnelNote', () => {
  it('renders every leg as a count and names causes only where they exist', () => {
    const note = oauthFunnelNote(
      [
        { reason: 'protected_tool', n: '10' },
        { reason: 'preview_exhausted', n: 2 },
      ],
      [
        { step: 'authorize', detail: '', n: '3' },
        { step: 'authorize_rejected', detail: 'unknown_client', n: 1 },
        { step: 'signin_shown', detail: 'new', n: 3 },
        { step: 'email_sent', detail: 'sent', n: 2 },
        { step: 'email_sent', detail: 'capped', n: 1 },
        { step: 'consent_shown', detail: 'continue', n: 1 },
        { step: 'approved', detail: '', n: 1 },
        { step: 'token', detail: 'authorization_code', n: 1 },
        { step: 'token', detail: 'refresh_token', n: 24 },
        { step: 'token_rejected', detail: 'invalid_grant: PKCE verification failed', n: 1 },
      ],
    );
    expect(note).toBe(
      'oauth funnel 7d: 12 challenges (protected_tool 10, preview_exhausted 2), 3 authorize, 1 rejected (unknown_client 1), 3 sign-in, 3 email (capped 1), 1 consent, 1 approved, 0 denied, 0 expired, 25 token (refresh_token 24), 1 token errors (invalid_grant: PKCE verification failed 1)',
    );
  });

  it('reads as zeros, not as missing, when nothing happened', () => {
    expect(oauthFunnelNote([], [])).toBe(
      'oauth funnel 7d: 0 challenges, 0 authorize, 0 rejected, 0 sign-in, 0 email, 0 consent, 0 approved, 0 denied, 0 expired, 0 token, 0 token errors',
    );
  });

  it('keeps a free-text detail row-safe', () => {
    const note = oauthFunnelNote(
      [],
      [{ step: 'token_rejected', detail: 'a | b; c, d'.padEnd(90, 'x'), n: 'NaN' }],
    );
    expect(note).toContain('0 token errors (a / b/ c/ d');
    expect(note).not.toMatch(/\|/);
    expect(note.length).toBeLessThan(260);
  });
});

describe('connectCallersNote', () => {
  it('lists the user agents behind the keyless connect_account calls', () => {
    expect(
      connectCallersNote([
        { ua: 'Claude-User/1.0 (claude.ai; +https://anthropic.com)', n: '5' },
        { ua: '  python-httpx/0.27  ', n: 2 },
        { ua: null, n: 1 },
      ]),
    ).toBe(
      'connect_account 7d by UA: Claude-User/1.0 (claude.ai/ +https://anthropic.c 5, python-httpx/0.27 2, (no UA) 1',
    );
    expect(connectCallersNote([])).toBe('connect_account 7d by UA: none');
  });
});
