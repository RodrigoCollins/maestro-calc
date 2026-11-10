import { ft2, gal, Rational, valueIn } from '@maestro-calc/core';
import type { MaterialSource } from '@maestro-calc/data';
import { decimalText, groupedInteger } from '../calculator/present.ts';
import type { JobCase } from '../routing/jobs.ts';
import { paint } from './paint.ts';

/*
 * What painting costs (Ahrefs US, 2026-11-08: "how much does it cost to paint a house" 4.9K, "cost
 * to paint a room" 2.0K, "how much does a gallon of paint cost" 2.4K): only published, dated prices.
 * The paint of each room or house is the paint engine's (two coats at 350 sq ft a gallon, whole
 * cans); a painter's price is the published price per square foot times the area the guide prices:
 * the floor of a room or of a house inside, the walls of a house outside. Angi and HomeAdvisor
 * answer a bot with 403 and are not read.
 */

/** A published range in dollars, per square foot or per gallon, with its source. */
export interface PriceRange {
  readonly low: string;
  readonly high: string;
  readonly source: Required<MaterialSource>;
}

const READ = '2026-11-10';

const TOH_INTERIOR: Required<MaterialSource> = {
  name: 'This Old House, How Much Does Interior Painting Cost?, updated April 20, 2026',
  url: 'https://www.thisoldhouse.com/painting/interior-painting-cost',
  retrieved: READ,
};

const TOH_EXTERIOR: Required<MaterialSource> = {
  name: 'This Old House, How Much Does It Cost To Paint a House Exterior?, updated March 6, 2026',
  url: 'https://www.thisoldhouse.com/painting/exterior-painting-cost',
  retrieved: READ,
};

const FIXR_ROOM: Required<MaterialSource> = {
  name: 'Fixr, How much does it cost to paint a room?, updated January 31, 2025',
  url: 'https://www.fixr.com/costs/paint-room',
  retrieved: READ,
};

/** This Old House: $1 to $4 per square foot of floor space, interior painting by a pro. */
export const INTERIOR_PRO_PRICE: PriceRange = { low: '1.00', high: '4.00', source: TOH_INTERIOR };

/** Fixr: $1.50 to $3.50 per square foot to paint the walls of a room (priced by its floor). */
export const ROOM_PRO_PRICE: PriceRange = { low: '1.50', high: '3.50', source: FIXR_ROOM };

/** This Old House: $2.20 to $4.40 per square foot of exterior painting area. */
export const EXTERIOR_PRO_PRICE: PriceRange = { low: '2.20', high: '4.40', source: TOH_EXTERIOR };

/** This Old House, interior paint per gallon: value, mid-tier and premium ($60 and up). */
export const INTERIOR_GALLON_PRICES: readonly [PriceRange, PriceRange, PriceRange] = [
  { low: '15.00', high: '35.00', source: TOH_INTERIOR },
  { low: '35.00', high: '50.00', source: TOH_INTERIOR },
  { low: '50.00', high: '60.00', source: TOH_INTERIOR },
];

/** This Old House, exterior paint per gallon: contractor-grade, then premium 100% acrylic. */
export const EXTERIOR_GALLON_PRICES: readonly [PriceRange, PriceRange] = [
  { low: '30.00', high: '50.00', source: TOH_EXTERIOR },
  { low: '45.00', high: '85.00', source: TOH_EXTERIOR },
];

const rational = (text: string): Rational => Rational.of(Math.round(Number(text) * 100), 100);

/** Whole dollars, ties away from zero: `$2,574`. */
const dollars = (amount: Rational): string => `$${decimalText(amount, 0, true)}`;

/** Dollars and cents: `$2.20`. */
export const cents = (text: string): string => `$${decimalText(rational(text), 2, true)}`;

const range = (low: string, high: string): string => `${low}–${high}`;

/** `area` times both ends of `price`, whole dollars: `$100–$400`. */
export const areaCost = (area: Rational, { low, high }: PriceRange): string =>
  range(dollars(area.mul(rational(low))), dollars(area.mul(rational(high))));

/** `cans` whole gallons at both ends of `price`, whole dollars: `$105–$150`. */
export const gallonCost = (cans: bigint, price: PriceRange): string =>
  areaCost(Rational.of(cans), price);

/** `$1.00–$4.00`: both ends of a published price. */
export const priceText = ({ low, high }: PriceRange): string => range(cents(low), cents(high));

const feetOf = (value: string | undefined): Rational => {
  const match = /^(\d+)ft$/.exec(value ?? '');
  if (match?.[1] === undefined)
    throw new Error(`a paint cost case gives whole feet: ${String(value)}`);
  return Rational.of(Number(match[1]));
};

/** `10ft` as `10 ft`. */
const sizeText = (value: string | undefined): string =>
  (value ?? '').replace(/^(\d+)(ft|in)$/, '$1 $2');

/** The engine's paint of `raw`: the area painted, the gallons and the whole cans. */
const painted = (raw: JobCase) => {
  const valid = paint.validate(raw);
  if (!valid.ok) throw new Error(`invalid paint cost case: ${JSON.stringify(raw)}`);
  const { outputs, shopping } = paint.compute(valid.value);
  const can = shopping.find(({ materialId }) => materialId === 'paint');
  if (can === undefined) throw new Error('the paint engine buys no can');
  return {
    area: valueIn(outputs.paintArea, ft2),
    gallons: valueIn(outputs.gallons, gal),
    cans: can.qty,
  };
};

const labelOf = (raw: JobCase): string =>
  ['length', 'width', 'height'].map((key) => sizeText(raw[key])).join(' × ');

const floorOf = (raw: JobCase): Rational => feetOf(raw['length']).mul(feetOf(raw['width']));

export interface RoomCost {
  /** `10 ft × 10 ft × 8 ft`, as the job tables label a room. */
  readonly label: string;
  /** Square feet of floor, the area the painters' prices are given for. */
  readonly floor: string;
  /** Square feet of wall painted, the openings left out. */
  readonly walls: string;
  /** Gallons for two coats, and the whole cans; the cans of one coat. */
  readonly gallons: string;
  readonly cans: string;
  readonly oneCoatCans: string;
  /** The cans at the lowest value price to the highest premium price per gallon. */
  readonly paint: string;
  /** A painter's price at This Old House's range, then at Fixr's. */
  readonly pro: readonly [string, string];
}

/** The cost of painting the walls of the room `raw` (length, width, height), two coats. */
export const roomCostOf = (raw: JobCase): RoomCost => {
  const twoCoats = painted(raw);
  const oneCoat = painted({ ...raw, coats: '1' });
  const floor = floorOf(raw);
  const [value, , premium] = INTERIOR_GALLON_PRICES;
  return {
    label: labelOf(raw),
    floor: decimalText(floor, 0, true),
    walls: decimalText(twoCoats.area, 0, true),
    gallons: decimalText(twoCoats.gallons, 2, true),
    cans: groupedInteger(twoCoats.cans),
    oneCoatCans: groupedInteger(oneCoat.cans),
    paint: gallonCost(twoCoats.cans, { ...value, high: premium.high }),
    pro: [areaCost(floor, INTERIOR_PRO_PRICE), areaCost(floor, ROOM_PRO_PRICE)],
  };
};

export interface HouseCost {
  /** `25 ft × 40 ft × 9 ft`: a one-story house, its walls this high. */
  readonly label: string;
  /** Square feet of floor, the area the interior price is given for. */
  readonly floor: string;
  /** Square feet of outside wall, the exterior painting area. */
  readonly walls: string;
  readonly gallons: string;
  readonly cans: string;
  /** A painter outside, by the walls; inside, by the floor. */
  readonly outside: string;
  readonly inside: string;
  /** The outside cans at contractor-grade, then at premium acrylic prices. */
  readonly paint: readonly [string, string];
}

/** The cost of painting the one-story house `raw`: outside by its walls, inside by its floor. */
export const houseCostOf = (raw: JobCase): HouseCost => {
  const outside = painted(raw);
  const floor = floorOf(raw);
  const [contractor, premium] = EXTERIOR_GALLON_PRICES;
  return {
    label: labelOf(raw),
    floor: decimalText(floor, 0, true),
    walls: decimalText(outside.area, 0, true),
    gallons: decimalText(outside.gallons, 2, true),
    cans: groupedInteger(outside.cans),
    outside: areaCost(outside.area, EXTERIOR_PRO_PRICE),
    inside: areaCost(floor, INTERIOR_PRO_PRICE),
    paint: [gallonCost(outside.cans, contractor), gallonCost(outside.cans, premium)],
  };
};
