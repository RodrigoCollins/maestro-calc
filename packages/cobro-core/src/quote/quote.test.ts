import { Rational, usd } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { laborOf, nearestCent, quoteOf } from './quote.ts';

const dollars = (amount: Rational | undefined): string => String(amount?.toString());

describe('nearestCent', () => {
  it('keeps a whole number of cents', () => {
    expect(nearestCent(Rational.of(1234, 100)).equals(Rational.of(1234, 100))).toBe(true);
  });

  it('rounds half a cent up and less than half down', () => {
    expect(nearestCent(Rational.of(1005, 1000)).equals(Rational.of(101, 100))).toBe(true);
    expect(nearestCent(Rational.of(1004, 1000)).equals(Rational.of(100, 100))).toBe(true);
  });
});

describe('laborOf', () => {
  // 8 h x 2 workers x $25 = $400
  it('by the hour is hours x crew x rate', () => {
    expect(
      laborOf({
        by: 'hour',
        hours: Rational.of(8),
        crew: 2,
        rate: usd(25),
        area: Rational.of(900),
        areaRate: usd(3),
      }),
    ).toEqual(usd(400));
  });

  // 900 sq ft x $1.50 = $1,350, whatever the hours say
  it('by area is the area x the price per sq ft', () => {
    expect(
      laborOf({
        by: 'area',
        hours: Rational.of(8),
        crew: 2,
        rate: usd(25),
        area: Rational.of(900),
        areaRate: usd(Rational.of(3, 2)),
      }),
    ).toEqual(usd(1350));
  });
});

// Labor $400 + materials $120 = $520; overhead 10% = $52; profit 15% of $572 = $85.80; total $657.80
describe('quoteOf', () => {
  const quote = quoteOf({
    labor: usd(400),
    materials: usd(120),
    overheadPercent: Rational.of(10),
    profitPercent: Rational.of(15),
  });

  it('adds labor and materials into the subtotal', () => {
    expect(dollars(quote.subtotal.amount)).toBe('520');
  });

  it('takes overhead on the subtotal and profit on the subtotal plus overhead', () => {
    expect(dollars(quote.overhead.amount)).toBe('52');
    expect(quote.profit.amount.equals(Rational.of(8580, 100))).toBe(true);
  });

  it('totals the lines', () => {
    expect(quote.total.amount.equals(Rational.of(65780, 100))).toBe(true);
  });

  it('with no overhead and no profit is the subtotal', () => {
    const plain = quoteOf({
      labor: usd(400),
      materials: usd(120),
      overheadPercent: Rational.ZERO,
      profitPercent: Rational.ZERO,
    });
    expect(plain.total).toEqual(usd(520));
  });

  // 7% of $10.05 = $0.7035, 7% of ($10.05 + $0.70) = $0.7525: each line to the cent, so the
  // receipt adds up: 10.05 + 0.70 + 0.75 = 11.50
  it('rounds each line to the cent so the printed lines add up to the total', () => {
    const odd = quoteOf({
      labor: usd(Rational.of(1005, 100)),
      materials: usd(0),
      overheadPercent: Rational.of(7),
      profitPercent: Rational.of(7),
    });
    expect(odd.overhead.amount.equals(Rational.of(70, 100))).toBe(true);
    expect(odd.profit.amount.equals(Rational.of(75, 100))).toBe(true);
    expect(odd.total.amount.equals(Rational.of(1150, 100))).toBe(true);
  });
});
