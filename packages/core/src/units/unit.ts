import type { Rational } from '../rational/rational.ts';
import type { DimensionName } from './dimension.ts';

/** The ids of the units of each dimension (a closed set per dimension). */
interface UnitIds {
  length: 'in' | 'ft' | 'yd' | 'mm' | 'cm' | 'm';
  area: 'in2' | 'ft2' | 'yd2' | 'mm2' | 'cm2' | 'm2';
  volume: 'in3' | 'ft3' | 'yd3' | 'mm3' | 'cm3' | 'm3';
  mass: 'lb' | 'oz' | 'ton' | 'kg' | 'tonne';
  density: 'lb/in3' | 'lb/ft3' | 'lb/yd3' | 'ton/yd3' | 'kg/m3';
}

export type UnitIdOf<D extends DimensionName> = UnitIds[D];

/** A unit of one dimension: `canonical = value × factor`, with an exact factor. */
export interface Unit<D extends DimensionName> {
  readonly id: UnitIdOf<D>;
  readonly dimension: D;
  readonly factor: Rational;
}
