import { describe, expect, it } from 'vitest';
import { PAY_CONVERTER_TEXTS } from '../pay-converter/texts.ts';
import { ROUTES } from '../routes.ts';
import { GUIDE_CALCULATORS } from '../site-check/link-rules.ts';
import {
  FEDERAL_MINIMUM_WAGE,
  MINIMUM_WAGE_STATES,
  MINIMUM_WAGE_STATES_GUIDE,
  MINIMUM_WAGE_STATES_GUIDE_PATHS,
  MINIMUM_WAGE_STATES_SOURCES,
  minimumWageRowsOf,
  UNCHANGED_2027,
  UNCONFIRMED_2027,
} from './minimum-wage-states.ts';
import { TIPPED_STATES, TIPPED_STATES_GUIDE } from './tipped-states.ts';

// The basic minimum rate of each state, copied by hand from the DOL table "State Minimum Wage
// Laws" (updated July 1, 2026); 0 where the state has no minimum wage law.
const DOL_BASIC: Readonly<Record<string, number>> = {
  Alabama: 0,
  Alaska: 1400,
  Arizona: 1515,
  Arkansas: 1100,
  California: 1690,
  Colorado: 1516,
  Connecticut: 1694,
  Delaware: 1500,
  'District of Columbia': 1840,
  Florida: 1400,
  Georgia: 515,
  Hawaii: 1600,
  Idaho: 725,
  Illinois: 1500,
  Indiana: 725,
  Iowa: 725,
  Kansas: 725,
  Kentucky: 725,
  Louisiana: 0,
  Maine: 1510,
  Maryland: 1500,
  Massachusetts: 1500,
  Michigan: 1373,
  Minnesota: 1141,
  Mississippi: 0,
  Missouri: 1500,
  Montana: 1085,
  Nebraska: 1500,
  Nevada: 1200,
  'New Hampshire': 725,
  'New Jersey': 1592,
  'New Mexico': 1200,
  'New York': 1700,
  'North Carolina': 725,
  'North Dakota': 725,
  Ohio: 1100,
  Oklahoma: 725,
  Oregon: 1555,
  Pennsylvania: 725,
  'Rhode Island': 1600,
  'South Carolina': 0,
  'South Dakota': 1185,
  Tennessee: 0,
  Texas: 725,
  Utah: 725,
  Vermont: 1442,
  Virginia: 1277,
  Washington: 1713,
  'West Virginia': 875,
  Wisconsin: 725,
  Wyoming: 515,
};

// The rates of January 1, 2027, copied by hand from the page that states each one: the DOL table
// for Michigan, the state labor department (or its governor) for the rest; Ohio from the 2027 poster
// of the Ohio Department of Commerce (rev. 9/30/26).
const SCHEDULED: Readonly<Record<string, number>> = {
  California: 1740,
  Connecticut: 1748,
  Michigan: 1500,
  Minnesota: 1187,
  Montana: 1120,
  'New Jersey': 1648,
  Ohio: 1140,
  'South Dakota': 1230,
  Virginia: 1375,
  Washington: 1773,
};

const named = (state: string) => {
  const row = MINIMUM_WAGE_STATES.find(({ name }) => name.en === state);
  if (row === undefined) throw new Error(`no row ${state}`);
  return row;
};

describe('the minimum wage by state', () => {
  it('lists every state and DC once, in alphabetical order', () => {
    const listed = MINIMUM_WAGE_STATES.map(({ name }) => name.en);
    expect(listed).toEqual(Object.keys(DOL_BASIC).sort());
    expect(listed).toEqual([...listed].sort());
    expect(new Set(listed).size).toBe(51);
  });

  it('takes every wage and name from the tipped table, the one copy of the figures', () => {
    expect(MINIMUM_WAGE_STATES.map(({ name }) => name)).toEqual(
      TIPPED_STATES.map(({ name }) => name),
    );
    MINIMUM_WAGE_STATES.forEach((row, index) => {
      expect(row.wage, row.name.en).toBe(TIPPED_STATES[index]?.minimum);
    });
  });

  it('is the DOL basic rate, or the federal $7.25 where the state has none or a lower one', () => {
    for (const row of MINIMUM_WAGE_STATES) {
      const dol = DOL_BASIC[row.name.en] ?? -1;
      // Florida: $15.00 since September 30, 2026, under the state constitution; the DOL table
      // still shows the earlier $14.00.
      const expected = row.name.en === 'Florida' ? 1500 : Math.max(dol, FEDERAL_MINIMUM_WAGE);
      expect(row.wage, row.name.en).toBe(expected);
    }
    expect(FEDERAL_MINIMUM_WAGE).toBe(725);
  });

  it('never prints less than the federal minimum, and says where the federal rate applies', () => {
    for (const row of MINIMUM_WAGE_STATES) {
      expect(row.wage, row.name.en).toBeGreaterThanOrEqual(FEDERAL_MINIMUM_WAGE);
      const dol = DOL_BASIC[row.name.en] ?? -1;
      expect(row.federal, row.name.en).toBe(dol < FEDERAL_MINIMUM_WAGE);
      if (row.federal) {
        expect(row.wage, row.name.en).toBe(FEDERAL_MINIMUM_WAGE);
        expect(row.stateRate, row.name.en).toBe(dol === 0 ? undefined : dol);
        expect(row.notes?.en, row.name.en).toMatch(/federal \$7\.25/);
        expect(row.notes?.es, row.name.en).toMatch(/federal de \$7\.25/);
      } else {
        expect(row.stateRate, row.name.en).toBeUndefined();
      }
    }
    expect(MINIMUM_WAGE_STATES.filter((row) => row.federal).map(({ name }) => name.en)).toEqual([
      'Alabama',
      'Georgia',
      'Louisiana',
      'Mississippi',
      'South Carolina',
      'Tennessee',
      'Wyoming',
    ]);
  });

  it('notes the regional rates the DOL table gives, and no city figure it does not', () => {
    const regional = MINIMUM_WAGE_STATES.filter(({ notes }) =>
      /Portland|New York City/.test(notes?.en ?? ''),
    );
    expect(regional.map(({ name }) => name.en)).toEqual(['New York', 'Oregon']);
    expect(named('New York').notes?.en).toMatch(/\$16\.00/);
    expect(named('Oregon').notes?.en).toMatch(/\$16\.80.*\$14\.55/);
    for (const lang of ['en', 'es'] as const) {
      expect(MINIMUM_WAGE_STATES_GUIDE[lang].asOf).toMatch(
        /cities and counties|ciudades y condados/,
      );
    }
  });

  it('shows a January 1, 2027 rate only where a primary source states it, above today’s', () => {
    const scheduled = Object.fromEntries(
      MINIMUM_WAGE_STATES.flatMap(({ name, scheduled: next }) =>
        next === undefined ? [] : [[name.en, next.wage]],
      ),
    );
    expect(scheduled).toEqual(SCHEDULED);
    for (const row of MINIMUM_WAGE_STATES) {
      if (row.scheduled === undefined) continue;
      expect(row.scheduled.wage, row.name.en).toBeGreaterThan(row.wage);
      const source = MINIMUM_WAGE_STATES_SOURCES[row.scheduled.source];
      expect(source.label, row.name.en).toMatch(/2027/);
      expect(source.href, row.name.en).toMatch(/^https:\/\/(www\.dol\.gov|[a-z.]+\.gov)\//);
    }
    expect(named('Michigan').scheduled?.source).toBe('dol');
  });

  it('notes the Ohio employer threshold of 2027 from the same poster', () => {
    const ohio = named('Ohio').scheduled;
    expect(ohio?.source).toBe('oh');
    expect(ohio?.notes?.en).toMatch(/\$419,000/);
    expect(ohio?.notes?.es).toMatch(/\$419,000/);
    expect(MINIMUM_WAGE_STATES_SOURCES.oh.href).toMatch(/^https:\/\/dam\.assets\.ohio\.gov\//);
  });

  it('lists New York, whose labor department says its rate stays the same in 2027', () => {
    expect(UNCHANGED_2027.map(({ state }) => state)).toEqual(['New York']);
    for (const { state, source } of UNCHANGED_2027) {
      expect(named(state).scheduled, state).toBeUndefined();
      expect(MINIMUM_WAGE_STATES_SOURCES[source].label, state).toMatch(/2027/);
    }
  });

  it('lists the states whose 2027 rate no primary source we could read confirms', () => {
    const states = UNCONFIRMED_2027.map(({ state }) => state);
    expect(states).toEqual(['Arizona', 'Colorado', 'Maine', 'Nebraska', 'Rhode Island', 'Vermont']);
    for (const { state, check, reason } of UNCONFIRMED_2027) {
      // never both confirmed and unconfirmed
      expect(named(state).scheduled, state).toBeUndefined();
      expect(
        UNCHANGED_2027.some((each) => each.state === state),
        state,
      ).toBe(false);
      expect(check.href, state).toMatch(/^https:\/\/[a-z.]+\.gov\/?/);
      expect(reason.en.length, state).toBeGreaterThan(0);
      expect(reason.es.length, state).toBeGreaterThan(0);
    }
  });

  it('cites a government source for every row, with a link and the dates', () => {
    for (const { name, source } of MINIMUM_WAGE_STATES) {
      expect(MINIMUM_WAGE_STATES_SOURCES[source].href, name.en).toMatch(
        /^https:\/\/[a-z.]+\.gov\//,
      );
    }
    expect(named('Florida').source).toBe('fl');
    expect(named('Texas').source).toBe('dol');
    for (const lang of ['en', 'es'] as const) {
      expect(MINIMUM_WAGE_STATES_GUIDE[lang].asOf).toMatch(/July 1, 2026|1 de julio de 2026/);
      expect(MINIMUM_WAGE_STATES_GUIDE[lang].asOf).toMatch(
        /November 6, 2026|6 de noviembre de 2026/,
      );
    }
  });

  it('writes every text in both languages or in neither', () => {
    for (const row of MINIMUM_WAGE_STATES) {
      for (const words of [row.notes, row.scheduled?.notes]) {
        if (words === undefined) continue;
        expect(words.en.length, row.name.en).toBeGreaterThan(0);
        expect(words.es.length, row.name.en).toBeGreaterThan(0);
      }
    }
  });

  it('prints the rows in each language, sorted by the name in that language', () => {
    const es = minimumWageRowsOf('es').map(({ name }) => name);
    expect(es).toEqual([...es].sort((a, b) => a.localeCompare(b, 'es')));
    const en = minimumWageRowsOf('en');
    expect(en.find(({ name }) => name === 'California')).toMatchObject({
      wage: '$16.90',
      basis: 'State law',
      scheduled: { wage: '$17.40' },
    });
    expect(en.find(({ name }) => name === 'Texas')).toMatchObject({
      wage: '$7.25',
      basis: 'State law, same as federal',
      scheduled: undefined,
    });
    expect(en.find(({ name }) => name === 'Alabama')?.basis).toBe('Federal: no state law');
    expect(en.find(({ name }) => name === 'Wyoming')?.basis).toBe(
      'Federal: the state’s $5.15 is lower',
    );
    expect(minimumWageRowsOf('es').find(({ name }) => name === 'Georgia')?.basis).toBe(
      'Federal: el estatal de $5.15 es menor',
    );
  });

  it.each(['en', 'es'] as const)('%s: answers first, with the counts of the table', (lang) => {
    const { lead } = MINIMUM_WAGE_STATES_GUIDE[lang];
    for (const figure of ['$7.25', '$18.40', '7']) expect(lead, figure).toContain(figure);
    expect(lead).toMatch(/Distrito de Columbia|District of Columbia/);
  });

  it.each(['en', 'es'] as const)('%s: gives the canonical URL to cite', (lang) => {
    const url = `https://cuentahoras.com${MINIMUM_WAGE_STATES_GUIDE_PATHS[lang]}`;
    expect(MINIMUM_WAGE_STATES_GUIDE[lang].cite.text).toContain(url);
  });

  it('keeps titles and descriptions short, and links its own language', () => {
    for (const [lang, texts] of Object.entries(MINIMUM_WAGE_STATES_GUIDE)) {
      expect(texts.title.length, texts.title).toBeLessThanOrEqual(70);
      expect(texts.description.length, texts.description).toBeLessThanOrEqual(160);
      expect(texts.disclaimer).toMatch(/not legal advice|no asesoría legal/);
      for (const { href } of texts.ctas) expect(href.startsWith('/es/'), href).toBe(lang === 'es');
    }
  });

  it('is an article of the route table, linked by both pay converters and the tipped table', () => {
    expect(ROUTES).toContainEqual({
      id: 'minimum-wage-states-guide',
      kind: 'article',
      ...MINIMUM_WAGE_STATES_GUIDE_PATHS,
    });
    expect(GUIDE_CALCULATORS['minimum-wage-states-guide']).toEqual([
      'hourly-to-salary',
      'salary-to-hourly',
    ]);
    for (const lang of ['en', 'es'] as const) {
      const path = MINIMUM_WAGE_STATES_GUIDE_PATHS[lang];
      expect(PAY_CONVERTER_TEXTS[lang].minimumWage.href).toBe(path);
      expect(TIPPED_STATES_GUIDE[lang].ctas.map(({ href }) => href)).toContain(path);
    }
  });
});
