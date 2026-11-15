import { aguinaldoOf, vacacionesOf } from '@maestro-calc/pay-core/mexico';
import { describe, expect, it } from 'vitest';
import { aguinaldoTextOf, hundredthsDaysText, vacacionesTextOf } from './words.ts';

describe('hundredthsDaysText', () => {
  it('writes whole days plainly and a share of days to two places', () => {
    expect(hundredthsDaysText(1500)).toBe('15 días');
    expect(hundredthsDaysText(100)).toBe('1 día');
    expect(hundredthsDaysText(756)).toBe('7.56 días');
    expect(hundredthsDaysText(1270)).toBe('12.70 días');
  });
});

describe('aguinaldoTextOf', () => {
  it('writes the aguinaldo of half a year at the 2026 minimum wage', () => {
    const result = aguinaldoOf({
      wageCents: 31504,
      period: 'day',
      days: 15,
      start: { y: 2026, m: 7, d: 1 },
      end: { y: 2026, m: 12, d: 31 },
    });
    expect(aguinaldoTextOf(result)).toEqual({
      figure: '$2,382.22',
      values: {
        daily: '$315.04',
        worked: '184 días',
        earned: '7.56 días',
        exempt: '$2,382.22',
        taxable: '$0.00',
      },
      belowMinimum: false,
    });
  });
});

describe('vacacionesTextOf', () => {
  it('writes five years of service at the 2026 minimum wage', () => {
    const result = vacacionesOf({
      wageCents: 31504,
      period: 'day',
      primaPercent: 25,
      start: { y: 2021, m: 1, d: 15 },
      on: { y: 2026, m: 12, d: 31 },
    });
    expect(vacacionesTextOf(result)).toEqual({
      figure: '20 días',
      values: {
        years: '5 años',
        pay: '$6,300.80',
        prima: '$1,575.20',
        exempt: '$1,575.20',
        taxable: '$0.00',
        next: '22 días desde el viernes 15 de enero de 2027',
      },
      earned: true,
      belowMinimum: false,
    });
  });

  it('says one year in the singular', () => {
    const result = vacacionesOf({
      wageCents: 31504,
      period: 'day',
      primaPercent: 25,
      start: { y: 2025, m: 1, d: 15 },
      on: { y: 2026, m: 6, d: 1 },
    });
    expect(vacacionesTextOf(result).values.years).toBe('1 año');
  });
});
