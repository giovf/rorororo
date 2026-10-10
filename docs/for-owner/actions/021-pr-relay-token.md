# Owner action request #021 — a token so CI can open pull requests on other repositories

- **Date:** 2026-10-10
- **Status:** pending
- **Your time:** ~3 minutes
- **Cost:** £0.00
- **Blocks:** foundry `third-party-pr-relay`; gankdat `docker-mcp-catalog-listing` (the Docker MCP
  Catalog PR, written and validated, waits in `docs/relay/prs/docker-mcp-catalog/`); every future
  directory-listing or upstream-fix PR

Everything below needs *your* identity; nothing else in the backlog does.

## Actions

### 1. Create a classic personal access token with `public_repo`
- **What:** a GitHub classic PAT (fine-grained tokens cannot fork another account's repository)
  that the `pr relay` workflow uses to fork a public repository under your account, push a
  branch and open the pull request as you.
- **Where:** https://github.com/settings/tokens/new
- **Steps:**
  1. Note: `foundry pr relay`; expiration: 1 year (or no expiration); scope: tick **public_repo**
     only. Generate and copy the token.
  2. Open https://github.com/giovf/rorororo/settings/secrets/actions → **New repository secret**:
     name `PR_TOKEN`, value the token. Save.
  3. Open https://github.com/giovf/rorororo/actions/workflows/pr-relay.yml → **Run workflow** (or
     wait for the next push): within a few minutes `docs/relay/prs/docker-mcp-catalog/result.json`
     holds the PR URL and the Docker review mail arrives (expected, see `docs/ops/SELF-CAUSED.md`).
- **Give back:** nothing to paste anywhere else — the secret lives only in GitHub; say "021 done".
- **Cost:** £0.00

## When you're done
1. Set **Status** above to `done` and note anything that differed from the steps.
2. Start `claude` and say "021 done" — the next routine reads the PR URL from `result.json`.
