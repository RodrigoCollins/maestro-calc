import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { esCommon } from '@maestro-calc/i18n/catalogs/es/common';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ROUTES } from '../routing/routes.ts';
import { CALCULATOR_PAGES } from '../routing/templates.ts';
import { buildClient } from './__testing__/client-build.ts';
import { entrySourceOf, reaches } from './__testing__/client-graph.ts';
import { expectWithinJsBudget } from './__testing__/js-budget.ts';
import { fromRoot } from './root.ts';

const FIRST = CALCULATOR_PAGES[0];
const ENTRY_SOURCE = entrySourceOf(FIRST);

/** What no client bundle may hold: storage and network APIs, catalog messages, any other origin. */
const FORBIDDEN_CODE = [
  'document.cookie',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'fetch(',
  'XMLHttpRequest',
  'sendBeacon',
  'WebSocket',
  'EventSource',
];
const MESSAGES = [
  enCommon['errors.DECIMAL_COMMA'],
  esCommon['errors.DECIMAL_COMMA'],
  enSite['site.calculator.copyLink'],
  esSite['site.calculator.copyLink'],
  // i18n-catalog › [ICW22]: neither share value reaches a bundle; the page carries them inert
  enSite['site.calculator.shareWhatsApp'],
  esSite['site.calculator.shareWhatsApp'],
  enSite['site.calculator.shareText'],
  esSite['site.calculator.shareText'],
];

/** The problems of a built client bundle: each a short sentence naming the offence. */
const problemsOf = (code: string): string[] => [
  ...FORBIDDEN_CODE.filter((api) => code.includes(api)).map((api) => `uses ${api}`),
  ...MESSAGES.filter((text) => code.includes(text)).map((text) => `holds the message "${text}"`),
  ...Array.from(code.matchAll(/https?:\/\/[^\s"'`)]+/g), ([url = '']) => url)
    .filter((url) => !/^https:\/\/maestrocalc\.com(?![\w.-])/.test(url))
    .map((url) => `references ${url}`),
  ...(/quikrete/i.test(code) ? ['names the source'] : []),
];

/** What sets a reserved height from script: a size, a line-count property or a `data-reserved` write. */
const RESERVE_WRITES = [
  /min-?height/i,
  /--(?:answer|notice)-lines/,
  /setProperty/,
  /dataset\.reserved/,
  /setAttribute\(\s*["'`]data-reserved/,
];
const reserveWritesIn = (code: string): string[] =>
  RESERVE_WRITES.filter((pattern) => pattern.test(code)).map((pattern) => String(pattern));

describe.each(CALCULATOR_PAGES)(
  '%s client entry: built bundle (calculator-page › [CP42], [CP47]; site-shell › [SS23]; calculator-web-core › [CWC36], [CWC37])',
  (id) => {
    const source = entrySourceOf(id);

    // spec: calculator-page › [CP42] the entry plus its static graph fit the JavaScript budget
    it('weighs at most the calculator JavaScript budget, entry and graph together, and prints the size', async () => {
      const { size } = await buildClient(source);
      expectWithinJsBudget(`${id} client entry`, size);
    });

    // spec: site-shell › [SS23], calculator-page › [CP47] no storage, network, message text or foreign origin
    it('holds no storage or network API, no catalog message and no foreign origin', async () => {
      const { code } = await buildClient(source);
      expect(problemsOf(code)).toEqual([]);
    });

    // spec: calculator-page › [CP63] the reserve is CSS only, no code sets a reserved height
    it('holds no code that sets a reserved height', async () => {
      const { code } = await buildClient(source);
      expect(reserveWritesIn(code)).toEqual([]);
    });

    // spec: calculator-web-core › [CWC25] the page builder and the catalogs are not in the graph of the entry
    it('does not carry the page builder, the page table or a catalog in its graph', async () => {
      const { modules } = await buildClient(source);
      for (const server of ['lib/page-view.ts', 'lib/pages.ts', 'calculator/form-layout.ts']) {
        expect(reaches(modules, `/apps/web/src/${server}`), server).toBe(false);
      }
    });
  },
);

describe('the bundle check finds what it forbids (seeded)', () => {
  it('finds the page builder when the entry imports it', async () => {
    const { modules } = await buildClient(
      `${ENTRY_SOURCE}\nexport { pageViewOf } from '${fromRoot('apps/web/src/lib/page-view.ts')}';`,
    );
    expect(reaches(modules, '/apps/web/src/lib/page-view.ts')).toBe(true);
  });

  // seeded: the check finds each offence
  it.each([
    ['the source record', `export { concreteMix } from '@maestro-calc/data';`, 'names the source'],
    ['a fetch call', `export const f = () => fetch('/x');`, 'uses fetch('],
    ['a stored value', `export const s = () => localStorage.getItem('k');`, 'uses localStorage'],
    [
      'another origin',
      `export const u = 'https://example.com/a';`,
      'references https://example.com/a',
    ],
    // site-quality › [SQ41]: the share base stays in the markup (`data-share`), never in code
    ['the share base', `export const u = 'https://wa.me/';`, 'references https://wa.me/'],
    [
      'an insecure origin',
      `export const u = 'http://maestrocalc.com/a';`,
      'references http://maestrocalc.com/a',
    ],
    [
      'a catalog message',
      `export const m = ${JSON.stringify(enSite['site.calculator.copyLink'])};`,
      `holds the message "${enSite['site.calculator.copyLink']}"`,
    ],
    [
      'the share text',
      `export const m = ${JSON.stringify(esSite['site.calculator.shareText'])};`,
      `holds the message "${esSite['site.calculator.shareText']}"`,
    ],
  ])('flags %s in the bundle', async (_name, extra, expected) => {
    const { code } = await buildClient(`${ENTRY_SOURCE}\n${extra}`);
    expect(problemsOf(code)).toContain(expected);
  });

  // seeded: the reserve check finds each way a script could set a reserved height
  it.each([
    ['a min-height write', `export const r = (e) => { e.style.minHeight = '10rem'; };`, 0],
    [
      'a line-count property',
      `export const r = (e) => e.style.setProperty('--answer-lines', '3');`,
      1,
    ],
    ['a dataset.reserved write', `export const r = (e) => { e.dataset.reserved = 'x'; };`, 3],
    [
      'a data-reserved attribute write',
      `export const r = (e) => e.setAttribute('data-reserved', 'x');`,
      4,
    ],
  ])('flags %s in the bundle', async (_name, extra, index) => {
    const { code } = await buildClient(`${ENTRY_SOURCE}\n${extra}`);
    expect(reserveWritesIn(code)).toContain(String(RESERVE_WRITES[index]));
  });

  it('allows the site origin', async () => {
    const { code } = await buildClient(
      `${ENTRY_SOURCE}\nexport const u = 'https://maestrocalc.com${ROUTES[FIRST].en}';`,
    );
    expect(problemsOf(code)).toEqual([]);
  });
});

/** What a graph that draws may not hold: HTML parsing, dynamic code, or a namespace literal (blueprint-drawing › [BD24]). */
const WRITER_BANNED = [
  'innerHTML',
  'outerHTML',
  'insertAdjacentHTML',
  'DOMParser',
  'eval(',
  'new Function',
  'w3.org',
];
const writerProblems = (code: string): string[] =>
  WRITER_BANNED.filter((word) => code.includes(word)).map((word) => `uses ${word}`);

const WRITER = fromRoot('apps/web/src/client/draw.ts');

describe('the drawing writer builds nodes with DOM calls only (blueprint-drawing › [BD24]; site-quality › [SQ41])', () => {
  // spec: blueprint-drawing › [BD24] the writer's bundle holds no HTML parsing, dynamic code or namespace literal
  it('holds no HTML string, dynamic code, namespace or foreign URL in its build', async () => {
    const { code } = await buildClient(`export * from '${WRITER}';`);
    expect(code).toContain('createElementNS');
    expect(writerProblems(code)).toEqual([]);
    expect(problemsOf(code)).toEqual([]);
  });

  it.each(CALCULATOR_PAGES)('%s client entry holds none of them either', async (id) => {
    const { code } = await buildClient(entrySourceOf(id));
    expect(writerProblems(code)).toEqual([]);
  });

  // spec: blueprint-drawing › [BD24] the namespace is the box's own
  it('creates every node in the namespace of the box', () => {
    const calls = Array.from(
      readFileSync(WRITER, 'utf8').matchAll(/createElementNS\(([^,)]*)/g),
      ([, namespace = '']) => namespace.trim(),
    );
    expect(calls.length).toBeGreaterThan(0);
    expect(new Set(calls)).toEqual(new Set(['box.namespaceURI']));
  });

  // seeded: each banned use is found in a build
  it.each([
    [
      'an innerHTML write',
      `export const w = (e) => { e.innerHTML = '<b>x</b>'; };`,
      'uses innerHTML',
    ],
    ['a parser', `export const p = () => new DOMParser();`, 'uses DOMParser'],
    [
      'a namespace literal',
      `export const n = (d) => d.createElementNS('svg-in-w3.org', 'g');`,
      'uses w3.org',
    ],
  ])('flags %s next to the writer', async (_what, extra, expected) => {
    const { code } = await buildClient(`export * from '${WRITER}';\n${extra}`);
    expect(writerProblems(code)).toContain(expected);
  });
});
