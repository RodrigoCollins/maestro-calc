import { FROST_SOURCE } from '@maestro-calc/lawn-data/frost/source';
import { ALL_GUIDES } from './guide.ts';
import { METHOD_SECTIONS, type MethodSource } from './methodology.ts';
import { CONTACT_EMAIL } from './privacy.ts';
import { hrefOf } from './routes.ts';

/** Every linked source the site cites: the methodology's, then those of the guides. */
export const citedSources = (): { readonly name: string; readonly url: string }[] => {
  const all: MethodSource[] = [
    ...METHOD_SECTIONS.flatMap(({ sources }) => sources),
    ...ALL_GUIDES.flatMap(({ sources }) => Object.values(sources)),
  ];
  const unique = new Map<string, { name: string; url: string }>();
  for (const { name, url } of all) if (url !== undefined) unique.set(url, { name, url });
  return [...unique.values()];
};

export interface EditorialSection {
  readonly id: string;
  readonly heading: string;
  readonly paragraphs: readonly string[];
  /** The sources the section lists, each linked. */
  readonly sources?: readonly { readonly name: string; readonly url: string }[];
  /** A page of the site the section points to. */
  readonly link?: { readonly href: string; readonly label: string };
}

export interface Editorial {
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly sections: readonly EditorialSection[];
  readonly reviewed: string;
}

/** Who writes Lawn Figures and how its figures are sourced, checked and reviewed. */
export const EDITORIAL: Editorial = {
  title: 'Editorial Policy | Lawn Figures',
  description:
    'Who writes Lawn Figures, where its numbers come from, how each figure is checked and reviewed, and how to report an error.',
  h1: 'Editorial policy',
  lead: 'Every calculator, guide and data page of Lawn Figures is written by the Lawn Figures editorial team. This page says how we work.',
  sections: [
    {
      id: 'who',
      heading: 'Who we are',
      paragraphs: [
        'The Lawn Figures editorial team is a small independent team that builds free lawn calculators for home owners. We are not agronomists, turf managers or soil scientists, and we claim no credential we do not hold. That is why every figure comes from a published source, named on its page.',
      ],
    },
    {
      id: 'sources',
      heading: 'Where the numbers come from',
      paragraphs: [
        'We work from university extension publications and U.S. government data only: the fertilizer arithmetic and rates of Purdue and Penn State, the seeding rates of Virginia, Tennessee and Arkansas extension, the lime recommendations of the Penn State soil lab, and the NOAA 1991-2020 climate normals. A rate we cannot find in a primary source is left out, and the methodology page says which. These are the sources the site cites:',
      ],
      sources: citedSources(),
    },
    {
      id: 'checks',
      heading: 'How figures are checked',
      paragraphs: [
        'Every calculator does exact arithmetic and rounds only the figure you read. Each formula is tested against cases worked out by hand before a page goes live, and the tests run again on every change. The frost dates are copied from the NOAA files by a script kept in the site’s repository, and spot-checked by hand against the station files. The methodology page shows the formulas, the sources and those cases.',
      ],
      link: { href: hrefOf('methodology'), label: 'How we work it out' },
    },
    {
      id: 'reviews',
      heading: 'When pages are reviewed',
      paragraphs: [
        'Each guide and data page shows the day its figures were last checked against their sources. We recheck a figure when the publication it comes from changes, and we recheck every source at least once a year. The NOAA normals are rebuilt when NOAA publishes new ones.',
      ],
    },
    {
      id: 'errors',
      heading: 'How to report an error',
      paragraphs: [
        `Found a wrong figure or a broken source? Write to ${CONTACT_EMAIL} with the page and what you found. We read every message, and we fix confirmed errors on the page.`,
      ],
    },
    {
      id: 'advice',
      heading: 'Not professional advice',
      paragraphs: [
        'The figures are estimates. What we publish is not professional advice. Read the label of your product and follow it where it differs from our figures, and follow your soil test, your state and local rules, and your extension office. Fertilizer that runs off a lawn pollutes water, so the pages state the limits of their sources and never suggest more.',
      ],
    },
    {
      id: 'affiliate',
      heading: 'Affiliate disclosure',
      paragraphs: [
        'Some links on Lawn Figures may be paid (affiliate) links. When you sign up or buy through one, we may earn a commission at no extra cost to you. Each paid link is labelled "Paid link" right next to it.',
        'We recommend a tool only when it is one we would recommend for the task on that page, whether or not it pays. Payment never changes a calculator result, a figure or a ranking, and we do not show prices that can go stale.',
        'When a page links to Amazon: As an Amazon Associate we earn from qualifying purchases.',
      ],
    },
  ],
  reviewed: 'Last updated November 7, 2026.',
};

/** The words of the byline under the h1 of a guide or a data page. */
export const BYLINE_TEXT = {
  by: 'By',
  team: 'the Lawn Figures editorial team',
  reviewed: 'Reviewed',
  sources: 'Sources',
} as const;

/** The id of the sources section a byline links to. */
export const SOURCES_ID = 'sources';

export interface Byline {
  readonly by: string;
  readonly team: { readonly href: string; readonly label: string };
  readonly reviewed?: { readonly label: string; readonly datetime: string; readonly text: string };
  readonly sources?: { readonly href: string; readonly label: string };
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** A `YYYY-MM-DD` day as `November 7, 2026`. */
export const checkedText = (day: string): string => {
  const [year, month, date] = day.split('-');
  return `${MONTHS[Number(month) - 1] ?? ''} ${String(Number(date))}, ${year ?? ''}`;
};

/**
 * The byline of a page: the editorial team linked to the policy; the day the page's data says it
 * was last checked (`checked`, `YYYY-MM-DD`), when it has one; and the link to its sources section.
 */
export const bylineOf = ({
  checked,
  sources = false,
}: {
  readonly checked?: string;
  readonly sources?: boolean;
}): Byline => ({
  by: BYLINE_TEXT.by,
  team: { href: hrefOf('editorial'), label: BYLINE_TEXT.team },
  ...(checked === undefined
    ? {}
    : {
        reviewed: {
          label: BYLINE_TEXT.reviewed,
          datetime: checked,
          text: checkedText(checked),
        },
      }),
  ...(sources ? { sources: { href: `#${SOURCES_ID}`, label: BYLINE_TEXT.sources } } : {}),
});

/** The day the frost dataset was pulled from NOAA: the review day of every frost page. */
export const FROST_CHECKED = FROST_SOURCE.pulled;
