import { ft2, isQuantity, valueIn } from '@maestro-calc/core';
import { createPaint } from '@maestro-calc/core/calculators/paint';
import { PAINT_COVERAGE as FIXTURE } from '@maestro-calc/core/testing/paint-yields';
import { PAINT_COVERAGE } from '@maestro-calc/data/yields/paint';
import { describe, expect, it } from 'vitest';
import { paint } from './paint.ts';

/** Each output of a run as text: a quantity by its exact canonical value, money marked as such. */
const outputsOf = (calculator: typeof paint, raw: Readonly<Record<string, unknown>> = {}) => {
  const result = calculator.run(raw);
  if (!result.ok) throw new Error('run failed');
  return result.value.outputs.map(({ key, value }) =>
    isQuantity(value) ? `${key}=${value.canonical.toString()}` : `${key}=money`,
  );
};

describe('the web paint calculator (calc-paint › Injected coverage)', () => {
  // the composition root builds core's factory from the numbers-only module of the data package
  it('is built from the data coverage and runs like core with its fixture', () => {
    expect(paint.id).toBe('paint');
    expect(outputsOf(paint)).toEqual(outputsOf(createPaint(FIXTURE)));
    expect(outputsOf(paint, { coats: '3' })).toEqual(
      outputsOf(createPaint(FIXTURE), { coats: '3' }),
    );
  });

  // drift guard: the data module and the core fixture hold the same coverage
  it('holds the same coverage on both sides', () => {
    expect(valueIn(PAINT_COVERAGE.perGallon, ft2)).toEqual(valueIn(FIXTURE.perGallon, ft2));
  });
});
