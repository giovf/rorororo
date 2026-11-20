# Spike: Superhive (Blender Market) as a billed shelf for one small Blender add-on

Queue item `new-ventures/spike-superhive-blender-addons` (burn-down, 2026-11-20; seeded by the 09:17 build's
research). Sources: eight fetch-relay rounds on 2026-11-20 — `spike-superhive-2026-11-20` (14 lines: `robots.txt`, the
site Terms of Use, Creator Terms, who can sell, payout country page, payout methods, threshold, payout schedule,
getting started, three help categories, Market Stats, Become a Creator), `-b` (16 lines: product guidelines, Creator
Policy, one-product rule, VAT, API access, fee calculation, listing pages, three product pages, one creator page),
`-c` (16 lines: eleven browse pages, two Import & Export pages, three pages of extensions.blender.org), `-d` (107
product pages), `-e` (three older browse pages) and `-f1`, `-f2`, `-f3` (20 product pages each). Relay bodies are
pruned after 7 days; every fact used is copied here.

**Call: park.** The terms are open to us and the money route is one PayPal address, but the shelf's own counts say a
new small add-on from an unknown creator does not sell: 51 of the 60 add-ons read at one to two months old show no
sales count at all (the badge starts at 10), and the 30 best sellers under US$15 are all more than a year old. About
28 new add-ons a day are listed; one shop alone listed 30 of the 71 read at 10–17 days old.

## 1. Terms, in the shelf's own words

| Question | Answer (page) |
| --- | --- |
| Who can sell | "at least 16 years old", a confirmed email, a country where shops can be opened, a working payout method; "There's no application to fill out and no waiting for approval" (article 55) |
| UK individual paid? | Yes: Stripe Connect Express (bank account; "Stripe will contact you for more information to confirm your identity") or "PayPal with a valid PayPal email" (articles 273, 298, 46) — the PayPal route asks Superhive for nothing more than the address |
| Payout floor and timing | "equal to or greater than $25 USD"; paid on the 1st and 15th; a new creator's sales wait 30 days until the first payout; 7-day pause after payout details are set (articles 284, 46) |
| Tax form | None named for a non-US creator (the Taxes category holds a US 1099 page and a VAT page); Superhive "is the Merchant of Record"; VAT: "We don't yet offer VAT collection or remittance of any kind" (article 15) |
| Fees, free plan | "(price - (price * merchant_fee) - transaction_fee) * commission_rate": 5.5 %, US$0.49, 70 % (article 185) |
| AI-written code | No line in the Creator Terms (44), Creator Policy (277), product guidelines (253) or site Terms. The rules that bind are "All products are made or designed by you" and GPL or MIT for every add-on |
| AI the other way | Not found in those four pages; the blog post "Still Here. Still Learning." was not read |
| First-product review | "Our team reviews every new creator's first product … Reviews typically take 3–5 days"; one product in progress until the first is approved (articles 182, 388) |
| What a listing must carry | At least 5 images at 2:1 and 1200 px wide, install steps and written documentation on the product page, a valid Blender extension, files that pass a malware scan (article 253) |
| Standing duty | "respond to support messages within 72 hours", through the shop's inbox on Superhive (253, 44) — an inbox only the account holder can read |
| Automated reads of the shelf | `robots.txt` is `User-agent: *` with no Disallow; the Terms bar use that could "damage, disable, overburden, or impair the Site". Six of 107 product reads answered HTTP 429; the later rounds were sent 20 at a time |

Net per sale on the free plan: US$2.96 at US$5, US$6.27 at US$9.99, US$9.58 at US$15. The US$25 floor is
four sales at US$9.99.

## 2. The shelf's own numbers

Market Stats (cumulative, 2026-11-20): 7,159 creators, 74,243 products of which 6,907 add-ons, 5,804,112 items sold,
1,140,351 customers, US$53,533,353 paid to creators since June 2014. That is about US$7,480 per creator over twelve
years on average, and the home page's weekly top sellers are the incumbents (Auto-Rig Pro, Human Generator, RetopoFlow,
Flip Fluids).

The add-on browse list is 291 pages of 24. Sorted newest first, page 20 is 17 days old and page 40 is "about 1 month":
roughly 28 add-ons listed a day. A product page shows a `Sales` line from 10 sales up (`10`, `10+`, `60+`, `100+`,
then hundreds); no line means fewer than 10.

### 2a. Sixty add-ons one to two months old (browse pages 40, 50, 60; the first 20 of each)

Sales line on 9 of 60; ratings on 3 of 60; median price US$9.99. Of the 43 priced under US$15, 6 show a sales line.
The nine: `radfit` 100+, `bonesculptpro` 60+, `cinematic-product-studio` 60+, and six at 10 or 10+. The small
utilities of the shape we could build — `sidebar-order`, `horizontal-sidebar-navigator`, `curve-merge-by-distance`,
`renderroster`, `colorize--rename-rigid-body-constraints`, `reference-remapper`, `lod-builder` — show none.

| Product | US$ | Sales | Ratings | Published |
| --- | --- | --- | --- | --- |
| `quick-presentation---create-your-presentati…` | 3.40 | — | 0 | about 1 month |
| `branch-poly-line` | 20.00 | — | 0 | about 1 month |
| `tweenkit---blender-` | 19.00 | — | 0 | about 1 month |
| `scanforge` | 12.99 | — | 0 | about 1 month |
| `traverse` | 29.00 | — | 0 | about 1 month |
| `audio-react--audio-reactive-animation-for-b…` | 13.30 | — | 0 | about 1 month |
| `storyflow` | 25.00 | — | 0 | about 1 month |
| `curve-merge-by-distance` | 6.99 | — | 0 | about 1 month |
| `fastener-generator` | 5.00 | — | 0 | about 1 month |
| `xbox-theme` | 2.50 | — | 0 | about 1 month |
| `uv-rectipack` | 9.99 | — | 0 | about 1 month |
| `dopesheetflow` | 15.00 | — | 0 | about 1 month |
| `boxwright` | 15.00 | — | 0 | about 1 month |
| `curve-doctor` | 29.00 | — | 0 | about 1 month |
| `bonesculptpro` | 8.44 | 60+ | 2 | about 1 month |
| `fold-box` | 8.40 | — | 0 | about 1 month |
| `obssidian-mcp-doctor` | 8.49 | — | 0 | about 1 month |
| `minimap` | 6.99 | — | 0 | about 1 month |
| `archcore-city` | 4.99 | 10+ | 0 | about 1 month |
| `sequencerflow-pro` | 25.00 | — | 0 | about 1 month |
| `easy-add-bone-onion365` | 2.07 | 10+ | 0 | about 2 months |
| `human-skin-animated-effects` | 7.40 | 10+ | 0 | about 2 months |
| `oh-my-bake` | 5.50 | — | 0 | about 2 months |
| `glintlock` | 14.99 | — | 0 | about 2 months |
| `spaceship-realism-toolkit-pro` | 12.00 | — | 0 | about 2 months |
| `shake-node-to-disconnect` | 2.50 | 10+ | 1 | about 2 months |
| `compositor-fx` | 8.99 | — | 0 | about 2 months |
| `stylizer-vfx` | 11.39 | — | 0 | about 2 months |
| `glass-studio` | 10.00 | — | 0 | about 2 months |
| `ugamepro` | 49.00 | — | 0 | about 2 months |
| `reference-remapper` | 7.00 | — | 0 | about 2 months |
| `lod-builder--blender-addon-for-game-asset-l…` | 4.99 | — | 0 | about 2 months |
| `arkafurnishing` | 1.00 | — | 0 | about 2 months |
| `smart-cut-and-bevel` | 24.00 | — | 0 | about 2 months |
| `vfx-export-studio-realtime-vfx-textures` | 9.99 | — | 0 | about 2 months |
| `node-quick-spawn` | 9.99 | — | 0 | about 2 months |
| `cinematic-product-studio` | 15.00 | 60+ | 1 | about 2 months |
| `selective-mirror` | 10.00 | — | 0 | about 2 months |
| `radfit--fit-any-outfit-to-any-body` | 14.25 | 100+ | 0 | about 2 months |
| `rbf-nodes` | 17.99 | 10+ | 0 | about 2 months |
| `brittle` | 29.99 | — | 0 | 2 months |
| `entropy-designer-engine` | 10.00 | — | 0 | 2 months |
| `renderroster` | 6.99 | — | 0 | 2 months |
| `place-director-pro` | 7.49 | — | 0 | 2 months |
| `note-scatter--notes-stickers--magnets` | 12.00 | — | 0 | 2 months |
| `ascii-render` | 9.00 | — | 0 | 2 months |
| `blender-preview` | 3.99 | — | 0 | 2 months |
| `lightstudio-quick` | 10.00 | — | 0 | 2 months |
| `3d2ai` | 30.00 | — | 0 | 2 months |
| `velocity-blur` | 9.99 | — | 0 | 2 months |
| `stack-motion-pro` | 20.00 | — | 0 | 2 months |
| `cveld-tradingholic` | 9.99 | — | 0 | 2 months |
| `on-screen-key` | 8.50 | — | 0 | 2 months |
| `render-pass-bar-octane-cycles-eevee` | 20.00 | — | 0 | 2 months |
| `oneclick_asset` | 9.00 | — | 0 | 2 months |
| `sidebar-order` | 6.99 | — | 0 | 2 months |
| `simulation-to-shapekeys` | 10.00 | — | 0 | 2 months |
| `horizontal-sidebar-navigator` | 5.00 | — | 0 | 2 months |
| `colorize--rename-rigid-body-constraints` | 3.00 | — | 0 | 2 months |
| `blockxq` | 16.00 | 10 | 0 | 2 months |

Younger still (browse pages 12, 16, 20 — 10 to 17 days old, 71 pages read, 6 more answered 429): a sales line on 3 of
71 (`nexfoliage` 60+ on a launch coupon, `inkit` 20+ from an established creator, `grounded-smart-scatter-for-blender`
10+). One shop (`zeg`) holds 30 of the 71 with "<thing> Generator" listings at US$5–15, none with a sales line;
another (`sonneblomdigitaal`) holds 10.

### 2b. The thirty best-selling add-ons priced US$1–15

Every one is more than a year old; the youngest are `bqr-boolean-quad-ready` (over 1 year, 4,800+) and two at over 2
years. Sales here are a long tail earned over years by creators with a following, not a new-listing effect.

| Product | US$ | Sales | Ratings | Published |
| --- | --- | --- | --- | --- |
| `cbl` | 10.00 | 17200+ | 88 | over 6 years |
| `random-flow` | 12.75 | 14600+ | 54 | about 5 years |
| `auto-rig-pro-quick-rig` | 12.50 | 10100+ | 32 | about 6 years |
| `speedretopo` | 10.00 | 9000+ | 35 | almost 7 years |
| `construction-lines` | 11.00 | 7400+ | 55 | over 6 years |
| `fluid-painter` | 10.00 | 6300+ | 51 | over 3 years |
| `bonedynamics` | 15.00 | 6100+ | 49 | over 5 years |
| `tracegenius-pro` | 15.00 | 5900+ | 92 | over 2 years |
| `rain-generator` | 12.00 | 5800+ | 24 | about 4 years |
| `alt-tab-easy-fog` | 8.00 | 5800+ | 38 | over 3 years |
| `simple-bend` | 8.00 | 5200+ | 44 | about 4 years |
| `instantclean` | 12.99 | 5000+ | 34 | almost 4 years |
| `auto-highlight-in-outliner` | 4.89 | 5000+ | 62 | over 2 years |
| `bqr-boolean-quad-ready` | 5.00 | 4800+ | 18 | over 1 year |
| `grungit` | 1.00 | 4400+ | 37 | almost 7 years |
| `quicksnap` | 1.00 | 4300+ | 48 | about 4 years |
| `baketool` | 14.95 | 3800+ | 51 | over 12 years |
| `tesselator` | 8.50 | 3700+ | 27 | about 8 years |
| `extra-lights` | 9.99 | 3500+ | 27 | over 6 years |
| `physics-dropper` | 4.00 | 3300+ | 43 | almost 5 years |
| `powersave` | 1.00 | 3100+ | 15 | over 6 years |
| `clean-panels` | 12.60 | 3100+ | 93 | over 4 years |
| `rizomuv-bridge` | 10.00 | 2900+ | 46 | almost 7 years |
| `pivot-transform` | 15.00 | 2600+ | 38 | over 7 years |
| `round-inset` | 8.00 | 2600+ | 15 | over 4 years |
| `pro-lens-2` | 7.00 | 2400+ | 17 | almost 5 years |
| `rantools` | 13.99 | 2400+ | 35 | over 5 years |
| `layerpainter` | 1.00 | 2400+ | 29 | almost 8 years |
| `symmetrize-uv-util` | 6.00 | 2300+ | 24 | over 6 years |
| `drag-n-drop-import` | 15.00 | 2300+ | 38 | over 3 years |

## 3. The free twin

Not read per job. extensions.blender.org's `robots.txt` (read in round `-c`) disallows the Claude-named agents and
sets `ai-train=no, use=reference`, so after the one listing page fetched in that same round no further page was
requested and the host was not kept on the relay allow-list. That page's own tag counts are enough for the call: 214
free extensions tagged Import-Export, 138 User Interface, 75 Pipeline, 169 Mesh — the scriptable jobs (import and
export, renaming, scene checks) are where the free shelf is thickest.

## 4. Candidate and sum

The gap the Import & Export list suggests is a pre-export check for game or web hand-off (naming, scale, applied
transforms, polygon and texture budget). It is already listed by others this quarter — `GLB Web Budget` US$13,
`Units & Scale Guard` US$9, `lod-builder` US$4.99 (no sales line at two months) — so it is not a gap, and no other
scriptable job on the two pages is unserved.

At the cohort's median (fewer than 10 sales in two months at US$9.99) the line earns under US$56 in its first two
months, against 0.5–1 week of build, five product images, on-page documentation, a 3–5 day review and a support inbox
the owner would have to watch every 72 hours. The 85th-percentile outcome (10 or more sales) starts at about US$63.

## 5. Call

**Park** on the item's own first criterion: the median of the 60 add-ons shows no sales signal. Payout (a PayPal
address) and the terms (no AI line) would have passed; the free-twin criterion was not tested per job.

Trigger: a Blender tool need that reaches us from a buyer — a /feedback or inbox line, or a paying customer of ours
asking for it — or a job we can name with no listing on Superhive and no free extension; then a 0.2-day read of that
job's nearest five listings before any build. No dated re-read.
