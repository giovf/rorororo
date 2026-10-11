// Demo video recorder for hackathon entries (hackathons `demo-video-pipeline`, 2026-10-11).
// Every Devpost portal asks for a short demo video and the judges watch it first; no routine
// can record a screen, so a Playwright script per entry (`scripts/demo-<entry>.ts`) drives the
// live product in a headless Chromium with on-screen captions, Playwright records the page to
// webm and ffmpeg turns it into an mp4 that the `demo video` workflow publishes as an artifact
// the owner attaches to the submission. This file is the shared part: the recorder (one
// 1280×720 page, a caption bar re-injected on every navigation, a terminal-styled page for the
// agent's side of a story), the webm → mp4 step and the pure helpers the tests cover.
//
// Modes: live (the entry script calls the real product, seeded through the Cloudflare REST API
// with CLOUDFLARE_API_TOKEN) and DEMO_DRY_RUN=1 (no network: canned responses and placeholder
// pages, every frame labelled "dry run", so the recording path can be checked in a sandbox
// without ever producing something that could pass for the real video).
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, rename } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';

export const WIDTH = 1280;
export const HEIGHT = 720;
/** Devpost's usual cap; the queue item's proof is "one mp4 under 3 minutes". */
export const MAX_SECONDS = 180;
export const SANDBOX_CHROMIUM = '/opt/pw-browsers/chromium';

export function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** The caption bar: fixed at the bottom, above everything, readable on any page. */
export function captionHtml(text: string, dryRun = false): string {
  const tag = dryRun ? '<span style="color:#fbbf24;margin-right:12px">DRY RUN</span>' : '';
  return (
    `<div id="demo-caption" style="position:fixed;left:0;right:0;bottom:0;z-index:2147483647;` +
    `padding:18px 32px;background:rgba(10,10,14,.88);color:#f5f5f5;font:600 26px/1.3 ` +
    `system-ui,sans-serif;text-align:center;letter-spacing:.01em;pointer-events:none">` +
    `${tag}${escapeHtml(text)}</div>`
  );
}

/** One terminal line: `$ …` reads as a command, `[n] …` as a step, the rest as output. */
export function terminalLineHtml(line: string): string {
  const cls = line.startsWith('$ ') ? 'cmd' : line.startsWith('[') ? 'step' : 'out';
  return `<div class="${cls}">${escapeHtml(line) || '&nbsp;'}</div>`;
}

/** A terminal-styled page: a title bar and monospace lines. */
export function terminalHtml(title: string, lines: string[]): string {
  const body = lines.map(terminalLineHtml).join('');
  return (
    `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>` +
    `<style>html,body{margin:0;height:100%;background:#0b0f14;color:#d6deeb}` +
    `.bar{background:#161b22;color:#8b949e;font:14px system-ui,sans-serif;padding:10px 16px}` +
    `.bar b{color:#d6deeb;font-weight:600}` +
    `#term{padding:22px 28px;font:20px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap}` +
    `.cmd{color:#7ee787}.step{color:#79c0ff;margin-top:12px}.out{color:#d6deeb}</style></head>` +
    `<body><div class="bar">● ● ● &nbsp; <b>${escapeHtml(title)}</b></div><div id="term">${body}</div></body></html>`
  );
}

/** A labelled placeholder for a page the dry run must not fetch. */
export function placeholderHtml(url: string, note: string): string {
  return (
    `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;height:100vh;` +
    `display:grid;place-items:center;background:#f3f4f6;color:#111;font:24px system-ui,sans-serif">` +
    `<div style="text-align:center"><div style="font-size:18px;color:#6b7280">dry run — not fetched</div>` +
    `<div style="margin:12px 0;font-weight:600">${escapeHtml(url)}</div><div>${escapeHtml(note)}</div></div></body></html>`
  );
}

/** Seconds from `ffprobe -show_entries format=duration -of csv=p=0` output. */
export function parseFfprobeDuration(output: string): number | null {
  const line = output.trim().split('\n').pop() ?? '';
  const seconds = Number.parseFloat(line);
  return Number.isFinite(seconds) ? seconds : null;
}

/** The video's budget check: every shot's seconds plus the per-shot overhead, under the cap. */
export function plannedSeconds(shots: readonly { seconds: number }[], overhead = 1.5): number {
  return shots.reduce((sum, shot) => sum + shot.seconds + overhead, 0);
}

/** Which Chromium to drive (same order as the extensions' e2e runners). */
export function resolveBrowser(): { executablePath: string } | { channel: 'chromium' } {
  const fromEnv = process.env['CHROMIUM_PATH'];
  if (fromEnv) return { executablePath: fromEnv };
  if (existsSync(chromium.executablePath())) return { channel: 'chromium' };
  if (existsSync(SANDBOX_CHROMIUM)) return { executablePath: SANDBOX_CHROMIUM };
  throw new Error(
    `no Chromium: ${chromium.executablePath()} and ${SANDBOX_CHROMIUM} are missing and CHROMIUM_PATH is unset`,
  );
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

// The page-side snippets as source text: this package compiles without the DOM lib, and a
// string expression is what Playwright evaluates anyway.
/** Append `html` inside the element with that id. */
export function appendJs(id: string, html: string): string {
  return `(() => { const el = document.getElementById(${JSON.stringify(id)}); if (el) el.insertAdjacentHTML('beforeend', ${JSON.stringify(html)}); })()`;
}

/** Replace the caption bar with `html` at the end of the body. */
export function captionJs(html: string): string {
  return `(() => { document.getElementById('demo-caption')?.remove(); (document.body ?? document.documentElement).insertAdjacentHTML('beforeend', ${JSON.stringify(html)}); })()`;
}

export interface RecorderOptions {
  outDir: string;
  dryRun: boolean;
  /** Multiplies every wait; the tests use 0 so a recording takes seconds, not minutes. */
  timeScale?: number;
}

/**
 * One recorded page. `shot()` runs the shot's actions, keeps the caption on screen through any
 * navigation inside them and holds the frame for the shot's seconds. `finish()` closes the
 * browser, converts the webm and reports the mp4's duration.
 */
export class Recorder {
  readonly page: Page;
  readonly dryRun: boolean;
  private readonly browser: Browser;
  private readonly context: BrowserContext;
  readonly outDir: string;
  private readonly timeScale: number;
  private caption = '';
  private readonly log: string[] = [];

  private constructor(
    browser: Browser,
    context: BrowserContext,
    page: Page,
    options: RecorderOptions,
  ) {
    this.browser = browser;
    this.context = context;
    this.page = page;
    this.outDir = options.outDir;
    this.dryRun = options.dryRun;
    this.timeScale = options.timeScale ?? 1;
    page.on('domcontentloaded', () => {
      void this.inject();
    });
  }

  static async start(options: RecorderOptions): Promise<Recorder> {
    await mkdir(path.join(options.outDir, 'webm'), { recursive: true });
    const browser = await chromium.launch({ ...resolveBrowser(), headless: true });
    const context = await browser.newContext({
      viewport: { width: WIDTH, height: HEIGHT },
      recordVideo: {
        dir: path.join(options.outDir, 'webm'),
        size: { width: WIDTH, height: HEIGHT },
      },
      locale: 'en-GB',
    });
    const page = await context.newPage();
    return new Recorder(browser, context, page, options);
  }

  /** Open a URL — or, in the dry run, a labelled placeholder instead of fetching it. */
  async open(url: string, note = ''): Promise<void> {
    if (this.dryRun) {
      await this.page.setContent(placeholderHtml(url, note));
      return;
    }
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  }

  /** Show a terminal page and append the lines one by one, like output arriving. */
  async terminal(title: string, lines: string[], lineDelayMs = 350): Promise<void> {
    await this.page.setContent(terminalHtml(title, []));
    await this.inject();
    for (const line of lines) {
      await this.page.evaluate(appendJs('term', terminalLineHtml(line)));
      await this.wait(lineDelayMs);
    }
  }

  /** A line for shots.txt from the entry script (a skipped step, a failure it survived). */
  note(line: string): void {
    this.log.push(line);
  }

  async wait(ms: number): Promise<void> {
    await sleep(ms * this.timeScale);
  }

  async shot(
    n: number,
    caption: string,
    seconds: number,
    actions: (page: Page) => Promise<void>,
  ): Promise<void> {
    const started = Date.now();
    this.caption = caption;
    this.log.push(`shot ${n} (${seconds}s): ${caption}`);
    await this.inject();
    await actions(this.page);
    await this.inject();
    const used = (Date.now() - started) / 1000 / (this.timeScale || 1);
    await this.wait(Math.max(0, seconds - used) * 1000);
  }

  /** Stop recording, convert and return the mp4 path, its duration and the shot log. */
  async finish(name: string): Promise<{ mp4: string; seconds: number; log: string[] }> {
    const video = this.page.video();
    await this.context.close();
    await this.browser.close();
    const webm = video ? await video.path() : null;
    if (!webm) throw new Error('Playwright produced no video');
    const kept = path.join(this.outDir, `${name}.webm`);
    await rename(webm, kept);
    const mp4 = path.join(this.outDir, `${name}.mp4`);
    const seconds = convertToMp4(kept, mp4);
    return { mp4, seconds, log: this.log };
  }

  private async inject(): Promise<void> {
    if (!this.caption) return;
    try {
      await this.page.evaluate(captionJs(captionHtml(this.caption, this.dryRun)));
    } catch {
      // The page is mid-navigation; the next domcontentloaded injects it again.
    }
  }
}

/** webm → h264 mp4 (yuv420p so every player opens it) and the result's duration in seconds. */
export function convertToMp4(webm: string, mp4: string): number {
  const ffmpeg = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-loglevel',
      'error',
      '-i',
      webm,
      '-c:v',
      'libx264',
      '-preset',
      'medium',
      '-crf',
      '23',
      '-pix_fmt',
      'yuv420p',
      '-r',
      '25',
      '-movflags',
      '+faststart',
      mp4,
    ],
    { encoding: 'utf8' },
  );
  if (ffmpeg.status !== 0)
    throw new Error(`ffmpeg failed: ${ffmpeg.stderr || ffmpeg.error?.message}`);
  const probe = spawnSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4],
    { encoding: 'utf8' },
  );
  const seconds = parseFfprobeDuration(probe.stdout ?? '');
  if (seconds === null) throw new Error(`ffprobe gave no duration: ${probe.stderr}`);
  return seconds;
}
