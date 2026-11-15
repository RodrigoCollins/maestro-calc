import { dateText } from './format.ts';
import { hrefOf, type Lang } from './routes.ts';

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

const MONTHS_DE = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
] as const;

/** `2026-11-07` as `Nov 7, 2026`, or in German `7. November 2026`. */
export const checkedText = (checked: string, lang: Lang = 'en'): string => {
  const [year = 0, month = 0, day = 0] = checked.split('-').map(Number);
  return lang === 'en'
    ? dateText({ year, month, day })
    : `${String(day)}. ${MONTHS_DE[month - 1] ?? ''} ${String(year)}`;
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
    {
      id: 'affiliate',
      heading: 'Affiliate disclosure',
      paragraphs: [
        'Some links on Bowl Figures may be paid (affiliate) links. When you sign up or buy through one, we may earn a commission at no extra cost to you. Each paid link is labelled "Paid link" right next to it.',
        'We recommend a tool only when it is one we would recommend for the task on that page, whether or not it pays. Payment never changes a calculator result, a figure or a ranking, and we do not show prices that can go stale.',
        'When a page links to Amazon: As an Amazon Associate we earn from qualifying purchases.',
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

/** The same words in German: an organization, never a person (`Redaktion Bowl Figures`). */
export const BYLINE_TEXTS_DE = {
  by: 'Von der',
  team: 'Redaktion Bowl Figures',
  reviewed: 'Geprüft am',
  sources: 'Quellen',
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
  lang = 'en',
}: {
  readonly checked?: string;
  readonly sources?: boolean;
  readonly lang?: Lang;
}): Byline => {
  const texts = lang === 'en' ? BYLINE_TEXTS : BYLINE_TEXTS_DE;
  return {
    by: texts.by,
    team: { href: hrefOf('editorial', lang), label: texts.team },
    ...(checked === undefined
      ? {}
      : {
          reviewed: {
            label: texts.reviewed,
            datetime: checked,
            text: checkedText(checked, lang),
          },
        }),
    ...(sources ? { sources: { href: `#${SOURCES_ID}`, label: texts.sources } } : {}),
  };
};
