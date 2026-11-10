import { gal, isQuantityOf, oz, Rational, valueIn } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { poolPh } from './pool-ph.ts';

// Metric: the litres are turned into US gallons (3.785411784 L each) for Taylor's chart, which is
// written per 10,000 gallons; 37,854.11784 L is exactly 10,000 gallons.
const outputs = (raw: Readonly<Record<string, unknown>>) => {
  const result = poolPh.run({ units: 'metric', ...raw });
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return new Map(result.value.outputs.map(({ key, value }) => [key, value]));
};

describe('pool pH in metric', () => {
  it('doses 37,854.11784 L, 10,000 gallons, at 9.16 fl oz of acid a drop', () => {
    const liquid = outputs({ gallons: '37854.11784', drops: '2' }).get('liquid');
    expect(isQuantityOf(liquid, 'volume') && valueIn(liquid, gal)).toEqual(
      Rational.of(1832, 128 * 100),
    );
  });

  it('doses soda ash on the litres as gallons', () => {
    const dry = outputs({ gallons: '37854.11784', product: 'soda-ash', drops: '1' }).get('dry');
    expect(isQuantityOf(dry, 'mass') && valueIn(dry, oz)).toEqual(Rational.of(513, 100));
  });

  it('doses dry acid on the litres as gallons', () => {
    const dry = outputs({ gallons: '37854.11784', product: 'dry-acid', drops: '1' }).get('dry');
    expect(isQuantityOf(dry, 'mass') && valueIn(dry, oz)).toEqual(Rational.of(1232, 100));
  });

  it('caps a day of acid on the same gallons: a quart per 20,000', () => {
    const perDay = outputs({ gallons: '75708.23568' }).get('liquidPerDay');
    expect(isQuantityOf(perDay, 'volume') && valueIn(perDay, gal)).toEqual(Rational.of(1, 4));
  });
});
