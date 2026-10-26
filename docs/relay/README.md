# Fetch relay — how a routine reads a host its sandbox cannot reach

The cloud sandboxes can push to GitHub but cannot open most data hosts (figma.com, ipo.gov.uk,
nhs.uk, data.gov.uk, gamblingcommission.gov.uk …). Instead of filing a handoff, a routine asks a
GitHub runner to fetch for it:

1. Write `docs/relay/requests/<name>.txt`, one request per line:
   `[HEAD|GET] [RANGE=a-b] <https url>` — e.g.
   `HEAD https://www.ipo.gov.uk/t-tmj/tm-journals/2026-038/jnl.xml` or
   `GET RANGE=0-4095 https://www.gamblingcommission.gov.uk/downloads/premises-licence-register.csv`;
   or `POST <https url> <json>` (2026-10-14, foundry `relay-post-json`) — the JSON body is the rest of
   the line, e.g. `POST https://mainnet.base.org {"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}`
   or `POST https://api.cdp.coinbase.com/platform/v2/x402/validate {"resource":"https://gankdat.com/x402/data/uk-tenders","method":"GET"}`.
   The body must be valid JSON under 4 kB and is sent as `application/json`; the response is saved
   like a GET's (same 8 MB cap). A line whose body has a credential-shaped key (`token`, `secret`,
   `password`, `api_key`, `private_key`, `authorization`, `cookie` …) or value (a JWT, a Stripe,
   GitHub, Slack, OpenAI or AWS key prefix, a Bearer header, a PEM key) is refused in `meta.json`
   and never sent (`scripts/fetch-relay-lines.ts`). Public bodies only — the request and the
   response are committed to this public repo. Pick a POST host as any other: on the allowlist.
   Rate limits (2026-10-17): a 429 or 503 is retried up to three times after `Retry-After` or a
   1-2-4 s pause, and consecutive lines to the same host are sent half a second apart; a line that
   still fails carries `retries` and the final status in `meta.json`. Public JSON-RPC endpoints
   (`mainnet.base.org`) throttle a burst of log queries anyway, so spread wide reads over the
   allowlisted RPC hosts rather than firing 40 lines at one.
   Rendered pages (2026-10-22, foundry `relay-rendered-fetch`): `GET RENDER <https url>` (or just
   `RENDER <url>`) opens the page in Playwright's Chromium on the runner, waits for the network to go
   idle (30 s cap after the document loaded; a page that keeps polling is saved as it stands and
   `meta.json` says `rendered.network_idle: false`) and saves the rendered DOM as `<n>.html` —
   `meta.json` carries `title`, `status` and `final_url` as for a GET. Use it for shelves whose listing
   pages are client-rendered shells (the Wix App Market category pages came back as 0.2–2.5 MB of
   script tags and zero app links; the Notion gallery only through page-embedded data), after a plain
   GET has shown the data is not in the raw body. GET only (RENDER with HEAD, POST or RANGE is refused
   on the line), same allowlist and 8 MB cap, a fresh context per line (no cookies or storage carried
   in, no clicks or form input; the page is scrolled once to the bottom so sections that render on
   intersection load, then left 1.5 s to settle), and images, media and fonts are not loaded.
   `meta.json`'s `rendered` block says what happened — `requests` made, `failed` (network failures and
   4xx/5xx XHR, fetch or document responses) and `console_errors` — so a page that stays a shell can be
   read for its cause (a blocked listing API, a bot wall, a consent gate) rather than guessed at.
   Read the cards, not only the anchors: a rendered shelf often opens its listings from a click
   handler, so the app's name, rating, review count and price tier are in the card's text and
   attributes while no `href` names it (Wix App Market, 2026-10-22: `data-hook="app-box-container"`
   cards, the slug on the card's `<a data-hook>`; the top-level `/category/forms` landing crashed on a
   404 menu call while the `/category/communication/forms` sub-category and the collections rendered
   57 and 96 cards). A request file with a RENDER line costs the run `npm ci`
   plus a Chromium install (about 1–2 min) — an ordinary request stays at ~15 s — so put the RENDER
   lines of one round in one file and keep plain GETs elsewhere when the round is time-critical.
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
   steps → read its log, the request itself is wrong. One exception: a `Commit responses` step that fails on `cannot lock ref` lost a push race with a
   routine's commit (run 143, 2026-10-22) — the next request push re-runs every pending file, and since 2026-10-22 the step retries three times (foundry `workflow-push-retry-everywhere`). Never file a handoff for a dead run. The `fetch relay` workflow has committed
   `docs/relay/responses/<name>/meta.json` (status, headers, bytes, errors per line) and the
   bodies as `1.json`, `2.csv`, … The request file is deleted.
   **Partial rounds** (2026-10-26, foundry `relay-round-survives-stalled-host`): `meta.json` is
   written after every line, HEAD/GET/POST lines abort after 30 s (`error: "timeout"`, `elapsed_ms`;
   RENDER keeps 90 s), a host that times out three lines in a row has its remaining lines recorded
   as `skipped: "host stalled"`, a 429/503 whose `Retry-After` exceeds the 30 s cap is final (one
   attempt, `retry_after` in the record) instead of three capped retries, and the Commit step runs
   even when the fetch step hit its 12-minute cap — a killed round is committed with `partial: true`
   and its request file removed. Read `partial` before trusting a round's line count.
4. Read what you need, then carry on. Responses are pruned after 7 days.

Rules: only hosts listed in `docs/relay/hosts.txt` (public data and store pages; one host or `.suffix` per line, since 2026-10-16 a data file so adding one is not a code push);
GET, RENDER and POST responses are capped at 8 MB — use `RANGE` for large files and `HEAD` to check existence;
never put a credential in a request; everything fetched lands in a public repo, so public data
only. Add a host to `docs/relay/hosts.txt` in the same commit as the source that needs it.
Runs are serialised (`concurrency: fetch-relay`, 2026-10-18): a second request pushed while a run is
in flight waits for it instead of racing its response commit (the 18:14 round b run of 2026-10-18 fetched
both files and lost both to a rebase conflict); a request still under `requests/` after a failed run is
re-fired by `workflow_dispatch`, which processes every file left there.

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
   the next push under `docs/relay/prs/**` or a `workflow_dispatch` retries. A request that was pending when the token arrived does not re-run by itself: dispatch `pr-relay.yml` (GitHub MCP `actions_run_trigger`) — the Docker request waited a day that way, 2026-10-11. A finished request
   (with `result.json`) is never re-run: delete the folder to open it again.

Public repositories only; never a credential in the files; the body is posted as written.
