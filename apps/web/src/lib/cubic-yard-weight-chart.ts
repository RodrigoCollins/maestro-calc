import { encode, kgM3, lb, lbFt3, lbYd3, tonYd3, valueIn, type Quantity } from '@maestro-calc/core';
import {
  BULK_WEIGHTS,
  type BulkWeight,
  type BulkWeightId,
  type MaterialSource,
} from '@maestro-calc/data';
import { createTranslator, type Locale } from '@maestro-calc/i18n';
import { enGravel } from '@maestro-calc/i18n/catalogs/en/gravel';
import { esGravel } from '@maestro-calc/i18n/catalogs/es/gravel';
import { decimalText } from '../calculator/present.ts';
import type { Job, JobCase } from '../routing/jobs.ts';
import { pathOf } from '../routing/routes.ts';
import { gravel } from './gravel.ts';
import type { ChartSource, JobFact, JobRow, JobTable } from './job-view.ts';
import { siteText } from './site-text.ts';

/*
 * The cubic yard weight chart (growth plan, reference charts): what a cubic yard of each common
 * bulk material weighs, in pounds and short tons, per cubic foot and in kilograms per cubic meter,
 * every figure converted exactly at build time from the densities of `BULK_WEIGHTS` in the data
 * package. The two gravel rows are the gravel calculator's own densities, and each opens it on one
 * cubic yard.
 */

const catalogs = { en: createTranslator(enGravel), es: createTranslator(esGravel) };

/** Each column after the material: its unit and the decimals it is shown to. */
const COLUMNS = [
  { unit: lbYd3, places: 0, key: 'lbYd3' },
  { unit: tonYd3, places: 2, key: 'tonYd3' },
  { unit: lbFt3, places: 1, key: 'lbFt3' },
  { unit: kgM3, places: 0, key: 'kgM3' },
] as const;

/** The calculator that sizes a material by volume, when the site has one for it. */
const CALCULATORS: Readonly<
  Partial<Record<BulkWeightId, 'gravel' | 'concrete' | 'topsoil' | 'mulch'>>
> = {
  'gravel-compacted': 'gravel',
  'gravel-loose': 'gravel',
  concrete: 'concrete',
  topsoil: 'topsoil',
  'wood-chips-green': 'mulch',
  'wood-chips-dry': 'mulch',
};

const gravelState = (raw: JobCase) => {
  const result = gravel.validate(raw);
  if (!result.ok) throw new Error(`invalid chart case: ${JSON.stringify(raw)}`);
  return result.value;
};

/** `low` and `high` in a column: one figure when they agree, else `low–high`. */
const rangeText = (
  { low, high }: BulkWeight,
  unit: (typeof COLUMNS)[number]['unit'],
  places: number,
): string => {
  const shown = (weight: Quantity<'density'>) => decimalText(valueIn(weight, unit), places, true);
  const [from, to] = [shown(low), shown(high)];
  return from === to ? from : `${from}–${to}`;
};

const nameOf = (id: BulkWeightId, locale: Locale): string =>
  siteText(locale)(`page.cubic-yard-weight-chart.materials.${id}`);

/**
 * The chart: one row per material of `BULK_WEIGHTS`. `cases` are one cubic yard of gravel,
 * compacted then loose: the gravel rows open the calculator on them, and the gravel engine must weigh
 * that yard within the row's range (it throws at build time otherwise).
 */
export const cubicYardWeightTable = (cases: Job['cases'], locale: Locale): JobTable => {
  const text = siteText(locale);
  const placed = new Map<string, ReturnType<typeof gravelState>>(
    cases.map((raw) => [`gravel-${raw['placement'] ?? ''}`, gravelState(raw)]),
  );
  const hrefOf = (weight: BulkWeight): string | undefined => {
    const calculator = CALCULATORS[weight.id];
    if (calculator === undefined) return undefined;
    const state = placed.get(weight.id);
    if (calculator !== 'gravel') return pathOf(calculator, locale);
    if (state === undefined) throw new Error(`the chart has no cubic yard of ${weight.id}`);
    // the case is exactly one cubic yard, so its pounds are the pounds per cubic yard
    const pounds = valueIn(gravel.compute(state).outputs.tons, lb);
    if (
      pounds.compare(valueIn(weight.low, lbYd3)) < 0 ||
      pounds.compare(valueIn(weight.high, lbYd3)) > 0
    ) {
      throw new Error(`the gravel engine weighs a cubic yard of ${weight.id} outside its range`);
    }
    return `${pathOf('gravel', locale)}?${encode(gravel, state, { unitSystem: 'imperial' })}`;
  };
  const toRow = (weight: BulkWeight): JobRow => ({
    label: nameOf(weight.id, locale),
    href: hrefOf(weight),
    cells: COLUMNS.map(({ unit, places }) => rangeText(weight, unit, places)),
  });
  const [first, ...rest] = BULK_WEIGHTS;
  const rows = [toRow(first), ...rest.map(toRow)] as const;
  return {
    lead: rows[0].label,
    answer: rows[0].cells[1] ?? '',
    facts: [],
    columns: [
      text('page.cubic-yard-weight-chart.material'),
      ...COLUMNS.map(({ key }) => text(`page.cubic-yard-weight-chart.${key}`)),
    ],
    rows,
    calculatorName: catalogs[locale]('calc.gravel.title'),
  };
};

/** Every source of the chart once, in the order of the chart, labelled by the materials it gives. */
export const cubicYardWeightSources = (locale: Locale): [ChartSource, ...ChartSource[]] => {
  const byUrl = new Map<string, { source: Required<MaterialSource>; ids: BulkWeightId[] }>();
  for (const { id, sources } of BULK_WEIGHTS) {
    for (const source of sources) {
      const entry = byUrl.get(source.url) ?? { source, ids: [] };
      entry.ids.push(id);
      byUrl.set(source.url, entry);
    }
  }
  const [first, ...rest] = [...byUrl.values()].map(({ source, ids }) => ({
    label: ids.map((id) => nameOf(id, locale)).join('; '),
    source,
  }));
  if (first === undefined) throw new Error('the cubic yard weight chart has no source');
  return [first, ...rest];
};

/** The condition each source states for its figure: loose, compacted, dry, fresh or not stated. */
export const cubicYardWeightBasis = (locale: Locale): JobFact[] => {
  const text = siteText(locale);
  return BULK_WEIGHTS.map(({ id }) => ({
    label: nameOf(id, locale),
    value: text(`page.cubic-yard-weight-chart.conditions.${id}`),
  }));
};
