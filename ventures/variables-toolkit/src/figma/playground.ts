/**
 * Builds the free Community file "Variables Playground" inside the current Figma file from the
 * spec in core/playground.ts: a cover page sized as the Community thumbnail, a start page and
 * one page per exercise (link, convert, clean up), each with a how-to panel and sample layers.
 * Development-only menu command ("playground"); the owner runs it once in an empty file and
 * publishes the result (PLAYGROUND.md). Removed from release builds like the demo command.
 */
import {
  COLLECTION_NAME,
  COLOR_TOKENS,
  COMPARE_URL,
  COVER,
  COVER_PAGE_NAME,
  EFFECT_STYLES,
  NUMBER_TOKENS,
  PAGES,
  PAINT_STYLES,
  PLUGIN_NAME,
  PLUGIN_URL,
  SAMPLE_CARD,
  TEXT_STYLES,
  type CardSpec,
  type PageSpec,
} from '../core/playground.js';
import { rgba, solid } from './paint.js';

const REGULAR: FontName = { family: 'Inter', style: 'Regular' };
const BOLD: FontName = { family: 'Inter', style: 'Bold' };
const NAVY = '#0F172A';
const INK = '#0F172A';
const MUTED = '#475569';
const PANEL = '#F8FAFC';
const LINK = '#2563EB';
const PANEL_WIDTH = 640;

interface Tokens {
  colors: Map<string, Variable>;
  numbers: Map<string, Variable>;
}

interface TextOptions {
  size: number;
  bold?: boolean;
  color?: string;
  width?: number;
  /** Substring to turn into a hyperlink. */
  link?: { text: string; url: string };
}

async function loadFonts(): Promise<void> {
  await Promise.all([figma.loadFontAsync(REGULAR), figma.loadFontAsync(BOLD)]);
}

function text(parent: BaseNode & ChildrenMixin, chars: string, o: TextOptions): TextNode {
  const t = figma.createText();
  t.fontName = o.bold ? BOLD : REGULAR;
  t.characters = chars;
  t.fontSize = o.size;
  t.lineHeight = { unit: 'PIXELS', value: Math.round(o.size * 1.4) };
  t.fills = [solid(o.color ?? INK)];
  if (o.width !== undefined) {
    t.textAutoResize = 'HEIGHT';
    t.resize(o.width, t.height);
  }
  if (o.link) {
    const start = chars.indexOf(o.link.text);
    if (start >= 0) {
      const end = start + o.link.text.length;
      t.setRangeHyperlink(start, end, { type: 'URL', value: o.link.url });
      t.setRangeTextDecoration(start, end, 'UNDERLINE');
      t.setRangeFills(start, end, [solid(LINK)]);
    }
  }
  parent.appendChild(t);
  return t;
}

function column(name: string, width: number, gap: number, padding: number): FrameNode {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = 'VERTICAL';
  f.itemSpacing = gap;
  f.paddingTop = f.paddingRight = f.paddingBottom = f.paddingLeft = padding;
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'FIXED';
  f.resize(width, f.height);
  f.cornerRadius = 16;
  f.fills = [solid(PANEL)];
  f.strokes = [solid('#E2E8F0')];
  f.strokeWeight = 1;
  return f;
}

/** The how-to panel every exercise page carries: heading, intro, numbered steps, footer, links. */
function howTo(page: PageNode, spec: PageSpec, x: number, y: number): FrameNode {
  const panel = column(`How to — ${spec.name}`, PANEL_WIDTH, 16, 32);
  panel.x = x;
  panel.y = y;
  page.appendChild(panel);
  const inner = PANEL_WIDTH - 64;
  text(panel, spec.heading, { size: 28, bold: true, width: inner });
  text(panel, spec.intro, { size: 16, color: MUTED, width: inner });
  spec.steps.forEach((step, i) => text(panel, `${i + 1}. ${step}`, { size: 16, width: inner }));
  text(panel, spec.footer, { size: 14, color: MUTED, width: inner });
  text(panel, `Get ${PLUGIN_NAME} on Figma Community`, { size: 16, bold: true, width: inner, link: { text: `Get ${PLUGIN_NAME} on Figma Community`, url: PLUGIN_URL } });
  text(panel, 'How it compares with Styles & Variables Organizer and the free converters', {
    size: 14,
    color: MUTED,
    width: inner,
    link: { text: 'How it compares', url: COMPARE_URL },
  });
  return panel;
}

function createTokens(): Tokens {
  const collection = figma.variables.createVariableCollection(COLLECTION_NAME);
  const colors = new Map<string, Variable>();
  const numbers = new Map<string, Variable>();
  for (const t of COLOR_TOKENS) {
    const v = figma.variables.createVariable(t.name, collection, 'COLOR');
    v.setValueForMode(collection.defaultModeId, rgba(t.hex));
    colors.set(t.name, v);
  }
  for (const t of NUMBER_TOKENS) {
    const v = figma.variables.createVariable(t.name, collection, 'FLOAT');
    v.setValueForMode(collection.defaultModeId, t.value);
    numbers.set(t.name, v);
  }
  return { colors, numbers };
}

function createStyles(): { paint: PaintStyle[]; text: TextStyle[]; effect: EffectStyle[] } {
  const paint = PAINT_STYLES.map((s) => {
    const style = figma.createPaintStyle();
    style.name = s.name;
    style.paints = [solid(s.hex)];
    return style;
  });
  const text = TEXT_STYLES.map((s) => {
    const style = figma.createTextStyle();
    style.name = s.name;
    style.fontName = { family: s.family, style: s.style };
    style.fontSize = s.size;
    style.lineHeight = { unit: 'PIXELS', value: s.lineHeight };
    return style;
  });
  const effect = EFFECT_STYLES.map((s) => {
    const style = figma.createEffectStyle();
    style.name = s.name;
    style.effects = [{ type: 'DROP_SHADOW', color: s.color, offset: { x: 0, y: s.y }, radius: s.radius, spread: 0, visible: true, blendMode: 'NORMAL' }];
    return style;
  });
  return { paint, text, effect };
}

const colorVariableFor = (tokens: Tokens, hex: string): Variable | undefined => {
  const token = COLOR_TOKENS.find((t) => t.bound && t.hex.toUpperCase() === hex.toUpperCase());
  return token ? tokens.colors.get(token.name) : undefined;
};
const numberVariableFor = (tokens: Tokens, value: number): Variable | undefined => {
  const token = NUMBER_TOKENS.find((t) => t.bound && t.value === value);
  return token ? tokens.numbers.get(token.name) : undefined;
};

function boundPaint(hex: string, variable: Variable | undefined): Paint {
  const paint = solid(hex);
  return variable ? figma.variables.setBoundVariableForPaint(paint, 'color', variable) : paint;
}

/** The sample card; with `tokens` every matching value is bound (the After card), without, raw (Before). */
function card(name: string, spec: CardSpec, tokens?: Tokens): FrameNode {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = 'VERTICAL';
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'FIXED';
  f.resize(280, f.height);
  f.paddingTop = f.paddingRight = f.paddingBottom = f.paddingLeft = spec.padding;
  f.itemSpacing = spec.gap;
  f.cornerRadius = spec.radius;
  f.fills = [boundPaint(spec.fill, tokens && colorVariableFor(tokens, spec.fill))];
  f.strokes = [boundPaint(spec.stroke, tokens && colorVariableFor(tokens, spec.stroke))];
  f.strokeWeight = 1;
  if (tokens) {
    const pad = numberVariableFor(tokens, spec.padding);
    const gap = numberVariableFor(tokens, spec.gap);
    const radius = numberVariableFor(tokens, spec.radius);
    if (pad) for (const field of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'] as const) f.setBoundVariable(field, pad);
    if (gap) f.setBoundVariable('itemSpacing', gap);
    if (radius) for (const field of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'] as const) f.setBoundVariable(field, radius);
  }
  for (const c of spec.children) {
    const paint = boundPaint(c.hex, tokens && colorVariableFor(tokens, c.hex));
    if (c.kind === 'text') {
      const t = text(f, c.text ?? c.name, { size: 18, bold: true });
      t.name = c.name;
      t.fills = [paint];
      t.layoutSizingHorizontal = 'FILL';
    } else {
      const r = figma.createRectangle();
      r.name = c.name;
      r.resize(248, 40);
      r.fills = [paint];
      f.appendChild(r);
      r.layoutSizingHorizontal = 'FILL';
      if (c.hidden) r.visible = false;
    }
  }
  return f;
}

function label(page: PageNode, chars: string, x: number, y: number): void {
  const t = text(page, chars, { size: 14, bold: true, color: MUTED });
  t.x = x;
  t.y = y;
}

async function buildCover(): Promise<PageNode> {
  const empty = figma.currentPage.children.length === 0;
  const page = empty ? figma.currentPage : figma.createPage();
  page.name = COVER_PAGE_NAME;
  await figma.setCurrentPageAsync(page);
  const frame = figma.createFrame();
  frame.name = 'Cover (set as thumbnail)';
  frame.resize(COVER.width, COVER.height);
  frame.fills = [solid(NAVY)];
  page.appendChild(frame);
  const headline = text(frame, COVER.headline.join('\n'), { size: 112, bold: true, color: '#E2E8F0', width: 1000 });
  headline.x = 160;
  headline.y = 180;
  const sub = text(frame, COVER.sub, { size: 34, color: '#94A3B8', width: 980 });
  sub.x = 160;
  sub.y = headline.y + headline.height + 40;
  let x = 160;
  const chipY = sub.y + sub.height + 56;
  for (const chip of COVER.chips) {
    const c = figma.createFrame();
    c.name = `Chip ${chip.label}`;
    c.layoutMode = 'HORIZONTAL';
    c.primaryAxisSizingMode = 'AUTO';
    c.counterAxisSizingMode = 'AUTO';
    c.paddingTop = c.paddingBottom = 14;
    c.paddingLeft = c.paddingRight = 28;
    c.cornerRadius = 32;
    c.fills = [solid(chip.hex)];
    frame.appendChild(c);
    text(c, chip.label, { size: 30, bold: true, color: NAVY });
    c.x = x;
    c.y = chipY;
    x += c.width + 20;
  }
  const foot = text(frame, COVER.footnote, { size: 26, color: '#94A3B8', width: 1600 });
  foot.x = 160;
  foot.y = COVER.height - 100;
  figma.viewport.scrollAndZoomIntoView([frame]);
  return page;
}

async function buildPage(spec: PageSpec): Promise<PageNode> {
  const page = figma.createPage();
  page.name = spec.name;
  await figma.setCurrentPageAsync(page);
  return page;
}

async function buildStart(spec: PageSpec): Promise<void> {
  const page = await buildPage(spec);
  howTo(page, spec, 0, 0);
}

async function buildLink(spec: PageSpec, tokens: Tokens): Promise<void> {
  const page = await buildPage(spec);
  howTo(page, spec, 0, 0);
  label(page, 'BEFORE — raw values (select me, then Scan)', PANEL_WIDTH + 80, 0);
  const before = card('Before (raw values)', SAMPLE_CARD);
  before.x = PANEL_WIDTH + 80;
  before.y = 32;
  page.appendChild(before);
  label(page, 'AFTER — every value bound to a token', PANEL_WIDTH + 80 + 280 + 60, 0);
  const after = card('After (bound to Playground tokens)', SAMPLE_CARD, tokens);
  after.x = PANEL_WIDTH + 80 + 280 + 60;
  after.y = 32;
  page.appendChild(after);
}

async function buildStyles(spec: PageSpec, styles: { paint: PaintStyle[]; text: TextStyle[]; effect: EffectStyle[] }): Promise<void> {
  const page = await buildPage(spec);
  howTo(page, spec, 0, 0);
  label(page, 'SAMPLE — uses the Light/… styles; after converting, switch its mode to Dark', PANEL_WIDTH + 80, 0);
  const sample = column('Sample (styled)', 360, 12, 24);
  sample.x = PANEL_WIDTH + 80;
  sample.y = 32;
  page.appendChild(sample);
  const pageStyle = styles.paint.find((s) => s.name === 'Light/Surface/Page');
  const primary = styles.paint.find((s) => s.name === 'Light/Brand/Primary');
  const accent = styles.paint.find((s) => s.name === 'Brand/Accent');
  const heading = styles.text.find((s) => s.name === 'Heading/Section');
  const body = styles.text.find((s) => s.name === 'Body/Regular');
  const shadow = styles.effect[0];
  if (pageStyle) await sample.setFillStyleIdAsync(pageStyle.id);
  if (shadow) await sample.setEffectStyleIdAsync(shadow.id);
  const h = text(sample, 'Section heading', { size: 24, bold: true });
  if (heading) await h.setTextStyleIdAsync(heading.id);
  h.layoutSizingHorizontal = 'FILL';
  const b = text(sample, 'Body text set in Body/Regular. Convert the styles, then flip this frame to Dark.', { size: 16, width: 312 });
  if (body) await b.setTextStyleIdAsync(body.id);
  b.layoutSizingHorizontal = 'FILL';
  const button = figma.createRectangle();
  button.name = 'Button (fill = Light/Brand/Primary)';
  button.resize(312, 44);
  button.cornerRadius = 8;
  sample.appendChild(button);
  if (primary) await button.setFillStyleIdAsync(primary.id);
  button.layoutSizingHorizontal = 'FILL';
  const badge = figma.createRectangle();
  badge.name = 'Badge (fill = Brand/Accent, no Dark twin)';
  badge.resize(120, 28);
  badge.cornerRadius = 14;
  sample.appendChild(badge);
  if (accent) await badge.setFillStyleIdAsync(accent.id);
}

async function buildCleanup(spec: PageSpec): Promise<void> {
  const page = await buildPage(spec);
  howTo(page, spec, 0, 0);
  const table = column('Playground tokens — what the report will say', 420, 8, 24);
  table.x = PANEL_WIDTH + 80;
  table.y = 0;
  page.appendChild(table);
  text(table, COLLECTION_NAME, { size: 18, bold: true, width: 372 });
  for (const t of COLOR_TOKENS) {
    const note = t.role === 'unused' ? 'unused' : t.role === 'duplicate' ? 'duplicate of color/brand/primary, unused' : 'used by the After card on page 1';
    text(table, `${t.name}  ${t.hex}  — ${note}`, { size: 13, color: t.bound ? MUTED : INK, width: 372 });
  }
  for (const t of NUMBER_TOKENS) {
    const note = t.role === 'unused' ? 'unused' : 'used by the After card on page 1';
    text(table, `${t.name}  ${t.value}  — ${note}`, { size: 13, color: t.bound ? MUTED : INK, width: 372 });
  }
}

/** Builds the whole playground file; returns the message shown when the plugin closes. */
export async function createPlaygroundFile(): Promise<string> {
  await loadFonts();
  const tokens = createTokens();
  const styles = createStyles();
  const cover = await buildCover();
  const [start, link, convert, cleanup] = PAGES;
  if (!start || !link || !convert || !cleanup) throw new Error('playground spec needs four pages');
  await buildStart(start);
  await buildLink(link, tokens);
  await buildStyles(convert, styles);
  await buildCleanup(cleanup);
  await figma.setCurrentPageAsync(cover);
  return `Playground built: ${PAGES.length + 1} pages, ${COLOR_TOKENS.length + NUMBER_TOKENS.length} tokens, ${PAINT_STYLES.length + TEXT_STYLES.length + EFFECT_STYLES.length} styles. Right-click the Cover frame → Set as thumbnail, then publish (PLAYGROUND.md).`;
}
