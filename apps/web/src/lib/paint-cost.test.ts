import { describe, expect, it } from 'vitest';
import { LOCALES } from '../routing/routes.ts';
import { siteText } from './site-text.ts';
import {
  EXTERIOR_GALLON_PRICES,
  EXTERIOR_PRO_PRICE,
  gallonCost,
  houseCostOf,
  INTERIOR_GALLON_PRICES,
  INTERIOR_PRO_PRICE,
  ROOM_PRO_PRICE,
  roomCostOf,
} from './paint-cost.ts';

const room = (length: number, width: number) => ({
  length: `${String(length)}ft`,
  width: `${String(width)}ft`,
  height: '8ft',
});

const house = (length: number, width: number, height = 9) => ({
  length: `${String(length)}ft`,
  width: `${String(width)}ft`,
  height: `${String(height)}ft`,
  doors: '0',
  windows: '0',
});

// Prices read 2026-11-10: This Old House, interior painting cost guide (updated 2026-04-20) and
// exterior painting cost guide (updated 2026-03-06); Fixr, cost to paint a room (updated
// 2025-01-31). Angi and HomeAdvisor answer a bot with 403, so they are not read.
describe('paint cost (dated, cited prices over the paint engine)', () => {
  it('keeps the published prices, each with its source and the day it was read', () => {
    expect(
      [INTERIOR_PRO_PRICE, ROOM_PRO_PRICE, EXTERIOR_PRO_PRICE].map(({ low, high }) => [low, high]),
    ).toEqual([
      ['1.00', '4.00'],
      ['1.50', '3.50'],
      ['2.20', '4.40'],
    ]);
    expect(INTERIOR_GALLON_PRICES.map(({ low, high }) => [low, high])).toEqual([
      ['15.00', '35.00'],
      ['35.00', '50.00'],
      ['50.00', '60.00'],
    ]);
    expect(EXTERIOR_GALLON_PRICES.map(({ low, high }) => [low, high])).toEqual([
      ['30.00', '50.00'],
      ['45.00', '85.00'],
    ]);
    const sources = [
      INTERIOR_PRO_PRICE,
      ROOM_PRO_PRICE,
      EXTERIOR_PRO_PRICE,
      ...INTERIOR_GALLON_PRICES,
      ...EXTERIOR_GALLON_PRICES,
    ].map(({ source }) => source);
    for (const source of sources) {
      expect(source.url).toMatch(/^https:\/\//);
      expect(source.retrieved).toBe('2026-11-10');
    }
  });

  // hand-verified, walls 8 ft, one door (20 ft²) and two windows (15 ft² each), two coats at 350 ft²
  // a gallon: 10 × 10: 2 × 20 × 8 = 320 − 50 = 270 ft², 540/350 = 1.54 gal, 2 cans; paint 2 × $15 =
  // $30 to 2 × $60 = $120; a pro 100 ft² of floor × $1 to $4 = $100 to $400 (This Old House) and ×
  // $1.50 to $3.50 = $150 to $350 (Fixr). 12 × 16: 2 × 28 × 8 = 448 − 50 = 398 ft², 796/350 = 2.27
  // gal, 3 cans: $45 to $180; 192 ft² × $1 to $4 = $192 to $768 and × $1.50 to $3.50 = $288 to $672
  it('prices the paint of a room by its cans and the painter by its floor', () => {
    expect(roomCostOf(room(10, 10))).toEqual({
      label: '10 ft × 10 ft × 8 ft',
      floor: '100',
      walls: '270',
      gallons: '1.54',
      cans: '2',
      oneCoatCans: '1',
      paint: '$30–$120',
      pro: ['$100–$400', '$150–$350'],
    });
    expect(roomCostOf(room(12, 16))).toMatchObject({
      floor: '192',
      walls: '398',
      gallons: '2.27',
      cans: '3',
      oneCoatCans: '2',
      paint: '$45–$180',
      pro: ['$192–$768', '$288–$672'],
    });
    // 12 × 14: 2 × 26 × 8 = 416 − 50 = 366 ft², one coat 366/350 = 1.05 gal, 2 cans
    expect(roomCostOf(room(12, 14))).toMatchObject({ walls: '366', cans: '3', oneCoatCans: '2' });
  });

  // hand-verified, walls 9 ft with no opening taken out: 25 × 40: 2 × 65 × 9 = 1,170 ft², 2,340/350
  // = 6.69 gal, 7 cans; outside 1,170 × $2.20 = $2,574 to × $4.40 = $5,148; inside 1,000 × $1 to $4
  // = $1,000 to $4,000; the paint 7 × $30 to $50 = $210 to $350 and 7 × $45 to $85 = $315 to $595.
  // 50 × 50: 2 × 100 × 9 = 1,800 ft², 3,600/350 = 10.29 gal, 11 cans; $3,960 to $7,920; $2,500 to
  // $10,000; 11 × $30 to $50 = $330 to $550 and 11 × $45 to $85 = $495 to $935
  it('prices the outside of a house by its walls and the inside by its floor', () => {
    expect(houseCostOf(house(25, 40))).toEqual({
      label: '25 ft × 40 ft × 9 ft',
      floor: '1,000',
      walls: '1,170',
      gallons: '6.69',
      cans: '7',
      outside: '$2,574–$5,148',
      inside: '$1,000–$4,000',
      paint: ['$210–$350', '$315–$595'],
    });
    expect(houseCostOf(house(50, 50))).toMatchObject({
      floor: '2,500',
      walls: '1,800',
      gallons: '10.29',
      cans: '11',
      outside: '$3,960–$7,920',
      inside: '$2,500–$10,000',
      paint: ['$330–$550', '$495–$935'],
    });
    // 30 × 50 at 8 ft: 2 × 80 × 8 = 1,280 ft², 2,560/350 = 7.31 gal, 8 cans, $2,816 to $5,632
    expect(houseCostOf(house(30, 50, 8))).toMatchObject({
      walls: '1,280',
      cans: '8',
      outside: '$2,816–$5,632',
    });
  });

  // hand-verified: 3 cans × $35 = $105 and × $50 = $150
  it('prices whole cans at a range per gallon', () => {
    expect(gallonCost(3n, INTERIOR_GALLON_PRICES[1])).toBe('$105–$150');
    expect(gallonCost(2n, INTERIOR_GALLON_PRICES[2])).toBe('$100–$120');
  });
});

describe('paint cost copy', () => {
  it.each(LOCALES)('writes the prices into the copy as the data holds them in %s', (locale) => {
    const text = siteText(locale);
    const room = text('page.cost-to-paint-a-room.intro');
    for (const figure of ['$1', '$4', '$1.50', '$3.50', '$15', '$60', '$100', '$400'])
      expect(room).toContain(figure);
    const house = text('page.cost-to-paint-a-house.intro');
    for (const figure of ['$2.20', '$4.40', '$1', '$4', '$3,168', '$6,336', '1,440'])
      expect(house).toContain(figure);
    // the dates the guides give, in both pages' second paragraph
    expect(text('page.cost-to-paint-a-room.p2')).toContain('2026');
    expect(text('page.cost-to-paint-a-house.p2')).toContain('2026');
  });
});
