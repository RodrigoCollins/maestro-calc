import type { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import type { Ready } from '../page-module.ts';
import { dimensionText } from '../present.ts';

/*
 * The placeholders of the short answer of the rectangle-area page: the two dimensions as the
 * language-free text of the length (`10 ft`, `12 ft 6 in`, `3.05 m`), and the area as the primary
 * sentence the slot hands over.
 */

/** The placeholder values of the one answer template (calc-rectangle-area › [RAP2], [RAP3]). */
export const answerValues = (
  { valid, system }: Ready<typeof rectangleArea>,
  primary: string,
): Record<string, string> => ({
  length: dimensionText(valid.length, system),
  width: dimensionText(valid.width, system),
  area: primary,
});
