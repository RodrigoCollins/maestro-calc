import {
  encode,
  Rational,
  type Calculator,
  type InputDescriptor,
  type OutputDescriptor,
} from '@maestro-calc/core';
import type { poolAlkalinity } from '@maestro-calc/pool-core/pool-alkalinity';
import type { poolCalcium } from '@maestro-calc/pool-core/pool-calcium';
import type { poolChlorine } from '@maestro-calc/pool-core/pool-chlorine';
import type { poolFillTime } from '@maestro-calc/pool-core/pool-fill-time';
import type { poolHeater } from '@maestro-calc/pool-core/pool-heater';
import type { poolPh } from '@maestro-calc/pool-core/pool-ph';
import type { poolPump } from '@maestro-calc/pool-core/pool-pump';
import type { poolSalt } from '@maestro-calc/pool-core/pool-salt';
import type { poolStabilizer } from '@maestro-calc/pool-core/pool-stabilizer';
import type { poolVolume } from '@maestro-calc/pool-core/pool-volume';
import { amountText, outputText } from './format.ts';

/*
 * The arithmetic the worked steps of the job and calculator pages restate: the exact conversion
 * factors (NIST: a US gallon is 3.785411784 L, a pound 453.59237 g, an ounce 28.349523125 g, a
 * fluid ounce 29.5735295625 mL), the engines' own constants, and the text of a figure with `=`
 * when it is exact at the places shown and `≈` when it is rounded.
 */

type Raw = Readonly<Record<string, string>>;

export const LITERS_PER_GALLON = Rational.of(3_785_411_784, 1_000_000_000);
export const GRAMS_PER_POUND = Rational.of(45_359_237, 100_000);
export const GRAMS_PER_OUNCE = Rational.of(28_349_523_125, 1_000_000_000);
export const ML_PER_FLUID_OUNCE = Rational.of(295_735_295_625, 10_000_000_000);
export const POUNDS_PER_GALLON = Rational.of(834, 100);
export const BICARBONATE_PER_PPM = Rational.of(84_007, 50_040);

/** A plain decimal, `20000` or `8.7`, as an exact figure. */
export const r = (value: number | string): Rational => {
  const text = String(value);
  const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(text);
  if (match === null) throw new Error(`not a number: ${text}`);
  const [, sign = '', whole = '0', fraction = ''] = match;
  const magnitude = Rational.of(BigInt(`${whole}${fraction}`), 10n ** BigInt(fraction.length));
  return sign === '-' ? magnitude.neg() : magnitude;
};

/** A figure to `places` decimals, grouped. */
export const n = (value: Rational, places = 0): string => amountText(value, places);

/** The figure a reader sees at `places`, as a number to work on: the next step starts from it. */
export const shown = (value: Rational, places: number): Rational =>
  r(n(value, places).replaceAll(',', ''));

/** `= 125,100` when the figure is exact at `places`, `≈ 400.3` when it is rounded. */
export const is = (value: Rational, places = 0): string =>
  `${value.mul(Rational.of(10n ** BigInt(places))).isInteger() ? '=' : '≈'} ${n(value, places)}`;

export type Engine =
  | typeof poolSalt
  | typeof poolChlorine
  | typeof poolAlkalinity
  | typeof poolStabilizer
  | typeof poolHeater
  | typeof poolFillTime
  | typeof poolPh
  | typeof poolCalcium
  | typeof poolPump
  | typeof poolVolume;

/** The outputs of one engine run, by key; a run that fails is a build error. */
export const run = (engine: Engine, raw: Raw): ReadonlyMap<string, unknown> => {
  const ran = engine.run(raw);
  if (!ran.ok) throw new Error(`${engine.id} did not run on ${JSON.stringify(raw)}`);
  return new Map<string, unknown>([
    ...ran.value.outputs.map(({ key, value }): [string, unknown] => [key, value]),
    ['bags', ran.value.shopping[0]?.qty ?? 0n],
  ]);
};

/** One output of a run as the pages write it. */
export const out = (engine: Engine, raw: Raw, key: string): string =>
  outputText(key, run(engine, raw).get(key));

/** The calculator link that opens on `raw`, through the calculator's own URL state. */
export const linkTo = <const I extends readonly InputDescriptor[]>(
  engine: Calculator<string, I, readonly OutputDescriptor[], readonly string[]>,
  path: string,
  raw: Raw,
): string => {
  const validated = engine.validate(raw);
  if (!validated.ok) throw new Error(`${engine.id} rejects ${JSON.stringify(raw)}`);
  return `${path}?${encode(engine, validated.value)}`;
};
