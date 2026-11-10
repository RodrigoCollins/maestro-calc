import { bdft, inch, multiply, valueIn, type Quantity, type UnitSystem } from '@maestro-calc/core';
import type { boardFeet } from '@maestro-calc/core/calculators/board-feet';
import type { Ready } from '../page-module.ts';
import { decimalText, dimensionText, fieldText, groupedInteger } from '../present.ts';

type Moment = Ready<typeof boardFeet>;

/** A length in inches, the unit of the plan's ratio. */
export const inches = (length: Quantity<'length'>): number => valueIn(length, inch).toNumber();

/**
 * The text of a cross-section size, thickness or width: in inches as a lumber size is written
 * (`2 in`, `1 1/2 in`, `12 in`, never `1 ft`), in centimetres or metres in metric.
 */
export const crossText = (length: Quantity<'length'>, system: UnitSystem): string =>
  system === 'imperial'
    ? fieldText(length, { defaultUnit: 'in', metricDefaultUnit: 'cm' }, system)
    : dimensionText(length, system);

/** The case of the answer: one piece, or several with the board feet of each. */
export const answerCase = ({ valid }: Moment): string => (valid.pieces === 1 ? 'one' : 'many');

/**
 * The placeholder values of the answer: the sizes as the language-free text of the answer, the
 * pieces, the total as the primary sentence the slot hands over, and the board feet of one piece.
 */
export const answerValues = (
  { valid, system }: Moment,
  primary: string,
): Record<string, string> => {
  // one piece is its own volume, as the engine's boardFeetEach: thickness × width × length
  const each = multiply(multiply(valid.thickness, valid.width), valid.length);
  return {
    thickness: crossText(valid.thickness, system),
    width: crossText(valid.width, system),
    length: dimensionText(valid.length, system),
    pieces: groupedInteger(BigInt(valid.pieces)),
    total: primary,
    each: decimalText(valueIn(each, bdft), 2, true),
  };
};
