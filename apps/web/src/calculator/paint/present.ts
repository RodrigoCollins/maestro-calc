import { inch, valueIn, type Quantity } from '@maestro-calc/core';
import type { paint } from '../../lib/paint.ts';
import type { Ready } from '../page-module.ts';
import { required } from '../controller.ts';
import { dimensionText, groupedInteger } from '../present.ts';

/** A length in inches, the unit of the plan's ratio. */
export const inches = (length: Quantity<'length'>): number => valueIn(length, inch).toNumber();

/**
 * The placeholder values of the answer: the room and the wall height as the language-free text of
 * the answer, the paint as the primary sentence the slot hands over, the coats and the cans.
 */
export const answerValues = (
  { valid, result, system }: Ready<typeof paint>,
  primary: string,
): Record<string, string> => {
  // the engine always writes the one gallon line
  const [line] = result.shopping;
  return {
    length: dimensionText(valid.length, system),
    width: dimensionText(valid.width, system),
    height: dimensionText(valid.height, system),
    paint: primary,
    coats: String(valid.coats),
    cans: groupedInteger(required(line, 'gallon line').qty),
  };
};
