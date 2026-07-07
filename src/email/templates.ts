import type { EmailMessage } from './send';

// Plain, dependency-free HTML — inline styles only (email clients strip <style>).
export function magicLinkEmail(to: string, link: string): EmailMessage {
  return {
    to,
    subject: 'Your faceless sign-in link',
    text:
      `Sign in to faceless:\n${link}\n\n` +
      'This link expires in 15 minutes and can be used once. ' +
      "If you didn't request it, you can ignore this email.",
    html: `<!doctype html><html><body style="margin:0;background:#f6f7f9;font:16px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#16181d">
  <div style="max-width:480px;margin:0 auto;padding:32px 20px">
    <h1 style="font-size:1.3rem;margin:0 0 8px">Sign in to faceless</h1>
    <p style="color:#5b6472;margin:0 0 20px">Click the button below to sign in. This link expires in 15 minutes and can be used once.</p>
    <a href="${link}" style="display:inline-block;background:#0b5fff;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:8px">Sign in</a>
    <p style="color:#5b6472;font-size:.85rem;margin:24px 0 0;word-break:break-all">Or paste this URL into your browser:<br>${link}</p>
    <p style="color:#9aa3b2;font-size:.8rem;margin:20px 0 0">If you didn't request this, you can safely ignore it.</p>
  </div>
</body></html>`,
  };
}
