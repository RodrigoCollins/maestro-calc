import {
  cm,
  formatFeetInches,
  ft3,
  inch,
  isQuantity,
  m,
  m3,
  mm,
  quantity,
  Rational,
  toCents,
  toDecimalParts,
  usd,
  valueIn,
  yd3,
  type InputDescriptor,
  type LengthDescriptor,
  type Money,
  type Quantity,
  type Unit,
  type UnitSystem,
} from '@maestro-calc/core';
import type { concrete } from '../lib/concrete.ts';

/*
 * The text of every number the calculator page shows. Pure and language-free: `,` groups thousands
 * and `.` marks decimals in both locales (no `Intl`), so the build-time render and the script write
 * the same strings. Words arrive as arguments (templates), never from a catalog.
 */

/** The validated inputs of the concrete calculator. */
export type ConcreteState = Parameters<typeof concrete.compute>[0];

type RunOutcome = ReturnType<typeof concrete.run>;
/** The value of a successful run of the concrete calculator. */
export type ConcreteResult = Extract<RunOutcome, { readonly ok: true }>['value'];

/** The bag yields by purchase unit id (`bag-<pounds>`). */
export type Yields = Readonly<Record<string, Quantity<'volume'>>>;

type Length = Quantity<'length'>;

/** The largest denominator of a feet-and-inches fraction (1/64 of an inch). */
const FRACTION_LIMIT = 64n;
/** `toDecimalParts` rounds to at most this many places. */
const MAX_PLACES = 12;

const VOLUME_UNITS = { volumeYd3: yd3, volumeFt3: ft3, volumeM3: m3, netVolume: ft3 } as const;

const METRIC_UNITS = { mm, cm, m } as const;

/** `1234567` as `1,234,567`. */
export const groupedInteger = (value: bigint): string =>
  String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** `value` rounded to `places` decimals (ties away from zero), with the integer part grouped on request. */
const decimalText = (value: Rational, places: number, grouped: boolean): string => {
  const { negative, integer, fraction } = toDecimalParts(value, places);
  const whole = grouped ? groupedInteger(integer) : String(integer);
  return `${negative ? '-' : ''}${whole}${places === 0 ? '' : `.${fraction}`}`;
};

/** A volume in `unit` with two decimal places, for display only: `370,370.37`. */
export const volumeText = (volume: Quantity<'volume'>, unit: Unit<'volume'>): string =>
  decimalText(valueIn(volume, unit), 2, true);

/** Dollars rounded to the cent for display only: `$481.00`, `-$5.00`. */
export const moneyText = (money: Money): string => {
  const { negative, integer, fraction } = toCents(money);
  return `${negative ? '-' : ''}$${groupedInteger(integer)}.${fraction}`;
};

/** A percent as its canonical decimal: `10`, `12.5` (two places at most, no trailing zeros). */
export const percentText = (percent: Rational): string =>
  decimalText(percent, 2, false).replace(/\.?0+$/, '');

/** Replaces each `{name}` of `template` that `values` holds; other placeholders stay. */
export const fillMessage = (template: string, values: Readonly<Record<string, string>>): string =>
  template.replace(/\{(\w+)\}/g, (placeholder, name: string) => values[name] ?? placeholder);

/** The decimal places of a fraction with this denominator, or `undefined` when it never terminates. */
const placesOf = (denominator: bigint): number | undefined => {
  let rest = denominator;
  let twos = 0;
  let fives = 0;
  while (rest % 2n === 0n) {
    rest /= 2n;
    twos += 1;
  }
  while (rest % 5n === 0n) {
    rest /= 5n;
    fives += 1;
  }
  const places = Math.max(twos, fives);
  return rest === 1n && places <= MAX_PLACES ? places : undefined;
};

/** `3 1/2`, `1/2` or `3`: whole inches with a reduced fraction. */
const inchesPart = (whole: bigint, numerator: bigint, denominator: bigint): string => {
  if (numerator === 0n) return String(whole);
  const fraction = `${String(numerator)}/${String(denominator)}`;
  return whole === 0n ? fraction : `${String(whole)} ${fraction}`;
};

interface UsStyle {
  /** Total inches even above a foot (`16 in`), as a field with an inch unit shows them. */
  readonly inchesOnly: boolean;
  /** Group the feet (`1,000 ft`) for text the reader does not type back. */
  readonly grouped: boolean;
}

/** A length as feet, inches and a fraction rounded to the nearest `1/denominator` of an inch. */
const usText = (length: Length, denominator: number, { inchesOnly, grouped }: UsStyle): string => {
  const { feet, inches, fraction } = formatFeetInches(length, { denominator }).parts;
  const rest = (whole: bigint) => inchesPart(whole, fraction.numerator, fraction.denominator);
  if (inchesOnly || feet === 0n) return `${rest(feet * 12n + inches)} in`;
  const feetText = `${grouped ? groupedInteger(feet) : String(feet)} ft`;
  return inches === 0n && fraction.numerator === 0n ? feetText : `${feetText} ${rest(inches)} in`;
};

/** The exact decimal of a length in `unit`, or `undefined` when it has none (or too many places). */
const exactMetricText = (
  length: Length,
  unit: Unit<'length'>,
  grouped: boolean,
): string | undefined => {
  const value = valueIn(length, unit);
  const places = placesOf(value.den);
  return places === undefined ? undefined : decimalText(value, places, grouped);
};

/**
 * A length inside a sentence, rounded for display: US as `12 ft`, `4 in`, `12 ft 6 in`,
 * `5 ft 3 1/2 in` (to 1/64 in); metric with two places, metres from one metre up, else centimetres.
 * Lengths are never negative here (the engine bounds them at zero).
 */
export const dimensionText = (length: Length, system: UnitSystem): string => {
  if (system === 'imperial') return usText(length, 64, { inchesOnly: false, grouped: true });
  const metres = valueIn(length, m);
  return metres.compare(Rational.ONE) === -1
    ? `${decimalText(valueIn(length, cm), 2, true)} cm`
    : `${decimalText(metres, 2, true)} m`;
};

/** What a length field needs to know about its descriptor to write its text. */
export type LengthUnits = Pick<LengthDescriptor, 'defaultUnit' | 'metricDefaultUnit'>;

/** The text of a length field or of its bound; only the bound groups thousands (`1,000 ft`). */
const lengthText = (
  length: Length,
  units: LengthUnits,
  system: UnitSystem,
  grouped: boolean,
): string => {
  const inches = valueIn(length, inch);
  if (system === 'metric') {
    const unit = METRIC_UNITS[units.metricDefaultUnit];
    const decimal = exactMetricText(length, unit, grouped);
    if (decimal !== undefined) return `${decimal} ${unit.id}`;
  } else if (inches.den <= FRACTION_LIMIT) {
    const inchesOnly = units.defaultUnit === 'in';
    if (inches.isZero()) return inchesOnly ? '0 in' : '0 ft';
    const denominator = inches.den < 2n ? 2 : Number(inches.den);
    return usText(length, denominator, { inchesOnly, grouped });
  }
  // no US fraction and no metric decimal: the exact inches, which is never a whole number here
  return `${String(inches.num)}/${String(inches.den)} in`;
};

/**
 * The text of a length field: exact, so that parsing it gives the same length back. US is feet and
 * inches with a fraction of denominator 64 at most when that is exact (`12 ft 6 in`; `16 in` in a
 * field whose unit is inches), else exact inches (`20000/127 in`). Metric is the exact decimal in
 * the field's metric unit (`3.6576 m`), else exact inches (`127/3 in`).
 */
export const fieldText = (length: Length, units: LengthUnits, system: UnitSystem): string =>
  lengthText(length, units, system, false);

/** A violated bound (`min` or `max`, a canonical Rational string) in the unit of its field. */
export const boundText = (field: InputDescriptor, bound: string, system: UnitSystem): string => {
  const parsed = Rational.fromString(bound);
  if (!parsed.ok) throw new TypeError(`not a bound: ${bound}`);
  const value = parsed.value;
  switch (field.kind) {
    case 'length':
      return lengthText(quantity(value, inch), field, system, true);
    case 'percent':
      return `${percentText(value)}%`;
    case 'count':
      return groupedInteger(value.num);
    case 'money':
      return moneyText(usd(value));
    default:
      throw new TypeError(`${field.kind} has no bounds`);
  }
};

type VolumeKey = keyof typeof VOLUME_UNITS;
type OutputValue = ConcreteResult['outputs'][number]['value'];

/** The value of the output `key`; a result that lacks it is a programming error. */
const outputValue = (result: ConcreteResult, key: string): OutputValue => {
  const found = result.outputs.find((output) => output.key === key);
  if (found === undefined) throw new TypeError(`the result has no output ${key}`);
  return found.value;
};

const volumeOutput = (result: ConcreteResult, key: VolumeKey): Quantity<'volume'> => {
  const value = outputValue(result, key);
  if (!isQuantity(value)) throw new TypeError(`${key} is not a volume`);
  return value;
};

/** The whole bags of the one shopping line. */
const bagsOf = (result: ConcreteResult): bigint => {
  const [line] = result.shopping;
  if (line === undefined) throw new TypeError('the result has no shopping line');
  return line.qty;
};

const moneyOutput = (result: ConcreteResult, key: string): Money => {
  const value = outputValue(result, key);
  if (isQuantity(value)) throw new TypeError(`${key} is not money`);
  return value;
};

/** The three volume outputs in the order the panel lists them: the large figure first. */
const VOLUME_ORDER = {
  imperial: ['volumeYd3', 'volumeFt3', 'volumeM3'],
  metric: ['volumeM3', 'volumeYd3', 'volumeFt3'],
} as const;

/** The text of every figure of the panel (CP1, CP15 and CP16), ready to put in the page. */
export interface Figures {
  readonly volumeYd3: string;
  readonly volumeFt3: string;
  readonly volumeM3: string;
  readonly netVolume: string;
  /** The whole bags, grouped. */
  readonly bags: string;
  readonly bagLb: string;
  /** Cubic feet in one bag of the chosen size, two places: `0.60`. */
  readonly bagYield: string;
  readonly bagCost: string;
  readonly readyMixCost: string;
  /** A cost row shows only when its price is above zero (the price hint shows otherwise). */
  readonly bagCostVisible: boolean;
  readonly readyMixCostVisible: boolean;
  /** The volume outputs, the large figure first. */
  readonly order: readonly ('volumeYd3' | 'volumeFt3' | 'volumeM3')[];
}

/** The figures of a run for the unit system; `yields` are the bag yields of the composition root. */
export const figuresOf = (
  state: ConcreteState,
  result: ConcreteResult,
  yields: Yields,
  system: UnitSystem,
): Figures => {
  const volume = (key: VolumeKey) => volumeText(volumeOutput(result, key), VOLUME_UNITS[key]);
  const bagYield = yields[`bag-${state.bag}`];
  if (bagYield === undefined) throw new TypeError(`no yield for the ${state.bag} lb bag`);
  return {
    volumeYd3: volume('volumeYd3'),
    volumeFt3: volume('volumeFt3'),
    volumeM3: volume('volumeM3'),
    netVolume: volume('netVolume'),
    bags: groupedInteger(bagsOf(result)),
    bagLb: state.bag,
    bagYield: volumeText(bagYield, ft3),
    bagCost: moneyText(moneyOutput(result, 'bagCost')),
    readyMixCost: moneyText(moneyOutput(result, 'readyMixCost')),
    bagCostVisible: state.bagPrice.amount.sign() === 1,
    readyMixCostVisible: state.readyMixPrice.amount.sign() === 1,
    order: VOLUME_ORDER[system],
  };
};

/** The sentence templates the volume text is built from: `{value} cubic yards` and `{value} cubic meters`. */
export interface VolumeTemplates {
  readonly volumeYd3: string;
  readonly volumeM3: string;
}

/**
 * The placeholder values of the short answer of the state's shape (i18n-catalog ICW13): the
 * dimensions of that shape as `dimensionText`, the volume with its unit word (cubic yards in the
 * US system, cubic meters in the metric one), the extra, the bag size and the bags.
 */
export const answerValues = (
  state: ConcreteState,
  result: ConcreteResult,
  system: UnitSystem,
  templates: VolumeTemplates,
): Record<string, string> => {
  const text = (length: Length) => dimensionText(length, system);
  const common = {
    volume:
      system === 'imperial'
        ? fillMessage(templates.volumeYd3, {
            value: volumeText(volumeOutput(result, 'volumeYd3'), yd3),
          })
        : fillMessage(templates.volumeM3, {
            value: volumeText(volumeOutput(result, 'volumeM3'), m3),
          }),
    waste: percentText(state.waste),
    bagLb: state.bag,
    bags: groupedInteger(bagsOf(result)),
  };
  switch (state.shape) {
    case 'slab':
      return {
        length: text(state.length),
        width: text(state.width),
        thickness: text(state.thickness),
        ...common,
      };
    case 'footing':
      return {
        count: String(state.count),
        length: text(state.length),
        width: text(state.footingWidth),
        depth: text(state.footingDepth),
        ...common,
      };
    case 'column':
      return {
        count: String(state.count),
        diameter: text(state.diameter),
        height: text(state.height),
        ...common,
      };
    case 'steps':
      return {
        stepCount: String(state.stepCount),
        stepWidth: text(state.stepWidth),
        rise: text(state.rise),
        run: text(state.run),
        ...common,
      };
  }
};
