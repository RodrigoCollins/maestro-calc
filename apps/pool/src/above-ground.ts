import { ft3, gal, liter, Rational, valueIn } from '@maestro-calc/core';
import { DOSING_CHART, doseOf } from './dosing.ts';
import { CHLORINE, FILL_TIME, SALT } from './doses.ts';
import { amountText, volumeText } from './format.ts';
import { GALLONS_GUIDE, volumeOf } from './gallons.ts';
import type { GuideSource, GuideStep, GuideTable, StepGuide } from './guide.ts';
import { LITRES_GUIDE } from './litres.ts';
import { VOLUME_CHART } from './volume/chart.ts';

/*
 * How many gallons an above-ground pool holds (Ahrefs 2026-11-08, US: "how many gallons in an
 * above ground pool" 200): the round and oval sizes of the site's pool size pages, with the gallons
 * of each inch of water, worked out by the volume calculator at build time. No gallon typed by hand.
 */

type Raw = Readonly<Record<string, string>>;

/** A pool of one depth all over: an above-ground pool is filled level. */
const flat = (size: Raw, depth: string): Raw => ({ ...size, shallow: depth, deep: depth });

const ft = (feet: number): string => `${String(feet)} ft`;
const gallonsOf = (raw: Raw): string => volumeText(volumeOf(raw), gal);

const ROUND = [12, 15, 18, 21, 24, 27, 30, 33] as const;
const OVAL = [
  [12, 24],
  [15, 30],
  [16, 32],
  [18, 33],
] as const;

/** Every size of the table: the round pools, then the ovals (width by length). */
const SIZES: readonly { readonly label: string; readonly size: Raw }[] = [
  ...ROUND.map((across) => ({
    label: `${String(across)} ft round`,
    size: { shape: 'round', length: ft(across) },
  })),
  ...OVAL.map(([width, length]) => ({
    label: `${String(width)} x ${String(length)} ft oval`,
    size: { shape: 'oval', length: ft(length), width: ft(width) },
  })),
];

const DEPTH = '4 ft';

const TABLE: GuideTable = {
  caption:
    'Above-ground pools with 4 ft of water: the gallons each inch of water adds, the gallons and the litres',
  region: 'Gallons of above-ground pools',
  head: ['Pool', 'Gallons per inch', 'Gallons, 4 ft of water', 'Litres, 4 ft of water'],
  rows: SIZES.map(({ label, size }) => [
    label,
    gallonsOf(flat(size, '1 in')),
    gallonsOf(flat(size, DEPTH)),
    volumeText(volumeOf(flat(size, DEPTH)), liter),
  ]),
  sources: ['nist'],
};

const roundAt = (feet: number, depth = DEPTH): Raw =>
  flat({ shape: 'round', length: ft(feet) }, depth);

const ROUND_24 = roundAt(24);
const round12 = gallonsOf(roundAt(12));
const round18 = gallonsOf(roundAt(18));
const round24 = gallonsOf(ROUND_24);
const round33 = gallonsOf(roundAt(33));
const round24Inch = gallonsOf(roundAt(24, '1 in'));
const round24Litres = volumeText(volumeOf(ROUND_24), liter);
const round18Surface = volumeText(volumeOf(roundAt(18, '1 ft')), ft3, 1);
const round18Cubic = volumeText(volumeOf(roundAt(18)), ft3, 1);
/** The rule of thumb on the same pool: 18 × 18 × 4 × 5.9. */
const round18Shortcut = amountText(Rational.of(18 * 18 * 4 * 59, 10));

// a 15 x 30 ft oval as an ellipse, and with straight sides: a 15 ft square between two half circles
const ellipse = volumeOf(flat({ shape: 'oval', length: '30 ft', width: '15 ft' }, DEPTH));
const straight = valueIn(volumeOf(flat({ length: '15 ft', width: '15 ft' }, DEPTH)), gal).add(
  valueIn(volumeOf(roundAt(15)), gal),
);
const ellipseGallons = volumeText(ellipse, gal);
const straightGallons = amountText(straight);
const straightMore = amountText(straight.sub(valueIn(ellipse, gal)));

/** The doses of the 24 ft round at 4 ft, in whole gallons, as its calculators give them. */
const POOL_GALLONS = valueIn(volumeOf(ROUND_24), gal).toNumber().toFixed(0);
const shock = doseOf(
  CHLORINE.path,
  { gallons: POOL_GALLONS, current: '0', target: '10', product: 'cal-hypo-65' },
  'dry',
);
const salt = doseOf(SALT.path, { gallons: POOL_GALLONS, current: '0', target: '3200' }, 'pounds');

const SOURCES = {
  nist: VOLUME_CHART.source,
  // as the dosing chart, the opening and the shock guides cite them
  calHypo: DOSING_CHART.sources.calHypo,
  manual: DOSING_CHART.sources.hayward,
} as const satisfies Record<string, GuideSource>;

const STEPS: readonly GuideStep[] = [
  {
    title: 'Measure the water, not the wall',
    text: 'Stretch the tape straight across the middle of the pool, inside the wall, then measure from the floor to the surface of the water. The wall height printed on the box is not the depth: the water stands below the top of the wall, and an inch guessed wrong is in every dose that follows.',
    link: { href: GALLONS_GUIDE.path, label: 'How to measure any shape' },
  },
  {
    title: 'Round: diameter × diameter × depth × 5.9',
    text: `An 18 ft round pool with 4 ft of water, by hand: its surface is π × 9 × 9 = ${round18Surface} square feet, × 4 ft = ${round18Cubic} cubic feet, and a cubic foot is 1,728 ÷ 231 = 7.48 US gallons, so the pool holds ${round18} gallons. The shortcut, 18 × 18 × 4 × 5.9 = ${round18Shortcut}, is close enough for a dose.`,
    sources: ['nist'],
  },
  {
    title: 'The gallons in each inch of water',
    text: `The middle column of the table is the surface times one inch. A 24 ft round takes ${round24Inch} gallons for each inch, so a week of hot weather that drops it 2 inches needs twice that to top it up, and lowering it 6 inches for a cover lets out six times as much.`,
    link: { href: FILL_TIME.path, label: 'Work out the time to fill or top it up' },
  },
  {
    title: 'Ovals: a true oval or straight sides',
    text: `The table works an oval out as an ellipse: a 15 x 30 ft oval with 4 ft of water holds ${ellipseGallons} gallons. Many above-ground ovals have straight sides, two half circles joined by straight walls; that 15 x 30 ft pool is a 15 ft square plus one 15 ft round, ${straightGallons} gallons, ${straightMore} more. Check the shape of your wall before you dose.`,
  },
  {
    title: 'The first shock, sized to the gallons',
    text: `A newly filled pool starts at 0 ppm of chlorine. To reach 10 ppm, the top of its label’s 5 to 10 ppm, the ${round24} gallons of a 24 ft round take ${shock} oz of 65% cal-hypo; swim again once free chlorine is back to 4 ppm or less, that label’s reentry level.`,
    link: { href: CHLORINE.path, label: 'Work out the chlorine for your size' },
    sources: ['calHypo'],
  },
  {
    title: 'Salt for a salt-water system',
    text: `Fresh water from the hose has almost no salt. Hayward’s AquaRite manual calls 3,200 ppm the best level, so the same 24 ft round, filled fresh, takes ${salt} lb of salt; add three quarters, run the pump for a day, then test before you add the rest.`,
    link: { href: SALT.path, label: 'Work out the salt for your size' },
    sources: ['manual'],
  },
  {
    title: 'Litres, for a pool sold in metres',
    text: `The 24 ft round with 4 ft of water holds ${round24Litres} litres. An above-ground pool sold in metres, such as a 3.66 m (12 ft) or a 4.57 m (15 ft) round, is quicker to work out in metres: diameter × diameter × depth × 785 gives the litres directly.`,
    link: { href: LITRES_GUIDE.path, label: LITRES_GUIDE.card.title },
  },
  {
    title: 'Your size at three depths',
    text: 'Each round size from 12 to 33 ft, and each oval of the table, has its own page with the gallons and litres at 3 ft 6 in, 4 ft and 4 ft 6 in of water, and a link that opens the calculator on it.',
    link: { href: '/24-ft-round-pool-gallons', label: 'How many gallons in a 24 ft round pool' },
  },
];

/**
 * How many gallons an above-ground pool holds: the round and oval sizes with 4 ft of water, the
 * gallons of each inch, an oval with straight sides, and the first shock and salt of a 24 ft round.
 */
export const ABOVE_GROUND_GUIDE = {
  path: '/how-many-gallons-in-an-above-ground-pool',
  checked: '2026-11-15',
  kicker: 'Guide · Pool volume',
  card: {
    title: 'Above ground pool gallons',
    summary: 'Round and oval sizes with 4 ft of water, and the gallons in each inch.',
  },
  title: 'How Many Gallons in an Above Ground Pool? By Size | Pool Figures',
  description: `An above-ground pool holds diameter × diameter × water depth × 5.9 gallons: ${round12} for a 12 ft round with 4 ft of water, ${round24} for 24 ft, ${round33} for 33 ft.`,
  h1: 'How many gallons in an above ground pool?',
  lead: `An above-ground pool holds diameter × diameter × water depth × 5.9 gallons: with 4 ft of water, a 12 ft round holds ${round12} gallons, an 18 ft round ${round18}, a 24 ft round ${round24} and a 33 ft round ${round33}. Each inch of water on a 24 ft round is ${round24Inch} gallons, and an oval holds less than a round pool as long as it.`,
  note: 'Every figure is an estimate for a pool filled level, measured inside the wall. When a dose depends on it, round your gallons up, never down.',
  table: TABLE,
  sources: SOURCES,
  steps: STEPS,
} as const satisfies StepGuide;
