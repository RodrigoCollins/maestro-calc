import { Rational } from '@maestro-calc/core';
import { createConcrete } from '@maestro-calc/core/calculators/concrete';
import { CONCRETE_YIELDS } from '@maestro-calc/core/testing/concrete-yields';
import { describe, expect, it } from 'vitest';
import { dollarsOf, exactOf } from '../__testing__/figures.ts';
import { createConcreteQuote, type Concrete } from './concrete.ts';

const concrete = createConcreteQuote(createConcrete(CONCRETE_YIELDS));

describe('concrete quote', () => {
  // 12 ft x 10 ft x 4 in = 40 cu ft; with 10% waste 44 cu ft; an 80 lb bag yields 0.6 cu ft, so
  // 73.33 and 74 bags at $6 = $444. Labor 8 h x $25 = $200; subtotal 644; overhead 64.40; profit
  // 15% of 708.40 = 106.26; total 814.66.
  it('itemizes the default slab to $814.66', () => {
    expect(dollarsOf(concrete, {}, 'labor')).toBe('200.00');
    expect(dollarsOf(concrete, {}, 'materials')).toBe('444.00');
    expect(dollarsOf(concrete, {}, 'subtotal')).toBe('644.00');
    expect(dollarsOf(concrete, {}, 'overhead')).toBe('64.40');
    expect(dollarsOf(concrete, {}, 'profit')).toBe('106.26');
    expect(dollarsOf(concrete, {}, 'total')).toBe('814.66');
  });

  it('reports the bags and the square feet of the slab', () => {
    expect(exactOf(concrete, {}, 'units')).toEqual(Rational.of(74));
    expect(exactOf(concrete, {}, 'area')).toEqual(Rational.of(120));
  });

  // 120 sq ft x $4.50 = $540
  it('prices the labor by the square foot poured', () => {
    const raw = { laborBy: 'area', areaRate: '4.5', overhead: '0', profit: '0', bagPrice: '0' };
    expect(dollarsOf(concrete, raw, 'labor')).toBe('540.00');
    expect(dollarsOf(concrete, raw, 'total')).toBe('540.00');
  });

  // 60 lb bags yield 0.45 cu ft: 44 / 0.45 = 97.78, so 98 bags at $4.80 = $470.40
  it('buys whole bags of the size chosen', () => {
    const raw = { bag: '60', bagPrice: '4.80' };
    expect(exactOf(concrete, raw, 'units')).toEqual(Rational.of(98));
    expect(dollarsOf(concrete, raw, 'materials')).toBe('470.40');
  });

  it('refuses a concrete engine that cannot read its slab defaults', () => {
    const broken = { validate: () => ({ ok: false }) } as unknown as Concrete;
    expect(() => createConcreteQuote(broken)).toThrow('slab defaults');
  });

  it('rejects a thickness above the engine maximum', () => {
    expect(concrete.run({ thickness: '11 ft' }).ok).toBe(false);
  });
});
