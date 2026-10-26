import { ft3, isQuantity, type Quantity } from '@maestro-calc/core';
import type { concrete } from '../../lib/concrete.ts';
import type { Moment, Ready } from '../page-module.ts';
import { SHAPE_FIELDS } from './shapes.ts';
import { DASH, groupedInteger, percentText, dimensionText, volumeText } from '../present.ts';

/*
 * The text of the short answer and the bag line of the concrete page: the concrete calculator's own
 * outputs and sentences on top of the language-free number text of `present.ts`.
 */

type RunOutcome = ReturnType<typeof concrete.run>;
/** The value of a successful run of the concrete calculator. */
export type ConcreteResult = Extract<RunOutcome, { readonly ok: true }>['value'];

/** The bag yields by purchase unit id (`bag-<pounds>`). */
export type Yields = Readonly<Record<string, Quantity<'volume'>>>;

/** The whole bags of the one shopping line. */
const bagsOf = (result: ConcreteResult): bigint => {
  const line = result.shopping.find(({ materialId }) => materialId === 'concrete-mix');
  if (line === undefined) throw new TypeError('the result has no shopping line');
  return line.qty;
};

/** The placeholder of a footing field in the answer sentence, where it is not the key itself (ICW13). */
const PLACEHOLDERS: Readonly<Record<string, string>> = {
  footingWidth: 'width',
  footingDepth: 'depth',
};

/**
 * The placeholder values of the short answer of the state's shape (i18n-catalog ICW13): the fields
 * of that shape (a length as `dimensionText`, a count as it is), the volume as the primary
 * sentence (`1.63 cubic yards` in the US system, `1.25 cubic meters` in the metric one), the extra,
 * the bag size and the bags.
 */
export const answerValues = (
  { valid, result, system }: Ready<typeof concrete>,
  primary: string,
): Record<string, string> => ({
  ...Object.fromEntries(
    SHAPE_FIELDS[valid.shape].map((key) => {
      const value = valid[key];
      return [
        PLACEHOLDERS[key] ?? key,
        isQuantity(value) ? dimensionText(value, system) : String(value),
      ];
    }),
  ),
  volume: primary,
  waste: percentText(valid.waste),
  bagLb: valid.bag,
  bags: groupedInteger(bagsOf(result)),
});

/**
 * The placeholders of the bag line: the pounds of the pressed bag (they follow the choice even
 * while a field is invalid) and the cubic feet one bag yields, two places, or a dash without a
 * result. `yields` are the bag yields of the composition root.
 */
export const bagFills = (
  moment: Moment<typeof concrete>,
  yields: Yields,
): Readonly<Record<string, string>> => {
  const bag = moment.choices.bag;
  const bagYield = yields[`bag-${bag}`];
  if (bagYield === undefined) throw new TypeError(`no yield for the ${bag} lb bag`);
  return { bagLb: bag, yield: moment.result === undefined ? DASH : volumeText(bagYield, ft3) };
};
