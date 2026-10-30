import { inch, valueIn, type Quantity } from '@maestro-calc/core';
import type { roofing } from '../../lib/roofing.ts';
import type { Ready } from '../page-module.ts';
import { required } from '../controller.ts';
import { dimensionText, groupedInteger } from '../present.ts';

type Moment = Ready<typeof roofing>;

/** A length in inches, the unit of the plan's ratio. */
export const inches = (length: Quantity<'length'>): number => valueIn(length, inch).toNumber();

/** The case of the answer: below the IRC minimum, two layers of underlayment, or one. */
export const answerCase = ({ result }: Moment): string => {
  const codes = result.warnings.map(({ code }) => code);
  if (codes.includes('belowMinimum')) return 'below';
  return codes.includes('doubleUnderlayment') ? 'double' : 'meets';
};

/**
 * The placeholder values of the answer: the footprint as the language-free text of the answer, the
 * pitch in 12, the roof as the primary sentence the slot hands over, the bundles and the rolls, and
 * the IRC minimum when it is missed.
 */
export const answerValues = (moment: Moment, primary: string): Record<string, string> => {
  const { valid, result, system } = moment;
  // the engine always writes the shingles first and the underlayment second
  const [bundles, rolls] = result.shopping;
  const below = result.warnings.find(({ code }) => code === 'belowMinimum');
  return {
    length: dimensionText(valid.length, system),
    width: dimensionText(valid.width, system),
    pitch: String(valid.pitch),
    area: primary,
    bundles: groupedInteger(required(bundles, 'shingles line').qty),
    rolls: groupedInteger(required(rolls, 'underlayment line').qty),
    minimum: below === undefined ? '' : String(below.params['minimum']),
  };
};
