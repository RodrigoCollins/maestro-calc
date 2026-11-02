import type { GuideId } from './guides.ts';
import type { CalculatorPageId } from './templates.ts';

/*
 * The trade hubs (hubs): Markdown pages of the trust template, one per trade, each listing the
 * calculators and guides of that trade. A hub id is also its `ROUTES` id and its entry in the
 * `pages` collection. Paint has no hub yet: one calculator and no guide would be a thin page.
 */

export interface Hub {
  /** The calculator pages of the trade, in the order the hub shows them. */
  readonly calculators: readonly CalculatorPageId[];
  /** The guides of the trade, each ending in one of `calculators`. */
  readonly guides: readonly GuideId[];
}

export const HUBS = {
  'hub-concrete': {
    calculators: ['concrete'],
    guides: ['guide-concrete-bags-or-truck', 'guide-concrete-quote'],
  },
  'hub-roofing': { calculators: ['roof-pitch', 'roofing'], guides: ['guide-roof-pitch'] },
  'hub-drywall': { calculators: ['drywall'], guides: ['guide-drywall-estimate'] },
  'hub-landscaping': { calculators: ['gravel', 'mulch', 'topsoil'], guides: [] },
  'hub-measurement': {
    calculators: ['rectangle-area', 'feet-inches'],
    guides: ['guide-square-footage', 'guide-tape-measure-fractions'],
  },
} as const satisfies Record<string, Hub>;

/** The hub a page id is, or `undefined` for any other page. */
export const hubOf = (id: string): Hub | undefined => {
  const table: Readonly<Record<string, Hub>> = HUBS;
  return Object.hasOwn(table, id) ? table[id] : undefined;
};
