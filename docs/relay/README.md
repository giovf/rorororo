# Fetch relay — how a routine reads a host its sandbox cannot reach

The cloud sandboxes can push to GitHub but cannot open most data hosts (figma.com, ipo.gov.uk,
nhs.uk, data.gov.uk, gamblingcommission.gov.uk …). Instead of filing a handoff, a routine asks a
GitHub runner to fetch for it:

1. Write `docs/relay/requests/<name>.txt`, one request per line:
   `[HEAD|GET] [RANGE=a-b] <https url>` — e.g.
   `HEAD https://www.ipo.gov.uk/t-tmj/tm-journals/2026-038/jnl.xml` or
   `GET RANGE=0-4095 https://www.gamblingcommission.gov.uk/downloads/premises-licence-register.csv`.
2. Commit and push just that file (`relay: <name>`); it is the one exception to "push once at the end".
3. Wait about two minutes (`sleep 120`), then `git pull`. The `fetch relay` workflow has committed
   `docs/relay/responses/<name>/meta.json` (status, headers, bytes, errors per line) and the
   bodies as `1.json`, `2.csv`, … The request file is deleted.
4. Read what you need, then carry on. Responses are pruned after 7 days.

Rules: only hosts on the allowlist in `scripts/fetch-relay.mjs` (public data and store pages);
GET bodies are capped at 8 MB — use `RANGE` for large files and `HEAD` to check existence;
never put a credential in a request; everything fetched lands in a public repo, so public data
only. Add a host to the allowlist in the same commit as the source that needs it.
