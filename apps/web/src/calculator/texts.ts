import {
  isQuantity,
  Rational,
  type InputDescriptor,
  type Money,
  type UnitSystem,
  type ValueOf,
} from '@maestro-calc/core';
import { parseLength } from '@maestro-calc/core';
import { isTextInput, type AnyCalculator, type StateOf, type TextKey } from './page-module.ts';
import { fieldText, percentText, priceText } from './present.ts';

/*
 * The texts of the fields, derived from the definition alone: one loop over the inputs by kind
 * replaces the hand lists a calculator page used to carry. Pure and language-free.
 */

/** A value of any input kind; `undefined` is what a record lookup yields for a key it lacks. */
type Value = ValueOf<InputDescriptor> | undefined;

/** True for money: what is left of a value that is not a quantity, a rational, a number, text or a flag. */
const isMoneyValue = (value: Value): value is Money =>
  typeof value === 'object' && !isQuantity(value) && !(value instanceof Rational);

const mismatch = (input: InputDescriptor): never => {
  throw new TypeError(`${input.key} holds no ${input.kind} value`);
};

/**
 * The text of one value as the form shows it: a length through `fieldText`, a count through
 * `String`, a percent through `percentText`, money through `priceText`. A select or a boolean has no
 * text, and a value of the wrong kind is a programming error.
 */
export const textOf = (input: InputDescriptor, value: Value, system: UnitSystem): string => {
  switch (input.kind) {
    case 'length':
      return isQuantity(value) ? fieldText(value, input, system) : mismatch(input);
    case 'count':
      return typeof value === 'number' ? String(value) : mismatch(input);
    case 'percent':
      return value instanceof Rational ? percentText(value) : mismatch(input);
    case 'money':
      return isMoneyValue(value) ? priceText(value) : mismatch(input);
    default:
      return mismatch(input);
  }
};

export function textKeysOf<C extends AnyCalculator>(calculator: C): readonly TextKey<C>[];
export function textKeysOf(calculator: AnyCalculator): readonly string[] {
  return calculator.inputs.filter(isTextInput).map(({ key }) => key);
}

/** The text of every text field for a state, in definition order. */
export function textsOf<C extends AnyCalculator>(
  calculator: C,
  state: StateOf<C>,
  system: UnitSystem,
): Readonly<Record<TextKey<C>, string>>;
export function textsOf(
  calculator: AnyCalculator,
  state: StateOf<AnyCalculator>,
  system: UnitSystem,
): Readonly<Record<string, string>> {
  return Object.fromEntries(
    calculator.inputs
      .filter(isTextInput)
      .map((input) => [input.key, textOf(input, state[input.key], system)]),
  );
}

/**
 * What the engine is given for a text: an empty price is `undefined`, which validation reads as the
 * default (DR-11); every other text goes as typed.
 */
export const rawTextOf = (input: InputDescriptor, text: string): string | undefined =>
  input.kind === 'money' && text.trim() === '' ? undefined : text;

/** The last valid state as a raw record: the engine reads a percent from text only. */
export const baseOf = (
  calculator: AnyCalculator,
  valid: StateOf<AnyCalculator>,
): Record<string, unknown> =>
  Object.fromEntries(
    calculator.inputs.map(({ key, kind }) => {
      const value = valid[key];
      return [key, kind === 'percent' && value instanceof Rational ? percentText(value) : value];
    }),
  );

/**
 * A text that is not valid, kept through a unit change. A bare number (`150`, out of range) is
 * written with the unit it was typed in (`150 in`): left bare, the other system would read it in
 * its own default unit and turn an invalid entry into a valid one that nobody typed. A text that
 * already has a unit, or that is not a length at all, does not take the unit and is kept as typed.
 */
export const keptText = (input: InputDescriptor, text: string, system: UnitSystem): string => {
  if (input.kind !== 'length') return text;
  const unit = system === 'metric' ? input.metricDefaultUnit : input.defaultUnit;
  const qualified = `${text} ${unit}`;
  return parseLength(qualified).ok ? qualified : text;
};
