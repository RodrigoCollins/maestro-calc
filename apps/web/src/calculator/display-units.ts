import {
  bdft,
  deg,
  ft,
  ft2,
  ft3,
  gal,
  inch,
  liter,
  m,
  m2,
  m3,
  sq,
  ton,
  tonne,
  yd2,
  yd3,
  type DimensionName,
  type Unit,
} from '@maestro-calc/core';

/*
 * The units a Maestro Calc figure is written in: the units of the decimal display hints of the
 * registry calculators, and no other. The page script would otherwise ship core's whole unit catalog
 * (`findUnit`) to read three of them; `display-units.contract.test.ts` holds this list equal to the
 * units the registry's hints name, so a calculator that shows a new unit fails there first.
 */
export const DISPLAY_UNITS: readonly Unit<DimensionName>[] = [
  inch,
  ft,
  m,
  ft2,
  yd2,
  m2,
  sq,
  ft3,
  yd3,
  m3,
  gal,
  liter,
  bdft,
  ton,
  tonne,
  deg,
];

/** The display unit of `id` in `dimension`, `undefined` for one no figure is written in. */
export const displayUnitOf = <D extends DimensionName>(
  dimension: D,
  id: string,
): Unit<D> | undefined =>
  DISPLAY_UNITS.find((unit): unit is Unit<D> => unit.dimension === dimension && unit.id === id);
