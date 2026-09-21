#!/usr/bin/env node
// Sends newly added "owner:" / "needs owner" lines from docs/ALERTS.md (and newly created
// action files) to the owner's phone. Runs in CI on every push to main; channels are
// selected by which secrets exist: Telegram (TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID) and/or
// WhatsApp via CallMeBot (CALLMEBOT_PHONE + CALLMEBOT_APIKEY). Message text is only what the
// files say — never secrets. Convention for any agent: `- YYYY-MM-DD owner: <text>` in ALERTS.md.
import { execSync } from 'node:child_process';

const range = process.env.DIFF_RANGE ?? 'HEAD~1..HEAD';
const diff = (path) => {
  try {
    return execSync(`git diff ${range} -- ${path}`, { encoding: 'utf8' });
  } catch {
    return '';
  }
};
const added = (text) =>
  text
    .split('\n')
    .filter((l) => l.startsWith('+') && !l.startsWith('+++'))
    .map((l) => l.slice(1));

const items = [];
for (const line of added(diff('docs/ALERTS.md'))) {
  if (/\bowner:|needs owner/i.test(line)) items.push(line.replace(/^-\s*/, '').trim());
}
const newActions = execSync(`git diff --name-status ${range} -- docs/for-owner/actions`, {
  encoding: 'utf8',
})
  .split('\n')
  .filter((l) => l.startsWith('A\t'))
  .map((l) => l.split('\t')[1]);
for (const file of newActions) {
  const title = execSync(`git show HEAD:${file}`, { encoding: 'utf8' })
    .split('\n')[0]
    .replace(/^#\s*/, '');
  items.push(`New request: ${title} (docs/for-owner/actions/${file.split('/').pop()})`);
}
if (items.length === 0) {
  console.log('nothing for the owner in this push');
  process.exit(0);
}
const text = `Foundry needs you:\n${items.map((i) => `• ${i}`).join('\n')}\n\nDetails: Ops page or docs/for-owner in the repo.`;
console.log(text);

let sent = 0;
if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
  const r = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text }),
    },
  );
  console.log('telegram:', r.status);
  if (r.ok) sent += 1;
}
if (process.env.CALLMEBOT_PHONE && process.env.CALLMEBOT_APIKEY) {
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(process.env.CALLMEBOT_PHONE)}&apikey=${encodeURIComponent(process.env.CALLMEBOT_APIKEY)}&text=${encodeURIComponent(text)}`;
  const r = await fetch(url);
  console.log('whatsapp (callmebot):', r.status);
  if (r.ok) sent += 1;
}
if (sent === 0)
  console.log('no notification channel configured (secrets missing) — message printed only');
