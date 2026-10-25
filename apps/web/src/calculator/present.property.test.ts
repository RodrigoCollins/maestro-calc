import {
  inch,
  parseLength,
  quantity,
  Rational,
  valueIn,
  type UnitSystem,
} from '@maestro-calc/core';
import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { fieldText, type LengthUnits } from './present.ts';

const RUNS = 1000;

/**
 * Exact lengths of every origin the page meets: ticks of a US tape (denominators up to 64), values
 * with a denominator past 64 (no US fraction), and whole millimetres, centimetres and metres.
 */
const lengthArb = fc.oneof(
  fc
    .tuple(fc.bigInt({ min: 0n, max: 2_000_000n }), fc.integer({ min: 1, max: 64 }))
    .map(([ticks, den]) => Rational.of(ticks, den)),
  fc
    .tuple(fc.bigInt({ min: 0n, max: 2_000_000n }), fc.integer({ min: 65, max: 400 }))
    .map(([num, den]) => Rational.of(num, den)),
  fc
    .tuple(fc.bigInt({ min: 0n, max: 1_000_000n }), fc.constantFrom(5n, 50n, 5000n))
    .map(([count, scale]) => Rational.of(count * scale, 127n)),
  fc
    .tuple(fc.bigInt({ min: 0n, max: 100_000n }), fc.constantFrom(1n, 3n, 6n, 7n))
    .map(([count, den]) => Rational.of(count, den)),
);

const unitsArb: fc.Arbitrary<LengthUnits> = fc.constantFrom(
  { defaultUnit: 'ft', metricDefaultUnit: 'm' },
  { defaultUnit: 'in', metricDefaultUnit: 'cm' },
  { defaultUnit: 'in', metricDefaultUnit: 'mm' },
);
const systemArb = fc.constantFrom<UnitSystem>('imperial', 'metric');

describe('field text round trip (calculator-page › [CP50], [CP33])', () => {
  // spec: calculator-page › [CP50] text to quantity to text, in both unit systems
  it('parses the text of any length back to exactly that length', () => {
    fc.assert(
      fc.property(lengthArb, unitsArb, systemArb, (inches, units, system) => {
        const text = fieldText(quantity(inches, inch), units, system);
        const parsed = parseLength(text);
        expect(parsed.ok, text).toBe(true);
        if (parsed.ok) expect(valueIn(parsed.value, inch), text).toEqual(inches);
      }),
      { numRuns: RUNS },
    );
  });

  // spec: calculator-page › [CP50] quantity to text to quantity to text is stable
  it('writes the same text for the length its text parses to', () => {
    fc.assert(
      fc.property(lengthArb, unitsArb, systemArb, (inches, units, system) => {
        const text = fieldText(quantity(inches, inch), units, system);
        const parsed = parseLength(text);
        expect(parsed.ok && fieldText(parsed.value, units, system)).toBe(text);
      }),
      { numRuns: RUNS },
    );
  });

  // spec: calculator-page › [CP33] the toggle keeps the length: the text of one system re-parses
  // to the length the other system wrote
  it('keeps the length across a toggle in both directions', () => {
    fc.assert(
      fc.property(lengthArb, unitsArb, systemArb, (inches, units, from) => {
        const to: UnitSystem = from === 'imperial' ? 'metric' : 'imperial';
        const shown = parseLength(fieldText(quantity(inches, inch), units, from));
        expect(shown.ok).toBe(true);
        if (!shown.ok) return;
        const back = parseLength(fieldText(shown.value, units, to));
        expect(back.ok && valueIn(back.value, inch)).toEqual(inches);
      }),
      { numRuns: RUNS },
    );
  });
});
