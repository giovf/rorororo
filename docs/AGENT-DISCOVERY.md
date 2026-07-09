# How AI agents discover APIs — and how gankdat gets found

> Answers the PROJECT BOARD outreach card ("how do AI agents find which
> resources they can use?"). Research snapshot **2026-07-09** — this space
> moves fast; re-verify before executing listings. Companion docs:
> `MARKETPLACE-PREP.md` (channel-by-channel listing mechanics),
> `GO-TO-MARKET.md` (LLM-citation content strategy).

## TL;DR

Agents find tools through six channels. Ranked by leverage-per-effort for us:

| # | Channel | How it finds us | Effort | Status |
|---|---------|-----------------|--------|--------|
| 1 | **Official MCP Registry** (registry.modelcontextprotocol.io) | We publish a `server.json`; aggregators (Glama, PulseMCP, …) syndicate from it | Low — no public repo needed for remote servers | Not published; prep task filed |
| 2 | **x402 Bazaar / Agentic.Market / x402scan** | **Automatic** — CDP facilitator catalogs the route on first mainnet settlement (`discoverable: true` is already our default) | Zero code | Waiting on first real settlement |
| 3 | **Web search by agents** | Agents search like humans, then read `llms.txt` / `/docs` / `openapi.json` | Low — fill static-surface gaps | Partial; task filed |
| 4 | **MCP directories** (Glama ~20k servers, PulseMCP 18k+, Smithery) | Crawl + form submission; they introspect `tools/list` | Low, but blocked by our auth-gated `/mcp` | Blocked; task filed |
| 5 | **Claude Connectors Directory** (first-party, highest trust) | Portal submission; requires **OAuth 2.1 + PKCE** — our bearer keys don't pass | High (OAuth build) | Deferred — revisit after Stage 0 |
| 6 | **GitHub search / awesome-lists** (awesome-mcp, awesome-x402) | Public repo or PRs to curated lists | Low, but repo is private (operator's call) | Deferred |

## 1. How agents actually discover resources (July 2026)

**MCP registries are the backbone.** The official MCP Registry launched
late 2025 (still "preview" but functioning). It supports **remote-only
servers** — a `server.json` with a `remotes: [{type: "streamable-http",
url}]` block; no npm package or public repo required. Namespacing is
verified: to publish as `com.gankdat/*` we prove domain ownership via
either a DNS TXT record at the apex or a hosted
`/.well-known/mcp-registry-auth` file (trivial for us — `public/` is
served by the Worker). API-key auth is representable: `headers:
[{name: "Authorization", isRequired: true, isSecret: true}]`.
Downstream directories increasingly syndicate from this registry, so one
publish propagates.

**Third-party directories introspect.** Glama indexes every tool name,
description, and input schema by calling the live server; Smithery publishes
via `smithery mcp publish <url>`. Our `/mcp` route runs `requireApiKey()`
*before* the MCP handler, so an anonymous `initialize`/`tools/list` gets a
bare 401 — **directories can't see our tools and clients can't "window-shop"**.
The fix (unauthenticated handshake + `tools/list`, key required for
`tools/call`, `WWW-Authenticate` on the 401) is the single highest-leverage
code change in this doc.

**x402 discovery is automatic — a genuine edge.** Coinbase's x402 Bazaar
(paginated catalog + semantic search APIs under
`/v2/x402/discovery/*`) and the public Agentic.Market front-end catalog
services from **on-chain settlement activity** seen by the CDP facilitator.
There is no registration step: the first successful mainnet payment against
`/x402/data/:source` gets us cataloged (quality metrics recompute ~6-hourly).
`x402-hono` defaults `discoverable: true`, and we run the CDP facilitator on
Base mainnet, so this channel costs nothing. x402scan indexes the same
on-chain activity independently.

**Agents also just… search the web.** Coding agents routinely hit web search
and read docs pages. `llms.txt` adoption is ~10% of domains and no major
platform has made it a first-class input, but Cursor, Copilot, and RAG
frameworks read it when present — we already ship a good one. What's missing
is the boring crawl surface: `robots.txt` (explicitly welcoming AI crawlers),
`sitemap.xml`, OpenGraph/JSON-LD (`schema.org` `WebAPI`), and
`info.contact`/`externalDocs` in the OpenAPI doc.

**First-party connector directories are the trust tier.** Anthropic's
Connectors Directory (claude.ai) requires Streamable HTTP (we have it),
a public privacy policy (we have it), tool read-only/destructive annotations,
a reviewer test account, and **OAuth 2.1 with PKCE** — which we don't have and
shouldn't build pre-validation. Park it; revisit if Stage 0 validates.

**`.well-known` server cards are coming but not settled.** Competing
proposals (SEP-2127 `/.well-known/mcp.json`, SEP-1649 server cards, an IETF
draft using `/.well-known/mcp-server` + DNS TXT). Cheap to ship once the spec
lands; don't chase drafts now — except `mcp-registry-auth`, which is needed
for channel #1 anyway.

## 2. Gaps (from repo audit, 2026-07-09)

Have: `llms.txt`, OpenAPI 3.1 at `/openapi.json` (CORS, cached), Scalar
`/docs`, `/mcp` (Streamable HTTP), x402 with `discoverable: true`, keyworded
title/meta on landing, privacy + terms pages, single brand host gankdat.com.

Missing: unauthenticated MCP introspection; `WWW-Authenticate` on 401;
`robots.txt`; `sitemap.xml`; JSON-LD / OpenGraph; OpenAPI `info.contact` +
`externalDocs`; `/.well-known/` (nothing at all); registry `server.json`;
any executed listing.

## 3. Action plan

**Now (code, Taskmaster tasks filed):**
1. MCP introspection unblock — anonymous `initialize` + `tools/list`,
   key-gated `tools/call`, `WWW-Authenticate: Bearer` on 401, per-IP rate
   limit for anonymous traffic.
2. Static discovery surface — `robots.txt` (allow all, explicitly name
   GPTBot/ClaudeBot/PerplexityBot; disallow `/account`), `sitemap.xml`,
   OpenGraph + `schema.org/WebAPI` JSON-LD on landing, OpenAPI
   `info.contact` + `externalDocs`.
3. Registry publish prep — `server.json` (`com.gankdat/gankdat`) +
   `/.well-known/mcp-registry-auth` keypair; verify Workers Assets serves
   dotfile directories.

**At listing time (operator executes — external submissions are ask-first
per CLAUDE.md):** publish to the official MCP Registry (`mcp-publisher login
http --domain gankdat.com` then `mcp-publisher publish`); submit/claim on
Glama, PulseMCP, Smithery; RapidAPI/Apify per `MARKETPLACE-PREP.md`. Gate:
Stage 0 validation, per PRD.

**Automatic (no action):** x402 Bazaar/Agentic.Market/x402scan cataloging on
first mainnet settlement.

**Deferred:** Claude Connectors Directory (OAuth 2.1 build), public repo /
awesome-list PRs (operator decision), speculative `.well-known` server cards
(wait for SEP to land).

## Sources

- [Official MCP Registry — publishing remote servers](https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/remote-servers.mdx)
- [Official MCP Registry — publisher authentication (DNS/HTTP domain proof)](https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/authentication.mdx)
- [x402 Bazaar discovery layer — Coinbase CDP docs](https://docs.cdp.coinbase.com/x402/bazaar)
- [Introducing x402 Bazaar](https://www.coinbase.com/developer-platform/discover/launches/x402-bazaar)
- [Claude Connectors Directory submission docs](https://claude.com/docs/connectors/building/submission)
- [Anthropic Connectors Directory FAQ](https://support.claude.com/en/articles/11596036-anthropic-connectors-directory-faq)
- [SEP-2127: MCP server cards via .well-known](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127)
- [State of llms.txt 2026 (adoption data)](https://presenc.ai/research/state-of-llms-txt-2026)
- [Glama](https://glama.ai/) · [PulseMCP](https://www.pulsemcp.com/) · [Smithery](https://smithery.ai/)
