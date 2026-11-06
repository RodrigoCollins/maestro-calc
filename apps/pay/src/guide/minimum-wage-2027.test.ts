import { Rational, subMoney, usd, type Money } from '@maestro-calc/core';
import { payConverter } from '@maestro-calc/pay-core/pay-converter';
import { describe, expect, it } from 'vitest';
import { moneyText } from '../format.ts';
import { PAY_CONVERTER_TEXTS } from '../pay-converter/texts.ts';
import { ROUTES } from '../routes.ts';
import { GUIDE_CALCULATORS } from '../site-check/link-rules.ts';
import { statePathOf } from '../states/routes.ts';
import {
  increasesOf,
  INCREASES_2027,
  MINIMUM_WAGE_2027_GUIDE,
  MINIMUM_WAGE_2027_GUIDE_PATHS,
  MINIMUM_WAGE_2027_SOURCES,
  riseOf,
} from './minimum-wage-2027.ts';
import {
  MINIMUM_WAGE_STATES,
  MINIMUM_WAGE_STATES_GUIDE,
  MINIMUM_WAGE_STATES_SOURCES,
  UNCHANGED_2027,
  UNCONFIRMED_2027,
} from './minimum-wage-states.ts';
import { centsText } from './tipped-states.ts';

const LANGS = ['en', 'es'] as const;

// Hand-verified: (new − current) cents, its share of the current rate, and 2,080 hours (40 a week,
// 52 weeks) times the difference.
const HAND: Readonly<Record<string, readonly [string, string, string, string, string]>> = {
  Washington: ['$17.13', '$17.73', '$0.60', '3.5%', '$1,248.00'],
  Connecticut: ['$16.94', '$17.48', '$0.54', '3.2%', '$1,123.20'],
  California: ['$16.90', '$17.40', '$0.50', '3.0%', '$1,040.00'],
  'New Jersey': ['$15.92', '$16.48', '$0.56', '3.5%', '$1,164.80'],
  Michigan: ['$13.73', '$15.00', '$1.27', '9.2%', '$2,641.60'],
  Virginia: ['$12.77', '$13.75', '$0.98', '7.7%', '$2,038.40'],
  'South Dakota': ['$11.85', '$12.30', '$0.45', '3.8%', '$936.00'],
  Minnesota: ['$11.41', '$11.87', '$0.46', '4.0%', '$956.80'],
  Ohio: ['$11.00', '$11.40', '$0.40', '3.6%', '$832.00'],
  Montana: ['$10.85', '$11.20', '$0.35', '3.2%', '$728.00'],
};

const annualOf = (cents: number): Money => {
  const ran = payConverter.run({ amount: (cents / 100).toFixed(2), per: 'hour' });
  if (!ran.ok) throw new Error(String(cents));
  const annual = ran.value.outputs.find(({ key }) => key === 'annual')?.value;
  if (annual === undefined) throw new Error('no annual output');
  return annual;
};

describe('the minimum wage increases of January 1, 2027', () => {
  it('lists every state with a scheduled rate, and only those, highest new rate first', () => {
    const scheduled = MINIMUM_WAGE_STATES.filter(({ scheduled: next }) => next !== undefined);
    expect(INCREASES_2027.map(({ state }) => state.name.en).sort()).toEqual(
      scheduled.map(({ name }) => name.en).sort(),
    );
    expect(INCREASES_2027.map(({ state }) => state.name.en)).toEqual(Object.keys(HAND));
    const rates = INCREASES_2027.map(({ next }) => next);
    expect(rates).toEqual([...rates].sort((a, b) => b - a));
  });

  it('takes the current and new rates from the data module, and the year from the engine', () => {
    for (const { state, current, next, annual } of INCREASES_2027) {
      expect(current, state.name.en).toBe(state.wage);
      expect(next, state.name.en).toBe(state.scheduled?.wage);
      expect(annual, state.name.en).toEqual(subMoney(annualOf(next), annualOf(current)));
      expect(annual, state.name.en).toEqual(usd(Rational.of((next - current) * 2080, 100)));
    }
  });

  it.each(LANGS)('prints each row as hand-verified in %s', (lang) => {
    const rows = increasesOf(lang);
    expect(
      rows.map(({ current, next, increase, percent, annual }) => [
        current,
        next,
        increase,
        percent,
        annual,
      ]),
    ).toEqual(Object.values(HAND));
    for (const row of rows) {
      const state = MINIMUM_WAGE_STATES.find(({ name }) => name[lang] === row.name);
      expect(state, row.name).toBeDefined();
      expect(row.href).toBe(statePathOf(state?.name[lang] ?? '', lang));
      const source = MINIMUM_WAGE_STATES_SOURCES[state?.scheduled?.source ?? 'dol'];
      expect(row.source.href, row.name).toBe(source.href);
      expect(row.notes, row.name).toBe(state?.scheduled?.notes?.[lang]);
    }
  });

  it('gives the state pages the rise of each state, and nothing for the others', () => {
    for (const lang of LANGS) {
      for (const state of MINIMUM_WAGE_STATES) {
        const rise = riseOf(state.name.en, lang);
        if (state.scheduled === undefined) {
          expect(rise, state.name.en).toBeUndefined();
          continue;
        }
        expect(rise?.href).toBe(MINIMUM_WAGE_2027_GUIDE_PATHS[lang]);
        expect(rise?.label).toContain(centsText(state.scheduled.wage));
      }
    }
    expect(riseOf('Washington', 'en')?.label).toBe('Rises to $17.73 on January 1, 2027');
    expect(riseOf('Washington', 'es')?.label).toBe('Sube a $17.73 el 1 de enero de 2027');
  });

  it.each(LANGS)('%s: answers first with the count and the highest new rate', (lang) => {
    const { lead } = MINIMUM_WAGE_2027_GUIDE[lang];
    expect(lead).toContain(String(INCREASES_2027.length));
    expect(lead).toContain('$17.73');
    expect(lead).toContain(lang === 'en' ? 'Michigan' : 'Míchigan');
    expect(lead).toContain('$1.27');
  });

  it.each(LANGS)('%s: names New York as unchanged and every unconfirmed state', (lang) => {
    const t = MINIMUM_WAGE_2027_GUIDE[lang];
    expect(t.unchanged.items.map(({ source }) => source.href)).toEqual(
      UNCHANGED_2027.map(({ source }) => MINIMUM_WAGE_STATES_SOURCES[source].href),
    );
    expect(t.unconfirmed.items.map(({ href }) => href)).toEqual(
      UNCONFIRMED_2027.map(({ check }) => check.href),
    );
    for (const item of t.unconfirmed.items) expect(item.reason.length).toBeGreaterThan(0);
  });

  it('cites the DOL first and every source of a row or of the unchanged list', () => {
    const [first, ...rest] = Object.values(MINIMUM_WAGE_2027_SOURCES);
    expect(first?.href).toBe(MINIMUM_WAGE_STATES_SOURCES.dol.href);
    const used = new Set([
      ...INCREASES_2027.map(
        ({ state }) => MINIMUM_WAGE_STATES_SOURCES[state.scheduled?.source ?? 'dol'].href,
      ),
      ...UNCHANGED_2027.map(({ source }) => MINIMUM_WAGE_STATES_SOURCES[source].href),
    ]);
    expect(new Set([first?.href, ...rest.map(({ href }) => href)])).toEqual(
      new Set([MINIMUM_WAGE_STATES_SOURCES.dol.href, ...used]),
    );
  });

  it('is a citable table of the route table, linked from the minimum wage table', () => {
    expect(ROUTES).toContainEqual({
      id: 'minimum-wage-2027-states-guide',
      kind: 'article',
      ...MINIMUM_WAGE_2027_GUIDE_PATHS,
    });
    expect(GUIDE_CALCULATORS['minimum-wage-2027-states-guide']).toEqual(['hourly-to-salary']);
    for (const lang of LANGS) {
      const t = MINIMUM_WAGE_2027_GUIDE[lang];
      expect(t.cite.text).toContain(
        `https://cuentahoras.com${MINIMUM_WAGE_2027_GUIDE_PATHS[lang]}`,
      );
      expect(t.title.length, t.title).toBeLessThanOrEqual(70);
      expect(t.description.length, t.description).toBeLessThanOrEqual(160);
      expect(t.disclaimer).toMatch(/not legal advice|no asesoría legal/);
      expect(t.reviewed).toMatch(/November 6, 2026|6 de noviembre de 2026/);
      for (const { href } of t.ctas) expect(href.startsWith('/es/'), href).toBe(lang === 'es');
      expect(PAY_CONVERTER_TEXTS[lang].minimumWage2027.href).toBe(
        MINIMUM_WAGE_2027_GUIDE_PATHS[lang],
      );
      expect(MINIMUM_WAGE_STATES_GUIDE[lang].ctas.map(({ href }) => href)).toContain(
        MINIMUM_WAGE_2027_GUIDE_PATHS[lang],
      );
    }
  });

  it('formats money as the engine writes it', () => {
    expect(moneyText(usd(1248))).toBe('$1,248.00');
  });
});
