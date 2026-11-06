import { decode, type Money } from '@maestro-calc/core';
import { overtime } from '@maestro-calc/pay-core/overtime';
import { payConverter } from '@maestro-calc/pay-core/pay-converter';
import { tippedWage } from '@maestro-calc/pay-core/tipped-wage';
import { describe, expect, it } from 'vitest';
import { dayText } from '../data/pages.ts';
import { moneyText } from '../format.ts';
import {
  MINIMUM_WAGE_STATES_GUIDE_PATHS,
  MINIMUM_WAGE_STATES_SOURCES,
} from '../guide/minimum-wage-states.ts';
import { OVERTIME_STATES_GUIDE_PATHS, OVERTIME_STATES_SOURCES } from '../guide/overtime-states.ts';
import {
  centsText,
  TIPPED_STATES_GUIDE_PATHS,
  TIPPED_STATES_SOURCES,
} from '../guide/tipped-states.ts';
import { OVERTIME_PATHS } from '../overtime/texts.ts';
import { PATHS } from '../pay-converter/texts.ts';
import { DESCRIPTION, TITLE_MAX } from '../seo/meta.ts';
import { TIPPED_PATHS } from '../tipped/texts.ts';
import { STATE_FACTS, statePageOf, statesIndexOf, type StatePage } from './pages.ts';
import { STATE_ROUTES, STATE_SLUGS, STATES_INDEX_PATHS } from './routes.ts';

const LANGS = ['en', 'es'] as const;
const PAGES = STATE_FACTS.flatMap((facts) =>
  LANGS.map((lang) => ({ facts, lang, page: statePageOf(facts, lang) })),
);

const factOf = (page: StatePage, section: string, key: string): string | undefined =>
  page.sections.find(({ id }) => id === section)?.facts.find((fact) => fact.key === key)?.value;
const exampleOf = (page: StatePage, id: string) => {
  const example = page.examples.items.find((each) => each.id === id);
  if (example === undefined) throw new Error(`no example ${id}`);
  return example;
};
/** The inputs a calculator link opens, decoded the way the calculator reads its address. */
const queryOf = (href: string): string => new URL(href, 'https://cuentahoras.com').search.slice(1);
const ran = (outputs: readonly { key: string; value: unknown }[], key: string): string =>
  moneyText(outputs.find((output) => output.key === key)?.value as Money);
const dollarsOf = (cents: number): string => (cents / 100).toFixed(2);
const runWeek = (rate: number, rule: 'federal' | 'california', day: number) => {
  const result = overtime.run({
    rate: dollarsOf(rate),
    rule,
    mon: String(day),
    tue: String(day),
    wed: String(day),
    thu: String(day),
    fri: String(day),
    sat: '0',
    sun: '0',
  });
  if (!result.ok) throw new Error('the week must run');
  return result.value.outputs;
};

describe('STATE_FACTS (the three state tables joined by state)', () => {
  it('joins one row of each table for every state and DC, in the order of the slugs', () => {
    expect(STATE_FACTS.map(({ slug }) => slug)).toEqual(STATE_SLUGS);
    for (const { tipped, minimum, overtime: rule } of STATE_FACTS) {
      expect(minimum.name).toEqual(tipped.name);
      expect(rule.name).toEqual(tipped.name);
    }
  });
});

describe('statePageOf', () => {
  it('has a page for every state and DC in both languages, at its route', () => {
    expect(PAGES).toHaveLength(102);
    for (const { facts, page } of PAGES) {
      const route = STATE_ROUTES.find(({ id }) => id === `state-${facts.slug.en}`);
      expect(page.paths).toEqual({ en: route?.en, es: route?.es });
    }
  });

  it.each(LANGS)(
    'shows the minimum wage, its basis and the 2027 rate of the table in %s',
    (lang) => {
      for (const { facts, page } of PAGES.filter((each) => each.lang === lang)) {
        const { minimum } = facts;
        expect(factOf(page, 'minimum', 'wage')).toBe(centsText(minimum.wage));
        expect(factOf(page, 'minimum', 'scheduled')).toBe(
          minimum.scheduled === undefined ? undefined : centsText(minimum.scheduled.wage),
        );
        const section = page.sections.find(({ id }) => id === 'minimum');
        expect(section?.sources[0]).toEqual({
          label: MINIMUM_WAGE_STATES_SOURCES[minimum.source].label,
          href: MINIMUM_WAGE_STATES_SOURCES[minimum.source].href,
        });
        if (minimum.notes !== undefined) expect(section?.notes).toContain(minimum.notes[lang]);
        if (minimum.scheduled !== undefined)
          expect(section?.sources.map(({ href }) => href)).toContain(
            MINIMUM_WAGE_STATES_SOURCES[minimum.scheduled.source].href,
          );
      }
    },
  );

  it.each(LANGS)('shows the cash wage, tip credit and full minimum of the table in %s', (lang) => {
    for (const { facts, page } of PAGES.filter((each) => each.lang === lang)) {
      const { tipped } = facts;
      expect(factOf(page, 'tipped', 'cash')).toBe(centsText(tipped.cash));
      expect(factOf(page, 'tipped', 'credit')).toBe(
        tipped.credit === 0 ? (lang === 'en' ? 'None' : 'Ninguno') : centsText(tipped.credit),
      );
      expect(factOf(page, 'tipped', 'minimum')).toBe(centsText(tipped.minimum));
      const section = page.sections.find(({ id }) => id === 'tipped');
      expect(section?.sources).toEqual([TIPPED_STATES_SOURCES[tipped.source]]);
      if (tipped.notes !== undefined) expect(section?.notes).toContain(tipped.notes[lang]);
    }
  });

  it.each(LANGS)('shows the overtime rule of the table and its sources in %s', (lang) => {
    for (const { facts, page } of PAGES.filter((each) => each.lang === lang)) {
      const rule = facts.overtime;
      expect(factOf(page, 'overtime', 'weekly')).toBe(`${String(rule.weekly)} h`);
      expect(factOf(page, 'overtime', 'daily')).toBe(
        rule.daily === undefined ? (lang === 'en' ? 'No' : 'No') : `${String(rule.daily)} h`,
      );
      expect(factOf(page, 'overtime', 'doubleTime')).toBe(rule.doubleTime?.[lang]);
      expect(factOf(page, 'overtime', 'seventhDay')).toBe(rule.seventhDay?.[lang]);
      const section = page.sections.find(({ id }) => id === 'overtime');
      expect(section?.sources[0]).toEqual(OVERTIME_STATES_SOURCES[rule.source]);
      if (rule.notesSource !== undefined)
        expect(section?.sources).toContainEqual(OVERTIME_STATES_SOURCES[rule.notesSource]);
      if (rule.notes !== undefined) expect(section?.notes).toContain(rule.notes[lang]);
    }
  });

  it.each(LANGS)('dates every section with the day its table was checked, in %s', (lang) => {
    for (const { page } of PAGES.filter((each) => each.lang === lang))
      for (const section of page.sections)
        expect(section.checked).toBe(dayText('2026-11-05', lang));
  });

  it('answers first: the minimum wage, then when overtime is owed', () => {
    const california = PAGES.find(
      ({ facts, lang }) => facts.slug.en === 'california' && lang === 'en',
    );
    expect(california?.page.lead).toMatch(
      /^The minimum wage in California is \$16\.90 an hour in 2026; overtime is owed after 8 hours a day or 40 a week\./,
    );
    expect(california?.page.lead).toContain('$17.40 on January 1, 2027');
    const dc = PAGES.find(
      ({ facts, lang }) => facts.slug.en === 'district-of-columbia' && lang === 'es',
    );
    expect(dc?.page.lead).toMatch(
      /^El salario mínimo en el Distrito de Columbia es \$18\.40 la hora en 2026;/,
    );
    const alabama = PAGES.find(({ facts, lang }) => facts.slug.en === 'alabama' && lang === 'en');
    expect(alabama?.page.lead).toMatch(
      /^The minimum wage in Alabama is \$7\.25 an hour in 2026; overtime is owed after 40 hours a week, under federal law\. The \$7\.25 is the federal rate: Alabama has no minimum wage law\./,
    );
    const kansas = PAGES.find(({ facts, lang }) => facts.slug.en === 'kansas' && lang === 'en');
    expect(kansas?.page.lead).toContain('after 40 hours a week for most workers');
    expect(kansas?.page.lead).toContain('46-hour');
    const newYork = PAGES.find(({ facts, lang }) => facts.slug.en === 'new-york' && lang === 'en');
    expect(newYork?.page.lead).toContain('Rest of the state: $16.00.');
    for (const { facts, lang, page } of PAGES) {
      if (!facts.minimum.federal && facts.minimum.notes !== undefined)
        expect(page.lead).toContain(facts.minimum.notes[lang]);
      expect(page.lead).toContain(centsText(facts.minimum.wage));
      expect(page.lead).toContain(facts.tipped.name[lang]);
    }
  });

  it('gives each page a title and a description of its own that a result shows whole', () => {
    for (const { page } of PAGES) {
      expect(page.title.length).toBeLessThanOrEqual(TITLE_MAX);
      expect(page.description.length).toBeGreaterThanOrEqual(DESCRIPTION.min);
      expect(page.description.length, page.description).toBeLessThanOrEqual(DESCRIPTION.max);
    }
    expect(new Set(PAGES.map(({ page }) => page.title)).size).toBe(102);
    expect(new Set(PAGES.map(({ page }) => page.description)).size).toBe(102);
    const california = STATE_FACTS.find(({ slug }) => slug.en === 'california');
    if (california === undefined) throw new Error('no California');
    expect(statePageOf(california, 'en').title).toBe(
      'California wage and hour laws, 2026 | Cuenta Horas',
    );
    expect(statePageOf(california, 'es').h1).toBe('Leyes de salario y horas en California, 2026');
  });
});

describe('the worked examples of a state page', () => {
  it('pays 40 and 45 hours at the state minimum with the overtime engine, on its rule', () => {
    for (const { facts, lang, page } of PAGES) {
      const rule = facts.slug.en === 'california' ? 'california' : 'federal';
      const forty = exampleOf(page, 'week40');
      const fortyFive = exampleOf(page, 'week45');
      expect(forty.value).toBe(ran(runWeek(facts.minimum.wage, rule, 8), 'pay'));
      expect(fortyFive.value).toBe(ran(runWeek(facts.minimum.wage, rule, 9), 'pay'));
      expect(fortyFive.detail).toContain(ran(runWeek(facts.minimum.wage, rule, 9), 'overtimeRate'));
      for (const example of [forty, fortyFive]) {
        expect(example.href?.startsWith(`${OVERTIME_PATHS[lang]}?`)).toBe(true);
        const { state, issues } = decode(overtime, queryOf(example.href ?? ''));
        expect(issues).toEqual([]);
        expect(state.rule).toBe(rule);
        expect(moneyText(state.rate)).toBe(centsText(facts.minimum.wage));
      }
    }
  });

  it('gives the yearly pay of full time at the state minimum with the pay converter', () => {
    for (const { facts, lang, page } of PAGES) {
      const annual = exampleOf(page, 'annual');
      const result = payConverter.run({ amount: dollarsOf(facts.minimum.wage), per: 'hour' });
      if (!result.ok) throw new Error('the conversion must run');
      expect(annual.value).toBe(ran(result.value.outputs, 'annual'));
      expect(annual.href?.startsWith(`${PATHS.hourly[lang]}?`)).toBe(true);
      const { state, issues } = decode(payConverter, queryOf(annual.href ?? ''));
      expect(issues).toEqual([]);
      expect(state.per).toBe('hour');
      expect(moneyText(state.amount)).toBe(centsText(facts.minimum.wage));
    }
  });

  it('gives the pay a tipped worker is guaranteed for 30 hours: the full minimum, before tips', () => {
    for (const { facts, page } of PAGES) {
      const tipped = exampleOf(page, 'tipped30');
      const guaranteed = runWeek(facts.tipped.minimum, 'federal', 6);
      expect(tipped.value).toBe(ran(guaranteed, 'pay'));
      // the cash wages of the 30 hours, whole dollars as a sentence writes them
      const wages = ran(runWeek(facts.tipped.cash, 'federal', 6), 'pay').replace(/\.00$/, '');
      if (facts.tipped.credit > 0) expect(tipped.detail).toContain(`${wages} `);
    }
  });

  it('opens the tipped wage calculator on the 30 hours only where it applies the state minimum', () => {
    for (const { facts, lang, page } of PAGES) {
      const tipped = exampleOf(page, 'tipped30');
      if (facts.tipped.minimum !== 725) {
        expect(tipped.href).toBeUndefined();
        continue;
      }
      expect(tipped.href?.startsWith(`${TIPPED_PATHS[lang]}?`)).toBe(true);
      const { state, issues } = decode(tippedWage, queryOf(tipped.href ?? ''));
      expect(issues).toEqual([]);
      const week = { cashWage: dollarsOf(facts.tipped.cash), tips: '0', hours: '30' };
      const validated = tippedWage.validate(week);
      if (!validated.ok) throw new Error('the tipped week must validate');
      expect(state).toEqual(validated.value);
      const result = tippedWage.run(week);
      if (!result.ok) throw new Error('the tipped week must run');
      expect(ran(result.value.outputs, 'totalPay')).toBe(tipped.value);
    }
  });

  it('says when the calculator applies the federal rule to a state with its own daily rule', () => {
    for (const { facts, lang, page } of PAGES) {
      const daily = facts.overtime.daily !== undefined && facts.slug.en !== 'california';
      const said = page.examples.notes.some((note) =>
        note.includes(lang === 'en' ? 'daily rule' : 'regla por día'),
      );
      expect(said, facts.slug.en).toBe(daily);
    }
  });
});

describe('statesIndexOf', () => {
  it.each(LANGS)('lists every state page once, by name in %s, with its minimum wage', (lang) => {
    const index = statesIndexOf(lang);
    expect(index.paths).toEqual(STATES_INDEX_PATHS);
    expect(index.items.map(({ href }) => href).sort()).toEqual(
      STATE_ROUTES.map((route) => route[lang]).sort(),
    );
    const names = index.items.map(({ name }) => name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, lang)));
    for (const item of index.items) {
      const facts = STATE_FACTS.find(({ tipped }) => tipped.name[lang] === item.name);
      expect(item.summary).toContain(centsText(facts?.minimum.wage ?? 0));
    }
  });

  it('links the three state tables it is built from', () => {
    for (const lang of LANGS)
      expect(statesIndexOf(lang).tables.map(({ href }) => href)).toEqual([
        MINIMUM_WAGE_STATES_GUIDE_PATHS[lang],
        TIPPED_STATES_GUIDE_PATHS[lang],
        OVERTIME_STATES_GUIDE_PATHS[lang],
      ]);
  });
});
