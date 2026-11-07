import { Rational, scaleMoney, usd, type Money } from '@maestro-calc/core';

const HUNDRED = Rational.of(100);
const HALF = Rational.of(1, 2);

/** An amount to the nearest cent, half a cent up: the way a printed line is read. */
export const nearestCent = (amount: Rational): Rational =>
  Rational.of(amount.mul(HUNDRED).add(HALF).floor(), 100);

/** How the labor is priced: by the hour of each worker, or by the area of the job. */
export const LABOR_BASES = ['hour', 'area'] as const;
export type LaborBasis = (typeof LABOR_BASES)[number];

export interface LaborInput {
  readonly by: LaborBasis;
  readonly hours: Rational;
  /** Workers who each put in `hours`. */
  readonly crew: number;
  /** Dollars per hour of one worker. */
  readonly rate: Money;
  /** Square feet of the job. */
  readonly area: Rational;
  /** Dollars per square foot, the user's own. */
  readonly areaRate: Money;
}

/** Labor by the hour is hours x crew x rate; by area it is the area x the price per square foot. */
export const laborOf = ({ by, hours, crew, rate, area, areaRate }: LaborInput): Money =>
  by === 'hour' ? scaleMoney(rate, hours.mul(Rational.of(crew))) : scaleMoney(areaRate, area);

export interface QuoteInput {
  readonly labor: Money;
  readonly materials: Money;
  /** Percent points of the subtotal. */
  readonly overheadPercent: Rational;
  /** Percent points of the subtotal plus the overhead (a markup on cost). */
  readonly profitPercent: Rational;
}

export interface Quote {
  readonly labor: Money;
  readonly materials: Money;
  readonly subtotal: Money;
  readonly overhead: Money;
  readonly profit: Money;
  readonly total: Money;
}

const cents = (amount: Rational): Money => usd(nearestCent(amount));

/** The outputs every quote calculator ends with, from the itemized quote. */
export const quoteFigures = ({ total, labor, materials, subtotal, overhead, profit }: Quote) => ({
  total,
  labor,
  materials,
  subtotal,
  overhead,
  profit,
});

/**
 * The itemized quote: labor and materials, the subtotal, the overhead on the subtotal, the profit
 * on the subtotal plus the overhead, and the total. Each line is rounded to the cent and the total
 * is the sum of the rounded lines, so the lines of a printed quote always add up.
 */
export const quoteOf = ({
  labor,
  materials,
  overheadPercent,
  profitPercent,
}: QuoteInput): Quote => {
  const laborLine = cents(labor.amount);
  const materialsLine = cents(materials.amount);
  const subtotal = laborLine.amount.add(materialsLine.amount);
  const overhead = nearestCent(subtotal.mul(overheadPercent).div(HUNDRED));
  const profit = nearestCent(subtotal.add(overhead).mul(profitPercent).div(HUNDRED));
  return {
    labor: laborLine,
    materials: materialsLine,
    subtotal: usd(subtotal),
    overhead: usd(overhead),
    profit: usd(profit),
    total: usd(subtotal.add(overhead).add(profit)),
  };
};
