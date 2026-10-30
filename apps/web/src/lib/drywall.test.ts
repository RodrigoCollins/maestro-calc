import { ft, ft2, gal, isQuantity, valueIn } from '@maestro-calc/core';
import { createDrywall } from '@maestro-calc/core/calculators/drywall';
import { DRYWALL_FINISHING as FIXTURE } from '@maestro-calc/core/testing/drywall-yields';
import { DRYWALL_FINISHING } from '@maestro-calc/data/yields/drywall';
import { describe, expect, it } from 'vitest';
import { drywall } from './drywall.ts';

/** Each output of a run as text: a quantity by its exact canonical value, money marked as such. */
const outputsOf = (calculator: typeof drywall, raw: Readonly<Record<string, unknown>> = {}) => {
  const result = calculator.run(raw);
  if (!result.ok) throw new Error('run failed');
  return result.value.outputs.map(({ key, value }) =>
    isQuantity(value) ? `${key}=${value.canonical.toString()}` : `${key}=money`,
  );
};

describe('the web drywall calculator (calc-drywall › Injected finishing rates)', () => {
  // the composition root builds core's factory from the numbers-only module of the data package
  it('is built from the data rates and runs like core with its fixture', () => {
    expect(drywall.id).toBe('drywall');
    expect(outputsOf(drywall)).toEqual(outputsOf(createDrywall(FIXTURE)));
    expect(outputsOf(drywall, { surfaces: 'walls' })).toEqual(
      outputsOf(createDrywall(FIXTURE), { surfaces: 'walls' }),
    );
  });

  // drift guard: the data module and the core fixture hold the same rates
  it('holds the same rates on both sides', () => {
    expect(valueIn(DRYWALL_FINISHING.per, ft2)).toEqual(valueIn(FIXTURE.per, ft2));
    expect(valueIn(DRYWALL_FINISHING.compound, gal)).toEqual(valueIn(FIXTURE.compound, gal));
    expect(valueIn(DRYWALL_FINISHING.tape, ft)).toEqual(valueIn(FIXTURE.tape, ft));
  });
});
