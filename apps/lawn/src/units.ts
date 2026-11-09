import { ft2, kg, m2, parseDecimal, Rational, type UnitSystem } from '@maestro-calc/core';
import { fieldText } from './format.ts';
import type { CalculatorId } from './view.ts';

/** Square feet in a square metre: 1 / 0.3048², exact (the international foot). */
export const FT2_PER_M2: Rational = m2.factor.div(ft2.factor);

/** Grams in an avoirdupois pound: 453.59237, exact. */
export const G_PER_LB: Rational = Rational.of(1000).div(kg.factor);

/** Pounds in a kilogram, exact. */
const LB_PER_KG: Rational = kg.factor;

/**
 * The fields a calculator reads in metric, each with its factor to the unit of the engine: the
 * engines work in square feet and pounds, so a metric form is turned into them before a run. The
 * URL keeps the numbers as typed, with the `u=m` of the core codec.
 */
export const METRIC: Partial<Record<CalculatorId, Readonly<Record<string, Rational>>>> = {
  'grass-seed': { area: FT2_PER_M2, bag: LB_PER_KG },
};

/** The unit system a form's units field names: metric only when it says so. */
export const unitsOf = (value: string | undefined): UnitSystem =>
  value === 'metric' ? 'metric' : 'imperial';

/** A validated state in the units of the engine: the metric fields times their factor. */
export const imperialOf = <S extends Readonly<Record<string, unknown>>>(
  id: CalculatorId,
  state: S,
  units: UnitSystem,
): S => {
  const factors = METRIC[id];
  if (units === 'imperial' || factors === undefined) return state;
  const converted: Record<string, unknown> = { ...state };
  for (const [key, factor] of Object.entries(factors)) {
    const value = state[key];
    if (value instanceof Rational) converted[key] = value.mul(factor);
  }
  return converted as S;
};

/**
 * The text of a field after the form switches to `to`: the number in the other unit, two decimals
 * at most (`factor` is the imperial units in one metric unit). A field it cannot read is left as
 * it is.
 */
export const switchedText = (text: string, factor: Rational, to: UnitSystem): string => {
  const parsed = parseDecimal(text.trim());
  if (!parsed.ok) return text;
  return fieldText(to === 'metric' ? parsed.value.div(factor) : parsed.value.mul(factor));
};
