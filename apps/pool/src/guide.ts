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
  title: 'How to Open Your Pool in Spring, Step by Step | Pool Figures',
  description:
    'Open your pool in the order that saves a second trip to the store: cover, equipment, water level, salt, pH, then chlorine, each dose sized to your pool.',
  h1: 'Opening your pool this spring',
  lead: 'The order that saves a second trip to the store: the cover and the equipment first, then the water level, the salt, the pH and the chlorine last. Each dose is sized to your own pool.',
  sources: SOURCES,
  steps: STEPS,
} as const satisfies {
  path: string;
  title: string;
  description: string;
  h1: string;
  lead: string;
  sources: Record<string, GuideSource>;
  steps: readonly GuideStep[];
};
