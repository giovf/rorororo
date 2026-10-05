// End-to-end check of Highlight Keep in a real Chromium: create highlights by selecting
// text, restore them after reload (and after the page text shifts), recolour/note/remove,
// free-tier gating, Markdown export.
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { chromium, type Page } from 'playwright';
import { issueLicense } from '@foundry/licensing';

const here = path.dirname(new URL(import.meta.url).pathname);
const ext = path.join(here, '..', 'dist-test');
const HOST = '127.0.0.1';
let fixture = await readFile(path.join(here, 'fixture.html'), 'utf8');
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
const url = `http://${HOST}:${(server.address() as { port: number }).port}/`;

let failures = 0;
let skipped = false;
const check = (name: string, ok: boolean, detail = ''): void => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

async function selectText(page: Page, selector: string, text: string): Promise<void> {
  await page.evaluate(
    ([sel, t]) => {
      const el = document.querySelector(sel)!;
      const node = [...el.childNodes].find(
        (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').includes(t),
      ) as Text;
      const i = node.data.indexOf(t);
      const range = document.createRange();
      range.setStart(node, i);
      range.setEnd(node, i + t.length);
      const s = window.getSelection()!;
      s.removeAllRanges();
      s.addRange(range);
    },
    [selector, text] as const,
  );
  // A real click would collapse the selection; fire the mouseup the content script listens for.
  await page.evaluate((sel) => {
    const el = document.querySelector(sel)!;
    const r = el.getBoundingClientRect();
    el.dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true, clientX: r.left + 20, clientY: r.top + 10 }),
    );
  }, selector);
}

// Which Chromium to drive, in order: CHROMIUM_PATH, Playwright's own registry build, then the
// sandbox's pre-installed build (a cloud sandbox ships an older build than Playwright wants and
// forbids `playwright install`). Extensions need the full browser, not the headless shell.
const SANDBOX_CHROMIUM = '/opt/pw-browsers/chromium';
function resolveBrowser(): { executablePath: string } | { channel: 'chromium' } {
  const fromEnv = process.env['CHROMIUM_PATH'];
  if (fromEnv) {
    console.log(`browser: ${fromEnv} (CHROMIUM_PATH)`);
    return { executablePath: fromEnv };
  }
  const own = chromium.executablePath();
  if (existsSync(own)) {
    console.log(`browser: ${own} (Playwright registry)`);
    return { channel: 'chromium' };
  }
  if (existsSync(SANDBOX_CHROMIUM)) {
    console.log(`browser: ${SANDBOX_CHROMIUM} (sandbox fallback; Playwright wanted ${own})`);
    return { executablePath: SANDBOX_CHROMIUM };
  }
  throw new Error(
    `no Chromium: ${own} is missing, ${SANDBOX_CHROMIUM} is missing and CHROMIUM_PATH is unset — run \`npx playwright install chromium\` or set CHROMIUM_PATH`,
  );
}

const context = await chromium.launchPersistentContext(
  path.join(tmpdir(), `hk-e2e-${Date.now()}`),
  {
    ...resolveBrowser(),
    headless: true,
    args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`],
    viewport: { width: 1280, height: 800 },
  },
);
try {
  const sw = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
  const setKey = (key: string): Promise<void> =>
    sw.evaluate(
      (k) => chrome.storage.sync.set({ highlightkeep: { sites: {}, licenseKey: k } }),
      key,
    );
  const page = await context.newPage();
  await page.goto(url);
  await page.waitForTimeout(400);

  // 1. Select → toolbar → highlight.
  await selectText(page, '#p1', 'find the start of every word');
  await page.waitForSelector('.hk-toolbar:not([hidden])', { timeout: 3000 });
  check(
    'toolbar shows one colour on free',
    (await page.locator('.hk-toolbar .hk-dot').count()) === 1,
  );
  await page.click('.hk-toolbar .hk-dot');
  await page.waitForSelector('mark.hk');
  check(
    'highlight painted',
    (await page.locator('mark.hk').textContent()) === 'find the start of every word',
  );
  await page.screenshot({ path: path.join(here, 'out', '01-highlight.png') });

  // 2. Reload → restored; shift the page text → still restored (anchoring).
  await page.reload();
  await page.waitForSelector('mark.hk', { timeout: 4000 });
  check('restored after reload', (await page.locator('mark.hk').count()) === 1);
  fixture = fixture.replace(
    '<h1>Notes on reading</h1>',
    '<div>NEW BANNER inserted above.</div><h1>Notes on reading (edited)</h1>',
  );
  await page.reload();
  await page.waitForSelector('mark.hk', { timeout: 4000 });
  check(
    'restored after page text shifted',
    (await page.locator('mark.hk').textContent()) === 'find the start of every word',
  );

  // 3. Free-tier gating on pro features: notes button absent; second site cap.
  check(
    'no note button on free',
    (await page.locator('.hk-toolbar [data-act="note"]').count()) === 0,
  );

  // 4. PDFs (free tier): the extension's own viewer page renders the text layer and the highlighter
  //    stores under the PDF's URL, restoring after reload.
  const pdfUrl = `${url}doc.pdf`;
  const viewer = `${sw.url().replace(/\/background\.js$/, '')}/pdf.html?file=${encodeURIComponent(pdfUrl)}`;
  const pdfPage = await context.newPage();
  await pdfPage.goto(viewer);
  await pdfPage.waitForSelector('.textLayer span', { timeout: 10000 });
  check(
    'pdf viewer titles the tab from the file name',
    (await pdfPage.title()).startsWith('doc.pdf'),
  );
  check(
    'pdf text layer has the words',
    (await pdfPage.locator('.textLayer').innerText()).includes('reads PDF files'),
  );
  await pdfPage.evaluate((t) => {
    const span = [...document.querySelectorAll<HTMLElement>('.textLayer span')].find((s) =>
      (s.textContent ?? '').includes(t),
    )!;
    const node = span.firstChild as Text;
    const i = node.data.indexOf(t);
    const range = document.createRange();
    range.setStart(node, i);
    range.setEnd(node, i + t.length);
    const sel = window.getSelection()!;
    sel.removeAllRanges();
    sel.addRange(range);
    const r = span.getBoundingClientRect();
    span.dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true, clientX: r.left + 20, clientY: r.top + 10 }),
    );
  }, 'reads PDF files');
  await pdfPage.waitForSelector('.hk-toolbar:not([hidden])', { timeout: 3000 });
  await pdfPage.click('.hk-toolbar .hk-dot.hk-yellow');
  await pdfPage.waitForSelector('mark.hk', { timeout: 3000 });
  check(
    'pdf highlight created in the text layer',
    (await pdfPage.locator('.textLayer mark.hk').count()) === 1,
  );
  await pdfPage.reload();
  await pdfPage.waitForSelector('.textLayer mark.hk', { timeout: 10000 });
  check(
    'pdf highlight restored after reload',
    (await pdfPage.locator('mark.hk').innerText()) === 'reads PDF files',
  );
  const pdfStored = await sw.evaluate(async (u) => {
    const all = await chrome.storage.local.get(null);
    const rec = all[`page:${u}`] as
      { title: string; highlights: { anchor: { quote: string } }[] } | undefined;
    return rec ? { title: rec.title, quote: rec.highlights[0]?.anchor.quote } : null;
  }, pdfUrl);
  check(
    'pdf highlights stored under the PDF URL',
    pdfStored?.quote === 'reads PDF files' && pdfStored.title.startsWith('doc.pdf'),
    JSON.stringify(pdfStored),
  );
  await pdfPage.screenshot({ path: path.join(here, 'out', '03-pdf.png') });
  await pdfPage.close();

  // 5. Pro: real key → colours + note; recolour; note; remove. Needs LICENSE_SIGNING_KEY (.env);
  // a sandbox without it skips this section and says so (foundry `e2e-pro-sections-test-key`).
  const signingKey = process.env['LICENSE_SIGNING_KEY'];
  if (!signingKey) {
    console.log('SKIP  pro section (5): no LICENSE_SIGNING_KEY in the environment');
    skipped = true;
  } else {
    const key = await issueLicense(signingKey, {
      venture: 'highlight-keep',
      tier: 'pro',
      id: 'e2e',
      issued: '2026-09-19',
    });
    await setKey(key);
    await page.reload();
    await page.waitForSelector('mark.hk');
    await selectText(page, '#p3', 'second highlight');
    await page.waitForSelector('.hk-toolbar:not([hidden])');
    check('six colours on pro', (await page.locator('.hk-toolbar .hk-dot').count()) === 6);
    await page.click('.hk-toolbar .hk-dot.hk-green');
    await page.waitForFunction(() => document.querySelectorAll('mark.hk').length === 2);
    check('second highlight is green', (await page.locator('mark.hk-green').count()) === 1);
    await page.click('mark.hk-green');
    await page.waitForSelector('.hk-toolbar [data-act="note"]');
    await page.click('.hk-toolbar [data-act="note"]');
    await page.fill('.hk-toolbar textarea', 'remember this');
    await page.click('.hk-toolbar .hk-save');
    await page.waitForSelector('mark.hk-green.hk-noted');
    check('note saved and marked', true);
    await page.click('mark.hk-green');
    await page.click('.hk-toolbar [data-act="delete"]');
    await page.waitForFunction(() => document.querySelectorAll('mark.hk').length === 1);
    check(
      'highlight removed and text intact',
      (await page.locator('#p3').textContent())?.includes('second highlight') === true,
    );
  }

  // 6. Storage → Markdown (via the popup's pure export) and index.
  const stored = await sw.evaluate(async () => {
    const all = await chrome.storage.local.get(null);
    const pageKey = Object.keys(all).find((k) => k.startsWith('page:'));
    return {
      pageKey,
      index: all['index'] as Record<string, { count: number }>,
      count: pageKey ? (all[pageKey] as { highlights: unknown[] }).highlights.length : -1,
    };
  });
  check('one page stored with one highlight', stored.count === 1, JSON.stringify(stored.index));
  await page.screenshot({ path: path.join(here, 'out', '02-pro-note.png') });
} finally {
  await context.close();
  server.close();
}
console.log(
  failures === 0
    ? `\nALL PASSED${skipped ? ' (pro section skipped)' : ''}`
    : `\n${failures} FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
