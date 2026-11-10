import { decode, type Money, type Rational } from '@maestro-calc/core';
import { NEVADA_MINIMUM_WAGE, overtime, type Rule } from '@maestro-calc/pay-core/overtime';
import { payConverter } from '@maestro-calc/pay-core/pay-converter';
import { tippedWage } from '@maestro-calc/pay-core/tipped-wage';
import { describe, expect, it } from 'vitest';
import { dayText } from '../data/pages.ts';
import { moneyText } from '../format.ts';
import {
  MINIMUM_WAGE_STATES_GUIDE_PATHS,
  MINIMUM_WAGE_STATES_SOURCES,
} from '../guide/minimum-wage-states.ts';
import { MINIMUM_WAGE_2027_GUIDE_PATHS, riseOf } from '../guide/minimum-wage-2027.ts';
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
const runWeek = (rate: number, rule: Rule, day: number) => {
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

  it.each(LANGS)('links the 2027 increases from each state that has one, in %s', (lang) => {
    for (const { facts, page } of PAGES.filter((each) => each.lang === lang)) {
      const section = page.sections.find(({ id }) => id === 'minimum');
      expect(section?.rise, facts.tipped.name.en).toEqual(riseOf(facts.tipped.name.en, lang));
      if (facts.minimum.scheduled !== undefined)
        expect(section?.rise?.href).toBe(MINIMUM_WAGE_2027_GUIDE_PATHS[lang]);
    }
    const ohio = PAGES.find(
      ({ facts, lang: at }) => at === lang && facts.tipped.name.en === 'Ohio',
    );
    expect(ohio?.page.sections[0]?.rise?.label).toBe(
      lang === 'en' ? 'Rises to $11.40 on January 1, 2027' : 'Sube a $11.40 el 1 de enero de 2027',
    );
  });

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
        expect(section.checked).toBe(
          dayText(section.id === 'minimum' ? '2026-11-06' : '2026-11-05', lang),
        );
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
    // the search it answers: "california overtime law calculator"
    expect(statePageOf(california, 'en').title).toBe(
      'California overtime law and minimum wage, 2026 | Cuenta Horas',
    );
    expect(statePageOf(california, 'es').h1).toBe(
      'Ley de horas extra y salario mínimo en California, 2026',
    );
  });

  it('opens the overtime calculator on the state’s rule from a link right under the answer', () => {
    for (const { facts, page } of PAGES) {
      const rule: Rule = facts.overtime.daily === undefined ? 'federal' : (facts.slug.en as Rule);
      expect(page.calculate.href).toBe(exampleOf(page, 'week45').href);
      const { state, issues } = decode(overtime, queryOf(page.calculate.href));
      expect(issues).toEqual([]);
      expect(state.rule).toBe(rule);
    }
    const label = (slug: string, lang: (typeof LANGS)[number]): string | undefined =>
      PAGES.find((each) => each.facts.slug.en === slug && each.lang === lang)?.page.calculate.label;
    expect(label('california', 'en')).toBe('Calculate California overtime');
    expect(label('california', 'es')).toBe('Calcula las horas extra en California');
    expect(label('district-of-columbia', 'en')).toBe('Calculate District of Columbia overtime');
    expect(label('district-of-columbia', 'es')).toBe(
      'Calcula las horas extra en el Distrito de Columbia',
    );
  });
});

describe('the worked examples of a state page', () => {
  it('names the state in every worked example, so two states at one rate read apart', () => {
    for (const { facts, lang, page } of PAGES)
      for (const example of page.examples.items)
        expect(example.detail, example.id).toContain(facts.tipped.name[lang]);
    const texas = PAGES.find(({ facts, lang }) => facts.slug.en === 'texas' && lang === 'en');
    expect(texas?.page.examples.items[0]?.detail).toBe(
      'Five 8-hour days at the $7.25 minimum of Texas, before taxes: 40 regular hours, no overtime.',
    );
  });

  it('pays 40 and 45 hours at the state minimum with the overtime engine, on its rule', () => {
    for (const { facts, lang, page } of PAGES) {
      const rule: Rule = facts.overtime.daily === undefined ? 'federal' : (facts.slug.en as Rule);
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

  it('opens the tipped wage calculator on the 30 hours with the state’s figures, in every state', () => {
    for (const { facts, lang, page } of PAGES) {
      const tipped = exampleOf(page, 'tipped30');
      expect(tipped.href?.startsWith(`${TIPPED_PATHS[lang]}?`), facts.slug.en).toBe(true);
      const { state, issues } = decode(tippedWage, queryOf(tipped.href ?? ''));
      expect(issues).toEqual([]);
      // the link holds the three figures of the state's row of the tipped table
      expect(moneyText(state.cashWage)).toBe(centsText(facts.tipped.cash));
      expect(moneyText(state.minimumWage)).toBe(centsText(facts.tipped.minimum));
      expect(moneyText(state.maxTipCredit)).toBe(centsText(facts.tipped.credit));
      const result = tippedWage.run({
        cashWage: dollarsOf(facts.tipped.cash),
        minimumWage: dollarsOf(facts.tipped.minimum),
        maxTipCredit: dollarsOf(facts.tipped.credit),
        tips: '0',
        hours: '30',
      });
      if (!result.ok) throw new Error('the tipped week must run');
      expect(ran(result.value.outputs, 'totalPay')).toBe(tipped.value);
      expect(tipped.linkLabel).toBe(
        lang === 'en'
          ? 'Open these 30 hours in the tipped wage calculator'
          : 'Abre estas 30 horas en la calculadora de propinas por hora',
      );
    }
  });

  it('keeps the federal link of a federal state as it was: only the cash wage, tips and hours', () => {
    const alabama = PAGES.find(({ facts, lang }) => facts.slug.en === 'alabama' && lang === 'en');
    if (alabama === undefined) throw new Error('no Alabama');
    expect(exampleOf(alabama.page, 'tipped30').href).toBe(`${TIPPED_PATHS.en}?v=1&t=0&h=30`);
  });

  it('no longer says the tipped wage calculator applies only the federal minimum', () => {
    for (const { page } of PAGES) {
      for (const note of page.examples.notes) expect(note).not.toContain('$7.25');
    }
  });

  it('opens the overtime calculator on the state’s own rule wherever the table has a daily rule', () => {
    for (const { facts, page } of PAGES) {
      const { state } = decode(overtime, queryOf(exampleOf(page, 'week45').href ?? ''));
      const daily = facts.overtime.daily !== undefined;
      expect(state.rule !== 'federal', facts.slug.en).toBe(daily);
      if (daily) expect(state.rule, facts.slug.en).toBe(facts.slug.en);
    }
  });

  it('no longer says the calculator applies the federal rule to a state with a daily rule', () => {
    for (const { lang, page } of PAGES) {
      for (const note of page.examples.notes) {
        expect(note).not.toContain(
          lang === 'en'
            ? 'applies the federal rule and California'
            : 'aplica la regla federal y la de California',
        );
      }
    }
  });

  it('says how Alaska, Nevada and Colorado count an hour once, which their sources leave open', () => {
    for (const { facts, lang, page } of PAGES) {
      const said = page.examples.notes.some((note) =>
        note.includes(lang === 'en' ? 'counts each hour once' : 'cuenta cada hora una vez'),
      );
      expect(said, facts.slug.en).toBe(['alaska', 'nevada', 'colorado'].includes(facts.slug.en));
    }
  });

  it('says on the Colorado page that the 12 consecutive hours across two days are not applied', () => {
    for (const { facts, lang, page } of PAGES) {
      const said = page.examples.notes.some((note) =>
        note.includes(lang === 'en' ? '12 consecutive hours' : '12 horas seguidas'),
      );
      expect(said, facts.slug.en).toBe(facts.slug.en === 'colorado');
    }
  });

  it('gives Nevada its wage line, $18.00, from the $12.00 minimum of the table', () => {
    for (const { facts, page } of PAGES) {
      if (facts.slug.en !== 'nevada') continue;
      expect(page.examples.notes.join(' ')).toContain('$18.00');
    }
  });
});

describe('the overtime engine and the state tables', () => {
  it('holds the Nevada minimum wage of the minimum wage table', () => {
    const nevada = STATE_FACTS.find(({ slug }) => slug.en === 'nevada');
    expect(moneyText(NEVADA_MINIMUM_WAGE)).toBe(centsText(nevada?.minimum.wage ?? 0));
  });

  it('pays past the daily hours of the overtime table, and not at them, in each daily state', () => {
    for (const facts of STATE_FACTS) {
      const daily = facts.overtime.daily;
      if (daily === undefined) continue;
      const rule = facts.slug.en as Rule;
      const hours = (day: number) => {
        // one long Monday at $15, under Nevada's line, and nothing else
        const result = overtime.run({
          rate: '15',
          rule,
          mon: String(day),
          tue: '0',
          wed: '0',
          thu: '0',
          fri: '0',
          sat: '0',
          sun: '0',
        });
        if (!result.ok) throw new Error('the day must run');
        const value = result.value.outputs.find(({ key }) => key === 'overtimeHours')?.value;
        return (value as Rational).sign();
      };
      expect(hours(daily), facts.slug.en).toBe(0);
      expect(hours(daily + 1), facts.slug.en).toBe(1);
    }
  });
});

describe('the sources of a state page', () => {
  it.each(LANGS)(
    'lists them once and points each section to that list, in %s',
    (lang) => {
      for (const { page } of PAGES.filter((each) => each.lang === lang)) {
        expect(page.cite).toEqual({
          label: lang === 'en' ? 'Sources' : 'Fuentes',
          href: '#sources',
        });
        expect(page.labels.sources).toBe(page.cite.label);
      }
    },
  );
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
