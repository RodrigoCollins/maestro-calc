import { primaAntiguedadOf, sdiOf } from '@maestro-calc/pay-core/mexico';
import { describe, expect, it } from 'vitest';
import { antiguedadTextOf, factorText, sdiTextOf, serviceText } from './labor-words.ts';

const date = (y: number, m: number, d: number) => ({ y, m, d });

describe('serviceText', () => {
  it('writes whole years and the days of the year begun', () => {
    expect(serviceText(15, 0)).toBe('15 años');
    expect(serviceText(1, 1)).toBe('1 año y 1 día');
    expect(serviceText(4, 181)).toBe('4 años y 181 días');
    expect(serviceText(0, 184)).toBe('184 días');
    expect(serviceText(0, 0)).toBe('0 días');
  });
});

describe('factorText', () => {
  it('writes a factor to four decimals', () => {
    expect(factorText(10493)).toBe('1.0493');
    expect(factorText(10500)).toBe('1.0500');
  });
});

describe('antiguedadTextOf', () => {
  it('writes a capped prima after a dismissal at 4 years and 181 days', () => {
    const result = primaAntiguedadOf({
      wageCents: 2000000,
      period: 'month',
      zone: 'general',
      start: date(2022, 1, 1),
      end: date(2026, 6, 30),
      reason: 'dismissal',
    });
    expect(antiguedadTextOf(result)).toEqual({
      figure: '$33,993.25',
      values: {
        service: '4 años y 181 días',
        base: '$630.08',
        earned: '53.95 días',
        whole: '$30,243.84',
      },
      belowMinimum: false,
      capped: true,
      eligible: true,
    });
  });

  it('owes nothing on a voluntary separation before 15 years', () => {
    const text = antiguedadTextOf(
      primaAntiguedadOf({
        wageCents: 31504,
        period: 'day',
        zone: 'general',
        start: date(2016, 3, 1),
        end: date(2026, 2, 28),
        reason: 'voluntary',
      }),
    );
    expect(text.figure).toBe('$0.00');
    expect(text.eligible).toBe(false);
    // the whole years are still shown, so you see what 15 years would be paid on
    expect(text.values.whole).toBe('$37,804.80');
  });
});

describe('sdiTextOf', () => {
  it('writes the first year at the minimum wage', () => {
    const result = sdiOf({
      wageCents: 31504,
      period: 'day',
      aguinaldoDays: 15,
      primaPercent: 25,
      start: date(2026, 3, 1),
      on: date(2026, 11, 15),
    });
    expect(sdiTextOf(result, false)).toEqual({
      figure: '$330.58',
      values: {
        daily: '$315.04',
        year: 'Año 1 · 12 días de vacaciones',
        factor: '1.0493',
        aguinaldo: '$12.95',
        prima: '$2.59',
        sbc: '$330.58',
      },
      belowMinimum: false,
      capped: false,
    });
    expect(sdiTextOf(result, true).belowMinimum).toBe(true);
  });
});
