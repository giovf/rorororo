// Intro video for Clay's partner team (gankdat `clay-intro-video`, 2026-11-15): a captioned
// 60–90 s recording, no voice, that answers what the Integrations Partner form's Loom field asked
// for — what gankdat is, the five register endpoints with their price and rate limits, one real
// company read across the registers with the field paths a Clay column maps, and why Clay.
// Recorded by scripts/demo-video.ts (the hackathon demo recorder):
//
//   node --disable-warning=ExperimentalWarning scripts/demo-clay-intro.ts
//   DEMO_DRY_RUN=1 node … scripts/demo-clay-intro.ts   (placeholder pages, fixture answers)
//
// Nothing here needs the network or a secret. The two product pages are the files that deploy to
// gankdat.com (ventures/gankdat/public, served from a local port for the recording), and the
// register answers are relay rounds' saved bodies (DEMO_LOOKUP_DIR, default the rounds
// docs/relay/responses/clay-intro-video-2026-11-15*): one keyless MCP preview call per register,
// made from a GitHub runner because a routine's sandbox cannot open gankdat.com. The terminal
// shots say so on screen (the title bar names the day read and the route), and print each answer
// under the REST request a Clay column sends for the same record — the two routes read one store.
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import process from 'node:process';
import type { Page } from 'playwright';
import { Recorder, escapeHtml, plannedSeconds } from './demo-video.ts';

export const ENTRY = 'clay-intro';
/** The queue item's proof: 60–90 s. */
export const MIN_SECONDS = 60;
export const MAX_INTRO_SECONDS = 90;
const RELAY = path.join('docs', 'relay', 'responses');
/** The relay rounds read for the recording, in order (DEMO_LOOKUP_DIR: comma-separated). */
export const DEFAULT_LOOKUP_DIRS: readonly string[] = [
  path.join(RELAY, 'clay-intro-video-2026-11-15'),
  path.join(RELAY, 'clay-intro-video-2026-11-15-b'),
  path.join(RELAY, 'clay-intro-video-2026-11-15-c'),
];
const PUBLIC_DIR = path.join('ventures', 'gankdat', 'public');

export interface Shot {
  n: number;
  seconds: number;
  caption: string;
}

export const SHOTS: readonly Shot[] = [
  {
    n: 1,
    seconds: 8,
    caption: 'gankdat: official UK public registers as one API. Open data, refreshed every day.',
  },
  {
    n: 2,
    seconds: 10,
    caption: 'gankdat.com/clay: five register checks as HTTP API columns in a Clay table.',
  },
  {
    n: 3,
    seconds: 12,
    caption:
      'One GET per check with the user’s own key: 250 calls a month free, then from £5 per 1,000.',
  },
  {
    n: 4,
    seconds: 14,
    caption: 'One real company by its number. Every field path maps straight to a Clay column.',
  },
  {
    n: 5,
    seconds: 14,
    caption: 'Charity, insolvency, sanctions, sponsor licence: meta.total is the hit count.',
  },
  {
    n: 6,
    seconds: 11,
    caption: 'Why Clay: 220 data providers on the marketplace, none native to the UK registers.',
  },
  { n: 7, seconds: 7, caption: 'Docs for Clay users: gankdat.com/clay' },
];

/** One register check: the REST request a Clay column sends and what the register answered. */
export interface Check {
  source: string;
  param: string;
  /** Field paths under `data.0.` shown when the register has a record. */
  fields: readonly string[];
  /** Requests a minute per key, as documented on the Clay page. */
  perMinute: number;
}

export const CHECKS: readonly Check[] = [
  {
    source: 'uk-company-profiles',
    param: 'company_number',
    fields: [
      'company',
      'status',
      'incorporated_on',
      'sic_codes',
      'accounts_overdue',
      'has_charges',
      'has_insolvency_history',
    ],
    perMinute: 30,
  },
  {
    source: 'uk-charities',
    param: 'company_number',
    fields: ['registered_charity_number', 'registration_status'],
    perMinute: 60,
  },
  { source: 'uk-insolvency', param: 'company', fields: ['notice_type'], perMinute: 60 },
  { source: 'uk-sanctions', param: 'name', fields: ['regime'], perMinute: 60 },
  { source: 'uk-sponsors', param: 'organisation', fields: ['route', 'rating'], perMinute: 60 },
];

export interface Answer {
  source: string;
  param: string;
  value: string;
  /** The register's hit count; null when the call failed. */
  total: number | null;
  record: Record<string, unknown> | null;
  /** When the runner made the call (ISO), or null in the dry run. */
  fetchedAt: string | null;
  error?: string;
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

export const toolSource = (tool: string): string =>
  tool.replace(/^query_/, '').replaceAll('_', '-');

/**
 * What one saved relay line says: the request (`tools/call` with its arguments, kept in
 * meta.json) and the JSON-RPC response body. A tool error, an HTTP error or a body that is not
 * the `{ data, meta }` envelope becomes an Answer with `error` set — the video then says the
 * register did not answer instead of showing a guess.
 */
export function answerFromRelay(
  request: unknown,
  body: unknown,
  status: number | null,
  fetchedAt: string | null,
): Answer | null {
  if (!isRecord(request) || request['method'] !== 'tools/call') return null;
  const params = request['params'];
  if (!isRecord(params) || typeof params['name'] !== 'string') return null;
  const args = isRecord(params['arguments']) ? params['arguments'] : {};
  const [param, value] = Object.entries(args)[0] ?? ['', ''];
  const base = { source: toolSource(params['name']), param, value: String(value), fetchedAt };
  const failed = (error: string): Answer => ({ ...base, total: null, record: null, error });
  if (status !== 200) return failed(`HTTP ${status ?? 'none'}`);
  if (!isRecord(body)) return failed('no JSON body');
  if (isRecord(body['error'])) {
    const message = body['error']['message'];
    return failed(typeof message === 'string' ? message : 'JSON-RPC error');
  }
  const result = body['result'];
  if (!isRecord(result)) return failed('no result');
  const content = Array.isArray(result['content']) ? result['content'] : [];
  const first: unknown = content[0];
  const text = isRecord(first) && typeof first['text'] === 'string' ? first['text'] : '';
  if (result['isError'] === true) return failed(text.slice(0, 120) || 'tool error');
  let payload: unknown = result['structuredContent'];
  if (!isRecord(payload)) {
    try {
      payload = JSON.parse(text);
    } catch {
      return failed('result is not JSON');
    }
  }
  if (!isRecord(payload) || !Array.isArray(payload['data'])) return failed('no data array');
  const rows: unknown[] = payload['data'];
  const meta = isRecord(payload['meta']) ? payload['meta'] : {};
  const total = typeof meta['total'] === 'number' ? meta['total'] : rows.length;
  const row = rows[0];
  return { ...base, total, record: isRecord(row) ? row : null, fetchedAt };
}

/** One relay round's saved answers, in the order its lines were sent. */
async function roundAnswers(dir: string): Promise<Answer[]> {
  const meta: unknown = JSON.parse(await readFile(path.join(dir, 'meta.json'), 'utf8'));
  const results = isRecord(meta) && Array.isArray(meta['results']) ? meta['results'] : [];
  const answers: Answer[] = [];
  for (const line of results as unknown[]) {
    if (!isRecord(line) || line['method'] !== 'POST') continue;
    const file = typeof line['file'] === 'string' ? line['file'] : null;
    let body: unknown = null;
    if (file) {
      try {
        body = JSON.parse(await readFile(path.join(dir, file), 'utf8'));
      } catch {
        body = null;
      }
    }
    // meta.json keeps the request line's body as the text that was sent.
    let request: unknown = line['body'];
    if (typeof request === 'string') {
      try {
        request = JSON.parse(request);
      } catch {
        request = null;
      }
    }
    const answer = answerFromRelay(
      request,
      body,
      typeof line['status'] === 'number' ? line['status'] : null,
      typeof line['fetched_at'] === 'string' ? line['fetched_at'] : null,
    );
    if (answer) answers.push(answer);
  }
  return answers;
}

/**
 * One answer per register, in CHECKS order, from one or more relay rounds: the first reading
 * that answered wins (a busy register is asked again in a later round), a register that never
 * answered keeps its first error, and one no round asked is left out.
 */
export function pickAnswers(all: readonly Answer[]): Answer[] {
  const picked: Answer[] = [];
  for (const check of CHECKS) {
    const mine = all.filter((a) => a.source === check.source);
    const best = mine.find((a) => a.total !== null) ?? mine[0];
    if (best) picked.push(best);
  }
  return picked;
}

export async function loadAnswers(dirs: readonly string[]): Promise<Answer[]> {
  const all: Answer[] = [];
  for (const dir of dirs) all.push(...(await roundAnswers(dir)));
  return pickAnswers(all);
}

/** The dry run's stand-in: an invented company, so nothing on a DRY RUN frame reads as real. */
export function dryRunAnswers(): Answer[] {
  const at = null;
  return [
    {
      source: 'uk-company-profiles',
      param: 'company_number',
      value: '00000006',
      total: 1,
      record: {
        company: 'ACME WIDGETS LIMITED',
        status: 'active',
        incorporated_on: '1998-04-01',
        sic_codes: ['25990'],
        accounts_overdue: false,
        has_charges: false,
        has_insolvency_history: false,
      },
      fetchedAt: at,
    },
    {
      source: 'uk-charities',
      param: 'company_number',
      value: '00000006',
      total: 0,
      record: null,
      fetchedAt: at,
    },
    {
      source: 'uk-insolvency',
      param: 'company',
      value: 'Acme Widgets',
      total: 0,
      record: null,
      fetchedAt: at,
    },
    {
      source: 'uk-sanctions',
      param: 'name',
      value: 'Acme Widgets',
      total: 0,
      record: null,
      fetchedAt: at,
    },
    {
      source: 'uk-sponsors',
      param: 'organisation',
      value: 'Acme Widgets',
      total: 1,
      record: { route: 'Skilled Worker', rating: 'A rating' },
      fetchedAt: at,
    },
  ];
}

/** A value as a Clay cell would show it, short enough for one terminal line. */
export function cell(value: unknown): string {
  const text = value === undefined ? 'null' : JSON.stringify(value);
  return text.length > 58 ? `${text.slice(0, 55)}…` : text;
}

/** The terminal lines of one check: the REST request, the hit count, the mapped field paths. */
export function answerLines(answer: Answer, withTotal = true): string[] {
  const check = CHECKS.find((c) => c.source === answer.source);
  const lines = [
    `$ GET /v1/data/${answer.source}?${answer.param}=${encodeURIComponent(answer.value)}`,
  ];
  if (answer.error || answer.total === null) {
    lines.push(`  no answer in this reading (${answer.error ?? 'unknown'})`);
    return lines;
  }
  const pad = (key: string): string => `  ${key.padEnd(36)}`;
  if (withTotal) lines.push(`${pad('meta.total')}${answer.total}`);
  if (answer.record)
    for (const field of check?.fields ?? [])
      if (field in answer.record)
        lines.push(`${pad(`data.0.${field}`)}${cell(answer.record[field])}`);
  return lines;
}

/** The day the registers were read, for the terminal's title bar. */
export function readOn(answers: readonly Answer[]): string {
  const at = answers.find((a) => a.fetchedAt)?.fetchedAt;
  return at ? `${at.slice(0, 10)} ${at.slice(11, 16)} UTC` : 'fixture';
}

export function terminalTitle(answers: readonly Answer[]): string {
  return `gankdat register answers, read ${readOn(answers)} (keyless preview; same records as the REST columns)`;
}

/** A plain card for the two shots that are a statement, not a page. */
export function cardHtml(heading: string, lines: readonly string[]): string {
  const items = lines.map((l) => `<p>${escapeHtml(l)}</p>`).join('');
  return (
    `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(heading)}</title>` +
    `<style>html,body{margin:0;height:100%;background:#0b0f14;color:#d6deeb;font:26px/1.45 system-ui,sans-serif}` +
    `main{box-sizing:border-box;height:100%;padding:70px 110px 120px;display:flex;flex-direction:column;justify-content:center}` +
    `h1{margin:0 0 26px;font-size:44px;line-height:1.15;color:#fff}p{margin:0 0 14px}` +
    `p::before{content:"— ";color:#7ee787}</style></head>` +
    `<body><main><h1>${escapeHtml(heading)}</h1>${items}</main></body></html>`
  );
}

export const WHY_CLAY: readonly string[] = [
  'Company record, charity register, insolvency notices, sanctions list and sponsor licences',
  'Today Clay users build this by hand: three or four HTTP API columns per company',
  'Official open-licence sources only; no personal data — it qualifies accounts, it finds no contacts',
  'Per key: 30 requests a minute for the company record, 60 for the other four',
];

export const CLOSING: readonly string[] = [
  'Column configs and field paths: gankdat.com/clay',
  'API reference: gankdat.com/docs · OpenAPI: gankdat.com/openapi.json',
  'Questions by email: info@gankdat.com',
];

/** The transcript written beside the mp4: what the video shows, as text Clay's team can paste. */
export function transcriptMarkdown(answers: readonly Answer[], dryRun: boolean): string {
  return [
    '# gankdat for Clay — intro video transcript',
    '',
    dryRun
      ? 'Dry run (fixture answers, placeholder pages).'
      : `Register answers read ${readOn(answers)} from gankdat.com by a GitHub runner (keyless MCP preview, one call per register); pages are the files deployed at gankdat.com.`,
    '',
    '## Captions',
    '',
    ...SHOTS.map((s) => `${s.n}. ${s.caption}`),
    '',
    '## Register answers shown',
    '',
    '```',
    ...answers.flatMap((a) => answerLines(a)),
    '```',
    '',
    '## Why Clay',
    '',
    ...WHY_CLAY.map((l) => `- ${l}`),
    '',
  ].join('\n');
}

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
};

/** Which file under the public directory a request path names (clean URLs, no traversal). */
export function publicFile(urlPath: string): string | null {
  const clean = decodeURIComponent(urlPath.split('?')[0] ?? '/');
  if (clean.includes('..') || clean.includes('\0')) return null;
  if (clean === '/') return 'index.html';
  const rel = clean.replace(/^\/+/, '');
  return path.extname(rel) ? rel : `${rel}.html`;
}

/** The deployed pages from the working tree on a local port; anything else (the API) is a 404. */
export async function servePublic(dir: string): Promise<{ url: string; close: () => void }> {
  const server: Server = createServer((req, res) => {
    const rel = publicFile(req.url ?? '/');
    const file = rel ? path.join(dir, rel) : null;
    if (!file || !existsSync(file)) {
      res.writeHead(404, { 'content-type': 'application/json' }).end('{"ok":false}');
      return;
    }
    readFile(file)
      .then((bytes) => {
        res
          .writeHead(200, {
            'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
          })
          .end(bytes);
      })
      .catch(() => {
        res.writeHead(500).end();
      });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}`,
    close: () => {
      server.close();
    },
  };
}

export async function record(options: {
  outDir: string;
  dryRun: boolean;
  answers: readonly Answer[];
  publicDir?: string;
  timeScale?: number;
}): Promise<{ mp4: string; seconds: number; log: string[] }> {
  const { answers } = options;
  const site = options.dryRun ? null : await servePublic(options.publicDir ?? PUBLIC_DIR);
  const base = site?.url ?? 'https://gankdat.com';
  const rec = await Recorder.start({
    outDir: options.outDir,
    dryRun: options.dryRun,
    ...(options.timeScale === undefined ? {} : { timeScale: options.timeScale }),
  });
  const take = (n: number, actions: (page: Page) => Promise<void>): Promise<void> => {
    const shot = SHOTS[n - 1]!;
    return rec.shot(n, shot.caption, shot.seconds, actions);
  };
  const scrollTo = async (page: Page, selector: string): Promise<void> => {
    if (rec.dryRun) return;
    // Smooth, and 24 px above the heading so the caption bar never covers what the shot is about.
    const found = await page.evaluate(
      `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return false; window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 24, behavior: 'smooth' }); return true; })()`,
    );
    if (found !== true) rec.note(`no ${selector} on the page`);
  };
  try {
    await take(1, async () => {
      await rec.open(`${base}/`, 'gankdat landing page');
    });
    await take(2, async () => {
      await rec.open(`${base}/clay`, 'the Clay docs page');
    });
    await take(3, async (page) => {
      await scrollTo(page, '#columns');
      await rec.wait(5500);
      await scrollTo(page, '#cost');
    });
    const title = terminalTitle(answers);
    const company = answers.find((a) => a.source === 'uk-company-profiles');
    await take(4, async () => {
      await rec.terminal(title, company ? answerLines(company, false) : [], 700);
    });
    await take(5, async () => {
      await rec.terminal(
        title,
        answers.filter((a) => a !== company).flatMap((a) => answerLines(a)),
        450,
      );
    });
    await take(6, async (page) => {
      await page.setContent(cardHtml('UK registers, native in a Clay table', WHY_CLAY));
    });
    await take(7, async (page) => {
      await page.setContent(cardHtml('gankdat for Clay', CLOSING));
    });
    return await rec.finish(ENTRY);
  } finally {
    site?.close();
  }
}

async function main(): Promise<void> {
  const dryRun = process.env['DEMO_DRY_RUN'] === '1';
  const outDir = process.env['DEMO_OUT'] ?? path.join('dist', 'demo');
  await mkdir(outDir, { recursive: true });
  const planned = plannedSeconds(SHOTS);
  if (planned > MAX_INTRO_SECONDS)
    throw new Error(`shot list plans ${planned}s, over the ${MAX_INTRO_SECONDS}s cap`);
  const answers = dryRun
    ? dryRunAnswers()
    : await loadAnswers(process.env['DEMO_LOOKUP_DIR']?.split(',') ?? DEFAULT_LOOKUP_DIRS);
  if (!answers.some((a) => a.source === 'uk-company-profiles' && a.record))
    throw new Error('no company record among the saved answers: nothing real to show');
  const timeScale = Number(process.env['DEMO_TIME_SCALE'] ?? '1');
  const result = await record({ outDir, dryRun, answers, timeScale });
  await writeFile(path.join(outDir, 'shots.txt'), `${result.log.join('\n')}\n`);
  await writeFile(path.join(outDir, 'transcript.md'), transcriptMarkdown(answers, dryRun));
  console.log(`${result.mp4}: ${result.seconds.toFixed(1)}s${dryRun ? ' (dry run)' : ''}`);
  if (timeScale === 1 && (result.seconds < MIN_SECONDS || result.seconds > MAX_INTRO_SECONDS)) {
    console.error(`outside ${MIN_SECONDS}–${MAX_INTRO_SECONDS}s`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  await main();
}
