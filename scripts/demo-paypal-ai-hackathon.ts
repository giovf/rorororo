// Demo video for the PayPal AI Hackathon entry (hackathons `demo-video-pipeline`, 2026-10-11):
// the shot list in ventures/hackathons/entries/paypal-ai-hackathon/DEMO-SCRIPT.md, recorded by
// scripts/demo-video.ts against the live product. Run by the `demo video` workflow:
//
//   CLOUDFLARE_API_TOKEN=… PAYPAL_SANDBOX_BUYER_EMAIL=… PAYPAL_SANDBOX_BUYER_PASSWORD=… \
//     node --disable-warning=ExperimentalWarning scripts/demo-paypal-ai-hackathon.ts
//   DEMO_DRY_RUN=1 node … scripts/demo-paypal-ai-hackathon.ts   (no network, placeholder pages)
//
// Live mode seeds what the story needs through the Cloudflare REST API, as the metrics probe
// does (scripts/mcp-probe.ts): a key for this run under the internal demo@gankdat.com account
// (an @gankdat.com address — never a customer in any count), its month's usage at the free
// allowance so the pack is what pays, and a browser session so /account shows the balance. The
// PayPal step is the sandbox throughout: the buyer is a sandbox account from the developer
// dashboard, no live money exists on this path (src/billing/paypal.ts). Everything seeded is
// removed at the end, whatever happened. No secret is ever printed or recorded.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import type { Page } from 'playwright';
import { MAX_SECONDS, Recorder, plannedSeconds } from './demo-video.ts';
import {
  PROTOCOL_VERSION,
  USER_AGENT,
  cloudflare,
  deleteProbeKey,
  mintProbeKey,
  rpcBody,
} from './mcp-probe.ts';

export const ENTRY = 'paypal-ai-hackathon';
export const DEMO_EMAIL = 'demo@gankdat.com';
export const DEMO_KEY_NAME = 'hackathon demo video (one run)';
const BASE = (process.env['GANKDAT_BASE_URL'] ?? 'https://gankdat.com').replace(/\/$/, '');
const REPO = 'https://github.com/giovf/rorororo';
const FREE_CREDITS = 250;
const PACK = 'pack_1k';

export interface Shot {
  n: number;
  seconds: number;
  caption: string;
}

/** DEMO-SCRIPT.md's table; the seconds are what each shot holds on screen. */
export const SHOTS: readonly Shot[] = [
  {
    n: 1,
    seconds: 9,
    caption: 'gankdat: official UK/EU registers as one API and an MCP server for AI agents',
  },
  {
    n: 2,
    seconds: 18,
    caption:
      'An agent on the free plan runs out of credits. It creates a PayPal order itself (sandbox).',
  },
  { n: 3, seconds: 28, caption: 'The human approves on PayPal. The agent never sees a card.' },
  {
    n: 4,
    seconds: 16,
    caption: "The agent confirms the order: +1,000 credits on the account's top-up balance.",
  },
  {
    n: 5,
    seconds: 16,
    caption: 'The next data call is paid from the pack — plan first, then top-up.',
  },
  {
    n: 6,
    seconds: 22,
    caption:
      'Same packs for humans on the account page; PayPal returns the browser to a capture endpoint.',
  },
  { n: 7, seconds: 26, caption: 'Over MCP the two tools do the same — the agent buys in chat.' },
  {
    n: 8,
    seconds: 9,
    caption: 'Open source. Built with Claude Code. Sandbox only during the hackathon.',
  },
];

interface Usage {
  plan: string;
  used: number;
  granted: number;
  topup: number;
  remaining: number;
}
interface Order {
  order_id: string;
  approve_url: string;
  credits: number;
  amount_usd: number;
}
interface Capture {
  status: string;
  credits_added: number;
  topup: number;
}
interface DataCall {
  source: string | null;
  remaining: string | null;
}
interface Tool {
  name: string;
  description?: string;
}

/** The product as the script sees it: real calls in live mode, canned ones in the dry run. */
export interface Product {
  usage(): Promise<Usage>;
  createOrder(pack: string): Promise<Order>;
  capture(orderId: string): Promise<Capture>;
  dataCall(): Promise<DataCall>;
  mcpTools(): Promise<Tool[]>;
  mcpBuyCredits(pack: string): Promise<string>;
}

export function liveProduct(key: string, base = BASE): Product {
  const headers = { Authorization: `Bearer ${key}`, 'content-type': 'application/json' };
  const call = async (
    method: string,
    route: string,
    body?: unknown,
  ): Promise<{ data: Record<string, unknown>; res: Response }> => {
    const res = await fetch(`${base}${route}`, {
      method,
      headers,
      signal: AbortSignal.timeout(30_000),
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const json = (await res.json()) as { data?: Record<string, unknown>; error?: unknown };
    if (!res.ok)
      throw new Error(`${method} ${route} → ${res.status} ${JSON.stringify(json.error)}`);
    return { data: json.data ?? {}, res };
  };
  const rpc = async (
    id: number,
    method: string,
    params: Record<string, unknown>,
  ): Promise<Record<string, unknown>> => {
    const res = await fetch(`${base}/mcp`, {
      method: 'POST',
      headers: {
        ...headers,
        accept: 'application/json, text/event-stream',
        'user-agent': USER_AGENT.replace('mcp-probe', 'demo-video'),
      },
      body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
      signal: AbortSignal.timeout(30_000),
    });
    const message = await rpcBody(res);
    if (!message?.result)
      throw new Error(`MCP ${method} → ${res.status} ${JSON.stringify(message?.error)}`);
    return message.result;
  };
  return {
    usage: async () => (await call('GET', '/v1/usage')).data as unknown as Usage,
    createOrder: async (pack) =>
      (await call('POST', '/v1/billing/paypal/orders', { pack })).data as unknown as Order,
    capture: async (orderId) =>
      (await call('POST', `/v1/billing/paypal/orders/${orderId}/capture`))
        .data as unknown as Capture,
    dataCall: async () => {
      const { res } = await call('GET', '/v1/data/uk-sanctions?per_page=1');
      return {
        source: res.headers.get('X-Credits-Source'),
        remaining: res.headers.get('X-Credits-Remaining'),
      };
    },
    mcpTools: async () => {
      await rpc(1, 'initialize', {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: {},
        clientInfo: { name: 'gankdat-demo-video', version: '1' },
      });
      return ((await rpc(2, 'tools/list', {})).tools ?? []) as Tool[];
    },
    mcpBuyCredits: async (pack) => {
      const result = await rpc(3, 'tools/call', { name: 'buy_credits', arguments: { pack } });
      const content = (result.content ?? []) as { type?: string; text?: string }[];
      return content.find((c) => c.type === 'text')?.text ?? JSON.stringify(result);
    },
  };
}

/** Canned answers shaped like the live ones, so the recording path runs with no network. */
export function dryProduct(): Product {
  const approveUrl = 'https://www.sandbox.paypal.com/checkoutnow?token=DRYRUN0000000';
  return {
    usage: () => Promise.resolve({ plan: 'free', used: 250, granted: 250, topup: 0, remaining: 0 }),
    createOrder: () =>
      Promise.resolve({
        order_id: 'DRYRUN0000000',
        approve_url: approveUrl,
        credits: 1000,
        amount_usd: 8,
      }),
    capture: () => Promise.resolve({ status: 'completed', credits_added: 1000, topup: 1000 }),
    dataCall: () => Promise.resolve({ source: 'topup', remaining: '999' }),
    mcpTools: () =>
      Promise.resolve(
        [
          'query_uk_sanctions',
          'query_uk_companies',
          'request_api_key',
          'connect_account',
          'buy_credits',
          'confirm_credit_purchase',
        ].map((name) => ({ name })),
      ),
    mcpBuyCredits: () =>
      Promise.resolve(
        JSON.stringify({
          order_id: 'DRYRUN0000001',
          credits: 1000,
          amount_usd: 8,
          next: `Tell the user: "Approve US$8 for 1,000 gankdat credits at ${approveUrl}."`,
        }),
      ),
  };
}

/** The usage line as the walkthrough prints it. */
export function usageLine(u: Usage): string {
  return `    plan ${u.plan}: ${u.used}/${u.granted} used, top-up ${u.topup}, remaining ${u.remaining}`;
}

/** The names the tools-list shot shows: the two purchase tools first, then the rest. */
export function toolsForShot(tools: Tool[], limit = 10): string[] {
  const names = tools.map((t) => t.name);
  const first: string[] = names.filter(
    (n) => n === 'buy_credits' || n === 'confirm_credit_purchase',
  );
  const rest = names.filter((n) => !first.includes(n));
  return [...first, ...rest].slice(0, limit);
}

interface Buyer {
  email: string;
  password: string;
}

/** The sandbox buyer approves the order on PayPal's page; the browser lands back on gankdat. */
async function approveOnPayPal(page: Page, approveUrl: string, buyer: Buyer): Promise<void> {
  await page.goto(approveUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  const email = page.locator('#email');
  await email.waitFor({ state: 'visible', timeout: 45_000 });
  await email.fill(buyer.email);
  const next = page.locator('#btnNext');
  if (await next.isVisible().catch(() => false)) await next.click();
  const password = page.locator('#password');
  await password.waitFor({ state: 'visible', timeout: 45_000 });
  await password.fill(buyer.password);
  await page.locator('#btnLogin').click();
  const pay = page.locator('#payment-submit-btn');
  await pay.waitFor({ state: 'visible', timeout: 60_000 });
  await page.waitForTimeout(1500);
  await pay.click();
  await page.waitForURL(/\/account\?paypal=/, { timeout: 90_000 });
}

export interface Seed {
  key: string;
  cleanup(): Promise<void>;
  signIn(page: Page): Promise<void>;
}

/** Live mode only: the key, usage and session the story needs, and how to undo them. */
async function seed(token: string): Promise<Seed> {
  const cf = cloudflare(token);
  const minted = await mintProbeKey(cf.sql, undefined, DEMO_EMAIL, DEMO_KEY_NAME);
  const now = new Date();
  const period = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const usageKey = `usage:${DEMO_EMAIL}:${period}`;
  const topupKey = `topup:${DEMO_EMAIL}`;
  await cf.kvPut(usageKey, String(FREE_CREDITS), 7 * 24 * 3600);
  await cf.kvDelete(topupKey).catch(() => undefined);
  const sid = [...crypto.getRandomValues(new Uint8Array(32))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const session = {
    accountId: minted.accountId,
    email: DEMO_EMAIL,
    createdAt: Date.now(),
    refreshedAt: Date.now(),
  };
  await cf.kvPut(`session:${sid}`, JSON.stringify(session), 3600);
  return {
    key: minted.key,
    signIn: async (page) => {
      await page.context().addCookies([
        {
          name: 'fapi_session',
          value: sid,
          domain: new URL(BASE).hostname,
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'Lax',
        },
      ]);
    },
    cleanup: async () => {
      await deleteProbeKey(cf.sql, cf.kvDelete, minted);
      for (const k of [`session:${sid}`, usageKey, topupKey])
        await cf.kvDelete(k).catch(() => undefined);
    },
  };
}

export async function record(options: {
  outDir: string;
  dryRun: boolean;
  timeScale?: number;
  product: Product;
  seedState: Seed | null;
  buyer: Buyer | null;
}): Promise<{ mp4: string; seconds: number; log: string[] }> {
  const { product, seedState, buyer } = options;
  const rec = await Recorder.start({
    outDir: options.outDir,
    dryRun: options.dryRun,
    ...(options.timeScale === undefined ? {} : { timeScale: options.timeScale }),
  });
  const term = 'gankdat agent walkthrough — PayPal sandbox';
  const lines: string[] = [`$ node scripts/paypal-walkthrough.mjs ${PACK}`];
  const shot = (n: number): Shot => SHOTS[n - 1]!;
  const take = (n: number, actions: (page: Page) => Promise<void>): Promise<void> =>
    rec.shot(n, shot(n).caption, shot(n).seconds, actions);

  let order: Order | null = null;
  await take(1, async (page) => {
    await rec.open(`${BASE}/`, 'landing page, MCP section');
    if (!rec.dryRun) {
      await page
        .locator('#key')
        .scrollIntoViewIfNeeded()
        .catch(() => undefined);
      await rec.wait(2500);
      await page
        .locator('#pricing')
        .scrollIntoViewIfNeeded()
        .catch(() => undefined);
    }
  });
  await take(2, async () => {
    const before = await product.usage();
    lines.push('', '[1] balance before', usageLine(before));
    order = await product.createOrder(PACK);
    lines.push(
      '',
      `[2] create a PayPal (sandbox) order for ${PACK}`,
      `    order ${order.order_id}: ${order.credits} credits for US$${order.amount_usd}`,
      '    approve it here with a sandbox buyer account:',
      `    ${order.approve_url}`,
    );
    await rec.terminal(term, lines);
  });
  await take(3, async (page) => {
    if (rec.dryRun || !buyer || !order) {
      await rec.open(
        order?.approve_url ?? 'https://www.sandbox.paypal.com/',
        'PayPal sandbox approval page',
      );
      return;
    }
    await approveOnPayPal(page, order.approve_url, buyer);
  });
  await take(4, async () => {
    if (!order) throw new Error('no order to capture');
    const captured = await product.capture(order.order_id);
    const after = await product.usage();
    lines.push(
      '',
      '[3] capture the approved order',
      `    ${captured.status}: +${captured.credits_added} credits, top-up now ${captured.topup}`,
      '',
      '[4] balance after',
      usageLine(after),
    );
    await rec.terminal(term, lines.slice(-6));
  });
  await take(5, async () => {
    const paid = await product.dataCall();
    lines.push(
      '',
      '[5] spend one credit',
      '$ GET /v1/data/uk-sanctions?per_page=1',
      `    X-Credits-Source: ${paid.source}`,
      `    X-Credits-Remaining: ${paid.remaining}`,
      '',
      'Done. The same five steps are buy_credits → confirm_credit_purchase → query_* over MCP.',
    );
    await rec.terminal(term, lines.slice(-7));
  });
  await take(6, async (page) => {
    if (seedState) await seedState.signIn(page);
    await rec.open(`${BASE}/account`, 'account page, signed in: usage line and credit packs');
    if (!rec.dryRun) {
      await page
        .locator('#usage-nums')
        .waitFor({ state: 'visible', timeout: 30_000 })
        .catch(() => undefined);
      await rec.wait(4000);
      await page
        .locator('#credit-packs')
        .scrollIntoViewIfNeeded()
        .catch(() => undefined);
    }
  });
  await take(7, async () => {
    const tools = await product.mcpTools();
    const mcpLines = [
      '$ mcp tools/list  (https://gankdat.com/mcp)',
      ...toolsForShot(tools).map((n) => `    ${n}`),
      '',
      `$ mcp tools/call buy_credits {"pack":"${PACK}"}`,
    ];
    await rec.terminal('MCP client — gankdat', mcpLines, 200);
    const answer = await product.mcpBuyCredits(PACK);
    await rec.terminal(
      'MCP client — gankdat',
      [
        ...mcpLines,
        ...answer
          .split('\n')
          .slice(0, 8)
          .map((l) => `    ${l.slice(0, 240)}`),
      ],
      120,
    );
  });
  await take(8, async () => {
    await rec.open(
      `${REPO}/blob/main/ventures/gankdat/src/billing/paypal.ts`,
      'src/billing/paypal.ts on GitHub',
    );
  });
  return rec.finish(ENTRY);
}

async function main(): Promise<void> {
  const dryRun = process.env['DEMO_DRY_RUN'] === '1';
  const outDir = process.env['DEMO_OUT'] ?? path.join('ventures', 'hackathons', 'dist', ENTRY);
  await mkdir(outDir, { recursive: true });
  const planned = plannedSeconds(SHOTS);
  if (planned > MAX_SECONDS)
    throw new Error(`shot list plans ${planned}s, over the ${MAX_SECONDS}s cap`);

  let seedState: Seed | null = null;
  let buyer: Buyer | null = null;
  let product: Product;
  if (dryRun) {
    product = dryProduct();
  } else {
    const token = process.env['CLOUDFLARE_API_TOKEN'];
    const email = process.env['PAYPAL_SANDBOX_BUYER_EMAIL'];
    const password = process.env['PAYPAL_SANDBOX_BUYER_PASSWORD'];
    const missing = [
      ['CLOUDFLARE_API_TOKEN', token],
      ['PAYPAL_SANDBOX_BUYER_EMAIL', email],
      ['PAYPAL_SANDBOX_BUYER_PASSWORD', password],
    ]
      .filter(([, v]) => !v)
      .map(([k]) => k);
    if (missing.length) {
      console.error(
        `missing: ${missing.join(', ')} — the sandbox buyer is a Sandbox Account in the PayPal developer dashboard (docs/for-owner/actions/024-paypal-sandbox-buyer.md); set DEMO_DRY_RUN=1 for a placeholder recording`,
      );
      process.exit(2);
    }
    seedState = await seed(token!);
    buyer = { email: email!, password: password! };
    product = liveProduct(seedState.key);
  }
  try {
    const timeScale = Number(process.env['DEMO_TIME_SCALE'] ?? '1');
    const result = await record({ outDir, dryRun, timeScale, product, seedState, buyer });
    await writeFile(path.join(outDir, 'shots.txt'), `${result.log.join('\n')}\n`);
    console.log(`${result.mp4}: ${result.seconds.toFixed(1)}s${dryRun ? ' (dry run)' : ''}`);
    if (result.seconds > MAX_SECONDS) {
      console.error(`over the ${MAX_SECONDS}s cap`);
      process.exitCode = 1;
    }
  } finally {
    await seedState
      ?.cleanup()
      .catch((e: unknown) =>
        console.error(`cleanup: ${e instanceof Error ? e.message : String(e)}`),
      );
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  await main();
}
