import { Rational } from '@maestro-calc/core';
import { fail, type AnyCalculator, type PercentKey, type StepperSlot } from '../page-module.ts';

/**
 * A stepper on each percent input it is given a step for. The bounds are the descriptor's, never
 * the module's: `stepperSlot` throws `STEPPER_BOUNDS` for an input that is not a percent or has no
 * `min` or no `max`, and `next` stops at them (D5, K8).
 */
export function stepperSlot<C extends AnyCalculator>(
  calculator: C,
  steps: Readonly<Partial<Record<PercentKey<C>, Rational>>>,
): StepperSlot<C>;
export function stepperSlot(
  calculator: AnyCalculator,
  steps: Readonly<Partial<Record<string, Rational>>>,
): StepperSlot<AnyCalculator> {
  const ranges = new Map<string, { min: Rational; max: Rational; step: Rational }>();
  for (const [key, step] of Object.entries(steps)) {
    if (step === undefined) continue;
    const input = calculator.inputs.find((found) => found.key === key);
    if (input?.kind !== 'percent' || input.min === undefined || input.max === undefined) {
      return fail('STEPPER_BOUNDS', calculator.id, key);
    }
    ranges.set(key, { min: input.min, max: input.max, step });
  }
  return {
    keys: [...ranges.keys()],
    next: (key, current, direction) => {
      const range = ranges.get(key);
      if (range === undefined) return current;
      const moved = direction === 'more' ? current.add(range.step) : current.sub(range.step);
      return moved.compare(range.min) < 0
        ? range.min
        : moved.compare(range.max) > 0
          ? range.max
          : moved;
    },
  };
}
