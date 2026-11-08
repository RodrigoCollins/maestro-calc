import {
  ceilToPurchaseUnits,
  decimalInput,
  defineCalculator,
  Rational,
  selectInput,
} from '@maestro-calc/core';

/**
 * The pallet sizes suppliers list, in square feet (thegrassoutlet.com, angi.com: not a primary
 * source, so the page labels them "ask your sod farm"; the supplier's own figure comes first).
 */
export const PALLET_SIZES = ['400', '450', '500'] as const;
/** A 16 x 24 in slab is 384 / 144 = 8/3 sq ft. */
const SLAB = Rational.of(8, 3);
const HUNDRED = Rational.of(100);

/**
 * Sod: the square feet to order are the area plus the waste the user sets (no default waste is
 * claimed: it starts at zero), the pallets and the slabs that cover them, both rounded up. Plain
 * geometry, exact arithmetic.
 */
export const sod = defineCalculator({
  id: 'sod',
  inputs: [
    decimalInput({
      key: 'area',
      urlKey: 'a',
      default: Rational.of(1000),
      max: Rational.of(10_000_000),
    }),
    decimalInput({ key: 'waste', urlKey: 'w', default: Rational.ZERO, max: HUNDRED }),
    selectInput({ key: 'pallet', urlKey: 'p', options: PALLET_SIZES, default: '450' }),
  ],
  outputs: [
    { key: 'order', measure: 'number', role: 'primary' },
    { key: 'extra', measure: 'number', role: 'secondary' },
    { key: 'pallets', measure: 'number', role: 'secondary' },
    { key: 'slabs', measure: 'number', role: 'secondary' },
  ],
  warnings: [],
  compute: ({ area, waste, pallet }) => {
    const order = area.mul(HUNDRED.add(waste)).div(HUNDRED);
    const pallets = ceilToPurchaseUnits(order.div(Rational.of(Number(pallet))));
    return {
      outputs: {
        order,
        extra: order.sub(area),
        pallets: Rational.of(pallets),
        slabs: Rational.of(ceilToPurchaseUnits(order.div(SLAB))),
      },
      shopping: [{ materialId: 'sod', purchaseUnit: 'pallet', qty: pallets }],
      warnings: [],
    };
  },
});
