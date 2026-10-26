import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { esCommon } from '@maestro-calc/i18n/catalogs/es/common';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { describe, expect, it } from 'vitest';
import { buildClient } from './__testing__/client-build.ts';
import { fromRoot } from './root.ts';

const ENTRY_SOURCE = `import '${fromRoot('apps/web/src/client/entries/concrete.ts')}';`;

/** The most the entry and its whole static graph may weigh (site-quality › the JavaScript budget). */
const GRAPH_BUDGET = 49_152;

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

describe('concrete client entry: built bundle (calculator-page › [CP42], [CP47]; site-shell › [SS23])', () => {
  // spec: calculator-page › [CP42] the entry plus its static graph fit the JavaScript budget
  it('weighs at most 49,152 bytes, entry and graph together, and prints the size', async () => {
    const { size } = await buildClient(ENTRY_SOURCE);
    console.info(
      `concrete client entry (library build): ${size.toLocaleString('en-US')} B of ${GRAPH_BUDGET.toLocaleString('en-US')} B`,
    );
    expect(size).toBeGreaterThan(10_000);
    expect(size).toBeLessThanOrEqual(GRAPH_BUDGET);
  });

  // spec: site-shell › [SS23], calculator-page › [CP47] no storage, network, message text or foreign origin
  it('holds no storage or network API, no catalog message and no foreign origin', async () => {
    const { code } = await buildClient(ENTRY_SOURCE);
    expect(problemsOf(code)).toEqual([]);
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
  ])('flags %s in the bundle', async (_name, extra, expected) => {
    const { code } = await buildClient(`${ENTRY_SOURCE}\n${extra}`);
    expect(problemsOf(code)).toContain(expected);
  });

  it('allows the site origin', async () => {
    const { code } = await buildClient(
      `${ENTRY_SOURCE}\nexport const u = 'https://maestrocalc.com/concrete-calculator';`,
    );
    expect(problemsOf(code)).toEqual([]);
  });
});
