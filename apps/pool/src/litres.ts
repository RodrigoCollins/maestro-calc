import { gal, liter, m3, quantity, Rational, valueIn, type Quantity } from '@maestro-calc/core';
import { DOSING_CHART, doseOf } from './dosing.ts';
import { CHLORINE, FILL_TIME, SALT } from './doses.ts';
import { amountText, volumeText } from './format.ts';
import { GALLONS_GUIDE, volumeOf } from './gallons.ts';
import type { GuideSource, GuideStep, GuideTable, StepGuide } from './guide.ts';
import { SALT_AMOUNT_GUIDE } from './salt-amount.ts';
import { VOLUME_CHART } from './volume/chart.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

/*
 * How many litres a pool holds, for the pools measured in metres (Ahrefs 2026-11-08, "Sites
 * abroad": au "how many litres is my pool" 70, "how many litres in a pool" 70, "calculate pool
 * volume in litres" 50). Every litre is the volume calculator's own, run at build time on the
 * sizes each step names; the gallons of the UK and Canada are NIST's: no figure typed by hand.
 */

type Raw = Readonly<Record<string, string>>;

/** A pool of one depth all over. */
const flat = (size: Raw, depth: string): Raw => ({ ...size, shallow: depth, deep: depth });

/** The imperial gallon of the UK and Canada: 4.546 09 litres exactly (NIST SP 811, B.9). */
const IMPERIAL = Rational.of(454_609, 100_000);

const litresOf = (raw: Raw): string => volumeText(volumeOf(raw), liter);
const imperialOf = (volume: Quantity<'volume'>): string =>
  amountText(valueIn(volume, liter).div(IMPERIAL));

// the worked pools: a rectangle 1 m to 2 m deep, a round and an oval filled to 1.2 m
const RECTANGLE = { length: '8 m', width: '4 m', shallow: '1 m', deep: '2 m' } as const;
const ROUND = flat({ shape: 'round', length: '4.5 m' }, '1.2 m');
const OVAL = flat({ shape: 'oval', length: '6 m', width: '3.6 m' }, '1.2 m');
const UNIT_ROUND = flat({ shape: 'round', length: '1 m' }, '1 m');

const rectangle = litresOf(RECTANGLE);
const rectangleCubic = volumeText(volumeOf(RECTANGLE), m3);
const round = litresOf(ROUND);
const roundFactor = litresOf(UNIT_ROUND);
const roundFactorExact = volumeText(volumeOf(UNIT_ROUND), liter, 1);
const oval = litresOf(OVAL);
const rectangleCm = litresOf(flat({ length: '8 m', width: '4 m' }, '1 cm'));
const roundCm = litresOf(flat({ shape: 'round', length: '4.5 m' }, '1 cm'));
const rectangleImperial = imperialOf(volumeOf(RECTANGLE));
const rectangleUs = volumeText(volumeOf(RECTANGLE), gal);
const tenThousandUs = volumeText(quantity(10_000, gal), liter);

/** The pool the doses are worked for: the 8 x 4 m rectangle, in whole litres. */
const POOL_LITRES = valueIn(volumeOf(RECTANGLE), liter).toNumber().toFixed(0);
const shock = doseOf(
  CHLORINE.path,
  { gallons: POOL_LITRES, current: '0', target: '10', product: 'cal-hypo-65' },
  'dry',
  'metric',
);
const salt = doseOf(
  SALT.path,
  { gallons: POOL_LITRES, current: '0', target: '4000' },
  'pounds',
  'metric',
);

/** The rows of the table: the round pools at 1.2 m, the rectangles from 1 m to 2 m. */
const SIZES: readonly { readonly label: string; readonly size: Raw; readonly depth: string }[] = [
  ...(['3.6', '4.5', '5.5'] as const).map((across) => ({
    label: `${across} m round`,
    size: { shape: 'round', length: `${across} m` },
    depth: '1.2 m',
  })),
  ...(
    [
      ['6', '3'],
      ['8', '4'],
      ['10', '5'],
      ['12', '6'],
    ] as const
  ).map(([length, width]) => ({
    label: `${length} x ${width} m`,
    size: { length: `${length} m`, width: `${width} m` },
    depth: '1 to 2 m',
  })),
];

const rowOf = ({ label, size, depth }: (typeof SIZES)[number]): readonly string[] => {
  const raw = depth === '1.2 m' ? flat(size, '1.2 m') : { ...size, shallow: '1 m', deep: '2 m' };
  const volume = volumeOf(raw);
  return [
    label,
    depth,
    volumeText(volume, liter),
    litresOf(flat(size, '1 cm')),
    imperialOf(volume),
    volumeText(volume, gal),
  ];
};

const TABLE: GuideTable = {
  caption:
    'Pools measured in metres: the litres they hold, the litres of each centimetre of water, and the same water in UK and Canadian (imperial) gallons and in US gallons',
  region: 'Litres of pools in metres',
  head: ['Pool', 'Water depth', 'Litres', 'Litres per cm', 'Imperial gallons', 'US gallons'],
  rows: SIZES.map(rowOf),
  sources: ['nistSi'],
};

const SOURCES = {
  nist: VOLUME_CHART.source,
  nistSi: {
    name: 'NIST Guide to the SI (Special Publication 811), Appendix B.9: the gallon [Canadian and U.K. (Imperial)] is 4.546 09 litres, the US gallon 3.785 412',
    url: 'https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9',
  },
  // as the dosing chart and the salt guide cite them
  calHypo: DOSING_CHART.sources.calHypo,
  astral: SALT_AMOUNT_GUIDE.sources.astral,
} as const satisfies Record<string, GuideSource>;

const STEPS: readonly GuideStep[] = [
  {
    title: 'Measure in metres, inside the walls',
    text: 'Pools in Australia, the UK and Canada are built, sold and dosed in metres and litres, so measure in metres from the start. Take the length and the width along the water, wall to wall, or the distance straight across a round pool, then the depth of the water at the shallow end and at the deep end. Add the two depths and halve them: 1 m and 2 m average 1.5 m.',
    link: { href: VOLUME_TEXTS.path, label: 'Work it out in metres' },
  },
  {
    title: 'Rectangle: length × width × depth × 1,000',
    text: `Metres times metres times metres are cubic metres, and a cubic metre is 1,000 litres, since a litre is one cubic decimetre. An 8 by 4 m pool from 1 m to 2 m deep: 8 × 4 = 32 square metres, × 1.5 m = ${rectangleCubic} cubic metres, × 1,000 = ${rectangle} litres. No conversion factor to remember, which is why the metric figure is the easy one.`,
    sources: ['nist'],
  },
  {
    title: `Round: diameter × diameter × depth × ${roundFactor}`,
    text: `A circle covers π ÷ 4 of the square around it, and π ÷ 4 × 1,000 is ${roundFactorExact}, so a round pool holds diameter × diameter × average depth × ${roundFactor} litres. A 4.5 m round pool with 1.2 m of water: 4.5 × 4.5 × 1.2 × ${roundFactorExact} = ${round} litres.`,
    link: { href: VOLUME_CHART.path, label: 'See the round pools in metres in the volume chart' },
  },
  {
    title: `Oval: length × width × depth × ${roundFactor}`,
    text: `An oval is worked out as an ellipse, which covers the same π ÷ 4 of its rectangle as a circle covers of its square. A 6 by 3.6 m oval with 1.2 m of water holds 6 × 3.6 × 1.2 × ${roundFactorExact} = ${oval} litres. An oval with straight sides holds more: add its middle rectangle to one round pool of its width.`,
  },
  {
    title: 'The litres in each centimetre',
    text: `The surface in square metres, times 10, is the litres in one centimetre of water. On the 8 by 4 m pool each centimetre is ${rectangleCm} litres, and on the 4.5 m round, ${roundCm} litres. When a hot week takes the level down 3 cm, or you lower it for winter, that figure times the centimetres is the water to put back or let out.`,
    link: { href: FILL_TIME.path, label: 'Work out the time to top it up' },
  },
  {
    title: 'Gallons in the UK and Canada are not US gallons',
    text: `The imperial gallon of the UK and Canada is 4.54609 litres, exactly, and the US gallon 3.785412, NIST’s guide to the SI says. The 8 by 4 m pool holds ${rectangle} litres: ${rectangleImperial} imperial gallons, or ${rectangleUs} US gallons. A US label that doses per 10,000 gallons means US gallons, about ${tenThousandUs} litres; read a label in litres when you can.`,
    sources: ['nistSi'],
  },
  {
    title: 'A dose in grams, from the litres',
    text: `Chlorine is dosed by the litre: 1 ppm is 1 milligram in each litre. To shock the 8 by 4 m pool from 0 to 10 ppm, the top of its label’s 5 to 10 ppm, ${rectangle} litres take ${shock} g of 65% cal-hypo.`,
    link: { href: CHLORINE.path, label: 'Work out the chlorine in grams' },
    sources: ['calHypo'],
  },
  {
    title: 'Salt for a chlorinator, in kilograms',
    text: `A salt chlorinator asks for its level in ppm, the milligrams in each litre. AstralPool’s VX manual recommends 4,000 ppm, so the same ${rectangle} litres, filled with fresh water, take ${salt} kg of salt. Top-ups and other cells are in the salt guide.`,
    link: { href: SALT_AMOUNT_GUIDE.path, label: SALT_AMOUNT_GUIDE.card.title },
    sources: ['astral'],
  },
  {
    title: 'Freeform pools, and pools in feet',
    text: 'A kidney or a freeform outline has no single formula: split it into rectangles and half circles, work out each one at its own average depth, and add the litres. The builder’s plans, or the volume on the original paperwork, are closer. A pool measured in feet works the same way, with 7.48 US gallons in each cubic foot.',
    link: { href: GALLONS_GUIDE.path, label: GALLONS_GUIDE.card.title },
  },
];

/**
 * How many litres your pool holds, worked out in metres: the cubic metre of the SI, the surface of
 * each shape the volume calculator measures, the litres of each centimetre, the imperial and US
 * gallons of NIST, and a shock and a salt dose sized to the litres. English only for now.
 */
export const LITRES_GUIDE = {
  path: '/how-many-litres-is-my-pool',
  checked: '2026-11-15',
  kicker: 'Guide · Pool volume in metres',
  card: {
    title: 'How many litres is my pool',
    summary: 'The formula in metres, the litres per centimetre and the imperial gallons.',
  },
  title: 'How Many Litres Is My Pool? The Formula in Metres | Pool Figures',
  description:
    'Work out the litres in your pool: length × width × average depth × 1,000 in metres, × 785 for a round pool, with the imperial gallons of the UK and Canada.',
  h1: 'How many litres is my pool? How to work it out in metres',
  lead: `Multiply the length by the width by the average depth, all in metres, and by 1,000: an 8 x 4 m pool from 1 m to 2 m deep holds ${rectangle} litres. A round pool holds diameter × diameter × average depth × ${roundFactor} litres, so a 4.5 m round with 1.2 m of water holds ${round} litres, and each centimetre of water on the 8 x 4 m pool is ${rectangleCm} litres.`,
  note: 'Every figure is an estimate for a pool with a straight slope between its ends, measured inside the walls. When a dose depends on it, round your litres up, never down.',
  table: TABLE,
  sources: SOURCES,
  steps: STEPS,
} as const satisfies StepGuide;
