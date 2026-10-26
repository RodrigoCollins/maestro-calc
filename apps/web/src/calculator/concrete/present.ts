import {
  ft3,
  isQuantity,
  m3,
  yd3,
  type Money,
  type Quantity,
  type UnitSystem,
} from '@maestro-calc/core';
import type { concrete } from '../../lib/concrete.ts';
import type { Moment, Ready } from '../page-module.ts';
import { SHAPE_FIELDS } from './shapes.ts';
import {
  DASH,
  groupedInteger,
  moneyText,
  percentText,
  dimensionText,
  volumeText,
} from '../present.ts';

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

/** The placeholder of a footing field in the answer sentence, where it is not the key itself (ICW13). */
const PLACEHOLDERS: Readonly<Record<string, string>> = {
  footingWidth: 'width',
  footingDepth: 'depth',
};

/**
 * The placeholder values of the short answer of the state's shape (i18n-catalog ICW13): the fields
 * of that shape (a length as `dimensionText`, a count as it is), the volume as the primary
 * sentence (`1.63 cubic yards` in the US system, `1.25 cubic meters` in the metric one), the extra,
 * the bag size and the bags.
 */
export const answerValues = (
  { valid, result, system }: Ready<typeof concrete>,
  primary: string,
): Record<string, string> => ({
  ...Object.fromEntries(
    SHAPE_FIELDS[valid.shape].map((key) => {
      const value = valid[key];
      return [
        PLACEHOLDERS[key] ?? key,
        isQuantity(value) ? dimensionText(value, system) : String(value),
      ];
    }),
  ),
  volume: primary,
  waste: percentText(valid.waste),
  bagLb: valid.bag,
  bags: groupedInteger(bagsOf(result)),
});

/**
 * The placeholders of the bag line: the pounds of the pressed bag (they follow the choice even
 * while a field is invalid) and the cubic feet one bag yields, two places, or a dash without a
 * result. `yields` are the bag yields of the composition root.
 */
export const bagFills = (
  moment: Moment<typeof concrete>,
  yields: Yields,
): Readonly<Record<string, string>> => {
  const bag = moment.choices.bag;
  const bagYield = yields[`bag-${bag}`];
  if (bagYield === undefined) throw new TypeError(`no yield for the ${bag} lb bag`);
  return { bagLb: bag, yield: moment.result === undefined ? DASH : volumeText(bagYield, ft3) };
};
