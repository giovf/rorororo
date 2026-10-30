# Spike: Nomad Data as a buyer-request channel for gankdat's registers

Queue item `new-ventures/spike-nomad-data-vendor-profile` (build, 2026-10-30 09:15–09:30 UTC; seeded by the 2026-10-29
exchange pre-research pass). Sources: three fetch-relay rounds this run (`docs/relay/responses/nomad-data-2026-10-30`,
`-b-`, `-c-`; pruned after 7 days) — the marketing site (`www.nomad-data.com`: home, Connect, data sellers, pricing,
Data Relationship Manager pricing, privacy policy, FAQs, the sitemap's 5,493 URLs, the "What's new" provider library on
three pages, six data-use-case pages near our registers, five blog posts), the HubSpot landing pages
(`landing.nomad-data.com`: the provider pitch written for Harbr vendors, "Meet Nomad Data", "Let's talk"), the app shell
(`app.nomad-data.com`, a React single-page app) and the rendered Auth0 sign-up form (`auth.nomad-data.com`); plus the
Monda partnership post and four WebSearch passes to find the page names. The four hosts were added to
`docs/relay/hosts.txt` (the sandbox cannot resolve any of them). Nothing was signed up for; nothing fetched needed a
login.

The questions the pre-research left open: whether the vendor profile is self-serve or only after a booked call; what a UK
individual must give; whether the vendor side is free in the terms, not only on the marketing page; how a matched request
reaches the vendor and is answered; whether buyers' requests for UK company, charity, sanctions or tender data exist;
and which UK-register or sanctions vendors it lists, at what prices.

## 1. How the market works (Nomad's own pages, read 2026-10-30)

| Source | What it says |
| --- | --- |
| Connect (`/connect`) | Buyer flow: "Describe your use case in detail … sends the request to several data providers. **Data providers receive an email about the search and login to respond.** Data providers give you detailed information on how their data applies to your need. You choose which providers best suit your need. The platform puts you in direct contact." Free buyer account: "create a data request. We'll match it to providers … and return anonymous responses"; "upgrade to a paid annual subscription to connect directly with the matched providers". "Over 5,600 external data providers." |
| Data sellers (`/data-sellers`, the only vendor page on the main site) | "Connect at the point of search … **No usage or transaction fees. We don't need access to your data.** … Buyers only see your details once you respond … You negotiate directly with the client, control the contract and **keep 100% of the sale**." Call to action: "Create your anonymous profile" → `auth.nomad-data.com/u/signup` (Auth0 Universal Login) — the same sign-up the buyer buttons use. |
| Rendered sign-up (`-c-` round, `app.nomad-data.com/direct-signup` → Auth0) | A one-field form: "Create Your Account — Sign Up to Nomad Data to continue to Nomad Data. Email address". No company, role or vendor/buyer choice before the login; whatever distinguishes a vendor profile from a buyer account sits behind it. The app loads Chargebee (buyer subscriptions) and Pendo; no public vendor API or developer page exists anywhere in the sitemap. |
| Provider landing for Harbr vendors (`landing.nomad-data.com/harbr_providers`) | "**Book a call to create your anonymous profile** and start receiving qualified leads today … Save money. No revenue share, no commissions." Testimonial (Revelio Labs CEO): "We received an automated email and responded to the client's request. Within a week we had begun an evaluation and within a month had made a strategic sale. The best part was that Nomad doesn't take a cut of our revenues." |
| Blog, *Reimagining data marketplaces* (2024-10-01) | Vendor onboarding as Nomad runs it: tools "scan nearly 100 million companies" for likely vendors, "automated outreach", and "**the final step is to have a short, live call with the company, which is the most manual part of the process**"; "Nomad Data comes to new vendors with live leads, which allows the company to often onboard new partners in a matter of minutes." "The platform **doesn't require signed agreements unless a vendor specifically requests one**", "choosing not to take a revenue share". "**Unlike traditional marketplaces, there are no listings on Nomad Data**" — a vendor's identity stays hidden until it answers a request. |
| Terms | `/terms`, `/terms-of-service`, `/privacy-policy` are 404; the sitemap has no terms page. The only legal text is the **Privacy Policy (last updated 2026-06-02)**, with a UK GDPR supplement; it says an account collects "name, email address, and job title … information about your company", that login and payment are handled by third parties, and that "a written agreement between Nomad Data and a customer" governs where it conflicts. **No vendor terms are published**: the no-fee promise exists only on the marketing pages and the blog. |
| Buyer prices (`/data-relationship-manager`, `learn-more`) | Connect licence **US$300 per user per month** ("3 simultaneous searches, no hidden transaction fees"); DRM plans **US$1,000 / 2,000 / 3,000 per month** (Basic: 1 seat, 1 request a month; Pro: 5 seats, 3 requests a month per seat); Doc Chat "starting at $3K/month". The buyers are procurement-grade: "hedge funds, private equity, consulting, insurance, corporate". |
| Scale (blog milestones, home) | 2,000th provider → 2,500th → 3,000th (2024) → 4,000th → 5,000th (2026-03-11); home says "over 5,600 providers"; "adds over 1,000 providers a year". Buyer or request counts are never published. |

## 2. Demand for our registers on the channel

- **No request is public.** Requests are routed privately to matched vendors; "there are no listings". The only outward
  trace of request topics is Nomad's library of **2,875 data-use-case pages** (SEO articles written from need
  categories). Those near gankdat's registers: *UK Public Sector Contracts Data* (two pages), *Corporate Ownership
  Insights*, *Unlocking Insights with Beneficial Ownership Data*, *Business Compliance Data*, *UK Business Locations
  Data*, *US Corporate Registration Data*. Each says "Submit your free data request describing your business use case
  and you'll be connected with data providers from our over 5,600 partners" — evidence that these needs are asked for,
  not how often.
- **The provider library** ("What's new", 30 cards over three pages, identities hidden, no prices): one "Diversified"
  provider covers "trade, **sanctions and politically exposed persons** … procurement, corporate entities" for India
  and the EU; one "Government" provider has "procurement, enforcement … 75M+ records across 40+ countries" (China,
  Asia, Middle East); one 2023 blog names a "leader in government contract awards data" with "90 million" contracts
  in "nearly 50 countries". **No UK company-register, UK charity or UK sanctions vendor is visible** — which is what
  "no listings" guarantees, not a sign of absence.
- **Vendor prices** are not on Nomad at all (the vendor sets them off-platform), so the proof's "three listed
  UK-register or sanctions vendors with prices" cannot be read here. The rivals a UK-register request would meet are
  the ones the AWS Data Exchange spike priced on 2026-10-29: mnAi at US$280,000 a year, ComplyAdvantage at US$65,000
  a year, Open Automation at US$0.25 a check — against gankdat's £6-a-month plan and US$0.005 x402 calls.

## 3. Promote / park call — **park**

Against the item's own conditions:

1. **Does the profile need a call?** Not for the first step: the main site's "Create your anonymous profile" is a
   self-serve Auth0 sign-up (email only). But Nomad's own account of onboarding ends in "a short, live call" and its
   partner page says "Book a call to create your anonymous profile"; what the app asks after the login — and whether
   a profile goes live without the call — is behind an account, and an account is an owner-identity action
   (CLAUDE.md). The owner could spend ten minutes to find out; the next two points say it is not worth asking.
2. **Can the Worker answer a request?** No. A matched request arrives as an email and is answered by "login to
   respond" in the app with a written explanation of fit; there is no vendor API, no email-reply path on the pages,
   and the sandbox holds no credentials. Every lead is an owner login and a few minutes of writing — recurring human
   effort on a line whose brief is products that earn without it, for an unknown and probably small number of
   requests.
3. **Is the vendor side free?** On every marketing page, yes (no usage or transaction fees, no revenue share, keep
   100 %); in terms, unverifiable — Nomad publishes no vendor terms at all. Not a park reason on its own.
4. **Do register requests exist?** Indirectly: seven use-case pages near our registers, two procurement-data vendors
   and one sanctions vendor in the visible library. But the buyers pay US$300–3,000 a month to search, Nomad sells
   them "unique, niche, previously unattainable" data, and the vendors already on the shelf for UK company data charge
   five and six figures. A request for Companies House-derived data from such a buyer is a request for breadth and
   SLAs, not a £6 plan; a cheap answer may still win a consultancy's one-off need, but nothing read here says how
   often such a request appears.

Park with the trigger **"gankdat has a paying account and the owner accepts one onboarding call (≤ 30 min) plus a
few minutes per matched request"** — then a gankdat item writes the profile text (registers, coverage, plan links)
and a paste-ready response template, and the triage routine drafts each answer from the request email. No queue
item now; the idea stays in `docs/pipeline/exchange.json` as `nomad-data-vendor-profile`. Nothing on the pages
forbids any of this (the privacy policy covers UK users; vendors sign nothing unless they ask), so the park is a
return-on-owner-minutes call, not a terms one.
