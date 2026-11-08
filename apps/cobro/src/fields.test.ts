import { createPaint } from '@maestro-calc/core/calculators/paint';
import { PAINT_COVERAGE } from '@maestro-calc/core/testing/paint-yields';
import { cleaningQuote } from '@maestro-calc/cobro-core/cleaning';
import { describe, expect, it } from 'vitest';
import { defaultTextOf, fieldTextOf } from './fields.ts';

const paint = createPaint(PAINT_COVERAGE);
const textOf = (
  calculator: { inputs: readonly Parameters<typeof defaultTextOf>[0][] },
  key: string,
) => {
  const input = calculator.inputs.find((each) => each.key === key);
  if (input === undefined) throw new Error(key);
  return defaultTextOf(input);
};

describe('defaultTextOf', () => {
  it('writes a length in the unit of its label: feet for a room, nothing for a count', () => {
    expect(textOf(paint, 'length')).toBe('12');
    expect(textOf(paint, 'height')).toBe('8');
    expect(textOf(paint, 'doors')).toBe('1');
  });

  it('writes dollars, hours, percents and choices plain', () => {
    expect(textOf(cleaningQuote, 'rate')).toBe('25');
    expect(textOf(cleaningQuote, 'hours')).toBe('8');
    expect(textOf(cleaningQuote, 'overhead')).toBe('10');
    expect(textOf(cleaningQuote, 'laborBy')).toBe('hour');
  });

  it('writes an area in square feet and keeps the places of a rate', () => {
    expect(textOf(cleaningQuote, 'area')).toBe('1500');
    expect(textOf(cleaningQuote, 'areaRate')).toBe('2');
  });
});

describe('fieldTextOf', () => {
  it('writes an inch length in inches when the field is labelled in inches', () => {
    const concrete = { kind: 'length', defaultUnit: 'in' } as unknown as Parameters<
      typeof fieldTextOf
    >[0];
    const quantityOfFour = paint.inputs[2].default;
    expect(fieldTextOf(concrete, quantityOfFour)).toBe('96');
  });
});
