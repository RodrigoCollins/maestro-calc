import {
  ft3,
  isQuantity,
  m3,
  yd3,
  type Money,
  type Quantity,
  type UnitSystem,
} from '@maestro-calc/core';
import type { concrete } from '../lib/concrete.ts';
import {
  fillMessage,
  groupedInteger,
  moneyText,
  percentText,
  dimensionText,
  volumeText,
} from './present.ts';

/*
 * The text of the figures and the short answer of the concrete page: the concrete calculator's own
 * outputs and sentences on top of the language-free number text of `present.ts`.
 */
/** The validated inputs of the concrete calculator. */
export type ConcreteState = Parameters<typeof concrete.compute>[0];

type RunOutcome = ReturnType<typeof concrete.run>;
/** The value of a successful run of the concrete calculator. */
export type ConcreteResult = Extract<RunOutcome, { readonly ok: true }>['value'];

/** The bag yields by purchase unit id (`bag-<pounds>`). */
export type Yields = Readonly<Record<string, Quantity<'volume'>>>;

type Length = Quantity<'length'>;

const VOLUME_UNITS = { volumeYd3: yd3, volumeFt3: ft3, volumeM3: m3, netVolume: ft3 } as const;

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
