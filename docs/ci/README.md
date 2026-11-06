# docs/ci — drop zone for new CI workflows

Routine tokens cannot write under `.github/workflows/` (GitHub requires the `workflow` scope).
Write the workflow file here instead, e.g. `docs/ci/my-job.yml`, commit and push. The
`workflow installer` job (running with the owner's `WORKFLOW_TOKEN`) moves it into
`.github/workflows/` and pushes; the file is live within a minute or two. Files that lack a
`name:` or `on:` line are left here untouched. Edits to an existing workflow work the same way:
drop the full new file here under the same name.

Never put the literal skip-ci marker (`[skip ci]` and its variants) in a commit message you write,
subject or body — GitHub honours it anywhere in the message and runs no workflow at all: the
2026-09-30 21:30 burn-down commit described a job that uses it, and neither `check`, `notify owner`
nor this installer ran on that push. Refer to it as "the skip-ci marker" instead.

**First run checked** (2026-10-17, foundry `first-run-check-new-workflows`): the next build or burn-down slot
after the installer commit reads the workflow's first live run (dispatching it once when it has
`workflow_dispatch` and nothing has fired), writes `<name> first run: …` to `docs/RUNS.md` and fixes a failure in
that same run by dropping the corrected file here again. Routines never dispatch `gankdat-publish`,
`mirror-gankdat` or `demo-video` for this check (they publish, push to the public mirror or spend secrets).

**Parsed before it is pushed (2026-10-29, foundry `ci-workflow-yaml-gate`).** `npm run ci-yaml` (part of
`npm run check`; the pre-push hook runs it on any pushed workflow file) parses every file here and in
`.github/workflows/` with the `yaml` package and checks the shape GitHub needs — `on`, `jobs`, each job with
`runs-on` or `uses`, a non-empty `steps` list whose steps carry `run` or `uses` and string names. On 2026-10-29 a
step name with an unquoted colon (`… (private: served only …)`) reached main through the installer: GitHub refused
the file with "No jobs were run" on all seven pushes until it was quoted — an unparsable file has no path filters.
Quote any value that holds `: ` or ` #`.

**Formatted before it is pushed (2026-11-02, foundry `ci-check-failing`).** Prettier ignores `docs/` except this
directory (`docs/*` + `!docs/ci/` in `.prettierignore`), so `npm run format`, `npm run check` and the pre-push hook
format and check a workflow here exactly as they will once it sits in `.github/workflows/` (single quotes, 100
columns). On 2026-11-02 the build slot dropped `gankdat-metrics.yml` here with a double-quoted step name; nothing
checked it until the installer moved it, and the next push (`check` run 432, 17:52) failed on Prettier until an
interactive session reformatted the installed file by hand at 17:57. Run `npm run format` after writing a file here.

**A tool the sandbox refuses is a line in `run-script.yml`, not a new workflow (2026-11-06, foundry
`runner-script-dispatch`).** `.github/workflows/run-script.yml` is dispatched with `workspace` (`root` or an npm
workspace name), `script` (an npm script) and `args`; its first step refuses any workspace/script pair that is not
a line of the `case` allow-list in the file, installs the apt packages that line names, runs `npm ci` for that
workspace when the line says so, then runs the script and prints its output to the job log, which a routine reads
with the GitHub MCP `get_job_logs`. Lines today: `root epubcheck` (W3C epubcheck over the release EPUBs,
`scripts/epubcheck.ts`) and `@foundry/tax-workbook recalc` (LibreOffice). Three bespoke workflows in three weeks
(epubcheck, worker logs, demo video) each cost an installer commit and a first-run check in the next slot; a new
tool is now one allow-list line, dropped here as the full file like any other edit. A job that needs a secret or
uploads an artifact (demo video, worker logs) keeps its own workflow.
