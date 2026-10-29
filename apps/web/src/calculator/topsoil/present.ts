import { inch, valueIn, type Quantity } from '@maestro-calc/core';
import type { topsoil } from '@maestro-calc/core/calculators/topsoil';
import type { Moment, Ready } from '../page-module.ts';
import { required } from '../controller.ts';
import { dimensionText, groupedInteger } from '../present.ts';

/** A length in inches, the unit of the plan's ratio. */
export const inches = (length: Quantity<'length'>): number => valueIn(length, inch).toNumber();

/** The bag sizes as the label writes them: the option `0-75` is the 0.75 cu ft bag. */
const SIZES: Readonly<Record<string, string>> = { '0-75': '0.75', '1': '1', '1-5': '1.5' };

/** The size text of a bag option. */
const sizeOf = (bag: string): string => required(SIZES[bag], `bag ${bag}`);

/** The bag line's fills: the size of the pressed bag (it follows the choice even while invalid). */
export const bagFills = (moment: Moment<typeof topsoil>): Readonly<Record<string, string>> => ({
  size: sizeOf(moment.choices.bag),
});

/**
 * The placeholder values of the answer: the three dimensions as the language-free text of the
 * answer, the volume as the primary sentence the slot hands over, and the bags of the chosen size.
 */
export const answerValues = (
  { valid, result, system }: Ready<typeof topsoil>,
  primary: string,
): Record<string, string> => {
  // the engine always writes the one bag line
  const [line] = result.shopping;
  return {
    length: dimensionText(valid.length, system),
    width: dimensionText(valid.width, system),
    depth: dimensionText(valid.depth, system),
    volume: primary,
    bags: groupedInteger(required(line, 'bag line').qty),
    size: sizeOf(valid.bag),
  };
};
