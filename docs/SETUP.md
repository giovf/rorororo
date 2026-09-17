# Project Setup Guide

> **Audience: the Claude Code instance running inside a fresh copy of this
> template.** The human has copied the template into a new folder, made it a
> git repo, reopened it in the dev container, started `claude`, and typed
> `/setup`. Your job is to turn this template into a real, scaffolded project
> with an approved PRD and an initialised Taskmaster backlog.

## Ground rules

- **Track progress in `docs/SETUP-PROGRESS.md`.** Create it on first run as a
  checklist mirroring the steps below (one `- [ ]` line per step, plus a
  "Decisions so far" section). Update it after **every** completed step and
  record every decision made (stack, scaffolder used, deps added). Setup spans
  at least one container rebuild in most projects — a fresh session must be
  able to resume from this file alone.
- **Ask the user** when a decision is genuinely theirs: choice of stack where
  the scope doesn't imply one, anything that costs money (paid services,
  cloud accounts), and anything under "Things to ask before doing" in
  CLAUDE.md. Prefer the AskUserQuestion tool with a recommended option.
  Everything else: decide, note it in the progress file, and move on.
- **You cannot rebuild the container from inside it.** When `.devcontainer/`
  changes are needed: make the edits, update the progress file, then give the
  user these exact instructions and end your turn:
  1. Command Palette (`Cmd/Ctrl+Shift+P`) → **"Dev Containers: Rebuild Container"**
  2. When the container is back, open a terminal, run `claude`, and type `/setup`
     — setup resumes from the progress file.
- **The user owns git.** Suggest when a commit makes sense and offer a message,
  but don't commit or push unless they ask.

## Step 0 — Sanity checks

- `git rev-parse --is-inside-work-tree` — if this isn't a git repo, stop and
  ask the user to run `git init` and make an initial commit of the template
  first (that's their step by design).
- Confirm the toolchain: `node --version` (expect 22.x), `task-master --version`,
  `gh --version`.
- Create `docs/SETUP-PROGRESS.md` now.

## Step 1 — Get the project scope

Ask the user to provide the initial project scope, either:
- **a file** — a brief, PRD draft, notes, anything; ask for the path and read it; or
- **text** — they describe it in the chat.

Then reflect it back: a 3–6 sentence summary of what you understood the
product to be. Ask them to confirm or correct before proceeding. Save the raw
scope to `.taskmaster/docs/scope.md` so it survives session changes.

## Step 2 — Clarifying interview (keep it short)

Only ask what the scope doesn't already answer. Cover, at most:

1. **Platform** — web app, mobile app, API/backend, CLI, library, or a combo?
2. **Stack preference** — do they have one, or should you recommend? (If
   recommending, give one primary recommendation with a one-line rationale,
   not a survey.)
3. **Backend/data** — persistence needs, auth, third-party integrations,
   hosted services (and whether accounts for them already exist).
4. **Constraints** — timeline, target users/regions, compliance (privacy law,
   accessibility), anything that changes architecture.
5. **v1 boundary** — the 2–3 things that are explicitly *out* of scope.

Record all answers in the progress file's "Decisions so far" section.

## Step 3 — Dev environment deltas

Now that the stack is decided, work out what the container is missing:

- **OS-level packages / global CLIs** → edit `.devcontainer/Dockerfile` inside
  the `<<PROJECT-DEPS-START>>` … `<<PROJECT-DEPS-END>>` markers (there are
  examples in the comment above them).
- **Ports** → add the stack's dev-server ports to `forwardPorts` (with
  `portsAttributes` labels) in `.devcontainer/devcontainer.json`.
- **VS Code extensions** → append stack-specific ones in `devcontainer.json`.
- **Container name** → rename `"name"` in `devcontainer.json` to the project.
- **UI projects** → enable the frontend-design plugin in `.claude/settings.json`:
  `{"enabledPlugins": {"frontend-design@claude-plugins-official": true}}`.

If (and only if) you changed the **Dockerfile**, the user must rebuild now —
follow the rebuild procedure in Ground rules, then resume here.
`devcontainer.json`-only changes (ports, extensions) can wait and be picked up
at the next natural rebuild; note that in the progress file.

## Step 4 — Scaffold the project

- Most scaffolders (`create-next-app`, `create-expo-app`, `npm create vite`, …)
  refuse non-empty directories. Scaffold to a temp folder and merge:
  ```bash
  cd /workspaces && npx <scaffolder> _scaffold-tmp <flags>
  cd -
  rsync -rltD --exclude='node_modules' --exclude='.git' /workspaces/_scaffold-tmp/. ./
  rm -rf /workspaces/_scaffold-tmp
  npm install
  ```
  Watch for collisions on `.gitignore` / `README.md` / `tsconfig.json` — merge
  by hand rather than letting the scaffolder clobber template files.
- Apply the house style: TypeScript **strict** mode, ESLint + Prettier wired
  up, scripts in `package.json` for dev/build/lint/typecheck.
- **Verify it runs**: start the dev server or run the build once, confirm it
  works, then stop it. Don't mark this step done on "should work".
- Merge scaffold-generated `.gitignore` entries into the template's.

## Step 5 — Write the PRD

- Draft `.taskmaster/docs/prd.md`, using `.taskmaster/templates/example_prd.md`
  as the structural reference. Base it on the scope + interview answers. Where
  something is genuinely undecided, put it in an explicit **Open questions**
  section rather than inventing detail.
- Show the user a summary (goals, feature list, phasing, out-of-scope) and
  iterate until they **explicitly approve** it. Do not parse an unapproved PRD
  — the backlog it generates shapes all future work.

## Step 6 — Initialise Taskmaster

- `task-master init` (the shipped `.taskmaster/config.json` already uses the
  `claude-code` provider, so **no API keys are required**; init keeps it).
- `task-master models` — verify main/research/fallback resolve.
- `task-master parse-prd .taskmaster/docs/prd.md`
- `task-master analyze-complexity` then `task-master expand --all` (use
  `--research` flags only if the user has configured a research API key).
- `.mcp.json` already registers the `task-master-ai` MCP server — the user may
  see a one-time approval prompt for it; that's expected.
- Sanity check: `task-master next` returns a sensible first task.

## Step 7 — Update the always-loaded docs

These files are part of every future Claude session's context — this step is
what makes the *next* session competent without re-explaining the project.

- `CLAUDE.md` — fill in every `<!-- SETUP: ... -->` marker (stack, run/test
  commands, conventions). Delete the markers. Keep it small and high-signal.
- `docs/ARCHITECTURE.md` — fill in the skeleton with the decisions actually
  made (what we're building, stack, layout, services, out-of-scope list).
- `.env.example` — add the project's real variables with placeholder values
  and comments on where each comes from. Ask the user to create `.env` from it
  when secrets are needed (never write real secrets yourself).
- `README.md` — replace the template README with a project README (what it
  is, how to run it, how the dev container works in two lines).

## Step 8 — Wrap up

- Summarise for the user: stack chosen, what was scaffolded, PRD status,
  number of tasks generated, and anything left open.
- Suggest an initial commit (offer a message; they run it or ask you to).
- Offer to delete the setup machinery now that it's done: `docs/SETUP.md`,
  `docs/SETUP-PROGRESS.md`, `.claude/commands/setup.md`, and the leftover
  first-run banner in `.devcontainer/post-create.sh`. Only delete on a yes.
- Point them at the daily loop: `task-master next` → implement →
  `task-master set-status --id=<id> --status=done`.
