import { inch, valueIn, type Quantity } from '@maestro-calc/core';
import type { gravel } from '../../lib/gravel.ts';
import type { Ready } from '../page-module.ts';
import { dimensionText } from '../present.ts';

/** A length in inches, the unit of the plan's ratio. */
export const inches = (length: Quantity<'length'>): number => valueIn(length, inch).toNumber();

/**
 * The placeholder values of the answer templates (one per placement): the three dimensions as the
 * language-free text of the answer, and the weight as the primary sentence the slot hands over.
 */
export const answerValues = (
  { valid, system }: Ready<typeof gravel>,
  primary: string,
): Record<string, string> => ({
  length: dimensionText(valid.length, system),
  width: dimensionText(valid.width, system),
  depth: dimensionText(valid.depth, system),
  tons: primary,
});
