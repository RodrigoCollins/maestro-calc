import { defineCalculator } from '../../calculator/define.ts';
import type { LengthDescriptor } from '../../calculator/descriptors.ts';
import { ft, inch } from '../../units/catalog.ts';
import { multiply } from '../../units/ops.ts';
import { quantity } from '../../units/quantity.ts';

/** Both sides are the same field: 10 ft by default, from 0 up to 100000 ft, feet or metres bare. */
const side = <const K extends string, const U extends string>(
  key: K,
  urlKey: U,
): LengthDescriptor & { readonly key: K; readonly urlKey: U } => ({
  kind: 'length',
  key,
  urlKey,
  default: quantity(120, inch),
  defaultUnit: 'ft',
  metricDefaultUnit: 'm',
  min: quantity(0, inch),
  max: quantity(100000, ft),
});

/**
 * The proof calculator of the foundation change (calc-rectangle-area): the area of a rectangle,
 * `length x width`, exact in canonical square inches. A quantity does not remember a unit, so the
 * three outputs hold the same area; each one names the unit it is shown in through its display
 * hint (the rounding to two places is the web layer's job).
 */
export const rectangleArea = defineCalculator({
  id: 'rectangle-area',
  inputs: [side('length', 'l'), side('width', 'w')],
  outputs: [
    {
      key: 'areaFt2',
      measure: 'area',
      role: 'primary',
      display: { unit: 'ft2', format: 'decimal', places: 2 },
    },
    {
      key: 'areaYd2',
      measure: 'area',
      role: 'secondary',
      display: { unit: 'yd2', format: 'decimal', places: 2 },
    },
    {
      key: 'areaM2',
      measure: 'area',
      role: 'secondary',
      display: { unit: 'm2', format: 'decimal', places: 2 },
    },
  ],
  compute: ({ length, width }) => {
    const area = multiply(length, width);
    return { outputs: { areaFt2: area, areaYd2: area, areaM2: area }, shopping: [], warnings: [] };
  },
});
