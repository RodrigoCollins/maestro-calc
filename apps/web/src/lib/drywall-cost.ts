import { ft2, gal, Rational, valueIn } from '@maestro-calc/core';
import type { MaterialSource } from '@maestro-calc/data';
import { decimalText, groupedInteger } from '../calculator/present.ts';
import type { JobCase } from '../routing/jobs.ts';
import { drywall } from './drywall.ts';
import { areaCost, gallonCost, type PriceRange } from './paint-cost.ts';

/*
 * What drywall installation costs (Ahrefs US, 2026-11-08: "drywall installation cost" 3.9K, KD 1 to
 * 3): only published, dated prices. The area and the sheets of each room are the drywall engine's
 * (walls and ceiling, 4 × 8 ft sheets with 10% extra); the installed price is the published price
 * per square foot of drywall times that area, the panels alone the sheets times the published price
 * per panel. Angi, HomeAdvisor and HomeGuide answer a bot with 403 and are not read.
 */

const READ = '2026-11-10';

const FIXR: Required<MaterialSource> = {
  name: 'Fixr, How much does it cost to install drywall?, updated January 31, 2025',
  url: 'https://www.fixr.com/costs/drywall-installation',
  retrieved: READ,
};

const BOB_VILA: Required<MaterialSource> = {
  name: 'Bob Vila, How Much Does Drywall Cost?, updated October 31, 2022',
  url: 'https://www.bobvila.com/articles/drywall-cost/',
  retrieved: READ,
};

/** Fixr: $1.50 to $3.50 per square foot, material and installation. */
export const INSTALLED_PRICE: PriceRange = { low: '1.50', high: '3.50', source: FIXR };

/** Fixr: $1.15 to $3 per square foot in labor. */
export const LABOR_PRICE: PriceRange = { low: '1.15', high: '3.00', source: FIXR };

/** Fixr: $48 to $80 to install one 4 × 8 ft sheet. */
export const SHEET_INSTALLED_PRICE: PriceRange = { low: '48.00', high: '80.00', source: FIXR };

/** One panel bought alone, lowest first: Fixr ($10 to $15 a 4 × 8 sheet), then Bob Vila ($12 to $20). */
export const PANEL_PRICES: readonly [PriceRange, PriceRange] = [
  { low: '10.00', high: '15.00', source: FIXR },
  { low: '12.00', high: '20.00', source: BOB_VILA },
];

/** `10ft` as `10 ft`. */
const sizeText = (value: string | undefined): string =>
  (value ?? '').replace(/^(\d+)(ft|in)$/, '$1 $2');

/** The engine's drywall of `raw`: the area, the 4 × 8 sheets and the gallons of compound. */
const hung = (raw: JobCase) => {
  const valid = drywall.validate(raw);
  if (!valid.ok) throw new Error(`invalid drywall cost case: ${JSON.stringify(raw)}`);
  const { outputs, shopping } = drywall.compute(valid.value);
  const sheets = shopping.find(({ materialId }) => materialId === 'drywall')?.qty;
  if (sheets === undefined) throw new Error('the drywall engine buys no sheets');
  return {
    area: valueIn(outputs.areaFt2, ft2),
    sheets,
    compound: valueIn(outputs.compound, gal),
  };
};

export interface DrywallCost {
  /** `10 ft × 10 ft × 8 ft`, as the job tables label a room. */
  readonly label: string;
  /** Square feet of walls and ceiling, the openings left out. */
  readonly area: string;
  /** Sheets of 4 × 8 ft with 10% extra, and the gallons of joint compound. */
  readonly sheets: string;
  readonly compound: string;
  /** The sheets at the lowest (Fixr) to the highest (Bob Vila) price per panel. */
  readonly panels: string;
  /** Installed by the area, by the sheet, and the labor alone. */
  readonly installed: string;
  readonly bySheet: string;
  readonly labor: string;
  /** The walls alone, no ceiling. */
  readonly walls: { readonly area: string; readonly sheets: string; readonly installed: string };
}

/** The cost of hanging and finishing the drywall of the room `raw` (length, width, height). */
export const drywallCostOf = (raw: JobCase): DrywallCost => {
  const all = hung(raw);
  const walls = hung({ ...raw, surfaces: 'walls' });
  const [low, high] = PANEL_PRICES;
  return {
    label: ['length', 'width', 'height'].map((key) => sizeText(raw[key])).join(' × '),
    area: decimalText(all.area, 0, true),
    sheets: groupedInteger(all.sheets),
    compound: decimalText(all.compound, 2, true),
    panels: gallonCost(all.sheets, { ...low, high: high.high }),
    installed: areaCost(all.area, INSTALLED_PRICE),
    bySheet: gallonCost(all.sheets, SHEET_INSTALLED_PRICE),
    labor: areaCost(all.area, LABOR_PRICE),
    walls: {
      area: decimalText(walls.area, 0, true),
      sheets: groupedInteger(walls.sheets),
      installed: areaCost(walls.area, INSTALLED_PRICE),
    },
  };
};

/** The installed cost of `area` square feet. */
export const installedCost = (area: Rational): string => areaCost(area, INSTALLED_PRICE);
