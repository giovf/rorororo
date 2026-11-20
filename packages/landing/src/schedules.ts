// /ops?view=schedules (owner 2026-11-20): pause and resume each Claude cloud routine from the dashboard,
// to save the owner's Claude usage. The switch lives in KV (`paused`); the owner-notes poll copies it into
// docs/ops/PAUSED.json (GET /ops/api/paused, then POST /ops/api/paused/ack), and every routine's first step
// (`npm run paused -- <routine>`, scripts/paused.ts) ends the run when its key is paused. The sandboxes cannot
// reach this host, so the repo file is what a routine reads. With the optional GITHUB_DISPATCH_TOKEN secret (a
// fine-grained token with Actions: write on the repo only) a toggle dispatches the owner-notes workflow at once;
// without it the next 2-hourly poll carries it.
import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';

/** One cloud routine as the page lists it; `key` is the name scripts/paused.ts and the watchdog use. */
export interface RoutineInfo {
  key: string;
  name: string;
  when: string;
  model: string;
  note?: string;
}

// Mirrors docs/routines/README.md and docs/SCHEDULERS.md — update them in the same commit.
export const ROUTINES: readonly RoutineInfo[] = [
  { key: 'build', name: 'Daily build', when: '09:00 and 17:00 UTC daily', model: 'Fable' },
  { key: 'fallback', name: 'Build fallback', when: '09:20 and 17:20 UTC daily', model: 'Opus', note: 'also stops while the daily build is paused' },
  { key: 'burn-down', name: 'Evening burn', when: 'hourly 17:00–02:00 UTC', model: 'Fable' },
  { key: 'exchange', name: 'Venture exchange', when: 'Wednesday 08:00 UTC', model: 'Fable', note: 'a build slot no longer stands in for a missed one while paused' },
  { key: 'review', name: 'Strategy review', when: 'Sunday 08:00 UTC', model: 'Fable' },
  { key: 'metrics', name: 'Daily metrics', when: '07:00 UTC daily', model: 'Sonnet' },
  { key: 'inbox', name: 'Inbox triage', when: 'hourly at :05', model: 'Sonnet' },
  { key: 'report', name: 'Weekly report', when: 'Monday 07:30 UTC', model: 'Sonnet' },
  { key: 'retro', name: 'Ops retro', when: 'Saturday 07:59 UTC', model: 'Sonnet' },
];

const KEYS = new Set(ROUTINES.map((r) => r.key));
const HISTORY_DAYS = 14;

/** The switch state: `paused` maps a routine key to when it was paused; `history` keeps closed pauses for the watchdog. */
export interface PausedDoc {
  paused: Record<string, string>;
  history: { routine: string; from: string; to: string }[];
  updated: string | null;
}

export const emptyDoc = (): PausedDoc => ({ paused: {}, history: [], updated: null });

export function parseDoc(raw: string | null): PausedDoc {
  if (!raw) return emptyDoc();
  try {
    const d = JSON.parse(raw) as Partial<PausedDoc>;
    return {
      paused: d.paused && typeof d.paused === 'object' ? { ...d.paused } : {},
      history: Array.isArray(d.history) ? [...d.history] : [],
      updated: typeof d.updated === 'string' ? d.updated : null,
    };
  } catch {
    return emptyDoc();
  }
}

/**
 * The doc after pausing or resuming `routines` at `now`. Pausing a paused routine keeps its first stamp;
 * resuming moves the interval into `history` (trimmed to 14 days) so the watchdog never calls a slot
 * that fell inside it `missed`. Unknown keys are ignored. `updated` changes only when something did.
 */
export function toggle(doc: PausedDoc, routines: string[], pause: boolean, now: Date): PausedDoc {
  const at = now.toISOString();
  const out: PausedDoc = { paused: { ...doc.paused }, history: [...doc.history], updated: doc.updated };
  let changed = false;
  for (const r of routines) {
    if (!KEYS.has(r)) continue;
    const since = out.paused[r];
    if (pause && since === undefined) {
      out.paused[r] = at;
      changed = true;
    } else if (!pause && since !== undefined) {
      out.history.push({ routine: r, from: since, to: at });
      delete out.paused[r];
      changed = true;
    }
  }
  if (!changed) return doc;
  const floor = new Date(now.getTime() - HISTORY_DAYS * 86_400_000).toISOString();
  out.history = out.history.filter((h) => h.to >= floor);
  out.updated = at;
  return out;
}

type Bindings = {
  OPS_KV: KVNamespace;
  OPS_INTERNAL_TOKEN?: string;
  GITHUB_DISPATCH_TOKEN?: string;
};

const DOC_KEY = 'paused';
const SYNCED_KEY = 'paused:synced';
const REPO = 'giovf/rorororo';
const SYNC_WORKFLOW = 'owner-notes.yml';

export async function readDoc(kv: KVNamespace): Promise<{ doc: PausedDoc; synced: string | null }> {
  const [raw, synced] = await Promise.all([kv.get(DOC_KEY), kv.get(SYNCED_KEY)]);
  return { doc: parseDoc(raw), synced };
}

/** Starts the owner-notes workflow so the change reaches the repo in a minute; false when there is no token or GitHub refused. */
async function dispatchSync(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const res = await fetch(`https://api.github.com/repos/${REPO}/actions/workflows/${SYNC_WORKFLOW}/dispatches`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/vnd.github+json',
      'user-agent': 'foundry-ops',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ ref: 'main' }),
  }).catch(() => undefined);
  return res?.status === 204;
}

const internal = (token: string | undefined, auth: string | undefined): boolean => Boolean(token) && auth === `Bearer ${token}`;

/** Routes under /ops: the toggle form (dashboard session) and the poll's read and ack (bearer OPS_INTERNAL_TOKEN). */
export function schedulesApi(): Hono<{ Bindings: Bindings }> {
  const api = new Hono<{ Bindings: Bindings }>();

  // The toggle form: routine=<key>|all, action=pause|resume.
  api.post('/schedules', async (c) => {
    // The dashboard's session: the same cookie and KV record index.ts sets at sign-in.
    const sid = getCookie(c, 'ops_s');
    if (!sid || !(await c.env.OPS_KV.get(`sess:${sid}`))) return c.redirect('/ops');
    const form = await c.req.parseBody();
    const routine = typeof form['routine'] === 'string' ? form['routine'] : '';
    const action = form['action'];
    if (action === 'pause' || action === 'resume') {
      const targets = routine === 'all' ? ROUTINES.map((r) => r.key) : [routine];
      const { doc } = await readDoc(c.env.OPS_KV);
      const next = toggle(doc, targets, action === 'pause', new Date());
      if (next !== doc) {
        await c.env.OPS_KV.put(DOC_KEY, JSON.stringify(next));
        await dispatchSync(c.env.GITHUB_DISPATCH_TOKEN);
      }
    }
    return c.redirect('/ops?view=schedules');
  });

  /** The switch state for the owner-notes poll (bearer OPS_INTERNAL_TOKEN). */
  api.get('/api/paused', async (c) => {
    if (!internal(c.env.OPS_INTERNAL_TOKEN, c.req.header('authorization'))) return c.json({ error: 'unauthorized' }, 401);
    return c.json((await readDoc(c.env.OPS_KV)).doc);
  });

  /** The poll wrote docs/ops/PAUSED.json at this `updated` stamp: the page stops saying "waiting". */
  api.post('/api/paused/ack', async (c) => {
    if (!internal(c.env.OPS_INTERNAL_TOKEN, c.req.header('authorization'))) return c.json({ error: 'unauthorized' }, 401);
    const body = (await c.req.json().catch(() => ({}))) as { updated?: unknown };
    if (typeof body.updated !== 'string') return c.json({ error: 'updated required' }, 400);
    await c.env.OPS_KV.put(SYNCED_KEY, body.updated);
    return c.json({ synced: body.updated });
  });

  return api;
}

const escHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch] ?? ch);
const when = (iso: string): string => `${iso.slice(0, 16).replace('T', ' ')} UTC`;

function button(routine: string, pause: boolean, label: string, ghost: boolean): string {
  return `<form method="post" action="/ops/schedules" style="margin:0"><input type="hidden" name="routine" value="${escHtml(routine)}"><input type="hidden" name="action" value="${pause ? 'pause' : 'resume'}"><button type="submit"${ghost ? ' class="ghost"' : ''}>${escHtml(label)}</button></form>`;
}

/** The schedules view: one row per routine with its switch, plus pause-all / resume-all. */
export function schedulesView(doc: PausedDoc, synced: string | null, dispatching: boolean): string {
  const pausedCount = ROUTINES.filter((r) => doc.paused[r.key] !== undefined).length;
  const pending = doc.updated !== null && doc.updated !== synced;
  const status = pending
    ? `<p class="small" style="margin:0"><span class="pill warn">on its way</span> Your last change reaches the routines ${dispatching ? 'within a few minutes' : 'at the next sync, within about 2 hours'}. A run that starts before then still goes ahead.</p>`
    : `<p class="small mute" style="margin:0">${doc.updated ? `Every routine has your latest settings (changed ${escHtml(when(doc.updated))}).` : 'Everything is running.'}</p>`;
  const rows = ROUTINES.map((r) => {
    const since = doc.paused[r.key];
    const inherited = r.key === 'fallback' && since === undefined && doc.paused['build'] !== undefined;
    const pill = since !== undefined ? `<span class="pill warn">paused</span>` : inherited ? `<span class="pill warn">paused with the build</span>` : `<span class="pill good">running</span>`;
    return `<li><div class="row" style="align-items:center"><div><b>${escHtml(r.name)}</b> ${pill}<div class="small mute">${escHtml(r.when)} · ${escHtml(r.model)}${since ? ` · paused ${escHtml(when(since))}` : ''}${r.note ? ` · ${escHtml(r.note)}` : ''}</div></div>${since !== undefined ? button(r.key, false, 'Resume', false) : button(r.key, true, 'Pause', true)}</div></li>`;
  }).join('');
  return `<div class="strip">
<div class="kpi"><b class="num">${ROUTINES.length - pausedCount}</b><span>routines running</span></div>
<div class="kpi"><b class="num">${pausedCount}</b><span>paused to save usage</span></div>
</div>
<div class="card">${status}
<div class="row" style="margin-top:12px">${button('all', true, 'Pause everything', true)}${button('all', false, 'Resume everything', false)}</div></div>
<h2>Claude routines</h2>
<div class="card"><ul class="clean">${rows}</ul></div>
<p class="small mute">A paused routine still wakes on schedule, reads its switch and stops straight away, before any real work: a small fraction of a normal run. To stop it waking at all, switch it off at <a href="https://claude.ai/code/routines" rel="noreferrer">claude.ai/code/routines</a> and switch it back on there. The data refreshes, store checks and notifications that run on GitHub and Cloudflare use no Claude usage and keep running.</p>`;
}
