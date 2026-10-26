// /diligence — the public page of the Meta Global AI Developer Hackathon entry (hackathons
// `meta-global-ai-hackathon-entry`, 2026-10-26): type a UK company name, watch Muse Spark on Meta
// Model API read seven official registers through gankdat's MCP server, and get the one-page risk
// report. The loop is packages/landing/src/diligence-core.ts; this file is the page, the
// server-sent-event stream the page reads, and the two caps that keep the hackathon credits for
// judges: a per-visitor hourly cap and a daily cap for the whole page, both counted in KV.
//
// Secrets (wrangler secret put; CI sets the first from the META_MODEL_API_KEY repository secret,
// docs/for-owner/actions/032-meta-model-api-key.md): DILIGENCE_API_KEY — the model key; without it
// the page says so and runs nothing (no dry run on a public page: a canned report could pass for
// a real one). DILIGENCE_GANKDAT_KEY (optional) — a gankdat API key so the registers answer in
// full instead of preview mode. Vars (wrangler.jsonc): DILIGENCE_BASE_URL, DILIGENCE_MODEL.
import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import {
  Budget,
  GANKDAT_MCP_URL,
  META_BASE_URL,
  META_DEFAULT_MODEL,
  REASONING_EFFORT,
  SOURCES,
  cleanCompany,
  gankdatTools,
  isMetaModelApi,
  openAiChat,
  runAgent,
  stepSummary,
} from './diligence-core';

export type DiligenceBindings = {
  OPS_KV: KVNamespace;
  DILIGENCE_API_KEY?: string;
  DILIGENCE_GANKDAT_KEY?: string;
  DILIGENCE_BASE_URL?: string;
  DILIGENCE_MODEL?: string;
};

/** Checks one visitor may start per hour (the page is a demo, not a service). */
export const PER_VISITOR_HOUR = 6;
/** Checks the whole page may start per UTC day: US$150 of credits over ten days, a few cents each. */
export const PER_DAY = 150;

export interface Caps {
  perVisitorHour?: number;
  perDay?: number;
}

const esc = (s: string | number): string =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Counts a start under `key` and says whether it is within `max` for the window. */
export async function underCap(kv: KVNamespace, key: string, max: number, ttl: number): Promise<boolean> {
  const n = Number((await kv.get(key)) ?? '0') + 1;
  await kv.put(key, String(n), { expirationTtl: ttl });
  return n <= max;
}

export function modelOf(env: DiligenceBindings): { baseUrl: string; model: string; provider: string } {
  const baseUrl = env.DILIGENCE_BASE_URL || META_BASE_URL;
  const model = env.DILIGENCE_MODEL || (isMetaModelApi(baseUrl) ? META_DEFAULT_MODEL : '');
  return { baseUrl, model, provider: isMetaModelApi(baseUrl) ? 'Meta Model API' : new URL(baseUrl).hostname };
}

export const diligence = new Hono<{ Bindings: DiligenceBindings }>();

diligence.get('/', (c) => {
  const m = modelOf(c.env);
  return c.html(page(Boolean(c.env.DILIGENCE_API_KEY), m.model, m.provider, Boolean(c.env.DILIGENCE_GANKDAT_KEY)));
});

/** POST {company} → server-sent events: start, step…, report | error. */
diligence.post('/run', async (c) => {
  c.header('cache-control', 'no-store');
  c.header('x-robots-tag', 'noindex');
  const body = (await c.req.json().catch(() => ({}))) as { company?: unknown };
  const company = cleanCompany(body.company);
  const m = modelOf(c.env);
  const key = c.env.DILIGENCE_API_KEY;
  const ip = c.req.header('cf-connecting-ip') ?? 'unknown';
  const day = new Date().toISOString().slice(0, 10);
  const visitorOk = await underCap(c.env.OPS_KV, `rl:dil:v:${await sha256(ip)}`, PER_VISITOR_HOUR, 3600);
  const dayOk = visitorOk && (await underCap(c.env.OPS_KV, `rl:dil:d:${day}`, PER_DAY, 2 * 86_400));
  return streamSSE(c, async (stream) => {
    const send = (data: Record<string, unknown>): Promise<void> => stream.writeSSE({ data: JSON.stringify(data) });
    if (!company) return send({ type: 'error', message: 'Type a company name of 2 to 80 characters.' });
    if (!key) return send({ type: 'error', message: 'The model key is not configured on this deployment yet, so no check can run. The CLI in the repo runs the same loop with --dry-run.' });
    if (!visitorOk) return send({ type: 'error', message: `This demo allows ${PER_VISITOR_HOUR} checks an hour per visitor. Try again later.` });
    if (!dayOk) return send({ type: 'error', message: `Today's ${PER_DAY} checks are used up; the page opens again at 00:00 UTC.` });
    await send({ type: 'start', company, model: m.model, provider: m.provider, registers: SOURCES });
    try {
      const chat = openAiChat({ baseUrl: m.baseUrl, model: m.model, apiKey: key, reasoningEffort: REASONING_EFFORT });
      const tools = await gankdatTools(GANKDAT_MCP_URL, c.env.DILIGENCE_GANKDAT_KEY);
      const started = Date.now();
      const result = await runAgent({
        company,
        chat,
        ...tools,
        budget: new Budget(),
        onStep: (s) => send({ type: 'step', tool: s.tool, args: s.args, summary: stepSummary(s), chars: s.result.length }),
      });
      await send({
        type: 'report',
        markdown: result.report,
        calls: result.budget.calls,
        maxCalls: result.budget.maxCalls,
        tokens: result.budget.tokens,
        maxTokens: result.budget.maxTokens,
        seconds: Math.round((Date.now() - started) / 100) / 10,
      });
    } catch (e) {
      await send({ type: 'error', message: e instanceof Error ? e.message : String(e) });
    }
  });
});

const CSS = `
:root{--bg:#f6f7f9;--card:#fff;--ink:#17202a;--mute:#6b7280;--line:#e5e7eb;--accent:#0b63ce;--good:#15803d;--warn:#b45309;--bad:#b91c1c}
@media(prefers-color-scheme:dark){:root{--bg:#0f1318;--card:#171c23;--ink:#e6e9ee;--mute:#98a2b3;--line:#2a313b;--accent:#6aa9ff;--good:#4ade80;--warn:#fbbf24;--bad:#f87171}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
a{color:var(--accent)}.wrap{max-width:860px;margin:0 auto;padding:28px 16px 60px}
h1{font-size:28px;margin:0 0 6px;letter-spacing:-.3px}.lead{color:var(--mute);margin:0 0 20px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px 20px;margin:0 0 14px}
form{display:flex;gap:10px;flex-wrap:wrap}input{flex:1 1 260px;font:inherit;padding:12px 14px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink)}
button{font:inherit;padding:12px 18px;border-radius:10px;border:0;background:var(--accent);color:#fff;font-weight:600;cursor:pointer}button:disabled{opacity:.5;cursor:default}
.small{font-size:13px}.mute{color:var(--mute)}.hid{display:none}
ol.steps{margin:8px 0 0;padding-left:22px}ol.steps li{padding:4px 0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:14px}
ol.steps li.pending{color:var(--mute)}
#report h1{font-size:22px;margin:0 0 10px}#report h2{font-size:15px;text-transform:uppercase;letter-spacing:.08em;color:var(--mute);margin:18px 0 6px}
#report ul{margin:0;padding-left:20px}#report li{margin:4px 0}#report p{margin:6px 0}
.verdict{display:inline-block;padding:4px 10px;border-radius:999px;border:1px solid currentColor;font-weight:600;font-size:14px}
.verdict.LOW{color:var(--good)}.verdict.MEDIUM{color:var(--warn)}.verdict.HIGH{color:var(--bad)}
#meter{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;color:var(--mute);margin-top:12px}
.err{color:var(--bad)}.notice{border-color:var(--warn)}
`;

// The page script as a string: this package compiles without the DOM lib.
const JS = `
(function(){
var form=document.getElementById('f'),input=document.getElementById('company'),run=document.getElementById('run');
var status=document.getElementById('status'),steps=document.getElementById('steps'),report=document.getElementById('report'),meter=document.getElementById('meter'),out=document.getElementById('out');
window.diligenceEvents=[];
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function md(text){var html=[],list=false,lines=text.split('\\n');
 for(var i=0;i<lines.length;i++){var l=lines[i];
  if(/^- /.test(l)){if(!list){html.push('<ul>');list=true}html.push('<li>'+inline(l.slice(2))+'</li>');continue}
  if(list){html.push('</ul>');list=false}
  if(/^# /.test(l))html.push('<h1>'+inline(l.slice(2))+'</h1>');
  else if(/^## /.test(l))html.push('<h2>'+inline(l.slice(3))+'</h2>');
  else if(l.trim()==='')continue;
  else html.push('<p>'+inline(l)+'</p>');}
 if(list)html.push('</ul>');return html.join('')}
function inline(s){s=esc(s).replace(/\\*\\*(.+?)\\*\\*/g,'<b>$1</b>').replace(/\`(.+?)\`/g,'<code>$1</code>');
 return s.replace(/\\b(LOW|MEDIUM|HIGH) risk\\b/,function(m,v){return '<span class="verdict '+v+'">'+v+' risk</span>'})}
function handle(ev){window.diligenceEvents.push(ev);
 if(ev.type==='start'){status.textContent='Running '+ev.model+' on '+ev.provider+' — reading the registers…';
  steps.innerHTML='';}
 else if(ev.type==='step'){var li=document.createElement('li');li.className='step';li.textContent=ev.summary;steps.appendChild(li);}
 else if(ev.type==='report'){status.textContent='Done.';report.innerHTML=md(ev.markdown);report.classList.remove('hid');
  meter.textContent='model calls '+ev.calls+'/'+ev.maxCalls+' · tokens '+ev.tokens+'/'+ev.maxTokens+' · '+ev.seconds+' s';meter.classList.remove('hid');}
 else if(ev.type==='error'){status.innerHTML='<span class="err">'+esc(ev.message)+'</span>';}}
form.addEventListener('submit',function(e){e.preventDefault();
 var company=input.value.trim();if(company.length<2)return;
 run.disabled=true;out.classList.remove('hid');report.classList.add('hid');meter.classList.add('hid');steps.innerHTML='';window.diligenceEvents=[];
 status.textContent='Starting…';
 fetch('/diligence/run',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({company:company})}).then(function(res){
  var reader=res.body.getReader(),dec=new TextDecoder(),buf='';
  function pump(){return reader.read().then(function(r){
   if(r.done){run.disabled=false;return}
   buf+=dec.decode(r.value,{stream:true});var parts=buf.split('\\n\\n');buf=parts.pop();
   parts.forEach(function(p){p.split('\\n').forEach(function(line){if(line.indexOf('data:')===0){try{handle(JSON.parse(line.slice(5)))}catch(e){}}})});
   return pump()})}
  return pump()}).catch(function(e){status.innerHTML='<span class="err">'+esc(e.message||e)+'</span>';run.disabled=false;});});
})();
`;

export function page(hasKey: boolean, model: string, provider: string, fullRegisters: boolean): string {
  const registers = SOURCES.map((s) => `<code>${esc(s)}</code>`).join(', ');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Counterparty check · gankdat</title><meta name="description" content="Type a UK company name; an AI agent on Meta's Muse Spark reads seven official UK registers through gankdat's MCP server and writes a one-page risk report."><style>${CSS}</style></head><body><div class="wrap">
<h1>Counterparty check</h1>
<p class="lead">Type a UK company name. An agent on <b>${esc(model)}</b> (${esc(provider)}) reads Companies House, insolvency notices, the UK sanctions list, licensed sponsors, the charity register and public contract awards through <a href="https://gankdat.com/mcp">gankdat's MCP server</a>, then writes a one-page risk report in which every line names the register it came from.</p>
<div class="card">
${hasKey ? '' : '<p class="err" style="margin:0 0 10px">The model key is not configured on this deployment yet, so checks cannot run here. The same loop runs from the repository with <code>--dry-run</code>.</p>'}
<form id="f"><input id="company" name="company" maxlength="80" minlength="2" required placeholder="e.g. Acme Widgets Ltd" autocomplete="organization" ${hasKey ? 'autofocus' : 'disabled'}><button id="run" type="submit"${hasKey ? '' : ' disabled'}>Run the check</button></form>
<p class="small mute" style="margin:10px 0 0">Up to ${PER_VISITOR_HOUR} checks an hour per visitor, ${PER_DAY} a day for everyone: the page runs on hackathon credits. The name you type goes to the model provider and to gankdat and is not stored by this page.</p>
</div>
<div id="out" class="card hid"><p id="status" class="mute" style="margin:0"></p><ol id="steps" class="steps"></ol><div id="report" class="hid"></div><div id="meter" class="hid"></div></div>
<div class="card small mute">
<p style="margin:0 0 6px"><b>How it works.</b> The model decides which registers to read and calls them as tools — ${registers} — over the Model Context Protocol; the page streams each call as it lands. A spend guard stops any run past 40 model calls or 300k tokens. ${fullRegisters ? 'The registers answer in full.' : 'The registers answer in preview mode (a few rows each, a daily cap), so a large company may show a sample of its records.'}</p>
<p style="margin:0 0 6px"><b>What it is.</b> An entry in the Meta Global AI Developer Hackathon (26 Oct – 4 Nov 2026), built on <a href="https://gankdat.com">gankdat</a>, a live data product for AI agents. Source: <a href="https://github.com/giovf/rorororo/blob/main/packages/landing/src/diligence-core.ts">diligence-core.ts</a>; CLI: <code>scripts/meta-diligence-agent.ts</code>. Built with Claude Code.</p>
<p style="margin:0">This is a demonstration, not advice: the report repeats what public registers return for the name you typed, which may match several companies. Check the company number on <a href="https://find-and-update.company-information.service.gov.uk/">Companies House</a> before you rely on it.</p>
</div>
</div><script>${JS}</script></body></html>`;
}
