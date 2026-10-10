## MCP Server Information

**Server Name:** gankdat
**Repository URL:** https://gankdat.com (remote server, hosted; docs at https://gankdat.com/docs)
**Brief Description:** UK and EU government registers as clean JSON — Companies House lookup and monitor, UK and EU tenders and contract awards, planning applications, sanctions and US exclusions, charities, schools, NHS organisations, care providers, visa sponsors, food hygiene, gambling licences and the Trade Marks Journal — with daily change feeds. Streamable HTTP at `https://gankdat.com/mcp`.

## Basic Requirements

- [ ] **Open Source**: not applicable — a hosted remote server; the terms of use at https://gankdat.com/terms allow consumption, and every dataset's licence is stated there
- [x] **MCP Compliant**: Implements MCP API specification (Streamable HTTP; `initialize` and `tools/list` are anonymous)
- [x] **Active Development**: Recent commits and maintained (released weekly; listed in the official MCP Registry as `com.gankdat/gankdat`)
- [ ] **Docker Artifact**: not applicable (remote server)
- [x] **Documentation**: https://gankdat.com/docs
- [x] **Security Contact**: info@gankdat.com

## Submitter Checklist

- [x] This server meets the basic requirements listed above
- [x] I understand this will undergo automated and manual review.
- [x] I have tested the MCP Server using `task validate -- --name gankdat`
- [x] I have built the MCP Server using `task build -- --tools gankdat`
- [x] If the server requires credentials to test it, I have shared test credentials using the form — no credentials are needed: without a key every data tool answers a 5-row preview (20 calls a day per client); an optional free API key (https://gankdat.com/account, magic-link sign-in) unlocks full pages

## Notes for the reviewer

- No `oauth` block: the Toolkit's OAuth flow registers clients dynamically (RFC 7591) and gankdat's authorization server currently supports client-id metadata documents only. The optional `gankdat.api_key` secret is sent as `Authorization: Bearer …`; with the secret unset the server treats the bare header as "no key" and serves the preview.
- `tools.json` is `[]` with `dynamic.tools: true`: `tools/list` is anonymous, so the Toolkit discovers the tools live.
