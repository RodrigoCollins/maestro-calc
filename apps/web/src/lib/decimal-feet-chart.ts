import { encode, ft, inch, mm, quantity, Rational, valueIn } from '@maestro-calc/core';
import { feetInches } from '@maestro-calc/core/calculators/feet-inches';
import type { MaterialSource } from '@maestro-calc/data';
import { createTranslator, type Locale } from '@maestro-calc/i18n';
import { enFeetInches } from '@maestro-calc/i18n/catalogs/en/feet-inches';
import { esFeetInches } from '@maestro-calc/i18n/catalogs/es/feet-inches';
import { decimalText, outputText } from '../calculator/present.ts';
import type { Job, JobCase } from '../routing/jobs.ts';
import { pathOf } from '../routing/routes.ts';
import type { JobFact, JobRow, JobTable } from './job-view.ts';
import type { ChartReverse } from './roof-pitch-chart.ts';
import { siteText } from './site-text.ts';

/*
 * The decimal feet to feet and inches chart (growth plan, reference charts): every length of the
 * chart typed in decimal feet and multiplied by 1, so the feet and inches engine writes it back in
 * feet, inches and sixteenths at build time, with its decimal inches; and an inches
 * to decimal feet table read the other way round.
 */

/**
 * The source of the exact factors (1 ft = 12 in, 1 in = 25.4 mm): the one the feet and inches
 * calculator page lists first (a test holds it to the frontmatter of both entries).
 */
export const NIST_SP_811: Required<MaterialSource> = {
  name: 'NIST SP 811, Appendix B (conversion factors)',
  url: 'https://www.nist.gov/pml/special-publication-811',
  retrieved: '2026-10-30',
};

/** The whole inches of the inches to decimal feet table. */
export const REVERSE_INCHES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

const catalogs = { en: createTranslator(enFeetInches), es: createTranslator(esFeetInches) };

const outputOf = (key: (typeof feetInches.outputs)[number]['key']) => {
  const output = feetInches.outputs.find((each) => each.key === key);
  if (output === undefined) throw new Error(`the feet and inches engine has no ${key} output`);
  return output;
};

const stateOf = (raw: JobCase) => {
  const result = feetInches.validate(raw);
  if (!result.ok) throw new Error(`invalid chart case: ${JSON.stringify(raw)}`);
  return result.value;
};

/** Every length of the chart in feet and inches and in decimal inches, as the calculator shows them. */
export const decimalFeetChartTable = (cases: Job['cases'], locale: Locale): JobTable => {
  const calc = catalogs[locale];
  const text = siteText(locale);
  const keys = ['result', 'resultIn'] as const;
  const toRow = (raw: JobCase): JobRow => {
    const state = stateOf(raw);
    const { outputs } = feetInches.compute(state);
    return {
      label: `${raw['first'] ?? ''} ft`,
      // the hundredths of a foot stay plain text, so the chart fits the HTML budget
      href:
        Number(raw['first']) < 1
          ? undefined
          : `${pathOf('feet-inches', locale)}?${encode(feetInches, state, { unitSystem: 'imperial' })}`,
      cells: keys.map((key) => outputText(outputOf(key), outputs[key])),
    };
  };
  const [first, ...rest] = cases;
  const rows = [toRow(first), ...rest.map(toRow)] as const;
  return {
    lead: `${text('page.decimal-feet-chart.decimal')}: ${rows[0].label}`,
    answer: rows[0].cells[0] ?? '',
    facts: [],
    columns: [
      text('page.decimal-feet-chart.decimal'),
      ...keys.map((key) => calc(`calc.feet-inches.outputs.${key}`)),
    ],
    rows,
    calculatorName: calc('calc.feet-inches.title'),
  };
};

/** The exact factors the chart rests on, and the rounding of its feet and inches. */
export const decimalFeetChartBasis = (locale: Locale): JobFact[] => {
  const text = siteText(locale);
  const oneFoot = valueIn(quantity(1, ft), inch);
  const oneInch = valueIn(quantity(1, inch), mm);
  return [
    { label: text('page.decimal-feet-chart.foot'), value: `${decimalText(oneFoot, 0, false)} in` },
    { label: text('page.decimal-feet-chart.inch'), value: `${decimalText(oneInch, 1, false)} mm` },
    {
      label: text('page.decimal-feet-chart.rounding'),
      value: text('page.decimal-feet-chart.sixteenth'),
    },
  ];
};

/** The inches to decimal feet table: each whole inch as a decimal of a foot, to four places. */
export const decimalFeetReverse = (locale: Locale): ChartReverse => {
  const text = siteText(locale);
  return {
    heading: text('page.decimal-feet-chart.reverse'),
    lead: text('page.decimal-feet-chart.reverseLead'),
    columns: [text('page.decimal-feet-chart.inches'), text('page.decimal-feet-chart.decimal')],
    rows: REVERSE_INCHES.map((inches) => ({
      label: `${String(inches)} in`,
      cells: [`${decimalText(valueIn(quantity(Rational.of(inches), inch), ft), 4, false)} ft`],
    })),
  };
};
