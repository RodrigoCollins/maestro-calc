import { Rational } from '@maestro-calc/core';
import type { MaterialSource } from '@maestro-calc/data';

/*
 * The minimum dressed sizes of dry softwood lumber (DOC PS 20-20, American Softwood Lumber Standard,
 * Table 3, retrieved 2026-11-10): the nominal inches of a thickness or a width and the inches the
 * dried, planed piece measures. Only the sizes of the board feet pages are listed; a size outside
 * the table throws, so a new page cannot quote an unsourced size.
 */

/** The standard, as the board feet pages cite it. */
export const PS_20: Required<MaterialSource> = {
  name: 'DOC PS 20-20, American Softwood Lumber Standard (2.2 Board measure; Table 3)',
  url: 'https://www.nist.gov/document/doc-ps-20-20-american-softwood-lumber-standard',
  retrieved: '2026-11-10',
};

/** Nominal thickness (in) to dry dressed thickness (in): boards 1 → 3/4, dimension 2 → 1 1/2, 4 → 3 1/2. */
const THICKNESS: Readonly<Record<string, Rational>> = {
  '1': Rational.of(3, 4),
  '2': Rational.of(3, 2),
  '4': Rational.of(7, 2),
};

/** Nominal width (in) to dry dressed width (in), the same for boards and dimension lumber. */
const WIDTH: Readonly<Record<string, Rational>> = {
  '4': Rational.of(7, 2),
  '6': Rational.of(11, 2),
  '8': Rational.of(29, 4),
  '10': Rational.of(37, 4),
  '12': Rational.of(45, 4),
};

const lookUp = (table: Readonly<Record<string, Rational>>, nominal: number, what: string) => {
  const dressed = table[String(nominal)];
  if (dressed === undefined)
    throw new Error(`no PS 20-20 dressed ${what} for nominal ${String(nominal)} in`);
  return dressed;
};

/** The dry dressed thickness and width, in inches, of a piece of nominal `thickness` by `width` inches. */
export const dressedOf = (
  thickness: number,
  width: number,
): { readonly thickness: Rational; readonly width: Rational } => ({
  thickness: lookUp(THICKNESS, thickness, 'thickness'),
  width: lookUp(WIDTH, width, 'width'),
});
