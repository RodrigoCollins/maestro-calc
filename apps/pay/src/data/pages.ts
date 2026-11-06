import {
  MINIMUM_WAGE_STATES_GUIDE,
  MINIMUM_WAGE_STATES_SOURCES,
} from '../guide/minimum-wage-states.ts';
import { OVERTIME_STATES_GUIDE, OVERTIME_STATES_SOURCES } from '../guide/overtime-states.ts';
import { MINIMUM_WAGE_2027_GUIDE, MINIMUM_WAGE_2027_SOURCES } from '../guide/minimum-wage-2027.ts';
import {
  MINIMUM_WAGE_2027_GUIDE_PATHS,
  MINIMUM_WAGE_STATES_GUIDE_PATHS,
  OVERTIME_STATES_GUIDE_PATHS,
  TIPPED_STATES_GUIDE_PATHS,
} from '../guide/paths.ts';
import type { GuideSource } from '../guide/texts.ts';
import { TIPPED_STATES_GUIDE, TIPPED_STATES_SOURCES } from '../guide/tipped-states.ts';
import type { Lang } from '../time-card/receipt.ts';

/*
 * The data index (`/data`, `/es/datos`): every citable table of Cuenta Horas, a route whose id ends
 * in `-states-guide`, with its description, the day its figures were checked and who publishes
 * its sources, so a reporter who lands on one table finds the others. The index test holds this
 * list to the route table and each checked day to the one its page shows.
 */

/** Whether route `id` is a citable table of the data index. */
export const isDataPage = (id: string): boolean => id.endsWith('-states-guide');

/** What the index reads of one table page. */
export interface DataPage {
  readonly id: string;
  readonly paths: Readonly<Record<Lang, string>>;
  readonly texts: Readonly<
    Record<Lang, { readonly h1: string; readonly description: string; readonly reviewed: string }>
  >;
  /** The sources of its rows, the U.S. Department of Labor first. */
  readonly sources: Readonly<Record<string, GuideSource>>;
  /** The day its figures were last checked, `YYYY-MM-DD`: the day its `reviewed` line names. */
  readonly checked: string;
}

/** The citable tables, in route table order. */
export const DATA_PAGES: readonly DataPage[] = [
  {
    id: 'tipped-states-guide',
    paths: TIPPED_STATES_GUIDE_PATHS,
    texts: TIPPED_STATES_GUIDE,
    sources: TIPPED_STATES_SOURCES,
    checked: '2026-11-05',
  },
  {
    id: 'overtime-states-guide',
    paths: OVERTIME_STATES_GUIDE_PATHS,
    texts: OVERTIME_STATES_GUIDE,
    sources: OVERTIME_STATES_SOURCES,
    checked: '2026-11-05',
  },
  {
    id: 'minimum-wage-states-guide',
    paths: MINIMUM_WAGE_STATES_GUIDE_PATHS,
    texts: MINIMUM_WAGE_STATES_GUIDE,
    sources: MINIMUM_WAGE_STATES_SOURCES,
    checked: '2026-11-06',
  },
  {
    id: 'minimum-wage-2027-states-guide',
    paths: MINIMUM_WAGE_2027_GUIDE_PATHS,
    texts: MINIMUM_WAGE_2027_GUIDE,
    sources: MINIMUM_WAGE_2027_SOURCES,
    checked: '2026-11-06',
  },
];

/** A calendar day (`YYYY-MM-DD`) in the long form of `lang`, in UTC so no timezone moves it. */
export const dayText = (iso: string, lang: Lang): string =>
  new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'es-US', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`));

/** Who publishes the sources of a table with `others` sources besides the Department of Labor. */
const sourcesText = (others: number, lang: Lang): string =>
  lang === 'en'
    ? `U.S. Department of Labor (DOL) and ${String(others)} state sources`
    : `Departamento de Trabajo de EE. UU. (DOL) y ${String(others)} fuentes estatales`;

/** One table of the index. */
export interface DataCard {
  readonly id: string;
  readonly href: string;
  readonly title: string;
  readonly summary: string;
  readonly checked: string;
  readonly sources: string;
}

/** The citable tables in route table order, each as the index shows it in `lang`. */
export const dataCards = (lang: Lang): DataCard[] =>
  DATA_PAGES.map(({ id, paths, texts, sources, checked }) => ({
    id,
    href: paths[lang],
    title: texts[lang].h1,
    summary: texts[lang].description,
    checked: dayText(checked, lang),
    sources: sourcesText(Object.keys(sources).length - 1, lang),
  }));
