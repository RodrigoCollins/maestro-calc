import { CHEMISTRY_CHARTS } from './chemistry-es.ts';
import { DOSING_CHARTS } from './dosing-es.ts';
import { GALLONS_GUIDE, OLYMPIC_GUIDE } from './gallons.ts';
import { GALLONS_GUIDE_ES, OLYMPIC_GUIDE_ES } from './gallons-es.ts';
import {
  CALCIUM_GUIDE,
  CLOSING_GUIDE,
  OPENING_GUIDE,
  PH_GUIDE,
  PUMP_RUN_GUIDE,
  SALT_VS_CHLORINE_GUIDE,
  SHOCK_GUIDE,
  type GuideSource,
} from './guide.ts';
import {
  CALCIUM_GUIDE_ES,
  CLOSING_GUIDE_ES,
  OPENING_GUIDE_ES,
  PH_GUIDE_ES,
  PUMP_RUN_GUIDE_ES,
  SALT_VS_CHLORINE_GUIDE_ES,
  SHOCK_GUIDE_ES,
} from './guide-es.ts';
import { jobDetailOf } from './job-detail.ts';
import { JOB_PAGES } from './jobs.ts';
import { METHOD_SECTIONS, type MethodSource } from './methodology.ts';
import { SWIM_GUIDES } from './swim-es.ts';
import { VOLUME_CHARTS } from './volume/chart-es.ts';

/**
 * A page that carries the byline of the editorial team: its address, the day its data says its
 * figures were last checked, and the sources its sources section lists.
 */
export interface BylinePage {
  readonly path: string;
  readonly checked?: string;
  /** A source of a job page may have no public link (the methodology cites it by name only). */
  readonly sources: readonly MethodSource[];
}

/** Each source once, by its address (or its name, with no link), in the order the page cites them. */
const unique = (sources: readonly MethodSource[]): MethodSource[] => [
  ...new Map(sources.map((source) => [source.url ?? source.name, source])).values(),
];

const entryOf = (page: {
  readonly path: string;
  readonly checked?: string;
  readonly sources: Readonly<Record<string, GuideSource>>;
}): BylinePage => ({
  path: page.path,
  ...(page.checked === undefined ? {} : { checked: page.checked }),
  sources: unique(Object.values(page.sources)),
});

/** The sources a job page cites: those the methodology names for the calculator that works it out. */
const jobSourcesOf = (calculator: string): MethodSource[] => {
  const section = METHOD_SECTIONS.find(({ href }) => href === calculator);
  if (section === undefined) throw new Error(`no methodology section for ${calculator}`);
  return unique(section.sources);
};

/** Every page with a byline: the guides, the data pages, in both languages, then the job pages. */
export const BYLINE_PAGES: readonly BylinePage[] = [
  ...[
    OPENING_GUIDE,
    CLOSING_GUIDE,
    PUMP_RUN_GUIDE,
    SALT_VS_CHLORINE_GUIDE,
    SHOCK_GUIDE,
    PH_GUIDE,
    CALCIUM_GUIDE,
    OPENING_GUIDE_ES,
    CLOSING_GUIDE_ES,
    PUMP_RUN_GUIDE_ES,
    SALT_VS_CHLORINE_GUIDE_ES,
    SHOCK_GUIDE_ES,
    PH_GUIDE_ES,
    CALCIUM_GUIDE_ES,
    GALLONS_GUIDE,
    OLYMPIC_GUIDE,
    GALLONS_GUIDE_ES,
    OLYMPIC_GUIDE_ES,
  ].map(entryOf),
  ...(['en', 'es'] as const).flatMap((lang) => [
    entryOf(SWIM_GUIDES[lang]),
    entryOf(CHEMISTRY_CHARTS[lang]),
    entryOf(DOSING_CHARTS[lang]),
    {
      path: VOLUME_CHARTS[lang].path,
      checked: VOLUME_CHARTS[lang].checked,
      sources: [VOLUME_CHARTS[lang].source],
    },
  ]),
  ...JOB_PAGES.map((page) => ({
    path: page.path,
    checked: page.checked,
    sources: unique([...jobSourcesOf(page.calculator.path), ...jobDetailOf(page).sources]),
  })),
];

/** The byline page at `path`; a page with no byline throws at build time. */
export const bylinePageOf = (path: string): BylinePage => {
  const page = BYLINE_PAGES.find((candidate) => candidate.path === path);
  if (page === undefined) throw new Error(`${path} has no byline`);
  return page;
};
