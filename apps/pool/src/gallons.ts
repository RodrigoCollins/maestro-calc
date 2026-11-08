import { ft3, gal, isQuantityOf, liter, valueIn, type Quantity } from '@maestro-calc/core';
import { poolVolume } from '@maestro-calc/pool-core/pool-volume';
import { amountText, volumeText } from './format.ts';
import type { GuideSource, GuideStep, StepGuide } from './guide.ts';
import { VOLUME_CHART } from './volume/chart.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

/*
 * The two gallons guides: how many gallons your pool holds, worked out by shape, and how many an
 * Olympic pool holds, from the World Aquatics rule. Every figure is the volume calculator's own,
 * run at build time on the sizes each step names: no gallon here is typed by hand.
 */

type Raw = Readonly<Record<string, string>>;

/** The volume the calculator gives for `raw`; a size it rejects is a build error. */
export const volumeOf = (raw: Raw): Quantity<'volume'> => {
  const ran = poolVolume.run(raw);
  if (!ran.ok) throw new Error(`pool-volume did not run on ${JSON.stringify(raw)}`);
  const volume = ran.value.outputs.find(({ key }) => key === 'gallons')?.value;
  if (!isQuantityOf(volume, 'volume')) throw new Error('gallons must be a volume');
  return volume;
};

/** The gallons of `raw`, grouped and rounded to the gallon: `22,023`. */
export const gallonsOf = (raw: Raw): string => volumeText(volumeOf(raw), gal);

/** A pool of one depth all over: the shallow end and the deep end the same. */
const flat = (size: Raw, depth: string): Raw => ({ ...size, shallow: depth, deep: depth });

// The worked backyard pools, the sizes of their job pages and the volume chart.
const RECTANGLE = { length: '32 ft', width: '16 ft', shallow: '3 ft 6 in', deep: '8 ft' } as const;
const ROUND_24 = flat({ shape: 'round', length: '24 ft' }, '4 ft');
const OVAL = flat({ shape: 'oval', length: '30 ft', width: '15 ft' }, '4 ft');
const ROUND_SIZES = [12, 15, 18, 21, 24, 27, 30, 33] as const;
const roundAt = (feet: number, depth: string): Raw =>
  flat({ shape: 'round', length: `${String(feet)} ft` }, depth);

const backyard = gallonsOf(RECTANGLE);
const backyardLiters = volumeText(volumeOf(RECTANGLE), liter);
const round24 = gallonsOf(ROUND_24);
const round24CubicFeet = volumeText(volumeOf(ROUND_24), ft3, 1);
const oval = gallonsOf(OVAL);
const sixInches = amountText(
  valueIn(volumeOf(roundAt(24, '4 ft 6 in')), gal).sub(valueIn(volumeOf(ROUND_24), gal)),
);
const roundList = ROUND_SIZES.map(
  (feet) => `${String(feet)} ft, ${gallonsOf(roundAt(feet, '4 ft'))}`,
).join('; ');
const { cubicFoot, round } = VOLUME_CHART.factors;

// An Olympic pool: 50 m by 25 m, at the depths the rules have set.
const OLYMPIC = { length: '50 m', width: '25 m' } as const;
const olympicAt = (depth: string, width = '25 m'): Raw => flat({ ...OLYMPIC, width }, depth);
const OLYMPIC_MIN = olympicAt('2.5 m');
const olympic = gallonsOf(OLYMPIC_MIN);
const olympicLiters = volumeText(volumeOf(OLYMPIC_MIN), liter);
const olympicCubicFeet = volumeText(volumeOf(OLYMPIC_MIN), ft3);
const olympicOld = gallonsOf(olympicAt('2 m'));
const olympicOldLiters = volumeText(volumeOf(olympicAt('2 m')), liter);
const olympicDeep = gallonsOf(olympicAt('3 m'));
const olympicDeepLiters = volumeText(volumeOf(olympicAt('3 m')), liter);
const temporary = gallonsOf(olympicAt('2.5 m', '26 m'));
const tenCentimeters = gallonsOf(olympicAt('10 cm'));
const backyards = amountText(
  valueIn(volumeOf(OLYMPIC_MIN), gal).div(valueIn(volumeOf(RECTANGLE), gal)),
);

/** The figures both languages write, worked out once (`gallons-es.ts` writes the same). */
export const FIGURES = {
  cubicFoot,
  round,
  backyard,
  backyardLiters,
  round24,
  round24CubicFeet,
  oval,
  sixInches,
  roundSizes: ROUND_SIZES.map((feet) => ({ feet, gallons: gallonsOf(roundAt(feet, '4 ft')) })),
  olympic,
  olympicLiters,
  olympicCubicFeet,
  olympicOld,
  olympicOldLiters,
  olympicDeep,
  olympicDeepLiters,
  temporary,
  tenCentimeters,
  backyards,
} as const;

const calculator = { href: VOLUME_TEXTS.path, label: 'Work out your own pool' } as const;
const chart = { href: VOLUME_CHART.path, label: 'See every common size in the volume chart' };

const OLYMPIC_PATH = '/how-many-gallons-in-an-olympic-pool';

const GALLONS_SOURCES = {
  nist: VOLUME_CHART.source,
} as const satisfies Record<string, GuideSource>;

/** From the tape to the gallons, one shape at a time, each worked out by the calculator. */
const GALLONS_STEPS: readonly GuideStep[] = [
  {
    title: 'Measure inside the walls',
    text: 'Run the tape along the water, wall to wall: the length and the width of a rectangle or an oval, the distance straight across the middle of a round pool. Then measure the water depth at the shallow end and at the deep end. The average depth is the two added and halved: a pool 3 ft 6 in to 8 ft deep averages 5 ft 9 in, or 5.75 ft.',
    link: calculator,
  },
  {
    title: 'Turn cubic feet into gallons',
    text: `A US gallon is 231 cubic inches and a cubic foot is 1,728, so each cubic foot of water is ${cubicFoot} gallons. Every formula below is the surface of the pool, in square feet, times its average depth, times ${cubicFoot}.`,
    sources: ['nist'],
  },
  {
    title: 'Rectangle: length × width × depth',
    text: `A 16 ft by 32 ft pool from 3 ft 6 in to 8 ft deep: 16 × 32 = 512 square feet, × 5.75 ft = 2,944 cubic feet, × 1,728 ÷ 231 = ${backyard} gallons. The same pool at 4 ft all over holds less: its average depth is lower.`,
    link: { href: VOLUME_TEXTS.path, label: 'Work out a rectangle' },
  },
  {
    title: 'Round: diameter × diameter × depth × 5.9',
    text: `The surface of a circle is π × diameter² ÷ 4, so a round pool holds diameter × diameter × average depth × ${round} gallons. A 24 ft round pool with 4 ft of water: π × 24 × 24 ÷ 4 = 452.4 square feet, × 4 ft = ${round24CubicFeet} cubic feet, × 1,728 ÷ 231 = ${round24} gallons.`,
    link: { href: VOLUME_TEXTS.path, label: 'Work out a round pool' },
  },
  {
    title: 'Oval: length × width × depth × 5.9',
    text: `An oval is worked out as an ellipse, π × length × width ÷ 4, so it holds length × width × average depth × ${round}. A 15 ft by 30 ft oval with 4 ft of water holds ${oval} gallons. An oval with straight sides between two half circles holds a little more than the ellipse: work it out as a rectangle plus one round pool.`,
    link: { href: VOLUME_TEXTS.path, label: 'Work out an oval' },
  },
  {
    title: 'Above-ground pools: the water, not the wall',
    text: `An above-ground pool is filled below the top of its wall, so measure the depth of the water, not the height of the wall. With 4 ft of water, the round sizes hold, in gallons: ${roundList}. Each extra 6 inches on a 24 ft round adds ${sixInches} gallons, so a wrong guess of the depth moves every dose that follows.`,
    link: chart,
  },
  {
    title: 'Liters, for a metric label',
    text: `A US gallon is 3.785 liters, so the 16 by 32 ft pool holds ${backyardLiters} liters. Measured in meters, length × width × average depth is cubic meters, and each cubic meter is 1,000 liters.`,
    link: { href: VOLUME_TEXTS.path, label: 'Work it out in meters' },
  },
  {
    title: 'Kidney and freeform pools',
    text: 'No single formula fits a kidney or a freeform pool. Split the outline into rectangles and half circles, work out each one at its own average depth, and add them up. The sum is an estimate; a pool builder’s plan, or the gallons on the original paperwork, is closer.',
  },
  {
    title: 'An Olympic pool, for scale',
    text: `A 50 m by 25 m Olympic pool at the 2.5 m minimum depth of World Aquatics holds ${olympic} gallons, about ${backyards} times the 16 by 32 ft backyard pool above.`,
    link: { href: OLYMPIC_PATH, label: 'How many gallons in an Olympic pool' },
  },
];

/**
 * How many gallons your pool holds: the gallon of NIST, the surface of each shape the volume
 * calculator measures, and the pools of the job pages worked out with it. The guide links every
 * pool size page (`jobs.ts` gives each its link back), the calculator and the volume chart.
 */
export const GALLONS_GUIDE = {
  path: '/how-many-gallons-is-my-pool',
  checked: '2026-11-08',
  kicker: 'Guide · Pool volume',
  card: {
    title: 'How many gallons is my pool',
    summary: 'The formula for a rectangle, round and oval pool, with pools worked out.',
  },
  title: 'How Many Gallons Is My Pool? The Formula by Shape | Pool Figures',
  description:
    'How to calculate the gallons in your pool: length × width × average depth × 7.48 for a rectangle, × 5.9 for round and oval pools, with common sizes worked out.',
  h1: 'How many gallons is my pool? How to calculate it',
  lead: `Multiply the surface of the pool by its average depth, in feet, and by ${cubicFoot}: a rectangle is length × width × average depth × ${cubicFoot}, a round or oval pool diameter × diameter (or length × width) × average depth × ${round}. A 16 x 32 ft pool from 3 ft 6 in to 8 ft deep holds ${backyard} gallons, and a 24 ft round above-ground pool with 4 ft of water holds ${round24} gallons.`,
  note: 'Every figure is an estimate for a pool with a straight slope between its ends, measured inside the walls. When a dose depends on it, round your gallons up, never down.',
  sources: GALLONS_SOURCES,
  steps: GALLONS_STEPS,
} as const satisfies StepGuide;

const OLYMPIC_SOURCES = {
  worldAquatics: {
    name: 'World Aquatics, Swimming Pool Certification (in force as from 1 April 2026): Facilities Rules, Part 2, 15.1 to 15.4 and 15.6',
    url: 'https://resources.fina.org/fina/document/2026/05/21/59daca7b-55ff-4149-be49-46e0154c78c6/2026-03-11-WA-Pool-Certification-Swimming.docx',
  },
  fina: {
    name: 'FINA Facilities Rules 2017–2021 (valid as of 22 September 2017): FR 3, Swimming Pools for Olympic Games and World Championships',
    url: 'https://artisticswimming.ca/wp-content/uploads/2021/10/fina_facilities_2017-2021.pdf',
  },
} as const satisfies Record<string, GuideSource>;

/** From the rule to the gallons: the World Aquatics dimensions, then why the figure moves. */
const OLYMPIC_STEPS: readonly GuideStep[] = [
  {
    title: 'The length: 50 metres',
    text: 'World Aquatics sets the course at 50.000 metres between the touch panels of the timing system (Facilities Rules, Part 2, 15.1.1.1), with a tolerance of +0.010 and -0.000 metre. With touch panels at both ends, the wall to wall distance is 50.020 to 50.030 metres (15.2.1.2); this guide works out the 50 metres of the course.',
    sources: ['worldAquatics'],
  },
  {
    title: 'The width: 25 metres',
    text: 'At the Olympic Games and the World Aquatics Championships, a permanent pool is at least 25.000 metres wide and a temporary pool at least 26.000 metres (15.3.1). Eight lanes of 2.5 metres, with a 2.5 metre gap outside the first and the last lane, make the 25 metres.',
    sources: ['worldAquatics'],
  },
  {
    title: 'The depth: at least 2.5 metres',
    text: 'At the Olympic Games and the World Aquatics Championships, the pool is at least 2.5 metres deep (15.4.1). For the short course World Championships (25m) the minimum is 2.0 metres, with 2.5 metres recommended (15.4.2); at other events, 1.0 metre, and 1.35 metres in front of the starting blocks (15.4.3).',
    sources: ['worldAquatics'],
  },
  {
    title: 'Work it out',
    text: `50 m × 25 m × 2.5 m = 3,125 cubic metres, and a cubic metre is 1,000 liters, so the pool holds ${olympicLiters} liters. A US gallon is 3.785411784 liters: ${olympicLiters} ÷ 3.785411784 = ${olympic} US gallons, or ${olympicCubicFeet} cubic feet.`,
    link: { href: VOLUME_TEXTS.path, label: 'Work it out with the calculator' },
  },
  {
    title: 'Why you read 660,000 gallons',
    text: `The FINA rules of 2017 to 2021 set the depth of an Olympic pool at 2 metres minimum, 3 metres recommended (FR 3.3). At 2 m the same pool holds ${olympicOldLiters} liters, ${olympicOld} gallons, the figure often quoted; at 3 m, ${olympicDeepLiters} liters, ${olympicDeep} gallons. Each 10 cm of depth is ${tenCentimeters} gallons.`,
    sources: ['fina'],
  },
  {
    title: 'A minimum, not one size',
    text: `The rules set minimums, so a real Olympic pool can be deeper, and a temporary pool, at least 26 m wide, holds at least ${temporary} gallons at 2.5 m. A pool also used for artistic swimming, for which the older rules recommended 3 m, holds more: the depth is the number to ask for.`,
    sources: ['worldAquatics'],
  },
  {
    title: 'Next to a backyard pool',
    text: `A 16 by 32 ft backyard pool from 3 ft 6 in to 8 ft deep holds ${backyard} gallons, so an Olympic pool at 2.5 m holds about ${backyards} of them.`,
    link: { href: '/how-many-gallons-is-my-pool', label: 'How many gallons is my pool' },
  },
];

/**
 * How many gallons an Olympic pool holds: the length, width and depth of the World Aquatics rule
 * in force (Swimming Pool Certification, 1 April 2026), the older FINA minimum the common figure
 * comes from, and the gallons of each, worked out by the volume calculator in meters.
 */
export const OLYMPIC_GUIDE = {
  path: OLYMPIC_PATH,
  checked: '2026-11-08',
  kicker: 'Guide · Pool volume',
  card: {
    title: 'Gallons in an Olympic pool',
    summary: 'At least 825,000 US gallons: 50 by 25 m, 2.5 m deep, by the World Aquatics rule.',
  },
  title: 'How Many Gallons in an Olympic Pool? About 825,000 | Pool Figures',
  description: `An Olympic pool holds at least ${olympicLiters} liters, about ${olympic} US gallons: 50 m by 25 m and 2.5 m deep by the World Aquatics rules, and why 660,000 is quoted.`,
  h1: 'How many gallons is an Olympic swimming pool?',
  lead: `An Olympic swimming pool holds at least ${olympicLiters} liters, about ${olympic} US gallons. World Aquatics sets it at 50 m long, 25 m wide and at least 2.5 m deep for the Olympic Games and the World Championships, and 50 × 25 × 2.5 is 3,125 cubic metres. The 660,000 gallons often quoted is the same pool at 2 m, the minimum of the older FINA rules; deeper pools hold more.`,
  note: 'Every figure is the volume of a pool of one depth all over, from the minimums of the rules. A real pool holds what its own depth gives: ask its operator for the design volume.',
  sources: OLYMPIC_SOURCES,
  steps: OLYMPIC_STEPS,
} as const satisfies StepGuide;
