// Small XHTML helpers the chapters are written with: every chapter body is a well-formed fragment
// (the test checks balance and escaping), so prose never carries a raw `<` or `&`.

export interface Chapter {
  id: string;
  title: string;
  /** XHTML body fragment (well-formed; `&` written as `&amp;`). */
  body: string;
  /** Front matter (preface) is listed before the numbered chapters and never numbered. */
  frontMatter?: boolean;
  /** Back matter is listed after the main chapters in the table of contents. */
  backMatter?: boolean;
}

export const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** Paragraphs: each argument is one `<p>`; inline markup is allowed and must be well-formed. */
export const p = (...lines: string[]): string => lines.map((l) => `<p>${l}</p>`).join('\n');
export const h2 = (s: string): string => `<h2>${esc(s)}</h2>`;
export const h3 = (s: string): string => `<h3>${esc(s)}</h3>`;
export const ul = (items: string[]): string => `<ul>\n${items.map((i) => `<li>${i}</li>`).join('\n')}\n</ul>`;
export const ol = (items: string[]): string => `<ol>\n${items.map((i) => `<li>${i}</li>`).join('\n')}\n</ol>`;
/** Inline code: escaped. */
export const c = (s: string): string => `<code>${esc(s)}</code>`;
/** A code or file listing: escaped, preformatted. */
export const pre = (s: string): string => `<pre><code>${esc(s.replace(/^\n/, '').replace(/\n+$/, ''))}</code></pre>`;
export const tip = (s: string): string => `<div class="tip"><p>${s}</p></div>`;
export function table(head: string[], rows: string[][], caption?: string): string {
  const th = head.map((h) => `<th>${h}</th>`).join('');
  const tr = rows
    .map((r) => `<tr>${r.map((cell, i) => (i === 0 ? `<th scope="row">${cell}</th>` : `<td>${cell}</td>`)).join('')}</tr>`)
    .join('\n');
  return `<table>${caption ? `<caption>${caption}</caption>` : ''}<thead><tr>${th}</tr></thead><tbody>\n${tr}\n</tbody></table>`;
}
/** The visible text of a body fragment (tags dropped, entities decoded), for counts and checks. */
export function plainText(body: string): string {
  return body
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}
