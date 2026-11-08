import {
  isQuantityOf,
  lb,
  Rational,
  valueIn,
  type Calculator,
  type InputDescriptor,
  type OutputDescriptor,
} from '@maestro-calc/core';
import { grassSeed } from '@maestro-calc/lawn-core/grass-seed';
import { lawnFertilizer } from '@maestro-calc/lawn-core/lawn-fertilizer';
import { lawnLime } from '@maestro-calc/lawn-core/lawn-lime';
import { sod } from '@maestro-calc/lawn-core/sod';
import { amountText, fieldText, pluralOf, rangeText } from './format.ts';

/** A calculator of the site, whichever its inputs. */
export type Engine = Calculator<
  string,
  readonly InputDescriptor[],
  readonly OutputDescriptor[],
  readonly string[]
>;

/** The engine of each calculator page, by its id. */
export const ENGINES = {
  'lawn-fertilizer': lawnFertilizer,
  'grass-seed': grassSeed,
  sod,
  'lawn-lime': lawnLime,
} as const satisfies Record<string, Engine>;

export type CalculatorId = keyof typeof ENGINES;

/** The text a page writes for each `data-v` hook, and the warning codes the run raised. */
export interface View {
  readonly values: Readonly<Record<string, string>>;
  readonly warnings: readonly string[];
}

type Outputs = ReadonlyMap<string, unknown>;

const poundsOf = (outputs: Outputs, key: string): Rational => {
  const value = outputs.get(key);
  if (!isQuantityOf(value, 'mass')) throw new Error(`${key} is not a mass`);
  return valueIn(value, lb);
};

const numberOf = (outputs: Outputs, key: string): Rational => {
  const value = outputs.get(key);
  if (!(value instanceof Rational)) throw new Error(`${key} is not a number`);
  return value;
};

const pounds = (outputs: Outputs, key: string): string => amountText(poundsOf(outputs, key), 1);
const count = (outputs: Outputs, key: string): string => amountText(numberOf(outputs, key));
const unit = (outputs: Outputs, key: string, one: string, many: string): string =>
  pluralOf(numberOf(outputs, key).floor(), one, many);

const amount = (state: Readonly<Record<string, unknown>>, key: string): string => {
  const value = state[key];
  if (!(value instanceof Rational)) throw new Error(`${key} is not an amount`);
  return fieldText(value);
};

const SHAPES: Readonly<
  Record<
    CalculatorId,
    (
      outputs: Outputs,
      state: Readonly<Record<string, unknown>>,
      bags: bigint,
    ) => Record<string, string>
  >
> = {
  'lawn-fertilizer': (outputs, state, bags) => ({
    pounds: pounds(outputs, 'pounds'),
    perThousand: pounds(outputs, 'perThousand'),
    coverage: count(outputs, 'bagCoverage'),
    bags: amountText(Rational.of(bags)),
    bagsUnit: pluralOf(bags, 'bag', 'bags'),
    nitrogenPounds: pounds(outputs, 'nitrogenPounds'),
    phosphatePounds: pounds(outputs, 'phosphatePounds'),
    potashPounds: pounds(outputs, 'potashPounds'),
    bagPounds: amount(state, 'bag'),
  }),
  'grass-seed': (outputs, state) => ({
    pounds: rangeText(pounds(outputs, 'lowPounds'), pounds(outputs, 'highPounds')),
    perPass: rangeText(pounds(outputs, 'lowPerPass'), pounds(outputs, 'highPerPass')),
    bags: rangeText(count(outputs, 'lowBags'), count(outputs, 'highBags')),
    bagsUnit: unit(outputs, 'highBags', 'bag', 'bags'),
    bagPounds: amount(state, 'bag'),
  }),
  sod: (outputs, state) => ({
    order: count(outputs, 'order'),
    extra: count(outputs, 'extra'),
    pallets: count(outputs, 'pallets'),
    palletsUnit: unit(outputs, 'pallets', 'pallet', 'pallets'),
    slabs: count(outputs, 'slabs'),
    slabsUnit: unit(outputs, 'slabs', 'slab', 'slabs'),
    palletSize: String(state['pallet']),
  }),
  'lawn-lime': (outputs, state, bags) => ({
    pounds: pounds(outputs, 'pounds'),
    perThousand: pounds(outputs, 'perThousand'),
    bags: amountText(Rational.of(bags)),
    bagsUnit: pluralOf(bags, 'bag', 'bags'),
    bagPounds: amount(state, 'bag'),
  }),
};

/**
 * What a calculator page shows for the raw form text: the text of each `data-v` hook and the
 * warnings of the run, or `undefined` when an input cannot be read (the page then leaves its last
 * figures and marks the field). The server renders it for the defaults and the script for every
 * edit, so the two never differ.
 */
export const viewOf = (
  id: CalculatorId,
  raw: Readonly<Record<string, unknown>> = {},
): View | undefined => {
  const engine: Engine = ENGINES[id];
  const ran = engine.run(raw);
  const validated = engine.validate(raw);
  if (!ran.ok || !validated.ok) return undefined;
  const outputs = new Map(ran.value.outputs.map(({ key, value }) => [key, value]));
  const bags = ran.value.shopping[0]?.qty ?? 0n;
  return {
    values: SHAPES[id](outputs, validated.value, bags),
    warnings: ran.value.warnings.map(({ code }) => code),
  };
};
