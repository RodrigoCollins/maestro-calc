import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { describe, expect, it } from 'vitest';
import { fillMessage } from '../present.ts';
import { answerValues } from './present.ts';

/** The placeholder values of the answer for form strings in a unit system; a failed run fails the test. */
const valuesOf = (
  raw: Readonly<Record<string, unknown>>,
  system: 'imperial' | 'metric',
  primary: string,
) => {
  const state = rectangleArea.validate(raw, { unitSystem: system });
  const result = rectangleArea.run(raw, { unitSystem: system });
  if (!state.ok || !result.ok) throw new Error('run failed');
  return answerValues({ system, choices: {}, valid: state.value, result: result.value }, primary);
};

describe('rectangle-area answer values (calc-rectangle-area › [RAP2], [RAP3])', () => {
  // spec: calc-rectangle-area › [RAP3] the dimensions are the language-free text of the length
  it.each([
    [{}, 'imperial', '10 ft', '10 ft'],
    [{ length: '12\' 6"', width: "10'" }, 'imperial', '12 ft 6 in', '10 ft'],
    [{ length: '3.05 m', width: '3.05 m' }, 'metric', '3.05 m', '3.05 m'],
  ] as const)('writes %j in %s as %s by %s', (raw, system, length, width) => {
    expect(valuesOf(raw, system, 'x')).toEqual({ length, width, area: 'x' });
  });

  // spec: calc-rectangle-area › [RAP2] the area is the unit sentence of the primary figure
  it('hands the primary sentence on as the area, unchanged', () => {
    const values = valuesOf({}, 'imperial', '100.00 square feet');
    expect(fillMessage('A {length} by {width} area is {area}.', values)).toBe(
      'A 10 ft by 10 ft area is 100.00 square feet.',
    );
  });
});
