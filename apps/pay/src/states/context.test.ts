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
  it('works a paycheck, a month and a 50-hour week out at the California minimum', () => {
    const text = textOf(sectionOf('California', 'en', 'paycheck'));
    // $16.90 x 40 = $676; x 2,080 = $35,152; / 12 = $2,929.33; every two weeks $1,352
    expect(text).toContain('$676');
    expect(text).toContain('$1,352');
    expect(text).toContain('$2,929.33');
    expect(text).toContain('$35,152');
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

  it('prints no section that does not apply and cites a source in every one', () => {
    for (const facts of STATE_FACTS)
      for (const lang of LANGS)
        for (const section of contextOf(facts, lang)) {
          expect(section.sources.length).toBeGreaterThan(0);
          expect(textOf(section)).not.toMatch(/not applicable|no aplica|N\/A|undefined|NaN/);
        }
    expect(contextOf(factsOf('Texas'), 'en').map(({ id }) => id)).toEqual(['paycheck', 'compare']);
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
