// Notify owner: sends what the repo says the owner should see to the owner's phone.
//
// Sources: newly added `owner:` / `needs owner` lines in docs/ALERTS.md, newly created files under
// docs/for-owner/actions/ ("Foundry needs you") and newly added `| notify |` run lines in docs/RUNS.md ("Foundry
// run", one bullet per line). Channels are selected by which secrets exist: Telegram
// (TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID) and/or WhatsApp via CallMeBot (CALLMEBOT_PHONE +
// CALLMEBOT_APIKEY). Message text is only what the files say — never secrets.
//
// Cursor (2026-09-30, foundry item `notify-owner-cursor`): the job used to diff the push range
// (`github.event.before..sha`), so a run that crashed (run 63, 2026-09-30 19:57), a Telegram 5xx or a
// cancelled job lost that push's bullets for good — nothing ever looked at the range again. Now the
// left end of the diff is the commit recorded in docs/ops/NOTIFIED.md (`cursor: <sha>`), the right
// end is the tip of main, and the workflow commits the new cursor (`[skip ci]`) only after every
// configured channel accepted every message. A failed run leaves the cursor where it was, so the
// next push (the watchdog's hourly push at worst) resends what was lost.
//
// Run in CI: node --disable-warning=ExperimentalWarning scripts/notify-owner.ts
// Workflow: .github/workflows/notify-owner.yml (edits go through docs/ci/, README there).
// Node 22 runs .ts directly — keep syntax erasable, import only node builtins.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const CURSOR_FILE = 'docs/ops/NOTIFIED.md';

const CURSOR_HEADER = `# Notified cursor

Written by the \`notify owner\` GitHub job (\`scripts/notify-owner.ts\`) after every configured channel
accepted every message: \`cursor:\` is the last commit on \`main\` whose additions to \`docs/ALERTS.md\`,
\`docs/RUNS.md\` and \`docs/for-owner/actions/\` reached the owner's phone. Each run sends everything
added after it, so a crashed run, a Telegram 5xx or a cancelled job loses nothing — the next push
resends. Edit by hand only to move the cursor back and resend from there.
`;

/** The commit recorded in NOTIFIED.md, or undefined when the file has no `cursor:` line. */
export function parseCursor(text: string): string | undefined {
  const m = /^cursor:\s*([0-9a-f]{7,40})\s*$/m.exec(text);
  return m?.[1];
}

/** The whole NOTIFIED.md for a new cursor. */
export function cursorText(sha: string, sentAt: Date, sentLines: number): string {
  return `${CURSOR_HEADER}\ncursor: ${sha}\nsent: ${sentAt.toISOString().slice(0, 19)}Z (${sentLines} line${sentLines === 1 ? '' : 's'})\n`;
}

export interface RangeChoice {
  /** The `<from>..<to>` git range whose additions are sent. */
  range: string;
  /** Why that range: cursor, the push range, or the last commit. */
  reason: 'cursor' | 'push' | 'last-commit';
}

/**
 * Left end of the diff: the cursor when it resolves locally, else the push's `before` commit
 * (branch creation and force-pushes make either unresolvable), else the last commit — never nothing.
 */
export function pickRange(opts: {
  cursor?: string | undefined;
  pushBefore?: string | undefined;
  head?: string;
  resolvable: (range: string) => boolean;
}): RangeChoice {
  const head = opts.head ?? 'HEAD';
  if (opts.cursor && opts.resolvable(`${opts.cursor}..${head}`)) {
    return { range: `${opts.cursor}..${head}`, reason: 'cursor' };
  }
  if (
    opts.pushBefore &&
    !/^0+$/.test(opts.pushBefore) &&
    opts.resolvable(`${opts.pushBefore}..${head}`)
  ) {
    return { range: `${opts.pushBefore}..${head}`, reason: 'push' };
  }
  return { range: `${head}~1..${head}`, reason: 'last-commit' };
}

/** Lines a unified diff adds (without the leading `+`), file headers excluded. */
export function addedLines(diff: string): string[] {
  return diff
    .split('\n')
    .filter((l) => l.startsWith('+') && !l.startsWith('+++'))
    .map((l) => l.slice(1));
}

/**
 * ALERTS.md lines that need the owner. A line closed in the same range (` — Done …` /
 * ` — Superseded …` appended, the handoff-ledger convention) is not a need any more and is skipped.
 */
export function ownerItems(alertsDiff: string): string[] {
  return addedLines(alertsDiff)
    .filter((l) => /\bowner:|needs owner/i.test(l))
    .filter((l) => !/—\s*(Done|Superseded)\b/.test(l))
    .map((l) =>
      l
        .replace(/^-\s*/, '')
        .replace(/^\d{4}-\d{2}-\d{2}\s+owner:\s*/i, '')
        .trim(),
    );
}

/**
 * Only RUNS.md lines tagged `| notify |` reach the phone (owner 2026-10-04: a new version of an
 * existing product, a new product live, or something the owner must do — short, non-technical).
 * Every other run line stays in the repo.
 */
export function runBullets(runsDiff: string): string[] {
  return addedLines(runsDiff)
    .filter((l) => /^-\s*\d{4}-\d{2}-\d{2}[^|]*\|\s*notify\s*\|/.test(l))
    .map((l) => {
      const [, , ...rest] = l.replace(/^-\s*/, '').split('|');
      return `• ${rest.join('|').trim()}`;
    });
}

export interface NewAction {
  /** Repo-relative path of the new file under docs/for-owner/actions/. */
  file: string;
  /** Its first line, `# ` stripped. */
  title: string;
}

export interface Messages {
  texts: string[];
  /** How many source lines the texts carry (for the cursor file). */
  lines: number;
}

/** The messages to send: "Foundry needs you" (owner items + new actions) and "Foundry run". */
export function buildMessages(input: {
  alertsDiff: string;
  runsDiff: string;
  newActions: NewAction[];
}): Messages {
  const items = ownerItems(input.alertsDiff);
  for (const a of input.newActions) {
    items.push(`New request: ${a.title} (docs/for-owner/actions/${path.basename(a.file)})`);
  }
  const runs = runBullets(input.runsDiff);
  const texts: string[] = [];
  if (items.length > 0) {
    texts.push(
      `Foundry needs you:\n${items.map((i) => `• ${i}`).join('\n')}\n\nDetails: docs/for-owner/OUTSTANDING.md`,
    );
  }
  if (runs.length > 0) texts.push(`Foundry:\n${runs.join('\n')}`);
  return { texts, lines: items.length + runs.length };
}

export interface Channels {
  TELEGRAM_BOT_TOKEN?: string | undefined;
  TELEGRAM_CHAT_ID?: string | undefined;
  CALLMEBOT_PHONE?: string | undefined;
  CALLMEBOT_APIKEY?: string | undefined;
}

export type FetchLike = (
  url: string,
  init?: RequestInit,
) => Promise<{ ok: boolean; status: number }>;

export interface SendResult {
  /** Channels that exist (secrets present). */
  configured: number;
  /** Channels that answered 2xx. */
  accepted: number;
}

/** Sends one text to every configured channel. Never throws on a bad answer; a thrown fetch counts as refused. */
export async function send(text: string, env: Channels, fetchFn: FetchLike): Promise<SendResult> {
  const result: SendResult = { configured: 0, accepted: 0 };
  const attempt = async (label: string, url: string, init?: RequestInit): Promise<void> => {
    result.configured += 1;
    try {
      const r = await fetchFn(url, init);
      console.log(`${label}:`, r.status);
      if (r.ok) result.accepted += 1;
    } catch (err) {
      console.log(`${label}: failed (${err instanceof Error ? err.message : String(err)})`);
    }
  };
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    await attempt('telegram', `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text }),
    });
  }
  if (env.CALLMEBOT_PHONE && env.CALLMEBOT_APIKEY) {
    await attempt(
      'whatsapp (callmebot)',
      `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(env.CALLMEBOT_PHONE)}&apikey=${encodeURIComponent(env.CALLMEBOT_APIKEY)}&text=${encodeURIComponent(text)}`,
    );
  }
  return result;
}

async function main(): Promise<number> {
  const root = path.resolve(import.meta.dirname, '..');
  const git = (cmd: string): string =>
    execSync(`git ${cmd}`, { cwd: root, encoding: 'utf8', stdio: 'pipe' });
  const resolvable = (range: string): boolean => {
    try {
      git(`rev-list --max-count=1 ${range}`);
      return true;
    } catch {
      return false;
    }
  };
  const cursorPath = path.join(root, CURSOR_FILE);
  const cursor = existsSync(cursorPath) ? parseCursor(readFileSync(cursorPath, 'utf8')) : undefined;
  const choice = pickRange({ cursor, pushBefore: process.env.PUSH_BEFORE, resolvable });
  console.log(
    `range ${choice.range} (${choice.reason}${cursor && choice.reason !== 'cursor' ? `; cursor ${cursor} not resolvable here` : ''})`,
  );
  const diff = (file: string): string => {
    try {
      return git(`diff ${choice.range} -- ${file}`);
    } catch {
      return '';
    }
  };
  const newActions: NewAction[] = (() => {
    try {
      return git(`diff --name-status ${choice.range} -- docs/for-owner/actions`);
    } catch {
      return '';
    }
  })()
    .split('\n')
    .filter((l) => l.startsWith('A\t'))
    .map((l) => l.split('\t')[1] ?? '')
    .filter((file) => file !== '')
    .map((file) => ({
      file,
      title: (git(`show HEAD:${file}`).split('\n')[0] ?? '').replace(/^#\s*/, ''),
    }));
  const messages = buildMessages({
    alertsDiff: diff('docs/ALERTS.md'),
    runsDiff: diff('docs/RUNS.md'),
    newActions,
  });
  if (messages.texts.length === 0) {
    console.log('nothing new for the owner since the cursor');
    return 0;
  }
  let configured = 0;
  let accepted = 0;
  for (const text of messages.texts) {
    console.log(text);
    const r = await send(text, process.env, fetch);
    configured += r.configured;
    accepted += r.accepted;
  }
  if (configured === 0) {
    console.log(
      'no notification channel configured (secrets missing) — printed only, cursor not advanced',
    );
    return 0;
  }
  if (accepted < configured) {
    console.log(
      `${configured - accepted} of ${configured} sends refused — cursor not advanced, the next push resends`,
    );
    return 1;
  }
  const head = git('rev-parse HEAD').trim();
  writeFileSync(cursorPath, cursorText(head, new Date(), messages.lines));
  console.log(`cursor -> ${head} (${messages.lines} lines sent)`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then(
    (code) => {
      process.exitCode = code;
    },
    (err: unknown) => {
      console.error(err);
      process.exitCode = 1;
    },
  );
}
