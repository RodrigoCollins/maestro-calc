import { ft3, in3, isQuantity, Rational, sign, valueIn } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { CONCRETE_MIX_YIELDS } from '../yields/concrete-mix.ts';
import { defineMaterial } from '../material.ts';
import { concreteMix } from './concrete-mix.ts';

const URL_1101 = 'https://www.quikrete.com/PDFs/DATA_SHEET-Concrete%20Mix%201101.pdf';

describe('concreteMix (material-data-contract › Shipped materials)', () => {
  // spec: material-data-contract › [MDC2] Concrete mix record
  it('matches the record table exactly', () => {
    expect(concreteMix.id).toBe('concrete-mix');
    expect(concreteMix.nameKey).toBe('material.concrete-mix.name');
    expect(
      concreteMix.purchaseUnits.map((unit) => [unit.id, unit.nameKey, valueIn(unit.size, ft3)]),
    ).toEqual([
      ['bag-40', 'material.concrete-mix.units.bag-40', Rational.of(3, 10)],
      ['bag-60', 'material.concrete-mix.units.bag-60', Rational.of(9, 20)],
      ['bag-80', 'material.concrete-mix.units.bag-80', Rational.of(3, 5)],
    ]);
    expect(concreteMix.purchaseUnits.map((unit) => valueIn(unit.size, in3))).toEqual([
      Rational.of(2592, 5),
      Rational.of(3888, 5),
      Rational.of(5184, 5),
    ]);
    expect(concreteMix.source).toEqual({
      name: 'QUIKRETE Concrete Mix No. 1101 data sheet (product nos. 1101-40, 1101-60, 1101-80), revised October 2022',
      url: URL_1101,
      retrieved: '2026-10-25',
    });
    expect(Object.isFrozen(concreteMix)).toBe(true);
    expect(Object.isFrozen(concreteMix.purchaseUnits)).toBe(true);
    expect(Object.isFrozen(concreteMix.source)).toBe(true);
  });

  // spec: material-data-contract › [MDC3] Record passes the contract
  it('is accepted unchanged by defineMaterial', () => {
    expect(defineMaterial(concreteMix)).toBe(concreteMix);
    for (const unit of concreteMix.purchaseUnits) {
      expect(isQuantity(unit.size)).toBe(true);
      expect(sign(unit.size)).toBe(1);
    }
  });

  // spec: material-data-contract › [MDC4] Source is cited
  it('cites an https source retrieved on 2026-10-25', () => {
    expect(concreteMix.source.name).not.toBe('');
    expect(concreteMix.source.url?.startsWith('https://')).toBe(true);
    expect(concreteMix.source.retrieved).toBe('2026-10-25');
  });

  // spec: material-data-contract › [MDC5] Yields-only module (shared objects)
  it('takes each size from the very object of CONCRETE_MIX_YIELDS', () => {
    const sizes = concreteMix.purchaseUnits.map((unit) => unit.size);
    expect(sizes[0]).toBe(CONCRETE_MIX_YIELDS['bag-40']);
    expect(sizes[1]).toBe(CONCRETE_MIX_YIELDS['bag-60']);
    expect(sizes[2]).toBe(CONCRETE_MIX_YIELDS['bag-80']);
  });
});
