import { ft, ft2, isQuantity, valueIn } from '@maestro-calc/core';
import { createRoofing } from '@maestro-calc/core/calculators/roofing';
import { ROOFING_COVERAGE as FIXTURE } from '@maestro-calc/core/testing/roofing-yields';
import { ROOFING_COVERAGE } from '@maestro-calc/data/yields/roofing';
import { describe, expect, it } from 'vitest';
import { roofing } from './roofing.ts';

/** Each output of a run as text: a quantity by its exact canonical value, money marked as such. */
const outputsOf = (calculator: typeof roofing, raw: Readonly<Record<string, unknown>> = {}) => {
  const result = calculator.run(raw);
  if (!result.ok) throw new Error('run failed');
  return result.value.outputs.map(({ key, value }) =>
    isQuantity(value) ? `${key}=${value.canonical.toString()}` : `${key}=money`,
  );
};

describe('the web roofing calculator (calc-roofing › Injected coverage)', () => {
  // the composition root builds core's factory from the numbers-only module of the data package
  it('is built from the data coverage and runs like core with its fixture', () => {
    expect(roofing.id).toBe('roofing');
    expect(outputsOf(roofing)).toEqual(outputsOf(createRoofing(FIXTURE)));
    expect(outputsOf(roofing, { pitch: '3' })).toEqual(
      outputsOf(createRoofing(FIXTURE), { pitch: '3' }),
    );
  });

  // drift guard: the data module and the core fixture hold the same coverage
  it('holds the same coverage on both sides', () => {
    expect(valueIn(ROOFING_COVERAGE.bundle, ft2)).toEqual(valueIn(FIXTURE.bundle, ft2));
    expect(valueIn(ROOFING_COVERAGE.rollWidth, ft)).toEqual(valueIn(FIXTURE.rollWidth, ft));
    expect(valueIn(ROOFING_COVERAGE.rollLength, ft)).toEqual(valueIn(FIXTURE.rollLength, ft));
  });
});
