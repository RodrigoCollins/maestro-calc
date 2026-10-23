import { describe, expectTypeOf, it } from 'vitest';
import { usd, type Money } from './money.ts';
import { costOf, unitPrice } from './unit-price.ts';
import { ft, ft2 } from '../units/catalog.ts';
import type { Quantity } from '../units/quantity.ts';

declare const length: Quantity<'length'>;
declare const area: Quantity<'area'>;

describe('unit price types (money › Unit prices)', () => {
  // spec: money › Mismatched dimension [MN6b]
  it('rejects a quantity of another dimension', () => {
    const perFt2 = unitPrice(usd(1), ft2);
    expectTypeOf(costOf(perFt2, area)).toEqualTypeOf<Money>();
    // @ts-expect-error a length is not an area
    costOf(perFt2, length);
    // @ts-expect-error a price per ft2 is not a price per foot
    costOf(unitPrice(usd(1), ft), area);
    // @ts-expect-error money is not a quantity
    costOf(perFt2, usd(1));
  });
});
