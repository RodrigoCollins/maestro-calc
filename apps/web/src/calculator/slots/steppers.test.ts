import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { pageModuleErrorOf, percentCalculator } from '../../__testing__/page-fixtures.ts';
import { concrete } from '../../lib/concrete.ts';
import { stepperSlot } from './steppers.ts';

const five = Rational.of(5);

describe('stepperSlot (calculator-page › [CP22], [CP57])', () => {
  const slot = stepperSlot(concrete, { waste: five });

  it('lists the keys it steps', () => {
    expect(slot.keys).toEqual(['waste']);
  });

  // spec: calculator-page › [CP22] the steps stop at the bounds of the descriptor
  it.each([
    [10, 'more', 15],
    [10, 'less', 5],
    [50, 'more', 50],
    [0, 'less', 0],
    [48, 'more', 50],
    [2, 'less', 0],
  ] as const)('moves %s %s to %s', (from, direction, to) => {
    expect(slot.next('waste', Rational.of(from), direction)).toEqual(Rational.of(to));
  });

  it('has no stepper for a key it is given no step for', () => {
    expect(stepperSlot(percentCalculator(20), { tip: undefined } as never).keys).toEqual([]);
  });

  it('leaves a key it has no step for where it is', () => {
    const other = stepperSlot(percentCalculator(20), {});
    expect(other.next('tip', Rational.of(7), 'more')).toEqual(Rational.of(7));
  });

  // spec: calculator-page › [CP57] the bounds are the descriptor's: no page code carries them
  it('stops at the maximum of the descriptor it is given', () => {
    expect(
      stepperSlot(percentCalculator(20), { tip: five }).next('tip', Rational.of(20), 'more'),
    ).toEqual(Rational.of(20));
    expect(
      stepperSlot(percentCalculator(30), { tip: five }).next('tip', Rational.of(20), 'more'),
    ).toEqual(Rational.of(25));
  });

  it.each(['open', 'floor', 'ceil', 'qty', 'missing'])(
    'throws STEPPER_BOUNDS for %s, which has no bounds or is not a percent',
    (key) => {
      const error = pageModuleErrorOf(() => stepperSlot(percentCalculator(20), { [key]: five }));
      expect(error.code).toBe('STEPPER_BOUNDS');
      expect(error.cause).toEqual({ id: 'percent-fixture', at: key });
    },
  );
});
