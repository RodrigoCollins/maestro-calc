import { encode, Rational } from '@maestro-calc/core';
import type { MaterialSource } from '@maestro-calc/data';
import { decimalText, groupedInteger } from '../calculator/present.ts';
import type { JobCase } from '../routing/jobs.ts';
import { pathOf } from '../routing/routes.ts';
import type { Locale } from '@maestro-calc/i18n';
import { fence } from './fence.ts';

/*
 * What a fence costs (backlog #46, 2026-11-10: "fence" is a calculator gap, and a cost question is
 * won by the page that prices it): only published, dated prices. The installed price per linear
 * foot is the range two cost guides publish for each material, read on the day below; a guide that
 * has no row for a material gives it no price (This Old House prices "metal", not aluminum). The
 * materials of each length are the fence engine's, at its defaults: a 6 ft privacy fence with posts
 * every 8 ft.
 */

/** The materials of the page, in the order its tables list them. */
export const FENCE_MATERIALS = ['wood', 'vinyl', 'chain-link', 'aluminum'] as const;

export type FenceMaterial = (typeof FENCE_MATERIALS)[number];

/** A guide's installed price of a material, in whole dollars per linear foot. */
export interface PerFoot {
  readonly low: number;
  readonly high: number;
}

/** The installed prices a cost guide publishes, by material. */
export interface FencePrices {
  readonly prices: Readonly<Partial<Record<FenceMaterial, PerFoot>>>;
  readonly source: Required<MaterialSource>;
}

const READ = '2026-11-10';

/** This Old House (updated 2026-06-08), then Bob Vila (updated 2024-04-17). */
export const FENCE_PRICES: readonly [FencePrices, FencePrices] = [
  {
    prices: {
      wood: { low: 15, high: 35 },
      vinyl: { low: 15, high: 40 },
      'chain-link': { low: 13, high: 27 },
    },
    source: {
      name: 'This Old House, "A Comprehensive Guide to Fencing Options for Your Yard", updated June 8, 2026 (average cost per linear foot installed)',
      url: 'https://www.thisoldhouse.com/lawns/fencing-options',
      retrieved: READ,
    },
  },
  {
    prices: {
      wood: { low: 17, high: 45 },
      vinyl: { low: 10, high: 40 },
      'chain-link': { low: 15, high: 30 },
      aluminum: { low: 17, high: 90 },
    },
    source: {
      name: 'Bob Vila, "Installing a Fence: Costs and Key Considerations for Homeowners Today", updated April 17, 2024 (cost range per linear foot)',
      url: 'https://www.bobvila.com/articles/fence-installation-cost/',
      retrieved: READ,
    },
  },
];

/** Whole dollars, grouped: `$2,250`. */
const dollars = (amount: number): string => `$${decimalText(Rational.of(amount), 0, true)}`;

const range = (low: string, high: string): string => `${low}–${high}`;

/** The prices the guides give `material`. */
const pricesOf = (material: FenceMaterial): PerFoot[] =>
  FENCE_PRICES.flatMap(({ prices }) => {
    const price = prices[material];
    return price === undefined ? [] : [price];
  });

/** The lowest and the highest price per linear foot of `material` in the guides that list it. */
const boundsOf = (material: FenceMaterial): PerFoot => {
  const prices = pricesOf(material);
  return {
    low: Math.min(...prices.map(({ low }) => low)),
    high: Math.max(...prices.map(({ high }) => high)),
  };
};

/** `$15–$45`: the installed price per linear foot of `material`. */
export const perFootRangeOf = (material: FenceMaterial): string => {
  const { low, high } = boundsOf(material);
  return range(dollars(low), dollars(high));
};

/** A guide's own range for `material`, or the dash when it has no row for it. */
export const guideRangeOf = (prices: FencePrices, material: FenceMaterial): string => {
  const price = prices.prices[material];
  return price === undefined ? '—' : range(dollars(price.low), dollars(price.high));
};

/** The lowest and the highest price per linear foot of every material: `$10` and `$90`. */
export const perFootRange = (): readonly [string, string] => {
  const all = FENCE_MATERIALS.map(boundsOf);
  return [
    dollars(Math.min(...all.map(({ low }) => low))),
    dollars(Math.max(...all.map(({ high }) => high))),
  ];
};

/** The installed cost of `feet` of fence in each material, in the order of `FENCE_MATERIALS`. */
export const fenceCostOf = (feet: number): string[] =>
  FENCE_MATERIALS.map((material) => {
    const { low, high } = boundsOf(material);
    return range(dollars(feet * low), dollars(feet * high));
  });

/** The validated state of a case: a case the engine rejects is a programming error. */
const stateOf = (raw: JobCase) => {
  const valid = fence.validate(raw);
  if (!valid.ok) throw new Error(`invalid fence case: ${JSON.stringify(raw)}`);
  return valid.value;
};

/** The posts, rails, boards and 80 lb bags of the fence `raw`, as the engine counts them. */
export const fenceMaterialsOf = (raw: JobCase) => {
  const [posts, rails, boards, bags] = fence
    .compute(stateOf(raw))
    .shopping.map(({ qty }) => groupedInteger(qty));
  if (bags === undefined) throw new Error('the fence engine returned fewer than four lines');
  return { posts: posts ?? '', rails: rails ?? '', boards: boards ?? '', bags };
};

/** The fence calculator with the case `raw` in its URL. */
export const fenceHref = (raw: JobCase, locale: Locale): string =>
  `${pathOf('fence', locale)}?${encode(fence, stateOf(raw), { unitSystem: 'imperial' })}`;

/** The feet of a case: `100ft` is 100. */
export const feetOf = (raw: JobCase): number => {
  const match = /^(\d+)ft$/.exec(raw['length'] ?? '');
  if (match?.[1] === undefined)
    throw new Error(`a fence case gives whole feet: ${String(raw['length'])}`);
  return Number(match[1]);
};
