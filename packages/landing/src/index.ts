// apps.gankdat.com: the public product pages are static assets (site/); /ops is the owner's
// operations dashboard (owner 2026-10-16). Sign-in is a one-time code sent to an allow-listed
// email (no passwords); the session is a 30-day HttpOnly cookie in KV. Pages are rendered here
// from src/ops-data.json, which the deploy workflow regenerates from the repo (scripts/ops-data.ts),
// so the dashboard is a read-only view of the repo plus one write path: the idea box, whose
// entries wait in KV until the hourly owner-notes job collects them into docs/OWNER-NOTES.md
// (GET /ops/api/ideas with the OPS_INTERNAL_TOKEN), where every routine reads and answers them.
import { Hono, type Context } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import raw from './ops-data.json' with { type: 'json' };

type Bindings = {
  ASSETS: Fetcher;
  OPS_KV: KVNamespace;
  OWNER_EMAILS: string;
  EMAIL_FROM: string;
  RESEND_API_KEY?: string;
  OPS_INTERNAL_TOKEN?: string;
};
type Ctx = Context<{ Bindings: Bindings }>;

const SESSION_COOKIE = 'ops_s';
const SESSION_TTL = 30 * 24 * 3600;
const CODE_TTL = 10 * 60;
const MAX_ATTEMPTS = 5;
const LOGIN_PER_HOUR = 8;

const app = new Hono<{ Bindings: Bindings }>();

// ------------------------------------------------------------------ helpers

const esc = (s: string | number): string =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** A form field as text; anything else (a file, a repeat) is an empty string. */
const field = (form: Record<string, unknown>, key: string): string => {
  const v = form[key];
  return typeof v === 'string' ? v : '';
};

const randomId = (): string => [...crypto.getRandomValues(new Uint8Array(24))].map((b) => b.toString(16).padStart(2, '0')).join('');

export function allowed(env: Bindings, email: string): boolean {
  const e = email.trim().toLowerCase();
  return e !== '' && env.OWNER_EMAILS.split(',').map((x) => x.trim().toLowerCase()).includes(e);
}

async function session(c: Ctx): Promise<string | null> {
  const id = getCookie(c, SESSION_COOKIE);
  if (!id) return null;
  return c.env.OPS_KV.get(`sess:${id}`);
}

async function sendCode(env: Bindings, to: string, code: string): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [to],
      subject: `${code} is your Foundry Ops code`,
      text: `Your sign-in code is ${code}. It works for 10 minutes on https://apps.gankdat.com/ops and only from the page that asked for it.\n\nIf you did not ask for it, ignore this email.`,
    }),
  });
  return res.ok;
}

// ------------------------------------------------------------------ security headers for /ops

app.use('/ops/*', async (c, next) => {
  await next();
  c.header('cache-control', 'no-store');
  c.header('x-robots-tag', 'noindex, nofollow');
  c.header('referrer-policy', 'no-referrer');
  c.header('x-content-type-options', 'nosniff');
  c.header('x-frame-options', 'DENY');
  c.header('content-security-policy', "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
});
app.use('/ops', async (c, next) => {
  await next();
  c.header('cache-control', 'no-store');
  c.header('x-robots-tag', 'noindex, nofollow');
  c.header('content-security-policy', "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
});

// ------------------------------------------------------------------ sign-in
// No Origin / Sec-Fetch-Site gate on the forms (2026-10-16: the owner's browser got "forbidden" on a
// legitimate post). The session cookie is SameSite=Lax and scoped to /ops, so a cross-site post
// carries no session: login only emails an allow-listed address, verify needs the emailed code.

app.get('/ops', async (c) => {
  const email = await session(c);
  if (!email) return c.html(page('Sign in', loginForm()));
  const view = c.req.query('view') ?? 'overview';
  return c.html(page(view.charAt(0).toUpperCase() + view.slice(1), dashboard(view, await ideas(c.env))));
});

app.post('/ops/login', async (c) => {
  const form = await c.req.parseBody();
  const email = field(form, 'email').trim().toLowerCase();
  const ip = c.req.header('cf-connecting-ip') ?? 'unknown';
  const rlKey = `rl:login:${await sha256(ip)}`;
  const count = Number((await c.env.OPS_KV.get(rlKey)) ?? '0') + 1;
  await c.env.OPS_KV.put(rlKey, String(count), { expirationTtl: 3600 });
  // The same answer whether or not the address is allowed: nothing to enumerate.
  if (count <= LOGIN_PER_HOUR && allowed(c.env, email)) {
    const code = String(crypto.getRandomValues(new Uint32Array(1))[0]! % 1_000_000).padStart(6, '0');
    await c.env.OPS_KV.put(`code:${email}`, JSON.stringify({ hash: await sha256(`${code}:${email}`), attempts: 0 }), { expirationTtl: CODE_TTL });
    await sendCode(c.env, email, code);
  }
  return c.html(page('Enter your code', codeForm(email)));
});

app.post('/ops/verify', async (c) => {
  const form = await c.req.parseBody();
  const email = field(form, 'email').trim().toLowerCase();
  const code = field(form, 'code').replace(/\D/g, '');
  const key = `code:${email}`;
  const raw = await c.env.OPS_KV.get(key);
  const rec = raw ? (JSON.parse(raw) as { hash: string; attempts: number }) : null;
  if (!rec || rec.attempts >= MAX_ATTEMPTS || rec.hash !== (await sha256(`${code}:${email}`))) {
    if (rec) await c.env.OPS_KV.put(key, JSON.stringify({ ...rec, attempts: rec.attempts + 1 }), { expirationTtl: CODE_TTL });
    return c.html(page('Enter your code', codeForm(email, 'That code did not match. Check the newest email, or ask for a new code.')), 401);
  }
  await c.env.OPS_KV.delete(key);
  const id = randomId();
  await c.env.OPS_KV.put(`sess:${id}`, email, { expirationTtl: SESSION_TTL });
  setCookie(c, SESSION_COOKIE, id, { httpOnly: true, secure: true, sameSite: 'Lax', path: '/ops', maxAge: SESSION_TTL });
  return c.redirect('/ops');
});

app.post('/ops/logout', async (c) => {
  const id = getCookie(c, SESSION_COOKIE);
  if (id) await c.env.OPS_KV.delete(`sess:${id}`);
  deleteCookie(c, SESSION_COOKIE, { path: '/ops' });
  return c.redirect('/ops');
});

// ------------------------------------------------------------------ ideas

interface KvIdea {
  id: string;
  text: string;
  created: string;
  delivered?: string;
}

async function ideas(env: Bindings): Promise<KvIdea[]> {
  const list = await env.OPS_KV.list({ prefix: 'idea:', limit: 100 });
  const out: KvIdea[] = [];
  for (const k of list.keys) {
    const v = await env.OPS_KV.get(k.name);
    if (v) out.push(JSON.parse(v) as KvIdea);
  }
  return out.sort((a, b) => b.created.localeCompare(a.created));
}

app.post('/ops/ideas', async (c) => {
  if (!(await session(c))) return c.redirect('/ops');
  const form = await c.req.parseBody();
  const text = field(form, 'text').trim().slice(0, 2000);
  if (text.length >= 3) {
    const created = new Date().toISOString();
    const id = `${created}-${randomId().slice(0, 6)}`;
    await c.env.OPS_KV.put(`idea:${id}`, JSON.stringify({ id, text, created } satisfies KvIdea));
  }
  return c.redirect('/ops?view=owner#ideas');
});

function internal(c: Ctx): boolean {
  const token = c.env.OPS_INTERNAL_TOKEN;
  const auth = c.req.header('authorization') ?? '';
  return Boolean(token) && auth === `Bearer ${token}`;
}

/** Undelivered ideas for the owner-notes job (bearer OPS_INTERNAL_TOKEN). */
app.get('/ops/api/ideas', async (c) => {
  if (!internal(c)) return c.json({ error: 'unauthorized' }, 401);
  const all = await ideas(c.env);
  return c.json({ ideas: all.filter((i) => !i.delivered).reverse() });
});

app.post('/ops/api/ideas/ack', async (c) => {
  if (!internal(c)) return c.json({ error: 'unauthorized' }, 401);
  const body = (await c.req.json().catch(() => ({}))) as { ids?: string[] };
  const when = new Date().toISOString();
  let n = 0;
  for (const id of body.ids ?? []) {
    const raw = await c.env.OPS_KV.get(`idea:${id}`);
    if (!raw) continue;
    await c.env.OPS_KV.put(`idea:${id}`, JSON.stringify({ ...(JSON.parse(raw) as KvIdea), delivered: when }));
    n += 1;
  }
  return c.json({ acknowledged: n });
});

// ------------------------------------------------------------------ everything else: the static site

app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw));

// eslint-disable-next-line no-restricted-syntax -- a Worker's entry point is its default export
export default app;

// ------------------------------------------------------------------ rendering

const CSS = `
:root{--bg:#f6f7f9;--card:#fff;--ink:#17202a;--mute:#6b7280;--line:#e5e7eb;--accent:#0b63ce;--good:#15803d;--warn:#b45309;--bad:#b91c1c}
@media(prefers-color-scheme:dark){:root{--bg:#0f1318;--card:#171c23;--ink:#e6e9ee;--mute:#98a2b3;--line:#2a313b;--accent:#6aa9ff;--good:#4ade80;--warn:#fbbf24;--bad:#f87171}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
.wrap{max-width:1100px;margin:0 auto;padding:20px 16px 60px}
header{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:18px}
header h1{font-size:18px;margin:0;letter-spacing:-.2px}header small{color:var(--mute)}
nav{display:flex;gap:4px;flex-wrap:wrap}nav a{padding:7px 12px;border-radius:999px;color:var(--ink);background:var(--card);border:1px solid var(--line)}nav a.on{background:var(--accent);color:#fff;border-color:var(--accent)}
.strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:0 0 18px}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px}.kpi b{display:block;font-size:22px;font-weight:650;letter-spacing:-.3px}.kpi span{color:var(--mute);font-size:13px}
h2{font-size:15px;text-transform:uppercase;letter-spacing:.08em;color:var(--mute);margin:26px 0 10px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px}
.card h3{margin:0 0 6px;font-size:16px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.pill{font-size:11px;padding:2px 8px;border-radius:999px;border:1px solid var(--line);color:var(--mute);text-transform:uppercase;letter-spacing:.06em}
.pill.good{color:var(--good);border-color:currentColor}.pill.warn{color:var(--warn);border-color:currentColor}.pill.bad{color:var(--bad);border-color:currentColor}.pill.acc{color:var(--accent);border-color:currentColor}
.mute{color:var(--mute)}.small{font-size:13px}.row{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}
ul.clean{list-style:none;margin:8px 0 0;padding:0}ul.clean li{padding:7px 0;border-top:1px solid var(--line)}ul.clean li:first-child{border-top:0}
.num{font-variant-numeric:tabular-nums}
form.inline{display:flex;gap:8px;flex-wrap:wrap}input,textarea,button{font:inherit}
input[type=email],input[type=text],textarea{width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink)}
textarea{min-height:110px;resize:vertical}
button{padding:10px 16px;border-radius:10px;border:0;background:var(--accent);color:#fff;font-weight:600;cursor:pointer}button.ghost{background:transparent;color:var(--mute);border:1px solid var(--line)}
.login{max-width:420px;margin:12vh auto 0}.login .card{padding:24px}.err{color:var(--bad)}
.empty{color:var(--mute);font-style:italic}
details summary{cursor:pointer;color:var(--mute);font-size:13px}
`;

function page(title: string, body: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)} · Foundry Ops</title><style>${CSS}</style></head><body><div class="wrap">${body}</div></body></html>`;
}

function loginForm(): string {
  return `<div class="login"><div class="card"><h1 style="margin:0 0 6px;font-size:20px">Foundry Ops</h1><p class="mute" style="margin:0 0 16px">Sign in with a one-time code sent to your email. No password.</p>
<form method="post" action="/ops/login"><label class="small mute" for="email">Email</label><input id="email" type="email" name="email" required autocomplete="email" autofocus placeholder="you@example.com" style="margin:4px 0 12px"><button type="submit">Send me a code</button></form></div></div>`;
}

function codeForm(email: string, error = ''): string {
  return `<div class="login"><div class="card"><h1 style="margin:0 0 6px;font-size:20px">Enter your code</h1><p class="mute" style="margin:0 0 16px">If <b>${esc(email)}</b> is allowed, a 6-digit code is on its way. It works for 10 minutes.</p>
${error ? `<p class="err">${esc(error)}</p>` : ''}
<form method="post" action="/ops/verify"><input type="hidden" name="email" value="${esc(email)}"><label class="small mute" for="code">Code</label><input id="code" type="text" name="code" inputmode="numeric" pattern="[0-9 ]*" required autocomplete="one-time-code" autofocus style="margin:4px 0 12px;letter-spacing:.3em;font-size:20px"><div class="row"><button type="submit">Sign in</button><a class="small" href="/ops">Start over</a></div></form></div></div>`;
}

// The snapshot's shape, declared rather than inferred: an empty array in one build must not
// change the types (an all-null `next` once inferred `never`).
interface Pricing {
  kind: 'one-time' | 'subscription' | 'free';
  priceUsd?: number;
  monthlyUsd?: number;
}
interface Venture {
  slug: string;
  name: string;
  channel: string;
  group: string;
  status: string;
  statusChangedOn: string;
  pricing: Pricing;
  thesis: string;
  latest: { date: string; event: string; users: string; rating: string; sales: string; notes: string } | null;
  metricRows: number;
  revenue: number;
  cost: number;
}
interface Item {
  id: string;
  title: string;
  score: number;
  status: string;
  blocked_on?: string;
  not_before?: string;
  done_at?: string;
  added: string;
}
interface Queue {
  venture: string;
  status: string;
  weight: number;
  needs_research: boolean;
  counts: { todo: number; doing: number; blocked: number; done: number; dropped: number };
  next: Item | null;
  doing: Item[];
  blocked: Item[];
  scheduled: Item[];
  done_recent: Item[];
}
interface OwnerEntry {
  date: string;
  kind: string;
  age_days: number;
  text: string;
  closed_on?: string;
}
interface Idea {
  id: string;
  title: string;
  status: string;
  added: string;
  trigger?: string;
  venture?: string;
}
interface OpsData {
  generated_at: string;
  commit: string;
  money: { spent: number; planned: number; revenue: number; contingent: number; net: number; committed: number; allowance: number; headroom: number; recurringMonthly: number; runwayMonths: number | null; cap: number };
  ventures: Venture[];
  queues: Queue[];
  owner: { open: OwnerEntry[]; waiting_on_claude: OwnerEntry[]; closed_recent: OwnerEntry[] };
  exchange: { last_run: string | null; decision: string; next_run: string; promoted: Idea[]; parked: Idea[]; declined: Idea[] };
  notes: { when: string; text: string; answer: string }[];
  runs: { when: string; who: string; text: string }[];
}
const data = raw as unknown as OpsData;

const gbp = (n: number): string => `£${n.toFixed(2)}`;
const statusPill = (s: string): string => {
  const cls = s === 'earning' ? 'good' : s === 'launched' ? 'acc' : s === 'killed' ? 'bad' : s === 'building' || s === 'validated' ? 'warn' : '';
  return `<span class="pill ${cls}">${esc(s)}</span>`;
};
const priceText = (p: Venture['pricing']): string =>
  p.kind === 'one-time' ? `$${p.priceUsd} once` : p.kind === 'subscription' ? `from $${p.monthlyUsd}/mo` : 'free';
const queueName = (v: string): string => (v === 'foundry' ? 'the operation itself' : v);

function nav(view: string): string {
  const tabs: [string, string][] = [['overview', 'Overview'], ['ventures', 'Ventures'], ['pipeline', 'Pipeline'], ['new', 'New ventures'], ['owner', 'Owner']];
  return `<nav>${tabs.map(([k, l]) => `<a href="/ops?view=${k}" class="${view === k ? 'on' : ''}">${l}</a>`).join('')}</nav>`;
}

function dashboard(view: string, kvIdeas: KvIdea[]): string {
  const generated = data.generated_at.slice(0, 16).replace('T', ' ');
  const head = `<header><div><h1>Foundry Ops</h1><small>data as of ${esc(generated)} UTC · commit ${esc(data.commit)}</small></div>${nav(view)}<form method="post" action="/ops/logout"><button class="ghost" type="submit">Sign out</button></form></header>`;
  const body = view === 'ventures' ? venturesView() : view === 'pipeline' ? pipelineView() : view === 'new' ? newVenturesView() : view === 'owner' ? ownerView(kvIdeas) : overview(kvIdeas);
  return head + body;
}

function moneyStrip(): string {
  const m = data.money;
  const runway = m.runwayMonths === null ? '—' : `${m.runwayMonths} mo`;
  return `<div class="strip">
<div class="kpi"><b class="num">${gbp(m.revenue)}</b><span>revenue to date</span></div>
<div class="kpi"><b class="num">${gbp(m.spent)}</b><span>spent of ${gbp(m.cap)} cap</span></div>
<div class="kpi"><b class="num">${gbp(m.headroom)}</b><span>headroom · ${esc(runway)} at ${gbp(m.recurringMonthly)}/mo</span></div>
<div class="kpi"><b class="num">${data.ventures.filter((v) => v.status === 'launched' || v.status === 'earning').length}</b><span>ventures live · ${data.ventures.length} total</span></div>
<div class="kpi"><b class="num">${data.owner.open.length}</b><span>waiting on you</span></div>
</div>`;
}

function overview(kvIdeas: KvIdea[]): string {
  const next = data.queues
    .filter((q): q is Queue & { next: Item } => q.status === 'open' && q.next !== null)
    .sort((a, b) => b.next.score * b.weight - a.next.score * a.weight)
    .slice(0, 5);
  const newIdeas = kvIdeas.filter((i) => !i.delivered).length;
  return `${moneyStrip()}
<div class="grid">
<div class="card"><h3>Ventures</h3>${groupSummary()}<p class="small" style="margin:10px 0 0"><a href="/ops?view=ventures">All ventures →</a></p></div>
<div class="card"><h3>Up next in the pipeline</h3>${next.length ? `<ul class="clean small">${next.map((q) => `<li><span class="mute">${esc(queueName(q.venture))}</span> · ${esc(q.next.title)}</li>`).join('')}</ul>` : '<p class="empty">Nothing buildable right now.</p>'}<p class="small" style="margin:10px 0 0"><a href="/ops?view=pipeline">Every queue →</a></p></div>
<div class="card"><h3>You</h3>${data.owner.open.length ? `<ul class="clean small">${data.owner.open.slice(0, 4).map((o) => `<li>${esc(o.text.slice(0, 140))}${o.text.length > 140 ? '…' : ''}</li>`).join('')}</ul>` : '<p class="empty">Nothing waiting on you.</p>'}<p class="small" style="margin:10px 0 0"><a href="/ops?view=owner">Owner page →</a>${newIdeas ? ` · ${newIdeas} idea${newIdeas === 1 ? '' : 's'} not yet collected` : ''}</p></div>
</div>
<h2>Recent activity</h2><div class="card"><ul class="clean small">${data.runs.map((r) => `<li><span class="mute num">${esc(r.when)}</span> · <span class="mute">${esc(r.who)}</span> · ${esc(r.text)}</li>`).join('')}</ul></div>`;
}

function groupSummary(): string {
  const groups = new Map<string, Venture[]>();
  for (const v of data.ventures) groups.set(v.group, [...(groups.get(v.group) ?? []), v]);
  return `<ul class="clean small">${[...groups].map(([g, vs]) => `<li class="row"><span>${esc(g)}</span><span class="mute">${vs.map((v) => `${esc(v.name)} ${statusPill(v.status)}`).join(' ')}</span></li>`).join('')}</ul>`;
}

function ventureCard(v: Venture): string {
  const l = v.latest;
  const stats = l
    ? `<ul class="clean small"><li class="row"><span class="mute">Latest reading</span><span class="num">${esc(l.date)} · ${esc(l.event)}</span></li>${l.users && l.users !== '—' ? `<li class="row"><span class="mute">Users / accounts</span><span class="num">${esc(l.users)}</span></li>` : ''}${l.sales && l.sales !== '—' ? `<li class="row"><span class="mute">Sales</span><span class="num">${esc(l.sales)}</span></li>` : ''}${l.notes ? `<li><details><summary>Notes from that reading</summary><p class="small" style="margin:6px 0 0">${esc(l.notes)}</p></details></li>` : ''}</ul>`
    : '<p class="empty">No metrics yet.</p>';
  return `<div class="card"><h3>${esc(v.name)} ${statusPill(v.status)}</h3><p class="small mute" style="margin:0 0 8px">${esc(priceText(v.pricing))} · ${esc(v.channel)} · since ${esc(v.statusChangedOn)}</p><div class="row small"><span>Revenue <b class="num">${gbp(v.revenue)}</b></span><span>Cost <b class="num">${gbp(v.cost)}</b></span></div>${stats}<details style="margin-top:8px"><summary>Thesis</summary><p class="small" style="margin:6px 0 0">${esc(v.thesis)}</p></details></div>`;
}

function venturesView(): string {
  const groups = new Map<string, Venture[]>();
  for (const v of data.ventures) groups.set(v.group, [...(groups.get(v.group) ?? []), v]);
  return moneyStrip() + [...groups].map(([g, vs]) => `<h2>${esc(g)}</h2><div class="grid">${vs.map(ventureCard).join('')}</div>`).join('');
}

function itemLine(it: { title: string; score: number; blocked_on?: string; not_before?: string; done_at?: string }): string {
  const tail = it.blocked_on ? `<div class="small mute">waits on: ${esc(it.blocked_on)}</div>` : it.not_before ? `<div class="small mute">from ${esc(it.not_before)}</div>` : it.done_at ? `<div class="small mute">done ${esc(it.done_at)}</div>` : '';
  return `<li>${esc(it.title)}${tail}</li>`;
}

function queueCard(q: Queue): string {
  const c = q.counts;
  const w = q.weight === 1 ? '' : `<span class="pill ${q.weight > 1 ? 'good' : ''}">weight ${q.weight}</span>`;
  const flag = q.status === 'finished' ? '<span class="pill bad">finished</span>' : q.needs_research ? '<span class="pill warn">needs research</span>' : '';
  return `<div class="card"><h3>${esc(queueName(q.venture))} ${w}${flag}</h3>
<p class="small mute num" style="margin:0 0 8px">${c.todo} to do · ${c.doing} in progress · ${c.blocked} blocked · ${c.done} done</p>
${q.next ? `<p class="small" style="margin:0"><b>Next:</b> ${esc(q.next.title)}</p>` : '<p class="empty small" style="margin:0">Nothing buildable now.</p>'}
${q.doing.length ? `<details open><summary>In progress (${q.doing.length})</summary><ul class="clean small">${q.doing.map(itemLine).join('')}</ul></details>` : ''}
${q.blocked.length ? `<details><summary>Blocked (${q.blocked.length})</summary><ul class="clean small">${q.blocked.map(itemLine).join('')}</ul></details>` : ''}
${q.scheduled.length ? `<details><summary>Scheduled (${q.scheduled.length})</summary><ul class="clean small">${q.scheduled.map(itemLine).join('')}</ul></details>` : ''}
${q.done_recent.length ? `<details><summary>Done in the last 7 days (${q.done_recent.length})</summary><ul class="clean small">${q.done_recent.map(itemLine).join('')}</ul></details>` : ''}
</div>`;
}

function pipelineView(): string {
  const open = data.queues.filter((q) => q.status === 'open').sort((a, b) => b.weight - a.weight || a.venture.localeCompare(b.venture));
  const finished = data.queues.filter((q) => q.status === 'finished');
  const doneWeek = data.queues.reduce((n, q) => n + q.done_recent.length, 0);
  const blocked = data.queues.reduce((n, q) => n + q.counts.blocked, 0);
  return `<div class="strip"><div class="kpi"><b class="num">${doneWeek}</b><span>items done in 7 days</span></div><div class="kpi"><b class="num">${open.length}</b><span>open queues</span></div><div class="kpi"><b class="num">${blocked}</b><span>blocked items</span></div></div>
<p class="small mute">Builds run twice a day plus evenings; each takes the highest score × queue weight. New income lines carry weight 2, unproven products 0.5.</p>
<h2>Queues</h2><div class="grid">${open.map(queueCard).join('')}</div>
${finished.length ? `<h2>Finished</h2><div class="grid">${finished.map(queueCard).join('')}</div>` : ''}`;
}

function newVenturesView(): string {
  const x = data.exchange;
  const spikes = data.queues.find((q) => q.venture === 'new-ventures');
  const ideaLine = (i: Idea): string =>
    `<li>${esc(i.title)}<div class="small mute">${i.venture ? `→ ${esc(i.venture)} · ` : ''}${i.trigger ? `promotes when: ${esc(i.trigger)} · ` : ''}added ${esc(i.added)}</div></li>`;
  const spikeItems = spikes ? [...spikes.doing, ...(spikes.next ? [spikes.next] : [])] : [];
  const todoCount = spikes?.counts.todo ?? 0;
  return `<div class="strip">
<div class="kpi"><b class="num">${esc(x.next_run)}</b><span>next exchange run (weekly)</span></div>
<div class="kpi"><b class="num">${todoCount}</b><span>research spikes queued</span></div>
<div class="kpi"><b class="num">${x.promoted.filter((i) => i.added >= monthAgo()).length}</b><span>ideas promoted in 30 days</span></div>
<div class="kpi"><b class="num">${x.parked.length}</b><span>ideas parked with a trigger</span></div>
</div>
<p class="small mute">Every Wednesday the exchange weighs new lines against improving what exists. Between runs, idle build slots work the research spikes below so each candidate arrives at the next exchange with numbers, not opinions. Spikes carry weight 2, like every new income line.</p>
<h2>Last decision${x.last_run ? ` · ${esc(x.last_run)}` : ''}</h2><div class="card"><p class="small" style="margin:0">${x.decision ? esc(x.decision) : '<span class="empty">No exchange file yet.</span>'}</p></div>
<h2>Research spikes (new-ventures queue)</h2><div class="card">${spikes ? `${spikeItems.length ? `<p class="small" style="margin:0 0 6px"><b>Next:</b> ${esc(spikeItems[0]!.title)}</p>` : ''}<p class="small mute num" style="margin:0">${spikes.counts.todo} to do · ${spikes.counts.doing} in progress · ${spikes.counts.done} done</p>${spikes.done_recent.length ? `<details><summary>Done in the last 7 days (${spikes.done_recent.length})</summary><ul class="clean small">${spikes.done_recent.map(itemLine).join('')}</ul></details>` : ''}` : '<p class="empty">No spikes queue.</p>'}</div>
<h2>Promoted to a venture</h2><div class="card"><ul class="clean small">${x.promoted.slice(0, 8).map(ideaLine).join('')}</ul>${x.promoted.length > 8 ? `<details><summary>Earlier (${x.promoted.length - 8})</summary><ul class="clean small">${x.promoted.slice(8).map(ideaLine).join('')}</ul></details>` : ''}</div>
<h2>Parked, each with the trigger that promotes it</h2><div class="card"><details><summary>${x.parked.length} parked ideas</summary><ul class="clean small">${x.parked.map(ideaLine).join('')}</ul></details></div>
<div class="card" style="margin-top:12px"><details><summary>Declined recently (${x.declined.length})</summary><ul class="clean small">${x.declined.map(ideaLine).join('')}</ul></details></div>`;
}

function monthAgo(): string {
  return new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
}

function ownerView(kvIdeas: KvIdea[]): string {
  const o = data.owner;
  const noteFor = (idea: KvIdea): { when: string; text: string; answer: string } | undefined =>
    data.notes.find((n) => n.text.includes(idea.text.slice(0, 60)));
  const ideaList = kvIdeas.length
    ? `<ul class="clean">${kvIdeas.map((i) => {
        const n = noteFor(i);
        const state = n?.answer ? '<span class="pill good">answered</span>' : i.delivered ? '<span class="pill acc">with Claude</span>' : '<span class="pill">waiting for pickup</span>';
        return `<li><div class="row"><span>${esc(i.text)}</span>${state}</div><div class="small mute num">${esc(i.created.slice(0, 16).replace('T', ' '))}</div>${n?.answer ? `<p class="small" style="margin:6px 0 0"><b>Claude:</b> ${esc(n.answer)}</p>` : ''}</li>`;
      }).join('')}</ul>`
    : '<p class="empty">No ideas yet.</p>';
  return `<div class="grid">
<div class="card"><h3>Waiting on you <span class="pill ${o.open.length ? 'warn' : 'good'}">${o.open.length}</span></h3>${o.open.length ? `<ul class="clean small">${o.open.map((e) => `<li>${esc(e.text)}<div class="mute num">${esc(e.date)} · ${e.age_days} day${e.age_days === 1 ? '' : 's'} old</div></li>`).join('')}</ul>` : '<p class="empty">Nothing. Telegram tells you when something new arrives.</p>'}</div>
<div class="card"><h3>Waiting on an attended session <span class="pill">${o.waiting_on_claude.length}</span></h3>${o.waiting_on_claude.length ? `<ul class="clean small">${o.waiting_on_claude.map((e) => `<li>${esc(e.text.slice(0, 200))}${e.text.length > 200 ? '…' : ''}<div class="mute num">${esc(e.date)}</div></li>`).join('')}</ul>` : '<p class="empty">Nothing.</p>'}</div>
</div>
<h2 id="ideas">Your ideas</h2>
<div class="card"><p class="small mute" style="margin:0 0 8px">Write it as you would say it. The hourly collector adds it to the owner notes; the next exchange or build run assesses it from primary sources, answers here, and queues work if it earns its place.</p>
<form method="post" action="/ops/ideas"><textarea name="text" maxlength="2000" required placeholder="e.g. Could the sanctions feed be sold to payment companies as a daily email?"></textarea><div class="row" style="margin-top:8px"><button type="submit">Send to Claude</button></div></form></div>
<div class="card" style="margin-top:12px">${ideaList}</div>
${o.closed_recent.length ? `<div class="card" style="margin-top:12px"><details><summary>Closed recently (${o.closed_recent.length}, newest first)</summary><ul class="clean small">${o.closed_recent.map((e) => `<li>${esc(e.text.slice(0, 160))}${e.text.length > 160 ? '…' : ''}<div class="mute num">closed ${esc(e.closed_on ?? '')}</div></li>`).join('')}</ul></details></div>` : ''}`;
}
