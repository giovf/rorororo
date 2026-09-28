# docs/ci — drop zone for new CI workflows

Routine tokens cannot write under `.github/workflows/` (GitHub requires the `workflow` scope).
Write the workflow file here instead, e.g. `docs/ci/my-job.yml`, commit and push. The
`workflow installer` job (running with the owner's `WORKFLOW_TOKEN`) moves it into
`.github/workflows/` and pushes; the file is live within a minute or two. Files that lack a
`name:` or `on:` line are left here untouched. Edits to an existing workflow work the same way:
drop the full new file here under the same name.
