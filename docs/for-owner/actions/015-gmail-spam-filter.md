# 015 — keep Foundry mail out of Gmail spam (2 minutes)

**Status:** DONE 2026-09-21 (owner) · **Urgency:** low-medium — some store/platform mail has been landing in spam,
and the Gmail connection Claude uses cannot see the spam folder at all (Google's connector
excludes it), so anything there is invisible to the hourly inbox triage.

## What to do
1. In Gmail (gio@1402celsius.com): Settings → Filters and Blocked Addresses → **Create a new
   filter**. In the **To** field enter: `info@gankdat.com OR gio@gankdat.com`. Create filter →
   tick **Never send it to Spam** and **Apply the label** → new label `Foundry`. Save.
2. Repeat once with **From** = `apify.com OR google.com OR mozilla.org OR figma.com OR stripe.com OR datarade.ai OR mcpservers.org OR cloudflare.com` (same two ticks).
3. Open the Spam folder, select anything Foundry-related and click **Not spam** — that moves it
   to the inbox where the triage picks it up on its next hourly run.

Reply "015 done".
