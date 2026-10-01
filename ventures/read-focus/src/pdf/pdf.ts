/**
 * The extension's own PDF reader: fetches the PDF named in ?file= (needs the site's host
 * permission, granted from the popup), reflows each page's text into real paragraphs and lets
 * content.js — loaded after this script, keyed to the PDF's host — bold, rule, focus and
 * re-font them as on any web page. Free: the first page; the unlock reads the whole file.
 */
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { tierForKey } from '../core/license.js';
import { documentUrl, FREE_PAGES, paragraphs, pdfTitle, type TextRun } from '../core/pdf.js';
import { loadSettings } from '../storage.js';

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('pdf.worker.mjs');

function fail(message: string, file: string): void {
  const el = $('error');
  el.replaceChildren();
  el.append(message, ' ', Object.assign(document.createElement('code'), { textContent: file }));
  el.hidden = false;
  $('status').textContent = '';
}

async function renderPage(pdf: PDFDocumentProxy, n: number): Promise<void> {
  const page = await pdf.getPage(n);
  const content = await page.getTextContent();
  const runs: TextRun[] = content.items.flatMap((it) => ('str' in it && 'transform' in it ? [it] : []));
  const section = document.createElement('section');
  section.className = 'page';
  section.dataset['page'] = String(n);
  const h = document.createElement('h2');
  h.className = 'rf-pageno';
  h.textContent = `Page ${n} of ${pdf.numPages}`;
  section.append(h);
  const paras = paragraphs(runs);
  if (paras.length === 0) {
    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = '(no text on this page — a scan or an image)';
    section.append(p);
  }
  for (const text of paras) {
    const p = document.createElement('p');
    p.textContent = text;
    section.append(p);
  }
  $('pages').appendChild(section);
}

async function main(): Promise<void> {
  const file = documentUrl(location.href);
  if (file === location.href) {
    fail('No PDF to show. Open a PDF on the web, then choose "Read this PDF" in the ReadFocus popup.', '');
    return;
  }
  const host = new URL(file).hostname;
  $('name').textContent = file;
  $<HTMLAnchorElement>('original').href = file;
  $('status').textContent = 'Loading…';
  let pdf: PDFDocumentProxy;
  try {
    if (!(await chrome.permissions.contains({ origins: [`${new URL(file).origin}/*`] }))) throw new Error('permission');
    pdf = await getDocument({ url: file, withCredentials: true }).promise;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    fail(
      msg === 'permission' || /cors|fetch|network|unexpected/i.test(msg)
        ? `ReadFocus is not allowed to read PDFs on ${host} yet. Open the PDF in the browser, click the ReadFocus icon and choose "Read this PDF" so the browser can grant access, then come back to`
        : `Could not open this PDF (${msg}):`,
      file,
    );
    return;
  }
  const meta = await pdf.getMetadata().catch(() => null);
  const info = (meta?.info ?? {}) as { Title?: string };
  const title = pdfTitle(info.Title, file);
  document.title = `${title} — ReadFocus`;
  $('name').textContent = title;
  const tier = await tierForKey((await loadSettings()).licenseKey);
  const last = tier === 'pro' ? pdf.numPages : Math.min(FREE_PAGES, pdf.numPages);
  for (let n = 1; n <= last; n++) {
    $('status').textContent = `Page ${n} of ${pdf.numPages}…`;
    await renderPage(pdf, n);
  }
  $('status').textContent = last === pdf.numPages ? `${pdf.numPages} page${pdf.numPages === 1 ? '' : 's'}` : `first ${last} of ${pdf.numPages} pages`;
  $('unlock').hidden = last === pdf.numPages;
  const page = Number(new URL(location.href).hash.match(/page=(\d+)/)?.[1] ?? 0);
  if (page > 0) document.querySelector(`.page[data-page="${page}"]`)?.scrollIntoView();
}
void main();
