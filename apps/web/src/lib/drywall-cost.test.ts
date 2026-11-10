import { describe, expect, it } from 'vitest';
import { LOCALES } from '../routing/routes.ts';
import { siteText } from './site-text.ts';
import {
  drywallCostOf,
  INSTALLED_PRICE,
  LABOR_PRICE,
  PANEL_PRICES,
  SHEET_INSTALLED_PRICE,
} from './drywall-cost.ts';

const room = (length: number, width: number) => ({
  length: `${String(length)}ft`,
  width: `${String(width)}ft`,
  height: '8ft',
});

// Prices read 2026-11-10: Fixr, drywall installation cost (updated 2025-01-31), and Bob Vila,
// drywall cost (updated 2022-10-31). Angi, HomeAdvisor and HomeGuide answer a bot with 403.
describe('drywall cost (dated, cited prices over the drywall engine)', () => {
  it('keeps the published prices, each with its source and the day it was read', () => {
    expect(
      [INSTALLED_PRICE, LABOR_PRICE, SHEET_INSTALLED_PRICE].map(({ low, high }) => [low, high]),
    ).toEqual([
      ['1.50', '3.50'],
      ['1.15', '3.00'],
      ['48.00', '80.00'],
    ]);
    expect(PANEL_PRICES.map(({ low, high }) => [low, high])).toEqual([
      ['10.00', '15.00'],
      ['12.00', '20.00'],
    ]);
    for (const { source } of [
      INSTALLED_PRICE,
      LABOR_PRICE,
      SHEET_INSTALLED_PRICE,
      ...PANEL_PRICES,
    ]) {
      expect(source.url).toMatch(/^https:\/\//);
      expect(source.retrieved).toBe('2026-11-10');
    }
  });

  // hand-verified, walls 8 ft and the ceiling, one door (20 ft²) and two windows (15 ft² each), 4 × 8
  // ft sheets with 10% extra: 10 × 10: 320 − 50 + 100 = 370 ft², 407/32 = 12.72, 13 sheets; panels
  // 13 × $10 (Fixr) = $130 to 13 × $20 (Bob Vila) = $260; installed 370 × $1.50 = $555 to × $3.50 =
  // $1,295; 13 × $48 = $624 to × $80 = $1,040 by the sheet; labor 370 × $1.15 = 425.50 → $426 (ties
  // away from zero) to × $3 = $1,110; the walls alone 270 ft², 297/32 = 9.28, 10 sheets, $405 to $945;
  // 370/1,000 × 9 gal = 3.33 gal of compound
  it('prices the panels by the sheet and the installed job by the area', () => {
    expect(drywallCostOf(room(10, 10))).toEqual({
      label: '10 ft × 10 ft × 8 ft',
      area: '370',
      sheets: '13',
      compound: '3.33',
      panels: '$130–$260',
      installed: '$555–$1,295',
      bySheet: '$624–$1,040',
      labor: '$426–$1,110',
      walls: { area: '270', sheets: '10', installed: '$405–$945' },
    });
    // 12 × 12: 384 − 50 + 144 = 478 ft², 525.8/32 = 16.43, 17 sheets; $717 to $1,673; labor 549.70 →
    // $550 to $1,434; walls 334 ft², 367.4/32 = 11.48, 12 sheets, $501 to $1,169
    expect(drywallCostOf(room(12, 12))).toMatchObject({
      area: '478',
      sheets: '17',
      panels: '$170–$340',
      installed: '$717–$1,673',
      bySheet: '$816–$1,360',
      labor: '$550–$1,434',
      walls: { area: '334', sheets: '12', installed: '$501–$1,169' },
    });
    // 12 × 16: 448 − 50 + 192 = 590 ft², 649/32 = 20.28, 21 sheets; $885 to $2,065; labor 678.50 →
    // $679 to $1,770
    expect(drywallCostOf(room(12, 16))).toMatchObject({
      area: '590',
      sheets: '21',
      installed: '$885–$2,065',
      labor: '$679–$1,770',
    });
  });
});

describe('drywall cost copy', () => {
  it.each(LOCALES)('writes the prices into the copy as the data holds them in %s', (locale) => {
    const text = siteText(locale);
    const intro = text('page.drywall-installation-cost.intro');
    for (const figure of ['$1.50', '$3.50', '$48', '$80', '$717', '$1,673', '478'])
      expect(intro).toContain(figure);
    expect(text('page.drywall-installation-cost.p2')).toContain('2025');
  });
});
