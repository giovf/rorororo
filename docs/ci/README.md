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
