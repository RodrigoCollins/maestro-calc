import { ft2, isQuantityOf, Rational, valueIn, type Money } from '@maestro-calc/core';
import type { DetailValues } from './details.ts';

const isMoney = (value: unknown): value is Money =>
  typeof value === 'object' && value !== null && 'currency' in value;

const rationalOf = (value: unknown, name: string): Rational => {
  if (value instanceof Rational) return value;
  throw new Error(`${name} is not a number`);
};

const moneyOf = (value: unknown, name: string): Money => {
  if (isMoney(value)) return value;
  throw new Error(`${name} is not money`);
};

/**
 * What the details of a receipt are written from: the labor fields of the run's validated state, and
 * the units and the area of its outputs (the area in square feet).
 */
export const valuesOf = (
  state: Readonly<Record<string, unknown>>,
  outputs: Readonly<Record<string, unknown>>,
): DetailValues => {
  const area = outputs['area'];
  if (!isQuantityOf(area, 'area')) throw new Error('area is not an area');
  return {
    laborBy: String(state['laborBy']),
    hours: rationalOf(state['hours'], 'hours'),
    crew: Number(state['crew']),
    rate: moneyOf(state['rate'], 'rate'),
    areaRate: moneyOf(state['areaRate'], 'areaRate'),
    area: valueIn(area, ft2),
    units: rationalOf(outputs['units'], 'units'),
    overhead: rationalOf(state['overhead'], 'overhead'),
    profit: rationalOf(state['profit'], 'profit'),
  };
};
