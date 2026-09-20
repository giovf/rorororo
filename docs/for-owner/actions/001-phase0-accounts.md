# Owner action request #1 — channel accounts

- **Date:** 2026-09-17
- **Status:** pending
- **Your time:** ~25 minutes total, spread over three sites
- **Cost:** £3.70 (Chrome Web Store, $5 once) — recorded as `planned` in the ledger
- **Blocks:** task 12 (V1 launch), task 14 (V2 launch). Nothing else — building continues
  while these are pending. Accounts can take days to approve, which is why they're
  requested now.

Everything below needs *your* identity or wallet; nothing else in the backlog does.

## Actions

### 1. Figma account + Community creator profile (V1 — needed first) — DONE 2026-09-18
- **What:** an account that can publish plugins and receive Community payments.
- **Where:** https://www.figma.com → sign up (free plan is fine), then
  https://www.figma.com/community → your profile → **Publish** tab.
- **Steps:**
  1. Create the Figma account with an email you'll keep (this is the seller identity).
  2. Open your Community profile and set a display name and handle — this appears on
     every plugin listing.
  3. Under profile settings, look for **Payments / Get paid** and start the payout
     setup (Figma uses Stripe; UK is supported). It asks for name, address and a bank
     account. Finish it — unfinished payout setup blocks paid publishing.
     (Verified 2026-09-17: Figma staff on the forum, Aug 2026 — paid *plugins* are
     open to everyone with Stripe in a supported country; only paid *files* are
     paused for new sellers. Ignore any "approved creators only" wording.)
- **Give back:** just say "Figma done" and the handle. No keys needed — plugin
  publishing happens from the Figma desktop app, which I'll walk you through at launch
  (one click; you must be logged in).
- **Cost:** £0.00

### 2. Chrome Web Store developer registration (V2) — DONE 2026-09-18
- **What:** one-time $5 developer account; covers up to 20 extensions.
- **Where:** https://chrome.google.com/webstore/devconsole
- **Steps:**
  1. Sign in with a Google account you control long-term (a dedicated one is fine).
  2. Accept the developer agreement and pay the $5 registration fee.
  3. Complete the **Account** tab: developer name, contact email, and verify the email.
  4. **Trader / non-trader:** choose **Trader** — we sell, so legally that's what you are.
     Consequence: your legal name, address, email and phone are shown on listings.
     If you don't want your home address public, skip this item for now: nothing needs
     it until V2, and we'll decide then (virtual address ≈ £5–15/month vs. the cap).
- **Give back:** "Chrome done". When money leaves your account, tell me the GBP
  amount so the ledger row moves from `planned` to `cost`.
- **Cost:** ~£3.70

### 3. Merchant of record — DECISION 2026-09-18: **Stripe Managed Payments** (Lemon Squeezy's sign-up redirected UK sellers to it; it is Stripe's MoR successor to LS). Finish its onboarding; add the API key to `.env` as `STRIPE_SECRET_KEY` when it exists.
- **What:** an account with a merchant of record so Chrome/web sales are legal for
  EU/UK VAT without you registering anywhere.
- **Where:** Lemon Squeezy is the first choice but is invite/waitlist as of Sept 2026:
  https://www.lemonsqueezy.com. Fallbacks if it doesn't come through within ~2 weeks:
  https://www.paddle.com (needs a live product site first — I'll have one) or
  https://dodopayments.com.
- **Steps:**
  1. Join the Lemon Squeezy waitlist with the same email as above. **Website URL:** use
     the landing site once Pages is live — `https://giovf.github.io/rorororo/`
     (see "Publish the landing site" below).
  2. If/when you get access, create a store (name: "Foundry" is fine), complete the
     identity/payout details, and generate an API key under Settings → API.
- **Give back:** put the key in `.env` as `LEMONSQUEEZY_API_KEY` and the store id as
  `LEMONSQUEEZY_STORE_ID`, then say "MoR done" (or "waitlisted", which is expected).
- **Cost:** £0.00

### 4. Publish the landing site — DONE 2026-09-17 (live at https://giovf.github.io/rorororo/)
- **What:** the static site in `packages/landing/site/` deployed to GitHub Pages.
- **Where:** https://github.com/giovf/rorororo
- **Steps:**
  1. Push this branch: `git push origin main`.
  2. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
  3. **Actions** tab → "Deploy landing site to GitHub Pages" → Run workflow (or it runs
     on the push). URL: `https://giovf.github.io/rorororo/`.
  4. Optional: rename the repo to `foundry` (Settings → General) for a nicer URL
     `https://giovf.github.io/foundry/` — tell me if you do, I'll update links.
  5. Support email published: info@gankdat.com (done 2026-09-18).
- **Cost:** £0.00

Not requested yet, deliberately: a domain (only needed for V2's landing page and a
Paddle application — ~£10, asked for when V2 reaches build) and Google Play (parked).

## When you're done
1. Set **Status** above to `done` and note anything that differed from the steps.
2. Put any keys in `.env` (copy `.env.example` if it doesn't exist).
3. Start `claude` and say which items are done — the backlog picks up from there.
