import { ft, ft2, m, m2, quantity, Rational, valueIn } from '@maestro-calc/core';
import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import type { MaterialSource } from '@maestro-calc/data';
import { createTranslator, type Locale } from '@maestro-calc/i18n';
import { enRectangleArea } from '@maestro-calc/i18n/catalogs/en/rectangle-area';
import { esRectangleArea } from '@maestro-calc/i18n/catalogs/es/rectangle-area';
import { decimalText, outputText } from '../calculator/present.ts';
import type { Job, JobCase } from '../routing/jobs.ts';
import type { JobFact, JobRow, JobTable } from './job-view.ts';
import type { ChartReverse } from './roof-pitch-chart.ts';
import { siteText } from './site-text.ts';

/*
 * The square feet to square meters chart (growth plan, reference charts): every area of the chart
 * typed as a strip that many feet long and 1 ft wide, so the square footage engine works its square
 * meters out at build time; and a square meters to square feet table read the other way round,
 * from the exact factor.
 */

/**
 * The source of the exact factors (1 ft = 0.3048 m, so 1 ft² = 0.09290304 m²): the one the square
 * footage calculator page cites (a test holds it to the frontmatter of both entries).
 */
export const NIST_SP_811_AREA: Required<MaterialSource> = {
  name: 'NIST SP 811, Appendix B (conversion factors)',
  url: 'https://www.nist.gov/pml/special-publication-811',
  retrieved: '2026-10-27',
};

/** The square meters of the square meters to square feet table. */
export const REVERSE_SQUARE_METERS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200,
] as const;

const catalogs = {
  en: createTranslator(enRectangleArea),
  es: createTranslator(esRectangleArea),
};

const squareMeters = (() => {
  const output = rectangleArea.outputs.find((each) => each.key === 'areaM2');
  if (output === undefined) throw new Error('the square footage engine has no areaM2 output');
  return output;
})();

const stateOf = (raw: JobCase) => {
  const result = rectangleArea.validate(raw);
  if (!result.ok) throw new Error(`invalid chart case: ${JSON.stringify(raw)}`);
  return result.value;
};

/** An area of the chart as its label reads: `1,000 ft²`. */
const squareFeetLabel = (raw: JobCase): string =>
  `${decimalText(Rational.of(Number.parseInt(raw['length'] ?? '', 10)), 0, true)} ft²`;

/** Every area of the chart in square meters, as the calculator shows them. */
export const squareMetersChartTable = (cases: Job['cases'], locale: Locale): JobTable => {
  const calc = catalogs[locale];
  const text = siteText(locale);
  // a strip 1 ft wide is no room to open the calculator on: the rows stay plain text
  const toRow = (raw: JobCase): JobRow => {
    const { outputs } = rectangleArea.compute(stateOf(raw));
    return { label: squareFeetLabel(raw), cells: [outputText(squareMeters, outputs.areaM2)] };
  };
  const [first, ...rest] = cases;
  const rows = [toRow(first), ...rest.map(toRow)] as const;
  return {
    lead: `${text('page.square-feet-to-square-meters-chart.squareFeet')}: ${rows[0].label}`,
    answer: calc('calc.rectangle-area.page.areaM2', { value: rows[0].cells[0] ?? '' }),
    facts: [],
    columns: [
      text('page.square-feet-to-square-meters-chart.squareFeet'),
      text('page.square-feet-to-square-meters-chart.squareMeters'),
    ],
    rows,
    calculatorName: calc('calc.rectangle-area.title'),
  };
};

/** The exact factors the chart rests on, and the rounding of its areas. */
export const squareMetersChartBasis = (locale: Locale): JobFact[] => {
  const text = siteText(locale);
  const key = (name: 'foot' | 'squareFoot' | 'squareMeter' | 'rounding' | 'places') =>
    text(`page.square-feet-to-square-meters-chart.${name}`);
  return [
    { label: key('foot'), value: `${decimalText(valueIn(quantity(1, ft), m), 4, false)} m` },
    {
      label: key('squareFoot'),
      value: `${decimalText(valueIn(quantity(1, ft2), m2), 8, false)} m²`,
    },
    {
      label: key('squareMeter'),
      value: `${decimalText(valueIn(quantity(1, m2), ft2), 4, false)} ft²`,
    },
    { label: key('rounding'), value: key('places') },
  ];
};

/** The square meters to square feet table: each area in square feet, to two places. */
export const squareMetersReverse = (locale: Locale): ChartReverse => {
  const text = siteText(locale);
  return {
    heading: text('page.square-feet-to-square-meters-chart.reverse'),
    lead: text('page.square-feet-to-square-meters-chart.reverseLead'),
    columns: [
      text('page.square-feet-to-square-meters-chart.squareMeters'),
      text('page.square-feet-to-square-meters-chart.squareFeet'),
    ],
    rows: REVERSE_SQUARE_METERS.map((meters) => ({
      label: `${String(meters)} m²`,
      cells: [decimalText(valueIn(quantity(Rational.of(meters), m2), ft2), 2, true)],
    })),
  };
};
