# Spike: Poe creator monetisation for a "UK Sole Trader Tax 2026/27" prompt bot

Queue item `new-ventures/spike-poe-creator-bot-uk-tax` (burn-down, 2026-11-02 00:30–00:40 UTC; seeded by the same run's
new-ventures research). Sources: two fetch-relay rounds (`docs/relay/responses/new-ventures-research-2026-11-02` lines
11–16, `poe-spike-2026-11-02` lines 1–11) and four WebSearch reads restricted to poe.com / help.poe.com. What the runner
could read: `poe.com/pages/earnings-tos` (full, "Last updated: Aug 21, 2026"), `poe.com/pages/tos`, the creator docs'
monetisation page and the Bot Monetization API page, the rendered `/explore` (official model bots only, no creator bots,
no counts) and the rendered `/creators` (a login wall). **help.poe.com answers 403** (the Creator Monetization FAQs, raw
and rendered; the Purchases FAQs) and **every rendered search (`uk tax`, `self assessment`, `accountant`, `tax`) says
"No results"** without a login — the bot directory is read only as the search index holds it, marked below.

The question: can a prompt bot built from the Kindle guide's rates (ventures/tax-workbook/src/kindle) earn per message on
a shelf that supplies its own users, without a new identity step for the owner?

## 1. The programme (primary)

Earnings Terms of Service (read in full, 2026-08-21): the Creator Monetization Program "includes 'per message' earnings,
where you can set a price per message for Your Bots and earn revenue from Poe when users message Your Bot" (§3.2);
eligibility is residence in a listed country, and "**In order to receive revenue, you must create an account with our
Payment Agent within 90 days** of joining […] and provide us with any necessary information as may be required by
applicable laws and regulations (including tax forms and information)" (§2); "'Payment Agent' means Quora's payment
agent, which is currently **Stripe, Inc.**" and an existing Stripe account counts only "If you have already created an
account with the Payment Agent to participate in a Quora Earnings Program" (§4); earnings are paid "within 30–45 days of
the end of the applicable month", balances under **US$10** roll over, payouts carry the agent's fees; Quora may terminate
participation "without cause for any reason" (§5) and "reserves the right to retain all other revenues derived from Poe"
(§3.1). The creator docs: "setting earnings more flexibly per message from within the bot's code" (server bots, the Bot
Monetization API: `authorize_cost` / `capture_cost` in `usd_milli_cents`, a rate card, "Be enrolled in Poe revenue
sharing" as the prerequisite); a prompt bot sets a fixed price in the bot settings.

Creator Monetization FAQs (help.poe.com, 403 to the runner — quoted from poe.com's own index): the United Kingdom row is
"Yes" for price per message; "bot creators must be based in an eligible region to set a price per message"; the feature is
"available in 23 regions"; creators set the price in **US dollars per 1,000 messages** (maximum US$10,000), users see it
"in compute points which are an aggregate of the price you set and our costs"; "You will become eligible for a payment when
you have earnings of $10+"; without a tax ID and address Poe withholds 24 % for the IRS (a UK creator files a W-8BEN); the
Stripe help page: "set up your Stripe account to receive monthly payments whenever your earnings exceed $10". Poe's own
pricing for buyers: add-on points from US$30 per 1M.

## 2. The shelf (search index only — the directory needs a login)

| Bot (poe.com/…) | Creator | Model | What the index shows |
| --- | --- | --- | --- |
| TaxBot-pro | Engr. Ashraful Alam / Gigabytes LLC | Claude-Haiku-3 | **2 followers**; "tax computation and financial planning assistant" |
| AccountantGPT | @mattfrost | GPT-4o | deductions, audits, income tax; no follower count in the index |
| FinanAccountantGPT | — | GPT-3.5-Turbo | personal finance incl. taxes; no count |
| Grok-Tax | — | Grok | "tax assistant for individuals and businesses"; no count |
| Claude-Accounting | — | Claude | accounting and tax guidance; no count |
| any "self assessment", "HMRC" or "sole trader" bot | — | — | none in the index; rendered searches answer "No results" |

The one tax bot with a visible count has two followers; no UK-specific tax bot exists; the rendered explore page lists
only Poe's official model bots. Poe's creator pages publish no per-bot message or earnings numbers to a visitor.

## 3. Economics

A creator earns the price set, in USD, per message: at US$5 / US$10 / US$20 per 1,000 messages, **1,000 messages a month
nets US$5 / 10 / 20 before Stripe's payout fee** — the first two sit at or under the US$10 floor, so a payout arrives every
one or two months at best. The model cost is Poe's (the user pays points for "the price you set and our costs"), the
build is ≤ 0.5 day (the 2026/27 rates and the guide's disclaimer as the system prompt; the Kindle listing as the upsell),
and the bot gives general information, never advice — the same line the guide draws. Reach is the unknown: with no UK tax
bot on the shelf and the one visible rival at two followers, there is no evidence that Poe users look for one.

## 4. Call

**Park.** The money is real but the identity step is not allowed: payment needs a Stripe account created for Poe's
programme (the owner's existing Stripe account does not count), i.e. a new identity verification plus a W-8BEN, on a line
whose best reading is US$10–20 a month — the owner-time rule (STRATEGY §3, 2026-10-29) asks ≥ 10 for that, and this scores
≈ 5. Reopen when (a) the Kindle guide's KDP reads show ≥ 20 copies a month (demand for the content is then measured) **and**
the owner volunteers the Stripe onboarding, or (b) a UK tax or self-assessment bot appears in Poe's index with ≥ 100
followers. Nothing is built; the rates stay in `src/kindle` for whichever shelf comes first.
