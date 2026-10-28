import type { Locale } from '@maestro-calc/i18n';
import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { enConcrete } from '@maestro-calc/i18n/catalogs/en/concrete';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esCommon } from '@maestro-calc/i18n/catalogs/es/common';
import { esConcrete } from '@maestro-calc/i18n/catalogs/es/concrete';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { concretePage } from '../calculator/concrete/page.ts';
import type { Messages } from '../calculator/controller.ts';
import type { AnyPageModule } from '../calculator/page-module.ts';
import type { CalculatorPageView } from '../components/calculator/model.ts';
import type { CalculatorPageId } from '../routing/templates.ts';
import { pageViewOf } from './page-view.ts';
import { reserveCss, type Reserve } from './reserve.ts';

export type { Messages };

/** What a calculator page is built from: its module and the catalogs of both locales. */
export interface PageEntry {
  readonly module: AnyPageModule;
  readonly catalogs: Readonly<Record<Locale, Messages>>;
  /** The line counts this page reserves for its answer and notice; none means the shared stylesheet's. */
  readonly reserve?: Reserve;
}

/** The CSS a page row adds to its `<head>`: the reserve as one rule set, or nothing without a reserve. */
export const headStyleOf = ({ reserve }: PageEntry): string | undefined =>
  reserve === undefined ? undefined : reserveCss(reserve);

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
} as const satisfies Record<CalculatorPageId, PageEntry>;

/** The view of the calculator page `id` for `locale`, built from its own module. */
export const pageView = (id: CalculatorPageId, locale: Locale): CalculatorPageView => {
  const { module, catalogs } = PAGES[id];
  return pageViewOf(module, locale, catalogs[locale]);
};
