import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { dollarsOf, exactOf } from '../__testing__/figures.ts';
import { cleaningQuote } from './cleaning.ts';

const figure = (raw: Readonly<Record<string, unknown>>, key: string): Rational =>
  exactOf(cleaningQuote, raw, key);

const cents = (raw: Readonly<Record<string, unknown>>, key: string): string =>
  dollarsOf(cleaningQuote, raw, key);

describe('cleaning quote', () => {
  it('reads the defaults: 8 h, one cleaner at $25, $20 of supplies, 10% overhead, 15% profit', () => {
    const state = cleaningQuote.validate({});
    expect(state.ok && state.value.laborBy).toBe('hour');
    expect(state.ok && state.value.crew).toBe(1);
  });

  // labor 8 x 1 x 25 = 200; supplies 20; subtotal 220; overhead 22; profit 15% of 242 = 36.30
  it('itemizes the default job to $278.30', () => {
    expect(cents({}, 'labor')).toBe('200.00');
    expect(cents({}, 'materials')).toBe('20.00');
    expect(cents({}, 'subtotal')).toBe('220.00');
    expect(cents({}, 'overhead')).toBe('22.00');
    expect(cents({}, 'profit')).toBe('36.30');
    expect(cents({}, 'total')).toBe('278.30');
  });

  // 3.5 h x 2 cleaners x $18 = 126; supplies 14.50; 140.50 with no overhead and no profit
  it('multiplies the hours by the crew', () => {
    const job = {
      hours: '3.5',
      crew: '2',
      rate: '18',
      supplies: '14.50',
      overhead: '0',
      profit: '0',
    };
    expect(cents(job, 'labor')).toBe('126.00');
    expect(cents(job, 'total')).toBe('140.50');
  });

  // 2,000 sq ft x $0.12 = 240, whatever the hours say
  it('prices by area at the price per square foot of the user', () => {
    const job = {
      laborBy: 'area',
      area: '2000',
      areaRate: '0.12',
      supplies: '0',
      overhead: '0',
      profit: '0',
    };
    expect(cents(job, 'labor')).toBe('240.00');
    expect(cents(job, 'total')).toBe('240.00');
    expect(figure(job, 'area')).toEqual(Rational.of(2000));
  });

  it('has no purchase units of its own', () => {
    expect(figure({}, 'units')).toEqual(Rational.ZERO);
  });

  it('rejects a negative rate and a crew of none', () => {
    expect(cleaningQuote.run({ rate: '-1' }).ok).toBe(false);
    expect(cleaningQuote.run({ crew: '0' }).ok).toBe(false);
  });
});
