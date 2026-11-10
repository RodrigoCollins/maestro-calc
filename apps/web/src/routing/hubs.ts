import type { GuideId } from './guides.ts';
import type { CalculatorPageId } from './templates.ts';

/*
 * The trade hubs (hubs): Markdown pages of the trust template, one per trade, each listing the
 * calculators and guides of that trade. A hub id is also its `ROUTES` id and its entry in the
 * `pages` collection.
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
    guides: [
      'guide-concrete-bags-or-truck',
      'guide-concrete-quote',
      'guide-fence-post-concrete',
      'guide-concrete-bag-coverage',
    ],
  },
  'hub-roofing': {
    calculators: ['roof-pitch', 'roofing'],
    guides: ['guide-roof-pitch', 'guide-roofing-quote'],
  },
  'hub-drywall': { calculators: ['drywall'], guides: ['guide-drywall-estimate'] },
  'hub-landscaping': {
    calculators: ['gravel', 'mulch', 'topsoil'],
    guides: [
      'guide-gravel-driveway',
      'guide-raised-bed-soil',
      'guide-mulch',
      'guide-cubic-yards',
      'guide-gravel-coverage',
    ],
  },
  'hub-measurement': {
    calculators: ['rectangle-area', 'feet-inches', 'board-feet'],
    guides: ['guide-square-footage', 'guide-tape-measure-fractions'],
  },
  'hub-paint': { calculators: ['paint'], guides: ['guide-paint-quote', 'guide-paint-coverage'] },
} as const satisfies Record<string, Hub>;

/** The hub a page id is, or `undefined` for any other page. */
export const hubOf = (id: string): Hub | undefined => {
  const table: Readonly<Record<string, Hub>> = HUBS;
  return Object.hasOwn(table, id) ? table[id] : undefined;
};

export type HubId = keyof typeof HUBS;

const isHubId = (id: string): id is HubId => Object.hasOwn(HUBS, id);

/** The hub ids, in table order: the order the home lists them. */
export const HUB_IDS: readonly HubId[] = Object.keys(HUBS).filter(isHubId);

/** The hub a calculator page belongs to, or `undefined` when its trade has no hub yet. */
export const hubOfCalculator = (calculator: CalculatorPageId): HubId | undefined =>
  HUB_IDS.find((id) => (HUBS[id].calculators as readonly CalculatorPageId[]).includes(calculator));
