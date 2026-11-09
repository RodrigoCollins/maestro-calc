import {
  isQuantityOf,
  kg,
  lb,
  Rational,
  valueIn,
  type Calculator,
  type InputDescriptor,
  type OutputDescriptor,
  type UnitSystem,
} from '@maestro-calc/core';
import {
  grassSeed,
  seedRateOf,
  type SeedSource,
  type SeedSpecies,
} from '@maestro-calc/lawn-core/grass-seed';
import { lawnFertilizer } from '@maestro-calc/lawn-core/lawn-fertilizer';
import { lawnLime } from '@maestro-calc/lawn-core/lawn-lime';
import { sod } from '@maestro-calc/lawn-core/sod';
import { amountText, fieldText, pluralOf, rangeText } from './format.ts';
import { FT2_PER_M2, G_PER_LB, imperialOf } from './units.ts';

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

const THOUSAND = Rational.of(1000);

/**
 * A low and a high mass as one range with its unit: pounds to one decimal in imperial; in metric,
 * kilograms to two decimals, or whole grams when the high end is under 1 kg.
 */
const massRange = (
  outputs: Outputs,
  low: string,
  high: string,
  units: UnitSystem,
): readonly [text: string, unit: string] => {
  if (units === 'imperial') return [rangeText(pounds(outputs, low), pounds(outputs, high)), 'lb'];
  const kilos = (key: string): Rational => {
    const value = outputs.get(key);
    if (!isQuantityOf(value, 'mass')) throw new Error(`${key} is not a mass`);
    return valueIn(value, kg);
  };
  const [lowKg, highKg] = [kilos(low), kilos(high)];
  return highKg.compare(Rational.ONE) < 0
    ? [rangeText(amountText(lowKg.mul(THOUSAND)), amountText(highKg.mul(THOUSAND))), 'g']
    : [rangeText(amountText(lowKg, 2), amountText(highKg, 2)), 'kg'];
};

/** The seeding rate of the state's grass and source: lb per 1,000 sq ft, or g/m² in metric. */
const rateOf = (
  state: Readonly<Record<string, unknown>>,
  units: UnitSystem,
): readonly [text: string, unit: string] => {
  const rate = seedRateOf(state['species'] as SeedSpecies, state['source'] as SeedSource);
  if (units === 'imperial')
    return [rangeText(fieldText(rate[0]), fieldText(rate[1])), 'lb per 1,000 sq ft'];
  // lb per 1,000 sq ft x g per lb x sq ft per m² / 1,000 = g/m²
  const [low, high] = rate.map((end) =>
    amountText(end.mul(G_PER_LB).mul(FT2_PER_M2).div(THOUSAND), 1),
  );
  return [rangeText(low ?? '', high ?? ''), 'g/m²'];
};
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
      units: UnitSystem,
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
  'grass-seed': (outputs, state, _bags, units) => {
    const [total, massUnit] = massRange(outputs, 'lowPounds', 'highPounds', units);
    const [perPass, passUnit] = massRange(outputs, 'lowPerPass', 'highPerPass', units);
    const [rate, rateUnit] = rateOf(state, units);
    const metric = units === 'metric';
    return {
      pounds: total,
      perPass,
      bags: rangeText(count(outputs, 'lowBags'), count(outputs, 'highBags')),
      bagsUnit: unit(outputs, 'highBags', 'bag', 'bags'),
      bagPounds: amount(state, 'bag'),
      bagUnit: metric ? 'kg' : 'lb',
      massUnit,
      passUnit,
      areaUnit: metric ? 'm²' : 'sq ft',
      lengthUnit: metric ? 'm' : 'ft',
      rate,
      rateUnit,
    };
  },
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
 * The validated state of the raw form text and the outputs of the engine on it. In metric the
 * fields of `METRIC` are turned into the engine's square feet and pounds and computed directly:
 * the bounds that apply are those of the numbers as typed.
 */
const runOf = (id: CalculatorId, raw: Readonly<Record<string, unknown>>, units: UnitSystem) => {
  const engine: Engine = ENGINES[id];
  const validated = engine.validate(raw);
  if (!validated.ok) return undefined;
  const converted = imperialOf(id, validated.value, units);
  if (converted === validated.value) {
    const ran = engine.run(raw);
    if (!ran.ok) return undefined;
    return {
      state: validated.value,
      outputs: new Map(ran.value.outputs.map(({ key, value }) => [key, value])),
      shopping: ran.value.shopping,
      warnings: ran.value.warnings,
    };
  }
  const computed = engine.compute(converted);
  return {
    state: validated.value,
    outputs: new Map<string, unknown>(Object.entries(computed.outputs)),
    shopping: computed.shopping,
    warnings: computed.warnings,
  };
};

/**
 * What a calculator page shows for the raw form text: the text of each `data-v` hook and the
 * warnings of the run, or `undefined` when an input cannot be read (the page then leaves its last
 * figures and marks the field). The server renders it for the defaults and the script for every
 * edit, so the two never differ. In `metric` the fields of `METRIC` (`units.ts`) are read in
 * square metres and kilograms.
 */
export const viewOf = (
  id: CalculatorId,
  raw: Readonly<Record<string, unknown>> = {},
  units: UnitSystem = 'imperial',
): View | undefined => {
  const ran = runOf(id, raw, units);
  if (ran === undefined) return undefined;
  const bags = ran.shopping[0]?.qty ?? 0n;
  return {
    values: SHAPES[id](ran.outputs, ran.state, bags, units),
    warnings: ran.warnings.map(({ code }) => code),
  };
};
