#!/usr/bin/env node
// CI (hourly): pull messages the owner sent to the Telegram bot and append them to
// docs/OWNER-NOTES.md so every Claude instance (routines included) reads them. Uses the
// Telegram update offset stored in the file's last line so nothing is duplicated.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
if (!token || !chatId) {
  console.error('TELEGRAM secrets missing');
  process.exit(1);
}
const file = 'docs/OWNER-NOTES.md';
let md = existsSync(file)
  ? readFileSync(file, 'utf8')
  : '# Owner notes (from Telegram)\n\nMessages the owner sent to the Foundry Ops bot, newest last. Every agent reads this at the start of a run; act on it, then answer in the same file below the note (`  - Claude: …`).\n\n<!-- offset:0 -->\n';
const offset = Number(/<!-- offset:(\d+) -->/.exec(md)?.[1] ?? 0);
const res = await (
  await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=0`)
).json();
const updates = (res.result ?? []).filter(
  (u) => String(u.message?.chat?.id) === String(chatId) && u.message?.text,
);
if (updates.length === 0) {
  console.log('no new notes');
  process.exit(0);
}
const lines = updates.map(
  (u) =>
    `- ${new Date(u.message.date * 1000).toISOString().slice(0, 16).replace('T', ' ')} | ${u.message.text.replace(/\r?\n/g, ' ').trim()}`,
);
const nextOffset = Math.max(...updates.map((u) => u.update_id)) + 1;
md =
  md.replace(/<!-- offset:\d+ -->/, '').trimEnd() +
  '\n' +
  lines.join('\n') +
  `\n\n<!-- offset:${nextOffset} -->\n`;
writeFileSync(file, md);
console.log(`${updates.length} new note(s)`);
await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    chat_id: chatId,
    text: `Noted (${updates.length}). It will be read by the next agent run.`,
  }),
});
