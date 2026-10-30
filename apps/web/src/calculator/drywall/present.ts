import { inch, valueIn, type Quantity } from '@maestro-calc/core';
import type { drywall } from '../../lib/drywall.ts';
import type { Moment, Ready } from '../page-module.ts';
import { required } from '../controller.ts';
import { dimensionText, groupedInteger } from '../present.ts';

/** A length in inches, the unit of the plan's ratio. */
export const inches = (length: Quantity<'length'>): number => valueIn(length, inch).toNumber();

/** A sheet size as the page writes it, the same in both languages. */
const SHEET_TEXT: Readonly<Record<string, string>> = { '4x8': '4 × 8 ft', '4x12': '4 × 12 ft' };

/** The text of a sheet size id. */
export const sheetText = (sheet: string): string => required(SHEET_TEXT[sheet], 'sheet size');

/** The sheet line's fills: the size of the pressed sheet (it follows the choice even while invalid). */
export const sheetFills = (moment: Moment<typeof drywall>): Readonly<Record<string, string>> => ({
  size: sheetText(moment.choices.sheet),
});

/**
 * The placeholder values of the answer templates (one per surfaces option): the room and the wall
 * height as the language-free text of the answer, the area as the primary sentence the slot hands
 * over, the sheet size and the sheets.
 */
export const answerValues = (
  { valid, result, system }: Ready<typeof drywall>,
  primary: string,
): Record<string, string> => {
  // the engine always writes the sheet line first
  const [line] = result.shopping;
  return {
    length: dimensionText(valid.length, system),
    width: dimensionText(valid.width, system),
    height: dimensionText(valid.height, system),
    area: primary,
    sheet: sheetText(valid.sheet),
    sheets: groupedInteger(required(line, 'sheet line').qty),
  };
};
