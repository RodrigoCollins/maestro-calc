import { describe, expect, it } from 'vitest';
import { HOME_TEXTS } from '../home/texts.ts';
import { ROUTES } from '../routes.ts';
import { GUIDE_CALCULATORS } from '../site-check/link-rules.ts';
import { TIPPED_TEXTS } from '../tipped/texts.ts';
import { TIP_CREDIT_GUIDE } from './tip-credit.ts';
import {
  TIPPED_STATES,
  TIPPED_STATES_GUIDE,
  TIPPED_STATES_GUIDE_PATHS,
  TIPPED_STATES_SOURCES,
  centsText,
  rowsOf,
} from './tipped-states.ts';

// The 50 states and the District of Columbia, as the DOL table "Minimum Wages for Tipped
// Employees" (last revised July 1, 2026) lists them.
const JURISDICTIONS = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'District of Columbia',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
];

// Spot checks copied by hand from the DOL table (cash wage, tip credit, minimum, in cents), New
// York from the New York State Department of Labor, and Florida from the Florida Constitution,
// Art. X, s. 24 ($15.00 on September 30, 2026, less the 2003 federal tip credit of $3.02).
const HAND: Readonly<Record<string, readonly [number, number, number]>> = {
  Alabama: [213, 512, 725],
  California: [1690, 0, 1690],
  Washington: [1713, 0, 1713],
  Arizona: [1215, 300, 1515],
  'District of Columbia': [1030, 810, 1840],
  Florida: [1198, 302, 1500],
  Illinois: [900, 600, 1500],
  'New York': [1135, 565, 1700],
  Pennsylvania: [283, 442, 725],
  Virginia: [213, 1064, 1277],
  'West Virginia': [262, 613, 875],
};

const NO_TIP_CREDIT = [
  'Alaska',
  'California',
  'Minnesota',
  'Montana',
  'Nevada',
  'Oregon',
  'Washington',
];

describe('the tipped minimum wage by state', () => {
  it('lists every state and DC once, in alphabetical order', () => {
    expect(TIPPED_STATES.map(({ name }) => name.en)).toEqual(JURISDICTIONS);
  });

  it('adds up: the cash wage plus the tip credit is the full minimum wage, in every row', () => {
    for (const { name, cash, credit, minimum } of TIPPED_STATES) {
      expect(cash + credit, name.en).toBe(minimum);
      expect(cash, name.en).toBeGreaterThanOrEqual(213);
      expect(minimum, name.en).toBeGreaterThanOrEqual(725);
    }
  });

  it('holds the hand-checked rows of the sources', () => {
    for (const [state, [cash, credit, minimum]] of Object.entries(HAND)) {
      const row = TIPPED_STATES.find(({ name }) => name.en === state);
      expect(row, state).toMatchObject({ cash, credit, minimum });
    }
  });

  it('takes no tip credit where the state requires the full minimum wage before tips', () => {
    expect(TIPPED_STATES.filter(({ credit }) => credit === 0).map(({ name }) => name.en)).toEqual(
      NO_TIP_CREDIT,
    );
  });

  it('cites a primary source for every row, with its as-of date', () => {
    for (const { name, source } of TIPPED_STATES) {
      expect(TIPPED_STATES_SOURCES[source].href, name.en).toMatch(
        /^https:\/\/(www\.dol\.gov|dol\.ny\.gov|www\.flsenate\.gov)\//,
      );
    }
    expect(TIPPED_STATES_SOURCES.dol.href).toBe(
      'https://www.dol.gov/agencies/whd/state/minimum-wage/tipped',
    );
    for (const lang of ['en', 'es'] as const) {
      expect(TIPPED_STATES_GUIDE[lang].asOf).toMatch(/July 1, 2026|1 de julio de 2026/);
      expect(TIPPED_STATES_GUIDE[lang].asOf).toMatch(/November 5, 2026|5 de noviembre de 2026/);
    }
  });

  it('writes a note in both languages or in neither', () => {
    for (const { name, notes } of TIPPED_STATES) {
      if (notes === undefined) continue;
      expect(notes.en.length, name.en).toBeGreaterThan(0);
      expect(notes.es.length, name.en).toBeGreaterThan(0);
    }
  });

  it('formats cents as dollars', () => {
    expect(centsText(213)).toBe('$2.13');
    expect(centsText(1500)).toBe('$15.00');
  });

  it('sorts the Spanish table by the Spanish names', () => {
    const names = rowsOf('es').map(({ name }) => name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'es')));
    expect(names).toContain('Nueva York');
    expect(rowsOf('en').map(({ name }) => name)).toEqual(JURISDICTIONS);
  });

  it.each(['en', 'es'] as const)('%s: answers the question first, with the key numbers', (lang) => {
    const { lead } = TIPPED_STATES_GUIDE[lang];
    for (const figure of ['$2.13', '$5.12', '$7.25', '$17.13', '7', '16']) {
      expect(lead, figure).toContain(figure);
    }
    expect(lead).toMatch(/Washington/);
  });

  it.each(['en', 'es'] as const)('%s: gives the canonical URL to cite', (lang) => {
    const url = `https://cuentahoras.com${TIPPED_STATES_GUIDE_PATHS[lang]}`;
    expect(TIPPED_STATES_GUIDE[lang].cite.text).toContain(url);
  });

  it('keeps titles and descriptions short, and links its own language', () => {
    for (const [lang, texts] of Object.entries(TIPPED_STATES_GUIDE)) {
      expect(texts.title.length, texts.title).toBeLessThanOrEqual(70);
      expect(texts.description.length, texts.description).toBeLessThanOrEqual(160);
      expect(texts.disclaimer).toMatch(/not legal advice|no asesoría legal/);
      for (const { href } of texts.ctas) expect(href.startsWith('/es/'), href).toBe(lang === 'es');
    }
  });

  it('is an article of the route table, linked by the calculator and the tip credit guide', () => {
    expect(ROUTES).toContainEqual({
      id: 'tipped-states-guide',
      kind: 'article',
      ...TIPPED_STATES_GUIDE_PATHS,
    });
    expect(GUIDE_CALCULATORS['tipped-states-guide']).toEqual(['tipped-wage']);
    for (const lang of ['en', 'es'] as const) {
      const path = TIPPED_STATES_GUIDE_PATHS[lang];
      expect(TIPPED_TEXTS[lang].links.map(({ href }) => href)).toContain(path);
      expect(TIP_CREDIT_GUIDE[lang].ctas.map(({ href }) => href)).toContain(path);
      expect(HOME_TEXTS[lang].guidesHeading.length).toBeGreaterThan(0);
    }
  });
});
