import { NAMED_SOURCES } from './about.ts';
import { CHEMISTRY_CHART } from './chemistry.ts';
import { CHEMISTRY_CHART_ES } from './chemistry-es.ts';
import { DOSING_CHART } from './dosing.ts';
import { DOSING_CHART_ES } from './dosing-es.ts';
import type { GuideSource } from './guide.ts';
import type { Lang } from './routes.ts';
import { SWIM_GUIDE } from './swim.ts';
import { SWIM_GUIDE_ES } from './swim-es.ts';
import { VOLUME_CHART } from './volume/chart.ts';
import { VOLUME_CHART_ES } from './volume/chart-es.ts';

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

/**
 * The Spanish twin of every data page, in the same order, checked the same day and citing the same
 * owners: the Spanish pages cite the very documents of the English ones (`charts-es.test.ts`).
 */
export const DATA_PAGES_ES: readonly DataPage[] = [
  DOSING_CHART_ES,
  VOLUME_CHART_ES,
  CHEMISTRY_CHART_ES,
  SWIM_GUIDE_ES,
].map((page, index) => ({
  path: page.path,
  name: page.card.title,
  summary: page.card.summary,
  checked: page.checked,
  owners: (DATA_PAGES[index]?.owners ?? []).map((owner) =>
    owner === 'EPA-registered labels' ? 'etiquetas registradas ante la EPA' : owner,
  ),
}));

/** The data pages in each language. */
export const DATA_PAGES_OF: Readonly<Record<Lang, readonly DataPage[]>> = {
  en: DATA_PAGES,
  es: DATA_PAGES_ES,
};

/** A check date as the pages print it: `2026-11-05` is `November 5, 2026`, `5 de noviembre de 2026`. */
export const checkedText = (iso: string, lang: Lang = 'en'): string =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-US', {
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
  page: { kicker: 'Data · free to cite', checked: 'Checked', sources: 'Sources:' },
} as const satisfies ChartsIndex;

/** The data index in one language. */
export interface ChartsIndex {
  readonly path: string;
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly press: { readonly heading: string; readonly text: string; readonly email: string };
  /** The lines of the page around its list. */
  readonly page: { readonly kicker: string; readonly checked: string; readonly sources: string };
}

export const CHARTS_INDEX_ES: ChartsIndex = {
  path: '/es/datos-y-tablas',
  name: 'Datos y tablas',
  title: 'Datos y tablas de piscina: cifras para citar | Pool Figures',
  description:
    'Todas las tablas de Pool Figures en un lugar: dosis de químicos, galones, rangos de química del agua y cuándo nadar, con su fecha de revisión y sus fuentes.',
  h1: 'Datos y tablas de piscina',
  lead: 'Las tablas y referencias de este sitio, cada una calculada con las fuentes que nombra: el Model Aquatic Health Code de los CDC, las etiquetas de los productos, el kit de prueba de Taylor, HASA, el NIST y los manuales de los equipos. Cada línea da el día en que se revisaron sus cifras por última vez.',
  press: {
    heading: 'Para periodistas',
    text: 'Cada cifra de estas páginas es libre para citar con un enlace a la página de la que sale, y cada página nombra sus fuentes. Si tienes una pregunta sobre una cifra o su fuente, escribe a',
    email: PRESS_EMAIL,
  },
  page: { kicker: 'Datos · libres para citar', checked: 'Revisado el', sources: 'Fuentes:' },
};

/** The data index in each language. */
export const CHARTS_INDEXES: Readonly<Record<Lang, ChartsIndex>> = {
  en: CHARTS_INDEX,
  es: CHARTS_INDEX_ES,
};

/** The line that closes each data page, to the index of its language. */
export const DATA_TEXTS = {
  en: { all: 'See all our', free: ', free to cite with a link.' },
  es: {
    all: 'Mira todos nuestros',
    free: ', libres para citar con un enlace.',
  },
} as const satisfies Record<Lang, Record<string, string>>;
