import { concreteMix } from '@maestro-calc/data';
import type { Locale } from '@maestro-calc/i18n';
import { concretePage } from '../../calculator/concrete/page.ts';
import { gravelPage } from '../../calculator/gravel/page.ts';
import { drywallPage } from '../../calculator/drywall/page.ts';
import { mulchPage } from '../../calculator/mulch/page.ts';
import { paintPage } from '../../calculator/paint/page.ts';
import { topsoilPage } from '../../calculator/topsoil/page.ts';
import { rectangleAreaPage } from '../../calculator/rectangle-area/page.ts';
import { roofPitchPage } from '../../calculator/roof-pitch/page.ts';
import { roofingPage } from '../../calculator/roofing/page.ts';
import type { AnyPageModule } from '../../calculator/page-module.ts';
import type { ExampleId, WorkedExample } from '../../content/schema.ts';
import { pageView } from '../../lib/pages.ts';
import { LOCALES } from '../../routing/routes.ts';
import type { CalculatorPageId } from '../../routing/templates.ts';
import { shownFigures } from './shown-figures.ts';

/*
 * The calculator content contract as a table by id (calculator-page › Page anatomy, design K2).
 * A third calculator adds one row here and edits no test file. Test support only: it sits outside
 * the coverage and the generic-code scans.
 */

/** A source an entry must list: its name (exact text or a pattern) and its address. */
export interface ExpectedSource {
  readonly name: RegExp | string;
  readonly url: string;
}

/**
 * The expectations of one calculator's entries. Members are declared as methods so a row is read
 * without its id (`LooseRow`): the example is checked by the strict schema before it reaches a row.
 */
export interface ContentRow<Id extends ExampleId> {
  readonly module: AnyPageModule;
  readonly updated: string;
  /** The sources both entries must list, by locale. */
  sources(locale: Locale): readonly ExpectedSource[];
  /** The example as the engine shows it (the page's own controller), for the example's state. */
  engine(example: WorkedExample<Id>): WorkedExample<Id>;
  /** The figures the Formulas section must show (not the query). */
  figures(example: WorkedExample<Id>): readonly string[];
  readonly methodologyLink: Readonly<Record<Locale, string>>;
}

const NIST = {
  name: /^NIST SP 811, Appendix B\b/,
  url: 'https://www.nist.gov/pml/special-publication-811',
} as const;

/** The default state through the page builder, which runs the registry calculator. */
const concreteDefault = (): WorkedExample<'concrete'> => {
  const { result } = pageView('concrete', 'en');
  const [shopping] = result.shopping;
  if (shopping === undefined) throw new Error('the concrete page declares a shopping line');
  const shown = (key: string): string => {
    const row = result.rows.find((candidate) => candidate.key === key);
    if (row === undefined) throw new Error(`the concrete page has no ${key} row`);
    return row.value;
  };
  return {
    netFt3: shown('netVolume'),
    totalFt3: shown('volumeFt3'),
    yd3: result.primary.value,
    bags: Number(shopping.qty),
    bagLb: Number(shopping.unit.replace('bag-', '')),
  };
};

/** The areas the page shows for the example's link, read from the page's own controller. */
const rectangleAreaShown = ({ query }: WorkedExample<'rectangle-area'>) => {
  const { figures } = shownFigures(rectangleAreaPage, query);
  const shown = (key: string): string => {
    const value = figures[key];
    if (value === undefined) throw new Error(`the rectangle-area page shows no ${key}`);
    return value;
  };
  return { query, ft2: shown('areaFt2'), yd2: shown('areaYd2'), m2: shown('areaM2') };
};

/** The weights and volumes the gravel page shows for the example's link. */
const gravelShown = ({ query }: WorkedExample<'gravel'>) => {
  const { figures } = shownFigures(gravelPage, query);
  const shown = (key: string): string => {
    const value = figures[key];
    if (value === undefined) throw new Error(`the gravel page shows no ${key}`);
    return value;
  };
  return {
    query,
    tons: shown('tons'),
    tonnes: shown('tonnes'),
    orderYd3: shown('orderYd3'),
    placedYd3: shown('placedYd3'),
  };
};

/** The volumes and the bags the mulch page shows for the example's link. */
const mulchShown = ({ query }: WorkedExample<'mulch'>) => {
  const { figures, shopping } = shownFigures(mulchPage, query);
  const shown = (key: string): string => {
    const value = figures[key];
    if (value === undefined) throw new Error(`the mulch page shows no ${key}`);
    return value;
  };
  const [bags] = shopping;
  if (bags === undefined) throw new Error('the mulch page shows no bag line');
  return {
    query,
    yd3: shown('volumeYd3'),
    ft3: shown('volumeFt3'),
    m3: shown('volumeM3'),
    netFt3: shown('netVolume'),
    bags: Number(bags),
  };
};

/** The volumes and the bags the topsoil page shows for the example's link. */
const topsoilShown = ({ query }: WorkedExample<'topsoil'>) => {
  const { figures, shopping } = shownFigures(topsoilPage, query);
  const shown = (key: string): string => {
    const value = figures[key];
    if (value === undefined) throw new Error(`the topsoil page shows no ${key}`);
    return value;
  };
  const [bags] = shopping;
  if (bags === undefined) throw new Error('the topsoil page shows no bag line');
  return {
    query,
    yd3: shown('volumeYd3'),
    ft3: shown('volumeFt3'),
    m3: shown('volumeM3'),
    netFt3: shown('netVolume'),
    bags: Number(bags),
  };
};

/** The gallons, the areas and the cans the paint page shows for the example's link. */
const paintShown = ({ query }: WorkedExample<'paint'>) => {
  const { figures, shopping } = shownFigures(paintPage, query);
  const shown = (key: string): string => {
    const value = figures[key];
    if (value === undefined) throw new Error(`the paint page shows no ${key}`);
    return value;
  };
  const [cans] = shopping;
  if (cans === undefined) throw new Error('the paint page shows no gallon line');
  return {
    query,
    gallons: shown('gallons'),
    liters: shown('liters'),
    paintFt2: shown('paintArea'),
    wallFt2: shown('wallArea'),
    cans: Number(cans),
  };
};

/** The area, the finishing and the sheets the drywall page shows for the example's link. */
const drywallShown = ({ query }: WorkedExample<'drywall'>) => {
  const { figures, shopping } = shownFigures(drywallPage, query);
  const shown = (key: string): string => {
    const value = figures[key];
    if (value === undefined) throw new Error(`the drywall page shows no ${key}`);
    return value;
  };
  const [sheets] = shopping;
  if (sheets === undefined) throw new Error('the drywall page shows no sheet line');
  return {
    query,
    areaFt2: shown('areaFt2'),
    areaM2: shown('areaM2'),
    compoundGal: shown('compound'),
    tapeFt: shown('tape'),
    sheets: Number(sheets),
  };
};

const USG_COMPOUND = {
  name: /^USG, Sheetrock UltraLightweight All Purpose Joint Compound coverage\b/,
  url: 'https://assemblies-tools.usg.com/content/usgcom/en/resource-center/faqs/1977.html',
} as const;

const USG_TAPE = {
  name: /^USG Sheetrock Brand Heavy Joint Tape, Submittal Sheet J1393\b/,
  url: 'https://images.homedepot-static.com/catalog/pdfImages/7a/7a2ad9f3-62c7-45ef-b58e-869ccdbca0c6.pdf',
} as const;

/** The pitch, the angle and the rafter the roof pitch page shows for the example's link. */
const roofPitchShown = ({ query }: WorkedExample<'roof-pitch'>) => {
  const { figures } = shownFigures(roofPitchPage, query);
  const shown = (key: string): string => {
    const value = figures[key];
    if (value === undefined) throw new Error(`the roof pitch page shows no ${key}`);
    return value;
  };
  return {
    query,
    pitch: shown('pitch'),
    angle: shown('angle'),
    rafterFt: shown('rafter'),
    rafterM: shown('rafterM'),
  };
};

/** The squares, the areas, the bundles and the rolls the roofing page shows for the example's link. */
const roofingShown = ({ query }: WorkedExample<'roofing'>) => {
  const { figures, shopping } = shownFigures(roofingPage, query);
  const shown = (key: string): string => {
    const value = figures[key];
    if (value === undefined) throw new Error(`the roofing page shows no ${key}`);
    return value;
  };
  const [bundles, rolls] = shopping;
  if (bundles === undefined || rolls === undefined) {
    throw new Error('the roofing page shows no shingles or underlayment line');
  }
  return {
    query,
    squares: shown('squares'),
    areaFt2: shown('areaFt2'),
    areaM2: shown('areaM2'),
    bundles: Number(bundles),
    rolls: Number(rolls),
  };
};

const GAF_SHINGLES = {
  name: /^GAF Timberline HDZ\b/,
  url: 'https://www.homedepot.com/p/GAF-Timberline-HDZ-Weathered-Wood-Algae-Resistant-Laminated-High-Definition-Shingles-33-33-sq-ft-per-Bundle-0487900/309755323',
} as const;

const GAF_UNDERLAYMENT = {
  name: /^GAF FeltBuster High-Traction Synthetic Roofing Felt, data sheet\b/,
  url: 'https://images.homedepot-static.com/catalog/pdfImages/62/623aadd0-ba6d-4f90-9d5b-556abc7284e5.pdf',
} as const;

const IRC = {
  name: /^2021 International Residential Code, Chapter 9, Section R905\b/,
  url: 'https://codes.iccsafe.org/content/IRC2021P2/chapter-9-roof-assemblies',
} as const;

const SHERWIN_WILLIAMS = {
  name: /^Sherwin-Williams Quali-Kote Interior Latex, Product Data Sheet\b/,
  url: 'https://www.sherwin-williams.com/document/PDS/en/035777853146/',
} as const;

const WISDOT = {
  name: /^WisDOT WHRP G22-05, Table E2\b/,
  url: 'https://wisconsindot.gov/documents2/research/0092-22-05-final-report.pdf',
} as const;

export const CONTENT_ROWS = {
  concrete: {
    module: concretePage,
    updated: '2026-10-25',
    sources: () => [{ name: concreteMix.source.name, url: concreteMix.source.url ?? '' }, NIST],
    engine: concreteDefault,
    figures: ({ netFt3, totalFt3, yd3, bags, bagLb }) =>
      [netFt3, totalFt3, yd3, bags, bagLb].map(String),
    methodologyLink: { en: '/methodology#concrete', es: '/es/metodologia#concreto' },
  },
  'rectangle-area': {
    module: rectangleAreaPage,
    updated: '2026-10-27',
    sources: () => [NIST],
    engine: rectangleAreaShown,
    // the example's link is 144 in by the 120 in default: Formulas names both sides as written
    figures: ({ ft2, yd2, m2 }) => [ft2, yd2, m2, '12 ft', '10 ft'],
    methodologyLink: { en: '/methodology#square-footage', es: '/es/metodologia#pies-cuadrados' },
  },
  gravel: {
    module: gravelPage,
    updated: '2026-10-29',
    sources: () => [WISDOT, NIST],
    engine: gravelShown,
    // the example is the page's starting values: Formulas names the three sides as written
    figures: ({ tons, tonnes, orderYd3, placedYd3 }) => [
      tons,
      tonnes,
      orderYd3,
      placedYd3,
      '20 ft',
      '10 ft',
      '4 in',
    ],
    methodologyLink: { en: '/methodology#gravel', es: '/es/metodologia#grava' },
  },
  mulch: {
    module: mulchPage,
    updated: '2026-10-29',
    sources: () => [NIST],
    engine: mulchShown,
    // the example is the page's starting values: Formulas names the three sides as written
    figures: ({ yd3, ft3, m3, netFt3, bags }) => [
      yd3,
      ft3,
      m3,
      netFt3,
      String(bags),
      '20 ft',
      '4 ft',
      '3 in',
    ],
    methodologyLink: { en: '/methodology#mulch', es: '/es/metodologia#mulch' },
  },
  topsoil: {
    module: topsoilPage,
    updated: '2026-10-29',
    sources: () => [NIST],
    engine: topsoilShown,
    // the example is the page's starting values: Formulas names the sides and the depth as written
    figures: ({ yd3, ft3, m3, netFt3, bags }) => [
      yd3,
      ft3,
      m3,
      netFt3,
      String(bags),
      '10 ft',
      '4 in',
    ],
    methodologyLink: { en: '/methodology#topsoil', es: '/es/metodologia#tierra-para-jardin' },
  },
  paint: {
    module: paintPage,
    updated: '2026-10-30',
    sources: () => [SHERWIN_WILLIAMS, NIST],
    engine: paintShown,
    // the example is the page's starting values: Formulas names the sides and the height as written
    figures: ({ gallons, liters, paintFt2, wallFt2, cans }) => [
      gallons,
      liters,
      paintFt2,
      wallFt2,
      String(cans),
      '12 ft',
      '8 ft',
    ],
    methodologyLink: { en: '/methodology#paint', es: '/es/metodologia#pintura' },
  },
  drywall: {
    module: drywallPage,
    updated: '2026-10-30',
    sources: () => [USG_COMPOUND, USG_TAPE, NIST],
    engine: drywallShown,
    // the example is the page's starting values: Formulas names the sides and the height as written
    figures: ({ areaFt2, areaM2, compoundGal, tapeFt, sheets }) => [
      areaFt2,
      areaM2,
      compoundGal,
      tapeFt,
      String(sheets),
      '12 ft',
      '8 ft',
    ],
    methodologyLink: { en: '/methodology#drywall', es: '/es/metodologia#drywall' },
  },
  'roof-pitch': {
    module: roofPitchPage,
    updated: '2026-10-30',
    sources: () => [IRC, NIST],
    engine: roofPitchShown,
    // the example is the page's starting values: Formulas names the rise and the rafter run
    figures: ({ pitch, angle, rafterFt, rafterM }) => [
      pitch,
      angle,
      rafterFt,
      rafterM,
      '6 in',
      '12 ft',
    ],
    methodologyLink: { en: '/methodology#roof-pitch', es: '/es/metodologia#pendiente-de-techo' },
  },
  roofing: {
    module: roofingPage,
    updated: '2026-10-30',
    sources: () => [GAF_SHINGLES, GAF_UNDERLAYMENT, IRC, NIST],
    engine: roofingShown,
    // the example is the page's starting values: Formulas names the footprint as written
    figures: ({ squares, areaFt2, areaM2, bundles, rolls }) => [
      squares,
      areaFt2,
      areaM2,
      String(bundles),
      String(rolls),
      '40 ft',
      '30 ft',
    ],
    methodologyLink: { en: '/methodology#roofing', es: '/es/metodologia#tejas' },
  },
} as const satisfies { readonly [Id in ExampleId]?: ContentRow<Id> };

/** A row read without its id: examples and figures are plain records. */
export interface LooseRow {
  readonly updated: string;
  sources(locale: Locale): readonly ExpectedSource[];
  engine(example: Readonly<Record<string, unknown>>): Readonly<Record<string, unknown>>;
  figures(example: Readonly<Record<string, unknown>>): readonly string[];
  readonly methodologyLink: Readonly<Record<Locale, string>>;
}

/** The row of `id`, or `undefined` when the id has none. */
export const rowOf = (id: string): LooseRow | undefined =>
  Object.entries(CONTENT_ROWS).find(([key]) => key === id)?.[1];

/** A routed id without a row is a type error: this indexes the table with every page id. */
export const routedRowOf = (id: CalculatorPageId) => CONTENT_ROWS[id];

/** The entries a calculator content set holds: the id, locale and review state of each. */
export interface EntryRecord {
  readonly id: string;
  readonly locale: string;
  readonly ownerReview: string;
}

/**
 * What is wrong with the entry set against the table: `rows` names the expected ids, `routed` the
 * ids that have a page and `pageless` the registry ids that do not. A staged entry (a row in
 * `pageless`) may be pending; a routed one must be approved. One line per problem, naming the id.
 */
export const setProblems = (
  entries: readonly EntryRecord[],
  rows: Readonly<Record<string, unknown>>,
  routed: readonly string[],
  pageless: readonly string[],
): string[] => {
  const ids = Object.keys(rows);
  const keys = entries.map(({ id, locale }) => `${id}/${locale}`);
  const have = new Set(keys);
  return [
    ...routed.filter((id) => !ids.includes(id)).map((id) => `${id}: routed id has no content row`),
    ...ids
      .filter((id) => !routed.includes(id) && !pageless.includes(id))
      .map((id) => `${id}: row is neither routed nor in PAGELESS`),
    ...ids.flatMap((id) =>
      LOCALES.filter((locale) => !have.has(`${id}/${locale}`)).map(
        (locale) => `missing entry ${id}/${locale}`,
      ),
    ),
    ...[...new Set(keys.filter((key, index) => keys.indexOf(key) !== index))].map(
      (key) => `duplicate entry ${key}`,
    ),
    ...entries
      .filter(({ id }) => !ids.includes(id) && !routed.includes(id))
      .map(({ id, locale }) => `unexpected entry ${id}/${locale}`),
    ...entries
      .filter(({ id, ownerReview }) => routed.includes(id) && ownerReview !== 'approved')
      .map(
        ({ id, locale, ownerReview }) =>
          `${id}/${locale}: a routed entry must be approved, it is ${ownerReview}`,
      ),
  ];
};
