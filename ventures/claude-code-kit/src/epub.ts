// Packages the chapters into an EPUB 3 file with JSZip (the Kindle guide's packager generalised,
// ventures/tax-workbook/src/kindle/epub.ts): `mimetype` first and stored, META-INF/container.xml,
// the OPF package document, an EPUB 3 nav document plus an NCX for older readers, one XHTML file
// per chapter, a stylesheet and the cover image. Leanpub takes a finished EPUB and PDF as uploads.
import JSZip from 'jszip';
import { BOOK, chapters } from './content.ts';
import type { Chapter } from './content/helpers.ts';

export const xmlEsc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const STYLESHEET = `body { font-family: serif; line-height: 1.5; margin: 0 1em; }
h1 { font-size: 1.8em; text-align: center; margin: 2em 0 0.5em; }
h2 { font-size: 1.4em; margin: 1.5em 0 0.6em; page-break-after: avoid; }
h3 { font-size: 1.1em; margin: 1.2em 0 0.4em; page-break-after: avoid; }
p { margin: 0 0 0.8em; text-align: left; }
p.subtitle { text-align: center; font-style: italic; color: #444; }
p.edition { text-align: center; font-size: 0.9em; color: #444; margin-top: 2em; }
ul, ol { margin: 0 0 0.9em 1.2em; padding: 0; }
li { margin-bottom: 0.35em; }
code { font-family: monospace; font-size: 0.92em; }
pre { font-family: monospace; font-size: 0.82em; line-height: 1.35; white-space: pre-wrap; word-wrap: break-word; background: #f4f4f4; border-left: 3px solid #999; padding: 0.5em 0.7em; margin: 0.6em 0 1em; }
table { border-collapse: collapse; width: 100%; margin: 0.6em 0 1.1em; font-size: 0.9em; }
caption { caption-side: bottom; font-size: 0.85em; color: #444; padding-top: 0.4em; text-align: left; }
th, td { border-bottom: 1px solid #bbb; padding: 0.35em 0.4em; vertical-align: top; text-align: left; }
th[scope="row"] { font-weight: normal; }
thead th { border-bottom: 2px solid #333; font-weight: bold; }
.tip { border-left: 3px solid #2A4365; padding: 0.2em 0.8em; margin: 0.9em 0 1.1em; background: #f1f5fb; }
.tip p { margin: 0.3em 0; }
.toc li { list-style: none; margin-bottom: 0.5em; }
`;

export function xhtml(title: string, body: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${BOOK.language}" lang="${BOOK.language}">
<head>
<meta charset="UTF-8"/>
<title>${xmlEsc(title)}</title>
<link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
${body}
</body>
</html>
`;
}

export function titlePage(): string {
  return xhtml(
    BOOK.title,
    `<section epub:type="titlepage">
<h1>${xmlEsc(BOOK.title)}</h1>
<p class="subtitle">${xmlEsc(BOOK.subtitle)}</p>
<p class="edition">${xmlEsc(BOOK.author)}<br/>${xmlEsc(BOOK.edition)}</p>
</section>`,
  );
}

/** The copyright page's paragraphs (plain text), shared by the EPUB and the PDF. */
export function copyrightParagraphs(): string[] {
  return [
    `${BOOK.title}: ${BOOK.subtitle}`,
    `${BOOK.edition}. Published by ${BOOK.publisher}.`,
    `Text copyright © 2026 ${BOOK.publisher}. The files in the accompanying Extras are released under the MIT licence; the book's text is not, except for brief quotations in a review.`,
    'This book describes one software operation as it ran between September and November 2026. Claude Code, GitHub, Cloudflare and the other products named are trademarks of their owners; none of them endorses this book. Nothing here is legal, tax or financial advice.',
    'How this book was written is stated in full in the preface: it was drafted by the operation it describes, from its own logs and documents, and curated by its owner before publication.',
  ];
}

export function copyrightPage(): string {
  return xhtml(
    'Copyright',
    `<section epub:type="copyright-page">
${copyrightParagraphs()
  .map((t) => `<p>${xmlEsc(t)}</p>`)
  .join('\n')}
</section>`,
  );
}

export function navDocument(chs: Chapter[]): string {
  const li = (ch: Chapter): string => `<li><a href="${ch.id}.xhtml">${xmlEsc(ch.title)}</a></li>`;
  return xhtml(
    'Contents',
    `<nav epub:type="toc" id="toc" class="toc">
<h2>Contents</h2>
<ol>
<li><a href="title.xhtml">Title page</a></li>
${chs.map(li).join('\n')}
</ol>
</nav>
<nav epub:type="landmarks" hidden="hidden">
<ol>
<li><a epub:type="cover" href="cover.xhtml">Cover</a></li>
<li><a epub:type="toc" href="nav.xhtml">Table of contents</a></li>
<li><a epub:type="bodymatter" href="${chs.find((ch) => !ch.frontMatter)?.id ?? chs[0]?.id ?? 'preface'}.xhtml">Start of content</a></li>
</ol>
</nav>`,
  );
}

export function ncx(chs: Chapter[]): string {
  const points = chs
    .map(
      (ch, i) =>
        `<navPoint id="np-${ch.id}" playOrder="${i + 2}"><navLabel><text>${xmlEsc(ch.title)}</text></navLabel><content src="${ch.id}.xhtml"/></navPoint>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
<head>
<meta name="dtb:uid" content="${BOOK.identifier}"/>
<meta name="dtb:depth" content="1"/>
<meta name="dtb:totalPageCount" content="0"/>
<meta name="dtb:maxPageNumber" content="0"/>
</head>
<docTitle><text>${xmlEsc(BOOK.title)}</text></docTitle>
<navMap>
<navPoint id="np-title" playOrder="1"><navLabel><text>Title page</text></navLabel><content src="title.xhtml"/></navPoint>
${points}
</navMap>
</ncx>
`;
}

export function coverPage(): string {
  return xhtml(
    'Cover',
    `<section epub:type="cover" style="text-align:center; margin:0; padding:0;">
<img src="cover.jpg" alt="${xmlEsc(BOOK.title)} — ${xmlEsc(BOOK.subtitle)}" style="max-width:100%; height:auto;"/>
</section>`,
  );
}

export function packageDocument(chs: Chapter[], modified: string): string {
  const items = chs.map((ch) => `<item id="${ch.id}" href="${ch.id}.xhtml" media-type="application/xhtml+xml"/>`).join('\n');
  const spine = chs.map((ch) => `<itemref idref="${ch.id}"/>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id" xml:lang="${BOOK.language}">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="pub-id">${BOOK.identifier}</dc:identifier>
<dc:title id="title">${xmlEsc(BOOK.title)}</dc:title>
<meta refines="#title" property="title-type">main</meta>
<dc:title id="subtitle">${xmlEsc(BOOK.subtitle)}</dc:title>
<meta refines="#subtitle" property="title-type">subtitle</meta>
<dc:creator id="creator">${xmlEsc(BOOK.author)}</dc:creator>
<meta refines="#creator" property="role" scheme="marc:relators">aut</meta>
<dc:publisher>${xmlEsc(BOOK.publisher)}</dc:publisher>
<dc:language>${BOOK.language}</dc:language>
<dc:date>2026-11-05</dc:date>
<dc:subject>Software engineering — Automation</dc:subject>
<dc:subject>Artificial intelligence — Agents — Operations</dc:subject>
<dc:description>${xmlEsc(BOOK.description)}</dc:description>
<meta property="dcterms:modified">${modified}</meta>
<meta name="cover" content="cover-image"/>
</metadata>
<manifest>
<item id="cover-image" href="cover.jpg" media-type="image/jpeg" properties="cover-image"/>
<item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>
<item id="title-page" href="title.xhtml" media-type="application/xhtml+xml"/>
<item id="copyright" href="copyright.xhtml" media-type="application/xhtml+xml"/>
<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
<item id="css" href="styles.css" media-type="text/css"/>
${items}
</manifest>
<spine toc="ncx">
<itemref idref="cover" linear="no"/>
<itemref idref="title-page"/>
<itemref idref="copyright"/>
<itemref idref="nav"/>
${spine}
</spine>
</package>
`;
}

export const CONTAINER_XML = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles>
<rootfile full-path="OEBPS/package.opf" media-type="application/oebps-package+xml"/>
</rootfiles>
</container>
`;

/** Every text file of the book, keyed by its path inside the archive (the cover image is added by `buildEpub`). */
export function epubFiles(modified = '2026-11-05T00:00:00Z'): Map<string, string> {
  const chs = chapters();
  const text = new Map<string, string>();
  text.set('META-INF/container.xml', CONTAINER_XML);
  text.set('OEBPS/package.opf', packageDocument(chs, modified));
  text.set('OEBPS/nav.xhtml', navDocument(chs));
  text.set('OEBPS/toc.ncx', ncx(chs));
  text.set('OEBPS/styles.css', STYLESHEET);
  text.set('OEBPS/cover.xhtml', coverPage());
  text.set('OEBPS/title.xhtml', titlePage());
  text.set('OEBPS/copyright.xhtml', copyrightPage());
  for (const ch of chs) text.set(`OEBPS/${ch.id}.xhtml`, xhtml(ch.title, ch.body));
  return text;
}

/** The finished EPUB as bytes. `mimetype` is the first entry and is stored uncompressed, as the spec requires. */
export async function buildEpub(coverJpeg: Uint8Array, modified?: string): Promise<Uint8Array> {
  const zip = new JSZip();
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
  for (const [path, body] of epubFiles(modified)) zip.file(path, body, { compression: 'DEFLATE' });
  zip.file('OEBPS/cover.jpg', coverJpeg, { compression: 'STORE' });
  return zip.generateAsync({ type: 'uint8array', mimeType: 'application/epub+zip', compression: 'DEFLATE', platform: 'UNIX' });
}
