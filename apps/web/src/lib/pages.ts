import type { Locale } from '@maestro-calc/i18n';
import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { enConcrete } from '@maestro-calc/i18n/catalogs/en/concrete';
import { enGravel } from '@maestro-calc/i18n/catalogs/en/gravel';
import { enMulch } from '@maestro-calc/i18n/catalogs/en/mulch';
import { enPaint } from '@maestro-calc/i18n/catalogs/en/paint';
import { enRectangleArea } from '@maestro-calc/i18n/catalogs/en/rectangle-area';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { enTopsoil } from '@maestro-calc/i18n/catalogs/en/topsoil';
import { esCommon } from '@maestro-calc/i18n/catalogs/es/common';
import { esConcrete } from '@maestro-calc/i18n/catalogs/es/concrete';
import { esGravel } from '@maestro-calc/i18n/catalogs/es/gravel';
import { esMulch } from '@maestro-calc/i18n/catalogs/es/mulch';
import { esPaint } from '@maestro-calc/i18n/catalogs/es/paint';
import { esRectangleArea } from '@maestro-calc/i18n/catalogs/es/rectangle-area';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { esTopsoil } from '@maestro-calc/i18n/catalogs/es/topsoil';
import { concretePage } from '../calculator/concrete/page.ts';
import { gravelPage } from '../calculator/gravel/page.ts';
import { gravelReserve } from '../calculator/gravel/reserve.ts';
import { mulchPage } from '../calculator/mulch/page.ts';
import { mulchReserve } from '../calculator/mulch/reserve.ts';
import { paintPage } from '../calculator/paint/page.ts';
import { paintReserve } from '../calculator/paint/reserve.ts';
import { rectangleAreaPage } from '../calculator/rectangle-area/page.ts';
import { rectangleAreaReserve } from '../calculator/rectangle-area/reserve.ts';
import { topsoilPage } from '../calculator/topsoil/page.ts';
import { topsoilReserve } from '../calculator/topsoil/reserve.ts';
import type { Messages } from '../calculator/controller.ts';
import type { AnyPageModule } from '../calculator/page-module.ts';
import type { CalculatorPageView } from '../components/calculator/model.ts';
import type { CalculatorPageId } from '../routing/templates.ts';
import { pageViewOf } from './page-view.ts';
import { drawingCss, joinCss, reserveCss, type Reserve, type ReserveCss } from './reserve.ts';

export type { Messages };

/** What a calculator page is built from: its module and the catalogs of both locales. */
export interface PageEntry {
  readonly module: AnyPageModule;
  readonly catalogs: Readonly<Record<Locale, Messages>>;
  /** The line counts this page reserves for its answer and notice; none means the shared stylesheet's. */
  readonly reserve?: Reserve;
}

/**
 * The CSS a page row adds to its `<head>`: the reserve as one rule set, then the drawing box rule
 * of a module with the drawing slot; nothing for a row with neither (or an empty reserve).
 */
export const headStyleOf = ({ reserve, module }: PageEntry): ReserveCss | undefined =>
  joinCss(
    reserve === undefined ? undefined : reserveCss(reserve),
    module.drawing === undefined ? undefined : drawingCss(module.drawing.frame),
  );

/**
 * The page table, the one place the pages meet their catalogs. A page id without a row is a type
 * error, and so is a row for an id that is not a calculator page.
 */
export const PAGES = {
  concrete: {
    module: concretePage,
    catalogs: {
      en: { ...enCommon, ...enConcrete, ...enSite },
      es: { ...esCommon, ...esConcrete, ...esSite },
    },
  },
  'rectangle-area': {
    module: rectangleAreaPage,
    catalogs: {
      en: { ...enCommon, ...enRectangleArea, ...enSite },
      es: { ...esCommon, ...esRectangleArea, ...esSite },
    },
    reserve: rectangleAreaReserve,
  },
  gravel: {
    module: gravelPage,
    catalogs: {
      en: { ...enCommon, ...enGravel, ...enSite },
      es: { ...esCommon, ...esGravel, ...esSite },
    },
    reserve: gravelReserve,
  },
  mulch: {
    module: mulchPage,
    catalogs: {
      en: { ...enCommon, ...enMulch, ...enSite },
      es: { ...esCommon, ...esMulch, ...esSite },
    },
    reserve: mulchReserve,
  },
  topsoil: {
    module: topsoilPage,
    catalogs: {
      en: { ...enCommon, ...enTopsoil, ...enSite },
      es: { ...esCommon, ...esTopsoil, ...esSite },
    },
    reserve: topsoilReserve,
  },
  paint: {
    module: paintPage,
    catalogs: {
      en: { ...enCommon, ...enPaint, ...enSite },
      es: { ...esCommon, ...esPaint, ...esSite },
    },
    reserve: paintReserve,
  },
} as const satisfies Record<CalculatorPageId, PageEntry>;

/** The view of the calculator page `id` for `locale`, built from its own module. */
export const pageView = (id: CalculatorPageId, locale: Locale): CalculatorPageView => {
  const { module, catalogs } = PAGES[id];
  return pageViewOf(module, locale, catalogs[locale]);
};
