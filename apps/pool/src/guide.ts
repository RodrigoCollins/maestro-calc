import { CHEMISTRY_CHART } from './chemistry.ts';
import { CHLORINE, SALT } from './doses.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

/** A source the guide cites, by the key each step names it with. */
export interface GuideSource {
  readonly name: string;
  readonly url: string;
}

export interface GuideStep {
  readonly title: string;
  readonly text: string;
  readonly link?: { readonly href: string; readonly label: string };
  readonly sources?: readonly string[];
}

/** A guide of numbered steps (`components/StepGuide.astro`). */
interface StepGuide {
  path: string;
  kicker: string;
  card: { title: string; summary: string };
  title: string;
  description: string;
  h1: string;
  lead: string;
  sources: Record<string, GuideSource>;
  steps: readonly GuideStep[];
}

const SOURCES = {
  cdc: {
    name: 'CDC: Home Pool and Hot Tub Water Treatment and Testing',
    url: 'https://www.cdc.gov/healthy-swimming/about/home-pool-and-hot-tub-water-treatment-and-testing.html',
  },
  hayward: {
    name: 'Hayward: Opening Your Pool',
    url: 'https://www.hayward.com/maintenance/opening-your-pool',
  },
} as const satisfies Record<string, GuideSource>;

/** The steps, in order; each names the sources its figures come from. */
const STEPS: readonly GuideStep[] = [
  {
    title: 'Check what you have',
    text: 'Before you open the cover, look at the chlorine, shock, algaecide and balancers you kept from last season, and throw out any product past its date.',
    sources: ['hayward'],
  },
  {
    title: 'Take the cover off',
    text: 'Pump off the standing water and clear the leaves first, so they do not fall in. Fold the cover back slowly, then clean and dry it before you store it.',
    sources: ['hayward'],
  },
  {
    title: 'Put the equipment back',
    text: 'Remove the winterizing plugs, put the skimmer baskets and return fittings back, and reconnect the pump and the filter. Bring the water up to the level the skimmer needs.',
    sources: ['hayward'],
  },
  {
    title: 'Know your gallons',
    text: 'Every dose below depends on how much water the pool holds. Work it out once from the length, the width and the depth at each end, and keep the number.',
    link: { href: VOLUME_TEXTS.path, label: 'Work out your gallons' },
  },
  {
    title: 'Start the pump and look for leaks',
    text: 'Turn the circulation on, check the pump, the filter and the fittings for drips, and clean or backwash the filter if its pressure is high.',
    sources: ['hayward'],
  },
  {
    title: 'Test the water',
    text: 'Test free chlorine and pH with a DPD test kit. For a home pool, CDC recommends free chlorine of at least 1 ppm, at least 2 ppm if you use cyanuric acid or a stabilized chlorine such as dichlor or trichlor, and pH 7.0 to 7.8. Hayward’s opening guide aims for 1 to 3 ppm and a pH of 7.2 to 7.8.',
    sources: ['cdc', 'hayward'],
  },
  {
    title: 'Bring the salt up, if you have a salt cell',
    text: 'Salt does not evaporate, but rain and the fresh water you add to top the pool up dilute it. Test it, then add the pounds to reach the level your cell asks for, three quarters first and the rest after a day of circulation.',
    link: { href: SALT.path, label: 'Work out the salt' },
  },
  {
    title: 'Shock, then raise the chlorine',
    text: 'Shock the pool once the water is balanced, as the sun goes down so the sunlight does not burn the chlorine off, and bring free chlorine to your target with the product you have.',
    link: { href: CHLORINE.path, label: 'Work out the chlorine' },
    sources: ['hayward'],
  },
  {
    title: 'Vacuum the next day',
    text: 'Leave the pump running overnight, then vacuum what settled on the bottom and test again. Top the water up if the cleaning lowered it.',
    sources: ['hayward'],
  },
  {
    title: 'Keep testing',
    text: 'CDC advises testing chlorine and pH at least twice a day while the pool is in use, and more often when many people swim.',
    sources: ['cdc'],
  },
];

/**
 * Opening a pool in spring, in the order that saves a second trip to the store. The steps follow
 * Hayward's opening guide; the water targets are CDC's for home pools, with Hayward's where it
 * differs; every dose is sized by a calculator. No figure here that a source does not give.
 */
export const OPENING_GUIDE = {
  path: '/opening-your-pool',
  kicker: 'Guide · spring',
  card: {
    title: 'Opening your pool',
    summary: 'The spring steps in order, from the cover to the chlorine.',
  },
  title: 'How to Open Your Pool in Spring, Step by Step | Pool Figures',
  description:
    'Open your pool in the order that saves a second trip to the store: cover, equipment, water level, salt, pH, then chlorine, each dose sized to your pool.',
  h1: 'Opening your pool this spring',
  lead: 'The order that saves a second trip to the store: the cover and the equipment first, then the water level, the salt, the pH and the chlorine last. Each dose is sized to your own pool.',
  sources: SOURCES,
  steps: STEPS,
} as const satisfies StepGuide;

const CLOSING_SOURCES = {
  hayward: {
    name: 'Hayward: Closing Your Pool',
    url: 'https://www.hayward.com/maintenance/closing-your-pool',
  },
} as const satisfies Record<string, GuideSource>;

/** The cold-climate steps of Hayward's closing guide, in its order, then its mild-climate ones. */
const CLOSING_STEPS: readonly GuideStep[] = [
  {
    title: 'Know your gallons',
    text: 'The shock and every balancer you add before closing depend on how much water the pool holds. Work it out once from the length, the width and the depth at each end.',
    link: { href: VOLUME_TEXTS.path, label: 'Work out your gallons' },
  },
  {
    title: 'Balance the water',
    text: 'Bring the pH to 7.2 to 7.8, so the water does not stain, scale or grow algae while the pool is closed. The chart gives the range of every other level.',
    link: { href: CHEMISTRY_CHART.path, label: 'See the water chemistry chart' },
    sources: ['hayward'],
  },
  {
    title: 'Shock the pool',
    text: 'Shock the pool, then run the filter for 24 to 48 hours to clear the debris.',
    link: { href: CHLORINE.path, label: 'Work out the chlorine' },
    sources: ['hayward'],
  },
  {
    title: 'Clean and vacuum',
    text: 'Brush, skim and vacuum the pool thoroughly. It makes the spring opening easier.',
    sources: ['hayward'],
  },
  {
    title: 'Lower the water',
    text: 'Where the water freezes, drain it to below the skimmer, since water expands as it freezes.',
    sources: ['hayward'],
  },
  {
    title: 'Drain the equipment',
    text: 'Empty the water from the filter, the pump and the heater. Blow out the lines, then close the valves so no water gets back into them.',
    sources: ['hayward'],
  },
  {
    title: 'Turn off the power',
    text: 'Switch off the power to every piece of pool equipment.',
    sources: ['hayward'],
  },
  {
    title: 'Put the accessories away',
    text: 'Take off the ladders, slides and diving boards, and store them safely.',
    sources: ['hayward'],
  },
  {
    title: 'In a mild winter, keep it running',
    text: 'Where the water does not freeze, do not drain it. Cut the filter run time in half, keep the pH at 7.2 to 7.8 and free chlorine at 1.0 to 3.0 ppm, clean the skimmer every week, and shock the pool before you cover it.',
    sources: ['hayward'],
  },
];

/**
 * Closing a pool for winter. The steps and every figure follow Hayward's closing guide; each dose is
 * sized by a calculator and each level is on the chart. No figure here that a source does not give.
 */
export const CLOSING_GUIDE = {
  path: '/closing-your-pool',
  kicker: 'Guide · winter',
  card: {
    title: 'Closing your pool',
    summary: 'Balance, shock, lower the water and drain the lines before the frost.',
  },
  title: 'How to Close Your Pool for Winter, Step by Step | Pool Figures',
  description:
    'Close your pool for winter in order: balance the pH, shock, clean, lower the water below the skimmer, drain the equipment, then the power.',
  h1: 'Closing your pool for winter',
  lead: 'Where the water freezes, close the pool in this order: the water first, then the level, the equipment and the power. Where it does not, keep it running at half the filter time.',
  sources: CLOSING_SOURCES,
  steps: CLOSING_STEPS,
} as const satisfies StepGuide;

/** Every guide, in the order the home and the footer list them. */
export const GUIDES: readonly {
  readonly path: string;
  readonly card: { readonly title: string; readonly summary: string };
}[] = [OPENING_GUIDE, CLOSING_GUIDE, CHEMISTRY_CHART];
