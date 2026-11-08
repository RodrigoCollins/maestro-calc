import { dateText } from './format.ts';
import { hrefOf } from './routes.ts';

/** One section of a text page (editorial policy, about, privacy): a heading, paragraphs, optional sources and link. */
export interface TextSection {
  readonly id: string;
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly sources?: readonly { readonly name: string; readonly url: string }[];
  readonly link?: { readonly href: string; readonly label: string };
}

/** A text page of the site. */
export interface TextPage {
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly sections: readonly TextSection[];
  readonly reviewed: string;
}

/** The day the editorial team last checked the policy pages. */
export const POLICY_CHECKED = '2026-11-07';

/** The primary sources the site may take a number from (plans/pets/PLAN.md, section 4). */
export const PRIMARY_SOURCES = [
  {
    name: 'Merck Veterinary Manual, Nutritional Requirements of Small Animals',
    url: 'https://www.merckvetmanual.com/management-and-nutrition/nutrition-small-animals/nutritional-requirements-and-related-diseases-of-small-animals',
  },
  {
    name: '2021 AAHA Nutrition and Weight Management Guidelines for Dogs and Cats, Box 1',
    url: 'https://www.aaha.org/globalassets/02-guidelines/2021-nutrition-and-weight-management/resourcepdfs/nutritiongl_box1.pdf',
  },
  {
    name: 'AAFCO, Understanding Pet Food: Calories',
    url: 'https://www.aafco.org/consumers/understanding-pet-food/calories/',
  },
] as const;

/** `2026-11-07` as `Nov 7, 2026`. */
export const checkedText = (checked: string): string => {
  const [year = 0, month = 0, day = 0] = checked.split('-').map(Number);
  return dateText({ year, month, day });
};

export const EDITORIAL: TextPage = {
  title: 'Editorial Policy: How We Source Pet Figures | Bowl Figures',
  description:
    'Who writes Bowl Figures, which sources a figure may come from, how pages are reviewed and dated, and how to report a mistake.',
  h1: 'Editorial policy',
  lead: 'Pet feeding and poison figures affect a living animal, so every number here comes from a named veterinary source and says so.',
  sections: [
    {
      id: 'authorship',
      heading: 'Who writes it',
      paragraphs: [
        'Every page is written and published by the Bowl Figures editorial team, an organization, not a person. The team works from published sources and does not give veterinary advice.',
      ],
    },
    {
      id: 'sourcing',
      heading: 'Where figures come from',
      paragraphs: [
        'A formula, factor, threshold or data value is used only when it is in a primary veterinary or regulatory source that the team has read: the Merck Veterinary Manual, the AAHA guidelines or AAFCO. Each is cited on the methodology page with its address and the day it was read.',
        'When a figure cannot be sourced it is left out, and the methodology page says why. The team never invents a number, and never fills a gap with a rule of thumb from a blog or a clone site.',
      ],
      sources: PRIMARY_SOURCES,
      link: { href: hrefOf('methodology'), label: 'See the methodology and its worked cases' },
    },
    {
      id: 'health',
      heading: 'Not veterinary advice',
      paragraphs: [
        'Every result is a starting point to check with your pet’s veterinarian. Where the sources disagree, the page shows the range. Every chocolate result tells you to call a veterinarian or a poison line, however low the figure.',
      ],
    },
    {
      id: 'review',
      heading: 'Review dates',
      paragraphs: [
        'A guide or chart shows the day its figures were last checked against its sources. A source that changes is read again and the page is corrected and re-dated.',
      ],
    },
    {
      id: 'corrections',
      heading: 'Corrections',
      paragraphs: [
        'If you find a figure that disagrees with a source, tell us which page and which source. A confirmed mistake is corrected on the page and its review date moves.',
      ],
    },
  ],
  reviewed: `Last reviewed ${checkedText(POLICY_CHECKED)}.`,
};

/** The words of the byline under the h1 of a guide or a chart. */
export const BYLINE_TEXTS = {
  by: 'By',
  team: 'the Bowl Figures editorial team',
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

/**
 * The byline of a page: the editorial team, linked to the policy; the day the page's data says it
 * was last checked, only when it has one; and the link to its sources section, only when asked.
 */
export const bylineOf = ({
  checked,
  sources = false,
}: {
  readonly checked?: string;
  readonly sources?: boolean;
}): Byline => ({
  by: BYLINE_TEXTS.by,
  team: { href: hrefOf('editorial'), label: BYLINE_TEXTS.team },
  ...(checked === undefined
    ? {}
    : {
        reviewed: {
          label: BYLINE_TEXTS.reviewed,
          datetime: checked,
          text: checkedText(checked),
        },
      }),
  ...(sources ? { sources: { href: `#${SOURCES_ID}`, label: BYLINE_TEXTS.sources } } : {}),
});
