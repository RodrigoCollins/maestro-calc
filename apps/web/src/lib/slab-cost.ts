import { Rational, valueIn, yd3 } from '@maestro-calc/core';
import type { MaterialSource } from '@maestro-calc/data';
import { decimalText } from '../calculator/present.ts';
import type { JobCase } from '../routing/jobs.ts';
import { concrete } from './concrete.ts';

/*
 * What a concrete slab costs (Ahrefs US, 2026-11-08: "concrete slab cost" 39K a month, KD 0-5):
 * only published, dated prices. There is no government series of ready-mix prices in dollars, so
 * the price per cubic yard is the average selling price two US producers report to the SEC each
 * quarter, the lowest and the highest of the producers found; the installed price per square foot
 * is the range of two cost guides that say when they were updated. The concrete of each slab is the
 * concrete engine's, with its 10% extra; the installed cost is the slab's area times the published
 * price, so it already holds the concrete.
 */

/** The average selling price of a producer's ready-mix concrete, in dollars per cubic yard. */
export interface ReadyMixPrice {
  readonly perYard: string;
  readonly source: Required<MaterialSource>;
}

/** The installed price of a plain 4 in slab a cost guide publishes, in dollars per square foot. */
export interface InstalledPrice {
  readonly low: string;
  readonly high: string;
  readonly source: Required<MaterialSource>;
}

const READ = '2026-11-09';

/** Lowest first: Eagle Materials (quarter ended 2026-09-30), then Knife River (third quarter 2026). */
export const READY_MIX_PRICES: readonly [ReadyMixPrice, ReadyMixPrice] = [
  {
    perYard: '160.18',
    source: {
      name: 'Eagle Materials Inc., results for the quarter ended September 30, 2026, Form 8-K exhibit 99.1 (average net sales price, concrete per cubic yard)',
      url: 'https://www.sec.gov/Archives/edgar/data/0000918646/000119312526446156/d135289dex991.htm',
      retrieved: READ,
    },
  },
  {
    perYard: '201.90',
    source: {
      name: 'Knife River Corporation, third quarter 2026 results, Form 8-K exhibit 99.1 (average selling price, ready-mix concrete per cubic yard)',
      url: 'https://www.sec.gov/Archives/edgar/data/1955520/000162828026069132/a2026q3ex99.htm',
      retrieved: READ,
    },
  },
];

/** Lowest first: This Old House (updated 2026-03-17), then Concrete Network (updated 2026-07-14). */
export const INSTALLED_PRICES: readonly [InstalledPrice, InstalledPrice] = [
  {
    low: '4.00',
    high: '8.00',
    source: {
      name: 'This Old House, concrete slab cost guide, updated March 17, 2026',
      url: 'https://www.thisoldhouse.com/foundations/concrete-slab-cost',
      retrieved: READ,
    },
  },
  {
    low: '6.50',
    high: '10.50',
    source: {
      name: 'Concrete Network, concrete prices guide, updated July 14, 2026 (plain concrete)',
      url: 'https://www.concretenetwork.com/concrete-prices.html',
      retrieved: READ,
    },
  },
];

const rational = (text: string): Rational => Rational.of(Math.round(Number(text) * 100), 100);

/** Whole dollars, ties away from zero: `$1,958`. */
const dollars = (amount: Rational): string => `$${decimalText(amount, 0, true)}`;
/** Dollars and cents: `$2.18`. */
const cents = (amount: Rational): string => `$${decimalText(amount, 2, true)}`;
const range = (low: string, high: string): string => `${low}–${high}`;

/** `$4.00–$10.50`: the lowest and the highest installed price per square foot published. */
export const installedRange = (): string =>
  range(cents(rational(INSTALLED_PRICES[0].low)), cents(rational(INSTALLED_PRICES[1].high)));

/** `$160.18–$201.90`: the lowest and the highest producer price per cubic yard. */
export const readyMixRange = (): string =>
  range(cents(rational(READY_MIX_PRICES[0].perYard)), cents(rational(READY_MIX_PRICES[1].perYard)));

const feetOf = (value: string | undefined): number => {
  const match = /^(\d+)ft$/.exec(value ?? '');
  if (match?.[1] === undefined) throw new Error(`a slab case gives whole feet: ${String(value)}`);
  return Number(match[1]);
};

/** The engine's concrete for `raw` at `perYard` dollars a cubic yard: yd³ and the cost. */
const priced = (raw: JobCase, perYard: string) => {
  const valid = concrete.validate({ ...raw, readyMixPrice: perYard });
  if (!valid.ok) throw new Error(`invalid slab case: ${JSON.stringify(raw)}`);
  const { outputs } = concrete.compute(valid.value);
  return { yards: valueIn(outputs.volumeYd3, yd3), cost: outputs.readyMixCost.amount };
};

/** `10ft` as `10 ft`. */
const sizeText = (value: string | undefined): string =>
  (value ?? '').replace(/^(\d+)(ft|in)$/, '$1 $2');

export interface SlabCost {
  /** `10 ft × 10 ft × 4 in`, as the job tables label a slab. */
  readonly label: string;
  /** Square feet. */
  readonly area: string;
  /** Cubic yards with the 10% extra. */
  readonly yards: string;
  /** The ready-mix at the low and the high producer price, whole dollars. */
  readonly readyMix: string;
  readonly readyMixExact: readonly [string, string];
  /** The installed cost at each cost guide's range, in the order of `INSTALLED_PRICES`. */
  readonly installed: readonly [string, string];
  /** The lowest to the highest installed cost of both guides. */
  readonly installedAll: string;
}

/** The cost of the slab `raw` (length, width, thickness): the engine's concrete, the published prices. */
export const slabCostOf = (raw: JobCase): SlabCost => {
  const area = Rational.of(feetOf(raw['length']) * feetOf(raw['width']));
  const low = priced(raw, READY_MIX_PRICES[0].perYard);
  const high = priced(raw, READY_MIX_PRICES[1].perYard);
  const installedAt = ({ low: from, high: to }: InstalledPrice): string =>
    range(dollars(area.mul(rational(from))), dollars(area.mul(rational(to))));
  const installed = [installedAt(INSTALLED_PRICES[0]), installedAt(INSTALLED_PRICES[1])] as const;
  return {
    label: ['length', 'width', 'thickness'].map((key) => sizeText(raw[key])).join(' × '),
    area: decimalText(area, 0, true),
    yards: decimalText(low.yards, 2, true),
    readyMix: range(dollars(low.cost), dollars(high.cost)),
    readyMixExact: [cents(low.cost), cents(high.cost)],
    installed,
    installedAll: range(
      dollars(area.mul(rational(INSTALLED_PRICES[0].low))),
      dollars(area.mul(rational(INSTALLED_PRICES[1].high))),
    ),
  };
};

/** The concrete alone of one square foot `thickness` in thick, with the 10% extra, at both prices. */
export const concreteCostPerSquareFoot = (thickness: number): string => {
  const raw = { length: '1ft', width: '1ft', thickness: `${String(thickness)}in` };
  const [low, high] = READY_MIX_PRICES;
  return range(cents(priced(raw, low.perYard).cost), cents(priced(raw, high.perYard).cost));
};
