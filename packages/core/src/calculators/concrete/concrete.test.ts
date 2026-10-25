import { describe, expect, it } from 'vitest';
import { CONCRETE_YIELDS } from '../../__testing__/concrete-yields.ts';
import { toDecimalParts } from '../../format/decimal-parts.ts';
import { Rational } from '../../rational/rational.ts';
import { ft3, in3, m3, yd3 } from '../../units/catalog.ts';
import { valueIn } from '../../units/quantity.ts';
import type { ValidateOptions } from '../../calculator/descriptors.ts';
import { createConcrete } from './index.ts';

const concrete = createConcrete(CONCRETE_YIELDS);

/** The outputs of a run, by key; a failed run is a failed test. */
const outputs = (raw: Readonly<Record<string, unknown>>, options?: ValidateOptions) => {
  const result = concrete.run(raw, options);
  if (!result.ok) throw new Error(`run failed: ${JSON.stringify(result.errors)}`);
  return Object.fromEntries(result.value.outputs.map(({ key, value }) => [key, value]));
};

const places2 = (value: Rational): string => {
  const { integer, fraction } = toDecimalParts(value, 2);
  return `${integer.toString()}.${fraction}`;
};

describe('createConcrete (calc-concrete › Yield injection)', () => {
  // spec: calc-concrete › [CC4] Valid yields
  it('returns the concrete calculator for valid yields', () => {
    expect(concrete.id).toBe('concrete');
    expect(concrete.inputs).toHaveLength(17);
  });
});

describe('concrete volumes (calc-concrete › Volume computation)', () => {
  // spec: calc-concrete › [CC7] Slab default (S1)
  it('computes the default slab: 40 ft3 net, 44 ft3 with 10% extra', () => {
    const { netVolume, volumeFt3, volumeYd3, volumeM3 } = outputs({});
    expect(netVolume && valueIn(netVolume, ft3)).toEqual(Rational.of(40));
    expect(volumeFt3 && valueIn(volumeFt3, ft3)).toEqual(Rational.of(44));
    expect(volumeYd3 && valueIn(volumeYd3, yd3)).toEqual(Rational.of(44, 27));
    expect(volumeM3 && valueIn(volumeM3, m3)).toEqual(Rational.of(608369751, 488281250));
    expect(volumeYd3 && places2(valueIn(volumeYd3, yd3))).toBe('1.63');
    expect(volumeM3 && places2(valueIn(volumeM3, m3))).toBe('1.25');
  });

  // spec: calc-concrete › [CC7] the three volume outputs are the same quantity
  it('returns the same quantity in the three volume outputs', () => {
    const { volumeFt3, volumeYd3, volumeM3 } = outputs({});
    for (const volume of [volumeFt3, volumeYd3, volumeM3]) {
      expect(volume && valueIn(volume, in3)).toEqual(Rational.of(76032));
    }
  });

  // spec: calc-concrete › [CC8] Other slabs (S2)
  it('computes a 20 ft by 15 ft slab, 6 in thick', () => {
    const { volumeFt3, volumeYd3 } = outputs({ length: '20', width: '15', thickness: '6in' });
    expect(volumeFt3 && valueIn(volumeFt3, ft3)).toEqual(Rational.of(165));
    expect(volumeYd3 && valueIn(volumeYd3, yd3)).toEqual(Rational.of(55, 9));
  });

  // spec: calc-concrete › [CC8] Other slabs (S3, metric)
  it('computes a 4 m by 3 m slab, 10 cm thick, from bare metric numbers', () => {
    const { netVolume, volumeM3, volumeYd3, volumeFt3 } = outputs(
      { length: '4', width: '3', thickness: '10' },
      { unitSystem: 'metric' },
    );
    expect(netVolume && valueIn(netVolume, m3)).toEqual(Rational.of(6, 5));
    expect(volumeM3 && valueIn(volumeM3, m3)).toEqual(Rational.of(33, 25));
    expect(volumeYd3 && places2(valueIn(volumeYd3, yd3))).toBe('1.73');
    expect(volumeFt3 && places2(valueIn(volumeFt3, ft3))).toBe('46.62');
  });

  // spec: calc-concrete › [CC12] Zero dimension (Z)
  it('gives exactly zero volumes for a zero length, with no error', () => {
    const result = outputs({ length: '0' });
    for (const key of ['volumeYd3', 'volumeFt3', 'volumeM3', 'netVolume']) {
      expect(result[key] && valueIn(result[key], in3)).toEqual(Rational.ZERO);
    }
  });

  // spec: calc-concrete › [CC12] Maximum bounds, volumes (H)
  it('computes the maximum slab exactly', () => {
    const { netVolume, volumeYd3 } = outputs({
      length: '1000ft',
      width: '1000ft',
      thickness: '10ft',
      waste: '0',
    });
    expect(netVolume && valueIn(netVolume, ft3)).toEqual(Rational.of(10000000));
    expect(volumeYd3 && valueIn(volumeYd3, yd3)).toEqual(Rational.of(10000000, 27));
    expect(volumeYd3 && places2(valueIn(volumeYd3, yd3))).toBe('370370.37');
  });

  // spec: calc-concrete › [CC16] Waste is applied before bags (volumes)
  it.each([
    ['0', 40],
    ['10', 44],
    ['12.5', 45],
  ])('adds %s%% extra: %i ft3', (waste, total) => {
    const { volumeFt3 } = outputs({ waste });
    expect(volumeFt3 && valueIn(volumeFt3, ft3)).toEqual(Rational.of(total));
  });
});
