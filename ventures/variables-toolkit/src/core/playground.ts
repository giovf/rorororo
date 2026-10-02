/**
 * Pure content of the free Community file "Variables Playground" — the pages, tokens, styles,
 * sample card and copy that `figma/playground.ts` renders inside Figma. Kept free of the figma
 * global so the invariants that make the exercises work can be unit-tested:
 *  - every hard-coded value in the Before card (bar one deliberate miss) matches a token, so
 *    exercise 1 finds them;
 *  - the paint styles pair into Light/Dark modes, so exercise 2 shows mode pairing;
 *  - the tokens marked unused are referenced by nothing, so exercise 3 reports exactly them.
 * The file is published by the owner from the Figma desktop app (PLAYGROUND.md).
 */
import { pairModes, type PaintStyleInfo } from './convert.js';

export const PLUGIN_URL = 'https://www.figma.com/community/plugin/1682711656065145288';
export const COMPARE_URL = 'https://apps.gankdat.com/figma-styles-to-variables.html';
export const SUPPORT_EMAIL = 'info@gankdat.com';
export const PLUGIN_NAME = 'Variables Toolkit';

export const COLLECTION_NAME = 'Playground tokens';
export const COVER_PAGE_NAME = 'Cover';

export interface ColorToken {
  name: string;
  hex: string;
  /** Bound by the After card, so the hygiene report counts it as used. */
  bound: boolean;
  /** Why an unbound token is in the file: hygiene bait. */
  role?: 'duplicate' | 'unused';
}

export interface NumberToken {
  name: string;
  value: number;
  bound: boolean;
  role?: 'unused';
}

export const COLOR_TOKENS: readonly ColorToken[] = [
  { name: 'color/brand/primary', hex: '#3B82F6', bound: true },
  { name: 'color/brand/danger', hex: '#EF4444', bound: true },
  { name: 'color/text/body', hex: '#0F172A', bound: true },
  { name: 'color/surface/card', hex: '#FFFFFF', bound: true },
  { name: 'color/border/subtle', hex: '#CBD5E1', bound: true },
  { name: 'color/brand/primary-copy', hex: '#3B82F6', bound: false, role: 'duplicate' },
  { name: 'unused/old-teal', hex: '#14B8A6', bound: false, role: 'unused' },
  { name: 'unused/legacy-grey', hex: '#9CA3AF', bound: false, role: 'unused' },
];

export const NUMBER_TOKENS: readonly NumberToken[] = [
  { name: 'space/2', value: 8, bound: true },
  { name: 'space/4', value: 16, bound: true },
  { name: 'radius/lg', value: 12, bound: true },
  { name: 'unused/space-7', value: 28, bound: false, role: 'unused' },
];

export interface CardChild {
  name: string;
  kind: 'rect' | 'text';
  hex: string;
  hidden?: boolean;
  /** Text content for `text` children. */
  text?: string;
}

export interface CardSpec {
  fill: string;
  stroke: string;
  padding: number;
  gap: number;
  radius: number;
  children: readonly CardChild[];
}

/** The deliberate non-match: a value no token carries, so the report's "unmatched" count is non-zero. */
export const NO_TOKEN_HEX = '#FF00FF';

/** A small UI card whose raw values all (bar one) equal a token's value. */
export const SAMPLE_CARD: CardSpec = {
  fill: '#FFFFFF',
  stroke: '#CBD5E1',
  padding: 16,
  gap: 8,
  radius: 12,
  children: [
    { name: 'Title (text fill = color/text/body)', kind: 'text', hex: '#0F172A', text: 'Invite your team' },
    { name: 'Primary button (fill = color/brand/primary)', kind: 'rect', hex: '#3B82F6' },
    { name: 'Danger button (fill = color/brand/danger)', kind: 'rect', hex: '#EF4444' },
    { name: 'Magenta badge (no token — stays raw on purpose)', kind: 'rect', hex: NO_TOKEN_HEX },
    { name: 'Hidden primary (found only with "Include hidden layers")', kind: 'rect', hex: '#3B82F6', hidden: true },
  ],
};

export interface PaintStyleSpec {
  name: string;
  hex: string;
}
export interface TextStyleSpec {
  name: string;
  family: string;
  style: string;
  size: number;
  lineHeight: number;
}
export interface EffectStyleSpec {
  name: string;
  color: { r: number; g: number; b: number; a: number };
  radius: number;
  y: number;
}

/** Light/Dark twins pair into one variable with two modes; Brand/Accent has no twin and stays single-mode. */
export const PAINT_STYLES: readonly PaintStyleSpec[] = [
  { name: 'Light/Brand/Primary', hex: '#3B82F6' },
  { name: 'Dark/Brand/Primary', hex: '#60A5FA' },
  { name: 'Light/Surface/Page', hex: '#F8FAFC' },
  { name: 'Dark/Surface/Page', hex: '#0F172A' },
  { name: 'Brand/Accent', hex: '#F59E0B' },
];
export const TEXT_STYLES: readonly TextStyleSpec[] = [
  { name: 'Body/Regular', family: 'Inter', style: 'Regular', size: 16, lineHeight: 24 },
  { name: 'Heading/Section', family: 'Inter', style: 'Bold', size: 24, lineHeight: 32 },
];
export const EFFECT_STYLES: readonly EffectStyleSpec[] = [{ name: 'Shadow/Card', color: { r: 0, g: 0, b: 0, a: 0.16 }, radius: 12, y: 4 }];

export interface PageSpec {
  name: string;
  heading: string;
  intro: string;
  steps: readonly string[];
  /** Closing line under the steps; honest about what the free tier covers. */
  footer: string;
}

const INSTALL_STEP = `Install ${PLUGIN_NAME} (free tier, link on this page) and open it from Plugins.`;

export const PAGES: readonly PageSpec[] = [
  {
    name: 'Start here',
    heading: 'Variables Playground',
    intro:
      'A practice file for the three jobs a Figma file needs when it moves onto variables: link hard-coded values to the variables you already have, convert styles to variables, and clean up unused variables. Duplicate this file, install the free plugin and work through pages 1 to 3 — nothing here is precious, break it.',
    steps: [
      'Duplicate this file to your drafts (Community files are read-only until you do).',
      INSTALL_STEP,
      'Page 1: link the raw colours, paddings, gap and radius of the Before card to the Playground tokens.',
      'Page 2: convert the Light/Dark paint styles, the text styles and the shadow into a new collection.',
      'Page 3: read the clean-up report; it names the two unused tokens, the unused spacing and the duplicate.',
    ],
    footer: `${PLUGIN_NAME} runs entirely inside your file: no network access, no account. Free tier: 25 links a day, colour styles to variables, the full clean-up report. $12 one-time unlocks the rest, 14-day refund. Questions: ${SUPPORT_EMAIL}.`,
  },
  {
    name: '1 · Link hard-coded values',
    heading: 'Link raw values to the tokens you already have',
    intro:
      'The Before card is built from raw hex colours and plain numbers that happen to equal a token in the "Playground tokens" collection. The After card is the same card with every value bound. Your job: make Before look like After in the layers panel.',
    steps: [
      'Select the Before card.',
      `Open ${PLUGIN_NAME} → Link, scope "Selection", and press Scan.`,
      'The report groups 5 colour sites and 9 number sites by the token they match; the magenta badge is listed as unmatched because no token carries that colour (on purpose).',
      'Tick "Include hidden layers" and scan again: the hidden primary rectangle joins the list.',
      'Press Link. Click any layer on the card: fills, strokes, padding, gap and radius now show the variable, not a value.',
    ],
    footer: 'This exercise needs about 15 links, well inside the 25 the free tier allows per day. Mode pairing, instances and widgets are covered on the plugin listing.',
  },
  {
    name: '2 · Styles to variables',
    heading: 'Turn styles into variables, keep every layer following',
    intro:
      'This file has five paint styles (Light/… and Dark/… twins plus one without a twin), two text styles and a shadow. The sample uses them. Converting creates variables in a collection you name and binds each style to its variable, so the sample keeps following the style, and the style now follows the variable.',
    steps: [
      `Open ${PLUGIN_NAME} → Styles to variables.`,
      'The preview pairs Light/Brand/Primary with Dark/Brand/Primary (and the two Surface/Page styles) into one variable each with Light and Dark modes; Brand/Accent becomes a single-mode variable.',
      'Name the collection (say "Tokens") and press Convert.',
      'Open Local variables: the new collection has a Light and a Dark mode. Switch the sample frame to Dark in the right-hand panel and watch the colours flip.',
      'Run it again: nothing is duplicated — existing variables with the same name are reused.',
    ],
    footer: 'Colour styles convert on the free tier. Text styles (size, line height, letter spacing to number variables) and effect styles are part of the $12 unlock.',
  },
  {
    name: '3 · Clean up unused variables',
    heading: 'Find what nothing uses',
    intro:
      'The Playground tokens collection has been seeded with hygiene problems: two colour tokens and one spacing token that nothing references, and a token that duplicates the value of color/brand/primary. The report finds them across every page of the file, not just the current one.',
    steps: [
      `Open ${PLUGIN_NAME} → Clean up.`,
      'Unused: unused/old-teal, unused/legacy-grey and unused/space-7 (after you finished page 1 — before that, every token is unused, which is the point of page 1).',
      'Duplicates: color/brand/primary and color/brand/primary-copy share #3B82F6.',
      'Aliases pointing at a deleted variable would be listed here too; this file has none.',
      'Tick the unused ones and press Delete to clean the collection.',
    ],
    footer: 'The report is free. Deleting from inside the plugin is part of the $12 unlock; on the free tier, delete the listed variables by hand in Local variables.',
  },
];

export interface CoverSpec {
  width: number;
  height: number;
  headline: readonly string[];
  sub: string;
  chips: readonly { label: string; hex: string }[];
  footnote: string;
}

/** 1920×960 is the Community thumbnail size; the frame is set as the file thumbnail before publishing. */
export const COVER: CoverSpec = {
  width: 1920,
  height: 960,
  headline: ['Styles → Variables', 'playground'],
  sub: 'Practice the three jobs: link hard-coded values, convert styles to variables, clean up unused variables. A free file for a free plugin tier.',
  chips: [
    { label: 'Link', hex: '#3B82F6' },
    { label: 'Styles to Variables', hex: '#34D399' },
    { label: 'Clean up', hex: '#FBBF24' },
  ],
  footnote: `Works with ${PLUGIN_NAME} · figma.com/community/plugin/1682711656065145288`,
};

// ---------- invariants (tested) ----------

export interface LinkableSummary {
  /** Colour sites whose hex equals a bound token, by token name. */
  colorMatches: Record<string, number>;
  /** Hex values with no token. */
  unmatchedColors: string[];
  /** Number fields whose value equals a token, by token name. */
  numberMatches: Record<string, number>;
  unmatchedNumbers: number[];
}

/** How the Link scan is expected to read the sample card (padding counts four sides, radius four corners). */
export function linkableSummary(card: CardSpec, colors: readonly ColorToken[], numbers: readonly NumberToken[]): LinkableSummary {
  const colorByHex = new Map<string, string>();
  for (const t of colors) if (!colorByHex.has(t.hex.toUpperCase())) colorByHex.set(t.hex.toUpperCase(), t.name);
  const numberByValue = new Map<number, string>();
  for (const t of numbers) if (!numberByValue.has(t.value)) numberByValue.set(t.value, t.name);

  const out: LinkableSummary = { colorMatches: {}, unmatchedColors: [], numberMatches: {}, unmatchedNumbers: [] };
  const color = (hex: string): void => {
    const name = colorByHex.get(hex.toUpperCase());
    if (name) out.colorMatches[name] = (out.colorMatches[name] ?? 0) + 1;
    else out.unmatchedColors.push(hex.toUpperCase());
  };
  const number = (value: number, sites: number): void => {
    const name = numberByValue.get(value);
    if (name) out.numberMatches[name] = (out.numberMatches[name] ?? 0) + sites;
    else out.unmatchedNumbers.push(value);
  };
  color(card.fill);
  color(card.stroke);
  for (const c of card.children) color(c.hex);
  number(card.padding, 4);
  number(card.gap, 1);
  number(card.radius, 4);
  return out;
}

/** Token names the hygiene report should list as unused once the After card is bound. */
export function expectedUnused(colors: readonly ColorToken[], numbers: readonly NumberToken[]): string[] {
  return [...colors, ...numbers].filter((t) => !t.bound).map((t) => t.name);
}

/** Groups of token names that share a value within a type (what the report calls duplicates). */
export function expectedDuplicates(colors: readonly ColorToken[], numbers: readonly NumberToken[]): string[][] {
  const groups = new Map<string, string[]>();
  for (const t of colors) groups.set(`COLOR|${t.hex.toUpperCase()}`, [...(groups.get(`COLOR|${t.hex.toUpperCase()}`) ?? []), t.name]);
  for (const t of numbers) groups.set(`FLOAT|${t.value}`, [...(groups.get(`FLOAT|${t.value}`) ?? []), t.name]);
  return [...groups.values()].filter((g) => g.length > 1);
}

/** Runs the converter's own pairing over the paint styles so the page-2 copy stays true. */
export function expectedModes(styles: readonly PaintStyleSpec[]): { modes: string[]; pairedRemainders: string[]; single: string[] } {
  const infos: PaintStyleInfo[] = styles.map((s, i) => ({ kind: 'paint', id: `s${i}`, name: s.name, paintCount: 1, solid: { r: 0, g: 0, b: 0, a: 1 } }));
  const { modes, groups } = pairModes(infos);
  const paired = new Set([...groups.values()].flatMap((g) => [...g.values()].map((s) => s.name)));
  return { modes, pairedRemainders: [...groups.keys()], single: styles.map((s) => s.name).filter((n) => !paired.has(n)) };
}
