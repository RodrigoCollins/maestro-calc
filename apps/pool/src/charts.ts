import { NAMED_SOURCES } from './about.ts';
import { CHEMISTRY_CHART } from './chemistry.ts';
import { DOSING_CHART } from './dosing.ts';
import type { GuideSource } from './guide.ts';
import { SWIM_GUIDE } from './swim.ts';
import { VOLUME_CHART } from './volume/chart.ts';

/** One citable page as the data index lists it. */
export interface DataPage {
  readonly path: string;
  readonly name: string;
  readonly summary: string;
  /** The day its figures were last checked against their sources, as `YYYY-MM-DD`. */
  readonly checked: string;
  /** Who publishes the sources it cites, in the order the page cites them. */
  readonly owners: readonly string[];
}

/**
 * The owner of a source, by what its name holds: the CDC's code and the EPA-registered labels
 * first (both name the agency, which is not the publisher of a label), then the sources the about
 * page names. The first match wins.
 */
const OWNERS: readonly (readonly [owner: string, mark: string])[] = [
  ['CDC MAHC', 'Model Aquatic Health Code'],
  ['EPA-registered labels', 'EPA Reg. No.'],
  ...NAMED_SOURCES.map((name) => [name, name] as const),
];

/** The owners of `sources`, each once, in their order; a source with no known owner throws. */
export const ownersOf = (sources: readonly GuideSource[]): string[] => [
  ...new Set(
    sources.map(({ name }) => {
      const found = OWNERS.find(([, mark]) => name.includes(mark));
      if (found === undefined) throw new Error(`no owner for the source ${name}`);
      return found[0];
    }),
  ),
];

const entryOf = (
  page: {
    readonly path: string;
    readonly checked: string;
    readonly card: { readonly title: string; readonly summary: string };
  },
  sources: readonly GuideSource[],
): DataPage => ({
  path: page.path,
  name: page.card.title,
  summary: page.card.summary,
  checked: page.checked,
  owners: ownersOf(sources),
});

/** Every citable data page of the site: the charts, then the reference guide. */
export const DATA_PAGES: readonly DataPage[] = [
  entryOf(DOSING_CHART, Object.values(DOSING_CHART.sources)),
  entryOf(VOLUME_CHART, [VOLUME_CHART.source]),
  entryOf(CHEMISTRY_CHART, Object.values(CHEMISTRY_CHART.sources)),
  entryOf(SWIM_GUIDE, Object.values(SWIM_GUIDE.sources)),
];

/** A check date as the pages print it: `2026-11-05` is `November 5, 2026`. */
export const checkedText = (iso: string): string =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

const PRESS_EMAIL = 'press@maestrocalc.com';

/** The index of the citable data pages, with the line for journalists. */
export const CHARTS_INDEX = {
  path: '/charts',
  name: 'Data and charts',
  title: 'Pool Data and Charts: Citable Figures | Pool Figures',
  description:
    'Every chart of Pool Figures in one place: chemical doses, pool gallons, water chemistry ranges and when to swim, each with its check date and sources.',
  h1: 'Pool data and charts',
  lead: 'The charts and reference tables of this site, each worked out from the sources it names: the CDC’s Model Aquatic Health Code, the product labels, Taylor’s test kit, HASA, NIST and the equipment manuals. Each line gives the day its figures were last checked.',
  press: {
    heading: 'For journalists',
    text: 'Every figure on these pages is free to cite with a link to the page it comes from, and each page names the sources behind it. For a question about a figure or its source, write to',
    email: PRESS_EMAIL,
  },
} as const;
