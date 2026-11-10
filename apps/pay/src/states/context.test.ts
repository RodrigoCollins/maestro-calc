import { decode } from '@maestro-calc/core';
import { overtime } from '@maestro-calc/pay-core/overtime';
import { describe, expect, it } from 'vitest';
import { increasesOf } from '../guide/minimum-wage-2027.ts';
import {
  MINIMUM_WAGE_STATES_SOURCES,
  UNCHANGED_2027,
  UNCONFIRMED_2027,
} from '../guide/minimum-wage-states.ts';
import { centsText } from '../guide/tipped-states.ts';
import { SOURCES } from '../long-tail/sections.ts';
import { MEAL_PERIODS } from '../long-tail/meal-periods.ts';
import { OVERTIME_PATHS } from '../overtime/texts.ts';
import { contextOf, MEAL_VARIES, type ContextSection } from './context.ts';
import { CENSUS_DIVISIONS, divisionOf } from './divisions.ts';
import { factsOf, STATE_FACTS } from './facts.ts';
import { statePageOf } from './pages.ts';
import { statePathOf } from './routes.ts';

const LANGS = ['en', 'es'] as const;
type Lang = (typeof LANGS)[number];

const sectionOf = (name: string, lang: Lang, id: ContextSection['id']) =>
  contextOf(factsOf(name), lang).find((section) => section.id === id);
const textOf = (section: ContextSection | undefined): string =>
  section === undefined
    ? ''
    : [
        ...section.paragraphs,
        ...(section.items ?? []).map(({ label, text }) => `${label}${text}`),
      ].join(' ');
const queryOf = (href: string): string => new URL(href, 'https://cuentahoras.com').search.slice(1);

describe('contextOf: what one state’s figures come to', () => {
  it('works a 50-hour week out at the California minimum, leaving the checks to the paydays', () => {
    const text = textOf(sectionOf('California', 'en', 'paycheck'));
    // the week, the two weeks and the month are the payday section's and the examples' figures
    expect(text).not.toContain('$1,352');
    expect(text).not.toContain('$2,929.33');
    // $16.90 x 40 = $676 a week from the employer, tips on top
    expect(text).toContain('$676');
    // five 10-hour days: 40 x $16.90 + 10 x $25.35 = $929.50, $253.50 of it overtime
    expect(text).toContain('$25.35');
    expect(text).toContain('$929.50');
    expect(text).toContain('$253.50');
    // no tip credit in California
    expect(text).toContain('no tip credit');
  });

  it('works the tipped cash wage out where it differs from the minimum, in Texas', () => {
    const text = textOf(sectionOf('Texas', 'en', 'paycheck'));
    // $2.13 x 40 = $85.20; x 2,080 = $4,430.40; $15,080 - $4,430.40 = $10,649.60 of tips
    expect(text).toContain('$85.20');
    expect(text).toContain('$4,430.40');
    expect(text).toContain('$10,649.60');
    expect(text).toContain('$15,080');
    const es = textOf(sectionOf('Texas', 'es', 'paycheck'));
    expect(es).toContain('$4,430.40');
    expect(es).toContain('Texas');
  });

  it('compares California with the federal $7.25, the nation and its Pacific neighbours', () => {
    const section = sectionOf('California', 'en', 'compare');
    const text = textOf(section);
    // $16.90 - $7.25 = $9.65 an hour, $386 a week, $20,072 a year
    expect(text).toContain('$9.65');
    expect(text).toContain('$386');
    expect(text).toContain('$20,072');
    // DC $18.40, Washington $17.13, New York $17.00, Connecticut $16.94, then California
    expect(text).toContain('5th-highest');
    expect(text).toContain('Pacific');
    expect(section?.items?.map(({ label }) => label)).toEqual([
      'Alaska',
      'Hawaii',
      'Oregon',
      'Washington',
    ]);
    // Washington $17.13 is $0.23 more; Alaska $14.00 is $2.90 less
    expect(section?.items?.find(({ label }) => label === 'Washington')?.text).toContain('$0.23');
    expect(section?.items?.find(({ label }) => label === 'Alaska')?.text).toContain('$2.90');
    expect(section?.sources).toContainEqual(CENSUS_DIVISIONS);
    // New Jersey $15.92 and Pennsylvania $7.25, both under New York's $17.00
    expect(textOf(sectionOf('New York', 'en', 'compare'))).toContain('both pay less an hour');
    expect(textOf(sectionOf('New York', 'es', 'compare'))).toContain('los dos pagan menos la hora');
  });

  it('says how many states pay the federal floor, and where a Texan’s neighbours stand', () => {
    const section = sectionOf('Texas', 'en', 'compare');
    const text = textOf(section);
    const floor = STATE_FACTS.filter(({ minimum }) => minimum.wage === 725).length;
    expect(floor).toBe(20);
    expect(text).toContain(`one of the ${String(floor)}`);
    // Arkansas $11.00 is $3.75 more an hour than Texas
    expect(section?.items?.find(({ label }) => label === 'Arkansas')?.text).toContain('$3.75');
    expect(section?.items?.find(({ label }) => label === 'Oklahoma')?.text).toContain('same');
    // the median of the 51 rates
    const sorted = STATE_FACTS.map(({ minimum }) => minimum.wage).toSorted((a, b) => a - b);
    expect(text).toContain(centsText(sorted[25] ?? 0));
  });

  it.each(LANGS)('links each neighbour of the division to its page, in %s', (lang) => {
    for (const facts of STATE_FACTS) {
      const section = contextOf(facts, lang).find(({ id }) => id === 'compare');
      const neighbours = divisionOf(facts.tipped.name.en).states.filter(
        (name) => name !== facts.tipped.name.en,
      );
      expect(section?.items?.map(({ href }) => href)).toEqual(
        neighbours.map((name) => statePathOf(factsOf(name).tipped.name[lang], lang)),
      );
      for (const item of section?.items ?? [])
        expect(item.text).toContain(nameOfIn(facts.tipped.name[lang], lang));
    }
  });

  it('shows daily overtime on a short week only in the states with a daily rule', () => {
    const daily = STATE_FACTS.filter((facts) =>
      contextOf(facts, 'en').some(({ id }) => id === 'daily'),
    ).map(({ tipped }) => tipped.name.en);
    expect(daily).toEqual(['Alaska', 'California', 'Colorado', 'Nevada']);
    // four 10-hour days at $16.90: $676 under the FLSA alone; 32 x $16.90 + 8 x $25.35 = $743.60
    const california = sectionOf('California', 'en', 'daily');
    expect(textOf(california)).toContain('$676');
    expect(textOf(california)).toContain('$743.60');
    // three 14-hour days at $15.16: 40 x $15.16 + 2 x $22.74 = $651.88; 36 + 6 overtime = $682.20
    expect(textOf(sectionOf('Colorado', 'en', 'daily'))).toContain('$651.88');
    expect(textOf(sectionOf('Colorado', 'en', 'daily'))).toContain('$682.20');
    // Nevada: 32 x $12.00 + 8 x $18.00 = $528.00
    expect(textOf(sectionOf('Nevada', 'es', 'daily'))).toContain('$528');
    const link = california?.links?.[0]?.href ?? '';
    expect(link.startsWith(`${OVERTIME_PATHS.en}?`)).toBe(true);
    const { state, issues } = decode(overtime, queryOf(link));
    expect(issues).toEqual([]);
    expect(state.rule).toBe('california');
  });

  it.each(LANGS)(
    'gives the meal period of the DOL table only to the states it lists, in %s',
    (lang) => {
      const listed = [...MEAL_PERIODS.map(({ state }) => state.en), ...MEAL_VARIES].toSorted();
      const shown = STATE_FACTS.filter((facts) =>
        contextOf(facts, lang).some(({ id }) => id === 'meal'),
      ).map(({ tipped }) => tipped.name.en);
      expect(shown.toSorted()).toEqual(listed);
      for (const name of shown)
        expect(sectionOf(name, lang, 'meal')?.sources).toContainEqual(SOURCES.mealTable);
    },
  );

  it('quotes the DOL standard in English and works out the minutes it owes', () => {
    for (const period of MEAL_PERIODS)
      expect(textOf(sectionOf(period.state.en, 'en', 'meal'))).toContain(period.standard);
    expect(textOf(sectionOf('Illinois', 'es', 'meal'))).toContain('20 minutos');
    expect(textOf(sectionOf('Rhode Island', 'en', 'meal'))).toContain('30 minutes');
    expect(textOf(sectionOf('Kentucky', 'en', 'meal'))).toContain('Kentucky');
  });

  it.each(LANGS)('gives the January 2027 change where a source states one, in %s', (lang) => {
    const rows = increasesOf(lang);
    for (const facts of STATE_FACTS) {
      const section = contextOf(facts, lang).find(({ id }) => id === 'next-year');
      const name = facts.tipped.name.en;
      const row = rows.find((each) => each.name === facts.tipped.name[lang]);
      const unchanged = UNCHANGED_2027.some(({ state }) => state === name);
      const unconfirmed = UNCONFIRMED_2027.find(({ state }) => state === name);
      if (row === undefined && !unchanged && unconfirmed === undefined) {
        expect(section, name).toBeUndefined();
        continue;
      }
      if (row !== undefined) {
        const text = textOf(section);
        for (const figure of [row.current, row.next, row.increase, row.percent, row.annual])
          expect(text, name).toContain(figure.replace(/\.00$/, ''));
        expect(section?.sources.map(({ href }) => href)).toContain(row.source.href);
      }
      if (unchanged)
        expect(section?.sources).toContainEqual({
          label: MINIMUM_WAGE_STATES_SOURCES.ny.label,
          href: MINIMUM_WAGE_STATES_SOURCES.ny.href,
        });
      if (unconfirmed !== undefined) {
        expect(textOf(section)).toContain(unconfirmed.law[lang]);
        expect(section?.links).toContainEqual(unconfirmed.check);
      }
    }
  });

  it('gives the paydays of the DOL table and the paycheck each one makes at the minimum', () => {
    // Mississippi: bi-weekly and semi-monthly, both under footnote 12 (manufacturers of 50 or more)
    const mississippi = textOf(sectionOf('Mississippi', 'en', 'payday'));
    expect(mississippi).toContain('every two weeks or twice a month');
    expect(mississippi).toContain('manufacturing of any kind in the State employing 50 or more');
    // $7.25 x 80 = $580; $15,080 / 24 = $628.33; 26 checks against 24: $628.33 - $580 = $48.33
    expect(mississippi).toContain('$580');
    expect(mississippi).toContain('$628.33');
    expect(mississippi).toContain('$48.33');
    // Texas: bi-weekly, semi-monthly and monthly, footnote 21; $15,080 / 12 = $1,256.67
    const texas = textOf(sectionOf('Texas', 'en', 'payday'));
    expect(texas).toContain('exempt from the overtime provisions');
    expect(texas).toContain('$1,256.67');
    expect(textOf(sectionOf('Texas', 'es', 'payday'))).toContain('al menos una vez al mes');
    // California at $16.90: $676 a week, $1,352 every two weeks, $35,152 / 24 = $1,464.67
    const california = textOf(sectionOf('California', 'en', 'payday'));
    expect(california).toContain('$676');
    expect(california).toContain('$1,352');
    expect(california).toContain('$1,464.67');
    expect(california).toContain('$2,929.33');
    // Alabama: footnote 1, no frequency and so no paycheck to work out
    const alabama = textOf(sectionOf('Alabama', 'en', 'payday'));
    expect(alabama).toContain('No regulations or not specified');
    expect(alabama).not.toContain('$');
    expect(textOf(sectionOf('Pennsylvania', 'en', 'payday'))).toContain('marks no payday');
    expect(textOf(sectionOf('North Carolina', 'es', 'payday'))).toContain('diarios');
  });

  it.each(LANGS)('gives every state its paydays and its labor office, in %s', (lang) => {
    for (const facts of STATE_FACTS) {
      const ids = contextOf(facts, lang).map(({ id }) => id);
      expect(ids, facts.tipped.name.en).toContain('payday');
      expect(ids, facts.tipped.name.en).toContain('office');
      expect(sectionOf(facts.tipped.name.en, lang, 'payday')?.sources).toContainEqual(
        SOURCES.paydayTable,
      );
      expect(sectionOf(facts.tipped.name.en, lang, 'office')?.sources).toContainEqual(
        SOURCES.laborOffices,
      );
    }
  });

  it('gives the limits of the DOL child labor table for under 16 and for 16 and 17', () => {
    const alabama = textOf(sectionOf('Alabama', 'en', 'teens'));
    expect(alabama).toContain('8-40-6 non-school day/week; 3-18-6 school day/week');
    expect(alabama).toContain('10 p.m. before school day to 5 a.m., if enrolled in school');
    const mississippi = textOf(sectionOf('Mississippi', 'en', 'teens'));
    expect(mississippi).toContain('8-44 in factory, mill, cannery, workshop');
    expect(mississippi).toContain('sets no limit for 16- and 17-year-olds');
    const texas = textOf(sectionOf('Texas', 'en', 'teens'));
    expect(texas).toContain('8-48');
    expect(texas).toContain('midnight before non-school day');
    expect(textOf(sectionOf('Texas', 'es', 'teens'))).toContain('medianoche');
    // the federal rule that holds where a state's is less strict (Fact Sheet #43)
    expect(texas).toContain('less restrictive than the federal law, the federal law applies');
    expect(textOf(sectionOf('Delaware', 'en', 'teens'))).toContain(
      'combined hours of work and school',
    );
    // the state's two rows and one sentence on the federal rule: the shared text stays short
    for (const facts of STATE_FACTS)
      expect(contextOf(facts, 'es').find(({ id }) => id === 'teens')?.paragraphs).toHaveLength(3);
  });

  it.each(LANGS)('gives every state its teen limits with their two sources, in %s', (lang) => {
    for (const facts of STATE_FACTS) {
      const section = sectionOf(facts.tipped.name.en, lang, 'teens');
      expect(section?.sources).toContainEqual(SOURCES.childLaborTable);
      expect(section?.sources).toContainEqual(SOURCES.factSheet43);
    }
  });

  it('names the labor office of the DOL list, its phone and its website', () => {
    const alabama = sectionOf('Alabama', 'en', 'office');
    expect(textOf(alabama)).toContain('Alabama Department of Labor');
    expect(textOf(alabama)).toContain('334-309-9000');
    expect(textOf(alabama)).toContain('Montgomery');
    expect(alabama?.links).toContainEqual({
      label: 'www.labor.alabama.gov',
      href: 'https://www.labor.alabama.gov',
    });
    const texas = sectionOf('Texas', 'es', 'office');
    expect(textOf(texas)).toContain('Texas Workforce Commission');
    expect(textOf(texas)).toContain('800-628-5115');
    // the federal Wage and Hour Division takes the FLSA's minimum wage and overtime
    expect(textOf(texas)).toContain('1-866-487-9243');
    const dc = textOf(sectionOf('District of Columbia', 'en', 'office'));
    expect(dc).toContain('Department of Employment Services');
    expect(dc).toContain('Office of Human Rights');
  });

  it('prints no section that does not apply and cites a source in every one', () => {
    for (const facts of STATE_FACTS)
      for (const lang of LANGS)
        for (const section of contextOf(facts, lang)) {
          expect(section.sources.length).toBeGreaterThan(0);
          expect(textOf(section)).not.toMatch(/not applicable\.|no aplica\.|N\/A|undefined|NaN/);
        }
    expect(contextOf(factsOf('Texas'), 'en').map(({ id }) => id)).toEqual([
      'paycheck',
      'payday',
      'compare',
      'teens',
      'office',
    ]);
  });
});

describe('the state page and its context', () => {
  it('carries the context and lists every source it cites', () => {
    for (const facts of STATE_FACTS)
      for (const lang of LANGS) {
        const page = statePageOf(facts, lang);
        expect(page.context).toEqual(contextOf(facts, lang));
        const listed = page.sources.map(({ href }) => href);
        for (const section of page.context)
          for (const source of section.sources) expect(listed).toContain(source.href);
        expect(new Set(listed).size).toBe(listed.length);
      }
  });
});

/** The state's name as the neighbour lines use it: DC takes its article. */
const nameOfIn = (name: string, lang: Lang): string =>
  name === 'District of Columbia' || name === 'Distrito de Columbia'
    ? lang === 'en'
      ? `the ${name}`
      : `el ${name}`
    : name;
