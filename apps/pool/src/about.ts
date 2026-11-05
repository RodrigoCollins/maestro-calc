import { CONTACT_EMAIL } from './privacy.ts';

/**
 * The sources the about page names, each as it appears in the source names the methodology and the
 * guides cite; `about.test.ts` holds the two lists to each other, so the page claims no
 * source the site does not cite.
 */
export const NAMED_SOURCES = [
  'NIST',
  'USGS',
  'Department of Energy',
  'ANSI/APSP/ICC-15',
  'CDC',
  'EPA',
  'Hayward',
  'Taylor Technologies',
] as const;

export interface AboutSection {
  readonly id: string;
  readonly heading: string;
  readonly paragraphs: readonly string[];
  /** A page of the site the section points to. */
  readonly link?: { readonly href: string; readonly label: string };
}

export interface About {
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly sections: readonly AboutSection[];
  readonly reviewed: string;
}

/** Who runs Pool Figures and how it works (the about page, as Cuenta Horas' `/about`). */
export const ABOUT: About = {
  title: 'About | Pool Figures',
  description:
    'Who runs Pool Figures, what its free pool calculators do, where their numbers come from and how to reach us.',
  h1: 'About Pool Figures',
  lead: `Pool Figures is an independent site with free calculators for home pool owners in the US. The team behind Maestro Calc and Cuenta Horas runs it. You can write to us at ${CONTACT_EMAIL}.`,
  sections: [
    {
      id: 'what',
      heading: 'What the site does',
      paragraphs: [
        'Pool Figures works out the volume of your pool, the salt, the chlorine and the pH dose to add, and the pump flow your pool needs. Step-by-step guides cover opening the pool in spring and closing it for winter, a water chemistry chart gives the target range of each level, and a guide works out how long to run the pump. Each calculator shows the figure and the formula behind it.',
      ],
    },
    {
      id: 'method',
      heading: 'How the figures are worked out',
      paragraphs: [
        'Every calculator does exact arithmetic and rounds only the figure you read. Each formula is tested against cases worked out by hand, and the methodology page shows those cases. We use AI tools to help write text and code; the formulas are checked against those cases before a page goes live.',
      ],
      link: { href: '/methodology', label: 'How we work it out' },
    },
    {
      id: 'sources',
      heading: 'Sources',
      paragraphs: [
        'We cite primary sources only: NIST Handbook 44 for the size of a gallon, the USGS for the weight of water, the U.S. Department of Energy for heater sizing and pump run time, ENERGY STAR (EPA) for pump energy, the ANSI/APSP/ICC-15 standard for the pump flow, the CDC for water targets and public-pool limits, the pH dosage chart of Taylor Technologies’ test kits for acid and soda ash, and the manufacturer: the Hayward manuals and guides for salt, water levels, pump turnover, opening and closing, and the EPA-registered label of a product for its strength. Each page names the source of its figures.',
      ],
    },
    {
      id: 'estimates',
      heading: 'Estimates, not instructions',
      paragraphs: [
        'The figures are estimates. Pool chemicals can harm you when they are misused: read the label of your product and follow it, and test the water after each dose. For a problem you cannot solve, ask a pool professional.',
      ],
    },
    {
      id: 'data',
      heading: 'Your data',
      paragraphs: [
        'The site has no accounts, and the calculators run in your browser: the values you type are not sent to us. We do not sell data. The site has no advertising today. The privacy page describes the hosting logs and the analytics we use.',
      ],
      link: { href: '/privacy', label: 'Privacy' },
    },
    {
      id: 'contact',
      heading: 'Contact and corrections',
      paragraphs: [
        `Found an error? Write to ${CONTACT_EMAIL}. We read every message and fix confirmed errors.`,
      ],
    },
  ],
  reviewed: 'Last updated November 4, 2026.',
};
