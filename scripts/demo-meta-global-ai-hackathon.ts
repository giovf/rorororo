// Demo video for the Meta Global AI Developer Hackathon entry (hackathons
// `meta-global-ai-hackathon-entry`, 2026-10-26): the shot list in
// ventures/hackathons/entries/meta-global-ai-hackathon/DEMO-SCRIPT.md, recorded by
// scripts/demo-video.ts. Run by the `demo video` workflow (entry meta-global-ai-hackathon):
//
//   node --disable-warning=ExperimentalWarning scripts/demo-meta-global-ai-hackathon.ts
//   DEMO_DRY_RUN=1 node … scripts/demo-meta-global-ai-hackathon.ts   (no network, placeholder pages)
//
// Live mode drives the public page https://apps.gankdat.com/diligence in the recorded browser —
// the page holds the model key (the landing Worker's DILIGENCE_API_KEY), so this script needs no
// secret — and reads the events the page kept (window.diligenceEvents) into
// dist/demo/transcript.md, the live walkthrough the submission quotes. DEMO_COMPANY picks the
// company (a large, long-established one by default, so the report is about public records that
// are plentiful and dull); the shots hold while the model works, up to DEMO_RUN_TIMEOUT_MS.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import type { Page } from 'playwright';
import { MAX_SECONDS, Recorder, plannedSeconds } from './demo-video.ts';

export const ENTRY = 'meta-global-ai-hackathon';
const APPS = (process.env['APPS_BASE_URL'] ?? 'https://apps.gankdat.com').replace(/\/$/, '');
const GANKDAT = (process.env['GANKDAT_BASE_URL'] ?? 'https://gankdat.com').replace(/\/$/, '');
const REPO = 'https://github.com/giovf/rorororo';
export const DEFAULT_COMPANY = 'Tesco Stores Limited';

export interface Shot {
  n: number;
  seconds: number;
  caption: string;
}

/** DEMO-SCRIPT.md's table; the seconds are what each shot holds on screen. */
export const SHOTS: readonly Shot[] = [
  {
    n: 1,
    seconds: 8,
    caption: 'gankdat: seven official UK registers as one API and an MCP server for AI agents',
  },
  {
    n: 2,
    seconds: 10,
    caption: 'Type a UK company name. Muse Spark on Meta Model API takes the case.',
  },
  {
    n: 3,
    seconds: 35,
    caption:
      'It reads Companies House, sanctions, insolvency, sponsors and contract awards — live, over MCP.',
  },
  {
    n: 4,
    seconds: 40,
    caption:
      'One page: Identity, Red flags, Public money, Verdict. Every line names the register it came from.',
  },
  {
    n: 5,
    seconds: 15,
    caption:
      'A few model calls, a few cents. A spend guard stops any run past 40 calls or 300k tokens.',
  },
  {
    n: 6,
    seconds: 25,
    caption:
      'The same loop from a terminal — any endpoint serving Meta’s models, chosen by configuration.',
  },
  {
    n: 7,
    seconds: 15,
    caption:
      'Open source. Built with Claude Code inside the hackathon window on an agent that only had fixtures.',
  },
];

/** What the page records per event (src/diligence.ts JS: window.diligenceEvents). */
export interface PageEvent {
  type: 'start' | 'step' | 'report' | 'error';
  company?: string;
  model?: string;
  provider?: string;
  summary?: string;
  markdown?: string;
  calls?: number;
  maxCalls?: number;
  tokens?: number;
  maxTokens?: number;
  seconds?: number;
  message?: string;
}

/** The dry run's stand-in for the page's events: the fixture story, so the shots have content. */
export function dryRunEvents(company: string): PageEvent[] {
  const q = `"${company}"`;
  return [
    { type: 'start', company, model: 'muse-spark-1.3', provider: 'Meta Model API' },
    { type: 'step', summary: `query_uk_companies ${q} → 1 match` },
    { type: 'step', summary: `query_uk_sanctions ${q} → 0 matches` },
    { type: 'step', summary: `query_uk_insolvency ${q} → 1 match` },
    { type: 'step', summary: `query_uk_sponsors ${q} → 0 matches` },
    { type: 'step', summary: `query_uk_contract_awards ${q} → 1 match` },
    {
      type: 'report',
      markdown: `# Due diligence: ${company}\n\n## Identity\n- Companies House: 1 match (query_uk_companies).\n\n## Red flags\n- Sanctions: 0 match (query_uk_sanctions).\n- Insolvency notices: 1 (query_uk_insolvency).\n\n## Public money\n- Contract awards: 1 (query_uk_contract_awards).\n\n## Verdict\nMEDIUM risk — an insolvency notice is on the Gazette; no sanctions match.\n\n## Sources\n- query_uk_companies {"q":${q}}`,
      calls: 3,
      maxCalls: 40,
      tokens: 6120,
      maxTokens: 300_000,
      seconds: 21.4,
    },
  ];
}

/** The terminal lines of shot 6, from the events: the CLI telling the same story. */
export function terminalLines(company: string, events: PageEvent[]): string[] {
  const start = events.find((e) => e.type === 'start');
  const report = events.find((e) => e.type === 'report');
  const lines = [
    `$ META_MODEL_API_KEY=… node scripts/meta-diligence-agent.ts "${company}"`,
    `model ${start?.model ?? 'muse-spark-1.3'} on ${start?.provider ?? 'Meta Model API'}; 7 registers over MCP`,
    ...events.filter((e) => e.type === 'step').map((e) => `→ ${e.summary ?? ''}`),
  ];
  if (report)
    lines.push(
      `model calls ${report.calls ?? 0}/${report.maxCalls ?? 40}, tokens ${report.tokens ?? 0}/${report.maxTokens ?? 300_000}`,
      '',
      ...(report.markdown ?? '').split('\n').slice(0, 6),
      '…',
    );
  return lines;
}

/** The walkthrough file written beside the mp4: the page's events as a transcript. */
export function transcriptMarkdown(company: string, events: PageEvent[], dryRun: boolean): string {
  const start = events.find((e) => e.type === 'start');
  const report = events.find((e) => e.type === 'report');
  const error = events.find((e) => e.type === 'error');
  return [
    `# Live walkthrough — ${start?.model ?? '?'} on ${start?.provider ?? '?'} checks "${company}"`,
    '',
    `${dryRun ? 'Dry run (fixtures, no network)' : `Recorded from ${APPS}/diligence by the demo video workflow`} on ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC.`,
    '',
    '## Registers read',
    '',
    ...events.filter((e) => e.type === 'step').map((e) => `- ${e.summary ?? ''}`),
    '',
    ...(report
      ? [
          `Model calls ${report.calls ?? '?'}/${report.maxCalls ?? '?'}, tokens ${report.tokens ?? '?'}/${report.maxTokens ?? '?'}, ${report.seconds ?? '?'} s.`,
          '',
          '## Report',
          '',
          '```markdown',
          (report.markdown ?? '').trim(),
          '```',
        ]
      : [`No report: ${error?.message ?? 'the run did not finish'}`]),
    '',
  ].join('\n');
}

export async function record(options: {
  outDir: string;
  dryRun: boolean;
  company: string;
  timeScale?: number;
  runTimeoutMs?: number;
}): Promise<{ mp4: string; seconds: number; log: string[]; events: PageEvent[] }> {
  const { company } = options;
  const rec = await Recorder.start({
    outDir: options.outDir,
    dryRun: options.dryRun,
    ...(options.timeScale === undefined ? {} : { timeScale: options.timeScale }),
  });
  const shot = (n: number): Shot => SHOTS[n - 1]!;
  const take = (n: number, actions: (page: Page) => Promise<void>): Promise<void> =>
    rec.shot(n, shot(n).caption, shot(n).seconds, actions);
  const runTimeout = options.runTimeoutMs ?? 150_000;
  let events: PageEvent[] = rec.dryRun ? dryRunEvents(company) : [];
  const readEvents = async (page: Page): Promise<PageEvent[]> => {
    if (rec.dryRun) return events;
    const raw = await page.evaluate('JSON.stringify(window.diligenceEvents || [])');
    return typeof raw === 'string' ? (JSON.parse(raw) as PageEvent[]) : [];
  };

  await take(1, async (page) => {
    await rec.open(`${GANKDAT}/`, 'landing page, MCP section');
    if (!rec.dryRun) {
      await rec.wait(2500);
      await page
        .locator('#mcp, #key, #pricing')
        .first()
        .scrollIntoViewIfNeeded()
        .catch(() => undefined);
    }
  });
  await take(2, async (page) => {
    await rec.open(`${APPS}/diligence`, 'the counterparty-check page');
    if (!rec.dryRun) {
      await page.locator('#company').waitFor({ state: 'visible', timeout: 30_000 });
      await page.locator('#company').pressSequentially(company, { delay: 60 });
      await rec.wait(800);
      await page.locator('#run').click();
    }
  });
  await take(3, async (page) => {
    if (rec.dryRun) return;
    // Hold while the registers come in: the shot's seconds are a floor, the first step a signal.
    await page
      .locator('#steps li')
      .first()
      .waitFor({ state: 'visible', timeout: runTimeout })
      .catch(() => rec.note('shot 3: no register step appeared within the run timeout'));
  });
  await take(4, async (page) => {
    if (rec.dryRun) return;
    await page
      .locator('#report')
      .waitFor({ state: 'visible', timeout: runTimeout })
      .catch(() => rec.note('shot 4: no report within the run timeout'));
    events = await readEvents(page);
    const error = events.find((e) => e.type === 'error');
    if (error) rec.note(`run error: ${error.message ?? ''}`);
    await rec.wait(1500);
    await page
      .locator('#report h2')
      .last()
      .scrollIntoViewIfNeeded()
      .catch(() => undefined);
  });
  await take(5, async (page) => {
    if (rec.dryRun) return;
    await page
      .locator('#meter')
      .scrollIntoViewIfNeeded()
      .catch(() => undefined);
  });
  await take(6, async () => {
    await rec.terminal('terminal — meta-diligence-agent', terminalLines(company, events), 250);
  });
  await take(7, async () => {
    await rec.open(
      `${REPO}/blob/main/packages/landing/src/diligence-core.ts`,
      'diligence-core.ts on GitHub',
    );
  });
  const result = await rec.finish(ENTRY);
  return { ...result, events };
}

async function main(): Promise<void> {
  const dryRun = process.env['DEMO_DRY_RUN'] === '1';
  const outDir = process.env['DEMO_OUT'] ?? path.join('ventures', 'hackathons', 'dist', ENTRY);
  const company = process.env['DEMO_COMPANY'] ?? DEFAULT_COMPANY;
  await mkdir(outDir, { recursive: true });
  const planned = plannedSeconds(SHOTS);
  if (planned > MAX_SECONDS)
    throw new Error(`shot list plans ${planned}s, over the ${MAX_SECONDS}s cap`);
  const timeScale = Number(process.env['DEMO_TIME_SCALE'] ?? '1');
  const result = await record({ outDir, dryRun, company, timeScale });
  await writeFile(path.join(outDir, 'shots.txt'), `${result.log.join('\n')}\n`);
  await writeFile(
    path.join(outDir, 'transcript.md'),
    transcriptMarkdown(company, result.events, dryRun),
  );
  console.log(`${result.mp4}: ${result.seconds.toFixed(1)}s${dryRun ? ' (dry run)' : ''}`);
  if (result.seconds > MAX_SECONDS) {
    console.error(`over the ${MAX_SECONDS}s cap`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  await main();
}
