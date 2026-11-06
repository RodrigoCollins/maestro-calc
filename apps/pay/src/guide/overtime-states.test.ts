import { describe, expect, it } from 'vitest';
import { HOME_TEXTS } from '../home/texts.ts';
import { ROUTES } from '../routes.ts';
import { GUIDE_CALCULATORS } from '../site-check/link-rules.ts';
import { overtimeGuideLinksOf } from './links.ts';
import { OVERTIME_GUIDES } from './overtime.ts';
import {
  OVERTIME_STATES,
  OVERTIME_STATES_GUIDE,
  OVERTIME_STATES_GUIDE_PATHS,
  OVERTIME_STATES_OMITTED,
  OVERTIME_STATES_SOURCES,
  overtimeRowsOf,
} from './overtime-states.ts';

// The 50 states and the District of Columbia.
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

// Copied by hand from the sources: the states with a daily threshold and its hours.
const DAILY: Readonly<Record<string, number>> = {
  Alaska: 8,
  California: 8,
  Colorado: 12,
  Nevada: 8,
};

// The states whose weekly threshold is not 40: Kansas (K.S.A. 44-1204) and Minnesota (Minn.
// Stat. 177.25), each only for work the FLSA does not cover.
const WEEKLY: Readonly<Record<string, number>> = { Kansas: 46, Minnesota: 48 };

// The states for which the DOL table "State Minimum Wage Laws" lists no premium pay after
// designated hours, Kansas aside (its statute is in the table above).
const FLSA_ONLY = [
  'Alabama',
  'Arizona',
  'Delaware',
  'Florida',
  'Georgia',
  'Idaho',
  'Iowa',
  'Louisiana',
  'Mississippi',
  'Nebraska',
  'Oklahoma',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Virginia',
  'Wyoming',
];

const named = (state: string) => {
  const row = OVERTIME_STATES.find(({ name }) => name.en === state);
  if (row === undefined) throw new Error(`no row ${state}`);
  return row;
};

describe('the overtime laws by state', () => {
  it('lists every state and DC once, in alphabetical order, and names what it leaves out', () => {
    const listed = OVERTIME_STATES.map(({ name }) => name.en);
    expect([...listed, ...OVERTIME_STATES_OMITTED.map(({ name }) => name.en)].sort()).toEqual(
      JURISDICTIONS,
    );
    expect(listed).toEqual([...listed].sort());
    expect(new Set(listed).size).toBe(listed.length);
    for (const { name, reason } of OVERTIME_STATES_OMITTED) {
      expect(reason.en.length, name.en).toBeGreaterThan(0);
      expect(reason.es.length, name.en).toBeGreaterThan(0);
    }
  });

  it('has positive whole-hour thresholds, never below the federal 40 a week', () => {
    for (const { name, daily, weekly } of OVERTIME_STATES) {
      expect(Number.isInteger(weekly) && weekly >= 40, name.en).toBe(true);
      if (daily !== undefined) expect(Number.isInteger(daily) && daily > 0, name.en).toBe(true);
    }
  });

  it('lists the daily thresholds explicitly, and only these', () => {
    const daily = Object.fromEntries(
      OVERTIME_STATES.flatMap(({ name, daily: hours }) =>
        hours === undefined ? [] : [[name.en, hours]],
      ),
    );
    expect(daily).toEqual(DAILY);
  });

  it('pays after 40 a week, except where the state statute says otherwise', () => {
    for (const { name, weekly } of OVERTIME_STATES) {
      expect(weekly, name.en).toBe(WEEKLY[name.en] ?? 40);
    }
  });

  it('falls back to the FLSA where the state has no overtime rule, and says so', () => {
    const flsa = OVERTIME_STATES.filter(({ stateRule }) => !stateRule);
    expect(flsa.map(({ name }) => name.en)).toEqual(FLSA_ONLY);
    for (const row of flsa) {
      expect(row.daily, row.name.en).toBeUndefined();
      expect(row.doubleTime, row.name.en).toBeUndefined();
      expect(row.seventhDay, row.name.en).toBeUndefined();
      expect(row.source, row.name.en).toBe('dol');
    }
  });

  it('has double time only in California, and a seventh-day rule only in California and Kentucky', () => {
    expect(OVERTIME_STATES.filter((row) => row.doubleTime).map(({ name }) => name.en)).toEqual([
      'California',
    ]);
    expect(OVERTIME_STATES.filter((row) => row.seventhDay).map(({ name }) => name.en)).toEqual([
      'California',
      'Kentucky',
    ]);
    expect(named('California').doubleTime?.en).toMatch(/12/);
    expect(named('Nevada').notes?.en).toMatch(/1\.5 times/);
    expect(named('Alaska').notes?.en).toMatch(/4 or more/);
    expect(named('Nevada').notes?.es).toMatch(/1\.5 veces el salario mínimo/);
  });

  it('notes the industry and consecutive-hour rules the daily column leaves out', () => {
    const oregon = named('Oregon');
    expect(oregon.daily).toBeUndefined();
    expect(oregon.notesSource).toBe('or');
    for (const text of [oregon.notes?.en, oregon.notes?.es]) {
      expect(text).toMatch(/10 h/);
      expect(text).toMatch(/ORS 652\.020/);
      expect(text).toMatch(/ORS 653\.265/);
    }
    expect(oregon.notes?.en).toMatch(/manufacturing/);
    expect(oregon.notes?.es).toMatch(/manufactura/);
    expect(OVERTIME_STATES_SOURCES.or.label).toMatch(/checked November 5, 2026/);

    const colorado = named('Colorado');
    expect(colorado.daily).toBe(12);
    expect(colorado.notesSource).toBe('co');
    expect(colorado.notes?.en).toMatch(/COMPS Order #39.*consecutive hours.*CDLE/);
    expect(colorado.notes?.es).toMatch(/COMPS Order #39.*horas seguidas.*CDLE/);
  });

  it('cites a government source for every row, with a link and the date it was checked', () => {
    for (const { name, source, notesSource } of OVERTIME_STATES) {
      for (const key of notesSource === undefined ? [source] : [source, notesSource]) {
        expect(OVERTIME_STATES_SOURCES[key].href, name.en).toMatch(
          /^https:\/\/(www\.dol\.gov|www\.dir\.ca\.gov|labor\.alaska\.gov|www\.revisor\.mn\.gov|www\.kslegislature\.gov|www\.oregon\.gov\/boli|cdle\.colorado\.gov)\//,
        );
      }
    }
    expect(named('California').source).toBe('ca');
    expect(named('Alaska').source).toBe('ak');
    expect(named('Minnesota').source).toBe('mn');
    expect(named('Kansas').source).toBe('ks');
    for (const lang of ['en', 'es'] as const) {
      expect(OVERTIME_STATES_GUIDE[lang].asOf).toMatch(/July 1, 2026|1 de julio de 2026/);
      expect(OVERTIME_STATES_GUIDE[lang].asOf).toMatch(/November 5, 2026|5 de noviembre de 2026/);
    }
  });

  it('writes every text in both languages or in neither', () => {
    for (const row of OVERTIME_STATES) {
      for (const words of [row.doubleTime, row.seventhDay, row.notes]) {
        if (words === undefined) continue;
        expect(words.en.length, row.name.en).toBeGreaterThan(0);
        expect(words.es.length, row.name.en).toBeGreaterThan(0);
      }
    }
  });

  it('prints the rows in each language, sorted by the name in that language', () => {
    const es = overtimeRowsOf('es').map(({ name }) => name);
    expect(es).toEqual([...es].sort((a, b) => a.localeCompare(b, 'es')));
    const california = overtimeRowsOf('en').find(({ name }) => name === 'California');
    expect(california).toMatchObject({ daily: '8 h', weekly: '40 h' });
    const texas = overtimeRowsOf('en').find(({ name }) => name === 'Texas');
    expect(texas).toMatchObject({ daily: undefined, weekly: '40 h' });
    expect(texas?.notes).toMatch(/FLSA/);
  });

  it.each(['en', 'es'] as const)('%s: answers first, with the counts of the table', (lang) => {
    const { lead } = OVERTIME_STATES_GUIDE[lang];
    for (const figure of ['40', '1.5', '4', '18']) expect(lead, figure).toContain(figure);
    expect(lead).toMatch(/California/);
  });

  it.each(['en', 'es'] as const)('%s: gives the canonical URL to cite', (lang) => {
    const url = `https://cuentahoras.com${OVERTIME_STATES_GUIDE_PATHS[lang]}`;
    expect(OVERTIME_STATES_GUIDE[lang].cite.text).toContain(url);
  });

  it('keeps titles and descriptions short, and links its own language', () => {
    for (const [lang, texts] of Object.entries(OVERTIME_STATES_GUIDE)) {
      expect(texts.title.length, texts.title).toBeLessThanOrEqual(70);
      expect(texts.description.length, texts.description).toBeLessThanOrEqual(160);
      expect(texts.disclaimer).toMatch(/not legal advice|no asesoría legal/);
      for (const { href } of texts.ctas) expect(href.startsWith('/es/'), href).toBe(lang === 'es');
    }
  });

  it('is an article of the route table, linked by the calculator, the overtime guides and the home', () => {
    expect(ROUTES).toContainEqual({
      id: 'overtime-states-guide',
      kind: 'article',
      ...OVERTIME_STATES_GUIDE_PATHS,
    });
    expect(GUIDE_CALCULATORS['overtime-states-guide']).toEqual(['overtime']);
    for (const lang of ['en', 'es'] as const) {
      const path = OVERTIME_STATES_GUIDE_PATHS[lang];
      expect(overtimeGuideLinksOf(lang).map(({ href }) => href)).toContain(path);
      for (const guide of ['federal', 'california'] as const) {
        expect(OVERTIME_GUIDES[guide][lang].ctas.map(({ href }) => href)).toContain(path);
      }
      expect(HOME_TEXTS[lang].guidesHeading.length).toBeGreaterThan(0);
    }
  });
});
