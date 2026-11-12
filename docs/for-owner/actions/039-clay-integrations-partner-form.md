# Owner action request #039 — Clay: submit the Integrations Partner form (~10 min) and, if you like, the Skill (~5 min)

- **Date:** 2026-11-09
- **Status:** done 2026-11-12 (step 1 submitted: Yes to marketplace selling, wholesale price quoted, no Clay table, no video; step 2 not taken)
- **Your time:** ~10 minutes for step 1; step 2 is ~5 minutes more and optional
- **Cost:** £0 (two web forms; no card, no identity check)
- **Blocks:** `gankdat/clay-listing-day-90-read` (the 90-day read dates from your submission)

Clay is a data-enrichment workbench used by about 17,000 sales and RevOps teams. Its marketplace
lists 220 data providers and none covers the UK registers natively; its community already wires
the Companies House API in by hand. gankdat now has a page for Clay users — https://gankdat.com/clay
— with the five register checks as ready-made "HTTP API" columns on the user's own gankdat key
(so a Clay user pays us one credit a row, nothing goes through Clay's billing), and a Skill for the
coding-agent marketplace Clay runs. Clay's partner page offers a free listing tier for exactly this
("HTTP API" — a listing on clay.com/integrations and in its docs) behind one intake form and a fit
review (30–60 days). No contract, no verification, no revenue share either way.

Everything to paste is in `ventures/gankdat/docs/CLAY-LISTING.md`, in form order.

## Actions

### 1. Integrations Partner intake form (~10 min)
- **What:** apply for the HTTP API listing tier with our docs page as the integration.
- **Where:** https://clayhq.typeform.com/to/jex58rxk (the "Apply now" button on
  https://www.clay.com/partners/integrations).
- **Steps:** answer with the paragraphs in `CLAY-LISTING.md` §1 — company, contact (your name and
  the gankdat support mailbox), the links, "HTTP API template / listing" as the integration type,
  then the use case, data coverage and technical setup texts. Shorten where a field has a limit.
- **Give back:** nothing; Clay's reply comes by email and the inbox triage reads it.
- **Cost:** £0.

### 2. Optional — submit the Skill to Clay's community marketplace (~5 min)
- **What:** list `uk-company-register-check` on https://marketplace.clay.com/ (49 community
  Skills today, free to list).
- **Where:** https://marketplace.clay.com/ → **Submit GTM skill**. Sign-in is a Clay account: a free
  workspace is an email sign-up with no card. That puts an account in your name, which is why this
  step is yours to take or leave — skip it and the listing in step 1 still stands, and the Skill
  stays installable from the public repository.
- **Steps:** paste `CLAY-LISTING.md` §2 (name, category, tagline, about, when to use, what it
  delivers, prompt, inputs, outputs, steps) and the file
  `ventures/gankdat/skills/uk-company-register-check/SKILL.md` where the form asks for the Skill.
- **Give back:** nothing.
- **Cost:** £0.

## When you're done
1. Set **Status** above to `done` and send `039 done` (or `039 step 1 only`); note the date you
   submitted — the 90-day read counts from it.
2. Nothing else: Clay's mails are expected (`docs/ops/SELF-CAUSED.md`), and the next build after a
   "listed" mail adds the shared-table template link to the page.
