// End-to-end check of the ReadFocus extension in a real Chromium, no human needed.
//   node --disable-warning=ExperimentalWarning e2e/run.ts        (after `node build.js --test`)
// Serves the fixture on 127.0.0.1, loads dist-test as an unpacked extension, drives the
// extension through its own storage (what the popup writes), and asserts on the page.
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';
import { issueLicense } from '@foundry/licensing';

const here = path.dirname(new URL(import.meta.url).pathname);
const ext = path.join(here, '..', 'dist-test');
const HOST = '127.0.0.1';
const fixture = await readFile(path.join(here, 'fixture.html'), 'utf8');
const fixturePdf = await readFile(path.join(here, 'fixture.pdf'));
const server = createServer((req, res) => {
  if (req.url === '/doc.pdf') {
    res.setHeader('content-type', 'application/pdf');
    res.end(fixturePdf);
    return;
  }
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.end(fixture);
});
await new Promise<void>((r) => server.listen(0, HOST, r));
const port = (server.address() as { port: number }).port;
const url = `http://${HOST}:${port}/`;

let failures = 0;
let skipped = false;
class Skip extends Error {}
const check = (name: string, ok: boolean, detail = ''): void => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

const context = await chromium.launchPersistentContext(
  path.join(tmpdir(), `rf-e2e-${Date.now()}`),
  {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`],
    // A sandbox with a different Playwright browser build points here (CHROMIUM_PATH=/opt/pw-browsers/chromium).
    ...(process.env['CHROMIUM_PATH'] ? { executablePath: process.env['CHROMIUM_PATH'] } : {}),
    viewport: { width: 1280, height: 800 },
  },
);
try {
  const sw = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
  const setSettings = (site: Record<string, unknown>, licenseKey = ''): Promise<void> =>
    sw.evaluate(
      ([host, s, key]) =>
        chrome.storage.sync.set({
          readfocus: { defaults: {}, sites: { [host as string]: s }, licenseKey: key },
        }),
      [HOST, site, licenseKey] as const,
    );

  // 0. Off: capture the untouched text to compare against after restore.
  await setSettings({ enabled: false });
  const page = await context.newPage();
  await page.goto(url);
  await page.waitForTimeout(300);
  const original = (await page.locator('#p1').textContent()) ?? '';
  check('nothing bolded while off', (await page.locator('.rf-b').count()) === 0);

  // 1. Free: medium bolding + ruler on.
  await setSettings({ enabled: true, bold: true, preset: 'medium', ruler: true, size: 1 });
  await page.waitForSelector('.rf-b', { timeout: 5000 });
  const bolds = await page.locator('.rf-b').count();
  check('bolds word starts', bolds > 20, `${bolds} bold runs`);
  check(
    'first word bolded as expected',
    (await page.locator('#p1 .rf-b').first().textContent()) === 'Read',
  );
  check('code untouched', (await page.locator('#code .rf-b').count()) === 0);
  check(
    'textarea untouched',
    (await page.inputValue('#ta')) === 'Text the reader is typing stays exactly as it is.',
  );
  check('strong keeps bold start (bolder)', (await page.locator('#strong .rf-b').count()) > 0);
  check('ruler present', (await page.locator('.rf-ruler').count()) === 1);
  await page.mouse.move(300, 300);
  const rulerTop = await page
    .locator('.rf-ruler')
    .evaluate((el) => parseFloat((el as HTMLElement).style.top));
  check('ruler follows mouse', Math.abs(rulerTop + 17 - 300) < 3, `top=${rulerTop}`);
  check(
    'no pro features when unlicensed',
    !(await page.evaluate(() => document.documentElement.classList.contains('rf-focus'))),
  );
  await page.screenshot({ path: path.join(here, 'out', '01-free-medium-ruler.png') });

  // 2. Text size scales outer blocks only, not the nested list or textarea.
  await setSettings({ enabled: true, bold: true, preset: 'medium', size: 1.3 });
  await page.waitForFunction(() => document.documentElement.classList.contains('rf-size'));
  const sizes = await page.evaluate(() => ({
    p: parseFloat(getComputedStyle(document.getElementById('p1')!).fontSize),
    nested: parseFloat(getComputedStyle(document.getElementById('nested')!).fontSize),
    outer: parseFloat(getComputedStyle(document.querySelector('#list > li')!).fontSize),
    ta: parseFloat(getComputedStyle(document.getElementById('ta')!).fontSize),
  }));
  check('text size scales paragraphs', Math.abs(sizes.p - 18 * 1.3) < 0.6, `p=${sizes.p}`);
  check(
    'nested list does not compound',
    Math.abs(sizes.nested - sizes.outer) < 0.6,
    `outer=${sizes.outer} nested=${sizes.nested}`,
  );
  check('textarea size untouched', sizes.ta < 18, `ta=${sizes.ta}`);

  // 3. Off → exact restore.
  await setSettings({ enabled: false });
  await page.waitForFunction(() => document.querySelectorAll('.rf-b').length === 0);
  const restored = (await page.locator('#p1').textContent()) ?? '';
  check(
    'text restored exactly',
    restored === original,
    restored === original ? '' : `got "${restored.slice(0, 60)}…"`,
  );
  check('no wrappers left anywhere', (await page.locator('.rf-w').count()) === 0);
  check(
    'size class removed',
    !(await page.evaluate(() => document.documentElement.classList.contains('rf-size'))),
  );

  // 4. PDFs (free): the extension's own reader page reflows the text into paragraphs keyed to the
  //    PDF's host; free readers get the first page and the unlock note.
  const pdfUrl = `${url}doc.pdf`;
  const reader = `${sw.url().replace(/\/background\.js$/, '')}/pdf.html?file=${encodeURIComponent(pdfUrl)}`;
  await setSettings({ enabled: true, bold: true, preset: 'medium', ruler: true });
  const pdfPage = await context.newPage();
  await pdfPage.goto(reader);
  await pdfPage.waitForSelector('.page p', { timeout: 10000 });
  check(
    'pdf reader titles the tab from the file name',
    (await pdfPage.title()).startsWith('doc.pdf'),
  );
  const paras = await pdfPage.locator('.page[data-page="1"] p').allTextContents();
  check(
    'pdf text reflowed into paragraphs',
    paras.length === 2,
    `${paras.length} paragraphs: ${JSON.stringify(paras)}`,
  );
  check(
    'pdf lines joined into one paragraph',
    (paras[0] ?? '').startsWith(
      'ReadFocus now reads PDF files in its own reader page, so the bold word starts, the ruler',
    ),
  );
  await pdfPage.waitForSelector('.rf-b', { timeout: 5000 });
  check(
    'pdf paragraphs bolded (settings keyed by the PDF host)',
    (await pdfPage.locator('.page .rf-b').count()) > 10,
  );
  check('ruler works on the pdf page', (await pdfPage.locator('.rf-ruler').count()) === 1);
  check('free reader shows the first page only', (await pdfPage.locator('.page').count()) === 1);
  check('free reader shows the unlock note', await pdfPage.locator('#unlock').isVisible());
  await pdfPage.screenshot({ path: path.join(here, 'out', '03-pdf-free.png') });
  // 5. Pro: real key → paragraph focus + font + weight stroke. Needs LICENSE_SIGNING_KEY (.env);
  //    a sandbox without it skips the pro sections and says so.
  if (!process.env['LICENSE_SIGNING_KEY']) {
    console.log('SKIP  pro sections (5–7): no LICENSE_SIGNING_KEY in the environment');
    skipped = true;
    throw new Skip();
  }
  const key = await issueLicense(process.env['LICENSE_SIGNING_KEY'], {
    venture: 'read-focus',
    tier: 'pro',
    id: 'e2e',
    issued: '2026-09-19',
  });
  await setSettings(
    {
      enabled: true,
      bold: true,
      preset: 'heavy',
      strength: 0.6,
      weight: 900,
      focus: true,
      font: 'opendyslexic',
    },
    key,
  );
  await page.waitForFunction(() => document.documentElement.classList.contains('rf-focus'));
  check('paragraph focus on', true);
  check(
    'font class applied',
    await page.evaluate(() => document.documentElement.classList.contains('rf-font-opendyslexic')),
  );
  const fontLoaded = await page
    .waitForFunction(
      async () => {
        await document.fonts.load('700 16px "ReadFocus opendyslexic"');
        return document.fonts.check('700 16px "ReadFocus opendyslexic"');
      },
      undefined,
      { timeout: 5000 },
    )
    .then(
      () => true,
      () => false,
    );
  check('font face loaded', fontLoaded);
  const stroke = await page.evaluate(
    () => getComputedStyle(document.querySelector('.rf-b')!).webkitTextStrokeWidth,
  );
  check('weight adds stroke', parseFloat(stroke) > 0.7, `stroke=${stroke}`);
  await page.mouse.move(400, 250);
  await page.waitForTimeout(150);
  const focused = await page.locator('.rf-focus-target').count();
  check('one paragraph focused under pointer', focused === 1, `${focused} focused`);
  await page.screenshot({ path: path.join(here, 'out', '02-pro-focus-font.png') });

  // 6. Bad key → free.
  await setSettings(
    { enabled: true, bold: true, preset: 'medium', focus: true, font: 'atkinson' },
    'FNDRY1.garbage.garbage',
  );
  await page.waitForFunction(() => !document.documentElement.classList.contains('rf-focus'));
  check(
    'invalid key gets no pro features',
    !(await page.evaluate(() => document.documentElement.classList.contains('rf-font-atkinson'))),
  );

  // 7. PDFs (pro): the whole file, fonts apply, and switching the site off restores the text.
  await setSettings({ enabled: true, bold: true, preset: 'medium', font: 'opendyslexic' }, key);
  await pdfPage.reload();
  await pdfPage.waitForSelector('.page[data-page="2"] p', { timeout: 10000 });
  check('pro reader shows every page', (await pdfPage.locator('.page').count()) === 2);
  check('pro reader hides the unlock note', !(await pdfPage.locator('#unlock').isVisible()));
  check(
    'font applies on the pdf page',
    await pdfPage.evaluate(() =>
      document.documentElement.classList.contains('rf-font-opendyslexic'),
    ),
  );
  await pdfPage.screenshot({ path: path.join(here, 'out', '04-pdf-pro.png') });
  await setSettings({ enabled: false });
  await pdfPage.waitForFunction(() => document.querySelectorAll('.rf-b').length === 0);
  check(
    'pdf page restored when the site is switched off',
    (await pdfPage.locator('.page p').count()) === 3,
  );
} catch (e) {
  if (!(e instanceof Skip)) throw e;
} finally {
  await context.close();
  server.close();
}
console.log(
  failures === 0
    ? `\nALL PASSED${skipped ? ' (pro sections skipped)' : ''}`
    : `\n${failures} FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
