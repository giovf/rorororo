/**
 * The extension's own PDF viewer: fetches the PDF named in ?file= (needs the site's host
 * permission, granted from the popup), draws each page on a canvas and lays PDF.js's text
 * layer over it. content.js, loaded after this script, treats that text layer like any page:
 * it stores highlights under the PDF's own URL (core/pdf.ts documentUrl) and restores them
 * once the text is there.
 */
import { getDocument, GlobalWorkerOptions, TextLayer, type PDFDocumentProxy, type PDFPageProxy } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { documentUrl, fitScale, pdfTitle } from '../core/pdf.js';

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('pdf.worker.mjs');

function fail(message: string, file: string): void {
  const el = $('error');
  el.replaceChildren();
  el.append(message, ' ', Object.assign(document.createElement('code'), { textContent: file }));
  el.hidden = false;
  $('status').textContent = '';
}

/** PDF.js renders one <span> per text run and a <br> at line ends; the highlighter's text index
 *  concatenates text nodes, so a space node after each line end and page keeps words apart. */
function glue(layer: HTMLElement): void {
  for (const br of layer.querySelectorAll('br')) br.after(document.createTextNode(' '));
  layer.append(document.createTextNode(' '));
}

async function renderPage(pdf: PDFDocumentProxy, n: number, scale: number, draw: IntersectionObserver): Promise<void> {
  const page: PDFPageProxy = await pdf.getPage(n);
  const viewport = page.getViewport({ scale });
  const section = document.createElement('section');
  section.className = 'page';
  section.dataset['page'] = String(n);
  section.style.width = `${Math.floor(viewport.width)}px`;
  section.style.height = `${Math.floor(viewport.height)}px`;
  section.style.setProperty('--scale-factor', String(scale));
  section.style.setProperty('--total-scale-factor', String(scale));
  const canvas = document.createElement('canvas');
  const layer = document.createElement('div');
  layer.className = 'textLayer';
  section.append(canvas, layer);
  $('pages').appendChild(section);
  await new TextLayer({ textContentSource: page.streamTextContent(), container: layer, viewport }).render();
  glue(layer);
  // Canvases are drawn when scrolled into view; the text layer is there from the start so
  // highlights restore and the whole document is searchable/selectable.
  let drawn = false;
  draw.observe(section);
  section.addEventListener('hk-draw', () => {
    if (drawn) return;
    drawn = true;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    void page.render({ canvas, canvasContext: ctx, viewport, transform: dpr === 1 ? undefined : [dpr, 0, 0, dpr, 0, 0] }).promise.catch(() => undefined);
  });
}

async function main(): Promise<void> {
  const file = documentUrl(location.href);
  if (file === location.href) {
    fail('No PDF to show. Open a PDF on the web, then choose "Highlight this PDF" in the Highlight Keep popup.', '');
    return;
  }
  const host = new URL(file).hostname;
  $('name').textContent = file;
  $('status').textContent = 'Loading…';
  let pdf: PDFDocumentProxy;
  try {
    if (!(await chrome.permissions.contains({ origins: [`${new URL(file).origin}/*`] }))) throw new Error('permission');
    pdf = await getDocument({ url: file, withCredentials: true }).promise;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    fail(
      msg === 'permission' || /cors|fetch|network|unexpected/i.test(msg)
        ? `Highlight Keep is not allowed to read PDFs on ${host} yet. Open the PDF in the browser, click the Highlight Keep icon and choose "Highlight this PDF" so the browser can grant access, then come back to`
        : `Could not open this PDF (${msg}):`,
      file,
    );
    return;
  }
  const meta = await pdf.getMetadata().catch(() => null);
  const info = (meta?.info ?? {}) as { Title?: string };
  const title = pdfTitle(info.Title, file);
  document.title = title;
  $('name').textContent = title;
  const first = await pdf.getPage(1);
  const scale = fitScale(first.getViewport({ scale: 1 }).width, window.innerWidth);
  const draw = new IntersectionObserver(
    (entries) => {
      for (const en of entries) if (en.isIntersecting) en.target.dispatchEvent(new Event('hk-draw'));
    },
    { rootMargin: '600px 0px' },
  );
  for (let n = 1; n <= pdf.numPages; n++) {
    $('status').textContent = `Page ${n} of ${pdf.numPages}…`;
    await renderPage(pdf, n, scale, draw);
  }
  $('status').textContent = `${pdf.numPages} page${pdf.numPages === 1 ? '' : 's'}`;
  const page = Number(new URL(location.href).hash.match(/page=(\d+)/)?.[1] ?? 0);
  if (page > 0) document.querySelector(`.page[data-page="${page}"]`)?.scrollIntoView();
}
void main();
