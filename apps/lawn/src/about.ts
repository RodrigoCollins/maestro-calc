import { hrefOf } from './routes.ts';

/** The about page: what the site is, for whom, and what it does not do. */
export const ABOUT = {
  title: 'About | Lawn Figures',
  description:
    'Lawn Figures is a set of free lawn calculators and frost date tables that show their formulas and cite university extension and NOAA sources.',
  h1: 'About Lawn Figures',
  lead: 'Lawn Figures turns what extension services publish about lawns into numbers you can use at the spreader and the sod farm.',
  sections: [
    {
      id: 'what',
      heading: 'What it is',
      paragraphs: [
        'Extension services publish the rates for fertilizer, seed and lime per 1,000 square feet and leave the conversion to the reader. Lawn Figures does that conversion: the pounds of the bag in your garage, not pounds of nitrogen, and the bags to buy.',
        'Cost guides say what mowing, sod, artificial grass and the other lawn services cost, each price a published figure of a named source with the day we read it, worked out by lawn size with the calculators.',
        'Frost dates come from the NOAA 1991-2020 climate normals: one page for each state, with every station’s last spring and first fall freeze at three probability levels, and a ZIP lookup that finds the nearest station.',
      ],
    },
    {
      id: 'different',
      heading: 'What is different',
      paragraphs: [
        'Every page shows its formula and names its source with an address, and the limits a source sets are shown, never exceeded. Pages carry no script apart from the calculator itself, so they load fast on a phone in the yard.',
      ],
      link: { href: hrefOf('methodology'), label: 'How we work it out' },
    },
    {
      id: 'who',
      heading: 'Who writes it',
      paragraphs: [
        'The Lawn Figures editorial team, a small independent team. The editorial policy says how figures are sourced, checked and reviewed.',
      ],
      link: { href: hrefOf('editorial'), label: 'Editorial policy' },
    },
    {
      id: 'not',
      heading: 'What it does not do',
      paragraphs: [
        'It does not diagnose a lawn, choose a product or set a lime rate without a soil test. For the other half of a yard job, mulch, gravel, topsoil and area, it points to the calculators of Maestro Calc, which are made by the same team.',
      ],
    },
  ],
  reviewed: 'Last updated November 7, 2026.',
} as const;
