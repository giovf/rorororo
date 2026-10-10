# Fetch relay — how a routine reads a host its sandbox cannot reach

The cloud sandboxes can push to GitHub but cannot open most data hosts (figma.com, ipo.gov.uk,
nhs.uk, data.gov.uk, gamblingcommission.gov.uk …). Instead of filing a handoff, a routine asks a
GitHub runner to fetch for it:

1. Write `docs/relay/requests/<name>.txt`, one request per line:
   `[HEAD|GET] [RANGE=a-b] <https url>` — e.g.
   `HEAD https://www.ipo.gov.uk/t-tmj/tm-journals/2026-038/jnl.xml` or
   `GET RANGE=0-4095 https://www.gamblingcommission.gov.uk/downloads/premises-licence-register.csv`.
2. Commit and push just that file (`relay: <name>`); it is the one exception to "push once at the end".
3. Wait for the response **commit**, not for a fixed time: GitHub's hosted runners queue (on 2026-10-05 a request
   sat `queued` for 16+ minutes with nothing else running; two minutes is the floor, not the norm). Poll, and do
   other work meanwhile:
   `for i in $(seq 1 120); do git fetch -q origin main; git ls-tree --name-only origin/main docs/relay/responses/<name> | grep -q . && break; sleep 10; done; git pull --no-rebase origin main`
   (write the request first, research or build while it runs, read it last). If the loop expires with no
   response the run is dead, not slow: on 2026-10-05 one push run in three (the `fetch relay` run for
   `vt-research-2026-10-05` among them) was cancelled by GitHub 15 minutes after start with no steps, never
   acquired by a runner. Read the latest `fetch relay` run's conclusion (GitHub MCP `actions_list`,
   `list_workflow_runs`, `fetch-relay.yml`): `cancelled` with no steps → re-fire it with `actions_run_trigger`
   (`workflow_dispatch`; the job processes every file still under `requests/`) and poll again; `failure` with
   steps → read its log, the request itself is wrong. Never file a handoff for a dead run. The `fetch relay` workflow has committed
   `docs/relay/responses/<name>/meta.json` (status, headers, bytes, errors per line) and the
   bodies as `1.json`, `2.csv`, … The request file is deleted.
4. Read what you need, then carry on. Responses are pruned after 7 days.

Rules: only hosts on the allowlist in `scripts/fetch-relay.mjs` (public data and store pages);
GET bodies are capped at 8 MB — use `RANGE` for large files and `HEAD` to check existence;
never put a credential in a request; everything fetched lands in a public repo, so public data
only. Add a host to the allowlist in the same commit as the source that needs it.

## PR relay — opening a pull request on someone else's repository

A cloud sandbox's GitHub token and CI's `WORKFLOW_TOKEN` are scoped to this repository, so a
fork or a pull request on `docker/mcp-registry`, an awesome-list or an upstream fix answers 403
(every directory-listing PR to 2026-10-10 needed the interactive session). Instead:

1. Write `docs/relay/prs/<name>/request.json`: `repo` (`owner/name`), `branch`, `title`,
   `body_file` (a path in this repo, e.g. the entry's `PR.md`) or `body`, optional `commit`, and
   `files` — published path in the target repository → source path in this one. Keep the
   sources in the venture's docs so they stay reviewable here.
2. Commit it with the work (no separate push needed; `relay: pr <name>` if on its own).
3. The `pr relay` workflow (`docs/ci/pr-relay.yml` → `scripts/pr-relay.ts`, owner's classic
   PAT `PR_TOKEN` with `public_repo`, action 021) forks the target, pushes `<branch>` on the
   fork with the files, opens the PR (or finds the open one for that branch) and commits
   `docs/relay/prs/<name>/result.json` — `{ pr, fork, branch, base, done_at }` or
   `{ error, failed_at }`. Copy the PR URL into the item's `blocked_on` and the listing log, and
   add the review mail to `docs/ops/SELF-CAUSED.md`.
4. While `PR_TOKEN` is unset the run prints `PR_TOKEN not set` and the request stays pending;
   the next push under `docs/relay/prs/**` or a `workflow_dispatch` retries. A finished request
   (with `result.json`) is never re-run: delete the folder to open it again.

Public repositories only; never a credential in the files; the body is posted as written.
