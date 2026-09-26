# B2B outreach experiment — 2026-09 (ten emails, owner sends)

Queue item `b2b-outreach-experiment` (gankdat, score 6). Built by the build routine 2026-09-26; the
owner approves and sends. **Proof:** ≥ 2 replies or 1 sign-up from 10 emails within 14 days of the
last send. Results go in §6 and, when the experiment closes, in `RESEARCH.md`.

The ten drafts are also sitting in the Gmail Drafts folder of gio@1402celsius.com (subject lines
below; created by the build routine through the Gmail connector, nothing was sent). Open each one,
read it, fix the sender (see §4) and press send. Delete a draft to drop that target.

## 1. Why these ten

Two buyer types the datasets already fit, five firms each, all UK limited companies with a
generic mailbox published on their own site (no named person, no purchased list):

| # | Firm | Companies House | Mailbox (from their site) | Angle |
| --- | --- | --- | --- | --- |
| 1 | Executive Compass Business Consultants Limited (Newcastle) | 06898662 | info@executivecompass.co.uk | Contracts Finder awards + Find a Tender + TED as one daily feed |
| 2 | Thornton & Lowe Limited (Bolton) | 07600205 | hello@thorntonandlowe.com | competitor-win intelligence for clients and training |
| 3 | Hudson Outsourcing Ltd — Hudson Succeed (Durham) | 10172082 | hello@hudsonoutsourcing.com | they sell opportunity tracking; feed instead of portal checks |
| 4 | Bid Writing Services Limited — BWS | 13483243 | info@bidwritingservice.com | 200+ SME clients asking "who won last time" |
| 5 | Bid Solutions Limited (Richmond) | 05194464 | enquiry@bidsolutions.com | bid consulting arm; market intelligence |
| 6 | Bubble Design & Marketing Limited (Retford) | 03913391 | studio@bubbledesign.co.uk | care homes on the CQC register with no website recorded |
| 7 | Splitpixel Creative Limited (Huddersfield) | 06644133 | hello@splitpixel.co.uk | charities and schools with no website recorded |
| 8 | Giant Digital Limited (London) | 07603734 | info@giantdigital.co.uk | newly registered charities each week, income filter |
| 9 | Adept Design (Norfolk) Ltd (Norwich) | 04666161 | hello@adeptdesign.co.uk | same, charity-only agency |
| 10 | Scamper Limited — Wholegrain Digital (London) | 06167989 | hello@wholegraindigital.com | charities + new incorporations for a WordPress agency |

Companies House confirmed through the relay 2026-09-26 (`docs/relay/responses/b2b-outreach-targets/`,
search pages, every firm listed as incorporated, none dissolved). Mailboxes come from the firms'
own contact pages as reproduced in search results; the sandbox cannot open the sites, so the owner
glances at each contact page before sending (30 seconds each). Considered and dropped: Tender
Response Ltd, Tenders UK, Complete Tenders, Klick Business Solutions, Contracts Advance (only
named-person addresses found — a named address is personal data and needs the LIA below applied
per person; generic mailboxes do not); Armadillo (Milton Keynes) and Suspire Media (no Companies
House match on the trading name); Tender Victory Ltd and Websdale Ltd (one-person firms whose
published address is the founder's own — treated like a sole trader to be safe).

## 2. Lawful basis (read before sending)

- **PECR reg. 22** restricts unsolicited marketing email to *individual* subscribers. A limited
  company is a corporate subscriber; its generic mailbox (info@, hello@, studio@, enquiry@) is not
  an individual's address. Every target above is a limited company and every address is generic.
- **PECR reg. 23**: the sender is identified and a valid reply address is given (the footer).
- **UK GDPR** applies the moment a named person replies. Their name and work address are then
  processed under legitimate interests (LIA C in `GDPR.md`): reply, answer, delete the thread
  after two years like any support mail; never added to a list.
- **Opt-out** is one reply ("no thanks"); the owner adds the domain to the suppression list in
  §5 and nothing is ever sent there again by anyone (routines included).
- No follow-up email. One message per firm; silence is an answer.
- Not a mandate to scale: this is a ten-email test. Re-run only against a fresh, equally
  researched list and only if this one meets its proof number.

## 3. What is true (claims the drafts rely on)

| Claim | Source |
| --- | --- |
| 16 official registers, one JSON schema, refreshed daily | `src/sources/registry.ts`, `LAUNCH-POST-KIT.md` facts table |
| Contracts Finder awards carry the winning supplier and its company number | `docs/ARCHITECTURE.md` (uk-contract-awards) |
| Change feed (`/v1/changes/<dataset>?since=`) for the D1 registers incl. uk-charities, uk-care-locations, uk-schools; 90-day history | `src/routes/changes.ts`, kit facts table |
| `website_present=false` filter on uk-care-locations, uk-charities, uk-schools | `src/sources/query.ts` PRESENT_SUFFIX; each source's filter schema |
| uk-charities filters `date_of_registration_after`, `latest_income` field | `src/sources/uk-charities.ts` |
| Care-home phone numbers and charity contact details are dropped at ingest | `docs/ARCHITECTURE.md` (Blind Mode) |
| Free tier 250 requests/month, no card; paid from £5/month; up to 100 rows per request | `public/index.html`, `src/billing/plans.json`, `src/sources/query.ts` |
| MCP endpoint for Claude and other agents | `src/mcp/` |

Not claimed anywhere: a change feed on uk-tenders or uk-contract-awards (they are KV snapshots),
row counts, "every tender", contact details of any kind.

## 4. Sending

- From **info@gankdat.com** if the Gmail "send mail as" alias exists (Settings → Accounts); the
  routine cannot see that setting. Otherwise from gio@1402celsius.com — that is also fine, the
  footer names gankdat and the reply address. Do not send from a personal address.
- Plain text, no tracking pixels, no links other than gankdat.com. Two or three a day, weekday
  mornings, so replies are spread out.
- Log each send in §6 the same day; the inbox-triage routine will log replies in `docs/INBOX.md`
  and the build routine closes the experiment 14 days after the last send.

## 5. Suppression list

Domains that opted out or bounced — never emailed again by anyone:

| Domain | Date | Reason |
| --- | --- | --- |
| _(none yet)_ | | |

## 6. Send log

| # | Firm | Sent (date) | Reply? | Sign-up? | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | Executive Compass | | | | |
| 2 | Thornton & Lowe | | | | |
| 3 | Hudson Succeed | | | | |
| 4 | BWS | | | | |
| 5 | Bid Solutions | | | | |
| 6 | Bubble Design | | | | |
| 7 | Splitpixel | | | | |
| 8 | Giant Digital | | | | |
| 9 | Adept | | | | |
| 10 | Wholegrain Digital | | | | |

## 7. The drafts

Every draft ends with the same footer. Signed "Gio"; change it if you sign differently.

```
If this isn't relevant, reply "no thanks" and I won't write again.

Gio
gankdat · gankdat.com · info@gankdat.com
Sixteen official UK/EU registers as one API, run by a UK sole trader.
```

### 1 — Executive Compass · info@executivecompass.co.uk

**Subject:** Contracts Finder awards as a daily feed for Executive Compass?

Hi Executive Compass team,

You write bids across most sectors, so you probably watch who is winning what almost as closely as what is being tendered. Contracts Finder publishes every award with the winning supplier, but checking it by hand each week, or paying Tenders Direct or Tussell prices for it, is a lot for what is public data.

I run gankdat, a small UK API that serves Find a Tender notices, Contracts Finder awards (winning supplier and its company number on every award) and TED notices as one JSON schema, refreshed every morning. It also answers questions from Claude and other AI tools over MCP, which bid teams have started using for first drafts.

Free tier is 250 requests a month with no card; paid plans start at £5 a month.

Would a daily "who won what in our clients' sectors" feed be useful to your team, or is that already covered? Happy to send a sample query for a sector you care about.

[footer]

### 2 — Thornton & Lowe · hello@thorntonandlowe.com

**Subject:** Who is winning your clients' contracts — as an API?

Hi Thornton & Lowe team,

A question bid writers get asked constantly is "who won this last time, and for how much?" Contracts Finder has the answer for every award, including the supplier's company number, but it is buried in a portal that nobody wants to check daily.

gankdat is a small UK API I run that serves Contracts Finder awards, Find a Tender notices and TED notices as one JSON schema, refreshed every morning, so that question becomes one request. Bid teams also use it from Claude over MCP to pull award histories straight into a first draft.

Free tier is 250 requests a month, no card needed; paid plans from £5 a month.

Is competitor-win data something your writers or your training clients would use if it were one call away? A sample query for one of your sectors is a two-minute job on my side.

[footer]

### 3 — Hudson Succeed · hello@hudsonoutsourcing.com

**Subject:** A tender and award feed behind Hudson's opportunity tracking?

Hi Hudson team,

You offer opportunity tracking as a service, so someone at Hudson is checking Find a Tender, Contracts Finder and TED every morning for clients. That is exactly the job I built gankdat to remove.

gankdat is a small UK API that serves Find a Tender notices, Contracts Finder awards (with the winning supplier and its company number) and TED notices as one JSON schema, refreshed every morning, up to 100 rows per request. Everything comes from the official Open Government Licence feeds, nothing scraped. It also works from Claude and other AI tools over MCP.

Free tier is 250 requests a month with no card; paid plans start at £5 a month, which is a rounding error next to the usual alert subscriptions.

Would a feed like this save your tracking team time, or do you already pull the portals programmatically? Glad to send a sample query for a sector one of your clients bids in.

[footer]

### 4 — BWS · info@bidwritingservice.com

**Subject:** Award histories for your SME clients, as one API call

Hi BWS team,

With 200+ SME clients, you must field the same question weekly: what has this buyer awarded before, and to whom? Contracts Finder holds every award with the winning supplier's company number, but pulling it by hand for each bid is slow.

I run gankdat, a small UK API that serves Contracts Finder awards, Find a Tender notices and TED notices as one JSON schema, refreshed every morning. One request returns the award history for a buyer or a supplier; the same data is available to Claude and other AI tools over MCP for drafting.

Free tier is 250 requests a month with no card; paid plans start at £5 a month.

Would a buyer or competitor award lookup be useful in your bid preparation or review work? Happy to send a sample query for one of your clients' sectors.

[footer]

### 5 — Bid Solutions · enquiry@bidsolutions.com

**Subject:** Public-sector award data for Bid Solutions' consulting work

Hi Bid Solutions team,

For the consulting side of Bid Solutions: which buyers are awarding, to whom, and what is coming up on Find a Tender is public data, but it lives in three portals that nobody enjoys checking.

gankdat is a small UK API I run that serves Find a Tender notices, Contracts Finder awards (winning supplier and company number on every award) and TED notices as one JSON schema, refreshed every morning. It also answers questions from Claude and other AI tools over MCP, so a consultant can ask "awards by this buyer in the last year" in plain English.

Free tier is 250 requests a month with no card; paid plans start at £5 a month.

Is this something your consultants, or the bid professionals you place, would use? I can send a sample query for a sector you work in most.

[footer]

### 6 — Bubble Design · studio@bubbledesign.co.uk

**Subject:** Care homes on the CQC register with no website recorded

Hi Bubble Design team,

You build websites for care homes, so here is a list you might want: the CQC register records a website for most regulated locations, and none at all for the rest. Those, and the locations newly registered each week, are the homes most likely to need what you make.

I run gankdat, a small UK API over sixteen official registers. The CQC care directory is one of them, refreshed daily, with a filter `website_present=false` and a change feed that returns the locations added or changed since a date you choose. Rows carry the home's name, address, provider and CQC id; we drop phone numbers and never hold personal data, so it is a research list, not a contact list.

Free tier is 250 requests a month with no card (up to 100 rows per request); paid plans from £5 a month.

Would a weekly list of new or website-less care homes in your regions be useful to your new-business work? Happy to send a sample for one county.

[footer]

### 7 — Splitpixel · hello@splitpixel.co.uk

**Subject:** Charities and schools with no website on the register

Hi Splitpixel team,

You work with charities and arts organisations, so here is a list that might feed your new-business pipeline: the Charity Commission register records a website for many charities and none for the rest, and new charities register every week. Schools in England sit on a similar register (DfE GIAS).

gankdat is a small UK API I run over sixteen official registers, including both of those, refreshed daily. Filters such as `website_present=false`, `date_of_registration_after=2026-08-01` and a change feed (rows added or changed since a date, 90 days of history) turn "who registered this month with no website" into one request. Rows hold the organisation's name, address, registration number and income band; contact details are dropped at ingest, so nothing personal is stored.

Free tier is 250 requests a month with no card; paid plans start at £5 a month.

Would a monthly list of new Yorkshire charities be useful to you? I can send a sample.

[footer]

### 8 — Giant Digital · info@giantdigital.co.uk

**Subject:** Newly registered charities each week, filtered by income

Hi Giant Digital team,

For an agency working with larger charities, the Charity Commission register is a decent early signal: every new registration appears there, with the charity's latest income once filed, and the register records whether the charity has a website at all.

I run gankdat, a small UK API over sixteen official registers, refreshed daily. The Charity Commission one supports filters on registration date, income and whether a website is recorded, plus a change feed that returns charities added or changed since a date (90 days of history). Rows hold the organisation's name, address, number and income; contact details are dropped at ingest. It also answers questions from Claude and other AI tools over MCP.

Free tier is 250 requests a month with no card; paid plans start at £5 a month.

Would a weekly list of newly registered charities above an income threshold be useful to your new-business team? Happy to send a sample.

[footer]

### 9 — Adept · hello@adeptdesign.co.uk

**Subject:** Charities with no website recorded, from the register

Hi Adept team,

Since you work only with charities: the Charity Commission register records a website for some charities and none for many others, and new charities register every week. That list is probably your best prospect list, and it is public.

gankdat is a small UK API I run over sixteen official registers, refreshed daily. On the Charity Commission register it offers filters such as `website_present=false` and `date_of_registration_after=<date>`, plus a change feed that returns the charities added or changed since a date you choose. Rows carry the organisation's name, address, registration number and income; contact details are dropped at ingest, so it is a research list, not a mailing list.

Free tier is 250 requests a month with no card (up to 100 rows per request); paid plans from £5 a month.

Would a monthly list of new or website-less charities in East Anglia be useful? I can send a sample for Norfolk.

[footer]

### 10 — Wholegrain Digital · hello@wholegraindigital.com

**Subject:** New charities and new companies, weekly, as JSON

Hi Wholegrain team,

You build WordPress sites for charities and positive businesses. Two public registers say who is new each week: the Charity Commission register (every new charity, with whether it has a website recorded) and Companies House (every new incorporation).

I run gankdat, a small UK API that serves sixteen official registers, those two included, as one JSON schema refreshed daily. On charities there are filters such as `website_present=false` and `date_of_registration_after=<date>` and a change feed of rows added or changed since a date. Rows carry organisation names, addresses and register numbers only; contact details are dropped at ingest. It also works from Claude and other AI tools over MCP.

Free tier is 250 requests a month with no card; paid plans start at £5 a month.

Would a weekly "new charities in London with no website" list be useful for your new-business work? Happy to send a sample.

[footer]
