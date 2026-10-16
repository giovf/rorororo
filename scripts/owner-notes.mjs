#!/usr/bin/env node
// CI (hourly): collect what the owner wrote — messages to the Telegram bot and ideas typed into
// the dashboard's owner page (apps.gankdat.com/ops, 2026-10-16) — and append them to
// docs/OWNER-NOTES.md so every Claude instance (routines included) reads and answers them in
// place. Telegram's update offset lives in the file's last line so nothing is duplicated; a
// dashboard idea is acknowledged on the Worker (`POST /ops/api/ideas/ack`) only after the file
// is written, so a failed run leaves it to be collected next hour.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const opsToken = process.env.OPS_INTERNAL_TOKEN;
const opsBase = process.env.OPS_BASE_URL ?? 'https://apps.gankdat.com';
if (!token || !chatId) {
  console.error('TELEGRAM secrets missing');
  process.exit(1);
}
const file = 'docs/OWNER-NOTES.md';
let md = existsSync(file)
  ? readFileSync(file, 'utf8')
  : "# Owner notes (from Telegram and the dashboard)\n\nMessages the owner sent to the Foundry Ops bot or typed into the dashboard's idea box, newest last. Every agent reads this at the start of a run; act on it, then answer in the same file below the note as `  - Claude: …`.\n";
const offset = Number(/<!-- offset:(\d+) -->/.exec(md)?.[1] ?? 0);

// 1. Telegram
const res = await (
  await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=0`)
).json();
const updates = (res.result ?? []).filter(
  (u) => String(u.message?.chat?.id) === String(chatId) && u.message?.text,
);
const stamp = (iso) => iso.slice(0, 16).replace('T', ' ');
const lines = updates.map(
  (u) =>
    `- ${stamp(new Date(u.message.date * 1000).toISOString())} | ${u.message.text.replace(/\r?\n/g, ' ').trim()}`,
);

// 2. Dashboard ideas (best effort: no token or an unreachable Worker never loses the Telegram notes)
let ideas = [];
if (opsToken) {
  try {
    const r = await fetch(`${opsBase}/ops/api/ideas`, {
      headers: { authorization: `Bearer ${opsToken}` },
    });
    if (r.ok) ideas = (await r.json()).ideas ?? [];
    else console.error(`ideas: HTTP ${r.status}`);
  } catch (e) {
    console.error(`ideas: ${e.message}`);
  }
}
for (const i of ideas)
  lines.push(
    `- ${stamp(i.created)} | [dashboard idea] ${String(i.text).replace(/\r?\n/g, ' ').trim()}`,
  );

if (lines.length === 0) {
  console.log('no new notes');
  process.exit(0);
}
const nextOffset = updates.length ? Math.max(...updates.map((u) => u.update_id)) + 1 : offset;
md =
  md.replace(/<!-- offset:\d+ -->/, '').trimEnd() +
  '\n' +
  lines.join('\n') +
  `\n\n<!-- offset:${nextOffset} -->\n`;
writeFileSync(file, md);
console.log(`${updates.length} new note(s), ${ideas.length} dashboard idea(s)`);

if (ideas.length) {
  const ack = await fetch(`${opsBase}/ops/api/ideas/ack`, {
    method: 'POST',
    headers: { authorization: `Bearer ${opsToken}`, 'content-type': 'application/json' },
    body: JSON.stringify({ ids: ideas.map((i) => i.id) }),
  }).catch((e) => ({ ok: false, status: e.message }));
  if (!ack.ok) console.error(`ideas ack failed: ${ack.status}`);
}
if (updates.length) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `Noted (${updates.length}). It will be read by the next agent run.`,
    }),
  });
}
