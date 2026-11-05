// The Extras: the operation's own files, assembled from this repository, rewritten to placeholders
// and scrubbed before they are zipped (claude-code-kit `kit-extras-zip`, 2026-11-05). Leanpub's
// Package tier ships the zip next to the book; its terms allow "source files, code samples, apps,
// templates, worksheets" as Extras and forbid services or licences in them — so the zip is files
// only, MIT-licensed, and `assembleExtras` refuses to produce it while a single file still carries a
// secret-shaped string, an email address, a trigger id, a domain of ours, the owner's handle or a
// venture slug. The appendix of the book lists the same file map; `extras.test.ts` keeps the two equal.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import JSZip from 'jszip';

export const EXTRAS_FILE = 'claude-code-kit-extras.zip';
/** Every entry in the zip carries this timestamp so two builds of the same tree are byte-identical. */
export const EXTRAS_DATE = new Date('2026-11-05T00:00:00Z');
export const EXTRAS_TITLE = 'Running Claude Code Unattended — Extras';

export interface ExtrasEntry {
  /** Path in the zip. */
  dest: string;
  /** Path in the repository; absent for a file generated here (README, LICENSE, the starters). */
  src?: string;
  /** One line for the README: what the file is for. */
  note: string;
}

/** The file map, in zip order. The book's appendix prints the same list (checked by the test). */
export const MANIFEST: readonly ExtrasEntry[] = [
  { dest: 'README.md', note: 'what each file is for, how to adopt them, and what to change' },
  { dest: 'LICENSE', note: 'MIT' },
  { dest: 'CLAUDE.md', src: 'CLAUDE.md', note: 'the instruction file every session loads (scrubbed: placeholders for the ventures and the owner)' },
  { dest: 'package.json', note: 'the npm scripts the routines call (`npm run pipeline`, `slot`, `runs`, `slots`, `first-runs`, `ci-yaml`)' },
  { dest: 'docs/routines/README.md', src: 'docs/routines/README.md', note: 'the three-line bootstrap stored in each routine and the rules for editing a prompt' },
  { dest: 'docs/routines/build.md', src: 'docs/routines/build.md', note: 'the daily build routine (09:00 and 17:00 UTC)' },
  { dest: 'docs/routines/burn-down.md', src: 'docs/routines/burn-down.md', note: 'the evening burn-down (hourly 17:00–02:00 UTC, gated by docs/ops/BURN.json)' },
  { dest: 'docs/routines/fallback.md', src: 'docs/routines/fallback.md', note: 'the build fallback that fires 20 minutes after a build slot and takes over a missed one' },
  { dest: 'docs/routines/metrics.md', src: 'docs/routines/metrics.md', note: 'the daily metrics routine' },
  { dest: 'docs/routines/inbox-triage.md', src: 'docs/routines/inbox-triage.md', note: 'the hourly inbox triage' },
  { dest: 'docs/routines/weekly-report.md', src: 'docs/routines/weekly-report.md', note: 'the Monday report' },
  { dest: 'docs/routines/ops-retro.md', src: 'docs/routines/ops-retro.md', note: 'the Saturday retro' },
  { dest: 'docs/routines/exchange.md', src: 'docs/routines/exchange.md', note: 'the Wednesday venture exchange' },
  { dest: 'docs/routines/review.md', src: 'docs/routines/review.md', note: 'the Sunday strategy review' },
  { dest: 'docs/pipeline/README.md', src: 'docs/pipeline/README.md', note: 'the pipeline rules: queues, scores, weights, claims, research claims, cooling, starvation' },
  { dest: 'docs/pipeline/queues/example.json', note: 'a queue with three scored items, in the shape `npm run pipeline` validates' },
  { dest: 'docs/ops/BURN.json', note: 'the burn gate (enabled, nights, the usage report, the week budget), reset to a fresh week' },
  { dest: 'docs/ops/SELF-CAUSED.md', note: 'the register of mail your own automation causes, empty' },
  { dest: 'docs/ops/SLOTS.md', note: 'the slot-start markers file, empty' },
  { dest: 'docs/RUNS.md', note: 'the run log, empty' },
  { dest: 'docs/relay/README.md', src: 'docs/relay/README.md', note: 'the fetch-relay rules (requests and responses as committed files)' },
  { dest: 'docs/relay/hosts.txt', note: 'the relay allowlist, empty' },
  { dest: 'docs/ci/README.md', src: 'docs/ci/README.md', note: 'the drop zone for workflow files a routine token cannot write to .github/workflows/' },
  { dest: 'packages/core/src/pipeline.ts', src: 'packages/core/src/pipeline.ts', note: 'the queue model: parse, validate, rank, next item (imported by scripts/pipeline.ts)' },
  { dest: 'scripts/pipeline.ts', src: 'scripts/pipeline.ts', note: '`npm run pipeline` — validate, print the next item, `empty`, `cold`, `claim`, `claim-research`, `research-landed`' },
  { dest: 'scripts/pipeline-cold.ts', src: 'scripts/pipeline-cold.ts', note: 'the starvation and pacing gate (`npm run pipeline cold`) and the week budget' },
  { dest: 'scripts/pipeline-claim.ts', src: 'scripts/pipeline-claim.ts', note: 'the one-commit claim markers (`doing_since`, `researching_since`) and their release' },
  { dest: 'scripts/slot.ts', src: 'scripts/slot.ts', note: '`npm run slot -- start <routine>` — the slot-start marker push' },
  { dest: 'scripts/run-watchdog.ts', src: 'scripts/run-watchdog.ts', note: 'the watchdog: missed and stalled slots, CI minutes, failed runs, the dependabot gate' },
  { dest: 'scripts/slot-utilisation.ts', src: 'scripts/slot-utilisation.ts', note: '`npm run slots` — the slot table the Monday report prints' },
  { dest: 'scripts/handoffs.ts', src: 'scripts/handoffs.ts', note: 'the alerts and handoff rules the watchdog and the run log share' },
  { dest: 'scripts/fetch-relay.mjs', src: 'scripts/fetch-relay.mjs', note: 'the relay script the `fetch relay` workflow runs (allowlist, size caps, text extraction)' },
  { dest: 'scripts/fetch-relay-lines.ts', src: 'scripts/fetch-relay-lines.ts', note: 'the request-line parser and the secret-shaped-string refusal of the relay' },
  { dest: 'scripts/first-runs.ts', src: 'scripts/first-runs.ts', note: '`npm run first-runs` — which installed workflows still owe their first-run check' },
  { dest: 'scripts/ci-workflow-yaml.ts', src: 'scripts/ci-workflow-yaml.ts', note: '`npm run ci-yaml` — the workflow-file gate (parse, permissions, pinned actions)' },
  { dest: 'scripts/runs-check.ts', src: 'scripts/runs-check.ts', note: '`npm run runs` — the run-log line cap and shapes' },
  { dest: 'scripts/decisions-roll.ts', src: 'scripts/decisions-roll.ts', note: 'the decision-log roll the run-log check reads' },
  { dest: 'scripts/notify-owner.ts', src: 'scripts/notify-owner.ts', note: 'the phone line: only `| notify |` run-log lines and `owner:` alerts reach the owner' },
  { dest: '.githooks/pre-push', src: '.githooks/pre-push', note: 'the pre-push gate (format, lint, entry-point imports, run-log cap, pipeline files on the pushed range)' },
  { dest: 'workflows/check.yml', src: '.github/workflows/check.yml', note: 'the CI gate on every push to main (move to .github/workflows/)' },
  { dest: 'workflows/fetch-relay.yml', src: '.github/workflows/fetch-relay.yml', note: 'the relay: runs on a push that adds docs/relay/requests/*' },
  { dest: 'workflows/notify-owner.yml', src: '.github/workflows/notify-owner.yml', note: 'the phone line and the watchdog, on every routine push and a schedule' },
  { dest: 'workflows/run-watchdog.yml', src: '.github/workflows/run-watchdog.yml', note: 'the watchdog by hand from the Actions tab' },
  { dest: 'workflows/workflow-installer.yml', src: '.github/workflows/workflow-installer.yml', note: 'moves docs/ci/*.yml into .github/workflows/ with a commit of its own' },
];

/** Placeholders for the ventures (the zip is a template, not a catalogue). Order matters: longest names first. */
export const PLACEHOLDERS: ReadonlyMap<string, string> = new Map([
  ['variables-toolkit', 'figma-plugin'],
  ['claude-code-kit', 'handbook'],
  ['highlight-keep', 'extension-b'],
  ['tax-workbook', 'workbook'],
  ['oss-bounties', 'bounties'],
  ['read-focus', 'extension-a'],
  ['gankdat', 'data-api'],
]);

/** Addresses that are public conventions, not ours. */
const PUBLIC_EMAILS = new Set(['noreply@anthropic.com']);
const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
const TRIGGER_ID = /trig_0[01][A-Za-z0-9]{20,}/g;

/** Rewrites one file's text: the owner, the repository, our domains, trigger ids, mailboxes and venture slugs become placeholders. */
export function rewrite(text: string): string {
  let out = text
    .replace(/giovf\/rorororo/g, '<owner>/<repo>')
    .replace(/foundry-licenses\.faceless-api\.workers\.dev/g, 'licenses.example.com')
    .replace(/apps\.gankdat\.com/g, 'apps.example.com')
    .replace(/taxelicious\.etsy\.com/g, '<shop>.etsy.com')
    .replace(/gankdat\.com/g, 'example.com')
    .replace(/1402celsius\.com/g, 'example.org')
    .replace(EMAIL, (m) => (PUBLIC_EMAILS.has(m) ? m : '<owner-email>'))
    .replace(TRIGGER_ID, 'trig_<id>')
    .replace(/giova1506|giovf/g, '<owner>')
    .replace(/rorororo/g, '<repo>')
    .replace(/1402celsius|faceless-api/g, '<account>');
  for (const [slug, placeholder] of PLACEHOLDERS) out = out.replaceAll(slug, placeholder);
  return out;
}

/** What the scrub refuses, after the rewrite. A label per pattern names the finding for the reader of the error. */
export const SCRUB: readonly (readonly [RegExp, string])[] = [
  [/sk_(?:live|test)_[A-Za-z0-9]{8,}|rk_(?:live|test)_[A-Za-z0-9]{8,}|whsec_[A-Za-z0-9]{8,}/, 'a Stripe key'],
  [/ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|gho_[A-Za-z0-9]{20,}/, 'a GitHub token'],
  [/xox[abprs]-[A-Za-z0-9-]{10,}/, 'a Slack token'],
  [/AKIA[0-9A-Z]{16}/, 'an AWS access key id'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY/, 'a private key'],
  [/apify_api_[A-Za-z0-9]{16,}|sk-ant-[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{30,}/, 'an API token'],
  [/\b\d{6,}:[A-Za-z0-9_-]{30,}/, 'a Telegram bot token'],
  [/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/, 'an email address'],
  [/trig_0[01][A-Za-z0-9]{20,}/, 'a trigger id'],
  [/gankdat\.com|1402celsius|faceless-api|taxelicious|workers\.dev/i, 'a domain of ours'],
  [/giov[a-z0-9]*|rorororo/i, "the owner's handle"],
  [/gankdat|tax-workbook|variables-toolkit|read-focus|highlight-keep|oss-bounties|claude-code-kit/i, 'a venture slug'],
];

/** The lines of `text` the scrub refuses, as `path:line: label — excerpt`; empty when the file is clean. */
export function scrubFindings(file: string, text: string): string[] {
  const findings: string[] = [];
  const lines = text.split('\n');
  for (const [pattern, label] of SCRUB) {
    lines.forEach((line, i) => {
      const m = line.match(pattern);
      if (!m || (label === 'an email address' && PUBLIC_EMAILS.has(m[0]))) return;
      findings.push(`${file}:${i + 1}: ${label} — ${m[0].slice(0, 40)}`);
    });
  }
  return findings;
}

export class ScrubError extends Error {
  readonly findings: string[];
  constructor(findings: string[]) {
    super(`the Extras scrub refused ${findings.length} line(s):\n${findings.join('\n')}`);
    this.name = 'ScrubError';
    this.findings = findings;
  }
}

/** Throws `ScrubError` when any file carries a finding; returns the same map otherwise. */
export function scrubbed(files: ReadonlyMap<string, string>): ReadonlyMap<string, string> {
  const findings = [...files].flatMap(([file, text]) => scrubFindings(file, text));
  if (findings.length > 0) throw new ScrubError(findings);
  return files;
}

export const LICENSE_MIT = `MIT License

Copyright (c) 2026 the author of "Running Claude Code Unattended"

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

const PACKAGE_JSON = `${JSON.stringify(
  {
    name: 'claude-code-operations-extras',
    version: '1.0.0',
    private: true,
    type: 'module',
    description:
      'The files of an unattended Claude Code operation, as released with "Running Claude Code Unattended". Node 22+ runs the TypeScript scripts directly (type stripping); nothing is compiled.',
    scripts: {
      pipeline: 'node --disable-warning=ExperimentalWarning scripts/pipeline.ts',
      slot: 'node --disable-warning=ExperimentalWarning scripts/slot.ts',
      slots: 'node --disable-warning=ExperimentalWarning scripts/slot-utilisation.ts',
      runs: 'node --disable-warning=ExperimentalWarning scripts/runs-check.ts',
      'first-runs': 'node --disable-warning=ExperimentalWarning scripts/first-runs.ts',
      'ci-yaml': 'node --disable-warning=ExperimentalWarning scripts/ci-workflow-yaml.ts',
      watchdog: 'node --disable-warning=ExperimentalWarning scripts/run-watchdog.ts',
      notify: 'node --disable-warning=ExperimentalWarning scripts/notify-owner.ts',
      relay: 'node scripts/fetch-relay.mjs',
    },
    devDependencies: { yaml: '^2.8.0' },
  },
  null,
  2,
)}\n`;

const EXAMPLE_QUEUE = `${JSON.stringify(
  {
    venture: 'example',
    status: 'open',
    needs_research: false,
    updated: '2026-11-05',
    researched: '2026-11-05',
    weight: 1,
    items: [
      {
        id: 'landing-page',
        title: 'Write the product page: what it does, what it costs, the refund policy, one screenshot',
        why: 'Nothing sells without a page the shelf can link to; the shelf supplies the traffic, the page supplies the reason. Proof is a page a stranger can buy from.',
        effort_days: 0.3,
        proof: 'the page is deployed and the buy button completes a £0 test order',
        score: 6,
        status: 'todo',
        added: '2026-11-05',
      },
      {
        id: 'first-metrics-row',
        title: 'Daily numbers: one row per day in RESEARCH.md §7 from the shelf API (views, sales, refunds)',
        why: 'A product without a daily reading cannot be killed or kept on evidence; the review routine reads this row.',
        effort_days: 0.2,
        proof: 'three consecutive daily rows appended by the metrics routine, no hand edits',
        score: 4,
        status: 'todo',
        added: '2026-11-05',
      },
      {
        id: 'day-60-verdict',
        title: 'Day-60 read: keep, extend or retire against the kill criteria in RESEARCH.md §6',
        why: 'Every venture carries a dated verdict so the portfolio never keeps a line out of habit.',
        effort_days: 0.1,
        proof: 'RESEARCH.md §6 carries the verdict and the queue is extended or finished',
        score: 3,
        status: 'todo',
        not_before: '2027-01-04',
        added: '2026-11-05',
      },
    ],
  },
  null,
  2,
)}\n`;

const BURN_JSON = `${JSON.stringify(
  {
    enabled: true,
    nights: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    window_utc: '17:00-02:59',
    stop_if_weekly_pct_at_least: 80,
    report: { date: null, total_pct: null, fable_pct: null },
    week_slots: 33,
    week_reserve: 3,
    notes:
      "The evening burn-down reads this file before anything else. `report` is the owner's latest usage note (`usage NN%`), copied here by the routine that reads it; while it is older than 7 days the burn-down paces itself to `week_slots` minus `week_reserve` working slots a week (see docs/routines/burn-down.md, GATE).",
  },
  null,
  2,
)}\n`;

const SELF_CAUSED_MD = `# Self-caused notifications — mail our own automation triggers

Read by the hourly inbox triage before it classifies any store, vendor or platform mail, and by
the weekly report before its Alerts section. A mail that matches a row below is logged in
\`docs/INBOX.md\` as \`logged (self-caused: <cause>)\` and never becomes an alert, a "needs owner"
or a ledger entry.

Rule for every routine and session: whenever you automate something that makes a third party
email you — publishing, pricing, key rotation, DNS, a registry submission, a new sending domain —
add its row here **in the same commit**.

| Since | Sender | Subject shape | Cause (what we automated) | Expected cadence |
| --- | --- | --- | --- | --- |
`;

const SLOTS_MD = `# Slot starts

One line per routine run, written by \`npm run slot -- start <routine>\` as the run's first push, so
the fallback and the watchdog can tell an in-flight slot from a missed one. Not sent to the owner.
Format: \`- YYYY-MM-DD HH:MM | <routine> | started\`.

`;

const RUNS_MD = `# Run log

One line per piece of work done, newest last — a repo log. Only lines tagged \`| notify |\` reach
the owner's phone, and only for: a new version of an existing product submitted to a store, a new
product live on a shelf, or something the owner must do. Keep those one plain sentence, ≤ 90 chars.
Format for every line: \`- YYYY-MM-DD HH:MM | <routine> | <one thing done, ≤ 120 chars>\`.
\`npm run runs\` fails a push whose new lines carry text over 120 chars.

`;

const HOSTS_TXT = `# Fetch relay — allowed hosts. One entry per line: an exact host (\`api.github.com\`) or a suffix
# starting with a dot (\`.gov.uk\` matches gov.uk and every subdomain). Lower-case letters, digits,
# dots and hyphens only; \`#\` starts a comment, blank lines are ignored; a malformed line fails the
# relay loud. Public data and store pages only — never a host that needs a credential: everything
# fetched lands in this repository.
`;

/** The README: what every file is for, how to adopt them, what to change. Lists every entry of the manifest. */
export function readme(manifest: readonly ExtrasEntry[] = MANIFEST): string {
  const rows = manifest.map((e) => `| \`${e.dest}\` | ${e.note} |`).join('\n');
  const placeholders = [...PLACEHOLDERS.values()].map((v) => `\`${v}\``).join(', ');
  return `# ${EXTRAS_TITLE}

These are the files an unattended Claude Code operation runs on, assembled from that operation's
repository by a script and released under the MIT licence (\`LICENSE\`). They are a starting point
to adapt, not a product to install: every rule in them was written for one operation's ventures,
shelves and owner, and chapter 15 of the book is the order in which to adopt them and what to change.

## What was changed before release

The files were rewritten by the assembling script so that nothing in them points at the operation
they came from: the owner's handle is \`<owner>\`, the repository is \`<owner>/<repo>\`, the owner's
mailbox is \`<owner-email>\`, the operation's domains are \`example.com\` and \`apps.example.com\`,
every scheduled-routine id is \`trig_<id>\`, and the ventures are placeholders (${placeholders}).
The same script refuses to zip while any file still carries a secret-shaped string, an email
address, a trigger id, a domain of the operation, the owner's handle or a venture name. Everything
else — the dates, the incidents, the numbers and the decisions — is as the operation wrote it.
"Foundry" is the operation's own name for itself and stays.

## Running the scripts

Node 22 or later runs the TypeScript scripts directly (\`node scripts/pipeline.ts\`; the
\`--disable-warning=ExperimentalWarning\` flag in \`package.json\` only quiets the type-stripping
notice). The one dependency is \`yaml\` (for \`scripts/ci-workflow-yaml.ts\`): \`npm install\`.
\`scripts/pipeline.ts\` imports \`packages/core/src/pipeline.ts\` by relative path, so keep the two
where they are. The workflow files live under \`workflows/\` here because a routine's token cannot
write to \`.github/workflows/\`; move them there by hand once (or through \`docs/ci/\` and the
installer, as the operation does) and read each one before you enable it — they name secrets
(\`GITHUB_TOKEN\` apart) that you must create, and \`notify-owner.yml\` sends to a phone.

## The files

| File | What it is for |
| --- | --- |
${rows}

## What to change first

1. \`CLAUDE.md\`: the stack, the commands and the ventures are the operation's; keep the Workflow
   section's shape (session start, atomic pushes, one commit per item) and replace the rest. Its two
   \`@./…\` import lines name an architecture file and a Taskmaster guide that are not in this zip:
   point them at yours or delete them.
2. \`docs/routines/*.md\`: the text below each file's \`---\` is the prompt. Start with
   \`build.md\`, keep its order (gate, claim, heal, read, loop, run log), and replace the venture
   detail. Create one scheduled routine per file with the bootstrap in \`docs/routines/README.md\`.
3. \`docs/pipeline/queues/\`: one queue per venture in the shape of \`example.json\`; \`npm run
   pipeline\` validates it and prints the next item.
4. \`docs/ops/BURN.json\`: your allowance and your nights.
5. \`docs/relay/hosts.txt\`: the hosts your sandbox cannot reach but a hosted runner can.

Nothing here contacts a service on its own. A routine does only what its prompt says, and the
prompt is a file you commit.
`;
}

/** Reads, rewrites and scrubs every file of the manifest; throws `ScrubError` rather than return a tainted set. */
export async function assembleExtras(repoRoot: string, manifest: readonly ExtrasEntry[] = MANIFEST): Promise<ReadonlyMap<string, string>> {
  const generated: Record<string, string> = {
    'README.md': readme(manifest),
    LICENSE: LICENSE_MIT,
    'package.json': PACKAGE_JSON,
    'docs/pipeline/queues/example.json': EXAMPLE_QUEUE,
    'docs/ops/BURN.json': BURN_JSON,
    'docs/ops/SELF-CAUSED.md': SELF_CAUSED_MD,
    'docs/ops/SLOTS.md': SLOTS_MD,
    'docs/RUNS.md': RUNS_MD,
    'docs/relay/hosts.txt': HOSTS_TXT,
  };
  const files = new Map<string, string>();
  for (const entry of manifest) {
    if (entry.src) {
      files.set(entry.dest, rewrite(await readFile(path.join(repoRoot, entry.src), 'utf8')));
    } else {
      const body = generated[entry.dest];
      if (body === undefined) throw new Error(`no generator for ${entry.dest}`);
      files.set(entry.dest, body);
    }
  }
  return scrubbed(files);
}

/** The zip: entries in manifest order, every one dated `EXTRAS_DATE`, so the bytes depend on the content alone. */
export async function buildExtrasZip(files: ReadonlyMap<string, string>): Promise<Uint8Array> {
  const zip = new JSZip();
  for (const [p, body] of files) {
    zip.file(p, body, { compression: 'DEFLATE', date: EXTRAS_DATE, unixPermissions: p.endsWith('pre-push') ? 0o755 : 0o644 });
  }
  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE', platform: 'UNIX' });
}

/** The appendix's file-map block as a list of zip paths (comma lists share the directory of their first entry). */
export function fileMapPaths(block: string): string[] {
  const paths: string[] = [];
  for (const raw of block.split('\n')) {
    const line = raw.trim();
    if (line === '') continue;
    const column = line.split(/\s{2,}/)[0] ?? '';
    let dir = '';
    for (const part of column.split(',').map((s) => s.trim())) {
      if (part.includes('/')) dir = part.slice(0, part.lastIndexOf('/') + 1);
      paths.push(part.includes('/') ? part : dir + part);
    }
  }
  return paths;
}
