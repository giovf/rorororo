# Spike: MuleRun as a pay-per-run shelf for an agent of ours

Queue item `new-ventures/spike-mulerun-agent-marketplace` (burn-down, 2026-11-19; seeded by the same slot's exchange
pre-research with no spike open). Sources: two fetch-relay rounds — `docs/relay/responses/mulerun-2026-11-19` (17
lines: three creator-guide pages, `/creator`, the home page, `robots.txt`, the sitemap index, the docs index, two
guesses at a terms URL, the blog index and two blog posts, three forum threads, the forum's latest-topics JSON) and
`mulerun-2026-11-19-b` (10 lines: the docs' `llms.txt`, the Terms of Use, the pricing page, the Skills Hub, the main
sitemap, three forum threads as JSON, the blog's Creator category and Marketplace tag) — and six WebSearch reads from
the sandbox, which is what the seed was written from. Relay bodies are pruned after 7 days; every fact used is copied
here.

**Call: park.** The shelf the search results described no longer exists on the site. MuleRun was a marketplace of
creator-priced agents until early 2026; today it sells one hosted agent of its own on a subscription, and every page
that told a creator how to list, price or be paid is gone.

## 1. What the search results said (the seed)

- "Agent creators set the price per run … and earn 80 %" (MuleRun's Notion page, as a search result quoted it).
- A month's earnings can be withdrawn from the 15th of the next month (`/docs/creator-guide/quickstart/manage-your-business`).
- n8n, Dify and ComfyUI workflows port over; "millions of agent calls" (engineering blog title); 180–350+ agents and
  700+ creators (directories).

## 2. What the site says on 2026-11-19

| Read                                                             | Answer                                                                                                     |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `/docs/creator-guide/quickstart/manage-your-business`            | 404 "Page Not Found"                                                                                       |
| `/docs/creator-guide/marketing/creator-program-rules`            | 404                                                                                                        |
| `/docs/creator-guide/creator-studio/creator-balance/credit-types` | 404                                                                                                        |
| `/creator` ("Become a MuleRun creator" in the search results)    | 404 "Oops! Page not found"                                                                                 |
| The docs index (`/docs/llms.txt`, the whole list)                | 9 guide pages — Get Started, Chat, Computer, Drive, Knowledge, Pages, Datasources, Browser Connector, Scheduled Tasks — 13 CLI pages, 8 legal pages, model API specs. No page on publishing, pricing, metering, balance or payout. The folder is still named `creator-guide`; nothing in it is for creators |
| Home page                                                        | "MuleRun — The AI Agent That Gets Work Done", "The Always-On AI Agent … A Dedicated Computer That Works Around the Clock"; the docs call it "Your All In One AI Office Platform". No marketplace, no agent listing, no creator link |
| Main sitemap (all 7 URLs)                                        | `/`, `/pricing/plan`, `/pricing/credit`, `/pricing/gift-card`, `/ambassadors`, `/chat`, `/use-cases`       |
| `robots.txt`                                                     | `/agents/` and `/creator/` are disallowed for every crawler                                                |
| Pricing                                                          | Buyers pay MuleRun: US$1 = 100 credits; Free (200 credits a day), Plus US$16 a month billed yearly (2,000 credits, a personal VM) and higher plans. Nothing is priced per third-party agent |
| Skills Hub (`/skillshub`)                                        | "Browse 180,000+ Agent Skills", "showing 1-100 of 2,063,844" — an index of free skill files (the first row is a `playwright` skill), one line of placeholder Latin in the page copy; no price, no author payout. The footer still carries the old line "The marketplace to find and run AI agents" |
| Terms of Use                                                     | No clause on creators, listings, revenue share or payouts (the words appear only in licence boilerplate). Arbitration in Singapore (SIAC). One clause matters for any later read: users may not "scrape, mine, or distil any information, data or content from the Services whether using scripts, engines, software, tools, agents …" |

## 3. When it changed — the forum's own dates

The creator forum (`community.mulerun.com`, 30 latest topics read with dates and view counts):

- 2025-12-05, staff: "You can set your own pricing. Whenever users pay to use your agent, you receive the revenue
  after the platform fee" — and "Most existing showcases are currently in Chinese". No fee figure, no earnings figure.
- 2025-12-29, staff: January 2026 incentives — US$100 for a "Featured Agent"; an earned-cash bonus whose lowest tier
  is "$20 ≤ Earned Cash < $50 (with ≥ 2 paying users)" for an extra US$15. A bonus ladder that starts at US$20 a month
  from two buyers says what an ordinary agent earned.
- 2025-12-23 to 2026-01-07: "MuleRun Agent Builder: A New Build Paradigm" (2,002 views) and its private beta — the
  product that replaced uploaded agents.
- 2026-03-11: a creator asks whether there is a Featured Agent programme for March. No reply. It is the last post in
  the incentives thread.
- 2026-03-14: "Mule Computer: your 24/7 personal AI computer" (900 views) — the product the home page sells now.
- Since April 2026 the forum has four topics, all bug reports with 37–66 views and no replies; the newest is
  2026-06-15. The blog's 2026 posts (71) are prompt and template articles for the hosted agent; the newest is 2026-05-26.

So the per-run creator marketplace ran from late 2025 to roughly March 2026. The "Version 2.0, 12 November" press
release the search found is the November 2025 marketplace upgrade, not a 2026 event.

## 4. The spike's five questions

1. **Creator terms** — none are published any more. The 80 % share and the 15th-of-the-month withdrawal are quotes
   from pages that now answer 404; the live Terms of Use do not mention creators.
2. **Demand on the shelf** — not readable and not there: no listing page is linked or in the sitemap, `/agents/` is
   closed to crawlers, and the terms bar scripted reads of the service. The 40-agent table was not attempted, on
   purpose: the pages it needs are the ones the site's own rules close.
3. **Packaging and model cost** — moot; there is nothing to package for.
4. **Review** — moot.
5. **Call** — park, on the item's own condition "2.0 closed the creator marketplace" (in fact the 2026 pivot did).

## 5. What this pass teaches

The seed was written from search-result summaries of pages that had been dead for months; one relay round to the
shelf's home page and sitemap (under two minutes, sent before seeding) would have parked it without a spike. The same
happened to the 11-17 French register pass in a milder form. Queued as foundry
`pre-research-primary-read-before-seed`: the pre-research pass reads the candidate's own live page through the relay
before it seeds, when the sandbox cannot open the host.

## 6. Trigger to reopen

MuleRun's docs index (`mulerun.com/docs/llms.txt`) lists a page on publishing or selling an agent or a skill with a
stated creator share, or the main sitemap gains a creator or marketplace URL. Then a 0.2-day read of that page and
the terms — fee, payout route, what an individual signs — before anything is built. No date is set: nothing on the
site points to a return, so this is read only if another source names it.

Also dropped by this pass, before seeding: **Coda Packs** (new seller applications paused since July 2026 and new
Superhuman Docs users cannot buy Packs, per the help page as a search result quoted it — not read first-hand) and
**MCPize** (a hosted MCP marketplace; 80–85 % to the developer by third-party posts only, and the one sales figure
found was a US$0.21 first commission).
